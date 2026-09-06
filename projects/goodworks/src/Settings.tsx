import { useState, useRef } from "react";
import {
  Save,
  Plus,
  Download,
  Upload,
  Database,
  ShieldCheck,
  FlaskConical,
  Pencil,
  Archive,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { PageHeader, Panel, Status, useWorkspace } from "./shared";
import {
  download,
  workspaceSchema,
  uid,
  type Program,
  type Workspace,
} from "./model";
import { seed } from "./db";
export function Settings() {
  const { w, commit, notify } = useWorkspace();
  const [org, setOrg] = useState({ ...w.organization });
  const [editing, setEditing] = useState<Program>();
  const [error, setError] = useState("");
  const [restore, setRestore] = useState<Workspace>();
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  async function readBackup(f: File) {
    if (f.size > 25 * 1024 * 1024) {
      setError("Backup files must be smaller than 25 MB.");
      return;
    }
    try {
      const parsed = workspaceSchema.safeParse(JSON.parse(await f.text()));
      if (!parsed.success) {
        setError(
          "Invalid GoodWorks backup: " +
            parsed.error.issues
              .slice(0, 3)
              .map((i) => i.message)
              .join(" · "),
        );
        return;
      }
      setError("");
      setRestore(parsed.data);
    } catch {
      setError(
        "This file is not valid JSON. Choose a GoodWorks workspace backup.",
      );
    }
  }
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Make this workspace yours and keep a copy of your data."
      />
      <div className="settings-grid">
        <div>
          <Panel
            title="Organization"
            subtitle="Used in the heading and summary of new reports."
          >
            <form
              className="settings-body form-grid"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!org.name.trim()) {
                  setError("Organization name is required.");
                  return;
                }
                setBusy(true);
                await commit(
                  { ...w, organization: { ...org, name: org.name.trim() } },
                  "Organization settings saved.",
                );
                setBusy(false);
              }}
            >
              <label className="full">
                Organization name
                <input
                  value={org.name}
                  required
                  maxLength={200}
                  onChange={(e) => setOrg({ ...org, name: e.target.value })}
                />
              </label>
              <label className="full">
                Organization type
                <select
                  value={org.type}
                  onChange={(e) =>
                    setOrg({
                      ...org,
                      type: e.target.value as Workspace["organization"]["type"],
                    })
                  }
                >
                  {["Nonprofit", "Church", "Christian ministry", "Other"].map(
                    (t) => (
                      <option key={t}>{t}</option>
                    ),
                  )}
                </select>
              </label>
              <div className="full">
                <Button disabled={busy}>
                  <Save size={15} />
                  Save settings
                </Button>
              </div>
            </form>
          </Panel>
          <Panel
            title="Programs"
            subtitle="Archive a program to retain its activity history."
            action={
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditing({ id: uid(), name: "", active: true });
                  setError("");
                }}
              >
                <Plus size={14} />
                Add program
              </Button>
            }
          >
            <div className="settings-body program-settings">
              {w.programs.map((p) => (
                <div key={p.id}>
                  <div>
                    <strong>{p.name}</strong>
                    <Status value={p.active ? "Active" : "Archived"} />
                  </div>
                  <div>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Rename ${p.name}`}
                      onClick={() => {
                        setEditing({ ...p });
                        setError("");
                      }}
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`${p.active ? "Archive" : "Reactivate"} ${p.name}`}
                      onClick={async () => {
                        if (
                          !p.active ||
                          confirm(
                            `Archive ${p.name}? Historical activities will be retained.`,
                          )
                        )
                          await commit(
                            {
                              ...w,
                              programs: w.programs.map((row) =>
                                row.id === p.id
                                  ? { ...row, active: !row.active }
                                  : row,
                              ),
                            },
                            "Program updated.",
                          );
                      }}
                    >
                      {p.active ? (
                        <Archive size={15} />
                      ) : (
                        <RotateCcw size={15} />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <div>
          <Panel
            title="Local workspace"
            action={<ShieldCheck size={20} className="accent" />}
          >
            <div className="settings-body">
              <div className="local-state">
                <span className="live-dot" />
                Data saved in this browser
              </div>
              <p>
                GoodWorks stores your records in this browser using IndexedDB.
                They are not synced, shared with other staff, or sent to a
                server.
              </p>
              <p>
                Clearing browser data, changing browsers, or losing this device
                can remove your workspace. Download backups regularly.
              </p>
              <div className="workspace-counts">
                <span>{w.activities.length} activities</span>
                <span>{w.volunteers.length} volunteers</span>
                <span>{w.reports.length} reports</span>
              </div>
            </div>
          </Panel>
          <Panel
            title="Backup & restore"
            subtitle="A backup includes all records and report drafts."
          >
            <div className="settings-body stack">
              <Button
                variant="outline"
                onClick={() => {
                  download(
                    `goodworks-backup-${new Date().toISOString().slice(0, 10)}.json`,
                    JSON.stringify(w, null, 2),
                    "application/json",
                  );
                  notify("Workspace backup downloaded.");
                }}
              >
                <Download size={16} />
                Download JSON backup
              </Button>
              <Button variant="outline" onClick={() => file.current?.click()}>
                <Upload size={16} />
                Restore from backup
              </Button>
              <input
                ref={file}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                aria-label="Restore workspace file"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void readBackup(f);
                  e.target.value = "";
                }}
              />
              <p className="muted-note">
                Restore replaces this entire workspace. You will review the file
                before confirming. Backups include anonymous participant IDs.
              </p>
            </div>
          </Panel>
          <Panel
            title="Sample data"
            action={<FlaskConical size={18} className="muted" />}
          >
            <div className="settings-body stack">
              <p>
                {w.demo
                  ? "You are exploring a fictional demo workspace."
                  : "You are using your own local workspace."}
              </p>
              <Button
                variant="outline"
                onClick={async () => {
                  if (
                    confirm(
                      "Replace all current data with fictional sample data? Download a backup first if you want to keep your records.",
                    )
                  ) {
                    const next = seed();
                    if (await commit(next, "Sample workspace loaded."))
                      setOrg(next.organization);
                  }
                }}
              >
                <Database size={16} />
                Load sample workspace
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  if (
                    confirm(
                      "Start an empty workspace? This deletes all activities, volunteers, and reports. Organization settings and programs will be retained. Download a backup first.",
                    )
                  )
                    await commit(
                      {
                        ...w,
                        demo: false,
                        activities: [],
                        volunteers: [],
                        reports: [],
                      },
                      "Empty local workspace ready.",
                    );
                }}
              >
                <Trash2 size={16} />
                Start empty workspace
              </Button>
            </div>
          </Panel>
        </div>
      </div>
      {error && !editing && (
        <div className="error-box" role="alert">
          {error}
        </div>
      )}
      {editing && (
        <Dialog
          open
          onOpenChange={() => setEditing(undefined)}
          title={
            w.programs.some((p) => p.id === editing.id)
              ? "Edit program"
              : "Add program"
          }
          description="Use a short, recognizable name for your work."
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const name = editing.name.trim();
              if (
                !name ||
                w.programs.some(
                  (p) =>
                    p.id !== editing.id &&
                    p.name.toLowerCase() === name.toLowerCase(),
                )
              ) {
                setError("Enter a unique program name.");
                return;
              }
              setBusy(true);
              const p = { ...editing, name };
              const ok = await commit(
                {
                  ...w,
                  programs: w.programs.some((row) => row.id === p.id)
                    ? w.programs.map((row) => (row.id === p.id ? p : row))
                    : [...w.programs, p],
                },
                "Program saved.",
              );
              setBusy(false);
              if (ok) setEditing(undefined);
            }}
          >
            <div className="dialog-body">
              <label>
                Program name
                <input
                  autoFocus
                  required
                  maxLength={200}
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              {error && (
                <p className="error" role="alert">
                  {error}
                </p>
              )}
            </div>
            <footer className="dialog-footer">
              <Button
                variant="outline"
                type="button"
                onClick={() => setEditing(undefined)}
              >
                Cancel
              </Button>
              <Button disabled={busy}>Save program</Button>
            </footer>
          </form>
        </Dialog>
      )}
      {restore && (
        <Dialog
          open
          onOpenChange={() => setRestore(undefined)}
          title="Replace local workspace?"
          description="This action replaces all current records. Download a backup first if you need to keep them."
        >
          <div className="dialog-body">
            <h3>{restore.organization.name}</h3>
            <div className="restore-summary">
              <span>{restore.activities.length} activities</span>
              <span>{restore.volunteers.length} volunteers</span>
              <span>{restore.programs.length} programs</span>
              <span>{restore.reports.length} report drafts</span>
            </div>
            <p>File format and record references passed validation.</p>
            <Button
              variant="outline"
              onClick={() =>
                download(
                  "goodworks-before-restore.json",
                  JSON.stringify(w, null, 2),
                  "application/json",
                )
              }
            >
              <Download size={16} />
              Back up current data
            </Button>
          </div>
          <footer className="dialog-footer">
            <Button variant="outline" onClick={() => setRestore(undefined)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                const ok = await commit(restore, "Workspace restored.");
                setBusy(false);
                if (ok) {
                  setOrg(restore.organization);
                  setRestore(undefined);
                }
              }}
            >
              Replace workspace
            </Button>
          </footer>
        </Dialog>
      )}
    </>
  );
}
