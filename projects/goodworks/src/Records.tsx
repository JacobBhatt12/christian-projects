import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Plus,
  Download,
  Pencil,
  Trash2,
  ArrowUpRight,
  HandHeart,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import {
  PageHeader,
  FilterBar,
  SearchBox,
  Empty,
  Pagination,
  Panel,
  ProgramTag,
  SortHeader,
  Status,
  SupplyList,
  useWorkspace,
} from "./shared";
import {
  aggregate,
  activityCSV,
  download,
  filtered,
  formatDate,
  monthRange,
  number,
  uid,
  volunteerSchema,
  type Activity,
  type Volunteer,
} from "./model";
export function useRecordFilters() {
  const [params] = useSearchParams();
  return useState(() => ({
    ...monthRange(),
    ...(params.get("start") && params.get("end")
      ? { start: params.get("start")!, end: params.get("end")! }
      : {}),
    programs: params.get("program") ? [params.get("program")!] : [],
  }));
}
export function ActivityTable({
  rows,
  compact = false,
  onSort,
}: {
  rows: Activity[];
  compact?: boolean;
  onSort?: (key: "title" | "date" | "programId" | "status") => void;
}) {
  const { w, editActivity, commit } = useWorkspace();
  return rows.length ? (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>
              {onSort ? (
                <SortHeader onClick={() => onSort("title")}>
                  Activity
                </SortHeader>
              ) : (
                "Activity"
              )}
            </th>
            <th>
              {onSort ? (
                <SortHeader onClick={() => onSort("date")}>Date</SortHeader>
              ) : (
                "Date"
              )}
            </th>
            <th>
              {onSort ? (
                <SortHeader onClick={() => onSort("programId")}>
                  Program
                </SortHeader>
              ) : (
                "Program"
              )}
            </th>
            {!compact && <th className="numeric">Visits</th>}
            <th>
              {onSort ? (
                <SortHeader onClick={() => onSort("status")}>Status</SortHeader>
              ) : (
                "Status"
              )}
            </th>
            <th>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => {
            const p = w.programs.findIndex((p) => p.id === a.programId);
            return (
              <tr key={a.id}>
                <td>
                  <button
                    className="record-link"
                    onClick={() => editActivity(a.id)}
                  >
                    {a.title}
                  </button>
                  {!compact && (
                    <small className="cell-secondary">
                      {a.location || "No location"}
                    </small>
                  )}
                </td>
                <td className="nowrap">
                  {formatDate(a.date).replace(`, ${a.date.slice(0, 4)}`, "")}
                </td>
                <td>
                  <ProgramTag
                    name={w.programs[p]?.name || "Unknown"}
                    index={p}
                  />
                </td>
                {!compact && (
                  <td className="numeric">
                    {number(a.participants.length + a.anonymous)}
                  </td>
                )}
                <td>
                  <Status value={a.status} />
                </td>
                <td>
                  <div className="row-actions">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${a.title}`}
                      onClick={() => editActivity(a.id)}
                    >
                      {compact ? (
                        <ArrowUpRight size={15} />
                      ) : (
                        <Pencil size={15} />
                      )}
                    </Button>
                    {!compact && (
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${a.title}`}
                        onClick={async () => {
                          if (
                            confirm(
                              `Delete “${a.title}”? Its attendance, volunteer hours, and distributions will also be deleted. Saved report snapshots will remain unchanged.`,
                            )
                          )
                            await commit(
                              {
                                ...w,
                                activities: w.activities.filter(
                                  (row) => row.id !== a.id,
                                ),
                              },
                              "Activity deleted.",
                            );
                        }}
                      >
                        <Trash2 size={15} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty
      title="No activities in this view"
      description="Adjust your filters or log an activity to get started."
    >
      <Button onClick={() => editActivity()}>
        <Plus size={16} />
        Log activity
      </Button>
    </Empty>
  );
}
export function Activities() {
  const { w, editActivity } = useWorkspace();
  const [f, setF] = useRecordFilters();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<{
    key: "title" | "date" | "programId" | "status";
    direction: number;
  }>({ key: "date", direction: -1 });
  const rows = filtered(w.activities, f)
    .filter(
      (a) =>
        (a.title + " " + a.location).toLowerCase().includes(q.toLowerCase()) &&
        (status === "all" || a.status === status),
    )
    .sort((a, b) => {
      const av =
        sort.key === "programId"
          ? w.programs.find((p) => p.id === a.programId)?.name || ""
          : a[sort.key];
      const bv =
        sort.key === "programId"
          ? w.programs.find((p) => p.id === b.programId)?.name || ""
          : b[sort.key];
      return av.localeCompare(bv) * sort.direction;
    });
  const safePage = Math.min(page, Math.max(1, Math.ceil(rows.length / 8)));
  return (
    <>
      <PageHeader
        title="Activities"
        subtitle="Keep a reliable record of the work you do."
      >
        <Button
          variant="outline"
          onClick={() =>
            download("goodworks-activities.csv", activityCSV(rows, w.programs))
          }
        >
          <Download size={16} />
          Export CSV
        </Button>
        <Button onClick={() => editActivity()}>
          <Plus size={16} />
          Log activity
        </Button>
      </PageHeader>
      <FilterBar
        value={f}
        onChange={(v) => {
          setF(v);
          setPage(1);
        }}
      />
      <Panel
        title="Activity log"
        subtitle={`${rows.length} activities in this view`}
        action={
          <SearchBox
            value={q}
            onChange={(s) => {
              setQ(s);
              setPage(1);
            }}
            placeholder="Search activities…"
          />
        }
      >
        <div className="table-tabs">
          {["all", "completed", "draft"].map((s) => (
            <button
              className={status === s ? "active" : ""}
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
            >
              {s === "all"
                ? "All activities"
                : s === "completed"
                  ? "Completed"
                  : "Drafts"}
            </button>
          ))}
        </div>
        <ActivityTable
          rows={rows.slice((safePage - 1) * 8, safePage * 8)}
          onSort={(key) =>
            setSort({ key, direction: sort.key === key ? -sort.direction : 1 })
          }
        />
        <Pagination page={safePage} setPage={setPage} count={rows.length} />
      </Panel>
      <p className="muted-note">
        Draft attendance is shown in the activity log but excluded from all
        impact totals.
      </p>
    </>
  );
}
export function People() {
  const { w, editActivity } = useWorkspace();
  const [f, setF] = useRecordFilters();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"id" | "visits">("id");
  const [selected, setSelected] = useState<string>();
  const completed = filtered(w.activities, f, true);
  const ids = [...new Set(completed.flatMap((a) => a.participants))];
  const rows = ids
    .filter((id) => id.toLowerCase().includes(q.toLowerCase()))
    .map((id) => {
      const visits = completed.filter((a) => a.participants.includes(id));
      const all = w.activities
        .filter((a) => a.status === "completed" && a.participants.includes(id))
        .sort((a, b) => a.date.localeCompare(b.date));
      return {
        id,
        visits: visits.length,
        first: all[0].date,
        last: all[all.length - 1].date,
      };
    })
    .sort((a, b) =>
      sort === "id" ? a.id.localeCompare(b.id) : b.visits - a.visits,
    );
  const safePage = Math.min(page, Math.max(1, Math.ceil(rows.length / 10)));
  const t = aggregate(completed);
  return (
    <>
      <PageHeader
        title="People Served"
        subtitle="Recognize repeat visits while protecting people's privacy."
      >
        <Button onClick={() => editActivity()}>
          <Plus size={16} />
          Record attendance
        </Button>
      </PageHeader>
      <FilterBar value={f} onChange={setF} />
      <div className="inline-stats">
        <div>
          <strong>{number(t.unique)}</strong>
          <span>Unique identified participants</span>
        </div>
        <div>
          <strong>{number(t.identified)}</strong>
          <span>Identified service visits</span>
        </div>
        <div>
          <strong>{number(t.repeat)}</strong>
          <span>Additional repeat visits</span>
        </div>
        <div>
          <strong>{number(t.anonymous)}</strong>
          <span>Anonymous attendance</span>
        </div>
      </div>
      <Panel
        title="Participant directory"
        subtitle="Visit counts follow your filters. First and most recent dates are all-time completed attendance."
        action={
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder="Search participant IDs…"
          />
        }
      >
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    <SortHeader onClick={() => setSort("id")}>
                      Participant ID
                    </SortHeader>
                  </th>
                  <th>First recorded attendance</th>
                  <th>Most recent attendance</th>
                  <th>
                    <SortHeader onClick={() => setSort("visits")}>
                      Visits in period
                    </SortHeader>
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.slice((safePage - 1) * 10, safePage * 10).map((row) => (
                  <tr key={row.id}>
                    <td>
                      <button
                        className="record-link mono"
                        onClick={() => setSelected(row.id)}
                      >
                        {row.id}
                      </button>
                    </td>
                    <td>{formatDate(row.first)}</td>
                    <td>{formatDate(row.last)}</td>
                    <td>{row.visits}</td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelected(row.id)}
                      >
                        History
                        <ArrowUpRight size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No identified participants"
            description="Add anonymous participant IDs to a completed activity to populate this directory."
          />
        )}
        <Pagination
          page={safePage}
          setPage={setPage}
          count={rows.length}
          size={10}
        />
      </Panel>
      <p className="muted-note">
        Anonymous attendance cannot be deduplicated and does not create
        participant records. Names and contact details are not collected.
      </p>
      {selected && (
        <Dialog
          open
          onOpenChange={() => setSelected(undefined)}
          title={selected}
          description="Completed attendance within your selected period and programs."
        >
          <div className="dialog-body">
            {completed
              .filter((a) => a.participants.includes(selected))
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((a) => (
                <div className="history-row" key={a.id}>
                  <div>
                    <strong>{a.title}</strong>
                    <small>
                      {w.programs.find((p) => p.id === a.programId)?.name}
                    </small>
                  </div>
                  <span>{formatDate(a.date)}</span>
                </div>
              ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
export function Volunteers() {
  const { w, commit, editActivity } = useWorkspace();
  const [f, setF] = useRecordFilters();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("active");
  const [editing, setEditing] = useState<Volunteer>();
  const [history, setHistory] = useState<Volunteer>();
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const rows = filtered(w.activities, f, true);
  const volunteers = w.volunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(q.toLowerCase()) &&
      (status === "all" || (status === "active" ? v.active : !v.active)),
  );
  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(volunteers.length / 10)),
  );
  const hours = (id: string) =>
    rows.reduce(
      (sum, a) =>
        sum +
        a.contributions
          .filter((c) => c.volunteerId === id)
          .reduce((s, c) => s + c.hours, 0),
      0,
    );
  return (
    <>
      <PageHeader
        title="Volunteers"
        subtitle="Track the people and time behind your work."
      >
        <Button variant="outline" onClick={() => editActivity()}>
          <HandHeart size={16} />
          Log hours
        </Button>
        <Button
          onClick={() => {
            setError("");
            setEditing({ id: uid(), name: "", active: true });
          }}
        >
          <Plus size={16} />
          Add volunteer
        </Button>
      </PageHeader>
      <FilterBar value={f} onChange={setF} />
      <div className="inline-stats">
        <div>
          <strong>{number(aggregate(rows).hours)}</strong>
          <span>Volunteer hours in period</span>
        </div>
        <div>
          <strong>
            {
              new Set(
                rows.flatMap((a) => a.contributions.map((c) => c.volunteerId)),
              ).size
            }
          </strong>
          <span>Contributing volunteers</span>
        </div>
        <div>
          <strong>{w.volunteers.filter((v) => v.active).length}</strong>
          <span>Active volunteers · all time</span>
        </div>
      </div>
      <Panel
        title="Volunteer directory"
        subtitle="Inactive volunteers keep their contribution history."
        action={
          <SearchBox
            value={q}
            onChange={setQ}
            placeholder="Search volunteers…"
          />
        }
      >
        <div className="table-tabs">
          {["active", "inactive", "all"].map((s) => (
            <button
              className={status === s ? "active" : ""}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              key={s}
            >
              {s[0].toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
        {volunteers.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Volunteer</th>
                  <th>Status</th>
                  <th>Hours in period</th>
                  <th>Activities in period</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {volunteers
                  .slice((safePage - 1) * 10, safePage * 10)
                  .map((v) => (
                    <tr key={v.id}>
                      <td>
                        <div className="person-cell">
                          <span className="avatar">
                            {v.name
                              .split(" ")
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <button
                            className="record-link"
                            onClick={() => setHistory(v)}
                          >
                            {v.name}
                          </button>
                        </div>
                      </td>
                      <td>
                        <Status value={v.active ? "Active" : "Inactive"} />
                      </td>
                      <td>{number(hours(v.id))} hrs</td>
                      <td>
                        {
                          rows.filter((a) =>
                            a.contributions.some((c) => c.volunteerId === v.id),
                          ).length
                        }
                      </td>
                      <td>
                        <div className="row-actions">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setHistory(v)}
                          >
                            History
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${v.name}`}
                            onClick={() => {
                              setEditing({ ...v });
                              setError("");
                            }}
                          >
                            <Pencil size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            title="No volunteers in this view"
            description="Add a volunteer or change the directory filters."
          />
        )}
        <Pagination
          page={safePage}
          setPage={setPage}
          count={volunteers.length}
          size={10}
        />
      </Panel>
      {editing && (
        <Dialog
          open
          onOpenChange={() => setEditing(undefined)}
          title={
            w.volunteers.some((v) => v.id === editing.id)
              ? "Edit volunteer"
              : "Add volunteer"
          }
          description="Only a display name is needed. No contact information is collected."
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const result = volunteerSchema.safeParse(editing);
              if (!result.success) {
                setError("Enter a volunteer name (up to 200 characters).");
                return;
              }
              setSaving(true);
              const ok = await commit(
                {
                  ...w,
                  volunteers: w.volunteers.some((v) => v.id === editing.id)
                    ? w.volunteers.map((v) =>
                        v.id === editing.id ? result.data : v,
                      )
                    : [...w.volunteers, result.data],
                },
                "Volunteer saved.",
              );
              setSaving(false);
              if (ok) setEditing(undefined);
            }}
          >
            <div className="dialog-body form-grid">
              {error && (
                <div role="alert" className="error-box full">
                  {error}
                </div>
              )}
              <label className="full">
                Display name
                <input
                  autoFocus
                  required
                  value={editing.name}
                  maxLength={200}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              <label className="checkbox-label full">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) =>
                    setEditing({ ...editing, active: e.target.checked })
                  }
                />
                Active volunteer
              </label>
              <p className="muted-note full">
                Turning this off prevents new assignments and retains all past
                hours.
              </p>
            </div>
            <footer className="dialog-footer">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </Button>
              <Button disabled={saving}>
                {saving ? "Saving…" : "Save volunteer"}
              </Button>
            </footer>
          </form>
        </Dialog>
      )}
      {history && (
        <Dialog
          open
          onOpenChange={() => setHistory(undefined)}
          title={history.name}
          description={`Contribution history for the selected filters · ${number(hours(history.id))} hours`}
        >
          <div className="dialog-body">
            {rows.filter((a) =>
              a.contributions.some((c) => c.volunteerId === history.id),
            ).length ? (
              rows
                .filter((a) =>
                  a.contributions.some((c) => c.volunteerId === history.id),
                )
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((a) => (
                  <div className="history-row" key={a.id}>
                    <div>
                      <strong>{a.title}</strong>
                      <small>
                        {formatDate(a.date)} ·{" "}
                        {w.programs.find((p) => p.id === a.programId)?.name}
                      </small>
                    </div>
                    <b>
                      {number(
                        a.contributions.find(
                          (c) => c.volunteerId === history.id,
                        )!.hours,
                      )}{" "}
                      hrs
                    </b>
                  </div>
                ))
            ) : (
              <Empty title="No contributions in this period" />
            )}
          </div>
        </Dialog>
      )}
    </>
  );
}
export function Supplies() {
  const { w, editActivity } = useWorkspace();
  const [f, setF] = useRecordFilters();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const activities = filtered(w.activities, f, true);
  const distributions = activities
    .flatMap((a) =>
      a.supplies.map((s, i) => ({ ...s, a, key: a.id + "-" + i })),
    )
    .filter((s) =>
      (s.item + " " + s.unit + " " + s.a.title)
        .toLowerCase()
        .includes(q.toLowerCase()),
    )
    .sort((a, b) => b.a.date.localeCompare(a.a.date));
  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(distributions.length / 10)),
  );
  return (
    <>
      <PageHeader
        title="Supplies"
        subtitle="See what went out to your community, item by item."
      >
        <Button onClick={() => editActivity()}>
          <Plus size={16} />
          Log distribution
        </Button>
      </PageHeader>
      <FilterBar value={f} onChange={setF} />
      <div className="supplies-page-grid">
        <Panel
          title="Distribution log"
          subtitle="Completed activities only. Edit the activity to update a distribution."
          action={
            <SearchBox
              value={q}
              onChange={setQ}
              placeholder="Search supplies…"
            />
          }
        >
          {distributions.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Quantity</th>
                    <th>Activity / program</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions
                    .slice((safePage - 1) * 10, safePage * 10)
                    .map((s) => (
                      <tr key={s.key}>
                        <td>
                          <strong>{s.item}</strong>
                        </td>
                        <td>
                          {number(s.quantity)} {s.unit}
                        </td>
                        <td>
                          <button
                            className="record-link"
                            onClick={() => editActivity(s.a.id)}
                          >
                            {s.a.title}
                          </button>
                          <small className="cell-secondary">
                            {
                              w.programs.find((p) => p.id === s.a.programId)
                                ?.name
                            }
                          </small>
                        </td>
                        <td className="nowrap">{formatDate(s.a.date)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No distributions found"
              description="Add supplies to a completed activity or adjust your filters."
            />
          )}
          <Pagination
            page={safePage}
            setPage={setPage}
            count={distributions.length}
            size={10}
          />
        </Panel>
        <Panel title="Period totals" subtitle="Grouped by item and unit">
          <SupplyList supplies={aggregate(activities).supplies} />
        </Panel>
      </div>
      <p className="muted-note">
        This is a distribution record, not an inventory balance. Different units
        are never combined into a single total.
      </p>
    </>
  );
}
