/* ============================================================
   FacturaPro — Gráficos SVG ligeros (sin dependencias)
   Barras agrupadas (ingresos vs gastos) + barras horizontales.
   ============================================================ */

/**
 * Gráfico de barras agrupadas.
 * cfg = { labels: [...12], series: [{name, color, values:[...]}] }
 */
function renderGroupedBars(container, cfg) {
  const W = 720, H = 260;
  const pad = { top: 14, right: 10, bottom: 26, left: 52 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;
  const n = cfg.labels.length;
  const maxVal = Math.max(1, ...cfg.series.flatMap(s => s.values));
  // techo "bonito" para el eje
  const step = niceStep(maxVal / 4);
  const top = Math.ceil(maxVal / step) * step;

  const groupW = iw / n;
  const barW = Math.min(18, (groupW * 0.62) / cfg.series.length);
  const gap = 2; // separación entre barras del grupo

  let bars = '', hits = '';
  const y = v => pad.top + ih - (v / top) * ih;

  cfg.labels.forEach((lab, i) => {
    const cx = pad.left + groupW * i + groupW / 2;
    const totalW = cfg.series.length * barW + (cfg.series.length - 1) * gap;
    let x = cx - totalW / 2;
    let group = '';
    cfg.series.forEach(s => {
      const v = s.values[i] || 0;
      const by = y(v);
      const bh = Math.max(0, pad.top + ih - by);
      if (bh > 0.5) group += roundTopRect(x, by, barW, bh, 4, s.color);
      else group += `<rect x="${x}" y="${pad.top + ih - 1.5}" width="${barW}" height="1.5" rx="0.75" fill="${s.color}" opacity="0.45"/>`;
      x += barW + gap;
    });
    bars += `<g class="bar-pair" data-i="${i}">${group}</g>`;
    hits += `<rect class="bar-hit" data-i="${i}" x="${pad.left + groupW * i}" y="${pad.top}" width="${groupW}" height="${ih}"/>`;
  });

  // rejilla y etiquetas del eje Y
  let grid = '', ylabels = '';
  for (let v = 0; v <= top; v += step) {
    const yy = y(v);
    grid += `<line x1="${pad.left}" y1="${yy}" x2="${W - pad.right}" y2="${yy}" stroke="var(--grid-line)" stroke-width="1"/>`;
    ylabels += `<text x="${pad.left - 8}" y="${yy + 4}" text-anchor="end" font-size="10.5" fill="var(--text-3)">${kFmt(v)}</text>`;
  }

  let xlabels = '';
  cfg.labels.forEach((lab, i) => {
    xlabels += `<text x="${pad.left + groupW * i + groupW / 2}" y="${H - 8}" text-anchor="middle" font-size="10.5" fill="var(--text-3)">${lab}</text>`;
  });

  const legend = `<div class="chart-legend">${cfg.series.map(s =>
    `<span class="lg-item"><span class="lg-swatch" style="background:${s.color}"></span>${escapeHtml(s.name)}</span>`).join('')}</div>`;

  container.innerHTML = `${legend}
    <div class="chart-box">
      <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${escapeHtml(cfg.ariaLabel || 'Gráfico de barras')}">
        ${grid}${ylabels}${xlabels}${bars}${hits}
      </svg>
      <div class="chart-tooltip" hidden></div>
    </div>`;

  // tooltip al pasar el ratón / tocar
  const box = container.querySelector('.chart-box');
  const tip = container.querySelector('.chart-tooltip');
  const svg = container.querySelector('svg');
  svg.addEventListener('mousemove', e => {
    const hit = e.target.closest('.bar-hit, .bar-pair');
    if (!hit) { tip.hidden = true; return; }
    const i = Number(hit.dataset.i);
    tip.innerHTML = `<div class="tt-title">${escapeHtml(cfg.labels[i])}</div>` +
      cfg.series.map(s => `<div class="tt-row"><span class="tt-dot" style="background:${s.color}"></span>${escapeHtml(s.name)}: <b>${eur(s.values[i] || 0)}</b></div>`).join('');
    const r = box.getBoundingClientRect();
    const gx = (pad.left + (iw / n) * i + (iw / n) / 2) / W * r.width;
    tip.style.left = Math.max(70, Math.min(r.width - 70, gx)) + 'px';
    tip.style.top = (pad.top / H * r.height + 6) + 'px';
    tip.hidden = false;
  });
  svg.addEventListener('mouseleave', () => { tip.hidden = true; });
}

/** Rectángulo con solo las esquinas superiores redondeadas, anclado a la base */
function roundTopRect(x, y, w, h, r, fill) {
  r = Math.min(r, w / 2, h);
  return `<path d="M${x},${y + h} L${x},${y + r} Q${x},${y} ${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h} Z" fill="${fill}"/>`;
}

function niceStep(raw) {
  if (raw <= 0) return 1;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return nice * mag;
}

function kFmt(v) {
  return _fmtCompacto.format(v); // moneda del sistema contable activo, notación compacta
}

/**
 * Barras horizontales con etiqueta directa (una sola serie, sin leyenda).
 * items = [{label, value}], ordenadas de mayor a menor.
 */
function renderHBars(container, items, color) {
  if (!items.length) {
    container.innerHTML = `<p class="card-sub" style="margin:0">Sin datos todavía.</p>`;
    return;
  }
  const max = Math.max(...items.map(i => i.value), 1);
  container.innerHTML = items.map(it => `
    <div class="hbar-row">
      <span class="hbar-label" title="${escapeHtml(it.label)}">${escapeHtml(it.label)}</span>
      <span class="hbar-track"><span class="hbar-fill" style="width:${Math.max(1.5, it.value / max * 100)}%;${color ? `background:${color}` : ''}"></span></span>
      <span class="hbar-value">${eur(it.value)}</span>
    </div>`).join('');
}
