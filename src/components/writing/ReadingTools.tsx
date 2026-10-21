'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { returnToWriting, validCategory } from '@/lib/writing/navigation';
import { prefersReducedMotion } from '@/lib/motion';
import type { Locale } from '@/i18n/routing';
export function useReadingContext() {
  const [context, setContext] = useState({cat: '', from: ''});
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setContext({cat: validCategory(query.get('cat')) ? query.get('cat')! : '', from: query.get('from') ?? ''});
  }, []);
  return context;
}
export function WritingReturn() {
  const t = useTranslations('writing'); const {cat, from} = useReadingContext();
  return <Link className="text-sm text-dim underline-offset-4 hover:text-glow hover:underline" href={returnToWriting(cat, from)}>← {t('backToWriting')}</Link>;
}
export function OriginalLinks({slug, locales}: {slug: string; locales: Locale[]}) {
  const t = useTranslations('writing'); const {cat, from} = useReadingContext();
  const query = new URLSearchParams();
  if (cat) query.set('cat', cat);
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from)) query.set('from', from);
  return <div className="flex flex-wrap gap-5">{locales.map(locale => <Link key={locale} locale={locale} href={`/writing/${slug}${query.size ? `?${query}` : ''}`} className="text-glow underline">{t('readOriginal')} ({locale})</Link>)}</div>;
}
export default function ReadingTools() {
  const t = useTranslations('writing'); const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const update = () => setShowTop(window.scrollY > window.innerHeight);
    update(); window.addEventListener('scroll', update, {passive: true});
    return () => window.removeEventListener('scroll', update);
  }, []);
  return <nav aria-label={t('readingTools')} className="reading-tools">
    <WritingReturn />
    {showTop && <button type="button" className="text-sm text-glow" onClick={() => {
      window.scrollTo({top: 0, behavior: prefersReducedMotion() ? 'instant' : 'smooth'});
      document.getElementById('article-title')?.focus({preventScroll: true});
    }}>{t('backToTop')} ↑</button>}
  </nav>;
}
