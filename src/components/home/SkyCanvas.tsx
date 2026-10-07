'use client';

import { useEffect, useRef } from 'react';

export default function SkyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let stars: Array<{ x: number; y: number; r: number; p: number; s: number }> = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

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
        const tw = RM ? 0.7 : (Math.sin((t / 1000) * s.s + s.p) * 0.5 + 0.5) * 0.75 + 0.22;
        ctx.globalAlpha = light ? tw * 0.33 : tw;
        ctx.fillStyle = light ? '#44576F' : '#D5E3F5';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    initSky();

    let rafId: number;
    const animate = (t: number) => {
      drawSky(t);
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const handleResize = () => initSky();
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', handleResize);
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
