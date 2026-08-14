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

## 18. EXPERIMENTAL — Spatial Portfolio V3 homepage prototype (branch-only, not approved for main)

**This section applies only to `feature/spatial-portfolio-v3`. It is not merged into `main`, does not amend §§1–17 above, and does not represent an approved design direction.** `main` remains governed by §§1–17 exactly as written. This entry exists so the branch is self-documenting for independent review against the sibling `feature/layered-editorial-prototype` experiment and against V1 (`feature/spatial-portfolio`) and V2 (`feature/spatial-portfolio-v2`), both preserved unchanged — see `docs/PROGRESS.md` for the dated log entries recording all four branches' relationship to `main`.

### 18.1 The three iterations

| | V1 — rejected | V2 — scene reset | V3 — route choreography |
|---|---|---|---|
| **Verdict** | "The camera travels across a huge empty world containing tiny webpage components." | "Dramatically better. The scene-first reset was correct — but still not the intended experience." | this pass |
| **Scenes** | none: world coordinates holding `ProjectCard`s | real scene layer; viewport-scale compositions | unchanged, extended to 7 scenes |
| **After the collision** | reposition, then nothing | reposition, then the camera parks and the page falls into ordinary vertical flow | **a second, genuinely different diagonal route** |
| **Travel space** | empty | empty (V2's own stated weakness) | sparse orientation grammar derived from the route |
| **Break** | a mathematically correct teleport | one solid ink panel sweeping across — "the most conventional device in the prototype" | converging rails; the solid field is one element, not the idea |
| **Atmosphere** | continuous canvas embers | erosion wind on one transition, hand-picked direction | same treatment, direction **derived from the route**, fewer fragments |
| **Hero** | small object in a large space | correctly scaled but deliberately generic | two offset regions joined by a rule running at the first leg's own angle |
| **Route length** | 600vh | 360vh | 420vh — the extra 60vh is spent entirely after the break |

### 18.2 The world has two routes

This is V3's whole subject. The owner's V2 review named one requirement above the rest: **after the collision the route must not drop into a straight-down / normal vertical flow.**

- **Route one — the evidence region.** `hero → kivilcim → dropspot → tail → wall`. Descends left-to-right. Leg angles deliberately vary rather than repeating one zig-zag.
- **The break.** The camera accelerates into the wall, stops dead, and jumps discontinuously behind a full cover.
- **Route two — the thinking region.** `reorient → approach → handoff`. Starts at the world's lowest and left-most point and **climbs back up and to the right.** Every route-two slope is negative where every route-one slope is positive, and no two legs anywhere in the world share an angle.

The direction change carries meaning, not just geometry: route one is what was actually built and can actually be shown; the collision is the end of that evidence; route two is how the work is thought about. That is why the reposition lands at the depth the approved primary line already calls *"underneath"*, and why the first thing standing there is the site's own Surface / Flow / System framework.

Binding, and unit-tested: **both axes must move on both routes.** A leg with no horizontal component is exactly the failure this iteration exists to prevent, so `deltaX != 0 && deltaY != 0` is asserted for the post-collision route in both the unit suite and the browser suite.

### 18.3 Disclosed departures from §13's binding motion rules

§13 forbids "scroll-linked (scrub) animation." This prototype's entire premise — real scroll position mapped to a camera's world position via a pinned/sticky container (Motion's `useScroll`/`useTransform`) — is exactly that pattern. This is a **deliberate, disclosed experimental hypothesis under test, not an oversight or a silent rule change.** It is isolated to this branch, never merged, and exists to be compared against the approved, §13-compliant direction.

The erosion atmosphere (18.6) is a second, narrower disclosed departure: §13 forbids "looping/idle animations." It is scoped to one transition and fully disabled under reduced motion. The expressive word's `scaleX` compression during the approach is a third: it is a deformation of decorative typography only, never of functional text, and never a growth (§13's `scale > 1.03` bound is not approached).

Everything else follows the approved system and this codebase's existing conventions: semantic HTML, one `h1`, correct heading order (axe-verified), keyboard operability, approved tokens only, real loader-fed project content, and `Figure`'s D-019 asset-honesty rules including TASK-008's explicit-intrinsic-dimensions CLS fix. No rotation, no spring/overshoot, no parallax, no WebGL, no new dependency.

### 18.4 Scene and camera rules (additive, this branch only)

- **A scene owns the viewport.** Scene blocks are `min(84vw, 1180px)` wide (`92vw` on mobile) with a `72vh` minimum, framed by a camera inset. At 1440×900 a focal scene occupies ~82% of viewport width and its evidence plate ~53–59%.
- **Dwell is tuned per scene, never set to one convenient constant.** DropSpot holds longest because a real product screenshot is the strongest evidence on the route; the tail is a deliberately brief beat before the wall. Asserted as a property (dwells differ; DropSpot's is the longest) rather than as fixed numbers.
- **The first leg is gentler than the rest.** Hero → Kıvılcım uses smootherstep, so the hero stays readable well into the movement and is *discovered* to be part of a world rather than snatched out of frame. Unit-tested as "under 15% of the leg covered in its first quarter."
- **Two compositions, not one template.** `split` (text beside plate, Kıvılcım) and `stacked` (dominant plate leading, DropSpot).
- **Evidence selection is data-derived.** The lead asset is chosen from the asset's own registered metadata (real screenshot > system-layer diagram > first registered), never a hard-coded filename or slug→asset map.
- **Titles are not CSS-uppercased.** `text-transform: uppercase` turns "Kıvılcım" into "KIVILCIM", destroying the dotless-ı orthography D-017 fixes as the primary display name. This applies to every line that interpolates a project title, including the handoff copy.
- **Mobile is the same world with different choreography.** Purely vertical on both routes — a large post-collision diagonal at 375px costs readability and buys nothing. The break and its reposition still happen, and are still discontinuous.
- **No `<li>` may exist in the spatial world.** That is the structural contract keeping V1's rejected `ProjectCard` nodes out; it is why the layer teaser is a `<dl>`, which is also the semantically correct element for term/definition pairs.

### 18.5 World grammar — the sparse orientation system

V2's honest weakness was that the travel space was empty. V3 fills it with orientation, not decoration, from four kinds of mark and nothing else:

1. **Leg rails** — drawn from the route's own leg list, so a rail can never describe a path the camera does not take. Route two is dashed and signal-coloured, so "you are on a different route now" is legible without a label.
2. **Route residue** — a rail brightens once the camera has travelled it. The path behind you is more present than the path ahead.
3. **Registration ticks** — one corner tick per scene anchor, offset outside the scene block so it reads as a world coordinate rather than scene content.
4. **The wall boundary** — a rule running off both edges of the frame, with three coordinate rules that **converge** on it as approach tension rises, stopping just short of collapsing into one line. This is the collision's own grammar: the coordinate system visibly tightens before the camera is stopped by it.

No grid, no particles, no technical confetti, no permanent progress label. Everything in this layer is `aria-hidden` and states nothing that is not already in real semantic text.

**The depth rail** is the same vocabulary used compositionally: at the reposition, a rail descends from above the frame, registered by the three layer names, with the giant `UNDERNEATH` standing at its foot. The word therefore labels a coordinate in the world instead of floating as isolated typography.

### 18.6 The scene break — converging rails

The route's discontinuity is bridged by seven horizontal rails that close on the frame **from alternating sides**, each on a different arrival curve, so the coordinate system reads as snapping shut rather than being swiped over. A linear solid field sits behind them and is therefore always the last thing to close — its only job is to guarantee the frame is genuinely opaque at the instant the route jumps. Unit-tested: every rail's offset is exactly zero at the cut, so no gap can expose the jump; rails close from both directions; adjacent rails never share an arrival rate; every rail is ahead of the solid field.

Impact impulse is unchanged from V2: a single ≤7px shake at 140ms, no spring, no elastic settle, no flash. **Collision != bounce** remains binding — the camera never eases past the wall and never reverses off it.

### 18.7 Atmosphere — erosion wind (the single prototype)

- Acts on **expressive typography only** — the giant transition word's trailing edge sheds fragments. Body text, project content, and every functional label are untouched.
- **The wind direction is derived, not chosen.** It is the exact opposite of the camera's screen-space travel on the collision-approach leg, so fragments trail the word along the vector the camera is dragging it against. Unit-tested as "opposes the camera's screen travel."
- 13 fragments across 3 depth layers (down from V2's 17 — fewer and more deliberate), sized in `em` so they scale with the letterforms.
- Real **start → peak → decay** tied to exactly one transition, and absent everywhere else in the journey.
- Plain DOM transforms driven by MotionValues — **no canvas, no particle system, no WebGL, no dependency.**
- Renders as a static word under reduced motion and before hydration.

### 18.8 Typography split

- **Functional (always stable, never rotated, never fragmented, never compressed):** project titles, descriptions, tech lists, captions, CTA, nav, layer definitions, evidence markers.
- **Expressive (may respond to camera progress):** the hero display name, the eroding/compressing transition word, and the orientation word. Both giant words are `aria-hidden` decorative duplicates of copy already present in real semantic text on the same page. Two expressive words for the whole journey, per §19 of the brief.
- One scene-scoped clamp override exists (hero display name, `clamp(3rem,10vw,9rem)`), because the shared `display-xl` token caps at 6.5rem. Kept component-scoped and **not** promoted into the token system, which governs `main`.
- Giant single words use viewport-driven clamp floors, not rem floors: an unbreakable word cannot wrap and overflows narrow viewports otherwise.

### 18.9 Reduced-motion and no-JS fallback

Both fully disable the camera, the world grammar, the break, and the atmosphere rather than softening them: the same real, **fully composed** scenes render in plain linear document flow. Deliberately not a stripped-down dump — each scene keeps its own composition, including the layer teaser and the positioning statement, so this reads as a designed linear page. Mirrors the codebase's existing progressive-enhancement pattern (`LayerExplorer`, `MobileNav`).

### 18.10 Known remaining weaknesses (deliberately not resolved this pass)

- Only 2 of 4 D-016 projects are staged as scenes; JointLedger and Professional Systems are reached through the real Work index — an explicit vertical-slice boundary, not an oversight.
- Route two's three beats are each shorter than route one's, and the handoff beat in particular is close to the minimum that still reads as a scene.
- The world grammar is derived and sparse, but it is still made only of hairlines. Whether the travel space now has enough *material* — as opposed to enough *information* — is the most open art-direction question in V3.
- Scene compositions sit vertically centred in their blocks, which leaves the upper third of the two route-two scenes carrying only an incoming rail.
- `VW_PER_VH` is a single nominal aspect ratio (1440×900). Directions stay correct across the common desktop range but the hero rule and the wind are exactly aligned to the route only near that aspect.
