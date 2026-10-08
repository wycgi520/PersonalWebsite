import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, HTML_LANG, type Locale } from '@/i18n/routing';
import AboutStage from '@/components/about/AboutStage';
import Biography from '@/components/about/Biography';
import Campfire from '@/components/about/Campfire';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'about' });
  const tm = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return {
    title: `${t('metaTitle')} · ${tm('title')}`,
    description: t('metaDescription'),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `/${l}/about`])),
    },
  };
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
