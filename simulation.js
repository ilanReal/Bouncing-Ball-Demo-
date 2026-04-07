/**
 * Bouncing Ball Simulation
 * ─────────────────────────────────────────────────────────────
 * A 2D physics simulation featuring:
 *  - Gravity, friction, and restitution (bounce) controls
 *  - Ball-to-ball elastic collision detection & resolution
 *  - Click-to-spawn balls on the canvas
 *  - Explode, pause, and reset controls
 */

const canvas = document.getElementById('canvas');
const ctx    = canvas.getContext('2d');

let W, H, dpr;
let balls      = [];
let paused     = false;
let gravityOn  = true;
let collisions = 0;

// ── Palette ────────────────────────────────────────────────────
const COLORS = [
  '#7F77DD', '#1D9E75', '#D85A30',
  '#378ADD', '#D4537E', '#639922',
  '#BA7517', '#E24B4A', '#0F6E56', '#533AB7',
];

// ── Canvas sizing ──────────────────────────────────────────────
function resize() {
  dpr          = window.devicePixelRatio || 1;
  const rect   = canvas.getBoundingClientRect();
  W            = canvas.width  = rect.width  * dpr;
  H            = canvas.height = rect.height * dpr;
}

// ── Ball factory ───────────────────────────────────────────────
function createBall(x, y, color) {
  const r  = (20 + Math.random() * 20) * dpr;
  const bx = x !== undefined ? x : r + Math.random() * (W - 2 * r);
  const by = y !== undefined ? y : r + Math.random() * (H * 0.4);
  return {
    x:     bx,
    y:     by,
    vx:    (Math.random() - 0.5) * 12 * dpr,
    vy:    (Math.random() - 0.5) *  6 * dpr,
    r,
    color: color || COLORS[Math.floor(Math.random() * COLORS.length)],
    mass:  r * r,
  };
}

function initBalls(n) {
  balls      = [];
  collisions = 0;
  for (let i = 0; i < n; i++) {
    balls.push(createBall(undefined, undefined, COLORS[i % COLORS.length]));
  }
}

// ── Physics helpers ────────────────────────────────────────────
function resolveCollision(a, b) {
  const dx   = b.x - a.x;
  const dy   = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist === 0) return;

  const nx      = dx / dist;
  const ny      = dy / dist;
  const overlap = a.r + b.r - dist;

  // Positional correction (push apart)
  const total = a.mass + b.mass;
  a.x -= nx * overlap * (b.mass / total);
  a.y -= ny * overlap * (b.mass / total);
  b.x += nx * overlap * (a.mass / total);
  b.y += ny * overlap * (a.mass / total);

  // Velocity exchange
  const dvx = a.vx - b.vx;
  const dvy = a.vy - b.vy;
  const dot = dvx * nx + dvy * ny;
  if (dot > 0) return; // already separating

  const e = getRestitution();
  const j = -(1 + e) * dot / (1 / a.mass + 1 / b.mass);

  a.vx += (j / a.mass) * nx;
  a.vy += (j / a.mass) * ny;
  b.vx -= (j / b.mass) * nx;
  b.vy -= (j / b.mass) * ny;

  collisions++;
}

// ── Control getters ────────────────────────────────────────────
const $ = id => document.getElementById(id);

function getGravity()     { return parseFloat($('gravity').value)     * 0.5; }
function getRestitution() { return parseFloat($('restitution').value);        }
function getFriction()    { return parseFloat($('friction').value);           }

// ── Update ─────────────────────────────────────────────────────
function update() {
  const g       = gravityOn ? getGravity() * dpr : 0;
  const friction = getFriction();
  const e       = getRestitution();

  for (const b of balls) {
    b.vy += g;
    b.vx *= friction;
    b.vy *= friction;
    b.x  += b.vx;
    b.y  += b.vy;

    // Wall collisions
    if (b.x - b.r < 0)  { b.x = b.r;      b.vx =  Math.abs(b.vx) * e; }
    if (b.x + b.r > W)  { b.x = W - b.r;  b.vx = -Math.abs(b.vx) * e; }
    if (b.y - b.r < 0)  { b.y = b.r;      b.vy =  Math.abs(b.vy) * e; }
    if (b.y + b.r > H)  {
      b.y  = H - b.r;
      b.vy = -Math.abs(b.vy) * e;
      collisions++;
    }
  }

  // Ball-to-ball collisions (O(n²) — fine for ≤20 balls)
  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a  = balls[i], b = balls[j];
      const dx = b.x - a.x, dy = b.y - a.y;
      if (dx * dx + dy * dy < (a.r + b.r) ** 2) {
        resolveCollision(a, b);
      }
    }
  }
}

// ── Draw ───────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);

  for (const b of balls) {
    // Fill
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = b.color + '20';
    ctx.fill();

    // Stroke
    ctx.strokeStyle = b.color;
    ctx.lineWidth   = 2.5 * dpr;
    ctx.stroke();

    // Specular highlight
    ctx.beginPath();
    ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();
  }
}

// ── Stats ──────────────────────────────────────────────────────
function updateStats() {
  $('stat-balls').textContent = balls.length;

  const avgSpeed = balls.length
    ? (balls.reduce((s, b) => s + Math.sqrt(b.vx ** 2 + b.vy ** 2) / dpr, 0) / balls.length).toFixed(1)
    : '0.0';

  $('stat-speed').textContent = avgSpeed;
  $('stat-coll').textContent  = collisions;
}

// ── Main loop ──────────────────────────────────────────────────
function loop() {
  if (!paused) { update(); draw(); updateStats(); }
  requestAnimationFrame(loop);
}

// ── UI wiring ──────────────────────────────────────────────────
$('gravity').addEventListener('input', function () {
  $('gravity-val').textContent = parseFloat(this.value).toFixed(1);
});

$('restitution').addEventListener('input', function () {
  $('res-val').textContent = parseFloat(this.value).toFixed(2);
});

$('friction').addEventListener('input', function () {
  $('fric-val').textContent = parseFloat(this.value).toFixed(3);
});

$('count').addEventListener('input', function () {
  $('count-val').textContent = this.value;
});

$('btn-add').addEventListener('click', () => {
  balls.push(createBall());
});

$('btn-clear').addEventListener('click', () => {
  balls      = [];
  collisions = 0;
});

$('btn-reset').addEventListener('click', () => {
  initBalls(parseInt($('count').value, 10));
});

$('btn-pause').addEventListener('click', function () {
  paused          = !paused;
  this.textContent = paused ? 'Resume' : 'Pause';
});

$('btn-gravity').addEventListener('click', function () {
  gravityOn        = !gravityOn;
  this.textContent = gravityOn ? 'Gravity: on' : 'Gravity: off';
});

$('btn-explode').addEventListener('click', () => {
  const cx = W / 2, cy = H / 2;
  for (const b of balls) {
    const dx = b.x - cx, dy = b.y - cy;
    const d  = Math.sqrt(dx * dx + dy * dy) || 1;
    b.vx += (dx / d) * 30 * dpr;
    b.vy += (dy / d) * 30 * dpr;
  }
});

// Click canvas → spawn ball
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const x    = (e.clientX - rect.left)  * dpr;
  const y    = (e.clientY - rect.top)   * dpr;
  const r    = (20 + Math.random() * 20) * dpr;
  balls.push({
    x, y,
    vx:    (Math.random() - 0.5) * 10 * dpr,
    vy:    -8 * dpr,
    r,
    color: COLORS[balls.length % COLORS.length],
    mass:  r * r,
  });
});

// Handle window resize
window.addEventListener('resize', () => {
  resize();
});

// ── Boot ───────────────────────────────────────────────────────
resize();
initBalls(parseInt($('count').value, 10));
loop();
