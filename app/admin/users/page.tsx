
"use client";

import { useMemo, useState } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
} from "lucide-react";
import {
  useAdmin,
  type AdminUser,
} from "@/context/AdminContext";

export default function UsersPage() {
  const {
    users,
    vaultItems,
    loading,
    error,
    refreshUsers,
    updateUser,
  } = useAdmin();

  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      return (
        !query ||
        user.email?.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  const activeCount = users.filter((user) => user.isActive).length;
  const suspendedCount = users.length - activeCount;
  const adminCount = users.filter((user) => user.role === "admin").length;

  function getVaultCount(userId: string) {
    return vaultItems.filter((item) => item.userId === userId).length;
  }

  async function toggleAccount(user: AdminUser) {
    const action = user.isActive ? "suspend" : "activate";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.email ?? "this account"}?`
    );

    if (!confirmed) return;

    setUpdatingId(user.id);
    setActionError("");

    try {
      const result = await updateUser(user.id, {
        isActive: !user.isActive,
      });

      if (result?.error) {
        setActionError(result.error);
      }
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Could not update this account."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="flex flex-col justify-between gap-4 px-6 py-6 sm:flex-row sm:items-center md:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Users
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage MiniVault accounts and account access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void refreshUsers()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh users
          </button>
        </div>
      </header>

      <section className="space-y-6 p-6 md:p-8">
        {/* Summary cards */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total users"
            value={users.length}
            icon={<Users size={21} className="text-blue-600" />}
          />

          <StatCard
            title="Active accounts"
            value={activeCount}
            icon={<UserCheck size={21} className="text-emerald-600" />}
          />

          <StatCard
            title="Suspended accounts"
            value={suspendedCount}
            icon={<UserX size={21} className="text-red-600" />}
          />

          <StatCard
            title="Administrators"
            value={adminCount}
            icon={<ShieldCheck size={21} className="text-violet-600" />}
          />
        </div>

        {(error || actionError) && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {actionError || error}
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <Search size={19} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by email, user ID, or role..."
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>

        {/* Users table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              All accounts
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filteredUsers.length} of {users.length} accounts
            </p>
          </div>

          {loading && users.length === 0 ? (
            <div className="flex items-center justify-center gap-3 p-12 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={30} className="mx-auto text-slate-400" />
              <p className="mt-3 font-medium text-slate-800">
                No users found
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different search or refresh the list.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-medium">User</th>
                    <th className="px-6 py-4 font-medium">Role</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Vault items</th>
                    <th className="px-6 py-4 font-medium">Account action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                            <Users size={18} />
                          </div>

                          <div>
                            <p className="font-medium text-slate-900">
                              {user.email || "No email available"}
                            </p>
                            <p className="mt-1 font-mono text-xs text-slate-400">
                              {user.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <ShieldCheck size={13} />
                          ) : (
                            <KeyRound size={13} />
                          )}
                          {user.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-2 text-emerald-700">
                            <UserCheck size={16} />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2 text-red-700">
                            <UserX size={16} />
                            Suspended
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-5 text-slate-700">
                        {getVaultCount(user.id)}
                      </td>

                      <td className="px-6 py-5">
                        <button
                          type="button"
                          onClick={() => void toggleAccount(user)}
                          disabled={updatingId === user.id}
                          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 ${
                            user.isActive
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          {updatingId === user.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : user.isActive ? (
                            <UserX size={14} />
                          ) : (
                            <UserCheck size={14} />
                          )}

                          {updatingId === user.id
                            ? "Updating..."
                            : user.isActive
                              ? "Suspend"
                              : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <ShieldAlert size={19} className="mt-0.5 shrink-0" />
          <p>
            Suspending an account should also prevent that account from
            accessing protected API routes. Updating the database flag alone
            is not enough unless your server checks it on every protected
            request.
          </p>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
