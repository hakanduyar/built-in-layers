# CODEX ARCHITECTURE RETURN

Independent review of the proposal at `feature/project-architecture-v13`.

This was review only. No implementation slice was started, no acceptance criteria were frozen,
no protected branch was touched, and the V12 recovery bundle was not deleted.

## Precondition and verification record

- Candidate `HEAD`: `499e7d8a43151480650346f9aa1e445faf1edb32`.
- Branch: `feature/project-architecture-v13`.
- Base ancestry check passed: `243db3934d634f2c39d339cd2a267c01d86be2bd` is an ancestor of HEAD.
- Base-to-candidate diff is documentation/tooling only: `.ai/handoffs/CODEX-ARCH-GATE.md`,
  `docs/AUTONOMOUS_STATUS.md`, `docs/FROZEN_BOUNDARY.md`, `docs/PROJECT_ARCHITECTURE.md`,
  `docs/PROJECT_INVENTORY.md`, the inventory JSON, and `tests/tools/project-inventory.mjs`.
  No application source appears in that diff.
- Initial tree state matched the gate: the only untracked item was
  `docs/review/v12-codex-gate/codex-gate-checkpoint.bundle` (22,642,683 bytes).
- Protected refs were only inspected: `feature/spatial-portfolio-v5` remains at
  `243db3934d634f2c39d339cd2a267c01d86be2bd`; `main` remains at `16d3ec0d8c7022d5b2b7b05198f8c752ef1308a6`.
- The 30 frozen fingerprints compare clean against the working tree.
- `node tests/tools/project-inventory.mjs` was rerun. A semantic UTF-8 comparison against
  `docs/review/v13-inventory/metrics/project-inventory.json` is an exact match.
- Current checks pass: `pnpm.cmd typecheck`, `pnpm.cmd lint`, `pnpm.cmd test` (22 files,
  506 tests), and `pnpm.cmd build` (15 generated routes). The plain `pnpm` wrapper was blocked
  by the local PowerShell execution policy; using `pnpm.cmd` ran the same scripts successfully.

## Inventory accuracy

All seven factual findings reproduce; none failed to reproduce.

- F1 reproduces: Software Factory is `featured`, `preview`, `order: 0`, has no layer files and
  zero decisions in the regenerated inventory, while `lib/spatial/scenes.ts:168` places it first
  after the hero.
- F2 reproduces: current `order` is Software Factory, Kıvılcım, JointLedger, DropSpot,
  Professional Systems; current `nextSlug` is Kıvılcım → DropSpot → JointLedger → Professional
  Systems, with no next link from Software Factory.
- F3's factual core reproduces: Professional Systems is published, `requires-user`, preview,
  has a 15-word body, no tech, no links, and one provisional illustration. Its contribution is
  not literally empty: `content/work/professional-systems/index.mdx:10` contains a 17-word
  pending statement.
- F4 reproduces: DropSpot is the only current project with `real-screenshot` assets.
- F5 reproduces: Kıvılcım, JointLedger, and DropSpot have paired content/asset suites;
  Professional Systems has an asset suite; Software Factory has neither project-specific suite.
- F6 reproduces: all five current entries omit `timeline`; all existing links are public repo
  links, and Professional Systems has none.
- F7 reproduces and is correctly marked non-defective: `app/work/page.tsx:26-30` filters empty
  tier groups before rendering.

## Misclassifications and proposal corrections

1. The proposal says no document establishes whether `nextSlug` is editorial. That is no longer
   true. Accepted D-021 in `docs/DECISIONS.md:317-328` explicitly supersedes D-016 where they
   disagree, sets the project order to Software Factory → Kıvılcım → JointLedger → DropSpot, and
   says `order` remains the single source of truth. Git history also shows the current
   `nextSlug` chain was introduced with the older D-016 ordering before the D-021 reorder.
   The current `nextSlug` values are stale manual sequencing, not evidence of a still-approved
   editorial sequence.
2. “Delete `nextSlug` from all five entries” is inaccurate. Only three production entries carry
   it today: Kıvılcım, JointLedger, and DropSpot. Software Factory and Professional Systems do
   not. The fixture `tests/fixtures/content/work/delta-full/index.mdx` also carries the field.
3. F3 should not be treated as a build or schema defect. `docs/CONTENT_MODEL.md:166-178`
   explicitly models Professional Systems as `tier: featured`, `depth: preview`,
   `verificationStatus: requires-user`, and `status: published` because it contains no concrete
   claims. The current file follows that contract and uses approved pending copy. Whether the
   owner wants it hidden as a draft is an editorial choice, not a necessary repair.
4. The phrase “the flagship case study being reachable at all” is wrong. The published
   `/work/software-factory` route is generated and the production build succeeds. The actual
   defect is that the flagship has no onward next-project link and is only a preview-depth route.
5. G6 (real screenshots), G8 (timelines), and G9 (live/demo links) are observed absences, but the
   standing contracts do not require parity for them. D-019 expressly permits honest diagrams;
   `timeline` is optional in the content model; and link kinds are optional. G5’s per-project
   suite is also a proposed testing strategy, not a requirement in PROJECT_SPEC, which requires
   tests for critical interactions rather than one copied suite per project.
6. The “six of nine gaps are owner-blocked / exactly one actionable gap” summary is too strong.
   The owner-fact list blocks truthful content expansion, but structural contract clarification,
   navigation implementation after that clarification, generic gate coverage, and documentation
   cleanup are not all blocked on new project facts.

## Q1 — `nextSlug` obsolete or editorial sequencing?

Obsolete under the current approved contract. D-021 is the decisive evidence: `order` is the
owner-directed single source for the current project order, while the surviving `nextSlug` chain
is the old D-016 sequence. Removing the duplicate is sound, but the proposal must update every
consumer, test, fixture, and the human content contract. `ProjectFrontmatterBaseSchema` is a
plain `z.object` with no `.strict()` call (`lib/content/schemas.ts:85-123`). A runtime check with
the installed Zod version confirms unknown keys are stripped, not rejected. Therefore removing
the schema field before removing old frontmatter would not fail closed; the old key would be
silently discarded. That makes the cleanup technically order-tolerant, but not documentation- or
test-tolerant.

## Q2 — Is the depth ladder invented or grounded?

The hard position-to-depth mapping in PROJECT_ARCHITECTURE §2.2 is invented, not an approved
requirement. The standing documents define what `full`, `short`, and `preview` require, and
PROJECT_SPEC §9 says featured systems are “deep case studies and homepage prominence,” but no
approved document says scene 01 must be `full`, every featured entry must be `short`/`full`, or a
preview may not occupy a featured presentation. In fact, `CONTENT_MODEL.md:168-178` explicitly
approves the featured preview Professional Systems placeholder. The ladder may be recommended as
an editorial principle, but it must be marked owner-approved policy (with the approved placeholder
exception) before it can drive acceptance criteria.

## Q3 — Does content changing a frozen scene count as a V12 regression?

Not inherently: the frozen component intentionally derives its affordance from content depth, and
`components/spatial/SpatialProjectScene.tsx:108-115` documents that this prevents overclaiming.
Changing “Open system” to “Open case study” after a truthful depth upgrade is the correct
data-driven response. However, it is still a frozen-surface observable change, exactly as
`docs/FROZEN_BOUNDARY.md:69-96` warns. It must be treated as a controlled boundary contact and
measured with targeted visual/interaction checks; a content-only diff does not exempt it from
regression review. Adding Software Factory layers likewise intentionally changes the live
Selected Systems topology at `components/sections/SelectedSystems.tsx:34-40,129-135`; the
expected data-driven change must be proved not to disturb frozen geometry, overflow, motion, or
accessibility behavior.

## Q4 — Grow versus move the flagship

The proposal’s growth assumption is directionally plausible but not proven. Existing repository
content presents Software Factory as a system-level personal project, and D-021 explicitly made it
the first spatial scene after a direct audit. That supports growing it if the owner confirms the
publishable architecture, depth, and evidence. Moving it is not an equivalent fallback: it would
contradict the accepted D-021 order and reopen the frozen spatial system, requiring an explicit
owner change and a new measured spatial review. If truthful content cannot support the current
flagship, the correct action is to keep it preview for now and escalate a separate owner-approved
reorder decision, not silently move it as part of this content slice.

## Q5 — Should Professional Systems be draft or published?

Do not force it to draft based on the current evidence. The approved content model explicitly
allows this exact published preview placeholder when it makes zero concrete claims, and the
current file follows that rule. The owner-only question remains whether this public pending state
is wanted and what, if anything, may replace it; no professional facts may be supplied by this
review.

## Q6 — Is Slice 1 correctly ordered first?

Its core direction is valuable and, after Q1, is the best current structural repair. It is not
ready as written. First clarify the navigation contract: `order` is documented as position within
 tier (`docs/CONTENT_MODEL.md:34`), while the target claims a globally sorted published list and
the implementation currently sorts only by `order` (`lib/content/work.ts:103-104`). The target
must define whether neighbours cross tiers and must provide a deterministic tie/uniqueness policy.

The proposed previous-project UI is an additional product decision: the standing case-study IA
specifies “Next project,” not previous navigation. Keep the minimal forward-navigation fix in the
first slice unless the owner approves the expanded UI. After the order contract is clarified,
remove the stale field from the schema and the three production entries, update
`CONTENT_MODEL.md`, the route, four unit tests, and the fixture. The current touch list omits those
references.

## Q7 — Does per-project testing encode content and become brittle?

Yes. Existing suites assert exact project order, exact asset filenames, exact rendered phrases,
specific decision titles, and current `nextSlug` values (for example
`tests/unit/kivilcim-content.test.tsx:211-213`, `tests/unit/work-loader.test.tsx:150-151`, and
`tests/unit/project-card-images.test.tsx:17-43`). These tests provide useful truthfulness and
integration protection, but they also make normal content edits fail. Blindly adding the same
pattern for Software Factory would amplify that coupling.

Coverage parity should instead be a parameterized generic contract suite for every published
project: schema validity, publication gates, marker absence, depth-appropriate headings/layers,
asset integrity, and published-only routing. Keep project-specific tests only for stable approved
behavior that the UI depends on, such as fork disclosure, explicit non-claim boundaries, or an
owner-approved order. Use fixtures for template/component behavior rather than encoding changing
prose into per-project tests.

## CURRENT map accuracy

The content pipeline, fail-closed publication behavior, depth-driven validation, and the current
three-consumer ordering defect are accurately identified. The map needs these corrections:

- `sortByTierThenOrder` does not sort by tier; its implementation is only
  `a.order - b.order` (`lib/content/work.ts:103-104`). Tier order is applied by the fixed
  `TIER_ORDER` grouping in `app/work/page.tsx:17-30`. All current projects happen to be in one
  tier, so the present output is correct, but the distinction matters for the proposed future
  neighbour list.
- The diagram places `lib/content/validate.ts` as a downstream pipeline stage, while validation
  is invoked from `getPublishedProjects()` in `lib/content/work.ts:119-147`. This is a minor
  diagram simplification, not a behavior defect.
- The map omits the accepted D-018 documentation/source discrepancy: `CONTENT_MODEL.md` still
  presents `phase` and `aiAssisted` as unconditional fields, while the actual schema makes them
  optional and D-018 records why. That is not caused by Slice 1 but should be reconciled in the
  architecture baseline.

## TARGET soundness

The single-source navigation direction is sound after the corrections above. The target is not
yet sound as a frozen architecture because it treats a per-tier `order` as a global sequence,
adds previous navigation without an approved IA decision, and promotes the depth/evidence/coverage
rules from agent recommendations to apparent requirements. It also says the frozen system is kept
unchanged while knowingly changing its rendered affordance and Selected Systems data topology.
Those are acceptable controlled data responses only if the boundary checks are part of the later
acceptance plan.

## Missed gaps

- Define a canonical neighbour domain (all published work versus featured case studies), cross-tier
  behavior, tier precedence, and unique/deterministic order semantics.
- Update the complete `nextSlug` reference surface: schema, three production entries, route,
  `CONTENT_MODEL.md`, three project content tests, the work-loader test, and its fixture.
- Add a boundary-contact regression plan for content changes that alter the frozen affordance or
  Selected Systems topology.
- Separate approved requirements from optional goals: real screenshots, timelines, live/demo
  links, per-project suites, and the prominence/depth ladder.
- Decide whether previous navigation belongs in the case-study IA before including it in Slice 1.
- Reconcile the pre-existing D-018 schema/content-model drift when updating the content contract.

## Recommended first slice

First, an owner/contract clarification step (not implementation): confirm that case-study
neighbours follow the D-021 project order, define whether that order is global or tier-scoped, and
decide whether previous navigation is in scope. Then implement the minimal derived-forward-
navigation change with a deterministic published list, remove `nextSlug` everywhere it is actually
used, and add generic boundary tests. Leave Software Factory content expansion, evidence policy,
Professional Systems policy, and any spatial reorder out of that slice.

## Recommended acceptance criteria (NOT frozen)

- The order contract is explicit and the neighbour function is deterministic for first, middle, and
  last published entries, including tier behavior and no draft/unknown target.
- No production schema, content entry, route, test, fixture, or standing contract still requires
  `nextSlug` after the cleanup; the old field is not silently relied upon.
- Forward navigation follows the approved D-021 order. Previous navigation is included only if its
  IA and rendering behavior are separately approved.
- The frozen 30-file surface remains byte-identical. Any content-driven affordance/topology change
  is documented as a boundary contact and checked for geometry, overflow, motion, accessibility,
  and console regressions.
- Published preview placeholders remain honest and retain no invented facts; changing a depth
  requires all relevant content, image, verification, and narrative gates to pass.
- Coverage is generic and content-structure-focused, with project-specific assertions limited to
  stable approved behavior.
- Typecheck, lint, unit, production build, and the relevant frozen-surface browser checks pass.

## Owner decisions still required

The six-item owner-only list in the gate is complete and correctly scoped; this review does not
answer any of it:

1. Whether Software Factory’s real architecture may be published, and at what depth.
2. Whether publishable Software Factory screenshots exist.
3. Everything about Professional Systems, whose frontmatter is `requires-user`.
4. Project timelines for all five projects.
5. Any live/demo URL that may be linked.
6. Whether Kıvılcım and JointLedger have screenshottable running states.

In addition, the owner must approve or reject the proposal-authored depth ladder, evidence/coverage
parity policies, the global-versus-tier navigation semantics, and the proposed previous-navigation
UI before those become acceptance criteria.

CODEX ARCHITECTURE REVIEW

reviewed candidate SHA: 499e7d8a43151480650346f9aa1e445faf1edb32
branch: feature/project-architecture-v13
tree state: clean except required untracked return file and the intentional untracked V12 recovery bundle

VERDICT: ACCEPT WITH CHANGES

Inventory accuracy:          F1–F7 all reproduced; F7 is correctly not a defect; F3’s “empty contribution” wording does not reproduce literally
Misclassifications:          Q1 is documented by accepted D-021; only three production entries carry nextSlug; the flagship route is reachable; Professional Systems’ published preview is contract-allowed; several proposed gaps are optional rather than required
CURRENT map accuracy:        Mostly accurate, but current sorting is by order only, tier grouping is separate, validation is called inside the loader, and D-018 schema drift is omitted
TARGET soundness:            Sound navigation direction, but incomplete until global/tier ordering, policy status, previous-nav scope, and frozen-boundary checks are corrected
Q1 nextSlug obsolete or editorial: Obsolete/stale under D-021’s accepted single-source order; remove it after updating all actual references
Q2 depth ladder invented or grounded: Invented as a hard rule; depth requirements are grounded, prominence-to-depth mapping is not
Q3 content change in frozen scene = regression: Not inherently; it is an intentional data-driven state, but it remains a measured frozen-boundary contact
Q4 grow vs move the flagship: Grow only if owner-approved facts support it; moving is a separate owner-approved, measured V12 change, not an equal fallback
Q5 professional-systems draft or published: Keep published preview under the current approved zero-claim contract unless the owner chooses otherwise; do not force draft
Q6 slice ordering: Directionally first after order-contract clarification; current scope is incomplete and previous navigation should be separately approved
Q7 test-coverage pattern: Current per-project tests are useful but brittle; prefer generic parameterized structural/gate coverage plus narrow stable project-specific tests
Missed gaps:              Global/tier order semantics and tie policy; complete nextSlug reference cleanup; frozen contact regression plan; distinction between requirements and aspirations; previous-nav IA; D-018 contract drift
Recommended first slice:  Owner/contract clarification, then minimal derived forward navigation and complete nextSlug cleanup; defer previous UI and content/policy work unless approved
Recommended acceptance criteria (NOT frozen): Explicit deterministic published-neighbour semantics; complete field/reference removal; frozen blobs unchanged plus measured boundary checks; honest gates; generic coverage; full checks passing
Owner decisions still required: The gate’s six-item list is complete; also obtain owner approval for the proposal-authored depth/evidence/coverage policies, tier semantics, and previous-navigation UI
Next owner: OWNER
