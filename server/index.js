/* ============================================================
   FacturaPro SaaS — Servidor
   Landing pública en /  ·  Aplicación en /app  ·  API en /api
   ============================================================ */

try { process.loadEnvFile(); } catch { /* sin .env, se usan valores por defecto */ }

import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { authRouter, requireAuth, meHandler } from './auth.js';
import { dataRouter } from './data.js';
import { billingRouter, stripeWebhook, stripeConfigurado } from './billing.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 3000;

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

/* el webhook de Stripe necesita el cuerpo crudo, antes del parser JSON */
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

app.use(express.json({ limit: '3mb' })); // margen para el logo en dataURL
app.use(cookieParser());

/* ---------- API ---------- */
app.use('/api/auth', authRouter);
app.get('/api/me', requireAuth, meHandler);
app.use('/api/data', requireAuth, dataRouter);
app.use('/api/billing', requireAuth, billingRouter);

app.get('/health', (req, res) => res.json({ ok: true })); // comprobación de vida para el hosting

app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

/* ---------- estáticos ---------- */
app.use(express.static(path.join(ROOT, 'public'), { extensions: ['html'] }));

app.listen(PORT, () => {
  console.log(`FacturaPro SaaS escuchando en http://localhost:${PORT}`);
  console.log(`  Landing:    http://localhost:${PORT}/`);
  console.log(`  Aplicación: http://localhost:${PORT}/app/`);
  console.log(`  Stripe:     ${stripeConfigurado ? 'configurado' : 'no configurado (upgrade en modo demo)'}`);
});
