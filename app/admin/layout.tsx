
"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminRoute from "@/components/AdminRoute";
import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Keep the admin login page separate from the protected dashboard.
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <AdminRoute>
      <AdminProvider>
        <div className="min-h-screen bg-slate-100">
          <AdminSidebar />

          <main className="min-h-screen md:ml-64">
            <AdminHeader />
            {children}
          </main>
        </div>
      </AdminProvider>
    </AdminRoute>
  );
}
