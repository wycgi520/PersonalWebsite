# 文章维护

每篇文章一个稳定英文 slug 目录，中文 `zh.md`，英文 `en.md`。两种语言独立发布，不要求同时具备。

```markdown
---
title: "文章标题"
summary: "文章摘要"
category: tech
date: "2026-10-21"
draft: true
---

## 第一节

在这里编写正文。
```

分类可选 `tech`、`life`、`note`。可选 `updated: "2026-10-22"`，不能早于发布日期。完整正文核对后将 `draft` 改为 `false`，运行 `pnpm content:check` 和 `pnpm build`，再按常规 Git 流程发布。

支持普通 Markdown、GFM 表格和带语言标识的代码块。二、三级标题进入目录。图片放 `public/images/writing/`，正文使用 `/images/writing/example.webp`，并填写替代文字。原始 HTML 和可执行 MDX 不启用。

六篇正文已核对并发布。新增文章在核对前保持 `draft: true`，不要为了让列表出现而发布空正文。旧演示点赞和评论没有迁移到真实数据库。
