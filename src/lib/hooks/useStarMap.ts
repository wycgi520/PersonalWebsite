'use client';

import { useEffect, type RefObject } from 'react';

export interface StarNode {
  id: 'about' | 'projects' | 'writing' | 'toolkit' | 'contact';
  mag: string;
  x: number;
  y: number;
}

export const STAR_NODES: StarNode[] = [
  { id: 'about', mag: '1.4', x: 150, y: 128 },
  { id: 'projects', mag: '0.8', x: 420, y: 90 },
  { id: 'writing', mag: '1.9', x: 512, y: 330 },
  { id: 'toolkit', mag: '2.3', x: 300, y: 450 },
  { id: 'contact', mag: '1.1', x: 92, y: 338 },
];

export const STAR_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3],
];

const SVGNS = 'http://www.w3.org/2000/svg';
const METEOR_DURATION = 1150;

interface Refs {
  nodes: RefObject<(SVGGraphicsElement | null)[]>;
  edges: RefObject<(SVGLineElement | null)[]>;
  meteors: RefObject<SVGGElement | null>;
}

/** 节点在 t 时刻相对基准位置的偏移：两组不同周期的正弦叠加，看起来像自然环绕 */
function driftOffset(t: number, ph: number): [number, number] {
  const dx = Math.sin(t / 4200 + ph) * 9 + Math.cos(t / 7100 + ph) * 4;
  const dy = Math.cos(t / 3700 + ph * 1.7) * 8 + Math.sin(t / 8300 + ph) * 3;
  return [dx, dy];
}

interface Meteor {
  el: SVGLineElement;
  t0: number;
  x: number;
  y: number;
  len: number;
}

/** 更新一颗流星；返回 false 表示已结束 */
function stepMeteor(m: Meteor, now: number): boolean {
  const k = Math.min((now - m.t0) / METEOR_DURATION, 1);
  const e = k * k * (3 - 2 * k); // smoothstep
  const hx = m.x + (m.len + 150) * e;
  const hy = m.y + (m.len + 150) * e * 0.62;
  const tx = hx - m.len * (1 - k * 0.55);
  const ty = hy - m.len * 0.62 * (1 - k * 0.55);
  m.el.setAttribute('x1', tx.toFixed(2));
  m.el.setAttribute('y1', ty.toFixed(2));
  m.el.setAttribute('x2', hx.toFixed(2));
  m.el.setAttribute('y2', hy.toFixed(2));
  m.el.setAttribute('opacity', String(k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85));
  return k < 1;
}

/**
 * 星图动画：节点漂移 + 连线跟随 + 偶尔的流星。
 * 直接写 DOM 属性而非 setState，避免每帧触发 React 渲染。
 * prefers-reduced-motion 时节点停在基准位置，不出现流星。
 */
export function useStarMap({ nodes, edges, meteors }: Refs) {
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)');
    const phases = STAR_NODES.map(() => Math.random() * Math.PI * 2);
    const pos: [number, number][] = STAR_NODES.map((n) => [n.x, n.y]);
    const active: Meteor[] = [];
    let nextMeteor = 2600;
    let last = performance.now();
    let rafId = 0;

    const layout = (t: number, still: boolean) => {
      STAR_NODES.forEach((n, i) => {
        const [dx, dy] = still ? [0, 0] : driftOffset(t, phases[i]);
        pos[i] = [n.x + dx, n.y + dy];
        nodes.current?.[i]?.setAttribute(
          'transform',
          `translate(${pos[i][0].toFixed(2)},${pos[i][1].toFixed(2)})`
        );
      });
      // 先算完所有节点位置，再统一更新连线
      STAR_EDGES.forEach(([a, b], k) => {
        const line = edges.current?.[k];
        if (!line) return;
        line.setAttribute('x1', pos[a][0].toFixed(2));
        line.setAttribute('y1', pos[a][1].toFixed(2));
        line.setAttribute('x2', pos[b][0].toFixed(2));
        line.setAttribute('y2', pos[b][1].toFixed(2));
      });
    };

    const spawnMeteor = (now: number) => {
      const layer = meteors.current;
      if (!layer) return;
      const el = document.createElementNS(SVGNS, 'line');
      el.setAttribute('stroke', 'url(#mg)');
      el.setAttribute('stroke-width', '1.6');
      el.setAttribute('stroke-linecap', 'round');
      el.setAttribute('opacity', '0');
      layer.appendChild(el);
      active.push({
        el,
        t0: now,
        x: 60 + Math.random() * 380,
        y: 40 + Math.random() * 150,
        len: 110 + Math.random() * 90,
      });
    };

    const frame = (now: number) => {
      // 切到后台标签页再回来时 dt 会很大，限制一下避免流星连发
      const dt = Math.min(now - last, 100);
      last = now;
      layout(now, false);

      nextMeteor -= dt;
      if (nextMeteor <= 0) {
        nextMeteor = 5200 + Math.random() * 7000;
        spawnMeteor(now);
      }
      for (let i = active.length - 1; i >= 0; i--) {
        if (!stepMeteor(active[i], now)) {
          active[i].el.remove();
          active.splice(i, 1);
        }
      }
      rafId = requestAnimationFrame(frame);
    };

    const start = () => {
      cancelAnimationFrame(rafId);
      active.splice(0).forEach((m) => m.el.remove());
      if (mq.matches) {
        layout(0, true);
        return;
      }
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    start();
    // 用户在系统里切换"减少动态效果"时实时生效
    mq.addEventListener('change', start);

    return () => {
      cancelAnimationFrame(rafId);
      mq.removeEventListener('change', start);
      active.forEach((m) => m.el.remove());
    };
  }, [nodes, edges, meteors]);
}
