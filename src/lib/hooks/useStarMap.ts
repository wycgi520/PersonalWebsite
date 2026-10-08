'use client';

import { useEffect, type RefObject } from 'react';
import { STAR_EDGES, STAR_NODES } from '@/lib/data/starmap';
import { onMotionChange, prefersReducedMotion } from '@/lib/motion';

export { STAR_EDGES, STAR_NODES, type StarNode } from '@/lib/data/starmap';

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
 * 减少动态效果时（系统设置或导航栏开关）节点停在基准位置，不出现流星；滚出视口时暂停。
 */
export function useStarMap({ nodes, edges, meteors }: Refs) {
  useEffect(() => {
    const phases = STAR_NODES.map(() => Math.random() * Math.PI * 2);
    const pos: [number, number][] = STAR_NODES.map((n) => [n.x, n.y]);
    const active: Meteor[] = [];
    let nextMeteor = 2600;
    let last = performance.now();
    let rafId = 0;
    let visible = true;

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
      rafId = 0;
      active.splice(0).forEach((m) => m.el.remove());
      if (prefersReducedMotion()) {
        layout(0, true);
        return;
      }
      // 滚出视口（窄屏时星图在介绍下方）就停在当前位置，回来再继续
      if (!visible) return;
      last = performance.now();
      rafId = requestAnimationFrame(frame);
    };

    const svg = meteors.current?.ownerSVGElement;
    const io = svg
      ? new IntersectionObserver(([entry]) => {
          visible = entry.isIntersecting;
          start();
        })
      : null;
    if (svg) io?.observe(svg);

    start();
    // 系统设置或导航栏开关切换"减少动态效果"时实时生效
    const unsubscribe = onMotionChange(start);

    return () => {
      cancelAnimationFrame(rafId);
      io?.disconnect();
      unsubscribe();
      active.forEach((m) => m.el.remove());
    };
  }, [nodes, edges, meteors]);
}
