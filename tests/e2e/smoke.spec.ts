import { expect, test } from "@playwright/test";

test("home page renders with an h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Hakan Duyar");
});
