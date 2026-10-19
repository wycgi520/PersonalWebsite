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
    zh: '极简且手绘质感出众的架构草图工具。用于梳理业务时序、系统拓扑与数据流转，SVG 矢量导出可直接无缝嵌入技术文档与 MDX。',
    en: 'Virtual hand-drawn sketching tool for architecture diagrams, system topology, and data flows. Clean SVG exports drop straight into MDX documentation.',
  },
  {
    id: 'dbeaver', name: 'DBeaver', url: 'https://dbeaver.io', tag: 'dev', checked: '2026-08',
    zh: '全能跨平台的数据库通用 GUI 客户端。比纯终端排查效率高出数倍，尤其适合在调试 Prisma 生成的复杂 Schema 迁移与外键约束时快速验证。',
    en: 'Versatile universal database GUI client. Significantly faster than CLI for inspecting migrations, checking foreign key relationships, and fine-tuning Prisma schemas.',
  },
  {
    id: 'bruno', name: 'Bruno', url: 'https://usebruno.com', tag: 'dev', checked: '2026-09',
    zh: '轻量开源、纯本地离线的 API 调试利器。请求集合以纯文本文件形式随代码库版本化管理，完美契合 Git 协同与团队代码审查（Code Review）。',
    en: 'Fast, open-source, offline-first API client. Stores request collections as plain text files directly within the repository, enabling seamless Git tracking and team reviews.',
  },
  {
    id: 'railway', name: 'Railway', url: 'https://railway.app', tag: 'ops', checked: '2026-07',
    zh: '轻量敏捷的现代云部署平台。PostgreSQL、Redis 与独立微服务一键组网秒级拉起，极速搭建高可用的产品原型与客户交付演示环境。',
    en: 'Agile cloud infrastructure for modern apps. Spins up PostgreSQL, Redis, and decoupled services in seconds — optimal for staging prototypes and client preview environments.',
  },
  {
    id: 'umami', name: 'Umami', url: 'https://umami.is', tag: 'ops', checked: '2026-06',
    zh: '开源无 Cookie 的轻量级自托管网站分析系统。严格保护访客隐私、零性能负担且符合 GDPR 规范，全权掌控自身站点的访问洞察。',
    en: 'Open-source, cookie-free, self-hosted web analytics. Complies with GDPR while keeping visitor privacy intact with zero bloated telemetry scripts.',
  },
  {
    id: 'radix-colors', name: 'Radix Colors', url: 'https://www.radix-ui.com/colors', tag: 'design', checked: '2026-09',
    zh: '经过严密无障碍对比度（WCAG）校验的明暗双色阶体系。让深色（Dark）与浅色（Light）主题的设计配比拥有严谨的数学规律，大幅缩减调色试错成本。',
    en: 'Scientifically calibrated color system with guaranteed WCAG contrast compliance. Makes paired dark/light theme tokens consistent, harmonious, and accessible.',
  },
  {
    id: 'motion', name: 'Motion 文档', nameEn: 'Motion docs', url: 'https://motion.dev', tag: 'dev', checked: '2026-08',
    zh: 'React 生态事实标准的声明式动效库。文档交互设计本身即是极佳的动效教学标杆，弹簧物理（Spring Physics）参数章节值得反复研读。',
    en: 'The gold standard motion engine for React. The documentation itself is a masterclass in UI design; the chapters on spring physics and layout transitions are invaluable.',
  },
  {
    id: 'ddia', name: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net', tag: 'read', checked: '2026-03',
    zh: '分布式系统与数据密集型架构圣经。从底层存储引擎、编码演进到复制容灾与分布式共识，每次遇到一致性架构抉择时总会重新翻阅。',
    en: 'The definitive authority on data-intensive systems. From storage engines and encoding to replication, partitioning, and distributed consensus — the book I re-read most.',
  },
  {
    id: 'refactoring-ui', name: 'Refactoring UI', url: 'https://www.refactoringui.com', tag: 'read', checked: '2025-12',
    zh: '写给全栈与后端工程师的高价值界面设计指南。用工程师能深刻理解的实用排版、空间层级、留白与色彩心理学，快速消除廉价的 AI 模板感。',
    en: 'The quintessential UI design manual for engineers. Demystifies visual hierarchy, typography scales, whitespace, and color theory to make any interface feel premium.',
  },
  {
    id: 'caddy', name: 'Caddy', url: 'https://caddyserver.com', tag: 'ops', checked: '2026-05',
    zh: '现代高效、基于 Go 语言的 HTTP/2 静态与反向代理服务器。内置 ACME 协议全自动申请与续签 HTTPS 证书，配置文件清晰简练到可以默写。',
    en: 'Modern, battle-tested Go web server and reverse proxy. Provisions and renews HTTPS certificates automatically via ACME, with a configuration syntax so concise you can memorize it.',
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
