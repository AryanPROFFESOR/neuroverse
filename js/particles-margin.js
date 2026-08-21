/* ============================================================
   PARTICLES-MARGIN.JS
   Sparse, connected particle network drawn only in the left and
   right page margins (and lightly behind the nav bar). Particles
   drift slowly and nudge with scroll velocity. Kept intentionally
   sparse so it reads as texture, not noise.
   ============================================================ */
(function () {
  if (window.__marginParticlesInit) return;
  window.__marginParticlesInit = true;

  const MARGIN_WIDTH = 190;      // px, width of each side band
  const PARTICLES_PER_SIDE = 16; // sparse on purpose
  const LINK_DIST = 130;

  function makeCanvas(side) {
    const c = document.createElement('canvas');
    c.className = 'margin-particles margin-particles--' + side;
    c.setAttribute('aria-hidden', 'true');
    Object.assign(c.style, {
      position: 'fixed',
      top: '0',
      [side]: '0',
      width: MARGIN_WIDTH + 'px',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '1',
      opacity: '0.55',
    });
    document.body.appendChild(c);
    return c;
  }

  function initSide(side) {
    const canvas = makeCanvas(side);
    const ctx = canvas.getContext('2d');
    let W = MARGIN_WIDTH, H = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      H = window.innerHeight;
      canvas.style.height = H + 'px';
      canvas.width = MARGIN_WIDTH * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const particles = Array.from({ length: PARTICLES_PER_SIDE }, () => ({
      x: Math.random() * MARGIN_WIDTH,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12,
      vy: (Math.random() - 0.5) * 0.12,
      r: 1.1 + Math.random() * 1.4,
    }));

    let scrollNudge = 0;
    let lastScrollY = window.scrollY;

    function onScroll() {
      const dy = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      scrollNudge += dy * 0.02;
      scrollNudge = Math.max(-2, Math.min(2, scrollNudge));
    }

    function tick() {
      ctx.clearRect(0, 0, MARGIN_WIDTH, H);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy + scrollNudge * 0.4;
        if (p.x < 0) p.x = MARGIN_WIDTH; if (p.x > MARGIN_WIDTH) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      }
      scrollNudge *= 0.92;

      // Connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST) {
            ctx.strokeStyle = `rgba(179,39,30,${0.16 * (1 - dist / LINK_DIST)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(122,74,43,0.55)';
        ctx.fill();
      }

      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('scroll', onScroll, { passive: true });
    resize();
    tick();
  }

  function start() {
    // Skip on narrow viewports — margins don't exist there, and it'd just
    // draw over content.
    if (window.innerWidth < 1180) return;
    initSide('left');
    initSide('right');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
