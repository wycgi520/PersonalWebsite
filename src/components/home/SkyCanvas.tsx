'use client';

import { useEffect, useRef } from 'react';
import { onMotionChange, prefersReducedMotion } from '@/lib/motion';

/**
 * 全站背景星空。星点闪烁每帧重绘；减少动态效果时只画一帧静止的星空，
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

    const initSky = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

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
