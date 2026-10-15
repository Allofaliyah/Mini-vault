
import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/schema";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, data.user.id))
    .limit(1);

  if (!profile || !profile.isActive) {
    return null;
  }

  return {
    id: profile.id,
    email: data.user.email ?? profile.email,
    role: profile.role,
  };
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();

  if (!profile || profile.role !== "admin") {
    return null;
  }

  return profile;
}
