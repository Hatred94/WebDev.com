/**
 * Интерактивные уроки: HTML / JS.
 * Поля html, css, js — фрагменты: содержимое <main class="lesson-site-main">, доп. CSS в <head>,
 * код в <script> в конце документа. Редактор собирает полный HTML-шаблон в lessons.js (без готового решения).
 * check — правила: { selector, textContains?, count?, minCount?, sourceContains?, bodyClassAnyOf? }.
 */
const LESSONS_DATA = [
  {
    id: '1',
    title: 'Урок 1: Первая HTML-страница',
    description:
      '<p>В редакторе уже открыт пустой шаблон страницы. Добавляйте разметку в <code>&lt;main&gt;</code>, при необходимости — стили в <code>&lt;style&gt;</code>. Нажимайте «Запустить», затем «Проверить».</p>',
    branch: 'html',
    testId: 'html-intro',
    template: true,
    steps: [
      {
        title: 'Шаг 1: Заголовок',
        task:
          'Внутри <code>&lt;main class="lesson-site-main"&gt;</code> добавьте заголовок <code>&lt;h1&gt;</code> с текстом «Привет, мир!».',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main h1', textContains: 'Привет' }]
      },
      {
        title: 'Шаг 2: Параграф',
        task:
          'Снова соберите в <code>main</code>: один <code>&lt;h1&gt;</code> «Привет, мир!» и под ним параграф <code>&lt;p&gt;</code> с текстом «Это моя первая веб-страница.»',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main h1', textContains: 'Привет' },
          { selector: '.lesson-site-main p', textContains: 'первая' }
        ]
      },
      {
        title: 'Шаг 3: Свой вариант',
        task:
          'В <code>main</code> оставьте ровно один <code>&lt;h1&gt;</code> и один <code>&lt;p&gt;</code> с любыми своими текстами.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main h1', count: 1 }, { selector: '.lesson-site-main p', count: 1 }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '2',
    title: 'Урок 2: Ссылки и список',
    description: '<p>Шаблон страницы пустой — создайте заголовок, список и ссылки по заданию каждого шага.</p>',
    branch: 'html',
    testId: 'html-tags',
    template: true,
    steps: [
      {
        title: 'Шаг 1: Заголовок',
        task: 'В <code>main</code> добавьте <code>&lt;h1&gt;</code> с текстом «Полезные ссылки».',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main h1', textContains: 'Полезные' }]
      },
      {
        title: 'Шаг 2: Список',
        task: 'Добавьте <code>&lt;ul&gt;</code> с двумя <code>&lt;li&gt;</code> (текст пунктов любой).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main ul li', minCount: 2 }]
      },
      {
        title: 'Шаг 3: Ссылки',
        task: 'В каждом <code>&lt;li&gt;</code> — ссылка <code>&lt;a href="..."&gt;</code>. Нужно минимум две ссылки с разными <code>href</code>.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main a[href]', minCount: 2 }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '3',
    title: 'Урок 3: Стили CSS',
    description:
      '<p>В <code>&lt;head&gt;</code> уже есть блок <code>&lt;style&gt;</code> с базовыми стилями. Допишите в него свои правила для элементов в <code>main</code>.</p>',
    branch: 'html',
    testId: 'css-intro',
    steps: [
      {
        title: 'Шаг 1: Заголовок и параграф',
        task:
          'В <code>main</code> добавьте <code>&lt;h1&gt;</code> «Заголовок» и <code>&lt;p&gt;</code> «Параграф.» (или похожий текст).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main h1' }, { selector: '.lesson-site-main p' }]
      },
      {
        title: 'Шаг 2: Цвет заголовка',
        task:
          'В существующем <code>&lt;style&gt;</code> добавьте правило для <code>h1</code> с цветом <code>#6c5ce7</code> (например <code>h1 { color: #6c5ce7; }</code>).',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main h1' },
          { sourceContains: 'h1' },
          { sourceContains: 'color' },
          { sourceContains: '6c5ce7' }
        ]
      },
      {
        title: 'Шаг 3: Стили параграфа',
        task: 'Добавьте для <code>p</code> правила с <code>color</code> и <code>line-height</code> (оба свойства должны быть в CSS).',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main p' },
          { sourceContains: 'line-height' },
          { sourceContains: 'p' }
        ]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '4',
    title: 'Урок 4: Flexbox',
    description: '<p>Создайте разметку и стили с нуля в шаблоне страницы.</p>',
    branch: 'html',
    testId: 'css-layout',
    steps: [
      {
        title: 'Шаг 1: Контейнер и боксы',
        task:
          'В <code>main</code> создайте <code>&lt;div class="container"&gt;</code> с тремя <code>&lt;div class="box"&gt;</code> с текстами 1, 2, 3. В <code>style</code> задайте размеры и фон для <code>.box</code>.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main .container .box', minCount: 3 }]
      },
      {
        title: 'Шаг 2: Flex и центр',
        task:
          'Для <code>.container</code> задайте <code>display: flex</code>, <code>justify-content: center</code>, <code>align-items: center</code> и <code>gap: 1rem</code> (можно в одном правиле).',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main .container' },
          { sourceContains: 'flex' },
          { sourceContains: 'justify-content' }
        ]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '5',
    title: 'Урок 5: Семантическая разметка',
    description:
      '<p>В <code>main</code> добавьте семантическую структуру: блок с заголовком страницы и секцию с текстом (например <code>&lt;header&gt;</code> и <code>&lt;section&gt;</code> с <code>&lt;h1&gt;</code> и <code>&lt;p&gt;</code>).</p>',
    branch: 'html',
    testId: 'html-semantics',
    template: true,
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '.lesson-site-main section', minCount: 1 },
      { selector: '.lesson-site-main h1', minCount: 1 },
      { selector: '.lesson-site-main p', minCount: 1 }
    ]
  },
  {
    id: '6',
    title: 'Урок 6: Кнопка и текст (JS)',
    description:
      '<p>В <code>main</code> разметьте элементы, в <code>&lt;script&gt;</code> — логику: при загрузке задайте текст параграфу, по клику на кнопку меняйте текст.</p>',
    branch: 'js',
    testId: 'js-intro',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '#greeting' },
      { selector: '#btn' },
      { sourceContains: 'getElementById' },
      { sourceContains: 'addEventListener' }
    ]
  },
  {
    id: '7',
    title: 'Урок 7: Счётчик (JS)',
    description: '<p>Счётчик: кнопки «+» и «−», число между ними. Реализуйте в разметке и скрипте.</p>',
    branch: 'js',
    testId: 'js-intro',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '#count' },
      { selector: '#plus' },
      { selector: '#minus' },
      { sourceContains: 'getElementById' }
    ]
  },
  {
    id: '8',
    title: 'Урок 8: Список из массива (JS)',
    description:
      '<p>В <code>main</code> оставьте контейнер (например <code>&lt;div id="list-container"&gt;&lt;/div&gt;</code>). В скрипте создайте <code>&lt;ul&gt;</code> и пункты из массива строк.</p>',
    branch: 'js',
    testId: 'js-intro',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '#list-container' },
      { selector: '#list-container ul li', minCount: 2 },
      { sourceContains: 'createElement' }
    ]
  },
  {
    id: '9',
    title: 'Урок 9: Форма и вывод (JS)',
    description: '<p>Поле ввода, кнопка и вывод результата — разметка в <code>main</code>, чтение значения и вывод в <code>&lt;script&gt;</code>.</p>',
    branch: 'js',
    testId: 'js-intro',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '.lesson-site-main input' },
      { selector: '#show' },
      { selector: '#output' },
      { sourceContains: 'addEventListener' }
    ]
  },
  {
    id: '10',
    title: 'Урок 10: Переключатель темы (JS)',
    description:
      '<p>Кнопка переключения темы: по клику переключайте классы у <code>document.body</code> (например <code>dark</code> и <code>light</code>) и стили для них в <code>&lt;style&gt;</code>.</p>',
    branch: 'js',
    testId: 'css-variables',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '#theme-btn' },
      { bodyClassAnyOf: ['dark', 'light'] },
      { sourceContains: 'classList' },
      { sourceContains: 'toggle' }
    ]
  },
  {
    id: '11',
    title: 'Урок 11: Семантическая разметка',
    description:
      '<p>Внутри <code>main</code> (не путайте с шапкой «Учебный проект» сверху) добавьте свою шапку блока и секцию с контентом.</p>',
    branch: 'html',
    testId: 'html-semantics',
    template: true,
    steps: [
      {
        title: 'Шаг 1: шапка блока',
        task:
          'В <code>&lt;main class="lesson-site-main"&gt;</code> добавьте <code>&lt;header&gt;</code> с текстом «Сайт» (это шапка вашей учебной страницы внутри main).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main > header', textContains: 'Сайт' }]
      },
      {
        title: 'Шаг 2: секция',
        task:
          'Ниже этого <code>header</code> добавьте <code>&lt;section&gt;</code> с <code>&lt;h1&gt;</code> и <code>&lt;p&gt;</code>.',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main section' },
          { selector: '.lesson-site-main h1' },
          { selector: '.lesson-site-main p' }
        ]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '12',
    title: 'Урок 12: Форма в HTML',
    description: '<p>Соберите форму в <code>main</code>: поле имени и отправка.</p>',
    branch: 'html',
    testId: 'html-forms',
    steps: [
      {
        title: 'Шаг 1: form и input',
        task:
          'Создайте <code>&lt;form&gt;</code> с <code>&lt;input type="text" name="name"&gt;</code> и кнопкой <code>&lt;button type="submit"&gt;</code>.',
        html: '',
        css: '',
        js: '',
        check: [
          { selector: '.lesson-site-main form' },
          { selector: '.lesson-site-main input[name="name"]' },
          { selector: '.lesson-site-main button[type="submit"]' }
        ]
      },
      {
        title: 'Шаг 2: label',
        task: 'Добавьте <code>&lt;label for="..."&gt;</code> и атрибут <code>id</code> у поля ввода (связь label ↔ input).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main label[for]' }, { selector: '.lesson-site-main input[id]' }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '13',
    title: 'Урок 13: Медиа — изображение и подпись',
    description: '<p>Изображение с <code>alt</code>, затем обёртка <code>figure</code> / <code>figcaption</code>.</p>',
    branch: 'html',
    testId: 'html-media',
    steps: [
      {
        title: 'Шаг 1: img с alt',
        task:
          'В <code>main</code> добавьте <code>&lt;img src="https://via.placeholder.com/200" alt="Пример изображения"&gt;</code> (или другой корректный <code>src</code>, но обязателен осмысленный <code>alt</code>).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main img[alt]' }]
      },
      {
        title: 'Шаг 2: figure и figcaption',
        task: 'Оберните изображение в <code>&lt;figure&gt;</code> и добавьте <code>&lt;figcaption&gt;</code> с подписью.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main figure' }, { selector: '.lesson-site-main figcaption' }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '14',
    title: 'Урок 14: Блочная модель и box-sizing',
    description: '<p>Блок <code>.box</code> в <code>main</code>, стили в <code>&lt;style&gt;</code>.</p>',
    branch: 'html',
    testId: 'css-box-model',
    steps: [
      {
        title: 'Шаг 1: padding и border',
        task:
          'В <code>main</code> — <code>&lt;div class="box"&gt;</code>. В CSS: <code>width</code>, <code>padding</code>, <code>border</code> (например <code>2px solid #6c5ce7</code>).',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main .box' }, { sourceContains: 'padding' }, { sourceContains: 'border' }]
      },
      {
        title: 'Шаг 2: box-sizing',
        task: 'Добавьте для <code>.box</code> свойство <code>box-sizing: border-box</code>.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main .box' }, { sourceContains: 'box-sizing' }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '15',
    title: 'Урок 15: Медиа-запрос',
    description: '<p>Заголовок и параграф в <code>main</code>, в <code>style</code> — базовые стили и <code>@media (max-width: 768px)</code> для <code>h1</code>.</p>',
    branch: 'html',
    testId: 'css-responsive',
    steps: [
      {
        title: 'Шаг 1: базовые стили',
        task: 'В <code>main</code> — <code>h1</code> и <code>p</code>. В CSS — шрифт и цвета для страницы.',
        html: '',
        css: '',
        js: '',
        check: [{ selector: '.lesson-site-main h1' }, { selector: '.lesson-site-main p' }]
      },
      {
        title: 'Шаг 2: медиа-запрос',
        task: 'Добавьте <code>@media (max-width: 768px)</code> с правилом для <code>h1</code> (например <code>font-size</code>).',
        html: '',
        css: '',
        js: '',
        check: [{ sourceContains: '@media' }, { sourceContains: '768' }]
      }
    ],
    html: '',
    css: '',
    js: ''
  },
  {
    id: '16',
    title: 'Урок 16: Таймер setTimeout',
    description: '<p>Кнопка и абзац в <code>main</code>; по клику через 1 с выведите текст через <code>setTimeout</code>.</p>',
    branch: 'js',
    testId: 'js-async-basics',
    html: '',
    css: '',
    js: '',
    check: [
      { selector: '#delayed' },
      { selector: '#out' },
      { sourceContains: 'setTimeout' },
      { sourceContains: 'addEventListener' }
    ]
  }
];
if (typeof module !== 'undefined' && module.exports) module.exports = LESSONS_DATA;
