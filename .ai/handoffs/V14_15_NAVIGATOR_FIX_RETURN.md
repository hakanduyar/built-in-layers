# V14.15 navigator micro-fix — one destination preview at a time

**Orchestrated by:** Claude Opus 5 (orchestrator only; no product code written by the orchestrator) ·
**Implemented by:** Codex CLI 0.153.4, `codex exec --cd C:\GitHub\portfolio --approve-for-me` ·
**Date:** 2026-09-17 · **Branch:** `feature/owner-visual-acceptance-v14` · **Base:** `bd96cb9`
(application baseline `76897e2`) · **Checkpoint:** `6e4e702`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. The defect, and why the V14.14 contracts missed it

Each station tick showed its own preview from independent per-element CSS — `group-hover` and
`group-focus-visible` — so nothing prevented two from being visible at once. Reproduced at both
sizes: click the Field Notes tick, leave the pointer resting on it, press Tab. "07 FIELD NOTES" and
"08 ABOUT" both appeared, overlapping by **60.49 × 18 px**, and the labels became unreadable.

The V14.14 contracts tested hover and keyboard focus **separately**, which is precisely why this
slipped through. The new contract drives the real click/Tab sequence.

## 2. The fix

The navigator now owns which station is previewed rather than leaving it to per-element CSS. It
tracks the hovered and focused indices, **focus takes priority over hover**, and a single shared
`aria-hidden` element follows the selected tick — reusing one element means two labels can never
crossfade. Focus eligibility reads the browser's `:focus-visible` on entry, so a pointer click is not
mistaken for keyboard focus; blur restores hover selection; the last destination stays in place while
fading out.

## 3. Measured, by the orchestrator, on the checkpoint build

`tests/tools/v14-15-navigator-preview.mjs`, visible previews (computed opacity > 0):

| state | 1440×900 before → after | 1920×1080 before → after |
|---|---|---|
| at rest | 0 → 0 | 0 → 0 |
| hover alone | 1 (Field notes) → 1 (Field notes) | 1 → 1 |
| keyboard focus alone | 1 (About) → 1 (About) | 1 → 1 |
| **hover + focus on different ticks** | **2, overlapping 60.49 × 18 px → 1 (About)** | **2, overlapping → 1 (About)** |
| focus away, pointer still resting | 1 (Field notes) → 1 (Field notes) | 1 → 1 |

So all four required behaviours hold: hover alone shows the hovered destination, focus alone the
focused one, keyboard focus wins when they differ, and hover resumes on blur.

## 4. Preserved — verified on the checkpoint build

- **Motion frozen:** `git diff --name-only 76897e2 -- lib/spatial/ components/spatial/SpatialCamera.tsx`
  → **empty**.
- **Navigator geometry unchanged:** the rail measures 336 × 24 px at x=552 (1440) and x=792 (1920),
  identical before and after, with every one of the fourteen tick rectangles unmoved.
- **Accessible names singular and correct:** the About tick still reads `08, About`; every visible
  preview carries `aria-hidden="true"`.
- The clearance (size, mask, activation), the side arrows, ArrowLeft/ArrowRight, the once-per-session
  cue and its latch, the canonical station list, SYSTEMS, the POI grammar, all layout and content,
  the 1920 composition and mobile are untouched — the product diff is one component.
- typecheck 0 · lint 0 · format 0 · build ✓ · Chromium `navigation` + `a11y` **38 passed**, including
  two new V14.15 contracts (one per viewport).

Per the brief, the unit suite, mobile probes, motion probes, the full matrix and WebKit were not run.

## 5. One existing contract was updated, not weakened

The V14.14 hover contract asserted that a *per-tick* preview element was at opacity 0 at rest. That
element no longer exists — there is one shared preview — so the assertion now reads the shared
element at rest. Every destination and opacity assertion in that contract is intact.

## 6. Remaining, for the owner

- The faint clearance halo at the surface-return handoff (measured +5 per channel at 1920,
  scrollY 5418) was explicitly out of scope and is untouched.
- The independent review's third observation, reduced proportional density at 1920, remains open and
  that review judged it acceptable.
- The known untracked `tests/tools/v14-10-review-capture.mjs` is untouched and still untracked.

NEXT: owner review. No further gate. No final QA. No merge.
