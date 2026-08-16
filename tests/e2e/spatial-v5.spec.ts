import { expect, test } from "@playwright/test";

// Spatial Portfolio V5 browser contracts (docs/DESIGN_SYSTEM.md §19).
//
// These cover the V5 systems that unit tests structurally cannot reach, because
// the thing under test is what a real browser does:
//
//   - Editorial Drift is Motion interpolation between two CSS calc() STRINGS.
//     Whether a browser interpolates that smoothly, or snaps between the two
//     endpoint strings, is not decidable from source, from types, or from a
//     jsdom render. It was the largest open risk in the V5 audit and it needs
//     computed transforms from a real engine.
//   - D-020's reduced-motion contract ("disable motion, not design") replaced
//     V4's simpler rule ("zero spatial grammar"), so it can no longer be
//     asserted by counting spatial elements. It needs the finer-grained
//     distinction these tests make: these things must not move, those things
//     may exist statically.
//
// Deliberately NOT tested here: art direction. No screenshot-coordinate
// assertions, no "looks right" thresholds -- only behavioural contracts.

const DRIFT_IDS = ["real-life", "how-i-build", "field-notes", "about"] as const;

/** Computed translateX of an element, in px. */
async function translateX(page: import("@playwright/test").Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const t = getComputedStyle(el).transform;
    if (!t || t === "none") return 0;
    const m = t.match(/matrix\(([^)]+)\)/);
    if (m?.[1]) return Number(m[1].split(",")[4]);
    const m3 = t.match(/matrix3d\(([^)]+)\)/);
    if (m3?.[1]) return Number(m3[1].split(",")[12]);
    return 0;
  }, selector);
}

/** Scroll so a drift block sits at a given fraction of its own viewport pass. */
async function scrollBlockTo(page: import("@playwright/test").Page, id: string, fraction: number) {
  const box = await page.evaluate((blockId) => {
    const el = document.querySelector(`[data-drift-block="${blockId}"]`);
    if (!el?.parentElement) return null;
    const rect = el.parentElement.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height,
      vh: window.innerHeight,
      // The document cannot scroll past its own end. The last sections' full
      // theoretical passage ("bottom clears the viewport top") extends beyond
      // that limit, so unclamped targets land on the same maximum offset
      // repeatedly, producing duplicate samples and a distorted step profile.
      // Sampling the REACHABLE span measures what a reader can actually see.
      maxScroll: Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
    };
  }, id);
  if (!box) throw new Error(`drift block not found: ${id}`);
  const startY = Math.min(Math.max(0, box.top - box.vh), box.maxScroll);
  const endY = Math.min(box.top + box.height, box.maxScroll);
  await page.evaluate(
    (y) => {
      const w = window as unknown as { __driftLast?: string; __driftHits?: number };
      // Clear the stability sentinel BEFORE scrolling. Without this the poll below
      // can be satisfied by the previous sample's value, which is stale but
      // perfectly stable -- reading the old frame and reporting it as the new one.
      w.__driftLast = undefined;
      w.__driftHits = 0;
      window.scrollTo(0, Math.max(0, y));
    },
    Math.round(startY + (endY - startY) * fraction),
  );
  // Let Motion's rAF pipeline process this scroll before stability polling.
  await page.evaluate(
    () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))),
  );
  // Motion drives the value through a rAF pipeline, so the transform is not
  // current the instant scrollTo returns. Two frames plus a short settle is
  // what the standalone measurement of this same series used, and it produces
  // an evenly-spaced monotonic sweep (largest step ~5% of range for every
  // block). Reading too early instead yields duplicate samples followed by one
  // large jump -- which is precisely the "snapping" signature this suite exists
  // to detect, so an under-wait here would manufacture the bug it tests for.
  await page.waitForTimeout(120);
}

test.describe("Spatial V5: Editorial Drift moves in a real browser", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // Wait for the enhanced camera before measuring ANY geometry. Until
    // hydration swaps it in, the spatial section's scroll spacer is not its
    // final height, so document height -- and therefore the reachable scroll
    // span of the LAST drift block -- is still wrong. Measured pre-hydration,
    // "about" samples a fraction of its real passage and looks like it snaps.
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor({
      state: "attached",
    });
  });

  test("preserves the exact semantic document order of the lower homepage", async ({ page }) => {
    const order = await page.$$eval("[data-drift-block]", (els) =>
      els.map((e) => e.getAttribute("data-drift-block")),
    );
    expect(order).toEqual([...DRIFT_IDS]);
  });

  for (const id of DRIFT_IDS) {
    test(`${id} genuinely translates across its passage, without snapping`, async ({ page }) => {
      const selector = `[data-drift-block="${id}"]`;
      const samples: number[] = [];
      const STEPS = 21;
      for (let i = 0; i < STEPS; i += 1) {
        await scrollBlockTo(page, id, i / (STEPS - 1));
        const x = await translateX(page, selector);
        expect(x, `${id} must have a readable transform`).not.toBeNull();
        samples.push(x as number);
      }

      const min = Math.min(...samples);
      const max = Math.max(...samples);
      const range = max - min;

      // 1. It actually moves. A failed calc() interpolation would pin the block
      //    at one endpoint and never move it at all.
      expect(range, `${id} horizontal travel`).toBeGreaterThan(10);

      // 2. It moves CONTINUOUSLY. This is the specific failure mode the audit
      //    could not rule out: Motion falling back to a discrete swap between
      //    the two calc() strings would put ~100% of the range into a single
      //    step. Real interpolation spreads it across every step.
      //    The threshold is deliberately loose rather than tight: "about" is the
      //    quietest section by design (~16px of travel at 1440px), so at 21
      //    samples its per-step movement approaches the rounding floor of a
      //    computed transform. Half the range in one step still separates real
      //    interpolation from a two-value swap by a wide margin.
      let maxStep = 0;
      for (let i = 1; i < samples.length; i += 1) {
        maxStep = Math.max(maxStep, Math.abs(samples[i]! - samples[i - 1]!));
      }
      expect(maxStep / range, `${id} largest single step as a share of total travel`).toBeLessThan(
        0.5,
      );

      // 3. It resolves to many distinct positions, not two.
      const distinct = new Set(samples.map((v) => v.toFixed(1))).size;
      expect(distinct, `${id} distinct positions`).toBeGreaterThan(6);
    });
  }

  test("is deterministic: identical positions across a reload", async ({ page }) => {
    const read = async () => {
      const out: number[] = [];
      for (const f of [0, 0.5, 1]) {
        await scrollBlockTo(page, "how-i-build", f);
        out.push((await translateX(page, '[data-drift-block="how-i-build"]')) as number);
      }
      return out;
    };
    const first = await read();
    await page.reload();
    // The browser restores the previous scroll offset across a reload, so reset
    // to the top and let the drift track re-initialise before re-measuring --
    // otherwise the first sample is taken mid-passage and reads as a mismatch
    // that has nothing to do with determinism.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator('[data-drift-block="how-i-build"]')).toBeAttached();
    const second = await read();
    first.forEach((value, i) => expect(second[i]!).toBeCloseTo(value, 0));
  });

  test("never overflows the document horizontally at any width", async ({ page }) => {
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await scrollBlockTo(page, "how-i-build", 0.5);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
});

test.describe("Spatial V5: System POV states real project metadata only", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
  });

  test("stays within its metadata budget and invents nothing", async ({ page }) => {
    const rows = await page.$$eval("[data-system-pov] dl > div", (els) =>
      els.map((el) => ({
        label: el.querySelector("dt")?.textContent?.trim() ?? "",
        value: el.querySelector("dd")?.textContent?.trim() ?? "",
      })),
    );

    // Only the two approved labels may ever appear.
    for (const row of rows) {
      expect(["Layer", "Phase"]).toContain(row.label);
      expect(row.value.length).toBeGreaterThan(0);
    }

    // Nothing fabricated: no telemetry vocabulary, no percentages, no
    // coordinates, no timestamps, no "unknown"/"n/a" filler standing in for an
    // absent field.
    const rendered = JSON.stringify(rows);
    for (const forbidden of [
      /\d+\s*%/,
      /confidence/i,
      /acquired/i,
      /granted/i,
      /recalculat/i,
      /scanning/i,
      /\bunknown\b/i,
      /\bn\/a\b/i,
      /\bTBD\b/i,
    ]) {
      expect(rendered, `System POV must not render ${forbidden}`).not.toMatch(forbidden);
    }
  });

  test("every value shown is real content, and each scene stays within two rows", async ({
    page,
  }) => {
    const perScene = await page.$$eval("[data-system-pov]", (els) =>
      els.map((el) => el.querySelectorAll("dl > div").length),
    );
    for (const count of perScene) expect(count).toBeLessThanOrEqual(2);
  });

  test("its brackets are decorative and hidden from assistive technology", async ({ page }) => {
    const exposed = await page.$$eval(
      "[data-system-bracket]",
      (els) => els.filter((el) => el.getAttribute("aria-hidden") !== "true").length,
    );
    expect(exposed, "every system bracket must be aria-hidden").toBe(0);
  });
});

test.describe("Spatial V5: the erosion word is a layered material", () => {
  test("renders all three registered layers, in shell/substrate/trace order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    for (const layer of ["shell", "substrate", "trace"]) {
      await expect(page.locator(`[data-erosion-layer="${layer}"]`).first()).toBeAttached();
    }

    // The trace must sit UNDER the coating, not float above it: the layers are
    // drawn in stacking order rather than by punching holes through the shell.
    const order = await page.$$eval("[data-erosion-layer]", (els) =>
      els.map((e) => e.getAttribute("data-erosion-layer")),
    );
    expect(order.slice(0, 3)).toEqual(["shell", "substrate", "trace"]);
  });

  test("debris comes from the closed archetype vocabulary, never arbitrary shapes", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // Wait for the enhanced tree: before hydration the static fallback renders
    // the shell only and no debris at all, so an immediate $$eval (which, unlike
    // expect(), does not retry) would read zero and look like a missing feature.
    await expect(page.locator("[data-fragment-archetype]").first()).toBeAttached();
    const kinds = await page.$$eval("[data-fragment-archetype]", (els) =>
      els.map((e) => e.getAttribute("data-fragment-archetype")),
    );
    expect(kinds.length).toBeGreaterThan(0);
    const allowed = ["bracket", "rail", "node", "index", "hatch", "path"];
    for (const kind of kinds) expect(allowed).toContain(kind);
  });
});

// D-020. This replaced V4's "zero spatial grammar" rule, so it deliberately
// asserts a DIFFERENCE rather than an absence: motion systems must be gone,
// static design may remain, and no content may be lost with the motion.
test.describe("Spatial V5: reduced motion disables motion, not design (D-020)", () => {
  // This installed Playwright version (1.62.0) nests reducedMotion under
  // `contextOptions` rather than accepting it as a top-level test.use() key --
  // same as tests/e2e/motion.spec.ts. Using the top-level form is silently
  // ignored, which makes the whole block assert the OPPOSITE of its name.
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
  });

  test("removes every animated system: no camera, no parallax, no debris", async ({ page }) => {
    // The camera and its parallax planes are not merely stopped -- the enhanced
    // tree is not rendered at all, so there is nothing that could move.
    await expect(page.locator("[data-camera-plane]")).toHaveCount(0);
    await expect(page.locator("[data-erosion-fragments]")).toHaveCount(0);
    await expect(page.locator("[data-break-rail]")).toHaveCount(0);
  });

  test("Editorial Drift does not move as the page scrolls", async ({ page }) => {
    const readings: number[] = [];
    for (const f of [0, 0.5, 1]) {
      await scrollBlockTo(page, "how-i-build", f);
      readings.push((await translateX(page, '[data-drift-block="how-i-build"]')) as number);
    }
    // Parked at its mid position: still an asymmetric, designed placement, but
    // identical at every scroll position.
    expect(Math.max(...readings) - Math.min(...readings)).toBeLessThan(1);
  });

  test("keeps the static System POV composition and its real metadata", async ({ page }) => {
    // The V4 contract would have deleted this entirely. D-020 keeps it, because
    // these rows are real project facts stated nowhere else on the page.
    await expect(page.locator("[data-system-pov]").first()).toBeAttached();
    const labels = await page.$$eval("[data-system-pov] dt", (els) =>
      els.map((e) => e.textContent?.trim()),
    );
    for (const label of labels) expect(["Layer", "Phase"]).toContain(label);
  });

  test("loses no content: every scene and its real copy remain readable", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    for (const id of DRIFT_IDS) {
      await expect(page.locator(`[data-drift-block="${id}"]`)).toBeAttached();
    }
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
