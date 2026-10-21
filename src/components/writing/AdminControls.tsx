'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { api } from './ArticleDiscussion';
export function AdminLogin() {
  const t = useTranslations('writing'); const router = useRouter();
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  return <form className="grid gap-5 border border-line bg-panel p-6" onSubmit={async e => {
    e.preventDefault(); const form = new FormData(e.currentTarget); setBusy(true); setError('');
    try {
      await api('/api/auth/sign-in/email', {method: 'POST', body: JSON.stringify({email: form.get('email'), password: form.get('password')})});
      router.replace('/admin/comments'); router.refresh();
    } catch { setError(t('loginError')); } finally { setBusy(false); }
  }}>
    <label className="grid gap-2 text-sm">{t('email')}<input className="writing-input" name="email" type="email" autoComplete="username" required /></label>
    <label className="grid gap-2 text-sm">{t('password')}<input className="writing-input" name="password" type="password" autoComplete="current-password" required /></label>
    <button className="writing-button" disabled={busy}>{t('signIn')}</button>
    {error && <p role="alert" className="text-sm text-dim">{error}</p>}
  </form>;
}
export function ReviewButtons({id}: {id: string}) {
  const t = useTranslations('writing'); const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  return <div className="mt-4 flex flex-wrap gap-3">{(['APPROVED', 'REJECTED', 'HIDDEN'] as const).map(status => <button key={status} type="button" disabled={busy} className="writing-button" onClick={async () => {
    setBusy(true); setError('');
    try { await api(`/api/admin/comments/${id}`, {method: 'PATCH', body: JSON.stringify({status})}); router.refresh(); }
    catch { setError(t('serviceError')); } finally { setBusy(false); }
  }}>{t(status)}</button>)}{error && <p role="alert">{error}</p>}</div>;
}
export function AdminSignOut() {
  const t = useTranslations('writing'); const router = useRouter(); const [error, setError] = useState(false);
  return <><button className="writing-button" type="button" onClick={async () => {
    try { await api('/api/auth/sign-out', {method: 'POST', body: '{}'}); router.replace('/admin/login'); router.refresh(); } catch { setError(true); }
  }}>{t('signOut')}</button>{error && <p role="alert">{t('serviceError')}</p>}</>;
}
