/* ============================================================
   FacturaPro SaaS — API de datos por usuario + límites de plan

   El límite de facturas del plan Gratis es ACUMULADO: cuenta las
   facturas creadas en la vida de la cuenta, de modo que eliminar
   una factura no libera cupo.
   ============================================================ */

import { Router } from 'express';
import { datos, usuarios } from './db.js';

export const LIMITES = {
  free: { nombre: 'Gratis', maxFacturas: 20, maxClientes: 10, precio: 0 },
  pro: { nombre: 'Pro', maxFacturas: Infinity, maxClientes: Infinity, precio: 9.9 }
};

// Infinity no sobrevive a JSON.stringify: llega como null al cliente,
// que lo interpreta como "sin límite".

function idsFacturas(json) {
  try {
    return new Set((JSON.parse(json).facturas || []).map(f => String(f.id)));
  } catch {
    return new Set();
  }
}

/* Uso del usuario: facturas = contador acumulado (no baja al borrar) */
export function usoDe(user) {
  const fila = datos.leer(user.id);
  let actuales = 0, clientes = 0, ids = new Set();
  if (fila) {
    try {
      const d = JSON.parse(fila.json);
      actuales = (d.facturas || []).length;
      clientes = (d.clientes || []).length;
      ids = idsFacturas(fila.json);
    } catch { /* datos ilegibles: uso cero */ }
  }
  // tolera cuentas anteriores a la existencia del contador
  const acumulado = Math.max(Number(user.facturas_creadas) || 0, ids.size);
  return { facturas: acumulado, facturasActuales: actuales, clientes };
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

  // facturas nuevas respecto a lo guardado (por id)
  const fila = datos.leer(req.user.id);
  const previas = fila ? idsFacturas(fila.json) : new Set();
  const nuevas = d.facturas.filter(f => !previas.has(String(f.id))).length;
  const acumuladoPrevio = Math.max(Number(req.user.facturas_creadas) || 0, previas.size);
  const acumulado = acumuladoPrevio + nuevas;

  if (nuevas > 0 && acumulado > lim.maxFacturas) {
    return res.status(402).json({
      error: `El plan ${lim.nombre} permite crear hasta ${lim.maxFacturas} facturas en total (las eliminadas también cuentan). Pasa a Pro para facturar sin límites.`,
      code: 'LIMITE_FACTURAS'
    });
  }
  // clientes: límite sobre los actuales (borrar sí libera cupo aquí)
  let clientesPrevios = 0;
  if (fila) { try { clientesPrevios = (JSON.parse(fila.json).clientes || []).length; } catch { /* ilegible */ } }
  if (d.clientes.length > lim.maxClientes && d.clientes.length > clientesPrevios) {
    return res.status(402).json({
      error: `El plan ${lim.nombre} permite hasta ${lim.maxClientes} clientes. Pasa a Pro para añadir más.`,
      code: 'LIMITE_CLIENTES'
    });
  }

  if (acumulado !== Number(req.user.facturas_creadas)) {
    usuarios.fijarFacturasCreadas(req.user.id, acumulado);
  }
  datos.guardar(req.user.id, JSON.stringify(d));
  res.json({
    ok: true,
    uso: { facturas: acumulado, facturasActuales: d.facturas.length, clientes: d.clientes.length }
  });
});
