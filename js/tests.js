 /**
 * Страница тестов: список с галочками и баллами, переход на полноценную страницу теста (test.html)
 * Данные: сначала с API (если есть), иначе статика (TESTS_DATA) или локальная БД.
 */

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderTestsList(testsData) {
  const container = document.getElementById('tests-list');
  if (!container) return;
  const list = Array.isArray(testsData) ? testsData : (window.TESTS_DATA || []);
  if (list.length === 0) {
    container.innerHTML = '<p class="tests-empty">Тестов пока нет. Добавьте тесты в админ-панели.</p>';
    return;
  }

  Promise.all(list.map(t => getTestResult(t.id))).then(results => {
    container.innerHTML = '';
    list.forEach((test, i) => {
      const saved = results[i];
      const passed = saved && saved.passed;
      const score = saved ? saved.score : null;
      const maxScore = saved && saved.maxScore != null ? saved.maxScore : (test.questions && test.questions.length) || 0;
      const card = document.createElement('div');
      card.className = 'test-card';
      card.innerHTML = `
        <div class="test-card-left">
          <h3 class="test-card-title">${escapeHtml(test.title)}</h3>
          <p class="test-card-meta">
            ${test.branch === 'js' ? '<span class="test-branch js">JavaScript</span>' : '<span class="test-branch html">HTML и вёрстка</span>'}
            ${(test.questions && test.questions.length) ? '<span class="test-questions-count">' + test.questions.length + ' вопросов</span>' : ''}
          </p>
          ${passed ? '<span class="test-badge passed">Пройден</span>' : ''}
          ${score != null ? `<span class="test-score">Баллов: ${score} / ${maxScore}</span>` : ''}
        </div>
        <a href="test.html?id=${encodeURIComponent(test.id)}" class="btn btn-primary">Пройти тест</a>
      `;
      container.appendChild(card);
    });
  }).catch(() => {
    container.innerHTML = '';
    list.forEach(test => {
      const card = document.createElement('div');
      card.className = 'test-card';
      card.innerHTML = `
        <div class="test-card-left">
          <h3 class="test-card-title">${escapeHtml(test.title)}</h3>
          ${(test.questions && test.questions.length) ? '<span class="test-questions-count">' + test.questions.length + ' вопросов</span>' : ''}
        </div>
        <a href="test.html?id=${encodeURIComponent(test.id)}" class="btn btn-primary">Пройти тест</a>
      `;
      container.appendChild(card);
    });
  });
}

function loadTestsAndRender() {
  const hasApi = window.webdevApi && typeof window.webdevApi.getTests === 'function';

  if (hasApi) {
    window.webdevApi.getTests()
      .then(apiTests => {
        if (apiTests && apiTests.length > 0) {
          window.TESTS_DATA = apiTests;
          renderTestsList(apiTests);
        } else {
          renderTestsList(window.TESTS_DATA || []);
        }
      })
      .catch(() => {
        renderTestsList(window.TESTS_DATA || []);
      });
    return;
  }

  const hasLocalDb = typeof window.webdevDbReady === 'function' && window.webdevDbReady();
  if (hasLocalDb && window.webdevDbGetTests) {
    try {
      window.TESTS_DATA = window.webdevDbGetTests();
      renderTestsList(window.TESTS_DATA);
    } catch (e) {
      renderTestsList(window.TESTS_DATA || []);
    }
    return;
  }

  renderTestsList(window.TESTS_DATA || []);
}

document.addEventListener('DOMContentLoaded', async () => {
  const hash = window.location.hash.slice(1);
  if (hash && (window.TESTS_DATA || []).some(t => t.id === hash)) {
    window.location.replace('test.html?id=' + encodeURIComponent(hash));
    return;
  }
  if (!(window.webdevApi && typeof window.webdevApi.getTests === 'function')) {
    if (window.webdevDbInitPromise) await window.webdevDbInitPromise;
  }
  loadTestsAndRender();

  window.addEventListener('webdevDbLoaded', function () {
    if (window.webdevApi && typeof window.webdevApi.getTests === 'function') return;
    if (typeof window.webdevDbGetTests === 'function') {
      try { window.TESTS_DATA = window.webdevDbGetTests(); } catch (e) {}
    }
    loadTestsAndRender();
  });
});
