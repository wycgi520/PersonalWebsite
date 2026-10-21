import { headers } from 'next/headers';
import { redirect } from '@/i18n/navigation';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';
import { CommentStatus } from '@prisma/client';
import { db } from '@/lib/server/db';
import { administrator } from '@/lib/server/auth';
import { AdminSignOut, ReviewButtons } from '@/components/writing/AdminControls';
export const dynamic = 'force-dynamic';
export const metadata = { robots: {index: false, follow: false} };
export default async function CommentsAdmin({params, searchParams}: {params: Promise<{locale: string}>; searchParams: Promise<{status?: string; page?: string}>}) {
  const {locale} = await params; const query = await searchParams; const t = await getTranslations('writing');
  let admin;
  const requestHeaders = await headers();
  try { admin = await administrator(requestHeaders); } catch {
    return <section className="scene mx-auto max-w-3xl px-5 pb-20 pt-36"><h1 className="text-2xl">{t('adminTitle')}</h1><p className="mt-6">{t('serviceError')}</p></section>;
  }
  if (!admin) return redirect({href: '/admin/login', locale: locale as Locale});
  const status = Object.values(CommentStatus).includes(query.status as CommentStatus) ? query.status as CommentStatus : 'PENDING';
  const page = Math.max(1, Math.min(10000, Number(query.page) || 1));
  const rows = await db().comment.findMany({where: {status}, orderBy: [{createdAt: 'desc'}, {id: 'desc'}], take: 21, skip: (Math.floor(page) - 1) * 20});
  return <section className="scene mx-auto max-w-4xl px-5 pb-20 pt-36">
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4"><h1 className="font-serif text-3xl">{t('adminTitle')}</h1><AdminSignOut /></div>
    <nav aria-label={t('adminTitle')} className="mb-6 flex flex-wrap gap-4">{Object.values(CommentStatus).map(s => <Link key={s} href={`/admin/comments?status=${s}`} aria-current={status === s ? 'page' : undefined} className={status === s ? 'text-glow underline' : 'text-dim'}>{t(s)}</Link>)}</nav>
    {!rows.length && <p className="text-dim">{t('noComments')}</p>}
    {rows.slice(0,20).map(c => <article key={c.id} className="mb-5 border border-line bg-panel p-5"><div className="mb-3 flex flex-wrap gap-3 text-sm"><b>{c.nickname}</b><Link href={`/writing/${c.slug}`} className="text-glow">{c.slug}</Link><time dateTime={c.createdAt.toISOString()}>{c.createdAt.toISOString().slice(0,16).replace('T',' ')} UTC</time></div><p className="whitespace-pre-wrap break-words leading-7">{c.text}</p><ReviewButtons id={c.id} /></article>)}
    <nav className="mt-6 flex justify-between">{page > 1 ? <Link href={`/admin/comments?status=${status}&page=${page-1}`}>{t('previous')}</Link> : <span />}{rows.length > 20 && <Link href={`/admin/comments?status=${status}&page=${page+1}`}>{t('next')}</Link>}</nav>
  </section>;
}
