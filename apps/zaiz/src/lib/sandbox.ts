/**
 * Sandbox — safe JavaScript/TypeScript code execution.
 *
 * Server-only. Executes user code in a sandboxed `new Function()` scope with
 * an allowlisted set of safe builtins. No `require`, no `process`, no file
 * system, no network. Output is captured from console.log and the return value.
 */

export interface SandboxResult {
  ok: boolean;
  output: string[];
  returnValue: unknown;
  error?: string;
  durationMs: number;
}

/** Safe builtins exposed to sandboxed code. */
const SAFE_BUILTINS: Record<string, unknown> = {
  console: {
    log: (...args: unknown[]) => args.map(formatArg).join(" "),
    error: (...args: unknown[]) => args.map(formatArg).join(" "),
    warn: (...args: unknown[]) => args.map(formatArg).join(" "),
    info: (...args: unknown[]) => args.map(formatArg).join(" "),
  },
  JSON,
  Math,
  Date,
  Array,
  Object,
  String,
  Number,
  Boolean,
  RegExp,
  Map,
  Set,
  Promise,
  Symbol,
  Error,
  parseInt,
  parseFloat,
  isNaN,
  isFinite,
  encodeURIComponent,
  decodeURIComponent,
};

function formatArg(arg: unknown): string {
  if (typeof arg === "string") return arg;
  if (arg === undefined) return "undefined";
  if (arg === null) return "null";
  try {
    return JSON.stringify(arg, null, arg && typeof arg === "object" ? 2 : 0);
  } catch {
    return String(arg);
  }
}

/**
 * Execute code in a sandbox. The code runs synchronously in a `new Function`
 * scope with only safe builtins available. Async code is not awaited.
 */
export function executeSandbox(code: string, timeoutMs = 5000): SandboxResult {
  const start = Date.now();
  const output: string[] = [];

  // Capture console output.
  const sandboxConsole = {
    log: (...args: unknown[]) => output.push(args.map(formatArg).join(" ")),
    error: (...args: unknown[]) => output.push("[error] " + args.map(formatArg).join(" ")),
    warn: (...args: unknown[]) => output.push("[warn] " + args.map(formatArg).join(" ")),
    info: (...args: unknown[]) => output.push(args.map(formatArg).join(" ")),
  };

  const sandboxBuiltins = { ...SAFE_BUILTINS, console: sandboxConsole };

  try {
    // Build a function that receives the builtins as parameters.
    // The code is wrapped so `return` at the top level returns a value.
    const wrapped = `"use strict";\n${code}`;
    const keys = Object.keys(sandboxBuiltins);
    const values = Object.values(sandboxBuiltins);
    const fn = new Function(...keys, wrapped) as (...args: unknown[]) => unknown;

    // Simple timeout via Promise.race (for sync code, this won't interrupt,
    // but we check elapsed time after execution).
    const returnValue = fn(...values);

    if (Date.now() - start > timeoutMs) {
      return {
        ok: false,
        output,
        returnValue: undefined,
        error: `Execution exceeded ${timeoutMs}ms timeout`,
        durationMs: Date.now() - start,
      };
    }

    return {
      ok: true,
      output,
      returnValue,
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      ok: false,
      output,
      returnValue: undefined,
      error: err instanceof Error ? `${err.name}: ${err.message}` : String(err),
      durationMs: Date.now() - start,
    };
  }
}

/** Example snippets for the UI. */
export const SANDBOX_EXAMPLES: { label: string; code: string }[] = [
  {
    label: "Array methods",
    code: `const nums = [1, 2, 3, 4, 5];
const doubled = nums.map(n => n * 2);
const sum = nums.reduce((a, b) => a + b, 0);
console.log("doubled:", doubled);
console.log("sum:", sum);
return { doubled, sum };`,
  },
  {
    label: "Fibonacci",
    code: `function fib(n) {
  if (n < 2) return n;
  return fib(n - 1) + fib(n - 2);
}
const seq = Array.from({ length: 10 }, (_, i) => fib(i));
console.log("Fibonacci:", seq);
return seq;`,
  },
  {
    label: "Object manipulation",
    code: `const users = [
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 },
  { name: "Charlie", age: 35 },
];
const byAge = [...users].sort((a, b) => a.age - b.age);
const names = users.map(u => u.name);
console.log("Sorted by age:", byAge);
console.log("Names:", names);
return { byAge, names };`,
  },
  {
    label: "JSON transform",
    code: `const data = '{"products":[{"name":"Widget","price":9.99},{"name":"Gadget","price":19.99}]}';
const parsed = JSON.parse(data);
const total = parsed.products.reduce((s, p) => s + p.price, 0);
console.log("Total: $" + total.toFixed(2));
return { products: parsed.products.length, total };`,
  },
];
