// Run before/after against the production server: node tests/tools/v14-15-navigator-preview.mjs before
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const phase = process.argv[2];
if (!["before", "after"].includes(phase)) throw new Error("Specify before or after");
const out = "docs/review/v14.15-navigator-fix";
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1920, height: 1080 },
  ]) {
    const page = await browser.newPage({ viewport });
    await page.goto(process.env.PROBE_BASE ?? "http://localhost:3200");
    await page.locator("[data-route-spacer]").waitFor();
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 200);
    await page.locator("[data-nav-rail]").waitFor({ state: "visible" });
    await page.waitForTimeout(1200);
    const states = {};
    const measure = async (name) => {
      await page.waitForTimeout(350);
      states[name] = await page.evaluate(() => {
        const box = (el) => {
          const { x, y, width, height } = el.getBoundingClientRect();
          return { x, y, width, height };
        };
        const previews = [...document.querySelectorAll("[data-nav-preview]")]
          .filter((el) => Number(getComputedStyle(el).opacity) > 0)
          .map((el) => ({
            id: el.dataset.navPreview,
            text: el.textContent.trim(),
            opacity: Number(getComputedStyle(el).opacity),
            box: box(el),
            ariaHidden: el.getAttribute("aria-hidden"),
          }));
        const [a, b] = previews.map((p) => p.box);
        const overlap =
          a && b
            ? {
                width: Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)),
                height: Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)),
              }
            : null;
        const clearance = document.querySelector("[data-nav-clearance] > div");
        return {
          count: previews.length,
          previews,
          overlap,
          rail: box(document.querySelector("[data-nav-rail] ol")),
          ticks: [...document.querySelectorAll("[data-nav-station]")].map((el) => ({
            id: el.dataset.navStation,
            box: box(el),
          })),
          focused: document.activeElement?.getAttribute("data-nav-station"),
          clearance: clearance
            ? { box: box(clearance), mask: getComputedStyle(clearance).maskImage }
            : null,
        };
      });
    };
    await measure("rest");
    const field = page.locator('[data-nav-station="field-notes"]');
    await field.hover();
    await measure("hoverOnly");
    await field.click();
    await page.waitForTimeout(1800);
    // Sample every animation frame, including the opacity transition.
    await page.evaluate(() => {
      window.__previewCounts = [];
      const start = performance.now();
      const sample = () => {
        window.__previewCounts.push(
          [...document.querySelectorAll("[data-nav-preview]")].filter(
            (el) => Number(getComputedStyle(el).opacity) > 0,
          ).length,
        );
        if (performance.now() - start < 1200) requestAnimationFrame(sample);
      };
      requestAnimationFrame(sample);
    });
    await page.keyboard.press("Tab");
    await measure("mixed");
    await page.screenshot({ path: `${out}/${phase}-${viewport.width}-mixed.png` });
    await page.mouse.move(700, 400);
    await measure("focusOnly");
    await field.hover();
    await page.locator('[data-nav-step="next"]').focus();
    await measure("focusAway");
    const transitionMax = await page.evaluate(() => Math.max(...window.__previewCounts));
    const names = await page.locator("[data-nav-rail] ol").ariaSnapshot();
    results.push({ viewport, states, transitionMax, accessibility: names });
    await page.close();
  }
} finally {
  await browser.close();
}
writeFileSync(`${out}/${phase}.json`, JSON.stringify(results, null, 2) + "\n");
console.log(
  JSON.stringify(
    results.map(({ viewport, states, transitionMax }) => ({
      viewport,
      transitionMax,
      states: Object.fromEntries(
        Object.entries(states).map(([name, s]) => [
          name,
          { count: s.count, ids: s.previews.map((p) => p.id), overlap: s.overlap, rail: s.rail },
        ]),
      ),
    })),
    null,
    2,
  ),
);
