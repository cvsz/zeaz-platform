import { NextRequest, NextResponse } from "next/server";
import {
  listKeys,
  createKey,
  revokeKey,
  deleteKey,
  updateKeyRateLimit,
  getKeyConfig,
  setKeyConfig,
} from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * API key management endpoint.
 *
 * GET    /api/keys           — list keys + config
 * POST   /api/keys           — create a key { name, rateLimitPerHour? }
 * PATCH  /api/keys           — update config { requireKey } OR key { id, rateLimitPerHour }
 * DELETE /api/keys?id=<id>   — delete a key (or revoke if ?revoke=1)
 */
export async function GET() {
  try {
    const [keys, config] = await Promise.all([listKeys(), getKeyConfig()]);
    return NextResponse.json({ keys, config });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to list keys" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name : "";
    const rateLimitPerHour =
      typeof body.rateLimitPerHour === "number"
        ? Math.max(0, Math.floor(body.rateLimitPerHour))
        : 60;
    if (!name.trim()) {
      return NextResponse.json({ error: "`name` is required" }, { status: 400 });
    }
    const created = await createKey({ name, rateLimitPerHour });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create key" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    // Update require-key config
    if (typeof body.requireKey === "boolean") {
      const config = await setKeyConfig({ requireKey: body.requireKey });
      return NextResponse.json({ config });
    }

    // Update a key's rate limit
    if (typeof body.id === "string" && typeof body.rateLimitPerHour === "number") {
      const updated = await updateKeyRateLimit(body.id, body.rateLimitPerHour);
      if (!updated) {
        return NextResponse.json({ error: "Key not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    // Revoke a key
    if (typeof body.id === "string" && body.revoke === true) {
      await revokeKey(body.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid patch body" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to update" },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");
    const revoke = url.searchParams.get("revoke") === "1";
    if (!id) {
      return NextResponse.json({ error: "`id` query param required" }, { status: 400 });
    }
    if (revoke) {
      await revokeKey(id);
    } else {
      await deleteKey(id);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to delete key" },
      { status: 500 },
    );
  }
}
