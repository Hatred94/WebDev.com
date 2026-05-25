/**
 * Обёртка над sql.js с API как у better-sqlite3 (без нативной сборки, без C++).
 * Один файл БД: diplom.db в корне проекта (рядом с папкой server).
 */
const path = require('path');
const fs = require('fs');

// Всегда один путь: корень проекта / diplom.db (и seed, и server используют этот файл)
const DB_PATH = path.join(__dirname, '..', 'diplom.db');
let SQL = null;
let db = null;
let dbFilePath = DB_PATH;

async function init() {
  if (db) return db;
  const initSqlJs = require('sql.js');
  SQL = await initSqlJs();
  try {
    if (fs.existsSync(DB_PATH)) {
      const buf = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buf);
      console.log('БД загружена:', DB_PATH);
    } else {
      db = new SQL.Database();
      console.log('БД создана (новый файл):', DB_PATH);
    }
  } catch (e) {
    db = new SQL.Database();
    console.warn('БД создана в памяти из-за ошибки чтения:', e.message);
  }
  dbFilePath = DB_PATH;
  ensureSchema(db);
  save();
  return db;
}

/** Создаёт таблицы, если их ещё нет (чтобы не было "no such table"). */
function ensureSchema(sqliteDb) {
  if (!sqliteDb) return;
  const schema = `
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
  test_id TEXT,
  lesson_id TEXT,
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
`;
  try {
    sqliteDb.exec(schema);
  } catch (e) {
    console.error('Ошибка инициализации схемы БД:', e.message);
  }
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(dbFilePath, Buffer.from(data));
}

function wrapDb(sqliteDb) {
  return {
    prepare(sql) {
      const stmt = sqliteDb.prepare(sql);
      return {
        get(...args) {
          if (args.length) stmt.bind(args);
          const hasRow = stmt.step();
          const row = hasRow ? stmt.getAsObject() : null;
          stmt.free();
          return row;
        },
        all(...args) {
          if (args.length) stmt.bind(args);
          const rows = [];
          while (stmt.step()) rows.push(stmt.getAsObject());
          stmt.free();
          return rows;
        },
        run(...args) {
          try {
            stmt.reset();
          } catch (e) {
            // reset can throw if statement was never run; ignore
          }
          if (args.length) stmt.bind(args);
          stmt.step();
          stmt.reset();
          const changes = sqliteDb.getRowsModified();
          const lastIdRes = sqliteDb.exec('SELECT last_insert_rowid() AS id');
          const lastInsertRowid = lastIdRes[0] && lastIdRes[0].values[0] ? lastIdRes[0].values[0][0] : 0;
          save();
          return { changes, lastInsertRowid };
        }
      };
    },
    exec(sql) {
      sqliteDb.exec(sql);
      save();
    }
  };
}

let wrapped = null;

async function getDb() {
  if (!wrapped) {
    const nativeDb = await init();
    wrapped = wrapDb(nativeDb);
  }
  return wrapped;
}

module.exports = { getDb, init: getDb, DB_PATH };
