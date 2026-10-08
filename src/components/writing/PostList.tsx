'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { LocalizedCategory, LocalizedPost } from '@/lib/data/posts';
import { usePostReactions } from '@/lib/hooks/usePostReactions';
import CategoryFilter, { type Filter } from './CategoryFilter';
import PostCard from './PostCard';

interface Props {
  posts: LocalizedPost[];
  categories: LocalizedCategory[];
}

/**
 * 分类筛选 + 文章列表。当前分类记在查询参数（/writing?cat=tech），可分享、刷新保留；
 * 切换用 replaceState，不额外制造历史条目。服务端渲染全部文章，无 JS 时内容完整可读。
 */
export default function PostList({ posts, categories }: Props) {
  const t = useTranslations('writing');
  const [filter, setFilter] = useState<Filter>('all');
  // 切换分类后才播放列表入场动画；首屏直接显示
  const [animate, setAnimate] = useState(false);
  const { liked, comments, toggleLike, addComment } = usePostReactions();

  useEffect(() => {
    const ids = new Set<string>(categories.map((c) => c.id));
    const sync = () => {
      const cat = new URLSearchParams(location.search).get('cat') ?? '';
      setFilter(ids.has(cat) ? (cat as Filter) : 'all');
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, [categories]);

  const change = useCallback((next: Filter) => {
    setFilter(next);
    setAnimate(true);
    const url = new URL(location.href);
    if (next === 'all') url.searchParams.delete('cat');
    else url.searchParams.set('cat', next);
    // 沿用当前 history.state，Next 路由靠它识别自己的历史条目
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  }, []);

  const counts = useMemo(() => {
    const c = { all: posts.length } as Record<Filter, number>;
    for (const cat of categories) c[cat.id] = posts.filter((p) => p.cat === cat.id).length;
    return c;
  }, [posts, categories]);

  const list = filter === 'all' ? posts : posts.filter((p) => p.cat === filter);

  return (
    <div>
      <CategoryFilter categories={categories} counts={counts} value={filter} onChange={change} />
      {/* key 随分类变化：重新挂载列表以重播入场动画 */}
      <div key={filter}>
        {list.length === 0 ? (
          <p className="py-10 text-[14px] text-dim">{t('empty')}</p>
        ) : (
          list.map((p, i) => (
            <PostCard
              key={p.id}
              post={p}
              liked={liked.has(p.id)}
              localComments={comments[p.id] ?? []}
              onLike={toggleLike}
              onComment={addComment}
              className={animate ? 'wr-rise' : undefined}
              style={animate ? { animationDelay: `${Math.min(i, 6) * 60}ms` } : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
