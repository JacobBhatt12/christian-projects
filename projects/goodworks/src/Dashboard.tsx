import { useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link } from "react-router-dom";
import {
  Plus,
  ArrowUpRight,
  Users,
  Repeat2,
  HandHeart,
  ClipboardCheck,
  ArrowRight,
  FileText,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Button } from "./components/ui/button";
import {
  useWorkspace,
  PageHeader,
  FilterBar,
  Panel,
  InfoTip,
  SupplyList,
  Empty,
} from "./shared";
import {
  aggregate,
  filtered,
  monthRange,
  number,
  formatDate,
  localDate,
  type Filters,
} from "./model";
import { ActivityTable } from "./Records";
export function Dashboard() {
  const root = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const media = gsap.matchMedia();
    media.add(
      "(prefers-reduced-motion: no-preference)",
      () => {
        gsap.from(
          ".page-header, .filter-bar, .kpi, .chart-grid, .lower-grid, .dashboard-note",
          {
            y: 10,
            opacity: 0,
            duration: 0.3,
            stagger: 0.025,
            ease: "power3.out",
            clearProps: "transform,opacity",
          },
        );
      },
      root,
    );
    return () => media.revert();
  }, []);
  const { w, editActivity } = useWorkspace();
  const [f, setF] = useState<Filters>(monthRange());
  const rows = filtered(w.activities, f);
  const totals = aggregate(rows);
  const completed = rows.filter((a) => a.status === "completed");
  const daily = new Map<
    string,
    { date: string; identified: number; anonymous: number }
  >();
  const chartEnd = [...completed.map((a) => a.date), localDate()]
    .sort()
    .at(-1)!;
  const start = new Date(f.start + "T00:00:00Z");
  const end = new Date((f.end < chartEnd ? f.end : chartEnd) + "T00:00:00Z");
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const bucketDays = days > 3660 ? 365 : days > 366 ? 30 : days > 62 ? 7 : 1;
  const weekly = bucketDays > 1;
  const bucketKey = (date: string) =>
    new Date(
      start.getTime() +
        Math.floor(
          (Date.parse(date + "T00:00:00Z") - start.getTime()) /
            86400000 /
            bucketDays,
        ) *
          bucketDays *
          86400000,
    )
      .toISOString()
      .slice(0, 10);
  for (let i = 0; i < days; i += bucketDays) {
    const key = new Date(start.getTime() + i * 86400000)
      .toISOString()
      .slice(0, 10);
    daily.set(key, { date: key, identified: 0, anonymous: 0 });
  }
  for (const a of completed) {
    const row = daily.get(bucketKey(a.date));
    if (row) {
      row.identified += a.participants.length;
      row.anonymous += a.anonymous;
    }
  }
  const programHours = w.programs
    .filter((p) => !f.programs.length || f.programs.includes(p.id))
    .map((p) => ({
      name: p.name.replace("Community ", "").replace("Youth ", ""),
      fullName: p.name,
      color: ["#368366", "#c28837", "#547fb2", "#946c9d", "#c57861"][
        w.programs.findIndex((program) => program.id === p.id) % 5
      ],
      hours: aggregate(completed.filter((a) => a.programId === p.id)).hours,
    }));
  const kpis = [
    {
      label: "Unique people served",
      value: totals.unique,
      detail: totals.anonymous
        ? "Identified participants only"
        : "Distinct participant IDs",
      Icon: Users,
      tip: "Distinct participant IDs across completed activities and selected programs. Anonymous attendance is excluded.",
    },
    {
      label: "Total service visits",
      value: totals.visits,
      detail: `${number(totals.anonymous)} anonymous attendances`,
      Icon: Repeat2,
      tip: "Identified service visits plus anonymous attendance. A participant counts once per completed activity.",
    },
    {
      label: "Volunteer hours",
      value: totals.hours,
      detail: `${new Set(completed.flatMap((a) => a.contributions.map((c) => c.volunteerId))).size} volunteers contributed`,
      Icon: HandHeart,
      tip: "Hours contributed to completed activities in the selected period and programs.",
    },
    {
      label: "Completed activities",
      value: totals.completed,
      detail: `${rows.filter((a) => a.status === "draft").length} draft activities excluded`,
      Icon: ClipboardCheck,
      tip: "Only activities marked completed contribute to impact metrics.",
    },
  ];
  return (
    <div ref={root} className="dashboard-view">
      <PageHeader
        title="Dashboard"
        subtitle="A clear picture of your community impact."
      >
        <Button asChild variant="outline">
          <Link to="/reports">
            <FileText size={16} />
            Create report
          </Link>
        </Button>
        <Button onClick={() => editActivity()}>
          <Plus size={17} />
          Log activity
        </Button>
      </PageHeader>
      <FilterBar value={f} onChange={setF}>
        <span className="period-note">
          {formatDate(f.start)} – {formatDate(f.end)}
        </span>
      </FilterBar>
      <div className="kpi-grid">
        {kpis.map(({ label, value, detail, Icon, tip }) => (
          <section className="kpi" key={label}>
            <div className="kpi-top">
              <span>{label}</span>
              <Icon size={18} />
            </div>
            <div className="kpi-value">
              {number(value)}
              {label === "Volunteer hours" && <span>hrs</span>}
            </div>
            <div className="kpi-foot">
              <span>{detail}</span>
              <InfoTip text={tip} />
            </div>
          </section>
        ))}
      </div>
      <div className="chart-grid">
        <Panel
          title="Service visits over time"
          subtitle={
            weekly
              ? `Attendance in ${bucketDays}-day intervals`
              : "Daily attendance across completed activities"
          }
          action={
            <span className="subtle-badge">{number(totals.visits)} visits</span>
          }
        >
          <div className="chart-legend">
            <span>
              <i className="legend-dot green" />
              Identified visits
            </span>
            <span>
              <i className="legend-dot sage" />
              Anonymous attendance
            </span>
          </div>
          {completed.length ? (
            <div className="chart">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[...daily.values()]}
                  margin={{ left: -18, right: 15, top: 12, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 4"
                    vertical={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(s) =>
                      new Date(s + "T12:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    tickLine={false}
                    axisLine={false}
                    minTickGap={42}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "var(--muted)" }}
                  />
                  <Tooltip
                    labelFormatter={(s) => formatDate(String(s))}
                    contentStyle={{
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      fontSize: 12,
                    }}
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    name="Identified visits"
                    dataKey="identified"
                    stackId="1"
                    stroke="var(--chart-one)"
                    fill="var(--chart-one-fill)"
                    strokeWidth={2.5}
                  />
                  <Area
                    isAnimationActive={false}
                    type="monotone"
                    name="Anonymous attendance"
                    dataKey="anonymous"
                    stackId="1"
                    stroke="var(--chart-two)"
                    fill="var(--chart-two-fill)"
                    strokeWidth={1.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty
              title="Your impact starts here"
              description="Log a completed activity to see service visits over time."
            >
              <Button onClick={() => editActivity()}>
                <Plus size={16} />
                Log activity
              </Button>
            </Empty>
          )}
          <div className="panel-bottom">
            <Info size={14} />
            <span>
              Repeat visits are included. Anonymous attendance is counted
              separately.
            </span>
          </div>
        </Panel>
        <Panel
          title="Volunteer hours by program"
          subtitle="Time given to your community"
          action={<HandHeart size={18} className="muted" />}
        >
          <div className="hours-total">
            <strong>{number(totals.hours)}</strong>
            <span>total hours</span>
          </div>
          <div className="bar-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={programHours}
                layout="vertical"
                margin={{ top: 0, right: 30, bottom: 0, left: 2 }}
              >
                <CartesianGrid
                  horizontal={false}
                  strokeDasharray="3 4"
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--muted)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={92}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted)" }}
                />
                <Tooltip
                  formatter={(value) => [`${value} hours`, "Contributed"]}
                  contentStyle={{ borderRadius: 8, fontSize: 12 }}
                />
                <Bar
                  isAnimationActive={false}
                  dataKey="hours"
                  fill="#4f8e6f"
                  radius={[0, 3, 3, 0]}
                  barSize={15}
                >
                  {programHours.map((p) => (
                    <Cell key={p.fullName} fill={p.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>
      <div className="lower-grid">
        <Panel
          title="Recent activities"
          subtitle="The latest work recorded in this period"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link
                to={`/activities?start=${f.start}&end=${f.end}&program=${f.programs[0] || ""}`}
              >
                View all
                <ArrowUpRight size={15} />
              </Link>
            </Button>
          }
        >
          <ActivityTable
            rows={[...rows]
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 5)}
            compact
          />
        </Panel>
        <Panel
          title="Supplies distributed"
          subtitle="Every item, in its own unit"
          action={
            <Button asChild variant="ghost" size="icon">
              <Link
                to={`/supplies?start=${f.start}&end=${f.end}&program=${f.programs[0] || ""}`}
                aria-label="View supply distributions"
              >
                <ArrowUpRight size={18} />
              </Link>
            </Button>
          }
        >
          <SupplyList supplies={totals.supplies} />
        </Panel>
      </div>
      <div className="dashboard-note">
        <span>
          <span className="live-dot" />
          Figures reflect completed activities only.
        </span>
        <Link to="/reports">
          Turn your records into an impact report <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
