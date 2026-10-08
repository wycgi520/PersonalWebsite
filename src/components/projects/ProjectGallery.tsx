'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LocalizedProject } from '@/lib/data/projects';
import ProjectCard from './ProjectCard';
import ProjectDetail from './ProjectDetail';

/**
 * 卡片网格 + 详情抽屉。打开的项目记在 URL hash（/projects#atlas）：
 * 可分享、刷新后仍打开、浏览器后退即关闭。
 */
export default function ProjectGallery({ projects }: { projects: LocalizedProject[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  // 抽屉是否由本页 pushState 打开：是则关闭时后退，否则（直达链接）只替换掉 hash
  const pushed = useRef(false);

  useEffect(() => {
    // 有 JS 时关掉 :target 兜底，改由 <dialog> 控制
    rootRef.current?.setAttribute('data-js', '');

    const ids = new Set(projects.map((p) => p.id));
    const sync = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      setOpenId(ids.has(id) ? id : null);
      if (!ids.has(id)) pushed.current = false;
    };
    sync();
    // pushState 之间的后退/前进不一定触发 hashchange，两个都听
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [projects]);

  const open = useCallback((id: string) => {
    // 沿用当前 history.state，Next 路由靠它识别自己的历史条目
    history.pushState(history.state, '', `#${id}`);
    pushed.current = true;
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    if (pushed.current) {
      pushed.current = false;
      history.back(); // popstate → sync → openId 置空
      return;
    }
    history.replaceState(history.state, '', location.pathname + location.search);
    setOpenId(null);
  }, []);

  return (
    <div ref={rootRef} className="pj-root">
      <div className="grid grid-cols-1 gap-6 min-[981px]:grid-cols-[repeat(auto-fill,minmax(430px,1fr))]">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onOpen={open} />
        ))}
      </div>
      {projects.map((p) => (
        <ProjectDetail key={p.id} project={p} open={openId === p.id} onClose={close} />
      ))}
    </div>
  );
}
