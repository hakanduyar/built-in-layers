// HERO THESIS VISIBILITY — does the site's primary line actually render, whole?
//
// V12 measured "0 horizontal overflow" and passed, but the hero thesis is
// clipped by an ANCESTOR (the 1180px scene block), which is not overflow. The
// line was cut mid-word at 1920 and absent entirely at 2560. This probe
// measures the thing that actually matters: the thesis column's painted box
// against its clipping ancestor, plus the rendered width of its longest line
// against its own scrollWidth.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3100";
const OUT = process.env.PROBE_OUT ?? "docs/review/v13-inventory/metrics";
mkdirSync(OUT, { recursive: true });

const VIEWPORTS = (process.env.PROBE_VIEWPORTS ?? "1366x768,1440x900,1536x864,1920x1080,2560x1440")
  .split(",")
  .map((s) => s.split("x").map(Number));

const browser = await chromium.launch();
const report = { base: BASE, viewports: {} };
let failures = 0;

for (const [W, H] of VIEWPORTS) {
  const context = await browser.newContext({ viewport: { width: W, height: H } });
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);

  const m = await page.evaluate(() => {
    // The thesis is the paragraph carrying the site's primary line.
    const paras = [...document.querySelectorAll("p")];
    const el = paras.find((p) => /interfaces on the surface/i.test(p.textContent || ""));
    if (!el) return { found: false };

    const r = el.getBoundingClientRect();
    // Nearest ancestor that actually clips.
    let clipper = el.parentElement;
    while (clipper && clipper !== document.documentElement) {
      const cs = getComputedStyle(clipper);
      if (cs.overflow !== "visible" || cs.overflowX !== "visible") break;
      clipper = clipper.parentElement;
    }
    const cr = (clipper ?? document.documentElement).getBoundingClientRect();

    return {
      found: true,
      text: (el.textContent || "").trim(),
      left: Math.round(r.left),
      right: Math.round(r.right),
      width: Math.round(r.width),
      // Text wider than its own box means glyphs are being cut.
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      clipperRight: Math.round(cr.right),
      clipperTag: (clipper ?? document.documentElement).tagName.toLowerCase(),
      // How far the thesis extends past whatever clips it.
      overhangPx: Math.round(r.right - cr.right),
      visible: r.width > 2 && r.height > 2 && Number(getComputedStyle(el).opacity) > 0.04,
    };
  });

  const clipped = !m.found || !m.visible || m.overhangPx > 0 || m.scrollWidth > m.clientWidth + 1;
  if (clipped) failures++;
  report.viewports[`${W}x${H}`] = { ...m, clipped };

  console.log(
    `${W}x${H}`.padEnd(11) +
      (m.found
        ? `left=${String(m.left).padStart(5)} right=${String(m.right).padStart(5)} ` +
          `clipperRight=${String(m.clipperRight).padStart(5)} overhang=${String(m.overhangPx).padStart(5)} ` +
          `scrollW=${m.scrollWidth} clientW=${m.clientWidth}  ${clipped ? "CLIPPED" : "ok"}`
        : "THESIS NOT FOUND IN DOM"),
  );
  await context.close();
}

writeFileSync(`${OUT}/hero-thesis.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(
  failures === 0 ? "\nPASS — thesis renders whole at every viewport" : `\nFAIL — ${failures}`,
);
process.exit(failures === 0 ? 0 : 1);
