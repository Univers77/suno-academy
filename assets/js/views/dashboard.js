// ============================================================
// SUNO ACADEMY · views/dashboard.js
// Home gamificado: Level Ring + Daily Potential + Mission of Day + Skill Architecture
// Ver SUNO-ACADEMY-SPEC.md §6
// ============================================================

import { $, el, toast } from '../utils/dom.js';
import { store }         from '../store.js';
import { getLevel }      from '../engines/gamification.js';

export function render(container) {
  const stats = store.get('stats');
  const { lv, next, pct } = getLevel(stats.xp);
  const levelNum = stats.level || 1;
  const xpToNext = next ? next.min - stats.xp : 0;

  // Ring circumference con r=70
  const R = 70;
  const C = 2 * Math.PI * R;
  const offset = C - (pct / 100) * C;

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Dashboard</h1>
      <p class="section-lead">Tu estudio de aprendizaje gamificado. Completa misiones, gana XP y sube en la arquitectura de habilidades.</p>
    </div>

    <div class="grid-dashboard">

      <!-- Level Ring -->
      <div class="col-6">
        <div class="dash-level-card">
          <div class="ring-wrap">
            <svg viewBox="0 0 180 180">
              <circle class="ring-track" cx="90" cy="90" r="${R}"></circle>
              <circle class="ring-progress" cx="90" cy="90" r="${R}"
                stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}"></circle>
            </svg>
            <div class="ring-label">
              <div class="r-kicker">LVL</div>
              <div class="r-value">${levelNum}</div>
            </div>
          </div>
          <h3>${next ? 'Cerca, ' : 'Eres '}<span class="grad-text">${lv.name}</span></h3>
          <div class="dash-level-sub">${stats.xp.toLocaleString()} ${next ? `/ ${next.min.toLocaleString()} XP al nivel ${levelNum + 1}` : '· nivel máximo'}</div>
          ${next ? `<div class="dash-unlock-chip">🔒 Próximo desbloqueo: <strong>${next.name}</strong> · ${xpToNext} XP</div>` : ''}
        </div>
      </div>

      <!-- Daily Potential -->
      <div class="col-6">
        <div class="daily-pot">
          <div class="daily-pot-head">
            <div>
              <div class="daily-pot-label">Daily Potential</div>
              <div class="daily-pot-value">${stats.dailyCreditsMax.toLocaleString()}<span style="font-size:1rem;color:var(--text-3);margin-left:6px;">CR</span></div>
            </div>
            <span style="color:var(--success)">↗</span>
          </div>
          <div class="bar">
            <div class="bar-fill cool" style="width:${Math.min(100, (stats.dailyCreditsEarned / stats.dailyCreditsMax) * 100).toFixed(0)}%"></div>
          </div>
          <div class="daily-pot-foot">
            <span>Earned: ${stats.dailyCreditsEarned.toLocaleString()}</span>
            <span>Max: ${stats.dailyCreditsMax.toLocaleString()}</span>
          </div>
        </div>

        <!-- Mission of the Day -->
        <div class="mission-of-day" style="margin-top:var(--sp-4)">
          <div class="mod-eyebrow">🔥 MISSION OF THE DAY</div>
          <div class="mod-title">Crea un <span class="mk-accent">prompt estructurado</span> con score ≥ 60</div>
          <div class="mod-desc">Incluye género, BPM, emoción y al menos un instrumento específico. Gana XP y créditos.</div>
          <a href="#/studio" class="btn btn-primary">▶ Ir al Studio</a>
        </div>
      </div>

      <!-- Skill Architecture -->
      <div class="col-12">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:var(--sp-4)">
            <h2 class="card-title">Skill Architecture</h2>
            <a href="#/academy" class="btn btn-tertiary btn-sm">VER TODO →</a>
          </div>
          <div class="skill-grid">
            <div class="skill-card mastered">
              <div class="sk-icon">🎚</div>
              <div class="sk-name">Mixing Basics</div>
              <div class="sk-status">MASTERED</div>
            </div>
            <div class="skill-card mastered">
              <div class="sk-icon">◈</div>
              <div class="sk-name">Arrangement</div>
              <div class="sk-status">MASTERED</div>
            </div>
            <div class="skill-card">
              <div class="sk-icon">🎛</div>
              <div class="sk-name">Advanced EQ</div>
              <div class="bar" style="margin-top:8px"><div class="bar-fill cool" style="width:60%"></div></div>
              <div class="sk-status" style="margin-top:6px">60%</div>
            </div>
            <div class="skill-card locked">
              <div class="sk-icon">🔒</div>
              <div class="sk-name">Vocal Synthesis</div>
              <div class="sk-status">REQUIERE LVL 15</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function destroy() {}

// EOF
