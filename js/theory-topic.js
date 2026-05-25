/**
 * Полноценная страница одного урока теории: контент по id из URL (с API или статики), в конце — призыв в интерактивный урок и тест
 */
(function () {
  const article = document.getElementById('theory-article');
  const ctaBlock = document.getElementById('theory-topic-cta');
  const ctaLesson = document.getElementById('theory-cta-lesson');
  const ctaTest = document.getElementById('theory-cta-link');
  const nextWrap = document.getElementById('theory-topic-next-wrap');
  const nextLink = document.getElementById('theory-topic-next');

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  const params = new URLSearchParams(window.location.search);
  const id = params.get('id') || '';

  function theoryReturnPath(topicId) {
    return 'theory-topic.html?id=' + encodeURIComponent(topicId);
  }

  function appendReturn(relHref) {
    if (!id || !relHref) return relHref;
    var sep = relHref.indexOf('?') === -1 ? '?' : '&';
    return relHref + sep + 'return=' + encodeURIComponent(theoryReturnPath(id));
  }

  function findNextTopicId(currentId) {
    var list = typeof THEORY_TOPICS !== 'undefined' && Array.isArray(THEORY_TOPICS) ? THEORY_TOPICS : [];
    var idx = list.findIndex(function (t) { return t.id === currentId; });
    if (idx < 0 || idx >= list.length - 1) return null;
    return list[idx + 1].id;
  }

  function render(topic) {
    if (!topic) {
      if (article) article.innerHTML = '<h1>Тема не найдена</h1><p><a href="theory.html">Вернуться к списку</a></p>';
      if (ctaBlock) ctaBlock.style.display = 'none';
      if (nextWrap) nextWrap.style.display = 'none';
      document.title = 'Тема не найдена — Веб-разработка';
      return;
    }
    document.title = topic.title + ' — Теория';
    if (article) {
      article.innerHTML = '<header class="theory-article-header">' +
        '<span class="theory-card-cat">' + (topic.category === 'html' ? 'HTML' : topic.category === 'css' ? 'CSS' : 'JS') + '</span>' +
        '<h1 class="theory-article-title">' + esc(topic.title) + '</h1></header>' +
        '<div class="theory-article-body">' + (topic.content || '').trim() + '</div>';
    }
    var hasCta = false;
    if (topic.lessonId && ctaLesson) {
      var lessonHref = 'lessons.html?open=' + encodeURIComponent(topic.lessonId);
      ctaLesson.href = appendReturn(lessonHref);
      ctaLesson.style.display = 'inline-flex';
      hasCta = true;
    }
    if (topic.testId && ctaTest) {
      var testHref = 'test.html?id=' + encodeURIComponent(topic.testId);
      ctaTest.href = appendReturn(testHref);
      ctaTest.style.display = 'inline-flex';
      hasCta = true;
    }
    if (ctaBlock) ctaBlock.style.display = hasCta ? 'block' : 'none';

    var nextId = findNextTopicId(topic.id);
    if (nextId && nextLink && nextWrap) {
      nextLink.href = 'theory-topic.html?id=' + encodeURIComponent(nextId);
      nextWrap.style.display = 'block';
    } else if (nextWrap) {
      nextWrap.style.display = 'none';
    }
  }

  if (window.webdevApi && typeof window.webdevApi.getTheoryTopic === 'function' && id) {
    window.webdevApi.getTheoryTopic(id)
      .then(function (topic) { render(topic); })
      .catch(function () {
        const topic = typeof THEORY_TOPICS !== 'undefined' ? THEORY_TOPICS.find(t => t.id === id) : null;
        render(topic);
      });
  } else {
    const topic = typeof THEORY_TOPICS !== 'undefined' ? THEORY_TOPICS.find(t => t.id === id) : null;
    render(topic);
  }
})();
