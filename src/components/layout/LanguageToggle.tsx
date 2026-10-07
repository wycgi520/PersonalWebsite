'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

export default function LanguageToggle() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const router = useRouter();
  // 不含语言前缀的当前路径，例如 /about
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;

  const switchLocale = () => {
    startTransition(() => {
      // 切换语言保持在同一页面；中间件会把选择写入 NEXT_LOCALE cookie
      router.replace(pathname, { locale: next, scroll: false });
    });
  };

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={isPending}
      lang={next === 'zh' ? 'zh-CN' : 'en'}
      aria-label={t('switchLang')}
      title={t('switchLang')}
      className={cn(
        'h-8 rounded-[3px] border border-line bg-transparent px-[11px] font-sans text-xs tracking-[0.06em] text-dim',
        'transition-colors duration-300 ease-scene hover:border-glow hover:text-glow',
        isPending && 'opacity-60'
      )}
    >
      {t('langButton')}
    </button>
  );
}
