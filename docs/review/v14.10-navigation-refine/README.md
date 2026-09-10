# V14.10 navigation refinement — review package

Scope, by the owner's brief: centre the top navigator and keep it quiet; make free scrolling truly
free again; add subtle left/right edge arrows consistent with the keyboard; add a restrained
first-load cue. Nothing else moved. Decision D-056; `docs/DESIGN_SYSTEM.md` §48;
`docs/FROZEN_BOUNDARY.md` §6.10; handoff `.ai/handoffs/V14_10_NAVIGATION_REFINE_RETURN.md`.

Per `docs/REVIEW_POLICY.md` the numbers are in Git and the bulk is not: the stills are in
`C:\Users\hakan\portfolio-review\v14.10-navigation-refine\`.

```
metrics/before/scroll-contract-1536x864.json   the ceiling as it was
metrics/after/scroll-contract-1536x864.json    the ceiling as it is
metrics/mobile-route.json                      the mobile route probe at the recorded 2vh step
1440x900/, 1920x1080/                          the refined navigator, every scene and landmark
```

## 1 · Free scroll

The governor had owned the whole document since V10 (§G), so the ordinary page below the pinned
route scrolled on its budget. It now owns the camera route only. Measured at 1536×864 with
`tests/tools/scroll-contract-probe.mjs`:

| | before | after |
|---|---:|---:|
| **lower world, aggressive peak** | 1543 px/s | **8333 px/s** |
| **lower world, coast after input** | 471 px | **0 px** |
| lower world, gentle peak | 465 px/s | 448 px/s |
| route, aggressive peak | 516 px/s | 529 px/s |
| route, coast | 494 px | 494 px |
| reverse | 2 notches, 0 wrong-way px | 2 notches, 0 wrong-way px |
| geometry `routeTop` / `routeEnd` / `docMax` | 61 / 4381 / 8368 | identical |

So: below the route the page has no speed limit and no coast of ours at all — it is the browser's
own scrolling. The route above keeps the accepted governed model exactly, which is deliberate: its
pacing is the spatial experience, and the brief asks not to break the route logic. The fast way
through the route is the navigation layer.

## 2 · The navigator

`1440x900--kivilcim.png`, `1920x1080--about.png`. The rail is centred on the frame — readout above
(`02 KIVILCIM`, `08 ABOUT`), route below in the world's dotted-ahead / solid-behind grammar with one
tick per destination. No background, no border, no bar. Previous and next have left the rail, so
what remains is ticks and a name.

## 3 · The edge arrows

One chevron on each edge, vertically centred, 44px hit area, a quarter of ink at rest; it resolves
under pointer or keyboard focus and names its destination beside it. Built from two hairlines
meeting at a corner turned 45°, not a glyph. They step the same canonical station list as the ticks
and as ArrowLeft/ArrowRight.

## 4 · The first-load cue

Once per session, both arrows breathe twice and stop for good; it also ends the instant the reader
scrolls. Verified live in the browser: the control carries `nav-cue-breathe` at 2 iterations and the
chevron `nav-cue-drift-right`, with its `rotate: 45deg` intact — opacity and `translate` are
animated on two different elements so neither fights the rotation. No overlay, no text, nothing to
dismiss; absent under reduced motion, where the navigator does not render at all.

## Validation

typecheck 0 · lint 0 · format 0 · unit **589/589** · build ✓ · focused Chromium
(`navigation` **17**, plus `motion`, `spatial`, `spatial-v5`, `home`, `smoke`, `a11y`
**111 passed / 2 skipped**) — the two skipped are the V6.6 seam tests skipped since V14.5, and the
axe pass covers the refined navigator · first paint `FIRST PAINT == SETTLED` cold at 1440×900 and
1920×1080 · the mobile route probe shows no document height, scene position or DOM-rect difference
against the V14.9 record.

The full acceptance matrix and WebKit were not run, per the brief.
