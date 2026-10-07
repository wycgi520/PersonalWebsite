import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Cormorant_Garamond, Inter, Noto_Serif_SC } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing, HTML_LANG } from '@/i18n/routing';
import Navigation from '@/components/layout/Navigation';
import SkyCanvas from '@/components/home/SkyCanvas';
import '@/styles/globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
});

const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-noto-serif-sc',
  display: 'swap',
  // CJK 字体分片很多，不做预加载，按 unicode-range 按需下载
  preload: false,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 两种语言全部静态预渲染
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = hasLocale(routing.locales, raw) ? raw : routing.defaultLocale;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: t('title'),
    description: t('description'),
    keywords: ['全栈工程师', 'Full Stack', 'TypeScript', 'Next.js', 'React'],
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map((l) => [HTML_LANG[l], `/${l}`])
      ),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // 允许该语言下的页面静态渲染
  setRequestLocale(locale);

  return (
    <html
      lang={HTML_LANG[locale]}
      suppressHydrationWarning
      className={`${cormorant.variable} ${inter.variable} ${notoSerifSC.variable}`}
    >
      <body>
        <NextIntlClientProvider>
          <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
            <SkyCanvas />
            <Navigation />
            <main className="stage relative z-10 min-h-screen">{children}</main>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
