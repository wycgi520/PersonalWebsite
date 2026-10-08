import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import AboutStage from '@/components/about/AboutStage';
import Biography from '@/components/about/Biography';
import Campfire from '@/components/about/Campfire';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, 'about');
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验

  return (
    <section className="scene about-scene relative isolate overflow-x-clip px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <AboutStage>
        <Biography />
        <Campfire />
      </AboutStage>
    </section>
  );
}
