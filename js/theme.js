/**
 * Применение темы ДО загрузки стилей — подключается первым в <head> на каждой странице.
 * Тема: из URL (?theme=light|dark), иначе из localStorage, иначе 'dark'. Сохраняем в localStorage.
 */
(function () {
  try {
    var q = window.location.search;
    var params = new URLSearchParams(q);
    var t = params.get('theme');
    if (t !== 'light' && t !== 'dark') t = localStorage.getItem('webdev_theme');
    t = (t === 'light' || t === 'dark') ? t : 'dark';
    localStorage.setItem('webdev_theme', t);
    document.documentElement.setAttribute('data-theme', t);
    if (document.body) document.body.setAttribute('data-theme', t);
  } catch (e) {}
})();
