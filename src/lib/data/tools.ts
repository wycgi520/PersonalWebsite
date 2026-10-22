/** 工具标签。新增标签只需在这里追加一项，筛选按钮会自动出现 */
export const TOOL_TAGS = [
  { id: 'dev', zh: '开发', en: 'Dev' },
  { id: 'design', zh: '设计', en: 'Design' },
  { id: 'read', zh: '阅读', en: 'Reading' },
  { id: 'ops', zh: '运维', en: 'Ops' },
] as const;

export type ToolTagId = (typeof TOOL_TAGS)[number]['id'];

export interface Tool {
  id: string;
  /** 名称；只有英文界面需要不同写法时才填 nameEn */
  name: string;
  nameEn?: string;
  url: string;
  tag: ToolTagId;
  /** 最后确认仍在用的年月 YYYY-MM */
  checked: string;
  zh: string;
  en: string;
}

export const tools: Tool[] = [
  {
    id: 'excalidraw', name: 'Excalidraw', url: 'https://excalidraw.com', tag: 'design', checked: '2026-09',
    zh: '手绘风格的白板草图工具。平时用来画系统架构草图、业务时序和表关系，导出的 SVG 可以直接放进技术文档。',
    en: 'Hand-drawn style diagramming tool. Great for sketching system architecture, sequence flows, and table relationships, with clean SVG exports for docs.',
  },
  {
    id: 'dbeaver', name: 'DBeaver', url: 'https://dbeaver.io', tag: 'dev', checked: '2026-08',
    zh: '跨平台数据库管理客户端。支持 PostgreSQL、MySQL 等主流数据库，平时排查复杂外键约束、核对 Prisma 迁移结果和查看执行计划主要靠它。',
    en: 'Cross-platform database GUI client. Much faster than CLI when inspecting foreign keys, verifying Prisma migrations, and checking query plans.',
  },
  {
    id: 'bruno', name: 'Bruno', url: 'https://usebruno.com', tag: 'dev', checked: '2026-09',
    zh: '开源、纯本地存储的 API 调试工具。接口集合直接存成纯文本文件放进代码仓库，方便跟着 Git 分支一起做版本管理和团队同步。',
    en: 'Open-source, local-first API client. Saves request collections as plain-text files right inside the repo so they version cleanly with Git.',
  },
  {
    id: 'railway', name: 'Railway', url: 'https://railway.app', tag: 'ops', checked: '2026-07',
    zh: '省心的应用与数据库托管平台。几分钟就能拉起 PostgreSQL、Redis 和 Node 服务，适合快速部署测试环境和客户演示站。',
    en: 'Straightforward cloud hosting for apps and databases. Spins up PostgreSQL, Redis, and Node services in minutes for staging and client demos.',
  },
  {
    id: 'umami', name: 'Umami', url: 'https://umami.is', tag: 'ops', checked: '2026-06',
    zh: '开源、轻量的自托管网站访问统计工具。不用 Cookie，脚本体积很小，够看清页面来源和访问量，同时不打扰访客。',
    en: 'Lightweight, self-hosted web analytics. Cookie-free with a tiny script footprint, giving clear traffic insights without tracking bloat.',
  },
  {
    id: 'radix-colors', name: 'Radix Colors', url: 'https://www.radix-ui.com/colors', tag: 'design', checked: '2026-09',
    zh: '配好明暗对比度的色彩阶梯参考。做深浅两套主题时可以直接按它的层级定背景色、边框色和文字色，省去反复调对比度的时间。',
    en: 'Well-calibrated color scales for light and dark themes. Takes the guesswork out of picking accessible backgrounds, borders, and text contrast.',
  },
  {
    id: 'motion', name: 'Motion 文档', nameEn: 'Motion docs', url: 'https://motion.dev', tag: 'dev', checked: '2026-08',
    zh: 'React 动效库 Motion 的官方文档。里面关于弹簧参数（stiffness / damping）和布局过渡的示例很直观，调页面交互动画时常用来作参考。',
    en: 'Official documentation for Motion in React. Practical examples on spring physics and layout transitions when tuning UI animations.',
  },
  {
    id: 'ddia', name: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net', tag: 'read', checked: '2026-03',
    zh: '讲透存储引擎、数据复制、分区与分布式一致性的经典工程书。每次在业务里遇到读写冲突、缓存一致性或分库方案选择时都会拿出来重翻。',
    en: 'Clear, thorough book on storage engines, replication, partitioning, and distributed consistency. My go-to reference whenever data tradeoff questions come up.',
  },
  {
    id: 'refactoring-ui', name: 'Refactoring UI', url: 'https://www.refactoringui.com', tag: 'read', checked: '2025-12',
    zh: '写给开发者的实用界面排版指南。从字号层级、留白间距到色彩明暗讲得很具体，没有设计背景也能照着把后台和业务界面收拾干净。',
    en: 'Practical UI design guide written for developers. Breaks down hierarchy, spacing, and color into concrete rules for cleaning up application interfaces.',
  },
  {
    id: 'caddy', name: 'Caddy', url: 'https://caddyserver.com', tag: 'ops', checked: '2026-05',
    zh: 'Go 编写的 Web 服务器与反向代理。自带 HTTPS 证书自动申请和续期，Caddyfile 配置比 Nginx 简短很多，维护个人服务器非常省事。',
    en: 'Go-based web server and reverse proxy with automatic HTTPS certificate provisioning. A much shorter, cleaner config than Nginx for self-hosted services.',
  },
];

export interface LocalizedToolTag {
  id: ToolTagId;
  label: string;
}

/** 按语言取好的工具字段，供客户端组件使用 */
export interface LocalizedTool {
  id: string;
  name: string;
  url: string;
  /** 不带 www. 的域名，卡片上显示 */
  host: string;
  tag: ToolTagId;
  tagLabel: string;
  checked: string;
  description: string;
  /** 搜索用的小写文本：两种语言的名称、介绍、标签和域名都算，中文界面搜英文也能命中 */
  haystack: string;
}

export function localizeToolTags(locale: 'zh' | 'en'): LocalizedToolTag[] {
  return TOOL_TAGS.map((g) => ({ id: g.id, label: g[locale] }));
}

export function localizeTool(tool: Tool, locale: 'zh' | 'en'): LocalizedTool {
  const tag = TOOL_TAGS.find((g) => g.id === tool.tag)!;
  const host = new URL(tool.url).hostname.replace(/^www\./, '');
  return {
    id: tool.id,
    name: locale === 'en' && tool.nameEn ? tool.nameEn : tool.name,
    url: tool.url,
    host,
    tag: tool.tag,
    tagLabel: tag[locale],
    checked: tool.checked,
    description: tool[locale],
    haystack: [tool.name, tool.nameEn, tool.zh, tool.en, tag.zh, tag.en, host]
      .filter(Boolean)
      .join(' ')
      .toLowerCase(),
  };
}

/** 把查询拆成关键词：按空白分隔，所有词都要命中（AND） */
export function queryTerms(query: string): string[] {
  return query.trim().toLowerCase().split(/\s+/).filter(Boolean);
}

export function matchesTerms(tool: LocalizedTool, terms: string[]): boolean {
  return terms.every((term) => tool.haystack.includes(term));
}
