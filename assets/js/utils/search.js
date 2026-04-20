// ============================================================
// SUNO ACADEMY · utils/search.js
// Command palette: índice estático + búsqueda fuzzy básica
// ============================================================

import { $ } from './dom.js';

// Índice de ítems buscables — se completa con datos dinámicos
const STATIC_INDEX = [
  { title: 'Dashboard',  sub: 'Vista', icon: '⬡', route: 'dashboard' },
  { title: 'Studio',     sub: 'Vista', icon: '🎛', route: 'studio' },
  { title: 'Academy',    sub: 'Vista', icon: '◈', route: 'academy' },
  { title: 'Coach',      sub: 'Vista', icon: '🧠', route: 'coach' },
  { title: 'Playbooks',  sub: 'Vista', icon: '⚡', route: 'playbooks' },
  { title: 'Max Mode',   sub: 'Vista', icon: '🔥', route: 'maxmode' },
  { title: 'Checklist',  sub: 'Vista', icon: '✦', route: 'checklist' },
  { title: 'Arena',      sub: 'Vista', icon: '🎮', route: 'arena' },
  { title: 'Profile',    sub: 'Vista', icon: '👤', route: 'profile' },
];

let dynamicIndex = [];
let overlay, input, results, backdrop;
let selectedIdx = -1;
let isOpen = false;

// ── Búsqueda: score por coincidencia ────────────────────────
function score(item, q) {
  const hay = (item.title + ' ' + (item.sub || '')).toLowerCase();
  const needle = q.toLowerCase().trim();
  if (!needle) return 1;
  if (hay.startsWith(needle)) return 3;
  if (hay.includes(needle)) return 2;
  // fuzzy: todos los chars del needle en orden
  let hi = 0;
  for (const ch of needle) {
    const pos = hay.indexOf(ch, hi);
    if (pos === -1) return 0;
    hi = pos + 1;
  }
  return 1;
}

function getItems(q) {
  const all = [...STATIC_INDEX, ...dynamicIndex];
  if (!q.trim()) return all.slice(0, 10);
  return all
    .map(it => ({ it, s: score(it, q) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 10)
    .map(({ it }) => it);
}

// ── Renderizar resultados ────────────────────────────────────
function render(q) {
  const items = getItems(q);
  selectedIdx = items.length ? 0 : -1;

  if (!items.length) {
    results.innerHTML = '';
    return;
  }

  results.innerHTML = items.map((it, i) => `
    <li
      class="search-result-item"
      role="option"
      data-idx="${i}"
      data-route="${it.route || ''}"
      data-url="${it.url || ''}"
      aria-selected="${i === selectedIdx}"
    >
      <span class="sri-icon" aria-hidden="true">${it.icon || '→'}</span>
      <span class="sri-body">
        <span class="sri-title">${it.title}</span>
        <span class="sri-sub">${it.sub || ''}</span>
      </span>
      <kbd class="sri-kbd">↩</kbd>
    </li>
  `).join('');

  // Click en resultado
  results.querySelectorAll('.search-result-item').forEach(li => {
    li.addEventListener('click', () => activateItem(li));
  });
}

function activateItem(li) {
  if (!li) return;
  const route = li.dataset.route;
  const url = li.dataset.url;
  if (route) location.hash = `#/${route}`;
  else if (url) window.open(url, '_blank', 'noopener');
  close();
}

function updateSelection() {
  results.querySelectorAll('.search-result-item').forEach((li, i) => {
    li.setAttribute('aria-selected', String(i === selectedIdx));
  });
}

// ── Navegación por teclado dentro del panel ──────────────────
function handlePanelKey(e) {
  const items = results.querySelectorAll('.search-result-item');
  if (!items.length) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIdx = (selectedIdx + 1) % items.length;
    updateSelection();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIdx = (selectedIdx - 1 + items.length) % items.length;
    updateSelection();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (selectedIdx >= 0) activateItem(items[selectedIdx]);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    close();
  }
}

// ── Abrir / cerrar ───────────────────────────────────────────
export function open() {
  if (!overlay) return;
  isOpen = true;
  overlay.hidden = false;
  input.value = '';
  render('');
  requestAnimationFrame(() => input.focus());
}

export function close() {
  if (!overlay) return;
  isOpen = false;
  overlay.hidden = true;
  input.blur();
}

export function toggle() {
  isOpen ? close() : open();
}

// ── Enriquecer índice con datos de SUNO ──────────────────────
export function addToIndex(items) {
  dynamicIndex.push(...items);
}

// ── Init ─────────────────────────────────────────────────────
export function initSearch() {
  overlay   = $('#searchOverlay');
  input     = $('#searchInput');
  results   = $('#searchResults');
  backdrop  = $('#searchBackdrop');

  if (!overlay || !input || !results) return;

  // Input → buscar en tiempo real
  input.addEventListener('input', () => render(input.value));

  // Teclado dentro del panel
  input.addEventListener('keydown', handlePanelKey);

  // Click en backdrop cierra
  backdrop?.addEventListener('click', close);

  // Botón de búsqueda en topbar
  $('#searchBtn')?.addEventListener('click', open);
}
