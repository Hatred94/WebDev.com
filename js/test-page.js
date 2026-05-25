/**
 * Полноценная страница одного теста: вопросы по id из URL, отправка, результат на странице
 * Тест берётся из TESTS_DATA или с API (webdevApi.getTest).
 */
(function () {
  function sanitizeReturn(raw) {
    if (!raw || typeof raw !== 'string') return '';
    try {
      var s = decodeURIComponent(raw.trim());
      if (s.indexOf('..') !== -1 || /^\s*javascript:/i.test(s)) return '';
      if (s.indexOf(':') !== -1) return '';
      if (!/^[a-z0-9._/?#=&@%+-]+$/i.test(s)) return '';
      return s;
    } catch (e) {
      return '';
    }
  }

  function run(test, returnPath) {
    if (!test || !test.questions || !test.questions.length) return;
    var header = document.getElementById('test-page-header');
    var form = document.getElementById('test-page-form');
    var questionsEl = document.getElementById('test-page-questions');
    var submitBtn = document.getElementById('test-page-submit');
    var resultBlock = document.getElementById('test-page-result');
    var resultTitle = document.getElementById('test-page-result-title');
    var resultScore = document.getElementById('test-page-result-score');
    var resultDetails = document.getElementById('test-page-result-details');
    var loading = document.getElementById('test-page-loading');
    var notFound = document.getElementById('test-page-notfound');

    function esc(s) {
      var d = document.createElement('div');
      d.textContent = s;
      return d.innerHTML;
    }

    if (loading) loading.style.display = 'none';
    if (notFound) notFound.style.display = 'none';

    document.title = test.title + ' — Тесты';
    if (header) header.style.display = 'block';
    document.getElementById('test-page-title').textContent = test.title;
    var retEl = document.getElementById('test-page-return');
    if (retEl) {
      if (returnPath) {
        retEl.href = returnPath;
        retEl.style.display = 'inline-flex';
      } else {
        retEl.style.display = 'none';
      }
    }
    if (form) form.style.display = 'block';

    questionsEl.innerHTML = test.questions.map(function (q, i) {
      return '<div class="test-question"><p>' + (i + 1) + '. ' + esc(q.question) + '</p><div class="test-options">' +
        q.options.map(function (opt, j) {
          return '<div class="test-option"><label><input type="radio" name="q_' + i + '" value="' + j + '"/> ' + esc(opt) + '</label></div>';
        }).join('') + '</div></div>';
    }).join('');

    function submit() {
      var answers = test.questions.map(function (q, i) {
        var el = document.querySelector('input[name="q_' + i + '"]:checked');
        return el ? parseInt(el.value, 10) : -1;
      });
      var correct = 0;
      answers.forEach(function (a, i) { if (a === test.questions[i].correct) correct++; });
      var max = test.questions.length;
      var passed = correct === max;
      saveTestResult(test.id, correct, passed, max).then(function () {}).catch(function () {});
      if (form) form.style.display = 'none';
      if (resultBlock) resultBlock.style.display = 'block';
      if (resultTitle) {
        resultTitle.textContent = passed ? 'Тест пройден!' : 'Тест не пройден';
        resultTitle.style.color = passed ? 'var(--success)' : 'var(--text)';
      }
      if (resultScore) resultScore.textContent = 'Баллы: ' + correct + ' из ' + max;
      if (resultDetails) {
        var html = '<h3>Ваши ответы</h3><ol class="test-result-list">';
        test.questions.forEach(function (q, i) {
          var userIndex = answers[i];
          var correctIndex = q.correct;
          var userText = (userIndex >= 0 && q.options && q.options[userIndex] != null) ? q.options[userIndex] : 'Не выбран ответ';
          var correctText = (q.options && q.options[correctIndex] != null) ? q.options[correctIndex] : '';
          var isOk = userIndex === correctIndex;
          html += '<li class="test-result-item ' + (isOk ? 'test-result-ok' : 'test-result-fail') + '">';
          html += '<p class="test-result-question">' + (i + 1) + '. ' + esc(q.question) + '</p>';
          html += '<p class="test-result-your">Ваш ответ: <span>' + esc(userText) + '</span></p>';
          if (!isOk && correctText) {
            html += '<p class="test-result-correct">Правильный ответ: <span>' + esc(correctText) + '</span></p>';
          }
          html += '</li>';
        });
        html += '</ol>';
        resultDetails.innerHTML = html;
      }
    }
    if (submitBtn) submitBtn.addEventListener('click', submit);
  }

  function showNotFound() {
    var loading = document.getElementById('test-page-loading');
    var notFound = document.getElementById('test-page-notfound');
    if (loading) loading.style.display = 'none';
    if (notFound) notFound.style.display = 'block';
    document.title = 'Тест не найден';
  }

  function init() {
    var qs = new URLSearchParams(window.location.search);
    var id = qs.get('id') || '';
    var returnPath = sanitizeReturn(qs.get('return') || '');
    if (!id) { showNotFound(); return; }

    var testsData = window.TESTS_DATA || [];
    var test = testsData.find(function (t) { return t.id === id; });

    if (test) {
      run(test, returnPath);
      return;
    }

    if (window.webdevApi && typeof window.webdevApi.getTest === 'function') {
      window.webdevApi.getTest(id)
        .then(function (t) {
          if (t && t.questions && t.questions.length) run(t, returnPath);
          else showNotFound();
        })
        .catch(showNotFound);
      return;
    }

    showNotFound();
  }

  function doInit() {
    if (window.webdevApi && typeof window.webdevApi.getTest === 'function') {
      init();
      return;
    }
    var p = window.webdevDbInitPromise || Promise.resolve();
    p.then(function () {
      if (typeof window.webdevDbReady === 'function' && window.webdevDbReady() && window.webdevDbGetTests) window.TESTS_DATA = window.webdevDbGetTests();
      init();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', doInit);
  } else {
    doInit();
  }
})();
