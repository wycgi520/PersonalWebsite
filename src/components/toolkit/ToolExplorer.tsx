'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  matchesTerms,
  queryTerms,
  type LocalizedTool,
  type LocalizedToolTag,
  type ToolTagId,
} from '@/lib/data/tools';
import { cn } from '@/lib/utils';
import ToolCard from './ToolCard';
import ToolSearch from './ToolSearch';

type Filter = ToolTagId | 'all';

interface Props {
  tools: LocalizedTool[];
  tags: LocalizedToolTag[];
}

/**
 * 搜索 + 标签筛选 + 卡片网格。状态记在查询参数（/toolkit?q=prisma&tag=dev），可分享、刷新保留；
 * 输入时防抖写回 URL（replaceState），不制造历史条目。服务端渲染全部条目，无 JS 时内容完整可读。
 */
export default function ToolExplorer({ tools, tags }: Props) {
  const t = useTranslations('toolkit');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  // 用户改过条件后才播放卡片入场动画；首屏直接显示
  const [animate, setAnimate] = useState(false);
  const urlTimer = useRef<number>();

  useEffect(() => {
    const ids = new Set<string>(tags.map((g) => g.id));
    const sync = () => {
      const params = new URLSearchParams(location.search);
      const tag = params.get('tag') ?? '';
      setQuery(params.get('q') ?? '');
      setFilter(ids.has(tag) ? (tag as Filter) : 'all');
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.clearTimeout(urlTimer.current);
    };
  }, [tags]);

  const writeUrl = useCallback((q: string, tag: Filter, delay: number) => {
    window.clearTimeout(urlTimer.current);
    urlTimer.current = window.setTimeout(() => {
      const url = new URL(location.href);
      const trimmed = q.trim();
      if (trimmed) url.searchParams.set('q', trimmed);
      else url.searchParams.delete('q');
      if (tag === 'all') url.searchParams.delete('tag');
      else url.searchParams.set('tag', tag);
      // 沿用当前 history.state，Next 路由靠它识别自己的历史条目
      history.replaceState(history.state, '', url.pathname + url.search + url.hash);
    }, delay);
  }, []);

  const changeQuery = (q: string) => {
    setQuery(q);
    // 不在这里打开动画：已显示的卡片加上动画类会整体重播一次
    writeUrl(q, filter, 300);
  };

  const changeFilter = (tag: Filter) => {
    setFilter(tag);
    setAnimate(true);
    writeUrl(query, tag, 0);
  };

  const reset = () => {
    setQuery('');
    setFilter('all');
    setAnimate(true);
    writeUrl('', 'all', 0);
  };

  const terms = useMemo(() => queryTerms(query), [query]);
  // 先按关键词筛，标签上的数字表示"在当前搜索下这个标签还剩几条"
  const searched = useMemo(() => tools.filter((x) => matchesTerms(x, terms)), [tools, terms]);
  const counts = useMemo(() => {
    const c = { all: searched.length } as Record<Filter, number>;
    for (const g of tags) c[g.id] = searched.filter((x) => x.tag === g.id).length;
    return c;
  }, [searched, tags]);
  const list = filter === 'all' ? searched : searched.filter((x) => x.tag === filter);

  const options: { id: Filter; label: string }[] = [{ id: 'all', label: t('all') }, ...tags];
  const filtered = terms.length > 0 || filter !== 'all';

  return (
    <div>
      <ToolSearch value={query} onChange={changeQuery} />
      <div role="group" aria-label={t('filterLabel')} className="mb-2 flex flex-wrap gap-[7px]">
        {options.map((o) => {
          const active = o.id === filter;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={active}
              onClick={() => changeFilter(o.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-[13px] py-1.5 text-[12.5px] transition-colors duration-300 ease-scene',
                active
                  ? 'border-glow bg-[var(--glow-soft)] text-glow'
                  : 'border-line text-dim hover:text-[var(--text)]'
              )}
            >
              {o.label}
              <span className={cn('text-[10.5px] tabular-nums', active ? 'opacity-80' : 'opacity-60')}>
                {counts[o.id]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 读屏软件播报结果数；视觉上只在筛选时显示 */}
      <p aria-live="polite" className={cn('mb-0 mt-3 text-[12px] tracking-[0.04em] text-dim', !filtered && 'sr-only')}>
        {t('resultCount', { count: list.length, total: tools.length })}
      </p>

      {list.length === 0 ? (
        <div className="py-[30px] text-[13.5px] text-dim">
          <p className="m-0 mb-3">{t('empty')}</p>
          <button
            type="button"
            onClick={reset}
            className="rounded-[3px] border border-line px-[15px] py-2 text-[12.5px] text-[var(--text)] transition-colors duration-300 ease-scene hover:border-glow hover:text-glow"
          >
            {t('reset')}
          </button>
        </div>
      ) : (
        // 宽屏四列，随宽度自动减列。切换标签时整组重播入场动画；
        // 输入关键词时不重挂载，只有新出现的卡片浮现，避免每敲一个字全体闪一下
        <div
          key={filter}
          className="mt-[10px] grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4"
        >
          {list.map((x, i) => (
            <ToolCard
              key={x.id}
              tool={x}
              terms={terms}
              className={animate ? 'wr-rise' : undefined}
              style={animate ? { animationDelay: `${Math.min(i, 8) * 45}ms` } : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
