/* ============================================================
   FacturaPro SaaS — API de datos por usuario + límites de plan
   ============================================================ */

import { Router } from 'express';
import { datos } from './db.js';

export const LIMITES = {
  free: { nombre: 'Gratis', maxFacturas: 20, maxClientes: 10, precio: 0 },
  pro: { nombre: 'Pro', maxFacturas: Infinity, maxClientes: Infinity, precio: 9.9 }
};

// Infinity no sobrevive a JSON.stringify: se serializa como null y el
// cliente lo interpreta como "sin límite".
export function usoDe(userId) {
  const fila = datos.leer(userId);
  if (!fila) return { facturas: 0, clientes: 0 };
  try {
    const d = JSON.parse(fila.json);
    return { facturas: (d.facturas || []).length, clientes: (d.clientes || []).length };
  } catch {
    return { facturas: 0, clientes: 0 };
  }
}

export const dataRouter = Router();

dataRouter.get('/', (req, res) => {
  const fila = datos.leer(req.user.id);
  if (!fila) return res.json({ data: null, updatedAt: null });
  res.json({ data: JSON.parse(fila.json), updatedAt: fila.updated_at });
});

dataRouter.put('/', (req, res) => {
  const d = req.body;
  // validación mínima de forma
  if (!d || typeof d !== 'object' || !d.settings ||
      !Array.isArray(d.facturas) || !Array.isArray(d.clientes) ||
      !Array.isArray(d.productos) || !Array.isArray(d.gastos)) {
    return res.status(400).json({ error: 'Datos con formato no válido.' });
  }

  const lim = LIMITES[req.user.plan] || LIMITES.free;
  const previo = usoDe(req.user.id);

  // el límite solo bloquea si se intenta CRECER por encima de él,
  // nunca impide guardar ediciones o borrados de datos existentes
  if (d.facturas.length > lim.maxFacturas && d.facturas.length > previo.facturas) {
    return res.status(402).json({
      error: `El plan ${lim.nombre} permite hasta ${lim.maxFacturas} facturas. Pasa a Pro para facturar sin límites.`,
      code: 'LIMITE_FACTURAS'
    });
  }
  if (d.clientes.length > lim.maxClientes && d.clientes.length > previo.clientes) {
    return res.status(402).json({
      error: `El plan ${lim.nombre} permite hasta ${lim.maxClientes} clientes. Pasa a Pro para añadir más.`,
      code: 'LIMITE_CLIENTES'
    });
  }

  datos.guardar(req.user.id, JSON.stringify(d));
  res.json({ ok: true, uso: { facturas: d.facturas.length, clientes: d.clientes.length } });
});
