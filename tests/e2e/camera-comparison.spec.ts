import { expect, test } from "@playwright/test";

test("compare both cameras at the same exposure without moving the project route", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?camera=guided");
  const field = page.locator('[data-signal-passage="kivilcim"]');
  await expect(field).toBeVisible();
  await expect(page.getByRole("button", { name: "A · Rota" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const y = await page.evaluate(() => scrollY);
  await page.getByRole("button", { name: "B · Serbest bakış" }).click();
  const pad = page.getByRole("button", { name: /Bakışı yönlendir/ });
  await pad.focus();
  await pad.press("ArrowUp");
  await page.getByRole("button", { name: "Yaklaş", exact: true }).click();
  await expect.poll(() => field.evaluate((e) => e.style.getPropertyValue("--look-z"))).toBe("0.35");
  await expect
    .poll(() => field.evaluate((e) => e.style.getPropertyValue("--look-y")))
    .toBe("-0.25");
  expect(await page.evaluate(() => scrollY)).toBe(y);
  await page.getByRole("button", { name: "A · Rota" }).click();
  await expect(pad).toHaveCount(0);
  expect(await field.evaluate((e) => e.style.getPropertyValue("--look-z"))).toBe("");
  expect(await page.evaluate(() => scrollY)).toBe(y);
});
