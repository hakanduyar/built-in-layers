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

## 18. EXPERIMENTAL — Spatial Portfolio V4 homepage prototype (branch-only, not approved for main)

**This section applies only to `feature/spatial-portfolio-v4`. It is not merged into `main`, does not amend §§1–17 above, and does not represent an approved design direction.** `main` remains governed by §§1–17 exactly as written. V1–V3 are preserved unchanged on their own branches; see `docs/PROGRESS.md` for the dated log entries recording all five branches' relationship to `main`.

### 18.1 The four iterations

| | V1 — rejected | V2 — scene reset | V3 — route choreography | V4 — continuous camera + depth |
|---|---|---|---|---|
| **Verdict** | "A huge empty world containing tiny webpage components." | "Dramatically better, still not the intended experience." | "Dramatically better; direction worth continuing. Not final quality." | this pass |
| **Named problem** | scale | post-collision route died | *"nothing moves for a while, then suddenly too much"* + scenes read as flat rectangles | — |
| **Scene focus** | none | dwell window | dwell window (camera parked) | **velocity minimum — the camera never stops** |
| **Route model** | point-to-point lerp | piecewise easing | piecewise easing | **one Catmull-Rom spline per route, C1 in position and speed** |
| **Progress values** | authored | authored | authored | **derived from route geometry** |
| **Scroll input** | raw | raw | raw | **overdamped spring** |
| **Depth** | none | none | none | **three planes + arrival scale + per-scene resolution** |
| **Travel space** | empty | empty | orientation marks | **orientation marks + material** |
| **Route length** | 600vh | 360vh | 420vh | **340vh** |

### 18.2 The motion model — focus is slowness, not stopping

V3's camera was measured under natural wheel input and the numbers matched the complaint exactly: it resolved to **29 distinct positions across 900 frames**, its **median response was 0.00 camera px per scroll px**, 406px of scrolling could pass with the camera moving under 8px, and it then burst at **23.7× the local rate**. Scene focus was implemented as a zero-velocity plateau, so more than half of all scrolling produced no movement at all.

V4 replaces that with three linked mechanisms:

1. **Position continuity.** One Catmull-Rom spline per route, interpolating (not approximating), so the curve passes exactly through every scene anchor while adjacent segments share the tangent at the anchor between them.
2. **Scroll allocation by distance.** Each segment receives scroll in proportion to `distance travelled + a fixed reading allowance`. Reading time is bought with the allowance rather than with a stop.
3. **Speed continuity.** Each segment's easing is a cubic Hermite with **independent end derivatives**, solved so its speed at both ends equals one shared constant. Independence is required, not stylistic: camera speed is `|dP/dt| · e'(t) / width`, and on a Catmull-Rom curve `|dP/dt|` differs between a segment's two ends, so a symmetric easing cannot match both. An earlier pass used one and the tail join measured 0.187 of average where every other join measured 0.267.

That shared constant is `FOCUS_SPEED_RATIO` (0.26) of the route's average speed — inside the brief's conceptual 0.12–0.30 band, and never zero. Measured across the whole route: minimum 0.265 of average, maximum 1.51, **dynamic range 5.7×** on desktop and 6.1× on mobile.

**Verified by measurement, not assertion.** Under identical natural-wheel harnesses:

| | V3 | V4 |
|---|---|---|
| distinct camera positions | 29 | **436** |
| longest dead scroll | 406 px / 1133 ms | **58 px / 17 ms** |
| response p05 | 0.00 | **1.27** |
| response median | 0.03 | **3.64** |
| response p95 | 13.04 | **4.89** |
| largest spike vs local rate | 23.7× | **1.91×** |

### 18.3 Scroll smoothing, and why the collision cannot smear

Raw scroll arrives in wheel steps. A spring sits between raw scroll progress and the visual progress everything reads from — **deliberately overdamped** (ratio ≈ 1.07, time constant ≈ 70ms), not the bouncy default.

Overdamping is the explicit boundary strategy for the collision. The cut is a threshold on this same value; an underdamped spring would overshoot and could carry the journey across `BREAK_CUT` and back, flickering the reposition. An overdamped spring provably cannot cross a threshold twice, so the cut needs no special-casing.

Equally important: **every visual reads from the smoothed value** — camera, break panel, impact flag, erosion, depth. Deriving some from raw and some from smoothed is precisely what would smear the cut, by letting the panel and the jump disagree about when it happened.

### 18.4 Depth planes

Three planes, and the middle one is pinned at exactly **1.0**:

- **Distant (0.62)** — travel material only.
- **World (1.0)** — scenes, route rails, registration ticks, wall boundary.
- **Near (1.13)** — a few structural rules that sweep past faster than the world.

The world plane does not parallax, and that is a deliberate departure from the brief's suggested 0.82 for the structural layer: the rails and ticks are *derived from the camera path*, so sliding them would make the world's own orientation system point where the camera never goes. Depth is therefore built **around** that plane — material behind it and in front of it — which also gives a stronger cue than two layers both behind.

Mobile renders the world plane only. Parallax at 375px buys little and risks motion sickness.

**Arrival resolution.** Each scene carries a `--depth-resolve` custom property (0 distant → 1 framed) and a scale that runs 0.972 → 1.0. Two elements per project scene move a handful of pixels in opposite directions and settle at their real layout position, so nothing functional ever rests somewhere the static design did not put it. Driving it as a CSS variable rather than through React context keeps the scene components server-rendered.

### 18.5 Composition — scenes are not rectangles

Each project scene lets its evidence plate break the text column's alignment edge, via a `--scene-overhang` custom property the camera sets. The overhang is a **spatial** device that works because the camera frame clips it, so it is set only where something can clip it and collapses to zero in the linear fallback — an earlier pass hard-coded the negative margin and overflowed the document by 31px at 1024px.

No card borders, no drop shadows, no perspective skew on evidence. Asymmetry does the work.

### 18.6 Travel material

Material derives from the world's own language: oversized cropped fragments of the **real titles** of scenes the camera is heading toward, low-contrast paper-density fields, and near-plane rules.

**Placement is derived, not authored.** A parallax plane moves at a different rate from the world, so a mark placed at world coordinates does not appear where those coordinates suggest. An earlier pass positioned each fragment relative to its scene's anchor, and at 0.62 rate that put Kıvılcım's fragment inside the *hero* frame and off-screen by the time the camera reached Kıvılcım — exactly backwards, and it read as broken text. Each mark is now placed at `rate × cameraPosition(atProgress) + offset`.

Every fragment is `aria-hidden` and echoes copy that already exists as real semantic text in the scene it names, so the depth planes add no screen-reader content.

### 18.7 Disclosed departures from §13's binding motion rules

§13 forbids scroll-linked (scrub) animation. This prototype's entire premise is exactly that pattern. It is a **deliberate, disclosed experimental hypothesis under test**, isolated to this branch, never merged. The erosion atmosphere is a second disclosed departure (§13 forbids looping/idle animation); the expressive word's `scaleX` compression and the scenes' ≤3% arrival scale are a third — decorative type and framing only, never functional text, and never a growth beyond 1.0.

Everything else follows the approved system: semantic HTML, one `h1`, correct heading order (axe-verified), keyboard operability, approved tokens only, real loader-fed content, and `Figure`'s D-019 asset-honesty rules including TASK-008's CLS fix. No rotation, no perspective, no mouse-following, no WebGL, no new dependency.

### 18.8 Collision, atmosphere, and the rest

Unchanged in intent from V3 and re-verified: the approach accelerates, the camera stops dead for one short impact window (the only stationary window in V4), seven rails close from alternating sides on different curves with a linear solid field closing last, and the route jumps behind full cover. `collision != bounce` remains binding. The erosion wind vector is still derived from the collision-approach leg; fragment count is unchanged at 13.

### 18.9 Reduced-motion and no-JS fallback

Both disable the camera, the planes, the grammar, the break, the material and the atmosphere entirely — verified as zero of each — and render the same real, fully composed V4 scenes in linear document flow. Not a stripped dump: the layer teaser, the positioning statement, both evidence plates and their honest captions all survive.

### 18.10 Known remaining weaknesses (deliberately not resolved this pass)

- Only 2 of 4 D-016 projects are staged as scenes — an explicit vertical-slice boundary.
- Under a deliberately fast wheel profile (~1340 px/s, the whole route in 1.6s) the motion trace is too coarse — 260 frames for the entire journey — to separate the intentional reposition from ordinary fast travel, so the spike figure is not meaningful at that speed. Slow and normal profiles both measure under 2×.
- The distant plane's density fields and near-plane rules are placed by hand-tuned in-frame offsets. Their *progress* is derived, but where they sit in the frame is art direction and was tuned at 1440×900.
- `VW_PER_VH` is still a single nominal aspect ratio; the hero rule, the wind vector and the scroll allocation are all exactly aligned to the route only near 16:10.
- The Catmull-Rom parameter is not arc-length normalised, so within a segment the true speed varies slightly beyond the solved profile. On these near-straight segments the effect is small, and the measured dynamic range already accounts for it. **This remains true of V4 and is not retroactively fixed**; §19 records the separate, experimental V5 attempt to address it on its own branch. V4's own measurements above were taken against V4's code and are unchanged.

## 19. EXPERIMENTAL — Spatial Portfolio V5 (branch-only, not approved for main, not merged)

**This section applies only to `feature/spatial-portfolio-v5`. It is not merged into `main`, does not amend §§1–17, and does not supersede §18 — V4 is preserved unchanged on its own branch.** `main` remains governed by §§1–17 exactly as written. See `docs/PROGRESS.md` for the dated log entry recording every branch's relationship to `main`.

**Verification status is stated per claim.** V5 passes typecheck, lint, unit tests and a production build, and as of 2026-08-17 has also completed authoritative browser validation on the repository's pinned toolchain (Node 22.23.2 / pnpm 11.17.0): full Playwright suite on Chromium and WebKit, plus direct runtime measurement of the drift, the camera filter, the erosion layers and the System POV lifecycle. Two WebKit-only failures in pre-existing specs remain open and are recorded in §19.13. Nothing here may be read as a measured result unless it says so.

### 19.1 Design thesis

**POI gives the portfolio intelligence, not a skin.**

The reference is the *idea* of a system that observes and reorganises a world — not its visual styling. Three separable layers, and the distinction is what every rule below defends:

- **Spatial movement** is the physics of the world.
- **Material / erosion** is the physical state of the world.
- **System POV** is the intelligence observing and reorganising it.

The **warm-paper editorial identity remains primary and unchanged**. V5 introduces no new palette, no dark theme, no second visual system. Every mark uses the approved §2 token set.

### 19.2 The V5 systems

| System | Module | Status |
|---|---|---|
| Arc-length-normalised camera route | `lib/spatial/sceneRoute.ts` | implemented; unit-tested; **not** runtime-measured |
| Cascaded velocity-aware camera filter | `lib/spatial/cameraFilter.ts` | implemented; unit-tested; **not** runtime-measured |
| System POV | `components/spatial/SystemPOV.tsx`, `lib/spatial/systemPov.ts` | implemented; unit-tested; **not** browser-verified |
| Acquisition lifecycle | `lib/spatial/systemPov.ts` (`sceneState`) | implemented; unit-tested |
| Collision intelligence layer | `components/spatial/WorldGrammar.tsx` | implemented; **not** browser-verified |
| Layered erosion (shell → substrate → trace) | `components/spatial/ErosionWord.tsx` | implemented; **not** browser-verified |
| Structured debris | `components/spatial/ErosionWord.tsx` | implemented; **not** browser-verified |
| Directional architecture | `components/spatial/DirectionalField.tsx` | implemented; **not** browser-verified |
| Editorial Drift | `components/spatial/EditorialDrift.tsx`, `lib/spatial/editorialDrift.ts` | implemented; geometry unit-tested; **browser interpolation unproven — highest open risk** |

### 19.3 Camera route — geometry normalisation and speed shaping are separate concerns

These are two different mechanisms and V5 keeps them apart deliberately:

1. **Geometry normalisation** is the arc-length table. Each Catmull-Rom segment carries a 64-sample cumulative distance table, built once at module load, inverted by binary search plus linear interpolation. Both ends return exactly, so the curve still passes through every scene anchor to full precision. This addresses V4's §18.10 weakness — *on this branch only*.
2. **Focus velocity shaping** is the cubic Hermite easing with independent end derivatives, unchanged in intent from V4. Because the easing's output is now a *distance fraction* rather than a raw curve parameter, camera speed is exactly `L · e'(t) / width`.

Conflating the two is the mistake this split exists to prevent: normalising geometry does not shape focus, and shaping focus does not normalise geometry.

### 19.4 Camera filter — why a lag cascade replaced V4's spring

V4 filtered raw scroll through one fixed overdamped spring. V5 replaces it with **two cascaded first-order lags** whose time constant varies with input speed (tighter when the reader scrolls fast, looser when deliberate).

The reason is a correctness property, not a feel preference. Each stage moves a *fraction* of the remaining distance toward its input, so it can never pass it — for any `dt`, any `tau`, including a `tau` that changes every frame. A monotone input therefore produces a monotone output. Since the collision cut is a threshold on this value, **the cut cannot be crossed twice even in principle**, which is strictly stronger than V4's tuned overdamping. Cascading two stages (rather than one) keeps the output's *velocity* continuous, which is what dissolves wheel-step edges.

The tuning direction is deliberately the opposite of the original brief's suggestion: steady-state lag is `velocity × time-constant`, so *more* damping at speed lengthens coast rather than shortening it. `tests/unit/spatial-filter.test.ts` locks the monotonicity, the no-overshoot property and the single-crossing guarantee; it deliberately does **not** lock the tuning constants, which are expected to move.

### 19.5 Transition vocabulary

Three transition types for the whole world, reused everywhere, rather than a new effect per moment. **None of these names is ever rendered as text.**

- **ACQUISITION** — a scene is approached, framed, classified, released.
- **MATERIAL SHIFT** — the expressive word's coating erodes to the system beneath.
- **REORIENTATION** — the collision, the cut, and the world's new state.

### 19.6 Layered erosion — the signature effect

The effect is **a coating peeling off a material**, not text disintegrating into polygons. Three registered layers, drawn in stacking order rather than by punching holes (same percept, additive positive masks only, no mask-composite that differs between Chromium and WebKit):

1. **INK SHELL** — the word in ink; the coating, always fully painted.
2. **GRAPHITE SUBSTRATE** — the word in graphite, masked to the eroded zones, so where the coating has gone the material underneath is exposed.
3. **SYSTEM TRACE** — the word filled with a structural drawing, masked to the much smaller *deep cores* inside those zones. Only three zones ever expose it, and their cores are a fraction of the zone.

The trace layer is the point of the whole effect: it states, in material, exactly what the site states in words — **interfaces on the surface, systems underneath**.

**Debris uses a closed vocabulary of six archetypes** — bracket corner, short rail, node/connector, index fragment, structured hatch, path — reused across three depth layers, 12 fragments total, all drifting along one shared wind vector derived from the collision-approach leg. Placement is a seeded deterministic hash, never `Math.random()`. From a distance the pieces read as material debris; up close they read as structured system fragments. A meaningless polygon particle field is explicitly rejected.

Only the giant decorative word erodes. Body text, project content and every functional label are untouched — **no partially destroyed functional text**.

### 19.7 System POV — what the intelligence may say

At its fullest the entire layer is: four corner brackets, one hairline, one case index, and **at most two rows** of real metadata. There is no always-visible panel, no status feed, no reticle, no code rain.

**Every displayed value is read off the project's own validated frontmatter and humanised for display. A field that does not exist produces no row.** The two rows are chosen precisely because the scene does not already show them:

- **LAYER** — which of Surface / Flow / System the lead evidence belongs to (the site's own framework, stated about real content).
- **PHASE** — the project's real lifecycle state, omitted entirely when no approved value exists (D-018).

There is no slug → data table anywhere; project identity cannot conjure facts. `tests/unit/spatial-system-pov.test.ts` enforces all of this, including that two projects differing only in slug annotate identically.

### 19.8 Directional architecture

Environmental wayfinding — enormous chevron-like structures receding down a concourse — **not arrow icons**. Forms are cropped by the frame so none is seen whole, drawn as open hairline Vs with no shaft or head, on the distant plane at 6–10% opacity with farther repetitions blurred. Their angle is *derived* from the route, so they cannot point where the camera does not go. Exactly two fields exist in the whole journey: one in the run at the collision, one after the reposition. As the collision approaches, the pre-collision field compresses — the route is running out of room, and the architecture says so before the wall does.

### 19.9 Editorial Drift — the lower homepage

The owner rejected the page dropping into ordinary straight-down scrolling once the spatial route ends. Editorial Drift continues the world's physics through the lower page **without becoming a second spatial tour**.

- **Semantic document order is untouched.** Vertical progress is still ordinary scrolling. Only the horizontal position of each block varies as it passes through the viewport.
- **Position is a fraction of free space, never a distance**: `x = pad + f × (100vw − 2·pad − blockWidth)`. For any `f` in `[0,1]` the block is inside the track *by construction*, at every viewport width — so drift cannot overflow the page. Mobile drift is inherently minimal without a single media query, because the free space at 375px is only a few dozen pixels.
- **Deterministic, not random.** "Unpredictable" was specified to mean *visually non-obvious*, not nondeterministic. Each section has a different entry, exit and sign of travel, from a fixed table — stable across visits, history and screenshots.
- The track **settles back to centre** before handing off to the global footer CTA, so the world stops on a deliberate mark instead of running out.

**Resolved 2026-08-17 — the `calc()` interpolation works.** This was the largest open risk in the V5 audit: the drift is Motion interpolation between two CSS `calc()` strings, and no static check could prove a browser interpolates that rather than swapping between the two endpoint strings. Measured in Chromium at 1440×900, sampling each block across its own passage:

| section | entry → mid → exit (px) | travel | distinct positions | largest single step |
|---|---|---|---|---|
| Built for Real Life | 77.2 → 111.4 → 145.7 | 68.5px | 41/41 | 2.5% of range |
| How I Build | 214.3 → 160.5 → 106.6 | 107.6px | 41/41 | 2.5% of range |
| Field Notes | 126.1 → 165.3 → 204.5 | 78.3px | 41/41 | 2.5% of range |
| About | 189.8 → 180.0 → 174.1 | 15.7px | 34/41 | 3.2% of range |

A failed interpolation would put ~100% of the travel into one step; the measured worst case is 3.2%, and the sweep is monotonic. Horizontal document overflow is 0px, values are byte-identical across reloads, and the settle element lands at exactly 180px — the arithmetic centre of the track at that width. No change to the implementation was required, so the numeric-MotionValue fallback was **not** needed and was not adopted.

### 19.10 Reduced-motion contract (V5 — approved; supersedes §18.9)

**Reduced motion disables motion, not design.** V4's §18.9 concept — *reduced motion = zero spatial grammar* — is superseded on this branch by owner approval.

Under `prefers-reduced-motion`, the following **must be disabled**:

- spatial camera travel; parallax; spline-driven visual travel
- collision shake; animated scene repositioning
- erosion animation; moving debris
- directional-field movement; Editorial Drift movement
- any other non-essential scroll-linked motion

The following **may remain, statically**:

- strong editorial compositions
- static System POV corners and brackets
- real project metadata
- static structural rails where useful
- non-animated system grammar

Binding rules in this state: no fake telemetry; no duplicate screen-reader content; decorative static graphics stay `aria-hidden`; genuinely useful metadata remains semantic and appears **exactly once**; no partially destroyed functional text.

In practice the fallback renders the same real, fully composed scenes in linear document flow, with `SystemPOV` drawn in its resolved static form and the expressive word rendered at full scale with nothing detaching.

### 19.11 Anti-patterns — binding

V5 must not become any of these, and each is a rejection of a specific tempting shortcut:

- **no fake telemetry** — no invented percentages, coordinates, confidence values, statuses or timestamps
- **no generic hacker HUD**, no sci-fi reticle, no code rain
- **no permanent dashboard** — the system appears only while it is observing something
- **no dark-theme replacement** — warm paper stays primary; there is no second theme
- **no random polygon debris** — the archetype vocabulary is closed
- **no `Math.random()` route** — determinism is a contract, enforced by unit test
- **no straight-down lower-page regression**
- **no Person of Interest replica** — the reference is the idea, never the styling

### 19.12 Deferred ideas (recorded, NOT implemented)

Explicitly out of scope and not present in the code: intro resolve montage; cursor attention; an all-season system; a final world/network zoom-out; additional spatial project scenes beyond the current staged set.

### 19.13 Known open items

- **Two WebKit-only failures remain open, both in specs that predate V5.** (1) `shell.spec.ts` "skip link is the first Tab stop" — fails on WebKit even run in isolation; a headless window-activation/focus behaviour, unrelated to any spatial code. (2) `spatial.spec.ts` "every break rail closes onto the frame at the cut" — measures a 163px gap against an 80px bound on WebKit only; Chromium passes. Neither has been traced to a V5 change, and neither was weakened or skipped to obtain a green run. They need a dedicated WebKit pass.
- **The full suite is sensitive to worker parallelism on the current machine.** At the config's default worker count, six axe scans time out at 30s each; run singly they complete in 1.3–3.8s with zero violations. This is CPU contention, already documented for TASK-008, not an accessibility regression. The authoritative runs above used 3 workers.
- The camera-filter "largest movement spike" figure is not yet a clean metric: the world-plane transform includes the *deliberate* collision reposition, so a naive max-step measurement reports the intended discontinuity as a spike. Isolating non-collision travel needs a progress-gated probe.
- Only 2 of 4 D-016 projects are staged as scenes — an explicit vertical-slice boundary inherited from V4.
- `VW_PER_VH` remains a single nominal aspect ratio (inherited from V4).
- **Dangling brief references.** The V5 source files carry many bare `§NN` citations (`§5`, `§7`, `§11`, `§22-24`, `§26-31`, `§32`, `§37`, `§44`, …). These refer to the original V5 implementation brief, which was never committed to this repository and exists only in the authoring session. Each file's *top-level* pointer has been corrected to `docs/DESIGN_SYSTEM.md §19`, but the inner numbers are not resolvable against any document here. They were deliberately left in place rather than renumbered, because inventing a mapping would risk mislabelling the reasoning they annotate. Either commit the original brief or renumber them against §19 in a dedicated pass.

### 19.14 Branch status

**`feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.** It exists for independent comparison against V1–V4 and `feature/layered-editorial-prototype`. `main` is unchanged.

## 20. EXPERIMENTAL — Spatial Portfolio V6 refinement pass (branch-only, not approved for main)

**This section applies only to `feature/spatial-portfolio-v5`, which carries the V6 refinement pass on top of the V5 systems. It is not merged into `main`, does not amend §§1–17, and does not supersede §18 (V4) or §19 (V5) — it records what V6 changed and why.** `main` remains governed by §§1–17.

V6 is a **refinement of the V5 direction, not a new direction.** The owner's verdict on V5 was that the direction is right and much improved, with five specific remaining weaknesses. Each subsection below is one of those weaknesses and the change made for it. Verification status is stated per claim.

### 20.1 Motion — the unevenness was the velocity profile, not the filter

The complaint was still "not much is happening for a stretch, then suddenly too much." Three changes, in descending order of effect:

1. **`FOCUS_SPEED_RATIO` 0.26 → 0.42** (`lib/spatial/scenes.ts`). This is the dominant cause and the dominant fix. Under arc-length parameterisation the mid-segment peak is `1.5 − 0.5r` of average, so the journey's whole dynamic range is `(1.5 − 0.5r) / r`: **5.3× at V5's 0.26, 3.1× at V6's 0.42.** A scene is still clearly the slowest point in the world — 0.42 against a 1.29 peak is a 3× contrast, which reads as arrival — but the stretches between scenes no longer have to sprint to recover the distance the focus zones gave away.
2. **`ROUTE_LENGTH_VH` 340 → 380.** Raising the focus ratio makes the camera cross a scene's neighbourhood faster in progress terms, which alone would cost reading time exactly where it matters. A longer route restores it by lowering absolute camera speed per scroll pixel everywhere, leaving the flattened *variance* intact.
3. **Filter tightened** (`lib/spatial/cameraFilter.ts`): per-stage tau 62 → 48ms, tight tau 26 → 22ms, and the tightening threshold `SPEED_SETTLED` 0.10 → 0.06 so a slow deliberate scroll begins tightening immediately. The cascade is still ~96ms of effective smoothing — ample for a wheel notch — without the residual softness a 124ms cascade had.

**A fourth change addresses the cause structurally.** Every other moving thing in the world is driven by the *camera*, so during a focus zone almost nothing answers the wheel. `components/spatial/SystemField.tsx` is driven by **raw progress** — strictly linear, strictly monotone, no easing and no spline — so some part of the world responds to scroll at every point in the journey regardless of what the camera is doing. Measured across a tight window straddling Kıvılcım's focus: camera 123.5px, system field 7.67px, the field's four samples strictly monotonic. It cannot have a dead zone by construction.

### 20.2 Post-collision — the oblique route is now drawn, not merely implied

The owner's most serious objection: after the collision the world "becomes too close to a normal downward page." Diagnosis: route two inside the spatial section was always a genuine diagonal, but the **lower page** was the problem — at V5's fractions the largest block travelled 107px across a whole viewport of scrolling, a slope of roughly 6°. That is a column with a slight lean, not an oblique world.

- **Amplitudes widened** (`lib/spatial/editorialDrift.ts`): fractions now span 0.04–0.78 of the track (V5: 0.08–0.64), and the desktop block narrowed from 78vw/1080px to 72vw/1020px to create the free space those fractions spend. Measured lateral travel: **real-life 68.5 → 109.7px, how-i-build 107.6 → 182.9px, field-notes 78.3 → 127.9px, about 15.7 → 39.2px** — a 60–150% increase per section, with interpolation quality unchanged (21/21 distinct positions, largest single step 5% of range).
- **`driftRoute()` — the route made visible.** Two stops per section (its entry and exit) plus the closing settle, generated from *the same table the blocks are positioned by*. Rendered as a continuous oblique zigzag with a registration mark at every stop, in a container whose width is exactly the track's free width, so a stop at fraction `f` lands on the left edge of a block at `f` at every viewport width — one coordinate system, nothing to keep in sync. Measured 305 × 2109px at 1440×900. Desktop only: at 375px the blocks barely move laterally, so a spine would describe a route that is not really there.

**Honest limitation:** the spine's *vertical* stop positions are a deterministic approximation of where each block sits, not a measurement of it. Laterally it agrees with the blocks exactly; vertically it reaches a given fraction at a slightly different scroll offset than the block does. It reads as the route the world is on rather than as an outline of each block, which is the intended effect — but it is an approximation, not a tracing.

### 20.3 Erosion — the missing cue was an edge

V5's layering was structurally correct and still read as "text plus decorative debris." Three changes:

1. **A peel edge (`data-erosion-layer="peel"`).** A light `--line` annulus at the boundary of every eroded zone, clipped to the letterforms: physically the lifted lip of the coating, perceptually the thing that turns "this area is a different colour" into "this area has been stripped." V5 had no edge at all, which is precisely why the effect read as a fade. Drawn **last (topmost)** — correct for a lifted lip, and it keeps `tests/e2e/spatial-v5.spec.ts`'s shell/substrate/trace ordering contract exactly true.
2. **Cross-grain substrate.** A coarse 58° lamination plus a finer −32° counter-hatch. One direction read as a texture applied to a letter; two read as a cut section through a manufactured material.
3. **Debris sourced from real zones.** Every fragment's start position is now an actual erosion zone's centre plus a small deterministic scatter, and **its opacity is gated on that zone's own `start`** — so a piece appears only once the coating it came from has begun to lift. V5 placed all twelve across the word's trailing half on one shared fade curve, which is exactly why they read as decoration applied to the word rather than material off it. The six archetype drawings were also redrawn with real operational detail (graduated ticks, two nodes and a link, an index block with a bar run, a routed connector with a junction).

The vocabulary was **deliberately kept closed at the same six names**, because `tests/e2e/spatial-v5.spec.ts` enforces that closure and the contract is worth more than two extra shapes.

### 20.4 Person of Interest influence — surveying, not a HUD

`SystemField` is where the systemic language lives: a sparse field of registration crosses (seeded jitter, never a lattice — a regular grid reads as graph paper, which is a different and much more generic idea), two long route vectors whose angles are *derived from the real route* via `routeScreenAngle`, and one structured annotation cluster of bars and rules that deliberately resolves into no value.

`SystemPOV` gained a **graduated measure scale** on the frame's lower edge — one hairline, ticks of two lengths, **no numbers**, arriving with the classification and leaving before it. Numbers would be fabricated data (§19.11); graduation alone carries the meaning, which is that the frame is an instrument rather than an ornament. Desktop only.

Everything in this layer sits between 3% and 7% opacity, is hairline-weight, and is built from four mark types. Measured element budget at Kıvılcım focus: **4 brackets, 2 metadata rows, 2 rails.** If it ever reads as a HUD the correct fix is lower opacity, not explanatory chrome.

### 20.5 Directional architecture — pushed back into atmosphere

The V5 review read the chevron fields as heavy, which they were: a sharp 14px stroke at 9% is a visible band, and a visible band competes with the content behind it. Blur now starts at 3px and reaches 9px at the back (V5: 1 → 4.4px), and base opacities dropped to 0.06 / 0.05. Still exactly two fields in the journey, still no arrowhead anywhere.

### 20.6 Verification status

| Gate | Result |
|---|---|
| `typecheck` | pass |
| `lint` | pass |
| unit tests | **484 passed / 484**, 20 files |
| production build | pass — 14/14 pages |
| `spatial-v5.spec.ts` (Chromium) | **16 / 16** — all V5 browser contracts still hold unmodified |
| `spatial.spec.ts` (Chromium) | **37 / 37** |
| `a11y.spec.ts` (Chromium) | **14 / 14**, zero axe violations |
| reduced motion | 0 camera planes, 0 system field, 0 debris, 0 break rails, drift travel 0.00px; System POV and its 4 real metadata rows retained |
| mobile 375×812 | camera x ≡ 0, system field absent, drift spine absent, 4 compact brackets |
| horizontal overflow | 0px at 320 / 375 / 768 / 1024 / 1440 |

One regression was introduced and fixed during the pass: `SystemField`'s marks relied on inheriting `aria-hidden` from the layer, which broke `spatial.spec.ts`'s rule that every direct child of a non-world plane must carry it explicitly. The layer was changed to follow the existing convention; the test was not touched.

### 20.7 Known open items carried forward

- Everything in §19.13 that V6 did not address remains open: the two WebKit-only failures in pre-existing specs, worker-parallelism sensitivity of the axe scans, the collision-contaminated "largest movement spike" metric, 2 of 4 D-016 projects staged, and the dangling `§NN` brief citations.
- WebKit was **not** re-run in this pass; only Chromium. The V6 changes are CSS masks, transforms and SVG already used elsewhere on the branch, but that is reasoning, not measurement.
- No performance re-measurement (FPS / frame time / heap) was taken for V6. The peel layer adds a third masked text layer to the erosion word, which is the one change with a plausible paint cost, and it is quantised on the same `EROSION_STEPS` ladder as the other two.
- The drift spine's vertical approximation, recorded in §20.2.

### 20.8 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.** V6 is a refinement pass on that branch, not a new branch and not an approval.

## 21. Spatial Portfolio V6.1 — collision, material, perception, finale

Branch: `feature/spatial-portfolio-v5`, uncommitted on top of V6. This section records V6.1 only; §19 (V5) and §20 (V6) stand.

**Verification status is stated per claim.** V6.1 passes typecheck, lint, Prettier, 484 unit tests, a production build, and — new in this pass — the three spatial/a11y e2e specs on **both** Chromium (67/67) and WebKit (67/67). Performance was re-measured. Nothing below may be read as a measured result unless it says so.

### 21.1 Collision 2.0 — the curve, not the mechanism, was wrong

`SceneBreak.tsx` was byte-identical between V4 and V6, so the collision had not regressed; its arrival curve had always been backwards. `breakBandOffset` ran `(1 - t) ** speed`, whose derivative at `t = 0` is `-speed` — each rail's fastest travel was its first travel. Measured 6% into the cover window there was already ~121px of solid ink on both frame edges, so black sat at near-full mass for the whole window. That is the reported "large black rectangles entering the viewport".

V6.1 mirrors both curves and adds an explicit dwell:

| | V6 | V6.1 |
|---|---|---|
| close | `(1 - t) ** 1.35…2.31` | `1 - t ** 3.8…5.45` |
| reveal | `t ** speed` (lingers) | `1 - (1 - t) ** 2.4…3.2` (leaves at once) |
| solid field | linear (largest mass, seen crossing) | `1 - t ** 6` — slowest of everything, so it still closes last |
| fully covered | one instant at the cut | `BREAK_DWELL` = 0.007 either side (0.014 wide) |
| bands | 7 (~128px each) | 11 (~82px each) |

**Measured ink coverage across the cover ramp** (mean visible band width, fraction of frame): 0% → 0.2% → 4.4% → 26.6% → 61.3% → 100% at t = 0/0.25/0.5/0.75/0.9/1. At the ramp's midpoint V6 showed ~61% and V6.1 shows **4.4%**. The long readable approach to the boundary now carries no black at all, and the strongest black state is confined to a 0.014-wide dwell.

The dwell also, as a side effect, fixed a **documented inherited WebKit failure**: §19.13's "every break rail closes onto the frame at the cut" measured a 153–163px gap on WebKite because no genuine all-home window existed for its sweep to find. It now passes on WebKit.

The impact is a **recoil** rather than a shake — displacement back along the travel axis on both axes (`x: [0,-13,7,-3,0]`, `y: [0,6,-4,1,0]`, 190ms, one impulse, no spring) — and it is now watchable, because under the new curves the frame is still almost clear when it fires. The fully-covered state carries a **boundary section**: four uneven structural rules, one crossing rule, one short signal mark, drawn on the field so they exist only during the dwell. Flat unbroken ink was what made the covered state read as a transition overlay laid over the site rather than as the inside of something.

### 21.2 The decompression interval

V6's `reorient` — the UNDERNEATH composition — was framed at **exactly** `BREAK_CUT`, while the break panel was still 100% covering it and would not finish leaving for another 0.026 of progress. The scene and the collision residue occupied the same frames *by construction*; no restaging could have fixed it.

Route two now begins at a **lead-in coordinate** (`decompressionAnchor()`), derived by extending backwards along the `reorient → approach` direction by `DECOMPRESSION_REACH` = 0.22 of that leg. Derived rather than authored, so it cannot introduce a kink or describe a direction the camera does not then take. It is also the world's deepest point: the reposition drops *below* the depth it then climbs back through.

Measured: the camera lands at `(-46.12, 466.52)` at the cut, the cover has fully left by 0.6071, and `reorient` is not framed until 0.6506 — **27.3vh of scrolling** through open world between the two. "Impact → release → negative space → route settles → UNDERNEATH enters" is now the literal camera path.

Cost: `SPLIT` falls 0.576 → 0.532, so `ROUTE_LENGTH_VH` rises 380 → 410 to hold route one's reading time (measured 218.1vh against V6's 219vh). Still under V3's rejected 420vh.

### 21.3 ARC_SAMPLES 64 → 256 (a correctness fix)

The decompression leg's end tangent is **2.77× its own chord** (a reflected phantom at a route start followed by a much longer leg), far more tangent-magnitude variation than any previous segment. `arcParam` inverts the distance table by linear interpolation, so one 1/64 interval spanned enough of the segment's length to misplace the camera and break the world's C1 speed contract by **4% at the `reorient` join** — while the profile remained analytically exact (every segment solves to the same 499.9 boundary speed). The unit test caught it, and the error *converged* rather than shrinking with probe step size, which is what proved it was real and not measurement bias. Interpolation error is O(1/N²), so 256 samples takes 4% to ~0.25%. One-time module-load cost.

### 21.4 SYSTEMS — the peel flap

V6 drew shell, substrate, trace and an annulus "peel edge" all clipped to the **same letterforms at the same position**. A coating that has separated from its substrate is by definition no longer in registration with it; with zero displacement the only available cue was a colour change inside a circle, which is exactly why it read as "masked holes / X-ray windows / cutaway circles", and the annulus read as a generic inner outline.

**Peel flaps** replace it: a chip of coating hinged along one edge, lifting off the letter it was attached to. Ink — the same material as the shell — with a light `--line` lip along its leading edge as part of the material (a `linear-gradient`, because `clip-path` would cut a border off), rotating and translating off a `0% 50%` origin as its own zone lifts. All five of §11's cues fall out of one object: lifted boundary, thickness/lip, real displacement, direction, localised origin.

It is **cheaper as well as better**: a flap is a plain composited box with a static clip-path, not a full-size `background-clip: text` layer. The erosion word now carries **two** masked text layers where V6 had three. Flap lift is quantised to the same `EROSION_STEPS` ladder as the masks, because rotating a clip-path'd box forces re-rasterisation.

Only zones over the word's dense middle shed a flap (4 of 9). The two outermost zones sit past the ends of the letters: an exposure mask there simply shows nothing, but a solid chip reads as an ink blot floating beside the word. An earlier V6.1 pass sized flaps at `rx*1.5 × ry*0.86` — a ~315px lump, caught by screenshot, not by a test.

**Substrate depth** (§12): drawn 0.012em down-and-right of the shell. Two layers at the same position are the same surface; two that do not quite register are at different depths. Static transform on an existing layer.

**Debris: 12 → 5** (§13), larger, and each one's travel is driven by **its own zone's lift** rather than by a shared per-layer transform. V6 applied one 0→1 transform to a whole layer, so a fragment appearing at erosion 0.5 was already displaced halfway from its source the instant it became visible — it could never read as having come off the word, because it never started there. Displacement is now exactly zero when a fragment appears. The archetype vocabulary stays closed at six names; five are drawn.

### 21.5 Perception (§15–18)

V6 had all the perception *data* it needed — `sceneApproach` has returned a signed acquisition state since V5 — and spent none of it outside SystemPOV's own frame. `focusProximity()` is the one value the environment reads:

- **`SystemField` recedes** when something is in frame (`1 - 0.66 × focusProximity`) and is at full presence in open travel. §16's "irrelevant environmental lines recede" and "other world noise decreases" are this number, negated. Measured: no new elements.
- **Registration marks resolve** per scene, 0.13 dormant → 0.46/0.60 acquired, each reading its *own* scene's proximity.
- **The annotation cluster was deleted.** V6 described it as "structured, deliberately unreadable", which is precisely §17's prohibition — an annotation implying information without a structural reason. The honest fix is deletion, not softening. Nothing replaced it.

Global mark density did not increase (§18); it went down by one mark type.

### 21.6 Lower world (§19–22) and the finale (§23–25)

V6's four sections differed **only** in entry/exit fraction — one template plus an offset, which is why they still read as sections beside a timeline. Each now has a `plane` and a `depth` driving its own measure and the weight of its own structural marks: measured widths **970 / 1002 / 1020 / 1059px** for distant / wide / plate / near. Text contrast is untouched in every section (§22). The width uses `min()` against the padded viewport, so a `near` multiplier above 1 cannot overflow a phone by construction.

The spine runs at **two depths**: `driftRouteRuns()` splits it by the sign of the owning section's depth, and runs share their boundary stop so the line stays continuous across a depth change. Background runs sit behind the content planes, the foreground run in front. Measured: both layers present at 305 × 2189px on desktop, absent below `lg`.

`DriftSettle` became a **route termination** — the route arrives, reaches a last registration point, and the geometry *closes*: a closed rectangle against the open two-stroke corner used everywhere else on the page, then a short vertical handing off downward. Completion is stated only in geometry; §25's forbidden labels are absent.

`SiteFooter` became a **final scene**: `min-h-[76vh]`, vertically centred, a `clamp(2.5rem,7vw,6rem)` heading, a structural rule arriving from the margin, and the social/copyright material demoted below a rule as a calm secondary strip. This is the global footer, so the composition applies to every page — a genuine improvement everywhere, but the reason it changed now is the homepage finale.

### 21.7 Performance — measured, and the V6 attribution was wrong

The V6 report suspected the third masked text layer as "the one change with plausible paint cost". Measured non-invasively on the erosion progress window (injected CSS only, no repo instrumentation), V6.1 as-shipped vs the same window with individual systems disabled:

| variant | mean frame | ~fps | >50ms |
|---|---|---|---|
| as-shipped | 50.39ms | 19.8 | 41 |
| masked text layers off | 46.44ms | 21.5 | 28 |
| peel flaps off | 51.62ms | 19.4 | 38 |
| DirectionalField off | 50.51ms | 19.8 | 42 |

**The erosion effect is not what makes that phase slow.** The masked text layers account for ~4ms of a ~50ms frame; the peel flaps and the DirectionalField are both inside noise. The remaining cost is the whole spatial world's per-frame budget in this sandboxed headless environment, where absolute FPS is low for every phase. Relative comparisons within one run are the trustworthy part; the absolute numbers are environment-bound and must not be read as a user's experience.

**The V6 notch-bounded phase numbers are not comparable to V6.1's.** Those phases were delimited by wheel-notch counts, and `ROUTE_LENGTH_VH` changed 380 → 410, so identical notch counts now land at different progress. The notch-based V6.1 reading (systems phase 38.75ms mean vs V6's 35.08ms) is reported for completeness but is **not** a like-for-like result, and no true A/B of the same progress window against V6 was run.

### 21.8 Known open items

- **No true V6-vs-V6.1 A/B on the same progress window.** Would require rebuilding the V6 tree; not done. The isolation table above is the substitute and it answers the attribution question, not the regression question.
- **The erosion phase remains the slowest phase** in absolute terms in this environment, and V6.1 did not change that materially — it only established that the erosion effect is not the cause.
- **Video was not inspected frame by frame** for flicker; the recording is verified to reach the true document end (`scrollY === scrollMax`, CTA heading and copyright both on screen) but stutter was not assessed per frame.
- **No art-direction verdict is recorded here.** Whether the peel now reads as peeling, and whether the page reads as perceptive, are the owner's calls on the V6.1 artifacts.
- `shell.spec.ts`'s WebKit skip-link failure (§19.13) was **not** re-run — only the three specs the pass named.
- Everything else in §19.13 and §20.7 that V6.1 did not touch remains open, except the break-rail WebKit failure, which is fixed (§21.1).

### 21.9 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.** V6.1 is a refinement pass on uncommitted V6 work — not a new branch, not a commit, not an approval.

## 22. Spatial Portfolio V6.2 — collision timing, peel front, plates, finale

Branch `feature/spatial-portfolio-v5`, uncommitted on top of V6.1. §19 (V5), §20 (V6) and §21 (V6.1) stand. Verification status is stated per claim.

### 22.1 Collision timing — a latched event

The collision occupied a fixed span of PROGRESS (~0.075, about 31vh of scroll) and progress was its only clock, so its duration was whatever the reader's scroll speed made it. Under a wheel burst the whole event crossed in a handful of frames.

`useCollisionLatch` (SpatialCamera.tsx) bounds the event on a wall clock: on entering the band it clamps forward scroll to a ramp crossing it in `COLLISION_MIN_TRAVERSAL_MS` (1000ms) and **drives the visual value along that same ramp**, then releases.

**Three attempts, and the two that failed are worth recording because both looked correct:**

1. **Bounding the visual progress only.** The event did take a second — and played entirely off screen, because scroll had carried the sticky frame away. Measured: 600ms "visible", with **0.063** of those frames having the frame even half on screen, and **zero** under a harder fling. "Visible for 600ms" was true and worthless.
2. **Bounding both progress and scroll.** The visual then lagged an already-bounded scroll, so the camera needed a full second to cross the collision *however* it was driven — including programmatic scrolls, which nothing waits a second for. Four e2e tests driving `window.scrollTo` measured the camera parked at the wall, correctly.
3. **Bounding scroll, and driving the visual from the same ramp.** Clamping scroll alone still left the visual chasing a noisy target, because wheel deltas keep arriving and are applied after the frame's `scrollTo`. Playing the band back on the ramp's own clock makes traversal deterministic.

**Why it is not general scroll-jacking:** armed only inside one 0.075-wide band of one section; hard time limit, so it cannot trap a reader; backward scroll never clamped; no event cancelled or `preventDefault`-ed; and it requires **recent real scroll input** (`wheel`/`touchmove`/scroll keys within 400ms), so programmatic navigation — keyboard re-centering, skip links, anchors, restored scroll — is never latched.

Two defects found by measurement rather than by eye:
- **Motion's frameloop clock has a different origin from `performance.now()`**, so comparing a frame time against a DOM-listener time gave a negative difference that passed every `< window` test. The user-input gate was silently always true. The latch now takes `performance.now()` itself.
- **The latch measured the spacer every frame**, forcing a layout on every frame of every page view. On WebKit that delayed the camera filter enough that the break's dwell was no longer settled inside the e2e sweep's 120ms window, taking the rail-gap test from passing to a 537px gap. Geometry is now measured on mount and on resize only.

### 22.2 Collision visual refinement

- **Raked rails.** Eleven square-ended full-width bands closing from alternating sides is geometrically a shutter. Each leading edge is now raked (4.4% of frame width, ~63px against an ~82px band), so the composite closing edge is a run of interlocking diagonals aligned to the oblique world rather than a comb of rectangles. The signal hairline runs *along* the rake, as part of the fill — a border would have been clipped by the clip-path.
- **A boundary section inside the cover.** The dwell is now reliably on screen, so flat ink is no longer acceptable: the covered state carries the converging bundle seen from inside, plus a closed contact registration.

### 22.3 SYSTEMS — the peel front

V5, V6 and V6.1 all removed the coating through a scatter of nine radial zones. Two consequences were fatal and untunable:

1. **No shell primacy.** Zones were spread over the whole word from early on, so by mid-transition every letter had holes in it. The eye never established "this is a dark surface" before it began failing, so the exposed material read as a FILL the letters always had — a pattern.
2. **No direction.** Nine circles opening in different places is not a physical process. A coating comes off as a front, from an edge.

V6.2 replaces the scatter with **one directional front** that starts past the word's leading edge — the side the wall is on — and sweeps backwards. Ahead of it the coating is untouched ink; behind it the substrate is exposed. At 30% through the transition **70% of the word is still plainly a dark surface**.

Also: three larger peel strips instead of four chips, each hinged on the still-attached side and lifting exactly as the front crosses it; four fragments instead of five, released by the front at their own position; and the deepest layer is now **ink with light structure** rather than paper — a paper-filled letter on a paper page read as an outline and destroyed the shell.

Cheaper as well: one linear gradient plus three tears per masked layer, against nine radial gradients.

### 22.4 Lower world — plates

V6.1's four sections differed in width and mark weight, which made them measurably distinct but not spatially distinct. Each now stands on a **plate**: a leading edge whose length is the plane's own foreshortening, a corner registering it in the world, and an **uneven vertical interval before it** (6 / 22 / 34 / 14vh) — the regular rhythm was most of what made the sequence read as a timeline. Plate marks resolve on an `encountered` value peaking as the surface is centred: the lower world's own acquisition, on the signal it already had.

### 22.5 CTA and footer blast radius

V6.1's `min-h-[76vh]` finale applied to every page. On a short content page a CTA that tall reads as a page that ran out of content — the composition needs a journey behind it. It is now scoped with `body:has(section[aria-label="Spatial system tour"])` in globals.css: identical markup everywhere, one CTA in the document, and the tall treatment only where there is a journey to conclude.

### 22.6 Known open items

- **The collision timing contract is implemented but NOT reliably demonstrated.** See §22.7 for the measured spread. This is the top open item.
- The absurd-fling profile showed 0 fully-closed frames in one run and 109 in another; the environment renders at ~20fps, which makes frame-level numbers coarse.
- No frame-by-frame video inspection.
- Everything in §19.13 / §20.7 / §21.8 not addressed here remains open.

### 22.7 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

## 23. Spatial Portfolio V6.3 — collision as a world event, exit traverse, coating lip

Branch-only, not approved for main, not merged. Continues §22 (V6.2); nothing in §18–§22 is superseded except where stated here.

### 23.1 The collision is now an event IN the world, not an overlay ON it

Through V6.2 `cameraPosition` returned the wall coordinate **unchanged** for the whole impact window: the world's one genuinely stationary span. That is why three passes of tuning could not get the collision past "a small sense of spatial obstruction, then two black surfaces close" — there was no impact in the world model to strengthen, only decoration arranged around a frozen frame.

V6.3 replaces the dead stop with a **rebound** (`collisionRebound`, `lib/spatial/sceneRoute.ts`): a rectified damped oscillation along the approach axis,

```
s(u) = -| e^(-3.4·u) · sin(3π·u) | / peak
```

- `s(0) = 0` — the camera still reaches the boundary exactly, so it is a boundary and not a region;
- `s ≤ 0` everywhere — displacement is always **back** along the direction of travel. Written first as a plain damped sine, the second lobe carried the camera 2.7vw *through* the wall it had just hit; the absolute value is the physics of a rigid surface, not a trick, and a unit test asserts the camera never passes the boundary;
- zeros at u = 1/3, 2/3, 1 — **three contacts** of decreasing violence, which reads as a bounce rather than one shove;
- peak displacement is exactly `COLLISION_REBOUND` (15 screen units ≈ 115 × 58px at 1440×900), applied to the camera coordinate, so **every depth plane answers at its own parallax rate** and the world grammar moves with it. A wrapper shake cannot do that — it slides the finished image.

Around it: the approach constraint went from three converging rules at 34vw to **five spanning 52vw**, eased `tension^2.6` so the closing happens late rather than early; the wall itself resolves from a 0.22-opacity hairline to a 3.5px near-opaque edge as the camera arrives (it was previously too quiet to be the thing a journey ends against); a **contact registration** appears in the last third of the approach at the exact height the hit will occur, derived from `WALL_CONTACT`; and `ImpactShock` answers the hit with three structural arcs, four displaced coordinate rules, and one signal flare at the contact — the only use of the accent in the whole collision.

The wrapper animation keeps only what a wrapper is good for: a 1.5% scale compression, 0.55° of tilt, and a small residual jitter, over 0.42s.

### 23.2 The event plays at a fixed rate, and forward input is absorbed

V6.2 clamped scroll only when it ran *ahead* of a ramp while driving the visual along that ramp unconditionally. For any reader slower than the ramp those two rules disagree, and the snap back at release rewound the event mid-play — which is why the measured duration ranged from 50ms to 2.9s.

V6.3 makes the ramp drive **scroll itself, in both directions**, so the visual is just the ordinary filtered scroll position and there is nothing to reconcile at the end.

That alone was not enough, and the reason is worth recording: **`window.scrollTo` does not cancel Chromium's in-flight wheel animation.** Measured on a 900px × 14 burst, the position alternated every frame between the ramp and the fling target — 1513, 2430, 1547, 2456, 1563, 2472 — for 830ms, so half the collision's frames rendered a point 0.27 of progress past it. The guard reported holding for 2.6s and the time inside the impact window measured 17ms; both numbers were true.

So **forward** wheel input is cancelled while the event plays. Bounds that keep this from being general scroll-jacking: `deltaY > 0` only (scrolling back passes through and trips the abort); only while playing, hard-limited to `COLLISION_PLAYBACK_MS` (1300ms) by a check that runs first in the frame loop; and the non-passive listener is attached only within ~1.5 viewports of the collision and removed on the way out.

Absorbed momentum is **not** queued and replayed. Reconciling to the fling's intended destination would end the signature event with a multi-thousand-pixel jump — a worse artefact than the one it fixes — and "the wall took your momentum" is the correct reading of a collision.

A second, independent guarantee: `useImpactPulse` latches the hit as a **one-shot on a wall clock**, so the choreography plays in full even if the guard never arms.

### 23.3 SYSTEMS — shell primacy and the coating lip

Two changes, both structural rather than parametric.

**Shell primacy as a schedule.** The front moved linearly, so the substrate was 30% exposed 30% of the way through — the eye never established a solid dark surface before it began failing, and an exposure that was always partly there reads as a fill. The schedule is now `erosion^1.55`: the front does not touch the word until erosion 0.19, reaches 14.5% exposure at 0.50, and 50% at 1.0.

**The coating lip.** Every version through V6.2 removed the coating by revealing a *different colour through a mask* — a change of fill inside a letterform, which is what typography does, and precisely why it kept reading as patterned type. A coating has **thickness**, and what proves it was a layer is the cut edge: a lit face where it was severed and the shadow that edge casts onto the exposed substrate. Two bands riding on the front — ink at `[depth-6.4, depth-2.6]`, `--color-line` at `[depth-2.6, depth]`.

Also: the light `-32deg` counter-hatch is **removed** — a light diagonal grid across dark letterforms is a pattern whatever it depicts, and it was the largest single contributor to the complaint; the peel is now a **letter-shaped chip** (a masked copy of the word, displaced) rather than a polygon, because enlarging the polygon as §3 asked made it float clear of the letterforms as a black slab; lift is spread over 2.2× the chip width so a strip is always visibly coming away (measured at erosion 0.7, *both* V6.2-scheduled strips were invisible — one finished, one not started); debris is down to three pieces from four.

### 23.4 The exit traverse (route change)

The world used to end at `handoff` and the page dropped into ordinary scrolling one section later, so the transition from "inside a space" to "reading a page" happened in the gap between two DOM nodes. Two camera-only coordinates now follow `handoff`, in exactly the sense `COLLISION_WORLD` is camera-only:

| leg | world travel | mean screen bearing | arc length |
|---|---|---|---|
| `handoff → traverse` | 76vw × 110vh | 42.1° | 167.6 |
| `traverse → descent` | 18vw × 92vh | 72.6° | 97.5 |

At 1440×900 the diagonal moves the world more than a full viewport diagonally, and the leg that follows turns it toward vertical. It is a third of route two, not a bend. Travel legs are charged `TRAVEL_WEIGHT_RATIO` (0.85) of their length plus a smaller `TRAVEL_ALLOWANCE` (34), and the joins with no scene on them run at `TRAVEL_SPEED_RATIO` (1.15) rather than decelerating to reading speed at a coordinate with nothing on it — so the route **ends at speed** and hands over to the lower page still travelling.

The lower world's first section gains a **26vh approach interval** (V6.2: 6vh, its smallest; now its largest), with the spine running on alone through it, so the first surface is encountered at the end of a travel interval rather than being the next thing in the scroll.

### 23.5 Route length — a standing guard was overridden

`ROUTE_LENGTH_VH` 410 → **474**, and the 420vh ceiling in `tests/unit/spatial-route.test.ts` was raised to 500 (the e2e equivalent, 4.5 → 5.2 viewports). This is the one number in V6.3 that overrides an earlier owner decision rather than superseding a stale one.

The arithmetic: `SPLIT = AVAILABLE · W1 / (W1 + W2)`, so **any** addition to route two dilutes route one. With the traverse, route one's share falls from 0.532 to 0.460. At 418vh — inside the old cap — route one would get 192vh where V6.2 gave it 218vh: a 13% faster camera across HERO, Kıvılcım, DropSpot and the run at the wall, below even V5's 196vh. 474vh restores route one to 210vh (−3.7%) and pays for the traverse with page length instead.

The 420 cap came from V3, and the V3 measurements say what was actually wrong: 29 distinct camera positions across 900 frames, a median of 0.00 camera px per scroll px, 1276px of scroll moving the camera under 8px. The objection was **dead scroll**, not length, and V4 removed dead scroll structurally. If the owner still wants a hard 420, it is one constant and the cost is the 13% above.

### 23.6 Two latent defects found by V6.3, both pre-dating it

- **`averageCameraSpeed` was contaminated at the cut.** It excluded exactly `[COLLISION_PROGRESS, BREAK_CUT)`, but `cameraSpeed` is a *centred* difference, so a sample just outside still reads one position from inside — and at the cut the two positions are 670 units apart, i.e. a speed of 670,000. Whether the bad sample was taken at all depended on where the 0.002 grid fell relative to the cut: correct through V6.2 by luck, and the average jumped 1496 → 2914 the moment V6.3 moved the split. Not cosmetic — the "narrow speed band" unit test divides by it, and would have reported a 1.63× peak as 0.84×.
- **Two e2e tests searched hardcoded windows.** The rail-gap test swept `[0.55, 0.70]` for a cut now at 0.506 and reported a 1440px gap at a point where the rails are legitimately open; the slope test sampled route one to 0.50 (inside the impact) and route two to 0.99 (inside the traverse). Both now derive their windows from the route constants. The rail-gap test's own comment warned about exactly this staleness — one level down.

### 23.7 Measured collision timing (Chromium, 1440×900, production build)

Three runs × six wheel profiles, timed from the rendered rail transforms inside the page. `onScreen` is the fraction of collision frames with the sticky frame at least half inside the viewport.

| profile | break visible (ms) | inside impact window (ms) | on screen | threshold skipped |
|---|---|---|---|---|
| 30px | 333 / 467 / 417 | 733 / 750 / 667 | 1.00 | never |
| 90px | 383 / 400 / 417 | 767 / 750 / 733 | 1.00 | never |
| 400px | 383 / 450 / 400 | 733 / 767 / 733 | 1.00 | never |
| 900px | 467 / 450 / 467 | 717 / 700 / 717 | 1.00 | never |
| 1400px | 433 / 433 / 400 | 700 / 717 / 717 | 1.00 | never |
| 2000px | 483 / 400 / 400 | 483 / 450 / 400 | 1.00 | never |

Across all 18 measurements: break visible **333–483ms (1.45×)**, impact window **400–767ms (1.92×)**, against V6.2's 50ms–2.9s. Post-event scroll equals one wheel notch of the reader's own continuing input in every profile — nothing is queued or replayed.

### 23.8 Known open items

- **The 2000px profile spends 400–483ms in the impact window against ~700–767ms for every other profile**, consistently across runs. It is a real property, not noise: the residual in-flight animation from wheels dispatched *before* arming still fights the first frames. The event is never skipped and never off-screen, but it is measurably shorter at the extreme.
- **Touch is unverified.** Only `wheel` is absorbed. Touch momentum has the same fight with `scrollTo` and was not measured on a real device.
- **The route terminus frame is sparse** — two rails, a density field and a few registration crosses. Adding marks is what §6 forbids, so it is left as it is and flagged.
- **`spatial.spec.ts:713` (WebKit) is flaky at roughly 1 in 4**, failing on a 30s `locator.click` timeout; passing runs take 15–22s. Playwright's actionability wait runs against a continuously animated element, and V6.3's longer route lengthens the on-focus re-centering scroll, so the wait got closer to the limit. The link itself works.
- **A React key warning on the homepage predates V6.3** (dev-only; `SpatialExperience` is untouched by V6.3 and V6.2 changed only a padding class there). Not chased — out of scope.
- No V6.3 performance re-measurement. The erosion word now carries two extra masked-text layers for the peel chips, offset by removing the substrate's second grain layer; that is reasoning, not measurement.
- A dedicated **mobile spatial route** is deferred to a pass after V6.4. The route/camera
  architecture already supports a non-zero mobile x; two pre-existing tests assert it is zero
  and must be revisited rather than deleted when that pass lands. Scope, audit and file
  references are in `docs/PROGRESS.md` (2026-08-18 deferred-scope entry).
- Everything in §19.13 / §20.7 / §21.8 / §22.6 not addressed here remains open.

### 23.9 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

## 24. Spatial Portfolio V6.4 — the collision retired, SYSTEMS inspected, the diagonal given destinations

**Branch-only. `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

V6.4 removes two ideas the portfolio has been iterating on for four passes and replaces one
of them. Both removals are the owner's decision, and both are deletions rather than
reductions — a quietened wall is still a wall, and a gentler erosion is still damage.

### 24.1 The collision is retired; only the occlusion cut remains

Gone: the wall, the camera rebound, the impact window, the impact pulse, the wrapper recoil,
`ImpactShock`, the converging boundary rules, the contact registration, the two deregistering
brackets, and the directional field's approach compression. Roughly a third of `WorldGrammar`
and the whole of one component.

What survives is what the black geometry always looked like it was: an **occlusion cut**.

```
world visible → surfaces close → controlled full black → surfaces open → redirected route
```

The change that makes it read as an occlusion rather than an impact is in the route model,
not in the panels. Route one used to end at 1.35× the route average (building into a wall)
and route two began at 0.42× (arriving at a scene), so the two halves of the same instant
disagreed about the world's speed by more than 3×. **Both sides of the cut now run at
`TRAVEL_SPEED_RATIO`** — the camera is travelling at the same rate on the last visible frame
before the surfaces close and the first visible frame after they open. An occlusion is an
event in what can be *seen*, not an event in the world.

Concrete simplifications, all of them deletions:

| Before (V6.3) | After (V6.4) |
| --- | --- |
| `COLLISION_PROGRESS` and `BREAK_CUT`, 0.062 apart | one `BREAK_CUT` |
| `AVAILABLE = 1 − IMPACT_WINDOW` | `AVAILABLE = 1` |
| `cameraPosition` — three branches | two branches |
| two independent clocks (scroll guard + latched impact pulse) | one |
| `reboundShape`, `collisionRebound`, `approachUnit`, `isImpact`, `approachTension` | removed |

**Route length fell 474vh → 445vh at zero cost to pacing.** Every segment's progress width is
proportional to `AVAILABLE`, which was 0.938; the impact window was 6.2% of the page's scroll
during which the camera did not advance at all. 474 × 0.938 = 444.6, so 445vh reproduces the
identical world-units-per-scroll-pixel everywhere. Measured, route one gets 210.4vh against
V6.3's 210.2vh. The standing override of V3's rejected 420vh ceiling therefore halves, 12.9%
→ 6.0%, and the test ceiling comes down 500 → 460 — tighter after this pass than before it.

### 24.2 The fast-scroll protection is kept, and is the one thing that did not simplify

The brief asks for the V6.2/V6.3 timing protection to survive and for the mechanism around it
to be simplified "as much as reasonably possible". Honest answer: there was nothing left to
remove. Each part of `useSceneBreakEvent` exists because of a measured failure — arming on a
crossing (a fling crosses the band inside one frame), the forward-input absorber (`scrollTo`
does not cancel Chromium's in-flight compositor wheel animation), the hard time limit and the
one-gesture abort. What did simplify: it protects three phases instead of five, over a
narrower band, at 950ms instead of 1300ms, and the second clock is gone.

### 24.3 SYSTEMS — from erosion to inspection

Four passes built the same idea four ways: a coating that came **off** the word. The verdict
never moved, which is the signature of a model failure rather than a tuning failure. The
model failure: every version removed material from the letterforms, and a letterform with
material removed is damaged typography. There is no parameter that makes damage read as
insight.

`InspectionWord` inverts it. The word is never touched; what moves is an **inspection plane**
passing through the space the word stands in.

1. **PLANE** — the cutting-plane line, drawn *behind* the word at 216% of its height with
   section ticks at both ends. Because it is behind, the letters interrupt it: the plane
   passes *through* the word rather than over it.
2. **SURFACE** — the word in solid ink. Never masked, never faded, never moved.
3. **SECTION** — the word again, filled with the world's own structure, masked to a 15% band
   riding the plane and painted *over* the surface. Inside the band the letterform is still
   completely filled — with a drawing instead of with ink.

**Readability is structural, not a target.** The union of layers 2 and 3 covers exactly the
same pixels as layer 2 alone, so the glyph silhouette is identical at every inspection value.
An e2e test reads the surface layer's computed `mask-image`, `opacity` and `clip-path` back
out of the browser across the whole sweep and asserts it is never masked, faded or clipped.

The drawing inside the section is not authored: its diagonal is **the actual camera route**,
read from `routeLegs()` and normalised into the tile at module load, with route two dashed
exactly as the world's rails draw it.

Two things were fixed by measurement rather than reasoning, and both were direction errors:

- **The sweep runs left→right**, forced by the camera. The world slides left past the camera,
  so the word's left edge is the first part to enter the frame and the first part to leave
  it; a right-to-left sweep spends both ends of its travel over parts of the word nobody can
  see.
- **The window is fitted to measured framing, not to `tail`'s focal progress.** Reading the
  word's own bounding box back out of the live page, it is 100% inside the viewport between
  progress 0.375 and 0.4375. Fitting to the anchor instead was wrong by about a fifth of the
  sweep, because the camera leaves that anchor at travelling speed toward the cut.

### 24.4 The diagonal keeps its length and gains destinations

The V6.3 exit traverse is unchanged — 76vw × 110vh at 42°, then a turn to 73°. The owner's
reading is that the problem was never the distance but the absence of information along it,
and §4 rules out the obvious wrong fix (crosses, coordinates, POI marks, technical labels).

**The work-route junction (§4A).** A second route leaves the main one 9% into the traverse and
goes somewhere the camera does not, terminating at a node carrying JointLedger, Professional
Systems and Work index — loaded from the same content query the handoff paragraph uses, so
the branch and the sentence can never name different things. It is drawn as *a route that is
not taken*: finer dash than either main route, ink rather than route two's signal tone, and
it stops at a terminus mark instead of continuing off-frame. Its divergence is measured off
the main route's own bearing, so it cannot describe an angle the world does not have.

`BRANCH_DIVERGENCE` is −22°, tuned against the frame rather than for drama: −58° is a far more
emphatic fork and put the terminus 64vh above the camera, with the world inset only 14vh from
the top of the sticky frame — the entire destination off-screen. The divergence that reads is
cumulative (the main route steepens to 72° while the branch stays near horizontal, ~58° apart
by the terminus), and both bounds are asserted.

**Two foreshadowed destinations (§4B, §4C).** `DestinationSurface` stages Built for Real Life
and How I Build as surfaces the traverse passes, assembled entirely from the copy module the
real sections render from — same index, same heading, the section's own lines. `sectionIndex`
and `howIBuildHeading` were promoted into `data/copy.ts` so a preview's number cannot silently
disagree with the section it previews.

Depth does the foreshadowing: a fourth plane, `PLANE_DEEP = 0.44`, carries How I Build. At
less than half the world's rate it hangs in frame far longer and is still resolving while the
nearer surface has gone, so "not fully readable too early" is a property of where it is rather
than an opacity tuned to fake it.

The first build staged both at similar offsets and they arrived stacked on the right of the
frame, reading as a two-item contents list — the exact failure the progressive-reveal rule
exists to prevent. They are now a third of the traverse and 26vh apart. **V6.3's cropped-word
fragment was removed** rather than kept alongside: it announced the same destination less
truthfully and, measured at progress 0.945, sat directly across the How I Build plate.

Field Notes, About and the CTA are deliberately *not* foreshadowed.

**Accessibility.** Every destination surface and every branch label is `aria-hidden` and none
uses a heading element; the branch is not a link, because the handoff scene already carries
the only "See every system" link to `/work`. A screen-reader user meets each heading exactly
once.

### 24.5 Measured scene-break timing (Chromium, 1440×900, production build)

Six wheel profiles, timed from frame timestamps inside the page:

| profile | occlusion visible | full black | full black skipped? | on screen | post-event jump |
| --- | --- | --- | --- | --- | --- |
| slow 30px | 600ms | 250ms | no | 100% | 30px |
| normal 90px | 633ms | 283ms | no | 100% | 90px |
| fast 400px | 650ms | 267ms | no | 100% | 400px |
| burst 900px | 633ms | 283ms | no | 100% | 624px |
| fling 1400px | 617ms | 250ms | no | 100% | 1124px |
| extreme 2000px | 483ms | 250ms | no | 100% | 2015px |

The full-black dwell never collapses (250–283ms across a 67× range of input speed) and is
never skipped. **The post-event jump is never more than one wheel notch of the profile's own
delta** — it is the reader's next input resuming, not absorbed momentum being flushed.

### 24.6 Known open items

- **The extreme profile is still measurably shorter** (483ms vs 600–650ms). Same cause as
  V6.3: residual in-flight animation from wheels dispatched before arming. Never skipped,
  never off-screen, but not equal.
- **Touch is unverified.** Only `wheel` is absorbed; touch momentum was not measured on a
  real device.
- **The section drawing reads more as strata than as route geometry** at the crop scale. The
  route polyline is genuinely in there and is genuinely the real route, but at a 15% band
  across 180px letterforms the horizontal strata dominate. Honest weakness, not fixed.
- **The deep destination is low-contrast by design and close to too low.** At 0.66 opacity the
  How I Build plate is legible but faint; it is doing the "not readable too early" job and may
  be under-doing the "becomes legible" one.
- No V6.4 performance re-measurement. The word lost one masked-text layer and two peel chips
  and gained one; a fourth camera plane was added, desktop-only. Reasoning, not measurement.
- The **mobile spatial route** remains deferred to the pass after V6.4 (`docs/PROGRESS.md`,
  2026-08-18 deferred-scope entry). V6.4 added no new assumption that mobile x is zero; the
  work branch takes a `mobile` argument and derives correctly for a route with x travel, and
  is simply not rendered there yet.
- Everything in §19.13 / §20.7 / §21.8 / §22.6 / §23.8 not addressed here remains open.

### 24.7 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

---

## 25. Spatial Portfolio V6.5 — SYSTEMS re-founded, the empty end of the journey removed

**Branch:** `feature/spatial-portfolio-v5`, uncommitted, still **not for merge**.

V6.5 answers two verdicts from human review of V6.4. The scene break was accepted and is
untouched. Everything below is either the SYSTEMS word or the end of the route.

### 25.1 SYSTEMS: the fourth mechanism, and the first one that is not applied to the type

Four passes built variants of the same wrong idea (a coating removed from the letterforms:
V5, V6, V6.1/6.2, V6.3), and V6.4 built a fifth that was technically correct and still had no
idea in it. Reviewing V6.4's own captures says why, in numbers rather than taste:

- the exposed band was **15% of the word box** — narrower than two letters, so at any instant
  roughly a seventh of the word was "system";
- the fill was a **460px tile repeating inside a 1030px word**, and a repeat inside a single
  word reads as texture, not as structure;
- the sequence **returned the word to its exact starting state**, so it resolved to nothing
  having happened.

All three follow from the same decision: the effect was applied *to the typography*.

**V6.5 inverts figure and ground.** The word is a plain `<span>` of ink. It is never masked,
filled, clipped, faded, transformed or filtered, in any state, at any progress. What changes
is the space behind it: a **structural plane opens, left to right, and stays open**
(`components/spatial/SystemsWord.tsx`).

One mechanism, stated completely: *an aperture behind the word widens.* Two moving parts — the
aperture's `clip-path` and the ink cut line riding its edge — over one static drawing.

Why it reads as "the interface is only the surface":

- the plane is **behind** the word (`-z-10`), so the letters occlude it. Occlusion is the
  strongest depth cue available in a flat medium and it is the correct one here;
- the plane is **bled past the word on all four sides** (26% / 78% / 74% of the word box), so
  its left and right edges spend most of the sequence outside the frame. A plane the reader
  can see all of is an object; one that runs out of the composition is a layer. A first build
  at 13/62/58 had all four edges inside the viewport and read as a plate behind text;
- it **does not close**. The reader carries it into the occlusion cut.

Readability stopped being a constraint and became an absence. V6.4 had to *guarantee* it by
construction because it drew the word twice; V6.5 draws it once, so there is no mechanism by
which it could regress. The only thing that ever changes behind the glyphs is the ground:
`--color-paper` before the aperture, `--color-line` after it — 13.0:1 and 8.9:1 against
`--color-ink`.

The drawing inside is the **real camera route** from `routeLegs()` at module load, route two
dashed as the world's own rails draw it, plus four strata, two structural members with a node,
and exactly one signal stroke. Drawn once at panel size, not tiled.

**Edges stay hard.** A softened vertical fade was tried and rejected: it removes the box
reading but turns a section cut into a glow, and this world's whole vocabulary — rails,
registration ticks, cut faces — is hard-edged technical drawing.

### 25.2 The empty end of the journey

The owner's report was that the region after How I Build appears and before "Back on the
surface" is excessively empty. Measured on the built page — sampling every 120px, screenshot
downsampled to 180×112, counting non-paper pixels and frame-to-frame difference — that was
exact and worse than described:

> **one continuous run of 1560px (1.73 viewports) averaging 2.2% rendered ink.**

Its cause was structural and had nothing to do with the diagonal's length:

1. the last 165px of the route ran through empty world;
2. the sticky frame is one viewport tall, so after progress reaches 1.0 there are **900px
   during which the world's final frame scrolls away** — and that final frame contained
   nothing, because both destination surfaces had resolved and gone before the turn leg began
   (V6.4 expressed their windows as fractions of the *diagonal* leg only);
3. the 26vh approach interval before the first real section, added in V6.3 to compensate for a
   world that ended on empty travel.

Four structural fixes, in order of what they were worth:

- **the route now terminates on a composed frame.** The deep destination (How I Build) is
  framed at progress **1.0**, low in the frame (22vw / 54vh), with its plate edge running 44vh
  and its lines spread down it. Low rather than centred is the point: a plate centred at the
  terminus is off-screen a third of the way through the hand-over; one in the lower half is
  still on screen when "Back on the surface" arrives beneath it. Worth ~360px on its own.
- **the destination windows are fractions of the whole exit**, not of the diagonal. Depth does
  the work: on `PLANE_DEEP` (0.44) a surface moves only ~39vw × 70vh across the exit's
  88vw × 160vh of camera travel, so one object rises from the bottom edge at the start of the
  traverse and is still settling at the terminus. On `PLANE_DISTANT` (0.62) the same travel is
  a full viewport, which is why the near surface is *passed* and the deep one is *approached*.
  That difference is the §6 rhythm expressed as two numbers.
- **the turn leg was shortened**, and only the turn. `DESCENT_WORLD` {358,550} → {352,508}:
  97.5 → 55.0 screen units, bearing 72.6° → 69.0°. The leg exists to change direction and the
  bearing is preserved to within 1.5°; the distance was only ever the cost of it. The
  **diagonal is untouched** — 76vw × 110vh, 167.2 units, 42.1°.
- **travel weighting**, `TRAVEL_ALLOWANCE` 34 → 24 and `TRAVEL_WEIGHT_RATIO` 0.85 → 0.80. The
  allowance is reading time and there was nothing to read.

Plus two editorial intervals: `real-life` gapVh 26 → 8 (its premise — a world that ends on
empty travel — no longer holds), `field-notes` 34 → 20 (the second-largest dead run).

`ROUTE_LENGTH_VH` 445 → 430, again by arithmetic: cutting route two's weight raises route
one's *share* (SPLIT 0.4728 → 0.4898), so at 445 the fix would have quietly slowed the region
that was already right. 430 × 0.4898 = 210.6vh puts route one within a fifth of a viewport of
V6.4's 210.4.

### 25.3 Measured result

|                          | V6.4 | V6.5 | |
|---|---|---|---|
| longest dead run | 1560px | **600px** | −61.5% |
| total dead scroll | 3120px | **1920px** | −38.5% |
| dead share of document | 42.8% | **28.0%** | |
| document height | 7285px | 6862px | −423px |
| 10th-percentile frame ink | 0.0179 | 0.0257 | +43.6% |
| route one | 210.4vh | 210.6vh | unchanged by design |
| exit traverse | 67.0vh | 51.6vh | −23% |
| diagonal world length | 167.6 | 167.2 | preserved |
| camera speed band | 0.384–1.629× | 0.383–1.841× | |

### 25.4 What was deleted

`components/spatial/InspectionWord.tsx` (the V6.4 mechanism, entire), its `data-inspection-*`
contract, and the e2e band-width test that bounded its exposed section. The V6.4 readability
assertion **survives unchanged** and gained two properties (`transform`, `filter`): it is still
the guarantee that matters, and V6.5 satisfies it more simply.

### 25.5 Known weaknesses after V6.5

- **Mobile's exit traverse is still completely empty.** Both destination surfaces are
  desktop-only, so every measurement above is a desktop measurement and the structural fix for
  the dead scroll does not reach 375px at all. This is now the single largest known problem in
  the world. Not fixed here because mobile spatial staging is a deferred pass (§7 of the V6.5
  brief); it should be the first thing that pass addresses.
- **The camera's peak speed rose**, 1.63× → 1.84× of route average, because the traverse's
  scroll weight fell faster than its length. Inside the asserted 2.2× band and the trade was
  deliberate, but it is the direction that eventually reads as a lurch.
- **600px of thin frames remain** at the hand-over. Those frames are not empty — the How I
  Build plate and the surface line are both in them — but they are sparse, and the metric's
  4.5% ink threshold does not distinguish "sparse by design" from "nothing there". Judge
  `compare/deadspace-*` by eye rather than by the number.
- **The terminus frame's upper-middle is open.** Built for Real Life is cropped by the top
  edge and How I Build sits low; between them is a band of paper. Defensible as breathing room
  and as "you are arriving from above", but it is the weakest single frame of the traverse.
- **The plane's grey may still read as a highlight to some eyes** at the moment the aperture
  is between about 20% and 50% open, when both of its vertical edges are inside the frame.
- No V6.5 performance re-measurement. The word lost a masked `background-clip: text` layer and
  a repeating tile and gained one clipped panel; net simpler, but reasoned rather than
  measured.
- Everything in §19.13 / §20.7 / §21.8 / §22.6 / §23.8 / §24.6 not addressed here remains open.

### 25.6 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

---

## 26. Spatial Portfolio V6.6 — the surface cut, resolving destinations, a closed hand-over

**Branch:** `feature/spatial-portfolio-v5`, uncommitted, still **not for merge**.

Desktop polish pass after V6.5. Three jobs, no new subsystems. The occlusion cut, the
collision's absence, the diagonal route and the destination concept are all untouched.

### 26.1 SYSTEMS: from a panel to a cut in the page

V6.5 kept the important half — the word is never touched — and got the *behind* wrong.
It was an axis-aligned rectangle: a vertical edge sweeping between a horizontal top and
bottom, filled with `--color-line`, ruled with horizontal strata. Every edge in it was
parallel to the viewport and to nothing else on the page. **A four-sided axis-aligned
tonal panel behind type is a card**; that is not a grey that could be tuned, it is what
the shape means.

V6.6 replaces it with a **section cut in the page itself** (`SystemsWord.tsx`):

- **The opened region is a half-plane, not a shape.** It has exactly one constructed
  edge — the seam. Its other boundaries are the edges of the viewport. There is nothing
  to read as a card because there is no second edge to close one.
- **The seam runs at the camera route's own screen bearing** (~33°, from
  `routeScreenAngle` at module load, sampled across real travel and deliberately not
  across the discontinuity, where it reads a meaningless 159°). It is the plane the
  camera is travelling in; re-aim the route and it re-aims.
- **What is underneath is the site's own architecture**: three strata carrying the real
  `layerDefinitions` labels — SURFACE / FLOW / SYSTEM — with the real `routeLegs()`
  route descending through them. That is the framework UNDERNEATH and Built in Layers
  state in prose immediately afterwards, so the frame is their preparation.
- **The strata are horizontal and the seam is not**, so the strata are *cut by* the
  seam — they emerge from under its edge and stop against it. A panel's contents do not
  get sliced by its own boundary; that truncation is what makes this legible as a
  section rather than an object.
- **It does not close.** The reader carries it into the occlusion.

The word is drawn once, as a plain span. Its computed `opacity`, `mask-image`,
`clip-path`, `transform` and `filter` were read back at all twenty captured frames and
are `1, none, none, none, none` at every one; the e2e suite asserts the same five
properties across a progress sweep.

Nesting, each level load-bearing: `field` (coordinate space) → `seam` (rotated once,
statically) → `opened` (the half-plane, `overflow-clip`, **this is what translates**) →
`hold` (counter-translates so the structure stays still while the aperture grows) →
`layers` (counter-rotated, so strata are horizontal on screen). Without `hold` the
structure slides in with the edge and reads as a panel arriving — V6.5's exact mistake.

### 26.2 Destinations resolve by hierarchy, not by fading

V6.5 ramped one opacity across each plate, so at distance the frame held a complete,
correctly typeset section at 20% — a ghost of a finished thing. V6.6 reveals in the
order a real object resolves at: **registration edge and section number first** (at
near-full contrast — an edge seen at distance is crisp, not faint), **then the heading**,
**then the supporting copy**. Before the last stage the frame contains a legible object
that is simply not yet identified, which is what a destination at distance is.

The work branch gained the ~10–20% of authority the brief asked for and nothing more:
path 0.42→0.52, junction 0.50→0.62, terminus arms 8→10px at 0.50→0.66 plus the closed
inset corner, names from `text-ink-muted` to ink at 0.78. No card, no box, no link.

### 26.3 The hand-over

The route terminus → "Back on the surface" → first real section stretch was 600px of
measured dead scroll. Four changes, none of which touch route geometry or the diagonal:

- **"Back on the surface" became the regime change it claimed to be** — an ink rule at
  full width with the world's closed-corner register, where it had been a
  `--color-line` hairline and one muted label at the exact centre of the emptiest run.
- `real-life` approach interval 8vh → 5vh; the lower page's top padding `py-16` → `pt-8`.
- The destination plates' earlier, crisper resolution (26.2) puts real ink in exactly
  these frames.

**Result: 600px → 360px**, inside a 1022px window. Total dead scroll 1920px → 1680px
(28.0% → 24.9% of the document); 10th-percentile frame ink +36%; document 117px shorter.

The page-wide longest run *moved* to the Field Notes approach (480px) — a different
region, outside this job. Its `gapVh` was trimmed 20→14 as a judgement call, and it is
stated plainly that those frames are **sparse, not empty**.

### 26.4 What did not change

No route geometry. `ROUTE_LENGTH_VH` 430, `BREAK_CUT` 0.4898, `EXIT_FROM` 0.8801,
`EXIT_TURN` 0.9639, diagonal 167.2 units at 42.1°, turn 55.0 units at 69.0° — all
identical to V6.5. No collision, rebound, shock, recoil or impact code exists anywhere
in the tree. The occlusion's timing constants are untouched.

### 26.5 Performance — measured, and acted on

V6.3–V6.5 reasoned about performance without re-measuring. V6.6 measured, with three
instruments during an identical scripted scroll: in-page rAF frame intervals, CDP
Performance counters, and a `getBoundingClientRect` counter installed before page
scripts. **Forced synchronous layout during scroll: 0 calls.** Median frame interval:
**16.7ms in every condition and every run.**

The machine ran at load 4–12 and the *same build* measured 29.6–57.4 fps, so unpaired
before/after is noise. The honest instrument is a paired A/B toggling the V6.6 layers
within one page load, alternating order:

| load | rounds | median paired delta |
|---|---|---|
| ~10–12 | 6 | over32 **+22**, recalc **+259ms**, task **+2033ms** — positive in 6/6 |
| ~2–6 | 5 | p95 +0.1ms, over32 −3, recalc +13.7ms, task +111ms (~+5%) — mixed sign |

At rest the cost is inside the noise floor; under contention the extra layers amplify
degradation. Four simplifications were applied *because* of these measurements:

1. **The cut is `visibility: hidden` outside its own window.** The first build left a
   ~2400×1200 rotated layer in the paint tree for the whole route; bucketing frame gaps
   by scroll position put the jank at y1500–2499 — the occlusion and UNDERNEATH,
   nowhere near the word. Fixing it took frames over 50ms from 6 to 0 and max frame
   time from 83ms to 50ms.
2. **The destination plates are gated the same way** (`useTransform` clamps, so each
   plate sat at its floor opacity, mounted and composited, for the entire route).
3. **The cut's paint box shrank 34%** (10.6×5.2em → 9.8×3.7em) with no visual change.
4. **The section drawing went from 9 polylines to 2**, and 14 route samples to 8.

Opacity was never used for gating — an opacity-0 layer still paints.

### 26.6 Known weaknesses after V6.6

- **Mobile's exit traverse is still empty**, and mobile gets no surface cut. All of the
  above is desktop-only. This remains the largest known problem in the world and is
  still deferred.
- **The remaining 480px run is Field Notes**, and it is sparse-by-design rather than
  broken. It was not redesigned, per §3 of the brief.
- **The pre-existing travel-material blocks sit inside the opened region** during the
  SYSTEMS beat and read as unrelated rectangles behind the cut. They are older world
  material, not new, but the cut makes them more noticeable.
- **The strata labels are small** relative to the frame. Deliberate — the word must
  dominate — but they are close to the floor of legibility at 1440.
- **The perf delta could not be quantified precisely** on this machine. The direction
  is known and the obvious costs are removed; a quiet machine would settle it.
- **The 360px hand-over figure carries ±120px** of run-to-run variation, because the
  measurement samples on a 120px grid.

### 26.7 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

---

## 28. Spatial Portfolio V6.8 — final homepage art-direction and choreography pass

**Branch:** `feature/spatial-portfolio-v5`, uncommitted, still **not for merge**.

Six jobs from human review of V6.7, plus a ten-reviewer adversarial screenshot panel
whose findings drove a second fix pass. SYSTEMS, the black transition's state machine,
Kıvılcım/DropSpot content and the diagonal geometry were frozen and are untouched.

### 28.1 The opening glide (JOB 1)

Measured before: a normal 90px wheel run peaked at **6,881 px/s** of world movement in
the departure with 114px single-frame steps, and a 1400px fling crossed the **entire
opening in one frame** (>520px single step). The page's first move was its least
controlled.

`glideStep` (cameraFilter.ts) now governs d(progress)/dt while the camera is inside
the entry zone — `ENTRY_GLIDE_TO`, derived from the acquisition-descent segment's own
bounds — at `GLIDE_MAX_RATE` 0.09/s, releasing quadratically to ×8 across 1.5 further
zone-widths (a hard release edge was measured first: it relocated the lurch to the
zone boundary, 2,183px in one frame). Scroll position is never written — only the
visual's catch-up rate is bounded, in both directions, so this is filtering, not
scroll-jacking.

Measured after, all profiles including fling: **~20–33px/frame, 1.1–1.4k px/s peak in
the zone** — one-fifth of V6.7's normal-wheel peak, and no profile can teleport
through the departure. Six new unit tests pin the contract. Diagonal timing after the
release band is untouched; `BREAK_CUT` and every focus progress are unchanged.

### 28.2 Project field planes restored (JOB 2)

The V6.7 filler audit deleted all seven DENSITY rectangles; two of them had been
accidentally load-bearing — the second depth plane each project composition was read
against. `ProjectPlane.tsx` brings that back as what it actually was: **one field per
project scene, on the distant parallax plane**, placed by the same
`rate × cameraPosition(focus) + offset` derivation as every parallax mark, presence
driven by `sceneProximity` (registers on approach, whispers at 0.14 floor once
passed). Measured across Kıvılcım's window: the plate slides **323px against the
media** — enacted depth, not an offset screenshot trick. Kıvılcım's plane is anchored
to the identity column's own margin (x offset 0) with an 11vh top stagger; DropSpot's
sat upper-right at its own coordinates (superseded — see §29). Bare tonal fields; no
border, corner or label.

### 28.3 Filler deletions (JOB 3)

Deleted, with the viewer-perception test applied ruthlessly:
- **the drift lead rules** — tilted hairlines encoding drift direction nobody can
  decode; `driftLeadRule()` and its unit tests removed with the element;
- **the drift plates** — a second, unanchored copy of the register every section
  already carries via SystemNode; `DriftPlate` slimmed to the approach interval.

Quietened: dormant registration ticks 0.13 → 0.07 (orphan marks in empty travel),
destination state words now share their index's fade (no more bare "DETECTED"), the
deep destination's 44vh edge gained a closing foot.

### 28.4 Lower sections (JOBs re: §7–§10)

- **Built for Real Life**: dormant, not empty — one compact `DORMANT` ledger row on a
  single rule; curly quotes fixed in the statement serif.
- **How I Build**: titles at heading-l on a bounded ink spine (closing corner at the
  end); ticks anchored to the numerals themselves after review measured the
  box-anchored ones 38px adrift.
- **Field Notes**: copy no longer self-describes as a placeholder ("Writing currently
  lives externally:"); the AWAITING rows' successor is a **dashed fading index rule**
  — dashed being the world's registered grammar for "the route continues".
- **About**: identity resolves as behaviour — letterspacing narrows from dispersed to
  set as the section crosses the viewport (quantised; static under reduced motion);
  the lower page's one signal accent marks the human resolution; the introduction is
  plain body, not pull-quote dressing.

### 28.5 Back on the surface (JOB re: §11)

The regime change survives its label's removal: route two's exact grammar — a dashed
signal line — arrives from the page edge, terminates at an ink node, and continues as
a solid editorial rule. System route becomes page rule in one drawing; everything
below uses solid rules only.

### 28.6 The finale (JOB re: §12) — three visual iterations

The convergence is drawn from the journey's own geometry: four lines at the mean
bearings of route one, route two, the exit diagonal and the work branch (monotone
remap onto the panel; order and sign preserved — the branch is the one line arriving
from below). Iteration 2 fixed the collapsed fan and landed the drop on the headline;
iteration 3 gave each line **its own route's registered stroke** — solid ink, dashed
signal ×2, fine-dashed ink — so a reader can literally recognise which journey is
which, staggered the entry abscissae, replaced the aspect-distorted SVG circle with a
crisp HTML square (the world's terminus form), and ran the fan full-width. The finale
sits in a `min-h-[74vh]` optically-centred frame, biased upward.

### 28.7 Performance

p50 frame 16.7ms and **0 forced synchronous layout** in every run at every load; DOM
nodes 1127 → ~1115 (net deletion). The machine never offered a quiet window (load
5–13 throughout), so the honest instrument is the paired A/B toggling the V6.8 layers
within one page load: median delta **p95 +0.1ms**, frames>32ms +18 (mixed sign),
task +289ms — a small paint cost from the two field planes visible only under
contention, nothing at the percentiles.

### 28.8 Known weaknesses after V6.8

- The review panel returned WEAK (not PASS) on every axis — its remaining findings
  are logged in the review manifest; the ones judged real and cheap were fixed, the
  rest are recorded, not hidden.
- Mobile remains vertically constrained by design; the field planes, branch and
  destinations are desktop-only.
- The ghost travel-material words still read as "smeared letterforms" to a fresh eye
  at some crops (UNDERNEATH's upper right); reworking that language was out of scope.
- Absolute fps numbers for this pass are load-contaminated; the paired A/B and the
  invariants (p50, forced-layout 0) are the trustworthy signals.

### 28.9 Branch status

**Unchanged: `feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.**

## 29. DropSpot final visual remediation (post-V6.8 human review)

The V6.8 human review approved Kıvılcım and rejected DropSpot: "assembled, not
architected." Root causes, measured at 1440×900 against the approved Kıvılcım focus
frame: media at 96% + left overhang = 1133px of screenshot (79% of the viewport)
touching the left frame edge with its mass in the bottom-left quadrant; title
orphaned in the top-left corner 200px above it; the world plane framed as a band
*above* the media, which the media's arrival buried until it read as a pale strip
behind the summary — a rectangle behind content.

### 29.1 The recomposition

- **Evidence locked to the identity's spine.** The stacked layout's plate wrapper
  went `96% + overhang` → `76%, no overhang`: the 1400×637 screenshot is a wide,
  shallow surface — contained (897px, real paper margins on three sides), its left
  edge locked to the identity column's own left edge, so name and proof stand on one
  registration line. The §16 edge-breaking duty moved from a margin on the media to
  the world plane — a surface at a different depth crossing the composition.
- **The plane is the ground the evidence stands on.** `ProjectPlane` for `dropspot`
  went `{26,-6} 52×58` → `{17,29} 66×53`: at focus the media overhangs the plane's
  top and left edges (never frame-and-picture), the plane extends down-right — the
  camera's own travel direction — and its right edge lands exactly on the viewport
  bracket's vertical (17+8+66 = 91vw). The 0.62-rate lag walks it across the whole
  composition: arriving ahead of the evidence, separating from it on departure.

### 29.2 Iteration history (three, screenshot-verified)

1. Media 76% + plane as a neighbouring slab right of the media ({40,26} 44×56):
   focus/exit strong, but the plane read as a floating rectangle at exit and its
   under-strip began mid-air under the media.
2. Plane extended left into a ground ({8,26} 75×56): entry/mid/focus/exit all read
   spatial — but an adversarial 6-lens review panel found the plane's corner
   **intruding into the frozen Kıvılcım focus frame** (hard-edged pale rectangle at
   1320,784→1440,900), the plane's top edge coincident with the media's top border
   within 2px at the mid beat, and the media wholly contained by the plane at entry.
3. Final ({17,29} 66×53): all three findings closed by arithmetic — the plane's
   corner sits at 100.6vw in Kıvılcım's frame (off-frame; verified by pixel diff:
   the fresh Kıvılcım focus differs from the approved artifact by a single known
   dash-phase pixel), mid-beat top edges separated by ~25px, and the media crosses
   the plane's left edge from the entry beat on.

### 29.3 Known-open (pre-existing, out of scope here)

- The DROPS travel letterform still reads as cropped pale fragments at the DropSpot
  beats (flagged in V6.8 and again by this pass's panel; shared travel-material
  vocabulary, untouched).
- Two WebKit e2e tests (break-rail closure, SYSTEMS monotone opening) fail
  deterministically in a *low-load* machine regime — proven pre-existing by running
  the byte-verified pre-remediation tree, which fails with identical values
  (783.36 / 1440). Chromium passes 208/208 on the final build.

## 30. Final remediation pass (2026-08-21) — the owner's-display pass

The owner supplied two screen recordings of the live dev build (desktop + mobile
emulation) with a strict remediation brief. Scrubbing them frame-by-frame exposed
the systemic root cause behind most remaining complaints: **the owner's real
browser viewport is ~2552×1200 CSS at DPR 1**, and everything authored in raw
vw/vh against the px-capped scene measure (`min(84vw, 1180px)`) fell apart there
— the DropSpot plane inflated to 1.9× its media and drifted off every 1440-tuned
registration; the travel letterforms became 383px smeared slabs; the finale left
~290px of the previous section above the page's last frame.

### 30.1 Scene-unit geometry

`ProjectPlane` now takes offsets/size as **fractions of the scene measure**: the
camera term stays in plane-space vw/vh, the offset in the scene's px-capped
space, so plane:media registration is the same geometry at 1024, 1440 and 2552.
Kıvılcım's plane was converted with fractions chosen to render pixel-identically
at 1440 (verified: 0 pixels differ >2/255 against the approved artifact).
`TravelMaterial`'s distant words are clamped (`min(15vw,220px)` glyphs,
`min(52vw,780px)` × `min(17vh,165px)` clip) — identical below ~1466px, material-
scale above it.

### 30.2 DropSpot: the second shot

Every real DropSpot asset is ~2.1–2.3:1, so no crop or swap could buy vertical
presence honestly. The stacked scene now renders an **evidence pair**: the next
registered real screenshot (the drop-detail page) overlaps the primary browse
surface's lower-right quarter, right edge registered at the scene's 96% line,
group ~25% taller, both D-019 captions kept. The plane ({0.14, 0.20} 0.92×0.44
scene units) is the ground the pair stands on: primary overhangs its top/left,
the detail shot stands on it, one coherent reveal (right slab + lower-left
strip) at every width. Selection is data-driven (first real-screenshot ≠
representative); no slug special-casing.

### 30.3 Lower sections: two-axis registers

Every lower section had a dead right half at the owner's width. Recomposed from
existing content only: Built for Real Life pairs the statement with the system's
own record (STATUS/DORMANT, RESOLVED ENTRIES/00 — both real); How I Build's rows
become numeral | title | body across the full measure on the same bounded spine;
Field Notes pairs the archive with an INDEX register (Archive→Medium, Site
index→/notes) absorbing the two stray links; About finally implements what its
own comment claimed — introduction + the lower page's one signal accent in the
right column at the name's cap height.

### 30.4 The finale

min-h 74vh→82vh with rebalanced padding so the conclusion owns the final
viewport at 900 and 1200 alike; the convergence panel h-40→h-52 (~5:1) so the
four route bearings read as an event, not scratches; one true system register —
"END OF ROUTE" — between the drop and the headline. No glow, no chrome.

### 30.5 Known-open after this pass

- The React "unique key" DEV warning (visible in the owner's recording console)
  is pre-existing and reproduces with every authored list keyed; a seven-probe
  bisect narrowed it to the pre-mount render of a server-scene prop whose
  content arrives as an RSC lazy reference. Dev-only (React strips the warning
  in production); left documented, not fixed.
- At ~2552 CSS the world's scenes hug the left ~1400px (vw inset + px cap) — the
  route's asymmetric register, unchanged; a deliberate wide-viewport re-stage
  would be its own pass.
- Software Factory and the JointLedger/Professional Systems scenes remain
  unstaged (content-expansion pass; see PROGRESS).

## 31. FABLE GATE 1 — desktop final art direction (2026-08-31)

Executed by Opus 5 at the owner's direction (in place of a model switch); the decisions are
recorded as this pass's art direction. Full reasoning, measurements and prices in
`.ai/handoffs/OPUS-RETURN.md`; the gate brief itself is `.ai/handoffs/FABLE-GATE.md`.

**Q1 — DropSpot evidence height: option (a), and the second shot retired.** `Figure` gained an
opt-in `frameRatio`/`framePosition`; the stacked plate frames its screenshot at **1.703**,
`object-fit: cover`, window anchored left so the caption's claim ("browsing drops with waitlist
status visible") stays fully inside the kept region. Measured settled at focus: **886.7×520.7**
against the benchmark's 832.9×**520.6** — height matched to the pixel at the accepted width, at
1440×900 and 2552×1200 alike. Price accepted: 22.5% of the screenshot's width (the third card
runs off-frame as an ordinary editorial crop). The V6.8 second-shot pair — height compensation by
its own comment — was removed as double-counting once the real fix existed.

**Q2 — the plane is GROUND, with every edge on a real line.** Left = the description column's own
left edge (0.511); right = the scene block's right edge (exact, kept); top = tucked below the
media's top rule with a stagger legible at both gate viewports (~100px / ~40px — the old value
measured 7.8px at 2552, a near-flush bound); bottom = ground running ~56px below the media at
2552 and off the frame's lower edge at 1440. Kıvılcım's slab floats contained; DropSpot's
evidence stands on ground that continues beneath the camera. Two scenes, one grammar.

**Q3 — the lower sections got their ground.** Diagnosis: they were the only single-surface
compositions in the journey — flat in a site whose identity is depth. Each drift section now
stands in a **field**: one soft-paper surface, ProjectPlane's material and presence language
(plate section = the planes' exact 0.66), geometry derived from the section's own table —
horizontally its sweep envelope (the block visibly slides along its ground), vertically a
typographic seam just below the display line (16rem shared by the three sections whose display
baseline measures an identical 246px; 21.5rem for About's two-line name). The seam never crosses
text; register and heading overhang the ground; the body stands on it. Two rejected geometries
(nesting envelope, text-crossing near-edge bite) are documented in `driftField()`.

**Frozen areas held, proven:** Kıvılcım's 1440 focus frame diffs at 0 pixels >2/255 against the
pre-gate build (2552: byte-identical). SYSTEMS / black transition / UNDERNEATH / route / opening
glide untouched.

## 32. Spatial Portfolio V7 — the four-system world, one plane grammar, governed progression (2026-08-31)

Owner-directed systems + art-direction pass, executed by Opus 5 at the owner's direction. Branch-only, not approved for `main`. Decision record: D-021.

### 32.1 The four-scene evidence route

Route one now tours **Software Factory → Kıvılcım → JointLedger → DropSpot**, each a first-class scene with its own composition variant — `foundation` (the systemic layer: one identity line over the tallest single plate on the route, the verified delivery-loop diagram), `split` (Kıvılcım, unchanged in kind), `counter` (JointLedger: split mirrored, evidence leading from the left), `stacked` (DropSpot: identity row over the restored two-shot group). Anchors were re-spaced so consecutive 84vw scene blocks never share a focused frame (~176 screen units per leg); route one extends to (468, 330) and the cut keeps its exact tail-relative offset — **route two's entire choreography is byte-identical**, the longer reposition being crossed inside the occlusion where distance is invisible. Route length 640vh (~64vh per segment; V1 spent 200vh per scene).

### 32.2 One supporting-plane grammar

Every project plane runs the same three-beat choreography (`lib/spatial/planeChoreography.ts`): **enters slightly before its foreground** (displaced back along the route's local bearing, easing home), **registers exactly at focus** (every edge decision holds where the scene is read), **trails progressively on exit** (superlinear lag — the foreground leads, the ground follows). Kıvılcım's plane grew slightly (0.75×0.49 from its long-approved registration), DropSpot's reads wider and larger than Kıvılcım's under its restored evidence group, and the two new scenes register right-edge-exact with media breaking their left/top bounds. On mobile the same grammar runs on world-plane ground slabs — the first depth surface mobile has ever had.

### 32.3 Governed progression (owner §10)

Inside the spatial route, **wheel input is intent**: the governor prevents default, accumulates a target, and advances scroll at no more than `ROUTE_MAX_RATE` (0.155 progress/s, ≈6.5s minimum for the full journey) in either direction — paired with the same ceiling on the visual glide, which now holds route-wide instead of releasing to uncapped after the opening. Budget is paid per frame and never carried, so no single write can exceed one frame's travel: slower is always allowed, faster never. Escapes preserved: keyboard, scrollbar and programmatic scrolls pass at native speed and are adopted rather than fought; ctrl+wheel zoom passes; touch stays native; the occlusion event keeps sole ownership of its band; reduced motion sees none of it. Measured under 26-notch hard flings: ≤0.174 progress/s over any 80ms window, both directions, against the 0.155 design ceiling.

### 32.4 The departure zoom (owner §11)

The exit traverse now scales the **whole world** — one transform on the shared plane parent, 1 → 0.92 with the square of exit progress — so leaving reads as the composition receding, not as a section sliding by.

### 32.5 The lower page (owner §7–9)

**Selected Systems replaces the dormant "Built for real life" register** at IA 05: a loader-fed index of every published system (index, linked title, category, phase, fork provenance, stack) on the page's own bounded-spine register grammar, standing in its drift ground field. The near destination surface foreshadows it; How I Build keeps the method; nothing states the same thing twice. Chosen over an "Operational Model" section for exactly that reason.

### 32.6 Mobile (owner §12)

Deliberate upgrades, not a shrink: ground slabs behind all four scenes (the plane grammar on the world plane), scene arrival resolution enabled (scale + `--depth-resolve`), two metadata rows in the compact system frame, a compact-frame inset that no longer clips labels at 390px, and the opening glide boundary derived from the mobile route table instead of the desktop's. Touch scrolling stays native; the visual ceiling paces the camera.

### 32.7 Verification state

typecheck / lint / prettier clean · unit 500/500 · build 14/14 (15 routes incl. `/work/software-factory`) · Chromium e2e 208/208 · WebKit: see PROGRESS (parallelism-sensitive machine; single-worker run is the engine verdict) · console clean in both motion modes · overflow 0 at 1440 and 390 · governor and rail-closure geometry verified by direct settled measurement.

## 33. Spatial Portfolio V8 — the early duplicates removed, the world given a height axis (2026-09-01)

`feature/spatial-portfolio-v5` only. Not merged to `main`. Owner brief, two objectives.

### 33.1 The two early duplicates are gone

Through V7 the homepage stated **Selected Systems** and **How I Build** twice each. The first
statement of both was a `DestinationSurface` plate — index, heading, one to three lines — staged
on the exit traverse and seen from across the world minutes before the reader reached the real
section. They were built honestly (every word was loaded from the same copy module the sections
render from) and the owner's verdict was still decisive: the page previewed each section, almost
empty, shortly before delivering it in full.

Deleted, not restyled, renamed, compressed or hidden at one breakpoint:

- `components/spatial/DestinationSurface.tsx`
- the `nearDestination` / `deepDestination` props and both render sites
- `PLANE_DEEP` (0.44) — a depth plane added in V6.4 for exactly one of those plates
- `TRAVERSE_WORLD` — the 76vw × 110vh diagonal they were invented to fill

The **later, content-rich instances are now the single authoritative versions of both**, and both
were developed further (§33.6). `tests/e2e/spatial-v5.spec.ts` carries the standing contract, and
it tests component and route-stop **identity**, never heading-text counts.

### 33.2 No dead scroll left behind

Removing the previews left their leg carrying nothing. Measured, that leg was 167.2 screen units
and 46vh of the reader's scroll through empty world — precisely the dead scroll the brief forbids
leaving behind, and the V3 objection the route-length cap exists to protect against.

So the exit collapses from two legs to one. What survives is the job that was never about the
previews: the world must hand over **already moving in the lower page's direction** rather than
stopping and being replaced. `TURN_WORLD` does that alone.

| | V7 | V8 |
|---|---|---|
| Exit legs | 2 | 1 |
| Exit world travel | 222.1 units | 95.3 units |
| Exit scroll | 61.4vh | 30.6vh |
| Exit bearing | 42.1° then 69.0° | 59.5° |
| `ROUTE_LENGTH_VH` | 640 | 600 |
| Route one scroll | 378.6vh | 372.8vh |

The turn's length is **not** a taste decision: route two climbs and the exit descends, so a leg
shorter than ~85 units makes the camera's distance from the route's own start decrease mid-curve
— the spline loops, and the monotonicity contract in `tests/unit/spatial-route.test.ts` fails.
95.3 units is the shortest measured candidate that turns steeply, stays monotonic, and clears the
world's 8% frame-to-frame speed ceiling. `EXIT_ALLOWANCE` (38) exists for the same reason
`ENTRY_ALLOWANCE` does: a short travel leg paid at the bare travel rate has to change speed across
too little scroll, and measured a 9.0% step at the `handoff` join.

### 33.3 The world had no height axis — the measured root cause

The owner's report was that the site looks strong on the large work display and "excessively
large" on a 1918×864 laptop. Measured across the whole matrix on the built page, the cause is not
aspect ratio, not typography, and not any one component: **every input to a scene's size is
width-derived or absolute.** `SCENE_WIDTH` is `min(84vw, 1180px)`; every display size is a
`clamp(rem, vw, rem)`. Above ~1405px of width the block saturates at its px cap and the whole
composition becomes a fixed number of pixels tall — Software Factory measured **793px at 1440,
1536, 1600 and 1920, identical to the pixel**. The frame it must fit is `100vh`, and nothing in
the system knew.

| Viewport | SF frame share | Clipped below the fold |
|---|---|---|
| 2560×1440 | 0.719 | 0px |
| 1920×1080 | 0.734 | 0px |
| 1600×900 | 0.881 | 26px |
| 1440×900 | 0.881 | 11px |
| 1918×864 | 0.919 | **53px** |
| 1536×864 | 0.919 | **48px** |
| 1366×768 | **1.092** | **145px** |

The last rows are not a matter of taste — the flagship scene was taller than the viewport and
being cut off, with DropSpot losing 129px. **Every one of those viewports reported zero horizontal
overflow**, which is exactly why an overflow matrix never found it.

### 33.4 The fit — one number, applied once

`lib/spatial/worldFit.ts`. The whole world already hangs off one shared transformed parent (the
depth planes need one), so the missing axis is supplied there as a scale, and every plane, scene,
rule, plate and piece of typography stays as relational to every other as it was authored.

```
worldFit(w, h) = clamp(min(h / 1040, w / 1280), 0.74, 1)
```

- **Reference height 1040** is measured, not inherited: the frame height at which the
  composition's own 793–839px demand sits at the proportion the owner approved on the large
  display. Anchoring at 900 would have declared the already-tight 1440×900 rendering correct.
- **Width reference 1280 is deliberately below the design width.** The content already has a width
  response, so folding viewport width in at 1440 would count the same axis twice. At 1280 the
  width term is inert across the owner's whole matrix and binds only in a genuinely narrow window.
- **`min()` of two ratios is the aspect response** without naming aspect ratio: whichever axis the
  viewport is shorter in governs. A wide-but-short laptop is governed by its height and is not
  treated as a large desktop because its width is high.
- **It never scales up.** 1920×1080 and 2560×1440 are pixel-untouched — the approved look is
  preserved exactly.
- **Floor 0.74** so the world cannot scale itself into illegibility; it binds only below ~770px of
  viewport height.

Result: **zero clipped scenes across the entire matrix**, frame share 0.533–0.791 (was
0.533–1.092), horizontal overflow 0 and console errors 0 everywhere.

One complement, because the fit alone left 34px on the tallest composition at the shortest
viewport: the widest plate on the route drops from 76% to 66% of its block below 800px of viewport
height. A plate's height is its width over the asset's aspect ratio, so the only way to give
height back is to take width — and the rule is stated where the cause is, not as a second scale
factor on top of the world's.

### 33.5 The world's own unit — zoom-out reveals more world

A second, separate complaint: zooming out does not feel like the world shrinking into view, it
feels like only the active scene exists. That has a precise cause. Above the reference viewport
the world's **content** is already px-fixed, but its **geometry** was not — scene anchors were
placed in `vw`/`vh`, so the distance between two scenes grew exactly in step with the frame. Widen
the window and the neighbours retreat as fast as the room to see them arrives.

So the world gets its own unit, `--world-vw` / `--world-vh` = `min(1vw, 14.4px)` /
`min(1vh, 10.4px)`. Below the reference it is exactly the viewport unit and nothing changes; above
it the world holds its composed metrics and the extra viewport becomes more world. Pure CSS
`min()`, so it re-resolves on resize, on browser zoom and on a DPR change with no listener and no
hydration risk. It governs **position only** — shrinking compositions to reveal their neighbours
would be the miniaturisation the brief rules out. Everything placed in world coordinates consumes
it: the camera planes, the scene frames, the travel material, the world grammar, the project
planes, the system field and the directional fields.

Measured on one build, same page, world unit vs raw viewport unit — max scenes in frame:

| Viewport | viewport-unit world | world-unit |
|---|---|---|
| 1440×900 | 2 | 2 |
| 1920×1080 | 2 | 2 |
| 2560×1440 | 2 | 2 |
| 5120×2880 (deep zoom-out) | 2 | **8** |

Honest reading: the change delivers the asked-for behaviour decisively under real zoom-out, and
makes no measurable difference at the common desktop sizes, where the frame is not yet much larger
than the composed world.

### 33.6 The two authoritative sections, developed

**Selected Systems** was carrying three facts per system. The validated frontmatter already held
more, and the missing fields were the ones an index exists to answer. It now carries five for
every entry — **provenance** (a required field, shown for all systems rather than only for forks:
CLAUDE.md §11's distinction is the classification itself, not a footnote about forks), **phase**
(only where a real value exists, D-018), **access** (what the reader can actually open, derived
from each project's own declared link visibility), **record** (`verificationStatus`), and
**stack**. All loader-fed; no slug→copy table; nothing written per project; a system with no phase
simply has no phase row. Deliberately not a second project gallery: no imagery, no cards, one link
per row into the case study that already exists.

**How I Build** was reading as four isolated text rows. Both halves of the requested
principle → consequence relation already existed in approved copy — the title is the commitment,
the body is what it forces on the build — and what was missing was any mark saying the second
follows from the first. A rule leaving the title's column and one relation label now carry it.
**No copy was written**: no invented consequences, no evidence claims, no restated project text.

### 33.7 Scroll governor

Unchanged. `ROUTE_MAX_RATE`, `useRouteGovernor`, the glide ceiling and the break event's fixed
playback are all byte-identical to V7. The brief requires responsive geometry to be fixed first
and pacing reassessed against new evidence afterwards; that evidence is
`docs/review/v8-responsive/recordings/`.

### 33.8 Evidence

`docs/review/v8-responsive/` — open `index.html`. Comparison sheets for ten route stops across
five viewports, the before/after measurement tables above, the zoom and mobile matrices, and three
natural-scroll recordings driven with real wheel events at 1536×864, 1920×1080 and 390px.
