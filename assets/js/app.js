// ============================================================
// SUNO ACADEMY · app.js
// Bootstrap: carga datos, inicia router, conecta motores
// ============================================================

import { initRouter }       from './router.js';
import { store, ensureSchema } from './store.js';
import { initBackgroundWaves } from './engines/visualizer.js';
import { initGamification }    from './engines/gamification.js';
import { $ } from './utils/dom.js';

// ── Estado global mínimo ────────────────────────────────────
const APP = {
  data: {
    videos:     null,
    tips:       null,
    playbooks:  null,
    checks:     null,
    injectors:  null,
    missions:   null,
    badges:     null,
    levels:     null,
    lessons:    null,
    kb:         null,
    maxMode:    null,
    challenge:  null
  },
  ready: false
};

// Exponer globalmente (debug y comunicación entre vistas)
window.SUNO = APP;

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
    files.map(([_, path]) => fetch(path).then(r => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    }))
  );

  // Normalize: unwrap { items/entries/data } wrapper so all keys are plain arrays/objects
  function unwrap(raw) {
    if (!raw || typeof raw !== 'object') return raw;
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw.items))   return raw.items;
    if (Array.isArray(raw.entries)) return raw.entries;
    if (Array.isArray(raw.data))    return raw.data;
    return raw; // plain object (challenge, maxMode, etc.)
  }

  results.forEach((res, i) => {
    const [key, path] = files[i];
    if (res.status === 'fulfilled') {
      APP.data[key] = unwrap(res.value);
    } else {
      console.warn(`[SUNO] Dataset faltante: ${path}`, res.reason?.message);
      APP.data[key] = null;
    }
  });
}

// ── Boot ────────────────────────────────────────────────────
async function boot() {
  try {
    ensureSchema();
    await loadData();
    initGamification();
    initRouter();
    initBackgroundWaves($('#bgc'));
    APP.ready = true;
    // Señal de boot para las vistas que esperan datos
    window.dispatchEvent(new CustomEvent('suno:ready'));
  } catch (err) {
    console.error('[SUNO] Boot error:', err);
    document.body.insertAdjacentHTML('afterbegin',
      `<div style="position:fixed;top:0;left:0;right:0;padding:12px;background:#ff6d83;color:#0c0e12;z-index:9999;font-family:monospace;font-size:13px;">
        Error al inicializar. Verifica la consola.
      </div>`);
  }
}

// ── Register Service Worker (producción) ────────────────────
function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  if (location.protocol !== 'https:' && location.hostname !== 'localhost') return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => {
      console.warn('[SUNO] SW register falló:', err);
    });
  });
}

// ── Start ───────────────────────────────────────────────────
boot();
registerSW();

// EOF
