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
`);

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
const qGetData = db.prepare('SELECT json, updated_at FROM user_data WHERE user_id = ?');
const qUpsertData = db.prepare(`
  INSERT INTO user_data (user_id, json, updated_at) VALUES (?, ?, datetime('now'))
  ON CONFLICT(user_id) DO UPDATE SET json = excluded.json, updated_at = datetime('now')
`);

export const usuarios = {
  porEmail: email => qUserByEmail.get(email.toLowerCase().trim()),
  porId: id => qUserById.get(id),
  crear: (email, hash, nombre) => qInsertUser.run(email.toLowerCase().trim(), hash, nombre),
  cambiarPlan: (id, plan) => qSetPlan.run(plan, id),
  vincularStripe: (id, customer) => qSetCustomer.run(customer, id)
};

export const datos = {
  leer: userId => qGetData.get(userId),
  guardar: (userId, json) => qUpsertData.run(userId, json)
};
