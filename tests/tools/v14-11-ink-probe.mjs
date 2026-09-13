import { chromium } from "@playwright/test";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const sharp = require(`${process.cwd()}/node_modules/.pnpm/sharp@0.34.5/node_modules/sharp`);
const out = process.env.PROBE_OUT;
if (!out) throw new Error("PROBE_OUT required");
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3200", { waitUntil: "networkidle" });
await page.evaluate(() => {
  const s = document.querySelector("[data-route-spacer]");
  scrollTo(0, scrollY + s.getBoundingClientRect().top + (s.offsetHeight - innerHeight) * 0.72);
});
await page.waitForTimeout(16000);
const stats = {};
for (const mode of ["after", "baseline-style"]) {
  if (mode === "baseline-style")
    await page.addStyleTag({
      content:
        ".route-navigator{mix-blend-mode:normal;--color-ink:#161616;--color-ink-muted:#504e48;--color-line:#b8b5ac}",
    });
  const clip = { x: 550, y: 18, width: 340, height: 66 };
  const png = await page.screenshot({ clip, path: `${out}/${mode}.png` });
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  let bright = 0,
    peak = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const v = (data[i] + data[i + 1] + data[i + 2]) / 3;
    peak = Math.max(peak, v);
    if (v > 150) bright++;
  }
  stats[mode] = {
    brightPixels: bright,
    peakMeanChannel: peak,
    blend: await page
      .locator("[data-route-navigator]")
      .evaluate((e) => getComputedStyle(e).mixBlendMode),
  };
}
writeFileSync(`${out}/ink.json`, JSON.stringify(stats, null, 2));
console.log(stats);
await browser.close();
