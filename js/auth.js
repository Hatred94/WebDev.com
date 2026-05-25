/**
 * Блок авторизации в шапке: Войти / Регистрация или Выйти (и Админка для admin).
 */
(function () {
  var el = document.getElementById('auth-nav');
  if (!el) return;

  function render(user) {
    if (user) {
      var html = '';
      if (user.role === 'admin') html += '<a href="admin.html" class="nav-auth-btn nav-auth-admin">Админка</a> ';
      html += '<button type="button" class="nav-auth-btn" id="auth-logout">Выйти</button>';
      el.innerHTML = html;
      var logoutBtn = document.getElementById('auth-logout');
      if (logoutBtn) logoutBtn.addEventListener('click', doLogout);
    } else {
      el.innerHTML = '<a href="login.html" class="nav-auth-link">Войти</a> <a href="login.html#register" class="nav-auth-link">Регистрация</a>';
    }
  }

  function doLogout() {
    if (window.webdevApi && typeof window.webdevApi.logout === 'function') {
      window.webdevApi.logout().then(function () { sessionStorage.removeItem('webdev_user'); render(null); }).catch(function () { sessionStorage.removeItem('webdev_user'); render(null); });
    } else {
      if (typeof window.webdevDbLogout === 'function') window.webdevDbLogout();
      render(null);
    }
  }

  function tryRender() {
    if (window.webdevApi && typeof window.webdevApi.getMe === 'function') {
      window.webdevApi.getMe().then(function (r) {
        if (r && r.user) {
          sessionStorage.setItem('webdev_user', JSON.stringify(r.user));
          render(r.user);
        } else {
          render(typeof window.webdevDbGetCurrentUser === 'function' ? window.webdevDbGetCurrentUser() : null);
        }
      }).catch(function () {
        render(typeof window.webdevDbGetCurrentUser === 'function' ? window.webdevDbGetCurrentUser() : null);
      });
      return;
    }
    if (typeof window.webdevDbGetCurrentUser === 'function') {
      render(window.webdevDbGetCurrentUser());
    } else {
      render(null);
    }
  }

  if (typeof window.webdevDbInitPromise !== 'undefined') {
    window.webdevDbInitPromise.then(tryRender);
  } else if (typeof window.initWebdevDb === 'function') {
    window.initWebdevDb().then(function () { tryRender(); });
  } else {
    tryRender();
  }
  window.addEventListener('webdevDbLoaded', tryRender);
})();
