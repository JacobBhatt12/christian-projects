import { lazy, Suspense, useEffect, useRef, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useLocation,
} from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  HandHeart,
  Package,
  FileText,
  Settings as SettingsIcon,
  PanelLeftClose,
  PanelLeftOpen,
  Check,
  ChevronDown,
  ChevronRight,
  HardDrive,
  CircleHelp,
  X,
  ArrowUpRight,
  Menu,
} from "lucide-react";
import { Button } from "./components/ui/button";
import { Dialog } from "./components/ui/dialog";
import { WorkspaceContext, Empty } from "./shared";
import { loadWorkspace, saveWorkspace } from "./db";
import { type Workspace, workspaceSchema } from "./model";
const Dashboard = lazy(() =>
  Promise.all([
    import("./Dashboard"),
    new Promise<void>((resolve) =>
      window.setTimeout(resolve, DASHBOARD_LOAD_MS),
    ),
  ]).then(([module]) => ({ default: module.Dashboard })),
);
import { Activities, People, Volunteers, Supplies } from "./Records";
import { Reports, ReportBuilder } from "./Reports";
import { Settings } from "./Settings";
import { DashboardLoading, DASHBOARD_LOAD_MS } from "./DashboardLoading";
import { ThemeControl } from "./ThemeControl";
import { ActivityForm } from "./ActivityForm";
const nav = [
  { path: "/", label: "Dashboard", Icon: LayoutDashboard },
  { path: "/activities", label: "Activities", Icon: ClipboardList },
  { path: "/people", label: "People Served", Icon: Users },
  { path: "/volunteers", label: "Volunteers", Icon: HandHeart },
  { path: "/supplies", label: "Supplies", Icon: Package },
  { path: "/reports", label: "Reports", Icon: FileText },
];
function Shell() {
  const [w, setW] = useState<Workspace>();
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [help, setHelp] = useState(false);
  const [activity, setActivity] = useState<{ id?: string }>();
  const [saving, setSaving] = useState(false);
  const lock = useRef(false);
  const location = useLocation();
  useEffect(() => {
    void loadWorkspace()
      .then(setW)
      .catch(() =>
        setError(
          "GoodWorks could not open browser storage. Allow site data and reload to try again.",
        ),
      );
  }, []);
  useEffect(() => {
    setMobile(false);
    document.querySelector("main")?.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  async function commit(data: Workspace, message = "Saved.") {
    if (lock.current) return false;
    const parsed = workspaceSchema.safeParse(data);
    if (!parsed.success) {
      setError("Unable to save: " + parsed.error.issues[0].message);
      return false;
    }
    lock.current = true;
    setSaving(true);
    try {
      await saveWorkspace(parsed.data, w);
      setW(parsed.data);
      setToast(message);
      setError("");
      return true;
    } catch (err) {
      setError(
        err instanceof Error && err.message.startsWith("Another tab")
          ? err.message
          : "Changes could not be saved. Browser storage may be full or unavailable. Download a backup and try again.",
      );
      return false;
    } finally {
      lock.current = false;
      setSaving(false);
    }
  }
  if (!w && !error) return <DashboardLoading fullscreen />;
  if (!w)
    return (
      <div className="loading-shell">
        <h2>GoodWorks</h2>
        <p>{error || "Opening your local workspace…"}</p>
        {error && (
          <Button onClick={() => window.location.reload()}>Try again</Button>
        )}
      </div>
    );
  const page = location.pathname.startsWith("/settings")
    ? "Settings"
    : nav.find((n) => n.path !== "/" && location.pathname.startsWith(n.path))
        ?.label || "Dashboard";
  const sidebar = (
    <>
      <Link to="/settings" className="workspace-switch">
        <span className="org-avatar">
          {w.organization.name
            .split(" ")
            .map((n) => n[0])
            .slice(0, 2)
            .join("")}
        </span>
        <div>
          <strong>{w.organization.name}</strong>
          <small>Local workspace</small>
        </div>
        <ChevronDown size={14} />
      </Link>
      <div className="nav-label">WORKSPACE</div>
      <nav aria-label="Main navigation">
        {nav.map(({ path, label, Icon }) => (
          <NavLink
            to={path}
            key={path}
            end={path === "/"}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
            {label === "Activities" && <small>{w.activities.length}</small>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-card">
          <HardDrive size={18} />
          <strong>Made for your local work</strong>
          <p>
            Your data stays in this browser.
            <br />
            Keep it safe with a backup.
          </p>
          <Link to="/settings">
            Manage workspace
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <NavLink className="settings-link" to="/settings">
          <SettingsIcon size={18} />
          <span>Settings</span>
        </NavLink>
        <button className="help-link" onClick={() => setHelp(true)}>
          <CircleHelp size={18} />
          <span>Help & counting guide</span>
        </button>
      </div>
    </>
  );
  return (
    <WorkspaceContext.Provider
      value={{
        w,
        commit,
        notify: setToast,
        editActivity: (id) => setActivity({ id }),
      }}
    >
      <Suspense fallback={<DashboardLoading fullscreen />}>
        <div className={`app-shell ${collapsed ? "is-collapsed" : ""}`}>
          <aside className="sidebar">{sidebar}</aside>
          <div className="app-main">
            <header className="topbar">
              <div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="desktop-toggle"
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <PanelLeftOpen size={18} />
                  ) : (
                    <PanelLeftClose size={18} />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mobile-toggle"
                  aria-label="Open navigation"
                  onClick={() => setMobile(true)}
                >
                  <Menu size={20} />
                </Button>
                <span className="topbar-divider" />
                <span className="breadcrumb-root">Workspace</span>
                <ChevronRight size={13} />
                <span>{page}</span>
              </div>
              <div className="topbar-right">
                <ThemeControl />
                <span className="saved-state">
                  <span className="live-dot" />
                  {saving ? "Saving…" : "Saved in this browser"}
                </span>
                <span className="local-badge">
                  <HardDrive size={12} />
                  Local
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Help and counting definitions"
                  onClick={() => setHelp(true)}
                >
                  <CircleHelp size={18} />
                </Button>
              </div>
            </header>
            <main id="main-content">
              {w.demo && (
                <div className="demo-banner">
                  <span>
                    <span className="demo-label">DEMO WORKSPACE</span>
                    <span>Explore GoodWorks with fictional sample data.</span>
                  </span>
                  <Link to="/settings">
                    Make it yours
                    <ArrowRightSmall />
                  </Link>
                </div>
              )}
              {error && (
                <div className="error-box no-print" role="alert">
                  {error}
                  <button
                    aria-label="Dismiss error"
                    onClick={() => setError("")}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/people" element={<People />} />
                <Route path="/volunteers" element={<Volunteers />} />
                <Route path="/supplies" element={<Supplies />} />
                <Route path="/reports" element={<Reports />} />
                <Route
                  path="/reports/:id"
                  element={<ReportBuilder key={location.pathname} />}
                />
                <Route path="/settings" element={<Settings />} />
                <Route
                  path="*"
                  element={
                    <Empty title="Page not found">
                      <Button asChild>
                        <Link to="/">Go to dashboard</Link>
                      </Button>
                    </Empty>
                  }
                />
              </Routes>
            </main>
          </div>
        </div>
        {mobile && (
          <Dialog
            open
            drawer
            onOpenChange={setMobile}
            title="Navigation"
            description="GoodWorks local workspace"
          >
            <div className="mobile-nav">{sidebar}</div>
          </Dialog>
        )}
        {activity && (
          <ActivityForm
            activityId={activity.id}
            onClose={() => setActivity(undefined)}
          />
        )}
        <Dialog
          open={help}
          onOpenChange={setHelp}
          title="A little clarity on your counts"
          description="GoodWorks keeps identified participants and anonymous attendance separate."
        >
          <div className="dialog-body guide">
            <h3>One person. One reusable ID.</h3>
            <p>
              If P-001 attends three completed activities, you have{" "}
              <b>1 unique identified participant</b>, <b>3 identified visits</b>
              , and <b>2 additional repeat visits</b>. This applies across
              programs, too.
            </p>
            <h3>Anonymous visits stay separate.</h3>
            <p>
              Five attendees without IDs add five service visits and zero unique
              participants. Total service visits combine identified visits and
              anonymous attendance.
            </p>
            <h3>Count the whole reporting period.</h3>
            <p>
              Annual unique counts deduplicate IDs across the year. Never add
              monthly or program unique counts to get an organization-wide
              total. Draft activities are always excluded.
            </p>
            <h3>Your workspace is local.</h3>
            <p>
              Records are saved in this browser, not synced or shared. Export
              regular JSON backups from Settings. Donor-facing reports exclude
              participant-level records.
            </p>
          </div>
        </Dialog>
        {toast && (
          <div className="toast" role="status">
            <Check size={17} />
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={14} />
            </button>
          </div>
        )}
      </Suspense>
    </WorkspaceContext.Provider>
  );
}
function ArrowRightSmall() {
  return <ArrowUpRight size={14} />;
}
export default function App() {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Shell />
    </BrowserRouter>
  );
}
