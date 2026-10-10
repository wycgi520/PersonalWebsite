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

      <ProfilePortrait className="rv" />

      <h1 className="rv mb-5 font-serif text-[clamp(32px,3.4vw,46px)] font-medium leading-[1.14]">
        {t('title')}
      </h1>

      {(['p1', 'p2', 'p3'] as const).map((key) => (
        <p key={key} className="rv mb-[18px] text-[14.5px] leading-[1.9] text-dim min-[861px]:text-[15px]">
          {t.rich(key, { strong })}
        </p>
      ))}

      {/* 四个条目只用 2 或 4 列，避免落单格子露出底色 */}
      <dl className="rv mt-[34px] grid grid-cols-2 gap-px border border-line bg-line min-[561px]:max-[1040px]:grid-cols-4 min-[1280px]:grid-cols-4">
        {FACTS.map(([k, v]) => (
          <div key={k} className="bg-ink px-4 py-[15px]">
            <dt className="mb-1.5 text-[11px] tracking-[0.1em] text-dim">{t(k)}</dt>
            <dd className="m-0 font-serif text-[17px] text-[var(--text)]">{t(v)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
