# FacturaPro — SaaS de contabilidad y facturación con QR de pago

Aplicación SaaS multiusuario para llevar la contabilidad de empresas y autónomos
y emitir facturas con **código QR de pago SEPA** y **enlace de pago online**.

- **Landing pública** con planes en `/`
- **Aplicación** en `/app` (cuentas de usuario, datos aislados por cliente)
- **API** en `/api` (Node.js + Express + SQLite)
- **Planes**: Gratis (20 facturas, 10 clientes) y Pro 9,90 €/mes (ilimitado),
  con Stripe Checkout opcional
- **Sistemas contables por país** (se elige al crear la cuenta y en Ajustes):

  | País | Impuesto | Retención | Moneda | Doc. fiscal | ID fiscal |
  |---|---|---|---|---|---|
  | España | IVA 21/10/4/0 % | IRPF 0/7/15/19 % | EUR | FACTURA (+ QR SEPA) | NIF/CIF |
  | Perú | IGV 18/0 % | — | PEN | FACTURA ELECTRÓNICA | RUC |
  | Colombia | IVA 19/5/0 % | Retefuente 0–11 % | COP | FACTURA DE VENTA | NIT |
  | EE. UU. | Sales Tax (tasa libre) | — | USD | INVOICE (en inglés) | EIN |

  El QR SEPA se genera solo en España; en el resto de países el QR codifica el
  enlace de pago y la factura muestra los datos bancarios configurados.

## Puesta en marcha

```bash
npm install
npm start          # http://localhost:3000
```

Para desarrollo con recarga automática: `npm run dev`.

No necesita más configuración: la base de datos SQLite se crea sola en
`data/facturapro.db` y el secreto de sesión se genera en el primer arranque.

## Funcionalidades de la aplicación

| Sección | Qué hace |
|---|---|
| **Panel** | KPIs del año, aviso de facturas vencidas, gráfico mensual de ingresos/gastos y gastos por categoría. |
| **Facturas** | Crear, editar, duplicar, filtrar y buscar. Estados: borrador, emitida, pagada, vencida (automático). Impresión / PDF en A4 con QR de pago. |
| **Clientes / Productos** | Fichas de cliente y catálogo de productos con precio e IVA. |
| **Gastos** | Registro con categoría, IVA soportado y deducibilidad. Export CSV. |
| **Contabilidad** | Resumen trimestral (modelos 303/130): IVA repercutido/soportado, IVA a liquidar, IRPF. Libro de facturas y export CSV. |
| **Mi cuenta** | Plan actual, uso, cambio a Pro y cierre de sesión. |
| **Ajustes** | Datos de empresa, logo, IBAN/BIC, enlace de pago, series, copias de seguridad JSON. |

### QR y enlace de pago

Con el **IBAN** configurado, cada factura incluye un **QR SEPA (norma
EPC069-12)**: el cliente lo escanea con la app de su banco y la transferencia se
rellena con el importe y el concepto exactos. El **enlace de pago** (PayPal.me,
Stripe Payment Link…) admite las variables `{importe}` y `{numero}`.

## Arquitectura

```
server/
  index.js      Express: estáticos, API, arranque
  db.js         SQLite (node:sqlite), usuarios y datos por usuario
  auth.js       Registro, login, logout, sesión JWT en cookie httpOnly
  data.js       GET/PUT /api/data con límites de plan (402 al superarlos)
  billing.js    Planes, Stripe Checkout + webhook (opcional)
public/
  index.html    Landing pública con precios
  app/          Aplicación (vanilla JS, sin framework)
    js/store.js   Estado + sincronización con la API (guardado con debounce)
    js/auth.js    Pantalla de acceso y arranque autenticado
    js/app.js     Rutas, vistas y CRUD
    js/qr.js      QR SEPA (EPC) y QR de enlace de pago
    js/charts.js  Gráficos SVG sin dependencias
data/           Base de datos y secreto de sesión (no subir a git)
```

Seguridad: contraseñas con bcrypt, sesión JWT en cookie `httpOnly` + `SameSite=Lax`,
límites de plan aplicados también en el servidor, datos de cada cuenta aislados.

## Suscripciones con Stripe (opcional)

Sin configurar, el botón «Pasar a Pro» activa el plan directamente (modo demo,
útil para probar). Para cobrar de verdad, copia `.env.example` a `.env` y
rellena `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` y `STRIPE_WEBHOOK_SECRET`
(instrucciones dentro del archivo).

## Despliegue en producción

Cualquier hosting con Node 22.13+ sirve (VPS, Railway, Render, Fly.io…):

1. Sube el proyecto y ejecuta `npm install && npm start` detrás de un proxy
   HTTPS (Caddy, Nginx…).
2. Define `NODE_ENV=production` (activa cookies seguras) y, si quieres,
   `JWT_SECRET` propio.
3. Haz copia de seguridad periódica de la carpeta `data/`.

> La migración desde la versión local anterior es automática: al iniciar sesión
> por primera vez en el mismo navegador, la app ofrece importar los datos
> antiguos de localStorage a la cuenta.
