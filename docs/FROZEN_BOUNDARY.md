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
measured change rather than a side effect. Five have moved since, each with its evidence; they are
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

On `feature/project-architecture-v13`, the §4 loop prints exactly these five lines. Nothing else
under `lib/spatial/`, `components/spatial/` or `components/sections/` has moved, and no file has
been added to or removed from the 30.

| File | `243db393` | now | Granted by | Measured evidence |
|---|---|---|---|---|
| `components/spatial/SpatialExperience.tsx` | `fa941e8` | `8568129` | hero-clipping fix, commit `76c5660` | `FABLE-RETURN.md` §5 (defect, five frozen stills) and §11.3 A (fix, eight viewports); `metrics/final/hero-unit.txt` |
| `lib/spatial/projectGround.ts` | `aa159e9` | `6431139` | **D-028** | `FABLE-RETURN.md` §11.3 B; `metrics/{before,final}/fable-gate-all.json`, key `groundOutsideEvidence` |
| `components/spatial/SpatialProjectScene.tsx` | `edb9cd4` | `34b48d5` | **D-029** (finding C) | `FABLE-RETURN.md` §11.3 C; same metrics, plate-bottom clearance |
| `components/sections/HowIBuild.tsx` | `a48126a` | `2d90924` | **D-029** (finding E) | `FABLE-RETURN.md` §11.3 E; `metrics/final/lower-world.json` |
| `components/sections/SelectedSystems.tsx` | `751aa48` | `592b79e` | **D-029** (finding E) | `FABLE-RETURN.md` §11.3 E; same file, label/column offset |

Metric paths are relative to `docs/review/v13-fable-gate/`. D-028 and D-029 are accepted on this
branch under the art-direction gate's delegated authority and are **not in force on `main`**; the
boundary on `main` remains all 30 blobs at `243db393`.

**§3.1 is resolved, not open.** The ruling it asked for was answered by D-027: Software Factory
stays at `depth: preview`, so `SpatialProjectScene.tsx`'s `project.depth` branch still renders
"Open system" and the question of a content-driven string change inside a frozen scene did not
arise. `isCaseStudyDestination` now reads the same `depth` field for the case-study route's exit
(D-029), which is the same data answering the same question in a second place.
