// ============================================================
// SUNO ACADEMY · engines/gamification.js
// XP, niveles, tokens, combos, misiones, badges
// Ver SUNO-ACADEMY-SPEC.md §15 para fórmulas exactas
// ============================================================

import { store } from '../store.js';
import { $, toast } from '../utils/dom.js';

// ── Niveles: fallback si levels.json no cargó ───────────────
const FALLBACK_LEVELS = [
  { min: 0,     name: 'RECRUIT' },
  { min: 300,   name: 'BEATMAKER' },
  { min: 800,   name: 'PRODUCER' },
  { min: 1800,  name: 'ARCHITECT' },
  { min: 3500,  name: 'ENGINEER' },
  { min: 6000,  name: 'COMPOSER' },
  { min: 10000, name: 'DIRECTOR' },
  { min: 16000, name: 'MAESTRO' },
  { min: 25000, name: 'LEGEND' },
  { min: 40000, name: 'SONIC ARCHITECT' }
];

// ── API pública ─────────────────────────────────────────────
export function getLevels() {
  return window.SUNO?.data?.levels || FALLBACK_LEVELS;
}

export function getLevel(xp) {
  const levels = getLevels();
  let lv = levels[0], idx = 0;
  levels.forEach((l, i) => { if (xp >= l.min) { lv = l; idx = i; } });
  const next = levels[idx + 1] || null;
  const pct = next ? Math.min(100, ((xp - lv.min) / (next.min - lv.min)) * 100) : 100;
  return { lv, next, pct, index: idx };
}

export function addXP(n, source = 'unknown') {
  if (!Number.isFinite(n) || n <= 0) return;
  const stats = store.get('stats');
  const before = getLevel(stats.xp);
  stats.xp += n;
  const after = getLevel(stats.xp);
  stats.level = after.index + 1;
  store.set('stats', stats);
  updateHUD();

  if (after.index > before.index) {
    toast(`🏆 ¡Subiste a ${after.lv.name}!`, 'epic');
  } else {
    toast(`+${n} XP · ${source}`, 'success');
  }

  window.dispatchEvent(new CustomEvent('suno:xp', { detail: { xp: stats.xp, source, delta: n } }));
}

export function addTokens(n, full = false) {
  const stats = store.get('stats');
  if (full) {
    stats.tokens = stats.maxTokens;
    toast(`🔥 Refill completo! ${stats.maxTokens} tokens`, 'epic');
  } else {
    const old = stats.tokens;
    stats.tokens = Math.min(stats.maxTokens, stats.tokens + n);
    if (stats.tokens > old) toast(`⚡ +${stats.tokens - old} tokens`, 'success');
  }
  store.set('stats', stats);
  updateHUD();
}

export function spendTokens(n) {
  const stats = store.get('stats');
  stats.tokens = Math.max(0, stats.tokens - n);
  store.set('stats', stats);
  updateHUD();
  if (stats.tokens < 80) toast(`⚠ Tokens bajos: ${stats.tokens}`, 'warn');
  return stats.tokens >= 0;
}

export function processCombo(score) {
  const stats = store.get('stats');
  stats.prompts = (stats.prompts || 0) + 1;
  stats.scoreSum = (stats.scoreSum || 0) + score;

  if (score >= 70) {
    stats.combo = (stats.combo || 0) + 1;
    if (stats.combo === 2)       addTokens(50);
    else if (stats.combo === 3) { addTokens(100); addXP(10, 'combo x3'); }
    else if (stats.combo === 5) { addTokens(500, true); addXP(25, 'combo x5'); }
    else if (stats.combo > 5 && stats.combo % 5 === 0) addTokens(200);
  } else if (score < 40) {
    stats.combo = 0;
  }

  store.set('stats', stats);
  updateHUD();
}

// ── HUD (chip de créditos en topbar) ────────────────────────
export function updateHUD() {
  const chip = $('#creditValue');
  if (!chip) return;
  const stats = store.get('stats');
  chip.textContent = stats.tokens.toLocaleString();
}

// ── Badges ──────────────────────────────────────────────────
export function checkBadges(eventType, data = {}) {
  const badgesData = window.SUNO?.data?.badges || [];
  const earned = store.get('badges') || {};

  badgesData.forEach(b => {
    if (earned[b.id]) return; // ya lo tiene
    if (matchesBadgeRule(b, eventType, data)) {
      earned[b.id] = { earnedAt: new Date().toISOString() };
      toast(`🏅 Badge desbloqueado: ${b.name}`, 'epic');
      window.dispatchEvent(new CustomEvent('suno:badge', { detail: b }));
    }
  });

  store.set('badges', earned);
}

function matchesBadgeRule(badge, eventType, data) {
  // TODO (Claude Code): implementar motor de reglas completo.
  // Por ahora, match simple por evento:
  if (!badge.rule) return false;
  return badge.rule.event === eventType &&
         (!badge.rule.threshold || (data.value ?? 0) >= badge.rule.threshold);
}

// ── Init ────────────────────────────────────────────────────
export function initGamification() {
  updateHUD();
}

// EOF
