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
    sumZh: '面向海外消费市场的折扣聚合与电商导购平台。前台提供丝滑的优惠检索、收藏与社交分享，中后台集成多租户运营、品牌库收录与优惠券核销流转。在线演示已做脱敏重构并预置完整演示数据。',
    sumEn: 'An e-commerce deal aggregation and affiliate platform built for overseas markets. Shoppers discover, filter, and share deals seamlessly, while operators manage brands, campaigns, and dynamic coupons through a full-featured admin console. Demo UI is sanitized with mock data.',
    archZh: '用户前台采用 Next.js (SSR) 兼顾首屏毫秒级加载与 SEO 收录，支持海量商品的多维过滤与即时搜索；服务端基于 NestJS + TypeORM + MySQL 构建分层架构，引入 Redis 实现高频缓存与会话状态管理，借助 WebSocket 实时广播降价提醒；管理后台基于 Ant Design Pro，构建细粒度 RBAC 权限体系。',
    archEn: 'Storefront leverages Next.js SSR for sub-second page loads and optimal SEO indexing with multi-dimensional filtering. The backend is architected on NestJS, TypeORM, and MySQL, with Redis handling high-frequency caching and session storage, plus WebSocket for instant price drop broadcasts. The admin portal is built on Ant Design Pro with granular RBAC permissions.',
    tradeZh: '为兼顾全球分发的即时响应与海外 SEO 权重，未采用全套 SPA/CSR，而是选择 Next.js 混合渲染；优惠时效性通过 Redis 缓存失效与 WebSocket 局域增量推送兜底，避免大促峰值击穿主库。',
    tradeEn: 'Balanced global sub-second responsiveness with search engine crawlers by choosing Next.js SSR over pure SPA/CSR. Flash sale freshness is guaranteed via Redis cache invalidation and WebSocket incremental pushes, shielding the core database from peak traffic spikes.',
    resZh: '完成前台门户、管理后台与微服务 API 三端闭环交付，完整覆盖用户鉴权、收藏分发、返利订单追踪及积分兑换链路，保障高并发大促下的稳定运行。',
    resEn: 'Successfully delivered the storefront, administrative dashboard, and RESTful API cluster. Fully covered authentication, affiliate deal distribution, order tracking, and loyalty points redemption with rock-solid stability.',
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
    en: 'Atelier V · Paris Visual Design & Branding Studio',
    sumZh: '面向餐饮、独立品牌与生活方式机构的法式视觉传达与品牌定制设计工坊官网。整合品牌形象全案、特种纸与木质菜单设计装订、商业美食摄影、实木印章与定制包装，以及餐厅后厨与前堂工作服刺绣定制。在线演示已全面脱敏并重构为响应式现代化界面。',
    sumEn: 'A Paris-based creative studio website tailored for boutique restaurants, hospitality venues, and independent brands. Features comprehensive branding systems, bespoke paper & wood menu design, food photography, wooden stamps & packaging, and custom embroidered restaurant uniforms. Live demo is fully sanitized and redesigned into a responsive modern interface.',
    archZh: '基于 Next.js Pages Router 与 Tailwind CSS 构建，针对 42 个多层级展示页面（中日韩越泰餐厅菜单设计、特种工艺印章、工作服面料选配等）实现全量静态页面预渲染（SSG）；针对移动端与桌面端自适应排版，将原 Adobe XD 绝对坐标重构为弹性栅格与现代排版系统；引入轻量 SVG 矢量资产与无损字体降级方案。',
    archEn: 'Built on Next.js Pages Router and Tailwind CSS, statically pre-rendering all 42 detailed showcase pages (covering multi-cuisine restaurant menu design, bespoke stamps, and uniform customization). Migrated from legacy fixed coordinates to a fluid, fully responsive grid system, paired with lightweight bespoke SVG vector assets and typography fallbacks.',
    tradeZh: '原项目采用 PC 端与移动端分离的独立构建架构且包含较多硬编码坐标；重构时融合自适应响应式布局并统一组件库与顶栏动线，在保留全部 42 个精选案例与面料交互演示的同时大幅精简静态资源体积，确保全平台秒级首屏与流畅浏览。',
    tradeEn: 'The original project maintained separate desktop and mobile codebases with rigid coordinate systems. The rebuilt demo unifies the layout into a fluid responsive interface with standardized navigation, preserving all 42 showcase case studies and interactive uniform previews while significantly optimizing bundle assets.',
    resZh: '完成 42 个作品与定制页面全量上线，涵盖品牌视觉、多国料理菜单装订、商业摄影画册、实物印章工艺及前台工装刺绣全链路展示，实现零信息泄漏与全端适配。',
    resEn: 'Successfully deployed all 42 showcase and customization pages across branding, culinary menus, editorial brochures, stamps, and apparel embroidery with zero information leaks and flawless cross-device responsiveness.',
    demoUrl: 'https://www.wycgi.cn/cases/atelier',
  },
  {
    id: 'site',
    year: '2026',
    hue: 210,
    tags: ['Next.js', 'TypeScript', 'Motion', 'Canvas', 'SVG Algorithms'],
    image: '/images/projects/site.webp',
    zh: '观星台 · 个人主页与交互实验室',
    en: 'Observatory · Personal Portfolio & Interactive Lab',
    sumZh: '以天体星图与夜行营火为意象的现代化数字花园。抛弃厚重的 3D 框架，纯手写原生 SVG 矢量算法与 Canvas 粒子物理模拟，在追求极致视觉张力与沉浸感的同时，做到无障碍访问与秒级首屏加载。',
    sumEn: 'A modern digital garden themed around celestial charts and a glowing night campfire. Built entirely with vanilla SVG algorithms and Canvas particle physics without heavy 3D engines, pairing immersive visual storytelling with rigorous web accessibility and instant load times.',
    archZh: '基于 Next.js App Router 实现全静态预渲染（SSG）与双语国际化（next-intl）；天体星图采用正弦波物理扰动算法驱动原生 SVG 矢量节点与流星；交互篝火封装离屏渲染、弹簧阻尼跟随与帧率自适应降级机制；支持全站 reduced-motion 无障碍偏好。',
    archEn: 'Pre-rendered with Next.js App Router SSG and bilingual next-intl routing. The star chart employs sinusoidal harmonic drift driving native SVG nodes and procedural meteors; the interactive campfire features offscreen buffer rendering, spring-damped cursor physics, and automated frame-rate performance throttling.',
    tradeZh: '完全避开 Three.js 等重型 3D WebGL 运行库（打包体积通常 >600KB），坚持以原生 SVG + requestAnimationFrame 配合 Canvas 粒子自研轻量解法。保证移动端与低功耗设备上的 60fps 满帧体验，并提供全功能无障碍与减少动态降级路径。',
    tradeEn: 'Steered clear of heavyweight 3D WebGL engines (typically 600KB+ runtime) in favor of bespoke lightweight SVG math and Canvas particle physics. Delivers silky 60fps across mobile and low-power devices, with graceful degradation for reduced-motion accessibility.',
    resZh: '首屏 LCP 仅 1.1 秒，Lighthouse 性能、可访问性（Accessibility）、最佳实践与 SEO 四项指标均达到 98-100 分。',
    resEn: 'First-screen LCP in 1.1s, achieving near-perfect 98–100 scores across Lighthouse Performance, Accessibility, Best Practices, and SEO.',
    demoUrl: '/',
    // repoUrl：仓库公开后填入
  },
];
