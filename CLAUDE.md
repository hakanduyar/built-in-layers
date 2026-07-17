# CLAUDE.md — Hakan Duyar Portfolio

## 1. Project authority

This file and the documents under `/docs` are the source of truth.

Priority order:

1. The user's latest explicit instruction
2. `CLAUDE.md`
3. `docs/PROJECT_SPEC.md`
4. Approved task/ticket document
5. `docs/ARCHITECTURE.md`
6. `docs/DESIGN_SYSTEM.md`
7. Existing implementation

When two sources conflict, stop and report the conflict. Do not silently choose one.

## 2. Operating mode

- Never implement an unapproved phase or task.
- Work on exactly one active task at a time.
- Before editing, read all documents relevant to the active task.
- First explain the files you intend to change and why.
- Do not broaden the task while implementing it.
- Do not refactor unrelated code.
- Do not add speculative features.
- Do not change the design direction without explicit approval.
- Do not invent professional history, metrics, client details, project results, testimonials, dates, technologies, or personal information.
- Use clearly labelled placeholders where content is missing.
- Never claim that a private or incomplete project is production-ready unless the user confirms it.
- Stop after the requested task is implemented, verified, documented, and summarized.

## 3. Required workflow for every task

1. Read:
   - `CLAUDE.md`
   - `docs/PROJECT_SPEC.md`
   - `docs/ARCHITECTURE.md`
   - `docs/DESIGN_SYSTEM.md`
   - the active task
   - any relevant content files

2. Inspect:
   - existing repository structure
   - package scripts
   - related components
   - current tests
   - current Git diff

3. Plan:
   - exact files to create/change
   - implementation approach
   - risks and assumptions
   - verification commands

4. Implement:
   - only the approved scope
   - small, reviewable changes
   - no unrelated cleanup

5. Verify:
   - type checking
   - linting
   - unit/component tests where applicable
   - production build
   - relevant browser/E2E checks when available

6. Document:
   - update `docs/PROGRESS.md`
   - add architectural decisions to `docs/DECISIONS.md` only when a real decision was made
   - mark task acceptance criteria truthfully

7. Stop:
   - provide a concise summary
   - list changed files
   - list commands run and outcomes
   - list remaining issues
   - wait for approval

## 4. Product identity

Project name: **Built in Layers**

Owner: **Hakan Duyar**

Primary positioning:

**Frontend & Product Engineer**

Primary line:

**Interfaces on the surface. Systems underneath.**

Supporting statement:

**I design clear interfaces and build the systems that make them work.**

The site must communicate:

- strong frontend engineering
- product thinking
- system design awareness
- real-world problem solving
- honest and specific project storytelling
- controlled, editorial visual quality

## 5. Design direction

Required:

- editorial and technical visual language
- warm paper background
- dark ink typography
- one restrained signal accent
- strong typography
- visible layout rhythm
- subtle grid/measurement details
- asymmetric but disciplined compositions
- real project assets and diagrams
- restrained motion
- clear hierarchy
- accessible interaction states

Forbidden unless explicitly approved:

- generic AI portfolio aesthetics
- purple/blue neon gradients
- glassmorphism as a primary language
- random 3D objects
- WebGL in the MVP
- giant decorative blobs
- excessive bento grids
- continuous marquee technology logos
- forced custom cursor
- scroll hijacking
- long horizontal scroll sections
- background videos
- excessive parallax
- animation on every text block
- dark mode in the MVP
- unapproved stock imagery
- invented screenshots
- excessive rounded cards
- template-like “crafting digital experiences” copy

## 6. Signature interaction

The core portfolio concept is:

- `SURFACE`: interface, layout, responsiveness, design system, accessibility
- `FLOW`: journeys, states, forms, transitions, user and data flow
- `SYSTEM`: architecture, data model, APIs, permissions, offline strategy, deployment

This concept must be meaningful, not decorative.

The MVP should first work as static content. Motion and advanced transitions are added only after layout and content are approved.

## 7. Technical contract

Unless the user explicitly changes these decisions:

- Framework: Next.js App Router
- Language: TypeScript with strict mode
- Package manager: pnpm
- Styling: Tailwind CSS plus CSS custom properties for design tokens
- Content: local MDX and typed metadata; no CMS in MVP
- Rendering: Server Components by default
- Client Components: only where interaction requires them
- Motion: Motion for React, added only in the motion phase
- Validation: Zod for content/frontmatter validation where useful
- Unit/component tests: Vitest and React Testing Library
- End-to-end/smoke tests: Playwright
- Formatting: Prettier
- Linting: ESLint
- Deployment target: Vercel-compatible static/server rendering
- No database, authentication, admin panel, contact backend, analytics, GSAP, Three.js, or global state library in MVP unless approved

Do not install a dependency when the platform or a small local utility is sufficient.

## 8. Architecture principles

- Prefer Server Components.
- Keep content separate from presentation.
- Keep design tokens centralized.
- Keep project metadata typed and validated.
- Keep components small enough to understand, but do not fragment trivial markup into unnecessary files.
- Avoid “one component per div”.
- Avoid generic abstractions before a repeated pattern actually exists.
- Use semantic HTML.
- Preserve keyboard navigation.
- Respect reduced-motion preferences.
- Maintain stable layout to avoid cumulative layout shift.
- Use optimized responsive images.
- Keep page-specific components close to their domain.
- Keep reusable primitives in `/components/ui`.
- No barrel files unless they improve a real import boundary.
- No duplicate source of truth for project content.
- No hard-coded project data inside presentation components.

## 9. Target repository structure

The architecture document may refine names, but not the separation of responsibilities:

```text
app/
  page.tsx
  work/
    page.tsx
    [slug]/
      page.tsx
  lab/
    page.tsx
  notes/
    page.tsx
  about/
    page.tsx
  not-found.tsx
components/
  layout/
  sections/
  project/
  ui/
content/
  work/
  lab/
  notes/
data/
lib/
  content/
  seo/
  utils/
public/
  images/
    projects/
styles/
docs/
  tasks/
tests/
```

## 10. MVP pages

Required:

- Home
- Work index
- Project case-study route
- About
- Notes index
- Lab index or honest placeholder
- Custom 404
- Contact call-to-action in the site footer

Not required in the first release:

- contact form
- blog CMS
- user accounts
- admin panel
- database
- full Turkish translation
- advanced WebGL/3D
- every repository
- every professional case study

## 11. Content rules

- English is the MVP content language.
- Architecture must remain translation-ready, but do not add an i18n library before the Turkish phase is approved.
- Use real content when confirmed.
- Use `[CONTENT REQUIRED: ...]` placeholders for missing information.
- Never fabricate outcomes, conversion rates, performance gains, team sizes, users, revenue, clients, dates, or technical contributions.
- Clearly distinguish:
  - personal work
  - professional work
  - internship work
  - learning/early experiments
  - forks or adapted open-source work
  - AI-assisted work
- Every featured project must state Hakan's specific contribution.

## 12. Quality gates

A task is not complete until applicable checks pass:

- TypeScript has no errors
- lint passes
- tests pass
- production build passes
- keyboard navigation works
- visible focus states exist
- reduced motion is respected
- responsive layouts are checked at mobile, tablet, and desktop widths
- no obvious overflow
- no placeholder content is presented as fact
- no unapproved dependency was added
- task acceptance criteria are checked honestly

## 13. Git discipline

- Inspect `git status` before and after work.
- Never discard user changes.
- Never rewrite history.
- Never force-push.
- Do not commit unless the user explicitly asks.
- Keep changes limited to the active task.
- Report all modified, added, and removed files.
