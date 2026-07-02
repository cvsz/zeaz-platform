import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const registryPath = path.join(root, "configs/platform/local-models.json");
const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
const errors = [];

if (registry.provider !== "ollama") {
  errors.push("provider must be ollama");
}

if (registry.base_url !== "http://localhost:11434") {
  errors.push("base_url must stay local-only at http://localhost:11434");
}

if (!registry.default_model) {
  errors.push("default_model is required");
}

const modelIds = new Set();
for (const model of registry.models ?? []) {
  if (!model.id) {
    errors.push("model id is required");
    continue;
  }
  if (modelIds.has(model.id)) {
    errors.push(`duplicate model id: ${model.id}`);
  }
  modelIds.add(model.id);
}

if (!modelIds.has(registry.default_model)) {
  errors.push(`default_model not found in models: ${registry.default_model}`);
}

let ollamaModels = [];
try {
  const output = execFileSync("ollama", ["list"], { encoding: "utf8" });
  ollamaModels = output
    .split("\n")
    .slice(1)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
} catch (error) {
  errors.push(`ollama list failed: ${error.message}`);
}

const available = new Set(ollamaModels);
for (const model of modelIds) {
  if (!available.has(model)) {
    errors.push(`registered model is not installed locally: ${model}`);
  }
}

if (errors.length > 0) {
  console.error("Local Ollama model validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${modelIds.size} local Ollama models; default=${registry.default_model}.`);
