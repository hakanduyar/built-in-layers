// FABLE GATE (V13) — the production-build matrix, WITH the numbers behind it.
//
// The still matrix (still-capture.mjs) shows what a frame looks like; this probe
// records, in the same pass, the measurements the art-direction findings were
// written from, so every before/after claim in `.ai/handoffs/FABLE-RETURN.md`
// can be checked against a number rather than an eye:
//
//   B  ground shape — how much of a project's ground plane lies OUTSIDE its
//      evidence union on each side (px), at focus and at the exit beats;
//   C  frame registration — the evidence plate's clearance to the frame bottom
//      against the identity label's clearance to the frame top;
//   D  the case-study routes, which had never been captured;
//   E  the lower-world landmarks, plus the SELECTED SYSTEMS column-label offset
//      and the HOW I BUILD consequence-mark gap.
//
// Modes (PROBE_MODE): matrix | phases | work | all. Zoom is emulated the way the
// V12 matrix did it — a larger CSS viewport at 1920 base (2400x1350 = 80 %,
// 2866x1612 = 67 %, 3840x2160 = 50 %) — so the frames are comparable.
import { chromium } from "@playwright/test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3100";
const ROOT = process.env.PROBE_ROOT ?? "docs/review/v13-fable-gate";
const TAG = process.env.PROBE_TAG ?? "before";
const MODE = process.env.PROBE_MODE ?? "all";
const parseViewports = (s) => s.split(",").map((v) => v.split("x").map(Number));
const VIEWPORTS = parseViewports(
  process.env.PROBE_VIEWPORTS ?? "1366x768,1440x900,1536x864,1920x1080,2560x1440",
);
// [W, H, zoom] — the V12 zoom emulation, kept byte-for-byte so frames compare.
const ZOOMS = (process.env.PROBE_ZOOMS ?? "80,67,50")
  .split(",")
  .filter(Boolean)
  .map((z) => ({ 80: [2400, 1350, 80], 67: [2866, 1612, 67], 50: [3840, 2160, 50] })[z]);
const PHASE_VIEWPORTS = parseViewports(process.env.PROBE_PHASE_VIEWPORTS ?? "1536x864,1920x1080");
const WORK_VIEWPORTS = parseViewports(
  process.env.PROBE_WORK_VIEWPORTS ?? "1366x768,1440x900,1920x1080",
);
const FOCUS = JSON.parse(
  readFileSync(
    process.env.FOCUS_FILE ?? "docs/review/v13-fable-gate/metrics/route-focus.json",
    "utf8",
  ),
).desktop;

const OUT = `${ROOT}/${TAG}`;
for (const d of ["responsive", "zoom", "project-phases", "work", "metrics"]) {
  mkdirSync(`${OUT}/${d}`, { recursive: true });
}

const SCENES = [
  "hero",
  "software-factory",
  "kivilcim",
  "jointledger",
  "dropspot",
  "tail",
  "reorient",
  "approach",
  "handoff",
];
const PROJECTS = ["software-factory", "kivilcim", "jointledger", "dropspot"];
const LANDMARKS = [
  ["selected-systems", '[data-drift-block="selected-systems"]'],
  ["how-i-build", '[data-drift-block="how-i-build"]'],
  ["field-notes", '[data-drift-block="field-notes"]'],
  ["about", '[data-drift-block="about"]'],
];
const WORK_ROUTES = [
  "software-factory",
  "kivilcim",
  "jointledger",
  "dropspot",
  "professional-systems",
];

const browser = await chromium.launch();
const report = { base: BASE, tag: TAG, matrix: {}, phases: {}, work: {} };

// ---------------------------------------------------------------- helpers
async function openHome(W, H) {
  const context = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await context.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page
    .locator("section[aria-label='Spatial system tour'] .sticky")
    .waitFor({ state: "attached", timeout: 30000 });
  await page.waitForTimeout(400);
  const range = await page.evaluate(() => {
    const s = document.querySelector("section[aria-label='Spatial system tour']");
    const sp = s.querySelector(":scope > div");
    const start = s.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + sp.getBoundingClientRect().height - window.innerHeight };
  });
  return { context, page, errors, range };
}

async function scrollToProgress(page, range, p) {
  await page.evaluate(
    ({ r, v }) => window.scrollTo(0, r.start + (r.end - r.start) * Math.max(0, Math.min(1, v))),
    { r: range, v: p },
  );
}

async function settle(page, sel) {
  await page.waitForFunction(
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
  );
  await page.evaluate(() => {
    window.__pk = undefined;
    window.__pn = 0;
  });
}

// The ground-versus-evidence geometry for one project scene, in viewport px.
// `evidence` is the union of the registered ground sources (the figures); `media`
// is the union of the images inside them (the painted evidence without mat and
// caption). Every "outside" value is how far the ground extends PAST the
// evidence on that side (negative = the evidence overhangs the ground).
const measureProject = (page, id) =>
  page.evaluate((sid) => {
    const scene = document.querySelector(`[data-scene="${sid}"]`);
    const plane = document.querySelector(`[data-project-plane="${sid}"]`);
    if (!scene) return null;
    const rect = (el) => el.getBoundingClientRect();
    const union = (els) => {
      const rs = els.map(rect).filter((r) => r.width > 0 && r.height > 0);
      if (!rs.length) return null;
      return {
        left: Math.min(...rs.map((r) => r.left)),
        top: Math.min(...rs.map((r) => r.top)),
        right: Math.max(...rs.map((r) => r.right)),
        bottom: Math.max(...rs.map((r) => r.bottom)),
      };
    };
    const round = (o) =>
      o && Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v)]));
    const sources = [...scene.querySelectorAll(`[data-project-ground-source="${sid}"]`)];
    const evidence = union(sources);
    const media = union(sources.flatMap((s) => [...s.querySelectorAll("img")]));
    const s = rect(scene);
    const g = plane ? rect(plane) : null;
    const h3 = scene.querySelector("h3");
    const label = scene.querySelector("h3")?.parentElement?.querySelector("span.font-mono");
    const marker = scene.querySelector("[data-scene-marker], .font-mono");
    const opacity = plane ? Number(getComputedStyle(plane).opacity) : null;
    const out = {
      viewport: { w: window.innerWidth, h: window.innerHeight },
      scene: round({ left: s.left, top: s.top, right: s.right, bottom: s.bottom }),
      ground: g && round({ left: g.left, top: g.top, right: g.right, bottom: g.bottom }),
      groundOpacity: opacity == null ? null : Math.round(opacity * 1000) / 1000,
      evidence: round(evidence),
      media: round(media),
      title: h3 && round({ top: rect(h3).top, left: rect(h3).left, bottom: rect(h3).bottom }),
      labelTop: label ? Math.round(rect(label).top) : marker ? Math.round(rect(marker).top) : null,
    };
    if (g && evidence) {
      out.groundOutsideEvidence = {
        above: Math.round(evidence.top - g.top),
        below: Math.round(g.bottom - evidence.bottom),
        left: Math.round(evidence.left - g.left),
        right: Math.round(g.right - evidence.right),
      };
      out.groundSize = { w: Math.round(g.width), h: Math.round(g.height) };
      out.evidenceSize = {
        w: Math.round(evidence.right - evidence.left),
        h: Math.round(evidence.bottom - evidence.top),
      };
    }
    if (evidence) {
      out.frame = {
        plateBottomClearance: Math.round(window.innerHeight - evidence.bottom),
        plateTopClearance: Math.round(evidence.top),
        labelTopClearance: out.labelTop,
      };
    }
    return out;
  }, id);

// Landmark measurements for finding E.
const measureLandmarks = (page) =>
  page.evaluate(() => {
    const r = (el) => el?.getBoundingClientRect();
    const ss = document.querySelector('[data-drift-block="selected-systems"]');
    const hib = document.querySelector('[data-drift-block="how-i-build"]');
    const out = {};
    if (ss) {
      const label = [...ss.querySelectorAll("p")].find((p) =>
        /resolved by layer and record/i.test(p.textContent || ""),
      );
      const record = [...ss.querySelectorAll("span")].find(
        (s) => (s.textContent || "").trim() === "Record",
      );
      const heading = ss.querySelector("h2");
      out.selectedSystems = {
        labelLeft: label ? Math.round(r(label).left) : null,
        recordColumnLeft: record ? Math.round(r(record).left) : null,
        labelToColumnPx: label && record ? Math.round(r(record).left - r(label).left) : null,
        headingRight: heading ? Math.round(r(heading).right) : null,
        registerRight: Math.round(r(ss).right),
      };
    }
    if (hib) {
      const li = hib.querySelector("ol > li");
      const title = li?.querySelector("h3");
      const mark = title?.querySelector("span[aria-hidden]");
      const consequence = [...(li?.querySelectorAll("p") ?? [])].find((p) =>
        /^consequence$/i.test((p.textContent || "").trim()),
      );
      out.howIBuild = {
        titleRight: title ? Math.round(r(title).right) : null,
        markLeft: mark ? Math.round(r(mark).left) : null,
        markRight: mark ? Math.round(r(mark).right) : null,
        consequenceLeft: consequence ? Math.round(r(consequence).left) : null,
        markToConsequencePx:
          mark && consequence ? Math.round(r(consequence).left - r(mark).right) : null,
      };
    }
    return out;
  });

// ---------------------------------------------------------------- matrix
async function runMatrix(W, H, zoom) {
  const { context, page, errors, range } = await openHome(W, H);
  const tag = zoom ? `${W}x${H}@${zoom}` : `${W}x${H}`;
  const dir = zoom ? "zoom" : "responsive";
  const entry = { scenes: {}, landmarks: null, errors };
  for (const id of SCENES) {
    await scrollToProgress(page, range, FOCUS[id]);
    await settle(page, `[data-scene="${id}"]`);
    if (PROJECTS.includes(id)) entry.scenes[id] = await measureProject(page, id);
    await page.screenshot({ path: `${OUT}/${dir}/${tag}--${id}.png` });
  }
  await page.evaluate(({ r }) => window.scrollTo(0, r.end + window.innerHeight * 0.25), {
    r: range,
  });
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `${OUT}/${dir}/${tag}--surface-return.png` });
  for (const [name, sel] of LANDMARKS) {
    await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (el)
        window.scrollTo(
          0,
          el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.12,
        );
    }, sel);
    await page.waitForTimeout(700);
    if (name === "selected-systems" || name === "how-i-build") {
      entry.landmarks = { ...(entry.landmarks ?? {}), ...(await measureLandmarks(page)) };
    }
    await page.screenshot({ path: `${OUT}/${dir}/${tag}--${name}.png` });
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}/${dir}/${tag}--cta.png` });
  report.matrix[tag] = entry;

  for (const id of PROJECTS) {
    const m = entry.scenes[id];
    const o = m?.groundOutsideEvidence;
    console.log(
      `${tag.padEnd(14)} ${id.padEnd(17)} ` +
        (o
          ? `ground outside evidence  above=${String(o.above).padStart(4)} below=${String(o.below).padStart(4)} ` +
            `left=${String(o.left).padStart(4)} right=${String(o.right).padStart(4)} | ` +
            `plate bottom clearance=${String(m.frame.plateBottomClearance).padStart(4)} label top=${m.labelTop}`
          : "no ground/evidence"),
    );
  }
  if (entry.landmarks) console.log(`${tag.padEnd(14)} landmarks`, JSON.stringify(entry.landmarks));
  if (errors.length) console.log(`${tag}: ${errors.length} console errors`, errors.slice(0, 3));
  await context.close();
}

// ---------------------------------------------------------------- phases
const LADDER = [-0.75, -0.375, 0, 0.375, 0.75];
const BEAT = new Map([
  [-0.75, "entry"],
  [-0.375, "mid-entry"],
  [0, "focus"],
  [0.375, "early-exit"],
  [0.75, "exit"],
]);
async function runPhases(W, H) {
  const { context, page, range } = await openHome(W, H);
  const tag = `${W}x${H}`;
  const entry = {};
  for (const [i, id] of PROJECTS.entries()) {
    const focus = FOCUS[id];
    const prev = i === 0 ? FOCUS.hero : FOCUS[PROJECTS[i - 1]];
    const next = i === PROJECTS.length - 1 ? FOCUS.tail : FOCUS[PROJECTS[i + 1]];
    entry[id] = {};
    for (const a of LADDER) {
      const target = a < 0 ? focus - Math.abs(a) * (focus - prev) : focus + a * (next - focus);
      await scrollToProgress(page, range, target);
      await settle(page, `[data-scene="${id}"]`);
      const beat = BEAT.get(a);
      entry[id][beat] = await measureProject(page, id);
      await page.screenshot({ path: `${OUT}/project-phases/${tag}--${id}--${beat}.png` });
    }
    const line = LADDER.map((a) => {
      const m = entry[id][BEAT.get(a)];
      const o = m?.groundOutsideEvidence;
      return `${BEAT.get(a)}: ${o ? `${o.above}/${o.below}/${o.left}/${o.right}` : "-"}`;
    }).join("  ");
    console.log(
      `${tag.padEnd(10)} ${id.padEnd(17)} ground outside (above/below/left/right)  ${line}`,
    );
  }
  report.phases[tag] = entry;
  await context.close();
}

// ---------------------------------------------------------------- work routes
async function runWork(W, H) {
  const context = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await context.newPage();
  const tag = `${W}x${H}`;
  const entry = {};
  for (const slug of WORK_ROUTES) {
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(`${BASE}/work/${slug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    const m = await page.evaluate(() => {
      const r = (el) => el?.getBoundingClientRect();
      const h1 = document.querySelector("h1");
      const main = document.querySelector("main") ?? document.body;
      const firstImg = main.querySelector("img");
      const h1cs = h1 ? getComputedStyle(h1) : null;
      const widest = [...main.querySelectorAll("p, h1, h2, h3, figure, dl, ul, ol")]
        .map((el) => r(el).right)
        .reduce((a, b) => Math.max(a, b), 0);
      return {
        h1FontPx: h1cs ? Math.round(parseFloat(h1cs.fontSize)) : null,
        h1Top: h1 ? Math.round(r(h1).top) : null,
        firstImageTop: firstImg ? Math.round(r(firstImg).top + window.scrollY) : null,
        firstImageInFold: firstImg ? r(firstImg).top < window.innerHeight : false,
        contentRight: Math.round(widest),
        containerRight: Math.round(r(main.querySelector("main > div") ?? main).right),
        pageHeight: document.documentElement.scrollHeight,
        hasContribution: /contribution/i.test(main.textContent || ""),
        textSample: (main.textContent || "").replace(/\s+/g, " ").slice(0, 160),
      };
    });
    entry[slug] = { ...m, errors };
    await page.screenshot({ path: `${OUT}/work/${tag}--${slug}.png` });
    await page.screenshot({ path: `${OUT}/work/${tag}--${slug}--full.png`, fullPage: true });
    console.log(
      `${tag.padEnd(10)} /work/${slug.padEnd(21)} h1=${m.h1FontPx}px  first image top=${m.firstImageTop ?? "none"}` +
        ` (in fold: ${m.firstImageInFold})  content right=${m.contentRight}/${W}  height=${m.pageHeight}` +
        `  contribution rendered=${m.hasContribution}`,
    );
  }
  report.work[tag] = entry;
  await context.close();
}

// ---------------------------------------------------------------- run
if (MODE === "all" || MODE === "matrix") {
  for (const [W, H] of VIEWPORTS) await runMatrix(W, H);
  for (const z of ZOOMS) if (z) await runMatrix(z[0], z[1], z[2]);
}
if (MODE === "all" || MODE === "phases") {
  for (const [W, H] of PHASE_VIEWPORTS) await runPhases(W, H);
}
if (MODE === "all" || MODE === "work") {
  for (const [W, H] of WORK_VIEWPORTS) await runWork(W, H);
}

writeFileSync(`${OUT}/metrics/fable-gate-${MODE}.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\nwritten: ${OUT}`);
