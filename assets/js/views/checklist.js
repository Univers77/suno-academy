// ============================================================
// SUNO ACADEMY · views/checklist.js
// Ver SUNO-ACADEMY-SPEC.md §12
// ============================================================

import { $, toast } from '../utils/dom.js';
import { addXP }    from '../engines/gamification.js';
import { store }    from '../store.js';

export function render(container) {
  const checks = window.SUNO?.data?.checks?.items || [];
  const state = store.get('checklist') || {};

  const completed = () => checks.filter(c => state[c.id]).length;
  const total = () => checks.length;

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Professional Checklist</h1>
      <p class="section-lead">10 criterios para validar cualquier prompt antes de generar en SUNO.</p>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-2)">
        <span class="muted">Progreso</span>
        <span class="mono" id="clProgress">0/${total()}</span>
      </div>
      <div class="bar"><div class="bar-fill cool" id="clBar" style="width:0%"></div></div>
    </div>

    <div class="card">
      ${checks.map(c => `
        <label class="lesson-row" style="cursor:pointer">
          <input type="checkbox" data-check="${c.id}" ${state[c.id]?'checked':''} style="width:20px;height:20px;accent-color:var(--primary)"/>
          <div class="l-body">
            <div class="l-name">${c.title}</div>
            <div class="l-meta">${c.sub || ''}</div>
          </div>
        </label>
      `).join('')}
    </div>
  `;

  const refresh = () => {
    const done = completed();
    $('#clProgress', container).textContent = `${done}/${total()}`;
    $('#clBar', container).style.width = (done/total()*100) + '%';
    if (done === total()) {
      toast('✦ Checklist completado', 'epic');
      addXP(25, 'Checklist completado');
    }
  };

  container.querySelectorAll('[data-check]').forEach(ck => {
    ck.addEventListener('change', e => {
      const id = ck.dataset.check;
      const curr = store.get('checklist') || {};
      curr[id] = e.target.checked;
      store.set('checklist', curr);
      refresh();
    });
  });

  refresh();
}

export function destroy() {}

// EOF
