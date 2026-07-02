import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

describe("root entrypoint", () => {
  it("redirects to the dashboard", () => {
    const source = readFileSync("src/app/page.tsx", "utf8");
    expect(source).toContain('redirect("/dashboard")');
    expect(source).not.toContain("Welcome to Zeaz.dev");
    expect(source).not.toContain("Enter Control Panel");
  });

  it("brands the app as ZSP AI Tool", () => {
    const source = readFileSync("src/app/layout.tsx", "utf8");
    expect(source).toContain("ZSP AI Tool | Shopee Affiliate AI Studio");
    expect(source).toContain("Thai-first Shopee Affiliate AI studio");
    expect(source).not.toContain("zDash | Zeaz Platform Operations Center");
  });
});
