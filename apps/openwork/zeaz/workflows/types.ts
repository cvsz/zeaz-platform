import type { AgentRole } from '../agents/types'

export type WorkflowStatus = 'idle' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled'

export interface Workflow {
  id: string
  name: string
  description: string
  steps: WorkflowStep[]
  triggers?: WorkflowTrigger[]
  config?: Record<string, unknown>
  status: WorkflowStatus
  createdAt: number
  updatedAt: number
}

export interface WorkflowStep {
  id: string
  name: string
  type: 'agent' | 'llm' | 'mcp' | 'condition' | 'parallel' | 'subworkflow'
  config: {
    agentRole?: AgentRole
    llmModel?: string
    mcpProvider?: string
    mcpTool?: string
    condition?: string
    parallel_steps?: string[]
    subworkflowId?: string
  }
  input: string
  dependsOn?: string[]
  timeoutMs?: number
  retryCount?: number
}

export interface WorkflowTrigger {
  type: 'cron' | 'webhook' | 'event' | 'manual'
  config: Record<string, unknown>
}

export interface WorkflowExecution {
  workflowId: string
  executionId: string
  startedAt: number
  completedAt?: number
  status: WorkflowStatus
  currentStep: string
  stepResults: Map<string, unknown>
  error?: string
}
