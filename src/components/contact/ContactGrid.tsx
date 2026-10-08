import { useTranslations } from 'next-intl';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { CONTACT_EMAIL, CONTACT_LINKS, type ContactLink } from '@/lib/data/site';
import CopyEmail from './CopyEmail';

const cellLink =
  'ct-link flex h-full flex-col gap-2 px-[22px] py-[21px] focus-visible:outline-none';

/**
 * 联系方式网格：1px 间隙露出底色当分隔线（与原型 .clist 一致），
 * 三列 → 两列（≤900px）→ 单列（≤560px），六个条目始终排满。
 * 每格整格是一个链接；邮件格右上角另有复制按钮（同级元素，不嵌套在链接里）。
 */
export default function ContactGrid() {
  const t = useTranslations('contact');

  const text = (v: ContactLink['label'] | ContactLink['value']) => ('text' in v ? v.text : t(v.key));

  return (
    <ul
      aria-label={t('listLabel')}
      className="m-0 grid list-none grid-cols-1 gap-px border border-line bg-line p-0 min-[561px]:grid-cols-2 min-[901px]:grid-cols-3"
    >
      {CONTACT_LINKS.map((c, i) => {
        const body = (
          <>
            <span className="text-[11.5px] tracking-[0.1em] text-dim">{text(c.label)}</span>
            <span className="ct-value break-words font-serif text-[19px] leading-[1.35]">{text(c.value)}</span>
          </>
        );

        return (
          <li
            key={c.id}
            className="ct-cell group relative bg-ink"
            style={{ '--i': i } as React.CSSProperties}
          >
            {c.kind === 'internal' ? (
              <Link href={c.href} className={cellLink}>
                {body}
              </Link>
            ) : c.kind === 'external' ? (
              <a href={c.href} target="_blank" rel="noopener noreferrer" className={cellLink}>
                {body}
                <span className="sr-only"> {t('opensInNewTab')}</span>
              </a>
            ) : (
              <a href={c.href} className={cellLink}>
                {body}
              </a>
            )}

            {c.kind === 'mail' ? (
              <CopyEmail email={CONTACT_EMAIL} className="absolute right-[14px] top-[14px]" />
            ) : (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute right-[18px] top-[20px] text-dim opacity-60 transition-[color,opacity,transform] duration-300 ease-scene group-hover:opacity-100 group-hover:text-glow group-focus-within:text-glow group-focus-within:opacity-100"
              >
                {c.kind === 'internal' ? (
                  <ArrowRight size={14} strokeWidth={1.75} className="ct-arrow-in" />
                ) : (
                  <ArrowUpRight size={14} strokeWidth={1.75} className="ct-arrow-out" />
                )}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
