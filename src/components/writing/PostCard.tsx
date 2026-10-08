'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Heart, MessageCircle } from 'lucide-react';
import type { LocalizedPost } from '@/lib/data/posts';
import { COMMENT_MAX, type LocalComment } from '@/lib/hooks/usePostReactions';
import { cn } from '@/lib/utils';

interface Props {
  post: LocalizedPost;
  liked: boolean;
  localComments: LocalComment[];
  onLike: (id: string) => void;
  onComment: (id: string, text: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const action =
  'inline-flex items-center gap-1.5 py-1 text-[12.5px] transition-colors duration-300 ease-scene';

function Avatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="grid h-[29px] w-[29px] flex-none place-items-center rounded-full bg-grid font-serif text-[11.5px] text-glow"
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

export default function PostCard({ post: p, liked, localComments, onLike, onComment, className, style }: Props) {
  const t = useTranslations('writing');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  // 只在用户点击后播放心跳动画，避免读取存储后的首帧也跳一下
  const [pop, setPop] = useState(false);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const likes = p.likes + (liked ? 1 : 0);
  const total = p.comments.length + localComments.length;
  const threadId = `${p.id}-thread`;

  return (
    <article id={p.id} className={cn('scroll-mt-28 border-b border-line py-6', className)} style={style}>
      <div className="mb-[9px] flex flex-wrap items-center gap-x-[11px] gap-y-1 text-[11.5px] tracking-[0.05em] text-dim">
        <span className="rounded-[2px] border border-glow px-[7px] py-[2px] text-[10.5px] text-glow">{p.catLabel}</span>
        <time dateTime={p.date}>{p.date}</time>
        <span>{t('readTime', { minutes: p.read })}</span>
      </div>
      <h2 className="mb-2 font-serif text-[22px] font-medium leading-[1.3]">{p.title}</h2>
      <p className="mb-[14px] max-w-[68ch] text-[14px] leading-[1.78] text-dim">{p.summary}</p>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-pressed={liked}
          aria-label={t('likeLabel', { title: p.title, count: likes })}
          onClick={() => {
            setPop(!liked);
            onLike(p.id);
          }}
          className={cn(action, liked ? 'text-ember' : 'text-dim hover:text-glow')}
        >
          <Heart
            aria-hidden="true"
            className={cn('h-[15px] w-[15px] transition-transform duration-[350ms] ease-scene', liked && 'scale-[1.12]', pop && 'wr-pop')}
            fill={liked ? 'currentColor' : 'none'}
            strokeWidth={1.6}
            onAnimationEnd={() => setPop(false)}
          />
          <span className="tabular-nums">{likes}</span>
        </button>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={threadId}
          onClick={() => setOpen((v) => !v)}
          className={cn(action, open ? 'text-glow' : 'text-dim hover:text-glow')}
        >
          <MessageCircle aria-hidden="true" className="h-[15px] w-[15px]" strokeWidth={1.6} />
          {t('comments', { count: total })}
        </button>
      </div>

      <section
        id={threadId}
        hidden={!open}
        aria-label={t('commentsLabel', { title: p.title })}
        className="wr-thread mt-4 border-t border-dashed border-line pt-4"
      >
        {total > 0 && (
          <ul className="m-0 list-none p-0">
            {p.comments.map((c, i) => (
              <li key={`s${i}`} className="mb-[14px] flex gap-3">
                <Avatar name={c.who} />
                <div className="text-[13px] leading-[1.7] text-dim">
                  <b className="mb-0.5 block text-[12.5px] font-medium text-[var(--text)]">{c.who}</b>
                  {c.text}
                </div>
              </li>
            ))}
            {localComments.map((c) => (
              <li key={`l${c.at}`} className="mb-[14px] flex gap-3">
                <Avatar name={t('commentYou')} />
                <div className="min-w-0 whitespace-pre-wrap break-words text-[13px] leading-[1.7] text-dim">
                  <b className="mb-0.5 block text-[12.5px] font-medium text-[var(--text)]">{t('commentYou')}</b>
                  {c.text}
                </div>
              </li>
            ))}
          </ul>
        )}
        <form
          className="mt-1 flex gap-[9px]"
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            onComment(p.id, draft);
            setDraft('');
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={draft}
            maxLength={COMMENT_MAX}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={t('commentPlaceholder')}
            aria-label={t('commentInputLabel')}
            className="wr-input"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="flex-none rounded-[3px] border border-line px-[17px] py-[9px] text-[13px] text-[var(--text)] transition-colors duration-300 ease-scene enabled:hover:border-glow enabled:hover:text-glow disabled:opacity-50"
          >
            {t('commentSend')}
          </button>
        </form>
        <p className="mb-0 mt-2.5 text-[11px] text-dim opacity-80">{t('commentLocalNote')}</p>
      </section>
    </article>
  );
}
