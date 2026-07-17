# PROJECT SPEC — Built in Layers

Status: Initial approved direction  
Owner: Hakan Duyar  
Product type: Personal portfolio and engineering case-study website

## 1. Purpose

Build a distinctive, credible, high-quality portfolio that positions Hakan as a **Frontend & Product Engineer**, not as a generic template-based frontend developer.

The portfolio must show both the visible interface and the underlying engineering decisions.

The product should help a visitor quickly understand:

1. Who Hakan is
2. What kind of problems he solves
3. Which projects best represent his current level
4. What he personally contributed
5. How he thinks about interface, flow, and system design
6. How to contact him

## 2. Core concept

Brand:

**Built in Layers**

Primary line:

**Interfaces on the surface. Systems underneath.**

Signature framework:

### Surface

- interface
- visual hierarchy
- responsive behavior
- design system
- accessibility
- components

### Flow

- user journeys
- state transitions
- forms
- error and empty states
- data movement
- product behavior

### System

- architecture
- data model
- permissions
- API boundaries
- offline strategy
- deployment
- performance decisions

The three layers must alter real content, diagrams, or storytelling. They must not be a cosmetic tab with repeated text.

## 3. Audience

Primary:

- hiring managers
- frontend leads
- product engineering teams
- technical recruiters
- potential freelance/contract clients

Secondary:

- other developers
- readers of technical articles
- collaborators

## 4. Positioning

Preferred title:

**Frontend & Product Engineer**

Primary supporting copy:

**I design clear interfaces and build the systems that make them work.**

Avoid positioning Hakan as only:

- a generic full-stack developer
- a WordPress-only developer
- an AI developer
- a UI designer
- a collection of technologies

WordPress, backend, AI-assisted development, DevOps, and product work should support the main positioning rather than compete with it.

## 5. Visual direction

### Character

- editorial
- technical
- confident
- restrained
- original
- tactile
- human
- precise

### Palette seed

These are initial approved design tokens and may only be changed after documenting the reason:

```css
--paper: #f1efe8;
--ink: #161616;
--soft-paper: #e5e2d8;
--line: #b8b5ac;
--signal: #ff4f1f;
```

### Typography direction

- display sans for major headings
- editorial serif for selected statements
- monospace for metadata, labels, diagrams, and project numbers

Initial candidates:

- Archivo
- Newsreader
- IBM Plex Mono

Fable must verify licensing and use an appropriate loading method. It must not add more font families without approval.

### Layout

- 12-column desktop grid
- 8-column tablet grid
- 4-column mobile grid
- generous section spacing
- open compositions rather than endless cards
- squared or subtly rounded surfaces
- no default “SaaS dashboard” appearance

## 6. Experience principles

- The page must remain understandable with animation disabled.
- Motion should explain hierarchy, state change, or the layer concept.
- Mobile must be designed intentionally, not created by shrinking desktop.
- Hover-only information must have touch and keyboard equivalents.
- The site should feel crafted without becoming difficult to navigate.
- Projects must be easy to scan in under 90 seconds.
- Detailed case studies should support deeper reading.

## 7. Information architecture

### Home

1. Header/navigation
2. Hero
3. Short positioning statement
4. Layer explorer introduction
5. Selected systems
6. Built for real life
7. How I build
8. Field notes
9. About preview
10. Contact CTA/footer

### Work

- Featured professional systems
- Featured personal/product systems
- Secondary projects
- Early experiments/archive link

### Project case study

1. Project hero
2. One-minute summary
3. Why it exists
4. Constraints
5. Surface
6. Flow
7. System
8. Decisions
9. Evolution
10. Reflection
11. Next project

### About

- concise story
- career evolution
- selected experience
- education
- award/grant
- working principles
- links to CV, GitHub, LinkedIn, Medium

### Notes

- selected technical writing
- external Medium links in MVP
- local MDX capability may be added later

### Lab

- small experiments
- honest empty/preview state until real experiments are added

## 8. Featured project priority

Target order (once professional content exists):

1. Professional Systems
2. Kıvılcım
3. DropSpot
4. JointLedger
5. Eat Fit Evolve, if needed before a professional case study is ready

**Superseded for the initial homepage by approved D-016 (2026-07-17):** while Professional Systems awaits approved content, the homepage order is 1. Kıvılcım, 2. DropSpot, 3. JointLedger, 4. Professional Systems preview. Professional Systems may move to first place only after at least one approved and substantive professional case study exists.

Naming (approved D-017): the primary display name is **Kıvılcım**; on its first English-language introduction it may be written as Kıvılcım — “Spark”; “Kıvılcım / Spark” is not used as a permanent brand lockup. Route slug: `/work/kivilcim`.

Only projects with enough verified information and assets may receive a full case study.

## 9. Project presentation categories

### Featured systems

Deep case studies and homepage prominence.

### Built for real life

Products created for a personal, family, hobby, or practical need.

### Selected archive

Secondary projects that still demonstrate relevant skills.

### Origins / early experiments

Learning-era clone projects and bootcamp work, clearly labelled as earlier work.

Never mix all repositories into one equal grid.

## 10. MVP scope

### Included

- responsive home page
- work index
- reusable case-study system
- one complete case study: Kıvılcım
- one shorter technical case study: DropSpot
- JointLedger preview
- professional systems placeholder with honest wording
- selected notes linking to Medium
- About page
- custom 404
- SEO metadata
- Open Graph image strategy
- accessibility baseline
- tests for critical interactions
- performance-conscious images and motion

### Excluded

- full CMS
- database
- authentication
- contact form backend
- advanced analytics
- all repositories
- full bilingual content
- 3D/WebGL
- GSAP
- dark mode
- elaborate loading screen

## 11. Homepage copy seed

Hero:

```text
HAKAN DUYAR

FRONTEND &
PRODUCT ENGINEER

INTERFACES ON THE SURFACE.
SYSTEMS UNDERNEATH.
```

Supporting statement:

```text
I DESIGN CLEAR INTERFACES
AND BUILD THE SYSTEMS
THAT MAKE THEM WORK.
```

Selected work heading:

```text
SELECTED SYSTEMS

NOT JUST WHAT THEY LOOK LIKE —
HOW THEY ACTUALLY WORK.
```

Real-life products heading:

```text
BUILT FOR REAL LIFE

Some products begin with a brief.
Others begin with:
“I actually need this.”
```

Contact:

```text
HAVE A COMPLEX PRODUCT?

LET’S MAKE IT
FEEL SIMPLE.
```

Copy may be refined for grammar and rhythm, but its meaning and non-generic tone must remain.

## 12. Featured project seed copy

### Kıvılcım

Category:

`PERSONAL OPERATING SYSTEM`

Description:

`A local-first system for planning, focus, habits and personal growth.`

Verified direction:

- mobile-first
- PWA
- local-first
- offline-oriented
- React
- TypeScript
- IndexedDB/Dexie
- optional user-controlled AI

Do not invent usage statistics or production outcomes.

### DropSpot

Category:

`FAIR DISTRIBUTION SYSTEM`

Description:

`A fair claim and waitlist system for limited-stock product drops.`

Verified direction to confirm from repository before publishing:

- React frontend
- Node/Express backend
- PostgreSQL
- waitlist and priority logic
- transactional inventory claims
- concurrency/race-condition considerations

Any technical claim must be verified against the repository.

### JointLedger

Category:

`SHARED FINANCE SYSTEM`

Description:

`Personal accounts. Shared financial life. One coordinated system.`

Current status:

- active development
- private or selectively presented source
- architecture-focused case study
- shared books, membership roles, invitations, permissions, migration/backfill work

Do not expose private infrastructure, credentials, internal URLs, or sensitive household data.

### Professional Systems

Description:

`Designing usable interfaces within complex technical and organizational constraints.`

Until Hakan provides approved details:

- use anonymous descriptions
- show no private URLs
- show no confidential source code
- use `[CONTENT REQUIRED]` placeholders
- do not invent clients, outcomes, or metrics

## 13. Technical goals

- semantic HTML
- strong accessibility baseline
- keyboard-operable layer switch
- reduced-motion support
- responsive layout without overflow
- minimal client JavaScript
- clear server/client boundaries
- typed and validated project content
- optimized images
- stable layout
- maintainable component structure
- no unnecessary dependencies

## 14. Acceptance criteria for design

The design is acceptable only if:

- it does not resemble a common AI-generated portfolio template
- the hero is distinctive but readable
- the Surface/Flow/System concept is understandable without explanation
- the site works with motion disabled
- projects are hierarchically curated
- early projects do not dominate the current professional identity
- visual variety does not break system consistency
- mobile has intentional compositions
- typography and spacing feel deliberate
- every decorative element has a role

## 15. Acceptance criteria for implementation

The implementation is acceptable only if:

- strict TypeScript passes
- lint passes
- tests pass
- production build passes
- no unapproved dependency is installed
- content is not duplicated across files
- project data is not hard-coded in page components
- no claims are fabricated
- keyboard and reduced-motion behavior are verified
- main layouts are checked at mobile, tablet, laptop, and wide desktop sizes
- all unfinished content is labelled honestly
