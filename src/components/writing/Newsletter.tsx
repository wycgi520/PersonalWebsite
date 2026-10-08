'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { CONTACT_EMAIL } from '@/lib/data/site';

// 订阅服务的接口地址（如 Buttondown / Resend 的自建转发）；未配置时退回邮件订阅
const ENDPOINT = process.env.NEXT_PUBLIC_NEWSLETTER_ENDPOINT;

type Status = 'idle' | 'sending' | 'ok' | 'mail' | 'error';

/**
 * 订阅表单。配置了 NEXT_PUBLIC_NEWSLETTER_ENDPOINT 时 POST { email } 过去；
 * 否则打开邮件客户端，向站长发一封带邮箱的订阅邮件（不假装已经订阅成功）。
 * 无 JS 时表单 action 直接是 mailto，同样可用。
 */
export default function Newsletter() {
  const t = useTranslations('writing');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');

  const mailto = (addr: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(t('subMailSubject'))}&body=${encodeURIComponent(
      t('subMailBody', { email: addr })
    )}`;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const addr = email.trim();
    if (!ENDPOINT) {
      window.location.href = mailto(addr);
      setStatus('mail');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addr }),
      });
      setStatus(res.ok ? 'ok' : 'error');
    } catch {
      setStatus('error');
    }
  };

  const done = status === 'ok' || status === 'mail';

  return (
    <div className="border border-line border-t-2 border-t-glow bg-panel p-[21px]">
      <h2 className="mb-[7px] font-serif text-[19px] font-medium">{t('subTitle')}</h2>
      <p className="mb-[15px] text-[12.5px] leading-[1.7] text-dim">{t('subBody')}</p>
      {done ? (
        <p role="status" className="m-0 text-[12.5px] leading-[1.7] text-glow">
          {t(status === 'ok' ? 'subOk' : 'subMailOk')}
        </p>
      ) : (
        <form
          action={`mailto:${CONTACT_EMAIL}`}
          method="get"
          onSubmit={submit}
          className="flex flex-col gap-[9px]"
        >
          <input
            type="email"
            name="body"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status === 'error') setStatus('idle');
            }}
            placeholder={t('subPlaceholder')}
            aria-label={t('subEmailLabel')}
            className="wr-input"
          />
          <button
            type="submit"
            disabled={status === 'sending'}
            className="rounded-[3px] border border-glow bg-[var(--glow-soft)] px-[17px] py-[9px] text-[13px] text-glow transition-colors duration-300 ease-scene hover:bg-transparent disabled:opacity-60"
          >
            {status === 'sending' ? t('subSending') : t('subButton')}
          </button>
          <p role="status" className="m-0 text-[11px] text-dim">
            {status === 'error' ? <span className="text-ember">{t('subError')}</span> : t('subNote')}
          </p>
        </form>
      )}
    </div>
  );
}
