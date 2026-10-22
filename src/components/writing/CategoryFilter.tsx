import { useTranslations } from 'next-intl';
import type { CategoryId, LocalizedCategory } from '@/lib/data/posts';
import { cn } from '@/lib/utils';

export type Filter = CategoryId | 'all';

interface Props {
  categories: LocalizedCategory[];
  counts: Record<Filter, number>;
  value: Filter;
  onChange: (value: Filter) => void;
}

// 分类筛选：一组切换按钮，当前项 aria-pressed，后面带该分类的文章数
export default function CategoryFilter({ categories, counts, value, onChange }: Props) {
  const t = useTranslations('writing');
  const options: { id: Filter; label: string }[] = [{ id: 'all', label: t('all') }, ...categories];

  return (
    <div role="group" aria-label={t('filterLabel')} className="mb-2 flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.id)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-[4px] border px-3 py-1.5 text-[12.5px] transition-[color,border-color,background-color,transform] duration-300 ease-scene active:scale-[0.98]',
              active
                ? 'border-glow bg-[var(--glow-soft)] text-glow'
                : 'border-line text-dim hover:border-glow/60 hover:text-[var(--text)]'
            )}
          >
            {o.label}
            <span className={cn('text-[11px] tabular-nums', active ? 'opacity-85' : 'opacity-65')}>
              {counts[o.id]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
