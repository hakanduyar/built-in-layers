// V14.14: the navigator's clearance over lower-world content, and the
// destination preview. Captures the two reported collision cases and measures
// whether any lower-world glyph box still intersects the instrument's band.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = process.env.OUT ?? "C:/Users/hakan/portfolio-review/v14.14-navigator/stills";
const browser = await chromium.launch();
const report = {};

for (const [W, H] of [
  [1440, 900],
  [1920, 1080],
]) {
  const dir = path.join(OUT, `${W}x${H}`);
  mkdirSync(dir, { recursive: true });
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
  await page.mouse.move(W / 2, H / 2);
  await page.mouse.wheel(0, 200);
  await page.waitForTimeout(700);

  const cases = {};
  for (const station of ["field-notes", "about"]) {
    await page.locator(`[data-nav-station="${station}"]`).click();
    await page.waitForTimeout(2200);
    await page.screenshot({ path: path.join(dir, `${station}.png`) });
    // Does any real lower-world text still sit inside the instrument's band?
    cases[station] = await page.evaluate(() => {
      const rail = document.querySelector("[data-nav-rail] ol");
      const readout = document.querySelector("[data-nav-readout]");
      if (!rail || !readout) return null;
      const r = rail.getBoundingClientRect(),
        o = readout.getBoundingClientRect();
      const band = {
        top: Math.min(r.top, o.top),
        bottom: Math.max(r.bottom, o.bottom),
        left: Math.min(r.left, o.left),
        right: Math.max(r.right, o.right),
      };
      const clearance = document.querySelector("[data-nav-clearance] > div");
      const c = clearance ? clearance.getBoundingClientRect() : null;
      // Every text-bearing element of the page proper (not the navigator).
      const hits = [];
      for (const el of document.querySelectorAll("main *, footer *")) {
        if (el.closest("[data-route-navigator]")) continue;
        if (!el.textContent || el.children.length) continue;
        const b = el.getBoundingClientRect();
        if (b.width === 0 || b.height === 0) continue;
        if (b.bottom < band.top || b.top > band.bottom) continue;
        if (b.right < band.left || b.left > band.right) continue;
        // Covered means the part of this text that lies in the instrument's band
        // is inside the clearance -- not that the whole paragraph is.
        const covered =
          c &&
          Math.max(b.top, band.top) >= c.top &&
          Math.min(b.bottom, band.bottom) <= c.bottom &&
          Math.max(b.left, band.left) >= c.left &&
          Math.min(b.right, band.right) <= c.right;
        hits.push({ text: el.textContent.trim().slice(0, 42), covered: Boolean(covered) });
      }
      return {
        band,
        clearance: c ? { top: c.top, bottom: c.bottom, left: c.left, right: c.right } : null,
        intersecting: hits.length,
        uncovered: hits.filter((h) => !h.covered),
      };
    });
  }

  // The destination preview, under the pointer.
  await page.locator('[data-nav-station="jointledger"]').hover();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(dir, "tick-hover.png") });
  cases.preview = await page.evaluate(() => {
    const el = document.querySelector('[data-nav-preview="jointledger"]');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { text: el.textContent.trim(), opacity: cs.opacity, visible: Number(cs.opacity) > 0.9 };
  });
  report[`${W}x${H}`] = cases;
  await page.close();
}
mkdirSync(path.dirname(path.resolve(process.env.REPORT ?? "report.json")), { recursive: true });
writeFileSync(process.env.REPORT ?? "report.json", JSON.stringify(report, null, 2));
for (const [vp, c] of Object.entries(report)) {
  for (const k of ["field-notes", "about"])
    console.log(
      `${vp} ${k}: intersecting ${c[k]?.intersecting}, UNCOVERED ${c[k]?.uncovered.length}`,
      c[k]?.uncovered.length ? JSON.stringify(c[k].uncovered.slice(0, 3)) : "",
    );
  console.log(`${vp} preview:`, JSON.stringify(c.preview));
}
await browser.close();
