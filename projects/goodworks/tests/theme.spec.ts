import { test, expect } from "@playwright/test";
test.use({ channel: "chrome" });

test("system appearance, persistent overrides, and cross-tab synchronization", async ({
  page,
  context,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const appearance = page.getByRole("combobox", { name: "Appearance" });
  await expect(appearance).toHaveValue("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("html")).toHaveCSS("color-scheme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await appearance.selectOption("dark");
  await page.reload();
  await expect(appearance).toHaveValue("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const second = await context.newPage();
  await second.goto("/");
  await second
    .getByRole("combobox", { name: "Appearance" })
    .selectOption("light");
  await expect(appearance).toHaveValue("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await second.close();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await appearance.selectOption("system");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("both themes cover routes, dialogs, narrow screens, and print", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  for (const theme of ["light", "dark"] as const) {
    await page
      .getByRole("combobox", { name: "Appearance" })
      .selectOption(theme);
    await expect(page.locator("html")).toHaveCSS("color-scheme", theme);
    await expect(
      page.getByRole("button", { name: "Log activity", exact: true }).first(),
    ).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/dashboard-${theme}.png`,
      fullPage: true,
    });
    for (const route of [
      "activities",
      "people",
      "volunteers",
      "supplies",
      "reports",
      "settings",
    ]) {
      await page.goto(`/${route}`);
      await expect(
        page.getByRole("combobox", { name: "Appearance" }),
      ).toHaveValue(theme);
      await expect(page.locator("main h1")).toBeVisible();
    }
    await page.goto("/");
    await page
      .getByRole("button", { name: "Log activity", exact: true })
      .first()
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.screenshot({
      animations: "disabled",
      path: `test-results/dialog-${theme}.png`,
    });
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(
    page.getByRole("combobox", { name: "Appearance" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    )
    .toBe(true);
  await page.screenshot({
    animations: "disabled",
    path: "test-results/mobile-dark.png",
    fullPage: true,
  });
  await page.emulateMedia({ media: "print" });
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light");
  expect(errors).toEqual([]);
});

test("unavailable preference storage does not prevent theme changes", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {
      throw new Error("Storage unavailable");
    };
    Storage.prototype.setItem = () => {
      throw new Error("Storage unavailable");
    };
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const appearance = page.getByRole("combobox", { name: "Appearance" });
  await expect(appearance).toHaveValue("system");
  await appearance.selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
