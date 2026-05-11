export interface JwtPayload { sub: string; exp: number; iat?: number; aud?: string | string[]; iss?: string; [k: string]: unknown }

function b64uToBytes(input: string): Uint8Array {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function verifyHs256(unsigned: string, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
  const sig = b64uToBytes(signature);
  return crypto.subtle.verify("HMAC", key, sig.buffer as ArrayBuffer, new TextEncoder().encode(unsigned));
}

export async function validateJwt(token: string, secret: string, audience?: string): Promise<JwtPayload> {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Malformed JWT");
  const [rawHeader, rawPayload, signature] = parts as [string, string, string];
  const header = JSON.parse(new TextDecoder().decode(b64uToBytes(rawHeader))) as { alg?: string; typ?: string };
  if (header.alg !== "HS256" || header.typ !== "JWT") throw new Error("Unsupported JWT algorithm or type");
  const unsigned = `${rawHeader}.${rawPayload}`;
  if (!(await verifyHs256(unsigned, signature, secret))) throw new Error("JWT signature validation failed");
  const payload = JSON.parse(new TextDecoder().decode(b64uToBytes(rawPayload))) as JwtPayload;
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp <= now) throw new Error("JWT expired");
  if (audience) {
    const validAudience = Array.isArray(payload.aud) ? payload.aud.includes(audience) : payload.aud === audience;
    if (!validAudience) throw new Error("JWT audience mismatch");
  }
  return payload;
}
