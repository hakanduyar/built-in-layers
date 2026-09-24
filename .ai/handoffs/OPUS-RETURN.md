# OPUS-RETURN — FABLE GATE 1 (desktop final art direction)

**Executed by:** Opus 5 (High). The owner directed this session to execute the gate in place of a
model switch; the art-direction decisions below are therefore Opus decisions, made per the gate's
own framing, and are labelled as such rather than passed off as a Fable pass.
**Date:** 2026-08-31 · **Branch:** `feature/spatial-portfolio-v5` · **Base:** `aa9fe44`

---

## Q1 — the evidence-height problem. Chose **(a) crop to the benchmark ratio**, and RETIRED the second shot

**Decision.** `Figure` gained an opt-in `frameRatio` + `framePosition` (prop-gated; absent = today's
markup byte-for-byte). The stacked plate frames `browse-drops.webp` at **1.703**, `object-fit:
cover`, window anchored **left**.

**Result, measured settled at focus:** DropSpot media **886.7 × 520.7** at 1440×900 against
Kıvılcım's 832.9 × **520.6** — benchmark height **to the pixel**, at the accepted width, at both
gate viewports (both plates are fixed fractions of the same px-capped scene measure, so one ratio
holds everywhere). Media top position unchanged (317.9), bottom 838.6, 34px clear of the camera
edge.

**Price accepted.** 22.5% of the screenshot's width leaves the frame. The window was chosen by
looking at the asset, not by arithmetic: the heading, all four status filter tabs, and **both**
cards carrying "In Waitlist" badges live in the kept region, so the D-019 caption — *"browsing
drops with waitlist status visible"* — stays true with margin. The third card runs off the frame's
right edge as an ordinary editorial crop. The registered alt text says "three drop cards"; three
are present (one partial). Frontmatter untouched.

**And the second shot is gone.** Its own code comment recorded it as height compensation built on
the claim "no crop or swap can buy height honestly" — which the gate's own option (a) disproved.
With the real fix in, two near-identical light product surfaces stacked for bulk is
double-counting: filler under acceptance criterion 6. One dominant plate carries the scene; the
depth pairing is done by the thing that actually has depth — the world plane. (Options (b)/(c)
therefore not taken: (c) was recommended against by the gate and stays rejected here; (b) solved a
problem the crop had already solved, at the cost of a second mass the frame no longer has room
for.) This also freed the geometry the old pair had forced: the plane's placement no longer dodges
a second shot.

## Q2 — the plane's vertical rule. **Ground, not backdrop**, with every edge on a real line

- **LEFT = the description column's left edge** (`offset.x` 0.511 — grid col-start-7, ~x719 at
  1440, measured landing 719.2). Kıvılcım's plane registers on its identity column; this scene's
  second real alignment line is its description column.
- **RIGHT = scene block's right edge**, exact register kept (`x + w == 1.00` scene units; measured
  1296.2 vs 1297).
- **TOP = tucked below the media's top rule** (`offset.y` 0.247): overhang ~100px at 1440×900 and
  ~40px at 2552×1200. The old 0.22 measured **7.8px** at 2552 — a near-flush bound of exactly the
  class the review called arbitrary. The 60px centring shift between the two viewports is why the
  1440 figure is the larger one.
- **BOTTOM = ground** (`height` 0.455): extends ~56px below the media's bottom at 2552 (visible
  ground margin inside the frame) and runs off the frame's lower edge at 1440×900 — ground
  legitimately leaves a frame. Kıvılcım's slab floats contained; DropSpot's evidence stands on
  ground that continues beneath the camera. Two scenes, one grammar, mirrored weights.

All four numbers verified by settled runtime measurement at both viewports (landing within ~1px of
target). Kıvılcım-frame intrusion is structurally impossible: presence decays to exactly 0 out of
window, and the plane's geometry sits >2000px off that frame anyway.

## Q3 — the lower half. **The sections got their ground**

Diagnosis from the captures, not theory: the lower sections were the only compositions in the
whole journey drawn on a single surface. The top's identity is two-depth everywhere (evidence on
plane, word over trace, route through fields); the lower page was typography on bare paper — flat
in a site whose identity is depth. That, not a missing mark, is why it read weaker.

Each drift section now stands in its **field**: one `bg-soft-paper` surface per section — the
exact material and presence language of `ProjectPlane`, nothing drawn on it. Geometry is derived,
not authored:

- **Horizontally, the sweep envelope** — the strip of track the section's own entry/exit table
  makes it travel, plus its measure. The block visibly slides along its ground as it passes: the
  ProjectPlane behaviour (content moving across its field) carried into the lower page. Far
  drifters own wide grounds; quiet ones, narrow.
- **Vertically, a typographic seam** — the field opens in the whitespace just below each section's
  display line (three sections set that baseline at an identical measured 246px → 16rem; About's
  two-line name reaches 333px → 21.5rem). Register and heading overhang the ground; the body
  stands on it; the edge never crosses a line of text. Same relationship the world's evidence has
  to its plane.
- **Presence from depth** (`driftFieldOpacity`): the plate section matches the world planes' 0.66
  exactly; set-back sections lighter, the near section fuller. One grammar, no new channel.

**Two geometries were tried and rejected on sight, and are documented in `driftField()`:** the
naive envelope nests (it contains the block by construction — frame-and-picture), and a horizontal
near-edge bite ran the field's edge through running body text. The typographic seam is the
version that survived looking at real frames.

Fields are desktop-only (like the spine), static under reduced motion (blocks park at mid, inside
their envelope), aria-hidden, and cannot overflow by construction (free-space fractions).

## Frozen areas — proof, not promise

**Kıvılcım 1440 focus frame: 0 pixels differ >2/255** (max channel delta 2 = antialiasing floor);
**2552: byte-identical (max delta 0)** — before/after screenshots diffed pixel-by-pixel. Settled
geometry numerically identical (media 527.9/177.1/832.9×520.6; plane 115.8/225.2/835.2×540).
`Figure` is shared with the frozen scene — its new props are opt-in with an untouched default
path, which the pixel gate confirms empirically. SYSTEMS, the black transition, UNDERNEATH, the
route, and the opening glide were not touched by any change in this pass (no file that implements
them was edited). No project fact, metric, or diagram invented; frontmatter and content untouched.

## Files changed

| File | Change |
|---|---|
| `components/ui/Figure.tsx` | opt-in `frameRatio`/`framePosition` (default path unchanged) |
| `components/spatial/SpatialProjectScene.tsx` | stacked plate framed at 1.703 left-anchored; second shot + its reservation removed |
| `components/spatial/SpatialCamera.tsx` | DropSpot `ProjectPlane` → `{x 0.511, y 0.247} w 0.489 h 0.455`, rationale in place |
| `components/spatial/EditorialDrift.tsx` | per-section field surface in `DriftBlock` |
| `lib/spatial/editorialDrift.ts` | `driftField()`, `driftFieldOpacity()`, `seamRem` on `DriftPlate` |
| `tests/unit/spatial-drift.test.ts` | +5 contract tests for the fields |
| docs (`DESIGN_SYSTEM`, `PROGRESS`, `AUTONOMOUS_STATUS`) | gate record |

## Validation (run by this pass)

typecheck ✓ · lint ✓ · prettier (crlf-normalised) repo-wide ✓ · `git diff --check` ✓ · unit
**496/496** (491 + 5 new) ✓ · production build 14/14 ✓ · **Kıvılcım pixel gate ✓** (above) ·
Chromium + WebKit full suites and overflow/reduced-motion — results in `docs/AUTONOMOUS_STATUS.md`
(run after this file was written; the checkpoint commit records the final counts).

## Artifacts

`C:\Users\hakan\spatial-gate1-evidence\` — `before/` (V6.8 baseline, 5 beats × 2 viewports + lower
page), `iter1..iter5/` (the visual iteration trail, including both rejected field geometries),
`after/` (final, same coverage), `spatial-gate1-natural-scroll.webm` (production, real incremental
wheel input).

## Unresolved / for the next pass

- **About's ground is thin** (~100px band): its right column sits above the seam, so the ground
  carries only the role line. Correct per the seam rule; the quietest section stays quietest — but
  if About gains a fuller introduction (a known content gap), re-measure and drop the seam.
- The gate's 1440 dead-band between plane bottom and frame edge is gone by design (ground runs
  off-frame); if the owner prefers the contained-slab reading at 1440 too, `height` 0.41 brings
  the bottom inside with ~55px margin — one number, no other change.
- WebKit's two pre-existing failures (skip-link focus, break-rail gap) predate V5 and remain open;
  not addressed here (out of gate scope).

**Freeze judgement:** DropSpot composition and plane rule — freeze if the owner accepts the crop
window; the drift fields — hold soft (one review pass wanted before freezing), since their
presence values are one-knob tunable without touching geometry.
