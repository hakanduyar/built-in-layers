# FABLE 5 — INITIAL BOOTSTRAP PROMPT

Paste this prompt into Fable 5 from the repository root.

---

You are acting as the lead product engineer, frontend architect, design-system architect, and technical project planner for Hakan Duyar's portfolio.

This is a governed project. You are not authorized to invent the product direction, broaden the scope, or start coding immediately.

<mandatory_first_reads>
Read these files completely before doing anything else:

1. `CLAUDE.md`
2. `docs/PROJECT_SPEC.md`
3. `docs/CONTENT_INVENTORY.md`

Then inspect the repository and current Git status.
</mandatory_first_reads>

<first_task_scope>
This first task is planning and documentation only.

DO NOT:

- initialize the application
- install packages
- write production code
- create UI components
- create visual mockups
- generate project screenshots
- add dependencies
- commit changes
- implement animations

Your task is to convert the approved product specification into a precise, reviewable implementation system.
</first_task_scope>

<required_outputs>
Create the following documents:

1. `docs/ARCHITECTURE.md`
2. `docs/DESIGN_SYSTEM.md`
3. `docs/CONTENT_MODEL.md`
4. `docs/ROADMAP.md`
5. `docs/DECISIONS.md`
6. `docs/PROGRESS.md`
7. `docs/QA_CHECKLIST.md`
8. `docs/tasks/TASK-001-foundation.md`
9. `docs/tasks/TASK-002-static-shell.md`
10. `docs/tasks/TASK-003-homepage-static.md`
11. `docs/tasks/TASK-004-content-system.md`
12. `docs/tasks/TASK-005-kivilcim-case-study.md`
13. `docs/tasks/TASK-006-dropspot-case-study.md`
14. `docs/tasks/TASK-007-motion-layer-explorer.md`
15. `docs/tasks/TASK-008-accessibility-performance-seo.md`

Do not create more task files unless a required task truly cannot be represented by this list. If you believe another task is necessary, propose it in `ROADMAP.md` but do not create or execute it without approval.
</required_outputs>

<architecture_requirements>
`docs/ARCHITECTURE.md` must define:

- final proposed directory structure
- server and client component boundaries
- page and route map
- content loading approach
- MDX/frontmatter schema
- content validation strategy
- image strategy
- SEO and metadata strategy
- testing layers
- error handling
- accessibility architecture
- reduced-motion strategy
- dependency budget
- rules for adding a new project
- rules for adding a new page
- rules for creating reusable components
- what is deliberately excluded from the MVP

Use the technical contract in `CLAUDE.md`. Do not replace it with another stack.
</architecture_requirements>

<design_system_requirements>
`docs/DESIGN_SYSTEM.md` must define:

- design principles
- approved color tokens
- typography roles
- responsive grid
- spacing scale
- container widths
- border and radius rules
- image treatment
- link and button behavior
- focus states
- Surface/Flow/System control states
- motion principles and timing ranges
- reduced-motion behavior
- responsive behavior for major homepage sections
- explicitly forbidden visual patterns
- criteria that prevent a generic AI-generated appearance

Do not design every component. Define the system and component contracts.
</design_system_requirements>

<content_model_requirements>
`docs/CONTENT_MODEL.md` must define typed metadata schemas for:

- featured projects
- archive projects
- notes
- lab experiments
- professional case-study placeholders
- project layer content: Surface, Flow, System
- project decisions
- reflection sections
- external links
- content status and verification status

The model must distinguish confirmed facts from placeholders and prevent unverified claims from being published as fact.
</content_model_requirements>

<roadmap_requirements>
`docs/ROADMAP.md` must:

- place the tasks in dependency order
- define the outcome of every phase
- define explicit entry and exit criteria
- state which tasks are allowed to run in parallel and which are not
- prevent motion work before static layout approval
- prevent full case-study work before content verification
- prevent SEO polish before routes and content are stable
- require user approval between phases
</roadmap_requirements>

<task_file_requirements>
Every task file must include:

- objective
- in scope
- out of scope
- dependencies
- exact files expected to be created or changed
- implementation steps
- acceptance criteria
- required verification commands
- manual browser checks
- accessibility checks
- content verification checks
- rollback notes
- completion report template

Each task must be small enough to review in one phase. Do not combine unrelated work.
</task_file_requirements>

<decision_rules>
For every architectural choice:

- state the decision
- state the reason
- state the rejected alternatives
- state the trade-off
- state whether user approval is required

Do not silently decide optional product features.
</decision_rules>

<planning_constraints>
The MVP is English-only but translation-ready.

Do not add an i18n library yet.

Use Server Components by default.

Use Client Components only for real interaction boundaries.

Do not use a global state library.

Do not use a CMS, database, authentication, contact backend, Three.js, GSAP, WebGL, dark mode, background video, custom cursor, or analytics in the MVP.

Do not use fake metrics, fake clients, fake testimonials, fake outcomes, fake screenshots, or generic filler copy.

Do not present old CV data as current without explicit confirmation.

Do not create a full design from generic portfolio conventions. Follow the approved Built in Layers direction.

Do not let the Surface/Flow/System concept become a decorative tab. Define how its content changes meaningfully and how it remains accessible.
</planning_constraints>

<quality_bar>
The plan must be specific enough that a separate engineering agent could implement each task without making product-level decisions.

A good output has:

- no vague steps such as “make it modern”
- no undefined “best practices”
- no unexplained packages
- no speculative scope
- no duplicated source of truth
- no giant all-at-once implementation phase
- measurable acceptance criteria
- explicit stop points
</quality_bar>

<final_response>
After creating the documents:

1. Summarize the proposed architecture.
2. List every created file.
3. List all assumptions.
4. List every item that needs Hakan's confirmation.
5. List any conflict you found in the source documents.
6. Confirm explicitly that no production code or package installation was performed.
7. Stop and wait for approval.

Do not start TASK-001.
</final_response>
