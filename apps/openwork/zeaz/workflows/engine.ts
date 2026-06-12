import type { AgentRegistry } from '../agents/registry'
import type { LLMRouter } from '../providers/router'
import type { Workflow, WorkflowStep, WorkflowExecution, WorkflowStatus } from './types'
import { randomUUID } from 'node:crypto'

export class WorkflowEngine {
  private workflows: Map<string, Workflow> = new Map()
  private executions: Map<string, WorkflowExecution> = new Map()
  private agents: AgentRegistry
  private llm: LLMRouter

  constructor(agents: AgentRegistry, llm: LLMRouter) {
    this.agents = agents
    this.llm = llm
  }

  register(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow)
  }

  get(id: string): Workflow | undefined {
    return this.workflows.get(id)
  }

  list(): Workflow[] {
    return Array.from(this.workflows.values())
  }

  async execute(workflowId: string, inputs?: Record<string, string>): Promise<WorkflowExecution> {
    const execution: WorkflowExecution = {
      workflowId,
      executionId: randomUUID(),
      startedAt: Date.now(),
      status: 'failed',
      currentStep: '',
      stepResults: new Map(),
    }

    const workflow = this.workflows.get(workflowId)
    if (!workflow) {
      execution.error = `Workflow ${workflowId} not found`
      execution.completedAt = Date.now()
      this.executions.set(execution.executionId, execution)
      return execution
    }

    execution.status = 'running'
    execution.currentStep = workflow.steps[0]?.id ?? ''
    this.executions.set(execution.executionId, execution)

    try {
      for (const step of workflow.steps) {
        execution.currentStep = step.id
        const result = await this.executeStep(step, inputs)
        execution.stepResults.set(step.id, result)
      }

      execution.status = 'completed'
      execution.completedAt = Date.now()
    } catch (error) {
      execution.status = 'failed'
      execution.error = (error as Error).message
      execution.completedAt = Date.now()
    }

    return execution
  }

  private async executeStep(step: WorkflowStep, inputs?: Record<string, string>): Promise<unknown> {
    const resolvedInput = inputs?.[step.input] ?? step.input

    switch (step.type) {
      case 'agent': {
        if (!step.config.agentRole) throw new Error('Agent role required')
        return this.agents.execute(step.config.agentRole, {
          sessionId: randomUUID(),
          input: resolvedInput,
        })
      }
      case 'llm': {
        return this.llm.routeWithRetry({
          model: step.config.llmModel,
          messages: [{ role: 'user', content: resolvedInput }],
        })
      }
      case 'mcp': {
        throw new Error('MCP steps not yet implemented in engine')
      }
      case 'condition': {
        return { evaluated: true, condition: step.config.condition }
      }
      default:
        return { executed: true, step: step.name }
    }
  }

  getExecution(id: string): WorkflowExecution | undefined {
    return this.executions.get(id)
  }
}
