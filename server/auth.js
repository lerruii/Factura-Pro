/* ============================================================
   FacturaPro SaaS — Autenticación (registro, login, sesión JWT)
   ============================================================ */

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { usuarios, JWT_SECRET } from './db.js';
import { LIMITES, usoDe } from './data.js';

export const authRouter = Router();

const COOKIE = 'fp_token';
const DIAS_SESION = 30;

function emitirSesion(res, user) {
  const token = jwt.sign({ uid: user.id }, JWT_SECRET, { expiresIn: `${DIAS_SESION}d` });
  res.cookie(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DIAS_SESION * 24 * 60 * 60 * 1000
  });
}

function publicUser(user) {
  return {
    email: user.email,
    nombre: user.nombre,
    plan: user.plan,
    limites: LIMITES[user.plan] || LIMITES.free,
    uso: usoDe(user.id)
  };
}

/* ---------- middleware ---------- */

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: 'No autenticado' });
  try {
    const { uid } = jwt.verify(token, JWT_SECRET);
    const user = usuarios.porId(uid);
    if (!user) throw new Error('usuario no existe');
    req.user = user;
    next();
  } catch {
    res.clearCookie(COOKIE);
    res.status(401).json({ error: 'Sesión caducada' });
  }
}

/* ---------- rutas ---------- */

authRouter.post('/registro', async (req, res) => {
  const { email = '', password = '', nombre = '' } = req.body || {};
  const mail = String(email).toLowerCase().trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) {
    return res.status(400).json({ error: 'Introduce un email válido.' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (usuarios.porEmail(mail)) {
    return res.status(409).json({ error: 'Ya existe una cuenta con ese email. Inicia sesión.' });
  }
  const hash = await bcrypt.hash(String(password), 10);
  const r = usuarios.crear(mail, hash, String(nombre).trim().slice(0, 80));
  const user = usuarios.porId(Number(r.lastInsertRowid));
  emitirSesion(res, user);
  res.status(201).json({ user: publicUser(user) });
});

authRouter.post('/login', async (req, res) => {
  const { email = '', password = '' } = req.body || {};
  const user = usuarios.porEmail(String(email));
  const ok = user && await bcrypt.compare(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Email o contraseña incorrectos.' });
  emitirSesion(res, user);
  res.json({ user: publicUser(user) });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

export function meHandler(req, res) {
  res.json({ user: publicUser(req.user) });
}
