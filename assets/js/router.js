// ============================================================
// SUNO ACADEMY · router.js
// Hash routing simple: #/ruta?query
// ============================================================

import { $, $$ } from './utils/dom.js';
import { store }  from './store.js';

const ROUTES = [
  'dashboard', 'studio', 'academy', 'coach',
  'playbooks', 'maxmode', 'checklist', 'arena', 'profile'
];

const DEFAULT_ROUTE = 'dashboard';

// Lazy-import de vistas. Cada vista expone `render(container, query)` y opcional `destroy()`.
const LOADERS = {
  dashboard: () => import('./views/dashboard.js'),
  studio:    () => import('./views/studio.js'),
  academy:   () => import('./views/academy.js'),
  coach:     () => import('./views/coach.js'),
  playbooks: () => import('./views/playbooks.js'),
  maxmode:   () => import('./views/maxmode.js'),
  checklist: () => import('./views/checklist.js'),
  arena:     () => import('./views/arena.js'),
  profile:   () => import('./views/profile.js')
};

let currentRoute = null;
let currentModule = null;

// ── Parseo ──────────────────────────────────────────────────
function parseHash() {
  const hash = location.hash.replace(/^#\/?/, '') || DEFAULT_ROUTE;
  const [route, queryStr] = hash.split('?');
  const query = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = v ? decodeURIComponent(v) : '';
    });
  }
  return {
    route: ROUTES.includes(route) ? route : DEFAULT_ROUTE,
    query
  };
}

// ── Render de la vista activa ──────────────────────────────
async function renderRoute() {
  const { route, query } = parseHash();

  // Destruir vista anterior si existe
  if (currentModule && typeof currentModule.destroy === 'function') {
    try { currentModule.destroy(); } catch (e) { console.warn(e); }
  }

  // Ocultar todas las vistas
  $$('.view').forEach(v => v.hidden = true);

  // Cargar módulo de la nueva vista
  const container = $(`#view-${route}`);
  if (!container) {
    console.warn(`[router] Vista no encontrada: ${route}`);
    return;
  }
  container.hidden = false;

  // Estado inicial: spinner ya está en el HTML
  try {
    const mod = await LOADERS[route]();
    currentModule = mod;
    if (typeof mod.render === 'function') {
      mod.render(container, query);
    } else {
      container.innerHTML = `<div class="card"><h2>${route}</h2><p class="muted">Vista en desarrollo.</p></div>`;
    }
  } catch (err) {
    console.error(`[router] Error cargando vista ${route}:`, err);
    container.innerHTML = `
      <div class="card">
        <h2>Error al cargar la vista</h2>
        <p class="muted">No pudimos cargar <code>${route}</code>. Recarga la página.</p>
      </div>`;
  }

  // Actualizar links activos
  $$('.nav-link, .bn-link').forEach(el => {
    el.classList.toggle('active', el.dataset.route === route);
  });

  // Actualizar título y persistencia
  document.title = `SUNO ACADEMY · ${route.charAt(0).toUpperCase() + route.slice(1)}`;
  store.set('lastRoute', route);

  // Scroll to top al cambiar de ruta (no en replace interno)
  if (currentRoute !== route) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  currentRoute = route;

  // Señalar cambio de ruta
  window.dispatchEvent(new CustomEvent('suno:route', { detail: { route, query } }));
}

// ── Helper público ──────────────────────────────────────────
export function navigate(route, query = {}) {
  const qs = Object.keys(query).length
    ? '?' + Object.entries(query).map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
    : '';
  location.hash = `#/${route}${qs}`;
}

// ── Init ────────────────────────────────────────────────────
export function initRouter() {
  window.addEventListener('hashchange', renderRoute);

  // Si no hay hash, ir a la última ruta visitada o al default
  if (!location.hash) {
    const last = store.get('lastRoute') || DEFAULT_ROUTE;
    location.hash = `#/${last}`;
    return; // El hashchange dispara renderRoute
  }
  renderRoute();
}

// EOF
