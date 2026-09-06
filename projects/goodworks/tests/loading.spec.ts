import { test, expect } from "@playwright/test";
test.use({ channel: "chrome" });

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`dashboard loading and reveal with motion ${reducedMotion}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({ colorScheme: "dark", reducedMotion });
    await page.addInitScript(() => {
      const observer = new MutationObserver(() => {
        if (
          document.querySelector('[aria-label="Loading dashboard"]') &&
          !performance.getEntriesByName("loader-shown").length
        ) {
          performance.mark("loader-shown");
        }
        if (document.querySelector(".dashboard-view")) {
          performance.mark("dashboard-shown");
          observer.disconnect();
        }
      });
      observer.observe(document, { childList: true, subtree: true });
    });
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route("**/src/Dashboard.tsx*", async (route) => {
      await ready;
      await route.continue();
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
    try {
      const loader = page.getByRole("status", { name: "Loading dashboard" });
      await expect(loader).toBeVisible();
      await expect(loader).toHaveAttribute("aria-busy", "true");
      await expect(page.locator(".loading-indicator")).toBeVisible();
      await expect(loader).toContainText("Loading your dashboard");
      await expect(page.locator(".loading-stage")).toHaveText(
        "Loading activities...",
      );
      await expect(
        loader.locator("svg, .loading-card, .skeleton-block"),
      ).toHaveCount(0);
      await expect
        .poll(async () => {
          const heading = await page.locator(".loading-heading").boundingBox();
          if (!heading) return Infinity;
          return Math.max(
            Math.abs(
              heading.x + heading.width / 2 - page.viewportSize()!.width / 2,
            ),
            Math.abs(
              heading.y + heading.height / 2 - page.viewportSize()!.height / 2,
            ),
          );
        })
        .toBeLessThan(2);
      await expect(page.locator(".sidebar")).not.toBeVisible();
      await expect(page.locator(".topbar")).not.toBeVisible();
      const bounds = await loader.boundingBox();
      expect(bounds?.x).toBe(0);
      expect(bounds?.y).toBe(0);
      expect(bounds?.width).toBe(page.viewportSize()?.width);
      expect(bounds?.height).toBe(page.viewportSize()?.height);
      if (reducedMotion === "reduce") {
        await expect(page.locator(".loading-stage")).toHaveCSS(
          "transform",
          "none",
        );
        await expect(page.locator(".loading-stage")).toHaveCSS("opacity", "1");
      }
      await page.screenshot({
        path: `test-results/loading-${reducedMotion}.png`,
        fullPage: true,
      });
      await expect(page.locator(".loading-stage")).toHaveText(
        "Loading supplies...",
      );
      await expect(page.locator(".loading-stage")).toHaveText(
        "Loading logs...",
      );
      await page.setViewportSize({ width: 375, height: 812 });
      const mobileHeading = await page
        .locator(".loading-heading")
        .boundingBox();
      expect(
        Math.abs(mobileHeading!.y + mobileHeading!.height / 2 - 406),
      ).toBeLessThan(2);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    } finally {
      release();
    }
    await expect(
      page.getByRole("heading", { name: "Dashboard", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("status", { name: "Loading dashboard" }),
    ).toHaveCount(0);
    expect(
      await page.evaluate(
        () =>
          performance.getEntriesByName("dashboard-shown")[0].startTime -
          performance.getEntriesByName("loader-shown")[0].startTime,
      ),
    ).toBeGreaterThanOrEqual(2950);
    await expect(page.locator(".kpi").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".kpi").first()).toHaveCSS("transform", "none");
    await page
      .getByRole("button", { name: "Log activity", exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(errors).toEqual([]);
  });
}
