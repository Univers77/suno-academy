// ============================================================
// SUNO ACADEMY · views/playbooks.js
// Ver SUNO-ACADEMY-SPEC.md §10
// ============================================================

import { $, toast } from '../utils/dom.js';
import { addXP }    from '../engines/gamification.js';

export function render(container) {
  const pbs = window.SUNO?.data?.playbooks?.items || [];
  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Playbooks</h1>
      <p class="section-lead">5 presets listos. Un clic carga el Studio con el preset completo, todos los campos y generación automática.</p>
    </div>
    <div class="playbook-grid">
      ${pbs.map(pb => `
        <div class="playbook-card">
          <div>
            <div class="eyebrow gold">${pb.level || 'PRO'}</div>
            <div class="pb-title">${pb.title}</div>
          </div>
          <p class="pb-sum">${pb.summary}</p>
          <div class="pb-meta">
            ${pb.genre ? `<span class="chip data">${pb.genre}</span>` : ''}
            ${pb.bpm   ? `<span class="chip data">${pb.bpm} BPM</span>` : ''}
            ${pb.mood  ? `<span class="chip">${pb.mood}</span>` : ''}
          </div>
          <button class="btn btn-primary" data-apply="${pb.id}">▶ Aplicar al Studio</button>
        </div>
      `).join('')}
    </div>
  `;

  container.querySelectorAll('[data-apply]').forEach(b => {
    b.addEventListener('click', () => {
      const pb = pbs.find(p => p.id === b.dataset.apply);
      if (!pb) return;
      sessionStorage.setItem('sa_pending_playbook', JSON.stringify(pb));
      addXP(5, 'Playbook aplicado');
      toast(`Aplicando "${pb.title}"...`, 'success');
      setTimeout(() => { location.hash = '#/studio'; }, 200);
    });
  });
}

export function destroy() {}

// EOF
