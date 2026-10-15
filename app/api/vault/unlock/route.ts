
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getCurrentProfile } from "@/lib/security/auth";
import { setVaultSession } from "@/lib/security/vault-session";
import { writeAuditEvent } from "@/lib/security/audit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const user = await getCurrentProfile();

  if (!user) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 },
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("code" in body) ||
    typeof body.code !== "string" ||
    !/^\d{6}$/.test(body.code)
  ) {
    return NextResponse.json(
      { error: "Enter your six-digit authenticator code." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();

  const { data: factorData, error: factorError } =
    await supabase.auth.mfa.listFactors();

  const factor = factorData?.totp?.find(
    (item) => item.status === "verified",
  );

  if (factorError || !factor) {
    return NextResponse.json(
      { error: "Set up your authenticator first." },
      { status: 400 },
    );
  }

  const { data: challenge, error: challengeError } =
    await supabase.auth.mfa.challenge({
      factorId: factor.id,
    });

  if (challengeError || !challenge) {
    return NextResponse.json(
      { error: "Could not start verification." },
      { status: 400 },
    );
  }

  const { error: verifyError } =
    await supabase.auth.mfa.verify({
      factorId: factor.id,
      challengeId: challenge.id,
      code: body.code,
    });

  if (verifyError) {
    await writeAuditEvent({
      userId: user.id,
      eventType: "vault_unlock_failed",
      status: "failure",
    }).catch(() => undefined);

    return NextResponse.json(
      { error: "Invalid or expired authenticator code." },
      { status: 401 },
    );
  }

  // Confirm Supabase has upgraded the session's MFA assurance.
  const { data: assurance, error: assuranceError } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (assuranceError || assurance.currentLevel !== "aal2") {
    return NextResponse.json(
      { error: "Additional authentication was not confirmed." },
      { status: 403 },
    );
  }

  const response = NextResponse.json({
    success: true,
    expiresIn: 300,
  });

  setVaultSession(response, user.id);

  await writeAuditEvent({
    userId: user.id,
    eventType: "vault_unlocked",
    status: "success",
  });

  return response;
}
