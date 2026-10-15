
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditLogs, profiles } from "@/lib/schema";
import { requireAdmin } from "@/lib/security/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await requireAdmin();

    if (!admin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const activity = await db
      .select({
        id: auditLogs.id,
        userId: auditLogs.userId,
        email: profiles.email,
        eventType: auditLogs.eventType,
        status: auditLogs.status,
        details: auditLogs.details,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(profiles, eq(auditLogs.userId, profiles.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(200);

    return NextResponse.json(
      { activity },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error) {
    console.error("GET /api/admin/activity failed:", error);

    return NextResponse.json(
      { error: "Failed to load admin activity." },
      { status: 500 }
    );
  }
}
