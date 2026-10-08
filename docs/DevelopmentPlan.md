# 个人网站开发计划

## Context 背景

这是一个个人作品集网站项目，目标是展示技能、项目和文章，最终服务于求职和接单。项目已完成需求分析、技术选型和完整的HTML/CSS/JS原型验证（`UI/index.html`，1508行），但尚未初始化Next.js工程。

**当前状态：**
- ✅ 需求文档完整（`docs/Requirements.md`）：五大页面定义明确
- ✅ 技术栈已选定（`docs/Tech.md`）：Next.js + TypeScript + Tailwind CSS + Motion
- ✅ UI原型已验证：包含星图导航、篝火动画、主题切换、中英文切换等完整交互
- ❌ Next.js项目未初始化：无`package.json`、`src/`目录或组件代码

**核心设计特色：**
1. **星图导航**：首页使用SVG星座图作为导航，星点自然漂移，偶尔有流星划过
2. **篝火交互**：About页有Canvas绘制的篝火动画，火焰随鼠标摆动，点击时火势增强
3. **场景切换**：页面切换时有光扫过渡动画，类似游戏场景切换
4. **深浅主题**：完整的日/夜主题系统，深色层级 `#070B14` → `#0C1424` → `#16233C` → `#1E2E4A`，强调色 `#63D2E8`（浅色主题 `#17708A`）
5. **中英双语**：完整的国际化支持

---

## 进度记录

> 最后更新：2026-10-09 · **第一 ~ 四阶段 ✅ / 第五阶段（动效降级、可访问性、SEO、触屏适配）✅**，剩余：真机 / 跨浏览器测试、Lighthouse 跑分（见下）

### 第五阶段 · 优化

| 文件 | 说明 |
|------|------|
| `lib/motion.ts` + `components/layout/MotionToggle.tsx` | 动态效果开关（导航栏，`aria-pressed`）：默认跟随系统"减少动态效果"，手动选择存 `localStorage`（`gy-motion`），写到 `<html data-motion>`；`layout` 里的内联脚本在绘制前恢复。CSS 的 reduced-motion 规则、星空、星图、篝火、About 依次显现都改读这里 |
| `lib/hooks/useCampfire.ts` | 帧率自检：预热 30 帧后每 90 帧取平均，超过 36ms（约 28fps）降一档：完整 → 精简（画布 1x、粒子减半）→ 静止。只降不升，切后台 / 滚出视口的长帧不计入；当前档位写在 `canvas[data-quality]` 便于调试 |
| `components/about/Campfire.tsx` | 画布包在按钮里：回车 / 空格也能添柴，静止时按钮禁用；说明文字走 `aria-describedby`；`touch-action: pan-y` 让触屏上竖向滑动仍能滚动页面 |
| `components/home/SkyCanvas.tsx` | 减少动态效果时只画一帧，主题 / 尺寸变化时重画；标签页隐藏时停止 |
| `lib/hooks/useStarMap.ts` | 星图滚出视口时暂停（窄屏时星图在介绍下方） |
| `styles/globals.css` | 跳到正文链接（Tab 时出现）；≤640px 时星图标签放大、命中区域放大到约 82×44px，`:active` 给触屏即时反馈 |
| `lib/seo.ts` | `pageMetadata()`：标题、描述、canonical、hreflang（含 x-default）、Open Graph、Twitter 卡片，六个页面共用 |
| `app/sitemap.ts` / `app/robots.ts` / `app/icon.svg` | 12 条 URL 互标语言版本；站点图标 |
| `app/[locale]/opengraph-image.tsx` | 分享图（1200×630，左侧站名、右侧星图），每种语言构建时生成一张。自带字体无中文字形，图上文字统一英文 |
| `app/[locale]/page.tsx` | 首页 `Person` 结构化数据（JSON-LD） |
| `app/[locale]/layout.tsx` | `metadataBase`、`themeColor`、`<main id="main">` |
| `lib/data/site.ts` | `SITE_URL`，部署时用 `NEXT_PUBLIC_SITE_URL` 覆盖 |
| `lib/data/starmap.ts` | 星图节点 / 连线从 hook 中抽出，供分享图使用 |

注意：子页面自己的 `openGraph` 会整体覆盖上层，文件约定注入的分享图会丢失，所以 `pageMetadata()` 里显式引用 `/<locale>/opengraph-image`。

验证：`tsc`、`lint`、`build` 通过（分享图、sitemap、robots 均为静态）；检查各页 canonical / hreflang / og:image / JSON-LD 输出；浏览器验证动态效果开关（状态、存储、篝火按钮禁用、CSS 时长）、模拟慢帧下篝火 1x → 静止降级、375px 星图标签与命中区域、导航栏三个按钮不换行、About 无横向溢出。

未验证：跳到正文链接的聚焦样式（预览标签页处于后台，`:focus` 样式不重算，CSS 规则已确认生效）；Lighthouse、真机与跨浏览器测试需要在部署后进行。上线前把 `NEXT_PUBLIC_SITE_URL` 设为正式域名。

### 第四阶段 · Contact 页

| 文件 | 说明 |
|------|------|
| `app/[locale]/contact/page.tsx` | SSG，本地化 metadata 与 hreflang；页头沿用其他内页（标题 + 引言）；联系网格 + "关于外包"说明，说明里的"写邮件聊聊项目"打开预填主题和要点（项目简介、范围/时间、预算、已有材料）的邮件 |
| `components/contact/ContactGrid.tsx` | 服务端组件。1px 间隙当分隔线（原型 `.clist`），三列 → 两列（≤900px）→ 单列（≤560px），六项始终排满；整格是链接，hover/聚焦时底色变 panel、值变强调色、箭头轻移；焦点环画在格内侧；外链新标签页 + `noopener noreferrer` + 读屏提示；原型的 `<dl>` 包 `<a>` 不合法，改为 `<ul>` |
| `components/contact/CopyEmail.tsx` | 邮件格右上角的复制按钮（与链接同级，不嵌套）。挂载后确认剪贴板 API 可用才渲染；成功/失败文字由 `role="status"` 播报，2.2s 后清除 |
| `lib/data/site.ts` | 新增 `CONTACT_LINKS`：标签/值是固定文本（品牌名）或文案 key |

与原型的偏差：RSS 尚未实现，第六格换成"订阅"，链接到 `/writing#newsletter`（Writing 侧栏订阅框加了 `id` 与 `scroll-mt`）；社交链接从站点首页改为按账号拼出的主页地址；即刻的个人主页是 `/u/<uuid>`，账号确定前先指向 `web.okjike.com`（`site.ts` 中有 TODO）。

验证：`tsc`、`lint`、`build` 通过（`/zh/contact`、`/en/contact` 为 SSG）；浏览器验证复制邮箱（写入剪贴板、"已复制"提示后清除）、外链属性、项目咨询邮件的编码、订阅格跳转、中英文与 metadata、浅色主题、窄屏单列无横向溢出，控制台无警告。

注意：GitHub / LinkedIn / X 账号沿用原型中的示例账号，上线前需替换为真实账号。

### 第四阶段 · Toolkit 页

| 文件 | 说明 |
|------|------|
| `app/[locale]/toolkit/page.tsx` | SSG，本地化 metadata 与 hreflang；页头沿用 Projects / Writing（标题 + 引言） |
| `components/toolkit/ToolExplorer.tsx` | 搜索 + 标签筛选 + 卡片网格（`auto-fill, minmax(240px)`，宽屏四列自动减列）。状态记在 `?q=…&tag=dev`：可分享、刷新保留；输入防抖 300ms 后 replaceState。标签上的数字随当前搜索变化；`aria-live` 播报结果数；无结果时给"清空条件"按钮。切换标签时卡片依次浮现，打字时不重播 |
| `components/toolkit/ToolSearch.tsx` | `type="search"` 输入框：按 `/` 聚焦、Esc 清空（已空时失焦）、自定义清除按钮 |
| `components/toolkit/ToolCard.tsx` | 名称（外链，新标签页，`noopener noreferrer`）、标签、介绍、域名、最后确认时间；标题链接伪元素铺满整卡，焦点环框住整张卡片；搜索关键词在名称和介绍中高亮 |
| `lib/data/tools.ts` | 标签（新增只需追加一项）、工具数据、`localizeTool()`、`queryTerms()` / `matchesTerms()` |

搜索：多关键词按空白拆分、全部命中（AND）；匹配两种语言的名称、介绍、标签和域名，中文界面搜 "reverse proxy" 也能找到 Caddy。

验证：`tsc`、`lint`、`build` 通过（`/zh/toolkit`、`/en/toolkit` 为 SSG）；浏览器验证实时搜索与高亮、跨语言搜索、标签计数、`?q=` / `?tag=` 直达、空结果与清空条件、`/` 快捷键、中英文、浅色主题、窄屏无横向溢出，控制台无警告。

### 第四阶段 · Writing 页

| 文件 | 说明 |
|------|------|
| `app/[locale]/writing/page.tsx` | SSG，本地化 metadata 与 hreflang；页头沿用 Projects；双栏（文章 + 302px 侧栏，宽屏侧栏吸顶），≤1040px 单栏、侧栏两块并排；归档按文章数据逐年统计，不再写死 |
| `components/writing/PostList.tsx` | 筛选 + 列表。当前分类记在 `?cat=tech`（replaceState，可分享、刷新保留）；切换分类后文章依次浮现，首屏不播放 |
| `components/writing/CategoryFilter.tsx` | 切换按钮组（`aria-pressed`），每项带文章数 |
| `components/writing/PostCard.tsx` | 分类、日期、阅读时长、标题、摘要；点赞（心形弹跳，`aria-pressed` + 带数量的 label）；评论区展开/收起（`aria-expanded`），可发表评论 |
| `components/writing/Newsletter.tsx` | 订阅表单：配置 `NEXT_PUBLIC_NEWSLETTER_ENDPOINT` 时 POST `{ email }`；未配置时打开邮件客户端给站长发订阅邮件，不假装已订阅。无 JS 时表单 action 为 mailto |
| `lib/hooks/usePostReactions.ts` | 点赞与访客评论存 `localStorage`（`gy-writing-likes`、`gy-writing-comments`），挂载后读取避免水合不一致，跨标签页同步 |
| `lib/data/posts.ts` | 分类（新增分类只需追加一项）、文章数据、`localizePost()`、`archiveByYear()` |
| `lib/data/site.ts` | 联系邮箱常量，供 Contact 页复用 |

与原型的偏差：文章没有详情页，标题不再做成 `href="#"` 的假链接；去掉"也可以用 RSS"（RSS 尚未实现）；评论区注明"暂存在本机"。

验证：`tsc`、`lint`、`build` 通过；浏览器验证点赞/取消、刷新后保留、展开评论自动聚焦、发表评论、分类筛选与 `?cat=` 直达、中英文、浅色主题、375px 无横向溢出，控制台无警告。

未做：评论与订阅的真实后端（见"后续扩展"）、文章详情页（MDX）。

### 第四阶段 · Projects 页

| 文件 | 说明 |
|------|------|
| `app/[locale]/projects/page.tsx` | SSG，本地化 metadata 与 hreflang；页头（标题 + 引言）沿用原型 `.phead`；服务端按语言取好项目字段再传给客户端组件 |
| `components/projects/ProjectGallery.tsx` | 卡片网格（≤980px 单列）+ 详情状态。打开的项目记在 URL hash（`/projects#atlas`）：可分享、刷新仍打开；站内打开时 pushState，关闭走 `history.back()`，直达链接关闭时只替换掉 hash |
| `components/projects/ProjectCard.tsx` | 卡片是指向 `#id` 的 `<a>`：编号、年份、标题、摘要、标签、"查看详情"；hover 上浮+描边、缩略图推近；保留 Ctrl/⌘ 新标签页 |
| `components/projects/ProjectDetail.tsx` | 详情抽屉：原生 `<dialog>` 模态（焦点限制、Esc、焦点归还），右侧滑入/滑出，点遮罩关闭，打开时锁定页面滚动；内容为架构 / 关键取舍 / 结果 + 链接。没有公开链接的项目显示"公司内部项目"说明，不放假链接 |
| `components/projects/ProjectThumb.tsx` | 程序化 SVG 缩略图，与原型相同的种子与取数顺序；颜色走 CSS 变量，深浅主题各一套 |
| `components/layout/BackLink.tsx` | "回到星图"抽成公共组件，About 页同步改用 |
| `lib/data/projects.ts` | 新增 `LocalizedProject` / `localizeProject()`；"这个网站"的演示链接指向首页，`repoUrl` 待仓库公开后填入 |

渐进增强：无 JS 时点卡片跳到 `#id`，`:target` 让对应详情以普通块显示在网格下方；详情内容随页面预渲染，可被抓取。

验证：`tsc`、`lint`、`build` 通过；浏览器验证打开/Esc/遮罩/关闭按钮/浏览器后退、`#site` 直达、中英文、浅色主题、375px 移动端无横向溢出，控制台无警告。

未做：Toolkit / Contact 页面（第四阶段剩余部分）。

### 第三阶段（About 页）

| 文件 | 说明 |
|------|------|
| `app/[locale]/about/page.tsx` | SSG 双栏布局（≤1040px 单栏、篝火在上），本地化 metadata 与 hreflang；背景为深浅两张营地照片交叉淡入（`.about-scene` 伪元素） |
| `components/about/Biography.tsx` | 返回链接、头像、标题、三段介绍、事实格（2/4 列，不出现落单格） |
| `components/about/AboutStage.tsx` | 首次打开依次显现，之后直接显示：`localStorage` 键 `gy-about-seen`；首屏由内联脚本在绘制前决定，客户端路由由 layout effect 决定；无 JS / reduced-motion 时直接可见 |
| `components/about/Campfire.tsx` + `lib/hooks/useCampfire.ts` | Canvas 篝火：弹簧跟随 + 甩动"风"、点击增火并爆火星、按主题重绘静态层、滚出视口/标签页隐藏时暂停、reduced-motion 时只画静止一帧 |
| `lib/campfire/geometry.ts` / `staticLayers.ts` / `render.ts` | 从原型迁移：固定种子几何（石、柴、炭、火舌）、离屏静态层、逐帧绘制与粒子 |
| `app/[locale]/template.tsx` | 场景切换（原第二阶段偏差项）：路由切换时新场景淡入+去模糊+光扫；首屏直出不播放。仅进场动画，无退场动画 |

验证：`tsc`、`lint`、`build` 通过；浏览器验证首访依次显现/再访直接显示、reduced-motion 降级、中英切换、深浅主题、宽窄布局，控制台无警告。

未做（留给第五阶段）：帧率检测自动降级、手动关闭动画开关。

### 已完成（第一、二阶段）

**工程配置**（手动创建，未使用 `create-next-app`）
- 依赖（pnpm）：next 15.5.27、react 18.3.1、framer-motion、next-themes、**next-intl 4.14.9**、clsx、tailwind-merge、lucide-react
- `next.config.js`：未使用 `next-intl/plugin`（它加载时会 require `@swc/core`，本机原生模块无法加载），改为手动配置 `next-intl/config` 别名（webpack + turbopack），效果等价
- `pnpm-workspace.yaml`：`@swc/core`、`@parcel/watcher` 的构建脚本设为不执行（仅 next-intl 实验性文案提取器使用）
- `.claude/launch.json` 新增 `web`（`pnpm dev`，端口 3000）

**国际化（方案 A：next-intl + `/zh`、`/en` 路由）**
- `src/i18n/routing.ts`：`locales: ['zh','en']`，默认 zh，`localePrefix: 'always'`
- `src/middleware.ts`：`/` 按 cookie / Accept-Language 重定向到 `/zh` 或 `/en`，切换语言写入 `NEXT_LOCALE` cookie
- `src/i18n/request.ts`、`navigation.ts`（带语言前缀的 `Link`/`useRouter`/`usePathname`）
- `src/lib/i18n/zh.json`、`en.json`：已提取原型全部文案（按 meta/common/nav/home/about/projects/writing/toolkit/contact 分组）；`request.ts` 以 zh 为基准做类型校验，`global.d.ts` 为 `useTranslations` 提供 key 类型提示
- `app/[locale]/layout.tsx`：`generateStaticParams` 预渲染两种语言、`generateMetadata` 本地化标题与 hreflang、`<html lang>` 随语言变化
- `app/[locale]/not-found.tsx` + `[...rest]/page.tsx`：未实现页面显示本地化的"下一轮设计中"提示

**组件**
| 文件 | 说明 |
|------|------|
| `components/layout/Navigation.tsx` | 文案国际化；≤860px 时品牌/工具区一行、菜单横向滚动（与原型一致） |
| `components/layout/LanguageToggle.tsx` | 切换语言并停留在当前页 |
| `components/layout/ThemeToggle.tsx` | 使用 `resolvedTheme`，aria-label 国际化 |
| `components/home/Identity.tsx` | 文案国际化（`t.rich` 处理 `<strong>`），响应式字号 |
| `components/home/StarMap.tsx` | 边框 + 网格 + 刻度、连线 hover 高亮、节点改为 SVG `<a>`（无 JS 可跳转、原生聚焦、Ctrl/⌘ 点击新标签页）、扩大点击区域 |
| `lib/hooks/useStarMap.ts` | 漂移（先算节点再更新连线）、流星、reduced-motion 实时响应 |
| `app/[locale]/page.tsx` | 响应式内边距与 ≤1040px 单栏布局 |

原"已知问题" 1–7 均已修复。另修正：`next/font` 的 Noto Serif SC 改为通过 `--font-noto-serif-sc` 变量引用（原写法字体名不匹配）。

**验证情况**
- `tsc --noEmit`、`pnpm lint`、`pnpm build` 均通过；`/zh`、`/en` 为 SSG
- 浏览器验证：`/` 重定向、语言切换（URL/文案/lang/cookie）、主题切换、节点 hover 高亮连线、点击跳转、移动端布局，控制台无警告

### 与原计划的偏差

- **场景切换动画**：未用 Framer Motion `AnimatePresence`（App Router 下 exit 动画需冻结路由上下文），改为 `template.tsx` + CSS 关键帧实现进场动画与光扫（第三阶段完成）
- **About 页头像**：原型 About 区没有头像，按需求补上，样式与首页一致

### 未开始

- 项目/文章/工具内容的双语数据目前仍在数据文件中（`zh`/`en` 字段），未进字典
- 真机 / 跨浏览器测试、Lighthouse 跑分（部署后）

### 其他状态

- 第三、四阶段（About、Projects、Writing、Toolkit、Contact）均已提交 git

---

## 开发策略

### 总体原则

1. **保留原型设计系统**：色彩、字体、间距、动效参数已在原型中验证，直接迁移，不重新设计
2. **前端优先**：先完成静态站点和动画效果，后端功能（数据库、CMS、评论）可延后
3. **渐进增强**：核心内容在JavaScript禁用时仍可访问，Canvas动画在低端设备上降级
4. **组件化迁移**：将1500+行原型代码拆分为20+个React组件，保持逻辑清晰

### 技术选型确认

**核心依赖：**
- `next@latest` - App Router模式，支持SSG预渲染
- `typescript` - 类型安全
- `tailwindcss` - 原子化CSS，迁移原型的CSS变量系统
- `framer-motion` - 页面切换和元素动画
- `next-themes` - 主题切换
- `next-intl` - 国际化

**辅助依赖：**
- `clsx` + `tailwind-merge` - 动态类名组合
- `lucide-react` - 图标库（主题切换、返回箭头等）

**暂不引入：**
- 数据库相关（Prisma、PostgreSQL）- 第一阶段使用静态数据
- 后端框架（Hono.js）- 无需后端API
- UI组件库（shadcn/ui、Ant Design）- 原型已有完整样式

---

## 项目结构设计

```
PersonalWebsite/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # 根布局：字体、主题、语言
│   │   ├── page.tsx                # 首页：星图导航
│   │   ├── about/page.tsx          # About页面
│   │   ├── projects/page.tsx       # Projects页面
│   │   ├── writing/page.tsx        # Writing页面
│   │   ├── toolkit/page.tsx        # Toolkit页面
│   │   └── contact/page.tsx        # Contact页面
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navigation.tsx      # 顶部导航栏
│   │   │   ├── ThemeToggle.tsx     # 主题切换按钮
│   │   │   └── LanguageToggle.tsx  # 语言切换按钮
│   │   ├── home/
│   │   │   ├── StarMap.tsx         # 星图SVG组件
│   │   │   ├── Identity.tsx        # 首页左侧个人介绍
│   │   │   └── SkyCanvas.tsx       # 背景星空Canvas
│   │   ├── about/
│   │   │   ├── Campfire.tsx        # 篝火Canvas动画
│   │   │   └── Biography.tsx       # 个人简介文字
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx     # 项目卡片
│   │   │   └── ProjectDetail.tsx   # 项目详情抽屉
│   │   ├── writing/
│   │   │   ├── PostCard.tsx        # 文章卡片
│   │   │   ├── CategoryFilter.tsx  # 分类筛选
│   │   │   └── Newsletter.tsx      # 订阅表单
│   │   ├── toolkit/
│   │   │   ├── ToolCard.tsx        # 工具卡片
│   │   │   └── ToolSearch.tsx      # 搜索框
│   │   └── contact/
│   │       └── ContactGrid.tsx     # 联系方式网格
│   ├── lib/
│   │   ├── hooks/
│   │   │   ├── useSkyAnimation.ts  # 星空动画Hook
│   │   │   ├── useStarMap.ts       # 星图漂移动画Hook
│   │   │   └── useCampfire.ts      # 篝火动画Hook
│   │   ├── data/
│   │   │   ├── projects.ts         # 项目数据
│   │   │   ├── posts.ts            # 文章数据
│   │   │   └── tools.ts            # 工具数据
│   │   ├── i18n/
│   │   │   ├── zh.json             # 中文翻译
│   │   │   └── en.json             # 英文翻译
│   │   └── utils.ts                # 工具函数
│   └── styles/
│       └── globals.css             # 全局样式：CSS变量、字体
├── public/
│   ├── images/
│   │   ├── about-bg.webp           # About页背景
│   │   └── about-bg-light.webp
│   └── fonts/                       # 本地字体文件（可选）
├── docs/                            # 已有文档
├── UI/                              # 已有原型
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
└── .env.local
```

---

## 核心组件设计

### 1. 根布局 (`app/layout.tsx`)

**职责：**
- 加载字体（Cormorant Garamond、Inter、Noto Serif SC）
- 提供主题上下文（next-themes）
- 提供语言上下文（next-intl）
- 渲染全局导航栏
- 渲染背景星空Canvas

**关键点：**
- 使用`next/font`优化字体加载
- 星空Canvas固定定位，所有页面共享
- 主题切换时需要更新CSS变量

### 2. 星图导航 (`components/home/StarMap.tsx`)

**职责：**
- 渲染SVG星座图：5个节点 + 连线
- 实现节点漂移动画（正弦波叠加）
- 实现流星效果（随机生成，贝塞尔曲线）
- 处理节点hover/focus状态
- 响应点击跳转到对应页面

**技术实现：**
```typescript
// 漂移动画：每个节点独立的相位和速度
const driftAtlas = (t: number) => {
  nodeEls.forEach(node => {
    const dx = Math.sin(t / 4200 + node.phase) * 9 
             + Math.cos(t / 7100 + node.phase) * 4;
    const dy = Math.cos(t / 3700 + node.phase * 1.7) * 8 
             + Math.sin(t / 8300 + node.phase) * 3;
    // 更新节点位置
  });
};

// 使用requestAnimationFrame驱动
useEffect(() => {
  let rafId: number;
  const animate = (t: number) => {
    driftAtlas(t);
    updateMeteors(t);
    rafId = requestAnimationFrame(animate);
  };
  rafId = requestAnimationFrame(animate);
  return () => cancelAnimationFrame(rafId);
}, []);
```

**数据结构：**
```typescript
const NODES = [
  { id: 'about', zh: '关于', en: 'About', x: 150, y: 128, r: 20 },
  { id: 'projects', zh: '项目', en: 'Projects', x: 420, y: 90, r: 26 },
  // ...
];
const EDGES = [[0,1],[1,2],[2,3],[3,4],[4,0],[0,3]];
```

### 3. 篝火动画 (`components/about/Campfire.tsx`)

**职责：**
- 渲染静态层：石圈、柴堆、炭床（离屏Canvas预渲染）
- 渲染动态火舌：三层贝塞尔曲线，高度随时间抖动
- 渲染粒子：脱离的焰片、火星、烟雾
- 响应鼠标移动：火焰倾斜（弹簧跟随）
- 响应点击：火势增强，爆发火星

**技术实现：**
```typescript
// 弹簧跟随算法
const FOLLOW = 0.045, DAMP = 0.2;
let lean = 0, leanV = 0, leanTarget = 0;

const updateLean = (dt: number) => {
  const k = Math.min(dt / 16.7, 3);
  leanV += ((leanTarget - lean) * FOLLOW - leanV * DAMP) * k;
  lean += leanV * k;
};

// 鼠标移动时
onPointerMove((e) => {
  const dx = (e.clientX - centerX) / (width / 2);
  leanTarget = clamp(dx, -1.6, 1.6) * 1.1;
});
```

**性能优化：**
- 静态层预渲染到离屏Canvas，每帧混合
- 深浅主题切换时重新预渲染静态层
- `prefers-reduced-motion`时禁用所有动画

### 4. 项目卡片 (`components/projects/ProjectCard.tsx`)

**职责：**
- 渲染项目缩略图（程序化SVG生成，不用占位图）
- 显示项目标题、摘要、标签
- 响应hover：边框变色，向上平移
- 响应点击：展开详情抽屉

**程序化缩略图：**
```typescript
// 根据项目色相和种子生成几何图案
const generateThumbnail = (hue: number, seed: number) => {
  const rnd = seededRandom(seed);
  const dots = Array.from({ length: 28 }, () => ({
    x: rnd() * 320,
    y: rnd() * 180,
    r: rnd() * 2 + 1,
    opacity: rnd() * 0.5 + 0.25,
  }));
  const lines = Array.from({ length: 7 }, () => ({
    x1: rnd() * 320, y1: rnd() * 180,
    x2: rnd() * 320, y2: rnd() * 180,
  }));
  return { dots, lines, hue };
};
```

### 5. 场景切换动画

**职责：**
- 页面切换时显示光扫过渡效果
- 前一个场景淡出+缩小+模糊
- 后一个场景淡入+放大+清晰
- 滚动到顶部

**技术实现：**
使用Framer Motion的`AnimatePresence`：
```typescript
<AnimatePresence mode="wait">
  <motion.div
    key={pathname}
    initial={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 0.985, filter: 'blur(6px)' }}
    transition={{ duration: 0.76, ease: [0.22, 0.61, 0.24, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>

// 光扫效果：固定定位的径向渐变，切换时闪现
<div 
  className="fixed inset-0 pointer-events-none opacity-0 transition-opacity duration-300"
  style={{
    background: 'radial-gradient(circle at 60% 50%, var(--glow-soft), transparent 55%)'
  }}
/>
```

---

## 关键文件实现要点

### `src/styles/globals.css`

迁移原型的CSS变量系统到Tailwind配置：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* 深色主题 */
    --ink: #070B14;
    --panel: #0C1424;
    --grid: #16233C;
    --line: #1E2E4A;
    --glow: #63D2E8;
    --glow-soft: rgba(99, 210, 232, 0.18);
    --dim: #8CA3C7;
    --text: #E9EFF8;
    --ember: #F2A24B;
  }

  [data-theme="light"] {
    --ink: #EEF1F6;
    --panel: #F7F9FC;
    --grid: #D3DCE9;
    --line: #C2CEDF;
    --glow: #17708A;
    --glow-soft: rgba(23, 112, 138, 0.14);
    --dim: #55657E;
    --text: #121B2B;
    --ember: #B5610C;
  }

  body {
    @apply bg-[var(--ink)] text-[var(--text)] font-sans antialiased;
  }
}
```

### `tailwind.config.ts`

扩展主题，支持自定义色彩和字体：

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: 'var(--ink)',
        panel: 'var(--panel)',
        grid: 'var(--grid)',
        line: 'var(--line)',
        glow: 'var(--glow)',
        dim: 'var(--dim)',
        ember: 'var(--ember)',
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'Noto Serif SC', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'PingFang SC', '-apple-system', 'sans-serif'],
      },
      transitionTimingFunction: {
        'scene': 'cubic-bezier(0.22, 0.61, 0.24, 1)',
      },
      transitionDuration: {
        'scene': '760ms',
      },
    },
  },
  plugins: [],
};

export default config;
```

### `src/lib/data/projects.ts`

从原型提取项目数据，类型化：

```typescript
export interface Project {
  id: string;
  year: string;
  hue: number; // 用于程序化生成缩略图
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
  demoUrl?: string;
  repoUrl?: string;
}

export const projects: Project[] = [
  {
    id: 'atlas',
    year: '2025—2026',
    hue: 198,
    tags: ['Next.js', 'Prisma', 'PostgreSQL', 'MeiliSearch'],
    zh: 'Atlas 内容中台',
    en: 'Atlas content platform',
    sumZh: '给三条业务线共用的内容系统...',
    sumEn: 'A shared content system for three business lines...',
    // ...其他字段
  },
  // ...其他项目
];
```

---

## 实现顺序（按依赖关系）

### 第一阶段：基础设施（1-2天）

1. **项目初始化**
   - 运行`pnpm create next-app@latest .`
   - 安装依赖：`framer-motion` `next-themes` `next-intl` `clsx` `tailwind-merge` `lucide-react`
   - 配置Tailwind：迁移CSS变量
   - 配置字体：Google Fonts或本地字体文件

2. **根布局和全局组件**
   - 实现`app/layout.tsx`：字体、主题、语言提供者
   - 实现`components/layout/Navigation.tsx`：顶部导航栏
   - 实现`components/layout/ThemeToggle.tsx`：日/夜切换
   - 实现`components/layout/LanguageToggle.tsx`：中英切换
   - 实现`components/home/SkyCanvas.tsx`：背景星空

3. **国际化配置**
   - 配置next-intl
   - 提取原型中的所有文案到`zh.json`和`en.json`
   - 创建`useTranslation` Hook包装器

### 第二阶段：首页（1-2天）

4. **首页布局**
   - 实现`app/page.tsx`：左右分栏布局
   - 实现`components/home/Identity.tsx`：左侧个人介绍
   - 实现`components/home/StarMap.tsx`：右侧星图导航

5. **星图动画**
   - 实现`lib/hooks/useStarMap.ts`：节点漂移逻辑
   - 实现流星效果
   - 处理键盘导航和可访问性

### 第三阶段：About页面（1-2天）

6. **About页布局**
   - 实现`app/about/page.tsx`：左右分栏布局
   - 实现`components/about/Biography.tsx`：左侧文字介绍
   - 复制About背景图到`public/images/`

7. **篝火动画**
   - 实现`components/about/Campfire.tsx`：Canvas篝火
   - 实现`lib/hooks/useCampfire.ts`：动画逻辑
   - 实现静态层预渲染
   - 实现鼠标交互（弹簧跟随）

### 第四阶段：其他页面（2-3天）

8. **Projects页面**
   - 实现`app/projects/page.tsx`
   - 实现`components/projects/ProjectCard.tsx`：卡片组件
   - 实现`components/projects/ProjectDetail.tsx`：详情抽屉
   - 实现程序化缩略图生成
   - 迁移项目数据到`lib/data/projects.ts`

9. **Writing页面**
   - 实现`app/writing/page.tsx`：双栏布局
   - 实现`components/writing/PostCard.tsx`：文章卡片
   - 实现`components/writing/CategoryFilter.tsx`：分类筛选
   - 实现`components/writing/Newsletter.tsx`：订阅表单
   - 实现点赞功能（localStorage持久化）
   - 迁移文章数据到`lib/data/posts.ts`

10. **Toolkit页面**
    - 实现`app/toolkit/page.tsx`
    - 实现`components/toolkit/ToolCard.tsx`：工具卡片
    - 实现`components/toolkit/ToolSearch.tsx`：搜索框
    - 实现实时搜索（多字段匹配）
    - 迁移工具数据到`lib/data/tools.ts`

11. **Contact页面**
    - 实现`app/contact/page.tsx`
    - 实现`components/contact/ContactGrid.tsx`：联系方式网格

### 第五阶段：优化（1-2天）

12. **响应式优化**
    - 测试所有页面在移动端的表现
    - 调整星图和篝火在小屏幕上的尺寸
    - 优化触摸交互

13. **性能优化**
    - 实现Canvas动画的降级方案（`prefers-reduced-motion`）
    - 优化图片加载（WebP格式，懒加载）
    - 实现代码分割

14. **可访问性**
    - 检查键盘导航
    - 添加ARIA标签
    - 测试屏幕阅读器

15. **SEO优化**
    - 配置`metadata`对象
    - 生成`sitemap.xml`
    - 生成`robots.txt`

---

## 验证计划

### 开发环境测试

**每完成一个页面后：**
1. 运行`pnpm dev`，访问`http://localhost:3000`
2. 测试主题切换：深浅模式色彩是否正确
3. 测试语言切换：所有文案是否翻译
4. 测试动画：60fps流畅，无卡顿
5. 测试响应式：在Chrome DevTools调整视口大小
6. 测试键盘导航：Tab键聚焦，Enter/Space触发
7. 测试`prefers-reduced-motion`：禁用动画

### 构建测试

**完成所有页面后：**
1. 运行`pnpm build`
2. 检查构建输出：无TypeScript错误，无警告
3. 运行`pnpm start`，测试生产环境
4. 使用Lighthouse检测：
   - Performance >= 90
   - Accessibility >= 95
   - Best Practices >= 95
   - SEO >= 95

### 跨浏览器测试

**发布前：**
- Chrome（最新版）
- Firefox（最新版）
- Safari（macOS + iOS）
- Edge（最新版）

### 设备测试

**移动端：**
- iPhone（iOS Safari）
- Android（Chrome）
- 平板（iPad）

---

## 关键文件清单

**必须创建的配置文件：**
- `package.json` - 依赖声明
- `tsconfig.json` - TypeScript配置
- `tailwind.config.ts` - Tailwind配置
- `next.config.js` - Next.js配置
- `postcss.config.js` - PostCSS配置
- `.env.local` - 环境变量（如果需要）

**必须实现的核心组件：**
- `app/layout.tsx` - 根布局
- `app/page.tsx` - 首页
- `components/layout/Navigation.tsx` - 导航栏
- `components/home/StarMap.tsx` - 星图
- `components/about/Campfire.tsx` - 篝火
- `components/projects/ProjectCard.tsx` - 项目卡片
- `components/writing/PostCard.tsx` - 文章卡片
- `components/toolkit/ToolCard.tsx` - 工具卡片

**必须迁移的数据文件：**
- `lib/data/projects.ts` - 项目数据（从原型提取）
- `lib/data/posts.ts` - 文章数据
- `lib/data/tools.ts` - 工具数据
- `lib/i18n/zh.json` - 中文翻译
- `lib/i18n/en.json` - 英文翻译

**必须复制的资源文件：**
- `public/images/about-bg.webp` - About页背景（深色）
- `public/images/about-bg-light.webp` - About页背景（浅色）

---

## 风险与应对

### 风险1：Canvas动画性能

**问题：**
- 篝火动画包含大量粒子和渐变计算
- 低端设备可能掉帧
- 移动端浏览器性能较弱

**应对：**
1. 实现性能检测：首次渲染时测量帧率
2. 如果帧率低于30fps，自动降级：
   - 减少粒子数量
   - 降低Canvas分辨率（使用`devicePixelRatio`的一半）
   - 简化火焰层级
3. 提供手动开关（用户可选择禁用动画）
4. 尊重`prefers-reduced-motion`系统设置

### 风险2：星图在触摸屏上的交互

**问题：**
- 原型主要为桌面端设计
- 触摸屏无hover状态
- 小屏幕上节点间距过小，难以点击

**应对：**
1. 增大触摸目标：节点的`hitArea`半径至少44px
2. 触摸时显示临时高亮
3. 添加备用导航：顶部导航栏始终可用
4. 移动端考虑将星图改为垂直布局

### 风险3：国际化文案缺失

**问题：**
- 原型只覆盖了界面文案
- 项目详情、文章内容也需要翻译
- 后期内容增加时容易遗漏

**应对：**
1. 建立翻译清单，标记已翻译/待翻译
2. 开发环境显示缺失翻译的警告
3. 使用TypeScript类型确保翻译键完整

### 风险4：SEO问题

**问题：**
- Canvas内容搜索引擎无法抓取
- 单页应用可能影响SEO

**应对：**
1. 使用Next.js App Router的SSG模式
2. 为每个页面设置完整的`metadata`
3. 确保核心内容在HTML中可见
4. 生成`sitemap.xml`和`robots.txt`

---

## 后续扩展（可延后）

以下功能在第一版可以暂不实现：

1. **CMS后台**
   - 项目、文章、工具的增删改查
   - 使用Prisma + PostgreSQL
   - 使用Better Auth做管理员认证

2. **评论系统**
   - 文章评论功能
   - 需要后端API + 数据库

3. **邮件订阅**
   - Newsletter订阅功能
   - 需要集成邮件服务（Resend、SendGrid等）

4. **统计分析**
   - 访问量、点击量统计
   - 可以先集成Umami（自托管）或Vercel Analytics

5. **RSS订阅**
   - 生成`/rss.xml`
   - 使用`feed`库

---

## 总结

**项目规模估算：**
- 核心组件数量：~25个
- 代码行数（不含原型）：~3000行TypeScript + ~500行CSS
- 开发时间：6-8天（单人全职）

**关键成功因素：**
1. ✅ 设计系统已验证，直接迁移，不重新设计
2. ✅ 交互逻辑已实现，照搬即可
3. ✅ 数据结构清晰，容易类型化
4. ⚠️ Canvas动画需要性能测试和降级方案
5. ⚠️ 触摸交互需要额外适配

**建议启动顺序：**
1. 初始化Next.js项目，配置Tailwind和字体
2. 实现根布局和导航栏
3. 实现首页（最核心的展示页面）
4. 实现About页（第二核心，含篝火动画）
5. 实现其他页面（Projects、Writing、Toolkit、Contact）
6. 优化、测试、发布

**第一个里程碑：**
首页 + About页完成并上线，即可展示项目最大特色（星图导航 + 篝火动画），后续页面可以逐步补充。
