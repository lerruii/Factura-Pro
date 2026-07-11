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
  | México | IVA 16/8/0 % | Ret. ISR 0/1,25/10 % | MXN | FACTURA (campos CFDI) | RFC |
  | Perú | IGV 18/0 % | — | PEN | FACTURA ELECTRÓNICA | RUC |
  | Colombia | IVA 19/5/0 % | Retefuente 0–11 % | COP | FACTURA DE VENTA | NIT |
  | EE. UU. | Sales Tax (tasa libre) | — | USD | INVOICE (en inglés) | EIN |

  El QR SEPA se genera solo en España; en el resto de países el QR codifica el
  enlace de pago y la factura muestra los datos bancarios configurados.

  Requisitos legales de contenido que la factura aplica según el país:
  - **Importe en letras** al pie (Perú «SON: … SOLES», Colombia «… PESOS M/CTE»,
    México «… PESOS M.N.»)
  - **Campos fiscales por factura**: forma de pago Contado/Crédito (SUNAT y
    DIAN) y, en México, Uso CFDI + forma de pago SAT + método de pago (PUE/PPD)
  - **Información legal del emisor** configurable en Ajustes con la pista de lo
    que exige cada normativa (resolución de facturación DIAN, régimen fiscal
    SAT, datos registrales…)
  - **Leyenda automática** cuando hay conceptos exentos o a tasa 0
  - **Numeración**: Perú usa serie F001 y correlativo de 8 dígitos (SUNAT)

  > Nota: la factura cumple los requisitos de *contenido*. La facturación
  > electrónica oficial (timbrado CFDI del SAT, CPE de SUNAT, validación DIAN,
  > Verifactu) exige integrarse con cada administración tributaria y queda
  > fuera del alcance actual.

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

## Panel de administración

En `/app/#/admin` (enlace «Administración» en la barra lateral) el administrador
puede ver todos los usuarios con su plan y consumo, **cambiar el plan de
cualquier usuario manualmente** y **configurar la pasarela de pagos (Stripe)
desde la web**, sin tocar el servidor.

¿Quién es administrador? El email definido en la variable `ADMIN_EMAIL` o, si
no está definida, **el primer usuario registrado** en la instancia. En
producción: registra tu cuenta nada más desplegar (o define `ADMIN_EMAIL` en
las variables del hosting).

### Límite del plan Gratis

El límite de 20 facturas es **acumulado**: cuenta las facturas creadas en la
vida de la cuenta, de modo que eliminar facturas no libera cupo. El límite de
clientes sí es sobre los activos.

## Suscripciones con Stripe (opcional)

Sin configurar, el botón «Pasar a Pro» activa el plan directamente (modo demo,
útil para probar). Para cobrar de verdad tienes dos opciones:

- **Desde el panel de administración** (recomendado): pega la clave secreta,
  el price id y el webhook secret en la sección «Pasarela de pagos». Se
  guardan en la base de datos y tienen prioridad sobre las variables de entorno.
- **Por variables de entorno**: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID` y
  `STRIPE_WEBHOOK_SECRET` (ver `.env.example`).

## Despliegue en producción (hacerlo público en internet)

El proyecto incluye un `Dockerfile` y un endpoint `/health`, así que funciona
en cualquier hosting moderno. **Importante**: la base de datos es un archivo
SQLite en `data/`, por lo que el hosting necesita **disco persistente**
(volumen); en los planes "gratis sin disco" los datos se borrarían en cada
despliegue.

### Opción recomendada: Railway (~5 $/mes, con dominio y HTTPS incluidos)

1. Crea una cuenta en https://railway.app (puedes entrar con GitHub).
2. Sube este repositorio a GitHub:
   ```bash
   # crea un repo vacío en github.com llamado facturapro y luego:
   git remote add origin https://github.com/TU_USUARIO/facturapro.git
   git push -u origin main
   ```
3. En Railway: **New Project → Deploy from GitHub repo** → elige `facturapro`.
   Detecta el `Dockerfile` y despliega solo.
4. En el servicio → **Variables**: añade `NODE_ENV=production`.
5. En el servicio → **Settings → Volumes**: crea un volumen montado en
   `/app/data` (aquí vive la base de datos).
6. En **Settings → Networking → Generate Domain**: tendrás tu URL pública
   `https://facturapro-xxxx.up.railway.app`. Si compras un dominio propio
   (p. ej. en Namecheap o Cloudflare), añádelo en **Custom Domain**.

Cada `git push` a `main` re-despliega automáticamente.

### Alternativas

- **Render.com**: igual de fácil (Web Service desde GitHub + Disk en `/app/data`,
  plan Starter ~7 $/mes). El plan gratuito NO tiene disco persistente.
- **Fly.io**: `fly launch` + `fly volumes create` (CLI, algo más técnico).
- **VPS** (Hetzner/DigitalOcean, 4–6 €/mes): control total. Instala Node 24 o
  Docker, ejecuta la app y pon delante Caddy (`caddy reverse-proxy --from
  tudominio.com --to localhost:3000`) para HTTPS automático.
- **Probarlo ya sin pagar**: instala Cloudflare Tunnel y ejecuta
  `cloudflared tunnel --url http://localhost:3000` — te da una URL pública
  temporal que funciona mientras tu PC esté encendido.

### Lista de comprobación de producción

- [ ] `NODE_ENV=production` definido (activa cookies seguras; requiere HTTPS)
- [ ] Volumen/disco persistente montado en `data/`
- [ ] Copia de seguridad periódica de `data/facturapro.db`
- [ ] Claves de Stripe en variables de entorno si quieres cobrar el plan Pro
- [ ] Borra `data/` local antes del primer despliegue si hiciste pruebas (o
      simplemente no lo subas: está en `.gitignore` y `.dockerignore`)

> La migración desde la versión local anterior es automática: al iniciar sesión
> por primera vez en el mismo navegador, la app ofrece importar los datos
> antiguos de localStorage a la cuenta.
