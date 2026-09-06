import { useState } from "react";
import {
  useNavigate,
  useParams,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  Plus,
  FileText,
  ArrowLeft,
  Download,
  Printer,
  RefreshCw,
  Save,
  Trash2,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  PageHeader,
  FilterBar,
  Panel,
  Empty,
  useWorkspace,
  SearchBox,
} from "./shared";
import {
  createReport,
  refreshReport,
  monthRange,
  formatDate,
  number,
  methodology,
  reportCSV,
  download,
  type Report,
  type Filters,
} from "./model";
export function Reports() {
  const { w, commit } = useWorkspace();
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const rows = w.reports
    .filter((r) => r.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Turn accurate records into reports you can stand behind."
      >
        <Button asChild>
          <Link to="/reports/new">
            <Plus size={16} />
            Create report
          </Link>
        </Button>
      </PageHeader>
      <div className="report-explainer">
        <div className="report-icon">
          <FileText size={22} />
        </div>
        <div>
          <h3>Your work, ready to share.</h3>
          <p>
            Choose a period, review the numbers, and add your perspective. Saved
            reports keep a snapshot of their figures.
          </p>
        </div>
        <span className="subtle-badge">CSV & print to PDF</span>
      </div>
      <Panel
        title="Saved report drafts"
        subtitle={`${rows.length} reports saved in this browser`}
        action={
          <SearchBox value={q} onChange={setQ} placeholder="Search reports…" />
        }
      >
        {rows.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Reporting period</th>
                  <th>Snapshot generated</th>
                  <th>Activities</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <button
                        className="record-link"
                        onClick={() => navigate(`/reports/${r.id}`)}
                      >
                        {r.title}
                      </button>
                      <small className="cell-secondary">{r.organization}</small>
                    </td>
                    <td>
                      {formatDate(r.filters.start)} –{" "}
                      {formatDate(r.filters.end)}
                    </td>
                    <td>{new Date(r.generatedAt).toLocaleDateString()}</td>
                    <td>{r.totals.completed}</td>
                    <td>
                      <div className="row-actions">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/reports/${r.id}`)}
                        >
                          Open
                          <ArrowRight size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Delete ${r.title}`}
                          onClick={async () => {
                            if (confirm("Delete this saved report draft?"))
                              await commit(
                                {
                                  ...w,
                                  reports: w.reports.filter(
                                    (row) => row.id !== r.id,
                                  ),
                                },
                                "Report deleted.",
                              );
                          }}
                        >
                          <Trash2 size={15} />
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
            title="Your first impact report starts here"
            description="Build a report from completed activities. Review every number before sharing."
          >
            <Button asChild>
              <Link to="/reports/new">
                <Plus size={16} />
                Create report
              </Link>
            </Button>
          </Empty>
        )}
      </Panel>
    </>
  );
}
export function ReportBuilder() {
  const { w, commit, notify } = useWorkspace();
  const { id } = useParams();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const existing = w.reports.find((r) => r.id === id);
  const [r, setR] = useState<Report | undefined>(() =>
    existing ? structuredClone(existing) : undefined,
  );
  const [f, setF] = useState<Filters>(() => existing?.filters || monthRange());
  const [editing, setEditing] = useState(params.get("view") !== "print");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  if (id && id !== "new" && !existing && !r)
    return (
      <Empty
        title="Report not found"
        description="This report may have been deleted or replaced by a backup."
      >
        <Button asChild>
          <Link to="/reports">Back to reports</Link>
        </Button>
      </Empty>
    );
  function generate() {
    setR(createReport(w, f));
    setDirty(true);
  }
  async function save() {
    if (!r) return;
    setSaving(true);
    const ok = await commit(
      {
        ...w,
        reports: w.reports.some((row) => row.id === r.id)
          ? w.reports.map((row) => (row.id === r.id ? r : row))
          : [...w.reports, r],
      },
      "Report draft saved with a stable snapshot.",
    );
    setSaving(false);
    if (ok) {
      setDirty(false);
      navigate(`/reports/${r.id}`, { replace: true });
    }
  }
  function refresh() {
    if (!r) return;
    if (
      !confirm(
        "Refresh this snapshot from current activity records? Edited narrative text will be preserved. Save the draft afterward to keep these figures.",
      )
    )
      return;
    setR(refreshReport(r, w, f));
    setDirty(true);
    notify(
      "Figures refreshed. Review your narrative against the updated numbers.",
    );
  }
  function change(
    key: "summary" | "highlights" | "challenges" | "nextSteps" | "title",
    value: string,
  ) {
    if (r) {
      setR({ ...r, [key]: value });
      setDirty(true);
    }
  }
  return (
    <>
      <div className="no-print">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            if (!dirty || confirm("Leave without saving report changes?"))
              navigate("/reports");
          }}
        >
          <ArrowLeft size={15} />
          All reports
        </Button>
        <PageHeader
          title={r ? "Impact report" : "Create an impact report"}
          subtitle={
            r
              ? `${dirty ? "Unsaved changes · " : ""}Snapshot generated ${new Date(r.generatedAt).toLocaleString()}`
              : "Start with a reporting period and the programs to include."
          }
        >
          {r && (
            <>
              <Button
                variant="outline"
                onClick={() => download("goodworks-report.csv", reportCSV(r))}
              >
                <Download size={16} />
                CSV
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer size={16} />
                Print / PDF
              </Button>
              <Button onClick={save} disabled={saving || !r.title.trim()}>
                <Save size={16} />
                {saving ? "Saving…" : "Save draft"}
              </Button>
            </>
          )}
        </PageHeader>
        <div className="report-steps">
          <span className="active">
            <b>{r ? <Check size={12} /> : "1"}</b>Select scope
          </span>
          <span className={r ? "active" : ""}>
            <b>2</b>Review & write
          </span>
          <span>
            <b>3</b>Save & export
          </span>
        </div>
        <FilterBar value={f} onChange={setF} multi>
          {r ? (
            <Button
              size="sm"
              variant="outline"
              onClick={refresh}
              disabled={f.start > f.end}
            >
              <RefreshCw size={14} />
              Refresh figures
            </Button>
          ) : (
            <Button
              onClick={generate}
              disabled={!f.start || !f.end || f.start > f.end}
            >
              Preview report
              <ArrowRight size={16} />
            </Button>
          )}
        </FilterBar>
        {r && JSON.stringify(f) !== JSON.stringify(r.filters) && (
          <p className="notice">
            The selected filters differ from this snapshot. Refresh figures to
            apply them.
          </p>
        )}
        {r && (
          <div className="table-tabs report-tabs">
            <button
              className={editing ? "active" : ""}
              onClick={() => setEditing(true)}
            >
              Edit narrative
            </button>
            <button
              className={!editing ? "active" : ""}
              onClick={() => setEditing(false)}
            >
              Print preview
            </button>
          </div>
        )}
      </div>
      {!r ? (
        <Panel title="Accurate by design" subtitle="Your report will include">
          <div className="report-includes">
            <p>
              <Check size={16} />
              Deduplicated identified participants and separate anonymous
              attendance
            </p>
            <p>
              <Check size={16} />
              Service visits, volunteer hours, and completed activities
            </p>
            <p>
              <Check size={16} />
              Program breakdowns and supplies grouped by item and unit
            </p>
            <p>
              <Check size={16} />A factual starter summary and your own
              narrative
            </p>
            <p>
              <Check size={16} />
              Counting methodology, with no participant-level records
            </p>
          </div>
        </Panel>
      ) : (
        <article className="report-paper">
          <header className="report-document-header">
            <p className="eyebrow">{r.organization}</p>
            {editing ? (
              <input
                aria-label="Report title"
                className="report-title-input no-print"
                maxLength={200}
                value={r.title}
                onChange={(e) => change("title", e.target.value)}
              />
            ) : null}
            <h1 className={editing ? "print-only" : ""}>{r.title}</h1>
            <p>
              {formatDate(r.filters.start)} – {formatDate(r.filters.end)}
            </p>
            <p className="muted">{r.programNames.join(" · ")}</p>
          </header>
          <ReportNarrative
            title="Executive summary"
            value={r.summary}
            editing={editing}
            onChange={(v) => change("summary", v)}
          />
          <section>
            <h2>Impact at a glance</h2>
            <div className="report-metrics">
              {[
                ["Unique identified participants", r.totals.unique],
                ["Total service visits", r.totals.visits],
                ["Additional repeat visits", r.totals.repeat],
                ["Anonymous attendance", r.totals.anonymous],
                ["Volunteer hours", r.totals.hours],
                ["Completed activities", r.totals.completed],
              ].map(([label, n]) => (
                <div key={label}>
                  <strong>{number(Number(n))}</strong>
                  <span>{label}</span>
                </div>
              ))}
            </div>
            <p className="method-note">
              {number(r.totals.identified)} identified service visits +{" "}
              {number(r.totals.anonymous)} anonymous attendance ={" "}
              {number(r.totals.visits)} total visits. Unique counts exclude
              anonymous attendance.
            </p>
          </section>
          <section>
            <h2>Program breakdown</h2>
            <div className="table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Program</th>
                    <th>Unique identified</th>
                    <th>Service visits</th>
                    <th>Anonymous</th>
                    <th>Vol. hours</th>
                    <th>Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {r.breakdown.map((p) => (
                    <tr key={p.program}>
                      <td>{p.program}</td>
                      <td>{number(p.totals.unique)}</td>
                      <td>{number(p.totals.visits)}</td>
                      <td>{number(p.totals.anonymous)}</td>
                      <td>{number(p.totals.hours)}</td>
                      <td>{p.totals.completed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="method-note">
              Participants may attend more than one program. Program unique
              counts must not be added together.
            </p>
          </section>
          <section>
            <h2>Supplies distributed</h2>
            {r.totals.supplies.length ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {r.totals.supplies.map((s) => (
                    <tr key={s.item + s.unit}>
                      <td>{s.item}</td>
                      <td>{s.unit}</td>
                      <td>{number(s.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No supply distributions recorded in this period.</p>
            )}
          </section>
          <ReportNarrative
            title="Highlights"
            value={r.highlights}
            editing={editing}
            onChange={(v) => change("highlights", v)}
            placeholder="Describe documented highlights. Avoid claims that your records cannot support."
          />
          <ReportNarrative
            title="Challenges"
            value={r.challenges}
            editing={editing}
            onChange={(v) => change("challenges", v)}
            placeholder="What challenges did your team encounter?"
          />
          <ReportNarrative
            title="Next steps"
            value={r.nextSteps}
            editing={editing}
            onChange={(v) => change("nextSteps", v)}
            placeholder="What will your team focus on next?"
          />
          <section className="methodology">
            <h2>Counting methodology</h2>
            <p>{methodology}</p>
          </section>
          <footer className="report-footer">
            Prepared with GoodWorks · Snapshot:{" "}
            {new Date(r.generatedAt).toLocaleString()}
            {r.demo && <span>Fictional demo workspace</span>}
          </footer>
        </article>
      )}
    </>
  );
}
function ReportNarrative({
  title,
  value,
  editing,
  onChange,
  placeholder,
}: {
  title: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <section className={!value ? "empty-narrative" : ""}>
      <h2>{title}</h2>
      {editing && (
        <textarea
          className="no-print"
          aria-label={title}
          value={value}
          rows={title === "Executive summary" ? 4 : 3}
          maxLength={20000}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
      <p className={editing ? "print-only narrative-text" : "narrative-text"}>
        {value || "No narrative provided."}
      </p>
    </section>
  );
}
