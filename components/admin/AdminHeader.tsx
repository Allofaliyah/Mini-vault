"use client";

import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminHeader() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 md:px-8">
      <div>
        <p className="text-sm font-semibold text-slate-900">
          Admin Panel
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            Administrator
          </p>

          <p className="text-xs text-slate-500">
            {user?.email}
          </p>
        </div>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100">
          <ShieldCheck
            size={18}
            className="text-red-600"
          />
        </div>
      </div>
    </header>
  );
}