---
name: 观星台 Observatory
description: A night-watch portfolio where a quiet star chart and a living campfire carry a full-stack developer's work.
colors:
  ink: "#070B14"
  panel: "#0C1424"
  grid: "#16233C"
  line: "#1E2E4A"
  glow: "#63D2E8"
  glow-soft: "rgba(99, 210, 232, 0.16)"
  dim: "#92A8C9"
  text: "#EBF0F8"
  ember: "#F2A24B"
  ink-light: "#EEF1F6"
  panel-light: "#F7F9FC"
  grid-light: "#D3DCE9"
  line-light: "#C2CEDF"
  glow-light: "#156A84"
  glow-soft-light: "rgba(21, 106, 132, 0.12)"
  dim-light: "#4C5C75"
  text-light: "#121B2B"
  ember-light: "#B5610C"
typography:
  display:
    fontFamily: "Cormorant Garamond, Noto Serif SC, Georgia, Songti SC, serif"
    fontWeight: 500
  headline:
    fontFamily: "Cormorant Garamond, Noto Serif SC, Georgia, Songti SC, serif"
    fontWeight: 500
  title:
    fontFamily: "Cormorant Garamond, Noto Serif SC, Georgia, Songti SC, serif"
    fontSize: "21px"
    fontWeight: 500
  body:
    fontFamily: "Plus Jakarta Sans, PingFang SC, Hiragino Sans GB, Microsoft YaHei, -apple-system, sans-serif"
    fontWeight: 400
  label:
    fontFamily: "Plus Jakarta Sans, PingFang SC, Hiragino Sans GB, Microsoft YaHei, -apple-system, sans-serif"
    fontSize: "11.5px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  xs: "2px"
  sm: "3px"
  md: "4px"
  lg: "6px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.glow-soft}"
    textColor: "{colors.glow}"
    rounded: "{rounded.md}"
    padding: "6.5px 14px"
  button-primary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.glow}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "6.5px 14px"
  button-secondary-hover:
    textColor: "{colors.glow}"
  icon-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.dim}"
    rounded: "{rounded.md}"
    size: "32px"
  icon-toggle-hover:
    textColor: "{colors.glow}"
  nav-link:
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "8px 14px"
  nav-link-hover:
    backgroundColor: "{colors.glow-soft}"
  nav-link-active:
    textColor: "{colors.glow}"
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "20px 20px 16px"
  chip-category:
    backgroundColor: "{colors.glow-soft}"
    textColor: "{colors.glow}"
    rounded: "{rounded.sm}"
  input:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: 观星台 Observatory

## Overview

**Creative North Star: "The Night Watch"**

The site is a watch kept through the night: a dark, still field of sky, a star chart drawn with an instrument-maker's care, and a campfire that answers when you lean toward it. Nothing shouts. The quiet is the point, and inside that quiet the details are alive. Stars twinkle on their own phase, meteors fall in evenly-spaced places so no pattern repeats, and the flame sways with the pointer and grows when stoked. The warmth is in the hand-made physics, not in the palette.

Density is low and deliberate. Surfaces are near-black navy in two tiers (page and raised panel), bounded by hairline 1px lines and a faint chart grid. A single cool accent, Starlight Cyan, marks everything interactive; a single warm accent, Campfire Ember, is held back for fire and for failure. Serif display type (Cormorant Garamond, with Noto Serif SC for Chinese) gives headings a literary, hand-lettered voice; Plus Jakarta Sans keeps body and controls plain and readable.

Motion is one grammar everywhere: one easing curve, short hover transitions, and a slower "scene" transition between pages that feels like moving from one place to another rather than loading a new screen. Every ambient animation respects reduced motion and the site's own motion toggle, and drops to a single still frame when asked.

**Key Characteristics:**
- Dark-first, bilingual (zh/en), with a full light theme driven by the same tokens.
- One cool accent (Starlight Cyan) for interaction, one warm accent (Campfire Ember) held in reserve.
- Flat at rest; shadow appears only as a response to state.
- Hairline 1px borders and a 4px corner as the near-universal form.
- Signature canvas/SVG worlds (StarMap, SkyCanvas, Campfire) carry the personality; the chrome around them stays restrained.

## Colors

A deep night-sky navy palette with one cool starlight accent and one warm firelight accent, flipped as a whole for the light theme.

### Primary
- **Starlight Cyan** (`glow`; light theme `glow-light`): the only interactive color. Hover and focus on links, cards, toggles and nav; the active-nav underline; the focus outline everywhere; the StarMap edges, rings, and lit stars; the role line under the name on the home page. Its soft companion **Starlight Haze** (`glow-soft`) is the translucent fill for selection, nav hover, the primary button, category chips, and search highlights.

### Secondary
- **Campfire Ember** (`ember`; light theme `ember-light`): warmth held in reserve. Used for string/number literals in article code highlighting and for failure feedback (e.g. a copy action that failed). The campfire's own glow uses literal orange gradients bound to the fire's intensity, in the same family.

### Neutral
- **Night Ink** (`ink`): page background, input fields, and the inner fill of contact grid cells.
- **Watch Panel** (`panel`): raised card surfaces (project, tool cards), the project detail drawer, contact cell hover.
- **Chart Grid** (`grid`): the faint grid lines inside the StarMap frame only.
- **Hairline** (`line`): the universal border, divider, and frame stroke; also the seam color showing between contact cells.
- **Dusk Text** (`dim`): secondary text, labels, dates, descriptions, star sub-labels.
- **Moonlit Text** (`text`): primary foreground text and unlit stars.

### Named Rules
**The One Signal Rule.** Starlight Cyan means "this responds to you." Never use it for decoration, static headings, or illustration fills that aren't interactive.

**The Ember in Reserve Rule.** Campfire Ember is not a second brand color. It appears for fire, for code literals, and for failure states. Never as a button, link, or general highlight.

**The Token Flip Rule.** Themes switch by flipping CSS custom properties under `[data-theme="light"]`. Components consume tokens and never branch per theme; only canvas code and non-color assets (gradients, shadows) carry explicit light overrides.

## Typography

**Display Font:** Cormorant Garamond (with Noto Serif SC, Georgia, Songti SC)
**Body Font:** Plus Jakarta Sans (with PingFang SC, Hiragino Sans GB, Microsoft YaHei, system sans)

**Character:** A high-contrast literary serif for names, titles, and star labels against a calm geometric sans for everything you read or operate. The serif carries the voice; the sans does the work.

### Hierarchy
- **Display** (serif, 500): the name on the home page and page-level headings.
- **Headline** (serif, 500): card titles for projects, tools, and posts; article headings in prose.
- **Title** (serif, 500, 21px; 26px on small screens): StarMap node labels and the nav brand.
- **Body** (sans, 400): all running copy, bio, summaries, article text.
- **Label** (sans, 500, 11.5–13.5px, 0.04–0.08em tracking): nav links, toggles, chips, star sub-labels, dates and metadata.

### Named Rules
**The Serif Speaks, Sans Works Rule.** Serif is for names and titles only. Controls, labels, metadata, and body copy are always sans.

## Layout

Pages sit under a fixed header that fades into the background (an `ink` gradient to transparent) rather than an opaque bar, so content scrolls through the night instead of under a lid. Section padding is 18px horizontally on mobile and 40px on desktop, with roughly 104–118px top clearance for the header.

Containers are sized per surface: the home grid caps at 1440px, About at 1320px, Projects at 1180px. Home and About split into two columns above 1041px (identity/bio on the left, StarMap or Campfire on the right). The navigation switches layout at 861px. Grids such as the project gallery use `auto-fill, minmax(300px, 1fr)` above 641px; the contact grid steps 1 → 2 → 3 columns at 561px and 901px.

Breakpoints are chosen per component at the width where its content actually breaks (861, 1041, 561, 641, 721, 901px), not from a fixed scale. Lists like Writing use vertical rhythm (24px per entry with a hairline divider) instead of boxed cards.

## Elevation & Depth

Flat at rest. Depth comes from two background tiers (Night Ink and Watch Panel) and hairline borders, not shadows. Shadows appear only as a response to state: a card lifts 2px with a soft, low shadow on hover or focus; the project drawer and portrait lightbox cast a broad shadow because they sit above the page. In the light theme, shadow opacity drops sharply to stay soft.

### Shadow Vocabulary
- **Hover lift** (`box-shadow: 0 12px 28px -14px rgba(4, 7, 13, 0.45)`): project and tool cards on hover/focus, paired with `translateY(-2px)` and a cyan border.
- **Floating control** (`box-shadow: 0 10px 24px -10px rgba(4, 7, 13, 0.45)`): reading-tool pills floating beside an article.
- **Drawer** (`box-shadow: -24px 0 60px rgba(4, 7, 13, 0.42)`): the project detail drawer sliding in from the right.
- **Lightbox** (`box-shadow: 0 24px 50px rgba(4, 7, 13, 0.48)`): the enlarged portrait.
- **Inset focus** (`box-shadow: inset 0 0 0 2px var(--glow)`): contact cells, where an outline would bleed across the seams.

### Named Rules
**The Shadow-Is-State Rule.** No surface carries a resting shadow. If something casts a shadow, it is hovered, focused, or floating above the page.

## Shapes

Corners are gently squared: 4px is the near-universal radius for cards, buttons, toggles, nav links, inputs, the contact grid, and code blocks. Smaller pieces (tag chips, icon boxes, inline code) use 3px; the search highlight mark uses 2px; the portrait lightbox uses 6px. Only the avatar and the campfire's glow halos are round.

Borders are always 1px hairlines in `line`, brightening to Starlight Cyan on interaction. The contact grid uses the seam trick: a `line`-colored wrapper with 1px gaps between `ink` cells, so dividers come from the background showing through rather than per-cell borders. The StarMap frame repeats this language with a 1px rectangle, a 0.6px inner grid, and alternating 4px/8px edge ticks.

## Components

### Buttons
Quiet and outlined; the fill is a haze, never a solid block.
- **Shape:** gently squared corners (4px), 1px border, 12.5px medium label, `6.5px 14px` padding.
- **Primary (key action, e.g. live demo):** Starlight Cyan border and text on a Starlight Haze fill; on hover the fill clears to transparent.
- **Secondary (e.g. source link):** Hairline border, Moonlit Text; on hover border and text turn Starlight Cyan.
- **Press:** every clickable control scales to 0.98 on press.

### Icon Toggles (theme, motion, language)
- 32px square (language toggle is 32px tall with 11px side padding), 4px corners, Hairline border, Dusk Text icon (Lucide, 14px, 1.75 stroke). Hover turns border and icon Starlight Cyan over 300ms on the shared easing curve.

### Navigation
- Fixed header, 72px tall on desktop, with a fade-to-transparent background. Serif brand on the left, sans links (13–13.5px) in the middle, toggles on the right.
- **Hover:** Starlight Haze background on the 4px link.
- **Active:** Starlight Cyan text plus a 1px cyan underline bar near the bottom of the link; no filled pill.

### Cards / Containers
- **Corner Style:** 4px.
- **Background:** Watch Panel on Night Ink.
- **Shadow Strategy:** none at rest; Hover lift on hover/focus (see Elevation & Depth).
- **Border:** 1px Hairline, turning Starlight Cyan on hover/focus.
- **Internal Padding:** about 20px sides, 16–20px top/bottom.
- Project thumbnails sit at 2:1 above a hairline divider and scale to 1.035 on hover over 500ms. Tool cards make the whole card clickable through a pseudo-element overlay on the title link.

### Chips
- **Category chip:** 3px corners, Starlight Haze fill, Starlight Cyan text at 11.5px.
- **Tag chip:** 3px corners, Hairline border, Dusk Text.

### Inputs / Fields
- **Style:** Night Ink fill, 1px Hairline border, 4px corners, `10px 12px` padding.
- **Focus:** border turns Starlight Cyan; keyboard focus adds a 2px cyan outline offset 3px.

### StarMap (signature)
The home page's constellation navigation, drawn in SVG as a star chart: a hairline frame with a faint inner grid and edge ticks, section entries as stars joined by thin cyan edges at low opacity. Each star is a native link with a generous invisible hit area. On hover or focus, the star grows and turns cyan, a soft radial halo and a thin ring appear, its label turns cyan, and its connected edges brighten. Keyboard focus thickens the ring as the focus indicator. Meteors cross the chart occasionally.

### SkyCanvas (signature)
A fixed full-viewport canvas behind everything: a star field scaled to viewport area, each star twinkling on its own phase, and meteors spawned across a shuffled grid of cells so they are evenly spread without a visible pattern. Pale blue-white on dark, slate at low alpha on light. Draws a single still frame under reduced motion.

### Campfire (signature)
The About page's interactive illustration: a ring of stones, stacked and split sticks, glowing coals, and three layers of flame tongues, rendered on canvas. The flame leans toward the pointer on a damped spring, gusts with fast movement, and grows with sparks when clicked or activated by keyboard ("stoke the fire"). Its intensity drives a CSS glow halo around it. It lowers its own quality on slow devices and pauses when off-screen.

## Do's and Don'ts

### Do:
- **Do** use Starlight Cyan (`glow`) for every interactive state and nothing else.
- **Do** keep surfaces flat at rest and add the Hover lift (`0 12px 28px -14px rgba(4,7,13,0.45)` with `translateY(-2px)`) only on hover/focus.
- **Do** use 4px corners and 1px Hairline borders as the default form for new cards, controls, and inputs.
- **Do** use the shared easing `cubic-bezier(0.22, 0.61, 0.24, 1)`: about 300ms for hover states, 760ms for scene transitions.
- **Do** add new theme-dependent color as a token flipped under `[data-theme="light"]`, not as per-component theme branches.
- **Do** give every ambient animation a still state that honors `prefers-reduced-motion` and the site's motion toggle.
- **Do** set names and titles in the serif and everything operable in the sans.

### Don't:
- **Don't** use Campfire Ember (`ember`) for buttons, links, or general highlights.
- **Don't** add resting shadows to cards or panels.
- **Don't** use solid filled accent buttons; the primary action is a haze fill with a cyan outline.
- **Don't** introduce a second cool accent or a gradient brand color.
- **Don't** use Tailwind `dark:` variants for theming; consume the flipping tokens instead.
- **Don't** set controls, labels, or body copy in the serif.
