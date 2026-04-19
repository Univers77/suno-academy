// ============================================================
// SUNO ACADEMY · views/studio.js
// Synthesis Engine — builder de prompts con 5D scoring en vivo
// Ver SUNO-ACADEMY-SPEC.md §7
// ============================================================

import { $, el, toast }        from '../utils/dom.js';
import { analyzePrompt }       from '../engines/analyzer.js';
import { buildPrompt, suggestBPM } from '../engines/builder.js';
import { addXP, spendTokens, processCombo } from '../engines/gamification.js';
import { store }               from '../store.js';

const GENRES = ['Trap','Synthwave','House','Indie Pop','Cinematic Orchestral','Dark Ambient','Drum & Bass','Lo-Fi Hip Hop','Techno','R&B Soul','Alternative Rock','Reggaeton','Folk'];
const MOODS  = ['gritty','ethereal','aggressive','melancholic','euphoric','nostalgic','dark','dreamy','intimate','triumphant'];
const VOCALS = [
  'ethereal female, breathy, intimate',
  'intimate male, raw, emotional',
  'powerful female, belting, soulful',
  'deep male, gravelly, authoritative',
  'processed neural, vocoder, robotic',
  'duet, male and female, harmonized',
  'instrumental only, no vocals'
];
const STRUCTURES = [
  '[Intro][Verse][Chorus][Verse][Bridge][Chorus][Outro]',
  '[Hook][Verse][Hook][Verse][Hook]',
  '[Intro][Build][Drop][Break][Build][Drop][Outro]',
  '[Verse][Pre-Chorus][Chorus][Verse][Bridge][Chorus]'
];

let state = {
  genre: 'Synthwave', subgenre: '', bpm: 110,
  mood: 'gritty', vocal: VOCALS[0], language: 'Spanish',
  structure: STRUCTURES[0], instruments: '', theme: '', vision: '',
  injectors: new Set()
};

export function render(container) {
  const injectorsMap = (window.SUNO?.data?.injectors || []).reduce((acc, i) => {
    acc[i.id] = i.text; return acc;
  }, {});
  const injectorsList = window.SUNO?.data?.injectors || [];

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Synthesis <span class="grad-text">Engine</span></h1>
      <p class="section-lead">Construye tus prompts enlazando elementos musicales. Nuestro studio cinético analiza las conexiones en tiempo real.</p>
    </div>

    <div class="synergy-chip">
      <span>⚡ SYNERGY: <span id="synergyVal">HIGH</span></span>
      <span class="divider"></span>
      <span>✦ Score: <span id="scoreVal" class="mono">0</span>%</span>
    </div>

    <div class="studio-grid">
      <!-- Columna 1: form -->
      <div>
        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">GENRE</div></div>
          <div class="chip-scroll" id="genreChips"></div>
          <div style="margin-top:var(--sp-3)">
            <label class="field-label">Subgenre / textura</label>
            <input class="input" type="text" id="subgenre" placeholder="ej: darksynth, phonk, cinematic score" />
          </div>
        </div>

        <div class="field-group mood">
          <div class="field-group-head"><div class="field-group-name">MOOD</div></div>
          <div class="chip-scroll" id="moodChips"></div>
        </div>

        <div class="field-group">
          <div class="field-group-head">
            <div class="field-group-name">BPM</div>
            <span class="bpm-display" id="bpmVal">110</span>
          </div>
          <input type="range" id="bpm" min="60" max="180" value="110" />
        </div>

        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">VOCAL</div></div>
          <select class="select" id="vocal">
            ${VOCALS.map(v => `<option>${v}</option>`).join('')}
          </select>
          <div style="margin-top:var(--sp-3)">
            <label class="field-label">Idioma</label>
            <select class="select" id="language">
              <option>Spanish</option><option>English</option><option>Spanglish</option><option>Portuguese</option><option>Instrumental</option>
            </select>
          </div>
        </div>

        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">STRUCTURE</div></div>
          <select class="select" id="structure">
            ${STRUCTURES.map(s => `<option>${s}</option>`).join('')}
          </select>
        </div>

        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">INSTRUMENTS</div></div>
          <input class="input" type="text" id="instruments" placeholder="ej: analog bass, 808 drums, airy arpeggios" />
        </div>

        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">THEME & VISION</div></div>
          <textarea class="textarea" id="vision" placeholder="Una canción synthwave para conducir solo por una ciudad futurista de noche."></textarea>
          <div style="margin-top:var(--sp-3)">
            <input class="input" type="text" id="theme" placeholder="Tema: nostalgia, noche, viaje en el tiempo" />
          </div>
        </div>

        <div class="field-group">
          <div class="field-group-head"><div class="field-group-name">PROFESSIONAL INJECTORS</div></div>
          <div class="chip-row" id="injectorChips"></div>
        </div>

        <div class="chip-row" style="margin-top:var(--sp-5)">
          <button class="btn btn-primary btn-lg" id="generateBtn">▶ INITIALIZE TRACK</button>
          <button class="btn btn-ghost" id="saveBtn">💾 Guardar</button>
          <button class="btn btn-danger btn-sm" id="clearBtn">Limpiar</button>
        </div>
      </div>

      <!-- Columna 2: outputs -->
      <div>
        <div class="card" style="margin-bottom:var(--sp-4)">
          <div class="card-title">Quality Score</div>
          <div class="bar"><div class="bar-fill score" id="scoreBar" style="width:0%"></div></div>
          <div style="display:flex;justify-content:space-between;margin-top:var(--sp-2);font-family:var(--font-mono);font-size:var(--tx-small)">
            <span class="muted" id="scoreCaption">Comienza a construir tu prompt</span>
            <span id="scoreNum" class="mono" style="color:var(--secondary)">0%</span>
          </div>
        </div>

        <div class="card">
          <div class="output-block">
            <div class="output-head">
              <span class="output-name">Style Field</span>
              <button class="btn btn-secondary btn-sm" data-copy="style">Copiar</button>
            </div>
            <div class="mono-block" id="outStyle">Inicia tu build para ver el output</div>
          </div>

          <div class="output-block">
            <div class="output-head">
              <span class="output-name">Lyrics Field</span>
              <button class="btn btn-secondary btn-sm" data-copy="lyrics">Copiar</button>
            </div>
            <div class="mono-block" id="outLyrics">—</div>
          </div>

          <div class="output-block">
            <div class="output-head">
              <span class="output-name">Full Prompt</span>
              <button class="btn btn-secondary btn-sm" data-copy="full">Copiar</button>
            </div>
            <div class="mono-block" id="outFull">—</div>
          </div>

          <a href="#/coach" class="btn btn-tertiary btn-sm" style="margin-top:var(--sp-3)">Enviar al Coach →</a>
        </div>
      </div>
    </div>
  `;

  // Renderizar chips
  const gCon = $('#genreChips', container);
  GENRES.forEach(g => {
    const c = el('div', { class: 'chip' + (g === state.genre ? ' active' : ''), dataset: { val: g } }, g);
    c.addEventListener('click', () => {
      state.genre = g;
      $('#bpm', container).value = suggestBPM(g);
      state.bpm = parseInt($('#bpm', container).value);
      $('#bpmVal', container).textContent = state.bpm;
      renderChips();
      updateScore();
    });
    gCon.appendChild(c);
  });

  const mCon = $('#moodChips', container);
  MOODS.forEach(m => {
    const c = el('div', { class: 'chip' + (m === state.mood ? ' active' : ''), dataset: { val: m } }, m);
    c.addEventListener('click', () => {
      state.mood = m;
      renderChips();
      updateScore();
    });
    mCon.appendChild(c);
  });

  const iCon = $('#injectorChips', container);
  injectorsList.forEach(inj => {
    const c = el('div', { class: 'chip', dataset: { id: inj.id } }, inj.label || inj.id);
    c.addEventListener('click', () => {
      if (state.injectors.has(inj.id)) state.injectors.delete(inj.id);
      else state.injectors.add(inj.id);
      c.classList.toggle('active');
      updateScore();
    });
    iCon.appendChild(c);
  });

  function renderChips() {
    container.querySelectorAll('#genreChips .chip').forEach(c => c.classList.toggle('active', c.dataset.val === state.genre));
    container.querySelectorAll('#moodChips .chip').forEach(c => c.classList.toggle('active', c.dataset.val === state.mood));
  }

  // Inputs simples
  const bindInput = (id) => {
    $('#' + id, container)?.addEventListener('input', (e) => {
      state[id] = e.target.value;
      if (id === 'bpm') $('#bpmVal', container).textContent = e.target.value;
      updateScore();
    });
  };
  ['subgenre', 'bpm', 'vocal', 'language', 'structure', 'instruments', 'theme', 'vision'].forEach(bindInput);

  // Generar
  $('#generateBtn', container).addEventListener('click', () => {
    if (!spendTokens(50)) {
      toast('No tienes tokens suficientes', 'warn');
      return;
    }
    const out = buildPrompt(state, injectorsMap);
    $('#outStyle', container).textContent  = out.style  || '—';
    $('#outLyrics', container).textContent = out.lyrics || '—';
    $('#outFull', container).textContent   = out.full   || '—';
    const res = analyzePrompt(out.full);
    if (res) {
      processCombo(res.score);
      if (res.score >= 85) addXP(20, 'Prompt excelente');
      else if (res.score >= 60) addXP(15, 'Prompt sólido');
    }
    toast('Track inicializado', 'success');
  });

  $('#saveBtn', container).addEventListener('click', () => {
    const out = buildPrompt(state, injectorsMap);
    if (!out.full || out.full.length < 20) {
      toast('Genera primero tu prompt', 'warn');
      return;
    }
    store.pushHistory({
      ...out,
      genre: state.genre, bpm: state.bpm, mood: state.mood
    });
    toast('Guardado en el historial', 'success');
  });

  $('#clearBtn', container).addEventListener('click', () => {
    state = {
      genre: 'Synthwave', subgenre: '', bpm: 110,
      mood: 'gritty', vocal: VOCALS[0], language: 'Spanish',
      structure: STRUCTURES[0], instruments: '', theme: '', vision: '',
      injectors: new Set()
    };
    render(container);
  });

  // Copy
  container.querySelectorAll('[data-copy]').forEach(b => {
    b.addEventListener('click', async () => {
      const which = b.dataset.copy;
      const idMap = { style: 'outStyle', lyrics: 'outLyrics', full: 'outFull' };
      const text = $('#' + idMap[which], container).textContent;
      try {
        await navigator.clipboard.writeText(text);
        toast('Copiado ✓', 'success');
      } catch { toast('No se pudo copiar', 'error'); }
    });
  });

  function updateScore() {
    const out = buildPrompt(state, injectorsMap);
    const res = analyzePrompt(out.full);
    const score = res ? res.score : 0;
    $('#scoreBar', container).style.width = score + '%';
    $('#scoreNum', container).textContent = score + '%';
    $('#scoreVal', container).textContent = score;
    $('#synergyVal', container).textContent = score >= 75 ? 'HIGH' : score >= 45 ? 'MEDIUM' : 'LOW';
    const caption = score >= 85 ? '🏆 Excelente' : score >= 60 ? '⭐ Buen prompt' : score >= 30 ? '📊 Refinando' : 'Comienza a construir';
    $('#scoreCaption', container).textContent = caption;
  }
  updateScore();
}

export function destroy() {}

// EOF
