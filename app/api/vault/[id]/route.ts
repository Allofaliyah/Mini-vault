
import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { vaultItems } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/security/auth";
import { hasVaultSession } from "@/lib/security/vault-session";
import { decrypt } from "@/lib/security/encryption";
import { writeAuditEvent } from "@/lib/security/audit";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await getCurrentProfile();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!hasVaultSession(request, user.id)) {
      return NextResponse.json(
        { error: "Vault locked or session expired. Unlock your vault first." },
        { status: 423 },
      );
    }

    const { id } = await context.params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid vault item ID" },
        { status: 400 },
      );
    }

    const [item] = await db
      .select()
      .from(vaultItems)
      .where(
        and(
          eq(vaultItems.id, id),
          eq(vaultItems.userId, user.id),
        ),
      )
      .limit(1);

    if (!item) {
      return NextResponse.json(
        { error: "Secret not found" },
        { status: 404 },
      );
    }

    // Decrypt sensitive fields only after authentication,
    // vault-unlock validation, and ownership verification.
    const result = {
      id: item.id,
      title: item.title,
      username: item.usernameEncrypted
        ? decrypt(item.usernameEncrypted)
        : "",
      password: decrypt(item.passwordEncrypted),
      notes: item.notesEncrypted
        ? decrypt(item.notesEncrypted)
        : "",
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };

    await writeAuditEvent({
      userId: user.id,
      eventType: "vault_item_read",
      status: "success",
      details: { itemId: item.id },
    });

    return NextResponse.json(
      { item: result },
      {
        status: 200,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          Pragma: "no-cache",
        },
      },
    );
  } catch (error) {
    console.error("GET /api/vault/[id] failed:", error);

    return NextResponse.json(
      { error: "Unable to load this vault item" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await getCurrentProfile();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    if (!hasVaultSession(request, user.id)) {
      return NextResponse.json(
        { error: "Vault locked or session expired" },
        { status: 423 },
      );
    }

    const { id } = await context.params;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Invalid vault item ID" },
        { status: 400 },
      );
    }

    const [deleted] = await db
      .delete(vaultItems)
      .where(
        and(
          eq(vaultItems.id, id),
          eq(vaultItems.userId, user.id),
        ),
      )
      .returning({
        id: vaultItems.id,
      });

    if (!deleted) {
      return NextResponse.json(
        { error: "Secret not found" },
        { status: 404 },
      );
    }

    await writeAuditEvent({
      userId: user.id,
      eventType: "vault_item_deleted",
      status: "success",
      details: { itemId: deleted.id },
    });

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error("DELETE /api/vault/[id] failed:", error);

    return NextResponse.json(
      { error: "Unable to delete this vault item" },
      { status: 500 },
    );
  }
}
