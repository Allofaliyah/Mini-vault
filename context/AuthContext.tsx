
"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createSupabaseClient } from "@/lib/supabase";

export type UserRole = "user" | "admin";

type AuthResult = {
  success: boolean;
  error?: string;
};

type AuthContextType = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<AuthResult>;
  signUp: (
    email: string,
    password: string
  ) => Promise<AuthResult>;
  adminSignIn: (
    email: string,
    password: string
  ) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
};

const supabase = createSupabaseClient();

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// Always read roles from public.profiles, not user_metadata.
async function fetchUserRole(
  userId: string
): Promise<UserRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", userId)
    .single();

  if (error || !data) {
    console.error("Could not load profile role:", error?.message);
    return null;
  }

  if (data.is_active === false) {
    return null;
  }

  if (data.role === "admin" || data.role === "user") {
    return data.role;
  }

  return null;
}

export function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Load the current session and its database role.
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;
        if (!mounted) return;

        if (!session?.user) {
          setUser(null);
          setRole(null);
          return;
        }

        const currentRole = await fetchUserRole(session.user.id);

        if (!mounted) return;

        setUser(session.user);
        setRole(currentRole);
      } catch (error) {
        console.error("Authentication initialization failed:", error);

        if (mounted) {
          setUser(null);
          setRole(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;

      if (!currentUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      setRole(null);

      // Fetch the profile after the auth callback completes.
      void (async () => {
        const currentRole = await fetchUserRole(currentUser.id);

        if (mounted) {
          setRole(currentRole);
          setLoading(false);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Standard login: redirect according to the database role.
  async function signIn(
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return { success: false, error: "Email is required." };
      }

      if (!password) {
        return { success: false, error: "Password is required." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message ?? "Unable to sign in.",
        };
      }

      const currentRole = await fetchUserRole(data.user.id);

      if (!currentRole) {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);

        return {
          success: false,
          error: "Your profile or account status could not be verified.",
        };
      }

      setUser(data.user);
      setRole(currentRole);

      router.push(
        currentRole === "admin" ? "/admin" : "/dashboard"
      );
      router.refresh();

      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign in.",
      };
    }
  }

  // Public registration always creates a normal user.
  async function signUp(
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return { success: false, error: "Email is required." };
      }

      if (!password) {
        return { success: false, error: "Password is required." };
      }

      if (password.length < 12) {
        return {
          success: false,
          error: "Password must be at least 12 characters.",
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            role: "user",
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If sign-up created a session, clear it so the user
      // finishes registration at the login page.
      if (data.session) {
        await supabase.auth.signOut();
      }

      setUser(null);
      setRole(null);

      router.push("/login");
      router.refresh();

      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to create account.",
      };
    }
  }

  // Admin login: reject accounts without a database admin role.
  async function adminSignIn(
    email: string,
    password: string
  ): Promise<AuthResult> {
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return { success: false, error: "Email is required." };
      }

      if (!password) {
        return { success: false, error: "Password is required." };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error || !data.user) {
        return {
          success: false,
          error: "Invalid admin credentials.",
        };
      }

      const accountRole = await fetchUserRole(data.user.id);

      if (accountRole !== "admin") {
        await supabase.auth.signOut();
        setUser(null);
        setRole(null);

        return {
          success: false,
          error: "This account does not have administrator access.",
        };
      }

      setUser(data.user);
      setRole("admin");

      router.push("/admin");
      router.refresh();

      return { success: true };
    } catch (error) {
      console.error("Admin sign-in error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to sign in as administrator.",
      };
    }
  }

  async function forgotPassword(
    email: string
  ): Promise<AuthResult> {
    try {
      const cleanEmail = email.trim().toLowerCase();

      if (!cleanEmail) {
        return { success: false, error: "Email is required." };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        cleanEmail,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Forgot password error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to send password reset email.",
      };
    }
  }

  async function resetPassword(
    password: string
  ): Promise<AuthResult> {
    try {
      if (!password) {
        return { success: false, error: "Password is required." };
      }

      if (password.length < 12) {
        return {
          success: false,
          error: "Password must be at least 12 characters.",
        };
      }

      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return {
          success: false,
          error: "Password updated, but the user session was not found.",
        };
      }

      const currentRole = await fetchUserRole(data.user.id);

      if (!currentRole) {
        return {
          success: false,
          error: "Password updated, but your profile could not be verified.",
        };
      }

      setUser(data.user);
      setRole(currentRole);

      router.push(
        currentRole === "admin" ? "/admin" : "/dashboard"
      );
      router.refresh();

      return { success: true };
    } catch (error) {
      console.error("Reset password error:", error);

      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unable to reset password.",
      };
    }
  }

  async function signOut(): Promise<void> {
    const currentRole = role;

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Sign out error:", error.message);
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setUser(null);
      setRole(null);

      router.push(
        currentRole === "admin" ? "/admin/login" : "/login"
      );
      router.refresh();
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        signIn,
        signUp,
        adminSignIn,
        forgotPassword,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
