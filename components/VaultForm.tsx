"use client";

import { FormEvent, useState } from "react";
import {
  Eye,
  EyeOff,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";

export default function VaultForm() {
  const { createVaultItem } = useUser();

  const [title, setTitle] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setSuccess("");

    if (!title.trim()) {
      setError("Please enter a name for this secret.");
      return;
    }

    if (!password) {
      setError("Please enter the password or secret you want to save.");
      return;
    }

    setSaving(true);

    try {
      const result = await createVaultItem({
        title: title.trim(),
        username: username.trim(),
        password,
        notes: notes.trim(),
      });

      if (result.error) {
        setError(result.error);
        return;
      }

      setTitle("");
      setUsername("");
      setPassword("");
      setNotes("");
      setShowPassword(false);
      setSuccess("Secret saved successfully.");
    } catch {
      setError("Unable to save your secret. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-5">
      <div>
        <label
          htmlFor="vault-title"
          className="mb-2 block text-sm font-medium"
        >
          Name *
        </label>

        <input
          id="vault-title"
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
          placeholder="e.g. GitHub"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          autoComplete="off"
          required
          disabled={saving}
        />
      </div>

      <div>
        <label
          htmlFor="vault-username"
          className="mb-2 block text-sm font-medium"
        >
          Username / Email
        </label>

        <input
          id="vault-username"
          className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
          placeholder="username@example.com"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="off"
          disabled={saving}
        />
      </div>

      <div>
        <label
          htmlFor="vault-password"
          className="mb-2 block text-sm font-medium"
        >
          Password / Secret *
        </label>

        <div className="relative">
          <input
            id="vault-password"
            className="w-full rounded-lg border border-slate-200 bg-white p-3 pr-12 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password or secret"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            required
            disabled={saving}
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>
      </div>

      <div>
        <label
          htmlFor="vault-notes"
          className="mb-2 block text-sm font-medium"
        >
          Private Notes / Description
        </label>

        <textarea
          id="vault-notes"
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-500 dark:border-slate-700 dark:bg-slate-950"
          placeholder="Describe what this secret is for..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          disabled={saving}
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
        >
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={saving || !title.trim() || !password}
        className="flex w-fit items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {saving ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <Save size={18} />
        )}
        {saving ? "Saving Secret..." : "Save Secret"}
      </button>
    </form>
  );
}
