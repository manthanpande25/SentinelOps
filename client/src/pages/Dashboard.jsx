
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useSocket from "../hooks/useSocket";
import {
  Activity,
  AlertTriangle,
  Layers,
  ShieldCheck,
  RefreshCw,
  ArrowUpRight,
  ArrowRight,
  CircleDot,
  Clock3,
  Server,
  CheckCircle2,
  XCircle,
  Terminal,
  Zap
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

const severityConfig = [
  {
    label: "Fatal",
    key: "FATAL",
    color: "bg-danger",
    text: "text-danger",
    dot: "bg-danger"
  },
  {
    label: "Error",
    key: "ERROR",
    color: "bg-orange-500",
    text: "text-orange-400",
    dot: "bg-orange-400"
  },
  {
    label: "Warning",
    key: "WARN",
    color: "bg-warning",
    text: "text-warning",
    dot: "bg-warning"
  },
  {
    label: "Info",
    key: "INFO",
    color: "bg-accent",
    text: "text-accent",
    dot: "bg-accent"
  },
  {
    label: "Debug",
    key: "DEBUG",
    color: "bg-slate-500",
    text: "text-secondary",
    dot: "bg-slate-500"
  }
];

const severityStyles = {
  CRITICAL: "border-danger/20 bg-danger/10 text-danger",
  HIGH: "border-orange-500/20 bg-orange-500/10 text-orange-400",
  MEDIUM: "border-warning/20 bg-warning/10 text-warning",
  LOW: "border-accent/20 bg-accent/10 text-accent"
};

const statusStyles = {
  OPEN: "bg-danger/10 text-danger",
  INVESTIGATING: "bg-warning/10 text-warning",
  RESOLVED: "bg-success/10 text-success",
  IGNORED: "bg-surface-hover text-muted"
};

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("sentinel_token");
const { latestIncident } = useSocket(token);

  const fetchDashboardData = useCallback(async (manual = false) => {
    if (manual) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      setError("");

      const [
        statsResponse,
        incidentsResponse,
        applicationsResponse
      ] = await Promise.all([
        api.get("/logs/stats"),
        api.get("/incidents"),
        api.get("/applications")
      ]);

      setStats(statsResponse.data.stats);
      setIncidents(incidentsResponse.data.incidents || []);
      setApplications(applicationsResponse.data.applications || []);
    } catch (err) {
      console.error("Dashboard data error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
  if (latestIncident) {
    console.log("New real-time incident:", latestIncident);
    fetchDashboardData();
  }
}, [latestIncident, fetchDashboardData]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const openIncidents = incidents.filter(
    (incident) => incident.status === "OPEN"
  ).length;

  const investigatingIncidents = incidents.filter(
    (incident) => incident.status === "INVESTIGATING"
  ).length;

  const resolvedIncidents = incidents.filter(
    (incident) => incident.status === "RESOLVED"
  ).length;

  const activeApplications = applications.filter(
    (application) => application.isActive
  ).length;

  const totalLogs = stats?.totalLogs ?? 0;

  const metrics = [
    {
      label: "Total logs",
      value: totalLogs,
      detail: "Collected log events",
      icon: Activity,
      iconStyle: "bg-accent/10 text-accent",
      indicator: "All levels"
    },
    {
      label: "Open incidents",
      value: openIncidents,
      detail: "Require attention",
      icon: AlertTriangle,
      iconStyle: "bg-danger/10 text-danger",
      indicator: "Open"
    },
    {
      label: "Applications",
      value: applications.length,
      detail: `${activeApplications} currently active`,
      icon: Layers,
      iconStyle: "bg-violet-500/10 text-violet-400",
      indicator: "Registered"
    },
    {
      label: "Investigating",
      value: investigatingIncidents,
      detail: `${resolvedIncidents} resolved incidents`,
      icon: ShieldCheck,
      iconStyle: "bg-warning/10 text-warning",
      indicator: "In progress"
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-7">

        {/* Page introduction */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              <span className="text-[11px] font-semibold uppercase tracking-[1.5px] text-secondary">
                System overview
              </span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">
              Good to see you.
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-secondary">
              Here's what's happening across your monitored applications.
            </p>
          </div>

          <button
            onClick={() => fetchDashboardData(true)}
            disabled={loading || refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-lg border border-border bg-surface px-4 text-xs font-semibold text-primary transition hover:border-secondary/40 hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh data
          </button>
        </section>

        {/* Error state */}
        {error && (
          <div className="flex flex-col gap-3 rounded-xl border border-danger/20 bg-danger/5 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle size={18} className="shrink-0 text-danger" />
              <p className="text-sm text-primary">{error}</p>
            </div>

            <button
              onClick={() => fetchDashboardData(true)}
              className="text-left text-xs font-semibold text-danger hover:underline sm:text-right"
            >
              Retry request
            </button>
          </div>
        )}

        {/* Metrics */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Workspace metrics
            </h2>
            <span className="text-[11px] text-muted">
              Current data
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <div
                  key={metric.label}
                  className="group rounded-xl border border-border bg-surface p-5 transition duration-200 hover:border-secondary/40"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[12px] font-medium text-secondary">
                      {metric.label}
                    </p>

                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${metric.iconStyle}`}>
                      <Icon size={18} strokeWidth={1.8} />
                    </div>
                  </div>

                  {loading ? (
                    <div className="mt-5 h-9 w-20 animate-pulse rounded-md bg-surface-hover" />
                  ) : (
                    <p className="mt-5 text-[32px] font-semibold leading-none tracking-tight tabular-nums">
                      {metric.value.toLocaleString("en-IN")}
                    </p>
                  )}

                  <div className="mt-4 flex items-center justify-between gap-2">
                    <p className="text-[11px] text-muted">
                      {metric.detail}
                    </p>

                    <span className="rounded-md bg-surface-hover px-2 py-1 text-[10px] text-secondary">
                      {metric.indicator}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-5">

          {/* Log distribution */}
          <section className="rounded-xl border border-border bg-surface p-5 xl:col-span-3">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Log distribution
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Breakdown by severity level
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Activity size={18} />
              </div>
            </div>

            {loading ? (
              <div className="mt-8 space-y-5">
                {severityConfig.map((item) => (
                  <div key={item.key} className="animate-pulse">
                    <div className="mb-2 h-3 w-full rounded bg-surface-hover" />
                    <div className="h-2 rounded bg-surface-hover" />
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="mt-7 space-y-5">
                  {severityConfig.map((level) => {
                    const value = stats?.[level.key] ?? 0;
                    const percentage =
                      totalLogs > 0 ? (value / totalLogs) * 100 : 0;

                    return (
                      <div key={level.key}>
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className={`h-2 w-2 rounded-full ${level.dot}`} />
                            <span className="text-xs text-secondary">
                              {level.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-muted">
                              {percentage.toFixed(1)}%
                            </span>
                            <span className="w-8 text-right text-xs font-semibold tabular-nums">
                              {value}
                            </span>
                          </div>
                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-canvas">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${level.color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-7 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-[11px] text-muted">
                    Total collected events
                  </span>
                  <span className="text-sm font-semibold tabular-nums">
                    {totalLogs.toLocaleString("en-IN")}
                  </span>
                </div>
              </>
            )}
          </section>

          {/* Application health */}
          <section className="rounded-xl border border-border bg-surface p-5 xl:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Applications
                </h2>
                <p className="mt-1 text-xs text-muted">
                  Your monitored projects
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <Server size={18} />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-lg border border-border bg-canvas/60 p-3">
              <div>
                <p className="text-[11px] text-muted">
                  Active applications
                </p>
                <p className="mt-1 text-xl font-semibold tabular-nums">
                  {loading ? "—" : activeApplications}
                  <span className="ml-1 text-xs font-normal text-muted">
                    / {loading ? "—" : applications.length}
                  </span>
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-success/10 text-success">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {loading ? (
                <div className="h-16 animate-pulse rounded-lg bg-surface-hover" />
              ) : applications.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center">
                  <Layers size={22} className="mx-auto text-muted" />
                  <p className="mt-3 text-xs text-secondary">
                    No applications registered yet.
                  </p>
                </div>
              ) : (
                applications.slice(0, 4).map((application) => (
                  <div
                    key={application._id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-transparent p-3 transition hover:border-border hover:bg-surface-hover"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-hover text-secondary">
                        <Terminal size={17} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {application.name}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-muted">
                          {application.technology || "Unknown technology"} ·{" "}
                          {application.environment || "Unknown environment"}
                        </p>
                      </div>
                    </div>

                    <span className={`flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-medium ${
                      application.isActive
                        ? "bg-success/10 text-success"
                        : "bg-danger/10 text-danger"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        application.isActive ? "bg-success" : "bg-danger"
                      }`} />
                      {application.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))
              )}
            </div>

            {applications.length > 4 && (
              <p className="mt-3 text-center text-[11px] text-muted">
                Showing 4 of {applications.length} applications
              </p>
            )}
          </section>
        </div>

        {/* Incident summary */}
        <section className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex flex-col justify-between gap-3 border-b border-border p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-sm font-semibold">
                Recent incidents
              </h2>
              <p className="mt-1 text-xs text-muted">
                Detected errors across your applications
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-md bg-danger/10 px-2.5 py-1.5 text-[10px] font-medium text-danger">
                {openIncidents} open
              </span>
              <span className="rounded-md bg-warning/10 px-2.5 py-1.5 text-[10px] font-medium text-warning">
                {investigatingIncidents} investigating
              </span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-14 animate-pulse rounded-lg bg-surface-hover"
                />
              ))}
            </div>
          ) : incidents.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-success/10 text-success">
                <ShieldCheck size={22} />
              </div>
              <p className="mt-4 text-sm font-medium">
                No incidents detected
              </p>
              <p className="mt-1 text-xs text-muted">
                Your workspace has no recorded incidents yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-border bg-canvas/40">
                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Incident
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Severity
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Status
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Events
                    </th>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Last seen
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border">
                  {incidents.slice(0, 6).map((incident) => (
                    <tr
                      key={incident._id}
                      className="transition hover:bg-surface-hover/70"
                    >
                      <td className="max-w-[320px] px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-danger/10 text-danger">
                            <AlertTriangle size={15} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-primary">
                              {incident.title}
                            </p>
                            <p className="mt-1 truncate text-[10px] text-muted">
                              {incident.errorType || "Unknown error"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${
                          severityStyles[incident.severity] ||
                          "border-border bg-surface-hover text-secondary"
                        }`}>
                          {incident.severity}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${
                          statusStyles[incident.status] ||
                          "bg-surface-hover text-secondary"
                        }`}>
                          {incident.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold tabular-nums">
                          {incident.occurrenceCount}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="whitespace-nowrap text-[11px] text-secondary">
                          {formatDate(incident.lastSeen)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {incidents.length > 6 && (
            <div className="border-t border-border p-3 text-center">
              <p className="text-[11px] text-muted">
                Showing 6 of {incidents.length} incidents
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="flex flex-col justify-between gap-2 border-t border-border pt-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck size={14} className="text-accent" />
            SentinelOps Monitoring Platform
          </div>

          <p className="text-[10px] text-muted">
            Metrics reflect the data currently returned by your API.
          </p>
        </footer>

      </div>
    </DashboardLayout>
  );
}

export default Dashboard;
