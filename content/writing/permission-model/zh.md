---
title: "把权限模型从代码枚举搬进数据库之后"
summary: "团队曾将角色硬编码在代码枚举中，新增一个权限维度需协同联调四个微服务。本文系统复盘迁移至数据库驱动的策略化 RBAC/ABAC 模型时，遇到的规则序列化、缓存穿透与最终一致性陷阱。"
category: "tech"
date: "2026-09-18"
draft: false
---

在很多初创项目或系统开发早期，权限控制通常遵循最简单的模式：在代码里定义几个大写枚举，并在中间件里做简单拦截。

```typescript
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  VIEWER = 'VIEWER',
}

export function canEditPost(role: UserRole) {
  return role === UserRole.SUPER_ADMIN || role === UserRole.EDITOR;
}
```

这套逻辑在系统只有三四个页面、几十个内部用户时运转得非常顺畅。类型安全、无需额外查库、静态代码跳转清晰直观。但当系统迈入多租户、组织架构层级嵌套，以及客户提出“华南大区财务可查看报表但不能导出、仅能审批本部门 5 万元以下报销单”时，硬编码的枚举便迎来了彻底的崩塌。

本文复盘我们团队历时三个月，将权限体系从硬编码枚举平滑迁移至数据库策略驱动模型（RBAC + ABAC）的真实过程，重点拆解规则模型设计、前端 CASL 序列化、Redis 缓存一致性以及高并发下的实战陷阱。

---

## 一、枚举模型的黄昏与破局点

随着业务拓展，我们遇到了典型的“角色爆炸”（Role Explosion）：

1. **角色维度剧增**：出现了 `FINANCE_AUDITOR_SOUTH`、`DEPARTMENT_LEADER_TEMP` 等几十个临时角色。
2. **跨服务协同成本高昂**：新增或微调一个权限维度，需要同时拉齐 API 网关、用户服务、内容服务以及前端管理后台 4 个代码仓库，协同联调与发版。
3. **行级数据隔离乏力**：枚举只能回答“你能不能编辑文章”，回答不了“你能不能编辑**属于你所在小组**且**处于草稿状态**的文章”。

这种业务与架构的脱节，倒逼我们将权限规则从“静态代码资产”转化为“动态可配置数据”。

---

## 二、模型架构：从粗粒度 RBAC 到策略化 ABAC

单纯的 RBAC（基于角色的访问控制）依然无法解决复杂的属性约束；而完全纯粹的 ABAC（基于属性的访问控制）又因规则过于动态导致审计与管理成本不可控。

我们最终采用了 **“基于角色的策略化权限模型”（Policy-based Hybrid RBAC/ABAC）**：用户关联角色，角色绑定策略（Policy），策略内定义基于属性的条件约束。

```text
+----------+       +----------+       +------------+       +-------------------+
|  User    | ----> |  Role    | ----> |  Policy    | ----> |  Rule (JSONB)     |
| (用户表) |       | (角色表) |       | (策略定义) |       | action/subject... |
+----------+       +----------+       +------------+       +-------------------+
```

### 数据库核心表结构

我们在 PostgreSQL 中设计了以下核心模型（精简示意）：

```sql
-- 策略定义表
CREATE TABLE auth_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL,
  description TEXT,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 策略规则明细表（以 JSONB 保存条件，兼顾动态性与索引能力）
CREATE TABLE auth_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES auth_policies(id) ON DELETE CASCADE,
  action VARCHAR(32) NOT NULL,     -- 'read' | 'create' | 'update' | 'delete' | 'manage'
  subject VARCHAR(64) NOT NULL,    -- 'Post' | 'Comment' | 'User' | 'all'
  conditions JSONB,                -- 属性匹配规则，例如 {"departmentId": "${user.deptId}"}
  fields JSONB,                    -- 可选：受限字段列表
  inverted BOOLEAN NOT NULL DEFAULT FALSE -- 是否为否定规则 (cannot)
);

CREATE INDEX idx_auth_rules_policy ON auth_rules(policy_id);
CREATE INDEX idx_auth_rules_subject_action ON auth_rules(subject, action);
```

通过引入 `conditions` 字段，我们允许规则在评估时动态注入上下文。例如只允许用户更新自己创建的未发布草稿：

```json
{
  "action": "update",
  "subject": "Post",
  "conditions": {
    "authorId": "${user.id}",
    "status": { "$in": ["draft", "rejected"] }
  }
}
```

---

## 三、前后端规则一致性与 CASL 序列化

为了避免前后端各写一套权限判断逻辑导致漏洞，我们选择了成熟的规则引擎 `@casl/ability`。

### 1. 服务端 Ability 构建与 Prisma 查询下推

服务端在鉴权时，将数据库中的规则解析为 CASL Ability。更关键的是，我们利用 `@casl/prisma` 实现了行级数据权限的直接 SQL 下推，避免将全量数据捞到内存中再过滤：

```typescript
import { createPrismaAbility, AccessibleFields } from '@casl/prisma';
import { prisma } from '@/lib/db';

export function buildAbilityForUser(rules: RawRule[]) {
  // 注入运行时环境变量（如当前用户 ID、所属部门）
  return createPrismaAbility(rules);
}

// 在查询服务中直接下推至 WHERE 条件
export async function listPostsForUser(user: AuthUser) {
  const ability = buildAbilityForUser(user.rules);
  
  // 利用 casl/prisma 的 accessibleBy 自动合成 SQL where
  return prisma.post.findMany({
    where: {
      AND: [
        accessibleBy(ability, 'read').Post,
        { isArchived: false }
      ]
    }
  });
}
```

### 2. 前端安全分发与 UI 裁切

对于前端单页面应用（SPA）或 SSR 页面，前端只需要判断“这个编辑按钮是否显示”、“该菜单是否可访问”。

我们将当前用户解析后的纯规则列表（去除了敏感系统上下文）通过 session 下发：

```typescript
// 下发给客户端的 JSON 格式
export interface SerializedAbilityPayload {
  rules: Array<{
    action: string | string[];
    subject: string | string[];
    fields?: string[];
    conditions?: Record<string, unknown>;
    inverted?: boolean;
  }>;
}
```

前端接收后重新水合成只读的 Ability 实例。在 React 组件内通过 `<Can I="update" this={post}>` 或 `ability.can('update', subject('Post', post))` 进行毫秒级、无感知的 UI 裁切。

---

## 四、高并发下的缓存穿透与最终一致性陷阱

把权限搬进数据库后，最严峻的挑战是**请求链路延迟与数据库压力**。每一次鉴权或列表过滤都要查用户关联的十几条策略规则，在 QPS 达到数千时，PostgreSQL 的连接池几乎瞬间告急。

### 1. 两级缓存架构

我们构建了“本地内存 LRU + Redis 分布式缓存”的两级架构：

1. **L1（应用本地内存）**：每个 Node.js 实例维护一个最大 5,000 容量的 LRU Cache，TTL 设定为 5 秒。
2. **L2（Redis 集中缓存）**：存储序列化后的规则列表，Key 为 `auth:rules:v{version}:{userId}`，TTL 设置为 1 小时。

### 2. 避免全量刷新的策略版本号（Policy Version）机制

最初我们尝试在管理员修改策略时，遍历 Redis 中所有关联该策略的 `userId` 并逐一删除缓存。但在多租户大组织场景下，一个“普通员工”角色可能包含数万人，逐一删除会造成 Redis 严重阻塞甚至短时间网络抖动。

我们改用了**版本号级联机制**：

```text
全局/租户元数据: auth:meta:tenant_{id} -> { version: 104 }
用户规则 Key: auth:rules:t_{tenantId}:v104:{userId}
```

当组织架构或全局策略发生重大调整时，仅需原子递增租户的 `version`。旧版本的缓存在 1 小时后通过 TTL 自然过期清理，彻底消除了批量删除带来的 Redis 慢查询。

### 3. Redis Pub/Sub 解决跨实例最终一致性

为了保证本地 L1 缓存不出现“权限已撤销但在某个容器节点上依然生效 5 秒”的高危漏洞，我们引入了 Redis Pub/Sub 广播通道：

```typescript
// 权限管理后台更新策略后触发
await redis.publish('auth:cache:invalidate', JSON.stringify({
  tenantId: targetTenantId,
  userId: specificUserId, // 可选：指定用户或全租户
}));

// 各微服务容器订阅并立即失效本地 L1
subscriber.on('message', (channel, message) => {
  if (channel === 'auth:cache:invalidate') {
    const { tenantId, userId } = JSON.parse(message);
    localL1Cache.invalidate(tenantId, userId);
  }
});
```

---

## 五、灰度迁移与影子运行（Shadow Run）

对正在运行的核心系统进行权限中枢重构，犹如在高速公路上更换汽车轮胎。为了确保零故障平滑割接，我们制定了三阶段迁移方案：

| 阶段 | 策略 | 目的与保障 |
| :--- | :--- | :--- |
| **阶段一：数据双写与影子校验** | 代码枚举与数据库策略双重评估，以旧逻辑放行为准，异步比对新逻辑。 | 在 Kibana/日志中心收集比对不一致的 Diff，修复边缘属性误判。 |
| **阶段二：按租户白名单灰度切流** | 内部测试租户与友好的先锋客户开启新权限引擎，实际阻断非法操作。 | 验证真实业务动线下前后端联动手感与高频操作延迟。 |
| **阶段三：全量切流与废弃旧枚举** | 所有请求全面走新引擎，清理旧中间件与遗留枚举定义。 | 完成架构解耦，交付运营端可视化权限配置面板。 |

在影子运行的第一周，日志分析系统帮我们捕获了 14 处隐匿的边缘 Corner Cases——绝大多数是因为旧代码中硬编码的特殊 if-else 特例未被显式收录进文档。

---

## 六、总结与工程思考

把权限模型从静态代码枚举搬进数据库，本质上是**将系统变化最频繁的业务契约从软件交付生命周期中解耦**。

回顾整个迁移历程，我们提炼了三条核心心得：

1. **不要一上来就搞无限灵活的纯 ABAC**：过于复杂的动态表达式解析会成为性能与运维的噩梦。采用“标准 RBAC 骨架 + 声明式 JSON 条件”通常是中大型业务的最佳平衡点。
2. **永远为权限查询设计下推机制**：行级数据隔离必须通过 ORM / SQL WHERE 语句在存储引擎层完成，严禁“把全表读入内存再由应用层 Ability 过滤”。
3. **缓存设计决定生死**：版本号广播、防穿透空值占位以及优雅降级方案，是权限微服务能够在高并发冲击下保持系统坚固的底牌。
