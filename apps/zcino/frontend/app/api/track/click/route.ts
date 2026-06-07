import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const catalogApiUrl = process.env.CATALOG_API_URL;
  if (!catalogApiUrl) {
    return NextResponse.json(
      { status: "skipped", reason: "catalog API unavailable" },
      { status: 202 },
    );
  }

  const payload = await request.json();
  const response = await fetch(
    `${catalogApiUrl.replace(/\/$/, "")}/track/click`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization")
          ? { Authorization: request.headers.get("authorization") as string }
          : {}),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    },
  );

  const body = await response
    .json()
    .catch(() => ({ status: response.ok ? "queued" : "failed" }));
  return NextResponse.json(body, { status: response.status });
}
