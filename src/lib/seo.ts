import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { routing, HTML_LANG, type Locale } from '@/i18n/routing';

/** 预渲染的全部页面（不含语言前缀），sitemap 与 metadata 共用 */
export const PAGES = ['', '/about', '/projects', '/writing', '/toolkit', '/contact'] as const;
export type PagePath = (typeof PAGES)[number];

type Section = 'about' | 'projects' | 'writing' | 'toolkit' | 'contact';

/** 分享图尺寸与替代文本，opengraph-image.tsx 共用 */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = 'Observatory · Guo Yi, full-stack engineer';

/** Open Graph 用的 locale 写法 */
const OG_LOCALE: Record<Locale, string> = { zh: 'zh_CN', en: 'en_US' };

/** 某页面各语言版本的地址（相对 metadataBase），x-default 交给中间件按语言重定向 */
export function languageAlternates(path: PagePath) {
  return {
    ...Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `/${l}${path}`])),
    'x-default': path || '/',
  };
}

/**
 * 页面 metadata：标题、描述、canonical、hreflang、Open Graph、Twitter 卡片。
 * section 省略时为首页，文案取 meta 命名空间；否则取对应页面的 metaTitle / metaDescription。
 * 分享图由 app/[locale]/opengraph-image.tsx 生成。
 */
export async function pageMetadata(locale: Locale, section?: Section): Promise<Metadata> {
  const tm = await getTranslations({ locale, namespace: 'meta' });
  let title = tm('title');
  let description = tm('description');
  if (section) {
    const t = await getTranslations({ locale, namespace: section });
    title = `${t('metaTitle')} · ${title}`;
    description = t('metaDescription');
  }
  const path: PagePath = section ? `/${section}` : '';
  const url = `/${locale}${path}`;
  // 子页面自己的 openGraph 会整体覆盖上层，文件约定注入的分享图随之丢失，这里显式引用同一张
  const image = { url: `/${locale}/opengraph-image`, width: OG_SIZE.width, height: OG_SIZE.height, alt: OG_ALT };

  return {
    title,
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      siteName: tm('title'),
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
