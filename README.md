# 个人网站

基于 Next.js 15 构建的个人作品集网站，展示项目、文章和技能。

## 特色功能

- 🌟 **星图导航** - SVG 星座图导航，节点自然漂移，流星效果
- 🔥 **篝火动画** - Canvas 绘制的交互式篝火，响应鼠标移动和点击
- 🎨 **深浅主题** - 完整的日/夜主题系统，平滑过渡
- 🌐 **中英双语** - 完整的国际化支持
- 📱 **响应式设计** - 适配桌面端和移动端
- ♿ **可访问性** - 键盘导航、ARIA 标签、prefers-reduced-motion 支持

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **动画**: Framer Motion
- **主题**: next-themes
- **图标**: Lucide React

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

访问 [http://localhost:3000](http://localhost:3000) 查看网站。

## 项目结构

```
src/
├── app/              # Next.js 页面
├── components/       # React 组件
│   ├── layout/      # 布局组件（导航、主题切换）
│   ├── home/        # 首页组件（星图、简介）
│   ├── about/       # About 页组件
│   ├── projects/    # 项目页组件
│   ├── writing/     # 写作页组件
│   ├── toolkit/     # 工具箱页组件
│   └── contact/     # 联系页组件
├── lib/
│   ├── data/        # 静态数据
│   ├── hooks/       # 自定义 Hooks
│   └── utils.ts     # 工具函数
└── styles/          # 全局样式
```

## 文档

- [服务器自动部署](./docs/Deployment.md) - GitHub Actions、SSH Secrets、systemd 和宝塔 Nginx 配置
- [开发计划](./docs/DevelopmentPlan.md) - 完整的开发计划和实现细节
- [需求文档](./docs/Requirements.md) - 项目需求和功能定义
- [技术栈](./docs/Tech.md) - 技术选型和工具清单
- [参考资料](./docs/Reference.md) - 优秀个人网站参考

## 许可证

MIT
