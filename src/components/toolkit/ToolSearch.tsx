'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

/** 输入框正在接收文字时不抢 "/" 快捷键 */
function isTyping(el: Element | null) {
  if (!el) return false;
  if (el instanceof HTMLElement && el.isContentEditable) return true;
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT';
}

/**
 * 实时搜索框：按 "/" 聚焦，Esc 清空（已空时失焦），右侧清除按钮。
 * type="search" 让移动端键盘显示"搜索"键；浏览器自带的清除叉号用 CSS 隐藏，统一用自己的按钮。
 */
export default function ToolSearch({ value, onChange }: Props) {
  const t = useTranslations('toolkit');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey || isTyping(document.activeElement)) return;
      e.preventDefault();
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div role="search" className="relative mb-[18px] max-w-[420px]">
      <Search
        aria-hidden="true"
        size={15}
        strokeWidth={1.75}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dim"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key !== 'Escape') return;
          if (value) {
            e.preventDefault();
            onChange('');
          } else {
            e.currentTarget.blur();
          }
        }}
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchLabel')}
        aria-keyshortcuts="/"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        className="wr-input tk-search w-full py-[10px] pl-[34px] pr-[38px]"
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
          aria-label={t('clearSearch')}
          className="absolute right-1.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[3px] text-dim transition-colors duration-300 ease-scene hover:text-glow"
        >
          <X aria-hidden="true" size={14} strokeWidth={1.75} />
        </button>
      ) : (
        <kbd
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded-[3px] border border-line px-1.5 py-px font-mono text-[10.5px] text-dim min-[721px]:block"
        >
          /
        </kbd>
      )}
    </div>
  );
}
