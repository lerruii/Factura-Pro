/* ============================================================
   FacturaPro — Generación de códigos QR de pago
   - QR SEPA (norma EPC069-12, versión 002): lo leen las apps
     bancarias europeas y rellenan la transferencia automáticamente.
   - QR de enlace de pago: codifica una URL (PayPal, Stripe, etc.)
   ============================================================ */

// La librería qrcode-generator usa bytes ASCII por defecto; activamos UTF-8
if (typeof qrcode !== 'undefined' && qrcode.stringToBytesFuncs && qrcode.stringToBytesFuncs['UTF-8']) {
  qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8'];
}

/**
 * Construye la carga EPC (SEPA Credit Transfer) para el QR bancario.
 * Campos en orden fijo separados por salto de línea.
 */
function epcPayload({ nombre, iban, bic = '', importe = 0, concepto = '' }) {
  const clean = s => String(s || '').replace(/[\r\n]+/g, ' ').trim();
  const lines = [
    'BCD',                                     // etiqueta de servicio
    '002',                                     // versión
    '1',                                       // juego de caracteres: UTF-8
    'SCT',                                     // transferencia SEPA
    clean(bic).replace(/\s+/g, ''),            // BIC (opcional en v002)
    clean(nombre).slice(0, 70),                // beneficiario
    clean(iban).replace(/\s+/g, '').toUpperCase(), // IBAN
    importe > 0 ? 'EUR' + round2(importe).toFixed(2) : '', // importe
    '',                                        // propósito (vacío)
    '',                                        // referencia estructurada (vacía)
    clean(concepto).slice(0, 140)              // concepto libre
  ];
  // se pueden omitir los campos vacíos finales
  while (lines.length > 7 && lines[lines.length - 1] === '') lines.pop();
  return lines.join('\n');
}

/**
 * Sustituye variables en el enlace de pago configurado.
 * {importe} → 123.45   {numero} → F-2026-0001
 */
function buildPaymentLink(plantilla, factura, totales) {
  if (!plantilla) return '';
  return plantilla
    .replace(/\{importe\}/gi, round2(totales.total).toFixed(2))
    .replace(/\{numero\}/gi, encodeURIComponent(numeroFactura(factura)));
}

/**
 * Genera un QR como etiqueta <svg>. Devuelve '' si falla o no hay datos.
 */
function qrSvg(data, cellSize = 4) {
  if (!data) return '';
  try {
    const qr = qrcode(0, 'M'); // versión automática, corrección M (recomendada por EPC)
    qr.addData(data, 'Byte');
    qr.make();
    return qr.createSvgTag({ cellSize, margin: 2, scalable: true });
  } catch (e) {
    console.error('Error generando QR:', e);
    return '';
  }
}

/**
 * Datos de pago de una factura según la configuración:
 * devuelve { tipo, qr, link, iban } — tipo: 'sepa' | 'link' | null
 */
function datosPagoFactura(factura, totales) {
  const cfg = paisCfg();
  const pago = state.settings.pago;
  const iban = (pago.iban || '').replace(/\s+/g, '');
  const link = buildPaymentLink(pago.linkPago, factura, totales);
  const datosCuenta = (pago.datosCuenta || '').trim();
  const concepto = `${cfg.idioma === 'en' ? 'Invoice' : 'Factura'} ${numeroFactura(factura)}`;

  // el QR SEPA solo aplica a sistemas contables de la zona SEPA (España)
  if (cfg.qrSepa && iban && validarIBAN(iban)) {
    return {
      tipo: 'sepa',
      qr: qrSvg(epcPayload({
        nombre: state.settings.empresa.nombre,
        iban, bic: pago.bic,
        importe: totales.total,
        concepto
      })),
      link, iban: pago.iban, datosCuenta, concepto
    };
  }
  if (link) {
    return { tipo: 'link', qr: qrSvg(link), link, iban: '', datosCuenta, concepto };
  }
  if (datosCuenta) {
    return { tipo: 'cuenta', qr: '', link: '', iban: '', datosCuenta, concepto };
  }
  return { tipo: null, qr: '', link: '', iban: '', datosCuenta: '', concepto };
}
