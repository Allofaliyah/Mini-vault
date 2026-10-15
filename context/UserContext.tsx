
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

export type VaultItem = {
  id: string;
  title: string;
  username?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type UserProfile = {
  id: string;
  displayName: string | null;
  email: string | null;
  role: "user" | "admin";
  isActive: boolean;
  createdAt?: string;
};

export type ActivityItem = {
  id: string;
  eventType?: string;
  status?: string;
  details?: Record<string, unknown>;
  createdAt?: string;
};

type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

type UserContextType = {
  profile: UserProfile | null;
  vaultItems: VaultItem[];
  activity: ActivityItem[];
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  refreshVault: () => Promise<void>;
  refreshActivity: () => Promise<void>;
  createVaultItem: (item: {
    title: string;
    username?: string;
    password: string;
    notes?: string;
  }) => Promise<ApiResult<VaultItem>>;
  updateVaultItem: (
    id: string,
    changes: Partial<{
      title: string;
      username: string;
      password: string;
      notes: string;
    }>
  ) => Promise<ApiResult<VaultItem>>;
  deleteVaultItem: (id: string) => Promise<ApiResult<null>>;
  unlockVault: (
    code: string,
    factorId?: string
  ) => Promise<ApiResult<unknown>>;
  lockVault: () => Promise<ApiResult<null>>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

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
        ...(options?.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options?.headers,
      },
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        data: null,
        error:
          result.error || `Request failed (${response.status}).`,
      };
    }

    return {
      data: result as T,
      error: null,
    };
  } catch {
    return {
      data: null,
      error: "Unable to connect to the server.",
    };
  }
}

export function UserProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user, role, loading: authLoading } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!user || role !== "user") {
      setProfile(null);
      return;
    }

    const result = await request<{ user: UserProfile }>(
      "/api/users"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setProfile(result.data?.user ?? null);
    setError(null);
  }, [user, role]);

  const refreshVault = useCallback(async () => {
    if (!user || role !== "user") {
      setVaultItems([]);
      return;
    }

    const result = await request<{ items: VaultItem[] }>(
      "/api/vault"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setVaultItems(result.data?.items ?? []);
  }, [user, role]);

  const refreshActivity = useCallback(async () => {
    if (!user || role !== "user") {
      setActivity([]);
      return;
    }

    const result = await request<{ activity: ActivityItem[] }>(
      "/api/activity"
    );

    if (result.error) {
      setError(result.error);
      return;
    }

    setActivity(result.data?.activity ?? []);
  }, [user, role]);

  const createVaultItem = useCallback(
    async (item: {
      title: string;
      username?: string;
      password: string;
      notes?: string;
    }): Promise<ApiResult<VaultItem>> => {
      const result = await request<{ item: VaultItem }>(
        "/api/vault",
        {
          method: "POST",
          body: JSON.stringify(item),
        }
      );

      if (result.error) {
        return { data: null, error: result.error };
      }

      await refreshVault();

      return {
        data: result.data?.item ?? null,
        error: null,
      };
    },
    [refreshVault]
  );

  const updateVaultItem = useCallback(
    async (
      id: string,
      changes: Partial<{
        title: string;
        username: string;
        password: string;
        notes: string;
      }>
    ): Promise<ApiResult<VaultItem>> => {
      const result = await request<{ item: VaultItem }>(
        `/api/vault/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(changes),
        }
      );

      if (result.error) {
        return { data: null, error: result.error };
      }

      await refreshVault();

      return {
        data: result.data?.item ?? null,
        error: null,
      };
    },
    [refreshVault]
  );

  const deleteVaultItem = useCallback(
    async (id: string): Promise<ApiResult<null>> => {
      const result = await request<null>(
        `/api/vault/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );

      if (result.error) {
        return { data: null, error: result.error };
      }

      await refreshVault();

      return { data: null, error: null };
    },
    [refreshVault]
  );

  const unlockVault = useCallback(
    async (
      code: string,
      factorId?: string
    ): Promise<ApiResult<unknown>> => {
      return request("/api/vault/unlock", {
        method: "POST",
        body: JSON.stringify({ code, factorId }),
      });
    },
    []
  );

  const lockVault = useCallback(async (): Promise<ApiResult<null>> => {
    const result = await request<null>("/api/vault/lock", {
      method: "POST",
    });

    if (!result.error) {
      setVaultItems([]);
    }

    return result;
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadUserData() {
      if (authLoading) return;

      if (!user || role !== "user") {
        setProfile(null);
        setVaultItems([]);
        setActivity([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all([
          request<{ user: UserProfile }>("/api/users"),
          request<{ items: VaultItem[] }>("/api/vault"),
          request<{ activity: ActivityItem[] }>("/api/activity"),
        ]);

        if (cancelled) return;

        const failed = results.find((result) => result.error);

        if (failed?.error) {
          setError(failed.error);
        }

        if (!results[0].error) {
          setProfile(results[0].data?.user ?? null);
        }

        if (!results[1].error) {
          setVaultItems(results[1].data?.items ?? []);
        }

        if (!results[2].error) {
          setActivity(results[2].data?.activity ?? []);
        }
      } catch {
        if (!cancelled) {
          setError("Unable to load your account data.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUserData();

    return () => {
      cancelled = true;
    };
  }, [user, role, authLoading]);

  return (
    <UserContext.Provider
      value={{
        profile,
        vaultItems,
        activity,
        loading: authLoading || loading,
        error,
        refreshProfile,
        refreshVault,
        refreshActivity,
        createVaultItem,
        updateVaultItem,
        deleteVaultItem,
        unlockVault,
        lockVault,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error(
      "useUser must be used inside UserProvider"
    );
  }

  return context;
}
