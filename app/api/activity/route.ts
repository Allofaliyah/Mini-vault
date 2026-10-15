
import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/security/auth";

export async function GET() {
  const user = await getCurrentProfile();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await db
    .select({
      id: auditLogs.id,
      eventType: auditLogs.eventType,
      status: auditLogs.status,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(eq(auditLogs.userId, user.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return NextResponse.json({ events });
}
