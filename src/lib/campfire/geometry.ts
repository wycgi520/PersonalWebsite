// 篝火画布的逻辑坐标（与原型一致），实际像素按 DPR 放大
export const FW = 620;
export const FH = 480;
export const FX = 310; // 火焰中心
export const FY = 368; // 火焰根部
export const RX = 158; // 石圈椭圆
export const RY = 46;
export const RCY = 384;
export const TAU = Math.PI * 2;

/** 固定种子的伪随机数：暗/亮两套静态层的形状必须完全一致 */
export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Stone {
  x: number;
  y: number;
  a: number; // 在石圈上的角度，sin(a) 越大越靠近观者
  w: number;
  h: number;
  rot: number;
  tone: number;
  moss: boolean;
  pts: number[]; // 轮廓的不规则半径系数
}

export const STONES: Stone[] = (() => {
  const r = rng(7), out: Stone[] = [], N = 19;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU + (r() - 0.5) * 0.12;
    const front = Math.sin(a); // 1 = 最靠前
    const sc = 0.78 + front * 0.2;
    out.push({
      x: FX + Math.cos(a) * RX,
      y: RCY + Math.sin(a) * RY,
      a,
      w: (24 + r() * 8) * sc * (0.62 + 0.38 * Math.abs(front)), // 侧面的石头被透视压窄
      h: (14 + r() * 5) * sc,
      rot: -Math.cos(a) * Math.sin(a) * 0.5 + (r() - 0.5) * 0.2,
      tone: 0.82 + r() * 0.3,
      moss: r() < 0.2,
      pts: Array.from({ length: 9 }, () => 0.86 + r() * 0.2),
    });
  }
  return out.sort((p, q) => p.y - q.y);
})();

export interface Stick {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  split: boolean; // 劈开的柴，一侧露出木芯
  depth: number; // > 0.3 的画在火焰前面
}

export const STICKS: Stick[] = (() => {
  const r = rng(23), out: Stick[] = [], N = 9;
  const apexX = FX + 4, apexY = FY - 96;
  for (let i = 0; i < N; i++) {
    const a = (i / N) * TAU + 0.3 + (r() - 0.5) * 0.3;
    const bx = FX + Math.cos(a) * (58 + r() * 12), by = FY + 6 + Math.sin(a) * 18;
    const k = 1.03 + r() * 0.14; // 越过顶点交叉出去
    out.push({
      x1: bx,
      y1: by,
      x2: bx + (apexX + (r() - 0.5) * 22 - bx) * k,
      y2: by + (apexY + (r() - 0.5) * 14 - by) * k,
      w: 9 + r() * 4,
      split: r() < 0.55,
      depth: Math.sin(a),
    });
  }
  // 两根平躺、伸向中心的粗柴
  out.push({ x1: FX - 104, y1: FY + 22, x2: FX - 14, y2: FY + 2, w: 15, split: false, depth: 1.2 });
  out.push({ x1: FX + 106, y1: FY + 20, x2: FX + 16, y2: FY + 4, w: 14, split: true, depth: 1.25 });
  return out.sort((p, q) => p.depth - q.depth);
})();

export interface Coal {
  x: number;
  y: number;
  r: number;
  hot: number; // 越靠中心越红
}

export const COALS: Coal[] = (() => {
  const r = rng(91), out: Coal[] = [];
  for (let i = 0; i < 46; i++) {
    const a = r() * TAU, d = Math.sqrt(r());
    out.push({ x: FX + Math.cos(a) * 80 * d, y: FY + 12 + Math.sin(a) * 20 * d, r: 2 + r() * 4.5, hot: 1 - d * 0.8 });
  }
  return out;
})();

export interface Tongue {
  off: number; // 相对火焰中心的水平偏移
  h: number;
  w: number;
  ph: number;
  sp: number;
}

/** 火舌三层：外红 → 橙 → 内芯，中间高两边矮 */
export const TONGUE_LAYERS: Tongue[][] = (() => {
  const r = rng(5);
  const make = (n: number, spread: number, hMin: number, hMax: number, wMin: number, wMax: number) =>
    Array.from({ length: n }, (_, i) => {
      const u = n === 1 ? 0 : (i / (n - 1)) * 2 - 1; // -1..1
      const off = u * spread + (r() - 0.5) * 10;
      const center = 1 - Math.abs(u) * 0.5;
      return { off, h: (hMin + r() * (hMax - hMin)) * center, w: wMin + r() * (wMax - wMin), ph: r() * TAU, sp: 0.8 + r() * 0.9 };
    });
  return [make(8, 54, 150, 225, 44, 60), make(6, 38, 115, 175, 32, 42), make(4, 20, 70, 110, 22, 30)];
})();
