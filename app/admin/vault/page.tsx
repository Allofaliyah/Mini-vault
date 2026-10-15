
"use client";

import { useAdmin } from "@/context/AdminContext";
import {
  LockKeyhole,
  ShieldCheck,
  Database,
  KeyRound,
  RefreshCw,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Users,
  Clock,
} from "lucide-react";

export default function AdminVaultPage() {
  const {
    vaultItems,
    users,
    activity,
    loading,
    error,
    refreshVault,
  } = useAdmin();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center md:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Vault Security
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              System-wide vault metadata and security overview.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshVault()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh vault
          </button>
        </div>
      </header>

      <section className="space-y-6 p-6 md:p-8">
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            Could not load admin data: {error}
          </div>
        )}

        {/* Overview cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <SecurityCard
            icon={<LockKeyhole size={21} />}
            title="Encryption design"
            value="AES-256-GCM"
            description="Intended vault encryption algorithm"
          />

          <SecurityCard
            icon={<KeyRound size={21} />}
            title="Key management"
            value="Server-side"
            description="Keys must remain outside client code"
          />

          <SecurityCard
            icon={<Database size={21} />}
            title="Database"
            value="PostgreSQL"
            description="Vault metadata and encrypted values"
          />

          <SecurityCard
            icon={<Users size={21} />}
            title="Vault records"
            value={
              loading && vaultItems.length === 0
                ? "Loading..."
                : vaultItems.length.toLocaleString()
            }
            description="Records returned by the admin API"
          />
        </div>

        {/* Protection overview */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
              <ShieldCheck size={22} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">
                Vault Protection
              </h2>
              <p className="text-sm text-slate-500">
                Security architecture and operational checks
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <SecurityRow
              name="Authentication provider"
              value="Supabase Auth"
            />

            <SecurityRow
              name="Database"
              value="Supabase PostgreSQL"
            />

            <SecurityRow
              name="Vault encryption"
              value="AES-256-GCM configured by design"
            />

            <SecurityRow
              name="Admin access"
              value="Must be verified server-side"
            />

            <SecurityRow
              name="Audit events loaded"
              value={activity.length.toLocaleString()}
            />

            <SecurityRow
              name="Accounts loaded"
              value={users.length.toLocaleString()}
            />
          </div>

          <div className="mt-5 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <Activity
              size={19}
              className="mt-0.5 shrink-0 text-blue-600"
            />
            <p className="text-sm text-blue-800">
              These counts reflect data returned by your admin API.
              They do not independently prove that encryption, MFA,
              or access controls are configured correctly.
            </p>
          </div>
        </div>

        {/* Vault metadata */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <Database size={20} className="text-slate-600" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Recent Vault Records
                </h2>
                <p className="text-sm text-slate-500">
                  Metadata only; no decrypted secrets are displayed.
                </p>
              </div>
            </div>
          </div>

          {loading && vaultItems.length === 0 ? (
            <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading vault metadata...
            </div>
          ) : vaultItems.length === 0 ? (
            <div className="p-10 text-center">
              <Database
                size={30}
                className="mx-auto text-slate-400"
              />
              <p className="mt-3 font-medium text-slate-900">
                No vault records available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Records will appear here when the admin API returns vault metadata.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">Record</th>
                    <th className="px-6 py-4 font-medium">Owner ID</th>
                    <th className="px-6 py-4 font-medium">Created</th>
                    <th className="px-6 py-4 font-medium">Last updated</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {vaultItems.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-slate-100 p-2">
                            <LockKeyhole
                              size={17}
                              className="text-slate-600"
                            />
                          </div>
                          <span className="font-medium text-slate-900">
                            {item.title}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {item.userId}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-6 py-4 text-slate-500">
                        {formatDate(item.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Privacy boundary */}
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={21}
              className="mt-0.5 shrink-0 text-amber-700"
            />
            <div>
              <p className="font-semibold text-amber-900">
                Administrator privacy boundary
              </p>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Administrators can monitor vault metadata and security
                events, but must not receive decrypted passwords, private
                notes, encryption keys, or other users' secret values.
                The admin API should return only the metadata required
                for administration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString();
}

function SecurityCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>

      <p className="mt-4 text-sm text-slate-500">{title}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

function SecurityRow({
  name,
  value,
}: {
  name: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center">
      <span className="text-sm font-medium text-slate-700">
        {name}
      </span>
      <span className="text-sm text-slate-600">{value}</span>
    </div>
  );
}
