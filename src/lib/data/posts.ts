/** 文章分类。新增分类只需在这里追加一项，筛选与标签会自动出现 */
export const CATEGORIES = [
  { id: 'tech', zh: '技术', en: 'Engineering' },
  { id: 'life', zh: '生活', en: 'Life' },
  { id: 'note', zh: '随笔', en: 'Notes' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];

export interface Comment {
  who: string;
  zh: string;
  en: string;
}

export interface Post {
  id: string;
  cat: CategoryId;
  /** ISO 日期 YYYY-MM-DD */
  date: string;
  /** 阅读时长（分钟） */
  read: number;
  zh: string;
  en: string;
  sumZh: string;
  sumEn: string;
  /** 已有的点赞数（不含当前访客） */
  likes: number;
  cmts: Comment[];
}

export interface LocalizedCategory {
  id: CategoryId;
  label: string;
}

export interface LocalizedComment {
  who: string;
  text: string;
}

/** 按语言取好的文章字段，供客户端组件使用 */
export interface LocalizedPost {
  id: string;
  cat: CategoryId;
  catLabel: string;
  date: string;
  read: number;
  title: string;
  summary: string;
  likes: number;
  comments: LocalizedComment[];
}

export function localizeCategories(locale: 'zh' | 'en'): LocalizedCategory[] {
  return CATEGORIES.map((c) => ({ id: c.id, label: c[locale] }));
}

export function localizePost(p: Post, locale: 'zh' | 'en'): LocalizedPost {
  const zh = locale === 'zh';
  return {
    id: p.id,
    cat: p.cat,
    catLabel: CATEGORIES.find((c) => c.id === p.cat)![locale],
    date: p.date,
    read: p.read,
    title: zh ? p.zh : p.en,
    summary: zh ? p.sumZh : p.sumEn,
    likes: p.likes,
    comments: p.cmts.map((c) => ({ who: c.who, text: c[locale] })),
  };
}

/** 每年的文章数，按年份倒序 */
export function archiveByYear(list: Pick<Post, 'date'>[]): { year: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const p of list) {
    const y = p.date.slice(0, 4);
    counts.set(y, (counts.get(y) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([year, count]) => ({ year, count }));
}

// 按日期倒序排列
export const posts: Post[] = [
  {
    id: 'permission-model',
    cat: 'tech',
    date: '2026-09-18',
    read: 11,
    zh: '把权限模型从代码里搬进数据库之后',
    en: 'After moving the permission model out of code',
    sumZh: '我们曾经把角色写在枚举里，加一个角色要改四个服务。这篇记录迁移到数据库驱动的策略模型时，哪些假设站不住脚。',
    sumEn: 'We used to keep roles in an enum, so adding one meant touching four services. Notes on which assumptions broke when we moved to database-driven policies.',
    likes: 48,
    cmts: [
      { who: 'Lin', zh: '策略缓存那段很有用，我们也踩了最终一致的坑。', en: 'The policy cache section helped. We hit the same eventual-consistency trap.' },
      { who: 'Z', zh: '想问下 CASL 的规则是怎么序列化下发的？', en: 'How do you serialize the CASL rules for distribution?' },
    ],
  },
  {
    id: 'meilisearch-limits',
    cat: 'tech',
    date: '2026-07-02',
    read: 7,
    zh: 'MeiliSearch 够用的那条线在哪里',
    en: 'Where MeiliSearch stops being enough',
    sumZh: '中文分词、同义词和多字段权重都能调好，但到了需要聚合统计和复杂过滤组合的时候，就该换思路了。',
    sumEn: 'Chinese tokenization, synonyms and field weights all tune fine. Once you need aggregations and complex filter combinations, it is time to rethink.',
    likes: 31,
    cmts: [{ who: 'Mu', zh: '同感，我们最后混着用了。', en: 'Same here, we ended up running both.' }],
  },
  {
    id: 'on-abstraction',
    cat: 'note',
    date: '2026-05-21',
    read: 5,
    zh: '写了七年代码，我对抽象的态度变了',
    en: 'Seven years in, I feel differently about abstraction',
    sumZh: '早几年我觉得重复是罪。现在我更怕过早抽象——它会把还没想清楚的假设固化成接口。',
    sumEn: 'Early on I treated duplication as a sin. Now I am more afraid of premature abstraction: it freezes assumptions you have not finished thinking through into an interface.',
    likes: 96,
    cmts: [
      { who: 'Hao', zh: '第三段说到我了。', en: 'The third paragraph got me.' },
      { who: 'Ting', zh: '“等到第三次重复再抽”这个标准我一直在用。', en: 'The rule of waiting for the third repetition is one I keep using.' },
    ],
  },
  {
    id: 'remote-year-three',
    cat: 'life',
    date: '2026-03-09',
    read: 6,
    zh: '远程工作第三年的一些实话',
    en: 'Some honest notes on year three of remote work',
    sumZh: '效率不是问题，边界才是。说说我怎么处理时区、同步沟通的成本，以及把工作从家里挪出去的那次尝试。',
    sumEn: 'Productivity was never the issue; boundaries were. On time zones, the cost of synchronous communication, and the time I tried moving work out of the house.',
    likes: 64,
    cmts: [],
  },
  {
    id: 'canvas-particles',
    cat: 'tech',
    date: '2026-01-14',
    read: 9,
    zh: 'Canvas 粒子系统的性能边界',
    en: 'Performance limits of a canvas particle system',
    sumZh: '一千个粒子在手机上掉帧的原因通常不是数量，是每帧的 fillStyle 字符串拼接和 createRadialGradient。',
    sumEn: 'When a thousand particles drop frames on a phone, the count is usually not the cause. Per-frame fillStyle string building and createRadialGradient are.',
    likes: 72,
    cmts: [{ who: 'Ye', zh: '离屏 canvas 预渲染这招我试了，提升很明显。', en: 'Pre-rendering to an offscreen canvas made a clear difference for me.' }],
  },
  {
    id: 'desk-and-tools',
    cat: 'life',
    date: '2025-11-26',
    read: 4,
    zh: '我的桌面和那些没用上的工具',
    en: 'My desk, and the tools I never ended up using',
    sumZh: '买过的键盘、装过的效率软件、订阅过又退掉的服务。最后留下来的东西比想象中少。',
    sumEn: 'Keyboards I bought, productivity apps I installed, subscriptions I cancelled. Less survived than I expected.',
    likes: 27,
    cmts: [],
  },
];
