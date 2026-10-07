'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/', label: '首页', labelEn: 'Home' },
  { href: '/about', label: '关于', labelEn: 'About' },
  { href: '/projects', label: '项目', labelEn: 'Projects' },
  { href: '/writing', label: '写作', labelEn: 'Writing' },
  { href: '/toolkit', label: '工具箱', labelEn: 'Toolkit' },
  { href: '/contact', label: '联系', labelEn: 'Contact' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-6 px-10 py-5 bg-gradient-to-b from-[var(--ink)] via-[var(--ink)] to-transparent">
      <Link href="/" className="brand flex items-baseline gap-2.5 font-serif text-[21px] tracking-wide">
        <i className="mark w-[9px] h-[9px] rounded-full bg-glow shadow-[0_0_12px_var(--glow)] flex-none -translate-y-[3px]" />
        <span>观星台</span>
        <small className="font-sans text-[11px] text-dim tracking-[0.14em]">GY · OBSERVATORY</small>
      </Link>

      <div className="menu flex gap-1" role="tablist">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative px-3.5 py-2 text-[13.5px] font-normal tracking-wide rounded-sm transition-all duration-300',
                'hover:text-[var(--text)] hover:bg-[var(--glow-soft)]',
                isActive
                  ? 'text-glow after:absolute after:left-3.5 after:right-3.5 after:bottom-[3px] after:h-px after:bg-glow'
                  : 'text-dim'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="tools flex items-center gap-2">
        <button className="px-3 h-8 text-xs tracking-wider border border-line rounded-sm text-dim hover:text-glow hover:border-glow transition-all duration-300">
          中 / EN
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
}
