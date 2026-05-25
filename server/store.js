/**
 * SQLite-обёртка и middleware авторизации для Express (через sql.js, без C++).
 */
const path = require('path');
const bcrypt = require('bcryptjs');
const { getDb } = require('./sqlite-wrapper');

let db = null;

const SESSION_COOKIE = 'webdev_sid';
const SESSION_DAYS = 7;

async function init() {
  db = await getDb();
  return db;
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}
function comparePassword(password, hash) {
  if (!hash) return false;
  // если в БД сохранён bcrypt-хеш — проверяем через bcrypt
  if (/^\$2[aby]\$\d{2}\$/.test(hash)) return bcrypt.compareSync(password, hash);
  // иначе считаем пароль открытым текстом (для старых записей вроде root/123)
  return password === hash;
}

function createSession(userId) {
  const id = require('crypto').randomBytes(24).toString('hex');
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_DAYS);
  db.prepare(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
  ).run(id, userId, expires.toISOString());
  return { id, expires };
}

function getSession(sessionId) {
  if (!sessionId) return null;
  const row = db.prepare(
    'SELECT s.user_id, u.login, u.role FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ? AND s.expires_at > datetime(\'now\')'
  ).get(sessionId);
  return row ? { userId: row.user_id, login: row.login, role: row.role } : null;
}

function destroySession(sessionId) {
  if (sessionId) db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

/** Middleware: req.user = { userId, login, role } или null */
function authMiddleware(req, res, next) {
  const sid = req.cookies && req.cookies[SESSION_COOKIE];
  req.user = getSession(sid) || null;
  next();
}

/** Требует авторизации; 401 если нет */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  next();
}

/** Требует роль admin; 403 если не админ */
function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Требуется авторизация' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ только для администратора' });
  next();
}

module.exports = {
  get db() { return db; },
  init,
  SESSION_COOKIE,
  SESSION_DAYS,
  hashPassword,
  comparePassword,
  createSession,
  getSession,
  destroySession,
  authMiddleware,
  requireAuth,
  requireAdmin
};
