/* ============================================================
   NEUROVERSE — RESEARCH.JS
   Research page: theory cards, topic map, predictive canvas
   ============================================================ */

// ── THEORY CARDS DATA ───────────────────────────────────────
const THEORIES = [
  {
    label: 'Computational Neuroscience',
    title: 'The Free Energy Principle',
    summary: 'Friston\'s unified theory proposes that biological systems resist disorder by minimising free energy — essentially the surprise of sensory input. Perception is inference; action is the resolution of prediction error.',
    equation: 'F = E_q[log q(z) - log p(x,z)] ≥ -log p(x)',
    tags: ['theory','neuro'], color: '#e5e5e5'
  },
  {
    label: 'Neural Coding',
    title: 'Sparse Distributed Representations',
    summary: 'Information in the brain is encoded not by individual neurons but by patterns of activity across populations. Sparsity — few neurons active at once — maximises capacity and reduces interference.',
    equation: 'I(X;Y) = H(Y) - H(Y|X)',
    tags: ['neuro','theory'], color: '#d4d4d4'
  },
  {
    label: 'Molecular Biology',
    title: 'Epigenetic Memory Encoding',
    summary: 'DNA methylation and histone modification create heritable changes in gene expression without altering sequence. The brain uses these mechanisms to encode long-term memories at the molecular level.',
    equation: 'CH₃ + DNA → 5-methylcytosine (5mC)',
    tags: ['bio','neuro'], color: '#bdbdbd'
  },
  {
    label: 'Developmental Biology',
    title: 'Pluripotency & Lineage Commitment',
    summary: 'Stem cells balance self-renewal against differentiation through transcription factor networks (Oct4, Sox2, Nanog) and epigenetic remodeling. Splicing errors in these programs — as in minigene assays for developmental syndromes — can misroute cell fate entirely.',
    equation: 'dC/dt = f(TF) − δC, C = commitment state',
    tags: ['bio','theory'], color: '#f0f0f0'
  },
  {
    label: 'Systems Neuroscience',
    title: 'Global Workspace Theory',
    summary: 'Baars\' GWT proposes consciousness arises when information is broadcast widely across the brain via a "global workspace." Unconscious processing is modular; consciousness is the integration of selected contents.',
    equation: 'GW ≡ {x : broadcast(x) → all modules}',
    tags: ['neuro','theory'], color: '#cfcfcf'
  },
  {
    label: 'Information Theory',
    title: 'Integrated Information Theory (IIT)',
    summary: 'Tononi\'s IIT defines consciousness as integrated information (Φ). A system is conscious to the degree it cannot be decomposed into independent parts — deeply controversial, deeply interesting.',
    equation: 'Φ = min over bipartitions φ(A→B) + φ(B→A)',
    tags: ['theory','neuro'], color: '#a8a8a8'
  },
  {
    label: 'Custom Tooling',
    title: 'SriC — Out-of-Core Sparse Genomics Format',
    summary: 'A binary storage format for single-cell RNA-seq data, built to outperform HDF5/.h5ad on the datasets I actually work with. Dynamic chunking, memory-mapping, and a Zero-Inflated Negative Binomial estimator let it stream billion-element matrices without ever loading them fully into RAM — >1.5× smaller on disk than .h5ad, with microsecond-level single-gene queries and bit-exact round-trip reconstruction (max_err = 0.00e+00) validated on real interneuron datasets.',
    equation: 'NNZ ≈ 1.1B, sparsity ≈ 92%, ratio ≈ 1.52× vs .h5ad',
    tags: ['bio','theory'], color: '#e5e5e5', link: 'https://github.com/AryanPROFFESOR/SriC_DATA_FORMAT'
  },
];

const theoryGrid = document.getElementById('theoryGrid');
if (theoryGrid) {
  theoryGrid.innerHTML = THEORIES.map((t, i) => `
    <div class="theory-card" style="animation-delay:${i*0.08}s" data-reveal data-delay="${i+1}">
      <div class="theory-card__glow" style="background:${t.color}"></div>
      <p class="theory-card__label">${t.label}</p>
      <h3 class="theory-card__title">${t.title}</h3>
      <p class="theory-card__summary">${t.summary}</p>
      <div class="theory-card__equation">${t.equation}</div>
      <div class="theory-card__tags">
        ${t.tags.map(tag => `<span class="tag tag--${tag}">${tag}</span>`).join('')}
      </div>
      ${t.link ? `<a href="${t.link}" target="_blank" rel="noopener" class="hero__button hero__button--ghost" style="margin-top:1rem;display:inline-block">View on GitHub ↗</a>` : ''}
    </div>
  `).join('');
}

window.observeReveals?.(theoryGrid);

// ── PREDICTIVE CODING CANVAS ─────────────────────────────────
const predCanvas = document.getElementById('predictiveCanvas');
if (predCanvas) {
  const ctx = predCanvas.getContext('2d');
  let t = 0;

  function resizePred() {
    predCanvas.width  = predCanvas.offsetWidth;
    predCanvas.height = predCanvas.offsetHeight || 400;
  }

  // Brain layer nodes
  const LAYERS = [
    { label: 'Higher Cortex',    y: 0.15, nodes: 4, color: '#f2f2f2' },
    { label: 'Association Cortex', y: 0.38, nodes: 6, color: '#d9d9d9' },
    { label: 'Primary Cortex',   y: 0.62, nodes: 8, color: '#bfbfbf' },
    { label: 'Sensory Input',    y: 0.85, nodes: 10, color: '#8c8c8c' },
  ];

  function drawPredictive() {
    const W = predCanvas.width, H = predCanvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background grid
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx < W; gx += 40) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }

    const layerData = LAYERS.map(layer => ({
      ...layer,
      positions: Array.from({ length: layer.nodes }, (_, i) => ({
        x: (W * 0.15) + (i / (layer.nodes - 1)) * (W * 0.7),
        y: layer.y * H
      }))
    }));

    // Draw connections between layers
    for (let l = 0; l < layerData.length - 1; l++) {
      const upper = layerData[l];
      const lower = layerData[l + 1];

      upper.positions.forEach((uNode, ui) => {
        lower.positions.forEach((lNode, li) => {
          // Top-down (prediction) - blue, goes downward
          if (Math.abs(ui * lower.positions.length - li * upper.positions.length) < lower.positions.length * 1.5) {
            const phase = t + ui * 0.4 + li * 0.2;
            const alpha = 0.12 + 0.06 * Math.sin(phase);
            ctx.beginPath();
            ctx.moveTo(uNode.x, uNode.y);
            ctx.lineTo(lNode.x, lNode.y);
            ctx.strokeStyle = `rgba(79,163,227,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // Animated signal particle top-down
            if (Math.sin(phase * 2) > 0.8) {
              const frac = (Math.sin(phase) * 0.5 + 0.5);
              const px = uNode.x + (lNode.x - uNode.x) * frac;
              const py = uNode.y + (lNode.y - uNode.y) * frac;
              ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 6; ctx.shadowColor = '#ffffff';
              ctx.fill(); ctx.shadowBlur = 0;
            }

            // Bottom-up error signal - teal, goes upward
            const errPhase = t * 1.3 + li * 0.5;
            if (Math.sin(errPhase) > 0.7) {
              const frac = 1 - (Math.sin(errPhase * 1.2) * 0.5 + 0.5);
              const ex = lNode.x + (uNode.x - lNode.x) * frac;
              const ey = lNode.y + (uNode.y - lNode.y) * frac;
              ctx.beginPath(); ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = '#d9d9d9';
              ctx.shadowBlur = 6; ctx.shadowColor = '#d9d9d9';
              ctx.fill(); ctx.shadowBlur = 0;
            }
          }
        });
      });
    }

    // Draw nodes per layer
    layerData.forEach((layer, li) => {
      // Layer label
      ctx.fillStyle = layer.color;
      ctx.font = '600 11px "JetBrains Mono"';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(layer.label, 6, layer.y * H);

      layer.positions.forEach((node, ni) => {
        const pulse = 1 + 0.15 * Math.sin(t * 1.5 + ni * 0.8 + li * 1.2);
        const r = (5 + li) * pulse;

        // Glow
        const grd = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3);
        grd.addColorStop(0, layer.color + '30');
        grd.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(node.x, node.y, r * 3, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();

        // Node
        ctx.beginPath(); ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = layer.color + '90';
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 1.5;
        ctx.fill(); ctx.stroke();
      });
    });

    // Label annotations
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '10px "JetBrains Mono"';
    ctx.textAlign = 'right';
    ctx.fillText('← Prediction', W - 10, H * 0.26);
    ctx.fillStyle = 'rgba(210,210,210,0.8)';
    ctx.fillText('Error Signal →', W - 10, H * 0.5);

    t += 0.02;
    requestAnimationFrame(drawPredictive);
  }

  window.addEventListener('resize', resizePred);
  resizePred();
  drawPredictive();
}

// ── PAGE HERO (DNA morph canvas) ─────────────────────────────
const researchCanvas = document.getElementById('researchCanvas');
const pageHero = document.querySelector('.page-hero');
const pageHeroContent = document.querySelector('.page-intro__content');

function clamp01(value) {
  return Math.min(Math.max(value, 0), 1);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function createShapeArray(count, builder) {
  const data = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const index = i * 3;
    const point = builder(i, count);
    data[index] = point[0];
    data[index + 1] = point[1];
    data[index + 2] = point[2];
  }
  return data;
}

function generateHelixPoint(i, count) {
  const strand = i % 2 === 0 ? 1 : -1;
  const phase = i / count * Math.PI * 18;
  const y = lerp(-2.3, 2.3, i / (count - 1));
  const radial = 0.75 + 0.15 * Math.sin(i * 0.17);
  return [
    Math.cos(phase) * radial + strand * 0.22,
    y,
    Math.sin(phase) * radial * strand,
  ];
}

if (researchCanvas && window.THREE) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.z = 4.7;

  const renderer = new THREE.WebGLRenderer({ canvas: researchCanvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  const particleCount = 15000;
  const geometry = new THREE.BufferGeometry();
  const position = new Float32Array(particleCount * 3);
  const shapeHelix = createShapeArray(particleCount, generateHelixPoint);
  // Start already in the DNA double-helix formation — no random/sphere "mess" state.
  position.set(shapeHelix);

  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));

  const colors = new Float32Array(particleCount * 3);
  const skyBlue = new THREE.Color(0x4FA3E3);
  const sage    = new THREE.Color(0x7FC29B);
  for (let i = 0; i < particleCount; i++) {
    const c = (i % 2 === 0) ? skyBlue : sage;
    colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
  }
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.045,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
    vertexColors: true,
  });

  const cloud = new THREE.Points(geometry, material);
  scene.add(cloud);

  // (Removed dynamic PDB loader — Research page now renders only the morphing particle cloud.)

  let rotationMultiplier = 1;
  let forcedProgress = null;
  let processingTimer = null;
  const clock = new THREE.Clock();

  function resizeResearch() {
    const width = researchCanvas.clientWidth || researchCanvas.offsetWidth || 1;
    const height = researchCanvas.clientHeight || researchCanvas.offsetHeight || 1;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  function getScrollProgress() {
    if (!pageHero) return 0;
    const maxScroll = Math.max(pageHero.offsetHeight - window.innerHeight, 1);
    return clamp01(window.scrollY / maxScroll);
  }

  function updateHeroOpacity(progress) {
    if (!pageHeroContent) return;
    const opacity = clamp01((progress - 0.08) / 0.22);
    pageHeroContent.style.opacity = String(opacity);
    pageHeroContent.style.transform = `translateY(${(1 - opacity) * 18}px)`;
  }

  function updateMorph(progress) {
    // The particle cloud stays in its DNA double-helix formation at all times —
    // scroll only gently tightens/loosens the strand radius, it never dissolves into noise.
    const tighten = 1 - 0.12 * progress;
    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      position[idx]     = shapeHelix[idx] * tighten;
      position[idx + 1] = shapeHelix[idx + 1];
      position[idx + 2] = shapeHelix[idx + 2] * tighten;
    }
    geometry.attributes.position.needsUpdate = true;
    updateHeroOpacity(progress);
  }

  function setProcessingState(isProcessing) {
    rotationMultiplier = isProcessing ? 10 : 1;
    material.opacity = isProcessing ? 0.98 : 0.88;
  }

  function setForcedProgress(progress) {
    forcedProgress = clamp01(progress);
  }

  function triggerFoldAnimation() {
    if (processingTimer) clearTimeout(processingTimer);
    setProcessingState(true);
    setForcedProgress(0.5);
    processingTimer = setTimeout(() => {
      setProcessingState(false);
      setForcedProgress(1);
    }, 3000);
  }

  window.researchProteinSystem = {
    triggerFoldAnimation,
    setProcessingState,
    setForcedProgress,
  };

  // Gene Explorer & Sequence Prediction Engine now live on neuroscience.html —
  // triggerFoldAnimation() above stays exposed on window in case another page wants to drive this visual.

  function getEffectiveProgress() {
    return forcedProgress === null ? getScrollProgress() : forcedProgress;
  }

  function animateResearch() {
    const elapsed = clock.getElapsedTime();
    const progress = getEffectiveProgress();
    updateMorph(progress);
    cloud.rotation.y += 0.002 * rotationMultiplier;
    cloud.rotation.x = Math.sin(elapsed * 0.18) * 0.14 + (rotationMultiplier - 1) * 0.02;
    cloud.rotation.z = Math.cos(elapsed * 0.11) * 0.05;
    // no external PDB group on the research page — keep only the morphing cloud
    resizeResearch();
    renderer.render(scene, camera);
    requestAnimationFrame(animateResearch);
  }

  window.addEventListener('resize', resizeResearch);
  window.addEventListener('scroll', () => {
    if (forcedProgress === null) {
      updateHeroOpacity(getScrollProgress());
    }
  }, { passive: true });

  resizeResearch();
  animateResearch();
}

// ── SHARED: CURSOR, NAV, REVEAL ──────────────────────────────
// (shared.js handles these)
