// ============================================================
// SUNO ACADEMY · app.js
// Bootstrap: datos → gamificación → router → UI
// ============================================================

import { initRouter }          from './router.js';
import { store, ensureSchema } from './store.js';
import { initBackgroundWaves } from './engines/visualizer.js';
import { initGamification }    from './engines/gamification.js';
import { $, toast }            from './utils/dom.js';
import { initSearch, addToIndex } from './utils/search.js';
import { initShortcuts }       from './utils/shortcuts.js';
import { initEffects, refreshEffects } from './utils/effects.js';

// ── Datos de la app ─────────────────────────────────────────
const appData = {
  videos:    null,
  tips:      null,
  playbooks: null,
  checks:    null,
  injectors: null,
  missions:  null,
  badges:    null,
  levels:    null,
  lessons:   null,
  kb:        null,
  maxMode:   null,
  challenge: null
};

// Exponer read-only para vistas (sin globals mutables)
export function getData() { return appData; }

// ── Normalizar wrappers {items/entries/data} ─────────────────
function unwrap(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw.items))   return raw.items;
  if (Array.isArray(raw.entries)) return raw.entries;
  if (Array.isArray(raw.data))    return raw.data;
  return raw;
}

// ── Cargar todos los JSON en paralelo ───────────────────────
async function loadData() {
  const files = [
    ['videos',    'data/videos.json'],
    ['tips',      'data/tips.json'],
    ['playbooks', 'data/playbooks.json'],
    ['checks',    'data/checks.json'],
    ['injectors', 'data/injectors.json'],
    ['missions',  'data/missions.json'],
    ['badges',    'data/badges.json'],
    ['levels',    'data/levels.json'],
    ['lessons',   'data/lessons.json'],
    ['kb',        'data/kb.json'],
    ['maxMode',   'data/max-mode.json'],
    ['challenge', 'data/challenge.json']
  ];

  const results = await Promise.allSettled(
    files.map(([, path]) => fetch(path).then(r => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    }))
  );

  results.forEach((res, i) => {
    const [key, path] = files[i];
    if (res.status === 'fulfilled') {
      appData[key] = unwrap(res.value);
    } else {
      console.warn(`[SUNO] Dataset faltante: ${path}`, res.reason?.message);
    }
  });
}

// ── Enriquecer índice de búsqueda con datos cargados ────────
function buildSearchIndex() {
  const items = [];

  if (Array.isArray(appData.playbooks)) {
    appData.playbooks.forEach(pb => items.push({
      title: pb.title,
      sub: `Playbook · ${pb.level || ''}`,
      icon: '⚡',
      route: 'playbooks'
    }));
  }

  if (appData.lessons?.modules) {
    appData.lessons.modules.forEach(mod => {
      (mod.lessons || []).forEach(l => items.push({
        title: l.title,
        sub: `Lección · ${mod.title}`,
        icon: '◈',
        route: 'academy'
      }));
    });
  }

  if (Array.isArray(appData.videos)) {
    appData.videos.forEach(v => items.push({
      title: v.title,
      sub: `Video · ${v.duration || ''}`,
      icon: '▶',
      route: 'academy'
    }));
  }

  addToIndex(items);
}

// ── Menu móvil ───────────────────────────────────────────────
function initMobileMenu() {
  const btn  = $('#menuBtn');
  const side = $('#sidebar');
  if (!btn || !side) return;

  btn.addEventListener('click', () => {
    const isOpen = side.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar al hacer click fuera
  document.addEventListener('click', e => {
    if (side.classList.contains('open') && !side.contains(e.target) && e.target !== btn) {
      side.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Credit chip — navega al perfil ──────────────────────────
function initCreditChip() {
  const chip = $('#creditChip');
  if (!chip) return;
  chip.addEventListener('click', () => { location.hash = '#/profile'; });
}

// ── Actualizar chip de créditos ──────────────────────────────
export function updateCreditDisplay() {
  const el = $('#creditValue');
  if (!el) return;
  const stats = store.get('stats');
  el.textContent = (stats.tokens ?? 500).toLocaleString();
}

// ── Boot ─────────────────────────────────────────────────────
async function boot() {
  try {
    ensureSchema();
    await loadData();

    // Gamificación antes del router para que el store esté listo
    initGamification();

    // Buscador
    initSearch();
    buildSearchIndex();

    // Atajos de teclado
    initShortcuts({
      onSearch: () => {
        const o = $('#searchOverlay');
        if (o) {
          const isHidden = o.hidden;
          o.hidden = !isHidden;
          if (!isHidden) {
            $('#searchInput')?.focus();
          }
        }
      },
      onClose: () => {
        const o = $('#searchOverlay');
        if (o && !o.hidden) o.hidden = true;
        // Cerrar sidebar móvil si está abierto
        const side = $('#sidebar');
        if (side?.classList.contains('open')) {
          side.classList.remove('open');
          $('#menuBtn')?.setAttribute('aria-expanded', 'false');
        }
      }
    });

    // Router (renderiza la vista inicial)
    initRouter();

    // Background canvas
    initBackgroundWaves($('#bgc'));

    // Visual effects (stars, 3D tilt, cyber glow)
    initEffects();

    // UI
    initMobileMenu();
    initCreditChip();
    updateCreditDisplay();

    // Señal de boot para vistas que esperan datos
    window.dispatchEvent(new CustomEvent('suno:ready', { detail: { data: appData } }));

    // Re-init tilt/glow after each view renders new cards
    window.addEventListener('suno:view-rendered', () => refreshEffects());

  } catch (err) {
    console.error('[SUNO] Boot error:', err);
    document.body.insertAdjacentHTML('afterbegin', `
      <div style="
        position:fixed;top:0;left:0;right:0;
        padding:12px 16px;
        background:#ff6d83;color:#0c0e12;
        z-index:9999;font-family:monospace;font-size:13px;
        display:flex;align-items:center;gap:8px
      ">
        <strong>Error al inicializar.</strong> Verifica la consola del navegador.
      </div>
    `);
  }
}

// ── Service Worker ───────────────────────────────────────────
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  navigator.serviceWorker.register('sw.js').catch(err => {
    console.warn('[SUNO] SW register failed:', err);
  });
}

// ── Start ─────────────────────────────────────────────────────
boot();
registerSW();
