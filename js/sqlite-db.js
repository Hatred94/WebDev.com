/**
 * Локальная БД SQLite через sql.js. Работает при открытии файлом (file://) без сервера.
 * При первом запуске показывается выбор файла diplom.db; копия сохраняется в IndexedDB и подгружается при следующих визитах.
 */
(function () {
  var db = null;
  var USER_KEY = 'webdev_user';
  var IDB_NAME = 'webdev_sqlite';
  var IDB_STORE = 'db';
  var IDB_KEY = 'file';

  function getCurrentUser() {
    try {
      var raw = sessionStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setCurrentUser(user) {
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_KEY);
  }

  function run(stmt, params) {
    if (!db) return null;
    try {
      var s = db.prepare(stmt);
      if (params && params.length) s.bind(params);
      var rows = [];
      while (s.step()) rows.push(s.getRow());
      s.free();
      return rows;
    } catch (e) {
      console.error('SQL:', stmt, e);
      throw e;
    }
  }

  function runOne(stmt, params) {
    var rows = run(stmt, params);
    return rows && rows.length ? rows[0] : null;
  }

  function runExec(stmt) {
    if (!db) return;
    db.run(stmt);
  }

  function runExecParam(stmt, params) {
    if (!db || !params || !params.length) return;
    var s = db.prepare(stmt);
    s.bind(params);
    s.step();
    s.free();
  }

  function loadFromIndexedDB() {
    return new Promise(function (resolve) {
      try {
        var req = indexedDB.open(IDB_NAME, 1);
        req.onerror = function () { resolve(null); };
        req.onsuccess = function () {
          var idb = req.result;
          if (!idb.objectStoreNames.contains(IDB_STORE)) { idb.close(); resolve(null); return; }
          var tx = idb.transaction(IDB_STORE, 'readonly');
          var store = tx.objectStore(IDB_STORE);
          var getReq = store.get(IDB_KEY);
          getReq.onsuccess = function () { idb.close(); resolve(getReq.result || null); };
          getReq.onerror = function () { idb.close(); resolve(null); };
        };
        req.onupgradeneeded = function (e) {
          if (!e.target.result.objectStoreNames.contains(IDB_STORE)) e.target.result.createObjectStore(IDB_STORE);
        };
      } catch (e) { resolve(null); }
    });
  }

  function saveToIndexedDB(buffer) {
    try {
      var req = indexedDB.open(IDB_NAME, 1);
      req.onsuccess = function () {
        var idb = req.result;
        var tx = idb.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put(buffer, IDB_KEY);
        idb.close();
      };
      req.onupgradeneeded = function (e) {
        if (!e.target.result.objectStoreNames.contains(IDB_STORE)) e.target.result.createObjectStore(IDB_STORE);
      };
    } catch (e) {}
  }

  function setDbFromBuffer(buf) {
    var Sql = window._webdevSql;
    if (!Sql || !buf) return false;
    try {
      db = new Sql.Database(new Uint8Array(buf));
      return true;
    } catch (e) { return false; }
  }

  function showFilePicker() {
    if (document.getElementById('webdev-db-picker')) return;
    var wrap = document.createElement('div');
    wrap.id = 'webdev-db-picker';
    wrap.className = 'webdev-db-picker';
    wrap.innerHTML = '<p>Выберите файл базы данных (diplom.db)</p><label class="webdev-db-picker-btn"><span class="btn btn-primary">Выбрать файл</span><input type="file" accept=".db,.sqlite,.sqlite3" id="webdev-db-file-input"></label>';
    document.body.appendChild(wrap);
    var input = document.getElementById('webdev-db-file-input');
    input.onchange = function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var buf = reader.result;
        if (setDbFromBuffer(buf)) {
          saveToIndexedDB(buf);
          wrap.remove();
          window.dispatchEvent(new Event('webdevDbLoaded'));
        }
      };
      reader.readAsArrayBuffer(file);
    };
  }

  window.showWebdevDbFilePicker = showFilePicker;

  /** Инициализация: загрузка sql.js, затем БД из IndexedDB или выбор файла пользователем. */
  window.initWebdevDb = function () {
    return new Promise(function (resolve, reject) {
      if (db) { resolve(true); return; }
      function tryInit(Sql) {
        window._webdevSql = Sql;
        loadFromIndexedDB().then(function (buf) {
          if (buf && setDbFromBuffer(buf)) { resolve(true); return; }
          fetch('diplom.db').then(function (r) { return r.arrayBuffer(); }).then(function (buf) {
            if (setDbFromBuffer(buf)) { saveToIndexedDB(buf); resolve(true); } else { showFilePicker(); resolve(false); }
          }).catch(function () { showFilePicker(); resolve(false); });
        });
      }
      if (window.initSqlJs) {
        var p = window.initSqlJs({ locateFile: function (f) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/' + f; } });
        if (p && p.then) { p.then(tryInit).catch(reject); return; }
      }
      var script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.js';
      script.onload = function () {
        window.initSqlJs({ locateFile: function () { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/sql-wasm.wasm'; } }).then(tryInit).catch(reject);
      };
      script.onerror = function () { reject(new Error('Не удалось загрузить sql.js')); };
      document.head.appendChild(script);
    });
  };

  /** Вход: логин и пароль. Возвращает { id, login, role } или null. */
  window.webdevDbLogin = function (login, password) {
    var row = runOne('SELECT id, login, role FROM users WHERE login = ? AND password_hash = ?', [login, password]);
    if (row) {
      var user = { id: row[0], login: row[1], role: row[2] };
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  window.webdevDbGetCurrentUser = getCurrentUser;
  window.webdevDbLogout = function () { setCurrentUser(null); };

  /** Уроки из БД в формате как LESSONS_DATA */
  window.webdevDbGetLessons = function () {
    if (!db) return [];
    var rows = run('SELECT id, title, description, branch, test_id, template, html, css, js, check_json, sort_order FROM lessons ORDER BY sort_order, id');
    var lessons = rows.map(function (r) {
      return {
        id: String(r[0]),
        title: r[1],
        description: r[2] || '',
        branch: r[3],
        testId: r[4] || null,
        template: !!r[5],
        html: r[6] || '',
        css: r[7] || '',
        js: r[8] || '',
        check: r[9] ? JSON.parse(r[9]) : undefined,
        steps: []
      };
    });
    var steps = run('SELECT lesson_id, title, task, html, css, js, check_json, step_order FROM lesson_steps ORDER BY lesson_id, step_order');
    steps.forEach(function (s) {
      var lesson = lessons.find(function (l) { return l.id === s[0]; });
      if (lesson) lesson.steps.push({
        title: s[1],
        task: s[2] || '',
        html: s[3] || '',
        css: s[4] || '',
        js: s[5] || '',
        check: s[6] ? JSON.parse(s[6]) : undefined
      });
    });
    return lessons;
  };

  /** Тесты из БД в формате как TESTS_DATA */
  window.webdevDbGetTests = function () {
    if (!db) return [];
    var rows = run('SELECT id, title, branch FROM tests ORDER BY id');
    var tests = rows.map(function (r) { return { id: r[0], title: r[1], branch: r[2], questions: [] }; });
    var qRows = run('SELECT test_id, question, options_json, correct_index, question_order FROM test_questions ORDER BY test_id, question_order');
    qRows.forEach(function (q) {
      var t = tests.find(function (x) { return x.id === q[0]; });
      if (t) t.questions.push({ question: q[1], options: JSON.parse(q[2] || '[]'), correct: q[3] });
    });
    return tests;
  };

  function getUserId() { var u = getCurrentUser(); return u ? u.id : null; }

  window.webdevDbGetStats = function () {
    var uid = getUserId();
    if (!uid || !db) return { passedTests: 0, totalScore: 0, completedLessonsCount: 0 };
    var results = run('SELECT score, passed, max_score FROM user_test_results WHERE user_id = ?', [uid]);
    var lessonsCount = runOne('SELECT COUNT(*) FROM user_completed_lessons WHERE user_id = ?', [uid]);
    var passed = results.filter(function (r) { return r[1]; }).length;
    var total = results.reduce(function (s, r) { return s + r[0]; }, 0);
    return { passedTests: passed, totalScore: total, completedLessonsCount: lessonsCount ? lessonsCount[0] : 0 };
  };

  window.webdevDbGetCompletedLessons = function () {
    var uid = getUserId();
    if (!uid || !db) return [];
    var rows = run('SELECT lesson_id, completed_at FROM user_completed_lessons WHERE user_id = ?', [uid]);
    return rows.map(function (r) { return { lessonId: r[0], date: r[1] }; });
  };

  window.webdevDbCompleteLesson = function (lessonId) {
    var uid = getUserId();
    if (!uid || !db) return null;
    runExecParam("INSERT OR REPLACE INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES (?, ?, datetime('now'))", [uid, lessonId]);
    return { lessonId: lessonId, date: new Date().toISOString() };
  };

  window.webdevDbGetTestResults = function () {
    var uid = getUserId();
    if (!uid || !db) return [];
    var rows = run('SELECT test_id, score, passed, max_score, completed_at FROM user_test_results WHERE user_id = ?', [uid]);
    return rows.map(function (r) { return { testId: r[0], score: r[1], passed: !!r[2], maxScore: r[3], date: r[4] }; });
  };

  window.webdevDbSaveTestResult = function (testId, score, passed, maxScore) {
    var uid = getUserId();
    if (!uid || !db) return null;
    var max = maxScore != null ? maxScore : score;
    runExecParam("INSERT INTO user_test_results (user_id, test_id, score, passed, max_score) VALUES (?, ?, ?, ?, ?)", [uid, testId, score, passed ? 1 : 0, max]);
    return { testId: testId, score: score, passed: passed, maxScore: max, date: new Date().toISOString() };
  };

  /** Регистрация: добавить пользователя (роль user). */
  window.webdevDbRegister = function (login, password) {
    if (!db) return null;
    var existing = runOne('SELECT id FROM users WHERE login = ?', [login]);
    if (existing) return null;
    runExecParam('INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)', [login, password, 'user']);
    var row = runOne('SELECT id, login, role FROM users WHERE login = ?', [login]);
    if (row) {
      var user = { id: row[0], login: row[1], role: row[2] };
      setCurrentUser(user);
      return user;
    }
    return null;
  };

  /** Админ: создать урок */
  window.webdevDbCreateLesson = function (data) {
    if (!db) return false;
    var id = (data.id || '').replace(/'/g, "''");
    var title = (data.title || '').replace(/'/g, "''");
    var desc = (data.description || '').replace(/'/g, "''");
    var branch = (data.branch || 'html').replace(/'/g, "''");
    var testId = (data.testId || '') ? ("'" + String(data.testId).replace(/'/g, "''") + "'") : 'NULL';
    var template = data.template ? 1 : 0;
    var html = (data.html || '').replace(/'/g, "''");
    var css = (data.css || '').replace(/'/g, "''");
    var js = (data.js || '').replace(/'/g, "''");
    var checkJson = data.check ? "'" + JSON.stringify(data.check).replace(/'/g, "''") + "'" : 'NULL';
    runExec("INSERT INTO lessons (id, title, description, branch, test_id, template, html, css, js, check_json, sort_order) VALUES ('" + id + "', '" + title + "', '" + desc + "', '" + branch + "', " + testId + ", " + template + ", '" + html + "', '" + css + "', '" + js + "', " + checkJson + ", 0)");
    if (data.steps && data.steps.length) {
      data.steps.forEach(function (s, i) {
        var t = (s.title || '').replace(/'/g, "''");
        var task = (s.task || '').replace(/'/g, "''");
        var sh = (s.html || '').replace(/'/g, "''");
        var sc = (s.css || '').replace(/'/g, "''");
        var sj = (s.js || '').replace(/'/g, "''");
        var cj = s.check ? "'" + JSON.stringify(s.check).replace(/'/g, "''") + "'" : 'NULL';
        runExec("INSERT INTO lesson_steps (lesson_id, title, task, html, css, js, check_json, step_order) VALUES ('" + id + "', '" + t + "', '" + task + "', '" + sh + "', '" + sc + "', '" + sj + "', " + cj + ", " + i + ")");
      });
    }
    return true;
  };

  /** Админ: создать тест */
  window.webdevDbCreateTest = function (data) {
    if (!db) return false;
    var id = (data.id || '').replace(/'/g, "''");
    var title = (data.title || '').replace(/'/g, "''");
    var branch = (data.branch || 'html').replace(/'/g, "''");
    runExec("INSERT INTO tests (id, title, branch) VALUES ('" + id + "', '" + title + "', '" + branch + "')");
    if (data.questions && data.questions.length) {
      data.questions.forEach(function (q, i) {
        var qq = (q.question || '').replace(/'/g, "''");
        var opt = (JSON.stringify(q.options || [])).replace(/'/g, "''");
        var cor = parseInt(q.correct, 10) || 0;
        runExec("INSERT INTO test_questions (test_id, question, options_json, correct_index, question_order) VALUES ('" + id + "', '" + qq + "', '" + opt + "', " + cor + ", " + i + ")");
      });
    }
    return true;
  };

  window.webdevDbReady = function () { return !!db; };
})();
