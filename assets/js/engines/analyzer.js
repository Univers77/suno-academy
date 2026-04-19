// ============================================================
// SUNO ACADEMY · engines/analyzer.js
// Motor de scoring de prompts de Suno — 5 dimensiones
// Adaptado del Mentor Profesor (Univers77/SUNO-Mentor-Profesor)
// Ver SUNO-ACADEMY-SPEC.md §9 y §20
// ============================================================

// ── Keyword banks ───────────────────────────────────────────
export const TOKEN_KEYWORDS = {
  style: ['indie','pop','rock','metal','jazz','blues','soul','funk','electronic','techno','house','ambient','cinematic','folk','country','reggaeton','latin','trap','hiphop','hip-hop','rnb','r&b','classical','orchestral','synthpop','darkwave','lofi','lo-fi','punk','alternative','grunge','shoegaze','dreamy','atmospheric','ethereal','industrial','drum and bass','dnb','dubstep','minimal','noir','epic','acoustic','electric','analog','vintage','modern','synthwave','phonk','drill','boom bap','neo-soul','bossa nova','flamenco','cumbia','salsa'],
  structure: ['[intro]','[verse]','[chorus]','[bridge]','[outro]','[pre-chorus]','[hook]','[build]','[drop]','[break]','[interlude]','[solo]','[climax]','[refrain]','[vamp]'],
  emotion: ['melancholic','melancólico','melancólica','sad','triste','happy','feliz','epic','épico','épica','dark','oscuro','oscura','bright','euphoric','eufórico','nostalgic','nostálgico','angry','agresivo','agresiva','tender','íntimo','íntima','powerful','poderoso','dramatic','dramático','haunting','mysterious','misterioso','bittersweet','agridulce','yearning','hopeful','urgent','calm','calmado','serene','aggressive','soulful','triumphant','contemplative'],
  negative: ['no quiero','no meter','sin ','no hay','elimina','eliminar','sin voz','no voz','no drums','no batería','no brass','instrumental only','no público','no crowd','no reverb','no quiero que','evitar','avoid',"don't",'do not'],
  technical: ['bpm','hz','khz','db','eq','compressor','reverb','delay','chorus','flanger','stereo','mono','midi','daw','stems','master','mix','frequency','velocity','dynamics','compression','saturation','tape','analog','digital','lo-fi','hi-fi','vinyl','sample','layer','pad','arpeggio','chord','key','scale','tempo','4/4','3/4','6/8','major','minor','tonalidad','clave']
};

// ── Tokenizador ─────────────────────────────────────────────
export function countTokens(text) {
  if (!text || !text.trim()) return { total: 0, style: 0, struct: 0, emo: 0, neg: 0, tech: 0 };
  const words = text.toLowerCase().split(/\s+/).filter(w => w.length > 0);
  const total = words.length;
  let style = 0, struct = 0, emo = 0, neg = 0, tech = 0;
  const lower = text.toLowerCase();
  TOKEN_KEYWORDS.style.forEach(k => { if (lower.includes(k)) style++; });
  TOKEN_KEYWORDS.structure.forEach(k => { if (lower.includes(k)) struct++; });
  TOKEN_KEYWORDS.emotion.forEach(k => { if (lower.includes(k)) emo++; });
  TOKEN_KEYWORDS.negative.forEach(k => { if (lower.includes(k)) neg++; });
  TOKEN_KEYWORDS.technical.forEach(k => { if (lower.includes(k)) tech++; });
  return { total, style, struct, emo, neg, tech };
}

// ── Analizador principal ────────────────────────────────────
export function analyzePrompt(text) {
  const tk = countTokens(text);
  if (!text || text.trim().length < 10) return null;

  const lower = text.toLowerCase();

  // Especificidad
  let spec = 0;
  TOKEN_KEYWORDS.style.forEach(k => { if (lower.includes(k)) spec += 10; });
  if (/\d+\s*(bpm|beats)/i.test(text)) spec += 15;
  if (/(major|minor|mayor|menor)/i.test(text)) spec += 10;
  if (/(guitar|piano|violin|drums|bass|synth|guitarra|batería|cuerdas|trompeta|saxo)/i.test(text)) spec += 15;
  spec = Math.min(100, spec);

  // Estructura
  let struct = 0;
  TOKEN_KEYWORDS.structure.forEach(k => { if (lower.includes(k)) struct += 15; });
  struct = Math.min(100, struct);

  // Emoción
  let emo = 0;
  TOKEN_KEYWORDS.emotion.forEach(k => { if (lower.includes(k)) emo += 14; });
  emo = Math.min(100, emo);

  // Negativos
  let neg = 0;
  TOKEN_KEYWORDS.negative.forEach(k => { if (lower.includes(k)) neg += 20; });
  neg = Math.min(100, neg);

  // Balance de longitud
  let bal = 0;
  if (tk.total >= 80 && tk.total <= 160) bal = 100;
  else if (tk.total >= 50 && tk.total < 80) bal = 70;
  else if (tk.total >= 160 && tk.total <= 220) bal = 60;
  else if (tk.total > 0) bal = 30;

  const score = Math.round(spec * 0.25 + struct * 0.25 + emo * 0.2 + neg * 0.15 + bal * 0.15);

  return { spec, struct, emo, neg, bal, score, tk };
}

// ── Construcción del diagnóstico de 5 dimensiones ───────────
// Adaptado al layout Stitch (Coach): 5 dimensiones con status + skill gain
export function buildDimensions(res, text) {
  if (!res) return [];
  const lower = (text || '').toLowerCase();

  const dims = [
    {
      id: 'structure',
      name: 'Structural Definition',
      pct: res.struct,
      status: res.struct >= 80 ? 'success' : res.struct >= 50 ? 'warn' : 'danger',
      sub: res.struct >= 80
        ? 'Metatags presentes y bien distribuidos.'
        : res.struct >= 50
          ? 'Estructura parcial. Añade [Bridge] o [Pre-Chorus] para narrativa completa.'
          : 'Sin metatags explícitos. SUNO decide aleatoriamente.',
      skillGain: res.struct < 80 ? { name: 'Metatag Mastery', delta: '+25%', reward: 400 } : null
    },
    {
      id: 'atmosphere',
      name: 'Atmospheric Clarity',
      pct: res.emo,
      status: res.emo >= 80 ? 'success' : res.emo >= 40 ? 'warn' : 'danger',
      sub: res.emo >= 80
        ? 'Adjetivos descriptivos fuertes y vividos.'
        : 'Los adjetivos emocionales activan vectores específicos en SUNO. Agrega 2-3 más.',
      skillGain: res.emo < 80 ? { name: 'Emotional Engineering', delta: '+15%', reward: 200 } : null
    },
    {
      id: 'specificity',
      name: 'Sonic Specificity',
      pct: res.spec,
      status: res.spec >= 80 ? 'success' : res.spec >= 50 ? 'warn' : 'danger',
      sub: res.spec >= 80
        ? 'BPM, género, instrumentación concretos.'
        : 'Falta precisión: agrega BPM exacto, referencia de artista o instrumento principal.',
      skillGain: res.spec < 80 ? { name: 'Sonic Precision', delta: '+20%', reward: 300 } : null
    },
    {
      id: 'negatives',
      name: 'Boundary Control',
      pct: res.neg,
      status: res.neg >= 60 ? 'success' : res.neg >= 20 ? 'warn' : 'danger',
      sub: res.neg >= 60
        ? 'Restricciones bien definidas.'
        : 'Agrega "NO QUIERO" con al menos 3 items para evitar errores frecuentes de SUNO.',
      skillGain: res.neg < 60 ? { name: 'Negative Space', delta: '+18%', reward: 250 } : null
    },
    {
      id: 'pacing',
      name: 'Narrative Pacing',
      pct: res.bal,
      status: res.bal >= 80 ? 'success' : res.bal >= 50 ? 'warn' : 'danger',
      sub: res.bal >= 80
        ? 'Longitud óptima para SUNO.'
        : res.tk.total < 50
          ? `Muy corto (${res.tk.total} palabras). Apunta a 80-160.`
          : `Muy largo (${res.tk.total} palabras). Corta a 160 máximo.`,
      skillGain: res.bal < 80 ? { name: 'Dynamic Arrangement', delta: '+10%', reward: 200 } : null
    }
  ];

  // Voz (se reporta dentro de Atmospheric si falta)
  if (!/(voz|voice|vocal|soprano|baritone|tenor|alto|contralto|mezzo|breathy|gravelly|falsetto|clean|raspy|instrumental only)/i.test(text)) {
    const atm = dims.find(d => d.id === 'atmosphere');
    atm.sub += ' · Sin descriptor vocal: SUNO elegirá al azar.';
  }

  return dims;
}

// Mentor note contextual
export function buildMentorNote(res, text) {
  if (!res) return {
    title: 'Esperando tu prompt',
    body: 'Pega tu prompt en el taller y analizaré cada elemento en tiempo real.'
  };
  if (res.score >= 85) return {
    title: 'Prompt sobresaliente',
    body: 'Tu prompt tiene todos los elementos clave. Listo para generar con consistencia profesional en SUNO.'
  };
  if (res.score >= 65) return {
    title: 'Camino correcto',
    body: 'Las bases están bien. Tus descripciones atmosféricas son sólidas. Refina estructura y negativos para llegar al nivel profesional.'
  };
  if (res.score >= 40) return {
    title: 'Necesita trabajo',
    body: 'El prompt tiene potencial pero le faltan elementos críticos. Revisa las dimensiones marcadas en rojo y aplica las correcciones sugeridas.'
  };
  return {
    title: 'Demasiado genérico',
    body: 'El prompt es insuficiente para SUNO. Agrega: género específico, BPM, descriptor vocal, al menos una emoción concreta y metatags de estructura.'
  };
}

// EOF
