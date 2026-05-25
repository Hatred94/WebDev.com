/**
 * Инициализация SQLite БД: создание таблиц по schema.sql (через sql.js, без C++).
 * Запуск: node db.js (из папки server) или node server/db.js (из корня)
 */
const fs = require('fs');
const path = require('path');
const { getDb } = require('./sqlite-wrapper');

const DB_PATH = path.join(__dirname, 'diplom.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function main() {
  const db = await getDb();
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schema);
  console.log('База данных инициализирована: ' + DB_PATH);
}

main().catch(e => { console.error(e); process.exit(1); });
