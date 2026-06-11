#!/usr/bin/env node
import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const schemaNames = ["workflowSubmissionSchema", "renderJobPayloadSchema", "sceneGraphSchema", "retryPolicySchema"];
const extensions = new Set([".ts", ".tsx"]);
const ignored = new Set(["dist", "node_modules", ".next", "coverage"]);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if ([...extensions].some((extension) => path.endsWith(extension))) yield path;
  }
}

let changed = 0;
for (const root of ["apps", "packages"]) {
  for await (const file of walk(root)) {
    let source = await readFile(file, "utf8");
    const original = source;
    if (source.includes("@zveo/core") && schemaNames.some((name) => source.includes(name))) {
      source = source.replace(/import\s+\{([^}]+)\}\s+from\s+["']@zveo\/core["'];/g, (_match, imports) => {
        const parts = imports.split(",").map((part) => part.trim()).filter(Boolean);
        const contractParts = parts.filter((part) => schemaNames.some((name) => part === name || part.startsWith(`${name} `) || part === `type ${name}`));
        const coreParts = parts.filter((part) => !contractParts.includes(part));
        return [
          coreParts.length ? `import { ${coreParts.join(", ")} } from "@zveo/core";` : "",
          contractParts.length ? `import { ${contractParts.join(", ")} } from "@zveo/contracts";` : "",
        ].filter(Boolean).join("\n");
      });
    }
    if (source !== original) {
      await writeFile(file, source);
      changed += 1;
      console.log(`rewrote ${file}`);
    }
  }
}
console.log(`contract import migration complete: ${changed} files changed`);
