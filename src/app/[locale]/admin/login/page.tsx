import { getTranslations } from 'next-intl/server';
import { AdminLogin } from '@/components/writing/AdminControls';
export const dynamic = 'force-dynamic';
export const metadata = { robots: {index: false, follow: false} };
export default async function LoginPage() {
  const t = await getTranslations('writing');
  return <section className="scene mx-auto max-w-md px-5 pb-20 pt-36"><h1 className="mb-8 font-serif text-3xl">{t('adminLogin')}</h1><AdminLogin /></section>;
}
