'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'copied' | 'failed';

interface CopyCardProps {
  textToCopy: string;
  ariaLabel: string;
  className?: string;
  children: ReactNode;
}

/**
 * 微信等无网页直达链接的条目：整格可点击复制微信号，
 * 右上角展示复制状态与轻量图标反馈（与 CopyEmail 保持视觉与动画统一）。
 */
export default function CopyCard({ textToCopy, ariaLabel, className, children }: CopyCardProps) {
  const t = useTranslations('contact');
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<number>();

  useEffect(() => {
    return () => window.clearTimeout(timer.current);
  }, []);

  const copy = async () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setStatus('copied');
      } catch {
        setStatus('failed');
      }
    } else {
      setStatus('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 2200);
  };

  const copied = status === 'copied';

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={ariaLabel}
      className={cn(className, 'w-full cursor-pointer text-left')}
    >
      {children}
      <div className="absolute right-[14px] top-[14px] flex items-center gap-2.5">
        <span
          role="status"
          className={cn(
            'pointer-events-none text-[11px] tracking-[0.05em] transition-opacity duration-300 ease-scene',
            status === 'idle' ? 'opacity-0' : 'opacity-100',
            status === 'failed' ? 'text-ember' : 'text-glow'
          )}
        >
          {status === 'copied' ? t('copied') : status === 'failed' ? t('copyFailed') : ''}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'grid h-[30px] w-[30px] flex-none place-items-center rounded-[3px] border border-line bg-ink text-dim transition-colors duration-300 ease-scene group-hover:border-glow group-hover:text-glow group-focus-within:border-glow group-focus-within:text-glow',
            copied && 'border-glow text-glow'
          )}
        >
          {copied ? (
            <Check aria-hidden="true" size={14} strokeWidth={1.75} className="ct-pop" />
          ) : (
            <Copy aria-hidden="true" size={14} strokeWidth={1.75} />
          )}
        </span>
      </div>
    </button>
  );
}
