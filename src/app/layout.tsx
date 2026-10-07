import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter, Noto_Serif_SC } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
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
});

export const metadata: Metadata = {
  title: '观星台 · 个人网站',
  description: '全栈工程师 · 偏爱把复杂系统做薄',
  keywords: ['全栈工程师', 'Full Stack', 'TypeScript', 'Next.js', 'React'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationMismatch
      className={`${cormorant.variable} ${inter.variable} ${notoSerifSC.variable}`}
    >
      <body>
        <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false}>
          <SkyCanvas />
          <Navigation />
          <main className="stage relative z-10 min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
