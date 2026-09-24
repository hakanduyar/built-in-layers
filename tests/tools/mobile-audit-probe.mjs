// PHASE 6 — MOBILE AUDIT PROBE
//
// Overflow has been green at mobile widths since V8. That proved nothing about
// composition: a page can pass an overflow assertion while its hero eats three
// screens, its diagrams are illegible and its tap targets are 20px.
//
// This measures the things overflow cannot see, at realistic device sizes, on
// the homepage and every case-study destination.
import { chromium } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3200";
const OUT = process.env.PROBE_OUT ?? "docs/review/phase6-mobile-audit";
const SHOTS = `${OUT}/stills`;
mkdirSync(`${OUT}/metrics`, { recursive: true });
mkdirSync(SHOTS, { recursive: true });

// Realistic device sizes, not one artificial height. 768 is tablet-class and
// is treated as its own case rather than "big mobile".
const VIEWPORTS = [
  { w: 320, h: 568, label: "320x568" },
  { w: 360, h: 800, label: "360x800" },
  { w: 375, h: 667, label: "375x667" },
  { w: 390, h: 844, label: "390x844" },
  { w: 430, h: 932, label: "430x932" },
  { w: 768, h: 1024, label: "768x1024" },
];

const ROUTES = [
  { path: "/", name: "home" },
  { path: "/work", name: "work-index" },
  { path: "/work/software-factory", name: "cs-software-factory" },
  { path: "/work/kivilcim", name: "cs-kivilcim" },
  { path: "/work/jointledger", name: "cs-jointledger" },
  { path: "/work/dropspot", name: "cs-dropspot" },
  { path: "/work/professional-systems", name: "cs-professional-systems" },
  { path: "/about", name: "about" },
];

// Which (route, width) pairs get a full-page still. Everything is measured;
// only representative frames are captured, to avoid hundreds of duplicates.
const CAPTURE_WIDTHS = new Set([320, 375, 390, 430, 768]);
const CAPTURE_ROUTES = new Set([
  "home",
  "cs-kivilcim",
  "cs-dropspot",
  "cs-software-factory",
  "cs-professional-systems",
]);

const MIN_TAP = 44; // WCAG 2.5.8 target size (minimum)
const MIN_BODY_PX = 14;

const browser = await chromium.launch();
const report = { base: BASE, generated: "phase6-mobile-audit", routes: {} };

for (const route of ROUTES) {
  report.routes[route.name] = { path: route.path, viewports: {} };

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.w, height: vp.h },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    });
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200));
    });
    page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${String(e).slice(0, 200)}`));

    await page.goto(BASE + route.path, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);

    const m = await page.evaluate(
      ({ MIN_TAP, MIN_BODY_PX }) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const doc = document.documentElement;

        // --- overflow, and who causes it -------------------------------
        const overflow = Math.max(0, doc.scrollWidth - vw);
        const offenders = [];
        if (overflow > 0) {
          for (const el of document.querySelectorAll("*")) {
            const r = el.getBoundingClientRect();
            if (r.width < 1 || r.height < 1) continue;
            if (r.right > vw + 1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className?.toString?.() ?? "").slice(0, 70),
                right: Math.round(r.right),
                over: Math.round(r.right - vw),
              });
            }
          }
          offenders.sort((a, b) => b.over - a.over);
        }

        // --- tap targets ------------------------------------------------
        const smallTargets = [];
        for (const el of document.querySelectorAll("a[href], button, [role=button]")) {
          const r = el.getBoundingClientRect();
          if (r.width < 1 || r.height < 1) continue; // not rendered
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || cs.display === "none") continue;
          if (r.width < MIN_TAP || r.height < MIN_TAP) {
            smallTargets.push({
              text: (el.textContent || "").trim().slice(0, 40),
              w: Math.round(r.width),
              h: Math.round(r.height),
            });
          }
        }

        // --- typography -------------------------------------------------
        const bodyLike = [...document.querySelectorAll("p, li")].filter(
          (el) => (el.textContent || "").trim().length > 40,
        );
        const tooSmall = [];
        let measureSum = 0;
        let measureCount = 0;
        for (const el of bodyLike) {
          const cs = getComputedStyle(el);
          const fs = parseFloat(cs.fontSize);
          const r = el.getBoundingClientRect();
          if (fs < MIN_BODY_PX) {
            tooSmall.push({ px: +fs.toFixed(1), text: (el.textContent || "").trim().slice(0, 40) });
          }
          // characters per line, the real readability measure
          if (r.width > 0 && fs > 0) {
            measureSum += r.width / (fs * 0.5);
            measureCount++;
          }
        }

        // --- headings / hierarchy --------------------------------------
        const h1 = document.querySelector("h1");
        const h1Box = h1 ? h1.getBoundingClientRect() : null;
        const headings = [...document.querySelectorAll("h1,h2,h3")].map((h) => ({
          level: h.tagName,
          px: Math.round(parseFloat(getComputedStyle(h).fontSize)),
        }));

        // --- images / figures ------------------------------------------
        const figures = [...document.querySelectorAll("img")].map((img) => {
          const r = img.getBoundingClientRect();
          return {
            src: (img.getAttribute("src") || "").split("/").pop(),
            renderedW: Math.round(r.width),
            renderedH: Math.round(r.height),
            naturalW: img.naturalWidth,
            naturalH: img.naturalHeight,
            // <1 means upscaled beyond intrinsic size
            scale: img.naturalWidth ? +(r.width / img.naturalWidth).toFixed(2) : null,
            fetchPriority: img.getAttribute("fetchpriority"),
          };
        });

        // --- case-study navigation -------------------------------------
        const nav = document.querySelector('nav[aria-label="Case study navigation"]');
        let neighbours = null;
        if (nav) {
          const links = [...nav.querySelectorAll("a")].map((a) => {
            const r = a.getBoundingClientRect();
            return {
              text: (a.textContent || "").trim().slice(0, 40),
              x: Math.round(r.left),
              y: Math.round(r.top),
              w: Math.round(r.width),
              h: Math.round(r.height),
            };
          });
          const nr = nav.getBoundingClientRect();
          neighbours = {
            count: links.length,
            links,
            // same row => still two-column at this width
            stacked: links.length === 2 ? Math.abs(links[0].y - links[1].y) > 8 : null,
            height: Math.round(nr.height),
          };
        }

        // --- vertical cost ----------------------------------------------
        // How much screen the first meaningful content costs before anything else.
        const main = document.querySelector("main") ?? document.body;
        const firstFigure = main.querySelector("figure, img");
        const firstFigureTop = firstFigure
          ? Math.round(firstFigure.getBoundingClientRect().top + window.scrollY)
          : null;

        // --- fixed / sticky ---------------------------------------------
        const pinned = [];
        for (const el of document.querySelectorAll("*")) {
          const cs = getComputedStyle(el);
          if (cs.position === "fixed" || cs.position === "sticky") {
            const r = el.getBoundingClientRect();
            if (r.height > 4 && r.width > 4) {
              pinned.push({
                tag: el.tagName.toLowerCase(),
                pos: cs.position,
                h: Math.round(r.height),
                pctOfViewport: +((r.height / vh) * 100).toFixed(1),
              });
            }
          }
        }

        return {
          vw,
          vh,
          docHeight: doc.scrollHeight,
          screens: +(doc.scrollHeight / vh).toFixed(1),
          overflowPx: overflow,
          overflowOffenders: offenders.slice(0, 5),
          smallTapTargets: smallTargets,
          bodyTooSmall: tooSmall,
          avgMeasureChars: measureCount ? Math.round(measureSum / measureCount) : null,
          h1Px: h1Box ? Math.round(parseFloat(getComputedStyle(h1).fontSize)) : null,
          h1Height: h1Box ? Math.round(h1Box.height) : null,
          headings: headings.slice(0, 12),
          figures,
          neighbours,
          firstFigureTop,
          firstFigureScreens: firstFigureTop ? +(firstFigureTop / vh).toFixed(2) : null,
          pinned: pinned.slice(0, 6),
        };
      },
      { MIN_TAP, MIN_BODY_PX },
    );

    m.consoleErrors = consoleErrors;
    report.routes[route.name].viewports[vp.label] = m;

    if (CAPTURE_WIDTHS.has(vp.w) && CAPTURE_ROUTES.has(route.name)) {
      await page.screenshot({
        path: `${SHOTS}/${route.name}--${vp.label}--full.png`,
        fullPage: true,
      });
    }

    const flags = [];
    if (m.overflowPx > 0) flags.push(`OVERFLOW ${m.overflowPx}px`);
    if (m.smallTapTargets.length) flags.push(`${m.smallTapTargets.length} small taps`);
    if (m.bodyTooSmall.length) flags.push(`${m.bodyTooSmall.length} tiny text`);
    if (m.consoleErrors.length) flags.push(`${m.consoleErrors.length} console`);
    console.log(
      `${route.name.padEnd(24)} ${vp.label.padEnd(9)} ` +
        `${String(m.screens).padStart(5)} screens  h1=${String(m.h1Px).padStart(3)}px  ` +
        `measure=${String(m.avgMeasureChars).padStart(3)}ch  ` +
        (flags.length ? "!! " + flags.join(" | ") : "ok"),
    );

    await context.close();
  }
}

writeFileSync(`${OUT}/metrics/mobile-audit.json`, JSON.stringify(report, null, 2));
await browser.close();
console.log(`\nwritten: ${OUT}/metrics/mobile-audit.json`);
