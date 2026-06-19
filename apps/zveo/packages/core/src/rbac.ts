import type { Permission, Role } from "./schemas.js";

const rolePermissions: Readonly<Record<Role, readonly Permission[]>> = {
  owner: ["workflow:create", "workflow:read", "workflow:update", "workflow:cancel", "render:enqueue", "render:operate", "asset:read", "asset:write", "admin:read", "admin:write"],
  admin: ["workflow:create", "workflow:read", "workflow:update", "workflow:cancel", "render:enqueue", "render:operate", "asset:read", "asset:write", "admin:read"],
  producer: ["workflow:create", "workflow:read", "workflow:update", "workflow:cancel", "render:enqueue", "asset:read", "asset:write"],
  operator: ["workflow:read", "render:operate", "asset:read"],
  viewer: ["workflow:read", "asset:read"],
  service: ["workflow:create", "workflow:read", "workflow:update", "render:enqueue", "render:operate", "asset:read", "asset:write", "admin:read"],
};

export interface Principal {
  subject: string;
  tenantId: string;
  roles: Role[];
  permissions?: Permission[];
}

export class AuthorizationError extends Error {
  constructor(permission: Permission) {
    super(`missing required permission ${permission}`);
    this.name = "AuthorizationError";
  }
}

export function permissionsForRoles(roles: readonly Role[]): Set<Permission> {
  return new Set(roles.flatMap((role) => rolePermissions[role]));
}

export function can(principal: Principal, permission: Permission): boolean {
  return permissionsForRoles(principal.roles).has(permission) || new Set(principal.permissions ?? []).has(permission);
}

export function requirePermission(principal: Principal, permission: Permission): void {
  if (!can(principal, permission)) throw new AuthorizationError(permission);
}
