/**
 * Интерактивные уроки: сетка уроков при открытии, по клику — редактор с подсветкой (Monokai), вывод результата в iframe
 * Данные: сначала с API (если есть), иначе статика (LESSONS_DATA) или локальная БД.
 */

const lessonsGridView = document.getElementById('lessons-grid-view');
const lessonsWorkspaceView = document.getElementById('lessons-workspace-view');
const lessonsCardsGrid = document.getElementById('lessons-cards-grid');
const backToLessonsBtn = document.getElementById('back-to-lessons');
const lessonsNav = document.getElementById('lessons-nav');
const lessonContent = document.getElementById('lesson-content');
const codeOutput = document.getElementById('code-output');
const runBtn = document.getElementById('run-code');
const checkBtn = document.getElementById('check-result');
const completeBtn = document.getElementById('complete-lesson');
const checkResultEl = document.getElementById('lesson-check-result');
const nextLessonBtn = document.getElementById('lesson-next-btn');

let codeEditor = null;
let currentLessonId = null;
let currentStepIndex = 0;
/** Уже отмечен на сервере / в прогрессе — не даём снова «пройти» без смысла */
let currentLessonAlreadyCompleted = false;
const stepsBar = document.getElementById('lesson-steps-bar');
const stepsLabel = document.getElementById('lesson-steps-label');
const stepPrev = document.getElementById('lesson-step-prev');
const stepNext = document.getElementById('lesson-step-next');

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/** Нормализует урок из API к формату с steps[].check, branch, testId и т.д. */
function normalizeLesson(l) {
  if (!l) return l;
  const steps = (l.steps || []).map(s => ({
    title: s.title,
    task: s.task,
    html: s.html,
    css: s.css,
    js: s.js,
    check: s.check
  }));
  return {
    id: l.id != null ? String(l.id) : l.id,
    title: l.title,
    description: l.description,
    branch: l.branch || 'html',
    testId: l.testId,
    template: !!l.template,
    steps: steps,
    html: l.html,
    css: l.css,
    js: l.js,
    check: l.check
  };
}

function getLessonsData() {
  return window.LESSONS_DATA || [];
}

function setLessonsData(data) {
  window.LESSONS_DATA = Array.isArray(data) ? data.map(normalizeLesson) : [];
}

/** Базовые стили «учебного сайта» внутри превью (шапка + отступы main). */
const LESSON_SHELL_BASE_CSS =
  '.lesson-site-header { background: #1a1a24; color: #aaa; padding: 0.5rem 1rem; }\n' +
  '.lesson-site-main { padding: 1.5rem; }';

/** Убирает из фрагмента main случайно вставленный второй «шаблон» (header + main), чтобы не было вложенных main. */
function normalizeMainFragment(raw) {
  var s = raw != null ? String(raw).trim() : '';
  if (!s) return '';
  var re = /<header\s+class="lesson-site-header"[^>]*>[\s\S]*?<\/header>\s*<main\s+class="lesson-site-main"[^>]*>([\s\S]*)<\/main>/i;
  for (var guard = 0; guard < 6; guard++) {
    var m = s.match(re);
    if (!m) break;
    s = m[1].trim();
  }
  return s;
}

/** Убирает дубликаты базовых стилей из доп. CSS (если пользователь/БД продублировали блок). */
function dedupeExtraCss(extraCss) {
  var e = (extraCss || '').trim();
  if (!e) return '';
  var base = LESSON_SHELL_BASE_CSS.trim();
  var prev = '';
  while (e !== prev) {
    prev = e;
    e = e.split(base).join('').replace(/^\s+|\s+$/g, '').replace(/\n{3,}/g, '\n\n');
  }
  return e.trim();
}

function indentLines(text, prefix) {
  var p = prefix || '  ';
  return text
    .split('\n')
    .map(function (line) {
      return p + line;
    })
    .join('\n');
}

/**
 * Собирает полный HTML для редактора: шаблон с пустым main и пустым script,
 * плюс дополнительный CSS в том же <style> и разметка/скрипт из полей урока.
 * Поля html / css / js — это только фрагменты (содержимое main, доп. CSS, тело script).
 */
function buildLessonShellDocument(mainInnerHtml, extraCss, jsCode) {
  var inner = normalizeMainFragment(mainInnerHtml);
  var extra = dedupeExtraCss(extraCss);
  var cssBlock = LESSON_SHELL_BASE_CSS + (extra ? '\n' + extra : '');
  var safeCss = cssBlock.replace(/<\/style/gi, '<\\/style');
  var safeJs = (jsCode || '').replace(/<\/script/gi, '<\\/script');
  var mainBody = '';
  if (inner) {
    mainBody = '\n' + indentLines(inner, '  ') + '\n';
  } else {
    mainBody = '\n';
  }
  var styleIndented = indentLines(cssBlock, '    ');
  var scriptBody = safeJs ? '\n' + indentLines(safeJs, '  ') + '\n' : '\n';
  return (
    '<!DOCTYPE html>\n' +
    '<html lang="ru">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <title>Результат</title>\n' +
    '  <style>\n' +
    styleIndented +
    '\n  </style>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <header class="lesson-site-header">Учебный проект</header>\n' +
    '  <main class="lesson-site-main">' +
    mainBody +
    '  </main>\n' +
    '  <script>' +
    scriptBody +
    '  </script>\n' +
    '</body>\n' +
    '</html>'
  );
}

/**
 * Чинит полный HTML, если пользователь вставил шаблон дважды (двойной CSS, main внутри main).
 */
function healPastedFullLessonHtml(html) {
  var s = html;
  var d = LESSON_SHELL_BASE_CSS.trim();
  var i;
  s = s.replace(/<style([^>]*)>([\s\S]*?)<\/style>/i, function (_all, attr, inner) {
    var t = inner;
    for (i = 0; i < 10; i++) {
      if (t.indexOf(d + '\n' + d) !== -1) t = t.split(d + '\n' + d).join(d);
      else if (t.indexOf(d + '\r\n' + d) !== -1) t = t.split(d + '\r\n' + d).join(d);
      else break;
    }
    return '<style' + attr + '>' + t + '</style>';
  });
  for (i = 0; i < 6; i++) {
    var next = s.replace(
      /<main\s+class="lesson-site-main"[^>]*>\s*<header\s+class="lesson-site-header"[^>]*>[\s\S]*?<\/header>\s*<main\s+class="lesson-site-main"[^>]*>([\s\S]*?)<\/main>\s*<\/main>/gi,
      '<main class="lesson-site-main">$1</main>'
    );
    if (next === s) break;
    s = next;
  }
  return s;
}

/** Если в БД лежит целый документ (старый формат) — отдаём как есть, иначе собираем оболочку. */
function buildLessonEditorSource(html, css, js) {
  var h = html != null ? String(html) : '';
  if (/^\s*<!DOCTYPE/i.test(h)) {
    return healPastedFullLessonHtml(h);
  }
  return buildLessonShellDocument(h, css || '', js || '');
}

function showGridView() {
  if (lessonsGridView) lessonsGridView.style.display = '';
  if (lessonsWorkspaceView) lessonsWorkspaceView.style.display = 'none';
  if (nextLessonBtn) nextLessonBtn.style.display = 'none';
}

function getTheoryReturnPath() {
  try {
    var raw = new URLSearchParams(window.location.search).get('return');
    if (!raw) return '';
    var s = decodeURIComponent(String(raw).trim());
    if (s.indexOf('..') !== -1 || /^\s*javascript:/i.test(s)) return '';
    if (s.indexOf(':') !== -1) return '';
    if (!/^[a-z0-9._/?#=&@%+-]+$/i.test(s)) return '';
    return s;
  } catch (e) {
    return '';
  }
}

function updateLessonReturnLink() {
  var a = document.getElementById('lesson-return-link');
  if (!a) return;
  var path = getTheoryReturnPath();
  if (path) {
    a.href = path;
    a.style.display = 'inline-flex';
  } else {
    a.style.display = 'none';
  }
}

function getTheoryTopicByLessonId(lessonId) {
  const topics = (typeof THEORY_TOPICS !== 'undefined' && Array.isArray(THEORY_TOPICS))
    ? THEORY_TOPICS
    : (Array.isArray(window.THEORY_TOPICS) ? window.THEORY_TOPICS : []);
  const id = String(lessonId);
  return topics.find(function (topic) {
    return String(topic.lessonId) === id;
  }) || null;
}

function buildLessonRelatedLinksHtml(lesson) {
  if (!lesson) return '';
  var topic = getTheoryTopicByLessonId(lesson.id);
  var links = [];

  if (topic && topic.id) {
    links.push(
      '<a href="theory-topic.html?id=' + encodeURIComponent(topic.id) + '" class="btn btn-secondary btn-sm">К теории</a>'
    );
  }
  if (lesson.testId) {
    links.push(
      '<a href="test.html?id=' + encodeURIComponent(lesson.testId) + '" class="btn btn-primary btn-sm">К тесту</a>'
    );
  }
  if (!links.length) return '';
  return '<div class="lesson-inline-links">' + links.join('') + '</div>';
}

function showWorkspaceView() {
  if (lessonsGridView) lessonsGridView.style.display = 'none';
  if (lessonsWorkspaceView) lessonsWorkspaceView.style.display = 'block';
  updateLessonReturnLink();
  if (codeEditor) setTimeout(function () { codeEditor.refresh(); }, 50);
}

function renderLessonsCards() {
  if (!lessonsCardsGrid) return;
  const data = getLessonsData();
  if (data.length === 0) {
    lessonsCardsGrid.innerHTML = '<p class="lessons-empty">Уроков пока нет. Добавьте уроки в админ-панели.</p>';
    return;
  }
  getCompletedLessons().then(completed => {
    const completedIds = new Set((completed || []).map(c => String(c.lessonId != null ? c.lessonId : c.lesson_id)));
    lessonsCardsGrid.innerHTML = data.map(lesson => `
      <div class="lesson-tile" data-lesson-id="${escapeHtml(lesson.id)}">
        <span class="lesson-tile-num">${escapeHtml(lesson.id)}</span>
        <h3 class="lesson-tile-title">${escapeHtml(lesson.title)}</h3>
        <p class="lesson-tile-desc">${lesson.steps && lesson.steps.length ? lesson.steps.length + ' шагов' : 'Практика'} · ${lesson.branch === 'html' ? 'HTML и вёрстка' : 'Frontend (JS)'}</p>
        ${completedIds.has(String(lesson.id)) ? '<span class="lesson-tile-done">✓ Пройден</span>' : '<span class="lesson-tile-action">Пройти урок</span>'}
      </div>
    `).join('');
    lessonsCardsGrid.querySelectorAll('.lesson-tile').forEach(tile => {
      tile.addEventListener('click', function () {
        openLesson(this.dataset.lessonId);
      });
    });
  }).catch(() => {
    lessonsCardsGrid.innerHTML = data.map(lesson => `
      <div class="lesson-tile" data-lesson-id="${escapeHtml(lesson.id)}">
        <span class="lesson-tile-num">${escapeHtml(lesson.id)}</span>
        <h3 class="lesson-tile-title">${escapeHtml(lesson.title)}</h3>
        <p class="lesson-tile-desc">${lesson.steps && lesson.steps.length ? lesson.steps.length + ' шагов' : 'Практика'} · ${lesson.branch === 'html' ? 'HTML и вёрстка' : 'Frontend (JS)'}</p>
        <span class="lesson-tile-action">Пройти урок</span>
      </div>
    `).join('');
    lessonsCardsGrid.querySelectorAll('.lesson-tile').forEach(tile => {
      tile.addEventListener('click', function () {
        openLesson(this.dataset.lessonId);
      });
    });
  });
}

function openLesson(lessonId) {
  showWorkspaceView();
  selectLesson(lessonId);
}

function getNextLessonId(currentId) {
  var data = getLessonsData();
  var currentIndex = data.findIndex(function (lesson) {
    return String(lesson.id) === String(currentId);
  });
  if (currentIndex === -1 || currentIndex >= data.length - 1) return '';
  return String(data[currentIndex + 1].id);
}

function updateNextLessonButton(currentId) {
  if (!nextLessonBtn) return;
  var nextId = getNextLessonId(currentId);
  if (!nextId) {
    nextLessonBtn.style.display = 'none';
    nextLessonBtn.dataset.lessonId = '';
    return;
  }
  var nextLesson = getLessonsData().find(function (lesson) {
    return String(lesson.id) === String(nextId);
  });
  nextLessonBtn.dataset.lessonId = nextId;
  nextLessonBtn.textContent = nextLesson && nextLesson.title
    ? 'К следующему уроку: ' + nextLesson.title + ' →'
    : 'К следующему уроку →';
  nextLessonBtn.style.display = 'inline-flex';
}

function renderLessonsNav() {
  if (!lessonsNav) return;
  const data = getLessonsData();
  getCompletedLessons().then(completed => {
    const completedIds = new Set((completed || []).map(c => String(c.lessonId != null ? c.lessonId : c.lesson_id)));
    lessonsNav.innerHTML = data.map(lesson => `
      <li>
        <a href="#" class="lesson-link ${String(currentLessonId) === String(lesson.id) ? 'active' : ''} ${completedIds.has(String(lesson.id)) ? 'lesson-done' : ''}" data-lesson-id="${escapeHtml(lesson.id)}">
          ${completedIds.has(String(lesson.id)) ? '✓ ' : ''}${escapeHtml(lesson.title)}
        </a>
      </li>
    `).join('');
    lessonsNav.querySelectorAll('.lesson-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectLesson(link.dataset.lessonId);
      });
    });
  }).catch(() => {
    lessonsNav.innerHTML = data.map(lesson => `
      <li>
        <a href="#" class="lesson-link ${String(currentLessonId) === String(lesson.id) ? 'active' : ''}" data-lesson-id="${escapeHtml(lesson.id)}">${escapeHtml(lesson.title)}</a>
      </li>
    `).join('');
    lessonsNav.querySelectorAll('.lesson-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        selectLesson(link.dataset.lessonId);
      });
    });
  });
}

function setEditorValue(fullHtml) {
  if (codeEditor) codeEditor.setValue(fullHtml || '');
}

function getEditorValue() {
  return codeEditor ? codeEditor.getValue() : '';
}

function getIframeDocument() {
  if (!codeOutput) return null;
  try {
    return codeOutput.contentDocument || (codeOutput.contentWindow && codeOutput.contentWindow.document);
  } catch (e) {
    return null;
  }
}

/** Запускает превью и возвращает результат runChecks после загрузки iframe (нужен sandbox с allow-same-origin). */
function verifyCurrentLessonAsync() {
  return new Promise(function (resolve) {
    runCode();
    var checks = getCurrentChecks();
    var source = getEditorValue();
    if (!checks || checks.length === 0) {
      resolve({ passed: true, errors: [], skipped: true });
      return;
    }
    var iframe = codeOutput;
    if (!iframe) {
      resolve(runChecks(null, checks, source));
      return;
    }
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      iframe.removeEventListener('load', onLoad);
      var doc = getIframeDocument();
      resolve(runChecks(doc, checks, source));
    }
    function onLoad() {
      setTimeout(finish, 120);
    }
    iframe.addEventListener('load', onLoad);
    setTimeout(function () {
      try {
        var d = getIframeDocument();
        if (d && d.documentElement && d.readyState === 'complete') finish();
      } catch (e2) {}
    }, 30);
    setTimeout(function () {
      if (!done) finish();
    }, 1000);
  });
}

function renderCheckPanel(result, options) {
  var el = checkResultEl;
  if (!el) return;
  var noChecks = options && options.noChecksConfigured;
  if (noChecks) {
    el.innerHTML =
      '<div class="lesson-check-inner lesson-check-inner--info">' +
      '<p class="lesson-check-title">Проверка не настроена</p>' +
      '<p class="lesson-check-detail">Для этого шага нет автоматических критериев. Обратитесь к администратору или выполните задание по инструкции.</p></div>';
    el.className = 'lesson-check-result lesson-check-info';
    return;
  }
  el.className = 'lesson-check-result ' + (result.passed ? 'lesson-check-ok' : 'lesson-check-fail');
  if (result.passed) {
    el.innerHTML =
      '<div class="lesson-check-inner">' +
      '<p class="lesson-check-title lesson-check-title--ok">Проверка пройдена</p>' +
      '<p class="lesson-check-detail">Код соответствует заданию. Можно переходить дальше или отметить урок выполненным.</p></div>';
  } else {
    el.innerHTML =
      '<div class="lesson-check-inner">' +
      '<p class="lesson-check-title lesson-check-title--fail">Нужно поправить</p>' +
      '<ul class="lesson-check-errors">' +
      result.errors.map(function (e) { return '<li>' + escapeHtml(e) + '</li>'; }).join('') +
      '</ul>' +
      '<p class="lesson-check-hint">Сверьте задание слева, нажмите «Запустить» и снова «Проверить».</p></div>';
  }
}

function updateCompleteButtonState() {
  if (!completeBtn || !currentLessonId) return;
  if (currentLessonAlreadyCompleted) {
    completeBtn.textContent = 'Урок пройден';
    completeBtn.disabled = true;
    completeBtn.title = 'Урок уже отмечен выполненным';
    return;
  }
  completeBtn.textContent = 'Отметить урок пройденным';
  completeBtn.disabled = false;
  completeBtn.title = 'Отметить урок как пройденный';
}

function showStep(lesson, index) {
  if (!lesson.steps || !lesson.steps[index]) return;
  currentStepIndex = index;
  if (checkResultEl) checkResultEl.innerHTML = '';
  checkResultEl.className = 'lesson-check-result';
  const step = lesson.steps[index];
  const total = lesson.steps.length;
  if (stepsLabel) stepsLabel.textContent = 'Шаг ' + (index + 1) + ' из ' + total;
  if (stepPrev) stepPrev.disabled = index === 0;
  if (stepNext) stepNext.disabled = index === total - 1;
  var linksHtml = buildLessonRelatedLinksHtml(lesson);
  lessonContent.innerHTML =
    '<h3>' + escapeHtml(lesson.title) + '</h3>' +
    '<p class="lesson-step-title">' + escapeHtml(step.title) + '</p>' +
    '<div class="lesson-step-task">' + step.task + '</div>' +
    linksHtml;
  setEditorValue(buildLessonEditorSource(step.html, step.css, step.js));
  runCode();
  updateCompleteButtonState();
}

function selectLesson(lessonId) {
  var id = lessonId != null ? String(lessonId) : '';
  const lesson = getLessonsData().find(l => String(l.id) === id);
  if (!lesson) return;
  currentLessonId = lesson.id;
  currentStepIndex = 0;
  currentLessonAlreadyCompleted = false;
  if (checkResultEl) { checkResultEl.innerHTML = ''; checkResultEl.className = 'lesson-check-result'; }

  if (lesson.steps && lesson.steps.length > 0) {
    if (stepsBar) stepsBar.style.display = 'flex';
    showStep(lesson, 0);
  } else {
    if (stepsBar) stepsBar.style.display = 'none';
    var linksHtml = buildLessonRelatedLinksHtml(lesson);
    lessonContent.innerHTML = `<h3>${escapeHtml(lesson.title)}</h3>${lesson.description}${linksHtml}`;
    setEditorValue(buildLessonEditorSource(lesson.html, lesson.css, lesson.js));
    runCode();
  }
  getCompletedLessons()
    .then(function (completed) {
      var lid = String(lesson.id);
      var done = (completed || []).some(function (c) {
        return String(c.lessonId != null ? c.lessonId : c.lesson_id) === lid;
      });
      currentLessonAlreadyCompleted = done;
      updateCompleteButtonState();
    })
    .catch(function () {
      updateCompleteButtonState();
    });
  updateNextLessonButton(lesson.id);
  renderLessonsNav();
}

function runCode() {
  if (!codeOutput) return;
  const html = getEditorValue().trim();
  const content = html || '<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body><p>Напишите код и нажмите «Запустить».</p></body></html>';
  try {
    codeOutput.srcdoc = content;
  } catch (e) {
    var doc = codeOutput.contentDocument || codeOutput.contentWindow.document;
    doc.open();
    doc.write(content);
    doc.close();
  }
}

/** Возвращает массив проверок для текущего шага или урока (если без шагов). */
function getCurrentChecks() {
  if (!currentLessonId) return [];
  var lesson = getLessonsData().find(function (l) { return String(l.id) === String(currentLessonId); });
  if (!lesson) return [];
  if (lesson.steps && lesson.steps.length > 0 && lesson.steps[currentStepIndex]) {
    return lesson.steps[currentStepIndex].check || [];
  }
  return lesson.check || [];
}

/** Выполняет проверки по документу iframe и опционально по тексту редактора. Возвращает { passed: boolean, errors: string[] }. */
function runChecks(doc, checks, editorSource) {
  if (!checks || checks.length === 0) {
    return { passed: true, errors: [] };
  }
  var errors = [];
  var src = editorSource != null ? String(editorSource) : '';
  for (var i = 0; i < checks.length; i++) {
    var c = checks[i];
    if (c.sourceContains && src.indexOf(c.sourceContains) === -1) {
      errors.push('В вашем коде должна быть подстрока «' + c.sourceContains + '».');
      continue;
    }
    if (c.bodyClassAnyOf && c.bodyClassAnyOf.length) {
      if (!doc || !doc.body) {
        errors.push('Документ ещё не готов — нажмите «Запустить», затем «Проверить».');
        continue;
      }
      var bcn = doc.body.getAttribute('class') || doc.body.className || '';
      var foundCls = false;
      for (var bi = 0; bi < c.bodyClassAnyOf.length; bi++) {
        if (bcn.indexOf(c.bodyClassAnyOf[bi]) !== -1) {
          foundCls = true;
          break;
        }
      }
      if (!foundCls) {
        errors.push('У элемента body должен быть один из классов: «' + c.bodyClassAnyOf.join('», «') + '».');
      }
      continue;
    }
    var sel = c.selector;
    if (!sel) continue;
    if (!doc) {
      errors.push(
        'Не удалось прочитать превью (iframe). Нажмите «Запустить», подождите мгновение и снова «Проверить». Если сообщение повторяется, обновите страницу.'
      );
      break;
    }
    var els = [];
    try {
      els = doc.querySelectorAll(sel);
    } catch (e) {
      errors.push('Селектор «' + sel + '»: ошибка.');
      continue;
    }
    var count = els.length;
    if (c.count != null && count !== c.count) {
      errors.push('Ожидается ровно ' + c.count + ' элементов «' + sel + '», найдено: ' + count + '.');
      continue;
    }
    if (c.minCount != null && count < c.minCount) {
      errors.push('Ожидается минимум ' + c.minCount + ' элементов «' + sel + '», найдено: ' + count + '.');
      continue;
    }
    if (count === 0 && !c.textContains) {
      errors.push('Элемент «' + sel + '» не найден.');
      continue;
    }
    if (c.textContains) {
      var found = false;
      for (var j = 0; j < els.length; j++) {
        if (els[j].textContent && els[j].textContent.indexOf(c.textContains) !== -1) {
          found = true;
          break;
        }
      }
      if (!found) {
        errors.push('Среди элементов «' + sel + '» нет текста «' + c.textContains + '».');
      }
    }
  }
  return { passed: errors.length === 0, errors: errors };
}

function doCheck() {
  if (!checkResultEl || !codeOutput) return;
  var checks = getCurrentChecks();
  if (checks.length === 0) {
    renderCheckPanel({ passed: false, errors: [] }, { noChecksConfigured: true });
    return;
  }
  verifyCurrentLessonAsync().then(function (result) {
    renderCheckPanel(result, { noChecksConfigured: false });
  });
}

function markLessonComplete() {
  if (!currentLessonId || !completeBtn || currentLessonAlreadyCompleted) return;
  completeLesson(currentLessonId).then(function () {
    currentLessonAlreadyCompleted = true;
    completeBtn.textContent = 'Урок пройден';
    completeBtn.disabled = true;
    completeBtn.title = 'Урок отмечен выполненным';
    renderLessonsNav();
    renderLessonsCards();
  }).catch(function () {});
}

if (backToLessonsBtn) {
  backToLessonsBtn.addEventListener('click', function (e) {
    e.preventDefault();
    showGridView();
  });
}

if (runBtn) runBtn.addEventListener('click', runCode);
if (checkBtn) checkBtn.addEventListener('click', doCheck);
if (completeBtn) completeBtn.addEventListener('click', markLessonComplete);
if (nextLessonBtn) {
  nextLessonBtn.addEventListener('click', function () {
    var nextId = this.dataset.lessonId;
    if (!nextId) return;
    selectLesson(nextId);
    runCode();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (stepPrev) stepPrev.addEventListener('click', () => {
  if (!currentLessonId) return;
  const lesson = getLessonsData().find(l => String(l.id) === String(currentLessonId));
  if (lesson && lesson.steps && currentStepIndex > 0) showStep(lesson, currentStepIndex - 1);
});
if (stepNext) stepNext.addEventListener('click', () => {
  if (!currentLessonId) return;
  const lesson = getLessonsData().find(l => String(l.id) === String(currentLessonId));
  if (lesson && lesson.steps && currentStepIndex < lesson.steps.length - 1) showStep(lesson, currentStepIndex + 1);
});

function loadLessonsAndRender() {
  function getOpenLessonId() {
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash) return hash;
    var p = new URLSearchParams(window.location.search);
    return p.get('open') || '';
  }

  function tryOpenLesson() {
    var id = getOpenLessonId();
    if (!id) return;
    var data = getLessonsData();
    var found = data.some(function (l) { return String(l.id) === String(id); });
    if (found) {
      openLesson(id);
      if (window.history && window.history.replaceState) {
        var p = new URLSearchParams(window.location.search);
        p.delete('open');
        var q = p.toString();
        var u = window.location.pathname + (q ? '?' + q : '');
        window.history.replaceState({}, '', u || 'lessons.html');
      }
    }
  }

  const hasApi = window.webdevApi && typeof window.webdevApi.getLessons === 'function';

  if (hasApi) {
    window.webdevApi.getLessons()
      .then(apiLessons => {
        if (apiLessons && apiLessons.length > 0) {
          setLessonsData(apiLessons);
        }
        renderLessonsCards();
        renderLessonsNav();
        setTimeout(tryOpenLesson, 50);
      })
      .catch(() => {
        renderLessonsCards();
        renderLessonsNav();
        setTimeout(tryOpenLesson, 50);
      });
    return;
  }

  const hasLocalDb = typeof window.webdevDbReady === 'function' && window.webdevDbReady();
  if (hasLocalDb && window.webdevDbGetLessons) {
    try {
      setLessonsData(window.webdevDbGetLessons());
    } catch (e) {}
    renderLessonsCards();
    renderLessonsNav();
    setTimeout(tryOpenLesson, 50);
    return;
  }

  renderLessonsCards();
  renderLessonsNav();
  setTimeout(tryOpenLesson, 50);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!(window.webdevApi && typeof window.webdevApi.getLessons === 'function')) {
    if (window.webdevDbInitPromise) await window.webdevDbInitPromise;
    if (typeof window.webdevDbReady === 'function' && window.webdevDbReady() && window.webdevDbGetLessons) {
      try { setLessonsData(window.webdevDbGetLessons()); } catch (e) {}
    }
  }
  loadLessonsAndRender();

  var ta = document.getElementById('code-editor');
  if (typeof CodeMirror !== 'undefined' && ta) {
    var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    codeEditor = CodeMirror.fromTextArea(ta, {
      mode: 'htmlmixed',
      theme: isDark ? 'monokai' : 'default',
      lineNumbers: true,
      lineWrapping: true,
      indentUnit: 2,
      tabSize: 2,
      indentWithTabs: false,
      extraKeys: {
        'Ctrl-Enter': function () { runCode(); },
        'Cmd-Enter': function () { runCode(); },
        'Shift-Ctrl-Enter': function () { doCheck(); },
        'Shift-Cmd-Enter': function () { doCheck(); }
      }
    });
    codeEditor.setSize(null, '100%');
  }

  window.addEventListener('webdevDbLoaded', function () {
    if (window.webdevApi && typeof window.webdevApi.getLessons === 'function') return;
    if (typeof window.webdevDbGetLessons === 'function') {
      try { setLessonsData(window.webdevDbGetLessons()); } catch (e) {}
    }
    loadLessonsAndRender();
  });

  window.addEventListener('hashchange', function () {
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (!hash) return;
    var data = getLessonsData();
    if (data.some(function (l) { return String(l.id) === String(hash); })) openLesson(hash);
  });
});
