// V13 MOBILE GATE — DESKTOP PARITY PROBE
//
// The mobile gate moved files that docs/FROZEN_BOUNDARY.md §1 fingerprints
// (the spatial route's scenes, world fit and camera; three homepage sections).
// Their mobile-scoped logic is legitimate only if the desktop is provably the
// same, so this probe walks two builds of the site — the frozen baseline and
// the candidate, on two ports — through the same routes at the same desktop
// viewports and compares them at every scroll step, two ways:
//
//   GEOMETRY  a fingerprint of every element's bounding rect (1/100 px) plus
//             the camera world's computed transform, taken once the camera has
//             settled. Layout is deterministic, so a build that changed nothing
//             on desktop matches this byte for byte at every step.
//   PIXELS    the two viewport captures compared exactly (the count of pixels
//             that differ at all) and robustly (each capture averaged over 4x4
//             cells; the largest per-channel difference between cells, and the
//             number of cells more than 12/255 apart). Chromium does not
//             rasterise the transformed spatial scene bit-identically from run
//             to run -- the scaled screenshots inside the plates resample a
//             little differently each time -- so on the homepage the exact
//             count is non-zero even between two walks of the SAME build; that
//             same-build pair is measured in every run and printed as the
//             floor. Averaged over 4x4 cells that jitter is under 10/255, while
//             anything real -- a line moved by a pixel, a tone changed, an
//             element missing -- is far above 12. Every static route is
//             pixel-identical outright.
//
// A route is at parity when its pixels are identical, or when its geometry is
// identical and no averaged cell differs by more than 12/255. A step that
// fails the cell test with identical geometry is re-examined rather than
// trusted either way: Chromium occasionally composites a settled frame from
// tiles rasterised at the animation's scale rather than the final one, which
// shifts every edge in the plate by a fraction of a pixel (measured up to
// ~20/255 on a cell, in same-build pairs too). The step is re-captured from
// fresh page loads, three of each build, and the fifteen pairs are compared:
// a real difference is in every cross-build pair and in no same-build pair,
// while jitter puts at least one cross-build pair inside the tolerance. The
// step passes only if some cross-build pair is within tolerance, and the
// numbers of all fifteen pairs are printed.
//
// PROBE_BASE_A (default http://127.0.0.1:3300, the baseline), PROBE_BASE_B
// (default http://127.0.0.1:3210, the candidate), PROBE_PAGES, PROBE_VIEWPORTS
// ("1440x900,..."), PROBE_STEP (fraction of the viewport per step, default
// 0.5), PROBE_REDUCED_MOTION=1 (walk with prefers-reduced-motion: reduce, where
// the tour renders its static fallback and captures are deterministic),
// PROBE_OUT (directory for the differing pairs; none kept when unset).
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
function loadSharp() {
  for (const spec of [
    "sharp",
    `${process.cwd()}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`,
  ]) {
    try {
      return require(spec);
    } catch {
      /* try the next location */
    }
  }
  return null;
}
const sharp = loadSharp();
if (!sharp) {
  console.error("sharp is required for the pixel diff");
  process.exit(1);
}

const A = process.env.PROBE_BASE_A ?? "http://127.0.0.1:3300";
const B = process.env.PROBE_BASE_B ?? "http://127.0.0.1:3210";
const PAGES = (
  process.env.PROBE_PAGES ?? "/,/work,/work/kivilcim,/work/dropspot,/about,/notes,/lab,/nope"
).split(",");
const VIEWPORTS = (process.env.PROBE_VIEWPORTS ?? "1280x800,1440x900,1536x864,1920x1080")
  .split(",")
  .map((s) => s.split("x").map(Number));
const STEP = Number(process.env.PROBE_STEP ?? 0.5);
const REDUCED = Boolean(process.env.PROBE_REDUCED_MOTION);
const OUT = process.env.PROBE_OUT ?? "";
if (OUT) mkdirSync(OUT, { recursive: true });

const WORLD = "section[aria-label='Spatial system tour'] [data-camera-plane='world']";
const CELL = 4;
const CELL_TOLERANCE = 12;

/**
 * Wait until the camera world's transform has held for eight consecutive frames
 * (the criterion the e2e helper and the route probe use), then until two
 * captures 100ms apart are byte-identical -- so a frame is compared across
 * builds only once it has stopped changing within its own build.
 */
async function settledShot(page) {
  await page.evaluate(
    (selector) =>
      new Promise((resolve) => {
        const world = document.querySelector(selector);
        if (!world) return resolve(true);
        let last = null;
        let stable = 0;
        let frames = 0;
        const tick = () => {
          frames += 1;
          const t = getComputedStyle(world).transform;
          if (t === last && t !== "none") {
            stable += 1;
            if (stable >= 8) return resolve(true);
          } else {
            stable = 0;
            last = t;
          }
          if (frames > 900) return resolve(false);
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    WORLD,
  );
  let shot = await page.screenshot();
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.waitForTimeout(100);
    const again = await page.screenshot();
    if (again.equals(shot)) return shot;
    shot = again;
  }
  return shot;
}

/**
 * Every rendered element's rect to 1/100 px, the world transform, and a hash
 * of it all. Elements without a box (scripts, styles, `display: none`, a
 * closed dialog) are left out: the chunk graph of a build is not its layout.
 */
function geometry(page) {
  return page.evaluate((selector) => {
    const parts = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      parts.push(
        `${el.tagName}:${Math.round(r.x * 100)},${Math.round(r.y * 100)},${Math.round(r.width * 100)},${Math.round(r.height * 100)}`,
      );
    }
    const world = document.querySelector(selector);
    parts.push(world ? getComputedStyle(world).transform : "no-world");
    const text = parts.join("|");
    let hash = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return { hash: hash.toString(16).padStart(8, "0"), elements: parts.length - 1 };
  }, WORLD);
}

/** Capture the viewport and the geometry at every scroll step of one route on one server. */
async function walk(context, base, path, height) {
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const shots = [];
  for (let y = 0; ; y += Math.round(height * STEP)) {
    const target = Math.min(y, total - height);
    await page.evaluate((yy) => window.scrollTo(0, yy), target);
    const png = await settledShot(page);
    shots.push({ y: target, png, geometry: await geometry(page) });
    if (target >= total - height) break;
  }
  await page.close();
  return { total, shots };
}

/**
 * Exact and robust comparison of two captures: the number of pixels that
 * differ at all, and -- after averaging each channel over CELLxCELL cells --
 * the largest cell difference and the number of cells beyond CELL_TOLERANCE.
 */
async function compare(a, b) {
  const X = await sharp(a).raw().toBuffer({ resolveWithObject: true });
  const Y = await sharp(b).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = X.info;
  let px = 0;
  for (let i = 0; i < X.data.length; i += channels) {
    for (let c = 0; c < 3; c++) {
      if (X.data[i + c] !== Y.data[i + c]) {
        px++;
        break;
      }
    }
  }
  let maxCell = 0;
  let cells = 0;
  const area = CELL * CELL;
  for (let cy = 0; cy + CELL <= height; cy += CELL) {
    for (let cx = 0; cx + CELL <= width; cx += CELL) {
      let d = 0;
      for (let c = 0; c < 3; c++) {
        let sx = 0;
        let sy = 0;
        for (let yy = 0; yy < CELL; yy++) {
          for (let xx = 0; xx < CELL; xx++) {
            const i = ((cy + yy) * width + cx + xx) * channels + c;
            sx += X.data[i];
            sy += Y.data[i];
          }
        }
        d = Math.max(d, Math.abs(sx - sy) / area);
      }
      maxCell = Math.max(maxCell, d);
      if (d > CELL_TOLERANCE) cells++;
    }
  }
  return { px, maxCell, cells };
}

/** One fresh load of a route scrolled to `y`, captured once settled. */
async function captureAt(context, base, path, y) {
  const page = await context.newPage();
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.evaluate((yy) => window.scrollTo(0, yy), y);
  const png = await settledShot(page);
  await page.close();
  return png;
}

/**
 * Re-examine one flagged step: three fresh captures of each build, every pair
 * compared. Returns the same-build and cross-build cell maxima, the smallest
 * cross-build cell maximum, and whether the step is at parity (some
 * cross-build pair within CELL_TOLERANCE).
 */
async function reexamine(context, path, y) {
  const shots = [];
  for (let i = 0; i < 3; i++) {
    shots.push({ build: "A", png: await captureAt(context, A, path, y) });
    shots.push({ build: "B", png: await captureAt(context, B, path, y) });
  }
  let sameMax = 0;
  let crossMax = 0;
  let crossMin = Infinity;
  for (let i = 0; i < shots.length; i++) {
    for (let j = i + 1; j < shots.length; j++) {
      const { maxCell } = await compare(shots[i].png, shots[j].png);
      if (shots[i].build === shots[j].build) sameMax = Math.max(sameMax, maxCell);
      else {
        crossMax = Math.max(crossMax, maxCell);
        crossMin = Math.min(crossMin, maxCell);
      }
    }
  }
  return { sameMax, crossMax, crossMin, parity: crossMin <= CELL_TOLERANCE };
}

console.log(
  `DESKTOP PARITY  A=${A} (baseline)  B=${B} (candidate)  motion=${REDUCED ? "reduce" : "no-preference"}  step=${STEP}  cell=${CELL}px tolerance=${CELL_TOLERANCE}/255`,
);
const browser = await chromium.launch();
const failures = [];
for (const [width, height] of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: REDUCED ? "reduce" : "no-preference",
  });
  for (const path of PAGES) {
    const a1 = await walk(context, A, path, height);
    const a2 = await walk(context, A, path, height);
    const b = await walk(context, B, path, height);
    const steps = Math.max(a2.shots.length, b.shots.length);
    const rows = [];
    for (let i = 0; i < steps; i++) {
      const sa = a2.shots[i];
      const sb = b.shots[i];
      if (!sa || !sb) {
        rows.push({ y: (sa ?? sb).y, missing: true });
        continue;
      }
      const noise = a1.shots[i]
        ? await compare(a1.shots[i].png, sa.png)
        : { px: 0, maxCell: 0, cells: 0 };
      const change = await compare(sa.png, sb.png);
      rows.push({ y: sa.y, noise, change, sameGeometry: sa.geometry.hash === sb.geometry.hash });
      if (change.px > 0 && OUT) {
        const stem = `${OUT}/${width}-${path.replace(/\W+/g, "_")}-${sa.y}`;
        writeFileSync(`${stem}-A.png`, sa.png);
        writeFileSync(`${stem}-B.png`, sb.png);
      }
    }
    const complete = rows.every((r) => !r.missing);
    const geometryOk = complete && rows.every((r) => r.sameGeometry);
    // Re-examine every step the cell test flagged while the geometry matched.
    const reexamined = [];
    if (geometryOk) {
      for (const r of rows) {
        if (r.change.cells === 0) continue;
        r.again = await reexamine(context, path, r.y);
        reexamined.push(
          `y=${r.y}: 3+3 fresh captures, same-build cell max ${r.again.sameMax.toFixed(1)}, cross-build ${r.again.crossMin.toFixed(1)}-${r.again.crossMax.toFixed(1)} => ${r.again.parity ? "jitter" : "CONSISTENT DIFFERENCE"}`,
        );
      }
    }
    const worstPx = Math.max(0, ...rows.map((r) => r.change?.px ?? 0));
    const floorPx = Math.max(0, ...rows.map((r) => r.noise?.px ?? 0));
    const worstCell = Math.max(0, ...rows.map((r) => r.change?.maxCell ?? 0));
    const floorCell = Math.max(0, ...rows.map((r) => r.noise?.maxCell ?? 0));
    const badCells = rows.reduce((n, r) => n + (r.change?.cells ?? 0), 0);
    const cellsOk = rows.every((r) => !r.change || r.change.cells === 0 || r.again?.parity);
    const pixelsOk = complete && worstPx === 0;
    const parity = pixelsOk || (geometryOk && cellsOk);
    if (!parity) failures.push(`${width}x${height} ${path}`);
    const detail = rows
      .filter((r) => r.missing || r.change.px > 0 || !r.sameGeometry)
      .map((r) =>
        r.missing
          ? `${r.y}:missing`
          : `${r.y}:${r.change.px}px/${r.change.maxCell.toFixed(1)}${r.change.cells ? ` ${r.change.cells} CELLS OUT${r.again ? (r.again.parity ? " (re-examined: jitter)" : " (re-examined: CONSISTENT)") : ""}` : ""}${r.sameGeometry ? "" : " GEOMETRY DIFFERS"}`,
      );
    console.log(
      `${String(width).padStart(4)}x${height} ${path.padEnd(16)} height ${a2.total} -> ${b.total}  steps ${steps}  elements ${a2.shots[0].geometry.elements} -> ${b.shots[0]?.geometry.elements ?? "?"}  geometry ${geometryOk ? "identical" : "DIFFERS"}  pixels ${pixelsOk ? "identical" : `worst ${worstPx}px, cell max ${worstCell.toFixed(1)}/255, ${badCells} cells out (same-build floor ${floorPx}px, cell max ${floorCell.toFixed(1)})`}  => ${parity ? "parity" : "NO PARITY"}` +
        (detail.length ? `  [${detail.join(" ")}]` : ""),
    );
    for (const line of reexamined) console.log(`          re-examined ${line}`);
  }
  await context.close();
}
await browser.close();
console.log(
  failures.length === 0
    ? "\nDESKTOP PARITY: every route at parity on every viewport"
    : `\nDESKTOP PARITY: NOT PROVEN — ${failures.join(", ")}`,
);
