/* ============================================================
   NEUROVERSE — SHARED.JS
   Reusable: cursor, nav scroll, reveal observer, counters,
   page transitions, reading progress, mobile nav
   ============================================================ */

// Reduce animations automatically on low-power devices
(function(){
  try {
    const mem = navigator.deviceMemory || 4;
    const cpu = navigator.hardwareConcurrency || 4;
    if (mem <= 2 || cpu <= 2) document.documentElement.classList.add('reduced-motion');
  } catch(e){}
})();

// ── CUSTOM CURSOR (optimized) ───────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
if (dot && ring) {
  let mX = 0, mY = 0, rX = 0, rY = 0;
  // Only record mouse coords on move; update DOM from a single RAF loop to avoid layout thrash
  document.addEventListener('mousemove', e => { mX = e.clientX; mY = e.clientY; }, { passive: true });
  (function anim() {
    // update dot position and smoothly interpolate ring
    dot.style.left = mX + 'px';
    dot.style.top  = mY + 'px';
    rX += (mX - rX) * 0.12;
    rY += (mY - rY) * 0.12;
    ring.style.left = rX + 'px';
    ring.style.top  = rY + 'px';
    requestAnimationFrame(anim);
  })();
  document.querySelectorAll('a,button,.blog-card,.paper-card,.video-card,.domain-card,.theory-card,.philo-card').forEach(el=>{
    el.addEventListener('mouseenter',()=>document.body.classList.add('cursor-active'));
    el.addEventListener('mouseleave',()=>document.body.classList.remove('cursor-active'));
  });
}

// ── NAV SCROLL ──────────────────────────────────────────────
const nav = document.getElementById('mainNav');
// ── THROTTLED SCROLL HANDLER ────────────────────────────────
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(() => {
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 40);
      updateProgress();
      scrollTicking = false;
    });
  }
}, { passive: true });

// ── MOBILE NAV ──────────────────────────────────────────────
const toggle = document.getElementById('navToggle');
const links  = document.getElementById('navLinks');
toggle?.addEventListener('click', () => {
  links.classList.toggle('open');
  const s = toggle.querySelectorAll('span');
  if (links.classList.contains('open')) {
    s[0].style.transform='translateY(6.5px) rotate(45deg)';
    s[1].style.opacity='0';
    s[2].style.transform='translateY(-6.5px) rotate(-45deg)';
  } else {
    s.forEach(x=>{x.style.transform='';x.style.opacity='';});
  }
});

// ── SCROLL REVEAL / TYPEWRITER ───────────────────────────────
function typewriterEffect(element) {
  const text = element.textContent || '';
  element.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i++);
      const delay = 20 + Math.random() * 40; // 20-60ms
      setTimeout(tick, delay);
    } else {
      element.classList.add('visible');
    }
  };
  tick();
}

window.typewriterEffect = typewriterEffect;

const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const useType = el.getAttribute('data-typewriter') === 'true';
    if (useType) {
      if (!el.dataset.typed) {
        typewriterEffect(el);
        el.dataset.typed = '1';
      }
    } else {
      el.classList.add('visible');
    }
    revealObs.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

// Defer observing to a macrotask so any page-specific script (research.js,
// neuroscience.html's inline module, etc.) has already injected its
// dynamic content — otherwise dynamically-added [data-reveal] elements
// (like theory cards) are never observed and stay permanently hidden.
setTimeout(() => {
  document.querySelectorAll('.reveal-up,[data-reveal]').forEach(el => {
    if (!el.classList.contains('visible')) revealObs.observe(el);
  });
}, 0);

// Exposed so any page can re-run this after injecting more content later.
window.observeReveals = function (root) {
  (root || document).querySelectorAll('.reveal-up,[data-reveal]').forEach(el => {
    if (!el.classList.contains('visible')) revealObs.observe(el);
  });
};

// ── READING PROGRESS ─────────────────────────────────────────
const bar = document.createElement('div');
bar.style.cssText = 'position:fixed;top:0;left:0;height:2px;transform-origin:left;transform:scaleX(0);background:var(--clr-text);z-index:9999;transition:transform .12s linear;';
document.body.appendChild(bar);
function updateProgress() {
  const pct = (document.documentElement.scrollTop || document.body.scrollTop) / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  const s = Math.max(0, Math.min(pct / 100, 1));
  bar.style.transform = `scaleX(${s})`;
}

// ── PAGE TRANSITIONS ─────────────────────────────────────────
const overlay = document.createElement('div');
overlay.className = 'page-transition';
document.body.appendChild(overlay);
document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"]):not([href^="http"])').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const href = a.href;
    overlay.classList.add('entering');
    setTimeout(() => { window.location.href = href; }, 480);
  });
});
window.addEventListener('pageshow', () => overlay.classList.remove('entering','exiting'));

// ── NOISE OVERLAY ────────────────────────────────────────────
const noise = document.createElement('div');
noise.className = 'noise-overlay';
document.body.appendChild(noise);

// ── COUNTER ANIMATION ────────────────────────────────────────
const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    let start, dur = 1800;
    const step = ts => {
      if (!start) start = ts;
      const p = Math.min((ts-start)/dur, 1);
      el.textContent = Math.floor((1-Math.pow(1-p,3))*target);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
    countObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-count]').forEach(el => countObs.observe(el));

// ── SMOOTH ANCHOR SCROLL ─────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t) { e.preventDefault(); t.scrollIntoView({ behavior:'smooth' }); }
  });
});
