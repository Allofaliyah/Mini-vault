
"use client";

import {
  ArrowUpRight,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";


export default function DashboardPage() {
  const { user } = useAuth();

  return (
 
      <div className="p-6 md:p-8">

        {/* Header */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Your MiniVault
          </h1>

          <p className="mt-2 text-slate-500">
            Keep your sensitive information protected in one secure place.
          </p>

          {user?.email && (
            <p className="mt-2 text-sm text-slate-400">
              Signed in as {user.email}
            </p>
          )}
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* Vault */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
              <LockKeyhole className="text-blue-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Vault
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Store passwords, accounts, notes and other sensitive
              information securely.
            </p>

            <Link
              href="/vault"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Open Vault
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Security */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck className="text-emerald-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Security
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Review your account security and authentication settings.
            </p>

            <Link
              href="/dashboard/security"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Security Settings
              <ArrowUpRight size={16} />
            </Link>
          </div>

          {/* Protected Data */}
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50">
              <KeyRound className="text-purple-600" />
            </div>

            <h2 className="mt-5 text-lg font-semibold">
              Protected Data
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Your vault information is encrypted before being stored.
            </p>

            <span className="mt-5 inline-block text-sm font-semibold text-purple-600">
              Encryption enabled
            </span>
          </div>

        </div>
      </div>
    
  );
}

