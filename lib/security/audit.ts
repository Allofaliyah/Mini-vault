
import "server-only";

import { db } from "@/lib/db";
import { auditLogs } from "@/lib/schema";

type AuditInput = {
  userId: string | null;
  eventType: string;
  status: "success" | "failure" | "warning";
  details?: Record<string, unknown>;
};

export async function writeAuditEvent(event: AuditInput) {
  await db.insert(auditLogs).values({
    userId: event.userId,
    eventType: event.eventType,
    status: event.status,
    details: event.details ?? {},
  });
}
