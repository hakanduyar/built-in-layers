# FABLE GATE 1 — DESKTOP FINAL ART DIRECTION (DropSpot + lower homepage)

**Raised by:** Opus 5 (High), autonomous engineering supervisor
**Date:** 2026-08-31
**Branch:** `feature/spatial-portfolio-v5`
**HEAD at gate:** see `git log -1` (checkpoint committed immediately before this gate)
**Model requested:** Claude Fable 5 — `ultracode - xhigh+workflows`

---

## 1. Why this is a gate and not more engineering

Before raising it I ran an adversarial refutation panel (4 independent lenses) whose explicit job
was to prove the remaining problems were mechanical and that this gate was premature. **It partly
succeeded, and I acted on everything it found.** Two real mechanical defects were discovered and
are now fixed (§3). What survived refutation is stated in §4 and is genuinely compositional.

I am not asking for a redesign. I am asking for **decisions** on a small number of questions that
measurement cannot settle.

---

## 2. The human feedback still outstanding

From the owner's last review, verbatim in substance:

- DropSpot screenshot **width was acceptable** — do not widen further.
- Screenshot/evidence **vertical presence is still too short**.
- The pale supporting **world plane looked badly / arbitrarily aligned**.
- **Kıvılcım is the quality benchmark**; DropSpot was **not** approved.
- The **lower half** still feels weaker than Kıvılcım / SYSTEMS / UNDERNEATH.
- POI / The Machine / Samaritan influence must come from **structure and behaviour** — state,
  acquisition, route, topology, classification, resolution, layer relationships — **never** from
  HUD decoration, fake telemetry, arbitrary coordinates or sci-fi clutter.

---

## 3. Mechanical defects I already found and fixed (do not re-litigate)

| Defect | Evidence | Fix |
|---|---|---|
| **Plane right edge registered to nothing** — the code claimed it landed on "91vw"; after an earlier vw→scene-fraction conversion that arithmetic was stale and the edge sat **57–70px adrift** (x1367 vs scene block x1297) | measured at 1440 and 2552 | `width` 0.85 → **0.79** so `offset.x + width == 1.00` scene units — the right edge now registers **exactly** on the scene block's right edge, at every viewport by construction (measured 1296 vs 1297) |
| **Every project plane was floored at opacity 0.14 forever** — `sceneProximity` returns exactly 0 outside a scene's window, so the DropSpot plane stayed painted inside the **frozen Kıvılcım frame**, and DropSpot's `offset.x` had been pushed 0.14→0.21 purely to dodge that leak, costing 82px of its own ground | plane[dropspot] opacity **0.140** at kivilcim-focus | presence is now `0.66 * max(0, near)` — **identical at focus** (0.66), decays to **0.000** out of window. One plane's placement is no longer hostage to another's leak. |
| Reduced-motion **hydration failure** (React #418) regenerating the whole lower page | server `translateX(…0.04…)` vs client `…0.22…` | new `useSettledReducedMotion()`; applied to `EditorialDrift`, `AboutPreview`, `SystemNode` |
| `Target ref is defined but not hydrated` | `useScroll` targeted `spacerRef`, which only exists in the enhanced tree | target supplied only while `enhanced` |

**Verified after the fixes:** Kıvılcım focus frame is **pixel-identical** (0 pixels differ >2/255 at
1440; 29 px at ≤4/255 at 2552 = antialiasing). Production and reduced-motion consoles clean.
typecheck / lint / prettier clean, unit **491/491**, build 14/14, overflow **0px** at
320/375/768/1024/1440/2552 in both motion modes.

**`offset.x = 0.21` is now free.** It was a collision constant; with the opacity floor gone it can
return toward 0.14 (or anywhere) purely on compositional merit. That is one of your levers.

---

## 4. What genuinely remains — the questions only art direction can answer

### Q1. The evidence-height problem is an ASPECT-RATIO problem, and every solution costs something

Hard arithmetic, measured at 1440×900, DropSpot focus:

| | asset | intrinsic AR | rendered at accepted width | height as % of viewport |
|---|---|---|---|---|
| **Kıvılcım (benchmark)** | `local-first-architecture.svg` | **1.600** | 833×**521** | **57.9%** |
| DropSpot primary | `browse-drops.webp` | **2.198** | 887×**403** | 44.8% |
| DropSpot secondary | `drop-detail.webp` | 2.068 | 556×269 | 29.9% |

At a fixed 887px width, `height = 887 / AR`. Matching the benchmark's 521px requires **AR 1.703**.
**Every** DropSpot real screenshot is 2.068–2.324. The shallowest is 2.068. So:

> No non-cropping, non-distorting change can make a **real DropSpot screenshot** as tall as
> Kıvılcım's diagram at the accepted width. That is arithmetic, not a bug.
> (Verified: `object-fit` is `fill` and rendered AR == intrinsic AR to 3 decimals at every beat —
> there is no crop bug, no distortion, no container bug to fix.)

Also worth knowing, because it re-frames the complaint: the evidence **group** already spans 539px
against Kıvılcım's 557px figure — only **3.2% apart**. What is short is the largest **continuous**
plate: 439px vs 557px, a **118px** gap. The perceived deficit is about one dominant mass, not total
extent.

**The three real options, with their true prices — pick one:**

- **(a) Crop to the benchmark ratio.** An opt-in `frameRatio` prop on `Figure` + `object-fit: cover`
  hits **exactly 521px** at the current width, no widening, no distortion, Kıvılcım untouched.
  **Price:** 22.5% of the screenshot's width (≈316 of 1400 source px) leaves the frame — roughly
  0.7 of a product card. The D-019 caption says *"browsing drops with waitlist status visible"*, so
  the crop window must keep that true. A half-measure at AR 1.928 gives 460px (+57px) for a 12.3%
  crop. **Choosing the crop window is a design decision, not a layout one.**
- **(b) Change what the secondary slot holds.** DropSpot registers three **1600×1000 (AR 1.600)**
  verified diagrams. One in the secondary slot renders **556×348** instead of 269 — **+79px of
  real, uncropped evidence**. **Price:** the pair stops arguing *surface + surface* and starts
  arguing *surface + system*. Arguably on-message for this site; still an editorial call.
- **(c) Change the lead asset to a diagram.** Reaches **554px** — taller than the benchmark, zero
  crop. **Price:** the scene's declared identity. Its marker literally reads `REAL SCREENSHOT`;
  `representativeAsset()` prefers real screenshots deliberately and a unit test pins it. A
  diagram-led DropSpot risks becoming Kıvılcım-with-a-different-diagram, which the component
  contract explicitly forbids. **I recommend against (c)** but record it because it is available.

Positional levers alone are exhausted: every overlap/gap/padding retune is ceiling-bound at about
**+6%**, and the group's bottom (y852) is already **48px** from the camera's clip edge.

**Also measured, yours to judge:** the secondary shot currently occludes **15.6%** of the primary.
Reducing that is a one-line offset change — but *how much* evidence should overlap is composition.

### Q2. The plane's VERTICAL placement has no derivable anchor

Horizontal registration is now solved and provably correct (§3). But `offset.y = 0.22` and
`height = 0.45` register to nothing and **cannot** be derived — the panel confirmed only a feasible
band exists, not a correct value. What should the plane's top and bottom relate to: the primary
media's top? the identity block's baseline? the scene block's bottom? Should it read as *ground the
evidence stands on*, or as *a surface the evidence hangs in front of*? That is your call.

### Q3. The lower half, still weaker than the top

Built for Real Life · How I Build · Field Notes · About · Back on the Surface · the CTA finale.
Current state is captured in the artifacts. The specific question: these were rebuilt into
two-axis registers in an earlier pass, and they are *tidy* — but the owner still reads them as
weaker than Kıvılcım / SYSTEMS / UNDERNEATH. What is the actual compositional idea that makes the
lower page belong to the same system, expressed through **structure and behaviour** rather than
added marks?

---

## 5. FROZEN — do not touch

- **Kıvılcım** — composition, plane, and its 1440 focus frame is a pixel gate.
- **SYSTEMS** — core concept and intact typography.
- **The deterministic bidirectional black transition** and its state machine.
- **UNDERNEATH** core composition.
- **The main spatial diagonal route** and its geometry.
- The **opening glide** (`glideStep` / `ENTRY_GLIDE_TO`).
- Do **not** change Kıvılcım to make DropSpot easier.
- Do **not** invent project facts, metrics, or diagrams (`CLAUDE.md` §11). Missing facts go to
  `docs/CONTENT_GAPS.md`.

---

## 6. Files you will most likely touch

| File | Role |
|---|---|
| `components/spatial/SpatialProjectScene.tsx` | the `stacked` branch **is** DropSpot's composition; `secondary` selection at ~L61; pair geometry at ~L204; reserved extent ~L210 |
| `components/spatial/SpatialCamera.tsx` | the two `ProjectPlane` instances (~L745–825) |
| `components/spatial/ProjectPlane.tsx` | plane placement + presence model |
| `components/ui/Figure.tsx` | shared media primitive — **also renders frozen Kıvılcım**, so any change must be prop-gated and default to today's behaviour |
| `components/sections/*.tsx` | the lower-half sections |
| `components/layout/SiteFooter.tsx` | the CTA finale |

---

## 7. Acceptance criteria

1. DropSpot reads as deliberately composed at **1440×900 and 2552×1200**, at **all four beats**
   (entry / mid / focus / exit) — not only at focus.
2. The evidence has real vertical presence; if that costs a crop, the crop keeps the caption true.
3. The plane reads as an intentional spatial object with legible registration — its horizontal
   registration is already exact, so this is about the vertical relationship.
4. Kıvılcım's 1440 focus frame stays **pixel-identical** (the gate I will re-run).
5. Nothing in §5 regresses.
6. No filler, no HUD decoration, no fake telemetry, no invented facts.
7. The lower half belongs to the same system as the top.

---

## 8. Artifacts

- **Before fixes:** `/home/hakan/spatial-fable-gate1-evidence/*.png` — 5 beats × 2 viewports
  (`01-kivilcim-focus-BENCHMARK` is the frozen benchmark).
- **After my mechanical fixes:** `/home/hakan/spatial-fable-gate1-evidence/after/*.png` — same set.
- Measurement scripts (re-runnable against a server on :3608):
  `p3-measure.mjs` (beat geometry), `p3-anchors.mjs` (alignment anchors), `p3-shots.mjs` (captures),
  `overflow-check.mjs`, `p2-runtime.mjs` (console/lifecycle/a11y) — all in the session scratchpad
  `/tmp/claude-1000/-home-hakan-GitHub-portfolio/712926f4-1179-4197-a46f-9b0b1f08f6bf/scratchpad/`.

---

## 9. Return contract

Write `.ai/handoffs/OPUS-RETURN.md` containing: what you changed and why; which of Q1's options you
chose and the price you accepted; the compositional rule you applied to Q2; your approach to Q3;
any file you touched that is shared with a frozen area and how you proved no regression; and the
artifacts you captured. Opus then independently re-validates (typecheck, lint, prettier, unit,
build, Chromium, WebKit where practical, reduced motion, keyboard/focus, overflow, the Kıvılcım
pixel gate), fixes mechanical regressions itself, and checkpoints + pushes.
