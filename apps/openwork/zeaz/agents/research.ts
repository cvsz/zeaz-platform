import { BaseAgent } from './base'
import type { AgentConfig, AgentContext, AgentResult } from './types'

export class ResearchAgent extends BaseAgent {
  constructor(config: AgentConfig, memory: import('../memory/system').MemorySystem) {
    super(config, memory)
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now()
    try {
      const query = context.input
      const findings = await this.gatherFindings(query)
      const synthesis = await this.synthesize(findings)

      return this.buildResult('success', synthesis, {
        tokensUsed: findings.length + synthesis.length,
        durationMs: Date.now() - startTime,
        modelUsed: this.config.modelPreference ?? 'claude-sonnet',
        cost: 0,
      }, {
        artifacts: { findings, synthesis },
      })
    } catch (error) {
      return this.buildResult('failure', `Research failed: ${(error as Error).message}`, {
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
        modelUsed: this.config.modelPreference ?? 'claude-sonnet',
        cost: 0,
      }, { errors: [(error as Error).message] })
    }
  }

  private async gatherFindings(query: string): Promise<string> {
    return `Research findings for: ${query}`
  }

  private async synthesize(findings: string): Promise<string> {
    return `Synthesized report: ${findings}`
  }
}
