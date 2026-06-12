import { describe, it, expect, beforeEach } from 'vitest'
import { SwarmCoordinator } from '../../runtime/swarm'
import { AgentRegistry } from '../../agents/registry'
import { MemorySystem } from '../../memory/system'

describe('SwarmCoordinator', () => {
  let swarm: SwarmCoordinator
  let agents: AgentRegistry

  beforeEach(async () => {
    const memory = new MemorySystem()
    await memory.init()
    agents = new AgentRegistry(memory)
    swarm = new SwarmCoordinator(agents)
  })

  it('should execute parallel tasks', async () => {
    const results = await swarm.executeParallel([
      { role: 'architect', input: 'Design system' },
      { role: 'backend', input: 'Build API' },
      { role: 'frontend', input: 'Create UI' },
    ])
    expect(results).toHaveLength(3)
    for (const r of results) {
      expect(r.status).toBe('success')
    }
  })

  it('should execute sequential tasks', async () => {
    const results = await swarm.executeSequential([
      { role: 'architect', input: 'Design system' },
      { role: 'backend', input: 'Build API' },
    ])
    expect(results).toHaveLength(2)
  })

  it('should reach consensus', async () => {
    const { results, consensus } = await swarm.executeWithConsensus(
      'Review architecture',
      ['architect', 'security', 'reviewer']
    )
    expect(results).toHaveLength(3)
    expect(consensus).toBe('Full consensus')
  })

  it('should handle single task swarm', async () => {
    const results = await swarm.executeParallel([
      { role: 'research', input: 'Research topic' },
    ])
    expect(results).toHaveLength(1)
    expect(results[0].status).toBe('success')
  })
})
