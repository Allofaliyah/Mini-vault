
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ShieldCheck,
  Smartphone,
  QrCode,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LockKeyhole,
  LockKeyholeOpen,
  ArrowRight,
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";
import { useUser } from "@/context/UserContext";

export default function SetupAuthenticator() {
  const { unlockVault, lockVault } = useUser();

  const [qrCode, setQrCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [vaultUnlocked, setVaultUnlocked] = useState(false);

  const showMessage = (text: string, error = false) => {
    setMessage(text);
    setIsError(error);
  };

  const loadFactors = useCallback(async () => {
    try {
      const supabase = createSupabaseClient();
      const { data, error } = await supabase.auth.mfa.listFactors();

      if (error) throw error;

      const verifiedFactor = data.totp.find(
        (factor) => factor.status === "verified",
      );

      if (verifiedFactor) {
        setFactorId(verifiedFactor.id);
        setMfaEnabled(true);
      } else {
        setFactorId("");
        setMfaEnabled(false);
      }
    } catch {
      showMessage("Could not check your authenticator status.", true);
    }
  }, []);

  useEffect(() => {
    void loadFactors();
  }, [loadFactors]);

  async function setup() {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createSupabaseClient();

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: "totp",
        friendlyName: "MiniVault Authenticator",
      });

      if (error) throw error;

      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      showMessage("Scan the QR code with your authenticator app.");
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not set up your authenticator.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifySetup() {
    if (!factorId || !/^\d{6,8}$/.test(code)) {
      showMessage("Enter a valid authenticator code.", true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const supabase = createSupabaseClient();

      const { data: challenge, error: challengeError } =
        await supabase.auth.mfa.challenge({ factorId });

      if (challengeError || !challenge) {
        throw challengeError ?? new Error("Could not start verification.");
      }

      const { error } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.id,
        code,
      });

      if (error) throw error;

      setQrCode("");
      setCode("");
      await loadFactors();
      showMessage("Authenticator enabled successfully.");
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Verification failed. Try again.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }

  async function unlock() {
    if (!factorId || !/^\d{6,8}$/.test(code)) {
      showMessage("Enter your current authenticator code.", true);
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // The API must verify the code and create a server-side
      // vault session that expires after five minutes.
      await unlockVault(code, factorId);

      setCode("");
      setVaultUnlocked(true);
      showMessage("Vault unlocked. Access expires after five minutes.");
    } catch (error) {
      setVaultUnlocked(false);
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not unlock the vault. Check your code and try again.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }

  async function lock() {
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      // The server must invalidate the vault session here.
      await lockVault();

      setVaultUnlocked(false);
      setCode("");
      showMessage("Your vault has been locked.");
    } catch (error) {
      showMessage(
        error instanceof Error
          ? error.message
          : "Could not lock the vault. Please try again.",
        true,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10 ring-1 ring-emerald-400/20">
            <ShieldCheck className="h-7 w-7 text-emerald-400" />
          </div>
          <div>
            <p className="text-lg font-bold">MiniVault</p>
            <p className="text-sm text-slate-400">Account security</p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5 shadow-2xl sm:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-800">
              {mfaEnabled ? (
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              ) : (
                <Smartphone className="h-6 w-6 text-emerald-400" />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Authenticator and vault access
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Verify with your authenticator to unlock your secure vault.
                Lock it when you finish.
              </p>
              <p className="mt-3 text-sm">
                Authenticator:{" "}
                <span
                  className={
                    mfaEnabled ? "text-emerald-400" : "text-amber-400"
                  }
                >
                  {mfaEnabled ? "Enabled" : "Not configured"}
                </span>
              </p>
            </div>
          </div>

          {!mfaEnabled && !qrCode && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex gap-3">
                  <LockKeyhole className="mt-1 h-5 w-5 shrink-0 text-emerald-400" />
                  <div>
                    <p className="font-medium">Protect your vault</p>
                    <p className="mt-1 text-sm leading-6 text-slate-400">
                      Generate a QR code and scan it with Google Authenticator
                      or another compatible TOTP app.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={setup}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <QrCode className="h-5 w-5" />
                )}
                Generate QR code
                {!loading && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          )}

          {qrCode && !mfaEnabled && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
                <h2 className="mb-4 font-semibold">1. Scan the QR code</h2>

                <div className="mx-auto flex min-h-56 w-full max-w-64 items-center justify-center rounded-2xl bg-white p-4">
                  <img
                    src={
                      qrCode.startsWith("data:")
                        ? qrCode
                        : `data:image/svg+xml;charset=utf-8,${encodeURIComponent(qrCode)}`
                    }
                    alt="MiniVault authenticator QR code"
                    className="h-auto w-full"
                  />
                </div>

                <p className="mt-4 text-center text-sm text-slate-400">
                  Scan this code in your authenticator app.
                </p>
              </div>

              <CodeInput code={code} setCode={setCode} />

              <button
                type="button"
                onClick={verifySetup}
                disabled={loading || !/^\d{6,8}$/.test(code)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                Verify and enable authenticator
              </button>
            </div>
          )}

          {mfaEnabled && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center gap-3">
                  {vaultUnlocked ? (
                    <LockKeyholeOpen className="h-6 w-6 text-emerald-400" />
                  ) : (
                    <LockKeyhole className="h-6 w-6 text-amber-400" />
                  )}
                  <div>
                    <p className="font-semibold">
                      {vaultUnlocked ? "Vault unlocked" : "Vault locked"}
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      {vaultUnlocked
                        ? "Your server-side session should expire in five minutes."
                        : "Enter a fresh code to request secure access."}
                    </p>
                  </div>
                </div>
              </div>

              {!vaultUnlocked && (
                <>
                  <CodeInput code={code} setCode={setCode} />

                  <button
                    type="button"
                    onClick={unlock}
                    disabled={loading || !/^\d{6,8}$/.test(code)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3.5 font-semibold text-slate-950 hover:bg-emerald-300 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <LockKeyholeOpen className="h-5 w-5" />
                    )}
                    Unlock vault
                  </button>
                </>
              )}

              {vaultUnlocked && (
                <button
                  type="button"
                  onClick={lock}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 bg-red-400/10 px-5 py-3.5 font-semibold text-red-300 hover:bg-red-400/20 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <LockKeyhole className="h-5 w-5" />
                  )}
                  Lock vault now
                </button>
              )}

              <button
                type="button"
                onClick={() => void loadFactors()}
                disabled={loading}
                className="w-full text-sm text-slate-400 underline hover:text-white"
              >
                Refresh authenticator status
              </button>
            </div>
          )}

          {message && (
            <div
              role="status"
              className={`mt-5 flex items-start gap-2 rounded-xl border p-3 text-sm ${
                isError
                  ? "border-red-400/20 bg-red-400/5 text-red-300"
                  : "border-emerald-400/20 bg-emerald-400/5 text-emerald-300"
              }`}
            >
              {isError ? (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              ) : (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              )}
              <p>{message}</p>
            </div>
          )}
        </section>

        <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-slate-500">
          <LockKeyhole className="h-3.5 w-3.5" />
          MiniVault never needs to show your stored passwords to an administrator.
        </p>
      </div>
    </main>
  );
}

function CodeInput({
  code,
  setCode,
}: {
  code: string;
  setCode: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-emerald-400" />
        <label htmlFor="auth-code" className="font-semibold">
          Authenticator code
        </label>
      </div>
      <input
        id="auth-code"
        value={code}
        onChange={(event) =>
          setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
        }
        placeholder="Enter your current code"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={8}
        className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3.5 text-lg tracking-[0.2em] outline-none placeholder:text-sm placeholder:tracking-normal focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10"
      />
    </div>
  );
}
