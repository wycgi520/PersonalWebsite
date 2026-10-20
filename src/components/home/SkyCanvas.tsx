'use client';

import { useEffect, useRef } from 'react';
import { onMotionChange, prefersReducedMotion } from '@/lib/motion';

/**
 * 全站背景星空。星点闪烁 + 均匀分布在视口各处的流星，每帧重绘；减少动态效果时只画一帧静止的星空（无流星），
 * 主题切换、窗口尺寸变化时重画。标签页隐藏时停止绘制。
 */
export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let stars: Array<{ x: number; y: number; r: number; p: number; s: number }> = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let still = prefersReducedMotion();

    // 流星：视口切成若干格，按打乱后的顺序轮流在各格内出现，保证分布均匀又不显得规律
    type Meteor = { x: number; y: number; dx: number; dy: number; dist: number; len: number; t0: number; dur: number };
    let meteors: Meteor[] = [];
    let cells: number[] = [];
    let cols = 4;
    const ROWS = 3;
    let nextSpawn = 0;

    const nextCell = () => {
      if (!cells.length) {
        cells = Array.from({ length: cols * ROWS }, (_, i) => i);
        for (let i = cells.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cells[i], cells[j]] = [cells[j], cells[i]];
        }
      }
      return cells.pop()!;
    };

    const spawnMeteor = (t: number) => {
      const c = nextCell();
      const w = window.innerWidth, h = window.innerHeight;
      const ang = ((22 + Math.random() * 22) * Math.PI) / 180;
      const dir = Math.random() < 0.7 ? 1 : -1; // 多数向右下，少数向左下
      meteors.push({
        x: ((c % cols) + Math.random()) * (w / cols),
        y: (Math.floor(c / cols) + Math.random() * 0.8) * (h / ROWS),
        dx: Math.cos(ang) * dir,
        dy: Math.sin(ang),
        dist: 140 + Math.random() * 180,
        len: 60 + Math.random() * 90,
        t0: t,
        dur: 850 + Math.random() * 650,
      });
    };

    const drawMeteors = (t: number, light: boolean) => {
      const rgb = light ? '68,87,111' : '206,238,250';
      ctx.lineCap = 'round';
      ctx.lineWidth = 1.3;
      meteors = meteors.filter((m) => {
        const k = (t - m.t0) / m.dur;
        if (k >= 1 || k < 0) return false;
        const e = 1 - (1 - k) * (1 - k); // ease-out
        const hx = m.x + m.dx * m.dist * e, hy = m.y + m.dy * m.dist * e;
        const tl = m.len * (1 - k * 0.5);
        const tx = hx - m.dx * tl, ty = hy - m.dy * tl;
        const a = (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85) * (light ? 0.45 : 0.9);
        const g = ctx.createLinearGradient(tx, ty, hx, hy);
        g.addColorStop(0, `rgba(${rgb},0)`);
        g.addColorStop(1, `rgba(${rgb},${a.toFixed(3)})`);
        ctx.strokeStyle = g;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        return true;
      });
    };

    const initSky = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = window.innerWidth < 720 ? 2 : 4;
      cells = [];
      meteors = [];

      const n = Math.round((window.innerWidth * window.innerHeight) / 9000);
      stars = Array.from({ length: n }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.1 + 0.25,
        p: Math.random() * 6.28,
        s: Math.random() * 0.9 + 0.25,
      }));
    };

    const drawSky = (t: number) => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const light = document.documentElement.dataset.theme === 'light';

      for (const s of stars) {
        const tw = still ? 0.7 : (Math.sin((t / 1000) * s.s + s.p) * 0.5 + 0.5) * 0.75 + 0.22;
        ctx.globalAlpha = light ? tw * 0.33 : tw;
        ctx.fillStyle = light ? '#44576F' : '#D5E3F5';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (still) return;

      // 切回标签页时 t 会跳变，nextSpawn 落后太多就从现在重新计时，避免连发
      if (t >= nextSpawn) {
        if (t - nextSpawn < 1000) spawnMeteor(t);
        nextSpawn = t + 700 + Math.random() * 1500;
      }
      drawMeteors(t, light);
    };

    let rafId = 0;
    const animate = (t: number) => {
      drawSky(t);
      rafId = requestAnimationFrame(animate);
    };

    const sync = () => {
      still = prefersReducedMotion();
      cancelAnimationFrame(rafId);
      rafId = 0;
      meteors = [];
      if (still) drawSky(0);
      else if (!document.hidden) rafId = requestAnimationFrame(animate);
    };

    initSky();
    sync();

    const handleResize = () => {
      initSky();
      if (still) drawSky(0);
    };
    // 静止时主题切换需要手动重画（动画中下一帧自然会用新颜色）
    const themeObserver = new MutationObserver(() => {
      if (still) drawSky(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    window.addEventListener('resize', handleResize);
    document.addEventListener('visibilitychange', sync);
    const unsubscribe = onMotionChange(sync);

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', sync);
      unsubscribe();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="sky"
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
