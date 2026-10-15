
import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

function getKey(): Buffer {
  const encoded = process.env.VAULT_ENCRYPTION_KEY;

  if (!encoded) {
    throw new Error("VAULT_ENCRYPTION_KEY is missing");
  }

  const key = Buffer.from(encoded, "base64");

  if (key.length !== 32) {
    throw new Error(
      "VAULT_ENCRYPTION_KEY must decode to 32 bytes",
    );
  }

  return key;
}

export function encrypt(value: string): string {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), nonce);

  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    nonce.toString("base64"),
    tag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(".");
}

export function decrypt(value: string): string {
  const parts = value.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted value");
  }

  const [nonceText, tagText, ciphertextText] = parts;

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getKey(),
    Buffer.from(nonceText, "base64"),
  );

  decipher.setAuthTag(Buffer.from(tagText, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertextText, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
