import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { vaultItems } from "@/lib/schema";
import { getCurrentProfile } from "@/lib/security/auth";
import { hasVaultSession } from "@/lib/security/vault-session";
import { encrypt } from "@/lib/security/encryption";
import { writeAuditEvent } from "@/lib/security/audit";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
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
        { error: "Unlock your vault first" },
        { status: 423 },
      );
    }

    const rows = await db
      .select({
        id: vaultItems.id,
        title: vaultItems.title,
        createdAt: vaultItems.createdAt,
        updatedAt: vaultItems.updatedAt,
      })
      .from(vaultItems)
      .where(eq(vaultItems.userId, user.id))
      .orderBy(desc(vaultItems.updatedAt));

    return NextResponse.json({
      items: rows.map((item) => ({
        ...item,
        username: null,
        notes: null,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Could not load vault items" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
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
        { error: "Unlock your vault first" },
        { status: 423 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON" },
        { status: 400 },
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      !("password" in body) ||
      typeof body.password !== "string"
    ) {
      return NextResponse.json(
        { error: "A valid password or secret is required" },
        { status: 400 },
      );
    }

    const title =
      "title" in body && typeof body.title === "string"
        ? body.title.trim()
        : "name" in body && typeof body.name === "string"
          ? body.name.trim()
          : "";

    const password = body.password;

    const username =
      "username" in body && typeof body.username === "string"
        ? body.username.trim()
        : "";

    const notes =
      "notes" in body && typeof body.notes === "string"
        ? body.notes
        : "";

    if (
      !title ||
      title.length < 5 ||
      title.length > 200 ||
      !password ||
      password.length < 10 ||
      password.length > 10000
    ) {
      return NextResponse.json(
        {
          error:
            "Title must be 5–200 characters and the secret must be 10–10000 characters.",
        },
        { status: 400 },
      );
    }

    if (username.length > 320 || notes.length > 10000) {
      return NextResponse.json(
        { error: "Username or notes exceed the allowed length." },
        { status: 400 },
      );
    }

    const [item] = await db
      .insert(vaultItems)
      .values({
        userId: user.id,
        title,
        usernameEncrypted: username ? encrypt(username) : null,
        passwordEncrypted: encrypt(password),
        notesEncrypted: notes ? encrypt(notes) : null,
      })
      .returning({
        id: vaultItems.id,
        title: vaultItems.title,
        createdAt: vaultItems.createdAt,
        updatedAt: vaultItems.updatedAt,
      });

    await writeAuditEvent({
      userId: user.id,
      eventType: "vault_item_created",
      status: "success",
      details: { itemId: item.id },
    });

    return NextResponse.json(
      {
        item: {
          ...item,
          username: username || null,
          notes: notes || null,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save vault item" },
      { status: 500 },
    );
  }
}