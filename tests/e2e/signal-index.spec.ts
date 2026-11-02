import { expect, test } from "@playwright/test";

for (const width of [390, 1440]) {
  test(`project monitor expands the real case and restores focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const controls = page.getByRole("toolbar", { name: "Select a project plate" });
    const plates = controls.getByRole("button");
    await expect(plates).toHaveCount(5);
    await plates.nth(3).click();
    const enlarge = page.getByRole("button", { name: "Enlarge" });
    await enlarge.click();
    const viewer = page.getByRole("dialog", { name: "Project plate viewer" });
    await expect(viewer).toBeVisible();
    await expect(viewer.getByRole("link", { name: /Open case/ })).toHaveAttribute(
      "href",
      "/work/dropspot",
    );
    await page.keyboard.press("ArrowRight");
    await expect(viewer.getByRole("link", { name: /Open case/ })).toHaveAttribute(
      "href",
      "/work/professional-systems",
    );
    await page.keyboard.press("Escape");
    await expect(viewer).not.toBeVisible();
    await expect(enlarge).toBeFocused();
  });
}
