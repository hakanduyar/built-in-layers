# FROZEN BOUNDARY — V12 DESKTOP SPATIAL SYSTEM

The desktop spatial system was frozen on 2026-09-02 at `0752883`, recorded in
`docs/DESKTOP_FREEZE_ACCEPTANCE.md`. This document is the regression boundary for every phase that
follows: what is frozen, how to detect that it moved, and what counts as a permitted change.

- Frozen at: `0752883` (docs recorded at `243db3934d634f2c39d339cd2a267c01d86be2bd`)
- Fingerprints below are git blob SHA-1s at `243db393`
- Verify with: `git rev-parse 243db393:<path>`

---

## 1. Frozen surface — 30 files

Any change to a blob listed here moves the frozen system and must be justified as a deliberate,
measured change rather than a side effect. Ten have moved since, each with its evidence; they are
listed in §5. The fingerprints below are deliberately left at their `243db393` values — they are
what §4 compares against.

### Spatial engine — `lib/spatial/` (8 files)

| Blob | Path |
|---|---|
| `7dd94ecab4a3869304ff90efa9ce5c5d2a7801da` | `lib/spatial/cameraFilter.ts` |
| `800d2e283391c63cbe47e5c1b6500c553133b7c6` | `lib/spatial/editorialDrift.ts` |
| `c4596442ba2a8961c60af75181be3614b3f92fdc` | `lib/spatial/planeChoreography.ts` |
| `aa159e965a9879b3b7f1d1b76b2a80082ad24513` | `lib/spatial/projectGround.ts` |
| `b7d3ca2e5be018b04bca222a6c830df93dee9cd6` | `lib/spatial/sceneRoute.ts` |
| `c09260fad081557378c7ad0c5cc2923a5b527e82` | `lib/spatial/scenes.ts` |
| `72aec20953f480cf2827c7c57ed6dd9ed51a32bb` | `lib/spatial/systemPov.ts` |
| `ee9eb1fa6ad495629a66111bd55ca35396d99892` | `lib/spatial/worldFit.ts` |

### Spatial components — `components/spatial/` (13 files)

| Blob | Path |
|---|---|
| `d432dfbb4b7cf9e2ba96897c727e47a870f172a5` | `DirectionalField.tsx` |
| `73b5f4f22114af1bef6fb346ed5c57fa39e5cf99` | `EditorialDrift.tsx` |
| `10cfb58a61ee8182cd39d2e14ed54d60db78cb4b` | `ProjectPlane.tsx` |
| `a78f234c1dd29bbc635d556a832cf63bfe3e916d` | `SceneBreak.tsx` |
| `c06a1401871ef174266dfc82763aa667a8c9ac95` | `SpatialCamera.tsx` |
| `fa941e858ec340fd40845be6d58e637320d4006e` | `SpatialExperience.tsx` |
| `edb9cd453ff661059ae3b3cef34f1df06b5f8b92` | `SpatialProjectScene.tsx` |
| `07a03f277cb406ea33a59e09dcd61a6a903cdf6c` | `SystemField.tsx` |
| `2c031a4151b296263ed59d2e3503d87741b5d262` | `SystemNode.tsx` |
| `6df3af8452267167f80e0fcf3e971159eb1a712b` | `SystemPOV.tsx` |
| `1a4b1d5beb26e113b66b537d27d6587d5ceea574` | `SystemsWord.tsx` |
| `c650a3176a06b0b65438991dda1c4218dd7adb96` | `TravelMaterial.tsx` |
| `4ef6495a7d7deecc280a9cc6fa545226aadffd91` | `WorldGrammar.tsx` |

### Homepage sections — `components/sections/` (8 files + `.gitkeep`)

`AboutPreview` `e4b48832…`, `BuiltForRealLife` `8f6a958e…`, `FieldNotes` `2477ab8d…`,
`Hero` `a07f9b00…`, `HowIBuild` `a48126a7…`, `LayerExplorerIntro` `6d63e51e…`,
`PositioningStatement` `4272ffcf…`, `SelectedSystems` `751aa48a…`

---

## 2. Frozen behaviour — do not reopen

Per the freeze decision in `docs/DESKTOP_FREEZE_ACCEPTANCE.md`, these are closed without a
**measured** regression:

project spacing · project grounds · scroll feel and the velocity governor · motion sharpness ·
lower-world composition · zoom behaviour · SYSTEMS · UNDERNEATH

Measured means an artifact or metric, not an impression.

---

## 3. Where the next phase touches the boundary

The project-architecture phase is content-side, but it is **not** disjoint from the frozen surface.
Two real contact points exist:

### 3.1 `SpatialProjectScene.tsx:115` reads `project.depth`

```ts
project.depth === "full" || project.depth === "short" ? "Open case study" : "Open system";
```

Raising Software Factory from `preview` to `short`/`full` (Slice 2) **changes a rendered string
inside a frozen component** — without editing the component. The blob fingerprint would not move,
but the rendered output would.

**Ruling required from the independent review:** is a content-driven string change inside a frozen
scene a V12 regression, or the frozen system correctly responding to data? This document does not
decide it.

### 3.2 `SelectedSystems.tsx` reads live loader data

`projectLayerCoverage` derives its Surface/Flow/System topology from validated summaries and
registered assets (`tests/unit/selected-systems.test.ts`). Adding layers to Software Factory would
change what that frozen section renders — again without editing it.

**Every other planned change is outside the boundary.** Slice 1 (derive neighbours from `order`)
touches `lib/content/`, `app/work/[slug]/`, `components/project/` and `content/work/` only — none
of which appear in §1.

---

## 4. Regression check

Before any commit in a post-freeze phase:

```sh
# 1. no frozen blob moved
for f in $(git ls-tree -r --name-only HEAD \
           | grep -E '^(lib/spatial/|components/spatial/|components/sections/)'); do
  a=$(git rev-parse 243db393:$f 2>/dev/null); b=$(git rev-parse HEAD:$f 2>/dev/null)
  [ "$a" = "$b" ] || echo "MOVED: $f"
done

# 2. the spatial contracts still hold
pnpm test                      # includes spatial-route / filter / drift / ground / system-pov
pnpm test:e2e                  # includes spatial-v5.spec.ts
```

If a frozen blob must move, the change requires the same standard the freeze was granted under:
measured evidence, not judgement. Moves that have met that standard are recorded in §5, so the loop
above is read against a ledger rather than against silence.

---

## 5. Sanctioned moves since `243db393`

**V14.7 Codex engineering gate (owner instruction, 2026-09-09; uncommitted):**

| Files | Scope and authority | Evidence |
|---|---|---|
| `lib/spatial/systemPov.ts`, `components/spatial/SpatialCamera.tsx`, `components/spatial/SystemNode.tsx` | Explicit Engineering Gate 2: give UNDERNEATH the Built in Layers release timing, acquire four-stops earlier, centre About inside its existing desktop stage. Route geometry, scroll physics, SYSTEMS, acquisition-frame language, other lower sections and mobile composition are preserved. | `docs/review/v14.7-codex-timing/REPORT.md` and `metrics/`: before/after computed opacity in scroll pixels, stage/text geometry at 1440×900 and 1920×1080, route invariants, targeted tests and the step-2 mobile comparison. |

**V14.6 Codex engineering gate (owner instruction, 2026-09-08; uncommitted):**

| Files | Scope and authority | Evidence |
|---|---|---|
| `components/spatial/SpatialCamera.tsx`, `lib/spatial/worldFit.ts`, `styles/globals.css`; new `lib/spatial/wheelMotion.ts` | Explicit Engineering Gate 1: ease desktop wheel delivery inside the accepted governor; lower only the lower-world ceiling; make the desktop boot preview paint the mounted composition. No camera path, scene presence, transition or mobile art-direction changes. | `docs/review/v14.6-codex-motion/REPORT.md` and its `metrics/`: numeric sharpness, isolated wheel frame traces, scroll contract, cold/warm first-paint geometry and filmstrips, including the 390×844 mobile comparison. The report records remaining limits rather than declaring owner acceptance. |

The fingerprints in §1 stay written as they were at `243db393` — they are the reference the loop in
§4 compares against, and rewriting them would erase the boundary. This section is the ledger of
moves that were granted under §4's standard, so a `MOVED:` line can be checked against a decision
instead of being read as an undetected regression.

On `feature/project-architecture-v13`, the §4 loop prints exactly these ten lines — five granted by
the desktop art-direction gate (2026-09-03) and seven by the mobile gate (2026-09-04), two of
which (`SpatialExperience.tsx`, `SelectedSystems.tsx`) moved under both. Nothing else under
`lib/spatial/`, `components/spatial/` or `components/sections/` has moved, and no file has been
added to or removed from the 30.

**Desktop art-direction gate** (`.ai/handoffs/FABLE-RETURN.md`; metric paths relative to
`docs/review/v13-fable-gate/`):

| File | `243db393` | now | Granted by | Measured evidence |
|---|---|---|---|---|
| `components/spatial/SpatialExperience.tsx` | `fa941e8` | `8568129` → see below | hero-clipping fix, commit `76c5660` | `FABLE-RETURN.md` §5 (defect, five frozen stills) and §11.3 A (fix, eight viewports); `metrics/final/hero-unit.txt` |
| `lib/spatial/projectGround.ts` | `aa159e9` | `6431139` | **D-028** | `FABLE-RETURN.md` §11.3 B; `metrics/{before,final}/fable-gate-all.json`, key `groundOutsideEvidence` |
| `components/spatial/SpatialProjectScene.tsx` | `edb9cd4` | `34b48d5` | **D-029** (finding C) | `FABLE-RETURN.md` §11.3 C; same metrics, plate-bottom clearance |
| `components/sections/HowIBuild.tsx` | `a48126a` | `2d90924` | **D-029** (finding E) | `FABLE-RETURN.md` §11.3 E; `metrics/final/lower-world.json` |
| `components/sections/SelectedSystems.tsx` | `751aa48` | `592b79e` → see below | **D-029** (finding E) | `FABLE-RETURN.md` §11.3 E; same file, label/column offset |

**Mobile gate** (`.ai/handoffs/FABLE-MOBILE-RETURN.md` §6 is the gate's own account of these
seven moves; the gate hit its session limit before committing, the orchestrator checkpointed the
validated tree as `b23284e`, and `.ai/handoffs/OPUS-MOBILE-QA-RETURN.md` is the independent
verification of that checkpoint. The bounded final pass after the QA moved nothing frozen: its
edits are `components/ui/{FigureInspect,Figure}.tsx`, `components/project/ProjectCard.tsx`, tests,
tools and docs, and it re-proved desktop parity for the whole branch against a build of `4c788b4`
in `after/desktop-parity-final-pass.txt` — 44 walks, all at parity, `/work` pixel-identical with
five caption `<span>`s more. Metric paths relative to `docs/review/v13-mobile-gate/`). Every one of these moves is mobile-scoped — a
`!isDesktop` branch, or a `mobileWorld` anchor — and the desktop was proved unchanged rather than
asserted: `tests/tools/desktop-parity-probe.mjs` walked the frozen baseline (`180c07c`, the last
commit before the gate) and the candidate build through all eight routes at 1280×800 / 1440×900 /
1536×864 / 1920×1080 in half-viewport steps and compared every settled frame by rendered geometry
(every element's rect to 1/100 px plus the camera world's transform) and by pixels. All 32
walks are at parity. The non-spatial routes are pixel-identical (the two case studies' geometry
fingerprint differs only in element count — one caption `<span>` per inspectable figure, D-031 —
with every pixel identical); the spatial homepage is geometry-identical at every step, with the
camera transform byte-equal, and its residual pixel difference is Chromium's own raster jitter
(measured against two walks of the *same* baseline build; the one step the cell test flagged on
the first pass, 1920×1080 at 2160 px, re-examined as jitter at exactly the same-build ceiling;
under `prefers-reduced-motion: reduce` it is zero). Result: `after/desktop-parity.txt` and
`after/desktop-parity-reduced-motion.txt`.

| File | `243db393` | now | Granted by | Measured evidence |
|---|---|---|---|---|
| `lib/spatial/worldFit.ts` | `ee9eb1f` | `5e390a1` | **D-030** (M3, the mobile world unit) | `metrics/{before,after}/mobile-route.json` — paper between projects on tall phones, near-empty frames 3 → 0 (360×800), 5 → 0 (390×844), 5 → 2 (430×932), 4 → 1 (768×1024); mean route ink 34 → 40 / 32 → 39 / 30 → 37 / 35 → 44 %; page height unchanged. Desktop: `WORLD_UNIT` and the `isDesktop` branch untouched; parity file above |
| `lib/spatial/scenes.ts` | `c09260f` | `b970524` | **D-030** (M3, route two's mobile legs) | same metrics, the 3.5–5.0vh stretch of the route (`reorient` / `approach` / `handoff` focus frames); the 8 % speed ceiling holds at 7.79 % (`tests/unit/spatial-route.test.ts`). Desktop: only `mobileWorld` values changed; `world` anchors byte-identical; parity file above |
| `components/spatial/SpatialCamera.tsx` | `c06a140` | `601eafa` | **D-030** (M3) | the two `--world-vw` / `--world-vh` declarations read `WORLD_UNIT_MOBILE` on the `!isDesktop` side only; desktop side textually unchanged; parity file above |
| `components/spatial/SpatialExperience.tsx` | `8568129` (after the hero-clipping fix) | `e1963af` | **D-033** (M4, the tour's CTA) | `after/tap-targets.txt` §TOUR CTA and `metrics/{before,after}/mobile-route.json`, key `tourTargets.handoff` — "See every system" is laid out in world space under a 0.89–0.995 plane scale, so its 44 px minimum measured 184×43 (the audit's "1px short") and 39–44 px across the stretch it is on screen; `max-lg:min-h-12.5` (50 px in world space) measures 47–49 px at handoff focus at all six widths and 44.6 px at the plane's lowest on-screen scale. One class, `max-lg:` only; the desktop button is untouched — parity file above |
| `components/sections/SelectedSystems.tsx` | `592b79e` (after D-029) | `9b3063b` | **D-033** (M4, touch targets) | `after/tap-targets.txt` — the five system-title links 24 px → 45 px tall below `lg`, with the M4 classes stripped from the live DOM and the page re-captured pixel-identical (the hit box grows, the layout does not); desktop: `max-lg:` only, parity file above |
| `components/sections/FieldNotes.tsx` | `2477ab8` | `0c2b60f` | **D-033** (M4) | same file — "See all notes" 15 px → 45 px; same strip-and-recapture proof |
| `components/sections/AboutPreview.tsx` | `e4b4883` | `958b165` | **D-033** (M4) | same file — "Read the full introduction" and "LinkedIn" 24 px → 45 px; same proof |

D-028 through D-033 are accepted on this branch under the two gates' delegated authority and are
**not in force on `main`**; the boundary on `main` remains all 30 blobs at `243db393`.

**§3.1 is resolved, not open.** The ruling it asked for was answered by D-027: Software Factory
stays at `depth: preview`, so `SpatialProjectScene.tsx`'s `project.depth` branch still renders
"Open system" and the question of a content-driven string change inside a frozen scene did not
arise. `isCaseStudyDestination` now reads the same `depth` field for the case-study route's exit
(D-029), which is the same data answering the same question in a second place.

---

## 6. V14 — the desktop boundary reopened by owner decision

On `feature/owner-visual-acceptance-v14` the owner has **reopened the desktop visual and narrative
layer** (`.ai/handoffs/V14-OWNER-BRIEF.md` §3: "Owner visual verdict overrides model freeze"). The
§1 fingerprints remain the reference the §4 loop compares against — they are the record of what was
frozen, not a claim about this branch — but on V14 the loop is expected to print more than the ten
lines §5 accounts for, and the standard for those moves is the owner's brief rather than a measured
regression: D-034 to D-040 record what moved and why, and `.ai/handoffs/FABLE-V14-RETURN.md` carries
the before/after evidence. The mobile composition of the V13 gate is **not** reopened; every V14
change is desktop-scoped (`lg:`, `isDesktop`, `wide`, `where="desktop"`) or verified against the
mobile probes, and the return lists the mobile deltas. `main` is untouched.


### 6.1 V14.1 — the Fable visual correction gate (2026-09-06)

The same reopening, continued under the owner's V14.1 brief (`.ai/ACTIVE_TASK.md` names it; the
verdict was "improvements, but not yet what I asked for"). What moved, why, and how it was measured
is D-043 to D-047 and `docs/DESIGN_SYSTEM.md` §39; the evidence is `docs/review/v14.1-fable/`.

**Frozen-surface files that moved on this gate**, all desktop-scoped:

| File | Why | Measured by |
|---|---|---|
| `components/spatial/WorldGrammar.tsx` | rails as track states, stations, strata as floors, recess, terminus map offset (D-043, D-046) | transition sheets, zoom 50/67/80, e2e rail guard |
| `components/spatial/ProjectPlane.tsx` | drawn ground: datum, floor at the composition's foot, tread (D-044) | stills at 1366/1440/1920, scene fit |
| `lib/spatial/systemPov.ts` | presence as a state change; the mobile branch keeps the V14 curve (D-044) | transition sheets; mobile route probe |
| `components/spatial/SystemPOV.tsx` | the cluster at the top-right corner on desktop; `compact` keeps the V13 placement (D-044) | stills; mobile route probe |
| `components/spatial/SpatialProjectScene.tsx` | one action vocabulary; the foundation's detail column beside the identity (D-044, D-045) | scene fit at five viewports |
| `components/spatial/SpatialExperience.tsx` | reorient/approach stand on their strata; the junction on the rail's datum at `lg` (D-046) | stills, handoff→1 sheets |
| `components/spatial/EditorialDrift.tsx`, `SystemNode.tsx` | the lower rail's arms and register hooks; lateral-only clip (D-047) | stills at 1366/1440/1920/50% |
| `components/spatial/SpatialCamera.tsx` | one call: `scenePresence(value, mobile)` — no other line | mobile route probe identical to the record |
| `components/sections/{SelectedSystems,HowIBuild,AboutPreview}.tsx` | the map's index, rows, the station scale — `lg:` only (D-047) | stills; mobile route probe |

New, not frozen: `components/spatial/LowerRoute.tsx`, `lib/spatial/railTravel.ts`,
`lib/spatial/evidenceDetail.ts`, `tests/tools/transition-sheet.mjs`. Also changed outside the
frozen surface: `components/ui/Figure.tsx`, `FigureInspect.tsx`, `RouteMap.tsx`,
`components/layout/SiteFooter.tsx`, `tests/e2e/spatial.spec.ts` (the D-040 guard restated for the
track markup), `tests/tools/scene-fit-probe.mjs` (clips to overflow ancestors).

**Untouched, byte for byte, against `fa7c72c`:** `lib/spatial/{cameraFilter,sceneRoute,scenes,
worldFit,planeChoreography,projectGround,editorialDrift}.ts`, `SceneBreak.tsx`, `SystemsWord.tsx`,
`SystemField.tsx`, `DirectionalField.tsx`, `TravelMaterial.tsx`, everything under `app/`. The
scroll contract, the discrete-scroll table and the first-paint probe reproduce the V14.1
engineering numbers (`.ai/handoffs/V14_1_FABLE_TO_OPUS.md` §6).

**Mobile:** the V13 composition is not reopened. The mobile route probe at the recorded step
differs from the V14.1 engineering record in one mean pixel-row value at 320×568 (0.325 → 0.326);
scene heights, document heights and focus positions are identical at 320, 390 and 768.


### 6.2 V14.2 Gate B — the cut as the underside of the surface (2026-09-07)

The reopening continued under the owner's V14.2 Gate B brief (SYSTEMS → UNDERNEATH, the UNDERNEATH
landing, the return to the surface; nothing else). D-048 and `docs/DESIGN_SYSTEM.md` §40 record
what moved and why; the evidence is `docs/review/v14.2-gate-b/`.

| File | Why | Measured by |
|---|---|---|
| `components/spatial/SceneBreak.tsx` | the desktop cover is the recess plane carrying the section at rest; the V4 rails stay below `lg` (D-048) | twelve-frame sheets both ways at 1440, 1920 smoke; the two restated e2e contracts; mobile route probe identical |
| `components/spatial/SpatialExperience.tsx` (`SurfaceReturn`) | the junction is a paper plane from the SURFACE rule down, labelled in the strata's grammar (D-048 §4) | handoff→terminus sheets both ways at 1440 and 1920 |
| `components/spatial/SpatialCamera.tsx` | one compositor-only `y` on the existing surface-return wrapper, the same window as its opacity — nothing else | first-paint, discrete-scroll, scroll-contract and frame-time probes reproduce the record |

New, not frozen: `lib/spatial/surfaceCover.ts`, `tests/unit/surface-cover.test.ts`,
`tests/tools/progress-stills.mjs`. Untouched, byte for byte, against `8c6045c`:
`lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,planeChoreography,projectGround,
editorialDrift}.ts`, `SystemsWord.tsx`, every project scene, the lower page, `app/`.

### 6.3 V14.2 Gate C — the lower world as one system (2026-09-07)

The reopening continued under the owner's V14.2 Gate C brief (Selected Systems, How I Build, Field
Notes, About, the final CTA — as one system; nothing else). D-049 and `docs/DESIGN_SYSTEM.md` §41
record what moved and why; the evidence is `docs/review/v14.2-gate-c/`.

| File | Why | Measured by |
|---|---|---|
| `components/sections/SelectedSystems.tsx` | the index as a section drawing: strata as floors, a descent per system, the record as footing — `lg:` only (D-049 §1) | stills at 1440 and 1920; lower-world sheets both ways; `[data-layer-record]` count; mobile route probe identical |
| `components/sections/HowIBuild.tsx` | the method statement and the floors beside the four commitments — `lg:` only (D-049 §2) | stills; sheets; the reveal contract |
| `components/sections/FieldNotes.tsx` | the empty state as one entry on one rule — `lg:` only (D-049 §3) | stills; the Field Notes link contracts |
| `components/sections/AboutPreview.tsx` | the operator in the systems' grammar, one `nav` placed by the grid — `lg:` only (D-049 §4) | stills; the About link contracts; a11y |
| `components/spatial/SystemNode.tsx` | a `compact` interval for a station that is an entry, `lg:` only | mobile route probe identical |
| `components/layout/SiteFooter.tsx`, `styles/globals.css` | the finale on the rail's datum, the axis from the footer's top to the action, the resolved-state caption at `lg`, no page-wide rule on the homepage (D-049 §5) | stills at 1440 and 1920; runtime probe (overflow 0 of 99, console 0 on content routes) |

New, not frozen: `tests/tools/lower-world-sheet.mjs`, the `projectDepth` cases in
`tests/unit/selected-systems.test.ts`. Untouched, byte for byte, against `816b408`:
`lib/spatial/*`, `SceneBreak.tsx`, `SpatialCamera.tsx`, `SpatialExperience.tsx`, `LowerRoute.tsx`,
`WorldGrammar.tsx`, `SystemsWord.tsx`, `RouteMap.tsx`, every project scene, `app/`.

### 6.4 V14.3 Gate D — one mark, one meaning; no orange; every line a fact (2026-09-07)

The reopening continued under the owner's V14.3 Gate D brief (duplicated corner marks, all
visible orange, generic node-network graphics; nothing else). D-050 and `docs/DESIGN_SYSTEM.md`
§42 record what moved and why; the evidence is `docs/review/v14.3-gate-d/`.

| File | Why | Measured by |
|---|---|---|
| `components/spatial/WorldGrammar.tsx` | no registration tick at desktop project scenes; route two, its stations and the landing corner in ink; the mobile rail in ink (colour only) | stills; transition sheets at the cut both ways; mobile route probe identical |
| `components/spatial/RouteMap.tsx` | one ink; the `revealed` state removed with its caller; no junction ring | stills at the handoff, the surface return and the finale |
| `components/spatial/SystemsWord.tsx` | the map under the opened surface removed | the cut's polyline ceiling (0 ≤ 2); transition sheets |
| `components/spatial/SceneBreak.tsx` | the mobile rails' hairline and the boundary section's mark on the line token (colour only) | mobile route probe identical; cover contracts unchanged |
| `components/spatial/SystemPOV.tsx`, `SpatialProjectScene.tsx`, `SpatialExperience.tsx` | the case-index dash in graphite; the affordance's corner removed and its hover in ink; the surface-return dash in ink | stills at the project scenes and the surface return |
| `components/sections/{SelectedSystems,AboutPreview}.tsx` | the branch ring and the mobile bar in ink (colour only) | stills; mobile route probe identical |
| **Case-study system** (frozen `5000201`): `components/ui/{Figure,FigureInspect,TextLink,ButtonLink}.tsx`, `components/project/{ProjectCard,LayerExplorer,ProjectNeighbours}.tsx`, `lib/content/mdx.tsx`, `components/layout/SiteHeader.tsx`, `app/opengraph-image.tsx`, thirteen `public/images/projects/**/*.svg` | reopened on the owner's explicit instruction ("remove ALL visible orange"): hover colours, the active dot, the card boundary, the OG rule and the diagrams' accent strokes to ink / graphite; `Figure` gained a `data-figure-tick` attribute (rendering identical off the tour) | full Chromium project (`work`, `shell`, `seo`, `a11y` included); unit suite; no geometry touched |
| `styles/globals.css` | the three signal tokens removed; one homepage-scoped rule hiding the plate ticks inside the tour at `lg` | build (no unresolved utilities); runtime probe |

Untouched, byte for byte, against `2eb06c1`: `lib/spatial/*`, `SpatialCamera.tsx`, `LowerRoute.tsx`,
`SystemNode.tsx`, `ProjectPlane.tsx`, every case-study layout, `app/` but for the OG rule's colour.

### 6.5 V14.3 Gate E — readable on arrival (2026-09-07)

The reopening continued under the owner's V14.3 Gate E brief (earlier clarity, breathing room,
microtext; nothing else). D-051 and `docs/DESIGN_SYSTEM.md` §43 record what moved and why; the
evidence is `docs/review/v14.3-gate-e/`.

| File | Why | Measured by |
|---|---|---|
| `lib/spatial/systemPov.ts` (`scenePresence`, desktop branch) | acquired earlier, detected less muted; release unchanged | approach sheets at 1440 and 1920; `spatial-system-pov` unit 23/23; mobile branch untouched |
| `components/spatial/SystemPOV.tsx` | brackets and facts on the earlier window at `lg`; the compact frame unchanged | approach sheets |
| `components/ui/motion/Reveal.tsx` | an `early` option, desktop-only, taken by the four lower sections | entry probe (`metrics/entry.txt`); the reveal contract |
| `components/spatial/SystemNode.tsx` | desktop presence early and at a readable weight, the state word gone at `lg`, a `major` interval; the mobile register byte-for-byte | entry probe; mobile route probe identical |
| `components/sections/{SelectedSystems,HowIBuild,FieldNotes,AboutPreview}.tsx` | early reveals, major intervals, label-size classifications and index link, ink verification (`lg:` only); About's desktop resolve curve | stills; lower-world sheets both ways; page-length JSON |
| `lib/utils/useIsDesktop.ts` (new) | the breakpoint, settled after mount, so timing changes never reach the mobile composition | mobile route probe identical |
| `styles/globals.css` | 2rem above the finale on the homepage at `lg` | page-length JSON |

Untouched, byte for byte, against `b4921e1`: `lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
planeChoreography,projectGround,editorialDrift}.ts`, `SceneBreak.tsx`, `SpatialCamera.tsx`,
`SpatialExperience.tsx`, `WorldGrammar.tsx`, `RouteMap.tsx`, `ProjectPlane.tsx`, `LowerRoute.tsx`,
every project scene, the case-study system, `app/`.

### 6.6 V14.4 owner visual correction — the black state, the operator's frame, registers (2026-09-08)

D-052 and `docs/DESIGN_SYSTEM.md` §44 record what moved and why; the evidence is
`docs/review/v14.4-owner-correction/`.

| File | Why | Measured by |
|---|---|---|
| `components/spatial/SystemsWord.tsx` | the desktop surface reveal (seam, recess, strata) removed; the mobile compact cut untouched | transition sheets both ways; the restated cut contracts |
| `components/spatial/SceneBreak.tsx`, `lib/spatial/surfaceCover.ts` | the cover is ink, decisive (40% of each half of the window), carrying the section in paper | the cover contracts (opaque at the cut, by opacity, ink); `surface-cover` unit 5/5 |
| `lib/spatial/systemPov.ts`, `components/spatial/SpatialCamera.tsx` (one branch on one line) | the word's own presence curve, desktop only | the approach sheet |
| `components/spatial/WorldGrammar.tsx` | strata from the cut on; `StateChanges` and the terminus map removed; the route register in their place | sheets; stills at the handoff and the surface return |
| `components/spatial/SpatialExperience.tsx` | the four stations' titles threaded to the register | stills |
| `components/layout/SiteFooter.tsx` | the finale's map replaced by the resolved register; `RouteMap.tsx` deleted | stills; the CTA contracts |
| `components/spatial/SystemNode.tsx`, `components/sections/{AboutPreview,HowIBuild}.tsx`, `styles/globals.css` | 160px major intervals, the About stage and name, the second floors drawing removed, 80px above the finale | lower-world sheets both ways; the page-length JSON |

Untouched, byte for byte, against `4810181`: `lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
planeChoreography,projectGround,editorialDrift}.ts`, `LowerRoute.tsx`, `ProjectPlane.tsx`,
`SpatialProjectScene.tsx`, `SystemPOV.tsx`, every project scene, the case-study system, `app/`.

### 6.7 V14.5 visual gate — the older SYSTEMS restored, the Machine's state, the index as a file (2026-09-08)

D-053 and `docs/DESIGN_SYSTEM.md` §45 record what moved and why; the evidence is
`docs/review/v14.5-visual-gate/`.

| File | Why | Measured by |
|---|---|---|
| `components/spatial/SceneBreak.tsx` | the V4 rails on desktop again; the system in paper above them through the dwell; the V14.4 cover removed (`lib/spatial/surfaceCover.ts` and its unit test deleted) | the two `f4bdab3` rail contracts; transition sheets both ways at 1440, 1920 smoke |
| `components/spatial/SystemsWord.tsx` | the structure beneath the word (straight rules, names), desktop | the atmosphere contract; the approach sheet |
| `lib/spatial/systemPov.ts` | the word's entrance curve | the approach sheet |
| `components/spatial/SystemPOV.tsx` | the state word in the acquisition frame's index line, desktop | stills at the project scenes |
| `components/spatial/{WorldGrammar,SpatialCamera,SpatialExperience}.tsx`, `components/layout/SiteFooter.tsx` | the terminus and finale registers removed with their plumbing | stills at the handoff, the surface return, the finale |
| `components/sections/SelectedSystems.tsx` | the index as a file, `lg:` only | stills; the home contracts (15 layer records, links, the caption) |

Untouched, byte for byte, against `ec37eb1`: `lib/spatial/{cameraFilter,sceneRoute,scenes,worldFit,
planeChoreography,projectGround,editorialDrift}.ts`, `LowerRoute.tsx`, `ProjectPlane.tsx`,
`SpatialProjectScene.tsx`, `SystemNode.tsx`, `AboutPreview.tsx`, `HowIBuild.tsx`, `FieldNotes.tsx`,
`styles/globals.css`, the case-study system, `app/`.
