# V14.13 motion feel gate — speed follows demand; a wheel outranks a navigation

**From:** Claude Opus 5 (single writer) · **Date:** 2026-09-14 · **Branch:**
`feature/owner-visual-acceptance-v14` · **Base:** `e287f90` (application baseline `1944e25`) ·
**Checkpoint:** `5ccbf5c`, pushed, `local == origin`.

Owner acceptance is **PENDING**. Not a freeze, not an acceptance, not a merge. `main` = `16d3ec0`.

## 1. Free scroll

One constant was doing two jobs. `ROUTE_MAX_RATE` is a flat ceiling — the route could not be crossed
in under ~9.5s however hard the reader pushed — and because the same flat rate drained the 540px
intent queue, letting go left the page travelling on its own for 1.6s. It would not go fast, and it
would not stop.

The per-frame budget now follows **demand**: the squared fraction of the unchanged lead cap that
pending intent occupies, 1× at reading pace to 4× under sustained intent. **The distance bound did
not move** — `INTENT_LEAD_VH` is untouched — so speed is granted and travel is not, and coasting
gets shorter rather than longer.

| 1536×864 | before | after |
|---|---:|---:|
| route aggressive, peak | 431 px/s | **1259 px/s** |
| route aggressive, coast | 502 px | **288 px** |
| route gentle, peak / coast | 415 px/s / 71 px | 474 px/s / 44 px |
| lower world aggressive | 7273 px/s, 0 coast | 6838 px/s, 0 coast |
| reverse | 2 notches, 0 wrong-way, 213 ms | **1 notch, 0 wrong-way, 109 ms** |
| geometry | 61 / 4381 / 8368 | identical |

Travel after the last wheel event: 1440 aggressive reverse 540 px / 1665 ms → **213 px / 564 ms**;
1920 aggressive forward 648 px / 2166 ms → 648 px / **1376 ms**.

**No runaway, and it was tested rather than asserted.** `tests/tools/v14-13-reverse-check.mjs`
reverses the same gesture twice: mid-drain gives 2 px of wrong-way travel in 2 notches; after the
queue drains, **0 px in 1 notch**. Forward debt would survive the wait; this does not.

## 2. Camera feel — measured, and deliberately left alone

Two relaxations were built and measured:

| candidate | camera tail (1440 slow / aggressive) | reverse after the queue drains |
|---|---|---|
| shipped (τ 12→8 ms, cap 0.7·dt) | 0.99 / 1.39 px | **0 px, 1 notch, 135 ms** |
| τ 20→11 ms, cap **1.0·dt** | 3.28 / 2.01 px | **3 px, 2 notches, 281 ms** |
| τ 20→11 ms, cap 0.7·dt | 1.73 / 1.41 px | 0 px, 1 notch, 135 ms |

Raising the frame cap is the only way to get a real trail at 60Hz (desktop τ is clamped to 0.7·dt ≈
11.7 ms) and it measurably costs the reverse guarantee the owner listed as preserved. Raising only
the constants keeps reverse but buys about **1 px** of extra trail — below perception — while
breaking V14.12's contract that the filter settles within 80 ms. Neither trade was worth making, so
the camera response is byte-identical to V14.12.

What actually changes the felt character here is objective 1: the world now moves through a much
wider speed range. **If the owner still wants a softer camera after living with that, it is one
constant, and the trade is documented above.**

## 3. Navigation → free scroll handoff

A concrete defect, found and fixed. A navigation runs a native smooth scroll; while it is in flight
the browser re-applies its own target every frame, so the governor read that as someone else driving
and stood down. A wheel event 120 ms into a navigation still let the document travel a further
**503 px** to the navigation's destination — the reader's gesture losing to a journey they had just
interrupted. The wheel handler now cancels the animation by re-issuing the current position with an
explicit instant behaviour: zero pixels of movement, and a no-op for the governor's own already
instant writes.

| navigation, then an immediate wheel | before | after |
|---|---:|---:|
| 1440 document travel after that event | 503 px / 328 ms | **0 px / 6 ms** |
| 1920 | 638 px / 402 ms | **0 px / 5 ms** |

Landing accuracy is unaffected: ticks, both edge chevrons, ArrowLeft/ArrowRight and the canonical
station list pass unchanged.

## 4. Files

Product: `lib/spatial/cameraFilter.ts` (the demand gain; `governorBudget` gains an optional
multiplier defaulting to 1, so every existing caller is unchanged),
`components/spatial/SpatialCamera.tsx` (the budget call site and the wheel takeover).
Tools: new `tests/tools/v14-13-reverse-check.mjs`; `tests/tools/v14-12-motion-probe.mjs` gained an
overridable `PROBE_ROOT` so this gate could re-run it without overwriting V14.12's evidence.
Docs: `DECISIONS.md` D-059, `FROZEN_BOUNDARY.md` §5 ledger row,
`docs/review/v14.13-motion-feel/` (report + metrics, 168 KB), this file.

## 5. Preserved — verified on the checkpoint build

- Camera tails ≤ 1.73 px on every wheel case at both sizes. The one larger reading is the
  interrupted-navigation case at 1440 (6.68 px) — the camera catching a journey the reader genuinely
  cut short. Against the pre-V14.12 71.17 px this is not a tracking regression.
- `ROUTE_MAX_RATE`, `INTENT_LEAD_VH`, `wheelMotion`, the break absorber, `sceneRoute.ts`,
  `scenes.ts`, `systemPov.ts`, every reveal and opacity curve, the navigator, Kıvılcım's
  registration, SYSTEMS and the POI grammar are untouched — the product diff is two files.
- `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- Mobile: **zero layout differences** against the V14.11 record (seven pixel-sampling readings move).
  The governor is `enhanced && isDesktop`, so mobile never entered this path.
- typecheck 0 · lint 0 · format 0 · unit **595/595** · build ✓ · focused Chromium (`motion`,
  `spatial`, `spatial-v5`, `navigation`, `home`, `smoke`) **113 passed, 2 skipped** — the two skipped
  are the V6.6 seam tests skipped since V14.5.

The full acceptance matrix and WebKit were not run, per the brief.

## 6. Remaining, for the owner

- The route's *reading pace* is deliberately almost unchanged (415 → 474 px/s). If "free" was meant
  to include normal reading scroll being faster too, that is `ROUTE_MAX_RATE` itself and it changes
  the accepted cinematic pacing — a separate decision, not something to slip in here.
- An earlier intermediate build measured 25 px of wrong-way travel in the scroll-contract probe; the
  final build measures 0, and the controlled reverse check confirms 0 after the queue drains. The
  intermediate number is recorded here so the sequence is not silently tidied.
- The known untracked `tests/tools/v14-10-review-capture.mjs` is untouched and still untracked.

NEXT: owner review. No further gate. No final QA. No merge.
