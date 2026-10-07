import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['zh', 'en'],
  defaultLocale: 'zh',
  // 所有语言都带前缀：/zh、/en，根路径 / 由中间件按 cookie / Accept-Language 重定向
  localePrefix: 'always',
});

export type Locale = (typeof routing.locales)[number];

/** <html lang> 使用的 BCP 47 标签 */
export const HTML_LANG: Record<Locale, string> = {
  zh: 'zh-CN',
  en: 'en',
};
