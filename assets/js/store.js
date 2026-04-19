// ============================================================
// SUNO ACADEMY · store.js
// Persistencia local versionada con prefijo sa_v1_*
// ============================================================

const PREFIX = 'sa_v1_';

const DEFAULTS = {
  profile: {
    name: 'Sound Architect',
    avatar: null,
    createdAt: null,
    bio: 'Explorando los límites del audio generativo.'
  },
  stats: {
    xp: 0,
    level: 1,
    tokens: 500,
    maxTokens: 500,
    combo: 0,
    prompts: 0,
    scoreSum: 0,
    dailyCreditsEarned: 0,
    dailyCreditsMax: 5500,
    lastDaily: null
  },
  history:    [],              // Array<Prompt>
  checklist:  {},              // {checkId: boolean}
  missions:   {},              // {missionId: {done, completedAt}}
  badges:     {},              // {badgeId: {earnedAt}}
  videosSeen: {},              // {videoId: {seenAt, completed}}
  lessons:    {},              // {lessonId: {completed, xpAwarded}}
  streak:     { current: 0, best: 0, lastDate: null },
  settings:   { language: 'es', reducedMotion: false, sound: true },
  lastRoute:  null
};

const MAX_HISTORY = 50;

// ── IO ──────────────────────────────────────────────────────
function read(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[store] read error ${key}:`, e);
    return null;
  }
}

function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.warn(`[store] write error ${key}:`, e);
    return false;
  }
}

// ── API pública ─────────────────────────────────────────────
export const store = {
  get(key) {
    const val = read(key);
    if (val === null) return structuredClone(DEFAULTS[key] ?? null);
    return val;
  },

  set(key, value) {
    return write(key, value);
  },

  merge(key, patch) {
    const current = store.get(key) || {};
    const merged = { ...current, ...patch };
    return write(key, merged);
  },

  pushHistory(prompt) {
    const hist = store.get('history') || [];
    hist.unshift({ ...prompt, id: Date.now().toString(36), createdAt: new Date().toISOString() });
    if (hist.length > MAX_HISTORY) hist.length = MAX_HISTORY;
    return write('history', hist);
  },

  clearAll() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  export() {
    const dump = {};
    Object.keys(DEFAULTS).forEach(k => { dump[k] = store.get(k); });
    return dump;
  },

  import(data) {
    if (!data || typeof data !== 'object') return false;
    Object.entries(data).forEach(([k, v]) => {
      if (k in DEFAULTS) write(k, v);
    });
    return true;
  }
};

// ── Asegurar schema al boot ─────────────────────────────────
export function ensureSchema() {
  Object.entries(DEFAULTS).forEach(([key, def]) => {
    const current = read(key);
    if (current === null) {
      // Primera vez: set default (clonado)
      if (key === 'profile' && def.createdAt === null) {
        def.createdAt = new Date().toISOString();
      }
      write(key, structuredClone(def));
    } else if (typeof def === 'object' && !Array.isArray(def) && def !== null) {
      // Merge superficial para rellenar claves nuevas sin borrar
      const merged = { ...def, ...current };
      write(key, merged);
    }
  });
}

// EOF
