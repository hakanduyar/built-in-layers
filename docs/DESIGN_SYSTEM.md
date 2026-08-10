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
