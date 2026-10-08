'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';

const SEEN_KEY = 'gy-about-seen';
const SEQ_MS = 2400; // 最后一个元素的延迟 + 动画时长之后切到常显

// 首屏直出时在解析阶段就决定是否播放依次显现，避免先闪一下全文再隐藏。
// 客户端路由进入时 React 不会执行这段脚本，由下面的 layout effect 接手。
const DECIDE = `(function(){try{var g=document.currentScript.parentElement;var s=localStorage.getItem('${SEEN_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches;g.setAttribute('data-reveal',s?'shown':'seq')}catch(e){}})()`;

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function decide(): 'seq' | 'shown' {
  try {
    if (localStorage.getItem(SEEN_KEY)) return 'shown';
  } catch {
    // 存储不可用（隐私模式等）时每次都播放
  }
  return matchMedia('(prefers-reduced-motion: reduce)').matches ? 'shown' : 'seq';
}

/**
 * About 页的双栏容器，负责"首次打开依次显现，之后直接显示"。
 * 状态写在 data-reveal 上：无 JS 时没有该属性，内容始终可见。
 */
export default function AboutStage({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    let mode = g.dataset.reveal;
    if (!mode) {
      mode = decide();
      g.dataset.reveal = mode;
    }
    if (mode !== 'seq') return;
    try {
      localStorage.setItem(SEEN_KEY, '1');
    } catch {}
    const id = setTimeout(() => (g.dataset.reveal = 'shown'), SEQ_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <div
      ref={ref}
      // data-reveal 由内联脚本在水合前写入
      suppressHydrationWarning
      className="mx-auto grid max-w-[1320px] grid-cols-1 items-center gap-10 py-5 min-[1041px]:min-h-[calc(100vh-152px)] min-[1041px]:grid-cols-[1fr_minmax(320px,44%)] min-[1041px]:gap-[60px] min-[1041px]:py-0"
    >
      <script dangerouslySetInnerHTML={{ __html: DECIDE }} />
      {children}
    </div>
  );
}
