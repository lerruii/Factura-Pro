/* ============================================================
   FacturaPro SaaS — Panel de administración

   Reservado al administrador (ADMIN_EMAIL o, si no está definido,
   el primer usuario registrado): listado de usuarios, cambio de
   plan y configuración de la pasarela de pagos (Stripe).
   ============================================================ */

import { Router } from 'express';
import { usuarios, config, esAdmin } from './db.js';
import { LIMITES, usoDe } from './data.js';
import { stripeConfigurado } from './billing.js';

export function requireAdmin(req, res, next) {
  if (!esAdmin(req.user)) return res.status(403).json({ error: 'Solo el administrador puede acceder.' });
  next();
}

export const adminRouter = Router();

/* Resumen: usuarios, estadísticas y estado de la pasarela */
adminRouter.get('/resumen', (req, res) => {
  const lista = usuarios.listado().map(u => {
    const uso = usoDe(u);
    return {
      id: u.id, email: u.email, nombre: u.nombre, plan: u.plan,
      admin: esAdmin(u), creada: u.created_at,
      facturasCreadas: uso.facturas, facturasActuales: uso.facturasActuales, clientes: uso.clientes
    };
  });
  const mask = v => v ? v.slice(0, 7) + '…' + v.slice(-4) : '';
  res.json({
    usuarios: lista,
    stats: {
      total: lista.length,
      pro: lista.filter(u => u.plan === 'pro').length,
      facturas: lista.reduce((a, u) => a + u.facturasCreadas, 0)
    },
    stripe: {
      configurado: stripeConfigurado(),
      secretKey: mask(config.get('stripe_secret_key') || process.env.STRIPE_SECRET_KEY || ''),
      priceId: config.get('stripe_price_id') || process.env.STRIPE_PRICE_ID || '',
      webhookSecret: mask(config.get('stripe_webhook_secret') || process.env.STRIPE_WEBHOOK_SECRET || '')
    },
    planes: LIMITES
  });
});

/* Cambiar el plan de un usuario manualmente */
adminRouter.post('/plan', (req, res) => {
  const { userId, plan } = req.body || {};
  if (!LIMITES[plan]) return res.status(400).json({ error: 'Plan no válido.' });
  const u = usuarios.porId(Number(userId));
  if (!u) return res.status(404).json({ error: 'Usuario no encontrado.' });
  usuarios.cambiarPlan(u.id, plan);
  res.json({ ok: true });
});

/* Guardar las claves de la pasarela de pagos (Stripe) */
adminRouter.post('/stripe', (req, res) => {
  const { secretKey, priceId, webhookSecret } = req.body || {};
  // solo se sobreescribe lo que llega con contenido; cadena "-" borra el valor
  const aplicar = (clave, valor) => {
    if (valor === undefined || valor === null || valor === '') return;
    config.set(clave, valor === '-' ? '' : String(valor).trim());
  };
  if (secretKey && !/^sk_(test|live)_/.test(String(secretKey).trim()) && secretKey !== '-') {
    return res.status(400).json({ error: 'La clave secreta debe empezar por sk_test_ o sk_live_.' });
  }
  if (priceId && !/^price_/.test(String(priceId).trim()) && priceId !== '-') {
    return res.status(400).json({ error: 'El price id debe empezar por price_.' });
  }
  aplicar('stripe_secret_key', secretKey);
  aplicar('stripe_price_id', priceId);
  aplicar('stripe_webhook_secret', webhookSecret);
  res.json({ ok: true, configurado: stripeConfigurado() });
});
