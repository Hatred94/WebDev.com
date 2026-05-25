/**
 * Теория по темам: HTML и вёрстка (html, css) / Frontend на JavaScript (js).
 * testId — призыв пройти тест в конце темы. lessonId — интерактивный урок с кодом (lessons.html#id).
 */
const THEORY_TOPICS = [
  // ========== HTML ==========
  {
    id: 'html-intro',
    category: 'html',
    title: 'Введение в HTML',
    shortDesc: 'Что такое разметка и зачем нужны теги.',
    testId: 'html-intro',
    lessonId: '1',
    content: `
      <p>HTML (HyperText Markup Language) — это язык разметки, на котором строится любая веб-страница. Браузер не «рисует» страницу сам: он читает HTML-документ и по тегам понимает, где заголовок, где абзац, где список или ссылка.</p>
      <h2>Зачем нужна разметка</h2>
      <p>Теги задают <strong>структуру</strong> и <strong>смысл</strong> контента. Один и тот же текст с разной разметкой может быть заголовком, цитатой или обычным абзацем. Это важно и для отображения, и для поисковиков, и для доступности (скринридеры ориентируются на теги).</p>
      <h2>Минимальная страница</h2>
      <p>Любой HTML-документ начинается с <code>&lt;!DOCTYPE html&gt;</code> — так браузер понимает, что это современный HTML5. Дальше идут корневой тег <code>&lt;html&gt;</code>, внутри него — <code>&lt;head&gt;</code> (служебная информация) и <code>&lt;body&gt;</code> (то, что видит пользователь).</p>
      <p>В <code>&lt;head&gt;</code> обязательно указывают <code>&lt;meta charset="UTF-8"&gt;</code>, чтобы кириллица и другие символы отображались корректно. Туда же обычно помещают <code>&lt;title&gt;</code> — заголовок вкладки, а также подключение стилей и скриптов.</p>
      <h2>Полезные ссылки</h2>
      <p><a href="https://developer.mozilla.org/ru/docs/Web/HTML" target="_blank" rel="noopener">MDN: HTML</a> — полный справочник по языку.</p>
    `
  },
  {
    id: 'html-tags',
    category: 'html',
    title: 'Основные теги',
    shortDesc: 'Заголовки, параграфы, списки, ссылки.',
    testId: 'html-tags',
    lessonId: '2',
    content: `
      <p>На практике вы будете часто использовать несколько групп тегов: заголовки, текст, списки, ссылки и изображения.</p>
      <h2>Заголовки (h1–h6)</h2>
      <p>Теги <code>&lt;h1&gt;</code> … <code>&lt;h6&gt;</code> задают уровни заголовков. На странице обычно один <code>&lt;h1&gt;</code> (главный заголовок), остальные — подзаголовки по смыслу. Не пропускайте уровни (после h2 не стоит сразу h4).</p>
      <h2>Параграфы и текст</h2>
      <p>Текст оборачивают в <code>&lt;p&gt;</code>. Для переноса строки внутри параграфа используют <code>&lt;br&gt;</code>. Важный фрагмент — <code>&lt;strong&gt;</code>, курсив — <code>&lt;em&gt;</code>. Для цитаты — <code>&lt;blockquote&gt;</code> и <code>&lt;cite&gt;</code>.</p>
      <h2>Списки</h2>
      <p>Маркированный список: <code>&lt;ul&gt;</code> и внутри каждый пункт — <code>&lt;li&gt;</code>. Нумерованный список: <code>&lt;ol&gt;</code> и <code>&lt;li&gt;</code>. Список определений: <code>&lt;dl&gt;</code>, <code>&lt;dt&gt;</code> (термин), <code>&lt;dd&gt;</code> (описание).</p>
      <h2>Ссылки и картинки</h2>
      <p>Ссылка: <code>&lt;a href="URL"&gt;текст ссылки&lt;/a&gt;</code>. Атрибут <code>target="_blank"</code> открывает в новой вкладке; <code>rel="noopener"</code> — для безопасности. Картинка: <code>&lt;img src="путь" alt="описание"&gt;</code>. Атрибут <code>alt</code> обязателен — это подпись для доступности и на случай, если изображение не загрузится.</p>
      <p><a href="https://developer.mozilla.org/ru/docs/Web/HTML/Element" target="_blank" rel="noopener">MDN: Элементы HTML</a></p>
    `
  },
  {
    id: 'html-semantics',
    category: 'html',
    title: 'Семантическая разметка',
    shortDesc: 'header, main, article, section, nav, footer.',
    testId: 'html-semantics',
    lessonId: '11',
    content: `
      <p>Семантические теги не меняют вид страницы сами по себе, но сообщают браузеру и поисковикам <strong>смысл</strong> блока: это шапка, навигация, основное содержание или подвал.</p>
      <h2>Основные теги</h2>
      <p><code>&lt;header&gt;</code> — шапка страницы или секции. <code>&lt;nav&gt;</code> — навигация (меню, оглавление). <code>&lt;main&gt;</code> — основное содержимое страницы (одна на страницу). <code>&lt;article&gt;</code> — самостоятельный контент (статья, пост). <code>&lt;section&gt;</code> — тематическая секция. <code>&lt;aside&gt;</code> — боковая колонка, доп. информация. <code>&lt;footer&gt;</code> — подвал страницы или блока.</p>
      <h2>Зачем это нужно</h2>
      <p>Поисковики лучше индексируют страницу. Скринридеры дают пользователю перейти к main или nav. Удобнее стилизовать и верстать: не нужно плодить <code>class="header"</code> — есть готовый смысл.</p>
    `
  },
  {
    id: 'html-forms',
    category: 'html',
    title: 'Формы в HTML',
    shortDesc: 'form, input, label, button, textarea, select.',
    testId: 'html-forms',
    lessonId: '12',
    content: `
      <p>Формы собирают данные от пользователя: текст, выбор варианта, чекбоксы, файлы. Всё это размечается в HTML, а обрабатывается уже на сервере или в JavaScript.</p>
      <h2>Структура формы</h2>
      <p><code>&lt;form action="URL" method="get|post"&gt;...&lt;/form&gt;</code>. Внутри — поля и кнопка отправки. Каждое поле лучше связывать с подписью через <code>&lt;label for="id-поля"&gt;</code>.</p>
      <h2>Типы полей input</h2>
      <p><code>type="text"</code> — строка, <code>type="email"</code>, <code>type="password"</code>, <code>type="number"</code>, <code>type="checkbox"</code>, <code>type="radio"</code> (одинаковый <code>name</code> для группы). <code>type="submit"</code> — кнопка отправки. Атрибуты <code>required</code>, <code>placeholder</code>, <code>min</code>/<code>max</code> задают проверки и подсказки.</p>
      <h2>textarea и select</h2>
      <p><code>&lt;textarea&gt;</code> — многострочный ввод. <code>&lt;select&gt;</code> с <code>&lt;option&gt;</code> — выпадающий список. Для отправки у каждого поля должен быть атрибут <code>name</code>.</p>
    `
  },
  {
    id: 'html-media',
    category: 'html',
    title: 'Медиа: изображения и видео',
    shortDesc: 'img, picture, video, audio, figure.',
    testId: 'html-media',
    lessonId: '13',
    content: `
      <p>Кроме обычной картинки <code>&lt;img&gt;</code> в HTML5 есть теги для адаптивных изображений, видео и аудио.</p>
      <h2>Адаптивные изображения</h2>
      <p><code>&lt;picture&gt;</code> позволяет подставлять разные файлы в зависимости от размера экрана или формата: внутри <code>&lt;source media="(min-width: 800px)" srcset="big.jpg"&gt;</code> и <code>&lt;img src="default.jpg" alt="..."&gt;</code> как fallback. Атрибут <code>srcset</code> у <code>img</code> задаёт несколько вариантов с разным разрешением.</p>
      <h2>Видео и аудио</h2>
      <p><code>&lt;video src="film.mp4" controls&gt;&lt;/video&gt;</code> — воспроизведение видео. <code>controls</code> показывает стандартные кнопки. Для нескольких форматов используйте <code>&lt;source&gt;</code> внутри. Аналогично <code>&lt;audio&gt;</code> для звука.</p>
      <p><code>&lt;figure&gt;</code> и <code>&lt;figcaption&gt;</code> — обёртка для иллюстрации или медиа с подписью.</p>
    `
  },
  // ========== CSS ==========
  {
    id: 'css-intro',
    category: 'css',
    title: 'Введение в CSS',
    shortDesc: 'Подключение стилей и селекторы.',
    testId: 'css-intro',
    lessonId: '3',
    content: `
      <p>CSS (Cascading Style Sheets) отвечает за внешний вид страницы: цвета, шрифты, отступы, расположение блоков. HTML описывает структуру, CSS — как она выглядит.</p>
      <h2>Как подключить стили</h2>
      <p>Обычно стили выносят в отдельный файл и подключают в <code>&lt;head&gt;</code>: <code>&lt;link rel="stylesheet" href="style.css"&gt;</code>. Можно писать стили и прямо в HTML в теге <code>&lt;style&gt;</code>. Порядок подключения важен: позже подключённые правила перекрывают предыдущие при одинаковой специфичности.</p>
      <h2>Селекторы</h2>
      <p>По имени тега: <code>p { ... }</code>. По классу: <code>.имя-класса { ... }</code> (в HTML: <code>class="имя-класса"</code>). По id: <code>#имя-id { ... }</code> (в HTML: <code>id="имя-id"</code>). Классов у элемента может быть несколько, id на странице должен быть один. Комбинаторы: пробел (потомок), <code>&gt;</code> (прямой потомок), <code>+</code> (соседний).</p>
      <h2>Частые свойства</h2>
      <p><code>color</code> — цвет текста, <code>font-size</code>, <code>font-family</code> — шрифт, <code>margin</code> — внешние отступы, <code>padding</code> — внутренние, <code>background</code> — фон, <code>border</code> — граница. Единицы: <code>px</code>, <code>em</code>, <code>rem</code>, <code>%</code>, <code>vw</code>/<code>vh</code>.</p>
      <p><a href="https://developer.mozilla.org/ru/docs/Web/CSS" target="_blank" rel="noopener">MDN: CSS</a></p>
    `
  },
  {
    id: 'css-box-model',
    category: 'css',
    title: 'Блочная модель и отступы',
    shortDesc: 'margin, padding, border, box-sizing.',
    testId: 'css-box-model',
    lessonId: '14',
    content: `
      <p>Каждый элемент в CSS представляется прямоугольным боксом. Изнутри наружу: содержимое → padding → border → margin.</p>
      <h2>padding и margin</h2>
      <p><code>padding</code> — отступ внутри элемента от границы до контента. <code>margin</code> — отступ снаружи, между элементами. Можно задавать по сторонам: <code>margin-top</code>, <code>margin: 10px 20px</code> (верх-низ, лево-право), <code>margin: 10px 20px 10px 20px</code> (по часовой).</p>
      <h2>box-sizing</h2>
      <p>По умолчанию <code>width</code> и <code>height</code> задают только размер контента; padding и border добавляются сверху. <code>box-sizing: border-box</code> включает padding и border в указанную ширину/высоту — так проще верстать. Часто задают глобально: <code>* { box-sizing: border-box; }</code>.</p>
    `
  },
  {
    id: 'css-layout',
    category: 'css',
    title: 'Flexbox и Grid',
    shortDesc: 'Современная раскладка.',
    testId: 'css-layout',
    lessonId: '4',
    content: `
      <p>Раньше верстали блоками и float. Сейчас для раскладки используют в основном Flexbox и Grid — они предсказуемо выравнивают элементы по горизонтали и вертикали.</p>
      <h2>Flexbox</h2>
      <p>У контейнера задаёте <code>display: flex</code>. Элементы внутри выстраиваются в ряд (или колонку — <code>flex-direction: column</code>). <code>justify-content</code> выравнивает по главной оси (например, center, space-between), <code>align-items</code> — по поперечной. <code>gap</code> задаёт расстояние между элементами. У дочерних: <code>flex-grow</code>, <code>flex-shrink</code>, <code>flex-basis</code> или кратко <code>flex: 1</code>.</p>
      <h2>Grid</h2>
      <p><code>display: grid</code> превращает контейнер в сетку. <code>grid-template-columns: 1fr 1fr 1fr</code> — три равные колонки, <code>grid-template-rows</code> — строки. <code>gap</code> — зазоры. Элементы автоматически попадают в ячейки; при необходимости их размещают по номерам линий или именованным областям (<code>grid-area</code>).</p>
      <h2>Когда что использовать</h2>
      <p>Flexbox удобен для одномерных раскладок (строка или столбец). Grid — для двумерных. Часто их комбинируют: Grid для страницы, Flex для блоков внутри.</p>
      <p><a href="https://css-tricks.com/snippets/css/a-guide-to-flexbox/" target="_blank" rel="noopener">Flexbox</a> · <a href="https://css-tricks.com/snippets/css/complete-guide-grid/" target="_blank" rel="noopener">Grid</a></p>
    `
  },
  {
    id: 'css-responsive',
    category: 'css',
    title: 'Адаптивная вёрстка',
    shortDesc: 'media queries, единицы, mobile-first.',
    testId: 'css-responsive',
    lessonId: '15',
    content: `
      <p>Сайт должен корректно отображаться на телефонах, планшетах и десктопах. Для этого используют медиа-запросы и гибкие единицы.</p>
      <h2>Медиа-запросы</h2>
      <p><code>@media (max-width: 768px) { ... }</code> — стили применяются, когда ширина окна не больше 768px. Часто делают подход mobile-first: базовые стили для мобильных, затем <code>@media (min-width: 769px)</code> для планшетов и десктопов.</p>
      <h2>Единицы и гибкость</h2>
      <p><code>%</code>, <code>vw</code> (1% ширины окна), <code>vh</code> (высота), <code>rem</code> (от корневого шрифта) — помогают не привязываться к пикселям. <code>max-width: 100%</code> у картинок не даёт им вылезать за контейнер.</p>
    `
  },
  {
    id: 'css-variables',
    category: 'css',
    title: 'CSS-переменные и темы',
    shortDesc: 'Custom properties (--var), темы.',
    testId: 'css-variables',
    lessonId: '10',
    content: `
      <p>Переменные в CSS (custom properties) задаются в <code>:root</code> или любом селекторе и используются через <code>var(--имя)</code>. Удобно для цветов, отступов и переключения тем.</p>
      <h2>Объявление и использование</h2>
      <p><code>:root { --main-color: #6c5ce7; --spacing: 1rem; }</code>. В любом правиле: <code>color: var(--main-color);</code>, <code>padding: var(--spacing);</code>. Можно задать запас: <code>var(--main-color, #333)</code>.</p>
      <h2>Темы</h2>
      <p>На корень вешают класс или атрибут, например <code>data-theme="dark"</code>, и переопределяют переменные: <code>[data-theme="dark"] { --bg: #1a1a1a; --text: #eee; }</code>. Все элементы, использующие эти переменные, автоматически меняют вид.</p>
    `
  },
  // ========== JavaScript (Frontend) ==========
  {
    id: 'js-intro',
    category: 'js',
    title: 'Введение в JavaScript',
    shortDesc: 'Переменные, условия, функции.',
    testId: 'js-intro',
    lessonId: '6',
    content: `
      <p>JavaScript — язык программирования, который выполняется в браузере. С его помощью страница реагирует на действия пользователя: клики, ввод в форму, переключение вкладок. Также JS используется на сервере (Node.js) и в мобильных приложениях.</p>
      <h2>Переменные</h2>
      <p>Объявление: <code>let x = 5;</code> или <code>const name = 'Иван';</code>. <code>let</code> можно переприсвоить, <code>const</code> — константа (переприсвоить нельзя, но содержимое объекта или массива менять можно). Типы: число, строка, булев (true/false), null, undefined, объект, массив, функция.</p>
      <h2>Условия и циклы</h2>
      <p><code>if (условие) { ... }</code> и <code>else { ... }</code>. Тернарный оператор: <code>условие ? значение1 : значение2</code>. Циклы: <code>for (let i = 0; i &lt; 10; i++) { ... }</code>, <code>while (условие) { ... }</code>, <code>for (const item of array) { ... }</code>.</p>
      <h2>Функции</h2>
      <p>Обычная: <code>function sum(a, b) { return a + b; }</code>. Стрелочная: <code>const sum = (a, b) => a + b;</code>. Функции можно передавать в другие функции (например, в <code>addEventListener</code>).</p>
      <h2>Где писать код</h2>
      <p>В браузере JS подключают тегом <code>&lt;script src="script.js"&gt;&lt;/script&gt;</code> в конце <code>&lt;body&gt;</code> или внутри страницы в <code>&lt;script&gt;...&lt;/script&gt;</code>.</p>
      <p><a href="https://learn.javascript.ru/" target="_blank" rel="noopener">Learn JavaScript</a></p>
    `
  },
  {
    id: 'js-dom',
    category: 'js',
    title: 'DOM и события',
    shortDesc: 'Поиск элементов и клики.',
    testId: 'js-dom',
    lessonId: '7',
    content: `
      <p>DOM (Document Object Model) — это представление HTML-документа в виде дерева объектов. Через DOM мы находим элементы на странице, меняем их содержимое, стили и подписываемся на события.</p>
      <h2>Поиск элементов</h2>
      <p><code>document.getElementById('id')</code> — один элемент по id. <code>document.querySelector('.класс')</code> — первый подходящий по CSS-селектору. <code>document.querySelectorAll('селектор')</code> — все подходящие (NodeList, можно итерировать).</p>
      <h2>Содержимое и стили</h2>
      <p>Текст: <code>element.textContent = 'новый текст';</code> (без разметки). HTML: <code>element.innerHTML = '&lt;b&gt;жирно&lt;/b&gt;';</code> (осторожно с XSS). Классы: <code>element.classList.add('класс')</code>, <code>remove</code>, <code>toggle</code>. Стили: <code>element.style.color = 'red';</code>. Атрибуты: <code>getAttribute</code>, <code>setAttribute</code>.</p>
      <h2>События</h2>
      <p>Подписка: <code>element.addEventListener('click', function() { ... });</code>. Внутри функции <code>this</code> или <code>event.target</code> — элемент, на котором сработало событие. Другие события: <code>submit</code>, <code>input</code>, <code>keydown</code>, <code>change</code>. <code>event.preventDefault()</code> отменяет действие по умолчанию (например, отправку формы).</p>
      <p><a href="https://learn.javascript.ru/document" target="_blank" rel="noopener">Документ и DOM</a></p>
    `
  },
  {
    id: 'js-arrays-objects',
    category: 'js',
    title: 'Массивы и объекты',
    shortDesc: 'Методы массивов, работа с объектами.',
    testId: 'js-arrays-objects',
    lessonId: '8',
    content: `
      <p>Массивы и объекты — основные структуры данных в JS. Массив — упорядоченный список, объект — набор пар ключ–значение.</p>
      <h2>Массивы</h2>
      <p>Создание: <code>const arr = [1, 2, 3];</code>. Методы: <code>push</code>, <code>pop</code>, <code>shift</code>, <code>unshift</code>, <code>slice</code>, <code>splice</code>, <code>indexOf</code>, <code>includes</code>. Итерация: <code>forEach</code>, <code>map</code>, <code>filter</code>, <code>find</code>, <code>reduce</code>. <code>map</code> возвращает новый массив, <code>filter</code> отбирает элементы по условию.</p>
      <h2>Объекты</h2>
      <p><code>const obj = { name: 'Иван', age: 25 };</code>. Чтение: <code>obj.name</code> или <code>obj['name']</code>. Добавление и изменение: <code>obj.city = 'Москва';</code>. Перебор ключей: <code>Object.keys(obj)</code>, <code>for (const key in obj)</code>.</p>
    `
  },
  {
    id: 'js-forms-validation',
    category: 'js',
    title: 'Работа с формами в JS',
    shortDesc: 'Чтение полей, валидация, submit.',
    testId: 'js-forms-validation',
    lessonId: '9',
    content: `
      <p>JavaScript позволяет читать значения полей формы, проверять их перед отправкой и динамически менять интерфейс (показ ошибок, отключение кнопки).</p>
      <h2>Доступ к полям</h2>
      <p>По <code>name</code>: <code>form.elements.email.value</code>. По id или селектору: <code>document.getElementById('email').value</code>. Для checkbox и radio проверяют <code>.checked</code>. Select: <code>select.value</code> или <code>select.options[select.selectedIndex].text</code>.</p>
      <h2>Событие submit</h2>
      <p><code>form.addEventListener('submit', function(e) { e.preventDefault(); ... });</code> — отменяем отправку и обрабатываем данные сами. Собираем данные в объект или FormData: <code>const fd = new FormData(form); fd.get('email');</code>.</p>
      <h2>Валидация</h2>
      <p>Проверяем поля на пустоту, формат (email, число), длину. Показываем сообщения об ошибках рядом с полями. Встроенная HTML5-валидация (<code>required</code>, <code>pattern</code>) дополняется своей логикой в JS.</p>
    `
  },
  {
    id: 'js-async-basics',
    category: 'js',
    title: 'Асинхронность: таймеры и Promise',
    shortDesc: 'setTimeout, fetch, async/await основы.',
    testId: 'js-async-basics',
    lessonId: '16',
    content: `
      <p>Код в браузере выполняется в одном потоке. Долгие операции (запросы к серверу, таймеры) не блокируют интерфейс — мы подписываемся на результат через колбэки или Promise.</p>
      <h2>Таймеры</h2>
      <p><code>setTimeout(function() { ... }, 1000)</code> — выполнить через 1 секунду. <code>setInterval</code> — повторять каждые N мс. Возвращают id, по которому можно отменить: <code>clearTimeout(id)</code>.</p>
      <h2>Promise и fetch</h2>
      <p><code>fetch('https://api.example.com/data')</code> возвращает Promise. Обработка: <code>.then(response => response.json()).then(data => console.log(data))</code> или <code>async/await</code>: <code>const response = await fetch(...); const data = await response.json();</code>. Функция с <code>await</code> должна быть объявлена как <code>async</code>.</p>
    `
  }
];
if (typeof module !== 'undefined' && module.exports) module.exports = THEORY_TOPICS;
