import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { tools, localizeTool, localizeToolTags } from '@/lib/data/tools';
import BackLink from '@/components/layout/BackLink';
import ToolExplorer from '@/components/toolkit/ToolExplorer';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale, 'toolkit');
}

export default async function ToolkitPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验
  const t = await getTranslations('toolkit');
  // 只把当前语言的文案传给客户端组件
  const items = tools.map((x) => localizeTool(x, locale as Locale));
  const tags = localizeToolTags(locale as Locale);

  return (
    <section className="scene px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <BackLink className="mb-[26px]" />
        <header className="mb-[34px] flex flex-col items-start gap-3 border-b border-line pb-5 min-[721px]:flex-row min-[721px]:items-end min-[721px]:justify-between min-[721px]:gap-7">
          <h1 className="m-0 font-serif text-[clamp(30px,3.2vw,42px)] font-medium leading-[1.12]">{t('title')}</h1>
          <p className="m-0 max-w-[42ch] text-[13.5px] leading-[1.7] text-dim">{t('lede')}</p>
        </header>
        <ToolExplorer tools={items} tags={tags} />
      </div>
    </section>
  );
}
