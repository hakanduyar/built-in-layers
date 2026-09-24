# V14.13 motion feel gate

Application baseline `1944e25` (HEAD `e287f90` adds records only). Single writer: Claude Opus 5.
Changes are the demand-responsive route ceiling and the wheel takeover; the camera response itself
is deliberately unchanged, for reasons measured below.

## 1 · Free scroll

**What was actually wrong.** `ROUTE_MAX_RATE` is a flat ceiling — 0.105 of the route per second,
about 472 px/s at a 4500px span — so the route could not be crossed in under ~9.5s however hard the
reader pushed. The same flat rate also drained the 540px intent queue, so letting go left the page
travelling on its own: measured at 1440×900, an aggressive run's last wheel event landed at 1299ms
and the document did not stop until 2941ms. One constant produced both halves of the complaint: it
would not go fast, and it would not stop.

**The change.** The ceiling now follows demand — the fraction of the unchanged lead cap that pending
intent occupies, squared — from 1× at reading pace to 4× when the reader is clearly asking for
speed (`routeDemandGain`, `lib/spatial/cameraFilter.ts`). **The distance bound did not move**: the
queue is still at most `INTENT_LEAD_VH` (540 / 648px), so this grants speed without granting travel,
and coasting gets shorter rather than longer.

`tests/tools/scroll-contract-probe.mjs`, 1536×864:

| | before | after |
|---|---:|---:|
| **route aggressive, peak** | 431 px/s | **1259 px/s** |
| route aggressive, coast | 502 px | **288 px** |
| route gentle, peak | 415 px/s | 474 px/s |
| route gentle, coast | 71 px | 44 px |
| lower world aggressive, peak / coast | 7273 px/s / 0 px | 6838 px/s / 0 px |
| reverse | 2 notches, 0 wrong-way px, 213 ms | **1 notch, 0 wrong-way px, 109 ms** |
| geometry `routeTop` / `routeEnd` / `docMax` | 61 / 4381 / 8368 | identical |

Reading pace is essentially untouched (415 → 474 px/s) — that is the point of the squared curve.
Deliberate haste is ~2.9× faster. The lower world is unchanged and still native.

`tests/tools/v14-12-motion-probe.mjs`, travel after the last wheel event:

| case | before | after |
|---|---|---|
| 1440 aggressive forward | 540 px over 1315 ms | 540 px over **911 ms** |
| 1440 aggressive reverse | 540 px over 1665 ms | **213 px over 564 ms** |
| 1920 aggressive forward | 648 px over 2166 ms | 648 px over **1376 ms** |
| 1920 aggressive reverse | 648 px over 2357 ms | **363 px over 913 ms** |

**Is the residual runaway?** No — and it was tested rather than asserted.
`tests/tools/v14-13-reverse-check.mjs` reverses the same gesture twice: while the queue is still
draining, and after it has drained.

```
while the queue is still draining: wrongWayPx 2, notches 2, 232 ms
after the queue has drained:       wrongWayPx 0, notches 1, 147 ms
```

Forward debt would survive the wait; this does not. It is bounded coast, and it is now roughly half
of what it was.

## 2 · Camera feel — measured, and deliberately left alone

The brief asks for relaxation **only if** the camera now feels excessively mechanical. Two candidate
relaxations were built and measured, and both were rejected on evidence.

| candidate | camera tail (1440, slow / aggressive) | reverse after the queue drains |
|---|---|---|
| shipped (τ 12→8 ms, frame cap 0.7·dt) | 0.99 / 1.39 px | **0 px wrong-way, 1 notch, 135 ms** |
| τ 20→11 ms, frame cap **1.0·dt** | 3.28 / 2.01 px | **3 px wrong-way, 2 notches, 281 ms** |
| τ 20→11 ms, frame cap 0.7·dt | 1.73 / 1.41 px | 0 px wrong-way, 1 notch, 135 ms |

- Raising the **frame cap** is the only way to get a real trail at 60Hz, because the desktop τ is
  clamped to 0.7·dt (≈11.7 ms) — and it measurably costs the reverse guarantee the owner listed as
  preserved. Rejected.
- Raising only the **constants** keeps reverse intact but buys about **1 px** of extra trail, which
  is below perception, while breaking the V14.12 contract that the filter settles within 80 ms. A
  contract was not going to be loosened to buy an imperceptible change. Rejected.

So the camera response is byte-identical to V14.12. What actually changes the felt character of the
motion in this gate is objective 1: the world can now move through a much wider speed range. If the
owner still wants a softer camera after living with that, it is one constant, and the trade is
documented above.

## 3 · Navigation → free scroll handoff

**A concrete defect was found and fixed.** A navigation runs a native smooth scroll; while it is in
flight the browser re-applies its own target every frame, so the governor's tick saw the page move
away from its last write, concluded someone else was driving, and stood down. Measured: a wheel event
120 ms into a navigation still let the document travel a further **503 px** to the navigation's
destination — the reader's own gesture losing to a journey they had just interrupted.

The wheel handler now cancels the in-flight animation by re-issuing the current position with an
explicit instant behaviour, which moves the page zero pixels and is a no-op for the governor's own
(already instant) writes.

| navigation, then an immediate wheel event | before | after |
|---|---:|---:|
| 1440 document travel after that event | 503 px over 328 ms | **0 px over 6 ms** |
| 1920 document travel after that event | 638 px over 402 ms | **0 px over 5 ms** |

Landing accuracy is unaffected: the navigation contracts (ticks, both edge chevrons,
ArrowLeft/ArrowRight, the canonical station list) pass unchanged.

## Preservation

- Camera tails stay ≤ 1.73 px at both sizes on every wheel case; the one larger reading is the
  interrupted-navigation case at 1440 (6.68 px), which is the camera catching a journey the reader
  genuinely cut short. Against the pre-V14.12 71.17 px this is not a tracking regression.
- Route geometry identical; `ROUTE_MAX_RATE`, `INTENT_LEAD_VH`, `wheelMotion`, the break absorber,
  `sceneRoute.ts` and `scenes.ts` untouched.
- `FIRST PAINT == SETTLED`, cold, at 1440×900 and 1920×1080.
- Mobile: **zero layout differences** against the V14.11 record; seven pixel-sampling readings move.
  The governor is `enhanced && isDesktop`, so mobile never entered this path.

## Validation

typecheck 0 · lint 0 · format 0 · unit **595/595** · build ✓ · focused Chromium (`motion`, `spatial`,
`spatial-v5`, `navigation`, `home`, `smoke`) **113 passed, 2 skipped** — the two skipped are the V6.6
seam tests skipped since V14.5. The full acceptance matrix and WebKit were not run, per the brief.

`tests/tools/v14-12-motion-probe.mjs` gained an overridable `PROBE_ROOT` so this gate could re-run it
without overwriting the V14.12 evidence it was written for.
