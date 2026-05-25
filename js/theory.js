/**
 * Теория: сетка по темам, фильтр по категории, переход на полноценную страницу (theory-topic.html).
 * Данные: с API /api/theory, если есть; иначе THEORY_TOPICS из theory-data.js.
 */
(function () {
  const grid = document.getElementById('theory-grid');
  const filter = document.getElementById('theory-filter');
  let category = 'all';

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function render() {
    const list = typeof THEORY_TOPICS !== 'undefined' ? THEORY_TOPICS : [];
    if (!grid) return;
    const filtered = category === 'all' ? list : (category === 'layout' ? list.filter(t => t.category === 'html' || t.category === 'css') : list.filter(t => t.category === category));
    grid.innerHTML = filtered.map(t => {
      const catLabel = t.category === 'html' ? 'HTML' : t.category === 'css' ? 'CSS' : 'JS';
      const lessonLink = t.lessonId ? `<a href="lessons.html?open=${encodeURIComponent(t.lessonId)}" class="theory-card-link theory-card-lesson">Урок</a>` : '';
      const testLink = t.testId ? `<a href="test.html?id=${encodeURIComponent(t.testId)}" class="theory-card-link theory-card-test">Тест</a>` : '';
      const links = (lessonLink || testLink) ? `<div class="theory-card-actions">${lessonLink}${testLink}</div>` : '';
      return `
      <article class="theory-card">
        <span class="theory-card-cat">${catLabel}</span>
        <h3 class="theory-card-title">${esc(t.title)}</h3>
        <p class="theory-card-desc">${esc(t.shortDesc || '')}</p>
        <div class="theory-card-footer">
          <a href="theory-topic.html?id=${encodeURIComponent(t.id)}" class="btn btn-sm btn-primary">Пройти</a>
          ${links}
        </div>
      </article>
    `}).join('');
  }

  function init() {
    if (window.webdevApi && typeof window.webdevApi.getTheory === 'function') {
      window.webdevApi.getTheory()
        .then(function (data) {
          window.THEORY_TOPICS = Array.isArray(data) ? data : [];
          render();
        })
        .catch(function () {
          if (typeof THEORY_TOPICS === 'undefined') window.THEORY_TOPICS = [];
          render();
        });
    } else {
      if (typeof THEORY_TOPICS === 'undefined') window.THEORY_TOPICS = [];
      render();
    }
  }

  if (filter) {
    filter.addEventListener('click', (e) => {
      const btn = e.target.closest('.branch-btn');
      if (!btn) return;
      const cat = btn.getAttribute('data-category');
      if (!cat || cat === category) return;
      category = cat;
      filter.querySelectorAll('.branch-btn').forEach(b => b.classList.toggle('active', b === btn));
      render();
    });
  }
  init();
})();
