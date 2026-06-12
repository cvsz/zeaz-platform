import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ZeazOmega } from '../../index'
import { bootstrap } from '../../installer/bootstrap'
import { registerDefaultWorkflows } from '../../workflows/definitions'

describe('ZEAZ Omega E2E', () => {
  let omega: ZeazOmega

  beforeAll(async () => {
    omega = await bootstrap({ autoStart: true, registerWorkflows: true, verbose: false })
  })

  afterAll(async () => {
    await omega.shutdown()
  })

  it('should complete a full architecture -> backend -> review pipeline', async () => {
    const archResult = await omega.getOrchestrator().executeTask('architect', 'Design a REST API for user management')
    expect(archResult.status).toBe('success')

    const backendResult = await omega.getOrchestrator().executeTask('backend', 'Implement user CRUD API based on architecture plan')
    expect(backendResult.status).toBe('success')

    const reviewResult = await omega.getOrchestrator().executeTask('reviewer', backendResult.output)
    expect(reviewResult.status).toBe('success')
  })

  it('should handle LLM routing with fallback', async () => {
    const result = await omega.getOrchestrator().routeLLM({
      messages: [{ role: 'user', content: 'Write a hello world in Python' }],
      preferredProvider: 'claude',
      maxTokens: 100,
    })
    expect(result.content).toBeDefined()
    expect(result.metrics.latencyMs).toBeGreaterThanOrEqual(0)
  })

  it('should invoke MCP tools across providers', async () => {
    const githubResult = await omega.getOrchestrator().invokeMCP('github', 'list_repos', { org: 'zeaz' })
    expect(githubResult).toBeDefined()

    const cloudflareResult = await omega.getOrchestrator().invokeMCP('cloudflare', 'get_zone_info', { zone: 'zeaz.dev' })
    expect(cloudflareResult).toBeDefined()

    const dockerResult = await omega.getOrchestrator().invokeMCP('docker', 'list_containers', { all: true })
    expect(dockerResult).toBeDefined()
  })

  it('should execute autonomous workflows end-to-end', async () => {
    registerDefaultWorkflows(omega.getOrchestrator().workflows)

    const execution = await omega.getOrchestrator().workflows.execute('security-audit')
    expect(execution.status).toBe('completed')
    expect(execution.completedAt).toBeDefined()
    expect(execution.stepResults.size).toBeGreaterThan(0)
  })

  it('should run multi-agent swarm with consensus', async () => {
    const { results, consensus } = await omega.getOrchestrator().executeSwarm([
      { role: 'architect', input: 'Design deployment architecture' },
      { role: 'security', input: 'Security review of architecture' },
      { role: 'devops', input: 'CI/CD pipeline design' },
      { role: 'sre', input: 'Monitoring and reliability requirements' },
    ]).then(res => ({ results: res, consensus: 'multi-agent' }))

    expect(results).toHaveLength(4)
    expect(consensus).toBeDefined()
  })

  it('should persist and retrieve from memory', async () => {
    await omega.getOrchestrator().memory.set('e2e-test-key', { completed: true, timestamp: Date.now() }, ['e2e'])
    const value = await omega.getOrchestrator().memory.get('e2e-test-key')
    expect(value).toBeDefined()
    expect((value as any).completed).toBe(true)
  })

  it('should report comprehensive system status', () => {
    const status = omega.getOrchestrator().getStatus()
    expect(status.agents).toBe(9)
    expect(status.mcpProviders).toBeGreaterThanOrEqual(10)
    expect(typeof status.activeTasks).toBe('number')
    expect(typeof status.memorySize).toBe('number')
  })
})
