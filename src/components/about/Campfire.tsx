'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { FH, FW } from '@/lib/campfire/geometry';
import { useCampfire } from '@/lib/hooks/useCampfire';

export default function Campfire() {
  const t = useTranslations('about');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useCampfire(canvasRef);

  return (
    <div className="campfire relative isolate self-center max-[1040px]:order-first max-[1040px]:mx-auto max-[1040px]:w-full max-[1040px]:max-w-[560px]">
      <canvas
        ref={canvasRef}
        width={FW}
        height={FH}
        role="img"
        aria-label={t('fireLabel')}
        className="block h-auto w-full cursor-pointer"
      />
    </div>
  );
}
