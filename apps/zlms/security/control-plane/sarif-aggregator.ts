import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname } from 'node:path';
import { createHash } from 'node:crypto';

interface SarifResult { ruleId?: string; message?: { text?: string }; locations?: Array<{ physicalLocation?: { artifactLocation?: { uri?: string }; region?: { startLine?: number } } }>; partialFingerprints?: Record<string, string>; fingerprints?: Record<string, string>; properties?: Record<string, unknown>; }
interface SarifRun { tool: { driver: { name: string; rules?: unknown[] } }; results?: SarifResult[]; properties?: Record<string, unknown>; }
interface SarifLog { version: string; runs: SarifRun[]; $schema?: string; }

export interface SarifAggregateSummary {
  inputFiles: string[];
  runs: number;
  totalResults: number;
  uniqueResults: number;
  duplicateResults: number;
  byTool: Record<string, number>;
  trend: { previousUniqueResults: number; delta: number; direction: 'up' | 'down' | 'flat' };
}

function fingerprint(result: SarifResult, tool: string): string {
  const location = result.locations?.[0]?.physicalLocation;
  const material = JSON.stringify({
    tool,
    ruleId: result.ruleId ?? 'unknown-rule',
    uri: location?.artifactLocation?.uri ?? 'unknown-uri',
    line: location?.region?.startLine ?? 0,
    message: result.message?.text ?? '',
  });
  return createHash('sha256').update(material).digest('hex');
}

export class SarifAggregator {
  async aggregate(inputFiles: string[], outputFile: string, trendFile = 'security/reports/sarif-trend.json'): Promise<SarifAggregateSummary> {
    const aggregate: SarifLog = {
      version: '2.1.0',
      $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
      runs: [],
    };
    const seen = new Set<string>();
    const byTool: Record<string, number> = {};
    let totalResults = 0;

    for (const file of [...new Set(inputFiles)].sort()) {
      let parsed: SarifLog;
      try {
        parsed = JSON.parse(await readFile(file, 'utf8')) as SarifLog;
      } catch {
        continue;
      }
      if (!Array.isArray(parsed.runs)) continue;
      for (const run of parsed.runs) {
        const tool = run.tool?.driver?.name || basename(file, '.sarif');
        const filtered: SarifResult[] = [];
        for (const result of run.results ?? []) {
          totalResults += 1;
          const id = fingerprint(result, tool);
          if (seen.has(id)) continue;
          seen.add(id);
          result.partialFingerprints = { ...(result.partialFingerprints ?? {}), securityControlPlane: id };
          filtered.push(result);
        }
        byTool[tool] = (byTool[tool] ?? 0) + filtered.length;
        aggregate.runs.push({ ...run, results: filtered, properties: { ...(run.properties ?? {}), aggregatedBy: 'security-control-plane' } });
      }
    }

    let previousUniqueResults = 0;
    try {
      const previous = JSON.parse(await readFile(trendFile, 'utf8')) as { uniqueResults?: number };
      previousUniqueResults = Number(previous.uniqueResults ?? 0);
    } catch { previousUniqueResults = 0; }

    await mkdir(dirname(outputFile), { recursive: true });
    await writeFile(outputFile, JSON.stringify(aggregate, null, 2));

    const summary: SarifAggregateSummary = {
      inputFiles: [...new Set(inputFiles)].sort(),
      runs: aggregate.runs.length,
      totalResults,
      uniqueResults: seen.size,
      duplicateResults: Math.max(totalResults - seen.size, 0),
      byTool,
      trend: {
        previousUniqueResults,
        delta: seen.size - previousUniqueResults,
        direction: seen.size > previousUniqueResults ? 'up' : seen.size < previousUniqueResults ? 'down' : 'flat',
      },
    };
    await mkdir(dirname(trendFile), { recursive: true });
    await writeFile(trendFile, JSON.stringify({ ...summary, observedAt: new Date().toISOString() }, null, 2));
    return summary;
  }
}
