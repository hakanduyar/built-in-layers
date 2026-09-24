# V14.9 navigation gate — review package

Scope, by the owner's brief: a restrained top route navigator; previous/next controls that move
section to section through the existing spatial route; and ArrowLeft/ArrowRight navigation that
coexists with completely free scrolling. One shared section/scene source of truth. Nothing else
moved. Decision D-055; `docs/DESIGN_SYSTEM.md` §47; handoff
`.ai/handoffs/V14_9_NAVIGATION_RETURN.md`.

Per `docs/REVIEW_POLICY.md` the numbers are in Git and the bulk is not: the stills are in
`C:\Users\hakan\portfolio-review\v14.9-navigation\`.

```
1440x900/, 1920x1080/        every scene and lower-world landmark, with the navigator
metrics/route-navigation-1440x900.json    what the document does on each station click
metrics/route-navigation-1920x1080.json   the same at 1920
metrics/mobile-route.json                 the mobile route probe at the recorded 2vh step
```

## 1 · The navigator

Top left, at the lower rail's own `4vw` datum, in the band the camera's 14vh inset leaves empty. Two
lines: the current station's index and name, and under it the route drawn horizontally in the
world's own two states — dotted ahead, solid ink behind — with one tick per destination and the
terminus marks at either end as PREVIOUS and NEXT. See `1440x900--kivilcim.png` (reads `02 KIVILCIM`),
`1440x900--tail.png` (reads `SYSTEMS`, unnumbered, as route two's framework scenes are), and
`1920x1080--about.png` (reads `08 ABOUT`).

Fourteen stations: the nine real camera scenes, the four real drift sections, the finale. No station
is an animation state — the break, the dwell and the surface return are things that happen between
stations and are not addressable.

## 2 · What a click actually does

`metrics/route-navigation-1440x900.json`, from `tests/tools/route-navigation-probe.mjs`. Each run is
the document's scroll position frame by frame after a station is clicked.

| station | from → to | frames moving | settled after | arrived |
|---|---|---:|---:|---|
| JointLedger | 200 → 1929 | 41 | 757 ms | yes |
| Systems | 1929 → 3068 | 33 | 624 ms | yes |
| Underneath | 3068 → 3471 | 19 | 388 ms | yes |
| About | 3471 → 7916 | 66 | 1150 ms | yes |
| Get in touch | 7916 → 8604 | 26 | 494 ms | yes |

Five of five arrive; **zero teleports** — a jump would move the document once, and the shortest of
these moves it over nineteen frames. `About` crosses the cut and the whole lower world in one
controlled travel. Free scroll resumed immediately afterwards: 1359 → 1875 on six wheel notches.

## 3 · Coexistence

`tests/e2e/navigation.spec.ts`, 14 contracts: the navigator stays out of the first frame and arrives
once the reader moves; exactly one station is current and the readout names it; a click travels to
that station and across the cut; travel is progressive; previous/next step one station and stop at
both ends; ArrowRight/ArrowLeft move one station while ArrowDown is left to the browser; free
scrolling updates the active station; the reader can resume free scrolling — both directions —
immediately after navigating; nothing exists on a phone or under reduced motion.

## Validation

typecheck 0 · lint 0 · format 0 · unit **589/589** (17 new navigation contracts) · build ✓ ·
focused Chromium (`navigation`, `motion`, `spatial`, `spatial-v5`, `home`, `smoke`, `a11y`)
**125 passed, 2 skipped** — the two skipped are the V6.6 seam tests skipped since V14.5, and the
axe pass covers the navigator · first paint `FIRST PAINT == SETTLED` cold at 1440×900 and 1920×1080 ·
route geometry `tourStart` 61, spacer 5400, document 9504 at 1440×900, identical to the record ·
the mobile route probe identical to the V14.8 record on every geometry and layout measure.

The full acceptance matrix and WebKit were not run, per the brief.
