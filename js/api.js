/**
 * Клиент API бэкенда (SQLite). Все запросы с credentials для cookie-сессий.
 * Базовый URL: пустая строка при открытии с того же origin (сервер раздаёт сайт).
 */
(function () {
  const BASE = '';

  function request(method, path, body) {
    const opts = { method, credentials: 'include', headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    return fetch(BASE + path, opts).then(function (res) {
      const ct = res.headers.get('Content-Type');
      const isJson = ct && ct.indexOf('application/json') !== -1;
      return (isJson ? res.json() : res.text()).then(function (data) {
        if (res.ok) return data;
        const err = new Error(data.error || data || 'Ошибка запроса');
        err.status = res.status;
        err.data = data;
        throw err;
      });
    });
  }

  window.webdevApi = {
    getMe: function () { return request('GET', '/api/me'); },
    login: function (login, password) { return request('POST', '/api/auth/login', { login, password }); },
    register: function (login, password) { return request('POST', '/api/auth/register', { login, password }); },
    logout: function () { return request('POST', '/api/auth/logout'); },

    getLessons: function () { return request('GET', '/api/lessons'); },
    getLesson: function (id) { return request('GET', '/api/lessons/' + encodeURIComponent(id)); },
    getTests: function () { return request('GET', '/api/tests'); },
    getTest: function (id) { return request('GET', '/api/tests/' + encodeURIComponent(id)); },

    getTheory: function () { return request('GET', '/api/theory'); },
    getTheoryTopic: function (id) { return request('GET', '/api/theory/' + encodeURIComponent(id)); },

    getStats: function () { return request('GET', '/api/progress/stats'); },
    completeLesson: function (lessonId) { return request('POST', '/api/progress/lesson', { lessonId }); },
    saveTestResult: function (testId, score, passed, maxScore) {
      return request('POST', '/api/progress/test', { testId, score, passed, maxScore: maxScore != null ? maxScore : score });
    },
    getCompletedLessons: function () { return request('GET', '/api/progress/lessons'); },
    getTestResults: function () { return request('GET', '/api/progress/tests'); }
  };
})();
