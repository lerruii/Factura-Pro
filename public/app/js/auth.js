/* ============================================================
   FacturaPro SaaS — Autenticación en el cliente
   Pantalla de acceso (login / registro) y arranque de la app.
   ============================================================ */

async function arrancarApp() {
  try {
    const r = await apiFetch('/api/me');
    currentUser = r.user;
    await entrarApp();
  } catch {
    mostrarAuth(new URLSearchParams(location.search).get('registro') !== null ? 'registro' : 'login');
  }
}

async function entrarApp(extra = {}) {
  await cargarDatosRemotos();
  // cuenta recién creada: aplica el sistema contable y el nombre elegidos
  if (extra.pais && PAISES[extra.pais]) aplicarPais(extra.pais);
  if (extra.nombre && !state.settings.empresa.nombre) state.settings.empresa.nombre = extra.nombre;
  if (extra.pais || extra.nombre) saveState();
  configurarMoneda();
  document.body.classList.add('authed');
  $('#auth-screen').hidden = true;
  aplicarTema();
  pintarCuentaSidebar();
  navegar();
}

function pintarCuentaSidebar() {
  const el = $('#sidebar-user');
  if (!el || !currentUser) return;
  el.querySelector('.su-email').textContent = currentUser.email;
  el.querySelector('.su-plan').textContent = currentUser.limites?.nombre || 'Gratis';
  el.querySelector('.su-plan').classList.toggle('pro', currentUser.plan === 'pro');
  const adminLink = $('#nav-admin');
  if (adminLink) adminLink.hidden = !currentUser.admin;
}

async function cerrarSesion() {
  try { await flushSave(true); } catch { /* mejor esfuerzo */ }
  try { await apiFetch('/api/auth/logout', { method: 'POST' }); } catch { /* la cookie caducará */ }
  location.hash = '#/panel';
  location.reload();
}

/* ---------- pantalla de acceso ---------- */

function mostrarAuth(modo = 'login') {
  document.body.classList.remove('authed');
  const scr = $('#auth-screen');
  scr.hidden = false;
  const esLogin = modo === 'login';

  scr.innerHTML = `
    <div class="auth-card">
      <div class="auth-brand">
        <svg class="brand-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="2" width="18" height="20" rx="3" fill="var(--primary)"/>
          <path d="M8 8h8M8 12h8M8 16h5" stroke="var(--on-primary)" stroke-width="1.8" stroke-linecap="round"/>
        </svg>
        <span class="brand-name">FacturaPro</span>
      </div>

      <div class="seg auth-tabs" role="tablist">
        <button type="button" role="tab" aria-selected="${esLogin}" class="${esLogin ? 'active' : ''}" data-modo="login">Iniciar sesión</button>
        <button type="button" role="tab" aria-selected="${!esLogin}" class="${!esLogin ? 'active' : ''}" data-modo="registro">Crear cuenta</button>
      </div>

      <form id="auth-form" novalidate>
        ${esLogin ? '' : `
        <div class="field">
          <label for="au-nombre">Tu nombre o el de tu empresa</label>
          <input id="au-nombre" autocomplete="organization" placeholder="Mi Empresa S.L.">
        </div>
        <div class="field">
          <label for="au-pais">País / sistema contable</label>
          <select id="au-pais">
            <option value="ES">España — IVA e IRPF (EUR €)</option>
            <option value="PE">Perú — IGV (PEN S/)</option>
            <option value="CO">Colombia — IVA y Retefuente (COP $)</option>
            <option value="US">Estados Unidos — Sales Tax (USD $)</option>
          </select>
          <div class="help">Define los impuestos, la moneda y el formato de tus facturas</div>
        </div>`}
        <div class="field">
          <label for="au-email">Email <span class="req">*</span></label>
          <input id="au-email" type="email" autocomplete="email" required placeholder="tu@email.com">
        </div>
        <div class="field">
          <label for="au-pass">Contraseña <span class="req">*</span></label>
          <div class="pass-wrap">
            <input id="au-pass" type="password" autocomplete="${esLogin ? 'current-password' : 'new-password'}" required minlength="8" placeholder="${esLogin ? 'Tu contraseña' : 'Mínimo 8 caracteres'}">
            <button type="button" class="btn-icon pass-toggle" id="au-ver" aria-label="Mostrar contraseña">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          ${esLogin ? '' : '<div class="help">Al menos 8 caracteres</div>'}
        </div>
        <div class="error-msg auth-error" id="au-error" role="alert" hidden></div>
        <button type="submit" class="btn btn-primary auth-submit" id="au-submit">
          ${esLogin ? 'Entrar' : 'Crear mi cuenta gratis'}
        </button>
      </form>

      <p class="auth-foot">
        ${esLogin ? '¿Aún no tienes cuenta? <a href="#" data-modo="registro">Regístrate gratis</a>'
                  : '¿Ya tienes cuenta? <a href="#" data-modo="login">Inicia sesión</a>'}
      </p>
      <p class="auth-foot"><a href="/">&larr; Volver a la página principal</a></p>
    </div>`;

  scr.querySelectorAll('[data-modo]').forEach(el =>
    el.addEventListener('click', e => { e.preventDefault(); mostrarAuth(el.dataset.modo); }));

  $('#au-ver').addEventListener('click', () => {
    const inp = $('#au-pass');
    inp.type = inp.type === 'password' ? 'text' : 'password';
    $('#au-ver').setAttribute('aria-label', inp.type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña');
  });

  $('#auth-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = $('#au-error');
    errEl.hidden = true;
    const email = $('#au-email').value.trim();
    const password = $('#au-pass').value;
    if (!email || !password) {
      errEl.textContent = 'Rellena el email y la contraseña.';
      errEl.hidden = false;
      return;
    }
    const btn = $('#au-submit');
    btn.disabled = true;
    btn.textContent = esLogin ? 'Entrando…' : 'Creando cuenta…';
    try {
      const cuerpo = esLogin ? { email, password }
        : { email, password, nombre: $('#au-nombre')?.value.trim() || '' };
      const pais = esLogin ? '' : ($('#au-pais')?.value || 'ES');
      const r = await apiFetch(`/api/auth/${esLogin ? 'login' : 'registro'}`, { method: 'POST', body: cuerpo });
      currentUser = r.user;
      await entrarApp(esLogin ? {} : { pais, nombre: cuerpo.nombre });
    } catch (err) {
      errEl.textContent = err.message;
      errEl.hidden = false;
      btn.disabled = false;
      btn.textContent = esLogin ? 'Entrar' : 'Crear mi cuenta gratis';
    }
  });

  $('#au-email').focus();
}
