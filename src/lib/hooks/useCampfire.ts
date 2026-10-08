'use client';

import { useEffect, type RefObject } from 'react';
import { clamp } from '@/lib/utils';
import { FH, FW } from '@/lib/campfire/geometry';
import { createLayers, paintLayers } from '@/lib/campfire/staticLayers';
import { createParticles, renderFire, spawnParticles, spawnSpark, type FireState } from '@/lib/campfire/render';

/*
 * 交互手感调这里：
 * FOLLOW  弹簧刚度，越大越快追上鼠标（0.02 很慢 … 0.09 很快）
 * DAMP    阻尼，越大越"稳"不晃；比 FOLLOW 大 2~3 倍时只有轻微过冲
 * GUST    鼠标甩动带来的额外推力（0 = 关闭）
 * GUST_DECAY  推力每帧保留比例，越接近 1 风停得越慢
 */
const FOLLOW = 0.045, DAMP = 0.2, GUST = 1.6, GUST_DECAY = 0.92;
const VIGOR_MAX = 2.8;

const isLight = () => document.documentElement.dataset.theme === 'light';

/**
 * 篝火动画：静态层（石圈、柴堆、炭床）按主题预渲染成离屏画布，
 * 火舌、焰片、火星、烟每帧绘制。
 * - 鼠标在整个 About 场景内移动时火焰随之倾斜（弹簧跟随 + 甩动的"风"）
 * - 点击篝火火势增强并爆出火星，之后慢慢回落
 * - prefers-reduced-motion 时只画一帧静止的火，主题切换时重绘
 * - 画布滚出视口或标签页隐藏时暂停
 */
export function useCampfire(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const glowEl = canvas.parentElement; // CSS 光晕读取它上面的 --fire
    const scene = canvas.closest('section') ?? canvas;
    const mq = matchMedia('(prefers-reduced-motion: reduce)');

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = FW * dpr;
    canvas.height = FH * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const layers = createLayers(dpr);
    let layerTheme: boolean | null = null;
    const particles = createParticles();
    const fire: FireState = { t: 0, lean: 0, vigor: 1, flick: 1 };
    let leanV = 0, leanTarget = 0, gust = 0, vigorTarget = 1;
    let lastPX: number | null = null;

    let rafId = 0, last = 0;
    let visible = true;

    const draw = (dt: number, still: boolean) => {
      const light = isLight();
      if (layerTheme !== light) {
        paintLayers(layers, dpr, light);
        layerTheme = light;
      }
      const k = Math.min(dt / 16.7, 3);
      if (still) {
        fire.flick = 1;
      } else {
        // 弹簧：带一点过冲，像火被风推了一下
        gust *= Math.pow(GUST_DECAY, k);
        const target = clamp(leanTarget + gust, -2, 2);
        leanV += ((target - fire.lean) * FOLLOW - leanV * DAMP) * k;
        fire.lean += leanV * k;
        vigorTarget += (1 - vigorTarget) * 0.0035 * k;
        fire.vigor += (vigorTarget - fire.vigor) * 0.06 * k;
        fire.t += dt / 1000;
        fire.flick = 0.86 + Math.sin(fire.t * 9.1) * 0.05 + Math.sin(fire.t * 23.7) * 0.04 + (Math.random() - 0.5) * 0.06;
        spawnParticles(particles, fire);
      }
      const glow = renderFire(ctx, layers, particles, fire, light, still ? 0 : k);
      glowEl?.style.setProperty('--fire', glow.toFixed(3));
    };

    const frame = (now: number) => {
      // 切回标签页时 dt 会很大，限制步长避免粒子跳变
      const dt = Math.min(now - last, 100);
      last = now;
      draw(dt, false);
      rafId = requestAnimationFrame(frame);
    };

    const running = () => !mq.matches && visible && !document.hidden;
    const sync = () => {
      cancelAnimationFrame(rafId);
      rafId = 0;
      if (running()) {
        last = performance.now();
        rafId = requestAnimationFrame(frame);
      } else if (mq.matches) {
        draw(16, true);
      }
    };

    // 静止模式下主题切换需要手动重绘
    const themeObserver = new MutationObserver(() => {
      if (mq.matches) draw(16, true);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    io.observe(canvas);

    // 整个 About 场景都能影响火苗，离火越远倾斜越大（有上限）
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      leanTarget = clamp(dx, -1.6, 1.6) * 1.1;
      if (lastPX !== null) gust = clamp(gust + ((e.clientX - lastPX) / r.width) * GUST, -1.2, 1.2);
      lastPX = e.clientX;
    };
    const onLeave = () => {
      leanTarget = 0;
      lastPX = null;
    };
    const onClick = () => {
      if (!running()) return;
      vigorTarget = Math.min(vigorTarget + 0.5, VIGOR_MAX);
      for (let i = 0; i < 26; i++) spawnSpark(particles, true);
    };

    scene.addEventListener('pointermove', onMove as EventListener);
    scene.addEventListener('pointerleave', onLeave);
    canvas.addEventListener('click', onClick);
    mq.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      io.disconnect();
      scene.removeEventListener('pointermove', onMove as EventListener);
      scene.removeEventListener('pointerleave', onLeave);
      canvas.removeEventListener('click', onClick);
      mq.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [canvasRef]);
}
