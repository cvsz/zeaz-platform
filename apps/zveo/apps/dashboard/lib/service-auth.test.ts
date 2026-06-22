import test from "node:test";
import assert from "node:assert/strict";

import { buildDashboardAuthHeaders, buildServiceBearerToken, getDashboardRuntimeOptions } from "./service-auth";

test("buildServiceBearerToken emits a signed bearer token", () => {
  const sharedKey = "development-only-signing-key-change-before-production";
  const token = buildServiceBearerToken({
    secret: sharedKey,
    subject: "00000000-0000-4000-8000-000000000101",
    tenantId: "00000000-0000-4000-8000-000000000102",
    roles: ["service"],
    ttlSeconds: 3600,
    now: new Date("2026-01-01T00:00:00.000Z"),
  });

  assert.match(token, /^Bearer [A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
});

test("buildDashboardAuthHeaders returns a bearer authorization header", () => {
  const sharedKey = "development-only-signing-key-change-before-production";
  const headers = buildDashboardAuthHeaders({
    secret: sharedKey,
    subject: "00000000-0000-4000-8000-000000000101",
    tenantId: "00000000-0000-4000-8000-000000000102",
    roles: ["service"],
    ttlSeconds: 3600,
    now: new Date("2026-01-01T00:00:00.000Z"),
  });

  const authorization = new Headers(headers).get("authorization");
  assert.match(authorization ?? "", /^Bearer /);
});

test("getDashboardRuntimeOptions provides stable development defaults", () => {
  const runtime = getDashboardRuntimeOptions();
  assert.equal(runtime.apiBaseUrl, process.env.ZVEO_API_URL ?? "http://localhost:8080");
  assert.equal(runtime.roles.includes("service"), true);
});
