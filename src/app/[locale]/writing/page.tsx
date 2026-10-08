import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, HTML_LANG, type Locale } from '@/i18n/routing';
import { posts, localizePost, localizeCategories, archiveByYear } from '@/lib/data/posts';
import BackLink from '@/components/layout/BackLink';
import PostList from '@/components/writing/PostList';
import Newsletter from '@/components/writing/Newsletter';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'writing' });
  const tm = await getTranslations({ locale: locale as Locale, namespace: 'meta' });
  return {
    title: `${t('metaTitle')} · ${tm('title')}`,
    description: t('metaDescription'),
    alternates: {
      languages: Object.fromEntries(routing.locales.map((l) => [HTML_LANG[l], `/${l}/writing`])),
    },
  };
}

export default async function WritingPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验
  const t = await getTranslations('writing');
  // 只把当前语言的文案传给客户端组件
  const items = posts.map((p) => localizePost(p, locale as Locale));
  const categories = localizeCategories(locale as Locale);
  const archive = archiveByYear(posts);

  return (
    <section className="scene px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <div className="mx-auto max-w-[1180px]">
        <BackLink className="mb-[26px]" />
        <header className="mb-[34px] flex flex-col items-start gap-3 border-b border-line pb-5 min-[721px]:flex-row min-[721px]:items-end min-[721px]:justify-between min-[721px]:gap-7">
          <h1 className="m-0 font-serif text-[clamp(30px,3.2vw,42px)] font-medium leading-[1.12]">{t('title')}</h1>
          <p className="m-0 max-w-[42ch] text-[13.5px] leading-[1.7] text-dim">{t('lede')}</p>
        </header>

        {/* ≤1040px 单栏，侧栏两块并排（放不下时换行）；宽屏侧栏吸顶 */}
        <div className="grid grid-cols-1 items-start gap-[34px] min-[1041px]:grid-cols-[1fr_302px] min-[1041px]:gap-[46px]">
          <PostList posts={items} categories={categories} />
          <aside className="flex flex-row flex-wrap gap-5 min-[1041px]:sticky min-[1041px]:top-[104px] min-[1041px]:flex-col">
            <div className="min-w-[min(270px,100%)] flex-1 min-[1041px]:flex-none">
              <Newsletter />
            </div>
            <div className="min-w-[min(270px,100%)] flex-1 border border-line bg-panel p-[21px] min-[1041px]:flex-none">
              <h2 className="mb-[7px] font-serif text-[19px] font-medium">{t('archiveTitle')}</h2>
              <ul className="m-0 flex list-none flex-wrap gap-x-2 p-0 text-[12.5px] leading-[1.7] text-dim">
                {archive.map((a, i) => (
                  <li key={a.year}>
                    {i > 0 && <span aria-hidden="true" className="mr-2">·</span>}
                    {t('archiveYear', { year: a.year, count: a.count })}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
