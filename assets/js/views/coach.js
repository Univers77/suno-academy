// ============================================================
// SUNO ACADEMY · views/coach.js
// Diagnóstico 5D + Mentor Note + Apply Fix & Earn
// Ver SUNO-ACADEMY-SPEC.md §9
// ============================================================

import { $, el, toast } from '../utils/dom.js';
import { analyzePrompt, buildDimensions, buildMentorNote } from '../engines/analyzer.js';
import { addXP } from '../engines/gamification.js';

const EXAMPLE = `[Intro]
Synthwave track at 110 BPM, nostalgic and dreamy.
Ethereal female vocal, breathy, intimate.
Instruments: analog synth pads, driving bassline, clean electric guitar, soft drums.
[Verse]
Language: Spanish
Theme: nostalgia de una ciudad perdida

NO QUIERO: distorsión excesiva, voces procesadas, metal, reggaeton.`;

export function render(container) {
  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">AI <span class="grad-text">Coach</span></h1>
      <p class="section-lead">Diagnóstico profesional en 5 dimensiones. Identifica qué falta y aplica correcciones para subir tu score.</p>
    </div>

    <div class="card" style="margin-bottom:var(--sp-5)">
      <label class="field-label">Prompt a analizar</label>
      <textarea class="textarea" id="coachInput" rows="10" placeholder="Pega aquí tu prompt de SUNO..."></textarea>
      <div class="chip-row" style="margin-top:var(--sp-3)">
        <button class="btn btn-primary" id="analyzeBtn">▶ Analizar</button>
        <button class="btn btn-ghost" id="exampleBtn">Cargar ejemplo</button>
        <button class="btn btn-tertiary btn-sm" id="clearBtn">Limpiar</button>
      </div>
    </div>

    <div id="coachResults" hidden>
      <div class="grid-2" style="margin-bottom:var(--sp-4)">
        <div class="coach-score-card">
          <div class="eyebrow">CURRENT BASE SCORE</div>
          <div>
            <span class="score-big" id="scoreBig">0</span>
            <span class="score-slash">/</span>
            <span class="score-total">100</span>
          </div>
          <div class="bar"><div class="bar-fill score" id="scoreBar" style="width:0%"></div></div>
          <div class="cs-row">
            <span class="cs-label">POTENTIAL</span>
            <span class="cs-potential" id="potentialChip">↗ 100</span>
          </div>
        </div>

        <div class="mentor-note">
          <div class="eyebrow">🎓 COACH ANALYSIS</div>
          <div class="mentor-note-title" id="mentorTitle">—</div>
          <p class="muted" id="mentorBody" style="font-size:var(--tx-small);line-height:1.6">—</p>
        </div>
      </div>

      <h2 style="margin-bottom:var(--sp-4)">Diagnostic Dimensions</h2>
      <div id="dimensions" style="display:grid;gap:var(--sp-3)"></div>
    </div>
  `;

  const input = $('#coachInput', container);

  $('#exampleBtn', container).addEventListener('click', () => {
    input.value = EXAMPLE;
    analyze();
  });
  $('#clearBtn', container).addEventListener('click', () => {
    input.value = '';
    $('#coachResults', container).hidden = true;
  });
  $('#analyzeBtn', container).addEventListener('click', analyze);

  function analyze() {
    const text = input.value.trim();
    if (!text) { toast('Ingresa un prompt', 'warn'); return; }
    const res = analyzePrompt(text);
    if (!res) { toast('Prompt demasiado corto', 'warn'); return; }

    $('#coachResults', container).hidden = false;
    $('#scoreBig', container).textContent = res.score;
    $('#scoreBar', container).style.width = res.score + '%';
    $('#potentialChip', container).textContent = `↗ ${Math.min(100, res.score + 20)}`;

    const note = buildMentorNote(res, text);
    $('#mentorTitle', container).textContent = note.title;
    $('#mentorBody', container).textContent  = note.body;

    const dims = buildDimensions(res, text);
    const dimCon = $('#dimensions', container);
    dimCon.innerHTML = '';
    dims.forEach(d => {
      const statusIcon = d.status === 'success' ? '✓' : d.status === 'warn' ? '◐' : '⚠';
      const card = el('div', { class: `dim-row ${d.status}` });
      card.innerHTML = `
        <div class="dim-head">
          <div class="dim-name"><span>${statusIcon}</span> ${d.name}</div>
          <div class="dim-pct">${d.pct}%</div>
        </div>
        <div class="bar"><div class="bar-fill ${d.status === 'success' ? 'success' : 'score'}" style="width:${d.pct}%"></div></div>
        <div class="dim-sub">${d.sub}</div>
        ${d.skillGain ? `
          <div class="skill-gain">
            <div class="skill-gain-label">SKILL GAIN</div>
            <div class="skill-gain-name">${d.skillGain.name} <span style="color:var(--success)">${d.skillGain.delta}</span></div>
            <button class="btn btn-primary btn-sm" data-fix="${d.id}">✨ Aprender (+${d.skillGain.reward} CR)</button>
          </div>` : ''}
      `;
      dimCon.appendChild(card);
    });

    dimCon.querySelectorAll('[data-fix]').forEach(btn => {
      btn.addEventListener('click', () => {
        addXP(15, 'Coach fix aplicado');
        toast('Correción estudiada. Aplícala a tu prompt manualmente.', 'success');
      });
    });
  }
}

export function destroy() {}

// EOF
