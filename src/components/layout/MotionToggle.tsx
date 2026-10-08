'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { onMotionChange, prefersReducedMotion, setMotionPref } from '@/lib/motion';
import { cn } from '@/lib/utils';

/** 动态效果开关：按下 = 动效开启。默认跟随系统设置，点击后记住手动选择 */
export default function MotionToggle() {
  const t = useTranslations('nav');
  // 服务端不知道偏好，挂载前按"开启"渲染，挂载后再同步
  const [on, setOn] = useState(true);

  useEffect(() => {
    const sync = () => setOn(!prefersReducedMotion());
    sync();
    return onMotionChange(sync);
  }, []);

  const label = on ? t('motionOff') : t('motionOn');

  return (
    <button
      type="button"
      onClick={() => setMotionPref(on ? 'reduced' : 'full')}
      aria-pressed={on}
      aria-label={t('motionLabel')}
      title={label}
      className="relative grid h-8 w-8 place-items-center rounded-[3px] border border-line text-dim transition-colors duration-300 ease-scene hover:border-glow hover:text-glow"
    >
      <Sparkles size={14} aria-hidden="true" className={cn(!on && 'opacity-50')} />
      {!on && (
        // 关闭时在图标上画一道斜杠
        <i aria-hidden="true" className="pointer-events-none absolute h-px w-[18px] rotate-[-45deg] bg-current" />
      )}
    </button>
  );
}
