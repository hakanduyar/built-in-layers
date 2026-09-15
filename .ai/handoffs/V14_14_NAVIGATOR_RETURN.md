# V14.14 navigator refinement — the instrument's clearance and its destination preview

**From:** Claude Opus 5 (single writer) · **Date:** 2026-09-16 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `d85bde4` (application baseline `5ccbf5c`) ·
**Checkpoint:** `76897e2`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.
Both goals come from the independent V14.13 review's two MINOR findings.

## 1. The collision

Through the route the camera's own 14vh inset leaves the band the navigator reads in empty, so
nothing collides — which is why this only ever appeared in the lower world. Below the pinned route
the page is an ordinary document and its lines pass straight under the instrument: measured at
1920×1080, the Field Notes landing put the readout and the rail directly on top of How I Build's
last line, glyph over glyph. Difference compositing keeps the marks dark but cannot separate two sets
of letterforms occupying the same pixels.

The instrument now **clears the ground it needs to read, and only there**. Deliberately not a bar:
no full-bleed edge, no rule, no border, no shadow — a field of the page's own paper, sized to the
cluster (768×128 px, centred) and masked away at its rim, so it has no edge to read as chrome. It
exists only at and below the pin, where the ground is always paper, so it can never appear over the
black transition; and it sits OUTSIDE `.route-navigator`, because that layer composites with
difference and a clearance inside it would invert itself.

`tests/tools/v14-14-navigator-check.mjs` measures every piece of page text reaching the band the
readout and rail occupy, and whether the clearance covers the part that does:

| | before | after |
|---|---|---|
| 1440×900, Field Notes landing | 1 intersecting, **1 uncovered** | 1 intersecting, **0 uncovered** |
| 1920×1080, Field Notes landing | 1 intersecting, **1 uncovered** | 1 intersecting, **0 uncovered** |
| Both sizes, About passage | 0 intersecting | 0 intersecting |

**No lower-world content was moved or redesigned.**

## 2. The destination preview

Each tick names its destination under the pointer or on keyboard focus, and nowhere else — the same
answer the edge chevrons already gave. It uses the canonical station name from
`lib/spatial/routeNavigation.ts`, is absolutely positioned so revealing it cannot move the rail by a
pixel, and is `aria-hidden` so the tick keeps exactly one accessible name (verified: `08, About`).
The rail gains no permanent labels.

## 3. Two defects found while verifying, both fixed

- The preview inherited a raw ink colour instead of the navigator's remapped token, so under the
  layer's difference compositing it rendered faint rather than dark. Bound to `text-ink`, as the
  readout already was.
- V14.11's `[data-nav-state="ahead"] > span[aria-hidden] { opacity: 0.35 }` was written when the tick
  mark was the only `aria-hidden` child of a station button. The new preview is also one, so the rule
  was **forcing it visible on every station still ahead of the reader** — caught in a screenshot, not
  by a test. The mark is now named `data-nav-mark` and the selector targets it.

## 4. Files

Product: `components/spatial/RouteNavigator.tsx`, `styles/globals.css` (six lines).
Tests: `tests/e2e/navigation.spec.ts` — four new V14.14 contracts (the clearance exists only where
the page's content runs under the instrument; no lower-world text collides with its marks; the
preview appears under the pointer and on keyboard focus; the accessible name is undisturbed).
Tools: new `tests/tools/v14-14-navigator-check.mjs`.
Docs: `DECISIONS.md` D-060, `docs/review/v14.14-navigator/`, this file.

## 5. Preserved — verified on the checkpoint build

- **MOTION IS FROZEN AND UNTOUCHED:** `git diff --name-only 5ccbf5c -- lib/spatial/
  components/spatial/SpatialCamera.tsx` → **empty**. Free-scroll behaviour, the camera response, the
  demand-responsive ceiling and the navigation handoff are byte-identical.
- Navigator station logic, the canonical list, the side arrows, ArrowLeft/ArrowRight, the cue latch
  and the black-transition legibility are unchanged — 21 navigation contracts pass, including the
  four new ones.
- typecheck 0 · lint 0 · format 0 · unit **595/595** · build ✓ · focused Chromium (`navigation`,
  `a11y`, `spatial`, `spatial-v5`, `motion`, `home`, `smoke`) **128 passed, 2 skipped** — the two
  skipped are the V6.6 seam tests skipped since V14.5, and the axe pass covers the refined navigator.
- First paint `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- Mobile: **zero layout differences** against the V14.13 record; the navigator is `lg` and up and the
  new CSS sits inside the existing desktop media query.

The full acceptance matrix and WebKit were not run, per the brief.

## 6. Remaining, for the owner

- The clearance hides the sliver of passing text directly behind the instrument. That is the trade
  for an unobstructed reading area without a bar: a soft paper field occludes a line or two as it
  scrolls past, rather than two sets of glyphs sharing pixels. Worth a look in motion.
- The third finding from the V14.13 review — reduced proportional density at 1920 — was out of scope
  here and is untouched.
- The known untracked `tests/tools/v14-10-review-capture.mjs` is still untouched and untracked.

NEXT: owner review. No further gate. No final QA. No merge.
