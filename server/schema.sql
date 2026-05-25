-- WebDev: SQLite schema
-- Пользователи и роли (user | admin)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Уроки (контент создаётся админом или загружается при сиде)
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

-- Шаги урока (для пошаговых уроков)
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

-- Тесты
CREATE TABLE IF NOT EXISTS tests (
  id TEXT NOT NULL PRIMARY KEY,
  title TEXT NOT NULL,
  branch TEXT NOT NULL CHECK (branch IN ('html', 'js')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Вопросы теста
CREATE TABLE IF NOT EXISTS test_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  test_id TEXT NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options_json TEXT NOT NULL,
  correct_index INTEGER NOT NULL,
  question_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);

-- Прогресс: пройденные уроки (привязаны к пользователю)
CREATE TABLE IF NOT EXISTS user_completed_lessons (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, lesson_id)
);
CREATE INDEX IF NOT EXISTS idx_ucl_user ON user_completed_lessons(user_id);

-- Прогресс: результаты тестов
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

-- Сессии для авторизации (простой вариант: session_id -> user_id)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT NOT NULL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
