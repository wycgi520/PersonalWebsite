import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, HTML_LANG, type Locale } from '@/i18n/routing';
import { publishedArticles, adjacentArticles } from '@/lib/writing/content';
import { renderMarkdown } from '@/lib/writing/markdown';
import { SITE_URL } from '@/lib/data/site';
import ReadingTools, { OriginalLinks, WritingReturn } from '@/components/writing/ReadingTools';
import ArticleNeighbors from '@/components/writing/ArticleNeighbors';
import ArticleDiscussion from '@/components/writing/ArticleDiscussion';
type Props = {params: Promise<{locale: string; slug: string}>};
export function generateStaticParams() {
  return publishedArticles().map(p => ({locale: p.locale, slug: p.id}));
}
export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale, slug} = await params;
  const variants = publishedArticles().filter(p => p.id === slug);
  const p = variants.find(p => p.locale === locale);
  if (!p) return {title: locale === 'zh' ? '译文暂未发布' : 'Translation unavailable', robots: {index: false, follow: true}};
  const url = `/${locale}/writing/${slug}`;
  const languages = Object.fromEntries(variants.map(v => [HTML_LANG[v.locale], `/${v.locale}/writing/${slug}`]));
  const image = `${SITE_URL}/${locale}/opengraph-image`;
  return {title: `${p.title} · ${locale === 'zh' ? '观星台' : 'Observatory'}`, description: p.summary,
    alternates: {canonical: url, languages},
    openGraph: {type: 'article', title: p.title, description: p.summary, url, publishedTime: p.date, modifiedTime: p.updated ?? p.date, images: [image]},
    twitter: {card: 'summary_large_image', title: p.title, description: p.summary, images: [image]}};
}
export default async function ArticlePage({params}: Props) {
  const {locale: raw, slug} = await params;
  if (!routing.locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale; setRequestLocale(locale);
  const t = await getTranslations('writing');
  const variants = publishedArticles().filter(p => p.id === slug);
  if (!variants.length) notFound();
  const p = variants.find(p => p.locale === locale);
  if (!p) return <section className="scene mx-auto max-w-3xl px-5 pb-20 pt-36"><WritingReturn /><h1 className="my-8 font-serif text-3xl">{t('translationMissing')}</h1><OriginalLinks slug={slug} locales={variants.map(v => v.locale)} /></section>;
  const {html, headings} = await renderMarkdown(p.body);
  const {previous, next} = adjacentArticles(publishedArticles(locale), slug);
  const neighbors = {previous: previous && {id: previous.id, title: previous.title}, next: next && {id: next.id, title: next.title}};
  const toc = <ol className="space-y-3">{headings.map(h => <li key={h.id} style={{paddingLeft: h.level === 3 ? 14 : 0}}><a className="hover:text-glow" href={`#${h.id}`}>{h.title}</a></li>)}</ol>;
  const structured = {'@context': 'https://schema.org', '@type': 'Article', headline: p.title, description: p.summary,
    datePublished: p.date, dateModified: p.updated ?? p.date, inLanguage: HTML_LANG[locale],
    mainEntityOfPage: `${SITE_URL}/${locale}/writing/${slug}`, author: {'@type': 'Person', name: locale === 'zh' ? '国易' : 'Guo Yi', url: SITE_URL}};
  return <section className="scene px-[18px] pb-36 pt-[140px] min-[861px]:px-10 min-[861px]:pt-[112px]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(structured).replace(/</g, '\\u003c')}} />
    <div className="mx-auto max-w-[1100px]">
      <WritingReturn />
      <header className="mb-10 mt-8 max-w-[760px] border-b border-line pb-8">
        <div className="mb-4 flex flex-wrap gap-3 text-xs text-dim"><span className="text-glow">{p.catLabel}</span><time dateTime={p.date}>{p.date}</time><span>{t('readTime', {minutes: p.read})}</span>{p.updated && <span>{t('updated')} <time dateTime={p.updated}>{p.updated}</time></span>}</div>
        <h1 id="article-title" tabIndex={-1} className="font-serif text-[clamp(30px,4vw,48px)] leading-[1.3] outline-none">{p.title}</h1>
        <p className="mt-5 text-base leading-8 text-dim">{p.summary}</p>
      </header>
      <div className={`grid items-start gap-12 ${headings.length ? 'min-[1100px]:grid-cols-[minmax(0,760px)_220px]' : ''}`}>
        <div className="min-w-0 max-w-[760px]">
          {headings.length > 0 && <details className="mb-8 border border-line bg-panel p-4 min-[1100px]:hidden"><summary className="cursor-pointer text-sm">{t('contents')}</summary><nav aria-label={t('contents')} className="mt-4 text-sm text-dim">{toc}</nav></details>}
          <article className="article-prose" dangerouslySetInnerHTML={{__html: html}} />
          <ArticleDiscussion key={slug} slug={slug}><ArticleNeighbors {...neighbors} /></ArticleDiscussion>
        </div>
        {headings.length > 0 && <aside className="sticky top-28 hidden max-h-[70vh] overflow-auto border-l border-line pl-5 text-sm text-dim min-[1100px]:block"><h2 className="mb-5 text-xs tracking-widest">{t('contents')}</h2><nav aria-label={t('contents')}>{toc}</nav></aside>}
      </div>
    </div><ReadingTools />
  </section>;
}
