# DESIGN SYSTEM — Built in Layers

Status: APPROVED WITH REVISIONS (2026-07-17) — D-004 accessible tokens and revised D-005/D-006 interaction patterns incorporated
Derived from: `docs/PROJECT_SPEC.md §5–6`, `CLAUDE.md §5–6`

This defines the system and component contracts, not every component. Implementation tasks may not invent tokens, colors, type roles, or motion values outside this document.

## 1. Design principles

1. **Editorial, not dashboard.** The reference is a well-set technical journal: strong typography, hairline rules, generous whitespace — not SaaS cards.
2. **The grid is visible on purpose.** Measurement details (index numbers, rules, corner ticks) express the "built in layers" idea; they are a small fixed vocabulary, not free decoration.
3. **Asymmetric but disciplined.** Compositions are offset on the grid; nothing floats off it.
4. **One accent, spent carefully.** `--signal` orange appears at most a few times per viewport; it marks the signal, never the noise.
5. **Motion explains, never performs.** Every animation states hierarchy, state change, or the layer concept — otherwise it is deleted.
6. **Honest by default.** Placeholder or pending content is visibly labelled; nothing is styled to look more finished than it is.
7. **Works flat first.** Every page must be complete and understandable with zero JavaScript and zero motion.

## 2. Color tokens

Approved seed (from PROJECT_SPEC — must not change without a documented reason):

```css
--paper:      #f1efe8;  /* page background */
--ink:        #161616;  /* primary text */
--soft-paper: #e5e2d8;  /* inset/raised panels, code blocks, image mats */
--line:       #b8b5ac;  /* hairline rules, decorative borders */
--signal:     #ff4f1f;  /* accent — GRAPHIC USE ONLY, see contrast rules */
```

Approved accessible additions (D-004, accepted with changes 2026-07-17; exact hex values open to visual tuning as long as the ratios hold):

```css
--ink-muted:   #504e48; /* secondary text — ≈7.1:1 on paper (AA/AAA body) */
--signal-text: #b8380e; /* accent used AS TEXT — ≈5.1:1 on paper (AA body) */
--signal-ui:   #e04413; /* accent for MEANINGFUL control boundaries and
                           indicators — ≈3.6:1 on paper (≥3:1 required) */
```

### Contrast requirements (binding, per approved D-004)

- Normal text must meet at least **4.5:1**.
- Meaningful control boundaries and indicators must meet at least **3:1** (use `--signal-ui`, `--ink`, or stronger).
- Color must **never be the only indication** of selection, focus, status, or interaction — always pair with underline, weight, outline, text, or shape.
- `--signal` may remain decorative wherever it does not carry meaning.

| Pair | Ratio | Allowed use |
|---|---|---|
| `--ink` on `--paper` / `--soft-paper` | ≈15:1 | All text |
| `--ink-muted` on `--paper` | ≈7:1 | Secondary text, captions |
| `--signal-text` on `--paper` | ≈5:1 | Accent text, links, active labels |
| `--signal-ui` on `--paper` | ≈3.6:1 | Meaningful control boundaries and indicators (selection dots, active markers, control outlines) — never body text |
| `--signal` on `--paper` | ≈2.9:1 | **Never text, never a meaningful indicator, never sole state indication.** Decorative marks, thick rules, large fills where meaning is duplicated by text |
| `--ink` on `--signal` | ≈5.5:1 | Text on signal-filled elements (e.g. button hover) |
| `--paper` on `--ink` | ≈15:1 | Inverted elements (primary button) |
| `--line` on `--paper` | ≈1.8:1 | Decorative rules only — never functional boundaries, never focus indication |

No other colors exist. No gradients. No alpha overlays except `--ink` at fixed opacities 4% / 8% for hover washes on large surfaces.

## 3. Typography roles

Families (fixed at three, loaded via `next/font/google`, subsets `latin` + `latin-ext`):

- **Archivo** — display and headings. Uppercase for display roles.
- **Newsreader** — editorial serif, *italic only*, for selected statements.
- **IBM Plex Mono** — metadata, labels, index numbers, captions, diagram text.

Roles (CSS custom properties set in `styles/globals.css`, exposed as Tailwind theme values):

| Role | Family | Size | Line height | Tracking | Case | Use |
|---|---|---|---|---|---|---|
| `display-xl` | Archivo 600–700 | `clamp(3rem, 8vw, 6.5rem)` | 0.95 | −0.02em | UPPER | Hero name/title only |
| `display-l` | Archivo 600 | `clamp(2.25rem, 5vw, 4rem)` | 1.0 | −0.015em | UPPER | Section statements (e.g. SELECTED SYSTEMS), 404 |
| `heading-l` | Archivo 600 | `clamp(1.75rem, 3vw, 2.5rem)` | 1.1 | −0.01em | Sentence | Page/case-study section headings |
| `heading-m` | Archivo 600 | `1.375rem` | 1.25 | 0 | Sentence | Sub-headings, card titles |
| `statement` | Newsreader 500 italic | `clamp(1.5rem, 2.5vw, 2.25rem)` | 1.35 | 0 | Sentence | Editorial statements; max 2 per page |
| `body-l` | Archivo 400 | `1.125rem` | 1.65 | 0 | Sentence | Case-study prose, lead paragraphs |
| `body` | Archivo 400 | `1rem` | 1.65 | 0 | Sentence | Default text |
| `mono-label` | IBM Plex Mono 500 | `0.8125rem` | 1.4 | +0.08em | UPPER | Eyebrows, nav, tags, layer tabs, buttons |
| `mono-meta` | IBM Plex Mono 400 | `0.75rem` | 1.5 | +0.04em | Sentence | Captions, index numbers, footnotes |

Prose measure: 42rem (~68ch) maximum for case-study text. Body text never justified. No font weight below 400 or above 700.

## 4. Responsive grid

| Range | Columns | Gutter | Outer padding |
|---|---|---|---|
| < 768px (mobile) | 4 | 16px | 16px |
| 768–1023px (tablet) | 8 | 24px | 24px |
| ≥ 1024px (desktop) | 12 | 24px | 32px |

Breakpoints follow Tailwind defaults (`md` 768, `lg` 1024, `xl` 1280, `2xl` 1536). The grid is implemented with CSS Grid on section wrappers; content blocks are placed on explicit column lines to create the approved asymmetry (e.g. hero name on columns 1–10, meta block on 10–13).

## 5. Spacing scale

4px base, closed scale — no arbitrary values in components:

```text
4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160
```

Vertical rhythm: sections are separated by 96–160px on desktop and 64–96px on mobile. Within a section: heading→content 32–48px, between prose blocks 16–24px. Section separations use a hairline `--line` rule plus the section index (see §8) — not boxes.

## 6. Container widths

- `--container-max: 1320px`, centered, with outer padding per §4.
- Prose column: 42rem.
- Full-bleed is allowed only for the hero background tone and horizontal rules; images never bleed beyond the container in MVP.

## 7. Border and radius rules

- Radius tokens: `--radius-0: 0`, `--radius-1: 2px`, `--radius-2: 4px`. Nothing larger. No pills, no circles except a 6px signal dot used as a status/tick mark.
- Rules and borders: 1px solid `--line`. Emphasis rules (under active tab, hero baseline): 2px solid `--ink` or `--signal`.
- Panels (`--soft-paper`) have either no border or a 1px `--line` border — never shadows. Box-shadow is forbidden except a focus ring fallback.

## 8. Grid/measurement detail vocabulary (fixed)

The only approved decorative elements — anything else needs approval:

1. **Section index**: mono-meta number + label, e.g. `02 / SELECTED SYSTEMS`, sitting on the section's top rule.
2. **Hairline rules**: horizontal 1px `--line`, full container width.
3. **Corner ticks**: 8px L-shaped marks at image/diagram corners, `--line` or `--ink`.
4. **Signal dot**: 6px square or circle, paired with text (never alone). Purely decorative dots use `--signal`; dots that indicate state (selection, status) use `--signal-ui` (≥3:1 — D-004).
5. **Layer registration mark**: three stacked 2px bars (the visual shorthand for Surface/Flow/System) used in the layer explorer and case-study layer nav.

All are `aria-hidden` and convey nothing not present in text.

## 9. Image treatment

- Images sit on a `--soft-paper` mat with a 1px `--line` border and corner ticks; radius `--radius-1`.
- Every image has a mono-meta caption line: `FIG 03 — <description>`.
- Standard aspect ratios: screenshots 16:10, mobile screenshots 9:19.5 (shown in pairs/triples), **when the screenshot is being authored/staged specifically for this site** (a deliberate capture composed to that ratio). **D-019 diagrams** (`verified-diagram`/`provisional-illustration`, `docs/DECISIONS.md`) use the same fixed 16:10 canvas (`1600×1000` viewBox) as desktop screenshots, not free height — a deliberate change from this system's original "diagrams free height inside the prose column" rule, made so a diagram's `Figure` mat behaves identically to a screenshot's regardless of which asset type actually fills a given slot, and so the two asset types can be swapped for each other later (D-019's own "pure asset swap" guarantee) without a layout change. Each diagram's `<svg>` root sets literal `width="1600" height="1000"` attributes matching its `viewBox`, not just the `viewBox` alone — since `Figure` renders these as a plain `<img>`, the browser needs the attributes themselves to reserve the correct space before load.
- **Real screenshots sourced from an audited repository (`assetType: "real-screenshot"`) keep their true, original aspect ratio — 16:10 is a preferred authored-presentation target, not a requirement imposed on evidence.** Cropping to 16:10, letterboxing, or stretching would either remove real interface content or distort it; authenticity of the evidence takes precedence over matching an arbitrary presentation ratio. `Figure`'s `<img>` already renders at its intrinsic aspect ratio (`className="block w-full"`, no fixed `height`/`aspect-ratio` override), so this requires no component change: a screenshot simply renders taller or shorter than a 16:10 diagram slot, inside the same `--soft-paper` mat. Cropping a real screenshot is allowed only to remove irrelevant outer whitespace/chrome, never to change the product state it depicts — report exactly what was cropped and why whenever it happens.
- **Mobile legibility for D-019 diagrams**: at 375px a diagram's internal text scales down and gets small — expected, not a defect, since the asset is vector (stays crisp at any zoom, never blurs the way a scaled-down raster screenshot would) and every fact it depicts must also already be stated in the surrounding layer prose (CONTENT_MODEL §4), so nothing is ever exclusively locked behind small diagram text. A diagram failing this bar (introducing a fact found nowhere in the prose) is a content defect, independent of font size.
- Placeholder assets are flat `--soft-paper` panels with the mono text `PLACEHOLDER — ASSET PENDING`; they must look deliberately unfinished (no fake UI inside). This remains the fallback only until either a real screenshot or a D-019 diagram exists — it is not itself an accepted permanent asset type once one of those two exists.
- No stock photography. No screenshots that were not taken from the real project. No AI-generated or otherwise invented final screenshots, under any circumstance — D-019 does not create an exception to this; it only permits an honestly-labelled diagram to stand in for a missing real screenshot, never a fake one pretending to be real.

## 10. Link and button behavior

- **Text links**: `--ink`, underlined (`text-underline-offset: 3px`, 1px thickness). Hover: color `--signal-text`, thickness 2px. Never color-only differentiation.
- **External links** (Medium, GitHub, LinkedIn): suffixed with a small `↗` glyph and visually distinguishable; `target="_blank"` + `rel="noopener noreferrer"`, with visually-hidden "(opens in new tab)".
- **Primary button** (`ButtonLink`): mono-label text, `--ink` background, `--paper` text, radius `--radius-1`, padding 12×24px. Hover: background `--signal`, text `--ink` (5.5:1). Active: translate down 1px, no scale.
- **Secondary button**: transparent, 1px `--ink` border, `--ink` text. Hover: `--ink` background at 8% wash.
- Buttons are `<a>` for navigation and `<button>` only for real actions (layer switch). Minimum target 44×44px on touch.

## 11. Focus states

- Global `:focus-visible`: 2px solid `--ink` outline with 2px offset, on every interactive element, never suppressed.
- On `--ink`-filled elements (primary button): outline color `--paper`.
- Focus is never indicated by `--line` or by color change alone.
- Skip link becomes visible on focus as a `--ink` on `--paper` bar at the top-left.

## 12. Layer control states (Surface / Flow / System)

Semantics: WAI-ARIA Tabs pattern as a progressive enhancement, with **manual activation** (revised D-006, see ARCHITECTURE §12): Left/Right Arrow move tab focus without activating; Home/End move to first/last tab; Enter/Space activate the focused tab; `tablist`/`tab`/`tabpanel` roles and relationships correct. Visual contract:

| State | Appearance |
|---|---|
| Inactive tab | mono-label in `--ink-muted`, transparent underline slot (2px) |
| Hover | text `--ink`, underline `--line` |
| Focused (not yet activated) | standard focus ring on the focused tab — activation only on Enter/Space |
| Active tab | text `--ink`, 2px `--ink` underline, `--signal-ui` dot before the label (state indicator ≥3:1 — D-004), `aria-selected="true"` |
| Focus-visible | standard focus ring in addition to the state above |
| Disabled | does not exist — all three layers always available |

Active state is expressed by underline + dot + weight, never color alone. On mobile the tablist is a single wrapping/scrollable row with ≥44px targets. Panel change: crossfade + 8px rise, ≤300ms (instant under reduced motion). The static/no-JS rendering is three stacked sections titled `SURFACE`, `FLOW`, `SYSTEM` — all three **visible, ordered, labelled, and readable**; the page never depends on JavaScript to expose project content.

Each layer panel must present different real content (enforced by CONTENT_MODEL §7). The switch changes text, diagrams, and figures — never just a highlight color.

## 13. Motion principles and timing

Tokens:

```css
--duration-fast: 150ms;   /* hovers, underline, dot */
--duration-base: 240ms;   /* fades, small reveals */
--duration-slow: 400ms;   /* layer panel change, hero intro */
--ease-standard: cubic-bezier(0.2, 0, 0, 1);
--ease-exit:     cubic-bezier(0.4, 0, 1, 1);
```

Rules:

- Allowed movements: opacity fades, vertical translate ≤16px, underline growth, stagger ≤90ms between siblings (max 5 staggered items).
- Scroll-triggered reveals: once per element, threshold ~0.2, section-level only — never per-paragraph, never re-triggering.
- Hero intro: one staggered reveal on load, total ≤700ms.
- Forbidden: parallax, scale > 1.03, rotation, blur transitions, spring overshoot, marquees, looping/idle animations, scroll-linked (scrub) animation, animation on body text blocks, layout-shifting entrances (reserve space; animate opacity/transform only).
- Nothing animates below the fold before the user reaches it; nothing blocks interaction while animating.

## 14. Reduced-motion behavior

When `prefers-reduced-motion: reduce`:

- All reveals render in their final state immediately (no fade, no translate).
- Layer panel switch is instant (content swap only).
- Hover underline/color changes remain (they are state feedback, not motion).
- Enforced doubly: global CSS media query + `useReducedMotion()` in every motion wrapper (ARCHITECTURE §13).

## 15. Responsive behavior of major homepage sections

| Section | Desktop (12 col) | Tablet (8 col) | Mobile (4 col) |
|---|---|---|---|
| Header/nav | Name left, inline nav right, baseline rule | Same, tighter | Name + visible MENU trigger opening an accessible full-screen/panel nav (keyboard, Escape-to-close, managed focus — revised D-005); without JS the full link list renders |
| Hero | Display-xl name/title on cols 1–10; mono meta block cols 10–13; baseline rule with section index | Stacked; display scales via clamp | Stacked; meta block moves below title; min font from clamp floor |
| Positioning statement | Serif statement on cols 3–11 (offset, not centered) | Cols 2–8 | Full width |
| Layer explorer intro | Tabs row + panel on cols 1–9, registration mark cols 10–13 | Tabs wrap; panel full width | Scrollable/wrapping tab row; panel full width; stacked sections when static |
| Selected systems | Alternating asymmetric rows: image mat 7 cols / text 5 cols, sides swapping | Image above text, full width rows | Single column; index numbers kept |
| Built for real life | 2-up offset cards (not equal-height grid) | 2-up | 1-up |
| How I build | Numbered principle list in 2 offset columns | Single column | Single column |
| Field notes | 3 note rows with rules, mono meta | Same | Same, tighter |
| About preview | Text cols 1–7, links block cols 8–13 | Stacked | Stacked |
| Contact CTA/footer | Display-l CTA, footer links in mono columns | Same, wrapped | Stacked columns |

No horizontal overflow at any width ≥ 320px.

## 16. Explicitly forbidden visual patterns

From `CLAUDE.md §5`, binding: purple/blue neon gradients; glassmorphism; random 3D objects; WebGL; decorative blobs; bento grids; logo marquees; custom cursors; scroll hijacking; long horizontal scroll sections; background video; parallax; per-text-block animation; dark mode; unapproved stock imagery; invented screenshots; excessive rounded cards; "crafting digital experiences" template copy. Additionally forbidden by this system: box shadows (except focus fallback), emoji in UI, icon libraries, skeleton shimmer as decoration, centered-hero-with-avatar layouts, equal-card project grids.

## 17. Anti-generic criteria (reviewable)

A page passes only if all are true:

1. The hero is set on the asymmetric grid — not horizontally centered, no avatar photo, no gradient text.
2. At least one composition per page places content off-axis on explicit grid columns.
3. Every decorative element belongs to the §8 vocabulary; count of `--signal` appearances per viewport ≤ 3.
4. No section is a grid of more than 4 visually identical cards.
5. Serif statements appear at most twice per page; mono labels appear on every section (index vocabulary).
6. All copy is specific to Hakan's real work — zero phrases from the forbidden template list; project descriptions name concrete mechanisms ("transactional inventory claims"), not adjectives ("blazing fast").
7. Layer tabs change real content (different text and figures per layer).
8. Side-by-side check against 2–3 common AI portfolio templates shows no structural resemblance (reviewer judgment, recorded in the task report).


## 18. EXPERIMENTAL — Spatial Portfolio V2 homepage prototype (branch-only, not approved for main)

**This section applies only to `feature/spatial-portfolio-v2`. It is not merged into `main`, does not amend §§1–17 above, and does not represent an approved design direction.** `main` remains governed by §§1–17 exactly as written. This entry exists so the branch is self-documenting for independent review against the sibling `feature/layered-editorial-prototype` experiment and against V1 (`feature/spatial-portfolio`, preserved unchanged) — see `docs/PROGRESS.md` for the dated log entries recording all three branches' relationship to `main`.

### 18.1 What V1 got wrong, and what V2 changes

V1 proved the camera infrastructure and was **visually rejected** by the owner after real-browser and screen-recording review. The verdict: *"the camera travels across a huge empty world containing tiny webpage components"* when the intent was *"the camera travels between fully composed scenes that temporarily own the viewport."*

V2 keeps V1's proven engine and replaces its presentation:

| Rejected in V1 | V2 |
|---|---|
| World coordinates existed, scenes did not | `lib/spatial/scenes.ts` is a real scene layer: anchor, focal progress, and dwell window per scene |
| Nodes reused the ordinary homepage `ProjectCard` (~384px cards adrift in a 4000px world) | `SpatialProjectScene` — a dedicated viewport-scale editorial composition; **no `ProjectCard` anywhere in the spatial world** (e2e-enforced) |
| 600vh blind spacer, enormous dead travel | 360vh, derived from what the scenes and the break actually need |
| Camera drifted past things at constant velocity | Camera *dwells* at each scene, and eases in/out of travel so arrivals read as arrivals |
| Collision was a mathematically correct but perceptually teleporting jump | Same discontinuous route jump, now bridged by a scene-break wipe so it reads as a cut |
| Continuous random ember canvas across the whole journey | One erosion-wind treatment attached to exactly one transition |
| Permanent route-progress label + scattered micro-metadata | Removed; one mono marker per scene |
| Section sat inside the 1320px `Container` while positioning in vw/vh | Full-bleed, so the world's units and its actual frame finally agree |

### 18.2 Disclosed departures from §13's binding motion rules

§13 forbids "scroll-linked (scrub) animation." This prototype's entire premise — real scroll position mapped to a camera's world position via a pinned/sticky container (Motion's `useScroll`/`useTransform`) — is exactly that pattern. This is a **deliberate, disclosed experimental hypothesis under test, not an oversight or a silent rule change.** It is isolated to this branch, never merged, and exists to be compared against the approved, §13-compliant direction.

The erosion atmosphere (18.4) is a second, narrower disclosed departure: §13 forbids "looping/idle animations." It is scoped to one transition and fully disabled under reduced motion.

Everything else follows the approved system and this codebase's existing conventions: semantic HTML, one `h1`, correct heading order (axe-verified), keyboard operability, approved tokens only, real loader-fed project content, and `Figure`'s D-019 asset-honesty rules including TASK-008's explicit-intrinsic-dimensions CLS fix. No scale >1.03, no rotation, no spring/overshoot, no parallax, no WebGL, no new dependency.

### 18.3 Scene and camera rules (additive, this branch only)

- **A scene owns the viewport.** Scene blocks are `min(84vw, 1180px)` wide (`92vw` on mobile) with a `72vh` minimum, framed by a camera inset. At 1440×900 a focal scene occupies ~82% of viewport width and its evidence plate ~56% — inside the 55–85% art-direction range, and roughly 2× the linear size of V1's cards.
- **No microtext, no thumbnails.** Project titles render at `display-l` (up to 64px); evidence plates are viewport-scale. Both are e2e-enforced as loose lower bounds ("not a thumbnail", "not microtext"), never as exact pixel layouts.
- **Two compositions, not one template.** `split` (text beside plate, Kıvılcım) and `stacked` (dominant plate leading, DropSpot) — so the two project scenes never read as one repeated card, per §17 criterion 4.
- **Evidence selection is data-derived.** The lead asset is chosen from the asset's own registered metadata (real screenshot > system-layer diagram > first registered), never a hard-coded filename or slug→asset map.
- **Titles are not CSS-uppercased.** `text-transform: uppercase` turns "Kıvılcım" into "KIVILCIM", destroying the dotless-ı orthography D-017 fixes as the primary display name. Display scale carries the emphasis instead of case.
- **Route geometry connects compositions.** Desktop travels diagonally with deliberately varying leg angles (no repeating zig-zag, unit-tested); mobile is purely vertical — "same world, same scenes, different choreography," never the desktop diagonal shrunk down.
- **Collision != bounce (carried over from V1, unchanged semantics).** The camera never eases past the wall and never reverses off it: it accelerates in, stops dead, holds, then jumps discontinuously. Unit-tested.
- **The break is perceptual, not just mathematical.** An ink panel wipes across, the route's discontinuity happens behind it at full cover, then it wipes away to reveal the new region — the difference between a cut and a teleport. Impact impulse is a single ≤7px shake at 140ms (inside the 80–180ms budget), no spring, no elastic settle, no flash-bang.
- **Orientation after reposition.** The landing scene leads with a giant expressive word that is the second half of the approved primary line — the visitor immediately understands the world changed.
- **Fewer elements, larger meaning (§22 of the brief).** One mono marker per scene carrying both route index and evidence type; V1's permanent route label and scattered micro-metadata are deleted.

### 18.4 Atmosphere — erosion wind (the single prototype)

V1's continuous canvas ember field read as random debug particles and was rejected. V2's replacement:

- Acts on **expressive typography only** — the giant transition word's trailing edge sheds fragments. Body text, project content, and every functional label are untouched (§20 of the brief).
- 17 fragments across 3 depth layers, all drifting along **one** shared wind vector (up and to the right), sized in `em` so they scale with the letterforms.
- Has a real **start → peak → decay** tied to exactly one transition (tail → collision) and does not exist anywhere else in the journey.
- Plain DOM transforms driven by MotionValues — **no canvas, no particle system, no WebGL, no dependency.**
- Renders as a static word (no fragments, no motion) under reduced motion and before hydration.

### 18.5 Typography split

- **Functional (always stable, never rotated, never fragmented):** project titles, descriptions, tech lists, captions, CTA, nav, evidence markers.
- **Expressive (may respond to camera progress):** the hero display name, the eroding transition word, and the post-reposition orientation word. Both giant words are `aria-hidden` decorative duplicates of copy already present in real semantic text on the same page, so nothing is exclusively locked behind a decorative treatment.
- One scene-scoped clamp override exists (hero display name, `clamp(3rem,10vw,9rem)`), because the shared `display-xl` token caps at 6.5rem and left the name occupying under half the frame — the exact failure V2 exists to correct. Kept component-scoped and **not** promoted into the token system, which governs `main`.
- Giant single words use viewport-driven clamp floors, not rem floors: an unbreakable word cannot wrap and overflowed 320px viewports otherwise.

### 18.6 Reduced-motion and no-JS fallback

Both fully disable the camera and the atmosphere rather than softening them: the same real, **fully composed** scenes render in plain linear document flow — no sticky container, no transform, no fragments. Deliberately not a stripped-down dump; each scene keeps its own composition, so this reads as a designed linear page. Mirrors the codebase's existing progressive-enhancement pattern (`LayerExplorer`, `MobileNav`).

### 18.7 Known remaining weaknesses (deliberately not resolved this pass)

- Only 2 of 4 D-016 projects are staged as scenes; JointLedger and Professional Systems are reached through the real Work index — an explicit vertical-slice boundary, not an oversight.
- The hero scene is intentionally calm and conventional (§7 of the brief) and is therefore the least distinctive frame in the sequence; whether it earns its viewport is the most open art-direction question in V2.
- Travel segments still show a mostly empty world. The pacing is far tighter than V1, but "what the space between scenes is actually made of" is unanswered — there is no orientation structure out there yet.
- The scene-break wipe is a solid ink panel. It works, but it is the most conventional device in the prototype and is worth challenging in a further iteration.
