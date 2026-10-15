
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";

export type AdminUser = {
  id: string;
  email: string | null;
  role: "user" | "admin";
  isActive: boolean;
  createdAt?: string;
};

export type AdminVaultItem = {
  id: string;
  userId: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AdminActivityItem = {
  id: string;
  userId?: string | null;
  eventType?: string;
  status?: string;
  details?: Record<string, unknown>;
  createdAt?: string;
};

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

type AdminContextType = {
  users: AdminUser[];
  vaultItems: AdminVaultItem[];
  activity: AdminActivityItem[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
  refreshVault: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  updateUser: (
    userId: string,
    changes: { role?: "user" | "admin"; isActive?: boolean }
  ) => Promise<ApiResult<unknown>>;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      ...options,
      credentials: "same-origin",
      cache: "no-store",
      headers: {
        ...(options?.body ? { "Content-Type": "application/json" } : {}),
        ...options?.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        data: null,
        error: result.error || `Request failed (${response.status}).`,
      };
    }

    return { data: result as T, error: null };
  } catch {
    return { data: null, error: "Unable to connect to the server." };
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const { user, role, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [vaultItems, setVaultItems] = useState<AdminVaultItem[]>([]);
  const [activity, setActivity] = useState<AdminActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUsers = useCallback(async () => {
    if (!user || role !== "admin") {
      setUsers([]);
      return;
    }

    const result = await request<{ users: AdminUser[] }>(
      "/api/admin/users"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setUsers(result.data?.users ?? []);
  }, [user, role]);

  const refreshVault = useCallback(async () => {
    if (!user || role !== "admin") {
      setVaultItems([]);
      return;
    }

    const result = await request<{ items: AdminVaultItem[] }>(
      "/api/admin/vault"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setVaultItems(result.data?.items ?? []);
  }, [user, role]);

  const refreshActivity = useCallback(async () => {
    if (!user || role !== "admin") {
      setActivity([]);
      return;
    }

    const result = await request<{ activity: AdminActivityItem[] }>(
      "/api/admin/activity"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setActivity(result.data?.activity ?? []);
  }, [user, role]);

  const updateUser = useCallback(
    async (
      userId: string,
      changes: { role?: "user" | "admin"; isActive?: boolean }
    ): Promise<ApiResult<unknown>> => {
      const result = await request<unknown>("/api/admin/users", {
        method: "PATCH",
        body: JSON.stringify({ userId, ...changes }),
      });

      if (result.error) return result;

      await refreshUsers();
      return result;
    },
    [refreshUsers]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAdminData() {
      if (authLoading) return;

      setError(null);

      if (!user || role !== "admin") {
        setUsers([]);
        setVaultItems([]);
        setActivity([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const results = await Promise.all([
          request<{ users: AdminUser[] }>("/api/admin/users"),
          request<{ items: AdminVaultItem[] }>("/api/admin/vault"),
          request<{ activity: AdminActivityItem[] }>("/api/admin/activity"),
        ]);

        if (cancelled) return;

        const failed = results.find((result) => result.error);

        if (failed?.error) setError(failed.error);

        if (!results[0].error) {
          setUsers(results[0].data?.users ?? []);
        }

        if (!results[1].error) {
          setVaultItems(results[1].data?.items ?? []);
        }

        if (!results[2].error) {
          setActivity(results[2].data?.activity ?? []);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadAdminData();

    return () => {
      cancelled = true;
    };
  }, [user, role, authLoading]);

  return (
    <AdminContext.Provider
      value={{
        users,
        vaultItems,
        activity,
        loading: authLoading || loading,
        error,
        refreshUsers,
        refreshVault,
        refreshActivity,
        updateUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);

  if (!context) {
    throw new Error("useAdmin must be used inside AdminProvider");
  }

  return context;
}
