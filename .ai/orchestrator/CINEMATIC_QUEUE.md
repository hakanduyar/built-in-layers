# Built in Layers — cinematic portfolio experiment

Baseline: `77ea5e1b05ed43ac5a34fa28204b0b2fc92e2f56`. Integration branch: `codex/portfolio-cinematic-study`. Keep production and the original working tree separate. Use only original media and public portfolio content.

| Ticket | Scope and owner | Dependency | Acceptance |
| --- | --- | --- | --- |
| P01 | Root: isolate the baseline, create separate writer worktrees, inventory the existing homepage and its navigation | None | Existing changes remain in their original worktree; each writer owns one worktree |
| P02 | Art direction: board-level shot, teacher waits, learner moves the knight from g1 to f3, opposite perspective; compare two endings | None | Original 10–12 second storyboard, intentional camera axis, a readable silent version |
| P03 | Film unit: model board, knight, lighting and cameras in Blender; render a low-cost preview and inspect it | P02 | Correct move, plausible contact shadows, legible silhouette on mobile |
| P04 | Film unit: two cuts, distinct endings, posters, separate optional original audio and reproducible generation | P03 | Decodable local videos and posters with verified durations and dimensions; sound starts only on request |
| P05 | Atlas unit: select real published projects and compose overview, focus and return; use simple browser primitives first | P01 | Correct links, semantic navigation, desktop/touch/keyboard, no invented project metadata; returning preserves orientation |
| P06 | Web unit: discoverable homepage entry, cinematic route, direct content access, A/B controls, motion and sound preferences | P01, interface contracts with P04/P05 | Both films reachable, correct paths, keyboard labels, reduced-motion and poster alternative |
| P07 | Root: integrate by reviewed commits; perform build, lint, types, unit and targeted browser verification | P04–06 | Inspect desktop and mobile, keyboard, motion, media loading, return navigation and existing routes |
| P08 | Independent reviewer: review actual integrated changes, media and regressions; root remedies any material issue | P07 | Verified findings closed or limitations documented; no self-certified release |
| P09 | Root: save verified branch checkpoint, publish branch preview when supported; retain main until explicit owner merge decision | P08 | Link to working comparison, state precisely what was tested and what still requires artistic selection |

Production choices: Blender for staging and lighting, HTML/SVG/CSS and the existing Next.js/Motion stack for the atlas. Use Three.js only if real depth demonstrably improves understanding. No Unity runtime or paid services. Capture authentic timing in the inexpensive proof before committing resources to a heavier render. If real-world hand footage is unavailable, use original animated staging without representing it as a live-action shoot.

Provider budget: Claude Code on a useful bounded source slice, subject to included session capacity, weekly limit and PaidOFF; independent OpenAI planning/review, with OpenAI production fallback explicitly allowed. Do not repeat unchanged checks across lanes. No new provider infrastructure for this experiment.
