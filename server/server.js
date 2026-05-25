/**
 * Сервер API: авторизация, уроки, тесты, прогресс, админ-API
 * Запуск: node server.js (из папки server) или node server/server.js (из корня)
 */
const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const {
  SESSION_COOKIE,
  SESSION_DAYS,
  hashPassword,
  comparePassword,
  createSession,
  destroySession,
  authMiddleware,
  requireAuth,
  requireAdmin
} = require('./store');
const store = require('./store');

const app = express();
const PORT = process.env.PORT || 3000;

const staticRoot = path.join(__dirname, '..');
app.use(express.static(staticRoot));
app.use(express.json());
app.use(cookieParser());
// Сначала ждём инициализации БД, потом все маршруты
const dbReady = store.init();
app.use(function ensureDb(req, res, next) {
  if (store.db) return next();
  dbReady.then(() => next()).catch(err => { console.error(err); res.status(503).json({ error: 'База данных не готова' }); });
});
app.use(authMiddleware);

// ————— Auth —————
app.post('/api/auth/register', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password || login.length < 2) {
    return res.status(400).json({ error: 'Логин и пароль обязательны (логин не короче 2 символов)' });
  }
  try {
    const existing = store.db.prepare('SELECT id FROM users WHERE login = ?').get(login);
    if (existing) return res.status(400).json({ error: 'Такой логин уже занят' });
    store.db.prepare('INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)').run(login, hashPassword(password), 'user');
    const row = store.db.prepare('SELECT id, login, role FROM users WHERE login = ?').get(login);
    const { id } = createSession(row.id);
    res.cookie(SESSION_COOKIE, id, { httpOnly: true, maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000, path: '/', sameSite: 'lax' });
    return res.json({ user: { id: row.id, login: row.login, role: row.role } });
  } catch (e) {
    return res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { login, password } = req.body || {};
  if (!login || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });
  const user = store.db.prepare('SELECT id, login, password_hash, role FROM users WHERE login = ?').get(login);
  if (!user || !comparePassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Неверный логин или пароль' });
  }
  const { id } = createSession(user.id);
  res.cookie(SESSION_COOKIE, id, { httpOnly: true, maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000, path: '/', sameSite: 'lax' });
  return res.json({ user: { id: user.id, login: user.login, role: user.role } });
});

app.post('/api/auth/logout', (req, res) => {
  const sid = req.cookies && req.cookies[SESSION_COOKIE];
  destroySession(sid);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  return res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  if (!req.user) return res.json({ user: null });
  return res.json({ user: { id: req.user.userId, login: req.user.login, role: req.user.role } });
});

// ————— Уроки —————
app.get('/api/lessons', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  const rows = store.db.prepare('SELECT id, title, description, branch, test_id, template, html, css, js, check_json, sort_order FROM lessons ORDER BY sort_order, id').all();
  const lessons = rows.map(r => ({
    id: r.id,
    title: r.title,
    description: r.description,
    branch: r.branch,
    testId: r.test_id,
    template: !!r.template,
    html: r.html,
    css: r.css,
    js: r.js,
    check: r.check_json ? JSON.parse(r.check_json) : undefined,
    steps: []
  }));
  const steps = store.db.prepare('SELECT lesson_id, title, task, html, css, js, check_json, step_order FROM lesson_steps ORDER BY lesson_id, step_order').all();
  steps.forEach(s => {
    const lesson = lessons.find(l => l.id === s.lesson_id);
    if (lesson) lesson.steps.push({
      title: s.title,
      task: s.task,
      html: s.html,
      css: s.css,
      js: s.js,
      check: s.check_json ? JSON.parse(s.check_json) : undefined
    });
  });
  return res.json(lessons);
});

app.get('/api/lessons/:id', (req, res) => {
  const r = store.db.prepare('SELECT id, title, description, branch, test_id, template, html, css, js, check_json FROM lessons WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Урок не найден' });
  const steps = store.db.prepare('SELECT title, task, html, css, js, check_json FROM lesson_steps WHERE lesson_id = ? ORDER BY step_order').all(req.params.id);
  return res.json({
    id: r.id,
    title: r.title,
    description: r.description,
    branch: r.branch,
    testId: r.test_id,
    template: !!r.template,
    html: r.html,
    css: r.css,
    js: r.js,
    check: r.check_json ? JSON.parse(r.check_json) : undefined,
    steps: steps.map(s => ({ ...s, check: s.check_json ? JSON.parse(s.check_json) : undefined, check_json: undefined }))
  });
});

// ————— Тесты —————
app.get('/api/tests', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  const rows = store.db.prepare('SELECT id, title, branch FROM tests ORDER BY id').all();
  const tests = rows.map(r => ({ id: r.id, title: r.title, branch: r.branch, questions: [] }));
  const qRows = store.db.prepare('SELECT test_id, question, options_json, correct_index, question_order FROM test_questions ORDER BY test_id, question_order').all();
  qRows.forEach(q => {
    const t = tests.find(x => x.id === q.test_id);
    if (t) t.questions.push({ question: q.question, options: JSON.parse(q.options_json), correct: q.correct_index });
  });
  return res.json(tests);
});

app.get('/api/tests/:id', (req, res) => {
  const t = store.db.prepare('SELECT id, title, branch FROM tests WHERE id = ?').get(req.params.id);
  if (!t) return res.status(404).json({ error: 'Тест не найден' });
  const qRows = store.db.prepare('SELECT question, options_json, correct_index FROM test_questions WHERE test_id = ? ORDER BY question_order').all(req.params.id);
  return res.json({
    id: t.id,
    title: t.title,
    branch: t.branch,
    questions: qRows.map(q => ({ question: q.question, options: JSON.parse(q.options_json), correct: q.correct_index }))
  });
});

// ————— Темы теории —————
app.get('/api/theory', (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  const rows = store.db.prepare('SELECT id, category, title, short_desc, content, test_id, lesson_id, sort_order FROM theory_topics ORDER BY sort_order, id').all();
  const topics = rows.map(r => ({
    id: r.id,
    category: r.category,
    title: r.title,
    shortDesc: r.short_desc,
    content: r.content || '',
    testId: r.test_id,
    lessonId: r.lesson_id
  }));
  return res.json(topics);
});

app.get('/api/theory/:id', (req, res) => {
  const r = store.db.prepare('SELECT id, category, title, short_desc, content, test_id, lesson_id FROM theory_topics WHERE id = ?').get(req.params.id);
  if (!r) return res.status(404).json({ error: 'Тема теории не найдена' });
  return res.json({
    id: r.id,
    category: r.category,
    title: r.title,
    shortDesc: r.short_desc,
    content: r.content || '',
    testId: r.test_id,
    lessonId: r.lesson_id
  });
});

// ————— Прогресс —————
app.get('/api/progress/stats', requireAuth, (req, res) => {
  const userId = req.user.userId;
  const results = store.db.prepare('SELECT score, passed, max_score FROM user_test_results WHERE user_id = ?').all(userId);
  const lessonsCount = store.db.prepare('SELECT COUNT(*) as c FROM user_completed_lessons WHERE user_id = ?').get(userId).c;
  const passedTests = results.filter(r => r.passed).length;
  const totalScore = results.reduce((s, r) => s + r.score, 0);
  return res.json({ passedTests, totalScore, completedLessonsCount: lessonsCount });
});

app.post('/api/progress/lesson', requireAuth, (req, res) => {
  const { lessonId } = req.body || {};
  if (!lessonId) return res.status(400).json({ error: 'lessonId обязателен' });
  store.db.prepare('INSERT OR REPLACE INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, datetime(\'now\'))').run(req.user.userId, lessonId);
  return res.json({ ok: true });
});

app.post('/api/progress/test', requireAuth, (req, res) => {
  const { testId, score, passed, maxScore } = req.body || {};
  if (!testId || score === undefined) return res.status(400).json({ error: 'testId и score обязательны' });
  const max = maxScore != null ? maxScore : score;
  store.db.prepare('INSERT INTO user_test_results (user_id, test_id, score, passed, max_score) VALUES (?, ?, ?, ?, ?)').run(req.user.userId, testId, score, passed ? 1 : 0, max);
  return res.json({ ok: true });
});

app.get('/api/progress/lessons', requireAuth, (req, res) => {
  const rows = store.db.prepare('SELECT lesson_id as lessonId, completed_at as date FROM user_completed_lessons WHERE user_id = ?').all(req.user.userId);
  return res.json(rows);
});

app.get('/api/progress/tests', requireAuth, (req, res) => {
  const rows = store.db.prepare('SELECT test_id as testId, score, passed, max_score as maxScore, completed_at as date FROM user_test_results WHERE user_id = ?').all(req.user.userId);
  return res.json(rows);
});

// ————— Админ: уроки и тесты —————
function plainTextToHtml(text) {
  if (text == null || text === '') return null;
  const s = String(text).trim();
  if (!s) return null;
  return s.split(/\n+/).map(line => '<p>' + line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') + '</p>').join('');
}

const CYR_TO_LAT = { 'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'e','ж':'zh','з':'z','и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya' };
function slugify(str) {
  if (str == null || str === '') return '';
  let s = String(str).toLowerCase().trim();
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (/[a-z0-9]/.test(c)) out += c;
    else if (CYR_TO_LAT[c]) out += CYR_TO_LAT[c];
    else if (/\s/.test(c)) out += (out && out[out.length-1] !== '-' ? '-' : '');
    else if (c === '-') out += (out && out[out.length-1] !== '-' ? '-' : '');
  }
  return out.replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function generateLessonId(title) {
  let base = slugify(title) || 'lesson';
  if (!base) base = 'lesson';
  let id = base;
  let n = 1;
  while (store.db.prepare('SELECT 1 FROM lessons WHERE id = ?').get(id)) {
    id = base + '-' + (++n);
  }
  return id;
}

function generateTestId(title) {
  let base = slugify(title) || 'test';
  if (!base) base = 'test';
  let id = base;
  let n = 1;
  while (store.db.prepare('SELECT 1 FROM tests WHERE id = ?').get(id)) {
    id = base + '-' + (++n);
  }
  return id;
}

function generateTheoryTopicId(title) {
  let base = slugify(title) || 'topic';
  if (!base) base = 'topic';
  let id = base;
  let n = 1;
  while (store.db.prepare('SELECT 1 FROM theory_topics WHERE id = ?').get(id)) {
    id = base + '-' + (++n);
  }
  return id;
}

app.post('/api/admin/lessons', requireAdmin, (req, res) => {
  const body = req.body || {};
  console.log('[POST /api/admin/lessons] body keys:', Object.keys(body || {}), 'title:', body.title);
  const bodyId = body.id;
  const title = body.title != null ? String(body.title).trim() : '';
  const description = body.description;
  const branch = (body.branch && String(body.branch).trim()) || 'html';
  const testId = (body.testId && String(body.testId).trim()) || null;
  const template = body.template;
  const html = body.html;
  const css = body.css;
  const js = body.js;
  const check = body.check;
  const steps = body.steps;
  if (!title) return res.status(400).json({ error: 'Укажите название урока' });
  const id = (bodyId && String(bodyId).trim()) || generateLessonId(title);
  const checkJson = check ? JSON.stringify(check) : null;
  const descHtml = (description != null && String(description).trim() !== '') ? plainTextToHtml(description) : null;
  const finalHtml = (html != null && String(html).trim() !== '') ? html : null;
  const finalCss = (css != null && String(css).trim() !== '') ? css : null;
  const finalJs = (js != null && String(js).trim() !== '') ? js : null;
  const descVal = descHtml || description || null;
  console.log('[POST /api/admin/lessons] id:', id, 'descVal type:', typeof descVal);
  try {
    store.db.prepare(`
      INSERT INTO lessons (id, title, description, branch, test_id, template, html, css, js, check_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, title, descVal, branch, testId || null, template ? 1 : 0, finalHtml || null, finalCss || null, finalJs || null, checkJson);
    if (Array.isArray(steps) && steps.length) {
      const ins = store.db.prepare('INSERT INTO lesson_steps (lesson_id, title, task, html, css, js, check_json, step_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
      steps.forEach((s, i) => ins.run(id, s.title || '', s.task || null, s.html || null, s.css || null, s.js || null, s.check ? JSON.stringify(s.check) : null, i));
    }
    console.log('Урок создан:', id);
    return res.json({ ok: true, id });
  } catch (e) {
    console.error('POST /api/admin/lessons error:', e && e.message, e && e.code, e);
    if (e && e.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Урок с таким id уже существует' });
    return res.status(500).json({ error: 'Ошибка сохранения урока', detail: e && (e.message || String(e)) });
  }
});

app.put('/api/admin/lessons/:id', requireAdmin, (req, res) => {
  const { title, description, branch, testId, template, html, css, js, check, steps } = req.body || {};
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id, title, description, branch, test_id, template, html, css, js, check_json FROM lessons WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Урок не найден' });
  const checkJson = check !== undefined ? JSON.stringify(check) : (existing.check_json != null ? existing.check_json : null);
  store.db.prepare(`
    UPDATE lessons SET title = ?, description = ?, branch = ?, test_id = ?, template = ?, html = ?, css = ?, js = ?, check_json = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title !== undefined ? title : existing.title,
    description !== undefined ? description : existing.description,
    branch !== undefined ? branch : existing.branch,
    testId !== undefined ? testId : existing.test_id,
    template !== undefined ? (template ? 1 : 0) : existing.template,
    html !== undefined ? html : existing.html,
    css !== undefined ? css : existing.css,
    js !== undefined ? js : existing.js,
    checkJson,
    id
  );
  if (Array.isArray(steps)) {
    store.db.prepare('DELETE FROM lesson_steps WHERE lesson_id = ?').run(id);
    const ins = store.db.prepare('INSERT INTO lesson_steps (lesson_id, title, task, html, css, js, check_json, step_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    steps.forEach((s, i) => ins.run(id, s.title || '', s.task || null, s.html || null, s.css || null, s.js || null, s.check ? JSON.stringify(s.check) : null, i));
  }
  return res.json({ ok: true });
});

app.post('/api/admin/tests', requireAdmin, (req, res) => {
  const body = req.body || {};
  const bodyId = body.id;
  const title = body.title != null ? String(body.title).trim() : '';
  const branch = (body.branch && String(body.branch).trim()) || 'html';
  const questions = body.questions;
  if (!title) return res.status(400).json({ error: 'Укажите название теста' });
  const id = (bodyId && String(bodyId).trim()) || generateTestId(title);
  try {
    store.db.prepare('INSERT INTO tests (id, title, branch) VALUES (?, ?, ?)').run(id, title, branch);
    if (Array.isArray(questions) && questions.length) {
      const ins = store.db.prepare('INSERT INTO test_questions (test_id, question, options_json, correct_index, question_order) VALUES (?, ?, ?, ?, ?)');
      questions.forEach((q, i) => ins.run(id, q.question, JSON.stringify(q.options || []), q.correct ?? 0, i));
    }
    return res.json({ ok: true, id });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Тест с таким id уже существует' });
    return res.status(500).json({ error: 'Ошибка сохранения теста' });
  }
});

app.put('/api/admin/tests/:id', requireAdmin, (req, res) => {
  const { title, branch, questions } = req.body || {};
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id FROM tests WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Тест не найден' });
  if (title != null) store.db.prepare('UPDATE tests SET title = ?, updated_at = datetime(\'now\') WHERE id = ?').run(title, id);
  if (branch != null) store.db.prepare('UPDATE tests SET branch = ?, updated_at = datetime(\'now\') WHERE id = ?').run(branch, id);
  if (Array.isArray(questions)) {
    store.db.prepare('DELETE FROM test_questions WHERE test_id = ?').run(id);
    const ins = store.db.prepare('INSERT INTO test_questions (test_id, question, options_json, correct_index, question_order) VALUES (?, ?, ?, ?, ?)');
    questions.forEach((q, i) => ins.run(id, q.question, JSON.stringify(q.options || []), q.correct ?? 0, i));
  }
  return res.json({ ok: true });
});

app.delete('/api/admin/lessons/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id FROM lessons WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Урок не найден' });
  store.db.prepare('DELETE FROM lesson_steps WHERE lesson_id = ?').run(id);
  store.db.prepare('DELETE FROM lessons WHERE id = ?').run(id);
  store.db.prepare('DELETE FROM user_completed_lessons WHERE lesson_id = ?').run(id);
  return res.json({ ok: true });
});

app.delete('/api/admin/tests/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id FROM tests WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Тест не найден' });
  store.db.prepare('DELETE FROM test_questions WHERE test_id = ?').run(id);
  store.db.prepare('DELETE FROM tests WHERE id = ?').run(id);
  store.db.prepare('DELETE FROM user_test_results WHERE test_id = ?').run(id);
  return res.json({ ok: true });
});

// ————— Админ: темы теории —————
app.post('/api/admin/theory', requireAdmin, (req, res) => {
  const body = req.body || {};
  const title = body.title != null ? String(body.title).trim() : '';
  const shortDesc = (body.shortDesc != null ? String(body.shortDesc).trim() : '') || null;
  const category = (body.category === 'html' || body.category === 'css' || body.category === 'js') ? body.category : 'html';
  const content = (body.content != null ? String(body.content).trim() : '') || null;
  const testId = (body.testId && String(body.testId).trim()) || null;
  const lessonId = (body.lessonId && String(body.lessonId).trim()) || null;
  if (!title) return res.status(400).json({ error: 'Укажите название темы теории' });
  const id = (body.id && String(body.id).trim()) || generateTheoryTopicId(title);
  try {
    store.db.prepare(`
      INSERT INTO theory_topics (id, category, title, short_desc, content, test_id, lesson_id, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(id, category, title, shortDesc, content, testId, lessonId);
    return res.json({ ok: true, id });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT') return res.status(400).json({ error: 'Тема с таким id уже существует' });
    return res.status(500).json({ error: 'Ошибка сохранения темы теории', detail: e && (e.message || String(e)) });
  }
});

app.put('/api/admin/theory/:id', requireAdmin, (req, res) => {
  const { title, shortDesc, category, content, testId, lessonId } = req.body || {};
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id, title, short_desc, category, content, test_id, lesson_id FROM theory_topics WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Тема теории не найдена' });
  store.db.prepare(`
    UPDATE theory_topics SET title = ?, short_desc = ?, category = ?, content = ?, test_id = ?, lesson_id = ?, updated_at = datetime('now')
    WHERE id = ?
  `).run(
    title !== undefined ? title : existing.title,
    shortDesc !== undefined ? shortDesc : existing.short_desc,
    (category === 'html' || category === 'css' || category === 'js') ? category : existing.category,
    content !== undefined ? content : existing.content,
    testId !== undefined ? testId : existing.test_id,
    lessonId !== undefined ? lessonId : existing.lesson_id,
    id
  );
  return res.json({ ok: true });
});

app.delete('/api/admin/theory/:id', requireAdmin, (req, res) => {
  const id = req.params.id;
  const existing = store.db.prepare('SELECT id FROM theory_topics WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Тема теории не найдена' });
  store.db.prepare('DELETE FROM theory_topics WHERE id = ?').run(id);
  return res.json({ ok: true });
});

dbReady.then(() => {
  app.listen(PORT, () => console.log('Сервер: http://localhost:' + PORT));
}).catch(err => { console.error(err); process.exit(1); });
