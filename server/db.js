/* ============================================================
   FacturaPro SaaS — Base de datos (SQLite nativo de Node)
   ============================================================ */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_DIR = path.join(ROOT, 'data');
mkdirSync(DATA_DIR, { recursive: true });

export const db = new DatabaseSync(path.join(DATA_DIR, 'facturapro.db'));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    nombre        TEXT NOT NULL DEFAULT '',
    plan          TEXT NOT NULL DEFAULT 'free',
    stripe_customer TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS user_data (
    user_id    INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    json       TEXT NOT NULL,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS config (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
  );
`);

/* migraciones sobre bases de datos anteriores (ignora si la columna ya existe) */
for (const sql of [
  "ALTER TABLE users ADD COLUMN facturas_creadas INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE users ADD COLUMN is_admin INTEGER NOT NULL DEFAULT 0"
]) {
  try { db.exec(sql); } catch { /* columna ya existente */ }
}

/* Secreto JWT: variable de entorno o archivo generado la primera vez */
const secretFile = path.join(DATA_DIR, '.jwt-secret');
export const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (!existsSync(secretFile)) writeFileSync(secretFile, randomBytes(48).toString('hex'), { mode: 0o600 });
  return readFileSync(secretFile, 'utf8').trim();
})();

/* ---------- consultas preparadas ---------- */

const qUserByEmail = db.prepare('SELECT * FROM users WHERE email = ?');
const qUserById = db.prepare('SELECT * FROM users WHERE id = ?');
const qInsertUser = db.prepare('INSERT INTO users (email, password_hash, nombre) VALUES (?, ?, ?)');
const qSetPlan = db.prepare('UPDATE users SET plan = ? WHERE id = ?');
const qSetCustomer = db.prepare('UPDATE users SET stripe_customer = ? WHERE id = ?');
const qSetFacturasCreadas = db.prepare('UPDATE users SET facturas_creadas = ? WHERE id = ?');
const qSetAdmin = db.prepare('UPDATE users SET is_admin = ? WHERE id = ?');
const qListado = db.prepare('SELECT id, email, nombre, plan, is_admin, facturas_creadas, created_at FROM users ORDER BY created_at DESC');
const qGetData = db.prepare('SELECT json, updated_at FROM user_data WHERE user_id = ?');
const qUpsertData = db.prepare(`
  INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = datetime('now')
`);
const qGetConfig = db.prepare('SELECT valor FROM config WHERE clave = ?');
const qSetConfig = db.prepare(`
  INSERT INTO config (clave, valor) VALUES (?, ?)
  ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor
`);

export const usuarios = {
  porEmail: email => qUserByEmail.get(email.toLowerCase().trim()),
  porId: id => qUserById.get(id),
  crear: (email, hash, nombre) => qInsertUser.run(email.toLowerCase().trim(), hash, nombre),
  cambiarPlan: (id, plan) => qSetPlan.run(plan, id),
  vincularStripe: (id, customer) => qSetCustomer.run(customer, id),
  fijarFacturasCreadas: (id, n) => qSetFacturasCreadas.run(n, id),
  marcarAdmin: (id, esAdmin) => qSetAdmin.run(esAdmin ? 1 : 0, id),
  listado: () => qListado.all()
};

export const datos = {
  leer: userId => qGetData.get(userId),
  guardar: (userId, json) => qUpsertData.run(userId, json)
};

export const config = {
  get: clave => qGetConfig.get(clave)?.valor || '',
  set: (clave, valor) => qSetConfig.run(clave, String(valor ?? ''))
};

/* Administrador: el email de ADMIN_EMAIL o, si no está definido, el primer usuario */
export function esAdmin(user) {
  if (!user) return false;
  if (user.is_admin === 1) return true;
  const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
  if (adminEmail) return user.email === adminEmail;
  return user.id === 1;
}
