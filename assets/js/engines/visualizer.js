// ============================================================
// SUNO ACADEMY · engines/visualizer.js
// Canvas: background waves + score particles
// ============================================================

let waveRAF = null;

export function initBackgroundWaves(canvas) {
  if (!canvas) return;

  // Respetar reduced-motion
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.style.display = 'none';
    return;
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  let W = window.innerWidth;
  let H = window.innerHeight;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();

  const waves = [
    { a: 55, f: 0.0022, p: 0,    sp: 0.006, c: 'rgba(207,150,255,0.035)' },
    { a: 80, f: 0.0018, p: 2.1,  sp: 0.009, c: 'rgba(0,244,254,0.028)' },
    { a: 40, f: 0.0028, p: 4.2,  sp: 0.012, c: 'rgba(243,255,202,0.022)' }
  ];

  function loop() {
    ctx.clearRect(0, 0, W, H);
    waves.forEach(w => {
      w.p += w.sp;
      ctx.beginPath();
      ctx.moveTo(0, H * 0.5);
      for (let x = 0; x <= W; x += 6) {
        ctx.lineTo(x, H * 0.5 + Math.sin(x * w.f + w.p) * w.a);
      }
      ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
      ctx.fillStyle = w.c;
      ctx.fill();
    });
    waveRAF = requestAnimationFrame(loop);
  }
  loop();

  window.addEventListener('resize', resize);
}

export function stopBackgroundWaves() {
  if (waveRAF) cancelAnimationFrame(waveRAF);
  waveRAF = null;
}

/**
 * TODO (Claude Code): implementar `renderScoreParticles(canvas, score)`.
 * Basado en Mentor Profesor `buildParticles(score)`:
 * - <30: pocas, grises, lentas, sin conexiones.
 * - 30-59: medias, doradas, velocidad media, conexiones tenues.
 * - 60-84: más, teal, rápidas, conexiones marcadas.
 * - 85+: muchas, mezcla teal+primary, rápidas, red densa.
 */
export function renderScoreParticles(/* canvas, score */) {
  // Pendiente de implementación — ver SUNO-ACADEMY-SPEC.md §16.2
}

// EOF
