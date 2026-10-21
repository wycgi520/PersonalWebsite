'use client';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useReadingContext } from './ReadingTools';
export default function ArticleNeighbors({previous, next}: {previous?: {id: string; title: string}; next?: {id: string; title: string}}) {
  const t = useTranslations('writing'); const context = useReadingContext();
  const query = new URLSearchParams();
  if (context.cat) query.set('cat', context.cat);
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(context.from)) query.set('from', context.from);
  const suffix = query.size ? `?${query}` : '';
  if (!previous && !next) return null;
  return <nav aria-label={t('adjacentArticles')} className="my-10 grid gap-4 border-y border-line py-6 sm:grid-cols-2">
    {previous ? <Link href={`/writing/${previous.id}${suffix}`} rel="prev" className="block p-3 hover:bg-panel"><span className="mb-2 block text-xs text-dim">← {t('previous')}</span>{previous.title}</Link> : <span />}
    {next && <Link href={`/writing/${next.id}${suffix}`} rel="next" className="block p-3 hover:bg-panel sm:text-right"><span className="mb-2 block text-xs text-dim">{t('next')} →</span>{next.title}</Link>}
  </nav>;
}
