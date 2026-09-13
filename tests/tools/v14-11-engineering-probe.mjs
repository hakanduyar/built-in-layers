import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
const out = process.env.PROBE_OUT;
if (!out) throw new Error("PROBE_OUT required");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const result = {};
for (const [width, height] of [
  [1440, 900],
  [1920, 1080],
]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const cue = () =>
    page.locator("[data-nav-step]").evaluateAll((es) =>
      es.map((e) => ({
        direction: e.dataset.navStep,
        cue: e.dataset.navCue,
        disabled: e.disabled,
        animation: getComputedStyle(e).animationName,
      })),
    );
  const firstCue = await cue();
  await page.evaluate(() => scrollTo(0, 150));
  await page.waitForTimeout(300);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(300);
  const returnedCue = await cue();
  await page.evaluate(() => scrollTo(0, 150));
  await page.waitForTimeout(300);
  const frames = [];
  for (const id of ["software-factory", "kivilcim", "jointledger", "dropspot"]) {
    if (id === "kivilcim")
      await page.evaluate(() => {
        window.trace = [];
        const t = performance.now();
        const tick = () => {
          const e = document.querySelector('[data-scene="kivilcim"] [data-project-ground-source]');
          const r = e.getBoundingClientRect();
          window.trace.push({
            ms: Math.round(performance.now() - t),
            active: document.querySelector("[data-nav-readout]").dataset.navReadout,
            left: r.left,
            top: r.top,
            right: r.right,
          });
          if (performance.now() - t < 2400) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    await page.locator(`[data-nav-station="${id}"]`).click();
    await page.waitForTimeout(2600);
    frames.push(
      await page.locator(`[data-scene="${id}"]`).evaluate((e) => {
        const f = e.querySelector("[data-system-pov]").getBoundingClientRect();
        const rs = [...e.querySelectorAll("[data-project-ground-source]")].map((x) =>
          x.getBoundingClientRect(),
        );
        const right = Math.max(...rs.map((r) => r.right));
        return {
          id: e.dataset.scene,
          frameRight: f.right,
          evidenceRight: right,
          difference: f.right - right,
        };
      }),
    );
  }
  const trace = await page.evaluate(() => window.trace);
  const firstNamed = trace.find((x) => x.active === "kivilcim");
  const geom = await page.evaluate(() => {
    const s = document.querySelector("[data-route-spacer]");
    const start = scrollY + s.getBoundingClientRect().top;
    return {
      start,
      span: s.offsetHeight - innerHeight,
      pinnedEnd: start + s.offsetHeight - innerHeight,
    };
  });
  const boundary = {};
  if (width === 1440)
    for (const dir of [1, -1]) {
      await page.evaluate((y) => scrollTo(0, y), geom.pinnedEnd + (dir === 1 ? -250 : 1350));
      await page.waitForTimeout(1800);
      const steps = [];
      for (let i = 0; i < 24; i++) {
        const before = await page.evaluate(() => scrollY);
        await page.mouse.wheel(0, dir * 400);
        await page.waitForTimeout(100);
        const after = await page.evaluate(() => scrollY);
        steps.push({ before, after, step: after - before });
      }
      boundary[dir === 1 ? "down" : "up"] = steps;
    }
  result[`${width}x${height}`] = { firstCue, returnedCue, frames, firstNamed, geom, boundary };
  writeFileSync(`${out}/trace-${width}.json`, JSON.stringify(trace));
  await page.close();
}
writeFileSync(`${out}/summary.json`, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
await browser.close();
