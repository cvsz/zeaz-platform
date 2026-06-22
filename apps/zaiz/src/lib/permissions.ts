import { db } from "./db";

/**
 * Permissions — server-only role-based access control (RBAC).
 *
 * Roles have a set of permission keys. API keys can be assigned roles. When
 * a request comes in, the key's roles are checked for the required permission.
 *
 * Permission keys follow `<resource>:<action>` format, e.g. `cli:stream`,
 * `media:generate`, `mcp:execute`, `admin:manage`.
 */

export type PermissionKey =
  | "cli:stream"
  | "agent:run"
  | "plan:generate"
  | "media:generate"
  | "video:generate"
  | "mcp:execute"
  | "mcp:write"
  | "keys:manage"
  | "admin:manage"
  | "payments:checkout"
  | "research:use"
  | "sandbox:execute"
  | "search:use";

export const ALL_PERMISSIONS: PermissionKey[] = [
  "cli:stream",
  "agent:run",
  "plan:generate",
  "media:generate",
  "video:generate",
  "mcp:execute",
  "mcp:write",
  "keys:manage",
  "admin:manage",
  "payments:checkout",
  "research:use",
  "sandbox:execute",
  "search:use",
];

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  description: string;
  resource: string;
}

export const PERMISSIONS: PermissionMeta[] = [
  { key: "cli:stream", label: "CLI Stream", description: "Send prompts to GLM models", resource: "CLI" },
  { key: "agent:run", label: "Run Agents", description: "Execute multi-step agents", resource: "Agents" },
  { key: "plan:generate", label: "Generate Plans", description: "Create structured coding plans", resource: "Plans" },
  { key: "media:generate", label: "Generate Images", description: "Use the image generator", resource: "Media" },
  { key: "video:generate", label: "Generate Videos", description: "Use the video generator", resource: "Media" },
  { key: "mcp:execute", label: "MCP Execute", description: "Run allowlisted shell commands (read)", resource: "MCP" },
  { key: "mcp:write", label: "MCP Write", description: "Run write/approval-gated MCP commands", resource: "MCP" },
  { key: "keys:manage", label: "Manage Keys", description: "Create/revoke API keys", resource: "Keys" },
  { key: "admin:manage", label: "Admin Access", description: "Access the admin dashboard", resource: "Admin" },
  { key: "payments:checkout", label: "Checkout", description: "Create payment orders", resource: "Payments" },
  { key: "research:use", label: "Research", description: "Use research tools (web read, summarize)", resource: "Research" },
  { key: "sandbox:execute", label: "Sandbox", description: "Execute code in the sandbox", resource: "Sandbox" },
  { key: "search:use", label: "Web Search", description: "Use web search tools", resource: "Search" },
];

export const PERMISSION_MAP = new Map(PERMISSIONS.map((p) => [p.key, p]));

/** Default role presets. */
export interface RolePreset {
  name: string;
  description: string;
  permissions: PermissionKey[];
  color: string;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    name: "admin",
    description: "Full access to everything",
    permissions: ALL_PERMISSIONS,
    color: "rose",
  },
  {
    name: "developer",
    description: "Coding tools + media + search + sandbox",
    permissions: [
      "cli:stream", "agent:run", "plan:generate", "media:generate", "video:generate",
      "mcp:execute", "research:use", "sandbox:execute", "search:use", "payments:checkout",
    ],
    color: "emerald",
  },
  {
    name: "viewer",
    description: "Read-only — chat + search + research",
    permissions: ["cli:stream", "search:use", "research:use"],
    color: "sky",
  },
  {
    name: "guest",
    description: "Minimal — chat only",
    permissions: ["cli:stream"],
    color: "zinc",
  },
];

export interface RolePublic {
  id: string;
  name: string;
  permissions: PermissionKey[];
  active: boolean;
  createdAt: string;
}

function toPublic(row: { id: string; name: string; permissions: string; active: boolean; createdAt: Date }): RolePublic {
  return {
    id: row.id,
    name: row.name,
    permissions: row.permissions ? row.permissions.split(",").filter(Boolean) as PermissionKey[] : [],
    active: row.active,
    createdAt: row.createdAt.toISOString(),
  };
}

/** List all roles. */
export async function listRoles(): Promise<RolePublic[]> {
  const rows = await db.role.findMany({ orderBy: { name: "asc" } });
  return rows.map(toPublic);
}

/** Create or update a role. */
export async function upsertRole(name: string, permissions: PermissionKey[]): Promise<RolePublic> {
  const perms = [...new Set(permissions)].filter((p) => PERMISSION_MAP.has(p)).join(",");
  const row = await db.role.upsert({
    where: { name },
    create: { name, permissions: perms },
    update: { permissions: perms },
  });
  return toPublic(row);
}

/** Delete a role. */
export async function deleteRole(name: string): Promise<boolean> {
  await db.role.deleteMany({ where: { name } });
  return true;
}

/** Seed default roles if none exist. */
export async function ensureDefaultRoles(): Promise<void> {
  const count = await db.role.count();
  if (count > 0) return;
  for (const preset of ROLE_PRESETS) {
    await db.role.create({
      data: {
        name: preset.name,
        permissions: preset.permissions.join(","),
      },
    });
  }
}

/** Assign a role to an API key (by key id). */
export async function assignRoleToKey(apiKeyId: string, roleName: string): Promise<boolean> {
  await db.apiKeyRole.upsert({
    where: { apiKeyId_roleName: { apiKeyId, roleName } },
    create: { apiKeyId, roleName },
    update: {},
  });
  return true;
}

/** Remove a role from an API key. */
export async function removeRoleFromKey(apiKeyId: string, roleName: string): Promise<boolean> {
  await db.apiKeyRole.deleteMany({ where: { apiKeyId, roleName } });
  return true;
}

/** Get all permissions for an API key (via its roles). */
export async function getApiKeyPermissions(apiKeyId: string): Promise<PermissionKey[]> {
  const assignments = await db.apiKeyRole.findMany({ where: { apiKeyId } });
  const roleNames = assignments.map((a) => a.roleName);
  if (roleNames.length === 0) return [];
  const roles = await db.role.findMany({
    where: { name: { in: roleNames }, active: true },
  });
  const permSet = new Set<PermissionKey>();
  for (const role of roles) {
    for (const p of role.permissions.split(",").filter(Boolean)) {
      permSet.add(p as PermissionKey);
    }
  }
  return [...permSet];
}

/** Check if an API key has a specific permission. */
export async function hasPermission(apiKeyId: string, permission: PermissionKey): Promise<boolean> {
  const perms = await getApiKeyPermissions(apiKeyId);
  return perms.includes(permission);
}

export const PERMISSION_RESOURCE_GROUPS = [...new Set(PERMISSIONS.map((p) => p.resource))].sort();
