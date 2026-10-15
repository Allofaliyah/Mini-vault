
import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, vaultItems } from "@/lib/schema";
import { requireAdmin } from "@/lib/security/auth";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db
    .select({
      id: profiles.id,
      email: profiles.email,
      role: profiles.role,
      isActive: profiles.isActive,
      createdAt: profiles.createdAt,
    })
    .from(profiles)
    .orderBy(desc(profiles.createdAt))
    .limit(200);

  const counts = await db
    .select({
      userId: vaultItems.userId,
    })
    .from(vaultItems);

  const itemCounts = new Map<string, number>();

  for (const item of counts) {
    itemCounts.set(
      item.userId,
      (itemCounts.get(item.userId) ?? 0) + 1,
    );
  }

  return NextResponse.json({
    users: users.map((user) => ({
      ...user,
      vaultItemCount: itemCounts.get(user.id) ?? 0,
    })),
  });
}
