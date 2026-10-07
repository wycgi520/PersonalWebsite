'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="w-8 h-8 grid place-items-center text-sm border border-line rounded-sm text-dim transition-all duration-300"
        aria-label="切换主题"
      >
        <Moon size={14} />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-8 h-8 grid place-items-center text-sm border border-line rounded-sm text-dim hover:text-glow hover:border-glow transition-all duration-300"
      aria-label="切换日夜主题"
      title="切换主题"
    >
      {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
    </button>
  );
}
