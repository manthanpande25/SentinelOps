
import { useState } from "react";
import {
  X,
  Copy,
  Check,
  Clock3,
  FileCode2,
  AlertCircle,
  Globe,
  Terminal
} from "lucide-react";

const severityStyles = {
  DEBUG: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  INFO: "bg-accent/10 text-accent border-accent/20",
  WARN: "bg-warning/10 text-warning border-warning/20",
  ERROR: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  FATAL: "bg-danger/10 text-danger border-danger/20"
};

function LogDetailsPanel({ log, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const logDetails = JSON.stringify(log, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(logDetails);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error("Unable to copy log:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close log details"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
      />

      {/* Inspector panel */}
      <aside className="relative flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[1.5px] text-muted">
              Log Inspector
            </p>
            <h2 className="mt-1 text-base font-semibold text-primary">
              Event details
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs text-secondary transition hover:bg-surface-hover hover:text-primary"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? "Copied" : "Copy JSON"}
            </button>

            <button
              onClick={onClose}
              aria-label="Close panel"
              className="rounded-lg border border-border p-2 text-secondary transition hover:bg-surface-hover hover:text-primary"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 space-y-6 overflow-y-auto p-5">

          {/* Severity and message */}
          <section>
            <span
              className={`inline-flex rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
                severityStyles[log.level] || "border-border text-secondary"
              }`}
            >
              {log.level}
            </span>

            <h3 className="mt-4 break-words text-lg font-semibold text-primary">
              {log.message}
            </h3>

            <p className="mt-2 text-xs text-muted">
              {log.errorType || "Application event"}
            </p>
          </section>

          {/* Event metadata */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-primary">
              Event metadata
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-canvas p-3">
                <div className="flex items-center gap-2 text-muted">
                  <Clock3 size={14} />
                  <span className="text-[10px]">Timestamp</span>
                </div>
                <p className="mt-2 break-words text-xs text-secondary">
                  {log.timestamp
                    ? new Date(log.timestamp).toLocaleString("en-IN")
                    : "—"}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-canvas p-3">
                <div className="flex items-center gap-2 text-muted">
                  <FileCode2 size={14} />
                  <span className="text-[10px]">Source</span>
                </div>
                <p className="mt-2 break-all text-xs text-secondary">
                  {log.source || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Request information */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Globe size={15} className="text-accent" />
              <h3 className="text-xs font-semibold text-primary">
                Request information
              </h3>
            </div>

            <div className="rounded-lg border border-border bg-canvas p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted">Method</p>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {log.request?.method || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-muted">Status code</p>
                  <p className="mt-1 text-xs font-medium text-primary">
                    {log.request?.statusCode ?? "—"}
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-[10px] text-muted">URL</p>
                <p className="mt-1 break-all text-xs text-secondary">
                  {log.request?.url || "—"}
                </p>
              </div>
            </div>
          </section>

          {/* Stack trace */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Terminal size={15} className="text-accent" />
              <h3 className="text-xs font-semibold text-primary">
                Stack trace
              </h3>
            </div>

            <div className="overflow-x-auto rounded-lg border border-border bg-canvas p-4">
              {log.stackTrace ? (
                <pre className="whitespace-pre-wrap break-words font-mono text-[11px] leading-6 text-secondary">
                  {log.stackTrace}
                </pre>
              ) : (
                <p className="flex items-center gap-2 text-xs text-muted">
                  <AlertCircle size={14} />
                  No stack trace available for this event.
                </p>
              )}
            </div>
          </section>

          {/* Raw JSON */}
          <section className="space-y-3">
            <h3 className="text-xs font-semibold text-primary">
              Raw event data
            </h3>

            <pre className="overflow-x-auto rounded-lg border border-border bg-canvas p-4 font-mono text-[10px] leading-5 text-secondary">
              {logDetails}
            </pre>
          </section>

        </div>
      </aside>
    </div>
  );
}

export default LogDetailsPanel;
    