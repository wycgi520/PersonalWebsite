import { COALS, FH, FW, FX, FY, RCY, RX, RY, STICKS, STONES, TAU, type Stick, type Stone } from './geometry';

type Ctx = CanvasRenderingContext2D;

const rgb = (c: number[], k = 1) => `rgb(${(c[0] * k) | 0},${(c[1] * k) | 0},${(c[2] * k) | 0})`;

function stonePath(x: Ctx, s: Stone) {
  x.beginPath();
  const n = s.pts.length;
  const P = s.pts.map((m, i) => {
    const t = (i / n) * TAU;
    let py = Math.sin(t) * s.h * m;
    if (py > 0) py *= 0.72; // 底部压平，像放在地上
    return [Math.cos(t) * s.w * m, py];
  });
  for (let i = 0; i <= n; i++) {
    const p = P[i % n], q = P[(i + 1) % n];
    const mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
    if (i === 0) x.moveTo(mx, my);
    else x.quadraticCurveTo(p[0], p[1], mx, my);
  }
  x.closePath();
}

function drawStone(x: Ctx, s: Stone, light: boolean, lit: boolean) {
  x.save();
  x.translate(s.x, s.y);
  x.rotate(s.rot);
  stonePath(x, s);
  const base = light ? [150, 146, 140] : [92, 90, 88];
  if (!lit) {
    const g = x.createLinearGradient(0, -s.h, 0, s.h);
    g.addColorStop(0, rgb(base, s.tone * 1.25));
    g.addColorStop(0.55, rgb(base, s.tone * 0.8));
    g.addColorStop(1, rgb(base, s.tone * 0.42));
    x.fillStyle = g;
    x.fill();
    x.strokeStyle = 'rgba(0,0,0,.35)';
    x.lineWidth = 1;
    x.stroke();
    if (s.moss) {
      x.save();
      stonePath(x, s);
      x.clip();
      x.fillStyle = light ? 'rgba(98,120,70,.4)' : 'rgba(60,82,48,.5)';
      x.beginPath();
      x.ellipse(s.w * 0.3, s.h * 0.45, s.w * 0.7, s.h * 0.5, 0, 0, TAU);
      x.fill();
      x.restore();
    }
  } else {
    // 朝火的一面被照亮：方向向量转到石头的局部坐标
    const dx = FX - s.x, dy = FY - 20 - s.y, len = Math.hypot(dx, dy) || 1;
    const c = Math.cos(-s.rot), sn = Math.sin(-s.rot);
    const ux = (dx * c - dy * sn) / len, uy = (dx * sn + dy * c) / len;
    const g = x.createLinearGradient(-ux * s.w, -uy * s.h, ux * s.w, uy * s.h);
    const near = 0.55 + 0.45 * Math.max(Math.sin(s.a), 0); // 前排离观者近，看得到更多亮面
    g.addColorStop(0, 'rgba(255,140,50,0)');
    g.addColorStop(0.6, `rgba(255,150,60,${0.35 * near})`);
    g.addColorStop(1, `rgba(255,196,120,${0.85 * near})`);
    x.fillStyle = g;
    x.fill();
  }
  x.restore();
}

function drawLog(x: Ctx, s: Stick, light: boolean, lit: boolean) {
  const dx = s.x2 - s.x1, dy = s.y2 - s.y1, len = Math.hypot(dx, dy);
  x.save();
  x.translate(s.x1, s.y1);
  x.rotate(Math.atan2(dy, dx));
  const w0 = s.w / 2, w1 = s.w * 0.38;
  const body = () => {
    x.beginPath();
    x.moveTo(0, -w0);
    x.lineTo(len, -w1);
    x.ellipse(len, 0, w1 * 0.45, w1, 0, -Math.PI / 2, Math.PI / 2);
    x.lineTo(0, w0);
    x.ellipse(0, 0, w0 * 0.45, w0, 0, Math.PI / 2, Math.PI * 1.5);
    x.closePath();
  };
  body();
  if (!lit) {
    const g = x.createLinearGradient(0, -w0, 0, w0);
    if (s.split) {
      // 劈开的柴：一侧浅色木芯
      g.addColorStop(0, light ? '#E6C79A' : '#C9A274');
      g.addColorStop(0.45, light ? '#C79C68' : '#9C754C');
      g.addColorStop(0.5, light ? '#6E4C2E' : '#4A3220');
      g.addColorStop(1, light ? '#3E2A1A' : '#22170F');
    } else {
      g.addColorStop(0, light ? '#9A7650' : '#7E5D3E');
      g.addColorStop(0.5, light ? '#6A4A32' : '#523A27');
      g.addColorStop(1, light ? '#2E2016' : '#1A120C');
    }
    x.fillStyle = g;
    x.fill();
    // 树皮纹理
    x.strokeStyle = 'rgba(0,0,0,.28)';
    x.lineWidth = 0.8;
    for (let k = -1; k <= 1; k++) {
      x.beginPath();
      x.moveTo(len * 0.05, k * w0 * 0.45);
      x.lineTo(len * 0.85, k * w1 * 0.45);
      x.stroke();
    }
    // 靠火的一端烧黑
    const ch = x.createLinearGradient(len * 0.45, 0, len, 0);
    ch.addColorStop(0, 'rgba(15,8,4,0)');
    ch.addColorStop(1, 'rgba(15,8,4,.92)');
    body();
    x.fillStyle = ch;
    x.fill();
    // 根部截面
    x.fillStyle = s.split ? (light ? '#E9CFA4' : '#B98F60') : light ? '#C9A57A' : '#8E6A46';
    x.beginPath();
    x.ellipse(0, 0, w0 * 0.45, w0 * 0.9, 0, 0, TAU);
    x.fill();
    x.strokeStyle = 'rgba(60,35,18,.6)';
    x.lineWidth = 0.7;
    x.beginPath();
    x.ellipse(0, 0, w0 * 0.22, w0 * 0.45, 0, 0, TAU);
    x.stroke();
  } else {
    // 朝上的一侧受光 + 烧红的炭头
    const g = x.createLinearGradient(0, -w0, 0, w0);
    g.addColorStop(0, 'rgba(255,190,110,.7)');
    g.addColorStop(0.5, 'rgba(255,140,60,.3)');
    g.addColorStop(1, 'rgba(255,90,20,0)');
    x.fillStyle = g;
    x.fill();
    const e = x.createLinearGradient(len * 0.55, 0, len, 0);
    e.addColorStop(0, 'rgba(255,80,20,0)');
    e.addColorStop(0.75, 'rgba(255,90,25,.6)');
    e.addColorStop(1, 'rgba(255,170,80,.85)');
    body();
    x.fillStyle = e;
    x.fill();
  }
  x.restore();
}

/** 静态层：火焰后/前 × 未受光/受光，每帧按火光强度混合受光层 */
export interface FireLayers {
  backD: HTMLCanvasElement;
  backL: HTMLCanvasElement;
  frontD: HTMLCanvasElement;
  frontL: HTMLCanvasElement;
}

export function createLayers(dpr: number): FireLayers {
  const mk = () => {
    const c = document.createElement('canvas');
    c.width = FW * dpr;
    c.height = FH * dpr;
    return c;
  };
  return { backD: mk(), backL: mk(), frontD: mk(), frontL: mk() };
}

/** 按主题重绘静态层（石圈、柴堆、炭床），主题切换时调用一次 */
export function paintLayers(layers: FireLayers, dpr: number, light: boolean) {
  const ctx = (c: HTMLCanvasElement) => {
    const x = c.getContext('2d')!;
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, FW, FH);
    return x;
  };
  const L = { backD: ctx(layers.backD), backL: ctx(layers.backL), frontD: ctx(layers.frontD), frontL: ctx(layers.frontL) };

  for (const lit of [false, true]) {
    const b = lit ? L.backL : L.backD, f = lit ? L.frontL : L.frontD;
    // 地面：石圈投影 + 圈内的焦土
    if (!lit) {
      b.fillStyle = light ? 'rgba(60,40,25,.12)' : 'rgba(0,0,0,.28)';
      b.beginPath();
      b.ellipse(FX, RCY + 6, RX + 22, RY + 10, 0, 0, TAU);
      b.fill();
      const pit = b.createRadialGradient(FX, RCY - 4, 10, FX, RCY, RX);
      pit.addColorStop(0, light ? '#5A3420' : '#3A1E12');
      pit.addColorStop(1, light ? '#7A5A44' : '#24160F');
      b.fillStyle = pit;
      b.beginPath();
      b.ellipse(FX, RCY, RX - 6, RY - 4, 0, 0, TAU);
      b.fill();
    } else {
      const pit = b.createRadialGradient(FX, FY + 10, 6, FX, FY + 10, RX * 0.8);
      pit.addColorStop(0, 'rgba(255,110,30,.95)');
      pit.addColorStop(0.3, 'rgba(200,70,20,.45)');
      pit.addColorStop(1, 'rgba(150,50,15,0)');
      b.fillStyle = pit;
      b.beginPath();
      b.ellipse(FX, RCY, RX - 6, RY - 4, 0, 0, TAU);
      b.fill();
    }
    for (const s of STONES) if (Math.sin(s.a) <= 0.25) drawStone(b, s, light, lit);
    for (const c of COALS) {
      b.fillStyle = lit ? `rgba(255,${(90 + c.hot * 110) | 0},30,${c.hot})` : light ? '#2C1A10' : '#160D08';
      b.beginPath();
      b.ellipse(c.x, c.y, c.r, c.r * 0.6, 0, 0, TAU);
      b.fill();
    }
    // 朝向观者的柴挡在火焰前面，火从柴缝里窜出来
    for (const s of STICKS) drawLog(s.depth > 0.3 ? f : b, s, light, lit);
    for (const s of STONES) if (Math.sin(s.a) > 0.25) drawStone(f, s, light, lit);
  }
}
