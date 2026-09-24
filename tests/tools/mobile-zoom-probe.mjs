// V8 evidence tool: mobile/tablet widths and desktop browser-zoom levels.
// Records CSS viewport TRUTH (§7/§11) rather than screenshot pixels, plus
// overflow and console health at each.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
// V9: honours PROBE_OUT. It was hardcoded at the V8 bundle, so re-running it in
// a later pass silently overwrote that pass's committed evidence.
const OUT = process.env.PROBE_OUT ?? "docs/review/v9-release/metrics";
mkdirSync(OUT, { recursive: true });

const MOBILE = [320, 360, 375, 390, 430, 768];
// Browser zoom changes the CSS viewport, not the device: a 1920x1080 screen at
// 125% reports 1536x864 CSS px. Emulated by the equivalent CSS viewport, which
// is what the page actually responds to.
const ZOOM = [
  { label: "1920x1080 @ 90%", width: 2133, height: 1200 },
  { label: "1920x1080 @ 100%", width: 1920, height: 1080 },
  { label: "1920x1080 @ 110%", width: 1745, height: 982 },
  { label: "1920x1080 @ 125%", width: 1536, height: 864 },
  { label: "2560x1440 @ 100%", width: 2560, height: 1440 },
  { label: "2560x1440 @ 50%", width: 5120, height: 2880 },
];

const browser = await chromium.launch();
const report = { mobile: [], zoom: [] };

async function inspect(page) {
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(700);
  const top = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      dpr: window.devicePixelRatio,
      vvWidth: window.visualViewport ? Math.round(window.visualViewport.width) : null,
      vvHeight: window.visualViewport ? Math.round(window.visualViewport.height) : null,
      vvScale: window.visualViewport ? window.visualViewport.scale : null,
      overflow: Math.max(0, doc.scrollWidth - doc.clientWidth),
      scenes: document.querySelectorAll("[data-scene]").length,
      planes: document.querySelectorAll("[data-project-plane]").length,
    };
  });
  // Sweep the whole document for overflow and for how much world is in frame.
  const sweep = await page.evaluate(async () => {
    const doc = document.documentElement;
    let maxOverflow = 0;
    let maxScenesInFrame = 0;
    const steps = 40;
    for (let i = 0; i <= steps; i += 1) {
      window.scrollTo(0, (doc.scrollHeight - window.innerHeight) * (i / steps));
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      maxOverflow = Math.max(maxOverflow, doc.scrollWidth - doc.clientWidth);
      let inFrame = 0;
      for (const el of document.querySelectorAll("[data-scene]")) {
        const r = el.getBoundingClientRect();
        if (r.right > 0 && r.left < window.innerWidth && r.bottom > 0 && r.top < window.innerHeight)
          inFrame += 1;
      }
      maxScenesInFrame = Math.max(maxScenesInFrame, inFrame);
    }
    return { maxOverflow: Math.max(0, maxOverflow), maxScenesInFrame };
  });
  return { ...top, ...sweep, errors };
}

for (const width of MOBILE) {
  const context = await browser.newContext({
    viewport: { width, height: 780 },
    isMobile: width < 768,
    hasTouch: width < 768,
  });
  const page = await context.newPage();
  const r = await inspect(page);
  await page.screenshot({ path: `${OUT}/mobile-${width}.png` });
  report.mobile.push({ width, ...r });
  console.log(
    `mobile ${String(width).padEnd(4)} overflow=${r.maxOverflow} scenes=${r.scenes} errors=${r.errors.length}`,
  );
  await context.close();
}

for (const z of ZOOM) {
  const context = await browser.newContext({ viewport: { width: z.width, height: z.height } });
  const page = await context.newPage();
  const r = await inspect(page);
  report.zoom.push({ ...z, ...r });
  console.log(
    `${z.label.padEnd(18)} css=${r.innerWidth}x${r.innerHeight} overflow=${r.maxOverflow} maxScenesInFrame=${r.maxScenesInFrame} errors=${r.errors.length}`,
  );
  await context.close();
}

writeFileSync(`${OUT}/mobile-zoom.json`, JSON.stringify(report, null, 2));
await browser.close();
