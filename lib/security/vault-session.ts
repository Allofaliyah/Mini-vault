
import "server-only";

import {
  createHmac,
  timingSafeEqual,
} from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "vault_unlock";
const SESSION_SECONDS = 300;

function getSecret() {
  const secret = process.env.VAULT_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error(
      "VAULT_SESSION_SECRET must be at least 32 characters",
    );
  }

  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getSecret())
    .update(payload)
    .digest("base64url");
}

export function setVaultSession(
  response: NextResponse,
  userId: string,
) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = JSON.stringify({ userId, expiresAt });
  const encoded = Buffer.from(payload).toString("base64url");
  const token = `${encoded}.${sign(encoded)}`;

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_SECONDS,
  });
}

export function hasVaultSession(
  request: NextRequest,
  userId: string,
) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [encoded, suppliedSignature, ...rest] = token.split(".");
  if (!encoded || !suppliedSignature || rest.length > 0) {
    return false;
  }

  try {
    const expectedSignature = sign(encoded);
    const supplied = Buffer.from(suppliedSignature);
    const expected = Buffer.from(expectedSignature);

    if (
      supplied.length !== expected.length ||
      !timingSafeEqual(supplied, expected)
    ) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(encoded, "base64url").toString("utf8"),
    ) as { userId?: unknown; expiresAt?: unknown };

    return (
      payload.userId === userId &&
      typeof payload.expiresAt === "number" &&
      Number.isSafeInteger(payload.expiresAt) &&
      payload.expiresAt > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
}

export function clearVaultSession(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
