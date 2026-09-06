"use client";

import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, ClipboardCheck, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { StatusLabel } from "@/components/ui/status-label";
import type { AssistanceResource, ResourceSubmission } from "@/lib/types";

type DashboardData = {
  submissions: ResourceSubmission[];
  resources: AssistanceResource[];
  source: "sample" | "supabase";
};

async function readJson(response: Response) {
  return (await response.json()) as { error?: string } & Partial<DashboardData>;
}

async function requestDashboard(signal?: AbortSignal) {
  const response = await fetch("/api/admin", { signal });
  if (response.status === 401) return { signedOut: true as const };
  const payload = await readJson(response);
  if (!response.ok || !payload.submissions || !payload.resources || !payload.source) {
    return { error: payload.error ?? "Could not load the review queue." };
  }
  return { data: payload as DashboardData };
}

function AdminSubmissionRow({
  submission,
  onUpdated,
}: {
  submission: ResourceSubmission;
  onUpdated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "submission",
        id: submission.id,
        status: formData.get("status"),
        reviewerNotes: formData.get("reviewerNotes"),
        edits: {
          organizationName: formData.get("organizationName"),
          description: formData.get("description"),
          eligibility: formData.get("eligibility"),
          hours: formData.get("hours"),
        },
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Update failed.");
      setSaving(false);
      return;
    }
    setSaving(false);
    onUpdated();
  }

  return (
    <article className="admin-record">
      <header>
        <div>
          <span className={`submission-status submission-${submission.status}`}>{submission.status.replace("_", " ")}</span>
          <h3>{submission.organizationName}</h3>
          <p>{submission.category} · submitted {new Date(submission.createdAt).toLocaleDateString()}</p>
        </div>
        <a href={`mailto:${submission.contactEmail}`}>{submission.contactName} · {submission.contactEmail}</a>
      </header>
      <form onSubmit={update} className="admin-edit-form">
        <label><span>Organization name</span><input name="organizationName" defaultValue={submission.organizationName} required /></label>
        <label className="full-column"><span>Description</span><textarea name="description" rows={3} defaultValue={submission.description} required /></label>
        <label className="full-column"><span>Eligibility wording</span><textarea name="eligibility" rows={3} defaultValue={submission.eligibility} required /></label>
        <label><span>Hours</span><textarea name="hours" rows={3} defaultValue={submission.hours} required /></label>
        <label><span>Reviewer notes</span><textarea name="reviewerNotes" rows={3} defaultValue={submission.reviewerNotes} /></label>
        <div className="admin-decision">
          <label><span>Decision</span>
            <select name="status" defaultValue={submission.status}>
              <option value="pending">Pending</option>
              <option value="approved">Approve and publish as unverified</option>
              <option value="changes_requested">Request changes</option>
              <option value="rejected">Reject</option>
            </select>
          </label>
          <button type="submit" className="button button-primary" disabled={saving}>
            <ClipboardCheck aria-hidden="true" size={18} /> {saving ? "Saving…" : "Save review"}
          </button>
        </div>
        {error ? <p className="field-error full-column" role="alert">{error}</p> : null}
      </form>
    </article>
  );
}

function AdminResourceRow({
  resource,
  onUpdated,
}: {
  resource: AssistanceResource;
  onUpdated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function verify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        entity: "resource",
        id: resource.id,
        action: "verify",
        method: formData.get("method"),
        notes: formData.get("notes"),
      }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Verification update failed.");
      setSaving(false);
      return;
    }
    setSaving(false);
    setMessage("Marked verified.");
    onUpdated();
  }

  return (
    <article className="verification-row">
      <div>
        <StatusLabel status={resource.verificationStatus} isSample={resource.isSample && resource.verificationStatus === "sample"} />
        <h3>{resource.organizationName}</h3>
        <p>{resource.location.city}, {resource.location.state} · last information date {resource.lastVerified}</p>
      </div>
      <form onSubmit={verify}>
        <label><span>Verification method</span><input name="method" required maxLength={200} placeholder="Phone call with program staff" /></label>
        <label><span>Notes <small>(optional)</small></span><input name="notes" maxLength={800} /></label>
        <button type="submit" className="button button-secondary" disabled={saving || resource.verificationStatus === "verified"}>
          <ShieldCheck aria-hidden="true" size={17} /> {resource.verificationStatus === "verified" ? "Verified" : saving ? "Saving…" : "Mark verified"}
        </button>
        <span className="admin-inline-message" aria-live="polite">{message}</span>
      </form>
    </article>
  );
}

export function AdminDashboard() {
  const [authState, setAuthState] = useState<"checking" | "signed-out" | "signed-in">("checking");
  const [data, setData] = useState<DashboardData | null>(null);
  const [message, setMessage] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");

  async function loadDashboard() {
    const result = await requestDashboard();
    if ("signedOut" in result) {
      setAuthState("signed-out");
      setData(null);
      return;
    }
    if ("error" in result) {
      setMessage(result.error ?? "Could not load the review queue.");
      setAuthState("signed-in");
      return;
    }
    setData(result.data);
    setAuthState("signed-in");
  }

  useEffect(() => {
    const controller = new AbortController();
    void requestDashboard(controller.signal).then((result) => {
      if ("signedOut" in result) {
        setAuthState("signed-out");
        setData(null);
      } else if ("error" in result) {
        setMessage(result.error ?? "Could not load the review queue.");
        setAuthState("signed-in");
      } else {
        setData(result.data);
        setAuthState("signed-in");
      }
    }).catch((error) => {
      if ((error as DOMException).name !== "AbortError") {
        setMessage("Could not load the review queue.");
        setAuthState("signed-in");
      }
    });
    return () => controller.abort();
  }, []);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: formData.get("password") }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(payload.error ?? "Sign-in failed.");
      return;
    }
    await loadDashboard();
  }

  async function signOut() {
    await fetch("/api/admin/session", { method: "DELETE" });
    setAuthState("signed-out");
    setData(null);
  }

  if (authState === "checking") {
    return <div className="admin-loading" aria-live="polite"><RefreshCw className="spin" aria-hidden="true" size={22} /> Checking admin access…</div>;
  }

  if (authState === "signed-out") {
    return (
      <form className="admin-login" onSubmit={signIn}>
        <ShieldCheck aria-hidden="true" size={30} />
        <h2>Reviewer sign-in</h2>
        <p>Admin access is separate from public search. Local setup details are in the README.</p>
        <label><span>Admin password</span><input type="password" name="password" autoComplete="current-password" required /></label>
        {message ? <p className="field-error" role="alert">{message}</p> : null}
        <button type="submit" className="button button-primary">Sign in</button>
      </form>
    );
  }

  const submissions = data?.submissions ?? [];
  const resources = data?.resources ?? [];
  const normalizedQuery = resourceQuery.trim().toLowerCase();
  const filteredResources = normalizedQuery
    ? resources.filter((resource) => `${resource.organizationName} ${resource.location.city} ${resource.category}`.toLowerCase().includes(normalizedQuery))
    : resources;

  return (
    <div className="admin-workspace">
      <div className="admin-toolbar">
        <p>{data?.source === "sample" ? "Local development store" : "Supabase connected"}</p>
        <div>
          <button type="button" className="text-action" onClick={() => void loadDashboard()}><RefreshCw aria-hidden="true" size={17} /> Refresh</button>
          <button type="button" className="text-action" onClick={signOut}><LogOut aria-hidden="true" size={17} /> Sign out</button>
        </div>
      </div>

      {message ? <p className="form-summary-error" role="alert">{message}</p> : null}

      <section className="admin-section" aria-labelledby="submissions-title">
        <div className="admin-section-heading">
          <div><span>Review queue</span><h2 id="submissions-title">Resource submissions</h2></div>
          <strong>{submissions.filter((item) => item.status === "pending").length} pending</strong>
        </div>
        {submissions.length > 0 ? (
          <div className="admin-record-list">
            {submissions.map((submission) => <AdminSubmissionRow key={submission.id} submission={submission} onUpdated={() => void loadDashboard()} />)}
          </div>
        ) : (
          <div className="admin-empty"><CheckCircle2 aria-hidden="true" size={26} /><h3>No submissions yet</h3><p>New suggestions will appear here for review.</p></div>
        )}
      </section>

      <section className="admin-section" aria-labelledby="verification-title">
        <div className="admin-section-heading verification-heading">
          <div><span>Information quality</span><h2 id="verification-title">Resource verification</h2></div>
          <label><span className="sr-only">Search resources</span><input type="search" value={resourceQuery} onChange={(event) => setResourceQuery(event.target.value)} placeholder="Search resources" /></label>
        </div>
        <div className="verification-list">
          {filteredResources.map((resource) => <AdminResourceRow key={resource.id} resource={resource} onUpdated={() => void loadDashboard()} />)}
        </div>
      </section>
    </div>
  );
}
