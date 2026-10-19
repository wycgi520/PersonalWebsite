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
    zh: '把权限模型从代码枚举搬进数据库之后',
    en: 'Migrating Permission Models from Hardcoded Enums to the Database',
    sumZh: '团队曾将角色硬编码在代码枚举中，新增一个权限维度需协同联调四个微服务。本文系统复盘迁移至数据库驱动的策略化 RBAC/ABAC 模型时，遇到的规则序列化、缓存穿透与最终一致性陷阱。',
    sumEn: 'We used to lock user roles inside hardcoded enums, where adding a permission meant modifying four services. Here is an honest post-mortem on transitioning to a database-driven policy model, covering cache invalidation and eventual consistency.',
    likes: 48,
    cmts: [
      { who: 'Lin', zh: '策略缓存失效与版本号机制那段非常实用，我们团队也曾踩过最终一致性与跨服务广播的坑。', en: 'The section on policy cache invalidation was spot-on. We ran into the exact same eventual consistency traps with cross-service cache broadcasts.' },
      { who: 'Z', zh: '想请教一下，CASL 的规则集合在复杂条件匹配下，是如何做到高效序列化并下发给前端的？', en: 'Curious about how you serialize CASL rule matrices for client-side consumption when conditions get complex?' },
    ],
  },
  {
    id: 'meilisearch-limits',
    cat: 'tech',
    date: '2026-07-02',
    read: 7,
    zh: 'MeiliSearch 够用的那条线在哪里：轻量搜索引擎的选型边界',
    en: 'Where MeiliSearch Thrives and Where It Reaches Its Limits',
    sumZh: '中文分词、拼音同义词匹配和多字段权重都能开箱调优。但当业务演进至多维深度聚合统计与高基数复合过滤时，何时该坚守轻量，何时该平滑演进至专用搜索集群？',
    sumEn: 'CJK tokenization, typo tolerance, and field weights are a breeze to tune out of the box. But when requirements shift toward deep faceted aggregations and complex compound filters, how do you know when to scale beyond?',
    likes: 31,
    cmts: [{ who: 'Mu', zh: '深有同感，高频点查走 MeiliSearch 体验极佳，复杂聚合统计我们最后混用了 ClickHouse 做补充。', en: 'Strongly agree. MeiliSearch is unbeatable for interactive typeahead, but we ended up offloading deep analytical facets to ClickHouse.' }],
  },
  {
    id: 'on-abstraction',
    cat: 'note',
    date: '2026-05-21',
    read: 5,
    zh: '写了七年代码，我对“抽象”的态度变了',
    en: 'Seven Years In: Rethinking the Cost of Premature Abstraction',
    sumZh: '早期视代码重复为原罪，现在更敬畏过早抽象带来的架构反噬——它会将未经验证的片面认知固化为难以撼动的接口契约。分享如何建立“三次复用原则”与延迟抽象的工程直觉。',
    sumEn: 'Early on, I treated duplication as a mortal sin. Today, I fear premature abstraction far more: it cements half-baked assumptions into brittle interfaces. Notes on cultivating intuition for the Rule of Three.',
    likes: 96,
    cmts: [
      { who: 'Hao', zh: '关于“把偶然的一致误当作业务规律”那一段深有共鸣，曾经重构一时爽，维护火葬场。', en: 'The part about confusing incidental duplication with essential business logic struck a chord. So many hours wasted maintaining flawed abstractions.' },
      { who: 'Ting', zh: '“等到第三次重复再考虑抽象”的标准我们团队一直在贯彻，确实大幅降低了不必要的设计复杂度。', en: 'The Rule of Three has become a golden guideline in our team. It saves countless hours of premature over-engineering.' },
    ],
  },
  {
    id: 'remote-year-three',
    cat: 'life',
    date: '2026-03-09',
    read: 6,
    zh: '全职远程第三年：关于自驱、时区边界与沟通损耗的实话',
    en: 'Year Three of Remote Work: Honest Notes on Boundaries and Async Culture',
    sumZh: '远程协作的核心瓶颈从来不是代码产出，而是身心边界的维系。聊聊我如何推进异步文档交付、控制跨时区沟通税，以及建立可持续的日常专注节奏。',
    sumEn: 'Productivity is rarely the hurdle in remote setups; psychological boundaries are. Insights on mastering asynchronous documentation, mitigating time-zone taxes, and cultivating sustainable focus.',
    likes: 64,
    cmts: [],
  },
  {
    id: 'canvas-particles',
    cat: 'tech',
    date: '2026-01-14',
    read: 9,
    zh: '深入 Canvas 粒子系统：从 30fps 到满帧的性能优化实录',
    en: 'Pushing Canvas to 60fps: Demystifying Particle System Bottlenecks',
    sumZh: '当上千个粒子在移动端掉帧时，真正的瓶颈往往不是数学计算，而是每帧无意识的 fillStyle 字符串拼接与渐变对象重复创建。实测离屏缓存预渲染、对象池与批量绘制技巧。',
    sumEn: 'When 1,000 canvas particles stutter on mobile, raw math is rarely to blame. The hidden culprits are per-frame string allocations and gradient recreations. Lessons on offscreen caching, object pooling, and batch draws.',
    likes: 72,
    cmts: [{ who: 'Ye', zh: '离屏 Canvas 预渲染静态层并在逐帧绘制中做批处理这招非常管用，低端安卓机上的掉帧问题瞬间解决了！', en: 'Offscreen canvas pre-rendering and batching draw calls made a massive difference. Completely eliminated frame drops on budget devices!' }],
  },
  {
    id: 'desk-and-tools',
    cat: 'life',
    date: '2025-11-26',
    read: 4,
    zh: '我的数字工作台：经过时间淘洗后留下的极简生产力工具',
    en: 'My Digital Workbench: What Survived the Productivity Hype Cycle',
    sumZh: '折腾过数十款客制化键盘、效率神器与按月付费的云服务，最终工作流反向收敛。聊聊那些真正抵抗住遗忘曲线、沉淀为肌肉记忆的核心工具与心法。',
    sumEn: 'After testing dozens of keyboards, flashy note apps, and recurring SaaS subscriptions, my setup converged onto minimalism. A reflection on tools that genuinely stood the test of time.',
    likes: 27,
    cmts: [],
  },
];
