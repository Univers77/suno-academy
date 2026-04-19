// ============================================================
// SUNO ACADEMY · views/arena.js
// Ver SUNO-ACADEMY-SPEC.md §13
// ============================================================

import { $ } from '../utils/dom.js';

let tickInterval = null;

export function render(container) {
  const ch = window.SUNO?.data?.challenge || {};
  const meta = ch.meta || {};

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Arena</h1>
      <p class="section-lead">Challenges semanales. Compite, escucha, aprende.</p>
    </div>

    <div class="arena-countdown">
      <div class="cd-cell"><div class="cd-num" id="cdDays">--</div><div class="cd-label">días</div></div>
      <div class="cd-cell"><div class="cd-num" id="cdHours">--</div><div class="cd-label">horas</div></div>
      <div class="cd-cell"><div class="cd-num" id="cdMins">--</div><div class="cd-label">min</div></div>
      <div class="cd-cell"><div class="cd-num" id="cdSecs">--</div><div class="cd-label">seg</div></div>
    </div>

    <div class="challenge-card">
      <div class="eyebrow gold">🏆 CHALLENGE SEMANAL</div>
      <h2 style="margin-top:var(--sp-2);font-size:1.8rem">${ch.title || 'Cargando...'}</h2>
      <p class="muted" style="margin-top:var(--sp-3);max-width:60ch">${ch.description || ''}</p>
      <div class="challenge-prize">
        <div class="challenge-prize-label">Prize Pool</div>
        <div class="challenge-prize-value">${(ch.prizePool || 0).toLocaleString()} CR</div>
      </div>
      <div class="chip-row" style="margin-top:var(--sp-4)">
        ${(meta.coreElements || []).map(e => `
          <span class="chip data">${e.name} · ${e.weight}%</span>
        `).join('')}
      </div>
      <div class="chip-row" style="margin-top:var(--sp-4)">
        <a href="#/studio" class="btn btn-primary">▶ Entrar al Arena</a>
        <button class="btn btn-ghost" disabled>Submit entry (coming soon)</button>
      </div>
    </div>

    <h2>Top Contenders</h2>
    ${(meta.topContenders || []).map((c, i) => `
      <div class="top-contender">
        <div class="tc-rank">#${i+1}</div>
        <div class="tc-avatar"></div>
        <div class="tc-body">
          <div class="tc-name">${c.name} · <span style="color:var(--secondary)">${c.score.toLocaleString()}</span></div>
          <div class="tc-track">${c.track}</div>
          <div class="chip-row" style="margin-top:6px">
            ${(c.tags || []).map(t => `<span class="chip data" style="font-size:10px">${t}</span>`).join('')}
          </div>
        </div>
      </div>
    `).join('') || '<p class="muted">Sin contendientes aún.</p>'}
  `;

  if (ch.endsAt) startCountdown(ch.endsAt, container);
}

function startCountdown(endsAt, container) {
  const end = new Date(endsAt).getTime();
  const tick = () => {
    const diff = Math.max(0, end - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    $('#cdDays',  container) && ($('#cdDays',  container).textContent = d);
    $('#cdHours', container) && ($('#cdHours', container).textContent = String(h).padStart(2,'0'));
    $('#cdMins',  container) && ($('#cdMins',  container).textContent = String(m).padStart(2,'0'));
    $('#cdSecs',  container) && ($('#cdSecs',  container).textContent = String(s).padStart(2,'0'));
  };
  tick();
  tickInterval = setInterval(tick, 1000);
}

export function destroy() {
  if (tickInterval) clearInterval(tickInterval);
  tickInterval = null;
}

// EOF
