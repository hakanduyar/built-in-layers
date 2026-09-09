import { expect, test, type Page } from "@playwright/test";
import { ROUTE_STATIONS } from "@/lib/spatial/routeNavigation";

// V14.9 NAVIGATION GATE browser contracts.
//
// What is under test is behaviour a browser has to produce: that a click and an
// arrow key really move the camera along the real route, that the navigator's
// active station is derived from the document's position rather than from the
// control that was pressed, and -- the contract the owner's brief is most
// explicit about -- that free scrolling still works exactly as it did, before
// and after a navigation.
//
// Deliberately NOT tested here: art direction, tick geometry, timings.

const NAV = "[data-route-navigator]";
const READOUT = "[data-nav-readout]";

/** Wait until the document has stopped moving. Navigation is a real smooth
 *  scroll through the real route, so every assertion about where the reader
 *  ended up has to wait for the journey to finish rather than for a timeout. */
async function settle(page: Page) {
  // Reset the counters first. Reusing them across calls let a second settle()
  // return on its first poll -- while the click it was waiting on had not yet
  // started moving the document -- which is a flaky test, not a slow page.
  await page.evaluate(() => {
    const w = window as unknown as { __navLast?: number; __navStill?: number };
    w.__navLast = undefined;
    w.__navStill = 0;
  });
  await page.waitForTimeout(150);
  await page.waitForFunction(
    () => {
      const w = window as unknown as { __navLast?: number; __navStill?: number };
      const y = Math.round(window.scrollY);
      if (w.__navLast === y) w.__navStill = (w.__navStill ?? 0) + 1;
      else w.__navStill = 0;
      w.__navLast = y;
      return (w.__navStill ?? 0) > 3;
    },
    undefined,
    { timeout: 15000, polling: 100 },
  );
}

async function enterRoute(page: Page) {
  await page.goto("/");
  await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
  // Any movement past the top brings the navigator in.
  await page.mouse.move(700, 400);
  await page.mouse.wheel(0, 200);
  await expect(page.locator(NAV)).toBeVisible();
  await settle(page);
}

async function activeStation(page: Page): Promise<string | null> {
  return page.locator(READOUT).getAttribute("data-nav-readout");
}

test.describe("V14.9: the route navigator", () => {
  test("stays out of the first frame and arrives once the reader moves", async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    // At rest at the top it is present but not visible, so the hero's first
    // painted frame is what it was before this gate and no control is
    // focusable over it.
    await expect(page.locator(NAV)).toBeHidden();
    await page.mouse.move(700, 400);
    await page.mouse.wheel(0, 200);
    await expect(page.locator(NAV)).toBeVisible();
  });

  test("offers one station per real destination and nothing else", async ({ page }) => {
    await enterRoute(page);
    const ids = await page
      .locator("[data-nav-station]")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-nav-station")));
    expect(ids).toEqual(ROUTE_STATIONS.map((station) => station.id));
    // The navigator adds no scenes to the world: the route still has its nine.
    await expect(page.locator("[data-scene]")).toHaveCount(9);
  });

  test("names the reader's position, and exactly one station is current", async ({ page }) => {
    await enterRoute(page);
    await expect(page.locator(`${NAV} [aria-current="true"]`)).toHaveCount(1);
    const readout = await activeStation(page);
    const current = await page
      .locator(`${NAV} [aria-current="true"]`)
      .getAttribute("data-nav-station");
    expect(readout).toBe(current);
  });

  test("a station click travels to that station", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="tail"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("tail");
    await expect(page.locator('[data-nav-station="tail"]')).toHaveAttribute("aria-current", "true");
  });

  test("a station click reaches the lower world across the cut", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="about"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("about");
    // It really arrived: the section is on screen, not merely reported.
    await expect(page.locator('[data-drift-block="about"]')).toBeInViewport();
  });

  test("travel is progressive, not a teleport", async ({ page }) => {
    await enterRoute(page);
    const samples: number[] = [];
    await page.evaluate(() => {
      const w = window as unknown as { __ys?: number[] };
      w.__ys = [];
      const push = () => {
        w.__ys!.push(window.scrollY);
        if (w.__ys!.length < 400) requestAnimationFrame(push);
      };
      requestAnimationFrame(push);
    });
    await page.locator('[data-nav-station="handoff"]').click();
    await settle(page);
    samples.push(
      ...(await page.evaluate(() => (window as unknown as { __ys: number[] }).__ys ?? [])),
    );
    const moved = samples.filter((y, i) => i > 0 && y !== samples[i - 1]);
    // A jump would produce one change; a real journey produces many frames of
    // intermediate positions.
    expect(moved.length).toBeGreaterThan(5);
  });
});

test.describe("V14.9: previous and next", () => {
  test("step one station along the route in each direction", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="jointledger"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");

    await page.locator('[data-nav-step="next"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("dropspot");

    await page.locator('[data-nav-step="previous"]').click();
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");
  });

  test("name their destination, and stop at the ends of the journey", async ({ page }) => {
    await enterRoute(page);
    await expect(page.locator('[data-nav-step="next"]')).toHaveAttribute(
      "aria-label",
      /^Next section: .+/,
    );
    // At the first station there is nowhere back to.
    await page.locator(`[data-nav-station="${ROUTE_STATIONS[0]!.id}"]`).click();
    await settle(page);
    await expect(page.locator('[data-nav-step="previous"]')).toBeDisabled();

    const last = ROUTE_STATIONS[ROUTE_STATIONS.length - 1]!;
    await page.locator(`[data-nav-station="${last.id}"]`).click();
    await settle(page);
    await expect(page.locator('[data-nav-step="next"]')).toBeDisabled();
  });
});

test.describe("V14.9: the keyboard", () => {
  test("ArrowRight and ArrowLeft move one station", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="kivilcim"]').click();
    await settle(page);

    await page.locator("body").press("ArrowRight");
    await settle(page);
    expect(await activeStation(page)).toBe("jointledger");

    await page.locator("body").press("ArrowLeft");
    await settle(page);
    expect(await activeStation(page)).toBe("kivilcim");
  });

  test("leaves the browser's own scrolling keys alone", async ({ page }) => {
    await enterRoute(page);
    const before = await page.evaluate(() => window.scrollY);
    await page.locator("body").press("ArrowDown");
    await page.waitForTimeout(300);
    const after = await page.evaluate(() => window.scrollY);
    // ArrowDown is the reader's own free scrolling and is not intercepted.
    expect(after).toBeGreaterThan(before);
  });
});

test.describe("V14.9: navigation and free scroll coexist", () => {
  test("free scrolling updates the navigator", async ({ page }) => {
    await enterRoute(page);
    const start = await activeStation(page);
    await page.mouse.move(700, 400);
    for (let i = 0; i < 30; i += 1) await page.mouse.wheel(0, 240);
    await settle(page);
    expect(await activeStation(page)).not.toBe(start);
  });

  test("the reader can resume free scrolling immediately after navigating", async ({ page }) => {
    await enterRoute(page);
    await page.locator('[data-nav-station="dropspot"]').click();
    await settle(page);
    const afterNav = await page.evaluate(() => window.scrollY);

    await page.mouse.move(700, 400);
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 240);
    await settle(page);
    const afterWheel = await page.evaluate(() => window.scrollY);
    expect(afterWheel).toBeGreaterThan(afterNav);

    // ...and back up again: nothing has latched the reader to a station.
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, -240);
    await settle(page);
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(afterWheel);
  });
});

test.describe("V14.9: the navigator is desktop-only", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("does not exist on a phone", async ({ page }) => {
    await page.goto("/");
    await page.locator("section[aria-label='Spatial system tour'] .sticky").waitFor();
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(300);
    await expect(page.locator(NAV)).toHaveCount(0);
  });
});

test.describe("V14.9: reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("stands down where there is no camera route to address", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(400);
    await expect(page.locator(NAV)).toHaveCount(0);
  });
});
