export function GET() {
  return Response.json({ providers: ["okta", "github", "google"], wallet: true, status: "ready" });
}
