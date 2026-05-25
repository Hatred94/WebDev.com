-- WebDev: SQLite — схема и тестовые данные (локальный файл БД)
-- Создание БД: sqlite3 diplom.db < init.sql

-- ========== СХЕМА ==========

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lessons (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  branch TEXT NOT NULL CHECK (branch IN ('html', 'js')),
  test_id TEXT,
  template INTEGER NOT NULL DEFAULT 0,
  html TEXT,
  css TEXT,
  js TEXT,
  check_json TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS lesson_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  task TEXT,
  html TEXT,
  css TEXT,
  js TEXT,
  check_json TEXT,
  step_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_lesson_steps_lesson ON lesson_steps(lesson_id);

CREATE TABLE IF NOT EXISTS tests (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('html', 'js')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS theory_topics (
  id TEXT NOT NULL PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('html', 'css', 'js')),
  title TEXT NOT NULL,
  short_desc TEXT,
  content TEXT,
  test_id TEXT REFERENCES tests(id),
  lesson_id TEXT REFERENCES lessons(id),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_theory_topics_category ON theory_topics(category);

CREATE TABLE IF NOT EXISTS test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);

CREATE TABLE IF NOT EXISTS user_completed_lessons (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_ucl_user ON user_completed_lessons(user_id);

CREATE TABLE IF NOT EXISTS user_test_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_utr_user ON user_test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_utr_test ON user_test_results(test_id);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- ========== ТЕСТОВЫЕ ДАННЫЕ ==========
-- Админ: root / 123 (пароль в открытом виде для локальной проверки)

INSERT OR REPLACE INTO users (id, login, password_hash, role) VALUES
  (1, 'root', '123', 'admin'),
  (2, 'user1', '123', 'user');

INSERT OR REPLACE INTO tests (id, title, branch) VALUES
  ('html-basics', 'Основы HTML', 'html'),
  ('css-basics', 'Основы CSS', 'html');

INSERT OR REPLACE INTO test_questions (test_id, question, options_json, correct_index, question_order) VALUES
  ('html-basics', 'Какой тег задаёт заголовок первого уровня?', '["<header>", "<h1>", "<head>"]', 1, 0),
  ('html-basics', 'Какой атрибут у ссылки <a> задаёт адрес?', '["src", "href", "link"]', 1, 1),
  ('css-basics', 'Какое свойство задаёт цвет текста?', '["text-color", "font-color", "color"]', 2, 0);

INSERT OR REPLACE INTO lessons (id, title, description, branch, test_id, template, html, css, js, check_json, sort_order) VALUES
  ('1', 'Урок 1: Первая страница', '<p>Создайте заголовок и параграф.</p>', 'html', 'html-basics', 1,
   '<main><h1>Привет</h1><p>Текст.</p></main>',
   'main { padding: 1rem; }', '', '[{"selector":"h1"},{"selector":"p"}]', 0);

INSERT OR REPLACE INTO lesson_steps (lesson_id, title, task, html, css, js, check_json, step_order) VALUES
  ('1', 'Шаг 1', 'Добавьте h1 и p.', '<h1>Привет</h1><p>Текст.</p>', '', '', '[{"selector":"h1"},{"selector":"p"}]', 0);

INSERT OR REPLACE INTO user_completed_lessons (user_id, lesson_id, completed_at) VALUES
  (2, '1', datetime('now', '-1 day'));

INSERT OR REPLACE INTO user_test_results (user_id, test_id, score, passed, max_score, completed_at) VALUES
  (2, 'html-basics', 2, 1, 2, datetime('now'));
