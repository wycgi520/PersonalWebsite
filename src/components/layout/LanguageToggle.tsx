'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { validCategory } from '@/lib/writing/navigation';
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
      const query = new URLSearchParams(location.search);
      const cat = query.get('cat');
      const from = query.get('from');
      const safe = new URLSearchParams();
      if (validCategory(cat)) safe.set('cat', cat);
      if (from && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(from)) safe.set('from', from);
      router.replace(pathname + (safe.size ? `?${safe}` : '') + location.hash, { locale: next, scroll: false });
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
        'h-8 rounded-[4px] border border-line bg-transparent px-[11px] font-sans text-xs tracking-[0.04em] text-dim',
        'transition-[color,border-color,transform] duration-300 ease-scene hover:border-glow hover:text-glow active:scale-[0.98]',
        isPending && 'opacity-60'
      )}
    >
      {t('langButton')}
    </button>
  );
}
