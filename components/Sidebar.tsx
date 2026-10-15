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
} from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase";

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

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    const supabase = createSupabaseClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white md:block">
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex h-20 items-center gap-3 border-b px-6">
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
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
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
        <div className="mx-4 mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={18}
              className="text-emerald-600"
            />

            <span className="text-sm font-medium text-emerald-700">
              Vault Protected
            </span>
          </div>

          <p className="mt-1 text-xs text-emerald-600">
            Your secrets are encrypted.
          </p>
        </div>

        {/* Logout */}
        <div className="border-t p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}