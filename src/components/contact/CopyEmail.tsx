'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'copied' | 'failed';

/**
 * 邮件条目里的"复制地址"按钮。剪贴板 API 只在安全上下文可用，
 * 挂载后确认可用才渲染；不可用（或无 JS）时只剩 mailto 链接，不出现失效按钮。
 */
export default function CopyEmail({ email, className }: { email: string; className?: string }) {
  const t = useTranslations('contact');
  const [supported, setSupported] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const timer = useRef<number>();

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.clipboard?.writeText);
    return () => window.clearTimeout(timer.current);
  }, []);

  if (!supported) return null;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setStatus('copied');
    } catch {
      setStatus('failed');
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), 2200);
  };

  const copied = status === 'copied';

  return (
    // 放在标签那一行的右侧，不压住下面的邮箱地址
    <div className={cn('flex items-center gap-2.5', className)}>
      {/* 结果文字同时由 role=status 播报 */}
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
      <button
        type="button"
        onClick={copy}
        aria-label={t('copy')}
        title={t('copy')}
        className={cn(
          'grid h-[30px] w-[30px] flex-none place-items-center rounded-[3px] border border-line bg-ink text-dim transition-colors duration-300 ease-scene hover:border-glow hover:text-glow focus-visible:border-glow focus-visible:text-glow',
          copied && 'border-glow text-glow'
        )}
      >
        {copied ? (
          <Check aria-hidden="true" size={14} strokeWidth={1.75} className="ct-pop" />
        ) : (
          <Copy aria-hidden="true" size={14} strokeWidth={1.75} />
        )}
      </button>
    </div>
  );
}
