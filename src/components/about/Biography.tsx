import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

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
  const tc = useTranslations('common');

  return (
    <div className="about-bio max-w-[60ch]">
      <Link
        href="/"
        className="mb-7 inline-flex items-center gap-[9px] text-[12.5px] tracking-[0.08em] text-dim transition-colors duration-300 ease-scene hover:text-glow"
      >
        <span className="inline-block h-px w-[18px] bg-current" aria-hidden="true" />
        {tc('backHome')}
      </Link>

      <div
        className="rv mb-[22px] grid h-[76px] w-[76px] place-items-center rounded-full border border-line bg-[radial-gradient(circle_at_34%_30%,#2A3C5C,#0E1726_70%)] font-serif text-[30px] text-glow shadow-[0_0_0_6px_rgba(99,210,232,0.05)]"
        role="img"
        aria-label={t('portraitLabel')}
      >
        <span aria-hidden="true">GY</span>
      </div>

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
