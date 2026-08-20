#!/usr/bin/env bash
# ============================================================
#  NEUROVERSE — DEPLOY.SH
#  Full automated deployment pipeline
#  Supports: GitHub Pages, Netlify, Vercel, manual FTP
# ============================================================
set -euo pipefail

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

log()     { echo -e "${CYAN}[NeuroVerse]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
warn()    { echo -e "${YELLOW}[!]${NC} $1"; }
error()   { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header()  { echo -e "\n${BOLD}${BLUE}══════════════════════════════════${NC}"; echo -e "${BOLD}${BLUE}  $1${NC}"; echo -e "${BOLD}${BLUE}══════════════════════════════════${NC}\n"; }

SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="${SITE_DIR}/dist"
REPO_URL="${REPO_URL:-}"
BRANCH="${BRANCH:-gh-pages}"
DEPLOY_TARGET="${DEPLOY_TARGET:-github}"
SITE_DOMAIN="${SITE_DOMAIN:-https://yourdomain.com}"

header "NeuroVerse Deployment Pipeline"
log "Site dir  : $SITE_DIR"
log "Build dir : $BUILD_DIR"
log "Target    : $DEPLOY_TARGET"

# ── STEP 1: PREFLIGHT ───────────────────────────────────────
header "Step 1 — Preflight Checks"
command -v git &>/dev/null && success "git $(git --version | awk '{print $3}')" || error "git not found"
command -v node &>/dev/null && success "Node $(node -v)" || warn "Node not found — skipping minification"

REQUIRED=(index.html philosophy.html research.html papers.html videos.html neuroscience.html cv.html
  css/main.css css/animations.css css/components.css css/philosophy.css css/research.css
  js/main.js js/shared.js js/philosophy.js js/research.js)

MISS=0
for f in "${REQUIRED[@]}"; do
  [ -f "${SITE_DIR}/${f}" ] && success "$f" || { warn "MISSING: $f"; MISS=$((MISS+1)); }
done
[ "$MISS" -gt 0 ] && error "$MISS files missing — aborting"

# ── STEP 2: BUILD ───────────────────────────────────────────
header "Step 2 — Build & Optimise"
mkdir -p "$BUILD_DIR"
rsync -av --exclude='.git' --exclude='dist' --exclude='node_modules' \
  --exclude='*.sh' --exclude='.DS_Store' "${SITE_DIR}/" "${BUILD_DIR}/"
success "Files synced to dist/"

# Minify if tools available
command -v html-minifier-terser &>/dev/null && {
  find "$BUILD_DIR" -name "*.html" | while read -r f; do
    html-minifier-terser --collapse-whitespace --remove-comments --minify-css true --minify-js true -o "$f" "$f"
    success "HTML minified: $(basename "$f")"
  done
} || warn "html-minifier-terser not found (npm i -g html-minifier-terser)"

command -v cleancss &>/dev/null && {
  find "$BUILD_DIR/css" -name "*.css" | while read -r f; do
    cleancss -o "$f" "$f" && success "CSS minified: $(basename "$f")"
  done
} || warn "cleancss not found (npm i -g clean-css-cli)"

command -v terser &>/dev/null && {
  find "$BUILD_DIR/js" -name "*.js" | while read -r f; do
    terser "$f" --compress --mangle -o "$f" && success "JS minified: $(basename "$f")"
  done
} || warn "terser not found (npm i -g terser)"

# Generate sitemap
TODAY=$(date +%Y-%m-%d)
cat > "${BUILD_DIR}/sitemap.xml" << SITEMAP
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_DOMAIN}/</loc><lastmod>${TODAY}</lastmod><priority>1.0</priority></url>
  <url><loc>${SITE_DOMAIN}/research.html</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE_DOMAIN}/papers.html</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE_DOMAIN}/videos.html</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>
  <url><loc>${SITE_DOMAIN}/neuroscience.html</loc><lastmod>${TODAY}</lastmod><priority>0.9</priority></url>
  <url><loc>${SITE_DOMAIN}/cv.html</loc><lastmod>${TODAY}</lastmod><priority>0.7</priority></url>
  <url><loc>${SITE_DOMAIN}/philosophy.html</loc><lastmod>${TODAY}</lastmod><priority>0.8</priority></url>
</urlset>
SITEMAP
success "sitemap.xml generated"

cat > "${BUILD_DIR}/robots.txt" << ROBOTS
User-agent: *
Allow: /
Sitemap: ${SITE_DOMAIN}/sitemap.xml
ROBOTS
success "robots.txt generated"

# 404 page
cat > "${BUILD_DIR}/404.html" << 'P404'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>404 — NeuroVerse</title>
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{background:#060810;color:#e8eaf6;font-family:'Syne',sans-serif;
      display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center}
    canvas{position:fixed;inset:0;pointer-events:none;opacity:.25}
    .c{position:relative;z-index:2}
    h1{font-size:clamp(6rem,20vw,16rem);font-weight:800;line-height:1;
      color:transparent;-webkit-text-stroke:1px #648cff;text-shadow:0 0 80px rgba(100,140,255,.3)}
    h2{font-size:clamp(1.5rem,4vw,2.5rem);margin-bottom:.5rem}
    p{font-family:'JetBrains Mono',monospace;font-size:.82rem;color:#9ba8c7;margin-bottom:2rem}
    a{padding:12px 28px;background:linear-gradient(135deg,#648cff,#a78bfa);color:#fff;
      border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:.78rem;
      text-decoration:none;letter-spacing:.06em}
  </style>
</head>
<body>
  <canvas id="cv"></canvas>
  <div class="c">
    <h1>404</h1>
    <h2>Neuron Not Found</h2>
    <p>The synapse you're looking for was pruned during development.</p>
    <a href="/">Return to NeuroVerse →</a>
  </div>
  <script>
    const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
    let nodes=[],t=0;
    function init(){cv.width=innerWidth;cv.height=innerHeight;
      nodes=Array.from({length:60},()=>({x:Math.random()*cv.width,y:Math.random()*cv.height,
      vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4}));}
    function draw(){ctx.clearRect(0,0,cv.width,cv.height);
      nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;
        if(n.x<0||n.x>cv.width)n.vx*=-1;if(n.y<0||n.y>cv.height)n.vy*=-1;
        ctx.beginPath();ctx.arc(n.x,n.y,2,0,Math.PI*2);ctx.fillStyle='#648cff';ctx.fill();});
      nodes.forEach((a,i)=>nodes.slice(i+1).forEach(b=>{
        const d=Math.hypot(a.x-b.x,a.y-b.y);
        if(d<120){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle='rgba(100,140,255,'+(1-d/120)*.25+')';ctx.stroke();}}));
      requestAnimationFrame(draw);}
    window.addEventListener('resize',init);init();draw();
  </script>
</body>
</html>
P404
success "404.html generated"

# ── STEP 3: DEPLOY ──────────────────────────────────────────
header "Step 3 — Deploy to ${DEPLOY_TARGET}"

case "$DEPLOY_TARGET" in
  github)
    [ -z "$REPO_URL" ] && {
      REPO_URL=$(git -C "$SITE_DIR" remote get-url origin 2>/dev/null || echo "")
      [ -z "$REPO_URL" ] && { printf "GitHub repo URL: "; read -r REPO_URL; }
    }
    TMPD=$(mktemp -d)
    cp -r "${BUILD_DIR}/." "$TMPD/"
    cd "$TMPD"
    git init; git checkout -b "$BRANCH"
    git add -A
    git commit -m "Deploy NeuroVerse $(date '+%Y-%m-%d %H:%M')"
    git remote add origin "$REPO_URL"
    git push -f origin "$BRANCH"
    rm -rf "$TMPD"; cd "$SITE_DIR"
    success "Deployed to GitHub Pages!"
    ;;
  netlify)
    command -v netlify &>/dev/null || error "netlify CLI not found: npm i -g netlify-cli"
    cat > "${BUILD_DIR}/netlify.toml" << 'NTL'
[build]
  publish = "."
[[redirects]]
  from = "/*"
  to = "/404.html"
  status = 404
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    Cache-Control = "public, max-age=3600"
NTL
    netlify deploy --prod --dir="$BUILD_DIR"
    success "Deployed to Netlify!"
    ;;
  vercel)
    command -v vercel &>/dev/null || error "vercel CLI not found: npm i -g vercel"
    cat > "${BUILD_DIR}/vercel.json" << 'VCL'
{"version":2,"routes":[{"handle":"filesystem"},{"src":"/(.*)","dest":"/404.html","status":404}]}
VCL
    cd "$BUILD_DIR"; vercel --prod; cd "$SITE_DIR"
    success "Deployed to Vercel!"
    ;;
  ftp)
    command -v lftp &>/dev/null || error "lftp not found: sudo apt install lftp"
    printf "FTP Host: "; read -r FTP_HOST
    printf "FTP User: "; read -r FTP_USER
    printf "FTP Pass: "; read -rs FTP_PASS; echo
    printf "Remote path (e.g. /public_html): "; read -r FTP_PATH
    lftp -c "open -u $FTP_USER,$FTP_PASS $FTP_HOST; mirror -R --delete --verbose $BUILD_DIR $FTP_PATH; bye"
    success "Deployed via FTP!"
    ;;
  *)
    error "Unknown target: $DEPLOY_TARGET. Use: github | netlify | vercel | ftp"
    ;;
esac

# ── SUMMARY ─────────────────────────────────────────────────
header "Deployment Complete"
success "Target  : $DEPLOY_TARGET"
success "Files   : $(find "$BUILD_DIR" -type f | wc -l | tr -d ' ')"
success "Size    : $(du -sh "$BUILD_DIR" | cut -f1)"
log "NeuroVerse is live! 🧠"
