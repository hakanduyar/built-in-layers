// Responsive world-fit probe (V8 pass). NOT part of the test suites -- an
// evidence tool. Drives a real browser across the owner's viewport matrix and
// records what each frame actually contains: CSS viewport truth, every scene
// block's measured box against the frame it has to fit, and overflow.
//
// Focus positions come from the route module itself (route-focus.json), not
// from a search over the page: after the world-unit change more than one scene
// can be in frame at once, so "nearest the frame centre" stopped identifying a
// scene's own focus.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v8-responsive/baseline";
const SHOTS = process.env.PROBE_SHOTS === "1";

const VIEWPORTS = (process.env.PROBE_VIEWPORTS
  ? process.env.PROBE_VIEWPORTS.split(",")
  : ["1366x768", "1440x900", "1536x864", "1600x900", "1918x864", "1920x1080", "2560x1440"]
).map((name) => {
  const [width, height] = name.split("x").map(Number);
  return { name, width, height };
});

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const report = [];

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text()); });
  page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e.message}`));

  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForSelector("section[aria-label='Spatial system tour'] .sticky");
  await page.waitForTimeout(350);

  const truth = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    dpr: window.devicePixelRatio,
    vvWidth: window.visualViewport ? Math.round(window.visualViewport.width) : null,
    vvHeight: window.visualViewport ? Math.round(window.visualViewport.height) : null,
    vvScale: window.visualViewport ? window.visualViewport.scale : null,
    aspect: +(window.innerWidth / window.innerHeight).toFixed(3),
  }));

  const range = await page.evaluate(() => {
    const section = document.querySelector("section[aria-label='Spatial system tour']");
    const spacer = section.querySelector(":scope > div");
    const start = section.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
  });

  // Park the camera at each scene's OWN focus progress, read from the route
  // module itself (docs/review/v8-responsive/route-focus.json, regenerated
  // whenever the route changes). An earlier version searched for each scene's
  // best-framed sample instead, and that stopped being trustworthy the moment
  // the world-unit change put more than one scene in frame at once: a scene can
  // sit nearest the frame centre at a progress that is not its own.
  const FOCUS = JSON.parse(readFileSync("docs/review/v8-responsive/route-focus.json", "utf8")).desktop;
  const best = new Map();
  let maxOverflow = 0;
  for (const [id, p] of Object.entries(FOCUS)) {
    await page.evaluate(({ range, p }) => {
      window.scrollTo(0, range.start + (range.end - range.start) * p);
    }, { range, p });
    // The camera runs through a two-stage lag filter, so a JUMP to a focus
    // progress is still settling for several hundred ms afterwards. Poll the
    // scene's own box until it stops moving rather than guessing a timeout --
    // a fixed wait measured every scene progressively further off-frame down
    // the route, which is the signature of reading a camera in flight.
    await page.waitForFunction(
      (sceneId) => {
        const el = document.querySelector(`[data-scene="${sceneId}"]`);
        if (!el) return true;
        const top = Math.round(el.getBoundingClientRect().top);
        const w = window;
        const settled = w.__probeLast === top ? (w.__probeHits ?? 0) + 1 : 0;
        w.__probeLast = top;
        w.__probeHits = settled;
        return settled >= 3;
      },
      id,
      { timeout: 15000, polling: 100 },
    );
    await page.evaluate(() => {
      window.__probeLast = undefined;
      window.__probeHits = 0;
    });
    const frame = await page.evaluate((sceneId) => {
      const doc = document.documentElement;
      const el = document.querySelector(`[data-scene="${sceneId}"]`);
      const r = el ? el.getBoundingClientRect() : null;
      return {
        overflow: Math.max(0, doc.scrollWidth - doc.clientWidth),
        box: r ? { top: Math.round(r.top), left: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) } : null,
      };
    }, id);
    maxOverflow = Math.max(maxOverflow, frame.overflow);
    if (frame.box) best.set(id, { p, box: frame.box });
  }

  const stops = [...best.entries()]
    .sort((a, b) => a[1].p - b[1].p)
    .map(([id, { p, box }]) => ({
      id,
      p: +p.toFixed(4),
      w: box.w,
      h: box.h,
      // The two numbers that decide "does this composition fit its frame".
      heightFrac: +(box.h / vp.height).toFixed(3),
      widthFrac: +(box.w / vp.width).toFixed(3),
      clippedTop: Math.round(Math.max(0, -box.top)),
      clippedBottom: Math.round(Math.max(0, box.top + box.h - vp.height)),
    }));

  if (SHOTS) {
    for (const stop of stops) {
      await page.evaluate(({ range, p }) => {
        window.scrollTo(0, range.start + (range.end - range.start) * p);
      }, { range, p: stop.p });
      await page.waitForTimeout(320);
      await page.screenshot({ path: `${OUT}/${vp.name}--${stop.id}.png` });
    }
  }

  // The late page: the two authoritative sections, plus the CTA.
  const late = await page.evaluate(async () => {
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 400));
    const out = {};
    for (const id of ["selected-systems", "how-i-build", "field-notes", "about"]) {
      const el = document.querySelector(`[data-drift-block="${id}"]`);
      out[id] = el ? Math.round(el.getBoundingClientRect().height) : null;
    }
    const doc = document.documentElement;
    out.docOverflow = Math.max(0, doc.scrollWidth - doc.clientWidth);
    out.docHeightVh = +(doc.scrollHeight / window.innerHeight).toFixed(1);
    return out;
  });

  if (SHOTS) {
    await page.screenshot({ path: `${OUT}/${vp.name}--late-page.png` });
  }

  report.push({ viewport: vp.name, truth, stops, late, maxOverflow, consoleErrors });
  console.log(
    `${vp.name.padEnd(10)} aspect=${String(truth.aspect).padEnd(6)} ` +
      stops.map((s) => `${s.id}:${s.heightFrac}`).join(" ") +
      `  overflow=${maxOverflow}  page=${late.docHeightVh}vh  err=${consoleErrors.length}`,
  );
  await context.close();
}

writeFileSync(`${OUT}/measurements.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\nwrote ${OUT}/measurements.json`);
