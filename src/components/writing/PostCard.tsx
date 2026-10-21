'use client';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import type {LocalizedPost} from '@/lib/data/posts';
import {cn} from '@/lib/utils';
export default function PostCard({post: p, category, className, style}: {post: LocalizedPost; category: string; className?: string; style?: React.CSSProperties}) {
 const t = useTranslations('writing');
 const query = new URLSearchParams({from: p.id});
 if (category !== 'all') query.set('cat',category);
 const href = `/writing/${p.id}?${query}`;
 return <article id={p.id} className={cn('scroll-mt-[140px] border-b border-line py-6',className)} style={style}>
  <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-dim"><span className="border border-glow px-2 py-0.5 text-glow">{p.catLabel}</span><time dateTime={p.date}>{p.date}</time><span>{t('readTime',{minutes:p.read})}</span></div>
  <h2 className="mb-3 font-serif text-2xl leading-snug"><Link className="hover:text-glow focus-visible:outline focus-visible:outline-glow" href={href}>{p.title}</Link></h2>
  <p className="mb-4 max-w-[68ch] text-sm leading-[1.8] text-dim">{p.summary}</p>
  <Link className="text-sm text-glow underline-offset-4 hover:underline" href={href}>{t('readMore')} <span aria-hidden="true">↗</span></Link>
 </article>;
}
