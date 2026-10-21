'use client';
import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
interface Reaction { likes: number; liked: boolean; comments: number }
interface Comment { id: string; nickname: string; text: string; createdAt: string }
export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {cache: 'no-store', ...init, headers: {'Content-Type': 'application/json', ...init?.headers}});
  if (!response.ok) throw new Error(String(response.status));
  return response.json();
}
export default function ArticleDiscussion({slug, children}: {slug: string; children?: React.ReactNode}) {
  const t = useTranslations('writing'); const locale = useLocale(); const base = `/api/writing/${slug}`;
  const [reaction, setReaction] = useState<Reaction>(); const [items, setItems] = useState<Comment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [ready, setReady] = useState(false); const [error, setError] = useState('');
  const [busy, setBusy] = useState(false); const [paging, setPaging] = useState(false);
  const [nickname, setNickname] = useState(''); const [text, setText] = useState(''); const [sent, setSent] = useState(false);
  const load = useCallback(async () => {
    setError(''); setReady(false);
    try {
      const r = await api<Reaction>(`${base}/reactions`);
      const c = await api<{items: Comment[]; nextCursor: string | null}>(`${base}/comments`);
      setReaction(r); setItems(c.items); setCursor(c.nextCursor); setReady(true);
    } catch { setError(t('serviceError')); }
  }, [base, t]);
  useEffect(() => { void load(); }, [load]);
  return <>
    <div className="mt-10 flex items-center gap-4 border-t border-line pt-6">
      <button type="button" aria-pressed={reaction?.liked ?? false} disabled={!ready || busy} className="writing-button" onClick={async () => {
        if (!reaction) return; const before = reaction;
        setBusy(true); setError(''); setReaction({...before, liked: !before.liked, likes: before.likes + (before.liked ? -1 : 1)});
        try { const result = await api<{likes: number; liked: boolean}>(`${base}/like`, {method: 'PUT', body: JSON.stringify({liked: !before.liked})}); setReaction({...before, ...result}); }
        catch (e) { setReaction(before); setError(e instanceof Error && e.message === '429' ? t('rateLimited') : t('serviceError')); }
        finally { setBusy(false); }
      }}>♥ {t('like')} {reaction?.likes ?? '—'}</button>
      <a href="#comments" className="text-sm text-dim hover:text-glow">{t('comments', {count: reaction?.comments ?? 0})}</a>
    </div>
    {children}
    <section id="comments" className="scroll-mt-[140px] pb-8" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="mb-5 font-serif text-2xl">{t('discussion')}</h2>
      <div role="status" aria-live="polite">{error && <p className="mb-4 text-sm text-dim">{error} <button className="text-glow underline" type="button" onClick={() => void load()}>{t('retry')}</button></p>}</div>
      {!ready && !error && <p className="text-sm text-dim">{t('loading')}</p>}
      {ready && !items.length && <p className="my-5 text-sm text-dim">{t('noComments')}</p>}
      <ol className="divide-y divide-line">{items.map(c => <li key={c.id} className="py-5">
        <div className="mb-2 flex flex-wrap items-baseline gap-3"><b className="text-sm font-medium">{c.nickname}</b><time className="text-xs text-dim" dateTime={c.createdAt}>{new Date(c.createdAt).toLocaleDateString(locale)}</time></div>
        <p className="whitespace-pre-wrap break-words text-sm leading-7 text-dim">{c.text}</p>
      </li>)}</ol>
      {cursor && <button type="button" disabled={paging} className="writing-button mb-6" onClick={async () => {
        setPaging(true); try {
          const result = await api<{items: Comment[]; nextCursor: string | null}>(`${base}/comments?cursor=${encodeURIComponent(cursor)}`);
          setItems(old => [...old, ...result.items.filter(c => !old.some(o => o.id === c.id))]); setCursor(result.nextCursor);
        } catch { setError(t('serviceError')); } finally { setPaging(false); }
      }}>{t('loadMore')}</button>}
      <form className="grid gap-4 border border-line bg-panel p-5" onSubmit={async e => {
        e.preventDefault(); setBusy(true); setError(''); setSent(false);
        try { await api(`${base}/comments`, {method: 'POST', body: JSON.stringify({nickname, text})}); setText(''); setSent(true); }
        catch (e) { setError(e instanceof Error && e.message === '429' ? t('rateLimited') : t('serviceError')); }
        finally { setBusy(false); }
      }}>
        <label className="grid gap-2 text-sm">{t('nickname')}<input className="writing-input" autoComplete="nickname" required maxLength={30} value={nickname} onChange={e => setNickname(e.target.value)} /></label>
        <label className="grid gap-2 text-sm">{t('commentInputLabel')}<textarea className="writing-input min-h-32 resize-y" required maxLength={500} value={text} onChange={e => {setText(e.target.value); setSent(false);}} /></label>
        <p className="text-xs text-dim">{t('moderationNote')} · {text.length}/500</p>
        <button type="submit" className="writing-button justify-self-start" disabled={!ready || busy || !nickname.trim() || !text.trim()}>{busy ? t('sending') : t('commentSend')}</button>
        {sent && <p role="status" className="text-sm text-glow">{t('pendingComment')}</p>}
      </form>
    </section>
  </>;
}
