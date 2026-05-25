/**
 * Баннеры «Как устроена эта страница»: наведи на баннер — внутри него виден код блока
 */
(function () {
  const SNIPPETS = {
    header: '<header class="header">\n  <nav class="nav">\n    <a href="index.html" class="logo">WebDev</a>\n    <ul class="nav-list">...</ul>\n  </nav>\n</header>',
    hero: '<section class="hero">\n  <h1>Веб-разработка...</h1>\n  <p class="hero-desc">...</p>\n  <div class="hero-cards">\n    <a href="theory.html" class="card">...</a>\n  </div>\n</section>',
    card: '<a href="theory.html" class="card">\n  <span class="card-icon-svg">...</span>\n  <h3>Теория</h3>\n  <p>Материалы по темам</p>\n</a>'
  };

  const container = document.getElementById('code-banners');
  if (!container) return;

  function escapeHtml(s) {
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  container.querySelectorAll('.code-banner').forEach(function (banner) {
    const key = banner.getAttribute('data-code');
    const html = SNIPPETS[key];
    if (!html) return;
    const peek = banner.querySelector('.code-banner-peek code');
    if (peek) peek.textContent = html;
  });
})();
