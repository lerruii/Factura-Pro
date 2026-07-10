/* ============================================================
   FacturaPro SaaS — Suscripciones (Stripe si está configurado)

   Con STRIPE_SECRET_KEY + STRIPE_PRICE_ID en .env se usa Stripe
   Checkout real. Sin configurar, el botón "Pasar a Pro" activa el
   plan directamente (modo demo) para poder probar el producto.
   ============================================================ */

import { Router } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { usuarios } from './db.js';
import { LIMITES } from './data.js';

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || '';
const STRIPE_PRICE = process.env.STRIPE_PRICE_ID || '';
const STRIPE_WH_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';
export const stripeConfigurado = Boolean(STRIPE_KEY && STRIPE_PRICE);

async function stripe(pathName, params) {
  const res = await fetch('https://api.stripe.com/v1/' + pathName, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${STRIPE_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(params)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message || 'Error de Stripe');
  return json;
}

export const billingRouter = Router();

billingRouter.get('/config', (req, res) => {
  res.json({ stripe: stripeConfigurado, planes: LIMITES });
});

/* Inicia el pago de la suscripción Pro */
billingRouter.post('/checkout', async (req, res) => {
  const origin = `${req.protocol}://${req.get('host')}`;

  if (!stripeConfigurado) {
    // Modo demo: sin pasarela configurada se activa Pro directamente
    usuarios.cambiarPlan(req.user.id, 'pro');
    return res.json({ demo: true, plan: 'pro' });
  }

  try {
    const session = await stripe('checkout/sessions', {
      mode: 'subscription',
      'line_items[0][price]': STRIPE_PRICE,
      'line_items[0][quantity]': '1',
      client_reference_id: String(req.user.id),
      customer_email: req.user.email,
      success_url: `${origin}/app/#/cuenta?pago=ok`,
      cancel_url: `${origin}/app/#/cuenta?pago=cancelado`
    });
    res.json({ url: session.url });
  } catch (e) {
    console.error('Stripe checkout:', e.message);
    res.status(502).json({ error: 'No se pudo iniciar el pago. Inténtalo de nuevo.' });
  }
});

/* Webhook de Stripe: activa/desactiva el plan según la suscripción.
   Requiere body crudo (se monta con express.raw en index.js). */
export function stripeWebhook(req, res) {
  if (!STRIPE_WH_SECRET) return res.status(501).end();
  try {
    const sig = req.get('stripe-signature') || '';
    const parts = Object.fromEntries(sig.split(',').map(p => p.split('=')));
    const payload = `${parts.t}.${req.body.toString('utf8')}`;
    const expected = createHmac('sha256', STRIPE_WH_SECRET).update(payload).digest('hex');
    const okFirma = parts.v1 && expected.length === parts.v1.length &&
      timingSafeEqual(Buffer.from(expected), Buffer.from(parts.v1));
    if (!okFirma) return res.status(400).json({ error: 'Firma no válida' });

    const event = JSON.parse(req.body.toString('utf8'));
    if (event.type === 'checkout.session.completed') {
      const uid = Number(event.data.object.client_reference_id);
      if (uid) {
        usuarios.cambiarPlan(uid, 'pro');
        if (event.data.object.customer) usuarios.vincularStripe(uid, event.data.object.customer);
      }
    }
    if (event.type === 'customer.subscription.deleted') {
      const customer = event.data.object.customer;
      // vuelta al plan gratis cuando se cancela la suscripción
      const row = customer && usuariosPorCustomer(customer);
      if (row) usuarios.cambiarPlan(row.id, 'free');
    }
    res.json({ received: true });
  } catch (e) {
    console.error('Webhook:', e.message);
    res.status(400).json({ error: 'Webhook no procesado' });
  }
}

import { db } from './db.js';
const qByCustomer = db.prepare('SELECT id FROM users WHERE stripe_customer = ?');
function usuariosPorCustomer(customer) { return qByCustomer.get(customer); }
