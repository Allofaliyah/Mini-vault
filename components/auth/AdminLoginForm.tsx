
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function AdminLoginForm() {
  const { adminSignIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await adminSignIn(
        email,
        password
      );

      if (!result.success) {
        setError(
          result.error ??
            "Unable to authenticate."
        );

        return;
      }

      /*
       * Navigation is handled by AuthContext.
       *
       * Successful admin login:
       * /admin/login → /admin
       */
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-600/20">
            <ShieldAlert className="h-9 w-9 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            MiniVault Admin
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Restricted administrator access
          </p>
        </div>

        <div className="rounded-2xl border border-red-900/40 bg-slate-900 p-6 shadow-2xl sm:p-8">

          <div className="mb-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-red-400" />

              <h2 className="text-xl font-semibold text-white">
                Administrator sign in
              </h2>
            </div>

            <p className="mt-2 text-sm text-slate-400">
              This area is restricted to authorized
              MiniVault administrators.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
            >
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label
                htmlFor="admin-email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Administrator email
              </label>

              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@example.com"
                  required
                  autoComplete="username"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none placeholder:text-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <div className="relative">
                <KeyRound
                  aria-hidden="true"
                  className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500"
                />

                <input
                  id="admin-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter administrator password"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-12 text-white outline-none placeholder:text-slate-600 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-5 w-5" />
                  Admin sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-6 border-t border-slate-800 pt-5 text-center">
            <Link
              href="/login"
              className="text-sm text-slate-400 hover:text-white"
            >
              Return to user login
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          Unauthorized access attempts may be logged.
        </p>
      </div>
    </main>
  );
}
