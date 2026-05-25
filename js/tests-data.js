/**
 * Данные тестов: вопросы и правильные ответы.
 * Каждый тест привязан к одной теме теории (id = topic.id).
 * branch: 'html' — HTML и вёрстка, 'js' — Frontend (JavaScript).
 */
const TESTS_DATA = [
  {
    id: 'html-intro',
    title: 'Введение в HTML',
    branch: 'html',
    questions: [
      { question: 'Что означает аббревиатура HTML?', options: ['Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language'], correct: 0 },
      { question: 'В каком разделе обычно подключают CSS?', options: ['<body>', '<head>', '<footer>'], correct: 1 },
      { question: 'Для чего нужен тег <!DOCTYPE html>?', options: ['Подключение стилей', 'Указание типа документа (HTML5)', 'Заголовок страницы'], correct: 1 },
      { question: 'Где размещается видимое содержимое страницы?', options: ['<head>', '<body>', '<meta>'], correct: 1 }
    ]
  },
  {
    id: 'html-tags',
    title: 'Основные теги HTML',
    branch: 'html',
    questions: [
      { question: 'Какой тег задаёт заголовок первого уровня?', options: ['<header>', '<h1>', '<head>'], correct: 1 },
      { question: 'Какой тег создаёт маркированный список?', options: ['<list>', '<ul>', '<ol>'], correct: 1 },
      { question: 'Какой атрибут у ссылки <a> задаёт адрес?', options: ['src', 'href', 'link'], correct: 1 },
      { question: 'Какой тег создаёт нумерованный список?', options: ['<list>', '<ul>', '<ol>'], correct: 2 },
      { question: 'Для чего нужен атрибут rel="noopener" у ссылки с target="_blank"?', options: ['Для SEO', 'Для безопасности', 'Для стилей'], correct: 1 }
    ]
  },
  {
    id: 'html-semantics',
    title: 'Семантическая разметка',
    branch: 'html',
    questions: [
      { question: 'Что такое семантический тег?', options: ['Тег с атрибутом semantic', 'Тег, отражающий смысл контента (header, article)', 'Тег для стилей'], correct: 1 },
      { question: 'Какой тег обозначает основное содержимое страницы?', options: ['<content>', '<main>', '<body>'], correct: 1 },
      { question: 'Какой тег используют для навигации по сайту?', options: ['<menu>', '<nav>', '<links>'], correct: 1 },
      { question: 'Для чего используется тег <footer>?', options: ['Подвал страницы или блока', 'Нижняя кнопка', 'Конец списка'], correct: 0 }
    ]
  },
  {
    id: 'html-forms',
    title: 'Формы в HTML',
    branch: 'html',
    questions: [
      { question: 'Для чего используется тег <label>?', options: ['Для подписи к полю формы', 'Для списка', 'Для заголовка'], correct: 0 },
      { question: 'Какой type у input для чекбокса?', options: ['checkbox', 'check', 'boolean'], correct: 0 },
      { question: 'Как связать label с полем по id?', options: ['label id="..."', 'label for="id поля"', 'input label="..."'], correct: 1 },
      { question: 'Какой атрибут обязателен у поля формы для отправки данных?', options: ['id', 'name', 'value'], correct: 1 }
    ]
  },
  {
    id: 'html-media',
    title: 'Медиа в HTML',
    branch: 'html',
    questions: [
      { question: 'Какой атрибут у <img> обязателен для доступности?', options: ['src', 'alt', 'title'], correct: 1 },
      { question: 'Для чего используется тег <img>?', options: ['Для вставки изображения', 'Для вставки иконки', 'Для вставки карты'], correct: 0 },
      { question: 'Что такое <figure> и <figcaption>?', options: ['Рисунок и подпись к нему', 'Форма и заголовок', 'Блок и описание'], correct: 0 },
      { question: 'Какой тег используют для видео?', options: ['<media>', '<video>', '<movie>'], correct: 1 }
    ]
  },
  {
    id: 'css-intro',
    title: 'Введение в CSS',
    branch: 'html',
    questions: [
      { question: 'Как выбрать элемент по классу в CSS?', options: ['#className', '.className', 'tagName.className'], correct: 1 },
      { question: 'Какое свойство задаёт цвет текста?', options: ['text-color', 'font-color', 'color'], correct: 2 },
      { question: 'Как выровнять текст по центру?', options: ['align: center', 'text-align: center', 'center: true'], correct: 1 },
      { question: 'Как подключить внешний файл стилей?', options: ['<style href="style.css">', '<link rel="stylesheet" href="style.css">', '<css src="style.css">'], correct: 1 }
    ]
  },
  {
    id: 'css-box-model',
    title: 'Блочная модель',
    branch: 'html',
    questions: [
      { question: 'Что такое padding?', options: ['Внешний отступ', 'Внутренний отступ', 'Граница'], correct: 1 },
      { question: 'Что делает box-sizing: border-box?', options: ['Добавляет рамку', 'Включает padding и border в width/height', 'Скрывает overflow'], correct: 1 },
      { question: 'Что такое margin?', options: ['Внешний отступ элемента', 'Внутренний отступ', 'Граница'], correct: 0 },
      { question: 'В каком порядке идут зоны изнутри наружу?', options: ['content → padding → border → margin', 'margin → border → padding → content', 'content → margin → padding'], correct: 0 }
    ]
  },
  {
    id: 'css-layout',
    title: 'Flexbox и Grid',
    branch: 'html',
    questions: [
      { question: 'Что задаёт display: flex у контейнера?', options: ['Скрывает контейнер', 'Включает флексбокс-раскладку', 'Делает блок плавающим'], correct: 1 },
      { question: 'Какое свойство выравнивает элементы по главной оси во Flexbox?', options: ['align-items', 'justify-content', 'align-content'], correct: 1 },
      { question: 'Что задаёт grid-template-columns: 1fr 1fr?', options: ['Одну колонку', 'Две равные колонки', 'Две строки'], correct: 1 },
      { question: 'Как сделать направление flex-контейнера колонкой?', options: ['flex-direction: column', 'direction: column', 'flex: column'], correct: 0 }
    ]
  },
  {
    id: 'css-responsive',
    title: 'Адаптивная вёрстка',
    branch: 'html',
    questions: [
      { question: 'Как применить стили только при ширине экрана до 768px?', options: ['@media (max-width: 768px)', '@breakpoint mobile', '@screen small'], correct: 0 },
      { question: 'Что такое mobile-first?', options: ['Сначала стили для мобильных, потом медиа-запросы для больших экранов', 'Только мобильная версия', 'Сначала десктоп'], correct: 0 },
      { question: 'Что означает единица 1rem?', options: ['Высота экрана', 'Размер шрифта корневого элемента', 'Ширина экрана'], correct: 1 },
      { question: 'Как не дать картинке выйти за границы контейнера?', options: ['width: 100%', 'max-width: 100%', 'overflow: hidden'], correct: 1 }
    ]
  },
  {
    id: 'css-variables',
    title: 'CSS-переменные',
    branch: 'html',
    questions: [
      { question: 'Как в CSS объявить переменную?', options: ['var(--name: value)', '--name: value', 'variable: value'], correct: 1 },
      { question: 'Как использовать переменную в правиле?', options: ['var(--name)', '$name', 'variable(name)'], correct: 0 },
      { question: 'Где обычно объявляют глобальные CSS-переменные?', options: ['В body', 'В :root', 'В html'], correct: 1 },
      { question: 'Как задать запасное значение для var()?', options: ['var(--name, fallback)', 'var(--name) or fallback', 'var(--name default fallback)'], correct: 0 }
    ]
  },
  {
    id: 'js-intro',
    title: 'Введение в JavaScript',
    branch: 'js',
    questions: [
      { question: 'Как объявить переменную, которую нельзя переприсвоить?', options: ['var', 'let', 'const'], correct: 2 },
      { question: 'Что выведет: console.log(typeof [])?', options: ['array', 'object', 'undefined'], correct: 1 },
      { question: 'Как объявить функцию?', options: ['function name() {}', 'func name()', 'def name()'], correct: 0 },
      { question: 'Что такое стрелочная функция?', options: ['(a, b) => a + b', 'arrow function(a,b)', 'function =>'], correct: 0 }
    ]
  },
  {
    id: 'js-dom',
    title: 'DOM и события',
    branch: 'js',
    questions: [
      { question: 'Что такое DOM?', options: ['Data Object Model', 'Document Object Model', 'Dynamic Output Model'], correct: 1 },
      { question: 'Как получить элемент по id в JS?', options: ['document.querySelector("#id")', 'document.getElement(id)', 'document.id()'], correct: 0 },
      { question: 'Что делает addEventListener?', options: ['Добавляет элемент в DOM', 'Подписывает обработчик на событие', 'Удаляет элемент'], correct: 1 },
      { question: 'Как изменить текст элемента?', options: ['element.text = "..."', 'element.textContent = "..."', 'element.value = "..."'], correct: 1 },
      { question: 'Как добавить класс элементу?', options: ['element.class = "name"', 'element.classList.add("name")', 'element.addClass("name")'], correct: 1 }
    ]
  },
  {
    id: 'js-arrays-objects',
    title: 'Массивы и объекты',
    branch: 'js',
    questions: [
      { question: 'Какой метод добавляет элемент в конец массива?', options: ['push', 'append', 'add'], correct: 0 },
      { question: 'Какой метод массива создаёт новый массив из результатов функции?', options: ['forEach', 'map', 'filter'], correct: 1 },
      { question: 'Как получить значение свойства объекта?', options: ['obj["key"]', 'obj.key', 'Оба варианта верны'], correct: 2 },
      { question: 'Что возвращает Object.keys(obj)?', options: ['Массив значений', 'Массив ключей', 'Количество свойств'], correct: 1 }
    ]
  },
  {
    id: 'js-forms-validation',
    title: 'Формы и валидация в JS',
    branch: 'js',
    questions: [
      { question: 'Как отменить отправку формы по умолчанию?', options: ['event.stop()', 'event.preventDefault()', 'event.cancel()'], correct: 1 },
      { question: 'Как получить значение поля формы по имени?', options: ['form.name.value', 'form.elements.name.value', 'form.get("name")'], correct: 1 },
      { question: 'Что такое FormData?', options: ['Объект для сбора данных формы', 'Тип поля ввода', 'Метод валидации'], correct: 0 },
      { question: 'Как проверить, отмечен ли checkbox?', options: ['checkbox.value', 'checkbox.checked', 'checkbox.selected'], correct: 1 }
    ]
  },
  {
    id: 'js-async-basics',
    title: 'Асинхронность в JavaScript',
    branch: 'js',
    questions: [
      { question: 'Что возвращает setTimeout?', options: ['Promise', 'Идентификатор таймера (число)', 'undefined'], correct: 1 },
      { question: 'Что такое Promise?', options: ['Синхронная операция', 'Объект для отложенного результата асинхронной операции', 'Цикл'], correct: 1 },
      { question: 'Как отменить setTimeout?', options: ['clearTimeout(id)', 'cancelTimeout(id)', 'stop(id)'], correct: 0 },
      { question: 'Ключевое слово для ожидания Promise внутри функции?', options: ['wait', 'await', 'async'], correct: 1 }
    ]
  }
];
if (typeof module !== 'undefined' && module.exports) module.exports = TESTS_DATA;
