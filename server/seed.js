/**
 * Заполнение БД уроками и тестами из js/lessons-data.js и js/tests-data.js (через sql.js, без C++).
 * Запуск из корня проекта: node server/seed.js
 */
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb } = require('./sqlite-wrapper');

let LESSONS_DATA, TESTS_DATA, THEORY_DATA;
try {
  LESSONS_DATA = require(path.join(__dirname, '..', 'js', 'lessons-data.js'));
  TESTS_DATA = require(path.join(__dirname, '..', 'js', 'tests-data.js'));
  THEORY_DATA = require(path.join(__dirname, '..', 'js', 'theory-data.js'));
} catch (e) {
  console.error('Не удалось загрузить данные. Запускайте из корня: node server/seed.js', e.message);
  process.exit(1);
}

async function main() {
  const db = await getDb();

  // Очистка (осторожно: удаляет все уроки, тесты и темы теории)
  db.prepare('DELETE FROM lesson_steps').run();
  db.prepare('DELETE FROM lessons').run();
  db.prepare('DELETE FROM test_questions').run();
  db.prepare('DELETE FROM tests').run();
  db.prepare('DELETE FROM theory_topics').run();

  const insLessonSql = `
  INSERT OR REPLACE INTO lessons (id, title, description, branch, test_id, template, html, css, js, check_json, sort_order)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
  const insStepSql = `
  INSERT INTO lesson_steps (lesson_id, title, task, html, css, js, check_json, step_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`;

  LESSONS_DATA.forEach((l, idx) => {
    db.prepare(insLessonSql).run(
      l.id,
      l.title,
      l.description || null,
      l.branch,
      l.testId || null,
      l.template ? 1 : 0,
      l.html || null,
      l.css || null,
      l.js || null,
      l.check ? JSON.stringify(l.check) : null,
      idx
    );
    if (l.steps && l.steps.length) {
      l.steps.forEach((s, i) => {
        db.prepare(insStepSql).run(l.id, s.title || '', s.task || null, s.html || null, s.css || null, s.js || null, s.check ? JSON.stringify(s.check) : null, i);
      });
    }
  });

  const insTestSql = 'INSERT OR REPLACE INTO tests (id, title, branch) VALUES (?, ?, ?)';
  const insQuestionSql = `
  INSERT INTO test_questions (test_id, question, options_json, correct_index, question_order) VALUES (?, ?, ?, ?, ?)
`;

  TESTS_DATA.forEach(t => {
    db.prepare(insTestSql).run(t.id, t.title, t.branch);
    if (t.questions && t.questions.length) {
      db.prepare('DELETE FROM test_questions WHERE test_id = ?').run(t.id);
      t.questions.forEach((q, i) => {
        db.prepare(insQuestionSql).run(t.id, q.question, JSON.stringify(q.options || []), q.correct ?? 0, i);
      });
    }
  });

  // Темы теории (из theory-data.js)
  const theoryTopics = Array.isArray(THEORY_DATA) ? THEORY_DATA : [];
  const insTheorySql = `
    INSERT INTO theory_topics (id, category, title, short_desc, content, test_id, lesson_id, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  theoryTopics.forEach((t, idx) => {
    db.prepare(insTheorySql).run(
      t.id,
      t.category || 'html',
      t.title,
      t.shortDesc || null,
      t.content || null,
      t.testId || null,
      t.lessonId || null,
      idx
    );
  });

  // Первый админ
  const hasAdmin = db.prepare('SELECT id FROM users WHERE role = ?').get('admin');
  if (!hasAdmin) {
    db.prepare('INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)').run('admin', bcrypt.hashSync('admin', 10), 'admin');
    console.log('Создан пользователь admin / admin (смените пароль!)');
  }

  console.log('Сидирование завершено: уроков ' + LESSONS_DATA.length + ', тестов ' + TESTS_DATA.length + ', тем теории ' + theoryTopics.length);
}

main().catch(e => { console.error(e); process.exit(1); });
