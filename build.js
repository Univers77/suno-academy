// ============================================================
// SUNO ACADEMY · build.js
// Genera index.html autocontenido — sin ES modules, sin imports externos
// Node.js: solo fs/path. Sin bundlers externos.
// ============================================================

'use strict';

const fs   = require('fs');
const path = require('path');

const BASE = path.dirname(__filename);

// ── Helpers ──────────────────────────────────────────────────

function readFile(relPath) {
  const abs = path.join(BASE, relPath);
  if (!fs.existsSync(abs)) {
    console.warn(`[WARN] Archivo no encontrado: ${abs}`);
    return '';
  }
  return fs.readFileSync(abs, 'utf8');
}

function readJSON(relPath) {
  try {
    return JSON.parse(readFile(relPath));
  } catch (e) {
    console.warn(`[WARN] JSON inválido en ${relPath}:`, e.message);
    return {};
  }
}

// Elimina líneas import/export de ES modules
function stripModules(code) {
  return code
    // Eliminar líneas de import completas
    .replace(/^import .+$/gm, '')
    // Eliminar "export default " dejando el valor
    .replace(/^export default /gm, '')
    // Eliminar "export " al inicio de declaraciones (function, const, class, let, var)
    .replace(/^export (async function|function|const|let|var|class)/gm, '$1')
    // Eliminar cualquier línea residual que solo diga "export {}" o "export { ... }"
    .replace(/^export \{[^}]*\};?\s*$/gm, '');
}

// Renombra render() y destroy() en un módulo de vista con sus nuevos nombres únicos
function renameViewFunctions(code, renderName, destroyName) {
  // Renombrar: function render( → function renderXxx(
  // También: render( dentro de clearBtn (studio re-llama render) se debe dejar si es dentro de la vista
  // Usar word-boundary cuidadoso: "function render" y "function destroy"
  code = code.replace(/\bfunction render\b/g, `function ${renderName}`);
  code = code.replace(/\bfunction destroy\b/g, `function ${destroyName}`);

  // En studio.js, el clearBtn llama render(container) internamente — debemos renombrarlo también
  // Solo en llamadas directas: render(  →  renderName(  — pero SOLO si no es parte de otro nombre
  // Usamos una estrategia: reemplazar todas las ocurrencias de "render(" que no precedan más word chars
  // Esto es seguro porque ya no hay otras funciones llamadas "render" en el scope global
  // Se hace en el paso de rename ya que el código ya no tiene prefijo "function render"
  // Solo necesitamos renombrar llamadas explícitas a render() dentro de la misma vista:
  // studio.js clearBtn llama render(container) — reemplazar
  code = code.replace(/(?<!\w)render\(container\)/g, `${renderName}(container)`);

  return code;
}

// ── Leer CSS ──────────────────────────────────────────────────

const css = [
  'assets/css/tokens.css',
  'assets/css/base.css',
  'assets/css/layout.css',
  'assets/css/components.css',
  'assets/css/sections.css'
].map(p => readFile(p)).join('\n\n');

// ── Leer JSON data ────────────────────────────────────────────

const videosJson    = readJSON('data/videos.json');
const levelsJson    = readJSON('data/levels.json');
const badgesJson    = readJSON('data/badges.json');
const missionsJson  = readJSON('data/missions.json');
const tipsJson      = readJSON('data/tips.json');
const playbooksJson = readJSON('data/playbooks.json');
const checksJson    = readJSON('data/checks.json');
const injectorsJson = readJSON('data/injectors.json');
const kbJson        = readJSON('data/kb.json');
const lessonsJson   = readJSON('data/lessons.json');

// Extraer arrays — kb usa "entries", el resto usa "items"
// lessons usa estructura especial "modules"
const SUNO_DATA = {
  videos:    videosJson.items    || [],
  levels:    levelsJson.items    || [],
  badges:    badgesJson.items    || [],
  missions:  missionsJson.items  || [],
  tips:      tipsJson.items      || [],
  playbooks: playbooksJson.items || [],
  checks:    checksJson.items    || [],
  injectors: injectorsJson.items || [],
  kb:        kbJson.entries      || [],
  lessons:   lessonsJson         // tiene .modules
};

const SUNO_DATA_JSON = JSON.stringify(SUNO_DATA, null, 0);

// ── Leer JS sources ───────────────────────────────────────────

const domJS         = stripModules(readFile('assets/js/utils/dom.js'));
const storeJS       = stripModules(readFile('assets/js/store.js'));
const gamificationJS = stripModules(readFile('assets/js/engines/gamification.js'));
const analyzerJS    = stripModules(readFile('assets/js/engines/analyzer.js'));
const builderJS     = stripModules(readFile('assets/js/engines/builder.js'));
const visualizerJS  = stripModules(readFile('assets/js/engines/visualizer.js'));

// Vistas — strip + rename
const dashboardRaw   = stripModules(readFile('assets/js/views/dashboard.js'));
const studioRaw      = stripModules(readFile('assets/js/views/studio.js'));
const academyRaw     = stripModules(readFile('assets/js/views/academy.js'));
const coachRaw       = stripModules(readFile('assets/js/views/coach.js'));
const playbooksRaw   = stripModules(readFile('assets/js/views/playbooks.js'));
const maxmodeRaw     = stripModules(readFile('assets/js/views/maxmode.js'));
const checklistRaw   = stripModules(readFile('assets/js/views/checklist.js'));
const arenaRaw       = stripModules(readFile('assets/js/views/arena.js'));
const profileRaw     = stripModules(readFile('assets/js/views/profile.js'));

const dashboardJS  = renameViewFunctions(dashboardRaw,  'renderDashboard',  'destroyDashboard');
const studioJS     = renameViewFunctions(studioRaw,     'renderStudio',     'destroyStudio');
const academyJS    = renameViewFunctions(academyRaw,    'renderAcademy',    'destroyAcademy');
const coachJS      = renameViewFunctions(coachRaw,      'renderCoach',      'destroyCoach');
const playbooksJS  = renameViewFunctions(playbooksRaw,  'renderPlaybooks',  'destroyPlaybooks');
const maxmodeJS    = renameViewFunctions(maxmodeRaw,    'renderMaxmode',    'destroyMaxmode');
const checklistJS  = renameViewFunctions(checklistRaw,  'renderChecklist',  'destroyChecklist');
const arenaJS      = renameViewFunctions(arenaRaw,      'renderArena',      'destroyArena');
const profileJS    = renameViewFunctions(profileRaw,    'renderProfile',    'destroyProfile');

// ── Router inline ─────────────────────────────────────────────

const routerJS = `
// ============================================================
// ROUTER INLINE — sin dynamic imports
// ============================================================

const VIEW_RENDERERS = {
  dashboard: renderDashboard,
  studio:    renderStudio,
  academy:   renderAcademy,
  coach:     renderCoach,
  playbooks: renderPlaybooks,
  maxmode:   renderMaxmode,
  checklist: renderChecklist,
  arena:     renderArena,
  profile:   renderProfile
};

let _currentRoute = null;
let _currentDestroy = null;

const VIEW_DESTROYERS = {
  dashboard: destroyDashboard,
  studio:    destroyStudio,
  academy:   destroyAcademy,
  coach:     destroyCoach,
  playbooks: destroyPlaybooks,
  maxmode:   destroyMaxmode,
  checklist: destroyChecklist,
  arena:     destroyArena,
  profile:   destroyProfile
};

function navigate(route) {
  location.hash = '#/' + route;
}

function renderRoute() {
  // Parsear hash: #/route?param=value
  const raw  = location.hash || '#/dashboard';
  const withoutHash = raw.slice(2); // quitar '#/'
  const [routePart, queryStr] = withoutHash.split('?');
  const route = routePart || 'dashboard';

  // Parsear query string simple
  const query = {};
  if (queryStr) {
    queryStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k) query[decodeURIComponent(k)] = decodeURIComponent(v || '');
    });
  }

  // Destruir vista anterior
  if (_currentDestroy) {
    try { _currentDestroy(); } catch (e) { console.warn('[router] destroy error:', e); }
    _currentDestroy = null;
  }

  // Ocultar todas las vistas, mostrar la activa
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  const target = document.getElementById('view-' + route);
  if (target) target.hidden = false;

  // Actualizar nav links activos
  document.querySelectorAll('[data-route]').forEach(link => {
    link.classList.toggle('active', link.dataset.route === route);
  });

  // Llamar renderer
  const renderer = VIEW_RENDERERS[route];
  if (renderer && target) {
    try {
      renderer(target, query);
      _currentDestroy = VIEW_DESTROYERS[route] || null;
    } catch (e) {
      console.error('[router] Error en vista ' + route + ':', e);
      target.innerHTML = '<div class="card" style="margin:var(--sp-6)"><h2>Error al cargar la vista</h2><p class="muted">' + e.message + '</p></div>';
    }
  } else if (!target) {
    console.warn('[router] No existe contenedor para ruta:', route);
    // Fallback al dashboard
    const dash = document.getElementById('view-dashboard');
    if (dash) { dash.hidden = false; renderDashboard(dash); }
  }

  // Guardar última ruta en store
  try { store.set('lastRoute', route); } catch(e) {}

  // Cerrar sidebar móvil al navegar
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');

  _currentRoute = route;
}

function initRouter() {
  window.addEventListener('hashchange', renderRoute);

  // Menu btn móvil
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  if (menuBtn && sidebar) {
    menuBtn.hidden = false;
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Ruta inicial
  if (!location.hash || location.hash === '#') {
    const last = (function() { try { return store.get('lastRoute'); } catch(e) { return null; } })();
    location.hash = '#/' + (last || 'dashboard');
  } else {
    renderRoute();
  }
}
`;

// ── Boot ──────────────────────────────────────────────────────

const bootJS = `
// ============================================================
// BOOT
// ============================================================
window.SUNO = { data: SUNO_DATA, ready: false };

try { ensureSchema(); } catch(e) { console.error('[boot] ensureSchema:', e); }
try { initGamification(); } catch(e) { console.error('[boot] initGamification:', e); }
try { initBackgroundWaves(document.getElementById('bgc')); } catch(e) { console.warn('[boot] waves:', e); }
try { initRouter(); } catch(e) { console.error('[boot] initRouter:', e); }

window.SUNO.ready = true;
window.navigate = navigate;
`;

// ── Ensamblar el script completo ──────────────────────────────

const inlineScript = `
// ============================================================
// SUNO ACADEMY · bundle autocontenido
// Generado por build.js — ${new Date().toISOString()}
// ============================================================

// === DATA ===
const SUNO_DATA = ${SUNO_DATA_JSON};

// === DOM UTILS ===
${domJS}

// === STORE ===
${storeJS}

// === ENGINE: GAMIFICATION ===
${gamificationJS}

// === ENGINE: ANALYZER ===
${analyzerJS}

// === ENGINE: BUILDER ===
${builderJS}

// === ENGINE: VISUALIZER ===
${visualizerJS}

// === VIEW: DASHBOARD ===
${dashboardJS}

// === VIEW: STUDIO ===
${studioJS}

// === VIEW: ACADEMY ===
${academyJS}

// === VIEW: COACH ===
${coachJS}

// === VIEW: PLAYBOOKS ===
${playbooksJS}

// === VIEW: MAXMODE ===
${maxmodeJS}

// === VIEW: CHECKLIST ===
${checklistJS}

// === VIEW: ARENA ===
${arenaJS}

// === VIEW: PROFILE ===
${profileJS}

// === ROUTER ===
${routerJS}

// === BOOT ===
${bootJS}
`;

// ── HTML shell ────────────────────────────────────────────────

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#0c0e12" />
<meta name="description" content="SUNO ACADEMY — Aprende, domina y compite usando Suno AI. Motor de prompts, academia de videos con timestamps, coach de diagnóstico, playbooks, Max Mode y gamificación completa. GGLabs." />
<meta property="og:title" content="SUNO ACADEMY" />
<meta property="og:description" content="La academia definitiva para dominar Suno AI — motor de prompts, videos, coach de diagnóstico y gamificación." />
<meta property="og:type" content="website" />
<title>SUNO ACADEMY · Kinetic Studio</title>

<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Manrope:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />

<style>
${css}
</style>
</head>
<body>

<!-- Background canvas (ondas sutiles) -->
<canvas id="bgc" aria-hidden="true"></canvas>

<!-- Topbar -->
<header class="topbar" role="banner">
  <div class="topbar-inner">
    <button class="menu-btn" id="menuBtn" aria-label="Abrir menú" hidden>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
    <a class="brand" href="#/dashboard">
      <span class="brand-avatar" aria-hidden="true">A</span>
      <span class="brand-text">SUNO <span class="brand-accent">ACADEMY</span></span>
    </a>
    <div class="topbar-right">
      <button class="credit-chip" id="creditChip" aria-label="Créditos disponibles">
        <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="8" cy="8" r="6"/><path d="M8 5v3l2 1"/></svg>
        <span id="creditValue">500</span> CR
      </button>
    </div>
  </div>
</header>

<!-- Shell principal: sidebar + main -->
<div class="shell">

  <!-- Sidebar (desktop) -->
  <aside class="sidebar" id="sidebar" aria-label="Navegación principal">
    <nav>
      <a href="#/dashboard" class="nav-link" data-route="dashboard">
        <span class="nav-icon" aria-hidden="true">⬡</span>
        <span>Dashboard</span>
      </a>
      <a href="#/studio" class="nav-link" data-route="studio">
        <span class="nav-icon" aria-hidden="true">🎛</span>
        <span>Studio</span>
      </a>
      <a href="#/academy" class="nav-link" data-route="academy">
        <span class="nav-icon" aria-hidden="true">◈</span>
        <span>Academy</span>
      </a>
      <a href="#/coach" class="nav-link" data-route="coach">
        <span class="nav-icon" aria-hidden="true">🧠</span>
        <span>Coach</span>
      </a>
      <a href="#/playbooks" class="nav-link" data-route="playbooks">
        <span class="nav-icon" aria-hidden="true">⚡</span>
        <span>Playbooks</span>
      </a>
      <div class="nav-sep"></div>
      <a href="#/maxmode" class="nav-link" data-route="maxmode">
        <span class="nav-icon" aria-hidden="true">🔥</span>
        <span>Max Mode</span>
      </a>
      <a href="#/checklist" class="nav-link" data-route="checklist">
        <span class="nav-icon" aria-hidden="true">✦</span>
        <span>Checklist</span>
      </a>
      <a href="#/arena" class="nav-link" data-route="arena">
        <span class="nav-icon" aria-hidden="true">🎮</span>
        <span>Arena</span>
      </a>
      <a href="#/profile" class="nav-link" data-route="profile">
        <span class="nav-icon" aria-hidden="true">👤</span>
        <span>Profile</span>
      </a>
    </nav>
    <div class="sidebar-footer">
      <small class="muted">v1.0 · GGLabs</small>
    </div>
  </aside>

  <!-- Main content -->
  <main id="main" class="main" role="main">

    <!-- Dashboard (default) -->
    <section class="view" id="view-dashboard" data-view="dashboard" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando dashboard…</p>
      </div>
    </section>

    <!-- Studio -->
    <section class="view" id="view-studio" data-view="studio" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Inicializando Synthesis Engine…</p>
      </div>
    </section>

    <!-- Academy -->
    <section class="view" id="view-academy" data-view="academy" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando academia…</p>
      </div>
    </section>

    <!-- Coach -->
    <section class="view" id="view-coach" data-view="coach" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Preparando diagnóstico…</p>
      </div>
    </section>

    <!-- Playbooks -->
    <section class="view" id="view-playbooks" data-view="playbooks" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando playbooks…</p>
      </div>
    </section>

    <!-- Max Mode -->
    <section class="view" id="view-maxmode" data-view="maxmode" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando Max Mode…</p>
      </div>
    </section>

    <!-- Checklist -->
    <section class="view" id="view-checklist" data-view="checklist" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando checklist…</p>
      </div>
    </section>

    <!-- Arena -->
    <section class="view" id="view-arena" data-view="arena" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Entrando al arena…</p>
      </div>
    </section>

    <!-- Profile -->
    <section class="view" id="view-profile" data-view="profile" hidden>
      <div class="loading-placeholder">
        <div class="ring-ph"></div>
        <p class="muted">Cargando identidad creativa…</p>
      </div>
    </section>

  </main>

</div>

<!-- Bottom Nav (mobile) -->
<nav class="bottom-nav" aria-label="Navegación móvil">
  <a href="#/dashboard" class="bn-link" data-route="dashboard">
    <span class="bn-icon" aria-hidden="true">⬡</span>
    <span class="bn-label">Dashboard</span>
  </a>
  <a href="#/studio" class="bn-link" data-route="studio">
    <span class="bn-icon" aria-hidden="true">🧪</span>
    <span class="bn-label">Lab</span>
  </a>
  <a href="#/academy" class="bn-link" data-route="academy">
    <span class="bn-icon" aria-hidden="true">◈</span>
    <span class="bn-label">Academy</span>
  </a>
  <a href="#/arena" class="bn-link" data-route="arena">
    <span class="bn-icon" aria-hidden="true">🎮</span>
    <span class="bn-label">Arena</span>
  </a>
  <a href="#/profile" class="bn-link" data-route="profile">
    <span class="bn-icon" aria-hidden="true">👤</span>
    <span class="bn-label">Profile</span>
  </a>
</nav>

<!-- Toast container -->
<div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="true"></div>

<script>
${inlineScript}
</script>
</body>
</html>`;

// ── Escribir el archivo generado ──────────────────────────────

const outPath = path.join(BASE, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

const stats = fs.statSync(outPath);
const sizeKB = (stats.size / 1024).toFixed(1);

console.log('');
console.log('╔══════════════════════════════════════════╗');
console.log('║   SUNO ACADEMY · Build completado ✓      ║');
console.log('╚══════════════════════════════════════════╝');
console.log('');
console.log(`  Archivo:  ${outPath}`);
console.log(`  Tamaño:   ${sizeKB} KB (${stats.size.toLocaleString()} bytes)`);
console.log('');
console.log('  Verificando contenido...');

// Verificaciones básicas
const content = fs.readFileSync(outPath, 'utf8');
const checks = [
  ['<script>',              'Script tag presente'],
  ['SUNO_DATA',             'SUNO_DATA inline presente'],
  ['renderDashboard',       'renderDashboard presente'],
  ['renderStudio',          'renderStudio presente'],
  ['renderAcademy',         'renderAcademy presente'],
  ['renderCoach',           'renderCoach presente'],
  ['renderPlaybooks',       'renderPlaybooks presente'],
  ['renderMaxmode',         'renderMaxmode presente'],
  ['renderChecklist',       'renderChecklist presente'],
  ['renderArena',           'renderArena presente'],
  ['renderProfile',         'renderProfile presente'],
  ['initRouter',            'initRouter presente'],
  ['initGamification',      'initGamification presente'],
  ['initBackgroundWaves',   'initBackgroundWaves presente'],
  ['ensureSchema',          'ensureSchema presente'],
  ['"videos"',              'Data videos presente'],
  ['"levels"',              'Data levels presente'],
  ['"badges"',              'Data badges presente'],
  ['type="module"',         'Sin type=module (esperado: NO encontrado)'],
];

let allOk = true;
checks.forEach(([needle, label]) => {
  const found = content.includes(needle);
  // Para "type=module" queremos que NO exista
  const ok = label.includes('(esperado: NO encontrado)') ? !found : found;
  const icon = ok ? '  ✓' : '  ✗';
  if (!ok) allOk = false;
  console.log(`${icon}  ${label}`);
});

console.log('');
if (allOk) {
  console.log('  RESULTADO: Todo OK. index.html listo para GitHub Pages.');
} else {
  console.log('  RESULTADO: Hay verificaciones fallidas (ver ✗ arriba).');
}
console.log('');
