
"use client";

import { useMemo, useState } from "react";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Activity,
  RefreshCw,
  Search,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  useAdmin,
  type AdminActivityItem,
} from "@/context/AdminContext";

function formatTime(value?: string) {
  if (!value) return "Unknown time";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown time";

  return date.toLocaleString();
}

function getEventType(event: AdminActivityItem) {
  const value = `${event.eventType ?? ""} ${event.status ?? ""}`
    .toLowerCase()
    .replace(/[_-]/g, " ");

  if (
    value.includes("failed") ||
    value.includes("failure") ||
    value.includes("denied") ||
    value.includes("blocked") ||
    value.includes("error")
  ) {
    return "danger";
  }

  if (
    value.includes("warning") ||
    value.includes("suspicious") ||
    value.includes("locked") ||
    value.includes("attempt")
  ) {
    return "warning";
  }

  if (
    value.includes("success") ||
    value.includes("verified") ||
    value.includes("login") ||
    value.includes("mfa")
  ) {
    return "success";
  }

  return "other";
}

function SecurityIcon({ type }: { type: string }) {
  if (type === "success") {
    return <CheckCircle2 size={21} className="text-emerald-600" />;
  }

  if (type === "warning") {
    return <ShieldAlert size={21} className="text-amber-600" />;
  }

  if (type === "danger") {
    return <XCircle size={21} className="text-red-600" />;
  }

  return <Activity size={21} className="text-slate-500" />;
}

function SecurityStat({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {icon}
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function AdminSecurityPage() {
  const { activity, loading, error, refreshActivity } = useAdmin();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const securityEvents = useMemo(() => {
    return activity.filter((event) => {
      const text = `${event.eventType ?? ""} ${event.status ?? ""}`
        .toLowerCase()
        .replace(/[_-]/g, " ");

      // Focus on authentication and security-related events.
      return /login|sign in|auth|mfa|totp|password|security|failed|failure|denied|blocked|suspicious|locked|access|role|account|session|verification/.test(
        text
      );
    });
  }, [activity]);

  const successfulEvents = securityEvents.filter((event) => {
    const status = event.status?.toLowerCase();
    return status === "success" || status === "successful";
  }).length;

  const threatEvents = securityEvents.filter((event) => {
    const type = getEventType(event);
    return type === "danger" || type === "warning";
  }).length;

  const filteredEvents = securityEvents.filter((event) => {
    const eventType = getEventType(event);

    const matchesFilter =
      filter === "all" ||
      (filter === "success" && eventType === "success") ||
      (filter === "warning" && eventType === "warning") ||
      (filter === "danger" && eventType === "danger");

    const query = search.trim().toLowerCase();

    const matchesSearch =
      !query ||
      event.eventType?.toLowerCase().includes(query) ||
      event.status?.toLowerCase().includes(query) ||
      event.userId?.toLowerCase().includes(query);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="px-6 py-6 md:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <ShieldAlert size={21} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Security Events
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Monitor authentication and security activity across MiniVault.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void refreshActivity()}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <section className="space-y-6 p-6 md:p-8">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <SecurityStat
            title="Security Events"
            value={securityEvents.length}
            description="Security-related events returned by the API"
            icon={<Activity size={21} className="text-blue-600" />}
          />

          <SecurityStat
            title="Successful Events"
            value={successfulEvents}
            description="Events marked successful"
            icon={<ShieldCheck size={21} className="text-emerald-600" />}
          />

          <SecurityStat
            title="Potential Threats"
            value={threatEvents}
            description="Events classified as warnings or failures"
            icon={<ShieldAlert size={21} className="text-red-600" />}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Could not load security events: {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <Activity size={20} className="text-slate-700" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recent Security Events
                </h2>
                <p className="text-sm text-slate-500">
                  Security events recorded by your backend audit system.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by event, status or user ID..."
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <select
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="all">All events</option>
                <option value="success">Successful</option>
                <option value="warning">Warnings</option>
                <option value="danger">Failures / threats</option>
              </select>
            </div>
          </div>

          {loading && activity.length === 0 ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading security events...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck
                size={32}
                className="mx-auto text-slate-400"
              />
              <h3 className="mt-3 font-semibold text-slate-900">
                No security events found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Events will appear here when the backend records them.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredEvents.map((event) => {
                const type = getEventType(event);

                return (
                  <div
                    key={event.id}
                    className="flex flex-col gap-3 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="mt-0.5">
                        <SecurityIcon type={type} />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-medium text-slate-900">
                          {(event.eventType ?? "Unknown event")
                            .replace(/[_-]/g, " ")}
                        </p>

                        <p className="mt-1 break-all text-xs text-slate-500">
                          User ID: {event.userId || "System"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          Status: {event.status || "Unknown"}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 text-xs text-slate-500 sm:pl-4">
                      <Clock size={14} />
                      {formatTime(event.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
            Displaying {filteredEvents.length} of {securityEvents.length} security events
          </div>
        </div>
      </section>
    </div>
  );
}
