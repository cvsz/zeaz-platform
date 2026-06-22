import { NextRequest, NextResponse } from "next/server";
import { loadSettings, saveSettings, resetSettings, updateSettingsSection, type AppSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/settings — load current settings */
export async function GET() {
  const settings = await loadSettings();
  return NextResponse.json(settings);
}

/** POST /api/settings — save full settings */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as AppSettings;
    const saved = await saveSettings(body);
    return NextResponse.json(saved);
  } catch {
    return NextResponse.json({ error: "Invalid settings JSON" }, { status: 400 });
  }
}

/** PATCH /api/settings — update a single section { section, patch } */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json() as { section?: keyof AppSettings; patch?: Record<string, unknown>; reset?: boolean };
    if (body.reset) {
      const reset = await resetSettings();
      return NextResponse.json(reset);
    }
    if (!body.section || !body.patch) {
      return NextResponse.json({ error: "`section` and `patch` are required" }, { status: 400 });
    }
    const updated = await updateSettingsSection(body.section, body.patch);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
