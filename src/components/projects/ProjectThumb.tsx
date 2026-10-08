import { seededRandom } from '@/lib/utils';

const W = 320;
const H = 180;

interface Shape {
  dots: { x: number; y: number; r: number; o: number }[];
  lines: { x1: number; y1: number; x2: number; y2: number }[];
}

// 与原型 shot() 相同的取数顺序：先 28 个点（x, y, r, opacity），再 7 条线
function generate(seed: number): Shape {
  const rnd = seededRandom(seed);
  const dots = Array.from({ length: 28 }, () => ({
    x: rnd() * W,
    y: rnd() * H,
    r: rnd() * 2 + 1,
    o: rnd() * 0.5 + 0.25,
  }));
  const lines = Array.from({ length: 7 }, () => ({
    x1: rnd() * W,
    y1: rnd() * H,
    x2: rnd() * W,
    y2: rnd() * H,
  }));
  return { dots, lines };
}

const f = (n: number) => n.toFixed(1);

/**
 * 项目卡片缩略图：按色相和种子生成一张固定的几何示意，不用占位图。
 * 颜色走 CSS 变量（.pj-shot），深浅主题分别调亮度；种子固定，服务端与客户端输出一致。
 */
export default function ProjectThumb({ hue, seed }: { hue: number; seed: number }) {
  const { dots, lines } = generate(seed);

  return (
    <div className="pj-shot" style={{ '--hue': hue } as React.CSSProperties}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g className="pj-shot-lines">
          {lines.map((l, i) => (
            <line key={i} x1={f(l.x1)} y1={f(l.y1)} x2={f(l.x2)} y2={f(l.y2)} />
          ))}
        </g>
        <g className="pj-shot-dots">
          {dots.map((d, i) => (
            <circle key={i} cx={f(d.x)} cy={f(d.y)} r={f(d.r)} opacity={d.o.toFixed(2)} />
          ))}
        </g>
      </svg>
    </div>
  );
}
