import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import Identity from '@/components/home/Identity';
import StarMap from '@/components/home/StarMap';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验

  return (
    <section className="scene px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 py-5 min-[1041px]:min-h-[calc(100vh-152px)] min-[1041px]:grid-cols-[minmax(300px,38%)_1fr] min-[1041px]:gap-14 min-[1041px]:py-0">
        <Identity />
        <StarMap />
      </div>
    </section>
  );
}
