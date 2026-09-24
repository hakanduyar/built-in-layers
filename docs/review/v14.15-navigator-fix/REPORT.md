# V14.15 navigator micro-fix

Implemented and left uncommitted on `feature/owner-visual-acceptance-v14`.
Starting HEAD: `bd96cb9433d791ff312e7685e54f006550d43898`; the only differences
from application baseline `76897e2` at the start were four orchestrator documentation files.
Read `CLAUDE.md` first. Agent inventory contained only this writer; initial file
timestamps and Git status showed only the known untracked capture script.

## Reproduction and measurements

Chromium, production server at `http://localhost:3200`. Before changing the
component, ran `node tests/tools/v14-15-navigator-preview.mjs before`.
After rebuilding and restarting the production server, ran the same probe with `after`.
Raw measurements: [before.json](before.json), [after.json](after.json).

Sequence: enter the route, hover Field Notes, click it, leave the pointer there,
then press Tab. About receives keyboard focus. Move the pointer away for the
focus-only measurement; return it to Field Notes, then focus the next side arrow
to measure hover resuming when focus leaves the ticks. Settled measurements wait
350 ms; a 1200 ms requestAnimationFrame sample covers the mixed-input transition.
Visibility means computed opacity strictly greater than zero, not merely DOM presence.

| Viewport | State | Before count / destination | After count / destination |
| --- | --- | --- | --- |
| 1440 × 900 | Hover only | 1 / Field Notes | 1 / Field Notes |
| 1440 × 900 | Keyboard focus only | 1 / About | 1 / About |
| 1440 × 900 | Hover Field Notes + focus About | 2 / Field Notes + About | 1 / About |
| 1440 × 900 | Focus leaves ticks, pointer on Field Notes | 1 / Field Notes | 1 / Field Notes |
| 1920 × 1080 | Hover only | 1 / Field Notes | 1 / Field Notes |
| 1920 × 1080 | Keyboard focus only | 1 / About | 1 / About |
| 1920 × 1080 | Hover Field Notes + focus About | 2 / Field Notes + About | 1 / About |
| 1920 × 1080 | Focus leaves ticks, pointer on Field Notes | 1 / Field Notes | 1 / Field Notes |

Both sizes reproduced an overlap of **60.4921875 × 18 px** between `07 FIELD NOTES`
and `08 ABOUT`. After: no pair of visible previews exists, hence no overlap.
The maximum sampled simultaneous count was **2 before, 1 after** at each size.
Resting with neither input showed **0 before and after** at each size.

Screenshots:

- [1440 before](before-1440-mixed.png), [1440 after](after-1440-mixed.png)
- [1920 before](before-1920-mixed.png), [1920 after](after-1920-mixed.png)

## Mechanism and change

The independent per-tick hover/focus CSS could expose two labels. RouteNavigator
now owns hovered and keyboard-focused station indices, with focus taking priority.
Focus eligibility uses the browser's `:focus-visible` state on focus entry, keeping
pointer clicks from being treated as keyboard focus. Blur restores hover selection.

One shared, absolutely positioned, `aria-hidden` preview replaces the per-tick
preview spans. Reusing one element prevents even a transient two-label opacity
crossfade. Its center follows the selected tick; typography, vertical offset,
color inheritance, opacity transition duration and easing are retained. The last
destination remains in place during fade-out when both inputs leave. Switching
destinations updates that one element rather than fading two labels concurrently.
Tick marks and their hover/focus styling are unchanged.

The new navigation contract runs the real click/Tab sequence at both sizes,
checks all four input states, samples every animation frame across the sequence,
asserts exactly one visible destination, verifies decorative hiding and About's
accessible name, and requires exact rail/tick geometry equality. The existing
hover contract's initial assertion now checks the shared hidden preview; all
destination and opacity assertions remain intact.

## Preservation evidence

- `git diff 76897e2 -- lib/spatial components/spatial/SpatialCamera.tsx`: **empty,
  0 bytes**, including the canonical station list.
- All other application files under `app`, `styles`, `lib`, `content`, and
  `components` excluding RouteNavigator have an empty diff against `76897e2`.
  SYSTEMS, Person of Interest grammar, content, composition, and mobile styling
  were not changed.
- Rail at 1440: `(x=552, y=46.1875, width=336, height=24)`; at 1920:
  `(x=792, y=46.1875, width=336, height=24)`. Every measured state before/after
  has identical rail and all fourteen tick rectangles: **0 px delta**.
- Field Notes and About preview rectangles match exactly before/after. Both
  start at `y=76.1875`, height `18`; widths are respectively `107.53125` and
  `61.453125` px. Their x coordinates at 1440 are `774.234375` and `821.2734375`;
  at 1920 they are `1014.234375` and `1061.2734375`.
- Full rail accessibility snapshots are identical before/after at both sizes.
  Each tick retains its one original name; About remains **`08, About`**.
  All observed visible previews carry `aria-hidden="true"`.
- The clearance JSX, snapshot/appearance condition, side-arrow function, cue
  effects/latch and arrow-key handler were compared with baseline and are
  identical. The probe records identical clearance presence, rectangles and
  computed masks for corresponding states at both sizes. Existing clearance,
  side-arrow, arrow-key and once-per-session cue contracts pass.
- Black-transition compositing CSS and its inherited colors are unchanged;
  the shared preview remains inside the same difference-composited navigator.
  No separate black-transition pixel/contrast probe was run.
- The known untracked `tests/tools/v14-10-review-capture.mjs` remains untouched.
  Before/after SHA-256:
  `2738940268CE6E242BD016261E6C8CAF857091BB15E28E8219599C63DD6D0CB4`.
- No orchestrator documents or existing review evidence were edited. No commit,
  push, branch, tag, worktree or merge operation was performed.

## Validation

- `pnpm typecheck`: **PASS**.
- `pnpm lint`: **PASS**, no diagnostics.
- `pnpm build`: **PASS** after retry with network access. The first sandboxed
  build failed fetching the three existing Google Fonts; the successful retry
  compiled, typechecked and generated all 15 pages.
- With `PORT=3200`, `pnpm exec playwright test --project=chromium
  tests/e2e/navigation.spec.ts tests/e2e/a11y.spec.ts`: **38 passed (31.8s)**,
  including both new viewport contracts, against the rebuilt production server.
- Before/after desktop probe: **PASS**, measurements above.
- `git diff --check`: **PASS**.

Windows PowerShell blocks the `pnpm.ps1` shim; commands used `pnpm.cmd` instead.
The existing server required elevated process-stop access, which succeeded; it
was restarted on port 3200 with the successful new production build.

No full acceptance matrix, WebKit, unit suite, standalone mobile probe or motion
probe was run. The two requested spec files include their existing mobile tests;
those ran as part of the requested suites. No separate mobile art-direction,
1920 composition or motion acceptance claim is made. Preservation outside the
measured navigator states is established by the scoped source comparisons above.
The surface-return clearance halo remains explicitly out of scope and untouched.

## Files changed or added by this task

- `components/spatial/RouteNavigator.tsx`
- `tests/e2e/navigation.spec.ts`
- `tests/tools/v14-15-navigator-preview.mjs`
- `docs/review/v14.15-navigator-fix/REPORT.md`
- `docs/review/v14.15-navigator-fix/before.json`
- `docs/review/v14.15-navigator-fix/after.json`
- `docs/review/v14.15-navigator-fix/before-1440-mixed.png`
- `docs/review/v14.15-navigator-fix/before-1920-mixed.png`
- `docs/review/v14.15-navigator-fix/after-1440-mixed.png`
- `docs/review/v14.15-navigator-fix/after-1920-mixed.png`
