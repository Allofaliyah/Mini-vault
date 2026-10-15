
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Sun,
  Moon,
  ShieldCheck,
  Trash2,
  Loader2,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUser } from "@/context/UserContext";
import { createSupabaseClient } from "@/lib/supabase";

const supabase = createSupabaseClient();

export default function SettingsPage() {
  const { user, role, loading: authLoading, signOut } = useAuth();

  const {
    profile,
    loading: userLoading,
    error: profileError,
    refreshProfile,
  } = useUser();

  const [displayName, setDisplayName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [notice, setNotice] = useState<{
    text: string;
    error: boolean;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? "");
    }

    setEmailInput(user?.email ?? profile?.email ?? "");
  }, [profile, user?.email]);

  useEffect(() => {
    try {
      const isDark =
        window.localStorage.getItem("minivault-theme") === "dark";

      setDarkMode(isDark);
      document.documentElement.classList.toggle("dark", isDark);
    } catch {
      // Theme preferences are optional.
    }
  }, []);

  function showNotice(text: string, error = false) {
    setNotice({ text, error });
  }

  async function saveName() {
    const name = displayName.trim();

    if (!name || name.length > 80) {
      showNotice(
        "Enter a display name between 1 and 80 characters.",
        true
      );
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      const response = await fetch("/api/users", {
        method: "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error ?? "Could not save your name.");
      }

      await refreshProfile();
      setEditingName(false);
      showNotice("Display name updated successfully.");
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not save your name.",
        true
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveEmail() {
    const email = emailInput.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showNotice("Enter a valid email address.", true);
      return;
    }

    setSaving(true);
    setNotice(null);

    try {
      const { error } = await supabase.auth.updateUser({ email });

      if (error) throw error;

      setEditingEmail(false);
      setEmailInput(user?.email ?? "");

      showNotice(
        "Email change requested. Follow Supabase's confirmation instructions. Your email may not change until confirmation is complete."
      );
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Could not update email.",
        true
      );
    } finally {
      setSaving(false);
    }
  }

  function toggleTheme() {
    const next = !darkMode;

    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);

    try {
      window.localStorage.setItem(
        "minivault-theme",
        next ? "dark" : "light"
      );
    } catch {
      // The current page theme can still change.
    }
  }

  async function deleteAccount() {
    if (deleteConfirmation !== "DELETE") {
      showNotice('Type "DELETE" to confirm.', true);
      return;
    }

    setDeleting(true);
    setNotice(null);

    try {
      const response = await fetch("/api/users/delete-account", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error ?? "Account deletion failed.");
      }

      await signOut();
    } catch (error) {
      showNotice(
        error instanceof Error ? error.message : "Account deletion failed.",
        true
      );
      setDeleting(false);
    }
  }

  if (authLoading || userLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading your settings...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-3 text-slate-500">
          Please sign in to manage your settings.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-white"
        >
          Sign in
        </Link>
      </div>
    );
  }

  if (role !== "user") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Settings unavailable</h1>
        <p className="mt-2 text-slate-500">
          These settings are for user accounts. Please use the appropriate
          dashboard for your account role.
        </p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-3 text-sm text-red-600">
          {profileError ?? "Your profile could not be loaded."}
        </p>
        <button
          type="button"
          onClick={() => void refreshProfile()}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!profile.isActive) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Account unavailable</h1>
        <p className="mt-2 text-slate-500">
          Your account is inactive. Contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 text-slate-900 dark:bg-slate-950 dark:text-white md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage your MiniVault profile and preferences.
        </p>
      </div>

      {notice && (
        <div
          role="status"
          className={`mb-6 flex gap-2 rounded-xl border p-4 text-sm ${
            notice.error
              ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950"
          }`}
        >
          {notice.error ? (
            <AlertCircle size={18} />
          ) : (
            <CheckCircle2 size={18} />
          )}
          {notice.text}
        </div>
      )}

      <div className="max-w-2xl space-y-4">
        <section className="rounded-xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <User />
              <div>
                <h2 className="font-semibold">Display name</h2>
                <p className="text-sm text-slate-500">
                  {profile.displayName || "No display name set"}
                </p>
              </div>
            </div>
            {!editingName && (
              <button
                type="button"
                onClick={() => {
                  setDisplayName(profile.displayName ?? "");
                  setEditingName(true);
                  setNotice(null);
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {editingName && (
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void saveName();
              }}
            >
              <label htmlFor="displayName" className="text-sm font-medium">
                Your name
              </label>
              <input
                id="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={80}
                required
                className="w-full rounded-lg border bg-transparent px-3 py-2"
              />
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingName(false);
                    setDisplayName(profile.displayName ?? "");
                  }}
                  className="flex items-center gap-2 rounded-lg border px-4 py-2"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Mail />
              <div className="min-w-0">
                <h2 className="font-semibold">Email address</h2>
                <p className="break-all text-sm text-slate-500">
                  {user.email ?? profile.email ?? "No email available"}
                </p>
              </div>
            </div>
            {!editingEmail && (
              <button
                type="button"
                onClick={() => {
                  setEmailInput(user.email ?? "");
                  setEditingEmail(true);
                  setNotice(null);
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Edit
              </button>
            )}
          </div>

          {editingEmail && (
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void saveEmail();
              }}
            >
              <label htmlFor="email" className="text-sm font-medium">
                New email address
              </label>
              <input
                id="email"
                type="email"
                value={emailInput}
                onChange={(event) => setEmailInput(event.target.value)}
                autoComplete="email"
                required
                className="w-full rounded-lg border bg-transparent px-3 py-2"
              />
              <p className="text-xs text-slate-500">
                Supabase may require email confirmation.
              </p>
              <div className="flex gap-2">
                <button
                  disabled={saving}
                  className="rounded-lg bg-emerald-500 px-4 py-2 font-medium text-slate-950 disabled:opacity-50"
                >
                  {saving ? "Requesting..." : "Request change"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingEmail(false);
                    setEmailInput(user.email ?? "");
                  }}
                  className="rounded-lg border px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="flex items-center justify-between gap-4 rounded-xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon /> : <Sun />}
            <div>
              <h2 className="font-semibold">Theme</h2>
              <p className="text-sm text-slate-500">
                Choose your preferred appearance.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            aria-pressed={darkMode}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            {darkMode ? "Dark" : "Light"}
          </button>
        </section>

        <section className="flex items-center justify-between gap-4 rounded-xl border bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            <div>
              <h2 className="font-semibold">Account security</h2>
              <p className="text-sm text-slate-500">
                Manage your authenticator and vault lock settings.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/security"
            className="shrink-0 rounded-lg border px-4 py-2 text-sm"
          >
            Manage
          </Link>
        </section>

        <section className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-center gap-3">
            <Trash2 className="text-red-600" />
            <div>
              <h2 className="font-semibold text-red-800 dark:text-red-300">
                Delete account
              </h2>
              <p className="text-sm text-red-700 dark:text-red-400">
                Permanently delete your account and associated vault data.
              </p>
            </div>
          </div>

          {!confirmDelete && (
            <button
              type="button"
              onClick={() => {
                setConfirmDelete(true);
                setNotice(null);
              }}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white"
            >
              Delete account
            </button>
          )}

          {confirmDelete && (
            <form
              className="mt-4 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void deleteAccount();
              }}
            >
              <label htmlFor="delete-confirm" className="text-sm">
                Type DELETE to confirm.
              </label>
              <input
                id="delete-confirm"
                value={deleteConfirmation}
                onChange={(event) =>
                  setDeleteConfirmation(event.target.value)
                }
                autoComplete="off"
                required
                className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-slate-900"
              />
              <div className="flex gap-2">
                <button
                  disabled={deleting || deleteConfirmation !== "DELETE"}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white disabled:opacity-50"
                >
                  {deleting && (
                    <Loader2 className="animate-spin" size={16} />
                  )}
                  Confirm deletion
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteConfirmation("");
                  }}
                  className="rounded-lg border border-red-300 px-4 py-2"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

        <p className="text-xs text-slate-500">
          Account role: {profile.role}. Role and account status can only be
          changed by authorized administrative operations.
        </p>
      </div>
    </div>
  );
}
