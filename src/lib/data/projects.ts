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
    id: 'deals',
    year: '2022—2023',
    hue: 14,
    tags: ['Next.js', 'NestJS', 'TypeORM', 'Ant Design Pro'],
    zh: '折扣导购平台',
    en: 'Deal discovery platform',
    sumZh: '为海外客户做的折扣导购站：用户端浏览、收藏和分享优惠，运营在后台上架商品、管理品牌与优惠券。线上演示已重新设计界面、替换品牌，并改用演示数据。',
    sumEn: 'A deal-discovery site built for an overseas client: shoppers browse, save and share offers while operators list deals and manage brands and coupons. The live demo has a redesigned UI, a placeholder brand and demo data.',
    archZh: '用户端 Next.js 服务端渲染，按分类、关键词分页拉取商品；后端 NestJS + TypeORM + MySQL，Redis 做会话与缓存，WebSocket 推送新上架优惠；运营后台基于 Umi + Ant Design Pro，按 RBAC 分配权限。',
    archEn: 'The storefront is server-rendered Next.js, paging deals by category and keyword. The backend is NestJS with TypeORM on MySQL, Redis for sessions and caching, and WebSocket pushes for newly listed deals. The admin runs on Umi with Ant Design Pro and RBAC permissions.',
    tradeZh: '列表页走服务端渲染而不是纯前端拉取。导购站的流量主要来自搜索和分享链接，首屏直接带上商品数据，换来更好的收录和分享预览，代价是每次翻页都要请求服务端。',
    tradeEn: 'Listing pages render on the server instead of fetching on the client. Most traffic comes from search and shared links, so shipping deal data in the first response buys better indexing and link previews, at the cost of a server round trip per page.',
    resZh: '前台、后台与 API 三端交付，覆盖注册登录、收藏分享、订单和积分兑换等流程。',
    resEn: 'Delivered storefront, admin and API, covering sign-up, favorites and sharing, orders and reward redemption.',
    demoUrl: 'https://www.wycgi.cn/cases/deals',
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
