'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Moon, Sun } from 'lucide-react';

const BTN =
  'grid h-8 w-8 place-items-center rounded-[3px] border border-line text-dim transition-colors duration-300 ease-scene hover:border-glow hover:text-glow';

export default function ThemeToggle() {
  const t = useTranslations('nav');
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 服务端不知道用户选的主题，挂载前渲染同尺寸占位，避免 hydration 不一致
  const isDark = !mounted || resolvedTheme !== 'light';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className={BTN}
      aria-label={t('switchTheme')}
      title={t('switchTheme')}
    >
      {isDark ? <Moon size={14} aria-hidden="true" /> : <Sun size={14} aria-hidden="true" />}
    </button>
  );
}
