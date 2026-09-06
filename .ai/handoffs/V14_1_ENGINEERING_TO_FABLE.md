# V14.1 → FABLE 5.1 (MAX) — engineering stabilization handoff

Engineering only. No art direction was performed, and none is proposed here. The V14 visual
candidate is unchanged and **owner acceptance is still PENDING**.

| | |
|---|---|
| Branch | `feature/owner-visual-acceptance-v14` |
| V14 application baseline | `35c2c58` |
| **Engineering checkpoint** | see `git rev-parse HEAD` — commit subject begins `V14.1: engineering stabilization` |
| **Scroll safety tag** | `safety-v14-scroll-baseline` → `35c2c58` (annotated, pushed) |
| `main` | `16d3ec0` — untouched |
| Evidence | `docs/review/v14-scroll-baseline/`, `docs/review/v14.1-engineering/` |
| Decisions | `docs/DECISIONS.md` D-041, D-042 |

## 1. The initial-load flash — FIXED

**Cause.** The world's fit is a viewport measurement, and it existed only once React had mounted.
The server-rendered tree — which every JS visitor sees for the frames before hydration — painted
with no fit at all, and the spatial world then replaced it carrying one. Measured: at 1440×900 the
hero painted 247.97px tall and became 225.41px (**×0.909**, exactly `worldFit(1440, 900)`), and at
1366×768 it went 235.22 → 182.47px, a **22%** jump. It held for 83ms warm and 231ms cold. At
1920×1080 the fit clamps to 1 and there was no flash at all — which identifies the cause as the
fit's *arrival*, not the tree swap and not fonts (the computed font-size never changes).

**Fix.** Three parts, all in `lib/spatial/worldFit.ts`, `app/layout.tsx`, `styles/globals.css` and
`components/spatial/SpatialCamera.tsx`:

1. `worldFitBootScript()` publishes the fit as `--world-fit` synchronously in `<head>`. Its source
   is generated from the module's own constants, so it cannot drift from `worldFit()`.
2. `.world-fit-layer` applies it as a **transform**, and the pre-hydration tree carries that class.
   Deliberately not `zoom`: the mounted world keeps `zoom` for V11's reason (a layout scale, so
   text is laid out at its final size), but on this transient tree `zoom` also changes the layout
   box, which grew the shift the hydration swap already causes — homepage CLS 0.0388 → 0.0777 at
   1440×900 and 0.0155 → **0.1152** at 1366×768, past the 0.1 threshold. With a transform the
   document height is byte-identical to the baseline at every viewport.
3. `useWorldFit` reads during render through `useSyncExternalStore` instead of measuring in an
   effect, so the first render in which the world exists already has the fit.

Nothing is hidden until hydration. Three visitor classes are deliberately skipped and keep exactly
the rendering they had: no JS, `prefers-reduced-motion: reduce`, and below the desktop breakpoint.

**Proof.** `docs/review/v14.1-engineering/initial-paint/{before,after}-*.json`.

| Viewport | before | after |
|---|---|---|
| 1440×900 | hero 247.97 → 225.41px (×0.909), 2 paints | **FIRST PAINT == SETTLED** |
| 1366×768 | hero 235.22 → 182.47px (×0.776), 2 paints | **FIRST PAINT == SETTLED** |
| 1920×1080 | no flash (fit clamps to 1) | unchanged |

Cold and warm both. Homepage CLS 0.0388 → 0.0418 at 1440×900, and across the matrix the worst case
falls from 0.1474 to 0.0442. Document height unchanged at every viewport. Reduced motion and no-JS
measure CLS 0 with the hero at its original 247.97px.

## 2. Motion sharpness — NO DEFECT FOUND, and nothing changed

Every mechanism the brief named was measured. None reproduced the report:

| Test | Result |
|---|---|
| Acutance at rest vs moving, 1440/1920, DPR 1 / 1.5 / 2 | **92–108% retained** — no loss |
| Sub-pixel landing, ⅛-px sweep through a whole pixel | acutance flat (±1.6%), **uncorrelated** with device-pixel distance |
| `zoom` layer vs the same text at the same final size outside it | **1.5% sharper inside** — the fit is a layout scale, not a softening one |
| Accumulated scale / filter on every text and image ancestor | **1.0000**, no filter, at rest and in motion |

**DPR-aware snapping was tested and not kept.** Since sharpness does not correlate with sub-pixel
landing here, snapping cannot buy any; its only certain effect would be to quantise the motion the
owner likes. That is the brief's own acceptance test failing on the evidence.

**What remains unmeasurable here, stated plainly:** a headless screenshot forces a re-raster, so it
cannot observe a compositor reusing a cached raster, and `LayerTree` reports nothing in headless
Chromium. If the softness is real it lives in real-time compositing on the actual display.
`tests/tools/foreground-sharpness-probe.mjs` exists so it can be re-run there.

**One observation, not acted on:** at 1440×900 the whole world is 9% smaller than at 1920×1080,
because the fit is 0.909 there and 1 there. Smaller type reads as softer. That is a composition
consequence of `WORLD_REFERENCE`, and it belongs to an art-direction gate, not to engineering.

## 3. Discrete scroll — NORMAL. The scroll implementation was NOT changed.

Measured at four positions (project world, between projects, SYSTEMS approach, lower vertical
world), 1440×900 and 1920×1080, with one, two, three, five separated impulses and sustained input:
`docs/review/v14.1-engineering/discrete-scroll/`.

| Delivery | scroll per notch | fraction of raw delta | coast after input |
|---|---|---|---|
| 1 isolated impulse | **120px** | 1.000 | **0px**, settles ~0.35s |
| 2 / 3 / 5 separated | 120px each | 1.000 | 0px |
| 5 sustained | 120px each | 1.000 | ~350px |
| 12 sustained | 92px each | 0.764 (lead cap engages) | ~500px, inside the 540px cap |

**There is no regime in which an isolated impulse travels further than the same notch during
sustained scrolling** — it delivers exactly the same 120px, and sustained input delivers *less* once
the lead cap binds. So per §5 of the brief nothing was changed: no input gain, no lead cap change,
no debt change, no region multiplier, no snapping.

Two things a future gate should know rather than rediscover. A notch buys 120 scroll px everywhere,
but inside the world those 120px are 460–580 **screen** px of camera travel and below it they are
120 — the 3.8× is the world's gearing (D-039), identical for isolated and sustained input. And near
the cut the scene-break event owns its band for a fixed 950ms regardless of input, so impulse
measurements there read the event, not the wheel model.

## 4. Protected scroll behaviour — Fable MUST NOT alter these

The owner accepted this scroll. It is tagged at `safety-v14-scroll-baseline` and recorded in
`docs/review/v14-scroll-baseline/README.md`.

- `ROUTE_MAX_RATE` 0.105 and the route's budget `ROUTE_MAX_RATE × routeSpan` — 472.5 px/s at
  1440×900, byte-identical since V7.
- The page's ceiling as a **derived** gearing of that one (`pageGearing` / `governorBudget`), never
  a per-region constant. 3.821 at 1440×900 → 1805.5 px/s.
- `INTENT_LEAD_VH` 0.6 — the debt bound, so the coast stays inside one beat.
- Sign collapse: a reversing gesture discards the pending lead. Reverse responds in **1 notch**,
  0px wrong-way, ~110ms.
- The scene-break event's ownership of its own band for `BREAK_PLAYBACK_MS` 950.
- The measured shape of all of it: `docs/review/v14-scroll-baseline/metrics/`.

If a visual change moves the route's geometry, the budgets follow automatically because they are
derived — but re-measure with `scroll-contract-probe.mjs`, `frame-time-probe.mjs` and
`discrete-scroll-probe.mjs` and put the numbers beside these.

Also protected, from D-040: whatever is written per frame during travel is either compositor-only
or holds nothing but single-paint SVG. Frame time **is** route speed, because the governor pays per
frame.

## 5. Remaining owner visual issues — for Fable, untouched here

1. **The V14 visual candidate itself is still awaiting the owner's verdict.** Package:
   `docs/review/v14-owner-visual/README.md`.
2. **Three mobile composition deltas** found by the Opus V14 QA and left for the owner:
   `.ai/handoffs/OPUS-V14-QA-RETURN.md` §6.1. Every project scene is 32px taller below `lg`; the
   0.972 arrival scale was removed on mobile as well as desktop; Software Factory's mobile case
   action moved. No mobile health metric regressed; none was changed.
3. **Perceived softness while scrolling**, if the owner still sees it on the real display after
   this checkpoint — engineering found no measurable cause (§2), so the next candidate is
   compositional: the 0.909 fit at 1440×900 makes every glyph 9% smaller than at 1920×1080.
4. **WebKit** 220/224: two Phase 7 environment cases plus two cut-region arrival cases that fail
   identically on the baseline build on this machine. `.ai/handoffs/FABLE-V14-RETURN.md` §3a.

## 6. Artifacts

- `docs/review/v14-scroll-baseline/README.md` + `metrics/` — the tagged scroll baseline: constants,
  route and world length, budgets, and the measured contract, frame time and discrete scroll
- `docs/review/v14.1-engineering/initial-paint/` — before and after, both viewports, cold and warm
- `docs/review/v14.1-engineering/sharpness/` — acutance at rest and in motion, before and after,
  with the crops
- `docs/review/v14.1-engineering/discrete-scroll/` — impulse tables at both viewports
- `docs/review/v14.1-engineering/runtime.txt`, `mobile/` — console, CLS, images, overflow, mobile
- Tools added: `tests/tools/initial-paint-probe.mjs`, `foreground-sharpness-probe.mjs`,
  `discrete-scroll-probe.mjs`
