
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  RefreshCw,
  Search,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
} from "lucide-react";
import {
  useAdmin,
  type AdminActivityItem,
} from "@/context/AdminContext";

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString();
}

function getStatusStyle(status?: string) {
  const value = status?.toLowerCase();

  if (value === "success" || value === "successful") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (value === "failed" || value === "error") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function safeDetails(details?: Record<string, unknown>) {
  if (!details) return "No additional details";

  // Do not display secret values from audit metadata.
  const blockedKeys =
    /password|secret|token|credential|authorization|private.?key|encrypted|notes|username|email/i;

  const safeEntries = Object.entries(details).filter(
    ([key, value]) =>
      !blockedKeys.test(key) &&
      (typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean")
  );

  if (safeEntries.length === 0) {
    return "No additional safe details";
  }

  return safeEntries
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" • ");
}

export default function AdminActivityPage() {
  const {
    activity,
    loading,
    error,
    refreshActivity,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredActivity = useMemo(() => {
    const query = search.trim().toLowerCase();

    return activity.filter((item: AdminActivityItem) => {
      const matchesSearch =
        !query ||
        item.eventType?.toLowerCase().includes(query) ||
        item.userId?.toLowerCase().includes(query) ||
        item.status?.toLowerCase().includes(query);

      const status = item.status?.toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "success" &&
          (status === "success" || status === "successful")) ||
        (statusFilter === "failed" &&
          (status === "failed" || status === "error"));

      return matchesSearch && matchesStatus;
    });
  }, [activity, search, statusFilter]);

  const successfulCount = activity.filter((item) => {
    const status = item.status?.toLowerCase();
    return status === "success" || status === "successful";
  }).length;

  const failedCount = activity.filter((item) => {
    const status = item.status?.toLowerCase();
    return status === "failed" || status === "error";
  }).length;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <ShieldCheck size={16} />
            Admin / Activity
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            Activity Logs
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor security events and activity across MiniVault.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void refreshActivity()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh logs
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Total events
            </p>
            <Activity className="text-blue-600" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {activity.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Events returned by the activity API
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Successful events
            </p>
            <CheckCircle2 className="text-emerald-600" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {successfulCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Events marked as successful
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">
              Failed events
            </p>
            <ShieldAlert className="text-red-600" size={21} />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {failedCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Events marked as failed
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search event, user ID or status..."
            className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="success">Successful</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Activity table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Recent activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {filteredActivity.length} event
            {filteredActivity.length === 1 ? "" : "s"} displayed
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {loading && activity.length === 0 ? (
          <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading activity logs...
          </div>
        ) : filteredActivity.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
            <div className="rounded-full bg-slate-100 p-4">
              <FileText size={28} className="text-slate-500" />
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              No activity found
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              {search || statusFilter !== "all"
                ? "Try changing your search or status filter."
                : "Activity will appear here when your backend records audit events."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Event</th>
                  <th className="px-5 py-4 font-semibold">User ID</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Details</th>
                  <th className="px-5 py-4 font-semibold">Date & time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredActivity.map((item) => {
                  const status = item.status?.toLowerCase();

                  const isSuccess =
                    status === "success" || status === "successful";

                  const isFailed =
                    status === "failed" || status === "error";

                  return (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-blue-50 p-2">
                            <Activity
                              size={17}
                              className="text-blue-600"
                            />
                          </div>
                          <span className="font-medium text-slate-900">
                            {item.eventType || "Unknown event"}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {item.userId || "System"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(item.status)}`}
                        >
                          {isSuccess ? (
                            <CheckCircle2 size={13} />
                          ) : isFailed ? (
                            <XCircle size={13} />
                          ) : (
                            <Clock size={13} />
                          )}
                          {item.status || "Unknown"}
                        </span>
                      </td>

                      <td className="max-w-xs px-5 py-4 text-xs leading-5 text-slate-600">
                        {safeDetails(item.details)}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
