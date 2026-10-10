'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePortrait({ className }: { className?: string }) {
  const t = useTranslations('about');
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 监听 Esc 键与锁屏滚动
  useEffect(() => {
    if (!isOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={t('portraitExpandTip')}
        title={t('portraitExpandTip')}
        className={cn(
          'group relative mb-[22px] block h-28 w-28 cursor-pointer overflow-hidden rounded-full border border-line bg-panel p-0 text-left shadow-[0_0_0_6px_rgba(99,210,232,0.05)] transition-all duration-300 ease-scene',
          'hover:border-glow hover:shadow-[0_0_0_8px_rgba(99,210,232,0.15)] hover:scale-[1.02] active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow focus-visible:ring-offset-2 focus-visible:ring-offset-ink',
          className,
        )}
      >
        <Image
          src="/images/profile-avatar.webp"
          alt={t('portraitLabel')}
          width={112}
          height={112}
          sizes="112px"
          priority
          className="h-full w-full object-cover transition-transform duration-500 ease-scene group-hover:scale-105"
        />

        {/* 悬浮轻量提示图标 */}
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 ease-scene group-hover:opacity-100 group-focus-visible:opacity-100"
          aria-hidden="true"
        >
          <span className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-ink/60 text-white/90 shadow-sm">
            <Maximize2 className="h-4 w-4" strokeWidth={1.75} />
          </span>
        </span>
      </button>

      {/* 原图全貌弹窗 Lightbox */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="portrait-modal-title"
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
              >
                {/* 遮罩背景 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={handleClose}
                  className="fixed inset-0 bg-ink/80 backdrop-blur-md"
                  aria-hidden="true"
                />

                {/* 居中卡片 */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.94, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: 12 }}
                  transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                  className="relative z-10 w-full max-w-[440px] overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-[0_24px_50px_rgba(0,0,0,0.5)] sm:p-5"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 关闭按钮 */}
                  <button
                    type="button"
                    onClick={handleClose}
                    aria-label={t('portraitClose')}
                    className="absolute right-3.5 top-3.5 z-20 grid h-8 w-8 place-items-center rounded-full border border-line/80 bg-ink/75 text-dim transition-colors hover:border-glow hover:bg-panel hover:text-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-glow"
                  >
                    <X className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  </button>

                  {/* 原图全景 */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-line/60 bg-ink shadow-inner">
                    <Image
                      src="/images/profile-full.webp"
                      alt={t('portraitModalTitle')}
                      fill
                      sizes="(max-width: 640px) 90vw, 440px"
                      priority
                      className="object-cover"
                    />
                  </div>

                  {/* 说明与文字温度 */}
                  <div className="pt-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <h2
                        id="portrait-modal-title"
                        className="font-serif text-[17px] font-medium leading-snug text-[var(--text)]"
                      >
                        {t('portraitModalTitle')}
                      </h2>
                      <span className="rounded-[3px] border border-line/60 bg-ink/50 px-2 py-0.5 text-[11px] tracking-wider text-dim">
                        {t('portraitModalTag')}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[13px] leading-[1.65] text-dim">
                      {t('portraitModalDesc')}
                    </p>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
