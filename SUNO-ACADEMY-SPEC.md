# SUNO ACADEMY — Especificación Maestra v1.0

> **Audiencia:** Claude Code ejecutando en GGLabs local → deploy en GitHub Pages.
> **Objetivo:** Construir una SPA estática (zero-build, zero-backend) que unifica el motor de generación de prompts, la academia de videos, el coach de diagnóstico, el sistema de playbooks, Max Mode, checklist y una capa de gamificación (XP + tokens + misiones + badges) sobre la identidad visual "Kinetic Studio" del sistema de diseño Stitch.
> **Regla de oro:** No se usa ningún framework, bundler, ni dependencia externa. Solo HTML + CSS + JS vanilla con datos en JSON. El proyecto debe poder abrirse con doble-clic y funcionar idéntico que en GitHub Pages.

---

## 1. Repositorio destino

- **Owner:** `Univers77`
- **Repo:** `suno-academy` (crear manualmente desde la web de GitHub antes de hacer `git push`, siguiendo la regla activa de la cuenta).
- **Visibilidad inicial:** privada. Público solo cuando el sprint 1 esté estable.
- **Rama de publicación:** `main` con GitHub Pages apuntando a `/ (root)`.
- **URL esperada:** `https://univers77.github.io/suno-academy/`

Los repos antiguos `Univers77/suno-studio-pro` y `Univers77/suno-prompt-lab` se **archivan** (no se borran) una vez que el V1 de `suno-academy` esté vivo. Se deja un `README.md` de reemplazo apuntando al nuevo repo.

---

## 2. Estructura de archivos final

```
suno-academy/
├── index.html                  # Único entry point. Navegación por secciones (no por páginas).
├── 404.html                    # Redirige a index.html para que las rutas hash funcionen.
├── README.md                   # Qué es, cómo correrlo local, cómo desplegar.
├── LICENSE                     # MIT (autor: GGLabs / Alejandro Cosulich)
├── .gitignore                  # node_modules, .DS_Store, .env*, dist/
├── .nojekyll                   # Archivo vacío. Necesario para GitHub Pages con guiones bajos.
├── CNAME                       # Opcional — solo si hay dominio propio.
│
├── assets/
│   ├── css/
│   │   ├── tokens.css          # Variables CSS: colores, tipografía, radios, blur, shadows.
│   │   ├── base.css            # Reset, tipografía, fondos, scrollbar.
│   │   ├── layout.css          # Shell: topbar, sidebar, bottom-nav, secciones.
│   │   ├── components.css      # Botones, chips, cards, badges, barras, HUD, toasts.
│   │   └── sections.css        # Estilos específicos por sección.
│   │
│   ├── js/
│   │   ├── app.js              # Bootstrap: carga datos, monta router, inicializa engines.
│   │   ├── router.js           # Nav por hash: #/dashboard, #/studio, #/academy, #/coach, #/playbooks, #/arena, #/profile.
│   │   ├── store.js            # Estado global en localStorage con versionado (sa_v1_*).
│   │   ├── engines/
│   │   │   ├── analyzer.js     # Motor de scoring: TOKEN_KEYWORDS + analyzePrompt + buildDiagnosis.
│   │   │   ├── builder.js      # Genera Style Field + Lyrics Field desde el formulario.
│   │   │   ├── gamification.js # XP, niveles, tokens, combos, misiones, badges.
│   │   │   └── visualizer.js   # Canvas: background waves + score particles.
│   │   ├── views/
│   │   │   ├── dashboard.js
│   │   │   ├── studio.js
│   │   │   ├── academy.js
│   │   │   ├── coach.js
│   │   │   ├── playbooks.js
│   │   │   ├── maxmode.js
│   │   │   ├── checklist.js
│   │   │   ├── arena.js        # MVP: vista estática con challenge semanal hardcodeado.
│   │   │   └── profile.js
│   │   └── utils/
│   │       ├── dom.js          # $, $$, on, el (helper createElement).
│   │       ├── format.js       # numberFmt, timeFmt, clamp, escapeHtml.
│   │       └── clipboard.js    # copyText con fallback execCommand.
│   │
│   ├── img/
│   │   ├── og-cover.png        # 1200x630 para Open Graph.
│   │   ├── icon-192.png        # PWA icon.
│   │   ├── icon-512.png        # PWA icon.
│   │   └── favicon.svg
│   │
│   └── fonts/                  # Opcional: auto-host de Space Grotesk + Manrope si se quiere offline.
│
├── data/
│   ├── videos.json             # 28 videos con timestamps (ver §7).
│   ├── tips.json               # 16 tips profesionales (ver §8).
│   ├── playbooks.json          # 5 presets listos para cargar al Studio (ver §9).
│   ├── checks.json             # 10 criterios del checklist (ver §10).
│   ├── injectors.json          # 6 inyectores profesionales (ver §11).
│   ├── missions.json           # 6 misiones XP (ver §12).
│   ├── badges.json             # 12 badges desbloqueables (ver §13).
│   ├── levels.json             # 10 niveles (Principiante → Sonic Architect).
│   ├── lessons.json            # 16 lecciones agrupadas en 4 módulos (ver §14).
│   ├── kb.json                 # 21 entradas de knowledge base para el Coach.
│   ├── max-mode.json           # Códigos exactos + cuándo usar / cuándo no.
│   └── challenge.json          # Challenge activo para la Arena MVP.
│
├── manifest.webmanifest        # PWA manifest (name, icons, theme, display: standalone).
├── sw.js                       # Service Worker simple — cache-first de assets y data/.
│
└── docs/
    ├── ARCHITECTURE.md         # Este documento.
    ├── CONTENT-GUIDELINES.md   # Cómo agregar un video, un tip, una lección.
    ├── GAMIFICATION.md         # Fórmulas de XP, combos, refills.
    └── CHANGELOG.md            # Versionado semántico del contenido y del código.
```

**Regla crítica:** ningún archivo JS supera las 400 líneas. Si algo crece más, se parte en submódulos. Todos los archivos terminan con `// EOF` para hacer `diff` más limpios.

---

## 3. Sistema de diseño — "Kinetic Studio"

Adoptar literal el `DESIGN.md` de Stitch. Traducir a CSS tokens.

### 3.1 Colores

```css
/* assets/css/tokens.css */
:root {
  /* Base surfaces — obsidiana */
  --bg:                    #0c0e12;
  --surface:               #0c0e12;
  --surface-low:           #111318;
  --surface-mid:           #1a1d23;
  --surface-high:          #23262c;
  --surface-bright:        #2a2d33;

  /* Acentos neón */
  --primary:               #cf96ff;  /* violeta claro */
  --primary-dim:           #a533ff;  /* violeta profundo */
  --secondary:             #00f4fe;  /* cyan eléctrico */
  --tertiary:              #f3ffca;  /* lime pastel */
  --warn:                  #f7ca65;  /* oro */
  --danger:                #ff6d83;  /* rosa-rojo */
  --success:               #3cff99;  /* verde neón */

  /* Texto */
  --text:                  #eaf2ff;
  --text-2:                #b7c2da;
  --text-3:                #6b7590;

  /* Ghost lines (solo cuando accesibilidad lo exige) */
  --outline-ghost:         rgba(70, 72, 77, 0.20);

  /* Gradients */
  --grad-primary:          linear-gradient(135deg, var(--primary) 0%, var(--primary-dim) 100%);
  --grad-cool:             linear-gradient(135deg, var(--secondary), var(--primary));
  --grad-warm:             linear-gradient(135deg, var(--tertiary), var(--warn));

  /* Ambient glows (no drop-shadows) */
  --glow-primary:          0 0 40px rgba(207, 150, 255, 0.16);
  --glow-secondary:        0 0 40px rgba(0, 244, 254, 0.12);
  --glow-tertiary:         0 0 40px rgba(243, 255, 202, 0.14);

  /* Radii */
  --r-sm:                  8px;
  --r-md:                  14px;
  --r-lg:                  20px;
  --r-xl:                  28px;
  --r-full:                999px;

  /* Spacing */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-5: 20px; --sp-6: 24px; --sp-8: 32px; --sp-10: 40px; --sp-12: 56px;

  /* Glass */
  --glass-bg:              rgba(42, 45, 51, 0.40);
  --glass-blur:            blur(20px);

  /* Z */
  --z-topbar: 50; --z-nav: 45; --z-toast: 90; --z-modal: 100;
}
```

### 3.2 Tipografía

- **Display / headlines:** Space Grotesk (500, 600, 700). `letter-spacing: -0.02em` en display.
- **Body / UI:** Manrope (400, 500, 600, 700).
- **Mono / technical data:** JetBrains Mono (BPM, scores, timestamps, códigos Max Mode).
- Servir desde `fonts.googleapis.com` con `<link rel="preconnect">`.

### 3.3 Reglas inflexibles

1. **No-Line Rule:** Ningún `border: 1px solid`. Las separaciones se hacen con tonal shifts (`surface-low` dentro de `surface` dentro de `surface-mid`) y con 12px de whitespace. Solo se permite `outline-ghost` a 20% en casos de accesibilidad.
2. **No drop-shadows standard.** Solo ambient glows (`--glow-*`).
3. **No pure black.** `#000000` está prohibido para superficies.
4. **Gradient primary→primary-dim** obligatorio en el CTA principal de cada sección.
5. **Roundedness `full`** en todos los elementos interactivos de tipo pill (chips, botones primarios, tags).
6. **Glass layer** para prompt tags, dropdowns flotantes y modales.
7. **Asimetría intencional** en el dashboard: el Level Ring puede sobresalir 20px del card padre.
8. **Datos técnicos (BPM, scores, %)** siempre en mono + color `--secondary`.

---

## 4. Navegación y routing

### 4.1 Hash routing

```
#/dashboard    → vista default al cargar
#/studio       → Prompt Studio (builder)
#/academy      → Videos + Lecciones
#/coach        → Diagnóstico de prompts
#/playbooks    → Presets
#/maxmode      → Códigos Max Mode
#/checklist    → Workflow profesional
#/arena        → Challenge semanal (MVP estático)
#/profile      → Identidad creativa + badges + historial
```

Router en `router.js`, 60 líneas máximo. `window.addEventListener('hashchange', …)` y render de la sección correspondiente. Actualiza la nav activa y el `document.title`.

### 4.2 Shell

- **Desktop (≥980px):** topbar + sidebar izquierdo persistente con las 9 rutas.
- **Mobile (<980px):** topbar + bottom-nav con 5 rutas principales (Dashboard · Studio · Academy · Coach · Profile); las otras 4 viven en un botón "Más" que abre un sheet.

Adoptar el layout de las 5 mockups Stitch:
- Topbar: avatar circular (fallback iniciales sobre gradient), marca "SUNO ACADEMY" en Space Grotesk 700 color `primary`, chip de créditos a la derecha `[icon] 1,250 CR`.
- Bottom-nav: 4 íconos SVG (Dashboard, Lab, Arena, Profile), el activo con color `secondary` y glow.

---

## 5. Estado y persistencia

### 5.1 Store en localStorage

Todas las claves llevan prefijo `sa_v1_` para permitir migraciones futuras.

```js
// assets/js/store.js
const KEYS = {
  profile:     'sa_v1_profile',    // {name, avatar, createdAt}
  stats:       'sa_v1_stats',      // {xp, level, tokens, maxTokens, combo, prompts, scoreSum}
  history:     'sa_v1_history',    // Array<Prompt> — máximo 50
  checklist:   'sa_v1_checklist',  // {[checkId]: boolean}
  missions:    'sa_v1_missions',   // {[missionId]: {done, completedAt}}
  badges:      'sa_v1_badges',     // {[badgeId]: {earnedAt}}
  videosSeen:  'sa_v1_videos',     // {[videoId]: {seenAt, completed}}
  lessons:     'sa_v1_lessons',    // {[lessonId]: {completed, completedAt, xpAwarded}}
  streak:      'sa_v1_streak',     // {current, best, lastDate}
  settings:    'sa_v1_settings',   // {language, reducedMotion, sound}
  lastRoute:   'sa_v1_route'
};
```

- Un solo `save()` / `load()` por tabla.
- Al boot se valida el schema con `DEFAULTS`; si algo falta se mergea.
- Hay un botón en `#/profile` → **"Exportar mi progreso"** (descarga `.json`) y **"Importar progreso"** (file input).
- **"Reiniciar cuenta"** pide confirmación doble.

### 5.2 Versionado de contenido

Los JSON de `/data/` llevan `{version: "1.0.0", updatedAt: "2026-04-18", …}` en el top-level. Si el app detecta versión distinta a la guardada, muestra un toast "Contenido actualizado" sin borrar el progreso del usuario.

---

## 6. Sección Dashboard (home)

Layout basado en la mockup Stitch `dashboard_mastery_home`.

Orden vertical de bloques (mobile) / grid 12-col (desktop):

1. **Level Ring** — card `surface-low` con el ring SVG de progreso (trazo `tertiary` con glow `primary`). Muestra `LVL <n>` en el centro, bajo el ring "Almost there, <nivelNombre>", barra `xp actual / xp siguiente nivel`, chip `Next Unlock: <recompensa> at Level <n+3>`.
2. **Daily Potential** — barra horizontal con créditos ganables hoy `earned: X / max: Y`. Si `earned ≥ max` → confetti sutil + toast.
3. **Mission of the Day** — toma una misión aleatoria de `missions.json` (semilla: fecha UTC). CTA `▶ Enter Studio` gradient primary. Si ya se completó hoy, queda en estado `done` con checkmark.
4. **Skill Architecture** — grid 2x2 de skill cards (ej. "Mixing Basics · MASTERED", "Arrangement · MASTERED", "Advanced EQ · 60%", "Vocal Synthesis · REQUIRES LVL 15"). Son lecciones agrupadas.
5. **Recent Prompts** — últimos 3 prompts del historial con botón "Restore to Studio".
6. **Streak Tracker** — "🔥 7 días consecutivos" si aplica.

Toda card es `surface-low` con whitespace interno de 20px, radio `--r-lg`, sin borde.

---

## 7. Sección Studio — motor de generación

### 7.1 Adaptar el layout de `prompt_lab_creative_studio`

Encabezado: "Synthesis Engine" (display-lg), subtítulo "Construct your prompts by linking musical elements. Our kinetic studio analyzes connections for optimal output.", chip `⚡ SYNERGY: <bajo|medio|alto> | ✦ Optimize`.

### 7.2 Inputs

Todos los campos del builder actual (`vision`, `genre`, `subgenre`, `bpm`, `mood`, `vocal`, `language`, `structure`, `instruments`, `theme`) + **inyectores profesionales** como 6 chips toggle (ver §11).

Géneros en chips horizontales scrollable (13 géneros: Trap, Synthwave, House, Indie Pop, Cinematic Orchestral, Dark Ambient, Drum & Bass, Lo-Fi Hip Hop, Techno, R&B Soul, Alternative Rock, Reggaeton, Folk).

BPM es un range slider con valor en mono a la derecha y un auto-suggest según el género seleccionado (trap: 140, house: 128, ballad: 72, lofi: 78, techno: 135).

### 7.3 Outputs — tres bloques mono

1. **Style Field** — lo que se pega en "Style of Music" de Suno. Concatenación: `genre, subgenre, <BPM>bpm, mood, vocal, instruments` + inyectores activos.
2. **Lyrics Field** — estructura + `Language: <X>` + `Theme: <Y>` + `Vision: <Z>`.
3. **Full Prompt** — unión con separadores `--- STYLE FIELD ---` / `--- LYRICS FIELD ---`.

Cada bloque: botón "Copiar" (con feedback ✓ Copiado por 1.2s) y botón "Analizar este prompt" que lleva al Coach con el texto pre-cargado.

### 7.4 Quality Score inline

Debajo del formulario, una barra horizontal `danger → warn → success` con % actualizado en tiempo real mientras el usuario tipea. Pesos exactos replicados del Mentor Profesor:

```
score = round(spec*0.25 + struct*0.25 + emo*0.2 + neg*0.15 + bal*0.15)
```

### 7.5 Acciones

- `▶ Initialize Track` (gradient primary) — ejecuta `generatePrompt()`, actualiza outputs, aplica combo si `score ≥ 70`.
- `💾 Save to history` — añade a `sa_v1_history`.
- `🗑 Clear` — limpia el form.
- `📋 Apply Playbook ▾` — dropdown con los 5 playbooks.

---

## 8. Sección Academy — videos + lecciones

### 8.1 Sub-tabs

`[Videos] [Lecciones] [Tips]`. La pestaña activa se refleja en el hash: `#/academy?tab=videos`.

### 8.2 Videos (28 totales)

Cada video card muestra: thumbnail (`https://img.youtube.com/vi/<ID>/mqdefault.jpg`), título, chips de categoría y fuente, duración si disponible, botón "Abrir en YouTube" y lista de timestamps clicables que abren el video en el tiempo exacto (`url?t=Xs`).

Filtros (chips horizontales): `Todos | base | maxmode | viral | tecnica | voces | estilo | workflow | coach | letras | beats | sintesis | instrumentos | optimizacion | lab`.

Buscador por título / categoría / fuente con debounce 200ms.

Al marcar "Video visto" (checkbox) se registra en `sa_v1_videos` y suma **+5 XP** la primera vez.

### 8.3 Lecciones (16 en 4 módulos)

- Módulo 1: Fundamentos (L1-L4)
- Módulo 2: Max Mode (L5-L8)
- Módulo 3: Viral Strategy (L9-L12)
- Módulo 4: Producción Avanzada (L13-L16)

Cada lección: título, nivel (beginner/intermediate/advanced), duración estimada, XP, video relacionado (YouTube ID + timestamp), concepto clave, ejercicio (opcional — lleva al Studio con un preset), checklist propio de 3-5 items. Al completar checklist → "Lección completada" + XP correspondiente.

### 8.4 Tips

Grid responsive de 16 tips categorizados (los actuales). Cada tip: chip de categoría (color `primary-dim`), título `display-sm`, cuerpo en Manrope body.

---

## 9. Sección Coach — diagnóstico

### 9.1 Layout adaptado de `ai_coach_mastery_mentor`

1. **Input area:** textarea grande con el prompt a analizar. Botones `▶ Analizar` y `Cargar ejemplo`.
2. **Current Base Score** — card con el número grande (`display-lg` mono) + barra + chip "Potential: <n>" (estimación si aplica todas las sugerencias).
3. **Analyzed Input** — eco del prompt en bloque mono con chips automáticos: `Tempo: Identified ✓` / `Genre: Clear ✓` / `Structure: Missing ⚠`.
4. **Mentor's Note** — card `surface-low` con eyebrow `🎓 COACH ANALYSIS` y un párrafo contextual extraído de `MENTOR_MSGS`.
5. **Diagnostic Dimensions** — 5 barras horizontales, cada una con:
   - Nombre (`Structural Definition`, `Atmospheric Clarity`, `Narrative Pacing`, `Sonic Specificity`, `Emotional Charge`)
   - Ícono de status (⚠ rojo si <50, 🔵 azul si 50-79, ✓ verde si ≥80)
   - % en mono
   - Sub-descripción 1 línea
   - Si <80: card embebido con "SKILL GAIN: <badge/skill> +<n>%" y botón `Apply Fix & Earn +<créditos> CR` — gradient primary. Este botón, al clic, **actualiza el texto del prompt en el input** añadiendo el fragmento faltante (ej: añadir metatags, añadir descriptor vocal) y re-evalúa.
6. **Sticky footer:** `[Dismiss]   [✨ Apply All (+X CR)]`.

### 9.2 Motor

Reutilizar literal el `analyzePrompt()` y `buildDiagnosis()` del Mentor Profesor. Traducir los ítems del diagnóstico a las 5 dimensiones de Stitch. Las reglas (`regex`) permanecen iguales.

### 9.3 KB linked

Si una dimensión está baja, ofrecer al usuario un enlace "📖 Ver lección relacionada" que lo lleva al video o lección correspondiente en Academy (mapping en `kb.json`).

---

## 10. Sección Playbooks

Grid de 5 cards (los 5 playbooks del documento adjunto). Cada card: título display-md, summary 1 línea, chips con género/BPM/mood/vocal, botón `▶ Apply to Studio` gradient primary. Al aplicar: navega a Studio, rellena todos los campos, activa inyectores, y dispara `generatePrompt()` inmediatamente.

Si el usuario aplica los 5 playbooks al menos una vez → badge "Playbook Pro".

---

## 11. Sección Max Mode

Dos columnas:

- **Biblioteca** — 3 bloques mono (`Style Max Mode`, `Vocal Max Mode`, `Duet Mode base`) con botón "Copiar".
- **Cuándo usarlo** — 4 cards: Útil (verde), Probar con cuidado (oro), No conviene (rojo), Mejor práctica (verde).

Al copiar un código → +5 XP la primera vez del día.

---

## 12. Sección Checklist

Toggle-list de 10 criterios. Barra de progreso arriba. Al completar los 10 → +25 XP + badge "Checklist Champion". El progreso persiste en `sa_v1_checklist`.

---

## 13. Sección Arena (MVP estático)

Layout idéntico al mockup `arena_live_battles`. Challenge se lee de `data/challenge.json`:

```json
{
  "id": "cyberpunk-synthwave-2026-04",
  "title": "Cyberpunk Synthwave Challenge",
  "description": "Craft the ultimate dystopian driving track. We are looking for aggressive basslines, arpeggiated synths, and a heavy, driving beat that screams 2077.",
  "endsAt": "2026-04-30T23:59:59Z",
  "prizePool": 50000,
  "rewardBadge": "Neon Driver",
  "meta": {
    "coreElements": [
      {"name": "[Neon Synth]", "weight": 85},
      {"name": "[Driving Bass]", "weight": 70}
    ],
    "topContenders": [
      {"name": "NeonPulse", "score": 9450, "track": "Night City Runner", "tags": ["AGGRESSIVE ARP", "110 BPM"]},
      {"name": "SynthWeaver", "score": 9120, "track": "Chrome Overdrive", "tags": ["DISTORTED KICK", "115 BPM"]}
    ]
  }
}
```

Countdown real calculado desde `endsAt`. Botón "Enter Arena" → Studio con preset del challenge.

V2 traerá submissions reales. Por ahora, botón "Submit entry (coming soon)" deshabilitado.

---

## 14. Sección Profile

Replica `profile_creative_identity`:

- Header: avatar grande (gradient primary de fallback si no hay imagen), tag "SOUND ARCHITECT" (se calcula por nivel), nombre + apellido editables, bio 1 línea, chips `Global Rank #42` (mock) + `Total Plays 1.2M` (suma simulada).
- **Prompt DNA** — 4 barras horizontales con colores alternos (cyan / violeta / lime / oro):
  - Melody Crafting = `avg(emoScore) * 1.05`
  - Structural Complexity = `avg(structScore)`
  - Originality Score = `(uniqueGenres + uniqueSubgenres) / 20 * 100`
  - Metatag Precision = `avg(structScore con peso doble en [Verse]/[Chorus]/[Bridge])`
- **Mastered Techniques** — chips de los badges obtenidos.
- **Next Evolution** — barra hacia el próximo nivel.
- **Hall of Fame** — lista scrollable de los 10 mejores prompts del usuario (ordenados por score). Cada item: thumbnail generado por gradient + score + género + BPM + botón "Re-use".
- **Acciones:** Exportar progreso / Importar progreso / Reiniciar cuenta.

---

## 15. Motor de Gamificación

### 15.1 XP y niveles (10)

```
1. RECRUIT          0 XP
2. BEATMAKER      300 XP
3. PRODUCER       800 XP
4. ARCHITECT    1,800 XP
5. ENGINEER     3,500 XP
6. COMPOSER     6,000 XP
7. DIRECTOR    10,000 XP
8. MAESTRO     16,000 XP
9. LEGEND      25,000 XP
10. SONIC ARCHITECT  40,000 XP
```

### 15.2 Fuentes de XP

| Acción | XP |
|---|---|
| Primer prompt del día (score ≥ 60) | +15 |
| Prompt con score ≥ 85 | +20 |
| Prompt con score = 100 | +50 |
| Completar misión nivel 1 | +15 / +20 |
| Completar misión nivel 2 | +25 / +30 |
| Completar misión nivel 3 | +40 / +50 |
| Ver video (primera vez) | +5 |
| Completar lección | +80 (ponderado por nivel) |
| Completar checklist | +25 |
| Aplicar un playbook | +5 |
| Copiar código Max Mode (1ª vez día) | +5 |
| Streak día 7 | +100 |
| Streak día 30 | +500 |

### 15.3 Tokens (moneda local)

- `maxTokens = 500` por default. `tokens` arranca en 500.
- Cada prompt generado: **-50 tokens**.
- Copy Style Field: **-20**.
- Copy Lyrics Field: **-20**.
- Copy Max Mode: **-15**.
- Usar Coach: **-10**.
- Aplicar Playbook: **-5**.
- Recargas:
  - Combo x2 → **+50**
  - Combo x3 → **+100** +10 XP
  - Combo x5 → **refill completo** +25 XP
  - Combo > 5 múltiplo de 5 → **+200**
- `score < 40` resetea el combo.

### 15.4 Misiones (6, ver `missions.json`)

Exactas a las del Mentor PRO. Template pre-cargable al Studio.

### 15.5 Badges (12)

Técnicos, progresión y creatividad. Lista cerrada, desbloqueables por eventos específicos:

```
BG-FIRST          → Primer prompt generado
BG-SCORE-100      → Lograr score 100 una vez
BG-STREAK-7       → 7 días seguidos
BG-MAX-MASTER     → Copiar los 3 códigos Max Mode
BG-ACADEMY-GRAD   → Ver los 28 videos
BG-PLAYBOOK-PRO   → Aplicar los 5 playbooks
BG-CHECKLIST-5    → Completar checklist 5 veces
BG-GENRE-EXPLORER → Usar 8 géneros distintos
BG-DNA-PERFECT    → 4 dimensiones DNA ≥90%
BG-ARENA-RUNNER   → Participar en 1 challenge
BG-MISSION-ALL    → Completar las 6 misiones
BG-LEGEND         → Alcanzar nivel LEGEND
```

### 15.6 Implementación

`gamification.js` expone: `addXP(n, source)`, `addTokens(n, full?)`, `spendTokens(n)`, `checkBadges(event, data)`, `processCombo(score)`, `getLevel(xp)`, `getStats()`. Cada evento relevante llama a `checkBadges` con el tipo correcto. Al desbloquear un badge → modal celebratorio con ambient glow primary.

---

## 16. Canvas y animaciones

### 16.1 Background waves

Igual que el Mentor PRO: 3 ondas sinusoidales con opacidades bajas (0.022, 0.03, 0.038), colores oro / teal / rose. Respeta `prefers-reduced-motion: reduce` desactivándose.

### 16.2 Score particles (Coach + Studio)

Al analizar un prompt con score ≥ 30, canvas con partículas cuya densidad, velocidad y color dependen del score:
- <30: pocas, grises, lentas, sin conexiones.
- 30-59: medias, doradas, velocidad media, conexiones tenues.
- 60-84: más, teal, rápidas, conexiones marcadas.
- 85+: muchas, mezcla teal+primary, rápidas, red densa.

Todo encapsulado en `visualizer.js`. Si `reducedMotion` → renderiza un SVG estático equivalente.

### 16.3 GSAP

No se usa. Todo es CSS transitions + keyframes + `requestAnimationFrame` puro para el canvas. Esto garantiza cero dependencias externas.

---

## 17. PWA

- `manifest.webmanifest` con `display: standalone`, theme color `#0c0e12`, icons 192 y 512.
- `sw.js` con estrategia `cache-first` para `assets/**`, `data/**` e `index.html`. Fallback network-first para nada (todo es estático).
- Bump del cache name `sa-v1-<fecha>` en cada release.
- Registro perezoso al `load`, con manejo de errores silencioso (no romper la app si SW falla en iOS).

---

## 18. Accesibilidad

- Todo elemento clickable tiene `role="button"` o es `<button>` nativo.
- Focus ring visible: `outline: 2px solid var(--secondary); outline-offset: 2px;`.
- Contraste mínimo AA en textos (text sobre surface-low = 11.8:1 ✓).
- `aria-live="polite"` en toasts, `aria-live="assertive"` en errores críticos.
- Navegación por teclado completa: `Tab` entre inputs, `Enter` en botones, `Esc` cierra modales, flechas en sliders.
- Soporte `prefers-reduced-motion` y `prefers-color-scheme` (el app es dark-first; ignora light).

---

## 19. Performance

- Lighthouse target: ≥95 en Performance, ≥100 en Best Practices, ≥100 en SEO.
- First Contentful Paint < 1.5s en 3G fast.
- Ningún asset supera 200KB. Fotos en WebP. Iconos en SVG inline.
- Lazy-load de los JSON por sección (al entrar a `#/academy` se fetchean `videos.json`, `tips.json`, `lessons.json`, no antes).
- Preload solo de `tokens.css`, `base.css`, `app.js`.

---

## 20. Roadmap de implementación para Claude Code

Trabajo dividido en **8 pasos atómicos**. Claude Code ejecuta uno por uno, hace commit con mensaje en español, y espera ok antes del siguiente. Todo commit sigue la regla humana: `feat: …`, `fix: …`, `docs: …`, `chore: …`.

1. **Scaffolding.** Crear estructura de carpetas, `README.md`, `LICENSE`, `.gitignore`, `.nojekyll`, `manifest.webmanifest`, `index.html` base (solo shell, topbar, sidebar, bottom-nav, sin secciones). Commit: `feat: scaffolding inicial + shell PWA`.

2. **Design tokens + base styles.** `tokens.css`, `base.css`, `layout.css`, `components.css`. Aplicar el shell a los estilos. Commit: `feat: sistema de diseño Kinetic Studio (tokens + base + layout + components)`.

3. **Store + Router + Utils.** `store.js`, `router.js`, `utils/*`. Navegación funcional con secciones vacías que solo muestran el título. Commit: `feat: router hash + store localStorage + utils dom`.

4. **Datos base.** Copiar todos los JSON de `/data/` con el contenido exacto de este documento. Commit: `feat: datasets iniciales (videos, tips, playbooks, missions, badges, lessons, kb, max-mode, challenge, levels, injectors, checks)`.

5. **Engines.** `analyzer.js`, `builder.js`, `gamification.js`, `visualizer.js`. Pruebas manuales desde la consola. Commit: `feat: motores analyzer + builder + gamification + visualizer`.

6. **Vistas principales.** `dashboard.js`, `studio.js`, `academy.js`, `coach.js`, `playbooks.js`, `maxmode.js`, `checklist.js`. Una por commit:
   - Commit: `feat(studio): motor de generación + 6 inyectores + outputs triples`
   - Commit: `feat(academy): 28 videos con timestamps + 16 tips + 16 lecciones`
   - Commit: `feat(coach): diagnóstico 5D + mentor notes + apply fix earn`
   - Commit: `feat(dashboard): level ring + mission of day + skill architecture`
   - Commit: `feat(playbooks+maxmode+checklist): presets + códigos + workflow`

7. **Vistas secundarias.** `arena.js`, `profile.js`. Commit: `feat(arena+profile): challenge semanal estático + DNA radar + hall of fame`.

8. **PWA + polish.** `sw.js`, favicon, og-cover, manifest final, 404.html, meta tags, schema.org. Commit: `chore: PWA + metadatos + 404`.

9. **Deploy.** `git push origin main`, activar GitHub Pages desde Settings → Pages → Branch `main` / folder `/ (root)`. Verificar que el sitio esté vivo en `https://univers77.github.io/suno-academy/`. Commit final: `docs: CHANGELOG + guía de despliegue`.

---

## 21. Reglas operativas para Claude Code

- **No instalar nada.** Ni `npm`, ni `yarn`, ni `bun`. Este proyecto es HTML+CSS+JS puro.
- **No ejecutar git sin autorización explícita.** Claude Code puede preparar los commits, pero GG confirma antes de push.
- **Un commit a la vez**, separados por pausa humana (regla GitHub Univers77 activa).
- **Jamás inventar timestamps, IDs de video o URLs.** Toda data viene de este documento o del documento adjunto del usuario.
- **Probar local antes de commit.** Cada paso debe funcionar abriendo `index.html` con doble click. Si falla → fix antes de commit.
- **En caso de duda, preguntar a GG en español**, no asumir. Este producto es para el usuario final, no un experimento.
- **Conservar compatibilidad con rutas relativas** para que GitHub Pages en subpath (`/suno-academy/`) funcione sin ajustes. Todos los `src`/`href` son relativos, jamás `/assets/...`.

---

## 22. Criterios de aceptación V1

El V1 se considera terminado cuando, abriendo `https://univers77.github.io/suno-academy/` desde un móvil recién resetado:

- ✅ El shell carga en < 2s con FCP visible.
- ✅ Las 9 secciones son accesibles desde sidebar y bottom-nav.
- ✅ El Studio genera un prompt válido con score actualizado en tiempo real.
- ✅ El Coach diagnostica un prompt real en las 5 dimensiones.
- ✅ Los 28 videos abren en el timestamp correcto.
- ✅ Al aplicar un playbook, el Studio se rellena completo y genera.
- ✅ Completar una misión otorga XP + tokens y actualiza el dashboard.
- ✅ El progreso persiste al cerrar y reabrir el navegador.
- ✅ La app es instalable como PWA en iOS y Android.
- ✅ Lighthouse ≥ 90 en las 4 dimensiones.
- ✅ Cero errores en consola.

---

## 23. Qué postergar a V2

- Arena con submissions reales y leaderboard global.
- AI Coach con llamada real a Claude Haiku (requiere backend).
- Stem splitter y export a DAW.
- Colaboración en tiempo real.
- Monetización (freemium / Pro).
- Login con Google / GitHub.
- Sync multi-dispositivo (requiere Supabase).

El V1 **no necesita ninguna de estas**. El valor está en la combinación: motor de generación + academia + coach + gamificación, todo estático, todo libre, todo en GitHub Pages.

---

## 24. Contacto y créditos

- **Proyecto:** SUNO ACADEMY
- **Autor:** Alejandro Cosulich — GGLabs
- **GitHub:** Univers77/suno-academy
- **Versión del documento:** 1.0 — 2026-04-18
- **Licencia:** MIT para el código; el contenido (videos, tips, playbooks) es curatorial y permanece bajo autoría GGLabs.

// EOF
