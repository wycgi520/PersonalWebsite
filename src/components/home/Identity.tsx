import { useTranslations } from 'next-intl';
import ProfilePortrait from '@/components/ProfilePortrait';

const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

export default function Identity() {
  const t = useTranslations('home');

  return (
    <div className="ident max-w-[46ch]">
      <div className="mb-[26px] flex items-center gap-2.5 text-[11.5px] tracking-[0.12em] text-dim">
        {t('coord')}
        <span className="h-px flex-1 bg-line" aria-hidden="true" />
      </div>

      <ProfilePortrait />

      <h1 className="mb-1.5 font-serif text-[clamp(38px,4.4vw,60px)] font-medium leading-[1.08] tracking-[-0.01em]">
        {t('name')}
      </h1>

      <p className="mb-6 font-serif text-[clamp(19px,1.7vw,23px)] font-normal italic text-glow">
        {t('role')}
      </p>

      <p className="ident-bio mb-3.5 text-[14.5px] leading-[1.85] text-dim min-[861px]:text-[15px]">
        {t.rich('bio1', { strong })}
      </p>
      <p className="ident-bio mb-3.5 text-[14.5px] leading-[1.85] text-dim min-[861px]:text-[15px]">
        {t('bio2')}
      </p>

      <div className="mt-[30px] rounded-r-[3px] border border-l-2 border-line border-l-glow bg-panel px-4 py-3.5 text-[13px] leading-[1.7] text-dim">
        <b className="mb-[3px] block text-[13.5px] font-medium text-[var(--text)]">
          {t('statusTitle')}
        </b>
        <span>{t('statusBody')}</span>
      </div>
    </div>
  );
}
