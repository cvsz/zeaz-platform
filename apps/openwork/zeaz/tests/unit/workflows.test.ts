import { describe, it, expect, beforeEach } from 'vitest'
import { WorkflowEngine } from '../../workflows/engine'
import { AgentRegistry } from '../../agents/registry'
import { LLMRouter } from '../../providers/router'
import { MemorySystem } from '../../memory/system'
import { registerDefaultWorkflows } from '../../workflows/definitions'

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine
  let agents: AgentRegistry
  let llm: LLMRouter

  beforeEach(async () => {
    const memory = new MemorySystem()
    await memory.init()
    agents = new AgentRegistry(memory)
    llm = new LLMRouter()
    engine = new WorkflowEngine(agents, llm)
  })

  it('should register and list workflows', () => {
    registerDefaultWorkflows(engine)
    const workflows = engine.list()
    expect(workflows).toHaveLength(5)
  })

  it('should register single workflow', () => {
    engine.register({
      id: 'test-flow',
      name: 'Test Flow',
      description: 'A test workflow',
      status: 'idle',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      steps: [
        { id: 'step1', name: 'Step 1', type: 'agent', config: { agentRole: 'architect' }, input: 'test' },
      ],
    })

    const wf = engine.get('test-flow')
    expect(wf).toBeDefined()
    expect(wf!.name).toBe('Test Flow')
  })

  it('should execute a simple workflow', async () => {
    registerDefaultWorkflows(engine)

    const execution = await engine.execute('repo-upgrade')
    expect(execution.status).toBe('completed')
    expect(execution.completedAt).toBeDefined()
  })

  it('should handle execution errors gracefully', async () => {
    registerDefaultWorkflows(engine)

    const execution = await engine.execute('nonexistent')
    expect(execution.status).toBe('failed')
    expect(execution.error).toBeDefined()
  })
})
