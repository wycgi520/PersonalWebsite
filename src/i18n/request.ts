import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import zh from '@/lib/i18n/zh.json';
import en from '@/lib/i18n/en.json';

// 以中文字典为基准做结构校验：en.json 缺键或多键时 tsc 直接报错
const messages: Record<(typeof routing.locales)[number], typeof zh> = { zh, en };

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: messages[locale],
  };
});
