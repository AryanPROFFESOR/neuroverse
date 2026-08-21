/* ============================================================
   NEUROVERSE — MAIN.JS
   Core JS: loader, cursor, hero canvas, blog grid, observers
   ============================================================ */

// ── LOADER ─────────────────────────────────────────────────
const loader        = document.getElementById('loader');
const loaderTypeEl  = document.getElementById('loaderTypingText');
const loaderEnterBtn = document.getElementById('loaderEnter');

document.body.style.overflow = 'hidden';

function dismissLoader() {
  loader.classList.add('hidden');
  document.body.style.overflow = '';
  initReveal();
}

function typeLoaderName() {
  const text = 'withinthebrainwitharyan';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      loaderTypeEl.textContent += text.charAt(i++);
      setTimeout(tick, 65 + Math.random() * 55);
    } else {
      loaderEnterBtn.classList.add('visible');
      // Fallback auto-dismiss in case the visitor doesn't click.
      window.__loaderAutoDismiss = setTimeout(dismissLoader, 4200);
    }
  };
  tick();
}

if (loader && loaderTypeEl && loaderEnterBtn) {
  loaderEnterBtn.addEventListener('click', () => {
    clearTimeout(window.__loaderAutoDismiss);
    dismissLoader();
  });
  setTimeout(typeLoaderName, 350);
} else if (loader) {
  // No typing UI present on this page — just clear the loader shortly after load.
  setTimeout(dismissLoader, 500);
}

// ── CUSTOM CURSOR ───────────────────────────────────────────
const dot  = document.getElementById('cursorDot');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  dot.style.left = mouseX + 'px';
  dot.style.top  = mouseY + 'px';
});

function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  ring.style.left = ringX + 'px';
  ring.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();

document.querySelectorAll('a, button, .blog-card, .paper-card, .video-card, .filter-tab').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('cursor-active'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-active'));
});

// ── NAV SCROLL EFFECT ───────────────────────────────────────
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
  updateReadingProgress();
}, { passive: true });

// ── MOBILE NAV ─────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'translateY(6.5px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-6.5px) rotate(-45deg)';
  } else {
    spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
  }
});

function typewriterEffect(element) {
  const text = element.textContent || '';
  element.textContent = '';
  let i = 0;
  const tick = () => {
    if (i < text.length) {
      element.textContent += text.charAt(i++);
      setTimeout(tick, 20 + Math.random() * 40);
    }
  };
  tick();
}

// ── HERO CANVAS — 3DMOL RIBBON & STICKY SCROLL ──────────
const heroCanvas = document.getElementById('heroCanvas');
const heroTrack = document.getElementById('heroTrack');
const heroContentEl = document.querySelector('.hero__content');

if (heroCanvas && window.$3Dmol) {
  // 1. Initialize the PyMOL-style viewer
  const viewer = $3Dmol.createViewer(heroCanvas, {
    backgroundColor: '#ffffff'
  });
  // Belt-and-braces: some 3Dmol builds only fully apply the background
  // color after the WebGL context exists, so set it again explicitly.
  if (viewer.setBackgroundColor) viewer.setBackgroundColor(0xffffff, 1);

  // 2. Pool of visually striking PDBs
  const PDB_POOL = ['1GZX', '1CRN', '4HHB', '1UBQ', '2POR', '3CLN'];
  const randomPdb = PDB_POOL[Math.floor(Math.random() * PDB_POOL.length)];

  // 3. Fetch and Render
  fetch(`https://files.rcsb.org/view/${randomPdb}.pdb`)
    .then(response => response.text())
    .then(data => {
      viewer.addModel(data, 'pdb');
      // Ribbon colored with the site's red / brown palette instead of a rainbow spectrum
      viewer.setStyle({}, { cartoon: { colorscheme: { prop: 'resi', gradient: 'linear', min: 0, max: 200, colors: [0xB3271E, 0x7A4A2B] } } });
      viewer.zoomTo();

      // Shift it slightly right to balance the text
      viewer.translate(30, 0);

      // Continuous slow spin
      viewer.spin('y', 0.3);
      if (viewer.setBackgroundColor) viewer.setBackgroundColor(0xffffff, 1);
      viewer.render();
    })
    .catch(err => console.error('Failed to load PDB:', err));

  // 4. Sticky Scroll Animation Logic
  const titleLines = document.querySelectorAll('.hero__title-line');

  window.addEventListener('scroll', () => {
    if (!heroTrack) return;

    // Calculate how far down the 300vh track we have scrolled (0.0 to 1.0)
    const rect = heroTrack.getBoundingClientRect();
    const trackTop = rect.top;
    const trackHeight = rect.height - window.innerHeight;

    // Clamp the progress between 0 and 1
    let progress = 0;
    if (trackTop < 0) {
      progress = Math.min(Math.abs(trackTop) / trackHeight, 1);
    }

    // ANIMATION 1: Fade the protein IN
    // Starts fading in immediately, fully visible at 30% scroll
    const proteinOpacity = Math.min(progress * 3.33, 0.85);
    heroCanvas.style.opacity = proteinOpacity;

    // ANIMATION 2: Split the text and fade it out as the model takes over
    if (titleLines.length >= 3) {
      const offset = progress * 600;
      titleLines[0].style.transform = `translateX(${-offset}px)`;
      titleLines[1].style.transform = `translateX(${offset}px)`;
      titleLines[2].style.transform = `translateX(${-offset}px)`;
    }
    if (heroContentEl) {
      const contentOpacity = Math.max(1 - progress * 1.7, 0);
      heroContentEl.style.opacity = contentOpacity;
    }
  }, { passive: true });
}

// ── INSIGHT CANVAS — HELIX ─────────────────────────────────
const insightCanvas = document.getElementById('insightCanvas');
if (insightCanvas) {
  const ctx = insightCanvas.getContext('2d');
  let t = 0;
  function resizeInsight() {
    insightCanvas.width  = insightCanvas.offsetWidth;
    insightCanvas.height = insightCanvas.offsetHeight;
  }
  function drawHelix() {
    const W = insightCanvas.width, H = insightCanvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2;
    const points1 = [], points2 = [];
    for (let i = 0; i <= 100; i++) {
      const frac = i / 100;
      const y    = frac * H;
      const amp  = 80 * Math.sin(frac * Math.PI);
      const x    = cx + amp * Math.cos(frac * Math.PI * 6 + t);
      points1.push({x, y});
      const x2   = cx + amp * Math.cos(frac * Math.PI * 6 + t + Math.PI);
      points2.push({x:x2, y});
    }
    // Cross-links
    for (let i = 0; i < 100; i += 8) {
      const p1 = points1[i], p2 = points2[i];
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = `rgba(79,163,227,0.2)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    // Strand 1
    ctx.beginPath();
    points1.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = 'rgba(79,163,227,0.9)';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12; ctx.shadowColor = '#B3271E';
    ctx.stroke(); ctx.shadowBlur = 0;
    // Strand 2
    ctx.beginPath();
    points2.forEach((p,i) => i===0 ? ctx.moveTo(p.x,p.y) : ctx.lineTo(p.x,p.y));
    ctx.strokeStyle = 'rgba(0,245,212,0.8)';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 12; ctx.shadowColor = '#7A4A2B';
    ctx.stroke(); ctx.shadowBlur = 0;
    // Nodes
    for (let i = 0; i < 100; i += 8) {
      [points1[i], points2[i]].forEach((p,k) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, Math.PI*2);
        ctx.fillStyle = k===0 ? '#B3271E' : '#7A4A2B';
        ctx.shadowBlur = 8; ctx.shadowColor = k===0 ? '#B3271E' : '#7A4A2B';
        ctx.fill(); ctx.shadowBlur = 0;
      });
    }
    t += 0.015;
    requestAnimationFrame(drawHelix);
  }
  window.addEventListener('resize', resizeInsight);
  resizeInsight();
  drawHelix();
}

// ── ORB CANVAS — PHILOSOPHY GATEWAY ────────────────────────
const orbCanvas = document.getElementById('orbCanvas');
if (orbCanvas) {
  const ctx = orbCanvas.getContext('2d');
  let t = 0;
  function resizeOrb() {
    orbCanvas.width  = orbCanvas.offsetWidth;
    orbCanvas.height = orbCanvas.offsetHeight;
  }
  function drawOrb() {
    const W = orbCanvas.width, H = orbCanvas.height;
    ctx.clearRect(0,0,W,H);
    const cx = W/2, cy = H/2, r = Math.min(W,H)*0.38;
    // Glow layers
    for (let i = 6; i > 0; i--) {
      const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,r*(1+i*0.18));
      grad.addColorStop(0, `rgba(0,245,212,${0.08 - i*0.01})`);
      grad.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx,cy,r*(1+i*0.18),0,Math.PI*2);
      ctx.fillStyle = grad;
      ctx.fill();
    }
    // Core orb
    const grad = ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,r*0.05, cx,cy,r);
    grad.addColorStop(0, 'rgba(180,255,240,0.9)');
    grad.addColorStop(0.4,'rgba(0,245,212,0.6)');
    grad.addColorStop(0.8,'rgba(79,163,227,0.4)');
    grad.addColorStop(1,  'rgba(80,0,180,0.1)');
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
    ctx.fillStyle = grad; ctx.fill();
    // Rotating rings
    for (let k = 0; k < 3; k++) {
      const angle = t + k * Math.PI * 2/3;
      ctx.save();
      ctx.translate(cx,cy);
      ctx.rotate(angle);
      ctx.scale(1, 0.35 + k*0.12);
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.9 + k*0.05), 0, Math.PI*2);
      ctx.strokeStyle = `rgba(0,245,212,${0.3 - k*0.08})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
    // Orbit dots
    for (let k = 0; k < 5; k++) {
      const a = t * 1.2 + k * (Math.PI*2/5);
      const x = cx + (r*1.2) * Math.cos(a);
      const y = cy + (r*0.4) * Math.sin(a);
      ctx.beginPath();
      ctx.arc(x, y, 3 + k*0.5, 0, Math.PI*2);
      ctx.fillStyle = '#7A4A2B';
      ctx.shadowBlur = 10; ctx.shadowColor = '#7A4A2B';
      ctx.fill(); ctx.shadowBlur = 0;
    }
    t += 0.008;
    requestAnimationFrame(drawOrb);
  }
  window.addEventListener('resize', resizeOrb);
  resizeOrb();
  drawOrb();
}

// ── BLOG DATA (real posts only) ──────────────────────────────
const BLOG_DATA = [
  {
    id:1, title:'The Default Mode Network: Consciousness Without a Task',
    excerpt:'When your mind wanders, an ancient network lights up — bridging memory, self-referential thought, and the architecture of imagination.',
    category:'neuroscience', date:'May 12, 2026', readTime:'9 min',
    url:'posts/2026-05-12-default-mode-network.html'
  },
  {
    id:2, title:'CRISPR-Cas9 and the Ethics of Neural Gene Editing',
    excerpt:'As gene editing reaches the brain, we face questions older than the technology: who defines a "normal" mind, and should we?',
    category:'biology', date:'May 19, 2026', readTime:'11 min',
    url:'posts/2026-05-19-crispr-cas9-neural-gene-editing.html'
  },
];

function getCategoryColor(cat) {
  const map = { neuroscience:'var(--clr-accent-2)', biology:'var(--clr-accent)' };
  return map[cat] || 'var(--clr-accent)';
}

function renderBlogCards(filter='all') {
  const grid = document.getElementById('blogGrid');
  if (!grid) return;
  const data = filter === 'all' ? BLOG_DATA : BLOG_DATA.filter(p => p.category === filter);
  grid.innerHTML = data.map((p, i) => `
    <article class="blog-card" data-category="${p.category}" style="animation-delay:${i*0.07}s">
      <a href="${p.url}" style="text-decoration:none;color:inherit;display:block;height:100%">
        <div class="blog-card__body">
          <span class="blog-card__category tag" style="color:${getCategoryColor(p.category)};border-color:${getCategoryColor(p.category)}">
            ${p.category === 'neuroscience' ? 'NEUROSCIENCE' : 'MOLECULAR BIOLOGY'}
          </span>
          <div class="blog-card__meta">
            <span>${p.date}</span>
            <span>·</span>
            <span>${p.readTime} read</span>
          </div>
          <h3 class="blog-card__title">${p.title}</h3>
          <p class="blog-card__excerpt">${p.excerpt}</p>
        </div>
        <div class="blog-card__footer">
          <span class="blog-card__read-time">⏱ ${p.readTime}</span>
          <div class="blog-card__arrow">↗</div>
        </div>
      </a>
    </article>
  `).join('');
  window.observeReveals?.(grid);
}

// Filter tabs
document.querySelectorAll('.filter-tab').forEach(tab => {
  tab.addEventListener('click', function() {
    document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
    this.classList.add('active');
    renderBlogCards(this.dataset.filter);
  });
});
renderBlogCards();

// ── SCROLL REVEAL ───────────────────────────────────────────
function alternateSectionReveal() {
  const skip = ['page-hero', 'neuro-hero', 'hero'];
  let i = 0;
  document.querySelectorAll('body > section').forEach(sec => {
    if (skip.some(cls => sec.classList.contains(cls))) return;
    if (sec.hasAttribute('data-reveal')) return;
    sec.setAttribute('data-reveal', i % 2 === 0 ? 'left' : 'right');
    i++;
  });
}

function initReveal() {
  alternateSectionReveal();
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal-up, [data-reveal]').forEach(el => observer.observe(el));

  // Blog cards, stat cards, etc.
  document.querySelectorAll('.blog-card, .paper-card, .video-card, .stat-card').forEach((el, i) => {
    el.style.transitionDelay = `${i * 0.05}s`;
    observer.observe(el);
  });
}

// ── COUNTER ANIMATION ───────────────────────────────────────
function animateCount(el, target, duration=1800) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const countObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCount(el, parseInt(el.dataset.count));
      countObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

// ── READING PROGRESS BAR ────────────────────────────────────
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position:fixed; top:0; left:0; height:2px; width:0%;
  background:linear-gradient(90deg,#B3271E,#7A4A2B);
  z-index:9999; transition:width 0.1s linear;
`;
document.body.appendChild(progressBar);

function updateReadingProgress() {
  const scrollTop = window.scrollY;
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct  = docH > 0 ? (scrollTop / docH) * 100 : 0;
  progressBar.style.width = pct + '%';
}

// ── NOISE OVERLAY ───────────────────────────────────────────
const noise = document.createElement('div');
noise.className = 'noise-overlay';
document.body.appendChild(noise);

// ── SMOOTH ANCHOR SCROLL ────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior:'smooth', block:'start' });
    }
  });
});

// ── PAGE TRANSITION ─────────────────────────────────────────
const transition = document.createElement('div');
transition.className = 'page-transition';
document.body.appendChild(transition);

document.querySelectorAll('a[href]:not([href^="#"]):not([href^="mailto"])').forEach(a => {
  a.addEventListener('click', e => {
    if (a.hostname !== location.hostname) return;
    e.preventDefault();
    const href = a.href;
    transition.classList.add('entering');
    setTimeout(() => { window.location.href = href; }, 500);
  });
});

window.addEventListener('pageshow', () => {
  transition.classList.remove('entering', 'exiting');
});
