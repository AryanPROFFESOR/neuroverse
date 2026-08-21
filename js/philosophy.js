/* ============================================================
   NEUROVERSE — PHILOSOPHY.JS
   Matrix rain, 3D consciousness orb, thought experiments,
   brain region explorer, interactive qualia demo
   ============================================================ */

// ── CUSTOM CURSOR ───────────────────────────────────────────
const philoCursor = document.getElementById('philoCursor');
const cursorText  = document.getElementById('cursorText');
let cx = 0, cy = 0, tcx = 0, tcy = 0;

document.addEventListener('mousemove', e => { tcx = e.clientX; tcy = e.clientY; });

const cursorWords = ['THINK', 'WHY?', 'WHO?', 'WHEN?', 'EXIST', 'FEEL', 'KNOW', 'BE'];
let wordIdx = 0;
setInterval(() => {
  wordIdx = (wordIdx + 1) % cursorWords.length;
  cursorText.textContent = cursorWords[wordIdx];
}, 2000);

(function animCursor() {
  cx += (tcx - cx) * 0.1;
  cy += (tcy - cy) * 0.1;
  philoCursor.style.left = cx + 'px';
  philoCursor.style.top  = cy + 'px';
  requestAnimationFrame(animCursor);
})();

// ── MATRIX RAIN ─────────────────────────────────────────────
const matrixCanvas = document.getElementById('matrixCanvas');
const mCtx = matrixCanvas.getContext('2d');
let mW, mH, mCols, drops;

const CHARS = 'アイウエオカキクケコサシスセソタチツテトナニヌネノΨΩΔΣΦΘ∞∂∫√π01ψφθλμν01010110';

function initMatrix() {
  mW = matrixCanvas.width  = window.innerWidth;
  mH = matrixCanvas.height = window.innerHeight;
  mCols = Math.floor(mW / 16);
  drops = Array(mCols).fill(1);
}

function drawMatrix() {
  mCtx.fillStyle = 'rgba(255,255,255,0.05)';
  mCtx.fillRect(0, 0, mW, mH);
  mCtx.fillStyle = '#B3271E';
  mCtx.font = '13px "IBM Plex Mono"';
  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    mCtx.fillStyle = `rgba(179,39,30,${Math.random() * 0.6 + 0.2})`;
    mCtx.fillText(char, i * 16, drops[i] * 16);
    if (drops[i] * 16 > mH && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}

window.addEventListener('resize', initMatrix);
initMatrix();
setInterval(drawMatrix, 55);

// ── MAIN CONSCIOUSNESS CANVAS ────────────────────────────────
const philoCanvas = document.getElementById('philoMainCanvas');
if (philoCanvas) {
  const ctx = philoCanvas.getContext('2d');
  let t = 0;

  function resizePhilo() {
    philoCanvas.width  = philoCanvas.offsetWidth;
    philoCanvas.height = philoCanvas.offsetHeight;
  }

  function drawConsciousness() {
    const W = philoCanvas.width, H = philoCanvas.height;
    ctx.clearRect(0, 0, W, H);
    const cx = W/2, cy = H/2;

    // Outer atmospheric glow
    for (let i = 5; i > 0; i--) {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, W/2 * (1 + i*0.15));
      grad.addColorStop(0, `rgba(179,39,30,${0.04 - i*0.006})`);
      grad.addColorStop(0.5,`rgba(124,58,237,${0.02 - i*0.003})`);
      grad.addColorStop(1,  'transparent');
      ctx.beginPath(); ctx.arc(cx, cy, W/2*(1+i*0.15), 0, Math.PI*2);
      ctx.fillStyle = grad; ctx.fill();
    }

    const R = Math.min(W, H) * 0.35;

    // Core sphere
    const sphereGrad = ctx.createRadialGradient(cx - R*0.2, cy - R*0.2, R*0.05, cx, cy, R);
    sphereGrad.addColorStop(0,  'rgba(220,255,250,0.95)');
    sphereGrad.addColorStop(0.3,'rgba(179,39,30,0.7)');
    sphereGrad.addColorStop(0.7,'rgba(124,58,237,0.4)');
    sphereGrad.addColorStop(1,  'rgba(122,74,43,0.12)');
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI*2);
    ctx.fillStyle = sphereGrad;
    ctx.shadowBlur = 40; ctx.shadowColor = 'rgba(179,39,30,0.6)';
    ctx.fill(); ctx.shadowBlur = 0;

    // Rotating ellipses (consciousness rings)
    for (let k = 0; k < 4; k++) {
      const angle = t * (0.5 + k * 0.2) + k * Math.PI/3;
      const tilt  = 0.25 + k * 0.1;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.scale(1, tilt);
      ctx.beginPath();
      ctx.arc(0, 0, R * (1.05 + k*0.08), 0, Math.PI*2);
      ctx.strokeStyle = `rgba(179,39,30,${0.25 - k*0.05})`;
      ctx.lineWidth = 1.5 - k*0.2;
      ctx.stroke();
      ctx.restore();
    }

    // Neural sparks around sphere
    const numSparks = 12;
    for (let i = 0; i < numSparks; i++) {
      const angle = (i / numSparks) * Math.PI*2 + t * 0.5;
      const dist  = R * (1.2 + 0.15 * Math.sin(t*2 + i));
      const sx = cx + dist * Math.cos(angle);
      const sy = cy + dist * Math.sin(angle) * 0.7;
      const sparkR = 2 + Math.sin(t*3 + i*0.8) * 1.5;
      ctx.beginPath(); ctx.arc(sx, sy, sparkR, 0, Math.PI*2);
      const hue = 170 + i * 15;
      ctx.fillStyle = `hsl(${hue}, 90%, 70%)`;
      ctx.shadowBlur = 12; ctx.shadowColor = `hsl(${hue}, 90%, 70%)`;
      ctx.fill(); ctx.shadowBlur = 0;

      // Spark trails to sphere
      if (Math.sin(t + i) > 0.5) {
        const nearX = cx + R * Math.cos(angle);
        const nearY = cy + R * Math.sin(angle) * 0.7;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(nearX, nearY);
        ctx.strokeStyle = `rgba(179,39,30,0.15)`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    // Inner patterns (mandala-like)
    for (let k = 1; k <= 3; k++) {
      const num = 6 * k;
      for (let i = 0; i < num; i++) {
        const a  = (i / num) * Math.PI*2 + t*(k%2===0 ? 0.3 : -0.3);
        const r  = R * (0.3 + k*0.15);
        const px = cx + r * Math.cos(a);
        const py = cy + r * Math.sin(a);
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(179,39,30,${0.4 - k*0.08})`;
        ctx.fill();
      }
    }

    t += 0.008;
    requestAnimationFrame(drawConsciousness);
  }

  window.addEventListener('resize', resizePhilo);
  resizePhilo();
  drawConsciousness();
}

// ── PHILOSOPHY CARDS ────────────────────────────────────────
const PHILO_CARDS = [
  { icon:'🧠', q:'Can matter experience anything?', hint:'The hard problem of consciousness — why does physical brain activity give rise to subjective experience?', color:'#B3271E' },
  { icon:'🎲', q:'Is free will an illusion?', hint:'Libet\'s experiments show neural readiness potential precedes conscious decision. Are we passengers in our own brains?', color:'#7A4A2B' },
  { icon:'🪞', q:'What makes you the same person across time?', hint:'Ship of Theseus applied to neurons: 90% of your atoms replace over years. What is the continuous self?', color:'#8C1C13' },
  { icon:'⏳', q:'Does the present moment actually exist?', hint:'Physics says the "now" is observer-relative. The specious present of consciousness spans ~3 seconds. What is "now"?', color:'#C77B3B' },
  { icon:'🌊', q:'Is consciousness a spectrum or binary?', hint:'Integrated Information Theory (IIT) gives even simple systems some phi. Is a thermostat conscious?', color:'#34d399' },
  { icon:'🌀', q:'Could a perfect simulation know it\'s simulated?', hint:'If physics rules are self-consistent inside, no experiment could distinguish simulation from base reality.', color:'#f472b6' },
  { icon:'👁','q':'Why is there something rather than nothing?', hint:'Leibniz\'s question. Parfit called it the "most baffling question in metaphysics." No answer. Only awe.', color:'#8C1C13' },
  { icon:'🔮', q:'What is the self?', hint:'Buddhism: no fixed self. Neuroscience: predictive model. Narrative theory: the story you tell about yourself.', color:'#fb923c' },
];

const philoGrid = document.getElementById('philoGrid');
if (philoGrid) {
  philoGrid.innerHTML = PHILO_CARDS.map(c => `
    <div class="philo-card" onclick="this.classList.toggle('expanded')">
      <div class="philo-card__icon">${c.icon}</div>
      <p class="philo-card__q">"${c.q}"</p>
      <p class="philo-card__hint">${c.hint}</p>
      <div class="philo-card__glow" style="background:${c.color}"></div>
    </div>
  `).join('');
}

// ── QUALIA DEMO ─────────────────────────────────────────────
const qualiaCanvas = document.getElementById('qualiaCanvas');
if (qualiaCanvas) {
  const ctx = qualiaCanvas.getContext('2d');
  let hueShift = 0;
  function resizeQualia() {
    qualiaCanvas.width  = qualiaCanvas.offsetWidth * 2; // retina
    qualiaCanvas.height = qualiaCanvas.offsetHeight * 2;
    ctx.scale(2, 2);
  }
  function drawQualia() {
    const W = qualiaCanvas.offsetWidth, H = qualiaCanvas.offsetHeight;
    ctx.clearRect(0,0,W,H);
    const cx=W/2,cy=H/2,R=Math.min(W,H)/2;
    // Swirling qualia colors
    for (let i = 0; i < 360; i += 2) {
      const a1 = (i / 360) * Math.PI*2;
      const a2 = ((i+2) / 360) * Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, a1, a2);
      ctx.closePath();
      ctx.fillStyle = `hsl(${(i + hueShift) % 360}, 85%, 55%)`;
      ctx.fill();
    }
    // White center
    const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.7);
    grad.addColorStop(0,'rgba(255,255,255,0.95)');
    grad.addColorStop(1,'rgba(255,255,255,0)');
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);
    ctx.fillStyle=grad;ctx.fill();
    // Center question
    ctx.fillStyle = '#B3271E';
    ctx.font = '700 18px "Playfair Display"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('What is', cx, cy - 12);
    ctx.fillText('RED?', cx, cy + 14);
    hueShift += 0.5;
    requestAnimationFrame(drawQualia);
  }
  window.addEventListener('resize', resizeQualia);
  resizeQualia();
  drawQualia();
}

const maryYes = document.getElementById('maryYes');
const maryNo  = document.getElementById('maryNo');
const qualiaResponse = document.getElementById('qualiaResponse');
maryYes?.addEventListener('click', () => {
  qualiaResponse.textContent = 'If Mary learns something new upon seeing red for the first time, then there are facts about conscious experience that cannot be captured by physical descriptions alone. This seems to support property dualism — the idea that mental properties are non-physical, even if the brain is physical. But then... what is a "non-physical property"? And how does it interact with matter? The rabbit hole deepens.';
  qualiaResponse.classList.add('show');
});
maryNo?.addEventListener('click', () => {
  qualiaResponse.textContent = 'If Mary learns nothing new — if her knowledge of wavelengths was already complete — then physicalism survives. But you have to explain away the intuition that seeing red is qualitatively different from knowing about red. Daniel Dennett says Mary is just "recognizing" a known fact, not learning a new one. Most people find this deeply unsatisfying. Hence: the hard problem remains hard.';
  qualiaResponse.classList.add('show');
});

// ── THOUGHT EXPERIMENT GENERATOR ────────────────────────────
const THOUGHTS = [
  {
    thought: 'The Teleporter Paradox: A machine scans every atom of your body, destroys the original, and reconstructs you perfectly elsewhere. Is the person who steps out still you?',
    meta:'PERSONAL IDENTITY · CONTINUITY OF SELF',
    context:'Derek Parfit argued that identity isn\'t what matters — psychological continuity is. But our intuitions scream otherwise. What does that tell us about the self?'
  },
  {
    thought: 'Philosophical Zombie: Imagine a being physically identical to you — same neurons firing, same behavior — but with no inner experience. No qualia, no "what it\'s like." Is this conceivable? If so, does consciousness lie outside physics?',
    meta:'QUALIA · HARD PROBLEM · DUALISM',
    context:'Chalmers argues p-zombies are conceivable, therefore consciousness is non-physical. Dennett says they\'re incoherent — if it acts conscious, it IS conscious. Both positions have radical implications.'
  },
  {
    thought: 'The Experience Machine: Nozick\'s machine offers you a perfect, indistinguishable simulation of the best life possible. You\'ll never know you\'re inside it. Do you plug in?',
    meta:'VALUE · AUTHENTICITY · HEDONISM',
    context:'If you wouldn\'t plug in, you value something beyond pleasant experience. Perhaps authenticity, genuine achievement, or actual connection. This undermines pure hedonism as a theory of value.'
  },
  {
    thought: 'The Sleeping God: Suppose consciousness is the universe\'s way of experiencing itself. Each mind is a temporary aperture through which the cosmos looks at itself. What follows ethically?',
    meta:'PANPSYCHISM · ETHICS · MYSTICISM',
    context:'This idea appears in various forms: Watts\' cosmic self, Hofstadter\'s strange loops, Buddhist non-self. If true, harming another is harming yourself — the universe harming itself.'
  },
  {
    thought: 'Boltzmann Brain: Statistical mechanics allows for a spontaneous fluctuation producing a conscious brain with false memories of an entire life. Right now. You might be a Boltzmann brain. What would make that hypothesis false?',
    meta:'PROBABILITY · MEMORY · SKEPTICISM',
    context:'The Boltzmann Brain problem haunts inflationary cosmology. If sufficiently large universes exist long enough, such fluctuations are not merely possible but arguably inevitable. Solipsism gets a physics upgrade.'
  },
  {
    thought: 'Ship of Theseus for Neurons: Your brain replaces its molecules constantly. Suppose we replaced your neurons one by one with silicon equivalents. At what point, if any, do you stop being conscious?',
    meta:'IDENTITY · FUNCTIONALISM · SUBSTRATE',
    context:'Functionalists say never — consciousness depends on function, not substrate. But what if the silicon copies experience nothing? The Chinese Room Problem resurfaces. There may be no clean answer.'
  },
];

const thoughtDisplay = document.getElementById('thoughtDisplay');
const thoughtBtn     = document.getElementById('thoughtBtn');
const thoughtSpinner = document.getElementById('thoughtSpinner');
const currentThought = document.getElementById('currentThought');
const thoughtMeta    = document.getElementById('thoughtMeta');
const thoughtContext = document.getElementById('thoughtContext');
let lastThoughtIdx   = -1;

thoughtBtn?.addEventListener('click', () => {
  thoughtSpinner.classList.add('active');
  currentThought.style.opacity = '0';
  thoughtContext.style.opacity = '0';

  setTimeout(() => {
    let idx;
    do { idx = Math.floor(Math.random() * THOUGHTS.length); } while (idx === lastThoughtIdx);
    lastThoughtIdx = idx;
    const t = THOUGHTS[idx];
    currentThought.textContent = t.thought;
    thoughtMeta.textContent    = '↳ ' + t.meta;
    thoughtContext.textContent  = t.context;
    currentThought.style.opacity = '1';
    thoughtContext.style.opacity = '1';
    thoughtSpinner.classList.remove('active');
  }, 800);
});

// ── PHILOSOPHY TIMELINE ──────────────────────────────────────
const TIMELINE = [
  { year:'400 BC', name:'Plato', theory:'Theory of Forms', desc:'The mind perceives eternal, perfect Forms; physical world is mere shadow.' },
  { year:'1640',   name:'Descartes', theory:'Substance Dualism', desc:'Cogito ergo sum. Mind and body are separate substances.' },
  { year:'1748',   name:'Hume', theory:'Bundle Theory', desc:'No persistent self — just bundles of perceptions.' },
  { year:'1781',   name:'Kant', theory:'Transcendental Idealism', desc:'Space, time, causality are structures the mind imposes on experience.' },
  { year:'1874',   name:'James', theory:'Stream of Consciousness', desc:'Mind is a continuous, ever-flowing stream, not discrete states.' },
  { year:'1950',   name:'Turing', theory:'Computational Mind', desc:'If a machine behaves intelligently, it thinks. Function over substrate.' },
  { year:'1974',   name:'Nagel', theory:'What Is It Like to Be a Bat?', desc:'Subjective experience cannot be captured by objective science.' },
  { year:'1994',   name:'Chalmers', theory:'The Hard Problem', desc:'Explaining behavior doesn\'t explain experience. The gap persists.' },
  { year:'1995',   name:'Damasio', theory:'Somatic Marker Hypothesis', desc:'Emotions are essential to rational thought, not opposed to it.' },
  { year:'2004',   name:'Tononi', theory:'Integrated Information Theory', desc:'Consciousness = Phi (integrated information). Potentially panpsychist.' },
  { year:'2010',   name:'Friston', theory:'Free Energy Principle', desc:'Brains minimize surprise about sensory input — predictive machines.' },
  { year:'2023',   name:'LeDoux', theory:'Conscious Existence Theory', desc:'Survival circuits plus cognitive interpretation = emotions.' },
];

const philoTimeline = document.getElementById('philoTimeline');
if (philoTimeline) {
  philoTimeline.innerHTML = TIMELINE.map(item => `
    <div class="philo-timeline-item">
      <div class="philo-timeline-item__year">${item.year}</div>
      <div class="philo-timeline-item__name">${item.name}</div>
      <div class="philo-timeline-item__theory">${item.theory}</div>
      <div class="philo-timeline-item__desc">${item.desc}</div>
    </div>
  `).join('');
}

// ── BRAIN EXPLORER ───────────────────────────────────────────
const brainCanvas = document.getElementById('brainCanvas');
const brainName   = document.getElementById('brainName');
const brainDesc   = document.getElementById('brainDesc');

const BRAIN_REGIONS = [
  { label:'Prefrontal Cortex', x:0.50, y:0.22, r:55, color:'#B3271E',
    desc:'The "CEO" of the brain. Executive function, decision-making, sense of self, future planning, and — crucially — the feeling of being in control. Damage here yields alien hand syndrome, personality dissolution, and the disappearance of the sense of agency.' },
  { label:'Amygdala', x:0.38, y:0.52, r:28, color:'#f472b6',
    desc:'The alarm system. Processes fear, threat, salience. Active in anxiety, PTSD, and — fascinatingly — in aesthetic awe. The line between terror and sublimity is thin. Philosophical implication: our emotional reactions may define what we call reality.' },
  { label:'Hippocampus', x:0.62, y:0.55, r:32, color:'#8C1C13',
    desc:'Memory\'s index. Without it, you cannot form new explicit memories. Patient H.M. lived forever in the present. The philosophical puzzle: if memory constitutes identity, what is a self without one? Is each moment a new self?' },
  { label:'Default Mode Network', x:0.50, y:0.36, r:44, color:'#fbbf24',
    desc:'Active when you\'re doing nothing. Mind-wandering, self-referential thought, theory of mind, moral reasoning, and creative insight. Some theorize this is where "you" live most of the time. It\'s suppressed during focused tasks.' },
  { label:'Insula', x:0.30, y:0.45, r:26, color:'#34d399',
    desc:'Interoception — the sense of your own body\'s interior. Hunger, pain, disgust, but also empathy. Damage here blunts emotional experience. It may be where feeling meets knowing — the bridge between body and mind.' },
  { label:'Anterior Cingulate', x:0.50, y:0.42, r:22, color:'#fb923c',
    desc:'Conflict monitoring and error detection. Fires when things feel wrong before you consciously know why. May be the source of moral discomfort, cognitive dissonance, and the sense that something isn\'t right.' },
  { label:'Thalamus', x:0.50, y:0.60, r:20, color:'#a78bfa',
    desc:'The relay station, but more. It gates consciousness — during sleep and anesthesia, thalamocortical loops break down. Some theorize the thalamus generates the binding that creates unified experience.' },
  { label:'Cerebellum', x:0.50, y:0.82, r:50, color:'#67e8f9',
    desc:'Traditionally: balance and coordination. Now: timing, prediction, emotional regulation. Has more neurons than the entire cerebral cortex. Its role in consciousness remains deeply mysterious and largely unexplored.' },
];

if (brainCanvas) {
  const ctx = brainCanvas.getContext('2d');
  let hovered = null;
  let t = 0;

  function resizeBrain() {
    brainCanvas.width  = brainCanvas.offsetWidth;
    brainCanvas.height = brainCanvas.offsetHeight;
  }

  function drawBrain() {
    const W = brainCanvas.width, H = brainCanvas.height;
    ctx.clearRect(0,0,W,H);

    // Background brain silhouette
    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.beginPath();
    ctx.ellipse(W/2, H*0.45, W*0.4, H*0.42, 0, 0, Math.PI*2);
    ctx.fillStyle = '#B3271E';
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();

    // Draw faint grid
    ctx.strokeStyle = 'rgba(179,39,30,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 30) {
      ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke();
    }
    for (let gy = 0; gy < H; gy += 30) {
      ctx.beginPath(); ctx.moveTo(0,gy); ctx.lineTo(W,gy); ctx.stroke();
    }

    // Connection lines between regions
    for (let i = 0; i < BRAIN_REGIONS.length; i++) {
      for (let j = i+1; j < BRAIN_REGIONS.length; j++) {
        const a = BRAIN_REGIONS[i], b = BRAIN_REGIONS[j];
        const ax = a.x*W, ay = a.y*H, bx = b.x*W, by = b.y*H;
        const dist = Math.sqrt((ax-bx)**2+(ay-by)**2);
        if (dist < 200) {
          const alpha = (1 - dist/200) * 0.12 * (1 + 0.3*Math.sin(t + i));
          ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
          ctx.strokeStyle = `rgba(179,39,30,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw regions
    BRAIN_REGIONS.forEach((region, i) => {
      const rx = region.x * W, ry = region.y * H;
      const isHovered = hovered === i;
      const scale = isHovered ? 1.2 + 0.05*Math.sin(t*3) : 1 + 0.02*Math.sin(t+i);
      const r = region.r * scale;

      // Glow
      const glow = ctx.createRadialGradient(rx,ry,0,rx,ry,r*2);
      glow.addColorStop(0, region.color + (isHovered ? '40' : '15'));
      glow.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(rx,ry,r*2,0,Math.PI*2);
      ctx.fillStyle = glow; ctx.fill();

      // Main circle
      ctx.beginPath(); ctx.arc(rx,ry,r,0,Math.PI*2);
      ctx.fillStyle = region.color + (isHovered ? '30' : '18');
      ctx.fill();
      ctx.strokeStyle = region.color + (isHovered ? 'cc' : '60');
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Label
      ctx.fillStyle = region.color;
      ctx.font = `${isHovered ? '600 ' : ''}${Math.max(10, region.r * 0.22)}px "IBM Plex Mono"`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = isHovered ? 12 : 0; ctx.shadowColor = region.color;
      ctx.fillText(region.label.split(' ')[0], rx, ry);
      ctx.shadowBlur = 0;
    });

    t += 0.015;
    requestAnimationFrame(drawBrain);
  }

  brainCanvas.addEventListener('mousemove', e => {
    const rect = brainCanvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (brainCanvas.width / rect.width);
    const my = (e.clientY - rect.top) * (brainCanvas.height / rect.height);
    hovered = null;
    BRAIN_REGIONS.forEach((region, i) => {
      const rx = region.x * brainCanvas.width;
      const ry = region.y * brainCanvas.height;
      const dist = Math.sqrt((mx-rx)**2 + (my-ry)**2);
      if (dist < region.r * 1.4) {
        hovered = i;
        brainName.textContent = region.label;
        brainDesc.textContent = region.desc;
      }
    });
    if (hovered === null) {
      brainName.textContent = 'Hover a region';
      brainDesc.textContent = 'Each region contributes a unique thread to the tapestry of experience.';
    }
  });

  window.addEventListener('resize', resizeBrain);
  resizeBrain();
  drawBrain();
}

// ── SCROLL REVEAL ────────────────────────────────────────────
// Alternate left/right slide-in for top-level philosophy sections
(function alternatePhiloSectionReveal() {
  const skip = ['philo-hero'];
  let i = 0;
  document.querySelectorAll('body > section').forEach(sec => {
    if (skip.some(cls => sec.classList.contains(cls))) return;
    sec.style.opacity = '0';
    sec.style.transform = i % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
    sec.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    const target = sec;
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          target.style.opacity = '1';
          target.style.transform = 'none';
          io.unobserve(target);
        }
      });
    }, { threshold: 0.1 });
    io.observe(sec);
    i++;
  });
})();

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add('visible');
  });
}, { threshold: 0.1 });

document.querySelectorAll('.philo-card, .philo-timeline-item, .cm__item').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s, transform 0.6s';
  revealObserver.observe(el);
});

// ── PROGRESS BARS ────────────────────────────────────────────
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const fill = e.target.querySelector('.progress__fill');
      if (fill) {
        const w = fill.style.width;
        fill.style.width = '0%';
        setTimeout(() => { fill.style.width = w; }, 200);
      }
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('.progress').forEach(el => progressObserver.observe(el));

// ── RANDOM QUESTION BTN ──────────────────────────────────────
document.getElementById('randomBtn')?.addEventListener('click', () => {
  const q = PHILO_CARDS[Math.floor(Math.random() * PHILO_CARDS.length)];
  const display = document.createElement('div');
  display.style.cssText = `
    position:fixed; top:50%; left:50%; transform:translate(-50%,-50%);
    background:rgba(251,240,233,0.97); border:1px solid #B3271E;
    border-radius:20px; padding:3rem; max-width:560px; width:90%;
    z-index:9000; font-family:'Playfair Display',serif;
    color:#e0f2fe; text-align:center;
    animation:pop-in 0.4s ease;
  `;
  display.innerHTML = `
    <div style="font-size:3rem;margin-bottom:1.5rem">${q.icon}</div>
    <p style="font-size:1.4rem;font-style:italic;margin-bottom:1.5rem">"${q.q}"</p>
    <p style="font-size:0.9rem;color:#7dd3fc;line-height:1.8;margin-bottom:2rem">${q.hint}</p>
    <button onclick="this.parentElement.remove()" style="
      padding:10px 24px; background:transparent; border:1px solid #B3271E;
      color:#B3271E; border-radius:999px; font-family:'IBM Plex Mono',monospace;
      font-size:0.75rem; letter-spacing:0.1em; cursor:none;
    ">Close</button>
  `;
  document.body.appendChild(display);

  // Backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:8999;`;
  backdrop.onclick = () => { backdrop.remove(); display.remove(); };
  document.body.appendChild(backdrop);
});

// ── ENTER BTN ────────────────────────────────────────────────
document.getElementById('enterBtn')?.addEventListener('click', () => {
  document.querySelector('#consciousness')?.scrollIntoView({ behavior:'smooth' });
});

// ── GLITCH TRIGGER (random) ──────────────────────────────────
setInterval(() => {
  const glitch = document.getElementById('glitchOverlay');
  if (Math.random() > 0.85) {
    glitch.style.opacity = '0.6';
    glitch.style.transform = `translateX(${(Math.random()-0.5)*4}px)`;
    setTimeout(() => { glitch.style.opacity = '0'; glitch.style.transform = ''; }, 80);
  }
}, 3000);

// Fix cards visibility after reveal
document.querySelectorAll('.philo-card, .philo-timeline-item, .cm__item').forEach(el => {
  revealObserver.observe(el);
});

// Override for observed cards
const style = document.createElement('style');
style.textContent = `.visible { opacity: 1 !important; transform: none !important; }`;
document.head.appendChild(style);
