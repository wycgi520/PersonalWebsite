'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import type { LocalizedProject } from '@/lib/data/projects';
import ProjectThumb from './ProjectThumb';
import { pad } from './ProjectCard';

interface Props {
  project: LocalizedProject;
  open: boolean;
  onClose: () => void;
}

const btn =
  'inline-flex items-center rounded-[3px] border px-[17px] py-[9px] text-[13px] transition-colors duration-300 ease-scene';
const btnKey = `${btn} border-glow bg-[var(--glow-soft)] text-glow hover:bg-transparent`;
const btnPlain = `${btn} border-line text-[var(--text)] hover:border-glow hover:text-glow`;

/**
 * 项目详情抽屉：原生 <dialog> 模态打开，自带焦点限制、Esc 关闭、关闭后焦点回到卡片。
 * 内容随页面一起预渲染（便于抓取）；无 JS 时由 :target 显示，见 globals.css。
 */
export default function ProjectDetail({ project: p, open, onClose }: Props) {
  const t = useTranslations('projects');
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open) {
      delete d.dataset.closing;
      if (!d.open) d.showModal();
      return;
    }
    if (!d.open) return;
    // 先播放退场动画再真正关闭；reduced-motion 下动画时长近 0，animationend 照常触发
    d.dataset.closing = '';
    const done = () => {
      delete d.dataset.closing;
      d.close();
    };
    d.addEventListener('animationend', done, { once: true });
    const fallback = setTimeout(done, 600);
    return () => {
      d.removeEventListener('animationend', done);
      clearTimeout(fallback);
    };
  }, [open]);

  const links = [
    p.demoUrl && { href: p.demoUrl, label: t('demo'), key: true },
    p.repoUrl && { href: p.repoUrl, label: t('source'), key: false },
  ].filter(Boolean) as { href: string; label: string; key: boolean }[];

  return (
    <dialog
      ref={ref}
      id={p.id}
      className="pj-drawer"
      aria-labelledby={`${p.id}-title`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // 内容铺满整个 dialog，点到 dialog 本身说明点在了遮罩上
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="flex min-h-full flex-col">
        <div className="relative aspect-[16/7] flex-none overflow-hidden border-b border-line">
          <ProjectThumb hue={p.hue} seed={p.seed} />
          <a
            href={`#card-${p.id}`}
            aria-label={t('closeLabel')}
            className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-[3px] border border-line bg-panel text-dim transition-colors duration-300 ease-scene hover:border-glow hover:text-glow"
            onClick={(e) => {
              e.preventDefault();
              onClose();
            }}
          >
            <X size={16} strokeWidth={1.5} aria-hidden="true" />
          </a>
        </div>

        <article className="flex-1 px-[19px] pb-8 pt-6 min-[721px]:px-8 min-[721px]:pt-[30px]">
          <div className="mb-2 text-[11px] tracking-[0.1em] text-dim">{pad(p.index)}</div>
          <h2 id={`${p.id}-title`} className="mb-1 font-serif text-[27px] font-medium leading-[1.2]">
            {p.title}
          </h2>
          <div className="mb-[22px] text-[12px] tracking-[0.06em] text-dim">
            {p.year} · {p.tags.join(' / ')}
          </div>

          <p className="mb-6 border-l-2 border-glow pl-4 text-[14px] leading-[1.78] text-dim">{p.summary}</p>

          <dl className="mb-7 grid grid-cols-1 gap-y-1 min-[721px]:grid-cols-[120px_1fr] min-[721px]:gap-x-[22px] min-[721px]:gap-y-[14px]">
            {(
              [
                ['architecture', p.architecture],
                ['tradeoff', p.tradeoff],
                ['outcome', p.outcome],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="contents">
                <dt className="pt-3 text-[12px] tracking-[0.08em] text-dim min-[721px]:pt-[3px]">{t(k)}</dt>
                <dd className="m-0 text-[14px] leading-[1.78]">{v}</dd>
              </div>
            ))}
          </dl>

          {links.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {links.map((l) =>
                l.href.startsWith('/') ? (
                  <Link key={l.label} href={l.href} className={l.key ? btnKey : btnPlain}>
                    {l.label}
                  </Link>
                ) : (
                  <a
                    key={l.label}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={l.key ? btnKey : btnPlain}
                  >
                    {l.label} ↗
                  </a>
                )
              )}
            </div>
          ) : (
            <p className="rounded-r-[3px] border border-l-2 border-line border-l-glow bg-[var(--ink)] px-4 py-3 text-[13px] leading-[1.7] text-dim">
              {t('privateNote')}
            </p>
          )}
        </article>
      </div>
    </dialog>
  );
}
