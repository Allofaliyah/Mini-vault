
"use client";

import { useMemo, useState } from "react";
import {
  LockKeyhole,
  Search,
  ShieldCheck,
  KeyRound,
  Loader2,
  AlertCircle,
  Pencil,
  Trash2,
  X,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  CalendarDays,
} from "lucide-react";

import VaultForm from "@/components/VaultForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserProvider, useUser } from "@/context/UserContext";

type VaultDetails = {
  id: string;
  title: string;
  username: string | null;
  password: string;
  notes: string | null;
  createdAt?: string;
  updatedAt?: string;
};

const emptyForm = {
  title: "",
  username: "",
  password: "",
  notes: "",
};

function VaultContent() {
  const {
    vaultItems,
    loading,
    error,
    refreshVault,
    updateVaultItem,
    deleteVaultItem,
  } = useUser();

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const [form, setForm] = useState(emptyForm);

  // Selected item modal state
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [viewingItem, setViewingItem] = useState<VaultDetails | null>(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return vaultItems;

    return vaultItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        (item.username ?? "").toLowerCase().includes(query) ||
        (item.notes ?? "").toLowerCase().includes(query),
    );
  }, [vaultItems, search]);

  function clearMessages() {
    setActionError(null);
    setActionMessage(null);
  }

  function startEditing(item: (typeof vaultItems)[number]) {
    setEditingId(item.id);

    setForm({
      title: item.title,
      username: item.username ?? "",
      // Do not preload or expose the existing password in the edit form.
      // An empty password means keep the current password.
      password: "",
      notes: item.notes ?? "",
    });

    clearMessages();
  }

  function cancelEditing() {
    setEditingId(null);
    setForm(emptyForm);
    setActionError(null);
  }

  function closeDetails() {
    if (viewLoading) return;

    setViewingId(null);
    setViewingItem(null);
    setShowPassword(false);
  }

  async function handleViewItem(id: string) {
    setViewingId(id);
    setViewingItem(null);
    setShowPassword(false);
    setActionError(null);
    setViewLoading(true);

    try {
      const response = await fetch(
        `/api/vault/${encodeURIComponent(id)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error || "Unable to load this vault item.",
        );
      }

      if (
        !result?.item ||
        result.item.id !== id ||
        typeof result.item.title !== "string" ||
        typeof result.item.password !== "string"
      ) {
        throw new Error("The server returned invalid vault item details.");
      }

      setViewingItem({
        id: result.item.id,
        title: result.item.title,
        username: result.item.username ?? null,
        password: result.item.password,
        notes: result.item.notes ?? null,
        createdAt: result.item.createdAt,
        updatedAt: result.item.updatedAt,
      });
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Unable to load this vault item.",
      );
      setViewingId(null);
    } finally {
      setViewLoading(false);
    }
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingId) return;

    if (!form.title.trim()) {
      setActionError("Please enter a title.");
      return;
    }

    setSaving(true);
    clearMessages();

    const changes: {
      title: string;
      username: string;
      notes: string;
      password?: string;
    } = {
      title: form.title.trim(),
      username: form.username.trim(),
      notes: form.notes.trim(),
    };

    if (form.password.length > 0) {
      changes.password = form.password;
    }

    try {
      const result = await updateVaultItem(editingId, changes);

      if (result.error) {
        setActionError(result.error);
        return;
      }

      setEditingId(null);
      setForm(emptyForm);
      setActionMessage("Vault item updated successfully.");
    } catch {
      setActionError("Unable to update this vault item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setDeletingId(id);
    clearMessages();

    try {
      const result = await deleteVaultItem(id);

      if (result.error) {
        setActionError(result.error);
        return;
      }

      if (editingId === id) {
        cancelEditing();
      }

      if (viewingId === id) {
        setViewingId(null);
        setViewingItem(null);
      }

      setActionMessage("Vault item deleted successfully.");
    } catch {
      setActionError("Unable to delete this vault item. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleRefresh() {
    clearMessages();

    try {
      await refreshVault();
    } catch {
      setActionError("Unable to refresh your vault. Please try again.");
    }
  }

  function formatDate(date?: string) {
    if (!date) return "Not available";

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? "Not available"
      : parsed.toLocaleString();
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4 px-6 py-5 md:px-8">
            <div>
              <h1 className="text-2xl font-bold">My Vault</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Securely manage your passwords and secrets.
              </p>
            </div>

            <div className="hidden items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex dark:bg-emerald-950/40 dark:text-emerald-300">
              <ShieldCheck size={16} />
              Encrypted
            </div>
          </div>
        </header>

        <section className="space-y-6 p-6 md:p-8">
          {/* Search */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <Search size={19} className="shrink-0 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search your vault..."
              aria-label="Search vault items"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Create */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2 className="font-semibold">Add a Secret</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Store a password or private information securely.
                </p>
              </div>
            </div>

            <VaultForm />
          </div>

          {/* Saved items */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Saved Secrets</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  View, edit and delete your saved vault entries.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>

            {(error || actionError) && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                <AlertCircle size={17} className="mt-0.5 shrink-0" />
                <p>{actionError || error}</p>
              </div>
            )}

            {actionMessage && (
              <p
                role="status"
                className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                {actionMessage}
              </p>
            )}

            {loading && vaultItems.length === 0 ? (
              <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500">
                <Loader2 size={20} className="animate-spin" />
                Loading your vault...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
                <KeyRound className="mx-auto mb-3 h-8 w-8 text-slate-400" />

                <h3 className="font-medium">
                  {search ? "No matching secrets" : "Your vault is empty"}
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {search
                    ? "Try a different search term."
                    : "Add your first secret using the form above."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Showing {filteredItems.length} of {vaultItems.length} entries
                </p>

                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 p-4 dark:border-slate-800"
                  >
                    {editingId === item.id ? (
                      <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="font-semibold">Edit Secret</h3>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            aria-label="Cancel editing"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        <div>
                          <label
                            htmlFor={`title-${item.id}`}
                            className="mb-1 block text-sm font-medium"
                          >
                            Title *
                          </label>
                          <input
                            id={`title-${item.id}`}
                            value={form.title}
                            onChange={(event) =>
                              setForm({ ...form, title: event.target.value })
                            }
                            required
                            maxLength={200}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`username-${item.id}`}
                            className="mb-1 block text-sm font-medium"
                          >
                            Username or email
                          </label>
                          <input
                            id={`username-${item.id}`}
                            value={form.username}
                            onChange={(event) =>
                              setForm({ ...form, username: event.target.value })
                            }
                            autoComplete="off"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`password-${item.id}`}
                            className="mb-1 block text-sm font-medium"
                          >
                            Replace password (optional)
                          </label>
                          <input
                            id={`password-${item.id}`}
                            type="password"
                            value={form.password}
                            onChange={(event) =>
                              setForm({ ...form, password: event.target.value })
                            }
                            placeholder="Leave blank to keep the current password"
                            autoComplete="new-password"
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor={`notes-${item.id}`}
                            className="mb-1 block text-sm font-medium"
                          >
                            Description / notes
                          </label>
                          <textarea
                            id={`notes-${item.id}`}
                            value={form.notes}
                            onChange={(event) =>
                              setForm({ ...form, notes: event.target.value })
                            }
                            rows={4}
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
                          />
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <button
                            type="submit"
                            disabled={saving || !form.title.trim()}
                            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                          >
                            {saving ? (
                              <Loader2 size={16} className="animate-spin" />
                            ) : (
                              <Save size={16} />
                            )}
                            {saving ? "Saving..." : "Save changes"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={saving}
                            className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                          <KeyRound size={18} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-medium">
                            {item.title}
                          </h3>

                          {item.username && (
                            <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                              Username: {item.username}
                            </p>
                          )}

                          {item.notes && (
                            <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-600 dark:text-slate-300">
                              {item.notes}
                            </p>
                          )}

                          {item.updatedAt && (
                            <p className="mt-2 text-xs text-slate-400">
                              Updated: {formatDate(item.updatedAt)}
                            </p>
                          )}
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <ShieldCheck
                            size={18}
                            className="mr-1 text-emerald-600"
                            aria-label="Protected vault entry"
                          />

                          <button
                            type="button"
                            onClick={() => void handleViewItem(item.id)}
                            disabled={deletingId === item.id}
                            aria-label={`View ${item.title}`}
                            title="View secret"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <Eye size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditing(item)}
                            disabled={deletingId === item.id}
                            aria-label={`Edit ${item.title}`}
                            title="Edit secret"
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleDelete(item.id, item.title)
                            }
                            disabled={deletingId === item.id}
                            aria-label={`Delete ${item.title}`}
                            title="Delete secret"
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
                          >
                            {deletingId === item.id ? (
                              <Loader2 size={17} className="animate-spin" />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* View item modal */}
        {viewingId && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeDetails();
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="vault-details-title"
              className="my-auto w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                    <LockKeyhole size={22} />
                  </div>

                  <h2
                    id="vault-details-title"
                    className="text-xl font-bold"
                  >
                    Secret Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Item ID: <span className="break-all">{viewingId}</span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={viewLoading}
                  aria-label="Close details"
                  className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
                >
                  <X size={20} />
                </button>
              </div>

              {viewLoading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  Loading secret details...
                </div>
              ) : viewingItem ? (
                <div className="space-y-5">
                  <div>
                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                      Title
                    </p>
                    <p className="break-words font-medium">
                      {viewingItem.title}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                      Username or email
                    </p>
                    <p className="break-all">
                      {viewingItem.username || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                      Password
                    </p>

                    <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700">
                      <p className="min-w-0 flex-1 break-all font-mono text-sm">
                        {showPassword
                          ? viewingItem.password
                          : "•".repeat(
                              Math.min(viewingItem.password.length, 16),
                            )}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
                      Description / notes
                    </p>
                    <div className="min-h-16 whitespace-pre-wrap break-words rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-950">
                      {viewingItem.notes || "No description provided."}
                    </div>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-slate-200 p-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
                    <p className="flex items-start gap-2">
                      <CalendarDays size={15} className="mt-0.5 shrink-0" />
                      <span>
                        Created: {formatDate(viewingItem.createdAt)}
                      </span>
                    </p>
                    <p className="flex items-start gap-2">
                      <RefreshCw size={15} className="mt-0.5 shrink-0" />
                      <span>
                        Last updated: {formatDate(viewingItem.updatedAt)}
                      </span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const item = vaultItems.find(
                          (entry) => entry.id === viewingItem.id,
                        );

                        if (item) {
                          startEditing(item);
                          setViewingId(null);
                          setViewingItem(null);
                          setShowPassword(false);
                        } else {
                          setActionError(
                            "This item is no longer in your vault list. Refresh and try again.",
                          );
                          setViewingId(null);
                          setViewingItem(null);
                        }
                      }}
                      className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                      <Pencil size={16} />
                      Edit Secret
                    </button>

                    <button
                      type="button"
                      onClick={closeDetails}
                      className="rounded-lg border border-slate-300 px-4 py-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-sm text-slate-500">
                  The item could not be loaded. Close this window and try again.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

export default function VaultPage() {
  return (
    <UserProvider>
      <VaultContent />
    </UserProvider>
  );
}
