'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { LocalizedPost } from '@/lib/data/posts';
import { cn } from '@/lib/utils';

export default function PostCard({
  post: p,
  category,
  className,
  style,
}: {
  post: LocalizedPost;
  category: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const t = useTranslations('writing');
  const query = new URLSearchParams({ from: p.id });
  if (category !== 'all') query.set('cat', category);
  const href = `/writing/${p.id}?${query}`;

  return (
    <article
      id={p.id}
      className={cn('scroll-mt-[140px] border-b border-line py-6', className)}
      style={style}
    >
      <div className="mb-2.5 flex flex-wrap items-center gap-3 text-xs tabular-nums text-dim">
        <span className="rounded-[3px] bg-[var(--glow-soft)] px-2 py-0.5 text-[11.5px] font-medium text-glow">
          {p.catLabel}
        </span>
        <time dateTime={p.date}>{p.date}</time>
        <span>{t('readTime', { minutes: p.read })}</span>
      </div>
      <h2 className="mb-2.5 font-serif text-[23px] font-medium leading-[1.35]">
        <Link
          className="transition-colors duration-300 ease-scene hover:text-glow focus-visible:outline focus-visible:outline-glow"
          href={href}
        >
          {p.title}
        </Link>
      </h2>
      <p className="mb-3.5 max-w-[66ch] text-[14.5px] leading-[1.8] text-dim">{p.summary}</p>
      <Link
        className="inline-flex items-center gap-1 text-[13px] font-medium text-glow underline-offset-4 hover:underline"
        href={href}
      >
        {t('readMore')} <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}
