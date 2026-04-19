# SUNO ACADEMY

> Academia completa para dominar Suno AI.
> Motor de prompts, videos con timestamps, coach de diagnóstico en 5 dimensiones, playbooks, Max Mode, checklist, y gamificación (XP + tokens + misiones + badges).

**Stack:** HTML + CSS + JS vanilla. Cero dependencias, cero build, cero backend. Abre con doble clic.

**URL producción:** https://univers77.github.io/suno-academy/

---

## Correr en local

```bash
# Opción 1: doble clic en index.html
# Opción 2: servidor mínimo (recomendado para que el Service Worker funcione)
python3 -m http.server 8080
# ir a http://localhost:8080
```

## Estructura

```
suno-academy/
├── index.html            # Entry único
├── assets/
│   ├── css/              # tokens · base · layout · components · sections
│   └── js/
│       ├── app.js        # Bootstrap
│       ├── router.js     # Hash routing
│       ├── store.js      # localStorage sa_v1_*
│       ├── engines/      # analyzer · builder · gamification · visualizer
│       ├── views/        # 9 vistas
│       └── utils/
├── data/                 # 12 JSON: videos, tips, playbooks, missions, etc.
├── docs/                 # Documentación interna
├── sw.js                 # Service Worker PWA
└── manifest.webmanifest
```

## Identidad visual — Kinetic Studio

- **Surfaces:** obsidiana `#0c0e12 → #23262c`
- **Acentos:** violeta `#cf96ff → #a533ff` (CTAs) · cyan `#00f4fe` (data mono) · lime `#f3ffca` (highlights)
- **Tipografía:** Space Grotesk (display) · Manrope (body) · JetBrains Mono (data)
- **Reglas:** No-Line Rule (cero `border: 1px`) · gradients obligatorios en primary · pill-shaped interactivos

Ver `SUNO-ACADEMY-SPEC.md` §3 para detalle completo.

## Motor de scoring (analyzer)

Adaptado del Mentor Profesor (Univers77/SUNO-Mentor-Profesor) con traducción a las 5 dimensiones Stitch:

```
score = round(spec*0.25 + struct*0.25 + emo*0.2 + neg*0.15 + bal*0.15)
```

Ver `assets/js/engines/analyzer.js` y `SUNO-ACADEMY-SPEC.md` §9.

## Gamificación

- **10 niveles** (RECRUIT 0 → SONIC ARCHITECT 40k XP)
- **12 badges** desbloqueables
- **6 misiones** reutilizadas del Mentor PRO
- **Combo system** con refill automático en x5
- **Tokens como moneda local** (500 default, se gastan al generar, se recargan con combos)

Ver `SUNO-ACADEMY-SPEC.md` §15.

## Despliegue a GitHub Pages

1. **Crear el repo manualmente** desde github.com (`Univers77/suno-academy`, privado primero).
2. `git init && git remote add origin git@github.com:Univers77/suno-academy.git`
3. Commit humano a paso — un commit a la vez.
4. `git push origin main`
5. Settings → Pages → Source: `main` / `/ (root)` → Save.
6. Esperar 1-2 min. Verificar en `https://univers77.github.io/suno-academy/`.

**Reglas GitHub Univers77 activas:**
- Commits humanos uno a uno, nunca en lote automatizado.
- Jamás fake git history.
- PAT solo con permisos `repo`.
- Repo privado primero, público solo cuando esté estable.

## Licencia

MIT — GGLabs, 2026.
