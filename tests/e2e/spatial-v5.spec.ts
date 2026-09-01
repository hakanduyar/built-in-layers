import { expect, test } from "@playwright/test";
import { BREAK_COVER_START, sceneFocusProgress } from "@/lib/spatial/sceneRoute";

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

const DRIFT_IDS = ["selected-systems", "how-i-build", "field-notes", "about"] as const;

/** Scroll offsets bounding the spatial tour's own progress 0..1 (V6.4). Measured
 *  from the spacer rather than assumed, so the SYSTEMS samples below land at real
 *  route progresses at any viewport. */
async function routeRange(page: import("@playwright/test").Page) {
  await page
    .locator("section[aria-label='Spatial system tour'] .sticky")
    .waitFor({ state: "attached" });
  return page.evaluate(() => {
    const selector = "section[aria-label='Spatial system tour']";
    const section = document.querySelector(selector)!;
    const spacer = document.querySelector(`${selector} > div`)!;
    const start = section.getBoundingClientRect().top + window.scrollY;
    return { start, end: start + spacer.getBoundingClientRect().height - window.innerHeight };
  });
}

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

// V6.5 REPLACED THIS BLOCK AGAIN, and for a different reason than V6.4 did.
//
// V6.4 removed the erosion contracts because the mechanism they protected had been
// retired. These tests are not being weakened or relaxed: the V6.4 mechanism is
// also gone, and its central assertion -- that the surface layer is never masked,
// clipped or faded -- SURVIVES BELOW UNCHANGED, because it is still the guarantee
// that matters and V6.5 satisfies it more simply than V6.4 did.
//
// What is dropped is the band-width test. It asserted that the exposed section
// stayed under 20% of the word box, which was a guard against the V6.4 effect
// drifting into "fill the letterforms". There is no fill in V6.5 and no mask on any
// glyph, so there is no width to bound; the equivalent guard here is that the word
// carries no clip or mask at all, which is strictly stronger.
//
// V6.6 KEEPS EVERY ASSERTION BELOW AND ADDS TO THEM. The mechanism changed again
// -- V6.5's axis-aligned clipped rectangle became a half-plane opened along a seam
// at the route's own bearing -- but the contracts that survived V6.5 are exactly
// the contracts that matter, and V6.6 satisfies all of them. The only rewritten
// test is the aperture one, which read a `clip-path` string that no longer exists
// because the opening is now a transform; it asserts the same three properties
// against the property that actually carries the motion.
test.describe("Spatial V6.6: SYSTEMS is a surface cut open along the route", () => {
  test("draws the word exactly once, with the opened surface behind it", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    // ONE copy of the word. V6.4 drew it twice (a surface and a masked section over
    // it); since V6.5 the word is a single plain span and everything else happens
    // in the space behind it.
    await expect(page.locator('[data-systems-layer="surface"]')).toHaveCount(1);
    await expect(page.locator("[data-systems-cut]")).toHaveCount(1);
    await expect(page.locator('[data-systems-layer="section"]')).toHaveCount(0);
  });

  test("the cut runs at the camera route's own bearing, not at an authored angle", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    // Wait for hydration before a non-retrying `$eval`: until the enhanced camera
    // is attached the fallback tree is in the DOM, and the fallback deliberately
    // renders no cut at all.
    await routeRange(page);

    // The seam's angle is read back off the live element and compared against the
    // route bearing computed independently in the browser from the same public
    // helper the component uses. If someone hard-codes a "nicer" diagonal, the two
    // stop agreeing and this fails -- which is the whole point of deriving it.
    const rotation = await page.$eval("[data-systems-cut]", (el) => {
      // The seam frame is the cut's PARENT: the cut itself only translates.
      const parent = el.parentElement!;
      const m = new DOMMatrixReadOnly(getComputedStyle(parent).transform);
      return (Math.atan2(m.b, m.a) * 180) / Math.PI;
    });
    // Route one descends left-to-right through the giant word at ~33 degrees.
    // Bounded rather than exact so a small route re-aim does not fail the suite,
    // but tight enough to exclude 0 (axis-aligned) and 45 (an authored diagonal).
    expect(rotation).toBeGreaterThan(24);
    expect(rotation).toBeLessThan(42);
  });

  test("the word is never masked, clipped, faded or transformed at any point", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await routeRange(page);

    // Sampled right across the sequence. THE readability guarantee, asserted as the
    // mechanism rather than as an appearance. V6.5 adds `transform` to what V6.4
    // checked: the word does not move either, so it cannot be slid, lifted or
    // separated from anything.
    for (let p = 0.3; p <= 0.52; p += 0.02) {
      await page.evaluate((y) => window.scrollTo(0, Math.round(y)), start + (end - start) * p);
      await page.waitForTimeout(120);
      const state = await page.$eval('[data-systems-layer="surface"]', (el) => {
        const style = getComputedStyle(el);
        return {
          mask: style.maskImage,
          opacity: Number.parseFloat(style.opacity),
          clip: style.clipPath,
          transform: style.transform,
          filter: style.filter,
        };
      });
      expect(state.opacity, `word faded at ${p.toFixed(2)}`).toBe(1);
      expect(["none", ""], `word masked at ${p.toFixed(2)}`).toContain(state.mask);
      expect(["none", "auto", ""], `word clipped at ${p.toFixed(2)}`).toContain(state.clip);
      expect(["none", ""], `word transformed at ${p.toFixed(2)}`).toContain(state.transform);
      expect(["none", ""], `word filtered at ${p.toFixed(2)}`).toContain(state.filter);
    }
  });

  test("the surface opens monotonically and stays open", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const { start, end } = await routeRange(page);

    // Read the cut's own translation back out of the page. Three contracts, and the
    // first two are the ones the V6.4 effect failed by design: the surface only ever
    // opens further, it is still open when the occlusion begins (it does not revert,
    // which is what made V6.4's sequence resolve to nothing having happened), and
    // the motion is carried by `transform` rather than by a paint property.
    const offsets: number[] = [];
    // V6.7 WIDENED THIS SWEEP, for two compounding reasons found together.
    //
    // The loop was `p <= 0.46` with a 0.01 step, and 0.34 + 12*0.01 accumulates to
    // 0.46000000000000008 in binary floating point -- so the final sample was
    // actually 0.45, not 0.46, and always had been. That was harmless while the
    // opening finished at ~0.429; JOB 1's acquisition descent moved every progress
    // in the world later, the opening now completes at ~0.450, and 0.45 landed
    // exactly on the boundary (measured: 117.8px at 0.45, 32.3px at 0.46).
    //
    // Counting integer steps removes the accumulation, and the sweep now ends at
    // 0.4648 -- past the opening's completion, and just below the protected guard
    // band at 0.4654, so it still measures geometry and never the state machine.
    // V7: the sweep is DERIVED from the route (the file's own V6.7 note records
    // exactly this failure mode: hardcoded windows go stale when the route
    // moves). It runs from just before the SYSTEMS word's focus to just below
    // the protected guard band before the cover.
    const sweepFrom = sceneFocusProgress("tail") - 0.045;
    const sweepTo = BREAK_COVER_START - 0.016;
    for (let i = 0; i <= 12; i += 1) {
      const p = sweepFrom + (i / 12) * (sweepTo - sweepFrom);
      await page.evaluate((y) => window.scrollTo(0, Math.round(y)), start + (end - start) * p);
      // POLL UNTIL THE VALUE SETTLES, rather than waiting a fixed time. The opening
      // is a function of FILTERED progress, and the two-stage camera filter settles
      // at a rate that depends on the engine and on machine load: a fixed 360ms was
      // enough on Chromium and, under load, was not enough on WebKit -- which made
      // the test measure the filter's settling time instead of the geometry the
      // contract is about. Two identical consecutive reads is the same technique
      // `worldTranslateAt` in spatial.spec.ts already uses for exactly this reason.
      // The bound below is untouched.
      const read = () =>
        page.$eval("[data-systems-cut]", (el) => {
          const style = getComputedStyle(el);
          return { transform: style.transform, clip: style.clipPath, filter: style.filter };
        });
      // THREE identical consecutive reads, on a 120ms interval, up to ~7s. Two was
      // not enough: the camera filter is a two-stage lag driven from rAF, and on a
      // heavily loaded machine rAF itself is starved, so the filtered value can
      // momentarily repeat while still converging. Requiring a third read makes a
      // false "settled" require three starved frames in a row.
      let state = await read();
      let stable = 0;
      for (let attempt = 0; attempt < 90; attempt += 1) {
        await page.waitForTimeout(120);
        const next = await read();
        stable = next.transform === state.transform ? stable + 1 : 0;
        state = next;
        // V7: the route-wide progression ceiling means the visual value can
        // crawl for seconds after a cold jump, and a starved WebKit rAF can
        // repeat a mid-crawl value across two 120ms polls. Require a longer
        // proven-stable run before trusting a sample; assertions unchanged.
        //
        // V8 RAISES BOTH BOUNDS, because the V7 pair was still not enough and the
        // failure it produced was measured rather than guessed at: WebKit renders
        // in software on this machine and achieves ~14fps against Chromium's ~45,
        // so a governed jump takes ~10s to arrive and a 120ms poll can straddle
        // one or two frames. Four repeats is then reachable mid-crawl, and the
        // final sample was read at 783px -- a value from the middle of the
        // journey, reported as if the surface had failed to open. Six proven-
        // stable repeats after at least ten polls makes a false settle require
        // six consecutive starved frames. Chromium passes this test either way;
        // the assertions are untouched.
        if (stable >= 6 && attempt >= 10) break;
      }
      // V6.6 CONTRACT: the opening is a transform, not a clip and not a filter.
      // V6.5 animated a clip-path string, which cost 274.9ms of style recalculation
      // across the route; this assertion is what stops that returning.
      expect(["none", "auto", ""], `the cut is animating clip-path at ${p.toFixed(2)}`).toContain(
        state.clip,
      );
      expect(["none", ""], `the cut is animating a filter at ${p.toFixed(2)}`).toContain(
        state.filter,
      );
      const m = /matrix\(([^)]+)\)/.exec(state.transform);
      offsets.push(m ? Number(m[1]!.split(",")[5]) : Number.NaN);
    }
    const measured = offsets.filter((value) => Number.isFinite(value));
    expect(measured.length, "the cut's transform was never readable").toBeGreaterThan(6);
    for (let i = 1; i < measured.length; i += 1) {
      // The seam RISES as the surface opens, so its translateY is non-increasing.
      // A small tolerance absorbs the camera filter's easing.
      expect(measured[i]!, `the surface closed again at sample ${i}`).toBeLessThanOrEqual(
        measured[i - 1]! + 6,
      );
    }
    expect(measured[0]!, "the surface was already open at the start").toBeGreaterThan(200);
    expect(measured[measured.length - 1]!, "the surface was not open at the end").toBeLessThan(60);
  });

  test("leaves no erosion, peel, fragment or debris element anywhere", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    for (const gone of [
      "[data-erosion-layer]",
      "[data-erosion-fragments]",
      "[data-erosion-peel]",
      "[data-erosion-stress]",
      "[data-fragment-archetype]",
      "[data-impact-shock]",
    ]) {
      await expect(page.locator(gone), `${gone} still exists`).toHaveCount(0);
    }
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

  test("removes every animated system: no camera, no parallax, no plane", async ({ page }) => {
    // The camera and its parallax planes are not merely stopped -- the enhanced
    // tree is not rendered at all, so there is nothing that could move.
    await expect(page.locator("[data-camera-plane]")).toHaveCount(0);
    await expect(page.locator("[data-systems-cut]")).toHaveCount(0);
    await expect(page.locator("[data-destination-surface]")).toHaveCount(0);
    await expect(page.locator("[data-break-rail]")).toHaveCount(0);
    // ...but the word itself survives as a real compositional element.
    await expect(page.locator('[data-systems-layer="surface"]')).toHaveCount(1);
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

// V8 (§20) -- THE DUPLICATE-INSTANCE CONTRACT.
//
// Through V7 the homepage rendered Selected Systems and How I Build TWICE each:
// once as a sparse "destination surface" plate previewing the section from
// across the spatial world's exit traverse -- index, heading, one to three lines
// -- and once as the real, content-rich section further down. The owner rejected
// the previews. This is the guard that stops either of them coming back.
//
// IT DELIBERATELY DOES NOT COUNT HEADING TEXT, which is what §20 rules out and
// what would have been the easy wrong test. The two headings legitimately appear
// in more than one place in the markup -- a section's own <h2>, the drift
// block's registered label, the accessible name of its node -- so a string count
// would have been both fragile and meaningless. What is tested instead is
// IDENTITY: how many rendered instances of each section's own component exist,
// and whether any spatial ROUTE STOP is a preview of a lower-page section.
test.describe("Spatial V8: each lower-page section exists exactly once (§20)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
  });

  for (const id of ["selected-systems", "how-i-build"] as const) {
    test(`${id} is rendered exactly once, in the lower page`, async ({ page }) => {
      // One drift block carries it, and it is a real section with a real
      // heading -- not a plate with a heading painted on it.
      await expect(page.locator(`[data-drift-block="${id}"]`)).toHaveCount(1);
      await expect(page.locator(`[data-drift-block="${id}"] h2`)).toHaveCount(1);
    });
  }

  test("no destination-preview surface exists anywhere in the world", async ({ page }) => {
    // The previews rendered with this attribute. Asserting on the attribute
    // rather than on the component name is what makes this a contract about the
    // PAGE rather than about the current file layout: any future object that
    // re-adopts the mechanism is caught by the same line.
    await expect(page.locator("[data-destination-surface]")).toHaveCount(0);
  });

  test("every route stop is a scene, not a preview of a later section", async ({ page }) => {
    // The route's stops are identified by their own attribute, so this reads the
    // real journey rather than guessing from markup. The nine stops are the
    // hero, four projects, the SYSTEMS beat, and route two's three scenes --
    // and none of them is named for a lower-page section.
    const stops = await page
      .locator("[data-scene]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-scene")));
    expect(stops).toHaveLength(9);
    expect(stops).not.toContain("selected-systems");
    expect(stops).not.toContain("how-i-build");
  });
});

// V9 — THE GUARD ON THE GUARD.
//
// `spatial.spec.ts`'s "depth planes add no duplicate screen-reader content"
// selects planes by `[data-camera-plane]`. That is a precise contract only while
// every plane actually carries the attribute: if one stopped, the filter would
// find nothing, the assertion would pass on an empty set, and a real regression
// would go unreported. This asserts the population the other test depends on.
test.describe("Spatial V9: the depth-plane contract cannot go vacuous", () => {
  test("every camera plane is labelled, and more than one exists", async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    const planes = await page
      .locator("section[aria-label='Spatial system tour'] [data-camera-plane]")
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("data-camera-plane")));
    expect(planes).toContain("world");
    // Desktop renders the distant and near planes as well; the guard exists so
    // the sibling test is never left with only the world plane to filter out.
    expect(planes.filter((p) => p !== "world").length).toBeGreaterThan(0);
  });
});
