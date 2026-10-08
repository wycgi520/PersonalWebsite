// 站点级的联系信息，Writing（订阅兜底）与 Contact 页共用
export const CONTACT_EMAIL = 'hi@guoyang.dev';

/** Contact 页的条目；label / value 是 contact 命名空间下的文案 key 时，按当前语言翻译 */
export interface ContactLink {
  id: 'email' | 'github' | 'linkedin' | 'x' | 'jike' | 'newsletter';
  /** 固定标签（品牌名不翻译）或文案 key */
  label: { text: string } | { key: 'email' | 'x' | 'jike' | 'newsletter' };
  value: { text: string } | { key: 'jikeName' | 'newsletterValue' };
  href: string;
  /** 站内链接走 next-intl 的 Link，自动带语言前缀 */
  kind: 'mail' | 'external' | 'internal';
}

// 六个条目：三列排满两行，两列时三行，不留空格子
export const CONTACT_LINKS: ContactLink[] = [
  { id: 'email', label: { key: 'email' }, value: { text: CONTACT_EMAIL }, href: `mailto:${CONTACT_EMAIL}`, kind: 'mail' },
  { id: 'github', label: { text: 'GitHub' }, value: { text: '@guoyang' }, href: 'https://github.com/guoyang', kind: 'external' },
  { id: 'linkedin', label: { text: 'LinkedIn' }, value: { text: 'in/guoyang' }, href: 'https://www.linkedin.com/in/guoyang', kind: 'external' },
  { id: 'x', label: { key: 'x' }, value: { text: '@guoyang_dev' }, href: 'https://x.com/guoyang_dev', kind: 'external' },
  // TODO: 即刻个人主页地址是 /u/<uuid>，账号确定后替换
  { id: 'jike', label: { key: 'jike' }, value: { key: 'jikeName' }, href: 'https://web.okjike.com', kind: 'external' },
  // 原型这里是 RSS，RSS 尚未实现，换成 Writing 页的订阅
  { id: 'newsletter', label: { key: 'newsletter' }, value: { key: 'newsletterValue' }, href: '/writing#newsletter', kind: 'internal' },
];
