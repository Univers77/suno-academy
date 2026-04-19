// ============================================================
// SUNO ACADEMY · engines/builder.js
// Genera Style Field + Lyrics Field + Full Prompt
// Ver SUNO-ACADEMY-SPEC.md §7.3
// ============================================================

/**
 * Construye los tres outputs a partir del estado del formulario.
 * @param {Object} state - { genre, subgenre, bpm, mood, vocal, language, structure, instruments, theme, vision, injectors }
 * @param {Object} injectorsMap - { [id]: texto ej 'bass depth max, sub-bass presence' }
 * @returns {{style:string, lyrics:string, full:string}}
 */
export function buildPrompt(state, injectorsMap = {}) {
  const s = state || {};
  const active = Array.isArray(s.injectors) ? s.injectors : [...(s.injectors || [])];

  // Style Field
  const styleParts = [
    s.genre,
    s.subgenre,
    s.bpm ? `${s.bpm} bpm` : null,
    s.mood,
    s.vocal && !/instrumental only/i.test(s.vocal) ? s.vocal : null,
    s.instruments
  ].filter(Boolean);

  const injectorTexts = active
    .map(id => injectorsMap[id])
    .filter(Boolean);

  const style = [styleParts.join(', '), injectorTexts.join(', ')]
    .filter(Boolean)
    .join(', ');

  // Lyrics Field
  const isInstrumental = s.language === 'Instrumental' || /instrumental only/i.test(s.vocal || '');
  const lyricsParts = [
    s.structure,
    isInstrumental ? 'Instrumental piece' : `Language: ${s.language || 'Spanish'}`,
    s.theme  ? `Theme: ${s.theme}`   : null,
    s.vision ? `Vision: ${s.vision}` : null
  ].filter(Boolean);

  const lyrics = lyricsParts.join('\n');

  // Full
  const full = `--- STYLE FIELD ---\n${style}\n\n--- LYRICS FIELD ---\n${lyrics}`;

  return { style, lyrics, full };
}

/**
 * Sugiere BPM según género (cuando el usuario selecciona un género y aún no tocó el slider).
 */
export function suggestBPM(genre = '') {
  const g = genre.toLowerCase();
  const map = {
    'trap': 140, 'dark trap': 142, 'phonk': 138, 'drill': 145,
    'house': 128, 'progressive house': 128, 'techno': 135,
    'synthwave': 110, 'darksynth': 115, 'outrun': 100,
    'indie pop': 110, 'pop': 118,
    'lo-fi hip hop': 78, 'lofi': 78,
    'drum & bass': 174, 'dnb': 174, 'dubstep': 140,
    'cinematic orchestral': 90, 'epic score': 95, 'trailer music': 90,
    'dark ambient': 70, 'ambient': 72,
    'r&b soul': 85, 'neo-soul': 90,
    'alternative rock': 120, 'rock': 120,
    'reggaeton': 95, 'latin': 100,
    'folk': 95
  };
  for (const [key, bpm] of Object.entries(map)) {
    if (g.includes(key)) return bpm;
  }
  return 120;
}

// EOF
