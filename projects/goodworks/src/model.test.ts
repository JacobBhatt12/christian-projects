import { describe, it, expect } from "vitest";
import {
  aggregate,
  filtered,
  monthRange,
  createReport,
  refreshReport,
  csv,
  workspaceSchema,
  activitySchema,
  type Activity,
  type Workspace,
} from "./model";
const activity = (changes: Partial<Activity> = {}): Activity => ({
  id: "a1",
  title: "Pantry",
  date: "2026-01-05",
  programId: "p1",
  location: "",
  status: "completed",
  notes: "",
  participants: ["P-001"],
  anonymous: 0,
  contributions: [],
  supplies: [],
  ...changes,
});
const workspace = (activities: Activity[]): Workspace => ({
  version: 1,
  demo: false,
  organization: { name: "Test Ministry", type: "Nonprofit" },
  programs: [
    { id: "p1", name: "Pantry", active: true },
    { id: "p2", name: "Meals", active: true },
  ],
  volunteers: [],
  activities,
  reports: [],
});
describe("Accurate attendance counts", () => {
  it("deduplicates a participant attending three activities across programs", () => {
    const t = aggregate([
      activity(),
      activity({ id: "a2", programId: "p2" }),
      activity({ id: "a3" }),
    ]);
    expect(t).toMatchObject({ unique: 1, identified: 3, repeat: 2, visits: 3 });
  });
  it("keeps anonymous attendance out of unique and repeat counts", () => {
    expect(aggregate([activity({ anonymous: 7 })])).toMatchObject({
      unique: 1,
      identified: 1,
      repeat: 0,
      anonymous: 7,
      visits: 8,
    });
  });
  it("excludes every draft contribution, supply, and attendance", () => {
    expect(
      aggregate([
        activity({
          status: "draft",
          anonymous: 10,
          contributions: [{ volunteerId: "v1", hours: 5 }],
          supplies: [{ item: "Meals", unit: "meals", quantity: 20 }],
        }),
      ]),
    ).toEqual({
      unique: 0,
      identified: 0,
      repeat: 0,
      anonymous: 0,
      visits: 0,
      hours: 0,
      completed: 0,
      supplies: [],
    });
  });
  it("recalculates after edit and deletion", () => {
    const a = activity();
    expect(aggregate([a]).visits).toBe(1);
    expect(aggregate([{ ...a, anonymous: 5 }]).visits).toBe(6);
    expect(aggregate([]).visits).toBe(0);
  });
  it("rejects duplicate participant and volunteer entries, negative hours and invalid quantities", () => {
    expect(
      activitySchema.safeParse(activity({ participants: ["P-001", "P-001"] }))
        .success,
    ).toBe(false);
    expect(
      activitySchema.safeParse(
        activity({
          contributions: [
            { volunteerId: "v1", hours: 2 },
            { volunteerId: "v1", hours: 3 },
          ],
        }),
      ).success,
    ).toBe(false);
    expect(
      activitySchema.safeParse(
        activity({ contributions: [{ volunteerId: "v1", hours: -1 }] }),
      ).success,
    ).toBe(false);
    expect(
      activitySchema.safeParse(
        activity({ supplies: [{ item: "Food", unit: "boxes", quantity: 0 }] }),
      ).success,
    ).toBe(false);
  });
});
describe("Date and program filters", () => {
  it("includes both boundary dates and excludes other programs", () => {
    const rows = [
      activity({ id: "start", date: "2026-01-01" }),
      activity({ id: "end", date: "2026-01-31" }),
      activity({ id: "before", date: "2025-12-31" }),
      activity({ id: "after", date: "2026-02-01" }),
      activity({ id: "other", programId: "p2" }),
    ];
    expect(
      filtered(rows, {
        start: "2026-01-01",
        end: "2026-01-31",
        programs: ["p1"],
      }).map((a) => a.id),
    ).toEqual(["start", "end"]);
  });
  it("calculates leap year boundaries", () => {
    expect(monthRange("2024-02").end).toBe("2024-02-29");
    expect(monthRange("2025-02").end).toBe("2025-02-28");
  });
  it("annual uniques do not sum monthly uniques", () => {
    const rows = [activity(), activity({ id: "a2", date: "2026-02-01" })];
    expect(
      aggregate(
        filtered(rows, {
          start: "2026-01-01",
          end: "2026-12-31",
          programs: [],
        }),
      ).unique,
    ).toBe(1);
  });
  it("rejects impossible calendar dates", () => {
    expect(
      activitySchema.safeParse(activity({ date: "2026-02-30" })).success,
    ).toBe(false);
  });
});
describe("Report aggregation and snapshots", () => {
  it("preserves distinct units while grouping matching items", () => {
    const t = aggregate([
      activity({
        supplies: [
          { item: "Food", unit: "boxes", quantity: 5 },
          { item: "Food", unit: "meals", quantity: 10 },
          { item: "food", unit: "boxes", quantity: 2 },
        ],
      }),
    ]);
    expect(t.supplies).toHaveLength(2);
    expect(t.supplies.find((s) => s.unit === "boxes")?.quantity).toBe(7);
  });
  it("aggregates program figures and creates a detached snapshot without participant IDs", () => {
    const w = workspace([
      activity(),
      activity({ id: "a2", programId: "p2", anonymous: 4 }),
    ]);
    const r = createReport(w, monthRange("2026-01"));
    expect(r.totals).toMatchObject({
      unique: 1,
      visits: 6,
      repeat: 1,
      anonymous: 4,
    });
    expect(r.breakdown.map((p) => p.totals.unique)).toEqual([1, 1]);
    w.activities[0].participants.push("P-002");
    expect(r.totals.unique).toBe(1);
    expect(JSON.stringify(r)).not.toContain("P-001");
    expect(r.summary).toContain("6 service visits");
  });
  it("validates backup references and rejects duplicate IDs", () => {
    expect(workspaceSchema.safeParse(workspace([activity()])).success).toBe(
      true,
    );
    expect(
      workspaceSchema.safeParse(workspace([activity({ programId: "missing" })]))
        .success,
    ).toBe(false);
    expect(
      workspaceSchema.safeParse(workspace([activity(), activity()])).success,
    ).toBe(false);
  });
});
describe("CSV safety", () => {
  it("escapes commas, quotes, newlines and neutralizes spreadsheet formulas", () => {
    expect(
      csv([
        [
          "A, B",
          'He said "yes"',
          "line1\nline2",
          "=SUM(A1)",
          " @NOW()",
          "\t+1",
        ],
      ]),
    ).toBe(
      '\uFEFF"A, B","He said ""yes""","line1\nline2","\'=SUM(A1)","\' @NOW()","\'\t+1"',
    );
  });
});

describe("Refreshing historical reports", () => {
  it("updates an untouched factual summary and preserves edited narratives", () => {
    const w = workspace([activity()]);
    const r = createReport(w, monthRange("2026-01"));
    r.highlights = "Documented highlight";
    w.activities.push(activity({ id: "a2", anonymous: 5 }));
    const updated = refreshReport(r, w, monthRange("2026-01"));
    expect(updated.summary).toContain("7 service visits");
    expect(updated.highlights).toBe("Documented highlight");
    expect(updated.id).toBe(r.id);
    expect(updated.createdAt).toBe(r.createdAt);
    r.summary = "An edited, verified summary.";
    expect(refreshReport(r, w, monthRange("2026-01")).summary).toBe(r.summary);
  });
});
