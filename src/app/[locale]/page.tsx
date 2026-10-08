import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { pageMetadata } from '@/lib/seo';
import { CONTACT_EMAIL, CONTACT_LINKS, SITE_URL } from '@/lib/data/site';
import Identity from '@/components/home/Identity';
import StarMap from '@/components/home/StarMap';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata(locale as Locale);
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale as Locale); // 已在 layout 中校验
  const t = await getTranslations('home');

  // 结构化数据：让搜索引擎把站点和本人关联起来
  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: t('name').replace(/\s+/g, locale === 'zh' ? '' : ' '),
    jobTitle: t('role'),
    url: `${SITE_URL}/${locale}`,
    email: `mailto:${CONTACT_EMAIL}`,
    // 即刻还没有确定的个人主页地址（见 site.ts），先不放
    sameAs: CONTACT_LINKS.filter((l) => l.kind === 'external' && l.id !== 'jike').map((l) => l.href),
  };

  return (
    <section className="scene px-[18px] pb-10 pt-[118px] min-[861px]:px-10 min-[861px]:pb-12 min-[861px]:pt-[104px]">
      <script
        type="application/ld+json"
        // 防止数据里出现 </script> 截断标签
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }}
      />
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 py-5 min-[1041px]:min-h-[calc(100vh-152px)] min-[1041px]:grid-cols-[minmax(300px,38%)_1fr] min-[1041px]:gap-14 min-[1041px]:py-0">
        <Identity />
        <StarMap />
      </div>
    </section>
  );
}
