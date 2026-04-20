// ============================================================
// SUNO ACADEMY · utils/shortcuts.js
// Keyboard shortcuts globales
// K → buscar | 1-9 → nav | Esc → cerrar overlays
// ============================================================

const ROUTES = [
  'dashboard', // 1
  'studio',    // 2
  'academy',   // 3
  'coach',     // 4
  'playbooks', // 5
  'maxmode',   // 6
  'checklist', // 7
  'arena',     // 8
  'profile',   // 9
];

function isInputFocused() {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function initShortcuts({ onSearch, onClose } = {}) {
  document.addEventListener('keydown', e => {
    // No interceptar cuando el usuario escribe en un campo
    if (isInputFocused()) return;

    const key = e.key;

    // ⌘K / Ctrl+K — abrir búsqueda
    if ((e.metaKey || e.ctrlKey) && (key === 'k' || key === 'K')) {
      e.preventDefault();
      onSearch?.();
      return;
    }

    // K sin modificador — abrir búsqueda
    if (key === 'k' || key === 'K') {
      e.preventDefault();
      onSearch?.();
      return;
    }

    // Esc — cerrar overlay activo
    if (key === 'Escape') {
      onClose?.();
      return;
    }

    // 1-9 — navegar a ruta
    const num = parseInt(key, 10);
    if (num >= 1 && num <= 9) {
      const route = ROUTES[num - 1];
      if (route) {
        e.preventDefault();
        location.hash = `#/${route}`;
      }
    }
  }, { passive: false });
}
