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
