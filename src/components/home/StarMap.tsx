'use client';

import { useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getPathname, useRouter } from '@/i18n/navigation';
import { STAR_EDGES, STAR_NODES, useStarMap } from '@/lib/hooks/useStarMap';

// 图版边框：x 28→592，y 28→528
const FX0 = 28, FY0 = 28, FW = 564, FH = 500;

// 赤经赤纬网格线与边框刻度只依赖常量，模块加载时算一次
const V_GRID = Array.from({ length: 5 }, (_, i) => FX0 + (FW * (i + 1)) / 6);
const H_GRID = Array.from({ length: 4 }, (_, i) => FY0 + (FH * (i + 1)) / 5);
const TICKS = [
  ...Array.from({ length: 25 }, (_, i) => {
    const x = FX0 + (FW * i) / 24, len = i % 4 ? 4 : 8;
    return [
      [x, FY0 + FH, x, FY0 + FH - len],
      [x, FY0, x, FY0 + len],
    ];
  }).flat(),
  ...Array.from({ length: 21 }, (_, i) => {
    const y = FY0 + (FH * i) / 20, len = i % 4 ? 4 : 8;
    return [
      [FX0, y, FX0 + len, y],
      [FX0 + FW, y, FX0 + FW - len, y],
    ];
  }).flat(),
];

export default function StarMap() {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();

  const nodeRefs = useRef<(SVGGraphicsElement | null)[]>([]);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const meteorRef = useRef<SVGGElement | null>(null);
  useStarMap({ nodes: nodeRefs, edges: edgeRefs, meteors: meteorRef });

  // 直接切 class，不经过 React 状态，避免与每帧写入的坐标属性互相干扰
  const setHot = (i: number, on: boolean) => {
    STAR_EDGES.forEach(([a, b], k) => {
      if (a === i || b === i) edgeRefs.current[k]?.classList.toggle('hot', on);
    });
  };

  const hrefOf = (id: string) => getPathname({ href: `/${id}`, locale });
  const go = (id: string) => router.push(`/${id}`);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[560px] min-[1041px]:aspect-[1/0.92] min-[1041px]:max-h-[72vh] min-[1041px]:max-w-none">
      <svg
        viewBox="0 0 620 580"
        role="group"
        aria-label={t('chartLabel')}
        className="block h-full w-full overflow-visible"
      >
        <defs>
          <radialGradient id="hg">
            <stop offset="0%" stopColor="var(--glow)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--glow)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--glow)" stopOpacity="0" />
            <stop offset="100%" stopColor="var(--glow)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* 图版：边框 + 网格 + 刻度 */}
        <g aria-hidden="true">
          <rect x={FX0} y={FY0} width={FW} height={FH} className="cframe" />
          {V_GRID.map((x) => (
            <line key={`v${x}`} x1={x} y1={FY0} x2={x} y2={FY0 + FH} className="cgrid" />
          ))}
          {H_GRID.map((y) => (
            <line key={`h${y}`} x1={FX0} y1={y} x2={FX0 + FW} y2={y} className="cgrid" />
          ))}
          {TICKS.map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className="ctick" />
          ))}
        </g>

        <g aria-hidden="true">
          {STAR_EDGES.map(([a, b], k) => (
            <line
              key={k}
              ref={(el) => {
                edgeRefs.current[k] = el;
              }}
              className="cedge"
              x1={STAR_NODES[a].x}
              y1={STAR_NODES[a].y}
              x2={STAR_NODES[b].x}
              y2={STAR_NODES[b].y}
            />
          ))}
        </g>

        {/* 流星由 useStarMap 动态插入 */}
        <g ref={meteorRef} aria-hidden="true" />

        {/* 节点用 SVG <a>：无 JS 时也能跳转，原生可聚焦，Enter 触发 */}
        <g>
          {STAR_NODES.map((node, i) => {
            const label = t(`nodes.${node.id}`);
            return (
              <a
                key={node.id}
                href={hrefOf(node.id)}
                className="node"
                aria-label={label}
                onClick={(e) => {
                  // 保留 Ctrl/⌘/Shift/中键 的新标签页行为
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
                  e.preventDefault();
                  go(node.id);
                }}
                onKeyDown={(e) => {
                  // 原型中 Space 也能触发
                  if (e.key === ' ') {
                    e.preventDefault();
                    go(node.id);
                  }
                }}
                onMouseEnter={() => setHot(i, true)}
                onMouseLeave={() => setHot(i, false)}
                onFocus={() => setHot(i, true)}
                onBlur={() => setHot(i, false)}
              >
                <g
                  ref={(el) => {
                    nodeRefs.current[i] = el;
                  }}
                  transform={`translate(${node.x},${node.y})`}
                >
                  {/* 扩大触摸/点击命中区域，覆盖标签文字；窄屏尺寸由 CSS 几何属性放大（属性值兜底） */}
                  <rect className="hit" x={-22} y={-22} width={110} height={48} fill="transparent" />
                  <circle className="halo" r={34} fill="url(#hg)" />
                  <circle className="ring" r={13} />
                  <circle className="star" r={4.2} />
                  <text className="lbl" x={20} y={5}>
                    {label}
                  </text>
                  <text className="sub" x={20} y={20} aria-hidden="true">
                    mag {node.mag}
                  </text>
                </g>
              </a>
            );
          })}
        </g>
      </svg>

      <div className="absolute bottom-[-6px] left-0 font-sans text-[10.5px] tracking-[0.1em] text-dim">
        {t('plate')}
      </div>
    </div>
  );
}
