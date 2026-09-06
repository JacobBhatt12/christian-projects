import { z } from "zod";
const id = z.string().trim().min(1).max(100);
const text = z.string().trim().min(1).max(200);
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (s) =>
      !Number.isNaN(Date.parse(s)) &&
      new Date(s).toISOString().slice(0, 10) === s,
    "Enter a valid date",
  );
const nonnegative = z.number().finite().min(0).max(1000000);
export const programSchema = z.object({ id, name: text, active: z.boolean() });
export const volunteerSchema = z.object({
  id,
  name: text,
  active: z.boolean(),
});
export const activitySchema = z
  .object({
    id,
    title: text,
    date: dateSchema,
    programId: id,
    location: z.string().max(200),
    status: z.enum(["draft", "completed"]),
    notes: z.string().max(10000),
    participants: z
      .array(z.string().regex(/^P-[A-Z0-9-]{1,30}$/, "Use IDs such as P-001"))
      .max(10000),
    anonymous: nonnegative.int(),
    contributions: z
      .array(z.object({ volunteerId: id, hours: nonnegative }))
      .max(1000),
    supplies: z
      .array(
        z.object({
          item: text,
          unit: text,
          quantity: z.number().finite().positive().max(1000000),
        }),
      )
      .max(1000),
  })
  .superRefine((a, ctx) => {
    if (new Set(a.participants).size !== a.participants.length)
      ctx.addIssue({
        code: "custom",
        message: "A participant can attend an activity only once.",
        path: ["participants"],
      });
    if (
      new Set(a.contributions.map((c) => c.volunteerId)).size !==
      a.contributions.length
    )
      ctx.addIssue({
        code: "custom",
        message: "Combine hours into one entry per volunteer.",
        path: ["contributions"],
      });
  });
export type Activity = z.infer<typeof activitySchema>;
export type Program = z.infer<typeof programSchema>;
export type Volunteer = z.infer<typeof volunteerSchema>;
export type Filters = { start: string; end: string; programs: string[] };
const supplyTotalSchema = z.object({
  item: text,
  unit: text,
  quantity: nonnegative,
});
const totalsSchema = z.object({
  unique: nonnegative.int(),
  identified: nonnegative.int(),
  repeat: nonnegative.int(),
  anonymous: nonnegative.int(),
  visits: nonnegative.int(),
  hours: nonnegative,
  completed: nonnegative.int(),
  supplies: z.array(supplyTotalSchema),
});
export type Totals = z.infer<typeof totalsSchema>;
const filterSchema = z
  .object({ start: dateSchema, end: dateSchema, programs: z.array(id) })
  .refine((f) => f.start <= f.end, "Start date must be before end date");
export const reportSchema = z.object({
  id,
  title: text,
  demo: z.boolean().default(false),
  createdAt: z.string().datetime(),
  generatedAt: z.string().datetime(),
  organization: text,
  filters: filterSchema,
  programNames: z.array(text),
  totals: totalsSchema,
  breakdown: z.array(z.object({ program: text, totals: totalsSchema })),
  summary: z.string().max(20000),
  highlights: z.string().max(20000),
  challenges: z.string().max(20000),
  nextSteps: z.string().max(20000),
});
export type Report = z.infer<typeof reportSchema>;
export const workspaceSchema = z
  .object({
    version: z.literal(1),
    demo: z.boolean(),
    organization: z.object({
      name: text,
      type: z.enum(["Nonprofit", "Church", "Christian ministry", "Other"]),
    }),
    programs: z.array(programSchema).max(200),
    volunteers: z.array(volunteerSchema).max(10000),
    activities: z.array(activitySchema).max(100000),
    reports: z.array(reportSchema).max(10000),
  })
  .superRefine((w, ctx) => {
    for (const key of [
      "programs",
      "volunteers",
      "activities",
      "reports",
    ] as const)
      if (new Set(w[key].map((v) => v.id)).size !== w[key].length)
        ctx.addIssue({ code: "custom", message: `Duplicate ${key} IDs` });
    const p = new Set(w.programs.map((p) => p.id));
    const v = new Set(w.volunteers.map((v) => v.id));
    if (
      w.activities.some(
        (a) =>
          !p.has(a.programId) ||
          a.contributions.some((c) => !v.has(c.volunteerId)),
      )
    )
      ctx.addIssue({
        code: "custom",
        message: "An activity references a missing program or volunteer.",
      });
  });
export type Workspace = z.infer<typeof workspaceSchema>;
export const uid = () => crypto.randomUUID();
export const localDate = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const monthRange = (month = localDate().slice(0, 7)): Filters => {
  const [y, m] = month.split("-").map(Number);
  return {
    start: `${month}-01`,
    end: localDate(new Date(y, m, 0)),
    programs: [],
  };
};
export const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export const number = (n: number) =>
  n.toLocaleString("en-US", { maximumFractionDigits: 2 });
export function filtered(
  activities: Activity[],
  f: Filters,
  completedOnly = false,
) {
  return activities.filter(
    (a) =>
      a.date >= f.start &&
      a.date <= f.end &&
      (!f.programs.length || f.programs.includes(a.programId)) &&
      (!completedOnly || a.status === "completed"),
  );
}
export function aggregate(activities: Activity[]): Totals {
  const a = activities.filter((a) => a.status === "completed");
  const ids = new Set(a.flatMap((a) => a.participants));
  const identified = a.reduce((s, a) => s + new Set(a.participants).size, 0);
  const anonymous = a.reduce((s, a) => s + a.anonymous, 0);
  const supplies = new Map<string, Totals["supplies"][number]>();
  for (const row of a.flatMap((a) => a.supplies)) {
    const key = JSON.stringify([
      row.item.trim().toLowerCase(),
      row.unit.trim().toLowerCase(),
    ]);
    const old = supplies.get(key);
    supplies.set(key, {
      ...row,
      quantity: (old?.quantity || 0) + row.quantity,
    });
  }
  return {
    unique: ids.size,
    identified,
    repeat: identified - ids.size,
    anonymous,
    visits: identified + anonymous,
    hours:
      Math.round(
        a.reduce(
          (s, a) => s + a.contributions.reduce((s, c) => s + c.hours, 0),
          0,
        ) * 100,
      ) / 100,
    completed: a.length,
    supplies: [...supplies.values()].sort(
      (a, b) => a.item.localeCompare(b.item) || a.unit.localeCompare(b.unit),
    ),
  };
}
export const methodology =
  "Unique identified participants are distinct anonymous participant IDs across completed activities in the selected period and programs. Each ID counts once per activity as an identified service visit. Additional repeat visits equal identified visits minus unique participants. Anonymous attendance is counted separately as visits and never added to unique participants. Total service visits include identified visits and anonymous attendance. Draft activities are excluded. Organization-wide unique totals deduplicate across all selected programs; program or monthly unique counts must not be added together. Supply quantities are grouped by item and unit. Volunteer hours are recorded contributions, not estimates.";
export const factualSummary = (organization: string, t: Totals) =>
  `During this reporting period, ${organization} recorded ${number(t.completed)} completed activities, serving ${number(t.unique)} unique identified participants across ${number(t.visits)} service visits. These visits included ${number(t.anonymous)} anonymous attendances. Volunteers contributed ${number(t.hours)} hours.`;
export const reportTitle = (f: Filters) =>
  `Impact report · ${formatDate(f.start)} – ${formatDate(f.end)}`;
export function createReport(w: Workspace, f: Filters): Report {
  const rows = filtered(w.activities, f, true);
  const totals = aggregate(rows);
  const selected = w.programs.filter(
    (p) => !f.programs.length || f.programs.includes(p.id),
  );
  return {
    id: uid(),
    demo: w.demo,
    title: reportTitle(f),
    createdAt: new Date().toISOString(),
    generatedAt: new Date().toISOString(),
    organization: w.organization.name,
    filters: structuredClone(f),
    programNames: selected.map((p) => p.name),
    totals,
    breakdown: selected.map((p) => ({
      program: p.name,
      totals: aggregate(rows.filter((a) => a.programId === p.id)),
    })),
    summary: factualSummary(w.organization.name, totals),
    highlights: "",
    challenges: "",
    nextSteps: "",
  };
}
export function refreshReport(r: Report, w: Workspace, f: Filters): Report {
  const fresh = createReport(w, f);
  return {
    ...fresh,
    id: r.id,
    createdAt: r.createdAt,
    title: r.title === reportTitle(r.filters) ? fresh.title : r.title,
    summary:
      r.summary === factualSummary(r.organization, r.totals)
        ? fresh.summary
        : r.summary,
    highlights: r.highlights,
    challenges: r.challenges,
    nextSteps: r.nextSteps,
  };
}
export function csv(rows: (string | number)[][]) {
  return (
    "\uFEFF" +
    rows
      .map((row) =>
        row
          .map((value) => {
            let s = String(value);
            if (/^[\s\u0000-\u001f]*[=+@-]/.test(s) || /^[\t\r\n]/.test(s))
              s = "'" + s;
            return '"' + s.replaceAll('"', '""') + '"';
          })
          .join(","),
      )
      .join("\r\n")
  );
}
export function activityCSV(rows: Activity[], programs: Program[]) {
  return csv([
    [
      "Title",
      "Date",
      "Program",
      "Location",
      "Status",
      "Identified visits",
      "Anonymous attendance",
      "Volunteer hours",
    ],
    ...rows.map((a) => [
      a.title,
      a.date,
      programs.find((p) => p.id === a.programId)?.name || "",
      a.location,
      a.status,
      a.participants.length,
      a.anonymous,
      a.contributions.reduce((s, c) => s + c.hours, 0),
    ]),
  ]);
}
export function reportCSV(r: Report) {
  const metrics = (t: Totals) => [
    t.unique,
    t.identified,
    t.repeat,
    t.anonymous,
    t.visits,
    t.hours,
    t.completed,
  ];
  return csv([
    ["Organization", r.organization],
    ["Period", r.filters.start, r.filters.end],
    ["Snapshot generated", r.generatedAt],
    [
      "Scope",
      "Unique identified participants",
      "Identified visits",
      "Additional repeat visits",
      "Anonymous attendance",
      "Total service visits",
      "Volunteer hours",
      "Completed activities",
    ],
    ["All selected programs", ...metrics(r.totals)],
    ...r.breakdown.map((p) => [p.program, ...metrics(p.totals)]),
    [],
    ["Supply item", "Unit", "Quantity"],
    ...r.totals.supplies.map((s) => [s.item, s.unit, s.quantity]),
    [],
    ["Methodology", methodology],
  ]);
}
export function download(
  name: string,
  content: string,
  type = "text/csv;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
