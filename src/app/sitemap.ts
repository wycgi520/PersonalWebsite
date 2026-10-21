import type { MetadataRoute } from 'next';
import { routing, HTML_LANG } from '@/i18n/routing';
import { PAGES } from '@/lib/seo';
import { SITE_URL } from '@/lib/data/site';
import { publishedArticles } from '@/lib/writing/content';

// 每个页面的每种语言一条，并互相标注其他语言版本（hreflang）
export default function sitemap(): MetadataRoute.Sitemap {
  const articles = publishedArticles();
  return [...PAGES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: path === '/writing' ? 'weekly' as const : 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `${SITE_URL}/${l}${path}`])),
      },
    }))
  ), ...articles.map(p => ({
    url: `${SITE_URL}/${p.locale}/writing/${p.id}`,
    lastModified: new Date(p.updated ?? p.date),
    alternates: { languages: Object.fromEntries(articles.filter(v => v.id === p.id).map(v => [HTML_LANG[v.locale], `${SITE_URL}/${v.locale}/writing/${v.id}`])) },
  }))];
}
