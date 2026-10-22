export interface Project {
  id: string;
  year: string;
  hue: number;
  tags: string[];
  image?: string;
  zh: string;
  en: string;
  sumZh: string;
  sumEn: string;
  archZh: string;
  archEn: string;
  tradeZh?: string;
  tradeEn?: string;
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
  image?: string;
  title: string;
  summary: string;
  architecture: string;
  tradeoff?: string;
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
    image: p.image,
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
    id: 'medtech',
    year: '2021',
    hue: 12,
    tags: ['WordPress', 'Divi', 'PHP', 'MySQL', 'Next.js', 'Tailwind CSS'],
    image: '/images/projects/medtech.webp',
    zh: '医疗器械品牌官网与产品目录',
    en: 'Medical Device Brand Site & Product Catalogue',
    sumZh: '面向医生与医院采购的医疗器械企业官网：按身体系统浏览病症科普，从病症直达相关器械，产品页提供规格、用法与多尺寸 SKU，并支持产品对比与询价单。在线演示为脱敏重构版本，使用虚构品牌与演示数据。',
    sumEn: 'A corporate site for a medical device maker, aimed at clinicians and hospital buyers. Visitors browse condition guides by body system, jump from a condition to the devices used to treat it, and see specs, usage steps and SKUs on each product page, with side-by-side comparison and a quote request. The live demo is a sanitized rebuild with a fictional brand and mock data.',
    archZh: '原项目基于 WordPress + Divi 子主题交付，以 Divi 模块化布局和可复用版块搭建病症、解决方案与产品页面，运营人员可在后台自行维护内容；子主题定制页眉页脚、滚动吸顶导航与标题规则。演示版用 Next.js 静态预渲染重写全部页面，对比列表与询价单存于本地，表单在浏览器端完成校验。',
    archEn: 'The original was delivered on WordPress with a Divi child theme. Condition, solution and product pages were assembled from reusable Divi layouts so the client team could edit content themselves, and the child theme customised the header, footer, sticky navigation and title rules. The demo rewrites every page in statically pre-rendered Next.js, keeps the comparison list and quote request in local storage and validates the form in the browser.',
    tradeZh: '客户需要非技术人员也能频繁更新病症与产品内容，因此选择 WordPress + 可视化构建器而非定制前后端，用模板版块约束样式一致性；代价是页面体积偏大，通过 WebP 图片与精简插件控制加载速度。',
    tradeEn: 'Non-technical staff needed to update condition and product content often, so a WordPress visual builder won over a custom stack, with saved layout sections keeping pages consistent. The cost was heavier pages, kept in check with WebP images and a minimal plugin set.',
    resZh: '交付公司介绍、使命愿景、病症科普、解决方案与产品详情等页面模板，覆盖十余个病症与产品页面，内容团队可自主扩展新页面。',
    resEn: 'Delivered templates for company, mission, condition guides, solutions and product detail pages, covering more than ten conditions and products, with the content team able to add new pages on their own.',
    demoUrl: 'https://www.wycgi.cn/cases/medtech',
  },
  {
    id: 'campus',
    year: '2022',
    hue: 228,
    tags: ['Next.js', 'NestJS', 'Fastify', 'TypeORM', 'Redis', 'Vue 3'],
    image: '/images/projects/campus.webp',
    zh: '校园选课与学习社区平台',
    en: 'Campus Course Planning & Student Community',
    sumZh: '面向留学生的一站式校园平台：课程与教授点评、无冲突课表规划、GPA 估算与校园信息板（二手、转租、拼车、活动）集于一处。在线演示为脱敏重构版本，使用虚构学校与演示数据。',
    sumEn: 'An all-in-one campus platform for international students: course and instructor reviews, clash-free timetable planning, GPA estimation and a campus board for listings, sublets, rideshares and events. The live demo is a sanitized rebuild with a fictional university and mock data.',
    archZh: '用户端基于 Next.js 实现课程目录、详情页静态预渲染与双语切换；服务端采用 NestJS + Fastify + TypeORM + MySQL，按校区、课程、教授、评价、帖子划分模块，Redis 负责缓存与 Bull 任务队列，Socket.IO 推送互动通知；运营后台基于 Vue 3 + Ant Design Vue，支持多校区数据维护、内容审核与 RBAC 权限。',
    archEn: 'The student app uses Next.js with statically pre-rendered catalogue and detail pages plus bilingual UI. The backend runs NestJS on Fastify with TypeORM and MySQL, split into campus, course, instructor, review and post modules; Redis backs caching and Bull job queues, and Socket.IO pushes interaction notifications. The ops console is built on Vue 3 and Ant Design Vue for multi-campus data, moderation and RBAC.',
    tradeZh: '课表冲突检测、学分统计与 GPA 估算全部放在客户端计算并本地持久化，未登录也能完整使用，减少接口往返；点评与评分聚合则在服务端预计算后缓存，避免热门课程页面重复统计。',
    tradeEn: 'Timetable clash detection, credit totals and GPA estimates run entirely on the client with local persistence, so the planner works without signing in and needs no round-trips. Review and rating aggregates are precomputed and cached server-side so popular course pages never recount.',
    resZh: '交付学生端、运营后台与 API 三端，覆盖多校区课程数据、点评与评分、课表规划、校园帖子与用户认证全流程。',
    resEn: 'Delivered the student app, ops console and API, covering multi-campus course data, reviews and ratings, timetable planning, campus posts and user verification end to end.',
    demoUrl: 'https://www.wycgi.cn/cases/campus',
  },
  {
    id: 'deals',
    year: '2023',
    hue: 14,
    tags: ['Next.js', 'NestJS', 'TypeORM', 'Ant Design Pro', 'Redis', 'WebSocket'],
    image: '/images/projects/deals.webp',
    zh: '海外折扣导购与优惠聚合平台',
    en: 'Cross-Border Deal & Coupon Platform',
    sumZh: '面向海外消费市场的折扣聚合与电商导购平台。前台支持优惠检索、收藏与分享，后台集成多站点运营、品牌管理与优惠券核销。在线演示为脱敏重构版本，预置演示数据。',
    sumEn: 'An e-commerce deal aggregation and affiliate platform built for overseas markets. Shoppers browse, filter, and save deals, while operators manage brands, campaigns, and coupons through an admin console. The live demo is a sanitized rebuild with mock data.',
    archZh: '用户前台采用 Next.js (SSR) 兼顾首屏加载与搜索引擎收录，支持多条件过滤与关键词搜索；服务端基于 NestJS + TypeORM + MySQL 构建，使用 Redis 做热点缓存与会话管理，通过 WebSocket 推送降价提醒；管理后台基于 Ant Design Pro 实现 RBAC 权限管理。',
    archEn: 'The storefront uses Next.js SSR for fast initial loads and search indexing with multi-attribute filtering. The backend runs on NestJS, TypeORM, and MySQL, with Redis handling hot caching and sessions, plus WebSocket for price-drop alerts. The admin console is built with Ant Design Pro and role-based access control.',
    tradeZh: '为了兼顾页面响应速度与海外搜索引擎收录，前台采用 Next.js 服务端渲染而非纯单页应用；优惠库存与价格变动通过 Redis 缓存失效配合 WebSocket 增量推送更新，减少促销高峰期的数据库查询压力。',
    tradeEn: 'Chose Next.js SSR over a client-only SPA to balance initial render speed with search engine indexing. Deal freshness is handled via Redis cache invalidation and incremental WebSocket updates, reducing database load during traffic spikes.',
    resZh: '交付用户前台、管理后台与服务端 API，覆盖用户登录、折扣收藏、返利链接跳转与积分兑换完整流程。',
    resEn: 'Delivered the storefront, admin dashboard, and REST API, covering authentication, deal bookmarking, affiliate link tracking, and points redemption.',
    demoUrl: 'https://www.wycgi.cn/cases/deals',
  },
  {
    id: 'maple',
    year: '2024',
    hue: 350,
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'NestJS'],
    image: '/images/projects/maple.webp',
    zh: '北美移民咨询官网与打分工具',
    en: 'Immigration Consultancy Site & Scoring Tool',
    sumZh: '面向申请人的加拿大移民咨询官网：按移民类别介绍省提名、商业投资等项目，内置快速通道（Express Entry）CRS 打分计算器，并提供文章资讯与留学评分页面。在线演示为脱敏重构版本，使用虚构机构名称与演示数据。',
    sumEn: 'A Canadian immigration consultancy site for prospective applicants: category pages covering Provincial Nominee and investor programs, a built-in Express Entry CRS scoring calculator, plus an articles section and a study-permit scoring page. The live demo is a sanitized rebuild with a fictional firm name and mock data.',
    archZh: '前台基于 Next.js Pages Router 构建多语言（中英切换）服务页面与打分表单，表单状态与评分逻辑在客户端计算；服务端采用 NestJS 提供资讯与轮播内容接口，前端对接口做了降级处理，接口不可用时自动回退到本地演示数据。',
    archEn: 'The front end is built on Next.js Pages Router with bilingual (EN/中文) service pages and scoring forms, computing form state and scores entirely client-side. The backend runs NestJS serving articles and carousel content, with the front end falling back to local demo data whenever the API is unavailable.',
    tradeZh: 'CRS 打分计算器的核心评分表与年龄加分曲线放在前端本地维护，无需请求后端即可完成计算，响应更快也更容易离线演示；资讯类内容仍走接口，保留内容团队独立发布的能力。',
    tradeEn: 'The CRS scoring tables and age-based point curves are kept client-side so the calculator responds instantly and still works for offline demos. Editorial content stays API-driven, preserving the content team’s ability to publish independently.',
    resZh: '交付移民服务介绍、Express Entry 打分计算器、资讯文章与留学评分等页面，覆盖移民咨询机构官网的核心获客路径。',
    resEn: 'Delivered the service overview, Express Entry scoring calculator, articles section and study-permit scoring pages, covering the core client-acquisition journey for an immigration consultancy site.',
    demoUrl: 'https://www.wycgi.cn/cases/maple',
  },
  {
    id: 'atelier',
    year: '2025',
    hue: 38,
    tags: ['Next.js', 'React', 'Tailwind CSS', 'TypeScript', 'Responsive Design'],
    image: '/images/projects/atelier.webp',
    zh: '巴黎视觉传达与品牌定制设计工坊',
    en: 'Atelier V / Paris Visual Design & Branding Studio',
    sumZh: '面向餐饮与独立品牌的视觉设计工坊官网，展示品牌形象设计、纸质与木质菜单装订、餐饮摄影、实木印章包装以及餐厅工作服刺绣定制。在线演示已做脱敏处理并重构为响应式布局。',
    sumEn: 'Website for a Paris-based design studio serving restaurants and independent hospitality brands. Showcases brand identity, paper and wooden menu binding, food photography, custom stamps, and embroidered restaurant uniforms. The live demo is sanitized and rebuilt with a responsive layout.',
    archZh: '基于 Next.js Pages Router 与 Tailwind CSS 构建，将 42 个展示页面（多国餐饮菜单设计、印章工艺、工作服面料选配等）全部静态预渲染（SSG）；把原有设计稿中的固定像素坐标重构为响应式栅格布局，并整理了 SVG 图标与多语言字体回退。',
    archEn: 'Built on Next.js Pages Router and Tailwind CSS, statically pre-rendering all 42 showcase pages across menu design, custom stamps, and uniform configurators. Replaced legacy fixed-pixel coordinates with a fluid responsive grid and clean SVG assets.',
    tradeZh: '原项目将桌面端与移动端拆成两套代码且包含大量固定坐标；重构时合并为同一套响应式布局并统一导航动线，在保留 42 个案例页面与工作服配色预览的同时减小了静态资源体积。',
    tradeEn: 'The original codebase maintained separate desktop and mobile builds with fixed positioning. The rebuild unifies both into a single responsive layout with consistent navigation, keeping all 42 case studies and interactive uniform previews while trimming asset weight.',
    resZh: '完成 42 个案例与定制展示页面的重构上线，覆盖品牌设计、菜单装订、摄影画册、印章与工装刺绣五个版块，支持桌面与移动端浏览。',
    resEn: 'Shipped all 42 showcase and configurator pages across branding, menus, photography, stamps, and uniform embroidery with full desktop and mobile support.',
    demoUrl: 'https://www.wycgi.cn/cases/atelier',
  },
  {
    id: 'site',
    year: '2026',
    hue: 210,
    tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Canvas', 'SVG'],
    image: '/images/projects/site.webp',
    zh: '观星台 / 个人网站',
    en: 'Observatory / Personal Website',
    sumZh: '你现在看到的这个个人网站。首页用原生 SVG 做了星座图导航，关于页用 Canvas 写了篝火粒子动画，配合 Next.js 静态预渲染与 PostgreSQL 评论互动，兼顾视觉辨识度与键盘无障碍访问。',
    sumEn: 'This personal website. Features an interactive SVG star chart on the home page and a Canvas campfire simulation on the about page, paired with Next.js static pre-rendering, bilingual routing, and keyboard accessibility.',
    archZh: '基于 Next.js App Router 实现静态预渲染（SSG）与中英双语路由（next-intl）；首页星图用正弦波算法驱动 SVG 节点漂移与流星动画；关于页篝火采用离屏 Canvas 缓存静态层、弹簧算法跟随鼠标，并可根据帧率自动降级。',
    archEn: 'Built with Next.js App Router SSG and bilingual next-intl routing. The star chart uses sine-wave drift on native SVG nodes; the campfire uses offscreen Canvas caching, spring-damped pointer tracking, and automatic frame-rate throttling.',
    tradeZh: '没有引入 Three.js 等重型 3D 库，而是直接用原生 SVG 与 2D Canvas 手写动画逻辑，大幅减少首屏脚本体积，在核显笔记本和手机浏览器上也能流畅运行，并完整支持系统的减少动态效果设置。',
    tradeEn: 'Avoided heavy 3D WebGL libraries like Three.js in favor of native SVG and 2D Canvas, keeping the JavaScript bundle small and maintaining smooth frame rates on mobile devices while respecting prefers-reduced-motion.',
    resZh: '完成五大核心页面、中英双语切换、日夜主题以及文章评论互动系统，无 JS 环境下核心内容仍可正常浏览。',
    resEn: 'Completed all five core sections, bilingual switching, day/night themes, and article discussions, with all primary content accessible even without JavaScript.',
    demoUrl: '/',
    // repoUrl：仓库公开后填入
  },
];
