import { useCallback, useEffect, useRef, useState } from "react";
import {
  Search,
  RefreshCw,
  Terminal,
  AlertTriangle,
  Info,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import useLiveLogs from "../hooks/useLiveLogs";
import LogDetailsPanel from "../components/logs/LogDetailsPanel";

const severityStyles = {
  DEBUG: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  INFO: "bg-accent/10 text-accent border-accent/20",
  WARN: "bg-warning/10 text-warning border-warning/20",
  ERROR: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  FATAL: "bg-danger/10 text-danger border-danger/20"
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

function LogsExplorer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("sentinel_token");
  const { liveLogs } = useLiveLogs(token);
  const hasLoadedRef = useRef(false);

  // Wait until the user stops typing
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search.trim());
    setPage(1);
  }, 400);

  return () => clearTimeout(timer);
}, [search]);


const fetchLogs = useCallback(async (manual = false) => {
  if (manual) {
    setRefreshing(true);
  } else if (!hasLoadedRef.current) {
    setLoading(true);
  }

  try {
    setError("");

    const response = await api.get("/logs", {
      params: {
        page,
        limit: 20,
        ...(level && { level }),
        ...(debouncedSearch && { search: debouncedSearch })
      }
    });

    setLogs(response.data.logs || []);
    setTotalPages(response.data.totalPages || 1);
  } catch (err) {
    console.error("Logs fetch error:", err);

    setError(
      err.response?.data?.message || "Unable to load logs."
    );
  } finally {
    setLoading(false);
    setRefreshing(false);
    hasLoadedRef.current = true;
  }
}, [page, level, debouncedSearch]);

// Fetch logs whenever page or filters change
useEffect(() => {
  fetchLogs();
}, [fetchLogs]);


// Add incoming live logs to the table
useEffect(() => {
  if (!liveLogs.length || page !== 1) return;

  const matchingLogs = liveLogs
    .map((log) => ({
      ...log,
      _id: log.logId || log._id
    }))
    .filter((log) => {
      const matchesLevel = !level || log.level === level;

      const matchesSearch =
        !debouncedSearch ||
        log.message?.toLowerCase().includes(debouncedSearch.toLowerCase());

      return matchesLevel && matchesSearch;
    });

  setLogs((previousLogs) => {
    const existingIds = new Set(
      previousLogs.map((log) => String(log._id))
    );

    const newLogs = matchingLogs.filter(
      (log) => !existingIds.has(String(log._id))
    );

    return [...newLogs, ...previousLogs].sort(
    (a, b) =>
      new Date(b.createdAt || b.timestamp).getTime() -
      new Date(a.createdAt || a.timestamp).getTime()
  ).slice(0, 20);
  });

}, [liveLogs, page, level, debouncedSearch]);


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <section>
          <div className="mb-3 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-secondary">
              Observability
            </span>
          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Logs Explorer
              </h1>
              <p className="mt-2 text-sm text-secondary">
                Search, filter and investigate events from your applications.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
              <span className="text-xs font-medium text-success">
                Live stream ready
              </span>
            </div>
          </div>
        </section>

       
{/* Logs toolbar */}
<section className="rounded-xl border border-border bg-surface p-4">
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <div className="relative flex-1">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
      />

      <input
        type="text"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        placeholder="Search logs by message..."
        className="h-10 w-full rounded-lg border border-border bg-canvas pl-10 pr-4 text-sm text-primary outline-none placeholder:text-muted focus:border-accent"
      />
    </div>

    <div className="flex flex-wrap items-center gap-2">
      <select
        value={level}
        onChange={(e) => {
          setLevel(e.target.value);
          setPage(1);
        }}
        className="h-10 rounded-lg border border-border bg-canvas px-3 text-xs text-primary outline-none focus:border-accent"
      >
        <option value="">All levels</option>
        <option value="DEBUG">Debug</option>
        <option value="INFO">Info</option>
        <option value="WARN">Warning</option>
        <option value="ERROR">Error</option>
        <option value="FATAL">Fatal</option>
      </select>

      <button
        onClick={() => fetchLogs(true)}
        disabled={loading || refreshing}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-border bg-surface-hover px-3 text-xs font-medium text-primary transition hover:border-secondary/40 disabled:opacity-50"
      >
        <RefreshCw
          size={14}
          className={refreshing ? "animate-spin" : ""}
        />
        Refresh
      </button>
    </div>
  </div>

  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
      <span className="text-[11px] font-medium text-success">
        Listening for live events
      </span>
    </div>

    <span className="text-[11px] text-muted">
      Page {page} of {totalPages}
    </span>
  </div>
</section>

{/* Logs table */}
<section className="overflow-hidden rounded-xl border border-border bg-surface">
  <div className="flex items-center justify-between border-b border-border px-5 py-4">
    <div>
      <h2 className="text-sm font-semibold">Application events</h2>
      <p className="mt-1 text-xs text-muted">
        Historical and incoming application logs
      </p>
    </div>

    <Terminal size={18} className="text-accent" />
  </div>

  {error ? (
    <div className="p-8 text-center">
      <AlertTriangle size={22} className="mx-auto text-danger" />
      <p className="mt-3 text-sm text-primary">{error}</p>
      <button
        onClick={() => fetchLogs(true)}
        className="mt-3 text-xs font-semibold text-accent hover:underline"
      >
        Try again
      </button>
    </div>
 ) : loading && logs.length === 0 ? (
    <div className="space-y-3 p-5">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-14 animate-pulse rounded-lg bg-surface-hover"
        />
      ))}
    </div>
  ) : logs.length === 0 ? (
    <div className="px-5 py-16 text-center">
      <Info size={25} className="mx-auto text-muted" />
      <p className="mt-3 text-sm font-medium">No logs found</p>
      <p className="mt-1 text-xs text-muted">
        Try changing your search or severity filter.
      </p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[750px] text-left">
        <thead>
          <tr className="border-b border-border bg-canvas/40">
            <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Level
            </th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Message
            </th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Source
            </th>
            <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
              Timestamp
            </th>
            <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted">
              Details
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-border">
          {logs.map((log) => (
            <tr
              key={log._id}
              className="transition hover:bg-surface-hover/60"
            >
              <td className="px-5 py-4">
                <span
                  className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${
                    severityStyles[log.level] ||
                    "border-border text-secondary"
                  }`}
                >
                  {log.level}
                </span>
              </td>

              <td className="max-w-[360px] px-4 py-4">
                <p className="truncate text-xs font-medium text-primary">
                  {log.message}
                </p>
                <p className="mt-1 truncate text-[10px] text-muted">
                  {log.errorType || "Application event"}
                </p>
              </td>

              <td className="px-4 py-4">
                <span className="text-xs text-secondary">
                  {log.source || "—"}
                </span>
              </td>

              <td className="whitespace-nowrap px-4 py-4">
                <span className="text-[11px] text-secondary">
                  {formatDate(log.timestamp)}
                </span>
              </td>

              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => setSelectedLog(log)}
                  className="rounded-md border border-border px-3 py-1.5 text-[10px] font-medium text-secondary transition hover:border-accent hover:text-accent"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )}

  {/* Pagination */}
  {!loading && !error && logs.length > 0 && (
    <div className="flex items-center justify-between border-t border-border px-5 py-3">
      <span className="text-[11px] text-muted">
        Showing {logs.length} logs
      </span>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
          className="rounded-md border border-border p-2 text-secondary hover:bg-surface-hover disabled:opacity-30"
        >
          <ChevronLeft size={15} />
        </button>

        <span className="text-xs tabular-nums text-secondary">
          {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
          className="rounded-md border border-border p-2 text-secondary hover:bg-surface-hover disabled:opacity-30"
        >
          <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )}
</section>

 {selectedLog && (
  <LogDetailsPanel
    log={selectedLog}
    onClose={() => setSelectedLog(null)}
  />
)}
      </div>
    </DashboardLayout>
  );
}

export default LogsExplorer;
