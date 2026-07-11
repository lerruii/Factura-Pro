/* ============================================================
   FacturaPro SaaS — Estado y sincronización con el servidor
   Los datos viven en la cuenta del usuario (API /api/data).
   ============================================================ */

const STORE_KEY = 'facturapro_v1'; // solo para migrar datos de la versión local antigua

let state = null;        // datos de la empresa del usuario autenticado
let currentUser = null;  // { email, nombre, plan, limites, uso }

/* ============================================================
   Sistemas contables por país
   ============================================================ */

/*
  Cada país define, además de impuestos y moneda, los requisitos legales de
  contenido de la factura:
  - infoLegalHint: qué información legal del emisor exige la normativa
  - camposFactura: campos fiscales obligatorios por factura (forma de pago…)
  - letras: importe en letras al pie (SUNAT / DIAN / SAT)
  - leyendaExenta: leyenda automática cuando hay conceptos al 0 %
  - padNumero / serieDefecto: formato de numeración exigido
*/
const PAISES = {
  ES: {
    nombre: 'España', moneda: 'EUR', locale: 'es-ES',
    impuesto: { nombre: 'IVA', tasas: [21, 10, 4, 0], defecto: 21 },
    retencion: { nombre: 'IRPF', etiqueta: 'Retención IRPF', tasas: [0, 7, 15, 19], ayuda: 'Solo para profesionales sujetos a retención' },
    taxId: 'NIF / CIF', docTitulo: 'FACTURA', qrSepa: true, factorDemo: 1, idioma: 'es',
    resumenNota: 'Base para los modelos 303 (IVA) y 130 (IRPF).',
    baseLabel: 'Base imponible',
    padNumero: 4,
    infoLegalHint: 'Datos registrales si eres sociedad (Registro Mercantil, tomo, folio…). Opcional.',
    leyendaExenta: 'Operación exenta o no sujeta a IVA conforme a la Ley 37/1992 del IVA.'
  },
  PE: {
    nombre: 'Perú', moneda: 'PEN', locale: 'es-PE',
    impuesto: { nombre: 'IGV', tasas: [18, 0], defecto: 18 },
    retencion: null,
    taxId: 'RUC', docTitulo: 'FACTURA ELECTRÓNICA', qrSepa: false, factorDemo: 3.5, idioma: 'es',
    resumenNota: 'Base para la declaración mensual de IGV-Renta ante SUNAT (PDT 621).',
    baseLabel: 'Op. gravada',
    padNumero: 8, serieDefecto: 'F001',
    letras: { moneda: 'SOLES' },
    infoLegalHint: 'Domicilio fiscal y, si aplica, código de establecimiento anexo SUNAT. Opcional.',
    camposFactura: [
      { campo: 'formaPago', etiqueta: 'Forma de pago', opciones: ['Contado', 'Crédito'] }
    ],
    leyendaExenta: 'Operación exonerada o inafecta al IGV.'
  },
  CO: {
    nombre: 'Colombia', moneda: 'COP', locale: 'es-CO',
    impuesto: { nombre: 'IVA', tasas: [19, 5, 0], defecto: 19 },
    retencion: { nombre: 'Retefuente', etiqueta: 'Retención en la fuente', tasas: [0, 1, 2, 2.5, 3.5, 4, 6, 10, 11], ayuda: 'Según concepto y régimen (DIAN)' },
    taxId: 'NIT', docTitulo: 'FACTURA DE VENTA', qrSepa: false, factorDemo: 4200, idioma: 'es',
    resumenNota: 'Base para la declaración de IVA y de retención en la fuente (DIAN).',
    baseLabel: 'Subtotal',
    padNumero: 4,
    letras: { moneda: 'PESOS', sufijo: 'M/CTE' },
    infoLegalHint: 'Exigido por la DIAN: resolución de facturación (número, fecha y rango autorizado) y régimen (responsable / no responsable de IVA).',
    camposFactura: [
      { campo: 'formaPago', etiqueta: 'Forma de pago', opciones: ['Contado', 'Crédito'] }
    ],
    leyendaExenta: 'Incluye conceptos excluidos o exentos de IVA.'
  },
  MX: {
    nombre: 'México', moneda: 'MXN', locale: 'es-MX',
    impuesto: { nombre: 'IVA', tasas: [16, 8, 0], defecto: 16 },
    retencion: { nombre: 'Ret. ISR', etiqueta: 'Retención ISR', tasas: [0, 1.25, 10], ayuda: 'Honorarios a personas morales: 10 % (SAT)' },
    taxId: 'RFC', docTitulo: 'FACTURA', qrSepa: false, factorDemo: 17, idioma: 'es',
    resumenNota: 'Base para las declaraciones mensuales de IVA e ISR ante el SAT.',
    baseLabel: 'Subtotal',
    padNumero: 4,
    letras: { moneda: 'PESOS', sufijo: 'M.N.' },
    infoLegalHint: 'Exigido por el SAT: régimen fiscal (p. ej. 612 — Personas Físicas con Actividades Empresariales) y lugar de expedición (código postal).',
    camposFactura: [
      { campo: 'usoCfdi', etiqueta: 'Uso CFDI', opciones: ['G03 — Gastos en general', 'G01 — Adquisición de mercancías', 'I01 — Construcciones', 'D01 — Honorarios médicos', 'P01 — Por definir'] },
      { campo: 'formaPago', etiqueta: 'Forma de pago (SAT)', opciones: ['03 — Transferencia electrónica', '01 — Efectivo', '04 — Tarjeta de crédito', '28 — Tarjeta de débito', '99 — Por definir'] },
      { campo: 'metodoPago', etiqueta: 'Método de pago', opciones: ['PUE — Pago en una sola exhibición', 'PPD — Pago en parcialidades o diferido'] }
    ],
    leyendaExenta: 'Incluye operaciones a tasa 0 % o exentas conforme a la Ley del IVA.'
  },
  US: {
    nombre: 'Estados Unidos', moneda: 'USD', locale: 'en-US',
    impuesto: { nombre: 'Sales Tax', tasas: null, defecto: 7 }, // tasa libre: varía por estado
    retencion: null,
    taxId: 'EIN', docTitulo: 'INVOICE', qrSepa: false, factorDemo: 1, idioma: 'en',
    resumenNota: 'Sales tax cobrado por trimestre; la declaración depende de cada estado.',
    baseLabel: 'Subtotal',
    padNumero: 4,
    infoLegalHint: 'Additional legal or registration info (optional).'
  }
};

function paisCfg() {
  return PAISES[state?.settings?.pais] || PAISES.ES;
}

/* Etiquetas del documento de factura según idioma */
const DOC_LABELS = {
  es: {
    facturarA: 'Facturar a', fecha: 'Fecha', venc: 'Vencimiento', pagadaEl: 'Pagada el',
    concepto: 'Concepto', cant: 'Cant.', precio: 'Precio', dto: 'Dto.', importe: 'Importe',
    total: 'TOTAL', formaPago: 'Forma de pago', transferencia: 'Transferencia bancaria',
    escanea: 'Escanea con tu app bancaria', escaneaPagar: 'Escanea para pagar',
    pagoOnline: 'Pago online', conceptoPago: 'Concepto', datosPago: 'Datos de pago',
    configuraPago: 'Configura tus datos de cobro en Ajustes para mostrar aquí el QR o los datos de pago.'
  },
  en: {
    facturarA: 'Bill to', fecha: 'Date', venc: 'Due date', pagadaEl: 'Paid on',
    concepto: 'Description', cant: 'Qty', precio: 'Price', dto: 'Disc.', importe: 'Amount',
    total: 'TOTAL', formaPago: 'Payment', transferencia: 'Bank transfer',
    escanea: 'Scan with your banking app', escaneaPagar: 'Scan to pay',
    pagoOnline: 'Pay online', conceptoPago: 'Reference', datosPago: 'Payment details',
    configuraPago: 'Set up your payment details in Settings to show the payment QR here.'
  }
};

function docLabels() {
  return DOC_LABELS[paisCfg().idioma] || DOC_LABELS.es;
}

/* ---------- moneda según país ---------- */

let _fmtMoneda = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
let _fmtCompacto = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 });
let _simbolo = '€';

function configurarMoneda() {
  const p = paisCfg();
  _fmtMoneda = new Intl.NumberFormat(p.locale, { style: 'currency', currency: p.moneda });
  _fmtCompacto = new Intl.NumberFormat(p.locale, { style: 'currency', currency: p.moneda, notation: 'compact', maximumFractionDigits: 1 });
  _simbolo = _fmtMoneda.formatToParts(1).find(x => x.type === 'currency')?.value || p.moneda;
}

function simboloMoneda() { return _simbolo; }

/* Aplica los valores por defecto del país al estado (registro o cambio en ajustes) */
function aplicarPais(codigo) {
  if (!PAISES[codigo] || !state) return;
  state.settings.pais = codigo;
  state.settings.facturacion.ivaDefecto = PAISES[codigo].impuesto.defecto;
  state.settings.facturacion.irpfDefecto = 0;
  if (PAISES[codigo].serieDefecto) state.settings.facturacion.serie = PAISES[codigo].serieDefecto;
  configurarMoneda();
}

/* ---------- importe en letras (SUNAT / DIAN / SAT) ---------- */

function enLetras(n) {
  const U = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
    'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE', 'VEINTE'];
  const D = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
  const C = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];
  const tres = x => {
    if (x === 0) return '';
    if (x === 100) return 'CIEN';
    let s = '';
    const c = Math.floor(x / 100), r = x % 100;
    if (c) s += C[c] + ' ';
    if (r === 0) { /* nada */ }
    else if (r <= 20) s += U[r];
    else if (r < 30) s += 'VEINTI' + U[r % 10];
    else s += D[Math.floor(r / 10)] + (r % 10 ? ' Y ' + U[r % 10] : '');
    return s.trim();
  };
  if (!n) return 'CERO';
  let s = '';
  const millones = Math.floor(n / 1e6), miles = Math.floor((n % 1e6) / 1000), resto = n % 1000;
  if (millones) s += (millones === 1 ? 'UN MILLON' : tres(millones) + ' MILLONES') + ' ';
  if (miles) s += (miles === 1 ? 'MIL' : tres(miles) + ' MIL') + ' ';
  return (s + tres(resto)).trim();
}

/* "SON: MIL DOSCIENTOS CON 50/100 SOLES" — solo en países que lo exigen */
function importeEnLetras(total) {
  const letras = paisCfg().letras;
  if (!letras) return '';
  const entero = Math.floor(total);
  const cent = Math.round((total - entero) * 100);
  return `SON: ${enLetras(entero)} CON ${String(cent).padStart(2, '0')}/100 ${letras.moneda}${letras.sufijo ? ' ' + letras.sufijo : ''}`;
}

function defaultState() {
  return {
    settings: {
      pais: 'ES',
      empresa: {
        nombre: '', nif: '', direccion: '', cp: '', ciudad: '', provincia: '',
        email: '', telefono: '', web: '', logo: '', infoLegal: ''
      },
      pago: {
        iban: '', bic: '', linkPago: '', datosCuenta: '',
        textoPie: 'Gracias por su confianza. Pago por transferencia bancaria o mediante el enlace/QR indicado.'
      },
      facturacion: {
        serie: 'F', siguienteNumero: 1, ivaDefecto: 21, irpfDefecto: 0,
        diasVencimiento: 30
      },
      tema: 'light'
    },
    clientes: [],
    productos: [],
    facturas: [],
    gastos: []
  };
}

/* Normaliza datos recibidos (tolera versiones antiguas del modelo) */
function normalizarEstado(parsed) {
  const s = defaultState();
  s.settings.pais = PAISES[parsed?.settings?.pais] ? parsed.settings.pais : 'ES';
  Object.assign(s.settings.empresa, parsed?.settings?.empresa || {});
  Object.assign(s.settings.pago, parsed?.settings?.pago || {});
  Object.assign(s.settings.facturacion, parsed?.settings?.facturacion || {});
  s.settings.tema = parsed?.settings?.tema || 'light';
  s.clientes = parsed?.clientes || [];
  s.productos = parsed?.productos || [];
  s.facturas = parsed?.facturas || [];
  s.gastos = parsed?.gastos || [];
  return s;
}

/* ---------- API ---------- */

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    credentials: 'same-origin',
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
  });
  let json = null;
  try { json = await res.json(); } catch { /* respuesta sin cuerpo */ }
  if (!res.ok) {
    const e = new Error(json?.error || `Error ${res.status}`);
    e.status = res.status;
    e.code = json?.code;
    throw e;
  }
  return json;
}

/* ---------- carga inicial ---------- */

async function cargarDatosRemotos() {
  const r = await apiFetch('/api/data');
  if (r.data) {
    state = normalizarEstado(r.data);
    return;
  }
  // Cuenta sin datos: ofrecer migración desde la versión local antigua
  state = defaultState();
  try {
    const local = localStorage.getItem(STORE_KEY);
    if (local) {
      const antiguos = JSON.parse(local);
      const tiene = (antiguos.facturas?.length || antiguos.clientes?.length || antiguos.gastos?.length);
      if (tiene && window.confirm('Hemos encontrado datos de la versión local de FacturaPro en este navegador.\n¿Quieres importarlos a tu cuenta?')) {
        state = normalizarEstado(antiguos);
        localStorage.removeItem(STORE_KEY);
      }
    }
  } catch { /* datos locales corruptos: se ignoran */ }
  await flushSave(true);
}

/* ---------- guardado (con debounce y descarga al salir) ---------- */

let saveTimer = null;
let savePendiente = false;

function saveState() {
  if (!state) return;
  savePendiente = true;
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => flushSave(), 700);
}

async function flushSave(silencioso = false) {
  if (!state) return;
  clearTimeout(saveTimer);
  savePendiente = false;
  try {
    const r = await apiFetch('/api/data', { method: 'PUT', body: state });
    if (currentUser && r.uso) currentUser.uso = r.uso;
  } catch (e) {
    savePendiente = true;
    if (silencioso) return;
    if (typeof toast === 'function') {
      toast(e.status === 402 ? e.message : 'No se pudieron guardar los cambios. Revisa tu conexión.', 'error');
    }
    if (e.status === 401) { location.reload(); }
  }
}

/* último intento de guardado al cerrar o cambiar de pestaña */
window.addEventListener('pagehide', () => {
  if (savePendiente && state) {
    fetch('/api/data', {
      method: 'PUT',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state),
      keepalive: true
    }).catch(() => {});
  }
});

function resetState() {
  state = defaultState();
  return flushSave();
}

/* ---------- límites del plan ---------- */

function limitePlan(tipo) {
  const lim = currentUser?.limites;
  if (!lim) return null;
  const max = tipo === 'facturas' ? lim.maxFacturas : lim.maxClientes;
  return (max === null || max === undefined) ? null : max; // null = sin límite
}

function limiteAlcanzado(tipo) {
  const max = limitePlan(tipo);
  if (max === null) return false;
  // facturas: cuenta el acumulado histórico (el servidor no descuenta las borradas)
  const n = tipo === 'facturas'
    ? Math.max(Number(currentUser?.uso?.facturas) || 0, state.facturas.length)
    : state.clientes.length;
  return n >= max;
}

/* ---------- utilidades ---------- */

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const fmtNum = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* Formatea un importe en la moneda del sistema contable activo */
function eur(n) { return _fmtMoneda.format(round2(n || 0)); }
function round2(n) { return Math.round((n + Number.EPSILON) * 100) / 100; }

function hoyISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function sumaDias(iso, dias) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + (dias || 0));
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function fechaES(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

/* ---------- cálculos de factura ---------- */

function calcLinea(l) {
  const base = round2((Number(l.cantidad) || 0) * (Number(l.precio) || 0) * (1 - (Number(l.descuento) || 0) / 100));
  const iva = round2(base * (Number(l.iva) || 0) / 100);
  return { base, iva, total: round2(base + iva) };
}

function calcFactura(f) {
  let base = 0, ivaTotal = 0;
  const porTipo = {};
  for (const l of f.lineas || []) {
    const c = calcLinea(l);
    base = round2(base + c.base);
    ivaTotal = round2(ivaTotal + c.iva);
    const k = String(Number(l.iva) || 0);
    if (!porTipo[k]) porTipo[k] = { base: 0, cuota: 0 };
    porTipo[k].base = round2(porTipo[k].base + c.base);
    porTipo[k].cuota = round2(porTipo[k].cuota + c.iva);
  }
  const irpf = round2(base * (Number(f.irpf) || 0) / 100);
  const total = round2(base + ivaTotal - irpf);
  return { base, ivaTotal, porTipo, irpf, total };
}

function estadoFactura(f) {
  if (f.estado === 'emitida' && f.vencimiento && f.vencimiento < hoyISO()) return 'vencida';
  return f.estado;
}

const ESTADO_LABEL = { borrador: 'Borrador', emitida: 'Emitida', pagada: 'Pagada', vencida: 'Vencida' };

function numeroFactura(f) {
  return `${f.serie}-${f.numero}`;
}

function clienteDe(f) {
  return state.clientes.find(c => c.id === f.clienteId) || null;
}

/* ---------- validación IBAN (mod 97) ---------- */

function validarIBAN(iban) {
  const s = (iban || '').replace(/\s+/g, '').toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let rem = 0;
  for (const ch of rearranged) {
    const v = ch >= 'A' ? (ch.charCodeAt(0) - 55).toString() : ch;
    for (const d of v) rem = (rem * 10 + Number(d)) % 97;
  }
  return rem === 1;
}

/* ---------- datos de ejemplo ---------- */

function cargarDatosEjemplo() {
  const cfg = paisCfg();
  const F = cfg.factorDemo;            // escala los importes a la moneda local
  const T = cfg.impuesto.defecto;      // tasa de impuesto por defecto del país
  const c1 = { id: uid(), nombre: 'Construcciones Martínez S.L.', nif: 'B12345678', direccion: 'Calle Mayor 15', cp: '28001', ciudad: 'Madrid', provincia: 'Madrid', email: 'admin@cmartinez.es', telefono: '910 123 456' };
  const c2 = { id: uid(), nombre: 'Estudio Creativo Luna', nif: 'B87654321', direccion: 'Av. Diagonal 220', cp: '08018', ciudad: 'Barcelona', provincia: 'Barcelona', email: 'hola@estudioluna.com', telefono: '930 654 321' };
  const c3 = { id: uid(), nombre: 'Ana García Pérez', nif: '12345678Z', direccion: 'Plaza del Sol 3, 2ºB', cp: '41001', ciudad: 'Sevilla', provincia: 'Sevilla', email: 'ana.garcia@mail.com', telefono: '600 111 222' };
  state.clientes.push(c1, c2, c3);

  state.productos.push(
    { id: uid(), nombre: 'Consultoría (hora)', descripcion: 'Servicios de consultoría profesional', precio: round2(60 * F), iva: T },
    { id: uid(), nombre: 'Desarrollo web', descripcion: 'Diseño y desarrollo de sitio web', precio: round2(1200 * F), iva: T },
    { id: uid(), nombre: 'Mantenimiento mensual', descripcion: 'Cuota de mantenimiento y soporte', precio: round2(150 * F), iva: T }
  );

  const y = new Date().getFullYear();
  const serieDemo = cfg.serieDefecto || `F-${y}`;
  const mk = (num, clienteId, fecha, estado, lineas, fechaPago) => ({
    id: uid(), serie: serieDemo, numero: String(num).padStart(cfg.padNumero || 4, '0'),
    fecha, vencimiento: sumaDias(fecha, 30), clienteId, lineas, irpf: 0,
    estado, notas: '', fechaPago: fechaPago || ''
  });
  const mm = n => `${y}-${String(n).padStart(2, '0')}`;

  state.facturas.push(
    mk(1, c1.id, `${mm(1)}-15`, 'pagada', [{ descripcion: 'Desarrollo web corporativa', cantidad: 1, precio: round2(1200 * F), descuento: 0, iva: T }], `${mm(1)}-28`),
    mk(2, c2.id, `${mm(2)}-10`, 'pagada', [{ descripcion: 'Consultoría (hora)', cantidad: 12, precio: round2(60 * F), descuento: 0, iva: T }], `${mm(2)}-25`),
    mk(3, c1.id, `${mm(3)}-05`, 'pagada', [{ descripcion: 'Mantenimiento mensual', cantidad: 3, precio: round2(150 * F), descuento: 0, iva: T }], `${mm(3)}-20`),
    mk(4, c3.id, `${mm(4)}-18`, 'pagada', [{ descripcion: 'Diseño de identidad visual', cantidad: 1, precio: round2(850 * F), descuento: 5, iva: T }], `${mm(5)}-02`),
    mk(5, c2.id, `${mm(5)}-12`, 'emitida', [{ descripcion: 'Consultoría (hora)', cantidad: 20, precio: round2(60 * F), descuento: 0, iva: T }]),
    mk(6, c1.id, `${mm(6)}-01`, 'emitida', [{ descripcion: 'Desarrollo tienda online', cantidad: 1, precio: round2(2400 * F), descuento: 0, iva: T }])
  );
  state.settings.facturacion.siguienteNumero = 7;

  const imp = b => round2(b * T / 100); // impuesto soportado del país
  state.gastos.push(
    { id: uid(), fecha: `${mm(1)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true },
    { id: uid(), fecha: `${mm(1)}-20`, concepto: 'Hosting anual', categoria: 'Servicios online', proveedor: 'OVH', base: round2(120 * F), iva: imp(120 * F), deducible: true },
    { id: uid(), fecha: `${mm(2)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true },
    { id: uid(), fecha: `${mm(2)}-14`, concepto: 'Portátil de trabajo', categoria: 'Equipamiento', proveedor: 'Tienda informática', base: round2(950 * F), iva: imp(950 * F), deducible: true },
    { id: uid(), fecha: `${mm(3)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true },
    { id: uid(), fecha: `${mm(3)}-22`, concepto: 'Asesoría contable 1T', categoria: 'Asesoría', proveedor: 'Asesores López', base: round2(90 * F), iva: imp(90 * F), deducible: true },
    { id: uid(), fecha: `${mm(4)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true },
    { id: uid(), fecha: `${mm(5)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true },
    { id: uid(), fecha: `${mm(5)}-16`, concepto: 'Licencias software', categoria: 'Servicios online', proveedor: 'Adobe', base: round2(60 * F), iva: imp(60 * F), deducible: true },
    { id: uid(), fecha: `${mm(6)}-08`, concepto: 'Seguridad social / contribuciones', categoria: 'Seguridad Social', proveedor: '', base: round2(294 * F), iva: 0, deducible: true }
  );

  if (!state.settings.empresa.nombre) {
    state.settings.empresa = {
      nombre: 'Mi Empresa S.L.', nif: 'B00000000', direccion: 'Calle Ejemplo 1',
      cp: '28000', ciudad: 'Madrid', provincia: 'Madrid',
      email: 'facturacion@miempresa.es', telefono: '600 000 000', web: 'miempresa.es', logo: ''
    };
    if (cfg.qrSepa) state.settings.pago.iban = 'ES91 2100 0418 4502 0005 1332';
    state.settings.pago.linkPago = '';
    state.settings.facturacion.serie = serieDemo;
  }
  saveState();
}
