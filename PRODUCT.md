# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are recruiters, hiring managers, and potential freelance/outsourcing clients browsing the site to evaluate 国易 (Guo Yi)'s technical ability before reaching out for a job opportunity or a project engagement. There is no secondary consumer audience; every section (About, Projects, Writing, Toolkit, Contact) is written toward this evaluating visitor.

## Product Purpose

A personal website for 国易 (Guo Yi), a full-stack developer, that introduces him, showcases past experience and projects, and ultimately serves job hunting and freelance/outsourcing client acquisition (`docs/Requirements.md`: "做一个个人网站, 用于介绍本人, 展示过往经历和项目, 最终服务于求职, 接单外包"). Success means a visiting recruiter or client comes away with a clear, credible picture of his skills and can act on it (contact him, respond to an application, or commission work).

## Positioning

7 years of full-stack experience spanning both the modern web stack (TypeScript, React, Next.js, Vue, Node.js) and the traditional enterprise stack (Java, PHP, WordPress), plus lower-level/networking work (C/C++). This dual range, modern product engineering and legacy enterprise delivery in one person, is the thing a narrower specialist profile could not truthfully claim. Delivered project types include e-commerce platforms, forums/communities, admin/management systems, enterprise portal sites, WeChat mini-programs, and mobile apps.

Stated brand intent (`docs/Requirements.md` "要求"): the site should showcase skill ("炫技") and leave a distinct impression without being eccentric; UI should read as clean, comfortable, and harmonious; style should stay consistent across all pages.

## Operating Context

- Based in Guangzhou, open to remote work; currently open to both job offers and freelance project intake (per About page fact cards).
- Bilingual site (Chinese/English) via next-intl; visitors may be domestic or international recruiters/clients.
- The Projects section showcases real past client engagements, desensitized and republished as live demo sites under `project_cases/` → `/cases/<slug>` (see project-level CLAUDE.md "Project Cases" rules: full anonymization of client identity, contact info, secrets, and visual layout; real screenshots only; a `leakcheck.txt` keyword scan gates deploy). This is a load-bearing, actively-used workflow, not a hypothetical: the `medtech` case's own summary copy explicitly discloses it's a desensitized reconstruction.
- The Writing section carries real bilingual articles (tech/life/notes categories) with likes, comments, and a newsletter signup, backed by Prisma + better-auth and an admin comment-moderation area (`/admin/comments`, `/admin/login`).
- The Toolkit section lists real tools/bookmarks with a "last verified" date per entry, implying the list is maintained over time rather than static.
- Dev workflow: `pnpm dev` via `.claude/launch.json` (`web` config, auto port); contributors must stop their own dev server/preview sessions when done and never kill another session's process.

## Capabilities and Constraints

- Tech stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, next-themes (dark/light), next-intl (zh/en), Lucide icons, Prisma + better-auth (admin/comments), markdown pipeline (gray-matter, remark/rehype) for Writing content, Zod for validation.
- Six Project case entries span 2021–2026, each with id/year/title/summary/architecture/tradeoff/outcome/tags/demoUrl/repoUrl: `medtech` (2021, medical device brand site), `campus` (2022, course planning + student community), `deals` (2023, cross-border deal/coupon aggregator), `maple` (2024, immigration consultancy + scoring tool), `atelier` (2025, Paris visual design studio), `site` (2026, this website itself, Observatory/观星台).
- The home page's visual centerpiece is an interactive constellation-style "star map" connecting the site's sections as stars, with ambient drift, occasional shooting stars, hover glow, and game-like scene-transition navigation — this is an explicit, specific product requirement from `docs/Requirements.md`, not a generic nav menu.
- About page includes an optional animated campfire illustration (sways with mouse movement, grows brighter on click) alongside the bio.
- No explicit accessibility standard or special target-user accessibility need was identified; standard web accessibility best practice applies by default.

## Brand Commitments

- Site name/brand: 观星台 (Observatory).
- Owner name: 国易 / Guo Yi.
- Contact identifiers (`src/lib/data/site.ts`): email `437891878@qq.com`, GitHub `@wycgi520`, LinkedIn `in/guoyi-wu-a55392445`, X `@wguy141219`, WeChat `wycgi520`.

## Evidence on Hand

- Real bio copy (About page): first-person narrative with concrete years of experience, tech list, location, and current availability status.
- Real past-client project case studies (desensitized per the Project Cases rules), not placeholder content — six entries with genuine architecture/tradeoff/outcome narratives.
- Real bilingual Writing articles under `content/writing/` (e.g. `canvas-particles`, `desk-and-tools`, `meilisearch-limits`, `on-abstraction`, `permission-model`, `remote-year-three`).
- Real, specifically-named Toolkit entries with dated "last verified" notes (e.g. Excalidraw, DBeaver, Bruno).
- No fabricated testimonials, pricing, or licensing claims were found; none should be added.

## Product Principles

- The site exists to make a technical evaluator act (apply, hire, or commission), not just to look impressive — every section should serve that decision.
- Dual-range positioning (modern web + enterprise/legacy + low-level) is the differentiator; don't let the site's narrative flatten into just another generic "React developer portfolio."
- Project case studies must read as problem → solution → architecture → tradeoffs → outcome → source/demo, per `docs/Reference.md`'s distilled principle, not just screenshots and tag lists.
- Client confidentiality is a hard constraint, not a style choice: every Project Cases demo must pass full anonymization and the `leakcheck.txt` gate before it's evidence of anything.
- Personality should be distinct enough to be memorable without tipping into eccentric; consistency across pages matters more than any single page being clever.

## Accessibility & Inclusion

No product-specific accessibility requirement was established; follow standard web accessibility best practices by default.
