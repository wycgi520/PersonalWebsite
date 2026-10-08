import { Fragment } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowUpRight } from 'lucide-react';
import type { LocalizedTool } from '@/lib/data/tools';
import { cn } from '@/lib/utils';

interface Props {
  tool: LocalizedTool;
  /** 当前搜索关键词（已小写），在名称和介绍里高亮 */
  terms: string[];
  className?: string;
  style?: React.CSSProperties;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** 把命中的关键词包进 <mark>；split 带捕获组时奇数位就是命中片段 */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (terms.length === 0) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escape).join('|')})`, 'gi');
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="tk-mark">
            {part}
          </mark>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        )
      )}
    </>
  );
}

/** 工具卡片：标题链接的伪元素铺满整张卡片，整卡可点；外链新标签页打开 */
export default function ToolCard({ tool: x, terms, className, style }: Props) {
  const t = useTranslations('toolkit');

  return (
    <article
      className={cn(
        'tk-card group relative flex flex-col gap-3 rounded-lg border border-line bg-panel px-[22px] pb-[18px] pt-5',
        className
      )}
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="m-0 font-serif text-[19px] font-semibold leading-[1.3]">
          <a
            href={x.url}
            target="_blank"
            rel="noopener noreferrer"
            className="tk-link transition-colors duration-300 ease-scene group-hover:text-glow"
          >
            <Highlight text={x.name} terms={terms} />
            <span className="sr-only"> {t('opensInNewTab')}</span>
          </a>
        </h2>
        <span className="tk-tag flex-none whitespace-nowrap rounded-full border border-line px-2.5 py-[3px] font-mono text-[10.5px] uppercase tracking-[0.08em] text-dim">
          {x.tagLabel}
        </span>
      </div>
      <p className="m-0 flex-1 text-[13.5px] leading-[1.7] text-dim">
        <Highlight text={x.description} terms={terms} />
      </p>
      <div className="flex items-center justify-between gap-3 text-[11px] tracking-[0.05em] text-dim">
        <span className="inline-flex min-w-0 items-center gap-1 opacity-80 transition-[color,opacity] duration-300 ease-scene group-hover:text-glow group-hover:opacity-100">
          <span className="truncate">{x.host}</span>
          <ArrowUpRight
            aria-hidden="true"
            size={12}
            strokeWidth={1.75}
            className="flex-none transition-transform duration-300 ease-scene group-hover:-translate-y-px group-hover:translate-x-px"
          />
        </span>
        <span className="flex-none opacity-80">
          {t('checked')} <time dateTime={x.checked}>{x.checked}</time>
        </span>
      </div>
    </article>
  );
}
