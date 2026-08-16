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

**Verification status of this section is deliberately mixed and is stated per claim.** At the time of writing, V5 has passed static gates (typecheck, lint, unit tests, production build) but has **not** completed browser validation — no E2E run, no visual QA, no performance measurement. Claims below are marked accordingly. Nothing here may be read as a measured result unless it says so.

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

**Open risk, stated plainly:** the drift is expressed as Motion interpolation between two CSS `calc()` strings. This typechecks, lints and builds, but static analysis cannot prove a browser interpolates it smoothly. If it does not, blocks will snap between endpoints and **no current gate would catch it**. Browser proof is required before this section can be called verified; if interpolation proves unreliable, the fix is numeric MotionValues composed into the transform rather than string interpolation.

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

- Browser validation has not been run: no E2E, no visual QA, no performance measurement, no axe pass on the V5 surfaces.
- Editorial Drift's `calc()` interpolation is unproven at runtime (§19.9).
- The reduced-motion contract change in §19.10 is approved and documented but not yet covered by an E2E assertion.
- Only 2 of 4 D-016 projects are staged as scenes — an explicit vertical-slice boundary inherited from V4.
- `VW_PER_VH` remains a single nominal aspect ratio (inherited from V4).
- **Dangling brief references.** The V5 source files carry many bare `§NN` citations (`§5`, `§7`, `§11`, `§22-24`, `§26-31`, `§32`, `§37`, `§44`, …). These refer to the original V5 implementation brief, which was never committed to this repository and exists only in the authoring session. Each file's *top-level* pointer has been corrected to `docs/DESIGN_SYSTEM.md §19`, but the inner numbers are not resolvable against any document here. They were deliberately left in place rather than renumbered, because inventing a mapping would risk mislabelling the reasoning they annotate. Either commit the original brief or renumber them against §19 in a dedicated pass.

### 19.14 Branch status

**`feature/spatial-portfolio-v5` is EXPERIMENTAL and must NOT be merged.** It exists for independent comparison against V1–V4 and `feature/layered-editorial-prototype`. `main` is unchanged.
