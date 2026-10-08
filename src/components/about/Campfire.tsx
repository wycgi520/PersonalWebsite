'use client';

import { useId, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FH, FW } from '@/lib/campfire/geometry';
import { useCampfire } from '@/lib/hooks/useCampfire';

export default function Campfire() {
  const t = useTranslations('about');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const descId = useId();
  useCampfire(canvasRef);

  return (
    <div className="campfire relative isolate self-center max-[1040px]:order-first max-[1040px]:mx-auto max-[1040px]:w-full max-[1040px]:max-w-[560px]">
      {/* 画布包在按钮里：键盘也能添柴（回车/空格）。pan-y 让触屏上竖向滑动仍能滚动页面 */}
      <button
        type="button"
        aria-label={t('stokeFire')}
        aria-describedby={descId}
        className="block w-full cursor-pointer touch-pan-y rounded-[4px] border-0 bg-transparent p-0 disabled:cursor-default"
      >
        <canvas ref={canvasRef} width={FW} height={FH} aria-hidden="true" className="block h-auto w-full" />
      </button>
      <p id={descId} hidden>
        {t('fireLabel')}
      </p>
    </div>
  );
}
