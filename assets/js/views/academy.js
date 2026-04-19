// ============================================================
// SUNO ACADEMY · views/academy.js
// Videos + Lecciones + Tips con timestamps reales
// Ver SUNO-ACADEMY-SPEC.md §8
// ============================================================

import { $, $$, el, toast } from '../utils/dom.js';
import { store }            from '../store.js';
import { addXP }            from '../engines/gamification.js';

const CATS = ['todos','base','maxmode','viral','tecnica','voces','estilo','workflow','coach','letras','beats','sintesis','instrumentos','optimizacion','lab'];

let currentTab = 'videos';
let filterCat = 'todos';
let searchTerm = '';

export function render(container, query) {
  if (query?.tab && ['videos','lecciones','tips'].includes(query.tab)) currentTab = query.tab;

  container.innerHTML = `
    <div class="section-head">
      <h1 class="section-title">Academy</h1>
      <p class="section-lead">Videos con timestamps exactos, lecciones estructuradas y tips profesionales para dominar SUNO AI.</p>
    </div>

    <div class="chip-row" style="margin-bottom:var(--sp-5)">
      <button class="chip ${currentTab==='videos'?'active':''}" data-tab="videos">Videos</button>
      <button class="chip ${currentTab==='lecciones'?'active':''}" data-tab="lecciones">Lecciones</button>
      <button class="chip ${currentTab==='tips'?'active':''}" data-tab="tips">Tips</button>
    </div>

    <div id="academyBody"></div>
  `;

  $$('.chip[data-tab]', container).forEach(c => {
    c.addEventListener('click', () => {
      currentTab = c.dataset.tab;
      location.hash = `#/academy?tab=${currentTab}`;
    });
  });

  renderTab(container);
}

function renderTab(container) {
  const body = $('#academyBody', container);
  if (!body) return;
  if (currentTab === 'videos')   renderVideos(body);
  if (currentTab === 'lecciones') renderLessons(body);
  if (currentTab === 'tips')      renderTips(body);
}

function renderVideos(body) {
  const videos = window.SUNO?.data?.videos || [];
  const seen = store.get('videosSeen') || {};

  body.innerHTML = `
    <div style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-4);flex-wrap:wrap">
      <input class="input" id="vSearch" placeholder="Buscar videos..." style="flex:1;min-width:220px" />
    </div>
    <div class="chip-scroll" id="catChips" style="margin-bottom:var(--sp-4)">
      ${CATS.map(c => `<button class="chip ${filterCat===c?'active':''}" data-cat="${c}">${c}</button>`).join('')}
    </div>
    <div class="video-grid" id="vGrid"></div>
  `;

  $('#vSearch', body).value = searchTerm;
  $('#vSearch', body).addEventListener('input', e => { searchTerm = e.target.value.toLowerCase(); paintGrid(); });
  $$('.chip[data-cat]', body).forEach(c => {
    c.addEventListener('click', () => { filterCat = c.dataset.cat; paintGrid(); });
  });

  function paintGrid() {
    const grid = $('#vGrid', body);
    const filtered = videos.filter(v => {
      const matchCat = filterCat === 'todos' || (v.categories || []).includes(filterCat);
      const matchQ = !searchTerm ||
        v.title?.toLowerCase().includes(searchTerm) ||
        v.source?.toLowerCase().includes(searchTerm) ||
        (v.categories || []).some(c => c.includes(searchTerm));
      return matchCat && matchQ;
    });
    grid.innerHTML = filtered.length === 0
      ? `<div class="card"><p class="muted">No hay videos con esos filtros.</p></div>`
      : filtered.map(v => videoCard(v, seen[v.id])).join('');
    $$('.video-card', grid).forEach(card => {
      card.querySelector('[data-seen]')?.addEventListener('change', e => {
        const id = card.dataset.id;
        const now = store.get('videosSeen') || {};
        if (e.target.checked && !now[id]) {
          now[id] = { seenAt: new Date().toISOString(), completed: true };
          addXP(5, 'Video visto');
        } else if (!e.target.checked) {
          delete now[id];
        }
        store.set('videosSeen', now);
      });
    });
    $$('.ts-link', grid).forEach(a => {
      a.addEventListener('click', () => setTimeout(() => toast('Abriendo en YouTube...'), 100));
    });
    $$('[data-cat-chip]', body).forEach(c => c.classList.toggle('active', c.dataset.catChip === filterCat));
  }
  paintGrid();
}

function videoCard(v, seen) {
  const thumb = v.youtubeId ? `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg` : '';
  const ytUrl = v.youtubeId ? `https://www.youtube.com/watch?v=${v.youtubeId}` : '#';
  const ts = (v.timestamps || []).slice(0, 6).map(t =>
    `<a class="ts-link" href="${ytUrl}&t=${t.seconds}s" target="_blank" rel="noopener">${t.label} · ${fmt(t.seconds)}</a>`
  ).join('');
  return `
    <article class="video-card" data-id="${v.id}">
      <div class="video-thumb">${thumb ? `<img src="${thumb}" alt="" loading="lazy">` : ''}</div>
      <div class="video-body">
        <div class="video-meta">
          ${(v.categories||[]).map(c => `<span>#${c}</span>`).join('')}
          ${v.source ? `<span>· ${v.source}</span>` : ''}
        </div>
        <div class="video-title">${v.title}</div>
        ${ts ? `<div class="chip-row" style="gap:6px">${ts}</div>` : ''}
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;gap:var(--sp-2)">
          <a class="btn btn-secondary btn-sm" href="${ytUrl}" target="_blank" rel="noopener">Abrir en YouTube</a>
          <label style="display:flex;align-items:center;gap:6px;font-size:var(--tx-xs);color:var(--text-3);cursor:pointer">
            <input type="checkbox" data-seen ${seen ? 'checked' : ''} /> visto
          </label>
        </div>
      </div>
    </article>
  `;
}

function fmt(s) {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2,'0')}`;
}

function renderLessons(body) {
  const lessons = window.SUNO?.data?.lessons?.modules || [];
  const progress = store.get('lessons') || {};
  body.innerHTML = lessons.map(m => `
    <div class="module-card">
      <div class="module-head">
        <div>
          <div class="eyebrow">${m.tag || 'MÓDULO'}</div>
          <div class="module-title">${m.title}</div>
        </div>
      </div>
      ${(m.lessons || []).map((l, i) => `
        <div class="lesson-row ${progress[l.id]?.completed ? 'completed' : ''}" data-lesson="${l.id}">
          <div class="l-num">${i+1}</div>
          <div class="l-body">
            <div class="l-name">${l.title}</div>
            <div class="l-meta">${l.level || 'beginner'} · ${l.durationMin || 5} min · +${l.xp || 80} XP</div>
          </div>
          <button class="btn btn-tertiary btn-sm" data-complete="${l.id}">${progress[l.id]?.completed ? '✓' : 'Marcar'}</button>
        </div>
      `).join('')}
    </div>
  `).join('') || '<div class="card"><p class="muted">Cargando lecciones…</p></div>';

  $$('[data-complete]', body).forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.complete;
      const p = store.get('lessons') || {};
      if (p[id]?.completed) return;
      p[id] = { completed: true, completedAt: new Date().toISOString(), xpAwarded: 80 };
      store.set('lessons', p);
      addXP(80, 'Lección completada');
      renderTab(body.parentElement);
    });
  });
}

function renderTips(body) {
  const tips = window.SUNO?.data?.tips || [];
  body.innerHTML = `
    <div class="grid-3">
      ${tips.map(t => `
        <div class="card">
          <div class="eyebrow">${t.category || 'TIP'}</div>
          <h3 style="margin-top:8px;margin-bottom:var(--sp-2)">${t.title}</h3>
          <p class="muted" style="font-size:var(--tx-small)">${t.body}</p>
        </div>
      `).join('')}
    </div>
  `;
}

export function destroy() {}

// EOF
