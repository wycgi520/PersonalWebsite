export interface Project {
  id: string;
  year: string;
  hue: number;
  tags: string[];
  zh: string;
  en: string;
  sumZh: string;
  sumEn: string;
  archZh: string;
  archEn: string;
  tradeZh: string;
  tradeEn: string;
  resZh: string;
  resEn: string;
  /** 站内路径（以 / 开头，走带语言前缀的 Link）或外部 URL */
  demoUrl?: string;
  repoUrl?: string;
}

/** 按语言取好的项目字段，供客户端组件使用（只把当前语言的文案传过去） */
export interface LocalizedProject {
  id: string;
  index: number;
  year: string;
  hue: number;
  seed: number;
  tags: string[];
  title: string;
  summary: string;
  architecture: string;
  tradeoff: string;
  outcome: string;
  demoUrl?: string;
  repoUrl?: string;
}

export function localizeProject(p: Project, index: number, locale: 'zh' | 'en'): LocalizedProject {
  const zh = locale === 'zh';
  return {
    id: p.id,
    index,
    year: p.year,
    hue: p.hue,
    // 与原型一致的缩略图种子，保证每张卡片的几何图案固定
    seed: index * 7919 + 13,
    tags: p.tags,
    title: zh ? p.zh : p.en,
    summary: zh ? p.sumZh : p.sumEn,
    architecture: zh ? p.archZh : p.archEn,
    tradeoff: zh ? p.tradeZh : p.tradeEn,
    outcome: zh ? p.resZh : p.resEn,
    demoUrl: p.demoUrl,
    repoUrl: p.repoUrl,
  };
}

export const projects: Project[] = [
  {
    id: 'atlas',
    year: '2025—2026',
    hue: 198,
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'MeiliSearch'],
    zh: 'Atlas 内容中台',
    en: 'Atlas content platform',
    sumZh: '给三条业务线共用的内容系统。核心难点是把各自定义的字段结构收进同一套模型，又不让编辑感到被约束。',
    sumEn: 'A shared content system for three business lines. The hard part was folding their custom field structures into one model without making editors feel boxed in.',
    archZh: 'Next.js App Router 做编辑端，内容模型用 Prisma 的多态关联实现「字段组」抽象；检索走 MeiliSearch，写入时经队列异步同步索引。',
    archEn: 'Next.js App Router for the editor. Content types are built on a field-group abstraction over Prisma polymorphic relations; search runs on MeiliSearch with index sync pushed through a queue.',
    tradeZh: '没有做成通用 headless CMS。三条业务线的差异集中在字段层，继续往上抽象会让查询变慢也更难调试，于是只在字段层做泛化，路由和权限写死。',
    tradeEn: 'I did not build a general-purpose headless CMS. The differences lived in the field layer; abstracting further would have slowed queries and made debugging worse, so generalization stops at fields and routing stays explicit.',
    resZh: '编辑一篇多语言内容的耗时从约 11 分钟降到 4 分钟；搜索 p95 在 40ms 以内。',
    resEn: 'Authoring a multilingual entry went from about 11 minutes to 4. Search p95 stays under 40ms.',
  },
  {
    id: 'gate',
    year: '2024—2025',
    hue: 172,
    tags: ['Hono', 'CASL', 'Redis', 'JWKS'],
    zh: 'Gate 权限服务',
    en: 'Gate permission service',
    sumZh: '把散在四个服务里的鉴权逻辑收到一处。角色和策略存库，能热更新，不用重新部署。',
    sumEn: 'Pulled authorization logic out of four services into one place. Roles and policies live in the database and update without a redeploy.',
    archZh: 'Hono 提供策略查询与下发，CASL 在各服务内做本地判定；JWT 用非对称密钥签发，服务侧通过 JWKS 远程验签，策略变更靠 Redis 发布订阅推送。',
    archEn: 'Hono serves and distributes policies while CASL evaluates locally inside each service. JWTs are signed asymmetrically and verified remotely via JWKS; policy changes propagate over Redis pub/sub.',
    tradeZh: '判定放在各服务本地而不是中心化调用。牺牲了策略生效的强一致（最终一致，约 2 秒），换掉了每个请求一次网络往返。',
    tradeEn: 'Evaluation happens locally rather than through a central call. That trades strict consistency on policy changes (eventually consistent, roughly 2s) for removing a network round trip per request.',
    resZh: '鉴权相关的重复代码减少约 70%，新服务接入从两天缩到半天。',
    resEn: 'Cut duplicated auth code by around 70%. Onboarding a new service went from two days to half a day.',
  },
  {
    id: 'relay',
    year: '2024',
    hue: 36,
    tags: ['BullMQ', 'Redis', 'Nodemailer', 'Node.js'],
    zh: 'Relay 通知队列',
    en: 'Relay notification queue',
    sumZh: '注册验证、密码找回和运营邮件共用的发送服务。要解决的是高峰期堆积和第三方限流。',
    sumEn: 'One sending service behind signup verification, password resets and marketing mail. Built to deal with peak backlogs and third-party rate limits.',
    archZh: 'BullMQ 分三个优先级队列，事务邮件优先；按供应商维度做令牌桶限流，失败走指数退避重试，三次后转人工队列。',
    archEn: 'BullMQ with three priority queues so transactional mail goes first. Per-provider token-bucket rate limiting, exponential backoff on failure, and a manual queue after three attempts.',
    tradeZh: '没有自建 SMTP。自建能省成本，但送达率和合规要长期投入，用云服务加一层抽象更划算，必要时能换供应商。',
    tradeEn: 'No self-hosted SMTP. It would be cheaper, but deliverability and compliance need ongoing investment; a thin abstraction over cloud providers is a better deal and keeps switching possible.',
    resZh: '高峰期事务邮件 p99 送达 8 秒内，失败率从 1.3% 降到 0.2%。',
    resEn: 'Peak transactional p99 delivery within 8 seconds; failure rate down from 1.3% to 0.2%.',
  },
  {
    id: 'site',
    year: '2026',
    hue: 210,
    tags: ['Next.js', 'Motion', 'Canvas', 'MDX'],
    zh: '这个网站',
    en: 'This website',
    sumZh: '星图导航和篝火都是手写 canvas 与 SVG，没有引 3D 库。想试试在不牺牲可访问性的前提下能做到多少交互。',
    sumEn: 'The star chart and the campfire are hand-written canvas and SVG, no 3D library. An experiment in how much interaction fits without giving up accessibility.',
    archZh: 'SSG 预渲染内容页，星图节点是 SVG + requestAnimationFrame 驱动的漂移，篝火是两套参数分开的粒子系统；文章走 MDX 自定义渲染器。',
    archEn: 'Content pages are pre-rendered with SSG. Star nodes are SVG driven by requestAnimationFrame; the campfire is a particle system with separate parameters for flame body and embers. Posts render through a custom MDX pipeline.',
    tradeZh: '星图很炫但不能是唯一入口。顶部导航始终可用，星点支持键盘聚焦，reduced-motion 下所有自发动效停止——创意交互必须有降级路径。',
    tradeEn: 'The chart is the centerpiece but cannot be the only way in. The top nav always works, star nodes take keyboard focus, and every self-starting animation stops under reduced-motion. Creative interaction needs a fallback.',
    resZh: '首屏 LCP 1.2 秒，Lighthouse 可访问性 100。',
    resEn: 'LCP of 1.2s, Lighthouse accessibility 100.',
    demoUrl: '/',
    // repoUrl：仓库公开后填入
  },
];
