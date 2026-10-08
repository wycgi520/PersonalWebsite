import type { MetadataRoute } from 'next';
import { routing, HTML_LANG } from '@/i18n/routing';
import { PAGES } from '@/lib/seo';
import { SITE_URL } from '@/lib/data/site';

// 每个页面的每种语言一条，并互相标注其他语言版本（hreflang）
export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${SITE_URL}/${locale}${path}`,
      changeFrequency: path === '/writing' ? 'weekly' : 'monthly',
      priority: path === '' ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `${SITE_URL}/${l}${path}`])),
      },
    }))
  );
}
