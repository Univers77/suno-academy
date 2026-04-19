// ============================================================
// SUNO ACADEMY · utils/dom.js
// Helpers mínimos: $, $$, on, el, escapeHtml
// ============================================================

export const $  = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

export function on(target, event, handler, options) {
  if (!target) return () => {};
  target.addEventListener(event, handler, options);
  return () => target.removeEventListener(event, handler, options);
}

/**
 * Crea un elemento con atributos y children.
 * el('div', {class: 'card'}, ['Hola', el('b', {}, 'mundo')])
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v == null || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.entries(v).forEach(([dk, dv]) => node.dataset[dk] = dv);
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v === true ? '' : v);
  });
  const kids = Array.isArray(children) ? children : [children];
  kids.forEach(c => {
    if (c == null || c === false) return;
    if (typeof c === 'string' || typeof c === 'number') node.appendChild(document.createTextNode(String(c)));
    else node.appendChild(c);
  });
  return node;
}

export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

// Toast simple
export function toast(text, kind = 'info') {
  const stack = $('#toastStack');
  if (!stack) return;
  const t = el('div', { class: `toast ${kind}`, role: 'status' }, text);
  stack.appendChild(t);
  setTimeout(() => { t.remove(); }, 3800);
}

// EOF
