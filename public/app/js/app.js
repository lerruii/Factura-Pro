/* ============================================================
   FacturaPro — Aplicación principal (rutas, vistas y CRUD)
   ============================================================ */

/* ---------- iconos SVG reutilizables ---------- */
const ICON = {
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  print: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
  invoice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
  users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v9"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 7l-10 10M17 17V7H7"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7l10 10M7 17h10V7"/></svg>',
  euro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10h9M4 14h7M18.5 5.5A7.5 7.5 0 0 0 8 12a7.5 7.5 0 0 0 10.5 6.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>'
};

const CATEGORIAS_GASTO = ['Seguridad Social', 'Suministros', 'Alquiler', 'Equipamiento', 'Servicios online', 'Asesoría', 'Transporte', 'Dietas', 'Marketing', 'Otros'];

/* ============================================================
   Utilidades de interfaz
   ============================================================ */

const $ = sel => document.querySelector(sel);
const view = $('#view');

function toast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = (type === 'success' ? ICON.check : ICON.trash) + `<span>${escapeHtml(msg)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; }, 3200);
  setTimeout(() => el.remove(), 3600);
}

let onModalClose = null;
function openModal(title, bodyHtml, { large = false } = {}) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHtml;
  $('#modal').classList.toggle('modal-lg', large);
  $('#modal-overlay').hidden = false;
  document.body.style.overflow = 'hidden';
  const first = $('#modal-body').querySelector('input, select, textarea, button');
  if (first) first.focus();
}
function closeModal() {
  $('#modal-overlay').hidden = true;
  document.body.style.overflow = '';
  if (onModalClose) { onModalClose(); onModalClose = null; }
}
$('#modal-close').addEventListener('click', closeModal);
$('#modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal-overlay').hidden) closeModal(); });

function confirmar(titulo, mensaje, onOk, { destructivo = true, okLabel = 'Eliminar' } = {}) {
  openModal(titulo, `
    <p style="margin:0 0 20px;color:var(--text-2)">${escapeHtml(mensaje)}</p>
    <div class="form-actions">
      <button class="btn btn-secondary" id="cf-no">Cancelar</button>
      <button class="btn ${destructivo ? 'btn-primary' : 'btn-primary'}" id="cf-si" style="${destructivo ? 'background:var(--danger);color:#fff' : ''}">${escapeHtml(okLabel)}</button>
    </div>`);
  $('#cf-no').onclick = closeModal;
  $('#cf-si').onclick = () => { closeModal(); onOk(); };
}

function descargarArchivo(nombre, contenido, tipo = 'text/plain') {
  const blob = new Blob(['﻿' + contenido], { type: tipo + ';charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(a.href);
}

function csv(filas) {
  return filas.map(f => f.map(c => {
    const s = String(c ?? '');
    return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }).join(';')).join('\r\n');
}

/* ============================================================
   Tema
   ============================================================ */

function aplicarTema() {
  const tema = state?.settings?.tema || 'light';
  document.documentElement.dataset.theme = tema;
  $('#theme-toggle .theme-label').textContent = tema === 'dark' ? 'Tema claro' : 'Tema oscuro';
}
$('#theme-toggle').addEventListener('click', () => {
  if (!state) return;
  state.settings.tema = state.settings.tema === 'dark' ? 'light' : 'dark';
  saveState();
  aplicarTema();
});
$('#logout-btn').addEventListener('click', () => cerrarSesion());

/* ============================================================
   Router
   ============================================================ */

const TITULOS = {
  panel: 'Panel', facturas: 'Facturas', clientes: 'Clientes', productos: 'Productos',
  gastos: 'Gastos', contabilidad: 'Contabilidad', ajustes: 'Ajustes', cuenta: 'Mi cuenta',
  admin: 'Administración'
};

function navegar() {
  if (!state) return; // aún sin sesión iniciada
  const hash = location.hash.replace(/^#\//, '') || 'panel';
  const [ruta, accion, id] = hash.split('/');

  document.querySelectorAll('.nav-item[data-route]').forEach(el =>
    el.classList.toggle('active', el.dataset.route === ruta));
  cerrarSidebar();
  $('#topbar-actions').innerHTML = '';

  if (ruta === 'facturas' && accion === 'nueva') return vistaEditorFactura(null);
  if (ruta === 'facturas' && accion === 'editar') return vistaEditorFactura(id);
  if (ruta === 'facturas' && accion === 'ver') return vistaFactura(id);

  const vistas = {
    panel: vistaPanel, facturas: vistaFacturas, clientes: vistaClientes,
    productos: vistaProductos, gastos: vistaGastos,
    contabilidad: vistaContabilidad, ajustes: vistaAjustes, cuenta: vistaCuenta,
    admin: vistaAdmin
  };
  $('#topbar-title').textContent = TITULOS[ruta] || 'Panel';
  (vistas[ruta] || vistaPanel)();
  view.scrollTop = 0;
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navegar);

/* sidebar móvil */
$('#menu-btn').addEventListener('click', () => {
  $('#sidebar').classList.add('open');
  $('#sidebar-scrim').hidden = false;
});
$('#sidebar-scrim').addEventListener('click', cerrarSidebar);
function cerrarSidebar() {
  $('#sidebar').classList.remove('open');
  $('#sidebar-scrim').hidden = true;
}

/* ============================================================
   VISTA: Panel
   ============================================================ */

function vistaPanel() {
  const y = new Date().getFullYear();
  const facturasNoBorrador = state.facturas.filter(f => f.estado !== 'borrador');
  const delAño = facturasNoBorrador.filter(f => f.fecha.startsWith(String(y)));
  const gastosAño = state.gastos.filter(g => g.fecha.startsWith(String(y)));

  const ingresos = delAño.reduce((a, f) => a + calcFactura(f).base, 0);
  const gastos = gastosAño.reduce((a, g) => a + (Number(g.base) || 0), 0);
  const resultado = ingresos - gastos;
  const pendientes = facturasNoBorrador.filter(f => f.estado === 'emitida');
  const pendiente = pendientes.reduce((a, f) => a + calcFactura(f).total, 0);
  const vencidas = pendientes.filter(f => estadoFactura(f) === 'vencida');

  if (!state.facturas.length && !state.clientes.length && !state.gastos.length) {
    view.innerHTML = `
      <div class="card card-pad empty" style="max-width:560px;margin:8vh auto">
        ${ICON.invoice}
        <h3>Bienvenido a FacturaPro</h3>
        <p>Lleva la contabilidad de tu empresa y emite facturas con QR de pago.<br>
        Empieza configurando tus datos o carga un ejemplo para explorar.</p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
          <a href="#/ajustes" class="btn btn-primary">Configurar mi empresa</a>
          <button class="btn btn-secondary" id="btn-demo">Cargar datos de ejemplo</button>
        </div>
      </div>`;
    $('#btn-demo').onclick = () => { cargarDatosEjemplo(); toast('Datos de ejemplo cargados'); navegar(); };
    return;
  }

  // series mensuales
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const ingMes = Array(12).fill(0), gasMes = Array(12).fill(0);
  delAño.forEach(f => { ingMes[Number(f.fecha.slice(5, 7)) - 1] += calcFactura(f).base; });
  gastosAño.forEach(g => { gasMes[Number(g.fecha.slice(5, 7)) - 1] += Number(g.base) || 0; });

  const recientes = [...state.facturas].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 6);

  // gastos por categoría
  const porCat = {};
  gastosAño.forEach(g => { porCat[g.categoria || 'Otros'] = (porCat[g.categoria || 'Otros'] || 0) + (Number(g.base) || 0); });
  const cats = Object.entries(porCat).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 7);

  $('#topbar-actions').innerHTML = `<a href="#/facturas/nueva" class="btn btn-primary">${ICON.plus} Nueva factura</a>`;

  view.innerHTML = `
    ${vencidas.length ? `<div class="card card-pad" style="border-color:var(--danger);margin-bottom:20px;display:flex;gap:12px;align-items:center;flex-wrap:wrap">
      <span style="color:var(--danger);display:inline-flex">${ICON.clock}</span>
      <b>${vencidas.length} factura${vencidas.length > 1 ? 's' : ''} vencida${vencidas.length > 1 ? 's' : ''}</b>
      <span style="color:var(--text-2)">por un total de ${eur(vencidas.reduce((a, f) => a + calcFactura(f).total, 0))}</span>
      <a href="#/facturas" class="btn btn-sm btn-secondary" style="margin-left:auto">Ver facturas</a>
    </div>` : ''}

    <div class="grid-kpi">
      <div class="card kpi"><div class="kpi-label">${ICON.up} Ingresos ${y}</div><div class="kpi-value">${eur(ingresos)}</div><div class="kpi-hint">Base imponible facturada</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.down} Gastos ${y}</div><div class="kpi-value">${eur(gastos)}</div><div class="kpi-hint">Base imponible</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.euro} Resultado</div><div class="kpi-value ${resultado >= 0 ? 'pos' : 'neg'}">${eur(resultado)}</div><div class="kpi-hint">Ingresos − gastos</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.clock} Pendiente de cobro</div><div class="kpi-value">${eur(pendiente)}</div><div class="kpi-hint">${pendientes.length} factura${pendientes.length === 1 ? '' : 's'} emitida${pendientes.length === 1 ? '' : 's'}</div></div>
    </div>

    <div class="grid-2">
      <div class="card card-pad">
        <div class="card-title">Ingresos y gastos por mes</div>
        <p class="card-sub">Año ${y} · bases imponibles</p>
        <div id="chart-meses"></div>
      </div>
      <div class="stack">
        <div class="card card-pad">
          <div class="card-title">Gastos por categoría</div>
          <p class="card-sub">Año ${y}</p>
          <div id="chart-cats"></div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-pad" style="padding-bottom:0"><div class="card-title">Facturas recientes</div></div>
      ${recientes.length ? `<div class="table-wrap"><table class="data">
        <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th class="num">Total</th><th>Estado</th></tr></thead>
        <tbody>${recientes.map(f => {
          const t = calcFactura(f); const est = estadoFactura(f);
          return `<tr class="row-click" onclick="location.hash='#/facturas/ver/${f.id}'">
            <td class="mono">${escapeHtml(numeroFactura(f))}</td>
            <td>${escapeHtml(clienteDe(f)?.nombre || '—')}</td>
            <td>${fechaES(f.fecha)}</td>
            <td class="num">${eur(t.total)}</td>
            <td><span class="chip chip-${est}">${ESTADO_LABEL[est]}</span></td></tr>`;
        }).join('')}</tbody></table></div>`
      : `<div class="empty" style="padding:32px">${ICON.invoice}<p>Aún no hay facturas.</p><a href="#/facturas/nueva" class="btn btn-primary btn-sm">Crear la primera</a></div>`}
    </div>`;

  renderGroupedBars($('#chart-meses'), {
    labels: meses,
    ariaLabel: `Ingresos y gastos mensuales de ${y}`,
    series: [
      { name: 'Ingresos', color: 'var(--chart-1)', values: ingMes.map(round2) },
      { name: 'Gastos', color: 'var(--chart-2)', values: gasMes.map(round2) }
    ]
  });
  renderHBars($('#chart-cats'), cats);
}

/* ============================================================
   VISTA: Facturas (listado)
   ============================================================ */

let filtroFacturas = { estado: 'todas', q: '' };

function vistaFacturas() {
  $('#topbar-actions').innerHTML = `<a href="#/facturas/nueva" class="btn btn-primary">${ICON.plus} Nueva factura</a>`;

  view.innerHTML = `
    <div class="list-toolbar">
      <div class="search-box">${ICON.search}<input type="search" id="f-busca" placeholder="Buscar por número o cliente…" value="${escapeHtml(filtroFacturas.q)}" aria-label="Buscar facturas"></div>
      <div class="seg" role="group" aria-label="Filtrar por estado" id="f-seg">
        ${['todas', 'borrador', 'emitida', 'vencida', 'pagada'].map(e =>
          `<button data-est="${e}" class="${filtroFacturas.estado === e ? 'active' : ''}">${e === 'todas' ? 'Todas' : ESTADO_LABEL[e]}</button>`).join('')}
      </div>
    </div>
    <div class="card" id="f-lista"></div>`;

  $('#f-busca').addEventListener('input', e => { filtroFacturas.q = e.target.value; pintarListaFacturas(); });
  $('#f-seg').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    filtroFacturas.estado = b.dataset.est;
    $('#f-seg').querySelectorAll('button').forEach(x => x.classList.toggle('active', x === b));
    pintarListaFacturas();
  });
  pintarListaFacturas();
}

function pintarListaFacturas() {
  const q = filtroFacturas.q.trim().toLowerCase();
  let lista = [...state.facturas].sort((a, b) => (b.fecha + b.numero).localeCompare(a.fecha + a.numero));
  if (filtroFacturas.estado !== 'todas') lista = lista.filter(f => estadoFactura(f) === filtroFacturas.estado);
  if (q) lista = lista.filter(f =>
    numeroFactura(f).toLowerCase().includes(q) ||
    (clienteDe(f)?.nombre || '').toLowerCase().includes(q));

  const cont = $('#f-lista');
  if (!lista.length) {
    cont.innerHTML = `<div class="empty">${ICON.invoice}<h3>No hay facturas</h3><p>${q || filtroFacturas.estado !== 'todas' ? 'Prueba con otro filtro o búsqueda.' : 'Crea tu primera factura para empezar.'}</p><a href="#/facturas/nueva" class="btn btn-primary btn-sm">${ICON.plus} Nueva factura</a></div>`;
    return;
  }
  cont.innerHTML = `<div class="table-wrap"><table class="data">
    <thead><tr><th>Número</th><th>Cliente</th><th>Fecha</th><th>Vencimiento</th><th class="num">Total</th><th>Estado</th><th></th></tr></thead>
    <tbody>${lista.map(f => {
      const t = calcFactura(f); const est = estadoFactura(f);
      return `<tr>
        <td class="mono"><a href="#/facturas/ver/${f.id}" style="text-decoration:none;font-weight:600">${escapeHtml(numeroFactura(f))}</a></td>
        <td>${escapeHtml(clienteDe(f)?.nombre || '—')}</td>
        <td>${fechaES(f.fecha)}</td>
        <td>${fechaES(f.vencimiento)}</td>
        <td class="num">${eur(t.total)}</td>
        <td><span class="chip chip-${est}">${ESTADO_LABEL[est]}</span></td>
        <td class="actions">
          <button class="btn-icon" title="Ver factura" aria-label="Ver factura" onclick="location.hash='#/facturas/ver/${f.id}'">${ICON.eye}</button>
          ${est !== 'pagada' ? `<button class="btn-icon" title="Marcar como pagada" aria-label="Marcar pagada" onclick="marcarPagada('${f.id}')" style="color:var(--success)">${ICON.check}</button>` : ''}
          <button class="btn-icon" title="Editar" aria-label="Editar" onclick="location.hash='#/facturas/editar/${f.id}'">${ICON.edit}</button>
          <button class="btn-icon" title="Duplicar" aria-label="Duplicar" onclick="duplicarFactura('${f.id}')">${ICON.copy}</button>
          <button class="btn-icon" title="Eliminar" aria-label="Eliminar" style="color:var(--danger)" onclick="eliminarFactura('${f.id}')">${ICON.trash}</button>
        </td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function marcarPagada(id) {
  const f = state.facturas.find(x => x.id === id); if (!f) return;
  f.estado = 'pagada';
  f.fechaPago = hoyISO();
  saveState();
  toast(`Factura ${numeroFactura(f)} marcada como pagada`);
  navegar();
}

function modalLimite(tipo) {
  const max = limitePlan(tipo);
  openModal('Límite del plan Gratis', `
    <p style="margin:0 0 8px;color:var(--text-2)">Has llegado al máximo de <b>${max} ${tipo}</b> del plan Gratis${tipo === 'facturas' ? ' (el contador es acumulado: las facturas eliminadas también cuentan)' : ''}.</p>
    <p style="margin:0 0 20px;color:var(--text-2)">Pasa al plan <b>Pro</b> para ${tipo === 'facturas' ? 'facturar' : 'añadir clientes'} sin límites.</p>
    <div class="form-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Ahora no</button>
      <a class="btn btn-primary" href="#/cuenta" onclick="closeModal()">Ver planes</a>
    </div>`);
}

function duplicarFactura(id) {
  const f = state.facturas.find(x => x.id === id); if (!f) return;
  if (limiteAlcanzado('facturas')) return modalLimite('facturas');
  const fac = state.settings.facturacion;
  const copia = structuredClone(f);
  copia.id = uid();
  copia.serie = fac.serie;
  copia.numero = String(fac.siguienteNumero).padStart(paisCfg().padNumero || 4, '0');
  copia.fecha = hoyISO();
  copia.vencimiento = sumaDias(copia.fecha, fac.diasVencimiento);
  copia.estado = 'borrador';
  copia.fechaPago = '';
  fac.siguienteNumero++;
  state.facturas.push(copia);
  saveState();
  toast(`Duplicada como ${numeroFactura(copia)}`);
  location.hash = `#/facturas/editar/${copia.id}`;
}

function eliminarFactura(id) {
  const f = state.facturas.find(x => x.id === id); if (!f) return;
  confirmar('Eliminar factura', `¿Eliminar la factura ${numeroFactura(f)}? Esta acción no se puede deshacer.`, () => {
    state.facturas = state.facturas.filter(x => x.id !== id);
    saveState();
    toast('Factura eliminada');
    if (location.hash.includes('/ver/') || location.hash.includes('/editar/')) location.hash = '#/facturas';
    else navegar();
  });
}

/* ============================================================
   VISTA: Editor de factura
   ============================================================ */

let draft = null;

function vistaEditorFactura(id) {
  const fac = state.settings.facturacion;
  const cfg = paisCfg();
  const imp = cfg.impuesto;
  const ret = cfg.retencion;
  const existente = id ? state.facturas.find(f => f.id === id) : null;
  if (id && !existente) { location.hash = '#/facturas'; return; }
  if (!existente && limiteAlcanzado('facturas')) {
    location.hash = '#/facturas';
    modalLimite('facturas');
    return;
  }

  draft = existente ? structuredClone(existente) : {
    id: uid(),
    serie: fac.serie,
    numero: String(fac.siguienteNumero).padStart(cfg.padNumero || 4, '0'),
    fecha: hoyISO(),
    vencimiento: sumaDias(hoyISO(), fac.diasVencimiento),
    clienteId: '',
    lineas: [{ descripcion: '', cantidad: 1, precio: 0, descuento: 0, iva: fac.ivaDefecto }],
    irpf: fac.irpfDefecto,
    estado: 'borrador',
    notas: '',
    fechaPago: '',
    extras: {}
  };
  // campos fiscales del país (forma de pago, uso CFDI…) con su primera opción
  if (!draft.extras) draft.extras = {};
  (cfg.camposFactura || []).forEach(c => {
    if (!draft.extras[c.campo]) draft.extras[c.campo] = c.opciones[0];
  });
  const esNueva = !existente;

  $('#topbar-title').textContent = esNueva ? 'Nueva factura' : `Editar ${numeroFactura(draft)}`;
  $('#topbar-actions').innerHTML = '';

  if (!state.clientes.length) {
    view.innerHTML = `<div class="card card-pad empty" style="max-width:520px;margin:6vh auto">${ICON.users}
      <h3>Primero necesitas un cliente</h3><p>Crea al menos un cliente para poder facturarle.</p>
      <a href="#/clientes" class="btn btn-primary">Ir a clientes</a></div>`;
    return;
  }

  view.innerHTML = `
    <form id="form-factura" novalidate>
      <div class="card card-pad" style="margin-bottom:20px">
        <div class="form-grid-3">
          <div class="field">
            <label for="fe-cliente">Cliente <span class="req">*</span></label>
            <select id="fe-cliente" required>
              <option value="">— Selecciona cliente —</option>
              ${state.clientes.map(c => `<option value="${c.id}" ${draft.clienteId === c.id ? 'selected' : ''}>${escapeHtml(c.nombre)}</option>`).join('')}
            </select>
            <div class="error-msg" id="err-cliente" hidden>Selecciona un cliente.</div>
          </div>
          <div class="field">
            <label for="fe-numero">Número</label>
            <input id="fe-numero" class="mono" value="${escapeHtml(draft.serie + '-' + draft.numero)}" disabled>
            <div class="help">Serie configurable en Ajustes</div>
          </div>
          <div class="field">
            <label for="fe-estado">Estado</label>
            <select id="fe-estado">
              <option value="borrador" ${draft.estado === 'borrador' ? 'selected' : ''}>Borrador</option>
              <option value="emitida" ${draft.estado === 'emitida' ? 'selected' : ''}>Emitida</option>
              <option value="pagada" ${draft.estado === 'pagada' ? 'selected' : ''}>Pagada</option>
            </select>
          </div>
          <div class="field">
            <label for="fe-fecha">Fecha <span class="req">*</span></label>
            <input type="date" id="fe-fecha" value="${draft.fecha}" required>
          </div>
          <div class="field">
            <label for="fe-venc">Vencimiento</label>
            <input type="date" id="fe-venc" value="${draft.vencimiento}">
          </div>
          ${ret ? `<div class="field">
            <label for="fe-irpf">${ret.etiqueta} (%)</label>
            <select id="fe-irpf">
              ${ret.tasas.map(v => `<option value="${v}" ${Number(draft.irpf) === v ? 'selected' : ''}>${v} %</option>`).join('')}
            </select>
            <div class="help">${escapeHtml(ret.ayuda)}</div>
          </div>` : ''}
          ${(cfg.camposFactura || []).map(c => `
          <div class="field">
            <label for="fe-x-${c.campo}">${escapeHtml(c.etiqueta)}</label>
            <select id="fe-x-${c.campo}" data-extra="${c.campo}">
              ${c.opciones.map(o => `<option ${draft.extras[c.campo] === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
            </select>
          </div>`).join('')}
        </div>
      </div>

      <div class="card card-pad" style="margin-bottom:20px">
        <div class="card-title" style="margin-bottom:14px">Conceptos</div>
        ${state.productos.length ? `
        <div class="field" style="max-width:380px;margin-bottom:14px">
          <label for="fe-prod">Añadir desde catálogo</label>
          <select id="fe-prod">
            <option value="">— Elegir producto o servicio —</option>
            ${state.productos.map(p => `<option value="${p.id}">${escapeHtml(p.nombre)} · ${eur(p.precio)}</option>`).join('')}
          </select>
        </div>` : ''}
        <div class="table-wrap">
          <table class="lines-table" id="fe-lineas">
            <thead><tr>
              <th class="col-desc">Descripción</th><th class="col-qty">Cant.</th>
              <th class="col-price">Precio ${simboloMoneda()}</th><th class="col-dto">Dto. %</th>
              <th class="col-iva">${imp.nombre}</th><th class="col-total" style="text-align:right">Importe</th><th class="col-del"></th>
            </tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" id="fe-add" style="margin-top:10px">${ICON.plus} Añadir línea</button>
        <div class="totals-box" id="fe-totales"></div>
      </div>

      <div class="card card-pad" style="margin-bottom:20px">
        <div class="field">
          <label for="fe-notas">Notas (aparecen al pie de la factura)</label>
          <textarea id="fe-notas" placeholder="Condiciones, forma de pago, texto legal…">${escapeHtml(draft.notas)}</textarea>
        </div>
      </div>

      <div class="form-actions">
        <a href="${esNueva ? '#/facturas' : '#/facturas/ver/' + draft.id}" class="btn btn-secondary">Cancelar</a>
        <button type="submit" class="btn btn-primary">${ICON.check} ${esNueva ? 'Crear factura' : 'Guardar cambios'}</button>
      </div>
    </form>`;

  pintarLineas();

  $('#fe-add').onclick = () => {
    draft.lineas.push({ descripcion: '', cantidad: 1, precio: 0, descuento: 0, iva: fac.ivaDefecto });
    pintarLineas();
    const rows = view.querySelectorAll('#fe-lineas tbody tr');
    rows[rows.length - 1].querySelector('input').focus();
  };

  const prodSel = $('#fe-prod');
  if (prodSel) prodSel.addEventListener('change', () => {
    const p = state.productos.find(x => x.id === prodSel.value);
    if (!p) return;
    const vacia = draft.lineas.find(l => !l.descripcion && !Number(l.precio));
    const linea = { descripcion: p.nombre + (p.descripcion ? ' — ' + p.descripcion : ''), cantidad: 1, precio: p.precio, descuento: 0, iva: p.iva };
    if (vacia) Object.assign(vacia, linea); else draft.lineas.push(linea);
    prodSel.value = '';
    pintarLineas();
  });

  const irpfSel = $('#fe-irpf');
  if (irpfSel) irpfSel.addEventListener('change', e => { draft.irpf = Number(e.target.value); pintarTotales(); });
  view.querySelectorAll('[data-extra]').forEach(sel =>
    sel.addEventListener('change', e => { draft.extras[e.target.dataset.extra] = e.target.value; }));
  $('#fe-fecha').addEventListener('change', e => {
    draft.fecha = e.target.value;
    draft.vencimiento = sumaDias(draft.fecha, fac.diasVencimiento);
    $('#fe-venc').value = draft.vencimiento;
  });
  $('#fe-venc').addEventListener('change', e => { draft.vencimiento = e.target.value; });
  $('#fe-cliente').addEventListener('change', e => {
    draft.clienteId = e.target.value;
    e.target.classList.remove('invalid');
    $('#err-cliente').hidden = true;
  });
  $('#fe-estado').addEventListener('change', e => { draft.estado = e.target.value; });
  $('#fe-notas').addEventListener('input', e => { draft.notas = e.target.value; });

  $('#form-factura').addEventListener('submit', e => {
    e.preventDefault();
    if (!draft.clienteId) {
      $('#fe-cliente').classList.add('invalid');
      $('#err-cliente').hidden = false;
      $('#fe-cliente').focus();
      return;
    }
    draft.lineas = draft.lineas.filter(l => l.descripcion.trim() || Number(l.precio));
    if (!draft.lineas.length) { toast('Añade al menos un concepto', 'error'); return; }
    if (draft.estado === 'pagada' && !draft.fechaPago) draft.fechaPago = hoyISO();

    const idx = state.facturas.findIndex(f => f.id === draft.id);
    if (idx >= 0) state.facturas[idx] = draft;
    else {
      state.facturas.push(draft);
      state.settings.facturacion.siguienteNumero++;
    }
    saveState();
    toast(`Factura ${numeroFactura(draft)} guardada`);
    location.hash = '#/facturas/ver/' + draft.id;
  });
}

function pintarLineas() {
  const imp = paisCfg().impuesto;
  const tbody = view.querySelector('#fe-lineas tbody');
  tbody.innerHTML = draft.lineas.map((l, i) => {
    const c = calcLinea(l);
    // tasas fijas → selector; tasa libre (p. ej. Sales Tax por estado) → campo numérico
    const celImpuesto = imp.tasas === null
      ? `<input data-f="iva" type="number" step="0.001" min="0" max="30" value="${l.iva}" aria-label="${imp.nombre} %">`
      : `<select data-f="iva" aria-label="Tipo de ${imp.nombre}">${imp.tasas.map(v => `<option value="${v}" ${Number(l.iva) === v ? 'selected' : ''}>${v} %</option>`).join('')}</select>`;
    return `<tr data-i="${i}">
      <td class="col-desc"><input data-f="descripcion" value="${escapeHtml(l.descripcion)}" placeholder="Descripción del concepto" aria-label="Descripción línea ${i + 1}"></td>
      <td class="col-qty"><input data-f="cantidad" type="number" step="any" min="0" value="${l.cantidad}" aria-label="Cantidad"></td>
      <td class="col-price"><input data-f="precio" type="number" step="0.01" min="0" value="${l.precio}" aria-label="Precio unitario"></td>
      <td class="col-dto"><input data-f="descuento" type="number" step="any" min="0" max="100" value="${l.descuento}" aria-label="Descuento"></td>
      <td class="col-iva">${celImpuesto}</td>
      <td class="col-total"><span data-total>${eur(c.base)}</span></td>
      <td class="col-del">${draft.lineas.length > 1 ? `<button type="button" class="btn-icon" data-del title="Quitar línea" aria-label="Quitar línea" style="color:var(--danger)">${ICON.trash}</button>` : ''}</td>
    </tr>`;
  }).join('');

  tbody.querySelectorAll('input, select').forEach(el => {
    el.addEventListener('input', e => {
      const tr = e.target.closest('tr');
      const i = Number(tr.dataset.i);
      const f = e.target.dataset.f;
      draft.lineas[i][f] = f === 'descripcion' ? e.target.value : Number(e.target.value);
      tr.querySelector('[data-total]').textContent = eur(calcLinea(draft.lineas[i]).base);
      pintarTotales();
    });
  });
  tbody.querySelectorAll('[data-del]').forEach(b => {
    b.addEventListener('click', e => {
      draft.lineas.splice(Number(e.target.closest('tr').dataset.i), 1);
      pintarLineas();
    });
  });
  pintarTotales();
}

function pintarTotales() {
  const cfg = paisCfg();
  const t = calcFactura(draft);
  const box = $('#fe-totales');
  box.innerHTML = `
    <div class="t-row"><span>${cfg.baseLabel}</span><span>${eur(t.base)}</span></div>
    ${Object.entries(t.porTipo).filter(([k, v]) => v.cuota > 0).map(([k, v]) =>
      `<div class="t-row"><span>${cfg.impuesto.nombre} ${k} % s/ ${eur(v.base)}</span><span>${eur(v.cuota)}</span></div>`).join('')}
    ${t.irpf > 0 ? `<div class="t-row"><span>${cfg.retencion?.etiqueta || 'Retención'} ${draft.irpf} %</span><span>−${eur(t.irpf)}</span></div>` : ''}
    <div class="t-row t-total"><span>Total</span><span>${eur(t.total)}</span></div>`;
}

/* ============================================================
   VISTA: Factura (documento + QR)
   ============================================================ */

function vistaFactura(id) {
  const f = state.facturas.find(x => x.id === id);
  if (!f) { location.hash = '#/facturas'; return; }
  const est = estadoFactura(f);
  const t = calcFactura(f);

  $('#topbar-title').textContent = `Factura ${numeroFactura(f)}`;
  $('#topbar-actions').innerHTML = '';

  const doc = htmlFacturaDoc(f);

  view.innerHTML = `
    <div class="invoice-screen-bar">
      <a href="#/facturas" class="btn btn-ghost">&larr; Facturas</a>
      <span class="chip chip-${est}">${ESTADO_LABEL[est]}</span>
      <span class="spacer"></span>
      ${est !== 'pagada' ? `<button class="btn btn-secondary" onclick="marcarPagada('${f.id}')" style="color:var(--success)">${ICON.check} Marcar pagada</button>` : ''}
      <a class="btn btn-secondary" href="#/facturas/editar/${f.id}">${ICON.edit} Editar</a>
      <button class="btn btn-primary" id="btn-imprimir">${ICON.print} Imprimir / PDF</button>
    </div>
    ${doc}`;

  $('#btn-imprimir').onclick = () => imprimirFactura(f);
}

function htmlFacturaDoc(f) {
  const cfg = paisCfg();
  const L = docLabels();
  const imp = cfg.impuesto;
  const e = state.settings.empresa;
  const c = clienteDe(f);
  const t = calcFactura(f);
  const pago = datosPagoFactura(f, t);
  const pie = state.settings.pago.textoPie;

  const dir = p => [p.direccion, [p.cp, p.ciudad].filter(Boolean).join(' '), p.provincia].filter(Boolean).join(' · ');

  return `
  <article class="invoice-doc" aria-label="${escapeHtml(cfg.docTitulo)} ${escapeHtml(numeroFactura(f))}">
    <header class="inv-head">
      <div class="inv-emisor">
        ${e.logo ? `<img class="inv-logo" src="${e.logo}" alt="Logotipo de ${escapeHtml(e.nombre)}">` : ''}
        <h2>${escapeHtml(e.nombre || 'Configura tu empresa en Ajustes')}</h2>
        ${e.nif ? `<p>${escapeHtml(cfg.taxId)}: ${escapeHtml(e.nif)}</p>` : ''}
        ${dir(e) ? `<p>${escapeHtml(dir(e))}</p>` : ''}
        <p>${[e.email, e.telefono, e.web].filter(Boolean).map(escapeHtml).join(' · ')}</p>
        ${e.infoLegal ? `<p style="white-space:pre-line;margin-top:5px">${escapeHtml(e.infoLegal)}</p>` : ''}
      </div>
      <div class="inv-title">
        <div class="doc-type">${escapeHtml(cfg.docTitulo)}</div>
        <div class="doc-num">${escapeHtml(numeroFactura(f))}</div>
        <div class="inv-meta">
          <div class="mrow"><span>${L.fecha}:</span><b>${fechaES(f.fecha)}</b></div>
          <div class="mrow"><span>${L.venc}:</span><b>${fechaES(f.vencimiento)}</b></div>
          ${f.estado === 'pagada' && f.fechaPago ? `<div class="mrow"><span>${L.pagadaEl}:</span><b>${fechaES(f.fechaPago)}</b></div>` : ''}
          ${(cfg.camposFactura || []).map(cx => f.extras?.[cx.campo]
            ? `<div class="mrow"><span>${escapeHtml(cx.etiqueta)}:</span><b>${escapeHtml(f.extras[cx.campo])}</b></div>` : '').join('')}
        </div>
      </div>
    </header>

    <div class="inv-parties">
      <div class="inv-party">
        <h4>${L.facturarA}</h4>
        <div class="p-name">${escapeHtml(c?.nombre || '—')}</div>
        ${c?.nif ? `<p>${escapeHtml(cfg.taxId)}: ${escapeHtml(c.nif)}</p>` : ''}
        ${c && dir(c) ? `<p>${escapeHtml(dir(c))}</p>` : ''}
        ${c?.email ? `<p>${escapeHtml(c.email)}</p>` : ''}
      </div>
    </div>

    <table class="inv-lines">
      <thead><tr>
        <th style="width:46%">${L.concepto}</th><th class="num">${L.cant}</th><th class="num">${L.precio}</th>
        <th class="num">${L.dto}</th><th class="num">${escapeHtml(imp.nombre)}</th><th class="num">${L.importe}</th>
      </tr></thead>
      <tbody>
        ${f.lineas.map(l => {
          const cl = calcLinea(l);
          return `<tr>
            <td>${escapeHtml(l.descripcion)}</td>
            <td class="num">${Number(l.cantidad).toLocaleString(cfg.locale)}</td>
            <td class="num">${eur(l.precio)}</td>
            <td class="num">${Number(l.descuento) ? l.descuento + ' %' : '—'}</td>
            <td class="num">${l.iva} %</td>
            <td class="num">${eur(cl.base)}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="inv-bottom">
      <div class="inv-pay">
        ${pago.tipo ? `
        <h4>${L.formaPago}</h4>
        <div class="pay-grid">
          ${pago.qr ? `<div class="inv-qr">${pago.qr}<div class="qr-cap">${pago.tipo === 'sepa' ? L.escanea : L.escaneaPagar}</div></div>` : ''}
          <div class="inv-pay-data">
            ${pago.iban ? `<p><b>${L.transferencia}</b><br>IBAN: <b class="mono">${escapeHtml(pago.iban)}</b>${state.settings.pago.bic ? `<br>BIC: ${escapeHtml(state.settings.pago.bic)}` : ''}<br>${L.conceptoPago}: ${escapeHtml(pago.concepto)}</p>` : ''}
            ${pago.datosCuenta && !pago.iban ? `<p><b>${L.datosPago}</b><br><span style="white-space:pre-line">${escapeHtml(pago.datosCuenta)}</span><br>${L.conceptoPago}: ${escapeHtml(pago.concepto)}</p>` : ''}
            ${pago.link ? `<p><b>${L.pagoOnline}</b><br><a class="pay-link" href="${escapeHtml(pago.link)}" target="_blank" rel="noopener">${escapeHtml(pago.link)}</a></p>` : ''}
          </div>
        </div>` : `<h4>${L.formaPago}</h4><p style="color:#64748B;font-size:12.5px;margin:0">${L.configuraPago}</p>`}
      </div>
      <div class="inv-totals">
        <div class="t-row"><span>${escapeHtml(cfg.baseLabel)}</span><span>${eur(t.base)}</span></div>
        ${Object.entries(t.porTipo).filter(([k, v]) => v.cuota > 0).map(([k, v]) =>
          `<div class="t-row"><span>${escapeHtml(imp.nombre)} ${k} %</span><span>${eur(v.cuota)}</span></div>`).join('')}
        ${t.irpf > 0 ? `<div class="t-row"><span>${escapeHtml(cfg.retencion?.etiqueta || 'Retención')} ${f.irpf} %</span><span>−${eur(t.irpf)}</span></div>` : ''}
        <div class="t-row t-total"><span>${L.total}</span><span>${eur(t.total)}</span></div>
      </div>
    </div>

    ${cfg.letras ? `<div class="inv-letras">${escapeHtml(importeEnLetras(t.total))}</div>` : ''}

    ${(() => {
      // leyenda legal automática cuando hay conceptos exentos / tasa 0
      const hayExenta = cfg.leyendaExenta && f.lineas.some(l => Number(l.iva) === 0);
      const notasPie = [hayExenta ? cfg.leyendaExenta : '', f.notas, pie].filter(Boolean).join('\n');
      return notasPie ? `<div class="inv-notes">${escapeHtml(notasPie)}</div>` : '';
    })()}
  </article>`;
}

function imprimirFactura(f) {
  const root = $('#print-root');
  root.innerHTML = htmlFacturaDoc(f);
  root.hidden = false;
  document.body.classList.add('print-invoice');
  const limpiar = () => {
    document.body.classList.remove('print-invoice');
    root.hidden = true;
    root.innerHTML = '';
    window.removeEventListener('afterprint', limpiar);
  };
  window.addEventListener('afterprint', limpiar);
  window.print();
}

/* ============================================================
   VISTA: Clientes
   ============================================================ */

function vistaClientes() {
  $('#topbar-actions').innerHTML = `<button class="btn btn-primary" onclick="editarCliente()">${ICON.plus} Nuevo cliente</button>`;
  view.innerHTML = `<div class="card" id="c-lista"></div>`;

  const cont = $('#c-lista');
  if (!state.clientes.length) {
    cont.innerHTML = `<div class="empty">${ICON.users}<h3>Sin clientes</h3><p>Añade tu primer cliente para poder facturarle.</p>
      <button class="btn btn-primary btn-sm" onclick="editarCliente()">${ICON.plus} Nuevo cliente</button></div>`;
    return;
  }
  cont.innerHTML = `<div class="table-wrap"><table class="data">
    <thead><tr><th>Nombre</th><th>${paisCfg().taxId}</th><th>Localidad</th><th>Contacto</th><th class="num">Facturado</th><th></th></tr></thead>
    <tbody>${[...state.clientes].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(c => {
      const total = state.facturas.filter(f => f.clienteId === c.id && f.estado !== 'borrador')
        .reduce((a, f) => a + calcFactura(f).total, 0);
      return `<tr>
        <td style="font-weight:600">${escapeHtml(c.nombre)}</td>
        <td class="mono">${escapeHtml(c.nif || '—')}</td>
        <td>${escapeHtml([c.ciudad, c.provincia].filter(Boolean).join(', ') || '—')}</td>
        <td>${escapeHtml(c.email || c.telefono || '—')}</td>
        <td class="num">${eur(total)}</td>
        <td class="actions">
          <button class="btn-icon" title="Editar" aria-label="Editar cliente" onclick="editarCliente('${c.id}')">${ICON.edit}</button>
          <button class="btn-icon" title="Eliminar" aria-label="Eliminar cliente" style="color:var(--danger)" onclick="eliminarCliente('${c.id}')">${ICON.trash}</button>
        </td></tr>`;
    }).join('')}</tbody></table></div>`;
}

function editarCliente(id) {
  const c = id ? state.clientes.find(x => x.id === id) : null;
  if (!c && limiteAlcanzado('clientes')) return modalLimite('clientes');
  openModal(c ? 'Editar cliente' : 'Nuevo cliente', `
    <form id="form-cliente" novalidate>
      <div class="form-grid">
        <div class="field full"><label>Nombre o razón social <span class="req">*</span></label><input id="cl-nombre" required value="${escapeHtml(c?.nombre || '')}"></div>
        <div class="field"><label>${paisCfg().taxId}</label><input id="cl-nif" value="${escapeHtml(c?.nif || '')}"></div>
        <div class="field"><label>Teléfono</label><input id="cl-tel" type="tel" value="${escapeHtml(c?.telefono || '')}"></div>
        <div class="field full"><label>Dirección</label><input id="cl-dir" value="${escapeHtml(c?.direccion || '')}"></div>
        <div class="field"><label>Código postal</label><input id="cl-cp" inputmode="numeric" value="${escapeHtml(c?.cp || '')}"></div>
        <div class="field"><label>Ciudad</label><input id="cl-ciudad" value="${escapeHtml(c?.ciudad || '')}"></div>
        <div class="field"><label>Provincia</label><input id="cl-prov" value="${escapeHtml(c?.provincia || '')}"></div>
        <div class="field"><label>Email</label><input id="cl-email" type="email" value="${escapeHtml(c?.email || '')}"></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${ICON.check} Guardar</button>
      </div>
    </form>`);
  $('#form-cliente').addEventListener('submit', e => {
    e.preventDefault();
    const nombre = $('#cl-nombre').value.trim();
    if (!nombre) { $('#cl-nombre').classList.add('invalid'); $('#cl-nombre').focus(); return; }
    const datos = {
      nombre, nif: $('#cl-nif').value.trim(), telefono: $('#cl-tel').value.trim(),
      direccion: $('#cl-dir').value.trim(), cp: $('#cl-cp').value.trim(),
      ciudad: $('#cl-ciudad').value.trim(), provincia: $('#cl-prov').value.trim(),
      email: $('#cl-email').value.trim()
    };
    if (c) Object.assign(c, datos);
    else state.clientes.push({ id: uid(), ...datos });
    saveState();
    closeModal();
    toast('Cliente guardado');
    navegar();
  });
}

function eliminarCliente(id) {
  const enUso = state.facturas.some(f => f.clienteId === id);
  const c = state.clientes.find(x => x.id === id);
  confirmar('Eliminar cliente',
    enUso ? `"${c.nombre}" tiene facturas asociadas; se conservarán pero perderán el nombre del cliente. ¿Eliminar de todas formas?`
          : `¿Eliminar el cliente "${c.nombre}"?`, () => {
    state.clientes = state.clientes.filter(x => x.id !== id);
    saveState();
    toast('Cliente eliminado');
    navegar();
  });
}

/* ============================================================
   VISTA: Productos
   ============================================================ */

function vistaProductos() {
  $('#topbar-actions').innerHTML = `<button class="btn btn-primary" onclick="editarProducto()">${ICON.plus} Nuevo producto</button>`;
  view.innerHTML = `<div class="card" id="p-lista"></div>`;

  const cont = $('#p-lista');
  if (!state.productos.length) {
    cont.innerHTML = `<div class="empty">${ICON.box}<h3>Sin productos ni servicios</h3><p>Crea un catálogo para añadir conceptos a tus facturas en un clic.</p>
      <button class="btn btn-primary btn-sm" onclick="editarProducto()">${ICON.plus} Nuevo producto</button></div>`;
    return;
  }
  cont.innerHTML = `<div class="table-wrap"><table class="data">
    <thead><tr><th>Nombre</th><th>Descripción</th><th class="num">Precio</th><th class="num">${paisCfg().impuesto.nombre}</th><th></th></tr></thead>
    <tbody>${[...state.productos].sort((a, b) => a.nombre.localeCompare(b.nombre)).map(p => `<tr>
      <td style="font-weight:600">${escapeHtml(p.nombre)}</td>
      <td style="color:var(--text-2)">${escapeHtml(p.descripcion || '—')}</td>
      <td class="num">${eur(p.precio)}</td>
      <td class="num">${p.iva} %</td>
      <td class="actions">
        <button class="btn-icon" title="Editar" aria-label="Editar producto" onclick="editarProducto('${p.id}')">${ICON.edit}</button>
        <button class="btn-icon" title="Eliminar" aria-label="Eliminar producto" style="color:var(--danger)" onclick="eliminarProducto('${p.id}')">${ICON.trash}</button>
      </td></tr>`).join('')}</tbody></table></div>`;
}

function editarProducto(id) {
  const p = id ? state.productos.find(x => x.id === id) : null;
  const imp = paisCfg().impuesto;
  const ivaActual = p ? Number(p.iva) : state.settings.facturacion.ivaDefecto;
  const campoImpuesto = imp.tasas === null
    ? `<input id="pr-iva" type="number" step="0.001" min="0" max="30" value="${ivaActual}">`
    : `<select id="pr-iva">${imp.tasas.map(v => `<option value="${v}" ${ivaActual === v ? 'selected' : ''}>${v} %</option>`).join('')}</select>`;
  openModal(p ? 'Editar producto' : 'Nuevo producto', `
    <form id="form-producto" novalidate>
      <div class="form-grid">
        <div class="field full"><label>Nombre <span class="req">*</span></label><input id="pr-nombre" required value="${escapeHtml(p?.nombre || '')}"></div>
        <div class="field full"><label>Descripción</label><input id="pr-desc" value="${escapeHtml(p?.descripcion || '')}"></div>
        <div class="field"><label>Precio (${simboloMoneda()}, sin ${imp.nombre}) <span class="req">*</span></label><input id="pr-precio" type="number" step="0.01" min="0" required value="${p?.precio ?? ''}"></div>
        <div class="field"><label>Tipo de ${imp.nombre} (%)</label>${campoImpuesto}</div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${ICON.check} Guardar</button>
      </div>
    </form>`);
  $('#form-producto').addEventListener('submit', e => {
    e.preventDefault();
    const nombre = $('#pr-nombre').value.trim();
    const precio = Number($('#pr-precio').value);
    if (!nombre) { $('#pr-nombre').classList.add('invalid'); $('#pr-nombre').focus(); return; }
    const datos = { nombre, descripcion: $('#pr-desc').value.trim(), precio, iva: Number($('#pr-iva').value) };
    if (p) Object.assign(p, datos);
    else state.productos.push({ id: uid(), ...datos });
    saveState();
    closeModal();
    toast('Producto guardado');
    navegar();
  });
}

function eliminarProducto(id) {
  const p = state.productos.find(x => x.id === id);
  confirmar('Eliminar producto', `¿Eliminar "${p.nombre}" del catálogo? Las facturas existentes no se modifican.`, () => {
    state.productos = state.productos.filter(x => x.id !== id);
    saveState();
    toast('Producto eliminado');
    navegar();
  });
}

/* ============================================================
   VISTA: Gastos
   ============================================================ */

function vistaGastos() {
  $('#topbar-actions').innerHTML = `<button class="btn btn-primary" onclick="editarGasto()">${ICON.plus} Nuevo gasto</button>`;

  const años = [...new Set(state.gastos.map(g => g.fecha.slice(0, 4)))].sort().reverse();
  const añoSel = vistaGastos._año || String(new Date().getFullYear());
  const lista = [...state.gastos].filter(g => g.fecha.startsWith(añoSel)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  const totalBase = lista.reduce((a, g) => a + (Number(g.base) || 0), 0);
  const totalIva = lista.reduce((a, g) => a + (Number(g.iva) || 0), 0);

  view.innerHTML = `
    <div class="list-toolbar">
      <div class="seg" id="g-años" role="group" aria-label="Filtrar por año">
        ${(años.length ? años : [añoSel]).map(a => `<button data-a="${a}" class="${a === añoSel ? 'active' : ''}">${a}</button>`).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="exportarGastosCSV('${añoSel}')">${ICON.download} Exportar CSV</button>
    </div>
    <div class="card" id="g-lista">
    ${!lista.length
      ? `<div class="empty">${ICON.wallet}<h3>Sin gastos en ${añoSel}</h3><p>Registra tus gastos para calcular el resultado y el IVA soportado.</p>
         <button class="btn btn-primary btn-sm" onclick="editarGasto()">${ICON.plus} Nuevo gasto</button></div>`
      : `<div class="table-wrap"><table class="data">
        <thead><tr><th>Fecha</th><th>Concepto</th><th>Categoría</th><th>Proveedor</th><th class="num">Base</th><th class="num">${paisCfg().impuesto.nombre}</th><th class="num">Total</th><th></th></tr></thead>
        <tbody>${lista.map(g => `<tr>
          <td>${fechaES(g.fecha)}</td>
          <td style="font-weight:600">${escapeHtml(g.concepto)}</td>
          <td>${escapeHtml(g.categoria || '—')}</td>
          <td>${escapeHtml(g.proveedor || '—')}</td>
          <td class="num">${eur(g.base)}</td>
          <td class="num">${eur(g.iva)}</td>
          <td class="num">${eur((Number(g.base) || 0) + (Number(g.iva) || 0))}</td>
          <td class="actions">
            <button class="btn-icon" title="Editar" aria-label="Editar gasto" onclick="editarGasto('${g.id}')">${ICON.edit}</button>
            <button class="btn-icon" title="Eliminar" aria-label="Eliminar gasto" style="color:var(--danger)" onclick="eliminarGasto('${g.id}')">${ICON.trash}</button>
          </td></tr>`).join('')}</tbody>
        <tfoot><tr><td colspan="4">Total ${añoSel}</td><td class="num">${eur(totalBase)}</td><td class="num">${eur(totalIva)}</td><td class="num">${eur(totalBase + totalIva)}</td><td></td></tr></tfoot>
        </table></div>`}
    </div>`;

  $('#g-años').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    vistaGastos._año = b.dataset.a;
    vistaGastos();
  });
}

function editarGasto(id) {
  const g = id ? state.gastos.find(x => x.id === id) : null;
  openModal(g ? 'Editar gasto' : 'Nuevo gasto', `
    <form id="form-gasto" novalidate>
      <div class="form-grid">
        <div class="field"><label>Fecha <span class="req">*</span></label><input id="ga-fecha" type="date" required value="${g?.fecha || hoyISO()}"></div>
        <div class="field"><label>Categoría</label>
          <select id="ga-cat">${CATEGORIAS_GASTO.map(c => `<option ${g?.categoria === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
        </div>
        <div class="field full"><label>Concepto <span class="req">*</span></label><input id="ga-concepto" required value="${escapeHtml(g?.concepto || '')}" placeholder="Ej. Cuota de autónomos"></div>
        <div class="field full"><label>Proveedor</label><input id="ga-prov" value="${escapeHtml(g?.proveedor || '')}"></div>
        <div class="field"><label>Base (${simboloMoneda()}) <span class="req">*</span></label><input id="ga-base" type="number" step="0.01" min="0" required value="${g?.base ?? ''}"></div>
        <div class="field"><label>${paisCfg().impuesto.nombre} soportado (${simboloMoneda()})</label><input id="ga-iva" type="number" step="0.01" min="0" value="${g?.iva ?? 0}">
          <div class="help">Importe del impuesto, no porcentaje</div></div>
        <div class="field full"><label class="check-line"><input type="checkbox" id="ga-ded" ${g ? (g.deducible ? 'checked' : '') : 'checked'}> Gasto deducible</label></div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button type="submit" class="btn btn-primary">${ICON.check} Guardar</button>
      </div>
    </form>`);
  $('#form-gasto').addEventListener('submit', e => {
    e.preventDefault();
    const concepto = $('#ga-concepto').value.trim();
    const fecha = $('#ga-fecha').value;
    if (!concepto || !fecha) { toast('Completa fecha y concepto', 'error'); return; }
    const datos = {
      fecha, concepto, categoria: $('#ga-cat').value, proveedor: $('#ga-prov').value.trim(),
      base: Number($('#ga-base').value) || 0, iva: Number($('#ga-iva').value) || 0,
      deducible: $('#ga-ded').checked
    };
    if (g) Object.assign(g, datos);
    else state.gastos.push({ id: uid(), ...datos });
    saveState();
    closeModal();
    toast('Gasto guardado');
    navegar();
  });
}

function eliminarGasto(id) {
  const g = state.gastos.find(x => x.id === id);
  confirmar('Eliminar gasto', `¿Eliminar el gasto "${g.concepto}" (${eur(g.base)})?`, () => {
    state.gastos = state.gastos.filter(x => x.id !== id);
    saveState();
    toast('Gasto eliminado');
    navegar();
  });
}

function exportarGastosCSV(año) {
  const lista = state.gastos.filter(g => g.fecha.startsWith(año)).sort((a, b) => a.fecha.localeCompare(b.fecha));
  const filas = [['Fecha', 'Concepto', 'Categoría', 'Proveedor', 'Base', paisCfg().impuesto.nombre, 'Total', 'Deducible']];
  lista.forEach(g => filas.push([g.fecha, g.concepto, g.categoria, g.proveedor,
    fmtNum.format(g.base), fmtNum.format(g.iva), fmtNum.format((Number(g.base) || 0) + (Number(g.iva) || 0)), g.deducible ? 'Sí' : 'No']));
  descargarArchivo(`gastos_${año}.csv`, csv(filas), 'text/csv');
  toast('CSV de gastos descargado');
}

/* ============================================================
   VISTA: Contabilidad
   ============================================================ */

function vistaContabilidad() {
  const cfg = paisCfg();
  const imp = cfg.impuesto.nombre;
  const retNombre = cfg.retencion?.nombre || 'Retención';
  const añosF = state.facturas.map(f => f.fecha.slice(0, 4));
  const añosG = state.gastos.map(g => g.fecha.slice(0, 4));
  const años = [...new Set([...añosF, ...añosG, String(new Date().getFullYear())])].sort().reverse();
  const año = vistaContabilidad._año || String(new Date().getFullYear());

  const facturas = state.facturas.filter(f => f.estado !== 'borrador' && f.fecha.startsWith(año));
  const gastos = state.gastos.filter(g => g.fecha.startsWith(año));

  const T = [1, 2, 3, 4].map(tr => {
    const meses = [(tr - 1) * 3 + 1, (tr - 1) * 3 + 2, tr * 3];
    const enTr = iso => meses.includes(Number(iso.slice(5, 7)));
    const fs = facturas.filter(f => enTr(f.fecha));
    const gs = gastos.filter(g => enTr(g.fecha));
    const ing = fs.reduce((a, f) => a + calcFactura(f).base, 0);
    const ivaRep = fs.reduce((a, f) => a + calcFactura(f).ivaTotal, 0);
    const irpf = fs.reduce((a, f) => a + calcFactura(f).irpf, 0);
    const gas = gs.reduce((a, g) => a + (Number(g.base) || 0), 0);
    const ivaSop = gs.filter(g => g.deducible !== false).reduce((a, g) => a + (Number(g.iva) || 0), 0);
    return { tr, ing, ivaRep, irpf, gas, ivaSop, resIva: ivaRep - ivaSop, resultado: ing - gas };
  });
  const tot = T.reduce((a, t) => ({
    ing: a.ing + t.ing, ivaRep: a.ivaRep + t.ivaRep, irpf: a.irpf + t.irpf,
    gas: a.gas + t.gas, ivaSop: a.ivaSop + t.ivaSop, resIva: a.resIva + t.resIva, resultado: a.resultado + t.resultado
  }), { ing: 0, ivaRep: 0, irpf: 0, gas: 0, ivaSop: 0, resIva: 0, resultado: 0 });

  view.innerHTML = `
    <div class="list-toolbar">
      <div class="seg" id="ct-años" role="group" aria-label="Año fiscal">
        ${años.map(a => `<button data-a="${a}" class="${a === año ? 'active' : ''}">${a}</button>`).join('')}
      </div>
      <button class="btn btn-secondary btn-sm" style="margin-left:auto" onclick="exportarFacturasCSV('${año}')">${ICON.download} Facturas CSV</button>
      <button class="btn btn-secondary btn-sm" onclick="exportarGastosCSV('${año}')">${ICON.download} Gastos CSV</button>
    </div>

    <div class="grid-kpi">
      <div class="card kpi"><div class="kpi-label">${ICON.up} Ingresos ${año}</div><div class="kpi-value">${eur(tot.ing)}</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.down} Gastos ${año}</div><div class="kpi-value">${eur(tot.gas)}</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.euro} Resultado</div><div class="kpi-value ${tot.resultado >= 0 ? 'pos' : 'neg'}">${eur(tot.resultado)}</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.euro} ${imp} a liquidar</div><div class="kpi-value ${tot.resIva > 0 ? '' : 'pos'}">${eur(tot.resIva)}</div><div class="kpi-hint">Repercutido − soportado</div></div>
    </div>

    <div class="card">
      <div class="card-pad" style="padding-bottom:0">
        <div class="card-title">Resumen trimestral ${año}</div>
        <p class="card-sub">${escapeHtml(cfg.resumenNota)} Solo facturas emitidas o pagadas y gastos registrados.</p>
      </div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Trimestre</th><th class="num">Ingresos</th><th class="num">${imp} repercutido</th>
          <th class="num">Gastos</th><th class="num">${imp} soportado</th><th class="num">${imp} a liquidar</th>
          <th class="num">${cfg.retencion ? retNombre + ' retenido' : 'Retenciones'}</th><th class="num">Resultado</th></tr></thead>
        <tbody>${T.map(t => `<tr>
          <td style="font-weight:600">${t.tr}T ${año}</td>
          <td class="num">${eur(t.ing)}</td>
          <td class="num">${eur(t.ivaRep)}</td>
          <td class="num">${eur(t.gas)}</td>
          <td class="num">${eur(t.ivaSop)}</td>
          <td class="num" style="font-weight:600">${eur(t.resIva)}</td>
          <td class="num">${eur(t.irpf)}</td>
          <td class="num" style="font-weight:600;color:${t.resultado >= 0 ? 'var(--success)' : 'var(--danger)'}">${eur(t.resultado)}</td>
        </tr>`).join('')}</tbody>
        <tfoot><tr><td>Total ${año}</td>
          <td class="num">${eur(tot.ing)}</td><td class="num">${eur(tot.ivaRep)}</td>
          <td class="num">${eur(tot.gas)}</td><td class="num">${eur(tot.ivaSop)}</td>
          <td class="num">${eur(tot.resIva)}</td><td class="num">${eur(tot.irpf)}</td>
          <td class="num">${eur(tot.resultado)}</td></tr></tfoot>
      </table></div>
    </div>

    <div class="card" style="margin-top:20px">
      <div class="card-pad" style="padding-bottom:0">
        <div class="card-title">Libro de facturas emitidas ${año}</div>
      </div>
      ${facturas.length ? `<div class="table-wrap"><table class="data">
        <thead><tr><th>Número</th><th>Fecha</th><th>Cliente</th><th>${escapeHtml(cfg.taxId)}</th><th class="num">Base</th><th class="num">${imp}</th><th class="num">${retNombre}</th><th class="num">Total</th><th>Estado</th></tr></thead>
        <tbody>${[...facturas].sort((a, b) => (a.fecha + a.numero).localeCompare(b.fecha + b.numero)).map(f => {
          const t = calcFactura(f); const c = clienteDe(f); const est = estadoFactura(f);
          return `<tr class="row-click" onclick="location.hash='#/facturas/ver/${f.id}'">
            <td class="mono">${escapeHtml(numeroFactura(f))}</td><td>${fechaES(f.fecha)}</td>
            <td>${escapeHtml(c?.nombre || '—')}</td><td class="mono">${escapeHtml(c?.nif || '—')}</td>
            <td class="num">${eur(t.base)}</td><td class="num">${eur(t.ivaTotal)}</td>
            <td class="num">${t.irpf ? '−' + eur(t.irpf) : '—'}</td><td class="num">${eur(t.total)}</td>
            <td><span class="chip chip-${est}">${ESTADO_LABEL[est]}</span></td></tr>`;
        }).join('')}</tbody></table></div>` : `<div class="empty" style="padding:32px"><p>No hay facturas emitidas en ${año}.</p></div>`}
    </div>`;

  $('#ct-años').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    vistaContabilidad._año = b.dataset.a;
    vistaContabilidad();
  });
}

function exportarFacturasCSV(año) {
  const cfg = paisCfg();
  const lista = state.facturas.filter(f => f.estado !== 'borrador' && f.fecha.startsWith(año))
    .sort((a, b) => (a.fecha + a.numero).localeCompare(b.fecha + b.numero));
  const filas = [['Número', 'Fecha', 'Vencimiento', 'Cliente', cfg.taxId, 'Base', cfg.impuesto.nombre, cfg.retencion?.nombre || 'Retención', 'Total', 'Estado', 'Fecha pago']];
  lista.forEach(f => {
    const t = calcFactura(f); const c = clienteDe(f);
    filas.push([numeroFactura(f), f.fecha, f.vencimiento, c?.nombre || '', c?.nif || '',
      fmtNum.format(t.base), fmtNum.format(t.ivaTotal), fmtNum.format(t.irpf), fmtNum.format(t.total),
      ESTADO_LABEL[estadoFactura(f)], f.fechaPago || '']);
  });
  descargarArchivo(`facturas_${año}.csv`, csv(filas), 'text/csv');
  toast('CSV de facturas descargado');
}

/* ============================================================
   VISTA: Mi cuenta (plan y suscripción)
   ============================================================ */

function vistaCuenta() {
  const esPro = currentUser.plan === 'pro';
  const lim = currentUser.limites || {};
  // el contador de facturas es acumulado: las eliminadas también cuentan
  const usoF = Math.max(Number(currentUser.uso?.facturas) || 0, state.facturas.length);
  const usoC = state.clientes.length;
  const barra = (n, max) => {
    if (max === null || max === undefined) return `<div class="uso-linea"><span>${n}</span><span class="uso-max">sin límite</span></div>`;
    const pct = Math.min(100, n / max * 100);
    return `<div class="uso-linea"><span>${n} / ${max}</span></div>
      <div class="hbar-track" style="margin-top:5px"><div class="hbar-fill" style="width:${pct}%;${pct >= 100 ? 'background:var(--danger)' : ''}"></div></div>`;
  };

  view.innerHTML = `
    <div class="stack" style="max-width:760px">
      <div class="card card-pad">
        <div class="card-title">Tu cuenta</div>
        <div class="cuenta-datos">
          <div><span class="kpi-label">Email</span><div style="font-weight:600">${escapeHtml(currentUser.email)}</div></div>
          <div><span class="kpi-label">Plan actual</span><div><span class="chip ${esPro ? 'chip-pagada' : 'chip-borrador'}">${esPro ? 'Pro' : 'Gratis'}</span></div></div>
        </div>
        <div class="form-grid" style="margin-top:18px">
          <div class="field"><label>Facturas creadas</label>${barra(usoF, lim.maxFacturas)}
            ${!esPro ? '<div class="help">Contador acumulado: eliminar una factura no libera cupo.</div>' : ''}</div>
          <div class="field"><label>Clientes</label>${barra(usoC, lim.maxClientes)}</div>
        </div>
      </div>

      <div class="planes-grid">
        <div class="card card-pad plan-card ${!esPro ? 'plan-actual' : ''}">
          <h3>Gratis</h3>
          <div class="plan-precio">0 €<span>/mes</span></div>
          <ul class="plan-lista">
            <li>Hasta 20 facturas</li>
            <li>Hasta 10 clientes</li>
            <li>QR y enlace de pago en cada factura</li>
            <li>Contabilidad y resúmenes trimestrales</li>
          </ul>
          ${!esPro ? '<span class="chip chip-borrador">Plan actual</span>' : ''}
        </div>
        <div class="card card-pad plan-card plan-pro ${esPro ? 'plan-actual' : ''}">
          <h3>Pro</h3>
          <div class="plan-precio">9,90 €<span>/mes</span></div>
          <ul class="plan-lista">
            <li><b>Facturas y clientes ilimitados</b></li>
            <li>QR y enlace de pago en cada factura</li>
            <li>Contabilidad y resúmenes trimestrales</li>
            <li>Soporte prioritario</li>
          </ul>
          ${esPro ? '<span class="chip chip-pagada">Plan actual</span>'
                  : `<button class="btn btn-primary" id="btn-upgrade">Pasar a Pro</button>`}
        </div>
      </div>

      <div class="card card-pad">
        <div class="card-title">Sesión</div>
        <p class="card-sub">Cierra la sesión en este dispositivo. Tus datos quedan guardados en tu cuenta.</p>
        <button class="btn btn-secondary" onclick="cerrarSesion()">Cerrar sesión</button>
      </div>
    </div>`;

  const up = $('#btn-upgrade');
  if (up) up.onclick = async () => {
    up.disabled = true;
    up.textContent = 'Un momento…';
    try {
      const r = await apiFetch('/api/billing/checkout', { method: 'POST' });
      if (r.url) { location.href = r.url; return; }
      // modo demo sin pasarela configurada: el plan se activa al instante
      const me = await apiFetch('/api/me');
      currentUser = me.user;
      pintarCuentaSidebar();
      toast('¡Plan Pro activado!');
      vistaCuenta();
    } catch (e) {
      toast(e.message, 'error');
      up.disabled = false;
      up.textContent = 'Pasar a Pro';
    }
  };
}

/* ============================================================
   VISTA: Administración (solo administrador)
   ============================================================ */

async function vistaAdmin() {
  if (!currentUser?.admin) { location.hash = '#/panel'; return; }
  view.innerHTML = `<div class="card card-pad"><p class="card-sub" style="margin:0">Cargando panel…</p></div>`;

  let r;
  try {
    r = await apiFetch('/api/admin/resumen');
  } catch (e) {
    view.innerHTML = `<div class="card card-pad"><p style="color:var(--danger);margin:0">${escapeHtml(e.message)}</p></div>`;
    return;
  }

  const webhookUrl = location.origin + '/api/billing/webhook';

  view.innerHTML = `
    <div class="grid-kpi" style="grid-template-columns:repeat(3,1fr)">
      <div class="card kpi"><div class="kpi-label">${ICON.users} Usuarios</div><div class="kpi-value">${r.stats.total}</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.up} En plan Pro</div><div class="kpi-value">${r.stats.pro}</div></div>
      <div class="card kpi"><div class="kpi-label">${ICON.invoice} Facturas creadas</div><div class="kpi-value">${r.stats.facturas}</div></div>
    </div>

    <div class="card card-pad" style="margin-bottom:20px">
      <div class="card-title">Pasarela de pagos (Stripe)</div>
      <p class="card-sub">
        Estado: ${r.stripe.configurado
          ? '<span class="chip chip-pagada">Configurada — los clientes pagan con tarjeta</span>'
          : '<span class="chip chip-borrador">No configurada — "Pasar a Pro" funciona en modo demo</span>'}
      </p>
      <form id="form-stripe" novalidate>
        <div class="form-grid">
          <div class="field">
            <label>Clave secreta (sk_live_… o sk_test_…)</label>
            <input id="st-key" class="mono" type="password" autocomplete="off"
              placeholder="${r.stripe.secretKey ? 'Actual: ' + escapeHtml(r.stripe.secretKey) : 'sk_live_…'}">
          </div>
          <div class="field">
            <label>Price ID de la suscripción Pro</label>
            <input id="st-price" class="mono" autocomplete="off"
              value="${escapeHtml(r.stripe.priceId)}" placeholder="price_…">
          </div>
          <div class="field full">
            <label>Webhook signing secret (whsec_…)</label>
            <input id="st-wh" class="mono" type="password" autocomplete="off"
              placeholder="${r.stripe.webhookSecret ? 'Actual: ' + escapeHtml(r.stripe.webhookSecret) : 'whsec_…'}">
            <div class="help">Crea el webhook en Stripe apuntando a <b class="mono">${escapeHtml(webhookUrl)}</b> con los eventos <b>checkout.session.completed</b> y <b>customer.subscription.deleted</b>.</div>
          </div>
        </div>
        <p class="card-sub" style="margin:12px 0 0">Deja un campo vacío para conservar el valor actual; escribe <b>-</b> para borrarlo.</p>
        <div class="form-actions" style="justify-content:flex-start">
          <button type="submit" class="btn btn-primary">${ICON.check} Guardar pasarela</button>
        </div>
      </form>
    </div>

    <div class="card">
      <div class="card-pad" style="padding-bottom:0">
        <div class="card-title">Usuarios</div>
        <p class="card-sub">Puedes cambiar el plan de cualquier usuario manualmente (p. ej. cortesías o pagos fuera de Stripe).</p>
      </div>
      <div class="table-wrap"><table class="data">
        <thead><tr><th>Email</th><th>Nombre</th><th>Alta</th><th class="num">Facturas creadas</th><th class="num">Activas</th><th class="num">Clientes</th><th>Plan</th></tr></thead>
        <tbody>
          ${r.usuarios.map(u => `<tr>
            <td style="font-weight:600">${escapeHtml(u.email)} ${u.admin ? '<span class="chip chip-emitida" style="margin-left:6px">Admin</span>' : ''}</td>
            <td>${escapeHtml(u.nombre || '—')}</td>
            <td>${escapeHtml((u.creada || '').slice(0, 10))}</td>
            <td class="num">${u.facturasCreadas}</td>
            <td class="num">${u.facturasActuales}</td>
            <td class="num">${u.clientes}</td>
            <td>
              <select data-uid="${u.id}" class="admin-plan" aria-label="Plan de ${escapeHtml(u.email)}" style="padding:6px 10px;border:1px solid var(--border-strong);border-radius:7px;background:var(--surface);color:var(--text)">
                <option value="free" ${u.plan === 'free' ? 'selected' : ''}>Gratis</option>
                <option value="pro" ${u.plan === 'pro' ? 'selected' : ''}>Pro</option>
              </select>
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>
    </div>`;

  $('#form-stripe').addEventListener('submit', async e => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type=submit]');
    btn.disabled = true;
    try {
      await apiFetch('/api/admin/stripe', {
        method: 'POST',
        body: {
          secretKey: $('#st-key').value.trim(),
          priceId: $('#st-price').value.trim(),
          webhookSecret: $('#st-wh').value.trim()
        }
      });
      toast('Pasarela guardada');
      vistaAdmin();
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
    }
  });

  view.querySelectorAll('.admin-plan').forEach(sel => {
    sel.addEventListener('change', async () => {
      try {
        await apiFetch('/api/admin/plan', { method: 'POST', body: { userId: Number(sel.dataset.uid), plan: sel.value } });
        toast('Plan actualizado');
        if (Number(sel.dataset.uid) && currentUser) {
          const me = await apiFetch('/api/me');
          currentUser = me.user;
          pintarCuentaSidebar();
        }
      } catch (err) {
        toast(err.message, 'error');
        vistaAdmin();
      }
    });
  });
}

/* ============================================================
   VISTA: Ajustes
   ============================================================ */

function vistaAjustes() {
  const e = state.settings.empresa, p = state.settings.pago, f = state.settings.facturacion;
  const cfg = paisCfg();
  const imp = cfg.impuesto;
  const ret = cfg.retencion;

  view.innerHTML = `
    <form id="form-ajustes" novalidate style="max-width:860px">
      <fieldset class="group">
        <legend>Sistema contable</legend>
        <div class="form-grid">
          <div class="field full">
            <label>País / sistema contable</label>
            <select id="aj-pais">
              ${Object.entries(PAISES).map(([k, px]) =>
                `<option value="${k}" ${state.settings.pais === k ? 'selected' : ''}>${px.nombre} — ${px.impuesto.nombre} (${px.moneda})</option>`).join('')}
            </select>
            <div class="help">Define el impuesto (${Object.values(PAISES).map(x => x.impuesto.nombre).filter((v, i, a) => a.indexOf(v) === i).join(', ')}), la retención, la moneda y el formato de la factura. Las facturas ya emitidas no se recalculan.</div>
          </div>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>Datos de la empresa</legend>
        <div class="form-grid">
          <div class="field"><label>Nombre o razón social <span class="req">*</span></label><input id="aj-nombre" value="${escapeHtml(e.nombre)}"></div>
          <div class="field"><label>${escapeHtml(cfg.taxId)}</label><input id="aj-nif" value="${escapeHtml(e.nif)}"></div>
          <div class="field full"><label>Dirección</label><input id="aj-dir" value="${escapeHtml(e.direccion)}"></div>
          <div class="field"><label>Código postal</label><input id="aj-cp" inputmode="numeric" value="${escapeHtml(e.cp)}"></div>
          <div class="field"><label>Ciudad</label><input id="aj-ciudad" value="${escapeHtml(e.ciudad)}"></div>
          <div class="field"><label>Provincia</label><input id="aj-prov" value="${escapeHtml(e.provincia)}"></div>
          <div class="field"><label>Email</label><input id="aj-email" type="email" value="${escapeHtml(e.email)}"></div>
          <div class="field"><label>Teléfono</label><input id="aj-tel" type="tel" value="${escapeHtml(e.telefono)}"></div>
          <div class="field"><label>Web</label><input id="aj-web" value="${escapeHtml(e.web)}"></div>
          <div class="field full">
            <label>Información legal / fiscal en la factura</label>
            <textarea id="aj-infolegal" placeholder="Se imprime bajo tus datos en cada factura">${escapeHtml(e.infoLegal || '')}</textarea>
            <div class="help">${escapeHtml(cfg.infoLegalHint || '')}</div>
          </div>
          <div class="field full">
            <label>Logotipo (aparece en la factura)</label>
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
              ${e.logo ? `<img src="${e.logo}" alt="Logotipo actual" style="max-height:48px;max-width:160px;border:1px solid var(--border);border-radius:6px;padding:4px;background:#fff">` : ''}
              <input type="file" id="aj-logo" accept="image/*" style="max-width:280px">
              ${e.logo ? `<button type="button" class="btn btn-ghost btn-sm" id="aj-logo-del">Quitar logo</button>` : ''}
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>Cobros — QR y enlace de pago</legend>
        <div class="form-grid">
          ${cfg.qrSepa ? `
          <div class="field">
            <label>IBAN</label>
            <input id="aj-iban" class="mono" placeholder="ES00 0000 0000 0000 0000 0000" value="${escapeHtml(p.iban)}">
            <div class="help">Con IBAN válido, la factura incluye un QR SEPA que las apps bancarias leen para pagar al instante.</div>
            <div class="error-msg" id="err-iban" hidden>El IBAN no parece válido (se guardará igualmente, pero el QR no se generará).</div>
          </div>
          <div class="field"><label>BIC / SWIFT (opcional)</label><input id="aj-bic" class="mono" value="${escapeHtml(p.bic)}"></div>` : `
          <div class="field full">
            <label>Datos bancarios para la factura</label>
            <textarea id="aj-cuenta" placeholder="Banco, número de cuenta, CCI / ACH routing, titular…">${escapeHtml(p.datosCuenta || '')}</textarea>
            <div class="help">Se imprimen en la factura como forma de pago por transferencia o depósito.</div>
          </div>`}
          <div class="field full">
            <label>Enlace de pago online (opcional)</label>
            <input id="aj-link" placeholder="https://paypal.me/tuusuario/{importe}" value="${escapeHtml(p.linkPago)}">
            <div class="help">Admite variables: <b>{importe}</b> y <b>{numero}</b>. Ej.: https://paypal.me/miempresa/{importe} o tu enlace de Stripe. ${cfg.qrSepa ? 'Si no hay IBAN, el QR codificará este enlace.' : 'El QR de la factura codificará este enlace.'}</div>
          </div>
          <div class="field full"><label>Texto al pie de la factura</label><textarea id="aj-pie">${escapeHtml(p.textoPie)}</textarea></div>
        </div>
      </fieldset>

      <fieldset class="group">
        <legend>Facturación</legend>
        <div class="form-grid-3">
          <div class="field"><label>Serie</label><input id="aj-serie" class="mono" value="${escapeHtml(f.serie)}"><div class="help">Ej.: ${escapeHtml(cfg.serieDefecto || 'F-' + new Date().getFullYear())}${state.settings.pais === 'PE' ? ' (formato SUNAT: serie F### y correlativo de 8 dígitos)' : ''}</div></div>
          <div class="field"><label>Próximo número</label><input id="aj-num" type="number" min="1" value="${f.siguienteNumero}"></div>
          <div class="field"><label>Días de vencimiento</label><input id="aj-venc" type="number" min="0" value="${f.diasVencimiento}"></div>
          <div class="field"><label>${imp.nombre} por defecto (%)</label>
            ${imp.tasas === null
              ? `<input id="aj-iva" type="number" step="0.001" min="0" max="30" value="${f.ivaDefecto}"><div class="help">Tasa de tu estado/condado</div>`
              : `<select id="aj-iva">${imp.tasas.map(v => `<option value="${v}" ${f.ivaDefecto === v ? 'selected' : ''}>${v} %</option>`).join('')}</select>`}
          </div>
          ${ret ? `<div class="field"><label>${ret.etiqueta} por defecto</label>
            <select id="aj-irpf">${ret.tasas.map(v => `<option value="${v}" ${f.irpfDefecto === v ? 'selected' : ''}>${v} %</option>`).join('')}</select></div>` : ''}
        </div>
      </fieldset>

      <div class="form-actions" style="justify-content:flex-start">
        <button type="submit" class="btn btn-primary">${ICON.check} Guardar ajustes</button>
      </div>
    </form>

    <fieldset class="group" style="max-width:860px;margin-top:26px">
      <legend>Datos y copias de seguridad</legend>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-secondary" id="aj-export">${ICON.download} Exportar todo (JSON)</button>
        <label class="btn btn-secondary" style="cursor:pointer">Importar copia (JSON)
          <input type="file" id="aj-import" accept="application/json" hidden></label>
        <button class="btn btn-secondary" id="aj-demo">Cargar datos de ejemplo</button>
        <button class="btn btn-danger" id="aj-reset" style="margin-left:auto">${ICON.trash} Borrar todos los datos</button>
      </div>
      <p class="card-sub" style="margin:12px 0 0">Tus datos se guardan en tu cuenta de FacturaPro y se sincronizan automáticamente. Aun así, es buena práctica exportar una copia de vez en cuando.</p>
    </fieldset>`;

  let logoData = e.logo;
  $('#aj-logo').addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;
    if (file.size > 400 * 1024) { toast('El logo debe pesar menos de 400 KB', 'error'); ev.target.value = ''; return; }
    const r = new FileReader();
    r.onload = () => { logoData = r.result; toast('Logo cargado, recuerda guardar'); };
    r.readAsDataURL(file);
  });
  const delBtn = $('#aj-logo-del');
  if (delBtn) delBtn.onclick = () => { logoData = ''; toast('Logo quitado, recuerda guardar'); };

  const ibanInp = $('#aj-iban');
  if (ibanInp) ibanInp.addEventListener('blur', ev => {
    const v = ev.target.value.trim();
    const mal = v && !validarIBAN(v);
    ev.target.classList.toggle('invalid', mal);
    $('#err-iban').hidden = !mal;
  });

  $('#form-ajustes').addEventListener('submit', ev => {
    ev.preventDefault();
    Object.assign(state.settings.empresa, {
      nombre: $('#aj-nombre').value.trim(), nif: $('#aj-nif').value.trim(),
      direccion: $('#aj-dir').value.trim(), cp: $('#aj-cp').value.trim(),
      ciudad: $('#aj-ciudad').value.trim(), provincia: $('#aj-prov').value.trim(),
      email: $('#aj-email').value.trim(), telefono: $('#aj-tel').value.trim(),
      web: $('#aj-web').value.trim(), logo: logoData,
      infoLegal: $('#aj-infolegal').value.trim()
    });
    Object.assign(state.settings.pago, {
      iban: $('#aj-iban')?.value.trim() ?? p.iban,
      bic: $('#aj-bic')?.value.trim() ?? p.bic,
      datosCuenta: $('#aj-cuenta')?.value.trim() ?? (p.datosCuenta || ''),
      linkPago: $('#aj-link').value.trim(), textoPie: $('#aj-pie').value
    });
    Object.assign(state.settings.facturacion, {
      serie: $('#aj-serie').value.trim() || 'F',
      siguienteNumero: Math.max(1, Number($('#aj-num').value) || 1),
      diasVencimiento: Math.max(0, Number($('#aj-venc').value) || 0),
      ivaDefecto: Number($('#aj-iva').value),
      irpfDefecto: $('#aj-irpf') ? Number($('#aj-irpf').value) : 0
    });
    // cambio de sistema contable: aplica impuestos y moneda del nuevo país
    const nuevoPais = $('#aj-pais').value;
    if (nuevoPais !== state.settings.pais) {
      aplicarPais(nuevoPais);
      toast(`Sistema contable cambiado a ${PAISES[nuevoPais].nombre}`);
    } else {
      toast('Ajustes guardados');
    }
    saveState();
    vistaAjustes();
  });

  $('#aj-export').onclick = () => {
    descargarArchivo(`facturapro_copia_${hoyISO()}.json`, JSON.stringify(state, null, 2), 'application/json');
    toast('Copia de seguridad descargada');
  };
  $('#aj-import').addEventListener('change', ev => {
    const file = ev.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const datos = JSON.parse(r.result);
        if (!datos.settings || !Array.isArray(datos.facturas)) throw new Error('formato');
        confirmar('Importar copia', 'Se reemplazarán TODOS los datos actuales por los de la copia. ¿Continuar?', () => {
          state = normalizarEstado(datos);
          flushSave();
          aplicarTema();
          toast('Copia importada correctamente');
          navegar();
        }, { okLabel: 'Importar' });
      } catch {
        toast('El archivo no es una copia válida', 'error');
      }
      ev.target.value = '';
    };
    r.readAsText(file);
  });
  $('#aj-demo').onclick = () => {
    confirmar('Cargar datos de ejemplo', 'Se añadirán clientes, productos, facturas y gastos de ejemplo a los datos actuales. ¿Continuar?', () => {
      cargarDatosEjemplo();
      toast('Datos de ejemplo cargados');
      navegar();
    }, { okLabel: 'Cargar' });
  };
  $('#aj-reset').onclick = () => {
    confirmar('Borrar todos los datos', 'Se eliminarán TODAS las facturas, clientes, productos, gastos y ajustes de tu cuenta. Esta acción no se puede deshacer. ¿Seguro?', async () => {
      await resetState();
      aplicarTema();
      toast('Datos eliminados');
      location.hash = '#/panel';
      navegar();
    });
  };
}

/* ============================================================
   Arranque
   ============================================================ */

arrancarApp();
