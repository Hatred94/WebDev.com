/**
 * Редирект неавторизованных пользователей на страницу входа.
 * Для admin.html — также проверка роли admin.
 * Использование: подключить скрипт на странице после api.js и auth.js;
 * вызвать webdevAuthGuard({ requireLogin: true }) или webdevAuthGuard({ requireAdmin: true }).
 */
(function () {
  var LOGIN_URL = 'login.html';

  function getReturnUrl() {
    var path = window.location.pathname || '';
    var file = path.split('/').pop() || 'index.html';
    if (file === 'index.html' || file === '') return null;
    return file + (window.location.search || '') + (window.location.hash || '');
  }

  function redirectToLogin(requireAdmin) {
    var returnUrl = getReturnUrl();
    var url = LOGIN_URL + (returnUrl ? '?return=' + encodeURIComponent(returnUrl) : '');
    if (requireAdmin) url += (url.indexOf('?') !== -1 ? '&' : '?') + 'admin=1';
    window.location.replace(url);
  }

  /**
   * @param {Object} opts
   * @param {boolean} [opts.requireLogin] — редирект, если пользователь не авторизован
   * @param {boolean} [opts.requireAdmin] — редирект, если не админ (подразумевает requireLogin)
   * @param {function()} [opts.onAllow] — вызывается, если доступ разрешён (редиректа не будет)
   */
  window.webdevAuthGuard = function (opts) {
    opts = opts || {};
    var requireAdmin = opts.requireAdmin === true;
    var requireLogin = opts.requireLogin === true || requireAdmin;
    var onAllow = typeof opts.onAllow === 'function' ? opts.onAllow : null;

    function check(user) {
      if (requireLogin && !user) {
        redirectToLogin(requireAdmin);
        return;
      }
      if (requireAdmin && user && user.role !== 'admin') {
        redirectToLogin(true);
        return;
      }
      if (onAllow) onAllow(user);
    }

    if (window.webdevApi && typeof window.webdevApi.getMe === 'function') {
      window.webdevApi.getMe()
        .then(function (r) {
          var user = (r && r.user) ? r.user : null;
          if (user) sessionStorage.setItem('webdev_user', JSON.stringify(user));
          check(user);
        })
        .catch(function () {
          check(null);
        });
      return;
    }

    if (typeof window.webdevDbGetCurrentUser === 'function') {
      var init = window.webdevDbInitPromise || (window.initWebdevDb ? window.initWebdevDb() : Promise.resolve());
      init.then(function () {
        var user = window.webdevDbGetCurrentUser();
        check(user);
      }).catch(function () { check(null); });
      return;
    }

    check(null);
  };
})();
