# V14 scroll baseline — the governed scroll the owner approved

Tag: **`safety-v14-scroll-baseline`** → `35c2c58` (annotated, pushed).

The owner accepted this scroll behaviour: the maximum speed is governed, aggressive input never
runs away, sustained scrolling feels right, the lower-world pacing is right, and reverse responds.
This directory is the record that makes it recoverable and re-verifiable independently of any later
work: the constants it is made of, the budgets they derive, and the measured behaviour.

Nothing in the V14.1 engineering gate changed a scroll constant, the governor, the intent model or
the wheel handler. `metrics/` was measured on the V14.1 build precisely so that claim is checkable
rather than asserted — the numbers below sit beside the accepted V14 numbers in
`docs/review/v14-owner-visual/after/metrics/`.

## Recovering it

```
git show safety-v14-scroll-baseline                    # the annotated tag and its message
git diff safety-v14-scroll-baseline -- lib/spatial components/spatial   # what has moved since
git checkout safety-v14-scroll-baseline -- lib/spatial/cameraFilter.ts components/spatial/SpatialCamera.tsx
```

## The configuration it is made of

Source of truth: `lib/spatial/cameraFilter.ts`, `lib/spatial/sceneRoute.ts`, `lib/spatial/scenes.ts`,
`lib/spatial/worldFit.ts`. Values, and what each one holds:

| Constant | Value | What it governs |
|---|---|---|
| `ROUTE_MAX_RATE` | 0.105 | the ceiling: fraction of the route's span the camera may cover per second |
| `INTENT_LEAD_VH` | 0.6 | how far the wheel's target may lead the real scroll position, in viewport heights — the debt bound |
| `GLIDE_MAX_RATE` | 0.09 | the tighter ceiling inside the opening glide zone |
| `GLIDE_RELEASE_SPAN` | 1.5 | how far past the glide zone the release ramp runs |
| `GLIDE_RELEASE_GAIN` | 8 | the ramp's gain into the main ceiling |
| `TAU_SETTLED_MS` / `TAU_TIGHT_MS` | 48 / 22 | the camera filter's two lag constants |
| `SPEED_SETTLED` / `SPEED_TIGHT` | 0.06 / 0.55 | the speeds those lags are selected between |
| `SPEED_RELEASE_MS` | 250 | how long the tight lag is held after fast input |
| `BREAK_PLAYBACK_MS` | 950 | the scene-break event's fixed, input-independent duration |
| `BREAK_ABORT_PX` | 90 | one firm notch against the playback aborts it |
| `ROUTE_LENGTH_VH` | 600 | the spacer, so the route's span is 500vh of scroll |
| `WORLD_REFERENCE` | 1440 × 990 | the viewport the world is composed for; sets the fit and the world unit |
| `WORLD_FIT_MIN` / `MAX` | 0.74 / 1 | the fit's clamp |

## Route and world length

| | value |
|---|---|
| route one arc length | 1494.82 world units |
| route two arc length | 606.84 world units |
| total | **2101.66 world units** |
| mean camera speed | 2100.14 units per unit progress |
| break cut at | progress 0.7166 |

Derived from the route module itself by `tests/unit/route-focus-dump.test.ts`; the full table is
`docs/review/v14-owner-visual/after/metrics/route-focus.json`.

## The budgets those produce

`gearing = routeWorldLength × worldUnitPx × fit / routeSpan`;
`routeBudget = ROUTE_MAX_RATE × routeSpan`; `pageBudget = routeBudget × gearing` (D-039).

| Viewport | route span | fit | gearing | route budget | page / lower-world budget | lead cap |
|---|---|---|---|---|---|---|
| 1440×900 | 4500px | 0.909 | 3.821 | **472.5 px/s** | **1805.5 px/s** | 540px |
| 1920×1080 | 5400px | 1 | 3.853 | **567.0 px/s** | **2184.7 px/s** | 648px |

## The measured behaviour

`metrics/scroll-contract-1440x900.json` — continuous normal scroll, aggressive sustained scroll,
the lower world in both, the coast after input stops, and reverse latency.
`metrics/frame-time-1440x900.json` — the frame cost of a traverse, which is the route's speed in
disguise because the governor pays per frame (D-040).
`metrics/discrete-scroll-1440x900.json` — one isolated wheel impulse against sustained input, at
four positions (V14.1 §4).

Lower-world traversal, route traversal and reverse at both viewports, with recordings, are the V14
acceptance set: `docs/review/v14-owner-visual/after/journey.json`.

## What must not change without the owner

- the ceiling in the route: `ROUTE_MAX_RATE × routeSpan`, byte-identical since V7
- the page's ceiling as a *derived* gearing of that one, never a per-region constant
- the lead cap, sign collapse, and the coast staying inside one beat
- the scene-break event's ownership of its own band for a fixed duration
- reverse responding on the first notch, with no wrong-way travel
