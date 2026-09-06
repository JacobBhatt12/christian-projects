import { createContext, useContext, useState, type ReactNode } from "react";
import {
  CalendarDays,
  Package,
  Info,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  monthRange,
  type Workspace,
  type Filters,
  number,
  type Totals,
} from "./model";
export const WorkspaceContext = createContext<{
  w: Workspace;
  commit: (data: Workspace, message?: string) => Promise<boolean>;
  notify: (message: string) => void;
  editActivity: (id?: string) => void;
}>(null!);
export const useWorkspace = () => useContext(WorkspaceContext);
export function PageHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        <h1 tabIndex={-1}>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="header-actions">{children}</div>
    </div>
  );
}
export function FilterBar({
  value,
  onChange,
  multi = false,
  children,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  multi?: boolean;
  children?: ReactNode;
}) {
  const { w } = useWorkspace();
  const [custom, setCustom] = useState(
    value.start.slice(8) !== "01" ||
      monthRange(value.start.slice(0, 7)).end !== value.end,
  );
  return (
    <div className="filter-bar">
      <div className="filter-group">
        <CalendarDays size={16} />
        <label className="sr-only" htmlFor="date-preset">
          Reporting period
        </label>
        <select
          id="date-preset"
          value={custom ? "custom" : value.start.slice(0, 7)}
          onChange={(e) => {
            if (e.target.value === "custom") setCustom(true);
            else {
              setCustom(false);
              onChange({
                ...monthRange(e.target.value),
                programs: value.programs,
              });
            }
          }}
        >
          {Array.from({ length: 13 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
            return (
              <option key={key} value={key}>
                {d.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
                {i === 0 ? " · This month" : ""}
              </option>
            );
          })}
          <option value="custom">Custom date range</option>
        </select>
      </div>
      {custom && (
        <>
          <label className="inline-label">
            From
            <input
              aria-label="Start date"
              type="date"
              value={value.start}
              max={value.end}
              onChange={(e) =>
                e.target.value && onChange({ ...value, start: e.target.value })
              }
            />
          </label>
          <label className="inline-label">
            To
            <input
              aria-label="End date"
              type="date"
              min={value.start}
              value={value.end}
              onChange={(e) =>
                e.target.value && onChange({ ...value, end: e.target.value })
              }
            />
          </label>
        </>
      )}
      <div className="filter-group">
        <SlidersHorizontal size={15} />
        {multi ? (
          <details className="program-picker">
            <summary>
              {value.programs.length
                ? `${value.programs.length} programs selected`
                : "All programs"}
            </summary>
            <div className="program-menu">
              <label>
                <input
                  type="checkbox"
                  checked={!value.programs.length}
                  onChange={() => onChange({ ...value, programs: [] })}
                />
                All programs
              </label>
              {w.programs.map((p) => (
                <label key={p.id}>
                  <input
                    type="checkbox"
                    checked={value.programs.includes(p.id)}
                    onChange={(e) =>
                      onChange({
                        ...value,
                        programs: e.target.checked
                          ? [...value.programs, p.id]
                          : value.programs.filter((id) => id !== p.id),
                      })
                    }
                  />
                  {p.name}
                </label>
              ))}
            </div>
          </details>
        ) : (
          <select
            aria-label="Filter by program"
            value={value.programs[0] || ""}
            onChange={(e) =>
              onChange({
                ...value,
                programs: e.target.value ? [e.target.value] : [],
              })
            }
          >
            <option value="">All programs</option>
            {w.programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {!p.active ? " (archived)" : ""}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className="filter-extra">{children}</div>
      {value.start > value.end && (
        <span className="error">Start date must be before end date.</span>
      )}
    </div>
  );
}
export function SearchBox({
  value,
  onChange,
  placeholder = "Search records…",
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="search-box">
      <Search size={16} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
export function Empty({
  title = "No records found",
  description = "Try a different period or program filter.",
  children,
}: {
  title?: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Search size={24} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function Panel({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <div>
          <h2>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
export function InfoTip({ text }: { text: string }) {
  return (
    <span className="info-tip" tabIndex={0} aria-label={text}>
      <Info size={14} />
      <span role="tooltip">{text}</span>
    </span>
  );
}
export function Status({ value }: { value: string }) {
  return (
    <span
      className={`badge ${value === "completed" || value === "Active" ? "badge-green" : "badge-neutral"}`}
    >
      <span />
      {value === "completed"
        ? "Completed"
        : value === "draft"
          ? "Draft"
          : value}
    </span>
  );
}
export function ProgramTag({
  name,
  index = 0,
}: {
  name: string;
  index?: number;
}) {
  return (
    <span className="program-tag">
      <i className={`program-dot dot-${index % 5}`} />
      {name}
    </span>
  );
}
export function Pagination({
  page,
  setPage,
  count,
  size = 8,
}: {
  page: number;
  setPage: (p: number) => void;
  count: number;
  size?: number;
}) {
  const pages = Math.max(1, Math.ceil(count / size));
  return (
    <div className="pagination">
      <span>
        {count
          ? `${(page - 1) * size + 1}–${Math.min(page * size, count)} of ${count} records`
          : "0 records"}
      </span>
      <div>
        <Button
          variant="outline"
          size="icon"
          aria-label="Previous page"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          <ChevronLeft size={15} />
        </Button>
        <span>
          Page {page} of {pages}
        </span>
        <Button
          variant="outline"
          size="icon"
          aria-label="Next page"
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
        >
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
export function SortHeader({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="sort-header" onClick={onClick}>
      {children}
      <ArrowUpDown size={12} />
    </button>
  );
}
export function SupplyList({ supplies }: { supplies: Totals["supplies"] }) {
  return supplies.length ? (
    <div className="supply-list">
      {supplies.map((s, i) => (
        <div className="supply-row" key={`${s.item}-${s.unit}`}>
          <div className="supply-label">
            <span className={`supply-symbol dot-${i % 5}`} aria-hidden="true">
              <Package size={17} />
            </span>
            <div>
              <strong>{s.item}</strong>
              <small>Distributed</small>
            </div>
          </div>
          <span>
            <b>{number(s.quantity)}</b> <small>{s.unit}</small>
          </span>
        </div>
      ))}
    </div>
  ) : (
    <Empty
      title="No supplies distributed"
      description="Add distributions when logging an activity."
    />
  );
}
