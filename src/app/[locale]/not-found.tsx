import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

// 尚未实现的页面（Writing / Toolkit …）与未知路径都落到这里
export default function NotFound() {
  const t = useTranslations('common');

  return (
    <section className="scene grid min-h-screen place-items-center px-[18px] pb-10 pt-[118px] min-[861px]:px-10">
      <div className="max-w-[44ch] rounded-r-[3px] border border-l-2 border-line border-l-glow bg-panel px-5 py-4 text-[14px] leading-[1.8] text-dim">
        <p className="mb-3">{t('comingSoon')}</p>
        <Link href="/" className="text-glow underline-offset-4 hover:underline">
          ← {t('backHome')}
        </Link>
      </div>
    </section>
  );
}
