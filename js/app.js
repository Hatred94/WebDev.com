/**
 * Общая логика: тема (сохранение на всех страницах), активный пункт меню, статистика на главной
 * Локальная БД: инициализация sql.js + diplom.db при загрузке.
 */
(function () {
  window.webdevDbInitPromise = typeof window.initWebdevDb === 'function' ? window.initWebdevDb() : Promise.resolve(false);
})();

const THEME_KEY = 'webdev_theme';

/** Читает тему: сначала из URL (при переходе по ссылке), затем из localStorage */
function getSavedTheme() {
  try {
    var fromUrl = new URLSearchParams(window.location.search).get('theme');
    if (fromUrl === 'light' || fromUrl === 'dark') return fromUrl;
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function getThemeToApply() {
  var t = getSavedTheme();
  return (t === 'light' || t === 'dark') ? t : 'dark';
}

/** Восстановить тему строго из localStorage (для возврата на вкладку / обновления) */
function getThemeFromStorage() {
  try {
    var t = localStorage.getItem(THEME_KEY);
    return (t === 'light' || t === 'dark') ? t : 'dark';
  } catch {
    return 'dark';
  }
}

/** Добавить текущую тему в URL (replaceState) и во все внутренние ссылки. Использует localStorage как источник истины. */
function syncThemeToUrlAndLinks() {
  var theme = getThemeFromStorage();
  try {
    var u = new URL(window.location.href);
    u.searchParams.set('theme', theme);
    var newHref = u.toString();
    if (newHref !== window.location.href) {
      history.replaceState(null, '', newHref);
    }
  } catch (e) {
    try {
      var search = (window.location.search || '?').replace(/([?&])theme=[^&]*/g, '$1').replace(/\?&/, '?').replace(/\?$/, '');
      if (search !== '?' && search.length > 1) search += '&'; else search = '?';
      search += 'theme=' + encodeURIComponent(theme);
      history.replaceState(null, '', window.location.pathname + search);
    } catch (_) {}
  }
  document.querySelectorAll('a[href]').forEach(function (a) {
    try {
      var href = (a.getAttribute('href') || '').trim();
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      var isExternal = href.startsWith('http://') || href.startsWith('https://');
      if (isExternal) {
        try {
          var linkUrl = new URL(href);
          if (linkUrl.origin !== window.location.origin) return;
        } catch (e) { return; }
      }
      href = href.replace(/([?&])theme=[^&]*/g, '').replace(/\?&/, '?').replace(/\?$/, '');
      var sep = href.indexOf('?') === -1 ? '?' : '&';
      a.setAttribute('href', href + sep + 'theme=' + encodeURIComponent(theme));
    } catch (_) {}
  });
}

function applyTheme(theme) {
  if (!theme) return;
  const safe = theme === 'light' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', safe);
  if (document.body) document.body.setAttribute('data-theme', safe);
  try { localStorage.setItem(THEME_KEY, safe); } catch (_) {}
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    const text = toggle.querySelector('.theme-toggle-text');
    const iconDark = toggle.querySelector('.theme-icon-dark');
    const iconLight = toggle.querySelector('.theme-icon-light');
    if (text) text.textContent = safe === 'light' ? 'Светлая' : 'Тёмная';
    if (iconDark) iconDark.style.display = safe === 'light' ? 'none' : 'inline-flex';
    if (iconLight) iconLight.style.display = safe === 'light' ? 'inline-flex' : 'none';
  }
}

function bindThemeToggle() {
  const toggle = document.querySelector('.theme-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const next = cur === 'light' ? 'dark' : 'light';
    try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    applyTheme(next);
    syncThemeToUrlAndLinks();
  });
}

function setActiveNavLink() {
  const page = (window.location.pathname.split('/').pop() || window.location.href.split('/').pop() || 'index.html').toLowerCase().replace(/\?.*$/, '') || 'index.html';
  let current = 'home';
  if (page === 'theory.html' || page === 'theory-topic.html') current = 'theory';
  else if (page === 'tests.html' || page === 'test.html') current = 'tests';
  else if (page === 'lessons.html') current = 'lessons';
  else if (page === 'help.html') current = 'help';
  else if (page === 'cabinet.html') current = 'cabinet';
  else if (page === 'admin.html') current = 'home';
  document.querySelectorAll('.nav-list a[data-nav]').forEach(link => {
    link.classList.toggle('active', link.getAttribute('data-nav') === current);
  });
}

// Применить тему сразу при загрузке скрипта (до DOMContentLoaded)
(function () {
  var t = getThemeToApply();
  document.documentElement.setAttribute('data-theme', t);
  if (document.body) document.body.setAttribute('data-theme', t);
})();

document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getThemeToApply());
  syncThemeToUrlAndLinks();
  setActiveNavLink();
  bindThemeToggle();

  function updateStats() {
    getStats()
      .then(s => {
        if (passedEl) passedEl.textContent = s.passedTests;
        if (scoreEl) scoreEl.textContent = s.totalScore;
        if (lessonsEl) lessonsEl.textContent = s.completedLessonsCount;
      })
      .catch(() => {
        if (passedEl) passedEl.textContent = '0';
        if (scoreEl) scoreEl.textContent = '0';
        if (lessonsEl) lessonsEl.textContent = '0';
      });
  }

  const passedEl = document.getElementById('passed-tests');
  const scoreEl = document.getElementById('total-score');
  const lessonsEl = document.getElementById('completed-lessons');
  if (passedEl || scoreEl || lessonsEl) updateStats();
  window.addEventListener('webdevDbLoaded', updateStats);
});

// При возврате по истории (bfcache) — применить тему из localStorage и обновить URL/ссылки
window.addEventListener('pageshow', function (event) {
  var theme = getThemeFromStorage();
  applyTheme(theme);
  syncThemeToUrlAndLinks();
});

// При возврате на вкладку — всегда восстанавливать тему из localStorage (исправляет сброс при переключении вкладок)
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') {
    var theme = getThemeFromStorage();
    applyTheme(theme);
    syncThemeToUrlAndLinks();
  }
});
