import { describe, it, expect, beforeEach } from 'vitest'
import { AgentRegistry } from '../../agents/registry'
import { MemorySystem } from '../../memory/system'

describe('AgentRegistry', () => {
  let registry: AgentRegistry
  let memory: MemorySystem

  beforeEach(async () => {
    memory = new MemorySystem()
    await memory.init()
    registry = new AgentRegistry(memory)
  })

  it('should register all 9 default agents', () => {
    const agents = registry.list()
    expect(agents).toHaveLength(9)
  })

  it('should get agent by role', () => {
    const agent = registry.get('architect')
    expect(agent.role).toBe('architect')
    expect(agent.config.name).toBe('Architect Agent')
  })

  it('should throw for unknown agent role', () => {
    expect(() => registry.get('unknown' as any)).toThrow()
  })

  it('should check agent existence', () => {
    expect(registry.has('backend')).toBe(true)
    expect(registry.has('nonexistent' as any)).toBe(false)
  })

  it('should list all agent roles', () => {
    const roles = registry.list().map(a => a.role)
    expect(roles).toContain('architect')
    expect(roles).toContain('backend')
    expect(roles).toContain('frontend')
    expect(roles).toContain('security')
    expect(roles).toContain('devops')
    expect(roles).toContain('sre')
    expect(roles).toContain('research')
    expect(roles).toContain('reviewer')
    expect(roles).toContain('pm')
  })

  it('should register custom agent', () => {
    const customAgent = {
      role: 'custom' as any,
      config: { role: 'custom' as any, name: 'Custom', description: 'Custom agent' },
      execute: async () => ({ taskId: '', agentRole: 'custom' as any, status: 'success' as const, output: '', metrics: { tokensUsed: 0, durationMs: 0, modelUsed: '', cost: 0 } }),
    }
    registry.register(customAgent as any)
    expect(registry.has('custom' as any)).toBe(true)
  })
})
