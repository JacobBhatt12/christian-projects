import { useState } from "react";
import {
  Plus,
  Trash2,
  Users,
  HandHeart,
  Package,
  ClipboardList,
  X,
} from "lucide-react";
import { Dialog } from "./components/ui/dialog";
import { Button } from "./components/ui/button";
import { useWorkspace } from "./shared";
import { activitySchema, localDate, uid, type Activity } from "./model";
export function ActivityForm({
  activityId,
  onClose,
}: {
  activityId?: string;
  onClose: () => void;
}) {
  const { w, commit } = useWorkspace();
  const existing = w.activities.find((a) => a.id === activityId);
  const [a, setA] = useState<Activity>(() =>
    existing
      ? structuredClone(existing)
      : {
          id: uid(),
          title: "",
          date: localDate(),
          programId: w.programs.find((p) => p.active)?.id || "",
          location: "",
          status: "completed",
          notes: "",
          participants: [],
          anonymous: 0,
          contributions: [],
          supplies: [],
        },
  );
  const [tab, setTab] = useState("Details");
  const [participant, setParticipant] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const update = (change: Partial<Activity>) => {
    setA((prev) => ({ ...prev, ...change }));
    setDirty(true);
  };
  const close = () => {
    if (!dirty || confirm("Discard unsaved activity changes?")) onClose();
  };
  const addParticipant = () => {
    const id = participant.trim().toUpperCase();
    if (!/^P-[A-Z0-9-]{1,30}$/.test(id)) {
      setError("Enter an anonymous ID such as P-001. Do not enter names.");
      return;
    }
    if (a.participants.includes(id)) {
      setError("This participant is already included in this activity.");
      return;
    }
    update({ participants: [...a.participants, id] });
    setParticipant("");
    setError("");
  };
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const result = activitySchema.safeParse(a);
    if (!result.success) {
      setError(
        result.error.issues
          .map((i) => `${i.path.join(" ")}: ${i.message}`)
          .join(" • "),
      );
      return;
    }
    if (participant.trim()) {
      setError("Add or clear the participant ID before saving.");
      setTab("Attendance");
      return;
    }
    setSaving(true);
    const ok = await commit(
      {
        ...w,
        activities: existing
          ? w.activities.map((row) => (row.id === a.id ? result.data : row))
          : [...w.activities, result.data],
      },
      existing ? "Activity updated." : "Activity logged.",
    );
    setSaving(false);
    if (ok) onClose();
  }
  const participantIds = [
    ...new Set(w.activities.flatMap((a) => a.participants)),
  ].sort();
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && close()}
      wide
      title={existing ? "Activity details" : "Log activity"}
      description="Record the work, attendance, and resources for one activity."
    >
      <form onSubmit={submit} className="activity-form">
        <div className="tabs" role="tablist" aria-label="Activity sections">
          {[
            ["Details", ClipboardList],
            ["Attendance", Users],
            ["Volunteers", HandHeart],
            ["Supplies", Package],
          ].map(([label, Icon]) => (
            <button
              key={label as string}
              type="button"
              role="tab"
              aria-selected={tab === label}
              onClick={() => setTab(label as string)}
              className={tab === label ? "active" : ""}
            >
              <Icon size={15} />
              {label as string}
            </button>
          ))}
        </div>
        <div className="dialog-body">
          {error && (
            <div className="error-box" role="alert">
              {error}
            </div>
          )}
          {tab === "Details" && (
            <div className="form-grid">
              <label className="full">
                Activity title
                <input
                  autoFocus
                  value={a.title}
                  onChange={(e) => update({ title: e.target.value })}
                  placeholder="e.g. Weekly pantry distribution"
                  maxLength={200}
                />
              </label>
              <label>
                Date
                <input
                  type="date"
                  value={a.date}
                  onChange={(e) => update({ date: e.target.value })}
                />
              </label>
              <label>
                Status
                <select
                  aria-label="Status"
                  value={a.status}
                  onChange={(e) =>
                    update({ status: e.target.value as Activity["status"] })
                  }
                >
                  <option value="completed">Completed</option>
                  <option value="draft">Draft</option>
                </select>
              </label>
              <label>
                Program
                <select
                  aria-label="Program"
                  value={a.programId}
                  onChange={(e) => update({ programId: e.target.value })}
                >
                  <option value="" disabled>
                    Select a program
                  </option>
                  {w.programs
                    .filter((p) => p.active || p.id === a.programId)
                    .map((p) => (
                      <option value={p.id} key={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Location <span className="optional">optional</span>
                <input
                  value={a.location}
                  maxLength={200}
                  onChange={(e) => update({ location: e.target.value })}
                  placeholder="Where did this take place?"
                />
              </label>
              <label className="full">
                Notes <span className="optional">optional</span>
                <textarea
                  rows={4}
                  value={a.notes}
                  onChange={(e) => update({ notes: e.target.value })}
                  placeholder="Operational notes. Please do not include sensitive personal details."
                />
              </label>
              <div className="muted-note full">
                Draft activities are saved for later and excluded from all
                impact totals.
              </div>
            </div>
          )}
          {tab === "Attendance" && (
            <>
              <h3>
                Identified participants{" "}
                <span className="count-chip">{a.participants.length}</span>
              </h3>
              <p className="muted">
                Reuse the same anonymous ID at every visit, including across
                programs.
              </p>
              <div className="inline-add">
                <input
                  aria-label="Participant ID"
                  list="participant-ids"
                  placeholder="P-001"
                  value={participant}
                  onChange={(e) => setParticipant(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addParticipant();
                    }
                  }}
                />
                <datalist id="participant-ids">
                  {participantIds.map((id) => (
                    <option key={id}>{id}</option>
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addParticipant}
                >
                  <Plus size={16} />
                  Add ID
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const id = `P-${uid().slice(0, 8).toUpperCase()}`;
                    update({ participants: [...a.participants, id] });
                    setError("");
                  }}
                >
                  Generate new ID
                </Button>
              </div>
              <div className="participant-chips">
                {a.participants.map((id) => (
                  <span key={id}>
                    {id}
                    <button
                      type="button"
                      aria-label={`Remove ${id}`}
                      onClick={() =>
                        update({
                          participants: a.participants.filter((p) => p !== id),
                        })
                      }
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <label className="anonymous-field">
                Anonymous attendance
                <input
                  aria-label="Anonymous attendance"
                  type="number"
                  min={0}
                  step={1}
                  value={a.anonymous}
                  onChange={(e) =>
                    update({
                      anonymous:
                        e.target.value === "" ? 0 : Number(e.target.value),
                    })
                  }
                />
                <small>
                  Additional visits without an ID. These are never included in
                  unique people counts.
                </small>
              </label>
            </>
          )}
          {tab === "Volunteers" && (
            <>
              <h3>Volunteer contributions</h3>
              <p className="muted">
                One entry per volunteer. Combine all their hours for this
                activity.
              </p>
              {a.contributions.map((c, i) => (
                <div className="contribution-row" key={i}>
                  <label>
                    Volunteer
                    <select
                      aria-label="Volunteer"
                      value={c.volunteerId}
                      onChange={(e) =>
                        update({
                          contributions: a.contributions.map((row, j) =>
                            i === j
                              ? { ...row, volunteerId: e.target.value }
                              : row,
                          ),
                        })
                      }
                    >
                      <option value="">Select volunteer</option>
                      {w.volunteers
                        .filter(
                          (v) =>
                            (v.active || v.id === c.volunteerId) &&
                            (!a.contributions.some(
                              (c) => c.volunteerId === v.id,
                            ) ||
                              v.id === c.volunteerId),
                        )
                        .map((v) => (
                          <option value={v.id} key={v.id}>
                            {v.name}
                            {!v.active ? " (inactive)" : ""}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Hours
                    <input
                      type="number"
                      min={0}
                      step="0.25"
                      value={c.hours}
                      onChange={(e) =>
                        update({
                          contributions: a.contributions.map((row, j) =>
                            i === j
                              ? { ...row, hours: Number(e.target.value) }
                              : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label="Remove contribution"
                    onClick={() =>
                      update({
                        contributions: a.contributions.filter(
                          (_, j) => j !== i,
                        ),
                      })
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  update({
                    contributions: [
                      ...a.contributions,
                      { volunteerId: "", hours: 0 },
                    ],
                  })
                }
              >
                <Plus size={16} />
                Add contribution
              </Button>
              <p className="muted-note">
                Manage volunteer names and active status on the Volunteers page.
              </p>
            </>
          )}
          {tab === "Supplies" && (
            <>
              <h3>Supplies distributed</h3>
              <p className="muted">
                Track distributions by item and unit. The date and program come
                from this activity.
              </p>
              {a.supplies.map((s, i) => (
                <div className="supply-form-row" key={i}>
                  <label>
                    Item
                    <input
                      value={s.item}
                      placeholder="Food parcels"
                      onChange={(e) =>
                        update({
                          supplies: a.supplies.map((row, j) =>
                            i === j ? { ...row, item: e.target.value } : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      value={s.quantity}
                      onChange={(e) =>
                        update({
                          supplies: a.supplies.map((row, j) =>
                            i === j
                              ? { ...row, quantity: Number(e.target.value) }
                              : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Unit
                    <input
                      value={s.unit}
                      placeholder="boxes"
                      onChange={(e) =>
                        update({
                          supplies: a.supplies.map((row, j) =>
                            i === j ? { ...row, unit: e.target.value } : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label="Remove supply"
                    onClick={() =>
                      update({ supplies: a.supplies.filter((_, j) => j !== i) })
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  update({
                    supplies: [
                      ...a.supplies,
                      { item: "", quantity: 1, unit: "" },
                    ],
                  })
                }
              >
                <Plus size={16} />
                Add distribution
              </Button>
            </>
          )}
        </div>
        <footer className="dialog-footer">
          <span className="muted">Saved only in this browser</span>
          <div>
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : existing ? "Save changes" : "Save activity"}
            </Button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
