/**
 * Хранилище: локальная SQLite (diplom.db через sql.js) или заглушка.
 * Инициализация БД запускается при загрузке (webdevDbInitPromise). Прогресс привязан к текущему пользователю (sessionStorage).
 */
(function () {
  var initPromise = null;
  function getInit() {
    if (typeof window.webdevDbInitPromise !== 'undefined') return window.webdevDbInitPromise;
    if (initPromise) return initPromise;
    initPromise = typeof window.initWebdevDb === 'function' ? window.initWebdevDb() : Promise.resolve(false);
    return initPromise;
  }
  function useLocal() {
    if (window.webdevApi && typeof window.webdevApi.getMe === 'function') return false;
    return typeof window.webdevDbReady === 'function' && window.webdevDbReady();
  }

  async function getStats() {
    await getInit();
    if (useLocal()) return window.webdevDbGetStats();
    if (window.webdevApi && typeof window.webdevApi.getStats === 'function') {
      try {
        return await window.webdevApi.getStats();
      } catch (e) { return { passedTests: 0, totalScore: 0, completedLessonsCount: 0 }; }
    }
    return { passedTests: 0, totalScore: 0, completedLessonsCount: 0 };
  }

  async function getTestResult(testId) {
    await getInit();
    if (useLocal()) {
      var list = window.webdevDbGetTestResults();
      var r = list.find(function (x) { return x.testId === testId; });
      return r || null;
    }
    if (window.webdevApi && typeof window.webdevApi.getTestResults === 'function') {
      try {
        var list = await window.webdevApi.getTestResults();
        var r = list.find(function (x) { return x.testId === testId; });
        return r || null;
      } catch (e) { return null; }
    }
    return null;
  }

  async function getAllTestResults() {
    await getInit();
    if (useLocal()) return window.webdevDbGetTestResults();
    if (window.webdevApi && typeof window.webdevApi.getTestResults === 'function') {
      try { return await window.webdevApi.getTestResults(); } catch (e) { return []; }
    }
    return [];
  }

  async function getCompletedLessons() {
    await getInit();
    if (useLocal()) return window.webdevDbGetCompletedLessons();
    if (window.webdevApi && typeof window.webdevApi.getCompletedLessons === 'function') {
      try { return await window.webdevApi.getCompletedLessons(); } catch (e) { return []; }
    }
    return [];
  }

  async function completeLesson(lessonId) {
    await getInit();
    if (useLocal()) return window.webdevDbCompleteLesson(lessonId);
    if (window.webdevApi && typeof window.webdevApi.completeLesson === 'function') {
      try { await window.webdevApi.completeLesson(lessonId); return {}; } catch (e) { return null; }
    }
    return null;
  }

  async function saveTestResult(testId, score, passed, maxScore) {
    await getInit();
    if (useLocal()) return window.webdevDbSaveTestResult(testId, score, passed, maxScore);
    if (window.webdevApi && typeof window.webdevApi.saveTestResult === 'function') {
      try { await window.webdevApi.saveTestResult(testId, score, passed, maxScore); return {}; } catch (e) { return null; }
    }
    return null;
  }

  async function isLessonCompleted(lessonId) {
    var completed = await getCompletedLessons();
    return completed.some(function (c) { return c.lessonId === lessonId; });
  }

  window.getStats = getStats;
  window.getTestResult = getTestResult;
  window.getAllTestResults = getAllTestResults;
  window.getCompletedLessons = getCompletedLessons;
  window.completeLesson = completeLesson;
  window.saveTestResult = saveTestResult;
  window.isLessonCompleted = isLessonCompleted;
})();
