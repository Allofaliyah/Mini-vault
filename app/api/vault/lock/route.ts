
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/security/auth";
import { clearVaultSession } from "@/lib/security/vault-session";

export async function POST() {
  const user = await getCurrentProfile();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ success: true });
  clearVaultSession(response);

  return response;
}
