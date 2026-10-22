'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import MotionToggle from './MotionToggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/projects', key: 'projects' },
  { href: '/writing', key: 'writing' },
  { href: '/toolkit', key: 'toolkit' },
  { href: '/contact', key: 'contact' },
] as const;

export default function Navigation() {
  const t = useTranslations('nav');
  // next-intl 的 usePathname 已去掉语言前缀
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-[18px] pt-3',
        'bg-[linear-gradient(to_bottom,var(--ink)_65%,transparent)]',
        'min-[861px]:h-[72px] min-[861px]:flex-nowrap min-[861px]:gap-6 min-[861px]:px-10 min-[861px]:py-0',
        'min-[861px]:bg-[linear-gradient(to_bottom,var(--ink)_24%,transparent)]'
      )}
    >
      <Link
        href="/"
        className="order-1 font-serif text-[20px] font-medium tracking-[0.01em] text-[var(--text)] transition-colors duration-300 ease-scene hover:text-glow min-[861px]:text-[22px]"
      >
        {t('brand')}
      </Link>

      <nav
        aria-label={t('menuLabel')}
        className="scrollbar-none order-3 flex w-full gap-0.5 overflow-x-auto pb-1 min-[861px]:order-2 min-[861px]:w-auto min-[861px]:gap-1 min-[861px]:overflow-visible min-[861px]:pb-0"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'relative flex-none whitespace-nowrap rounded-[4px] px-3 py-2 text-[13px] font-normal tracking-[0.02em]',
                'min-[861px]:px-3.5 min-[861px]:py-2 min-[861px]:text-[13.5px]',
                'transition-colors duration-300 ease-scene hover:bg-[var(--glow-soft)] hover:text-[var(--text)] active:scale-[0.98]',
                active
                  ? 'text-glow after:absolute after:bottom-0.5 after:left-3 after:right-3 after:h-px after:bg-glow min-[861px]:after:bottom-1 min-[861px]:after:left-3.5 min-[861px]:after:right-3.5'
                  : 'text-dim'
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      <div className="order-2 ml-auto flex items-center gap-2 min-[861px]:order-3 min-[861px]:ml-0">
        <LanguageToggle />
        <MotionToggle />
        <ThemeToggle />
      </div>
    </header>
  );
}
