
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
  Settings,
  LogOut,
  Vault,
  X,
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Vault",
    href: "/vault",
    icon: LockKeyhole,
  },
  {
    name: "Security",
    href: "/dashboard/security",
    icon: ShieldCheck,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseClient();

    await supabase.auth.signOut();
    onClose();

    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out
        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
    >
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-6">
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Vault size={22} />
          </div>

          <div>
            <h1 className="font-bold text-slate-900">
              MiniVault
            </h1>

            <p className="text-xs text-slate-500">
              Secure storage
            </p>
          </div>
        </Link>

        {/* Close button on mobile */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navigation.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Icon size={19} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Security status */}
      <div className="mx-4 mb-4 shrink-0 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={18}
            className="shrink-0 text-emerald-600"
          />

          <span className="text-sm font-medium text-emerald-700">
            Vault Protected
          </span>
        </div>

        <p className="mt-1 text-xs leading-5 text-emerald-600">
          Your secrets are encrypted.
        </p>
      </div>

      {/* Logout */}
      <div className="shrink-0 border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={19} />
          Logout
        </button>
      </div>
    </aside>
  );
}
