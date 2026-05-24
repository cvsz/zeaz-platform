import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { z } from "zod";

const EncryptionPayloadSchema = z.object({
  ciphertext: z.string().regex(/^[a-fA-F0-9]+$/),
  iv: z.string().regex(/^[a-fA-F0-9]+$/),
  tag: z.string().regex(/^[a-fA-F0-9]+$/),
});

export type EncryptionPayload = z.infer<typeof EncryptionPayloadSchema>;

export class KeyEncryption {
  private static readonly ALGORITHM = "aes-256-gcm";
  private static readonly IV_LENGTH = 12;
  private static readonly TAG_LENGTH = 16;

  /**
   * Encrypts plaintext data using a 256-bit (32-byte) key with AES-256-GCM.
   * Performs best-effort zeroing out of key materials from memory.
   */
  static encrypt(plaintext: string, key: Uint8Array): EncryptionPayload {
    if (key.length !== 32) {
      throw new Error("INVALID_KEY_LENGTH");
    }

    const iv = randomBytes(this.IV_LENGTH);
    const keyCopy = Buffer.from(key);

    try {
      const cipher = createCipheriv(this.ALGORITHM, keyCopy, iv);
      const encrypted = Buffer.concat([
        cipher.update(plaintext, "utf8"),
        cipher.final(),
      ]);
      const tag = cipher.getAuthTag();

      return {
        ciphertext: encrypted.toString("hex"),
        iv: iv.toString("hex"),
        tag: tag.toString("hex"),
      };
    } finally {
      // Memory wipe key copy
      keyCopy.fill(0);
    }
  }

  /**
   * Decrypts ciphertext back to plaintext using the 256-bit key.
   * Performs best-effort zeroing out of secret buffers/payloads from memory.
   */
  static decrypt(payload: unknown, key: Uint8Array): string {
    if (key.length !== 32) {
      throw new Error("INVALID_KEY_LENGTH");
    }

    const parsed = EncryptionPayloadSchema.parse(payload);
    const keyCopy = Buffer.from(key);
    const ivBuf = Buffer.from(parsed.iv, "hex");
    const tagBuf = Buffer.from(parsed.tag, "hex");
    const ciphertextBuf = Buffer.from(parsed.ciphertext, "hex");

    try {
      const decipher = createDecipheriv(this.ALGORITHM, keyCopy, ivBuf);
      decipher.setAuthTag(tagBuf);

      const decrypted = Buffer.concat([
        decipher.update(ciphertextBuf),
        decipher.final(),
      ]);

      const result = decrypted.toString("utf8");

      // Memory wipe intermediate decrypted buffer
      decrypted.fill(0);

      return result;
    } finally {
      // Memory wipe key copy and buffer variables
      keyCopy.fill(0);
      ivBuf.fill(0);
      tagBuf.fill(0);
      ciphertextBuf.fill(0);
    }
  }
}
