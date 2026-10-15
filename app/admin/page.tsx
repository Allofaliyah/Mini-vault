
"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Users,
  ShieldCheck,
  LockKeyhole,
  Activity,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Server,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";

export default function AdminDashboard() {
  const {
    users,
    vaultItems,
    activity,
    loading,
    error,
    refreshUsers,
    refreshVault,
    refreshActivity,
  } = useAdmin();

  const failedEvents = useMemo(
    () =>
      activity.filter((event) => {
        const status = event.status?.toLowerCase();
        return (
          status === "failed" ||
          status === "error" ||
          status === "denied"
        );
      }),
    [activity]
  );

  const successfulEvents = activity.filter((event) => {
    const status = event.status?.toLowerCase();
    return status === "success" || status === "successful";
  }).length;

  const stats = [
    {
      title: "Total Users",
      value: loading && users.length === 0 ? "..." : users.length.toLocaleString(),
      icon: Users,
      description: "Accounts returned by the admin API",
    },
    {
      title: "Vault Items",
      value:
        loading && vaultItems.length === 0
          ? "..."
          : vaultItems.length.toLocaleString(),
      icon: LockKeyhole,
      description: "Vault records returned by the API",
    },
    {
      title: "Successful Events",
      value: successfulEvents.toLocaleString(),
      icon: ShieldCheck,
      description: "Recorded successful activity",
    },
    {
      title: "Failed Events",
      value: failedEvents.length.toLocaleString(),
      icon: Activity,
      description: "Recorded failures and denied events",
    },
  ];

  async function refreshDashboard() {
    await Promise.all([
      refreshUsers(),
      refreshVault(),
      refreshActivity(),
    ]);
  }

  const recentAlerts = activity
    .filter((event) => {
      const status = event.status?.toLowerCase();
      const description = `${event.eventType ?? ""} ${status ?? ""}`.toLowerCase();

      return (
        status === "failed" ||
        status === "error" ||
        status === "denied" ||
        description.includes("suspicious") ||
        description.includes("locked")
      );
    })
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center md:px-8">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-slate-900 p-2 text-white">
              <ShieldCheck size={20} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Admin Dashboard
              </h1>
              <p className="text-sm text-slate-500">
                MiniVault system overview and security monitoring.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void refreshDashboard()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh dashboard
          </button>
        </div>
      </header>

      <section className="space-y-8 p-6 md:p-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Could not load some dashboard data: {error}
          </div>
        )}

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <Icon size={20} />
                </div>

                <p className="mt-4 text-sm text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {stat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Security overview */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900">
                  System Security
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Security configuration overview
                </p>
              </div>

              <ShieldCheck size={25} className="text-slate-500" />
            </div>

            <div className="mt-6 space-y-4">
              <AdminStatus
                title="Authentication"
                status="Supabase Auth configured"
              />
              <AdminStatus
                title="Database"
                status="PostgreSQL configured"
              />
              <AdminStatus
                title="Vault encryption"
                status="AES-256-GCM design"
              />
              <AdminStatus
                title="Audit activity"
                status={`${activity.length} records loaded`}
              />
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertTriangle
                size={18}
                className="mt-0.5 shrink-0 text-amber-700"
              />
              <p className="text-xs leading-5 text-amber-800">
                These are configuration labels and loaded record counts,
                not live health checks. Do not treat them as proof that
                the services are operational or that encryption is working.
              </p>
            </div>
          </div>

          {/* Recent alerts */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle size={22} className="text-amber-500" />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Security Alerts
                </h2>
                <p className="text-sm text-slate-500">
                  Recent recorded failures and suspicious events
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {recentAlerts.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-5 text-sm text-slate-500">
                  No matching failure events were returned. This does not
                  necessarily mean the system has no security threats.
                </div>
              ) : (
                recentAlerts.map((event) => (
                  <Alert
                    key={event.id}
                    title={event.eventType || "Security event"}
                    description={`${event.status || "Unknown status"} · ${
                      event.userId || "System"
                    }`}
                  />
                ))
              )}

              <Link
                href="/admin/security"
                className="inline-flex items-center gap-2 pt-2 text-sm font-medium text-slate-700 hover:text-slate-950"
              >
                View security events
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>

        {/* Administration shortcuts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">
            Administration
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Manage accounts and review vault and security metadata.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <AdminLink
              href="/admin/users"
              icon={<Users size={20} />}
              title="Manage Users"
              description="Review and manage accounts."
            />

            <AdminLink
              href="/admin/vault"
              icon={<LockKeyhole size={20} />}
              title="Vault Security"
              description="Review vault metadata."
            />

            <AdminLink
              href="/admin/security"
              icon={<Activity size={20} />}
              title="Security Events"
              description="Review recorded security activity."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function AdminStatus({
  title,
  status,
}: {
  title: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4">
      <span className="text-sm font-medium text-slate-700">
        {title}
      </span>
      <span className="text-right text-xs text-slate-600">
        {status}
      </span>
    </div>
  );
}

function Alert({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-100 bg-red-50 p-4">
      <XCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
      <div className="min-w-0">
        <p className="break-words text-sm font-medium text-red-900">
          {title}
        </p>
        <p className="mt-1 break-words text-xs text-red-700">
          {description}
        </p>
      </div>
    </div>
  );
}

function AdminLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-slate-200 p-5 transition hover:border-slate-400 hover:bg-slate-50"
    >
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {icon}
        </div>

        <ArrowRight
          size={18}
          className="text-slate-400 transition group-hover:translate-x-1"
        />
      </div>

      <h3 className="mt-4 font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-1 text-sm text-slate-500">
        {description}
      </p>
    </Link>
  );
}
