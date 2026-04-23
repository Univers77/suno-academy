// ============================================================
// SUNO ACADEMY · effects.js
// Visual effects: star field generation, 3D card tilt
// ============================================================

// ── Star field ───────────────────────────────────────────────
export function initStars(count = 55) {
  const container = document.getElementById('stars');
  if (!container) return;

  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';

    // Random position
    const x = Math.random() * 100;
    const y = Math.random() * 100;

    // Size: mostly 1–2px, occasional 3px for variety
    const rand = Math.random();
    const size = rand < 0.7 ? 1.5 : rand < 0.9 ? 2 : 3;

    // Randomize animation timing
    const dur  = (2 + Math.random() * 4).toFixed(2) + 's';
    const delay = (Math.random() * 6).toFixed(2) + 's';

    star.style.cssText = `
      left: ${x}%;
      top: ${y}%;
      width: ${size}px;
      height: ${size}px;
      --tw-dur: ${dur};
      --tw-delay: ${delay};
    `;

    fragment.appendChild(star);
  }

  container.appendChild(fragment);
}

// ── 3D card tilt ─────────────────────────────────────────────
export function initTilt(selector = '.t3d') {
  // Respect reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  cards.forEach(el => {
    let target = { x: 0, y: 0 };
    let current = { x: 0, y: 0 };
    let animFrame = null;
    let isHovered = false;

    function lerp(a, b, t) { return a + (b - a) * t; }

    function update() {
      current.x = lerp(current.x, target.x, 0.12);
      current.y = lerp(current.y, target.y, 0.12);

      const diffX = Math.abs(current.x - target.x);
      const diffY = Math.abs(current.y - target.y);

      el.style.transform = `perspective(600px) rotateX(${current.y}deg) rotateY(${current.x}deg)`;

      if (isHovered || diffX > 0.01 || diffY > 0.01) {
        animFrame = requestAnimationFrame(update);
      } else {
        el.style.transform = '';
        animFrame = null;
      }
    }

    el.addEventListener('mouseenter', () => {
      isHovered = true;
      el.style.transition = 'none';
      if (!animFrame) animFrame = requestAnimationFrame(update);
    });

    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      target.x =  dx * 8;
      target.y = -dy * 8;
    });

    el.addEventListener('mouseleave', () => {
      isHovered = false;
      el.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.7, 0.2, 1)';
      target.x = 0;
      target.y = 0;
      if (!animFrame) animFrame = requestAnimationFrame(update);
    });
  });
}

// ── Glow follow cursor on .cc cards ─────────────────────────
export function initCyberGlow(selector = '.cc') {
  const cards = document.querySelectorAll(selector);
  if (!cards.length) return;

  cards.forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      el.style.setProperty('--gx', `${x}px`);
      el.style.setProperty('--gy', `${y}px`);
    });
  });
}

// ── Init all effects ─────────────────────────────────────────
export function initEffects() {
  initStars(55);
  // Tilt and glow are set up lazily: we call them once after the router
  // renders a view. Views call re-init on their own .t3d / .cc cards.
  initTilt();
  initCyberGlow();
}

// ── Re-run after view renders new cards ─────────────────────
export function refreshEffects() {
  initTilt();
  initCyberGlow();
}
