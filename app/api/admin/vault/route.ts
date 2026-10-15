
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { profiles, vaultItems } from "@/lib/schema";
import { requireAdmin } from "@/lib/security/auth";

export async function GET() {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await db
    .select({
      id: vaultItems.id,
      title: vaultItems.title,
      userId: vaultItems.userId,
      ownerEmail: profiles.email,
      createdAt: vaultItems.createdAt,
      updatedAt: vaultItems.updatedAt,
    })
    .from(vaultItems)
    .innerJoin(profiles, eq(vaultItems.userId, profiles.id))
    .orderBy(desc(vaultItems.updatedAt))
    .limit(200);

  return NextResponse.json({ items });
}
