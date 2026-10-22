'use client';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { returnToWriting, validCategory } from '@/lib/writing/navigation';
import { prefersReducedMotion } from '@/lib/motion';
import type { Locale } from '@/i18n/routing';

export function useReadingContext() {
  const [context, setContext] = useState({ cat: '', from: '' });
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setContext({
      cat: validCategory(query.get('cat')) ? query.get('cat')! : '',
      from: query.get('from') ?? '',
    });
  }, []);
  return context;
}

export function WritingReturn({ className }: { className?: string }) {
  const t = useTranslations('writing');
  const { cat, from } = useReadingContext();
  return (
    <Link
      className={
        className ??
        'group inline-flex items-center gap-1.5 text-sm text-dim transition-colors duration-300 ease-scene hover:text-glow'
      }
      href={returnToWriting(cat, from)}
    >
      <span aria-hidden="true" className="transition-transform duration-300 ease-scene group-hover:-translate-x-1">
        ←
      </span>
      <span>{t('backToWriting')}</span>
    </Link>
  );
}

export function OriginalLinks({ slug, locales }: { slug: string; locales: Locale[] }) {
  const t = useTranslations('writing');
  const { cat, from } = useReadingContext();
  const query = new URLSearchParams();
  if (cat) query.set('cat', cat);
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from)) query.set('from', from);
  return (
    <div className="flex flex-wrap gap-5">
      {locales.map((locale) => (
        <Link
          key={locale}
          locale={locale}
          href={`/writing/${slug}${query.size ? `?${query}` : ''}`}
          className="text-glow underline"
        >
          {t('readOriginal')} ({locale})
        </Link>
      ))}
    </div>
  );
}

export default function ReadingTools() {
  const t = useTranslations('writing');
  const { cat, from } = useReadingContext();
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? 'instant' : 'smooth',
    });
    document.getElementById('article-title')?.focus({ preventScroll: true });
  };

  const returnHref = returnToWriting(cat, from);

  return (
    <>
      <div
        ref={sentinelRef}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-[200px] h-px w-px"
      />
      <nav aria-label={t('readingTools')}>
        {/* 左侧悬浮：返回写作 */}
        <div
          className={`fixed z-30 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] left-4 sm:bottom-8 sm:left-6 min-[1400px]:left-[max(2rem,calc(50vw-680px))] transition-all duration-300 ease-scene ${
            visible
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <Link
            href={returnHref}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            aria-label={t('backToWriting')}
            className="group flex min-h-[42px] items-center gap-2 rounded-[4px] border border-line bg-panel/90 px-3.5 py-2 text-xs font-medium text-dim shadow-[0_10px_24px_-10px_rgba(4,7,13,0.45)] backdrop-blur-md transition-[color,border-color,transform] duration-300 ease-scene hover:border-glow hover:text-glow active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-glow min-[861px]:px-4 min-[861px]:py-2.5 min-[861px]:text-sm"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-scene group-hover:-translate-x-1"
            >
              ←
            </span>
            <span>{t('backToWriting')}</span>
          </Link>
        </div>

        {/* 右侧悬浮：回到顶部 */}
        <div
          className={`fixed z-30 bottom-[calc(1.25rem+env(safe-area-inset-bottom,0px))] right-4 sm:bottom-8 sm:right-6 min-[1400px]:right-[max(2rem,calc(50vw-680px))] transition-all duration-300 ease-scene ${
            visible
              ? 'opacity-100 translate-y-0 pointer-events-auto'
              : 'opacity-0 translate-y-3 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={scrollToTop}
            tabIndex={visible ? 0 : -1}
            aria-hidden={!visible}
            aria-label={t('backToTop')}
            className="group flex min-h-[42px] items-center gap-2 rounded-[4px] border border-line bg-panel/90 px-3.5 py-2 text-xs font-medium text-dim shadow-[0_10px_24px_-10px_rgba(4,7,13,0.45)] backdrop-blur-md transition-[color,border-color,transform] duration-300 ease-scene hover:border-glow hover:text-glow active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-glow min-[861px]:px-4 min-[861px]:py-2.5 min-[861px]:text-sm"
          >
            <span>{t('backToTop')}</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-300 ease-scene group-hover:-translate-y-1"
            >
              ↑
            </span>
          </button>
        </div>
      </nav>
    </>
  );
}
