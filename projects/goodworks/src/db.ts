import Dexie, { type EntityTable } from "dexie";
import { localDate, type Workspace } from "./model";
const db = new Dexie("goodworks-local-v1") as Dexie & {
  workspace: EntityTable<{ id: string; data: Workspace }, "id">;
};
db.version(1).stores({ workspace: "id" });
export function seed(): Workspace {
  const programs = [
    "Food Pantry",
    "Community Meals",
    "Youth Mentoring",
    "Clothing Closet",
    "Outreach",
  ].map((name, i) => ({ id: `program-${i}`, name, active: true }));
  const volunteers = [
    "Sarah Mitchell",
    "James Wilson",
    "Maria Garcia",
    "David Thompson",
    "Rachel Kim",
    "Daniel Brooks",
    "Grace Anderson",
    "Michael Davis",
  ].map((name, i) => ({ id: `volunteer-${i}`, name, active: true }));
  const titles = [
    ["Weekly pantry distribution", "Family food pickup", "Neighborhood pantry"],
    ["Community dinner", "Saturday lunch service", "Community breakfast"],
    ["After-school mentoring", "Youth study group", "Mentoring circle"],
    [
      "Seasonal clothing distribution",
      "Community clothing day",
      "Family clothing pickup",
    ],
    ["Neighborhood outreach", "Community care visits", "Care kit distribution"],
  ];
  const now = new Date();
  const activities: Workspace["activities"] = [];
  for (let offset = 0; offset < 4; offset++) {
    const month = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const last =
      offset === 0
        ? now.getDate()
        : new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let day = 1; day <= last; day += 2) {
      for (let slot = 0; slot < 2; slot++) {
        const i = activities.length;
        const p = (day + slot + offset) % 5;
        const count = 8 + ((i * 7) % 24);
        activities.push({
          id: `activity-${i}`,
          title: titles[p][i % 3],
          date: localDate(new Date(month.getFullYear(), month.getMonth(), day)),
          programId: programs[p].id,
          location: [
            "Hope Center · Main hall",
            "Community kitchen",
            "Learning center",
            "Hope Center · Clothing room",
            "Eastside neighborhood",
          ][p],
          status: i === 2 ? "draft" : "completed",
          notes: "Fictional sample activity for exploring GoodWorks.",
          participants: Array.from(
            { length: count },
            (_, j) => `P-${String(((i * 11 + j) % 115) + 1).padStart(3, "0")}`,
          ),
          anonymous: p === 2 ? 0 : 3 + (i % 13),
          contributions: [
            { volunteerId: volunteers[i % 8].id, hours: 2 + (i % 4) },
            { volunteerId: volunteers[(i + 3) % 8].id, hours: 2.5 + (i % 3) },
          ],
          supplies:
            p === 2
              ? []
              : [
                  {
                    item: [
                      "Food parcels",
                      "Hot meals",
                      "",
                      "Winter coats",
                      "Care kits",
                    ][p],
                    unit: ["boxes", "meals", "", "coats", "kits"][p],
                    quantity: count + 5 + (i % 12),
                  },
                ],
        });
      }
    }
  }
  return {
    version: 1,
    demo: true,
    organization: {
      name: "Hope Community Ministries",
      type: "Christian ministry",
    },
    programs,
    volunteers,
    activities,
    reports: [],
  };
}
export async function loadWorkspace() {
  return db.transaction("rw", db.workspace, async () => {
    const existing = await db.workspace.get("main");
    if (existing) return existing.data;
    const data = seed();
    await db.workspace.put({ id: "main", data });
    return data;
  });
}
export async function saveWorkspace(data: Workspace, expected?: Workspace) {
  await db.transaction("rw", db.workspace, async () => {
    const current = await db.workspace.get("main");
    if (expected && JSON.stringify(current?.data) !== JSON.stringify(expected))
      throw new Error(
        "Another tab changed this workspace. Reload this page before saving to avoid overwriting newer records.",
      );
    await db.workspace.put({ id: "main", data });
  });
}
