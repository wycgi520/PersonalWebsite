'use client';

import { useEffect, type RefObject } from 'react';
import { clamp } from '@/lib/utils';
import { onMotionChange, prefersReducedMotion } from '@/lib/motion';
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

/*
 * 帧率自检：跳过开头的 WARMUP 帧（首帧编译、图层绘制），之后每 WINDOW 帧算一次平均帧时长，
 * 超过 SLOW_MS（约 28fps）就降一档：
 *   0 完整 → 1 精简（画布 1x 分辨率、粒子减半）→ 2 静止（只画一帧，同减少动态效果）
 * 只降不升，避免在临界值附近来回切换。切后台、滚出视口造成的长帧不计入。
 */
const WARMUP = 30, WINDOW = 90, SLOW_MS = 36, HITCH_MS = 250;
type Quality = 0 | 1 | 2;
const DENSITY: Record<Quality, number> = { 0: 1, 1: 0.5, 2: 0 };

const isLight = () => document.documentElement.dataset.theme === 'light';

/**
 * 篝火动画：静态层（石圈、柴堆、炭床）按主题预渲染成离屏画布，
 * 火舌、焰片、火星、烟每帧绘制。
 * - 鼠标在整个 About 场景内移动时火焰随之倾斜（弹簧跟随 + 甩动的"风"）
 * - 点击 / 回车 / 空格（画布外包着按钮）火势增强并爆出火星，之后慢慢回落
 * - 减少动态效果（系统设置或导航栏开关）时只画一帧静止的火，主题切换时重绘
 * - 画布滚出视口或标签页隐藏时暂停；帧率过低时自动降级
 */
export function useCampfire(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const glowEl = canvas.closest<HTMLElement>('.campfire'); // CSS 光晕读取它上面的 --fire
    const trigger = canvas.closest('button') ?? canvas;
    const scene = canvas.closest('section') ?? canvas;

    let quality: Quality = 0;
    let dpr = 1;
    let layers = createLayers(1);
    let layerTheme: boolean | null = null;

    const setResolution = (q: Quality) => {
      dpr = q === 0 ? Math.min(window.devicePixelRatio || 1, 2) : 1;
      canvas.width = FW * dpr;
      canvas.height = FH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layers = createLayers(dpr);
      layerTheme = null; // 新图层需要重新绘制
    };
    setResolution(0);

    const particles = createParticles();
    const fire: FireState = { t: 0, lean: 0, vigor: 1, flick: 1 };
    let leanV = 0, leanTarget = 0, gust = 0, vigorTarget = 1;
    let lastPX: number | null = null;

    let rafId = 0, last = 0;
    let visible = true;
    let frames = 0, sampled = 0, sampleMs = 0;

    const still = () => prefersReducedMotion() || quality === 2;
    const running = () => !still() && visible && !document.hidden;

    const draw = (dt: number, isStill: boolean) => {
      const light = isLight();
      if (layerTheme !== light) {
        paintLayers(layers, dpr, light);
        layerTheme = light;
      }
      const k = Math.min(dt / 16.7, 3);
      if (isStill) {
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
        spawnParticles(particles, fire, DENSITY[quality]);
      }
      const glow = renderFire(ctx, layers, particles, fire, light, isStill ? 0 : k);
      glowEl?.style.setProperty('--fire', glow.toFixed(3));
    };

    const degrade = (): Quality => {
      quality = (quality + 1) as Quality;
      canvas.dataset.quality = String(quality);
      frames = sampled = sampleMs = 0;
      if (quality === 1) setResolution(1);
      else sync(); // 静止：停下循环，画最后一帧
      return quality;
    };

    // 统计帧时长；返回 true 表示刚降级、本帧不再继续
    const measure = (raw: number) => {
      if (quality === 2 || raw > HITCH_MS || ++frames <= WARMUP) return false;
      sampleMs += raw;
      if (++sampled < WINDOW) return false;
      const slow = sampleMs / sampled > SLOW_MS;
      sampled = sampleMs = 0;
      return slow && degrade() === 2;
    };

    const frame = (now: number) => {
      const raw = now - last;
      last = now;
      if (measure(raw)) return;
      // 切回标签页时 dt 会很大，限制步长避免粒子跳变
      draw(Math.min(raw, 100), false);
      rafId = requestAnimationFrame(frame);
    };

    const syncTrigger = () => {
      // 静止时点了也没反应，不再作为可操作的按钮出现
      if (trigger instanceof HTMLButtonElement) trigger.disabled = still();
    };

    function sync() {
      cancelAnimationFrame(rafId);
      rafId = 0;
      syncTrigger();
      if (running()) {
        last = performance.now();
        frames = sampled = sampleMs = 0; // 恢复后重新预热，不把切换瞬间算进去
        rafId = requestAnimationFrame(frame);
      } else if (still()) {
        draw(16, true);
      }
    }

    // 静止模式下主题切换需要手动重绘
    const themeObserver = new MutationObserver(() => {
      if (still()) draw(16, true);
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
    const onStoke = () => {
      if (!running()) return;
      vigorTarget = Math.min(vigorTarget + 0.5, VIGOR_MAX);
      for (let i = 0; i < 26; i++) spawnSpark(particles, true);
    };

    scene.addEventListener('pointermove', onMove as EventListener);
    scene.addEventListener('pointerleave', onLeave);
    // 按钮的 click 也覆盖了回车和空格
    trigger.addEventListener('click', onStoke);
    document.addEventListener('visibilitychange', sync);
    const unsubscribe = onMotionChange(sync);
    sync();

    return () => {
      cancelAnimationFrame(rafId);
      themeObserver.disconnect();
      io.disconnect();
      scene.removeEventListener('pointermove', onMove as EventListener);
      scene.removeEventListener('pointerleave', onLeave);
      trigger.removeEventListener('click', onStoke);
      document.removeEventListener('visibilitychange', sync);
      unsubscribe();
    };
  }, [canvasRef]);
}
