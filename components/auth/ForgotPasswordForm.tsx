"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordForm() {
  const { forgotPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    const result = await forgotPassword(
      email.trim()
    );

    if (!result.success) {
      setError(
        result.error ??
          "Unable to process your request."
      );

      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">
            <ShieldCheck className="h-9 w-9 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white">
            MiniVault
          </h1>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl sm:p-8">

          {success ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />

              <h2 className="mt-5 text-xl font-semibold text-white">
                Check your email
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                If an account exists for this email,
                you'll receive a password reset link.
              </p>

              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white">
                Forgot password?
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Enter your email to receive a secure
                password reset link.
              </p>

              {error && (
                <div className="mt-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-300"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      required
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <LockKeyhole className="h-5 w-5" />
                      Send reset link
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Remember your password?{" "}
                <Link
                  href="/login"
                  className="text-blue-400 hover:text-blue-300"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}