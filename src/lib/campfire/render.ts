import { FH, FW, FX, FY, RCY, TAU, TONGUE_LAYERS, type Tongue } from './geometry';
import type { FireLayers } from './staticLayers';

type Ctx = CanvasRenderingContext2D;

/** 每帧由 hook 更新的火焰状态 */
export interface FireState {
  t: number; // 火焰自己的时钟（秒）
  lean: number; // 倾斜量，弹簧跟随鼠标
  vigor: number; // 火势，点击时增强，随后慢慢回落到 1
  flick: number; // 亮度闪烁
}

interface Lick { x: number; y: number; vy: number; s: number; life: number; d: number }
interface Spark { x: number; y: number; vx: number; vy: number; life: number; d: number; s: number; ph: number }
interface Smoke { x: number; y: number; vx: number; vy: number; r: number; life: number; d: number }

export interface Particles {
  licks: Lick[]; // 脱离火舌的焰片
  sparks: Spark[];
  smoke: Smoke[];
}

export const createParticles = (): Particles => ({ licks: [], sparks: [], smoke: [] });

export function spawnSpark(p: Particles, burst: boolean) {
  p.sparks.push({
    x: FX + (Math.random() - 0.5) * 70,
    y: FY - 30 - Math.random() * 60,
    vx: (Math.random() - 0.5) * (burst ? 3 : 1.2),
    vy: -(1.4 + Math.random() * 2.2) * (burst ? 1.6 : 1),
    life: 1,
    d: 0.006 + Math.random() * 0.01,
    s: 0.8 + Math.random() * 1.5,
    ph: Math.random() * TAU,
  });
}

/**
 * 按时间、密度随机生成新粒子；静止模式（减少动态效果）下不调用。
 * density < 1 时按比例少生成（低帧率降级用）
 */
export function spawnParticles(p: Particles, f: FireState, density = 1) {
  if (density < 1 && Math.random() > density) return;
  if (Math.random() < 0.12 * f.vigor) {
    p.licks.push({
      x: FX + (Math.random() - 0.5) * 60,
      y: FY - 70 - Math.random() * 50 * f.vigor,
      vy: -1.6 - Math.random() * 1.4,
      s: 6 + Math.random() * 8,
      life: 1,
      d: 0.04 + Math.random() * 0.03,
    });
  }
  if (Math.random() < 0.08) {
    p.smoke.push({
      x: FX + (Math.random() - 0.5) * 30,
      y: FY - 140 * (0.7 + f.vigor * 0.3),
      vx: (Math.random() - 0.5) * 0.3,
      vy: -0.5 - Math.random() * 0.4,
      r: 10,
      life: 1,
      d: 0.006 + Math.random() * 0.004,
    });
  }
  if (Math.random() < 0.35 * f.vigor) spawnSpark(p, false);
}

const TCOL = [
  [[255, 70, 20], [255, 120, 30]],
  [[255, 140, 30], [255, 190, 60]],
  [[255, 220, 120], [255, 250, 220]],
];

function tongue(x: Ctx, t: Tongue, layer: number, f: FireState, light: boolean) {
  // 高度是几个不同频率的正弦叠加，偶尔"窜"一下
  const n =
    Math.sin(f.t * 2.1 * t.sp + t.ph) * 0.5 +
    Math.sin(f.t * 5.3 * t.sp + t.ph * 1.7) * 0.28 +
    Math.max(Math.sin(f.t * 1.3 + t.ph * 3), 0) ** 6 * 0.6;
  const vg = 0.6 + f.vigor * 0.4;
  const h = t.h * (0.82 + n * 0.26) * vg * (layer === 2 ? 1 : 1 + (f.vigor - 1) * 0.25);
  const w = t.w * (0.9 + f.vigor * 0.12);
  const bx = FX + t.off * (0.9 + f.vigor * 0.1), by = FY + 4;
  const sway = f.lean * 0.5;

  const N = 14, pts: [number, number, number][] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N; // 0 根部 → 1 尖端
    const wob = Math.sin(f.t * 6 * t.sp - s * 5 + t.ph) * 6 * s * s;
    // 根部圆、尖端收成尖角
    const half = w * 0.5 * Math.pow(1 - s, 1.5) * (0.55 + 0.45 * Math.sqrt(Math.min(s * 2.5, 1)));
    pts.push([bx + sway * h * s * s + wob, by - h * s, half]);
  }
  x.beginPath();
  pts.forEach(([cx, cy, hw], i) => (i ? x.lineTo(cx - hw, cy) : x.moveTo(cx - hw, cy)));
  for (let i = N; i >= 0; i--) x.lineTo(pts[i][0] + pts[i][2], pts[i][1]);
  x.closePath();

  const [c0, c1] = TCOL[layer];
  const g = x.createLinearGradient(0, by, 0, by - h);
  const a = light ? 1.15 : 1;
  g.addColorStop(0, `rgba(${c1},${0.35 * a})`);
  g.addColorStop(0.18, `rgba(${c1},${0.85 * a})`);
  g.addColorStop(0.6, `rgba(${c0},${0.6 * a})`);
  g.addColorStop(1, `rgba(${c0},0)`);
  x.fillStyle = g;
  x.fill();
}

function tongues(x: Ctx, from: number, f: FireState, light: boolean) {
  for (let T = from; T < 3; T++) for (const t of TONGUE_LAYERS[T]) tongue(x, t, T, f, light);
}

/**
 * 画一帧。k 为相对 60fps 的时间步长系数，用于推进粒子；k = 0 时粒子不动。
 * 返回火光强度（0–1），由调用方同步给 CSS 光晕。
 */
export function renderFire(x: Ctx, L: FireLayers, P: Particles, f: FireState, light: boolean, k: number) {
  const glow = Math.min(Math.max(f.flick * (0.55 + f.vigor * 0.32), 0), 1);
  const add: GlobalCompositeOperation = light ? 'source-over' : 'lighter';

  x.clearRect(0, 0, FW, FH);
  // 1. 地面上扩散的暖光（画布内只做近处，远处由 CSS 光晕接力）
  x.save();
  x.translate(FX, RCY);
  x.scale(1, 0.32); // 压扁成椭圆渐变，边缘自然淡出
  const gr = x.createRadialGradient(0, 0, 10, 0, 0, 300);
  gr.addColorStop(0, `rgba(255,150,60,${(light ? 0.22 : 0.3) * glow})`);
  gr.addColorStop(0.5, `rgba(255,130,50,${(light ? 0.08 : 0.1) * glow})`);
  gr.addColorStop(1, 'rgba(255,120,40,0)');
  x.fillStyle = gr;
  x.fillRect(-310, -300, 620, 600);
  x.restore();

  // 2. 后排：石头 / 炭 / 柴
  x.drawImage(L.backD, 0, 0, FW, FH);
  x.globalAlpha = glow;
  x.drawImage(L.backL, 0, 0, FW, FH);
  x.globalAlpha = 1;

  // 3. 火舌 + 焰片 + 焰心辉光
  x.globalCompositeOperation = add;
  tongues(x, 0, f, light);
  for (const p of P.licks) {
    p.x += f.lean * 0.9 * k;
    p.y += p.vy * k;
    p.life -= p.d * k;
    const a = Math.max(p.life, 0), s = p.s * a;
    x.fillStyle = `rgba(255,${(130 + a * 80) | 0},40,${a * 0.7})`;
    x.beginPath();
    x.moveTo(p.x, p.y - s * 1.8);
    x.quadraticCurveTo(p.x + s * 0.7, p.y, p.x, p.y + s * 0.6);
    x.quadraticCurveTo(p.x - s * 0.7, p.y, p.x, p.y - s * 1.8);
    x.fill();
  }
  const cx = FX + f.lean * 8, cy = FY - 34;
  const cg = x.createRadialGradient(cx, cy, 2, cx, cy, 80 * (0.8 + f.vigor * 0.25));
  cg.addColorStop(0, `rgba(255,236,190,${0.5 * glow})`);
  cg.addColorStop(1, 'rgba(255,150,50,0)');
  x.fillStyle = cg;
  x.beginPath();
  x.arc(cx, cy, 100, 0, TAU);
  x.fill();
  x.globalCompositeOperation = 'source-over';

  // 4. 前排柴与石头，再让一部分火舌半透明地叠回柴前，看起来从柴缝里窜出
  x.drawImage(L.frontD, 0, 0, FW, FH);
  x.globalAlpha = glow;
  x.drawImage(L.frontL, 0, 0, FW, FH);
  x.globalCompositeOperation = add;
  x.globalAlpha = 0.5;
  tongues(x, 1, f, light);
  x.globalAlpha = 1;
  x.globalCompositeOperation = 'source-over';

  // 5. 烟
  for (const p of P.smoke) {
    p.x += (p.vx + f.lean * 0.25) * k;
    p.y += p.vy * k;
    p.r += 0.35 * k;
    p.life -= p.d * k;
    const a = Math.max(p.life, 0) * (light ? 0.1 : 0.07);
    const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
    g.addColorStop(0, light ? `rgba(110,105,100,${a})` : `rgba(200,200,205,${a})`);
    g.addColorStop(1, 'rgba(160,160,160,0)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(p.x, p.y, p.r, 0, TAU);
    x.fill();
  }

  // 6. 火星：带短拖尾，左右飘
  x.globalCompositeOperation = add;
  x.lineCap = 'round';
  for (const p of P.sparks) {
    const ox = p.x, oy = p.y;
    p.vx += (f.lean * 0.03 + Math.sin(f.t * 3 + p.ph) * 0.04) * k;
    p.vy -= 0.01 * k;
    p.x += p.vx * k;
    p.y += p.vy * k;
    p.life -= p.d * k;
    const a = Math.max(p.life, 0);
    x.strokeStyle = `rgba(255,${(170 + a * 70) | 0},${(80 + a * 80) | 0},${a})`;
    x.lineWidth = p.s * (0.5 + a * 0.5);
    x.beginPath();
    x.moveTo(ox - p.vx * 2, oy - p.vy * 2);
    x.lineTo(p.x, p.y);
    x.stroke();
  }
  x.globalCompositeOperation = 'source-over';

  P.licks = P.licks.filter((p) => p.life > 0);
  P.sparks = P.sparks.filter((p) => p.life > 0 && p.y > -10);
  P.smoke = P.smoke.filter((p) => p.life > 0);
  return glow;
}
