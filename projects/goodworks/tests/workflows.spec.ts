import { test, expect, type Page } from "@playwright/test";
test.use({ channel: "chrome" });
async function emptyWorkspace(page: Page) {
  await page.goto("/settings");
  await page.getByRole("heading", { name: "Settings", exact: true }).waitFor();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Start empty workspace" }).click();
  await expect(page.getByText("Empty local workspace ready.")).toBeVisible();
}
async function activity(
  page: Page,
  title: string,
  anonymous = 0,
  status = "completed",
) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Log activity", exact: true })
    .first()
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Activity title").fill(title);
  await dialog.getByLabel("Status", { exact: true }).selectOption(status);
  await dialog.getByRole("tab", { name: "Attendance" }).click();
  await dialog.getByRole("combobox", { name: "Participant ID" }).fill("P-001");
  await dialog.getByRole("button", { name: "Add ID", exact: true }).click();
  await dialog
    .getByLabel("Anonymous attendance", { exact: true })
    .fill(String(anonymous));
  await dialog
    .getByRole("button", { name: "Save activity", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
}
test("complete local workflow: attendance, edits, reports, backup and restore", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await emptyWorkspace(page);
  await activity(page, "First pantry visit", 4);
  await activity(page, "Second pantry visit");
  await activity(page, "Third pantry visit");
  await activity(page, "Draft event", 20, "draft");
  const metrics = page.locator(".kpi-value");
  await expect(metrics).toHaveText(["1", "7", "0hrs", "3"]);
  await page.getByRole("link", { name: "People Served", exact: true }).click();
  await expect(page.locator(".inline-stats strong")).toHaveText([
    "1",
    "3",
    "2",
    "4",
  ]);
  await page.goto("/activities");
  await page.getByPlaceholder("Search activities…").fill("First pantry");
  await page
    .getByRole("button", { name: "Edit First pantry visit", exact: true })
    .click();
  await page.getByRole("tab", { name: "Attendance" }).click();
  await page.getByLabel("Anonymous attendance", { exact: true }).fill("5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.goto("/");
  await expect(metrics).toHaveText(["1", "8", "0hrs", "3"]);
  await page.goto("/activities");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Delete Third pantry visit", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Third pantry visit", exact: true }),
  ).not.toBeVisible();
  await page.goto("/");
  await expect(metrics).toHaveText(["1", "7", "0hrs", "2"]);
  await page.goto("/reports/new");
  await page
    .getByRole("button", { name: "Preview report", exact: true })
    .click();
  await expect(page.locator(".report-metrics strong")).toHaveText([
    "1",
    "7",
    "1",
    "5",
    "0",
    "2",
  ]);
  await page
    .getByLabel("Highlights", { exact: true })
    .fill("A documented highlight for our report.");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/reports\/(?!new)[\w-]+/);
  const reportURL = page.url();
  await page.reload();
  await expect(page.getByLabel("Highlights", { exact: true })).toHaveValue(
    "A documented highlight for our report.",
  );
  await activity(page, "New later activity");
  await page.goto(reportURL);
  await expect(page.locator(".report-metrics strong").nth(1)).toHaveText("7");
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("button", { name: "Refresh figures", exact: true })
    .click();
  await expect(page.locator(".report-metrics strong").nth(1)).toHaveText("8");
  await expect(page.getByLabel("Highlights", { exact: true })).toHaveValue(
    "A documented highlight for our report.",
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  const reportDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "CSV", exact: true }).click();
  const reportCSV = await (await reportDownload).createReadStream();
  let csv = "";
  for await (const c of reportCSV!) csv += c;
  expect(csv).toContain("Unique identified participants");
  expect(csv).not.toContain("P-001");
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".sidebar")).not.toBeVisible();
  await expect(page.locator(".report-paper")).toBeVisible();
  await page.pdf({
    path: "/tmp/goodworks-report.pdf",
    format: "A4",
    printBackground: true,
  });
  await page.emulateMedia({ media: "screen" });
  await page.goto("/activities");
  await page.getByPlaceholder("Search activities…").fill("First pantry");
  const activityDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const activityStream = await (await activityDownload).createReadStream();
  let acsv = "";
  for await (const c of activityStream!) acsv += c;
  expect(acsv).toContain("First pantry visit");
  expect(acsv).not.toContain("Second pantry visit");
  await page.goto("/settings");
  const backupDownload = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download JSON backup" }).click();
  const backup = await backupDownload;
  const path = await backup.path();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "Start empty workspace" }).click();
  await page.locator("input[type=file]").setInputFiles(path!);
  await expect(
    page.getByRole("dialog", { name: "Replace local workspace?" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Replace workspace", exact: true })
    .click();
  await expect(
    page.getByText("Workspace restored.", { exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.goto("/");
  await expect(metrics).toHaveText(["1", "8", "0hrs", "3"]);
  await page.goto(reportURL);
  await expect(page.getByLabel("Highlights", { exact: true })).toHaveValue(
    "A documented highlight for our report.",
  );
  expect(errors).toEqual([]);
});
test("volunteers and separate supply units; validation and mobile navigation", async ({
  page,
}) => {
  await emptyWorkspace(page);
  await page.goto("/volunteers");
  await page
    .getByRole("button", { name: "Add volunteer", exact: true })
    .click();
  await page.getByLabel("Display name").fill("Test Volunteer");
  await page.getByRole("button", { name: "Save volunteer" }).click();
  await page.getByRole("button", { name: "Log hours", exact: true }).click();
  const d = page.getByRole("dialog");
  await d.getByLabel("Activity title").fill("Contribution activity");
  await d.getByRole("tab", { name: "Attendance" }).click();
  await d.getByRole("combobox", { name: "Participant ID" }).fill("P-001");
  await d.getByRole("button", { name: "Add ID", exact: true }).click();
  await d.getByRole("combobox", { name: "Participant ID" }).fill("P-001");
  await d.getByRole("button", { name: "Add ID", exact: true }).click();
  await expect(d.getByRole("alert")).toContainText("already included");
  await d.getByRole("combobox", { name: "Participant ID" }).fill("");
  await d.getByRole("tab", { name: "Volunteers", exact: true }).click();
  await d.getByRole("button", { name: "Add contribution" }).click();
  await d
    .getByLabel("Volunteer", { exact: true })
    .selectOption({ label: "Test Volunteer" });
  await d.getByLabel("Hours", { exact: true }).fill("3.5");
  await d.getByRole("tab", { name: "Supplies", exact: true }).click();
  await d.getByRole("button", { name: "Add distribution" }).click();
  await d.getByLabel("Item", { exact: true }).fill("Food");
  await d.getByLabel("Quantity", { exact: true }).fill("12");
  await d.getByLabel("Unit", { exact: true }).fill("meals");
  await d.getByRole("button", { name: "Add distribution" }).click();
  await d.getByLabel("Item", { exact: true }).nth(1).fill("Food");
  await d.getByLabel("Quantity", { exact: true }).nth(1).fill("4");
  await d.getByLabel("Unit", { exact: true }).nth(1).fill("boxes");
  await d.getByRole("button", { name: "Save activity" }).click();
  await expect(d).not.toBeVisible();
  await page.goto("/supplies");
  await expect(page.locator(".supply-list")).toContainText("12");
  await expect(page.locator(".supply-list")).toContainText("4");
  await expect(page.locator(".supply-row")).toHaveCount(2);
  await page.goto("/volunteers");
  await page.getByRole("button", { name: "Edit Test Volunteer" }).click();
  await page.getByLabel("Active volunteer").uncheck();
  await page.getByRole("button", { name: "Save volunteer" }).click();
  await expect(page.locator(".inline-stats strong").first()).toHaveText("3.5");
  await page.getByRole("button", { name: "Inactive", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Test Volunteer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "History", exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText("3.5 hrs");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Activities", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Activities", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Dashboard", exact: true }),
  ).toBeVisible();
  await page.screenshot({ path: "/tmp/goodworks-mobile.png", fullPage: true });
});

test("program and custom date filters stay consistent across dashboard, tables, and reports", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Filter by program" })
    .selectOption("program-0");
  const expected = await page.locator(".kpi-value").allTextContents();
  await page.getByRole("link", { name: "View all", exact: true }).click();
  await expect(
    page.getByRole("combobox", { name: "Filter by program" }),
  ).toHaveValue("program-0");
  for (const name of await page.locator("tbody .program-tag").allTextContents())
    expect(name).toBe("Food Pantry");
  await page.goto("/reports/new");
  await page.locator(".program-picker summary").click();
  await page
    .getByRole("checkbox", { name: "Food Pantry", exact: true })
    .check();
  await page.locator(".program-picker summary").click();
  await page
    .getByRole("button", { name: "Preview report", exact: true })
    .click();
  const totals = await page.locator(".report-metrics strong").allTextContents();
  expect(totals[0]).toBe(expected[0]);
  expect(totals[1]).toBe(expected[1]);
  expect(totals[4]).toBe(expected[2].replace("hrs", ""));
  expect(totals[5]).toBe(expected[3]);
  await page.goto("/");
  await page.getByLabel("Reporting period").selectOption("custom");
  await page.getByLabel("End date").fill("2099-01-31");
  await page.getByLabel("Start date").fill("2099-01-01");
  await expect(page.locator(".kpi-value")).toHaveText(["0", "0", "0hrs", "0"]);
  await page.goto("/settings");
  await page
    .locator("input[type=file]")
    .setInputFiles({
      name: "invalid.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"version":999}'),
    });
  await expect(page.getByRole("alert")).toContainText(
    "Invalid GoodWorks backup",
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
