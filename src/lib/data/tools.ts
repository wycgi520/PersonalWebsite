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
    zh: '手绘感的架构图工具。我画给自己看的图基本都在这里，导出 SVG 能直接塞进文档。',
    en: 'Hand-drawn style diagramming. Nearly every diagram I draw for myself starts here, and the SVG export drops straight into docs.',
  },
  {
    id: 'dbeaver', name: 'DBeaver', url: 'https://dbeaver.io', tag: 'dev', checked: '2026-08',
    zh: '跨数据库的可视化客户端。调 Prisma 生成的 schema 时比命令行省事。',
    en: 'Cross-database GUI client. Easier than the CLI when inspecting what Prisma generated.',
  },
  {
    id: 'bruno', name: 'Bruno', url: 'https://usebruno.com', tag: 'dev', checked: '2026-09',
    zh: '接口调试工具，请求集合以文件形式存在仓库里，可以跟代码一起 review。',
    en: 'API client that keeps request collections as files in your repo, so they get reviewed with the code.',
  },
  {
    id: 'railway', name: 'Railway', url: 'https://railway.app', tag: 'ops', checked: '2026-07',
    zh: '小项目部署。Postgres 和 Redis 一键起，适合做原型和给客户看的演示环境。',
    en: 'Deployment for small projects. Postgres and Redis in one click, good for prototypes and client-facing demos.',
  },
  {
    id: 'umami', name: 'Umami', url: 'https://umami.is', tag: 'ops', checked: '2026-06',
    zh: '自托管的网站统计，不用 cookie。这个站用的就是它。',
    en: 'Self-hosted, cookie-free website analytics. It is what runs on this site.',
  },
  {
    id: 'radix-colors', name: 'Radix Colors', url: 'https://www.radix-ui.com/colors', tag: 'design', checked: '2026-09',
    zh: '成对的明暗色阶，每一档的对比度都算过。配深浅双主题时省掉大量试色时间。',
    en: 'Paired light and dark scales with contrast worked out at every step. Saves a lot of guessing when building two themes.',
  },
  {
    id: 'motion', name: 'Motion 文档', nameEn: 'Motion docs', url: 'https://motion.dev', tag: 'dev', checked: '2026-08',
    zh: '动效库文档本身就是最好的示例集，spring 参数那几页值得反复看。',
    en: 'The docs double as the best example set. The pages on spring parameters are worth rereading.',
  },
  {
    id: 'ddia', name: 'Designing Data-Intensive Applications', url: 'https://dataintensive.net', tag: 'read', checked: '2026-03',
    zh: '分布式系统那部分我读了三遍。讨论一致性和复制策略时我还会翻回去。',
    en: 'I have read the distributed systems chapters three times, and still go back when consistency or replication comes up.',
  },
  {
    id: 'refactoring-ui', name: 'Refactoring UI', url: 'https://www.refactoringui.com', tag: 'read', checked: '2025-12',
    zh: '写给工程师的界面设计书。层级、留白和颜色这三件事讲得最实用。',
    en: 'Interface design written for engineers. Strongest on hierarchy, whitespace and color.',
  },
  {
    id: 'caddy', name: 'Caddy', url: 'https://caddyserver.com', tag: 'ops', checked: '2026-05',
    zh: '自动签发证书的反向代理。配置文件短到可以记住。',
    en: 'Reverse proxy with automatic certificates. The config is short enough to remember.',
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
