import { ZeazOrchestrator } from './runtime/orchestrator'
import { AgentRegistry } from './agents/registry'
import { LLMRouter } from './providers/router'
import { MCPServer } from './mcp/server'
import { MemorySystem } from './memory/system'
import { SkillRegistry } from './skills/registry'
import { WorkflowEngine } from './workflows/engine'

export class ZeazOmega {
  private orchestrator: ZeazOrchestrator
  private agents: AgentRegistry
  private llmRouter: LLMRouter
  private mcp: MCPServer
  private memory: MemorySystem
  private skills: SkillRegistry
  private workflows: WorkflowEngine

  constructor() {
    this.memory = new MemorySystem()
    this.skills = new SkillRegistry()
    this.agents = new AgentRegistry(this.memory)
    this.llmRouter = new LLMRouter()
    this.mcp = new MCPServer()
    this.workflows = new WorkflowEngine(this.agents, this.llmRouter)
    this.orchestrator = new ZeazOrchestrator(
      this.agents,
      this.llmRouter,
      this.mcp,
      this.memory,
      this.skills,
      this.workflows
    )
  }

  async init(): Promise<void> {
    await this.mcp.start()
    await this.orchestrator.init()
  }

  async shutdown(): Promise<void> {
    await this.orchestrator.shutdown()
    await this.mcp.stop()
  }

  getOrchestrator(): ZeazOrchestrator {
    return this.orchestrator
  }
}

export { ZeazOrchestrator } from './runtime/orchestrator'
export { AgentRegistry } from './agents/registry'
export { LLMRouter } from './providers/router'
export { MCPServer } from './mcp/server'
export { MemorySystem } from './memory/system'
export { SkillRegistry } from './skills/registry'
export { WorkflowEngine } from './workflows/engine'
export { BaseAgent } from './agents/base'
export { type AgentConfig, type AgentContext, type AgentResult } from './agents/types'
export { type LLMProvider, type LLMRequest, type LLMResponse, type RouteResult } from './providers/types'
export { type MCPProvider, type MCPTool } from './mcp/types'
export { type MemoryEntry, type MemoryQuery } from './memory/types'
export { type Workflow, type WorkflowStep, type WorkflowStatus } from './workflows/types'
