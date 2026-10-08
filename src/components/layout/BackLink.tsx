import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';

// 内页左上角的"回到星图"
export default function BackLink({ className }: { className?: string }) {
  const t = useTranslations('common');

  return (
    <Link
      href="/"
      className={cn(
        'inline-flex items-center gap-[9px] text-[12.5px] tracking-[0.08em] text-dim transition-colors duration-300 ease-scene hover:text-glow',
        className
      )}
    >
      <span className="inline-block h-px w-[18px] bg-current" aria-hidden="true" />
      {t('backHome')}
    </Link>
  );
}
