
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserProvider } from "@/context/UserContext";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <UserProvider>
        <div className="min-h-screen bg-slate-50">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            aria-expanded={sidebarOpen}
            className="fixed left-4 top-4 z-[60] flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:bg-slate-100 md:hidden"
          >
            {sidebarOpen ? (
              <X size={22} />
            ) : (
              <Menu size={22} />
            )}
          </button>

          {/* Mobile backdrop */}
          {sidebarOpen && (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
            />
          )}

          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content */}
          <main className="min-h-screen px-4 pt-20 md:ml-64 md:px-6 md:pt-6">
            {children}
          </main>
        </div>
      </UserProvider>
    </ProtectedRoute>
  );
}
