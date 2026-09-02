# FABLE RETURN — FINAL ART DIRECTION

| | |
|---|---|
| Model | `claude-fable-5-1` |
| Effort | `max` |
| Gate | `.ai/handoffs/FABLE-GATE.md` (2026-09-03 rewrite) |
| Repository / branch | `C:\GitHub\portfolio` · `feature/project-architecture-v13` |
| Starting HEAD | `a5da0ed24a693063affe81ed525a979e745c8a34` (the gate document says `bc2dad3`; `a5da0ed` is one docs-only commit later — `git diff --stat bc2dad3 a5da0ed` touches only `.ai/` and `docs/PROJECT_ARCHITECTURE_ACCEPTANCE.md`) |
| Final HEAD | `a5da0ed24a693063affe81ed525a979e745c8a34` — **unchanged. Nothing was committed or pushed** (see §1) |
| Frozen base | `243db393` (V12 desktop freeze) |
| Working tree at return | ` M components/spatial/SpatialExperience.tsx` (this gate, uncommitted, see §5) · ` M .ai/orchestrator/*` (the launcher's) · `?? docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (preserved) |
| Verdict | **NOT READY** (§10) |

## 1. What this session could and could not do — read this first

The gate's method is RENDER → WATCH → CRITIQUE → MODIFY → RENDER → COMPARE. In this session the
RENDER half of that loop was not available, and I am not going to describe the result as if it had
been.

- The session ran in `acceptEdits` permission mode, non-interactively. Every command that builds,
  serves or tests was refused: `pnpm *`, `npm run *`, `npx`, `node`, `./node_modules/.bin/*`,
  `curl`, every PowerShell cmdlet, and any compound Bash command (`&&`, `;`). Only single `git`,
  `ls`, `wc` invocations and the file tools ran. The Playwright MCP server failed to connect
  (`ConnectionRefused`). I did not widen my own permissions and did not use remote execution.
- Consequently: **no production build, no served site, no new capture at any viewport or zoom, no
  recording, and no validation suite** (`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`).
  The gate requires the validation suite before any commit, so **nothing was committed**. The one
  code change (§5) is left in the working tree, declared, and arithmetic-verified against the
  frozen stills — not build-verified.
- What I *could* do, and did: read the whole spatial system, the case-study route, the content,
  the tests and every governing document; and WATCH the **221 existing V12 artifacts** under
  `docs/review/v12-codex-gate/` frame by frame — stills at 1366/1440/1536/1920/2560, the
  80/67/50 % zoom set, the per-project entry → mid-entry → focus → early-exit → exit phase sets, the
  sharpness-while-moving frames, the recording frames, the reduced-motion frame — and measure on
  them. Every finding below names the frame it was measured on. Where a finding needed a render to
  settle, I say so and give the directive with numbers instead of guessing.

This is the first objective engineering finding: **the final art-direction gate cannot currently
be executed inside the pipeline's own sandbox.** The Fable stage needs either a permission profile
that allows `pnpm build`/`pnpm start`/Playwright, or a pre-rendered artifact set produced by the
stage before it. It is recorded again in §9.

## 2. Method

1. Read: `FABLE-GATE.md`, `DESKTOP_FREEZE_ACCEPTANCE.md`, `FROZEN_BOUNDARY.md`,
   `PROJECT_ARCHITECTURE_ACCEPTANCE.md`, `DECISIONS.md` D-019/D-021/D-022…D-027,
   `DESIGN_SYSTEM.md` §32–§36, `CONTENT_GAPS.md`, `CLAUDE.md`, `PROJECT_SPEC.md` §7.
2. Read the code that produces what the stills show: `lib/spatial/{worldFit,scenes,sceneRoute,
   projectGround,systemPov}.ts`, `components/spatial/{SpatialExperience,SpatialCamera,
   SpatialProjectScene,DirectionalField,TravelMaterial}.tsx`, `components/sections/*`,
   `app/work/[slug]/page.tsx`, `components/project/*`, `components/ui/Figure.tsx`,
   `lib/content/work.ts`, all `content/work/**/*.mdx`, and the unit/e2e tests that fence them.
3. Watched and measured the V12 frames listed in §8. Judged against the gate's §3 criteria and
   §4 preserve/reject lists.
4. Made exactly one change, where the defect was unambiguous on five independent frames, the fix
   is provably pixel-identical at every approved viewport, and no test or contract moves (§5).
5. Everything else that needs a rendering loop is written as a directive with the measurement that
   justifies it (§4), for the pass that can render.

## 3. Standing verdicts I can confirm from the evidence

These are the things the gate says to preserve or to keep out. All confirmed on the frames.

- **Hero identity** — wordmark, lead rule, thesis column, ghost `Surface`: intact at 1366/1440/1536.
  Broken above ~1600 px (finding A, fixed).
- **Kıvılcım's foreground** — the strongest single frame in the world at every viewport. Preserved.
- **SYSTEMS typography and the surface-opening** — intact, unbroken letterforms, the opened plate
  reads as one gesture at 1440/1536/1920. Only at 50 % zoom (3840 CSS px) does the opened surface
  reveal itself as a finite rotated plate with visible corners; acceptable extreme-zoom
  degradation, not a defect at any working zoom.
- **UNDERNEATH and the deterministic geometric transition** — held; recording frames 7 and 9 of
  the diagonal-to-vertical set show one continuous system, not two.
- **Warm off-white restrained language** — held everywhere. No neon, no glass, no blobs.
- **Rejected devices absent**: no wall collision/recoil, no eroded SYSTEMS type, no peel/hatch, no
  HUD, no telemetry or coordinates, no fake code, no decorative technical noise. The only pale
  rectangles in the lower world are the three seam/tick/hairline marks V11 introduced; none is an
  arbitrary filler box.
- **Sharp while moving** — `sharpness/1920x1080--moving.png`: text edges and the DropSpot
  screenshot are optically sharp mid-travel. Consistent with V11's `zoom` fix.
- **Motion feel** (violence, reverse, coast) — **cannot be judged from stills**. V10/V11 recorded
  numbers (coast 0.58 vh, reverse 1 notch/0 px wrong-way) are the last measurements; I did not
  reproduce them and do not vouch for them.

## 4. Art-direction findings

Ordered by how much they cost the "finished premium portfolio" reading. Each carries its evidence
and its disposition: **FIXED** (§5) or **DIRECTIVE** (for the rendering pass).

### A. The site's primary line is cut on every display wider than ~1600 px — FIXED

The hero's structural lead rule and the thesis column ("Interfaces on the surface. Systems
underneath.") were positioned in raw `vw` (`ml-[30vw]`, `width: 18vw`, `lg:ml-[48vw]`) inside a
scene block that stops growing at `SCENE_WIDTH = min(84vw, 1180px)`. Above ~1405 px the block is a
fixed 1180 px while the offsets keep growing, and the block clips its overflow.

Measured on the frozen stills:

| Frame | 48 vw | Block | What the viewer saw |
|---|---|---|---|
| `responsive/1920x1080--hero.png` | 922 px | 1180 px | thesis column (26 rem = 416 px) clipped mid-word |
| `responsive/2560x1440--hero.png` | 1229 px | 1180 px | thesis absent entirely (starts 49 px outside the block); lead rule cut short |
| `zoom/2400x1350@80--hero.png` (1920 @ 80 %) | 1152 px | 1180 px | only the column's 2 px left border survives as an orphan stroke at the block edge |
| `zoom/2866x1612@67--hero.png` | 1376 px | 1180 px | thesis absent |
| `zoom/3840x2160@50--hero.png` | 1843 px | 1180 px | thesis absent; 28 px fragment of the rule; the "ROU…" cue clipped |

The reduced-motion tree shares this markup (inside the 1320 px container) and clipped the same way.
This is not a taste call: the homepage's one sentence of positioning did not render on a 1920 or
2560 display, and no existing test could see it — `tests/e2e/home.spec.ts:11` and
`motion.spec.ts:17` assert the text is present, at a 1280 × 720 viewport, where it is.

**Fix (§5):** a hero unit `min(1vw, 15.36px)` — exactly `1vw` up to 1536 (the widest approved
viewport and the widest at which 48 vw + 26 rem still fits the block), so the 1366/1440/1536 frames
are pixel-identical by construction; above that the hero holds the composition it was approved at,
which is precisely what `WORLD_UNIT` already does for the rest of the world. The rule's rise takes
`WORLD_UNIT.y` so that with its run capped it stays within ~1.5° of the first travel leg (the
approved 1536 frame already carried a 1.3° difference). Results by arithmetic: 1920 — rule
461 → 737 px, thesis 737 → 1153 px inside a 1180 px block; 2560 — thesis ends at page-x 1773 against
a block edge at 1800; 67 % — 1926 < 1953; 50 % — 2413 < 2440; reduced-motion tree at 1920/2560 —
ends 1453/1773 inside the container. **Not build-verified** (§1). The rendering pass must confirm
the five frames above and re-shoot 1366/1440/1536 to prove the zero-diff claim.

### B. Kıvılcım's and JointLedger's grounds trail as blank beige — DIRECTIVE

The gate's test: the ground must lead → resolve → trail, and must not read as "a beige rectangle
moving behind a card." At **focus** it passes — every project's ground is registered on its
evidence (0 px at focus, re-proven V11). The failure is in **shape**, and it shows on exit.

`lib/spatial/projectGround.ts` sizes the ground from the union of the evidence elements plus
bleed: `top = clamp(visual.y·0.65 + visual.height·0.1, .08, .22)`, `height = clamp(visual.height
+ 0.10, .51, .58)`. For Kıvılcım and JointLedger the evidence sits high in the scene, so `top`
clamps to the 0.08 floor while the height still carries both bleeds — the whole surplus lands
**below** the evidence:

| Frame | Ground below the evidence |
|---|---|
| `responsive/1920x1080--kivilcim.png` | 215 px of empty ground |
| `responsive/1920x1080--jointledger.png` | 210 px |
| `responsive/2560x1440--jointledger.png` | 213 px |
| `responsive/1440x900--kivilcim.png` / `--jointledger.png` | 185 / 182 px |

Software Factory and DropSpot are balanced (their evidence sits lower, so the same rule
distributes the bleed). The motion consequence is the tell: on exit the blank part is what trails
last — `project-phases/1536x864--jointledger--early-exit.png` is roughly 45 % blank ground with the
evidence already leaving the frame. At that moment it *is* a beige rectangle behind a card.

**Directive.** Anchor the ground's *bottom* to the evidence union (bottom = union bottom +
`blockPadding`), letting `height` follow rather than lead, and let the bleed split above/below in
the ratio the evidence's own position implies; consider lowering `minHeight` from 0.51. Then
re-measure lead/align/trail at 1440/1536/1920/2560 and **update the contract in
`tests/unit/project-ground.test.ts` (lines 23–28, 46) from the measurements** — it encodes the
current shape, so it will move; that is a contract refinement, not a weakening, and it must be
written from numbers, not from this paragraph. This touches a frozen file (`projectGround.ts`) and
requires the same evidence standard as §5. I did not do it blind.

### C. Software Factory's focus frame is bottom-tight — DIRECTIVE

The flagship must feel foundational. At focus its plate touches the frame:

| Frame | Plate bottom / frame | Category label y |
|---|---|---|
| `responsive/1440x900--software-factory.png` | 897 / 900 px | 58 px |
| `project-phases/1536x864--software-factory--focus.png` | 857 / 864 px | 50 px |
| `responsive/1920x1080--software-factory.png` | 1060 / 1080 px | — |

3–20 px of paper under the flagship's evidence, against ~50 px above its label, reads as
"cut by the frame," not "grounded." The remedy is compositional, not a nudge: either the scene's
vertical registration (`items-start` box, `SCENE_MIN_HEIGHT`) or the flagship's plate scale at
`variant="foundation"`. Both are frozen (`SpatialProjectScene.tsx`, `scenes.ts`), so this is for the
rendering pass with before/after frames at the three viewports above.

### D. The case-study pages have never been designed — DIRECTIVE (the largest finding)

`/work/kivilcim`, `/work/jointledger`, `/work/dropspot`, `/work/software-factory`,
`/work/professional-systems`. No capture of any of them exists in the 221 artifacts; the gate is
right that they were never art-directed. From the code and content:

1. **Inverted hierarchy.** The case-study `h1` is `text-heading-l` — `clamp(1.75rem, 3vw, 2.5rem)`,
   40 px at desktop. On the homepage the same project's title is `text-display-l` (64 px) and
   Software Factory's is `text-display-xl` (up to 104 px); every lower-world section heading is
   64 px. A project's own page gives it the smallest title it has anywhere on the site. Set the
   case-study `h1` at `text-display-l`; the unit test asserts the hero contains `"text-heading-l"`
   only as a class string, so the assertion must be updated to the new token, not deleted.
2. **No evidence in the hero.** `CaseStudyHero` is label → title → description (→ fork line). The
   first thing a case study shows is a paragraph; the diagrams and screenshots begin only inside
   the layer tabs, one to three screens down. Each project already has a published lead asset:
   the `/work` cards use `images[0]`, the homepage scene picks a real screenshot, else the
   system-layer diagram (`lib/spatial/systemPov.ts:43-45`). Use the homepage's rule, so the hero
   evidence is the image the visitor just left, and bring it in as a `Figure` with its real
   caption — no new asset, no crop that hides what the caption claims.
3. **The record vocabulary is dropped.** The homepage register states provenance · phase ·
   verification for every system. The case-study page states none of them, and two fields that
   `CLAUDE.md` §11 requires the site to communicate — the `contribution` statement and, where
   `aiAssisted`, the `aiDisclosure` — are validated as required in `lib/content/schemas.ts` but **are
   not rendered anywhere on the site** (grep of `app/` and `components/`: zero uses). Kıvılcım's and
   Software Factory's AI-assisted provenance is invisible to a reader. Directive: a one-line mono
   record row under the title (`PERSONAL · ACTIVE DEVELOPMENT · VERIFIED AGAINST REPOSITORY`) and
   a "Contribution" block carrying the frontmatter sentence verbatim, with the AI disclosure beneath
   it when present. This is also an objective finding (§9).
4. **Software Factory's own page has no diagram.** The flagship's page renders three paragraphs, a
   tech line and one link. Its verified factory-loop diagram exists in frontmatter and shows on the
   homepage, but `/work/software-factory` never renders `project.images` and has no layer files to
   carry a `<Figure>`. The page that should feel most systemic is the barest. Finding 2 fixes this
   without inventing anything.
5. **Professional Systems reads as a failed load.** Label `PROFESSIONAL SYSTEMS`, title
   "Professional Systems", one sentence, nothing else (`tech: []`, `links: []`). The role is right
   and must stay publication-safe, but a designed preview state — the provisional illustration it
   already owns, a mono `PREVIEW · AWAITING APPROVAL FOR PUBLICATION` record, a return link to
   `/work` — is the difference between "deliberately withheld" and "broken."
6. **A 42 rem column in a 1320 px container.** Everything is `max-w-[42rem]` and left-aligned;
   at ≥ 1920 roughly 650 px of the right side is unused on every screen of every case study. The
   homepage's asymmetric discipline should continue here: reading column left, evidence (figures
   at intrinsic width, up to the container), and the decisions' *context/choice/trade-off* set as a
   two-column pair at ≥ lg rather than a run of `<strong>`-led paragraphs.
7. **Decisions are the strongest content and the weakest typography.** Six decisions for Kıvılcım,
   four each for JointLedger and DropSpot, each with a real trade-off — set as `heading-m` title +
   four bold-lead paragraphs. Give the *Trade-off* the emphasis (it is the honest part) and the
   alternatives a list, not a comma join.
8. **Related, not cloned — the material already supports it.** Kıvılcım: three verified diagrams
   and one provisional illustration, six decisions, an Evolution section. JointLedger: four
   verified diagrams, a fork disclosure, no Evolution.
   DropSpot: four real screenshots + three diagrams, a "paused" phase. The asymmetry is truthful;
   the template flattens it into the same column with different lengths. Let the lead evidence and
   the record row carry the difference (a screenshot-led hero for DropSpot, a diagram-led one for
   the other two; "paused" stated in the record).
9. **Derived prev/next is correct and reads as a footnote.** `ProjectNeighbours` is one mono line
   at the very bottom. It is the only onward movement the page has; give it the register's
   `identity` weight (title at `heading-m`, the mono "Previous / Next project" as the label above
   it). Architecture unchanged — same derived data, same one nav landmark.

None of this was implemented: each item changes a rendered layout I could not see, and the gate's
standard is evidence. The tests that fence the page (`tests/unit/*` hero title / `text-heading-l` /
fork-disclosure assertions, `tests/e2e/work.spec.ts` navigation) must be read before any of it
moves.

### E. Lower world — mostly earned, three notes

- **SELECTED SYSTEMS** (`responsive/1920x1080--selected-systems.png`): the register holds the left
  two-thirds and leaves the right third empty at ≥ 1920; the column label "RESOLVED BY LAYER AND
  RECORD" sits at x ≈ 967 while the RECORD column it names begins at x ≈ 1047. Align the label to
  the column it labels; let the stack column take the remaining width. Row 05's kicker repeats its
  title (`categoryLabel: "PROFESSIONAL SYSTEMS"` = title) — owner content, noted only.
- **HOW I BUILD** (`responsive/1920x1080--how-i-build.png`): the owner-approved V9 consequence mark
  (a 40 px rule + rotated square under each title) bridges a ~340 px gap to its consequence; at that
  distance it reads as a link affordance on the title rather than a relation. Not a defect of the
  idea — of the distance. Either shorten the gap or extend the rule to the consequence column.
- **FIELD NOTES** (`responsive/1920x1080--field-notes.png`): thin, and truthfully so —
  `content/notes/` and `content/lab/` are empty (`.gitkeep`). The one-line editorial bridge is the
  honest state; it should not be padded. Not a finding against the design.
- **UNDERNEATH → transition → ABOUT → CTA**: no dead route observed on the stills; the CTA resolves
  on the button as V9 measured. No change.

### F. 2560 and zoom-out

- **Top-heavy shorter scenes at 2560 / 67 % / 50 %.** `CAMERA_INSET.top = 14vh` centres the 1040 px
  world reference at 2560 × 1440 (201.6 ≈ 200 px), but JointLedger's and Kıvılcım's compositions are
  ~760 px tall inside that 1040 reference, so at 2560 they sit high with ~280 px of paper below.
  Expansive rather than empty at 100 %; at 50 % it becomes visibly top-weighted. Same root as B —
  fixing the ground's shape removes most of it.
- **DirectionalField at DropSpot, 2560** (`responsive/2560x1440--dropspot.png`): the far chevron
  field's blurred edge enters the frame at the right; minor, plane-distant, acceptable.
- **50 % zoom**: the SYSTEMS plate shows its corners and the chevron fields read as literal
  chevrons. Acceptable degradation at a zoom no one reads at; not a working-zoom defect.
- **Capture methodology note**: the 2560 and zoom stills carry the Next.js dev badge in the corner
  — those frames were shot on the dev server, not the production build. Re-shoot the matrix on
  `pnpm build && pnpm start` before the freeze decision.

## 5. Changes made

**One file. Frozen. Uncommitted. Unvalidated.**

`components/spatial/SpatialExperience.tsx` — fingerprinted in `docs/FROZEN_BOUNDARY.md` §1 as blob
`fa941e858ec340fd40845be6d58e637320d4006e`; working tree now `8568129` (45 insertions, 3 deletions).
**I am editing a frozen file and saying so.** The visual reason and evidence are finding A: the
homepage's primary line did not render at 1920 or 2560 or at any zoom-out, measured on five frozen
stills. The standard the freeze was granted under is met the same way the freeze met it: the
approved 1366/1440/1536 frames are unchanged by construction (`min(1vw, 15.36px)` equals `1vw` at
every width ≤ 1536), and the rendering pass can prove that with a pixel diff.

Diff, in full:

```diff
+import type { CSSProperties } from "react";
+import { WORLD_UNIT } from "@/lib/spatial/worldFit";
 …
 const HERO_LEAD = heroLeadRule(18);
+/** V13 (Fable art direction) -- THE HERO'S OWN UNIT … (full measured rationale in the file) */
+const HERO_UNIT = { x: "min(1vw, 15.36px)", y: WORLD_UNIT.y } as const;
+const heroX = (vw: number) => `calc(${vw} * ${HERO_UNIT.x})`;
+const heroY = (vh: number) => `calc(${vh} * ${HERO_UNIT.y})`;
+const HERO_RULE_ORIGIN_VW = 30;
+const HERO_THESIS_X = heroX(HERO_RULE_ORIGIN_VW + HERO_LEAD.width);
 …
-  className="relative ml-[30vw] hidden lg:block"
-  style={{ width: `${HERO_LEAD.width}vw`, height: `${HERO_LEAD.height}vh` }}
+  className="relative hidden lg:block"
+  style={{ marginLeft: heroX(HERO_RULE_ORIGIN_VW), width: heroX(HERO_LEAD.width), height: heroY(HERO_LEAD.height) }}
 …
-<div className="mt-10 lg:ml-[48vw] lg:mt-0">
+<div className="mt-10 lg:ml-[var(--hero-thesis-x)] lg:mt-0"
+     style={{ "--hero-thesis-x": HERO_THESIS_X } as CSSProperties}>
```

What it does not change: the wordmark, the ghost `Surface`, the "Route 01 — four systems below" cue
(absolutely positioned inside the rule box, so it travels with it), the thesis copy, any route,
anchor, camera, ground or scene constant, any test. `heroLeadRule(18)` still sizes the rule; the
thesis x is *derived* from the rule's end rather than retyped as 48.

Why not the rest: every other finding either needs a render to be judged (D, E), moves a measured
contract that must be re-measured (B), or changes a frozen composition whose before/after I cannot
capture (C). Blind edits to those would be preference, which the gate forbids.

## 6. Architecture deliberately preserved

- Scroll physics: `ROUTE_MAX_RATE`, `useRouteGovernor`, coast/lead caps — untouched.
- Ordering and navigation (D-021, D-027): one global `order`, derived neighbours,
  `isCaseStudyDestination` by depth, preview projects outside the sequence — untouched. The
  case-study directives (D) change presentation of the same derived data only.
- World fit (`zoom`), `WORLD_UNIT`, `STEP_VW`, `CAMERA_INSET`, `SCENE_WIDTH`, scene anchors,
  `SCENE_ALLOWANCE` — untouched. The hero fix *reuses* `WORLD_UNIT.y` rather than adding a
  second vertical unit.
- Project-ground policy (`projectGround.ts`), plane grammar, registration by measurement — untouched;
  B is a directive for a measured refinement, explicitly not a return to hardcoded offsets.
- Content model, schemas, validation gates, MDX pipeline — untouched. No fact, screenshot, metric,
  timeline or URL was invented; every directive in D uses assets and fields that already exist.
- `main` and `feature/spatial-portfolio-v5` — not touched. No force push, no history rewrite.
  `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` — present, untouched.

## 7. Frozen areas

`docs/FROZEN_BOUNDARY.md` §1 lists 30 blobs. At HEAD `a5da0ed` all 30 equal their `243db393`
fingerprints — `git diff --stat bc2dad3 a5da0ed` shows only `.ai/` and one `docs/` file changed
since the pipeline last verified "all 30 blobs unchanged" (`.ai/orchestrator/state.json`). In the
**working tree**, 29 of 30 are unchanged and one is modified:

| File | Frozen blob | Working tree | Status |
|---|---|---|---|
| `components/spatial/SpatialExperience.tsx` | `fa941e8…` | `8568129…` | **MOVED — declared, §5** |
| the other 29 | = `243db393` | = `243db393` | held |

The §4 regression loop in `FROZEN_BOUNDARY.md` will print exactly one `MOVED:` line once this is
committed. That is the intended, declared outcome — not a slip.

## 8. Artifacts produced

**None new.** No render was possible (§1). Watched and measured, from `docs/review/v12-codex-gate/`:

- `responsive/`: 1920 × 1080 — hero, software-factory, kivilcim, jointledger, dropspot, tail,
  selected-systems, how-i-build, field-notes; 1440 × 900 — software-factory, kivilcim, jointledger,
  dropspot, tail; 2560 × 1440 — hero, jointledger, dropspot.
- `zoom/`: 2400 × 1350 @ 80 — hero; 2866 × 1612 @ 67 — hero, kivilcim; 3840 × 2160 @ 50 — hero, tail.
- `project-phases/` 1536 × 864: software-factory focus; jointledger entry, mid-entry, early-exit,
  exit.
- `sharpness/1920x1080--moving.png`; `recording-review/` 1536 diagonal-to-vertical frames 7 and 9;
  `reduced-motion/1440x900--top.png`.

No capture of any `/work/*` route exists in the set. That absence is itself recorded in §9.

## 9. Remaining objective engineering findings (for the final engineering QA)

1. **The Fable stage cannot render or validate inside its sandbox.** `acceptEdits` refused every
   build/serve/test/network command and compound shell command; Playwright MCP refused connection.
   Either grant the stage `pnpm build`/`pnpm start`/Playwright, or have the preceding stage produce
   the full still/recording matrix *from the production build* for it. Until then the gate's
   "render it yourself" is unsatisfiable and its verdict cannot honestly be FREEZE.
2. **Hero positioning defect (finding A)** — a real layout regression relative to the site's own
   world-unit principle, present at 243db393 and at HEAD, affecting the enhanced and reduced-motion
   trees at every width > ~1600 px. Fixed in the working tree; needs `pnpm typecheck`, `pnpm lint`,
   `pnpm test`, `pnpm build`, a Chromium/WebKit e2e run, and pixel diffs at 1366/1440/1536 (expect
   zero) plus new stills at 1920/2560/80/67/50 (expect the thesis fully inside the block).
3. **e2e blind spot.** The only assertions on the thesis line (`tests/e2e/home.spec.ts:11`,
   `tests/e2e/motion.spec.ts:17`) are text-presence checks at a 1280 × 720 project viewport. A
   clipped or off-block element passes them. Add a bounding-box-inside-scene-block assertion for the
   thesis and the lead rule at ≥ 1 wide viewport (1920 × 1080 at minimum), and consider a 2560
   project in `playwright.config`.
4. **`contribution` and `aiDisclosure` are required by schema and rendered nowhere.**
   `lib/content/schemas.ts:125` and `:157` enforce them; no file under `app/` or `components/`
   reads them. `CLAUDE.md` §11 ("every featured project must state Hakan's specific contribution";
   "clearly distinguish … AI-assisted work") is met in frontmatter only. `docs/QA_CHECKLIST.md:23`
   marks it done. Decide where they render (D.3 proposes the case-study hero) and add a unit test
   that the rendered page contains the frontmatter sentence.
5. **Preview-depth case-study pages render no evidence.** `app/work/[slug]/page.tsx` never reads
   `project.images`; figures reach the page only through layer MDX, which preview projects do not
   have. `/work/software-factory` therefore shows no diagram although one is verified and published
   on the homepage. Presentation gap, not content gap.
6. **No `/work/*` captures exist** in any review set (v8–v12). The case-study route has never been
   in a visual matrix. Add the five routes at 1366/1440/1920 to the capture script.
7. **Capture provenance.** The 2560 and zoom stills show the Next.js dev badge; they were not shot
   from the production build the gate specifies. Re-shoot from `pnpm build && pnpm start`.
8. **Ground shape contract** (finding B) will need `tests/unit/project-ground.test.ts:23-28, 46`
   re-derived from new measurements when the bottom-anchored policy lands — flagged now so the
   change is reviewed as a contract update, not as a weakened test.
9. Pre-existing, unchanged, for the record: repo-wide `prettier --check .` reports 100+
   pre-existing files (Codex measured 113; the freeze doc says 131); WebKit skip-link and
   camera-focus failures are the classified pre-existing pair.

## 10. Verdict

The homepage at 1366/1440/1536 is close: the world reads as one system, the grounds register on
their evidence at focus, SYSTEMS and UNDERNEATH hold, nothing rejected has returned, and the
lower world has stopped borrowing filler. That is real work and it is preserved.

But the gate's question is whether the actual desktop experience looks and feels like a finished
premium portfolio, and today it does not, for reasons that are visible, not theoretical: the primary
line of the site was being cut on every display wider than ~1600 px (fixed in the tree, not yet
proven in a build); two of four project grounds still trail as blank beige on exit; the flagship
sits on the frame's bottom edge; and the five case-study pages — half the product — have a smaller
title than any homepage heading, no evidence above the fold, no record row, and no rendered
statement of contribution or AI assistance. And none of this could be re-rendered in this session
to confirm the fixes or iterate on them.

**FREEZE requires, in order:** (1) a stage that can build and render; (2) validation + pixel proof
of §5; (3) findings B and C resolved with before/after frames and re-derived contracts; (4) the
case-study pages designed per D and captured at three viewports; (5) the production-build matrix
re-shot at 1366/1440/1536/1920/2560 and 100/80/67/50 %.

**NOT READY.**
