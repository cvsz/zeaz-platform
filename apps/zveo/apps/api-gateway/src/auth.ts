import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { roleSchema, type Principal } from "@zveo/core";

const principalTokenSchema = z.object({
  sub: z.string().uuid(),
  tenantId: z.string().uuid(),
  roles: z.array(roleSchema).min(1),
  exp: z.number().int().positive(),
});

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export function signServiceToken(payload: z.infer<typeof principalTokenSchema>, secret: string): string {
  const body = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function authenticate(header: string | undefined, secret: string): Principal {
  if (!header?.startsWith("Bearer ")) throw new Error("missing bearer token");
  const token = header.slice("Bearer ".length);
  const parts = token.split(".");
  if (parts.length !== 2) throw new Error("malformed bearer token");
  const [body, signature] = parts;
  if (!body || !signature) throw new Error("malformed bearer token");
  const expected = createHmac("sha256", secret).update(body).digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error("invalid bearer token signature");
  const parsed = principalTokenSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
  if (parsed.exp <= Math.floor(Date.now() / 1000)) throw new Error("bearer token expired");
  return { subject: parsed.sub, tenantId: parsed.tenantId, roles: parsed.roles };
}
