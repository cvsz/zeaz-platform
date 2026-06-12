import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { ZeazOmega } from '../../index'

describe('ZeazOmega Integration', () => {
  let omega: ZeazOmega

  beforeAll(async () => {
    omega = new ZeazOmega()
    await omega.init()
  })

  afterAll(async () => {
    await omega.shutdown()
  })

  it('should initialize with all components', () => {
    const status = omega.getOrchestrator().getStatus()
    expect(status.agents).toBe(9)
    expect(status.mcpProviders).toBeGreaterThanOrEqual(10)
    expect(status.workflows).toBe(0) // no default workflows loaded
  })

  it('should execute agent task', async () => {
    const result = await omega.getOrchestrator().executeTask('architect', 'Design a microservice architecture')
    expect(result.status).toBe('success')
    expect(result.agentRole).toBe('architect')
    expect(result.output).toBeDefined()
  })

  it('should route LLM request', async () => {
    const result = await omega.getOrchestrator().routeLLM({
      messages: [{ role: 'user', content: 'Hello' }],
    })
    expect(result.content).toBeDefined()
    expect(result.provider).toBeDefined()
  })

  it('should invoke MCP tool', async () => {
    const result = await omega.getOrchestrator().invokeMCP('github', 'list_repos', { org: 'zeaz' })
    expect(result).toBeDefined()
  })

  it('should execute swarm tasks', async () => {
    const results = await omega.getOrchestrator().executeSwarm([
      { role: 'architect', input: 'Design system' },
      { role: 'security', input: 'Security review' },
    ])
    expect(results).toHaveLength(2)
    expect(results[0].status).toBe('success')
    expect(results[1].status).toBe('success')
  })

  it('should report system status', () => {
    const status = omega.getOrchestrator().getStatus()
    expect(typeof status.agents).toBe('number')
    expect(typeof status.mcpProviders).toBe('number')
    expect(typeof status.activeTasks).toBe('number')
    expect(typeof status.runtimeConnected).toBe('boolean')
  })
})
