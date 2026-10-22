import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { LocalizedProject } from '@/lib/data/projects';
import ProjectThumb from './ProjectThumb';

interface Props {
  project: LocalizedProject;
  onOpen: (id: string) => void;
}

/**
 * 卡片本身是指向 #id 的链接：无 JS 时跳到对应详情（:target 显示），复制链接可直达；
 * 有 JS 时由 ProjectGallery 拦截并打开详情抽屉。
 */
export default function ProjectCard({ project: p, onOpen }: Props) {
  const t = useTranslations('projects');

  return (
    <a
      id={`card-${p.id}`}
      href={`#${p.id}`}
      className="pj-card group flex flex-col overflow-hidden rounded-[4px] border border-line bg-panel text-left transition-[border-color,transform,box-shadow] duration-[350ms] ease-scene hover:-translate-y-[2px] hover:border-glow hover:shadow-[0_12px_28px_-14px_rgba(4,7,13,0.45)] focus-visible:-translate-y-[2px] focus-visible:border-glow active:scale-[0.99]"
      aria-haspopup="dialog"
      onClick={(e) => {
        // 保留 Ctrl/⌘/中键 在新标签页打开的行为
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onOpen(p.id);
      }}
    >
      <div className="relative aspect-[2/1] overflow-hidden border-b border-line bg-panel">
        {p.image ? (
          <Image
            src={p.image}
            alt={p.title}
            fill
            className="object-cover object-top transition-transform duration-500 ease-scene group-hover:scale-[1.035]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
          />
        ) : (
          <ProjectThumb hue={p.hue} seed={p.seed} />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pb-4 pt-4">
        <div className="mb-1.5 flex items-baseline justify-between gap-3">
          <h3 className="m-0 font-serif text-[18px] font-medium leading-[1.3] transition-colors duration-300 ease-scene group-hover:text-glow">
            {p.title}
          </h3>
          <time className="flex-none text-[12px] tabular-nums tracking-[0.04em] text-dim">{p.year}</time>
        </div>
        <p className="mb-4 line-clamp-3 text-[13.5px] leading-[1.68] text-dim">{p.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <ul className="flex flex-wrap gap-1.5">
            {p.tags.map((tag) => (
              <li
                key={tag}
                className="rounded-[3px] border border-line px-2 py-[3px] text-[11px] tracking-[0.02em] text-dim"
              >
                {tag}
              </li>
            ))}
          </ul>
          <span
            className="flex-none whitespace-nowrap text-[12px] tracking-[0.03em] text-dim transition-colors duration-300 ease-scene group-hover:text-glow"
            aria-hidden="true"
          >
            {t('open')} →
          </span>
        </div>
      </div>
    </a>
  );
}
