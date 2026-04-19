// ============================================================
// SUNO ACADEMY · views/maxmode.js
// Ver SUNO-ACADEMY-SPEC.md §11
// ============================================================

import { $, toast } from '../utils/dom.js';
import { addXP }    from '../engines/gamification.js';
import { store }    from '../store.js';

export function render(container) {
  const mm = window.SUNO?.data?.maxMode || {};
  const codes = mm.codes || [];
  const when  = mm.when  || {};

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Max <span class="grad-text">Mode</span></h1>
      <p class="section-lead">Códigos exactos para llevar SUNO al límite. Copia, pega y cuida cuándo usarlos.</p>
    </div>

    <div class="grid-2">
      <div>
        <h2>Biblioteca</h2>
        ${codes.map(c => `
          <div class="card" style="margin-bottom:var(--sp-3)">
            <div class="output-head">
              <span class="output-name">${c.name}</span>
              <button class="btn btn-secondary btn-sm" data-code="${c.id}">Copiar</button>
            </div>
            <div class="mono-block">${(c.body || '').replace(/</g,'&lt;')}</div>
            ${c.note ? `<p class="muted" style="font-size:var(--tx-small);margin-top:var(--sp-2)">${c.note}</p>` : ''}
          </div>
        `).join('') || '<p class="muted">Cargando códigos...</p>'}
      </div>

      <div>
        <h2>Cuándo usarlo</h2>
        ${['useful','careful','avoid','best'].map(k => {
          const list = when[k];
          if (!list) return '';
          const label = { useful:'Útil', careful:'Cuidado', avoid:'No conviene', best:'Mejor práctica' }[k];
          const color = { useful:'success', careful:'warn', avoid:'danger', best:'success' }[k];
          return `
            <div class="card" style="margin-bottom:var(--sp-3);border-left:3px solid var(--${color})">
              <h3 style="margin-bottom:var(--sp-2);color:var(--${color})">${label}</h3>
              <ul style="padding-left:18px;line-height:1.7;color:var(--text-2);margin:0">
                ${list.map(i => `<li>${i}</li>`).join('')}
              </ul>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('[data-code]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const c = codes.find(x => x.id === btn.dataset.code);
      if (!c) return;
      try {
        await navigator.clipboard.writeText(c.body);
        // XP solo una vez al día por código
        const today = new Date().toDateString();
        const key = `sa_maxmode_copied_${c.id}_${today}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, '1');
          addXP(5, `Max Mode copiado: ${c.name}`);
        }
        toast('Copiado ✓', 'success');
      } catch { toast('No se pudo copiar', 'error'); }
    });
  });
}

export function destroy() {}

// EOF
