import { createHmac } from "node:crypto";
import { z } from "zod";

const serviceRoleSchema = z.enum(["owner", "admin", "producer", "operator", "viewer", "service"]);

const DEFAULT_SHARED_SECRET = "development-only-signing-key-change-before-production";
const DEFAULT_SUBJECT = "00000000-0000-4000-8000-000000000101";
const DEFAULT_TENANT_ID = "00000000-0000-4000-8000-000000000102";
const DEFAULT_PROJECT_ID = "00000000-0000-4000-8000-000000000103";
const DEFAULT_TOKEN_TTL_SECONDS = 3600;
const DEFAULT_ROLES = ["service"] as const;

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8").toString("base64url");
}

function parseRoles(rawRoles: string | readonly string[] | undefined): string[] {
  const values = Array.isArray(rawRoles)
    ? rawRoles
    : typeof rawRoles === "string"
      ? rawRoles.split(",")
      : DEFAULT_ROLES;

  const normalized: string[] = [];
  for (const rawRole of values) {
    const value = String(rawRole).trim();
    if (!value) {
      continue;
    }

    const parsedRole = serviceRoleSchema.parse(value);
    if (!normalized.includes(parsedRole)) {
      normalized.push(parsedRole);
    }
  }

  return normalized.length > 0 ? normalized : [...DEFAULT_ROLES];
}

function resolveInt(value: string | number | undefined, fallback: number): number {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveSharedSecret(explicitSecret?: string): string {
  const secret = explicitSecret ?? process.env.AUTH_SHARED_SECRET;
  if (secret && secret.trim()) {
    return secret.trim();
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("missing required secret AUTH_SHARED_SECRET");
  }

  return DEFAULT_SHARED_SECRET;
}

export interface ServiceTokenOptions {
  secret?: string;
  subject?: string;
  tenantId?: string;
  roles?: string | readonly string[];
  ttlSeconds?: string | number;
  now?: Date;
}

export interface DashboardRuntimeOptions {
  apiBaseUrl: string;
  tenantId: string;
  projectId: string;
  subject: string;
  roles: readonly string[];
}

export function getDashboardRuntimeOptions(): DashboardRuntimeOptions {
  const apiBaseUrl = process.env.ZVEO_API_URL ?? "http://localhost:8080";
  const subject = process.env.ZVEO_SERVICE_SUBJECT ?? DEFAULT_SUBJECT;
  const tenantId = process.env.ZVEO_SERVICE_TENANT_ID ?? DEFAULT_TENANT_ID;
  const projectId = process.env.ZVEO_DEFAULT_PROJECT_ID ?? DEFAULT_PROJECT_ID;
  const roles = parseRoles(process.env.ZVEO_SERVICE_ROLES ?? "service");

  return {
    apiBaseUrl,
    tenantId,
    projectId,
    subject,
    roles,
  };
}

export function buildServiceBearerToken(options: ServiceTokenOptions = {}): string {
  const secret = resolveSharedSecret(options.secret);
  const subject = options.subject ?? process.env.ZVEO_SERVICE_SUBJECT ?? DEFAULT_SUBJECT;
  const tenantId = options.tenantId ?? process.env.ZVEO_SERVICE_TENANT_ID ?? DEFAULT_TENANT_ID;
  const roles = parseRoles(options.roles ?? process.env.ZVEO_SERVICE_ROLES ?? "service");
  const ttlSeconds = resolveInt(options.ttlSeconds ?? process.env.ZVEO_SERVICE_TOKEN_TTL_SECONDS, DEFAULT_TOKEN_TTL_SECONDS);
  const issuedAt = Math.floor((options.now ?? new Date()).getTime() / 1000);

  const payload = {
    sub: subject,
    tenantId,
    roles,
    exp: issuedAt + ttlSeconds,
  };

  const encodedBody = base64UrlEncode(JSON.stringify(payload));
  const signature = createHmac("sha256", secret).update(encodedBody).digest("base64url");
  return `Bearer ${encodedBody}.${signature}`;
}

export function buildDashboardAuthHeaders(options: ServiceTokenOptions = {}): HeadersInit {
  return {
    authorization: buildServiceBearerToken(options),
  };
}
