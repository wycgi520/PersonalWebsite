import { useTranslations } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import ProfilePortrait from '@/components/ProfilePortrait';

const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

export default function Identity() {
  const t = useTranslations('home');

  return (
    <div className="ident max-w-[48ch]">
      {/* 头像在左，姓名/职位在右 */}
      <div className="mb-7 flex items-center gap-5 min-[861px]:gap-6">
        <ProfilePortrait className="mb-0 shrink-0" />
        <div className="min-w-0">
          <h1 className="mb-1.5 font-serif text-[clamp(36px,4.2vw,56px)] font-medium leading-[1.1] tracking-[-0.015em]">
            {t('name')}
          </h1>
          <p className="pb-0.5 font-serif text-[clamp(19px,1.7vw,23px)] font-normal italic leading-[1.2] text-glow">
            {t('role')}
          </p>
        </div>
      </div>

      <p className="ident-bio mb-4 text-[14.5px] leading-[1.85] text-dim min-[861px]:text-[15px]">
        {t.rich('bio1', { strong })}
      </p>
      <p className="ident-bio mb-4 text-[14.5px] leading-[1.85] text-dim min-[861px]:text-[15px]">
        {t.rich('bio2', { strong })}
      </p>

      <div className="mt-7 border-t border-line pt-5 text-[13.5px] leading-[1.75] text-dim">
        <b className="mb-1 block text-[14px] font-medium text-[var(--text)]">
          {t('statusTitle')}
        </b>
        <p className="m-0 mb-3.5">{t('statusBody')}</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/projects"
            className="group inline-flex items-center gap-1.5 rounded-[4px] border border-glow bg-[var(--glow-soft)] px-3.5 py-1.5 text-[13px] font-medium text-glow transition-[background-color,transform] duration-300 ease-scene hover:bg-transparent active:scale-[0.98]"
          >
            {t('nodes.projects')}
            <ArrowRight
              size={13}
              strokeWidth={1.75}
              aria-hidden="true"
              className="transition-transform duration-300 ease-scene group-hover:translate-x-0.5"
            />
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center rounded-[4px] border border-line px-3.5 py-1.5 text-[13px] text-[var(--text)] transition-[border-color,color,transform] duration-300 ease-scene hover:border-glow hover:text-glow active:scale-[0.98]"
          >
            {t('nodes.contact')}
          </Link>
        </div>
      </div>
    </div>
  );
}
