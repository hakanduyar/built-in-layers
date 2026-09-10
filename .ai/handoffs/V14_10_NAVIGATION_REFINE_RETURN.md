# V14.10 navigation refinement — centred rail, edge arrows, a free page

**From:** Opus 5 · **Date:** 2026-09-10 · **Branch:** `feature/owner-visual-acceptance-v14` ·
**Base:** `0f8ad8a` (the V14.9 navigation checkpoint `b244a4d`) · **Checkpoint:** `60a6708`, pushed,
`local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Scope, and only that

Centre and quieten the top navigator; make free scrolling truly free again without breaking the
spatial route; add subtle left/right edge arrows consistent with the keyboard and the rail; add a
restrained once-per-session first-load cue; correct the navigator-layer weaknesses directly
connected to those. Nothing else reopened.

## 2. What changed (D-056, `docs/DESIGN_SYSTEM.md` §48, `docs/FROZEN_BOUNDARY.md` §6.10)

- **The governed region narrowed from the document to the route.** V10 (§G) had extended the
  governor to the whole page so there would be no hand-back seam at the route's end; the cost was a
  speed limit on the ordinary page below it. Below `bounds.pinnedEnd` the wheel is now handed back
  to the browser untouched. An upward gesture within one viewport of the boundary keeps the
  governor, so re-entering the route from below stays controlled.
- **The rail is centred** on the frame, carrying the readout and the ticks only — no background, no
  border, no bar.
- **Previous and next moved to the frame's edges**: one chevron per side, vertically centred, 44px
  hit area, a quarter of ink at rest, resolving under pointer or focus and naming its destination
  beside it. Built from two hairlines meeting at a corner turned 45°, not a glyph. They step the
  same canonical list as the ticks and ArrowLeft/ArrowRight.
- **A first-load cue**, once per session: both arrows breathe twice and stop for good, and the cue
  also ends the instant the reader scrolls. `sessionStorage` behind try/catch, read in a lazy state
  initialiser so nothing sets state from an effect.

## 3. Files

`components/spatial/SpatialCamera.tsx` (the wheel handler's hand-back),
`components/spatial/RouteNavigator.tsx` (centred rail, edge arrows, cue), `styles/globals.css` (the
cue keyframes), `tests/e2e/navigation.spec.ts` (contracts for the new layout and the cue),
`docs/review/v14.10-navigation-refine/`. Docs: D-056, `DESIGN_SYSTEM.md` §48,
`FROZEN_BOUNDARY.md` §6.10, this file.

## 4. Measured (`docs/review/v14.10-navigation-refine/metrics/`)

| 1536×864 | before | after |
|---|---:|---:|
| **lower world, aggressive peak** | 1543 px/s | **8333 px/s** |
| **lower world, coast after input** | 471 px | **0 px** |
| lower world, gentle peak | 465 px/s | 448 px/s |
| route, aggressive peak | 516 px/s | 529 px/s |
| route, coast | 494 px | 494 px |
| reverse | 2 notches, 0 wrong-way px | 2 notches, 0 wrong-way px |
| `routeTop` / `routeEnd` / `docMax` | 61 / 4381 / 8368 | identical |

Every module under `lib/spatial/` is byte-identical to `b244a4d` — `cameraFilter.ts`
(`ROUTE_MAX_RATE`, `INTENT_LEAD_VH`, `governorBudget`), `wheelMotion.ts`, `sceneRoute.ts`,
`scenes.ts`. `safety-v14-scroll-baseline` is not moved.

- First paint `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- Mobile: untouched by construction (the governor is `enhanced && isDesktop`, the navigator is `lg`
  and up); the route probe shows no document height, scene position or DOM-rect difference against
  the V14.9 record — nineteen readings move, all pixel-sampling means and one derived coverage
  ratio, by ≤0.005.
- typecheck 0 · lint 0 · format 0 · unit **589/589** · build ✓ · focused Chromium: `navigation`
  **17 passed**, and `motion`, `spatial`, `spatial-v5`, `home`, `smoke`, `a11y` **111 passed, 2
  skipped** (the V6.6 seam tests skipped since V14.5; the axe pass covers the refined navigator).

The full acceptance matrix and WebKit were not run, per the brief.

## 5. The one judgement call, stated plainly

**The route itself is still governed, on purpose.** Freeing the lower world removes the ceiling from
the ordinary page, but the camera route above it still moves at its accepted maximum (about 529 px/s
aggressive), so travelling the 5400px route by wheel alone still takes several seconds. That pacing
IS the spatial experience and is the accepted `safety-v14-scroll-baseline`; the brief also says not
to break the route logic. The fast path through the route is the navigation layer this gate
refines — a station click crosses it in about a second. If the owner wants the route's own ceiling
raised as well, that is a deliberate change to the accepted scroll model and belongs in its own
gate with its own before/after.

## 6. Remaining, for the owner

- The cue is once per browser session. A returning visitor in the same tab will not see it again;
  clearing session storage or a new tab brings it back.
- The edge arrows sit at `1.6vw`. If they should be further in or further out, that is one number.

NEXT: owner review. No further gate, no final QA, no merge.
