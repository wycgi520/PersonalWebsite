import { useTranslations } from 'next-intl';
import BackLink from '@/components/layout/BackLink';
import ProfilePortrait from '@/components/ProfilePortrait';

const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

const FACTS = [
  ['f1k', 'f1v'],
  ['f2k', 'f2v'],
  ['f3k', 'f3v'],
  ['f4k', 'f4v'],
] as const;

// 带 .rv 的元素在首次访问时依次显现（见 AboutStage 与 globals.css）
export default function Biography() {
  const t = useTranslations('about');

  return (
    <div className="about-bio max-w-[60ch]">
      <BackLink className="mb-7" />

      {/* 头像在左，主副标题在右，纵向高度与圆头像自然对齐 */}
      <div className="rv mb-7 flex items-center gap-5 min-[861px]:gap-6">
        <ProfilePortrait className="mb-0 h-20 w-20 shrink-0 min-[861px]:h-24 min-[861px]:w-24" />
        <div className="min-w-0">
          <h1 className="mb-1.5 font-serif text-[clamp(26px,2.6vw,36px)] font-medium leading-[1.18]">
            {t('title')}
          </h1>
          <p className="m-0 pb-0.5 font-serif text-[clamp(16px,1.4vw,19px)] italic leading-[1.2] text-glow">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {(['p1', 'p2', 'p3'] as const).map((key) => (
        <p key={key} className="rv mb-[18px] text-[14.5px] leading-[1.9] text-dim min-[861px]:text-[15px]">
          {t.rich(key, { strong })}
        </p>
      ))}

      {/* 四个条目只用 2 或 4 列，避免落单格子露出底色 */}
      <dl className="rv mt-[34px] grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-line bg-line min-[561px]:max-[1040px]:grid-cols-4 min-[1280px]:grid-cols-4">
        {FACTS.map(([k, v]) => (
          <div key={k} className="bg-ink px-3.5 py-4 text-left">
            <dt className="mb-1 text-[11px] tracking-[0.06em] text-dim">{t(k)}</dt>
            <dd className="m-0 whitespace-nowrap font-serif text-[17px] font-medium text-[var(--text)]">{t(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
