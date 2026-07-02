import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const deprecatedPatterns = [/ShopeeLeaz/i, /Shopee Leaz/i, /shopeeleaz/i];
const searchRoots = ["src", "prisma", "README.md", "package.json", ".env.example", "extension"];

function collectFiles(paths: string[]): string[] {
  const files: string[] = [];

  for (const target of paths) {
    if (!target) continue;

    if (statSync(target).isFile()) {
      files.push(target);
      continue;
    }

    for (const entry of readdirSync(target, { withFileTypes: true })) {
      const fullPath = join(target, entry.name);
      if (entry.isDirectory()) {
        files.push(...collectFiles([fullPath]));
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

describe("branding", () => {
  it("does not include deprecated product branding in product code paths", 30000, () => {
    const hits: string[] = [];

    for (const file of collectFiles(searchRoots)) {
      const content = readFileSync(file, "utf8");
      if (deprecatedPatterns.some((pattern) => pattern.test(content))) {
        hits.push(file);
      }
    }

    expect(hits).toEqual([]);
  });
});
