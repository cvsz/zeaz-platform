import { BaseAgent } from './base'
import type { AgentConfig, AgentContext, AgentResult } from './types'

export class ReviewerAgent extends BaseAgent {
  constructor(config: AgentConfig, memory: import('../memory/system').MemorySystem) {
    super(config, memory)
  }

  async execute(context: AgentContext): Promise<AgentResult> {
    const startTime = Date.now()
    try {
      const code = context.input
      const review = await this.reviewCode(code)
      const score = this.scoreReview(review)

      return this.buildResult('success', review, {
        tokensUsed: review.length,
        durationMs: Date.now() - startTime,
        modelUsed: this.config.modelPreference ?? 'claude-opus',
        cost: 0,
      }, {
        artifacts: { review, score },
        nextSteps: score < 7 ? ['Address critical issues', 'Request re-review'] : ['Approve changes'],
      })
    } catch (error) {
      return this.buildResult('failure', `Code review failed: ${(error as Error).message}`, {
        tokensUsed: 0,
        durationMs: Date.now() - startTime,
        modelUsed: this.config.modelPreference ?? 'claude-opus',
        cost: 0,
      }, { errors: [(error as Error).message] })
    }
  }

  private async reviewCode(code: string): Promise<string> {
    return `Code review for: ${code}`
  }

  private scoreReview(review: string): number {
    return review.includes('critical') ? 4 : 8
  }
}
