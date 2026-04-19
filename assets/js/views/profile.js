// ============================================================
// SUNO ACADEMY · views/profile.js
// Ver SUNO-ACADEMY-SPEC.md §14
// ============================================================

import { $, toast } from '../utils/dom.js';
import { store }    from '../store.js';
import { getLevel } from '../engines/gamification.js';

export function render(container) {
  const profile = store.get('profile');
  const stats   = store.get('stats');
  const badges  = store.get('badges') || {};
  const history = store.get('history') || [];
  const badgesData = window.SUNO?.data?.badges || [];
  const { lv, next, pct } = getLevel(stats.xp);

  const avg = stats.prompts > 0 ? stats.scoreSum / stats.prompts : 0;
  const dna = {
    melody:       Math.min(100, Math.round(avg * 1.05)),
    structure:    Math.min(100, Math.round(avg)),
    originality:  Math.min(100, Math.round((new Set(history.map(h => h.genre)).size) * 15)),
    precision:    Math.min(100, Math.round(avg * 0.95))
  };

  const topHits = [...history].sort((a,b) => (b.score||0)-(a.score||0)).slice(0, 10);

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Profile</h1>
    </div>

    <div class="profile-head">
      <div class="profile-avatar">${(profile.name||'A').charAt(0)}</div>
      <div class="eyebrow profile-tag">${lv.name}</div>
      <div class="profile-name">${profile.name}</div>
      <p class="profile-bio">${profile.bio}</p>
      <div class="chip-row" style="justify-content:center;margin-top:var(--sp-3)">
        <span class="chip data">Nivel ${stats.level}</span>
        <span class="chip data">${stats.xp.toLocaleString()} XP</span>
        <span class="chip data">${stats.prompts} prompts</span>
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <h2 class="card-title">Prompt DNA</h2>
      <div class="dna-row"><span class="dna-name">Melody Crafting</span><div class="dna-bar bar"><div class="bar-fill cool" style="width:${dna.melody}%"></div></div><span class="dna-pct">${dna.melody}</span></div>
      <div class="dna-row"><span class="dna-name">Structural Complexity</span><div class="dna-bar bar"><div class="bar-fill" style="width:${dna.structure}%"></div></div><span class="dna-pct">${dna.structure}</span></div>
      <div class="dna-row"><span class="dna-name">Originality Score</span><div class="dna-bar bar"><div class="bar-fill warm" style="width:${dna.originality}%"></div></div><span class="dna-pct">${dna.originality}</span></div>
      <div class="dna-row"><span class="dna-name">Metatag Precision</span><div class="dna-bar bar"><div class="bar-fill cool" style="width:${dna.precision}%"></div></div><span class="dna-pct">${dna.precision}</span></div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <h2 class="card-title">Next Evolution</h2>
      ${next ? `
        <p class="muted">${lv.name} → <strong>${next.name}</strong></p>
        <div class="bar"><div class="bar-fill" style="width:${pct.toFixed(0)}%"></div></div>
        <p class="muted" style="font-size:var(--tx-small);margin-top:var(--sp-2)">${(next.min - stats.xp).toLocaleString()} XP restantes</p>
      ` : `<p class="muted">🏆 Nivel máximo alcanzado — ${lv.name}</p>`}
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <h2 class="card-title">Mastered Techniques</h2>
      <div class="chip-row">
        ${badgesData.map(b => `
          <span class="badge-chip ${badges[b.id] ? 'earned' : ''}">${badges[b.id] ? '🏅' : '🔒'} ${b.name}</span>
        `).join('') || '<p class="muted">Sin badges aún.</p>'}
      </div>
    </div>

    <div class="card" style="margin-bottom:var(--sp-4)">
      <h2 class="card-title">Hall of Fame</h2>
      ${topHits.length === 0 ? '<p class="muted">Tu mejor prompt aparecerá aquí.</p>' :
        topHits.map((h, i) => `
          <div class="top-contender">
            <div class="tc-rank">#${i+1}</div>
            <div class="tc-avatar"></div>
            <div class="tc-body">
              <div class="tc-name">${h.genre || '—'} · <span style="color:var(--secondary)">${h.score || 0}</span></div>
              <div class="tc-track">${(h.full || '').substring(0, 80)}...</div>
            </div>
          </div>
        `).join('')}
    </div>

    <div class="card">
      <h2 class="card-title">Datos y cuenta</h2>
      <div class="chip-row">
        <button class="btn btn-ghost" id="exportBtn">💾 Exportar progreso</button>
        <label class="btn btn-ghost" style="cursor:pointer">
          📂 Importar <input type="file" accept="application/json" id="importInput" hidden/>
        </label>
        <button class="btn btn-danger" id="resetBtn">🔥 Reiniciar cuenta</button>
      </div>
    </div>
  `;

  $('#exportBtn', container).addEventListener('click', () => {
    const data = store.export();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `suno-academy-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    toast('Progreso exportado', 'success');
  });

  $('#importInput', container).addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (store.import(data)) {
        toast('Progreso importado. Recargando...', 'success');
        setTimeout(() => location.reload(), 800);
      }
    } catch { toast('Archivo inválido', 'error'); }
  });

  $('#resetBtn', container).addEventListener('click', () => {
    if (!confirm('¿Reiniciar cuenta? Se perderán XP, prompts, misiones y badges.')) return;
    if (!confirm('Esta acción es irreversible. ¿Confirmas?')) return;
    store.clearAll();
    location.reload();
  });
}

export function destroy() {}

// EOF
