---
title: "Seven Years In: Rethinking the Cost of Premature Abstraction"
summary: "Early on, I treated duplication as a mortal sin. Today, I fear premature abstraction far more: it cements half-baked assumptions into brittle interfaces. Notes on cultivating intuition for the Rule of Three."
category: "note"
date: "2026-05-21"
draft: false
---

During my first two years writing software, I had an almost visceral intolerance for duplicated code.

If five lines of logic appeared across two different files, or if two UI components shared a handful of similarly named props, alarm bells rang in my head. What followed was a wave of self-indulgent refactoring: extracting generic base classes, creating sprawling helper utilities, or authoring a clever `UniversalDataGridContainer`. Back then, I believed that fewer lines of code and higher rates of reusability were the ultimate badges of engineering maturity.

It was only after five to seven years in production—and after personally having to excavate and dismantle several monolithic modules paralyzed by over-abstraction—that I finally understood the profound weight of Sandi Metz’s famous observation:

> **"Duplication is far cheaper than the wrong abstraction."**

Today, when faced with an opportunity to abstract or refactor, I am noticeably more cautious, deliberate, and patient.

---

## 1. Incidental Duplication: The Most Dangerous Trap

Why do developers fall into premature abstraction so easily? The human brain is an aggressive pattern-matching machine. We are wired to mistake **incidental surface similarity** for **essential domain alignment**.

Consider an ordinary product lifecycle:

1. You ship an e-commerce "Product Review" modal featuring a five-star rating, a text area, and an image upload widget.
2. Two weeks later, customer support requests a "Post-Resolution Ticket Feedback" modal—also featuring a star rating, a text area, and an image upload widget.

A developer drunk on dogmatic DRY (Don't Repeat Yourself) leaps at the opportunity: *"These are functionally identical!"* And so, a reusable `FeedbackModal` is born:

```typescript
// Initial abstraction: Clean, elegant, seemingly complete
interface FeedbackModalProps {
  type: 'review' | 'ticket';
  targetId: string;
  onSubmit: (data: FeedbackPayload) => Promise<void>;
}
```

The cracks appear over the next three months:

- Product Reviews require anonymous posting flags and real-time profanity screening.
- Support Tickets require mandatory agent employee ID tagging and multi-select resolution satisfaction categories.
- Product Reviews introduce promotional coupon banners upon five-star submission.
- Support Tickets require an exit-intent dialog when a user inputs a low rating.

To accommodate these diverging requirements within the single abstraction, the component inevitably degenerates:

```typescript
// Three months later: An unmaintainable sprawl of conditional flags
interface FeedbackModalProps {
  type: 'review' | 'ticket';
  targetId: string;
  allowAnonymous?: boolean;
  highlightSensitiveWords?: boolean;
  showAgentSelector?: boolean;
  satisfactionReasons?: string[];
  couponBanner?: ReactNode;
  interceptLowScore?: boolean;
  // ... followed by ten more booleans and diverging callbacks
}
```

Two entirely unrelated business domains have been forcefully welded together by a paper-thin layer of syntactic convenience. Modifying review behavior risks breaking critical support workflows. Tracing execution flow requires juggling mental state across a maze of ternary operators.

**The superficial overlap in early UI appearance was merely a coincidence; the reasons for change (the axis of business evolution) were completely disjoint.** Forcing incidental duplicates into a shared abstraction borrows short-term reusability by taking on massive long-term architectural debt.

---

## 2. The Compounding Debt of the Wrong Abstraction

The harm of premature abstraction is not merely aesthetic. Its true danger lies in **cognitive bias and sunk-cost inertia**.

1. **Interfaces are Sticky**: Junior and incoming developers assume existing abstractions represent carefully vetted architectural standards. When friction arises, their natural instinct is to tack on yet another boolean flag rather than question the foundation.
2. **Exponential Refactoring Friction**: Deleting fifty lines of isolated, duplicate code is trivial and carries zero blast radius. Tearing down a "shared abstraction" consumed across twenty call sites demands cross-team coordination, comprehensive regression suites, and canary releases.
3. **Obscured Domain Complexity**: A flawed abstraction acts like a coat of fresh paint over a cracked load-bearing wall, masking structural misunderstandings beneath a facade of neatness.

---

## 3. Operationalizing "The Rule of Three"

To cultivate architectural discipline across our engineering team, we enforce a pragmatic **Rule of Three**:

```text
[First Instance]  ──> Focus purely on clarity and delivery; inline everything.
                       │
[Second Instance] ──> Allow explicit duplication; observe independent evolution.
                       │
[Third Instance]  ──> Extract with confidence, armed with three real datasets.
```

### 1. The First Encounter: Pure Immediacy

When writing a new feature, author the most direct, readable code possible. Solve the concrete problem in front of you. Do not spend ten minutes daydreaming about speculative future extensions that might never arrive.

### 2. The Second Encounter: Tolerating Duplication

When the second similar request arrives, resist the reflex to generalize. Copy the core implementation, adapt it directly within the new module’s context, and let them both run in production.

Observe how they behave over a few release cycles. Do their data contracts converge, or do they diverge as customer feedback shapes each surface? **Copy-paste is the cheapest possible sandbox for discovering domain boundaries.**

### 3. The Third Encounter: Principled Extraction

When a third distinct instance emerges, you no longer need to guess. You are equipped with two battle-tested, living implementations:

- **Invariants**: The mechanisms that genuinely stayed identical across all scenarios (e.g., error-retry exponential backoff, cryptographic hashing).
- **Degrees of Freedom**: The contextual elements that varied wildly (formatting, fields, callbacks).

Extracting at this juncture yields interfaces that fit like a tailored suit.

---

## 4. Characteristics of Resilient Abstractions

When abstraction is genuinely warranted, how do we prevent it from curdling into legacy debt?

### 1. Composition Over Inheritance

Class inheritance hierarchies are brittle; changes to a parent class ripple destructively throughout child branches. Functional composition and component slot patterns remain resilient:

```typescript
// Brittle: Rigid inheritance chain
class BaseDataExportController { ... }

// Resilient: Composable pipeline of pure transforms
const transformAndExport = pipe(
  fetchRawData,
  applyDomainFilter,
  formatToCsv,
  uploadToS3
);
```

### 2. Narrow Interfaces and Single Responsibility

A good abstraction is typically small. Expose only the absolute minimum contract required by consumers. Never build a twenty-parameter "Swiss Army Knife" function when three discrete, transparent utilities would serve with tenfold greater clarity.

### 3. Always Provide Escape Hatches

Never treat the underlying platform as a hermetic black box.

For example, when authoring an internal API client wrapper, always expose a configuration slot for an underlying `customFetch?: typeof fetch` or native `RequestInit` pass-through. If an edge case requires an esoteric telemetry header or a specific cache-busting mode, engineers can utilize the escape hatch without needing to fork your entire library.

---

## 5. Conclusion: Restraint as Senior Intuition

Looking back at seven years of full-stack development, my relationship with code design has traveled a complete circle:

- **Junior**: Writes straightforward code because they haven't learned complex design patterns yet.
- **Mid-level**: Writes deeply layered, hyper-abstracted architectures to demonstrate mastery of patterns.
- **Senior**: Chooses deliberate simplicity and restraint because they respect how systems actually live, breathe, and mutate over time.

True software craft is not measured by the height of an inheritance tower or the complexity of a type puzzle, but by the discipline to let code sit unadorned until real business pressure reveals its true shape.

Next time you feel the urge to engineer a universal `BaseDataManager`, take a breath, duplicate the function, and let reality do the teaching.
