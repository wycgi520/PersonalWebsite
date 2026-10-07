import type { routing } from '@/i18n/routing';
import type zh from '@/lib/i18n/zh.json';

// 让 useTranslations / getTranslations 的 key 获得类型提示与校验
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof zh;
  }
}
