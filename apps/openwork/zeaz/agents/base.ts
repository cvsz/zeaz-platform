import type { AgentConfig, AgentContext, AgentResult, AgentRole, AgentMessage } from './types'
import type { MemorySystem } from '../memory/system'
import { randomUUID } from 'node:crypto'

export abstract class BaseAgent {
  readonly role: AgentRole
  readonly config: AgentConfig
  protected memory: MemorySystem

  constructor(config: AgentConfig, memory: MemorySystem) {
    this.role = config.role
    this.config = config
    this.memory = memory
  }

  abstract execute(context: AgentContext): Promise<AgentResult>

  async plan(context: AgentContext): Promise<AgentResult['nextSteps']> {
    return [`Analyzing ${context.input.substring(0, 50)}...`, 'Breaking down subtasks...']
  }

  protected async recordMemory(key: string, value: unknown): Promise<void> {
    await this.memory.set(`agent:${this.role}:${key}`, value)
  }

  protected async recallMemory(key: string): Promise<unknown> {
    return this.memory.get(`agent:${this.role}:${key}`)
  }

  protected buildResult(
    status: AgentResult['status'],
    output: string,
    metrics: Partial<AgentResult['metrics']>,
    extras?: Partial<AgentResult>
  ): AgentResult {
    return {
      taskId: randomUUID(),
      agentRole: this.role,
      status,
      output,
      metrics: {
        tokensUsed: metrics.tokensUsed ?? 0,
        durationMs: metrics.durationMs ?? 0,
        modelUsed: metrics.modelUsed ?? this.config.modelPreference ?? 'unknown',
        cost: metrics.cost ?? 0,
      },
      ...extras,
    }
  }
}
