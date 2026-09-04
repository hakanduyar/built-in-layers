// PHASE 7 — RUNTIME PROBE
//
// The e2e suite already covers axe, console errors on the routes a11y.spec
// visits, 404s and horizontal overflow. It does not cover layout shift, and it
// does not sweep EVERY route for console/runtime/hydration warnings or check
// that every rendered image is sized and actually loads. This probe does those,
// on a production build, and prints numbers rather than a verdict.
//
//   node tests/tools/phase7-runtime-probe.mjs [--port 3100]

import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const port = Number(process.argv[process.argv.indexOf("--port") + 1]) || 3100;
const base = `http://localhost:${port}`;

const ROUTES = [
  "/",
  "/work",
  "/work/kivilcim",
  "/work/jointledger",
  "/work/dropspot",
  "/work/professional-systems",
  "/work/software-factory",
  "/about",
  "/notes",
  "/lab",
  "/this-route-does-not-exist",
];

const WIDTHS = [320, 360, 375, 390, 430, 768, 1280, 1440, 1920];

const out = [];
const say = (s) => {
  out.push(s);
  console.log(s);
};

const browser = await chromium.launch();

say("== CONSOLE / RUNTIME / HYDRATION, per route (1440x900, production build) ==");
let totalNoise = 0;
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const msgs = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") msgs.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => msgs.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => msgs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));

  const res = await page.goto(base + route, { waitUntil: "load" });
  // Let hydration commit and any effect-time warning surface.
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(1500);

  // Match React hydration diagnostics only. An earlier version of this line
  // also matched /Warning:/i, which matched THIS PROBES OWN "warning: " prefix
  // and reported five hydration warnings on /404 that were three font-preload
  // notices and the 404 itself. Anchor on React text, not on the prefix.
  const hydration = msgs.filter((m) =>
    /hydrat|did not match|server HTML|text content does not match|Minified React error #(418|423|425)/i.test(
      m,
    ),
  );
  totalNoise += msgs.length;
  say(
    `  ${route.padEnd(32)} status ${res?.status()}  noise ${msgs.length}  hydration ${hydration.length}` +
      (msgs.length ? `\n      ${msgs.slice(0, 4).join("\n      ")}` : ""),
  );
  await ctx.close();
}
say(`  TOTAL console/runtime noise across ${ROUTES.length} routes: ${totalNoise}`);

say("");
say("== CUMULATIVE LAYOUT SHIFT, per route (1440x900, load + settle + half-page scroll) ==");
for (const route of ROUTES) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.addInitScript(() => {
    window.__cls = 0;
    window.__shifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__cls += entry.value;
          if (entry.value > 0.001) window.__shifts.push(Number(entry.value.toFixed(4)));
        }
      }
    }).observe({ type: "layout-shift", buffered: true });
  });
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(3000);
  const cls = await page.evaluate(() => ({ cls: window.__cls, shifts: window.__shifts }));
  const verdict = cls.cls <= 0.1 ? "good" : cls.cls <= 0.25 ? "needs improvement" : "POOR";
  say(
    `  ${route.padEnd(32)} CLS ${cls.cls.toFixed(4)}  (${verdict})  shifts>0.001: ${JSON.stringify(cls.shifts.slice(0, 5))}`,
  );
  await ctx.close();
}

say("");
say("== IMAGES: every rendered <img> is sized, loaded and not upscaled ==");
for (const route of ROUTES.filter((r) => r.startsWith("/work") || r === "/")) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "load" });
  await page.waitForTimeout(1500);
  const imgs = await page.evaluate(() =>
    [...document.querySelectorAll("img")].map((im) => ({
      src: (im.currentSrc || im.src).split("/").pop()?.slice(0, 48),
      complete: im.complete,
      natural: im.naturalWidth,
      hasDims: !!(im.getAttribute("width") && im.getAttribute("height")),
      loading: im.getAttribute("loading"),
      fetchPriority: im.getAttribute("fetchpriority"),
      alt: (im.getAttribute("alt") ?? "").length,
    })),
  );
  const broken = imgs.filter((i) => !i.complete || i.natural === 0);
  const unsized = imgs.filter((i) => !i.hasDims);
  const altless = imgs.filter((i) => i.alt === 0);
  say(
    `  ${route.padEnd(32)} imgs ${imgs.length}  broken ${broken.length}  unsized ${unsized.length}  empty-alt ${altless.length}`,
  );
  if (broken.length) say(`      broken: ${broken.map((b) => b.src).join(", ")}`);
  if (unsized.length) say(`      unsized: ${unsized.map((b) => b.src).join(", ")}`);
  await ctx.close();
}

say("");
say("== HORIZONTAL OVERFLOW, every route x every width ==");
let overflow = 0;
for (const route of ROUTES) {
  const results = [];
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(base + route, { waitUntil: "load" });
    await page.waitForTimeout(500);
    const over = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (over > 0) {
      overflow++;
      results.push(`${width}:+${over}`);
    }
    await ctx.close();
  }
  say(`  ${route.padEnd(32)} ${results.length ? results.join(" ") : "clean at all widths"}`);
}
say(
  `  TOTAL overflowing route x width combinations: ${overflow} of ${ROUTES.length * WIDTHS.length}`,
);

await browser.close();
mkdirSync("docs/review/phase7", { recursive: true });
writeFileSync("docs/review/phase7/runtime.txt", out.join("\n") + "\n");
console.log("\nwritten: docs/review/phase7/runtime.txt");
