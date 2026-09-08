# V14.6 — Codex engineering gate 1: motion

Delegated to the Codex CLI (0.153.4, `codex exec`) under the owner's Engineering Gate 1 brief, on
the V14.5 application baseline `b8ff8b8`. Codex was the single writer for the application changes;
it exhausted its usage limit after producing the measurements and the code, before writing this
report. **This file was compiled by the orchestrator from the metrics Codex left under
`metrics/`** — every number below is read from those files, and the commands that produced them are
named. Nothing here is estimated.

Scope, by the brief: scroll blur, wheel motion, first load. Preserved and verified untouched: the
V14.5 SYSTEMS experience, the interlocking black transition, the Person of Interest language,
Selected Systems, the reveal and fade timings, the lower-world spacing, the ABOUT layout, the
no-orange rule, and the mobile art direction.

---

## 1 · Scroll blur

**Measured first** — `tests/tools/foreground-sharpness-probe.mjs` at 1440×900, on the flagship
scene's title, cropped at rest and while the camera translates (`metrics/before-foreground-*.json`):

| | rest mean gradient | moving mean gradient | acutance retained while moving |
|---|---|---|---|
| travel, before | 14.155 | 15.184 | **1.0727** |
| travel, after | 14.155 | 15.148 | **1.0702** |
| at focus, before | 16.738 | 16.856 | 1.0070 |
| at focus, after | 16.738 | 17.130 | 1.0234 |

**Finding, stated honestly: there is no per-frame rasterisation blur to remove.** Acutance retained
while moving is *above* 1.0 in every run — the moving crop measures marginally sharper than the
same text at rest, not softer — and the controlled phase sweep
(`metrics/before-foreground-phase.json`, which walks the device-pixel offset) reproduces the same
1.0699 with no offset-dependent loss. The device-pixel offsets recorded at capture (0.207 / 0.414
at rest, 0.022–0.492 while moving) do not correlate with the gradient.

What Codex did find and fix is a **change of text rendering at hydration**, which is a different
mechanism with the same subjective symptom. Before this gate the pre-hydration tree painted the
hero at `zoom: 1` and at a different position, then hydration moved it and repainted the text on a
different backing; Chromium re-antialiased at that moment. The fix is in §3: the boot tree now
paints the mounted composition, and the fit layer carries the same opaque paper backing the mounted
sticky frame has, so no re-rasterisation happens at the swap. `compositionMaxDeltaPx` and
`heroTextMaxDeltaPx` are now **0**, and the first frames are pixel-identical
(`changedPixelsOver8: 0`).

**Result:** the measured acutance was already at parity and is unchanged (1.0727 → 1.0702, inside
run-to-run noise); the hydration repaint that made text appear to soften on arrival is gone. No
change was made purely to move a number that did not need moving.

## 2 · Wheel motion

**Measured first** — `tests/tools/discrete-scroll-probe.mjs` (frame traces added by this gate) and
`tests/tools/scroll-contract-probe.mjs` at 1440×900.

One isolated 120 px notch, scroll position frame by frame
(`metrics/before-notch-frames.json` → `metrics/candidate-notch.json`):

```
before   y  898 898 906 914 922 930 938 946 954 962 970 978 986 994
         Δ    0   8   8   8   8   8   8   8   8   8   8   8   8
after    y  898 898 900 904 910 917 925 933 941 949 957 965 973 981
         Δ    0   2   4   6   7   8   8   8   8   8   8   8   8
```

The notch now starts at 2 px and reaches the budget over ~70 ms instead of jumping to the ceiling
on the first frame, and it eases out over the last pixels. **Reach, delivery and settle are
unchanged**: 120 px travelled, `deliveredFraction` 1.000, `coastAfterInputPx` 0, settle 329 ms →
328 ms.

Route geometry and the discrete contract, before → after
(`metrics/before-discrete-1440x900.json` → `metrics/after-discrete-1440x900.json`):

| | before | after |
|---|---|---|
| `routeStart` / `routeEnd` / `routeSpan` / `leadCapPx` | 61 / 4561 / 4500 / 540 | **identical** |
| isolated impulses (1, 2, 3) | delivered 1.000, coast 0 | **identical** |
| sustained-12, project world | delivered 0.708, coast 508 | 0.694, coast 500 |

Lower-world ceiling (`metrics/before/scroll-contract-1440x900.json` →
`metrics/after/scroll-contract-1440x900.json`):

| | before | after |
|---|---|---|
| lower world, aggressive peak | 1957 px/s | **1657 px/s** (−15%) |
| route, aggressive peak | 526 px/s | 516 px/s |
| route coast | 524 px inside the 540 px cap | 524 px |
| reverse | 1 notch, 0 wrong-way px | 1 notch, 0 wrong-way px |

**Mechanism:** `lib/spatial/wheelMotion.ts` (new) eases the first 70 ms and the last few pixels of
an intent *within the governor's existing budget* — no stored velocity, so reversing an intent
reverses on the next frame — and `LOWER_WORLD_CEILING_RATIO` (0.85) lowers only the lower world's
budget. The camera filter, the intent target, the route span and the lead cap are untouched.

**Result:** a single notch reads as a movement rather than a step; the lower world's maximum speed
is down 15%; every protected scroll number is unchanged.

## 3 · First load

**Measured first** — `tests/tools/initial-paint-probe.mjs` (extended by this gate to sample the
hero's glyph box and to diff the first painted frames pixel by pixel), cold and warm at 1440×900,
1920×1080 and 390×844.

The pre-existing probe reported `FIRST PAINT == SETTLED` before this gate — and still does — because
it watched the world's fit and a foreground box, not the position the hero actually painted at. The
extended samples show what flashed (`metrics/before-paint-1440x900-cold.json` →
`metrics/after-paint-1440x900-cold.json`):

| first painted frame, 1440×900 cold | before | after |
|---|---|---|
| `zoom` | 1 | **0.909091** (the settled fit) |
| hero x | 149.09 | **104.72** |
| hero y | 157.03 | **213.38** |

So the first frame was painted at the unscaled linear layout and hydration then moved the heading
44 px left and 56 px down — the flash. After the fix the first painted frame already carries the
settled fit and position: `compositionMaxDeltaPx` 0, `heroTextMaxDeltaPx` 0, and the filmstrip
comparison of the first three frames reports `changedPixelsOver8: 0` with a mean absolute RGB
difference of 0.00003.

**Mechanism, and what it is not:** nothing is hidden. `worldFitBootScript()` now also sets
`data-world-preview="desktop"` on the document element, and a boot-gated block in
`styles/globals.css` — `@media (min-width: 1024px) and (prefers-reduced-motion: no-preference)`
plus that attribute — lays the same static scenes out in the camera's initial frame, at the
camera's own constants, with the sticky frame's opaque paper backing. No opacity, no visibility, no
splash, no delay. Two rejected experiments are kept as evidence:
`metrics/candidate4-background-experiment.json` and `candidate4-promotion-experiment.json`.

Because the attribute is only set by the boot script (so never without JavaScript) and the rules sit
behind a desktop, no-reduced-motion media query, the no-JS, reduced-motion and mobile trees keep the
original linear composition. Mobile is byte-identical: every hero and glyph measurement at 390×844
matches to the last decimal, cold and warm (`metrics/mobile-paint-comparison.json`).

**Result:** first paint arrives visually settled at 1440×900 and 1920×1080, proved by pixel diff
rather than by geometry alone.

---

## Where the raw frames live

Per `docs/REVIEW_POLICY.md` the numbers belong in Git and the bulk does not. Every probe JSON here
keeps its verdict, its geometry and its comparisons; the per-frame `samples` arrays (about 225
frames each, ~35 MB in total) were copied out to
`C:\Users\hakan\portfolio-review\v14.6-codex-motion\` and truncated to their first three entries in
the committed copies, with `samplesCount` recording the original length. Nothing was deleted.

## Validation (run by the orchestrator on the final tree)

typecheck 0 · lint 0 · `format:check` clean · unit **569/569** (including the two new files,
`spatial-wheel-motion` and `spatial-world-preview`) · build ✓ · focused Chromium
(`motion`, `spatial`, `spatial-v5`, `smoke`) **83 passed, 2 skipped** — the two skipped are the V6.6
seam tests skipped since V14.5. The reduced-motion and no-JS contracts pass, including "removes
every animated system: no camera, no parallax, no plane".

Mobile route probe at the recorded 2 vh step, against the V14.5 record: document heights, scene
positions and every DOM-rect measure identical; two pixel-row means moved by 0.001–0.002 (sampling).

## Not fixed, and why

- The blur brief assumed a per-frame sharpness loss. The numeric probe does not find one, so no
  change was made to chase it; what was fixed is the hydration repaint described in §1. If the
  owner still perceives softness while travelling, the next measurement should be a high-DPI
  capture at a real display scale rather than this 1× probe.
- `playwright.config.ts` now reads `PORT` from the environment (it was a hard-coded 3100). This is
  test infrastructure, not application behaviour; it is what lets the focused smoke run against an
  already-built server rather than rebuilding one.
