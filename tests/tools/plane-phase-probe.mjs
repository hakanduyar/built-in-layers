// V10 (§B, §O, §P): PROVE the supporting plane leads / aligns / trails.
//
// The claim is about PHASE, so a static screenshot cannot settle it and neither
// can the plane's absolute position. What is measured here is the plane's offset
// RELATIVE TO ITS OWN PROJECT at a ladder of approach values. A static offset
// gives a flat line; a phase-shifted plane gives one sign before focus, ~zero at
// focus, and a growing opposite lag after it.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3000";
const OUT = process.env.PROBE_OUT ?? "docs/review/v10-spatial/metrics";
const W = Number(process.env.PROBE_W ?? 1536);
const H = Number(process.env.PROBE_H ?? 864);
const SHOTS = process.env.PROBE_SHOTS === "1";
const SHOT_OUT = process.env.SHOT_OUT ?? "C:/Users/hakan/portfolio-review/v10";
mkdirSync(OUT, { recursive: true });
if (SHOTS) mkdirSync(SHOT_OUT, { recursive: true });

const FOCUS = JSON.parse(
  (await import("node:fs")).readFileSync("docs/review/v9-release/metrics/route-focus.json", "utf8"),
).desktop;
const PROJECTS = ["software-factory", "kivilcim", "jointledger", "dropspot"];

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: W, height: H } });
const page = await context.newPage();
await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(900);

const range = await page.evaluate(() => {
  const s = document.querySelector("section[aria-label='Spatial system tour']");
  const sp = s.querySelector(":scope > div");
  const t = s.getBoundingClientRect().top + window.scrollY;
  return { start: t, end: t + sp.getBoundingClientRect().height - window.innerHeight };
});

const settle = (sel) =>
  page
    .waitForFunction(
      (s) => {
        const el = document.querySelector(s);
        if (!el) return true;
        const r = el.getBoundingClientRect();
        const k = `${Math.round(r.top)}:${Math.round(r.left)}`;
        const w = window;
        const n = w.__pk === k ? (w.__pn ?? 0) + 1 : 0;
        w.__pk = k;
        w.__pn = n;
        return n >= 4;
      },
      sel,
      { timeout: 30000, polling: 90 },
    )
    .then(() =>
      page.evaluate(() => {
        window.__pk = undefined;
        window.__pn = 0;
      }),
    );

const report = { viewport: `${W}x${H}`, projects: {} };
// Progress window either side of focus, in units of the gap to the neighbour.
const LADDER = [-0.75, -0.5, -0.25, 0, 0.25, 0.5, 0.75];

for (const [i, id] of PROJECTS.entries()) {
  const focus = FOCUS[id];
  const prev = i === 0 ? FOCUS.hero : FOCUS[PROJECTS[i - 1]];
  const next = i === PROJECTS.length - 1 ? FOCUS.tail : FOCUS[PROJECTS[i + 1]];
  const rows = [];
  for (const a of LADDER) {
    const target = a < 0 ? focus - Math.abs(a) * (focus - prev) : focus + a * (next - focus);
    await page.evaluate(({ r, v }) => window.scrollTo(0, r.start + (r.end - r.start) * v), {
      r: range,
      v: Math.max(0, Math.min(1, target)),
    });
    await settle(`[data-scene="${id}"]`);
    const m = await page.evaluate((sid) => {
      const scene = document.querySelector(`[data-scene="${sid}"]`);
      const plane = document.querySelector(`[data-project-plane="${sid}"]`);
      if (!scene || !plane) return null;
      const s = scene.getBoundingClientRect();
      const q = plane.getBoundingClientRect();
      // The ISOLATED choreography: the plane's own transform. Its left/top carry
      // the static camera+offset term and its parallax rate, which changes with
      // camera position and would otherwise swamp the phase signal.
      const t = getComputedStyle(plane).transform;
      const m = /matrix(([^)]+))/.exec(t);
      const tx = m ? Number(m[1].split(",")[4]) : 0;
      const ty = m ? Number(m[1].split(",")[5]) : 0;
      return {
        relX: Math.round(q.left - s.left),
        relY: Math.round(q.top - s.top),
        shiftX: Math.round(tx * 10) / 10,
        shiftY: Math.round(ty * 10) / 10,
        opacity: Number(getComputedStyle(plane).opacity.slice(0, 5)),
      };
    }, id);
    rows.push({ approach: a, ...m });
    if (SHOTS && (a === -0.5 || a === 0 || a === 0.5)) {
      const beat = a === 0 ? "focus" : a < 0 ? "entry" : "exit";
      await page.screenshot({ path: `${SHOT_OUT}/${W}x${H}--${id}--${beat}.png` });
    }
  }
  // Phase test: displacement relative to the value at focus.
  const shift = rows.map((r) => ({
    approach: r.approach,
    dx: r.shiftX,
    dy: r.shiftY,
    mag: Math.round(Math.hypot(r.shiftX, r.shiftY) * 10) / 10,
  }));
  const lead = Math.max(...shift.filter((s) => s.approach < 0).map((s) => s.mag));
  const trail = Math.max(...shift.filter((s) => s.approach > 0).map((s) => s.mag));
  report.projects[id] = {
    rows,
    shift,
    leadPx: lead,
    trailPx: trail,
    focusAlignPx: shift.find((x) => x.approach === 0).mag,
    phaseShifted: lead > 6 && trail > 6,
    trailExceedsLead: trail > lead,
  };
  console.log(
    `${id.padEnd(17)} lead=${String(lead).padStart(4)}px  focus=0px  trail=${String(trail).padStart(4)}px  ` +
      `phase=${lead > 6 && trail > 6 ? "YES" : "NO"}  trail>lead=${trail > lead ? "YES" : "NO"}`,
  );
}

writeFileSync(`${OUT}/plane-phase-${W}x${H}.json`, JSON.stringify(report, null, 2));
await browser.close();
