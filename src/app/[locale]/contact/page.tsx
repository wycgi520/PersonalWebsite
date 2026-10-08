import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ArrowRight } from 'lucide-react';
import { routing, HTML_LANG, type Locale } from '@/i18n/routing';
import { CONTACT_EMAIL } from '@/lib/data/site';
import BackLink from '@/components/layout/BackLink';
import ContactGrid from '@/components/contact/ContactGrid';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'contact' });
  const tm = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return {
    title: `${t('metaTitle')} · ${tm('title')}`,
    description: t('metaDescription'),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `/${l}/contact`])),
    },
  };
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验
  const t = await getTranslations('contact');
  // 外包咨询：预填主题和几个要点，对方照着填即可
  const projectMail = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
    t('projectMailSubject')
  )}&body=${encodeURIComponent(t('projectMailBody'))}`;

  return (
    <section className="scene px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <BackLink className="mb-[26px]" />
        <header className="mb-[34px] flex flex-col items-start gap-3 border-b border-line pb-5 min-[721px]:flex-row min-[721px]:items-end min-[721px]:justify-between min-[721px]:gap-7">
          <h1 className="m-0 font-serif text-[clamp(30px,3.2vw,42px)] font-medium leading-[1.12]">{t('title')}</h1>
          <p className="m-0 max-w-[42ch] text-[13.5px] leading-[1.7] text-dim">{t('lede')}</p>
        </header>

        <ContactGrid />

        <aside className="ct-note mt-[30px] max-w-[70ch] px-[22px] py-5 text-[13.5px] leading-[1.8] text-dim">
          <h2 className="m-0 text-[13.5px] font-medium text-[color:var(--text)]">{t('noteTitle')}</h2>
          <p className="m-0">{t('note')}</p>
          <a
            href={projectMail}
            className="group mt-3 inline-flex items-center gap-1.5 text-[12.5px] tracking-[0.04em] text-glow underline-offset-4 hover:underline"
          >
            {t('noteCta')}
            <ArrowRight
              aria-hidden="true"
              size={13}
              strokeWidth={1.75}
              className="transition-transform duration-300 ease-scene group-hover:translate-x-0.5"
            />
          </a>
        </aside>
      </div>
    </section>
  );
}
