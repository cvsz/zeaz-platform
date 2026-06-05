import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { GovernanceDag } from './governance-dag.ts';
import { RemediationQueue } from './remediation-queue.ts';
import { RollbackEngine } from './rollback-engine.ts';
import { SarifAggregator } from './sarif-aggregator.ts';
import { WorkflowLock } from './workflow-lock.ts';

interface SecurityEvent { id: string; type: string; source: string; time: string; severity: 'info' | 'warning' | 'critical'; data: Record<string, unknown>; }
interface Metrics { remediationSuccessRate: number; meanRollbackTimeMs: number; sarifUniqueResults: number; sarifTrendDelta: number; workflowExecutionCost: { estimatedMinutes: number; estimatedUsd: number }; runnerResourceUtilization: { cpuLoad1m: number; memoryUsedRatio: number }; }

const eventBusFile = 'security/events/security-event-bus.jsonl';
const metricsFile = 'security/reports/security-control-plane-metrics.json';

function stableEventId(event: Omit<SecurityEvent, 'id'>): string {
  return createHash('sha256').update(JSON.stringify(event)).digest('hex').slice(0, 32);
}

async function emit(type: string, severity: SecurityEvent['severity'], data: Record<string, unknown> = {}): Promise<SecurityEvent> {
  const eventWithoutId = { type, source: 'security-control-plane', time: new Date().toISOString(), severity, data };
  const event = { id: stableEventId(eventWithoutId), ...eventWithoutId };
  await mkdir('security/events', { recursive: true });
  await writeFile(eventBusFile, `${JSON.stringify(event)}\n`, { flag: 'a', mode: 0o600 });
  return event;
}

async function findSarifFiles(directory = 'security/sarif'): Promise<string[]> {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    return entries.filter((entry: { isFile: () => boolean; name: string }) => entry.isFile() && entry.name.endsWith('.sarif')).map((entry: { name: string }) => join(directory, entry.name)).sort();
  } catch { return []; }
}

async function resourceUtilization(): Promise<Metrics['runnerResourceUtilization']> {
  let cpuLoad1m = 0;
  let memoryUsedRatio = 0;
  try {
    const loadavg = await readFile('/proc/loadavg', 'utf8');
    cpuLoad1m = Number(loadavg.split(/\s+/)[0] ?? 0);
  } catch { cpuLoad1m = 0; }
  try {
    const meminfo = await readFile('/proc/meminfo', 'utf8');
    const values = Object.fromEntries(meminfo.split('\n').map((line: string) => line.split(':')).filter((parts: string[]) => parts.length === 2).map(([key, value]: string[]) => [key, Number(value.trim().split(/\s+/)[0])])) as Record<string, number>;
    const total = values.MemTotal ?? 0;
    const available = values.MemAvailable ?? 0;
    memoryUsedRatio = total > 0 ? Number(((total - available) / total).toFixed(4)) : 0;
  } catch { memoryUsedRatio = 0; }
  return { cpuLoad1m, memoryUsedRatio };
}

async function writeJson(path: string, value: unknown): Promise<void> {
  await mkdir(path.split('/').slice(0, -1).join('/'), { recursive: true });
  await writeFile(path, JSON.stringify(value, null, 2));
}

async function initialize(): Promise<void> {
  const dagExecution = GovernanceDag.securityControlPlane().validate();
  await writeJson('security/reports/governance-dag.json', dagExecution);
  await emit('dag.initialized', 'info', { nodes: dagExecution.ordered.length, levels: dagExecution.levels.length });
}

async function acquireLock(): Promise<void> {
  const key = WorkflowLock.stableKey([process.env.GITHUB_REPOSITORY ?? 'local', process.env.GITHUB_REF ?? 'local', 'security-control-plane']);
  const lock = await new WorkflowLock().acquire(key, { owner: process.env.GITHUB_ACTOR ?? 'local', runId: process.env.GITHUB_RUN_ID ?? `${process.pid}`, ref: process.env.GITHUB_REF ?? 'local' }, 180);
  await emit('workflow.lock.acquired', 'info', lock as unknown as Record<string, unknown>);
}

async function aggregate(): Promise<void> {
  const inputs = await findSarifFiles();
  const summary = await new SarifAggregator().aggregate(inputs, 'security/sarif/aggregate.sarif');
  await writeJson('security/reports/sarif-aggregate-summary.json', summary);
  await emit('sarif.aggregated', summary.duplicateResults > 0 ? 'warning' : 'info', summary as unknown as Record<string, unknown>);
}

async function queue(): Promise<void> {
  const remediationQueue = new RemediationQueue();
  const items = await remediationQueue.enqueueFromSarif('security/sarif/aggregate.sarif', 50);
  const canary = await remediationQueue.promoteCanary(Number(process.env.CANARY_REMEDIATION_LIMIT ?? 5));
  const metrics = remediationQueue.metrics(items);
  await writeJson('security/reports/remediation-queue-summary.json', { metrics, canary });
  await emit('remediation.canary.selected', 'info', { metrics, selected: canary.map((item) => item.id) });
}

async function rollback(): Promise<void> {
  const started = new Date();
  const engine = new RollbackEngine();
  const shouldRollback = process.env.SECURITY_CANARY_STATUS === 'failed';
  const plan = shouldRollback ? engine.createPlan('canary-failed', process.env.GITHUB_HEAD_REF ?? 'security-control-plane-canary', process.env.GITHUB_BASE_REF ?? 'main') : null;
  if (plan) await writeJson('security/reports/rollback-plan.json', plan);
  const record = await engine.record(plan, started, plan ? 'planned' : 'not_required');
  await emit('rollback.evaluated', plan ? 'critical' : 'info', { plan, record });
}

async function metrics(): Promise<void> {
  const queue = new RemediationQueue();
  const queueItems = await queue.load();
  const queueMetrics = queue.metrics(queueItems);
  let sarifUniqueResults = 0;
  let sarifTrendDelta = 0;
  try {
    const sarifSummary = JSON.parse(await readFile('security/reports/sarif-aggregate-summary.json', 'utf8')) as { uniqueResults?: number; trend?: { delta?: number } };
    sarifUniqueResults = Number(sarifSummary.uniqueResults ?? 0);
    sarifTrendDelta = Number(sarifSummary.trend?.delta ?? 0);
  } catch { sarifUniqueResults = 0; }
  const estimatedMinutes = Number(process.env.SECURITY_CONTROL_PLANE_ELAPSED_MINUTES ?? 0);
  const report: Metrics = {
    remediationSuccessRate: Number(queueMetrics.successRate.toFixed(4)),
    meanRollbackTimeMs: await new RollbackEngine().meanRollbackTimeMs(),
    sarifUniqueResults,
    sarifTrendDelta,
    workflowExecutionCost: { estimatedMinutes, estimatedUsd: Number((estimatedMinutes * 0.008).toFixed(4)) },
    runnerResourceUtilization: await resourceUtilization(),
  };
  await writeJson(metricsFile, report);
  await emit('metrics.recorded', 'info', report as unknown as Record<string, unknown>);
}

async function releaseLock(): Promise<void> {
  const key = WorkflowLock.stableKey([process.env.GITHUB_REPOSITORY ?? 'local', process.env.GITHUB_REF ?? 'local', 'security-control-plane']);
  const released = await new WorkflowLock().release(key, process.env.GITHUB_RUN_ID ?? `${process.pid}`);
  await emit('workflow.lock.released', 'info', { key, released });
}

async function main(): Promise<void> {
  const command = process.argv[2] ?? 'initialize';
  if (command === 'initialize') return initialize();
  if (command === 'acquire-lock') return acquireLock();
  if (command === 'aggregate-sarif') return aggregate();
  if (command === 'queue-remediation') return queue();
  if (command === 'rollback') return rollback();
  if (command === 'metrics') return metrics();
  if (command === 'release-lock') return releaseLock();
  if (command === 'emit') return void await emit(process.argv[3] ?? 'custom', 'info', { argv: process.argv.slice(4) });
  if (command === 'freeze-remediation') return void await emit('remediation.freeze', 'critical', { reason: 'rollback' });
  throw new Error(`unknown orchestrator command: ${command}`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
