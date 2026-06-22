import { NextRequest, NextResponse } from "next/server";
import {
  listRoles,
  upsertRole,
  deleteRole,
  ensureDefaultRoles,
  PERMISSIONS,
  ALL_PERMISSIONS,
  ROLE_PRESETS,
  type PermissionKey,
} from "@/lib/permissions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET  /api/permissions  — list roles + all permissions + presets
 * POST /api/permissions  — upsert role { name, permissions[] }
 * DELETE /api/permissions?name=<role> — delete role
 */
export async function GET() {
  await ensureDefaultRoles();
  const roles = await listRoles();
  return NextResponse.json({
    roles,
    permissions: PERMISSIONS,
    allPermissions: ALL_PERMISSIONS,
    presets: ROLE_PRESETS,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const permissions = Array.isArray(body.permissions) ? body.permissions : [];

    if (!name) {
      return NextResponse.json({ error: "`name` is required." }, { status: 400 });
    }

    const validPerms = permissions.filter((p: string) =>
      ALL_PERMISSIONS.includes(p as PermissionKey),
    ) as PermissionKey[];

    const role = await upsertRole(name, validPerms);
    return NextResponse.json(role);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update role" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const name = url.searchParams.get("name");
  if (!name) {
    return NextResponse.json({ error: "`name` query param required." }, { status: 400 });
  }
  await deleteRole(name);
  return NextResponse.json({ ok: true });
}
