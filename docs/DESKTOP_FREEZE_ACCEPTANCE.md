# DESKTOP FREEZE ACCEPTANCE

Measured acceptance matrix for the desktop spatial homepage.

_Branch: `feature/spatial-portfolio-v5`. Recorded 2026-09-01 against the V11 desktop system pass._

Every PASS below is a number taken off the built page in a real browser, after polling each element
until its box was byte-identical for 4+ consecutive samples. Nothing here is an estimate, and
nothing is marked PASS because a test suite is green.

Raw data: `docs/review/v11-desktop-freeze/metrics/`.
Stills and recordings: `C:\Users\hakan\portfolio-review\v11-desktop-freeze\`.

---

## PROJECT ORDER

- [x] Software Factory — route index 01 / 04
- [x] Kıvılcım — 02 / 04
- [x] JointLedger — 03 / 04
- [x] DropSpot — 04 / 04
- [x] SYSTEMS — its own destination after the four

Derived from `SCENES` in route order; the acquisition frame renders the index, so the page cannot
disagree with the route.

---

## FOCUS ISOLATION — the hard gate

Measured as **screen-space intersection** of each neighbouring primary scene's full painted ink
*plus its ground plane* against the viewport, at the active destination's own focus progress.
`0` means the neighbour is entirely outside the frame.

| Viewport | SF | Kıvılcım | JointLedger | DropSpot | SYSTEMS | verdict |
|---|---|---|---|---|---|---|
| 1366×768 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| 1440×900 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| 1536×864 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| 1920×1080 | 0 | 0 | 0 | 0 | 0 | **PASS** |
| 2560×1440 | 0 | 0 | 0 | 0 | 0 | **PASS** |

Before this pass every one of those 25 cells was a FAIL, overlapping by 2,079px² at best and
**334,219px²** at worst.

- [x] Software Factory only, at its focus
- [x] Kıvılcım only
- [x] JointLedger only
- [x] DropSpot only
- [x] SYSTEMS only
- [x] 1366 · [x] 1440 · [x] 1536 · [x] 1920 · [x] 2560

**Safety margin, not a 1px miss.** Clear gap between the active scene's ink and its neighbour's:

| Viewport | smallest project-to-project gap | DropSpot → SYSTEMS |
|---|---|---|
| 1366×768 | 669px | 111px |
| 1440×900 | 853px | 163px |
| 1536×864 | 819px | 126px |
| 1920×1080 | 985px | 152px |
| 2560×1440 | 985px | 152px |

Isolation is achieved by **world geometry**, not by opacity or visibility: no scene is hidden, and
the neighbour is genuinely off-frame.

---

## PROJECT SPACING

- [x] clear departure before next acquisition
- [x] deliberate breathing interval — a full route step, identical for every pair including SYSTEMS
- [x] laptop-class desktop not compressed
- [x] no glued adjacent destinations

**One policy, not four offsets.** Isolation requires `stepPx >= viewportWidth − cameraInset +
margin`, and `stepPx = STEP_VW × worldUnitPx × fit`. Solved at each tested viewport with a
10%-of-viewport margin against the measured inset and fit:

| Viewport | inset L | fit | STEP_VW required |
|---|---|---|---|
| 1366×768 | 259 | 0.740 | ≥ 123.1 |
| 1440×900 | 197 | 0.865 | ≥ 111.3 |
| 1536×864 | 233 | 0.831 | ≥ 121.8 |
| 1920×1080 | 301 | 1.000 | ≥ 125.8 |
| 2560×1440 | 620 | 1.000 | ≥ 152.5 |

`STEP_VW = 155` satisfies every row. 2560 binds, because `CAMERA_INSET` centres the world in the
1320px container there while the world unit is capped. Narrow viewports are **not** compressed:
the requirement is solved at each of them rather than at one design width. The approved diagonal is
preserved to a tenth of a degree (66/96 = 0.6875 → 106/155 = 0.684).

---

## PROJECT GROUND

- [x] reusable implementation — one `planeShift()` grammar, one `ProjectPlane`, four instances
- [x] Software Factory lead / align / trail
- [x] Kıvılcım lead / align / trail
- [x] JointLedger lead / align / trail
- [x] DropSpot lead / align / trail
- [x] DropSpot uncropped
- [x] DropSpot ground larger than Kıvılcım's

Isolated choreography displacement (the plane's own transform, with the parallax term removed so
the phase signal is not swamped):

| Project | ENTRY lead | FOCUS | EXIT trail | trail > lead |
|---|---|---|---|---|
| Software Factory | 69.7–70.9px | **0px** | 103.8–105.5px | yes |
| Kıvılcım | 54.9–56.6px | **0px** | 95.5–99.0px | yes |
| JointLedger | 53.7–55.5px | **0px** | 95.8–98.9px | yes |
| DropSpot | 50.6–55.5px | **0px** | 90.0–98.9px | yes |

Measured at 1366×768, 1536×864, 1920×1080 and 2560×1440. `FOCUS = 0px` is the ground arriving
exactly on its registered relationship with the project — not "close to". This is **not** a static
offset: a static offset gives a flat line across the approach window.

DropSpot's crop was reverted in V7 and re-verified here: `frameRatio` / `framePosition` have zero
call sites outside `components/ui/Figure.tsx`.

### Not done, and why

- [ ] **Kıvılcım ground enlarged further.** It was enlarged in V7 (0.7078 → 0.75 of the block) and
      is unchanged in this pass. Not re-opened, because nothing measured it as too small.
- [ ] **Ground bounds derived from the project's own visual group.** Still authored constants. A
      derivation was designed and then **rejected on measurement**: the proposed `0.86 × ink width`
      policy reproduced DropSpot only because DropSpot's ink *is* the block (an arithmetic identity,
      not a validation), and the proposed vertical datum moved the one owner-approved plane 135.8
      world px at 2560. Adopting it would have deleted the measured `x + w == 1.00` block
      registration on two planes and rebound two more edges to MDX text-wrap positions. The
      constants stay until a derivation can be shown not to regress them.

---

## SCROLL

- [x] one global progression system — the governor bounds the whole document
- [x] slow input may stay slow
- [x] hard input cannot exceed max
- [x] target lead bounded
- [x] scroll debt bounded
- [x] reverse cancels opposing intent
- [x] diagonal and vertical same physics
- [x] multi-scene brute-force skip impossible

| Measurement | Spatial route | Lower vertical page |
|---|---|---|
| gentle wheel (60px / 90ms) | 504 px/s | 486 px/s |
| aggressive (400px / 16ms) | **522 px/s** | **545 px/s** |
| coast after all input stops | 502px · 0.58vh · 0.9s | 502px · 0.58vh · 0.9s |
| reverse | 1 notch · 0px wrong-way · 112ms | — |

Diagonal and vertical differ by **4%** — one physics, not two. The lower page was previously
**native and uncapped**; it is now under the same ceiling.

Configured ceiling `ROUTE_MAX_RATE = 0.105` of the route per second. Because that is a fraction of
the route, the permitted *world* speed is `rate × worldLength`: growing the world 61% for isolation
would have raised it 61%, so the ceiling came down with it —
`0.155 × 880 = 136 units/s` (V10) → `0.105 × 1420 = 149 units/s` (V11). Minimum time to cross the
route rises 6.5s → 9.5s. Page length is unchanged.

Intent lead cap `INTENT_LEAD_VH = 0.6`. Before it existed, 30 hard notches followed by *no input*
carried the page 2827px — 3.27 viewport heights — over 5.6 seconds.

---

## MOTION SHARPNESS

- [x] text sharp during slow travel
- [x] text sharp at max velocity
- [x] screenshots sharp while moving
- [x] diagrams sharp while moving
- [x] SYSTEMS sharp while moving
- [x] no blur/filter used as a motion crutch
- [x] no continuous foreground scale causing visible softness
- [x] no obvious fractional-transform blur

**Root cause, measured.** Accumulated transform scale on the ancestor chain of real text and a real
screenshot:

| Viewport | before | after |
|---|---|---|
| 1366×768 | **0.7400** | **1.0000** |
| 1440×900 | **0.8654** | **1.0000** |
| 1536×864 | **0.8308** | **1.0000** |
| 1920×1080 | 1.0000 | 1.0000 |
| 2560×1440 | 1.0000 | 1.0000 |

The world fit was applied as `transform: scale`, a **paint-time** operation: the layer is laid out
at full size, rasterised, then resampled at a non-integer factor. That is exactly why the site was
soft on a laptop and sharp on the 27-inch — the two viewports where the scale was already 1.0 were
the two that looked right. It is now `zoom`, the same visual result computed at **layout** time, so
glyphs are laid out and painted once at native scale and screenshots resolve against their real
intrinsic pixels. The transform chain over text is now **empty** at every viewport.

No filter, blur or backdrop-filter exists anywhere in the spatial layer. Screenshots are never
upscaled: Kıvılcım's 1600×1000 source renders at 598×374 … 833×521.

One deliberate exception, disclosed: the **departure zoom** (1 → 0.92) remains a transform, confined
to the last ~5% of the route after `EXIT_FROM`, where it is the intended "world steps back" beat
rather than a reading state.

---

## LOWER ROUTE

- [x] deleted-section dead distance removed
- [x] Selected Systems substantially moved upward
- [x] How I Build follows naturally
- [x] vertical lower world begins sooner
- [x] no narrative vacuum

The 360px run at 0.16–0.22% content fill between the handoff scene and "Back on the surface" is
gone. Under real wheel input the only remaining sub-threshold runs are a 171px black occlusion
(intentional — the frame is deliberately opaque there) and two short intervals of 112px and 48px on
travel legs the enlarged world introduced.

Honest note: mean content fill fell 0.196 → 0.173 because the world is 61% larger and the reader
now spends real time travelling between destinations. That is the negative space the isolation gate
was bought with, not obsolete distance — §26's distinction, applied deliberately.

---

## LOWER DESIGN

- [x] project ground motif not reused generically
- [x] lower sections use a meaningful distinct language
- [x] no arbitrary filler
- [x] CTA has a strong final-state role

The filled `bg-soft-paper` rectangles — the exact material `ProjectPlane` uses — are gone. Each
remaining section field is now three marks that each state something: a **seam rule** at the
measured typographic seam, a **terminating tick** at each end so the territory is bounded, and one
hairline running the field's height at its leading edge — the **route continuing through** the
section. Fields whose body under the seam is smaller than their own overhang are **not drawn** at
all (Field Notes and About), because a surface that is entirely overhang is not a ground.

The seam is measured, not constant: it starts from the authored value and is overridden only where
it lands inside a text leaf. Text cuts: **0** across all sections at 1536×864 and 1920×1080; two
were cutting running text before.

CTA: the convergence axis terminates on the action with the world's closed corner (V9).

---

## ZOOM

- [x] 100% · [x] 80% · [x] 67% · [x] 50%
- [x] broader coherent world visible

Primary scenes visible in one frame, at the same route progress:

| Condition | CSS viewport | scenes in frame |
|---|---|---|
| 1920×1080 @ 100% | 1920×1080 | **1** |
| 1920×1080 @ 90% | 2133×1200 | 2 |
| 2560×1440 @ 100% | 2560×1440 | 2 |
| 2560×1440 @ 50% | 5120×2880 | **4** |

Isolation at 100% and "more of one world" on zoom-out now coexist — which they could not before,
because the world was too small for the first and the unit cap was doing all the work for the
second. Zero horizontal overflow and zero console errors at every level.

---

## TECHNICAL

- [x] typecheck — pass
- [x] lint — 0 errors, 0 warnings
- [x] prettier — pass on every changed file
- [x] unit — **500 / 500**, 20 files
- [x] build — pass, 15/15 routes
- [x] Chromium E2E — **214 / 214**
- [x] WebKit regressions classified — **213 / 214** at `--workers=2`; the one failure is
      `shell.spec.ts` skip-link, pre-existing since before V5, reproduces in isolation, unrelated to
      this pass
- [x] console — 0 errors at every tested viewport and zoom level
- [x] reduced motion — the enhanced tree is gated behind it, unchanged
- [x] overflow — 0 at 320/360/375/390/430/768 and every desktop viewport
- [x] responsive smoke — mobile route intact, 9 stops present at all widths

No route contract was weakened. Two test expectations were corrected rather than relaxed: the
SYSTEMS cut-bearing assertion now **derives** the expected angle from the route instead of a
hardcoded 24–42° window that had been sitting a degree above the real bearing all along, and one
settle-bound test's time budget was raised because the route is now legitimately 46% slower to
cross.

---

## KNOWN, ACCEPTED, NOT P0

1. **SYSTEMS is clipped below the fold by 193–503px.** The giant word is `clamp(2.5rem, 16vw, 15rem)`
   by design — it is deliberately larger than the frame and opens as a surface. Intentional.
2. **Software Factory's ink extends 76–83px below the fold at 1440/1536/1920.** Part of this is the
   acquisition frame's bracket overhang, which sits outside the composition by design. Not a
   content loss; the diagram and its caption are inside the frame.
3. **Ground bounds are authored, not derived.** See the measurement above that rejected deriving
   them.
