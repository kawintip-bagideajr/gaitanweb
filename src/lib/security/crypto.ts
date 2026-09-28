import "server-only";
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

// Must match the same env var the admin system encrypts stock secrets with
// (APP_ENCRYPTION_KEY, shared across both apps against the same DB) — there
// is no fallback: a missing/misconfigured key must fail loudly at decrypt
// time rather than silently produce garbage or use a guessable default.
function getEncryptionKey(): Buffer {
  const envKey = process.env.APP_ENCRYPTION_KEY;
  if (!envKey || envKey.length !== 64) {
    throw new Error(
      "APP_ENCRYPTION_KEY is missing or not a 64-char hex string — cannot decrypt stock secrets"
    );
  }
  return Buffer.from(envKey, "hex");
}

/**
 * Decrypt AES-256-GCM ciphertext produced by the admin system's `encrypt()`.
 * Format: `ivHex:authTagHex:ciphertextHex`. Returns null if invalid/tampered
 * rather than throwing, so a corrupt stock row degrades to "no code" instead
 * of a 500.
 */
export function decrypt(encryptedPayload: string): string | null {
  try {
    const parts = encryptedPayload.split(":");
    if (parts.length !== 3) return null;

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const iv = Buffer.from(ivHex, "hex");
    const authTag = Buffer.from(authTagHex, "hex");

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    return null;
  }
}
