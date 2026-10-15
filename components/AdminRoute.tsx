
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // Not logged in
    if (!user) {
      router.replace("/admin/login");
      return;
    }

    // Logged in but not an admin
    if (role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, role, loading, router]);

  // Check authentication/authorization
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">
          Checking authorization...
        </p>
      </div>
    );
  }

  // Prevent protected content from flashing
  if (!user || role !== "admin") {
    return null;
  }

  return <>{children}</>;
}

