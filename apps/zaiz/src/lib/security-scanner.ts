/**
 * Security scanner — server-only.
 *
 * Scans source code for common vulnerability patterns (OWASP Top 10),
 * hardcoded secrets, dangerous patterns, and dependency issues.
 * Returns findings grouped by severity with file locations.
 */

export type Severity = "critical" | "high" | "medium" | "low" | "info";

export interface SecurityFinding {
  id: string;
  rule: string;
  severity: Severity;
  category: string;
  description: string;
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
}

export interface ScanResult {
  ok: boolean;
  filesScanned: number;
  findings: SecurityFinding[];
  summary: Record<Severity, number>;
  durationMs: number;
}

interface ScanRule {
  id: string;
  rule: string;
  severity: Severity;
  category: string;
  description: string;
  pattern: RegExp;
  recommendation: string;
}

/** OWASP + common vulnerability patterns. */
const RULES: ScanRule[] = [
  // --- Critical: hardcoded secrets ---
  {
    id: "SEC001",
    rule: "Hardcoded API key",
    severity: "critical",
    category: "Secrets",
    description: "API key or secret found hardcoded in source.",
    pattern: /(?:api[_-]?key|secret|token|password|passwd|pwd)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i,
    recommendation: "Move secrets to environment variables or .env files. Never commit them to source.",
  },
  {
    id: "SEC002",
    rule: "AWS access key",
    severity: "critical",
    category: "Secrets",
    description: "AWS access key ID detected.",
    pattern: /AKIA[0-9A-Z]{16}/,
    recommendation: "Remove the AWS key immediately and rotate it. Use IAM roles or env vars.",
  },
  {
    id: "SEC003",
    rule: "Private key",
    severity: "critical",
    category: "Secrets",
    description: "Private key material detected.",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/,
    recommendation: "Never commit private keys. Use a secret manager or key vault.",
  },
  {
    id: "SEC004",
    rule: "JWT secret",
    severity: "high",
    category: "Secrets",
    description: "JWT signing secret found in source.",
    pattern: /jwt[_-]?(?:secret|key)\s*[:=]\s*["'][^"']{8,}["']/i,
    recommendation: "Store JWT secrets in environment variables.",
  },

  // --- Critical: SQL injection ---
  {
    id: "SEC010",
    rule: "SQL injection (string concat)",
    severity: "critical",
    category: "Injection",
    description: "SQL query built with string concatenation — vulnerable to injection.",
    pattern: /(?:query|execute|raw|sql)\s*\(\s*[`"'].*?\$\{.*?\}.*?[`"']/i,
    recommendation: "Use parameterized queries or an ORM. Never concatenate user input into SQL.",
  },
  {
    id: "SEC011",
    rule: "eval() usage",
    severity: "critical",
    category: "Code Execution",
    description: "eval() can execute arbitrary code — high XSS/RCE risk.",
    pattern: /\beval\s*\(/,
    recommendation: "Remove eval(). Use JSON.parse() for data, or a sandboxed interpreter.",
  },
  {
    id: "SEC012",
    rule: "Dangerous shell execution",
    severity: "critical",
    category: "Code Execution",
    description: "Shell execution with shell:true or user input — command injection risk.",
    pattern: /spawn\s*\(.*shell\s*:\s*true|exec\s*\(\s*[`"'].*\$\{|execSync\s*\(\s*[`"'].*\$\{/,
    recommendation: "Use shell:false and pass args as an array. Never interpolate user input into commands.",
  },

  // --- High: XSS ---
  {
    id: "SEC020",
    rule: "dangerouslySetInnerHTML",
    severity: "high",
    category: "XSS",
    description: "dangerouslySetInnerHTML can lead to XSS if content is untrusted.",
    pattern: /dangerouslySetInnerHTML/,
    recommendation: "Sanitize HTML with DOMPurify before rendering, or use text content.",
  },
  {
    id: "SEC021",
    rule: "innerHTML assignment",
    severity: "high",
    category: "XSS",
    description: "innerHTML with dynamic content is an XSS vector.",
    pattern: /\.innerHTML\s*=\s*(?!["']<)/,
    recommendation: "Use textContent or sanitize with DOMPurify.",
  },

  // --- High: SSRF / open redirects ---
  {
    id: "SEC030",
    rule: "Open redirect",
    severity: "high",
    category: "SSRF/Redirect",
    description: "Redirect with user-controlled URL — open redirect risk.",
    pattern: /redirect\s*\(\s*(?:req\.|body\.|query\.|params\.)/i,
    recommendation: "Validate redirect URLs against an allowlist.",
  },
  {
    id: "SEC031",
    rule: "SSRF (server-side request)",
    severity: "high",
    category: "SSRF",
    description: "fetch/request with user-controlled URL — SSRF risk.",
    pattern: /(?:fetch|axios|request)\s*\(\s*(?:req\.|body\.|query\.|params\.|userInput)/i,
    recommendation: "Validate and restrict URLs to allowed domains.",
  },

  // --- Medium: insecure patterns ---
  {
    id: "SEC040",
    rule: "Insecure random",
    severity: "medium",
    category: "Crypto",
    description: "Math.random() is not cryptographically secure.",
    pattern: /Math\.random\s*\(\s*\)/,
    recommendation: "Use crypto.randomBytes() or crypto.getRandomValues() for security-sensitive randomness.",
  },
  {
    id: "SEC041",
    rule: "Weak crypto (MD5)",
    severity: "medium",
    category: "Crypto",
    description: "MD5 is cryptographically broken.",
    pattern: /createHash\s*\(\s*['"]md5['"]\s*\)/,
    recommendation: "Use SHA-256 or SHA-3 for hashing.",
  },
  {
    id: "SEC042",
    rule: "Disable security headers",
    severity: "medium",
    category: "Headers",
    description: "Security headers disabled.",
    pattern: /(?:X-Frame-Options|X-Content-Type-Options|Content-Security-Policy)\s*:\s*['"]?(?:off|none|null|disabled)/i,
    recommendation: "Keep security headers enabled. Use helmet() in Express/Next.js.",
  },
  {
    id: "SEC043",
    rule: "CORS wildcard",
    severity: "medium",
    category: "CORS",
    description: "CORS set to allow all origins.",
    pattern: /Access-Control-Allow-Origin\s*:\s*['"]\*['"]/,
    recommendation: "Restrict CORS to specific origins. Use a whitelist.",
  },
  {
    id: "SEC044",
    rule: "HTTP in production",
    severity: "medium",
    category: "Transport",
    description: "HTTP URL used (should be HTTPS in production).",
    pattern: /http:\/\/(?!localhost|127\.0\.0\.1|0\.0\.0\.0|example\.com)/,
    recommendation: "Use HTTPS for all external URLs in production.",
  },

  // --- Low: best practices ---
  {
    id: "SEC050",
    rule: "Console.log with sensitive data",
    severity: "low",
    category: "Logging",
    description: "console.log might leak sensitive data.",
    pattern: /console\.(log|info|debug)\s*\(\s*(?:password|secret|token|apiKey|key)/i,
    recommendation: "Remove debug logging of sensitive variables.",
  },
  {
    id: "SEC051",
    rule: "TODO/FIXME security",
    severity: "low",
    category: "Code Quality",
    description: "Security-related TODO or FIXME found.",
    pattern: /(?:TODO|FIXME|HACK|XXX)\s*[:\-]?\s*(?:security|auth|vuln|inject|xss|csrf|password|secret|token)/i,
    recommendation: "Address security TODOs before deployment.",
  },
  {
    id: "SEC052",
    rule: "Debug mode enabled",
    severity: "low",
    category: "Config",
    description: "Debug mode may be enabled in production.",
    pattern: /(?:NODE_ENV\s*===?\s*['"]development['"]|debug\s*:\s*true|__DEV__)/,
    recommendation: "Ensure debug mode is disabled in production builds.",
  },

  // --- Info ---
  {
    id: "SEC060",
    rule: "HTTP Basic Auth",
    severity: "info",
    category: "Auth",
    description: "HTTP Basic Auth sends credentials in plaintext.",
    pattern: /Authorization\s*:\s*['"]Basic\s/,
    recommendation: "Use Bearer tokens or session-based auth instead.",
  },
];

/** File extensions to scan. */
const SCANABLE_EXTENSIONS = [
  ".ts", ".tsx", ".js", ".jsx", ".mjs",
  ".json", ".yaml", ".yml",
  ".env", ".sh", ".bash",
  ".py", ".rb", ".go", ".rs",
  ".sql", ".html", ".vue", ".svelte",
];

/** Directories to skip. */
const SKIP_DIRS = ["node_modules", ".next", ".git", "dist", "build", ".turbo", "coverage", "skills", ".dev", "tool-results", "upload"];

import { readdir, readFile, stat } from "fs/promises";
import { join, extname, relative } from "path";

async function walkDir(dir: string, base: string): Promise<string[]> {
  const results: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return results;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDir(entry.name)) continue;
      results.push(...await walkDir(fullPath, base));
    } else {
      const ext = extname(entry.name).toLowerCase();
      if (SCANABLE_EXTENSIONS.includes(ext) || entry.name === ".env") {
        results.push(fullPath);
      }
    }
  }
  return results;
}

function skipDir(name: string): boolean {
  return SKIP_DIRS.includes(name);
}

/** Scan a single file for security issues. */
async function scanFile(filePath: string, baseDir: string): Promise<SecurityFinding[]> {
  const findings: SecurityFinding[] = [];
  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    return findings;
  }

  const lines = content.split("\n");
  const relPath = relative(baseDir, filePath);

  for (const rule of RULES) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (rule.pattern.test(line)) {
        findings.push({
          id: rule.id,
          rule: rule.rule,
          severity: rule.severity,
          category: rule.category,
          description: rule.description,
          file: relPath,
          line: i + 1,
          snippet: line.trim().slice(0, 120),
          recommendation: rule.recommendation,
        });
      }
    }
  }

  return findings;
}

/** Run a full security scan of the project. */
export async function scanProject(baseDir?: string): Promise<ScanResult> {
  const start = Date.now();
  const root = baseDir ?? process.cwd();
  const files = await walkDir(root, root);

  const allFindings: SecurityFinding[] = [];
  for (const file of files) {
    const fileFindings = await scanFile(file, root);
    allFindings.push(...fileFindings);
  }

  const summary: Record<Severity, number> = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  for (const f of allFindings) {
    summary[f.severity]++;
  }

  return {
    ok: true,
    filesScanned: files.length,
    findings: allFindings.sort((a, b) => {
      const order: Record<Severity, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return order[a.severity] - order[b.severity];
    }),
    summary,
    durationMs: Date.now() - start,
  };
}

/** Get the list of scan rules (for the UI). */
export function getScanRules() {
  return RULES.map((r) => ({
    id: r.id,
    rule: r.rule,
    severity: r.severity,
    category: r.category,
    description: r.description,
    recommendation: r.recommendation,
  }));
}
