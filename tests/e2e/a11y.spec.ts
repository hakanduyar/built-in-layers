import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// TASK-008 acceptance criterion: "axe: zero violations across all routes."
// The original task file also specifically requires "including one case
// study and 404" — covered here by scanning every real route (not just a
// sample) plus the 404 page, so every meaningful public page type and
// every project's case-study template variant is checked, not just one.
const routes = [
  "/",
  "/work",
  "/work/kivilcim",
  "/work/dropspot",
  "/work/jointledger",
  "/work/professional-systems",
  "/about",
  "/notes",
  "/lab",
];

async function scan(page: import("@playwright/test").Page) {
  return new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "best-practice"])
    .analyze();
}

function reportViolations(routeLabel: string, results: Awaited<ReturnType<typeof scan>>) {
  if (results.violations.length > 0) {
    const summary = results.violations
      .map(
        (v) =>
          `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length} node(s)) — ${v.nodes
            .slice(0, 3)
            .map((n) => n.target.join(" "))
            .join("; ")}`,
      )
      .join("\n");
    console.log(`axe violations on ${routeLabel}:\n${summary}`);
  }
  expect(results.violations, `${routeLabel} axe violations`).toEqual([]);
}

test.describe("Accessibility: axe scan, default state", () => {
  for (const path of routes) {
    test(`${path} has zero axe violations`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      reportViolations(path, await scan(page));
    });
  }

  test("the custom 404 page has zero axe violations", async ({ page }) => {
    await page.goto("/this-route-does-not-exist", { waitUntil: "networkidle" });
    reportViolations("/404", await scan(page));
  });
});

test.describe("Accessibility: axe scan, interactive states", () => {
  test("MobileNav open panel has zero axe violations", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Menu" }).click();
    await page.waitForTimeout(150);
    reportViolations("MobileNav open", await scan(page));
  });

  test("Layer Explorer has zero axe violations in each active tab state", async ({ page }) => {
    await page.goto("/work/kivilcim", { waitUntil: "networkidle" });
    for (const name of ["Surface", "Flow", "System"]) {
      await page.getByRole("tab", { name }).click();
      await page.waitForTimeout(150);
      reportViolations(`Layer Explorer — ${name} active`, await scan(page));
    }
  });

  test("Layer Explorer has zero axe violations on keyboard focus", async ({ page }) => {
    await page.goto("/work/kivilcim", { waitUntil: "networkidle" });
    await page.getByRole("tab", { name: "Surface" }).focus();
    reportViolations("Layer Explorer — keyboard focused tab", await scan(page));
  });

  test("a representative project card has zero axe violations on keyboard focus", async ({
    page,
  }) => {
    await page.goto("/work", { waitUntil: "networkidle" });
    await page.getByRole("link", { name: /Kıvılcım/ }).focus();
    reportViolations("Project card — keyboard focused", await scan(page));
  });
});
