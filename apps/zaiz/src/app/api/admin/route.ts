import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { listKeys, getKeyConfig, setKeyConfig, revokeKey, deleteKey } from "@/lib/api-keys";
import { MODELS } from "@/lib/models";
import { SKILLS } from "@/lib/skills";
import { MODULES } from "@/lib/modules";
import { AGENTS } from "@/lib/agents";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Admin control panel endpoint.
 *
 * GET    /api/admin              — dashboard stats + registry counts + keys + config
 * PATCH  /api/admin              — update config { requireKey } or revoke/delete key
 */
export async function GET() {
  try {
    const [keys, config] = await Promise.all([listKeys(), getKeyConfig()]);

    const activeKeys = keys.filter((k) => k.active);
    const totalUsage = keys.reduce((sum, k) => sum + k.usageCount, 0);
    const totalRateLimit = activeKeys.reduce(
      (sum, k) => sum + (k.rateLimitPerHour === 0 ? 0 : k.rateLimitPerHour),
      0,
    );

    const stats = {
      keys: {
        total: keys.length,
        active: activeKeys.length,
        revoked: keys.length - activeKeys.length,
        totalUsage,
        totalRateLimitPerHour: totalRateLimit,
        avgUsage: keys.length > 0 ? Math.round(totalUsage / keys.length) : 0,
      },
      registry: {
        models: MODELS.length,
        skills: SKILLS.length,
        modules: MODULES.length,
        agents: AGENTS.length,
        modes: 6,
      },
      config,
      recentKeys: keys.slice(0, 10),
      topKeysByUsage: [...keys]
        .sort((a, b) => b.usageCount - a.usageCount)
        .slice(0, 5),
    };

    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load admin stats" },
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

    // Revoke a key
    if (typeof body.id === "string" && body.revoke === true) {
      await revokeKey(body.id);
      return NextResponse.json({ ok: true });
    }

    // Delete a key
    if (typeof body.id === "string" && body.delete === true) {
      await deleteKey(body.id);
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
