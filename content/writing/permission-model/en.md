---
title: "Migrating Permission Models from Hardcoded Enums to the Database"
summary: "We used to lock user roles inside hardcoded enums, where adding a permission meant modifying four services. Here is an honest post-mortem on transitioning to a database-driven policy model, covering cache invalidation and eventual consistency."
category: "tech"
date: "2026-09-18"
draft: false
---

In the early lifecycle of most web platforms, access control is blissfully straightforward. You define a few uppercase constants in an enum, stick an interceptor in your routing middleware, and call it a day:

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

When your product has half a dozen pages and twenty internal users, this pattern is unbeatable. It is statically type-safe, costs zero database queries, and lets developers trace permission gates with a simple IDE jump.

However, as the platform expands into multi-tenant enterprise accounts, complex nested organizational hierarchies, and real-world customer requirements—such as *"A regional auditor can review balance sheets but cannot export raw records, and may only approve expense requests under $5,000 originating within their specific branch"*—hardcoded enums break down entirely.

This article documents our three-month journey migrating our production authorization infrastructure from static enums to a database-driven policy model (hybrid RBAC + ABAC), detailing our schema architecture, CASL rule serialization, multi-tier cache invalidation, and lessons learned under high throughput.

---

## 1. The Breakdown of the Enum Era

As enterprise customer onboarding accelerated, our development team hit three distinct friction points:

1. **Role Explosion**: We rapidly accumulated dozens of hyperspecific designations such as `FINANCE_AUDITOR_SOUTH`, `TEMP_TEAM_LEAD`, and `CATALOG_REVIEWER_TIER_2`.
2. **Coordinated Multi-Repo Deployments**: Introducing or adjusting a single authorization dimension required simultaneous pull requests across four separate repositories: the API Gateway, the Core Identity Service, the Content Engine, and the Admin Frontend SPA.
3. **Inability to Support Row-Level Context**: Enums can only answer coarse questions (*"Can this user edit posts?"*). They are completely blind to contextual resource attributes (*"Can this user edit a post that belongs to their assigned business unit, provided it is still in Draft status?"*).

We needed an authorization model that treated permissions not as static code artifacts, but as first-class, dynamically evaluable domain data.

---

## 2. Architecture: From Rigid RBAC to Policy-Driven ABAC

Pure Role-Based Access Control (RBAC) quickly leads to role explosion when attributes proliferate. On the other hand, purely dynamic Attribute-Based Access Control (ABAC) can become impossible for operations teams to reason about or audit.

We settled on a **Policy-Based Hybrid (RBAC + ABAC)** pattern: Users are assigned Roles, Roles bind to Policies, and Policies comprise discrete declarative Rules containing attribute conditions.

```text
+----------+       +----------+       +------------+       +-------------------+
|  User    | ----> |  Role    | ----> |  Policy    | ----> |  Rule (JSONB)     |
| (Entity) |       | (Bundle) |       | (Contract) |       | action/subject... |
+----------+       +----------+       +------------+       +-------------------+
```

### Relational Schema Design

Here is a simplified view of our PostgreSQL schema implementing this architecture:

```sql
-- High-level authorization policies
CREATE TABLE auth_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(64) NOT NULL,
  description TEXT,
  version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Granular rules; conditions are stored as JSONB for dynamic query flexibility
CREATE TABLE auth_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id UUID NOT NULL REFERENCES auth_policies(id) ON DELETE CASCADE,
  action VARCHAR(32) NOT NULL,     -- 'read' | 'create' | 'update' | 'delete' | 'manage'
  subject VARCHAR(64) NOT NULL,    -- 'Post' | 'Comment' | 'User' | 'all'
  conditions JSONB,                -- Attribute rules, e.g. {"departmentId": "${user.deptId}"}
  fields JSONB,                    -- Optional restricted field arrays
  inverted BOOLEAN NOT NULL DEFAULT FALSE -- Negative constraints (cannot)
);

CREATE INDEX idx_auth_rules_policy ON auth_rules(policy_id);
CREATE INDEX idx_auth_rules_subject_action ON auth_rules(subject, action);
```

By leveraging `JSONB` for rule conditions, we can declare expressive predicates that interpolate runtime parameters at evaluation time:

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

## 3. End-to-End Rule Consistency and CASL Serialization

To ensure our backend APIs and frontend UI components remain strictly in sync without duplicating authorization math, we integrated `@casl/ability`.

### 1. Server-Side Evaluation and SQL Pushdown

On our API servers, raw database rules are compiled into a CASL `Ability` instance. Crucially, using `@casl/prisma`, we compile dynamic conditions directly into database `WHERE` clauses rather than pulling thousands of rows into Node.js memory:

```typescript
import { createPrismaAbility } from '@casl/prisma';
import { accessibleBy } from '@casl/prisma';
import { prisma } from '@/lib/db';

export function buildAbilityForUser(rules: RawRule[]) {
  // Interpolates active request context like user ID and tenant branch
  return createPrismaAbility(rules);
}

export async function listPostsForUser(user: AuthUser) {
  const ability = buildAbilityForUser(user.rules);

  // Directly pushes row-level constraints down to PostgreSQL
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

### 2. Secure Client-Side UI Trimming

The frontend single-page application requires permissions purely to toggle buttons, adjust navigation items, and guard routes. It does not need internal system metadata.

At session handshake, the backend extracts the user's compiled rules and emits a sanitized JSON payload:

```typescript
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

The frontend hydrates this into a local, read-only ability instance. Inside React trees, guards evaluate instantly without network overhead:

```tsx
<Can I="update" this={post}>
  <EditArticleButton post={post} />
</Can>
```

---

## 4. Mitigating Cache Invalidation and Eventual Consistency

Once authorization rules reside in PostgreSQL, every inbound HTTP request risks hammering the database with relational joins across users, roles, policies, and rule tables. Under 5,000 QPS, connection pools would deplete almost immediately.

### 1. Tiered Caching Strategy

We deployed a two-tier caching topology:

1. **L1 (Node.js Process Memory)**: An LRU cache (capped at 5,000 entries) with an aggressive 5-second TTL per container instance.
2. **L2 (Distributed Redis)**: Serialized rule payloads keyed by tenant and user, with a 1-hour TTL.

### 2. Cascade Invalidation via Policy Versioning

Initially, when an administrator altered a role in the dashboard, we attempted to iterate through all active Redis sessions for affected users and delete their cache keys. In organizations with tens of thousands of members under a generic role, this iteration caused significant Redis latency spikes.

We replaced brute-force deletion with **Monotonic Policy Versioning**:

```text
Tenant Metadata: auth:meta:tenant_{id} -> { version: 104 }
User Rules Key:  auth:rules:t_{tenantId}:v104:{userId}
```

When an administrator updates a role or policy, we atomically increment the tenant's `version` counter in Redis. Existing keys under version 103 are abandoned and naturally evicted by Redis TTLs, incurring zero latency overhead during updates.

### 3. Cross-Instance Sync with Redis Pub/Sub

To prevent local in-memory L1 caches from retaining revoked permissions during the 5-second window, we broadcast invalidation messages over a dedicated Redis Pub/Sub channel:

```typescript
// Dispatched upon administrative mutation
await redis.publish('auth:cache:invalidate', JSON.stringify({
  tenantId: targetTenantId,
  userId: specificUserId,
}));

// Microservice container listener
subscriber.on('message', (channel, message) => {
  if (channel === 'auth:cache:invalidate') {
    const { tenantId, userId } = JSON.parse(message);
    localL1Cache.invalidate(tenantId, userId);
  }
});
```

---

## 5. Zero-Downtime Migration and Shadow Runs

Rebuilding the authorization spine of an active SaaS application is notoriously risky. We mitigated disruption through a disciplined three-phase migration:

| Phase | Deployment Method | Safety & Verification |
| :--- | :--- | :--- |
| **Phase 1: Shadow Run** | Both old enums and new database policies evaluated concurrently; decisions enforced by enums while diffs logged asynchronously. | Discovered and reconciled edge-case behavioral discrepancies in Datadog/ELK without breaking client workflows. |
| **Phase 2: Tenant Canary Rollout** | Internal organizations and opted-in beta tenants routed to enforce the new policy engine. | Validated end-to-end responsiveness and verified real-world operational ergonomics. |
| **Phase 3: Complete Cutover** | Legacy enums and hardcoded middleware dropped; all production traffic routed through dynamic policies. | Decommissioned dead code and unlocked administrative policy editor tooling. |

During the first week of shadow execution, log monitoring uncovered 14 subtle discrepancies—almost all traced back to undocumented edge-case `if` branches buried deep within legacy controllers.

---

## 6. Engineering Takeaways

Transitioning permissions from static code enums to database-backed policies is ultimately an exercise in **decoupling volatile business contracts from the software release cycle**.

Key principles we recommend keeping top of mind:

1. **Resist Premature ABAC Complexity**: Do not construct an arbitrarily complex expression parser unless your business truly requires it. A clean RBAC skeleton augmented by bounded JSON condition predicates satisfies 95% of real-world needs.
2. **Push Row Constraints Down**: Always push filtering to the database query layer via ORM extensions or SQL builders. Loading unbounded datasets into application memory to test authorization is a catastrophic scalability anti-pattern.
3. **Design for Invalidation First**: Dynamic authorization is fast only if your caching tier is solid. Monotonic versioning and multi-tier Pub/Sub invalidation turn what could be a brittle bottleneck into a rock-solid infrastructure asset.
