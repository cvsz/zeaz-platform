---
name: zai-v3
description: Master skill combining related sub-skills
---

# zai-v3

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Sub-skill: v3-cli-modernization

# V3 CLI Modernization

## What This Skill Does

Modernizes claude-flow v3 CLI with interactive prompts, intelligent command decomposition, enhanced hooks integration, performance optimization, and comprehensive workflow automation capabilities.

## Quick Start

```bash
# Initialize CLI modernization analysis
Task("CLI architecture", "Analyze current CLI structure and identify optimization opportunities", "cli-hooks-developer")

# Modernization implementation (parallel)
Task("Command decomposition", "Break down large CLI files into focused modules", "cli-hooks-developer")
Task("Interactive prompts", "Implement intelligent interactive CLI experience", "cli-hooks-developer")
Task("Hooks enhancement", "Deep integrate hooks with CLI lifecycle", "cli-hooks-developer")
```

## CLI Architecture Modernization

### Current State Analysis
```
Current CLI Issues:
├── index.ts: 108KB monolithic file
├── enterprise.ts: 68KB feature module
├── Limited interactivity: Basic command parsing
├── Hooks integration: Basic pre/post execution
└── No intelligent workflows: Manual command chaining

Target Architecture:
├── Modular Commands: <500 lines per command
├── Interactive Prompts: Smart context-aware UX
├── Enhanced Hooks: Deep lifecycle integration
├── Workflow Automation: Intelligent command orchestration
└── Performance: <200ms command response time
```

### Modular Command Architecture
```typescript
// src/cli/core/command-registry.ts
interface CommandModule {
  name: string;
  description: string;
  category: CommandCategory;
  handler: CommandHandler;
  middleware: MiddlewareStack;
  permissions: Permission[];
  examples: CommandExample[];
}

export class ModularCommandRegistry {
  private commands = new Map<string, CommandModule>();
  private categories = new Map<CommandCategory, CommandModule[]>();
  private aliases = new Map<string, string>();

  registerCommand(command: CommandModule): void {
    this.commands.set(command.name, command);

    // Register in category index
    if (!this.categories.has(command.category)) {
      this.categories.set(command.category, []);
    }
    this.categories.get(command.category)!.push(command);
  }

  async executeCommand(name: string, args: string[]): Promise<CommandResult> {
    const command = this.resolveCommand(name);
    if (!command) {
      throw new CommandNotFoundError(name, this.getSuggestions(name));
    }

    // Execute middleware stack
    const context = await this.buildExecutionContext(command, args);
    const result = await command.middleware.execute(context);

    return result;
  }

  private resolveCommand(name: string): CommandModule | undefined {
    // Try exact match first
    if (this.commands.has(name)) {
      return this.commands.get(name);
    }

    // Try alias
    const aliasTarget = this.aliases.get(name);
    if (aliasTarget) {
      return this.commands.get(aliasTarget);
    }

    // Try fuzzy match
    return this.findFuzzyMatch(name);
  }
}
```

## Command Decomposition Strategy

### Swarm Commands Module
```typescript
// src/cli/commands/swarm/swarm.command.ts
@Command({
  name: 'swarm',
  description: 'Swarm coordination and management',
  category: 'orchestration'
})
export class SwarmCommand {
  constructor(
    private swarmCoordinator: UnifiedSwarmCoordinator,
    private promptService: InteractivePromptService
  ) {}

  @SubCommand('init')
  @Option('--topology', 'Swarm topology (mesh|hierarchical|adaptive)', 'hierarchical')
  @Option('--agents', 'Number of agents to spawn', 5)
  @Option('--interactive', 'Interactive agent configuration', false)
  async init(
    @Arg('projectName') projectName: string,
    options: SwarmInitOptions
  ): Promise<CommandResult> {

    if (options.interactive) {
      return this.interactiveSwarmInit(projectName);
    }

    return this.quickSwarmInit(projectName, options);
  }

  private async interactiveSwarmInit(projectName: string): Promise<CommandResult> {
    console.log(`🚀 Initializing Swarm for ${projectName}`);

    // Interactive topology selection
    const topology = await this.promptService.select({
      message: 'Select swarm topology:',
      choices: [
        { name: 'Hierarchical (Queen-led coordination)', value: 'hierarchical' },
        { name: 'Mesh (Peer-to-peer collaboration)', value: 'mesh' },
        { name: 'Adaptive (Dynamic topology switching)', value: 'adaptive' }
      ]
    });

    // Agent configuration
    const agents = await this.promptAgentConfiguration();

    // Initialize with configuration
    const swarm = await this.swarmCoordinator.initialize({
      name: projectName,
      topology,
      agents,
      hooks: {
        onAgentSpawn: this.handleAgentSpawn.bind(this),
        onTaskComplete: this.handleTaskComplete.bind(this),
        onSwarmComplete: this.handleSwarmComplete.bind(this)
      }
    });

    return CommandResult.success({
      message: `✅ Swarm ${projectName} initialized with ${agents.length} agents`,
      data: { swarmId: swarm.id, topology, agentCount: agents.length }
    });
  }

  @SubCommand('status')
  async status(): Promise<CommandResult> {
    const swarms = await this.swarmCoordinator.listActiveSwarms();

    if (swarms.length === 0) {
      return CommandResult.info('No active swarms found');
    }

    // Interactive swarm selection if multiple
    const selectedSwarm = swarms.length === 1
      ? swarms[0]
      : await this.promptService.select({
          message: 'Select swarm to inspect:',
          choices: swarms.map(s => ({
            name: `${s.name} (${s.agents.length} agents, ${s.topology})`,
            value: s
          }))
        });

    return this.displaySwarmStatus(selectedSwarm);
  }
}
```

### Learning Commands Module
```typescript
// src/cli/commands/learning/learning.command.ts
@Command({
  name: 'learning',
  description: 'Learning system management and optimization',
  category: 'intelligence'
})
export class LearningCommand {
  constructor(
    private learningService: IntegratedLearningService,
    private promptService: InteractivePromptService
  ) {}

  @SubCommand('start')
  @Option('--algorithm', 'RL algorithm to use', 'auto')
  @Option('--tier', 'Learning tier (basic|standard|advanced)', 'standard')
  async start(options: LearningStartOptions): Promise<CommandResult> {
    // Auto-detect optimal algorithm if not specified
    if (options.algorithm === 'auto') {
      const taskContext = await this.analyzeCurrentContext();
      options.algorithm = this.learningService.selectOptimalAlgorithm(taskContext);

      console.log(`🧠 Auto-selected ${options.algorithm} algorithm based on context`);
    }

    const session = await this.learningService.startSession({
      algorithm: options.algorithm,
      tier: options.tier,
      userId: await this.getCurrentUser()
    });

    return CommandResult.success({
      message: `🚀 Learning session started with ${options.algorithm}`,
      data: { sessionId: session.id, algorithm: options.algorithm, tier: options.tier }
    });
  }

  @SubCommand('feedback')
  @Arg('reward', 'Reward value (0-1)', 'number')
  async feedback(
    @Arg('reward') reward: number,
    @Option('--context', 'Additional context for learning')
    context?: string
  ): Promise<CommandResult> {
    const activeSession = await this.learningService.getActiveSession();
    if (!activeSession) {
      return CommandResult.error('No active learning session found. Start one with `learning start`');
    }

    await this.learningService.submitFeedback({
      sessionId: activeSession.id,
      reward,
      context,
      timestamp: new Date()
    });

    return CommandResult.success({
      message: `📊 Feedback recorded (reward: ${reward})`,
      data: { reward, sessionId: activeSession.id }
    });
  }

  @SubCommand('metrics')
  async metrics(): Promise<CommandResult> {
    const metrics = await this.learningService.getMetrics();

    // Interactive metrics display
    await this.displayInteractiveMetrics(metrics);

    return CommandResult.success('Metrics displayed');
  }
}
```

## Interactive Prompt System

### Advanced Prompt Service
```typescript
// src/cli/services/interactive-prompt.service.ts
interface PromptOptions {
  message: string;
  type: 'select' | 'multiselect' | 'input' | 'confirm' | 'progress';
  choices?: PromptChoice[];
  default?: any;
  validate?: (input: any) => boolean | string;
  transform?: (input: any) => any;
}

export class InteractivePromptService {
  private inquirer: any; // Dynamic import for tree-shaking

  async select<T>(options: SelectPromptOptions<T>): Promise<T> {
    const { default: inquirer } = await import('inquirer');

    const result = await inquirer.prompt([{
      type: 'list',
      name: 'selection',
      message: options.message,
      choices: options.choices,
      default: options.default
    }]);

    return result.selection;
  }

  async multiSelect<T>(options: MultiSelectPromptOptions<T>): Promise<T[]> {
    const { default: inquirer } = await import('inquirer');

    const result = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selections',
      message: options.message,
      choices: options.choices,
      validate: (input: T[]) => {
        if (options.minSelections && input.length < options.minSelections) {
          return `Please select at least ${options.minSelections} options`;
        }
        if (options.maxSelections && input.length > options.maxSelections) {
          return `Please select at most ${options.maxSelections} options`;
        }
        return true;
      }
    }]);

    return result.selections;
  }

  async input(options: InputPromptOptions): Promise<string> {
    const { default: inquirer } = await import('inquirer');

    const result = await inquirer.prompt([{
      type: 'input',
      name: 'input',
      message: options.message,
      default: options.default,
      validate: options.validate,
      transformer: options.transform
    }]);

    return result.input;
  }

  async progressTask<T>(
    task: ProgressTask<T>,
    options: ProgressOptions
  ): Promise<T> {
    const { default: cliProgress } = await import('cli-progress');

    const progressBar = new cliProgress.SingleBar({
      format: `${options.title} |{bar}| {percentage}% | {status}`,
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true
    });

    progressBar.start(100, 0, { status: 'Starting...' });

    try {
      const result = await task({
        updateProgress: (percent: number, status?: string) => {
          progressBar.update(percent, { status: status || 'Processing...' });
        }
      });

      progressBar.update(100, { status: 'Complete!' });
      progressBar.stop();

      return result;
    } catch (error) {
      progressBar.stop();
      throw error;
    }
  }

  async confirmWithDetails(
    message: string,
    details: ConfirmationDetails
  ): Promise<boolean> {
    console.log('\n' + chalk.bold(message));
    console.log(chalk.gray('Details:'));

    for (const [key, value] of Object.entries(details)) {
      console.log(chalk.gray(`  ${key}: ${value}`));
    }

    return this.confirm('\nProceed?');
  }
}
```

## Enhanced Hooks Integration

### Deep CLI Hooks Integration
```typescript
// src/cli/hooks/cli-hooks-manager.ts
interface CLIHookEvent {
  type: 'command_start' | 'command_end' | 'command_error' | 'agent_spawn' | 'task_complete';
  command: string;
  args: string[];
  context: ExecutionContext;
  timestamp: Date;
}

export class CLIHooksManager {
  private hooks: Map<string, HookHandler[]> = new Map();
  private learningIntegration: LearningHooksIntegration;

  constructor() {
    this.learningIntegration = new LearningHooksIntegration();
    this.setupDefaultHooks();
  }

  private setupDefaultHooks(): void {
    // Learning integration hooks
    this.registerHook('command_start', async (event: CLIHookEvent) => {
      await this.learningIntegration.recordCommandStart(event);
    });

    this.registerHook('command_end', async (event: CLIHookEvent) => {
      await this.learningIntegration.recordCommandSuccess(event);
    });

    this.registerHook('command_error', async (event: CLIHookEvent) => {
      await this.learningIntegration.recordCommandError(event);
    });

    // Intelligent suggestions
    this.registerHook('command_start', async (event: CLIHookEvent) => {
      const suggestions = await this.generateIntelligentSuggestions(event);
      if (suggestions.length > 0) {
        this.displaySuggestions(suggestions);
      }
    });

    // Performance monitoring
    this.registerHook('command_end', async (event: CLIHookEvent) => {
      await this.recordPerformanceMetrics(event);
    });
  }

  async executeHooks(type: string, event: CLIHookEvent): Promise<void> {
    const handlers = this.hooks.get(type) || [];

    await Promise.all(handlers.map(handler =>
      this.executeHookSafely(handler, event)
    ));
  }

  private async generateIntelligentSuggestions(event: CLIHookEvent): Promise<Suggestion[]> {
    const context = await this.learningIntegration.getExecutionContext(event);
    const patterns = await this.learningIntegration.findSimilarPatterns(context);

    return patterns.map(pattern => ({
      type: 'optimization',
      message: `Based on similar executions, consider: ${pattern.suggestion}`,
      confidence: pattern.confidence
    }));
  }
}
```

### Learning Integration
```typescript
// src/cli/hooks/learning-hooks-integration.ts
export class LearningHooksIntegration {
  constructor(
    private agenticFlowHooks: AgenticFlowHooksClient,
    private agentDBLearning: AgentDBLearningClient
  ) {}

  async recordCommandStart(event: CLIHookEvent): Promise<void> {
    // Start trajectory tracking
    await this.agenticFlowHooks.trajectoryStart({
      sessionId: event.context.sessionId,
      command: event.command,
      args: event.args,
      context: event.context
    });

    // Record experience in AgentDB
    await this.agentDBLearning.recordExperience({
      type: 'command_execution',
      state: this.encodeCommandState(event),
      action: event.command,
      timestamp: event.timestamp
    });
  }

  async recordCommandSuccess(event: CLIHookEvent): Promise<void> {
    const executionTime = Date.now() - event.timestamp.getTime();
    const reward = this.calculateReward(event, executionTime, true);

    // Complete trajectory
    await this.agenticFlowHooks.trajectoryEnd({
      sessionId: event.context.sessionId,
      success: true,
      reward,
      verdict: 'positive'
    });

    // Submit feedback to learning system
    await this.agentDBLearning.submitFeedback({
      sessionId: event.context.learningSessionId,
      reward,
      success: true,
      latencyMs: executionTime
    });

    // Store successful pattern
    if (reward > 0.8) {
      await this.agenticFlowHooks.storePattern({
        pattern: event.command,
        solution: event.context.result,
        confidence: reward
      });
    }
  }

  async recordCommandError(event: CLIHookEvent): Promise<void> {
    const executionTime = Date.now() - event.timestamp.getTime();
    const reward = this.calculateReward(event, executionTime, false);

    // Complete trajectory with error
    await this.agenticFlowHooks.trajectoryEnd({
      sessionId: event.context.sessionId,
      success: false,
      reward,
      verdict: 'negative',
      error: event.context.error
    });

    // Learn from failure
    await this.agentDBLearning.submitFeedback({
      sessionId: event.context.learningSessionId,
      reward,
      success: false,
      latencyMs: executionTime,
      error: event.context.error
    });
  }

  private calculateReward(event: CLIHookEvent, executionTime: number, success: boolean): number {
    if (!success) return 0;

    // Base reward for success
    let reward = 0.5;

    // Performance bonus (faster execution)
    const expectedTime = this.getExpectedExecutionTime(event.command);
    if (executionTime < expectedTime) {
      reward += 0.3 * (1 - executionTime / expectedTime);
    }

    // Complexity bonus
    const complexity = this.calculateCommandComplexity(event);
    reward += complexity * 0.2;

    return Math.min(reward, 1.0);
  }
}
```

## Intelligent Workflow Automation

### Workflow Orchestrator
```typescript
// src/cli/workflows/workflow-orchestrator.ts
interface WorkflowStep {
  id: string;
  command: string;
  args: string[];
  dependsOn: string[];
  condition?: WorkflowCondition;
  retryPolicy?: RetryPolicy;
}

export class WorkflowOrchestrator {
  constructor(
    private commandRegistry: ModularCommandRegistry,
    private promptService: InteractivePromptService
  ) {}

  async executeWorkflow(workflow: Workflow): Promise<WorkflowResult> {
    const context = new WorkflowExecutionContext(workflow);

    // Display workflow overview
    await this.displayWorkflowOverview(workflow);

    const confirmed = await this.promptService.confirm(
      'Execute this workflow?'
    );

    if (!confirmed) {
      return WorkflowResult.cancelled();
    }

    // Execute steps
    return this.promptService.progressTask(
      async ({ updateProgress }) => {
        const steps = this.sortStepsByDependencies(workflow.steps);

        for (let i = 0; i < steps.length; i++) {
          const step = steps[i];
          updateProgress((i / steps.length) * 100, `Executing ${step.command}`);

          await this.executeStep(step, context);
        }

        return WorkflowResult.success(context.getResults());
      },
      { title: `Workflow: ${workflow.name}` }
    );
  }

  async generateWorkflowFromIntent(intent: string): Promise<Workflow> {
    // Use learning system to generate workflow
    const patterns = await this.findWorkflowPatterns(intent);

    if (patterns.length === 0) {
      throw new Error('Could not generate workflow for intent');
    }

    // Select best pattern or let user choose
    const selectedPattern = patterns.length === 1
      ? patterns[0]
      : await this.promptService.select({
          message: 'Select workflow template:',
          choices: patterns.map(p => ({
            name: `${p.name} (${p.confidence}% match)`,
            value: p
          }))
        });

    return this.customizeWorkflow(selectedPattern, intent);
  }

  private async executeStep(step: WorkflowStep, context: WorkflowExecutionContext): Promise<void> {
    // Check conditions
    if (step.condition && !this.evaluateCondition(step.condition, context)) {
      context.skipStep(step.id, 'Condition not met');
      return;
    }

    // Check dependencies
    const missingDeps = step.dependsOn.filter(dep => !context.isStepCompleted(dep));
    if (missingDeps.length > 0) {
      throw new WorkflowError(`Step ${step.id} has unmet dependencies: ${missingDeps.join(', ')}`);
    }

    // Execute with retry policy
    const retryPolicy = step.retryPolicy || { maxAttempts: 1 };
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        const result = await this.commandRegistry.executeCommand(step.command, step.args);
        context.completeStep(step.id, result);
        return;
      } catch (error) {
        lastError = error as Error;

        if (attempt < retryPolicy.maxAttempts) {
          await this.delay(retryPolicy.backoffMs || 1000);
        }
      }
    }

    throw new WorkflowError(`Step ${step.id} failed after ${retryPolicy.maxAttempts} attempts: ${lastError?.message}`);
  }
}
```

## Performance Optimization

### Command Performance Monitoring
```typescript
// src/cli/performance/command-performance.ts
export class CommandPerformanceMonitor {
  private metrics = new Map<string, CommandMetrics>();

  async measureCommand<T>(
    commandName: string,
    executor: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    const memBefore = process.memoryUsage();

    try {
      const result = await executor();
      const end = performance.now();
      const memAfter = process.memoryUsage();

      this.recordMetrics(commandName, {
        executionTime: end - start,
        memoryDelta: memAfter.heapUsed - memBefore.heapUsed,
        success: true
      });

      return result;
    } catch (error) {
      const end = performance.now();

      this.recordMetrics(commandName, {
        executionTime: end - start,
        memoryDelta: 0,
        success: false,
        error: error as Error
      });

      throw error;
    }
  }

  private recordMetrics(command: string, measurement: PerformanceMeasurement): void {
    if (!this.metrics.has(command)) {
      this.metrics.set(command, new CommandMetrics(command));
    }

    const metrics = this.metrics.get(command)!;
    metrics.addMeasurement(measurement);

    // Alert if performance degrades
    if (metrics.getP95ExecutionTime() > 5000) { // 5 seconds
      console.warn(`⚠️  Command '${command}' is performing slowly (P95: ${metrics.getP95ExecutionTime()}ms)`);
    }
  }

  getCommandReport(command: string): PerformanceReport {
    const metrics = this.metrics.get(command);
    if (!metrics) {
      throw new Error(`No metrics found for command: ${command}`);
    }

    return {
      command,
      totalExecutions: metrics.getTotalExecutions(),
      successRate: metrics.getSuccessRate(),
      avgExecutionTime: metrics.getAverageExecutionTime(),
      p95ExecutionTime: metrics.getP95ExecutionTime(),
      avgMemoryUsage: metrics.getAverageMemoryUsage(),
      recommendations: this.generateRecommendations(metrics)
    };
  }
}
```

## Smart Auto-completion

### Intelligent Command Completion
```typescript
// src/cli/completion/intelligent-completion.ts
export class IntelligentCompletion {
  constructor(
    private learningService: LearningService,
    private commandRegistry: ModularCommandRegistry
  ) {}

  async generateCompletions(
    partial: string,
    context: CompletionContext
  ): Promise<Completion[]> {
    const completions: Completion[] = [];

    // 1. Exact command matches
    const exactMatches = this.commandRegistry.findCommandsByPrefix(partial);
    completions.push(...exactMatches.map(cmd => ({
      value: cmd.name,
      description: cmd.description,
      type: 'command',
      confidence: 1.0
    })));

    // 2. Learning-based suggestions
    const learnedSuggestions = await this.learningService.suggestCommands(
      partial,
      context
    );
    completions.push(...learnedSuggestions);

    // 3. Context-aware suggestions
    const contextualSuggestions = await this.generateContextualSuggestions(
      partial,
      context
    );
    completions.push(...contextualSuggestions);

    // Sort by confidence and relevance
    return completions
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10); // Top 10 suggestions
  }

  private async generateContextualSuggestions(
    partial: string,
    context: CompletionContext
  ): Promise<Completion[]> {
    const suggestions: Completion[] = [];

    // If in git repository, suggest git-related commands
    if (context.isGitRepository) {
      if (partial.startsWith('git')) {
        suggestions.push({
          value: 'git commit',
          description: 'Create git commit with generated message',
          type: 'workflow',
          confidence: 0.8
        });
      }
    }

    // If package.json exists, suggest npm commands
    if (context.hasPackageJson) {
      if (partial.startsWith('npm') || partial.startsWith('swarm')) {
        suggestions.push({
          value: 'swarm init',
          description: 'Initialize swarm for this project',
          type: 'workflow',
          confidence: 0.9
        });
      }
    }

    return suggestions;
  }
}
```

## Success Metrics

### CLI Performance Targets
- [ ] **Command Response**: <200ms average command execution time
- [ ] **File Decomposition**: index.ts (108KB) → <10KB per command module
- [ ] **Interactive UX**: Smart prompts with context awareness
- [ ] **Hook Integration**: Deep lifecycle integration with learning
- [ ] **Workflow Automation**: Intelligent multi-step command orchestration
- [ ] **Auto-completion**: >90% accuracy for command suggestions

### User Experience Improvements
```typescript
const cliImprovements = {
  before: {
    commandResponse: '~500ms',
    interactivity: 'Basic command parsing',
    workflows: 'Manual command chaining',
    suggestions: 'Static help text'
  },

  after: {
    commandResponse: '<200ms with caching',
    interactivity: 'Smart context-aware prompts',
    workflows: 'Automated multi-step execution',
    suggestions: 'Learning-based intelligent completion'
  }
};
```

## Related V3 Skills

- `v3-core-implementation` - Core domain integration
- `v3-memory-unification` - Memory-backed command caching
- `v3-swarm-coordination` - CLI swarm management integration
- `v3-performance-optimization` - CLI performance monitoring

## Usage Examples

### Complete CLI Modernization
```bash
# Full CLI modernization implementation
Task("CLI modernization implementation",
     "Implement modular commands, interactive prompts, and intelligent workflows",
     "cli-hooks-developer")
```

### Interactive Command Enhancement
```bash
# Enhanced interactive commands
claude-flow swarm init --interactive
claude-flow learning start --guided
claude-flow workflow create --from-intent "setup new project"
```


## Sub-skill: v3-core-implementation

# V3 Core Implementation

## What This Skill Does

Implements the core TypeScript modules for claude-flow v3 following Domain-Driven Design principles, clean architecture patterns, and modern TypeScript best practices with comprehensive test coverage.

## Quick Start

```bash
# Initialize core implementation
Task("Core foundation", "Set up DDD domain structure and base classes", "core-implementer")

# Domain implementation (parallel)
Task("Task domain", "Implement task management domain with entities and services", "core-implementer")
Task("Session domain", "Implement session management domain", "core-implementer")
Task("Health domain", "Implement health monitoring domain", "core-implementer")
```

## Core Implementation Architecture

### Domain Structure
```
src/
├── core/
│   ├── kernel/                     # Microkernel pattern
│   │   ├── claude-flow-kernel.ts
│   │   ├── domain-registry.ts
│   │   └── plugin-loader.ts
│   │
│   ├── domains/                    # DDD Bounded Contexts
│   │   ├── task-management/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   └── events/
│   │   │
│   │   ├── session-management/
│   │   ├── health-monitoring/
│   │   ├── lifecycle-management/
│   │   └── event-coordination/
│   │
│   ├── shared/                     # Shared kernel
│   │   ├── domain/
│   │   │   ├── entity.ts
│   │   │   ├── value-object.ts
│   │   │   ├── domain-event.ts
│   │   │   └── aggregate-root.ts
│   │   │
│   │   ├── infrastructure/
│   │   │   ├── event-bus.ts
│   │   │   ├── dependency-container.ts
│   │   │   └── logger.ts
│   │   │
│   │   └── types/
│   │       ├── common.ts
│   │       ├── errors.ts
│   │       └── interfaces.ts
│   │
│   └── application/                # Application services
│       ├── use-cases/
│       ├── commands/
│       ├── queries/
│       └── handlers/
```

## Base Domain Classes

### Entity Base Class
```typescript
// src/core/shared/domain/entity.ts
export abstract class Entity<T> {
  protected readonly _id: T;
  private _domainEvents: DomainEvent[] = [];

  constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  public equals(object?: Entity<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    if (!(object instanceof Entity)) {
      return false;
    }

    return this._id === object._id;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }

  public getUncommittedEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  public markEventsAsCommitted(): void {
    this._domainEvents = [];
  }
}
```

### Value Object Base Class
```typescript
// src/core/shared/domain/value-object.ts
export abstract class ValueObject<T> {
  protected readonly props: T;

  constructor(props: T) {
    this.props = Object.freeze(props);
  }

  public equals(object?: ValueObject<T>): boolean {
    if (object == null || object == undefined) {
      return false;
    }

    if (this === object) {
      return true;
    }

    return JSON.stringify(this.props) === JSON.stringify(object.props);
  }

  get value(): T {
    return this.props;
  }
}
```

### Aggregate Root
```typescript
// src/core/shared/domain/aggregate-root.ts
export abstract class AggregateRoot<T> extends Entity<T> {
  private _version: number = 0;

  get version(): number {
    return this._version;
  }

  protected incrementVersion(): void {
    this._version++;
  }

  public applyEvent(event: DomainEvent): void {
    this.addDomainEvent(event);
    this.incrementVersion();
  }
}
```

## Task Management Domain Implementation

### Task Entity
```typescript
// src/core/domains/task-management/entities/task.entity.ts
import { AggregateRoot } from '../../../shared/domain/aggregate-root';
import { TaskId } from '../value-objects/task-id.vo';
import { TaskStatus } from '../value-objects/task-status.vo';
import { Priority } from '../value-objects/priority.vo';
import { TaskAssignedEvent } from '../events/task-assigned.event';

interface TaskProps {
  id: TaskId;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assignedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Task extends AggregateRoot<TaskId> {
  private props: TaskProps;

  private constructor(props: TaskProps) {
    super(props.id);
    this.props = props;
  }

  static create(description: string, priority: Priority): Task {
    const task = new Task({
      id: TaskId.create(),
      description,
      priority,
      status: TaskStatus.pending(),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return task;
  }

  static reconstitute(props: TaskProps): Task {
    return new Task(props);
  }

  public assignTo(agentId: string): void {
    if (this.props.status.equals(TaskStatus.completed())) {
      throw new Error('Cannot assign completed task');
    }

    this.props.assignedAgentId = agentId;
    this.props.status = TaskStatus.assigned();
    this.props.updatedAt = new Date();

    this.applyEvent(new TaskAssignedEvent(
      this.id.value,
      agentId,
      this.props.priority
    ));
  }

  public complete(result: TaskResult): void {
    if (!this.props.assignedAgentId) {
      throw new Error('Cannot complete unassigned task');
    }

    this.props.status = TaskStatus.completed();
    this.props.updatedAt = new Date();

    this.applyEvent(new TaskCompletedEvent(
      this.id.value,
      result,
      this.calculateDuration()
    ));
  }

  // Getters
  get description(): string { return this.props.description; }
  get priority(): Priority { return this.props.priority; }
  get status(): TaskStatus { return this.props.status; }
  get assignedAgentId(): string | undefined { return this.props.assignedAgentId; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  private calculateDuration(): number {
    return this.props.updatedAt.getTime() - this.props.createdAt.getTime();
  }
}
```

### Task Value Objects
```typescript
// src/core/domains/task-management/value-objects/task-id.vo.ts
export class TaskId extends ValueObject<string> {
  private constructor(value: string) {
    super({ value });
  }

  static create(): TaskId {
    return new TaskId(crypto.randomUUID());
  }

  static fromString(id: string): TaskId {
    if (!id || id.length === 0) {
      throw new Error('TaskId cannot be empty');
    }
    return new TaskId(id);
  }

  get value(): string {
    return this.props.value;
  }
}

// src/core/domains/task-management/value-objects/task-status.vo.ts
type TaskStatusType = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';

export class TaskStatus extends ValueObject<TaskStatusType> {
  private constructor(status: TaskStatusType) {
    super({ value: status });
  }

  static pending(): TaskStatus { return new TaskStatus('pending'); }
  static assigned(): TaskStatus { return new TaskStatus('assigned'); }
  static inProgress(): TaskStatus { return new TaskStatus('in_progress'); }
  static completed(): TaskStatus { return new TaskStatus('completed'); }
  static failed(): TaskStatus { return new TaskStatus('failed'); }

  get value(): TaskStatusType {
    return this.props.value;
  }

  public isPending(): boolean { return this.value === 'pending'; }
  public isAssigned(): boolean { return this.value === 'assigned'; }
  public isInProgress(): boolean { return this.value === 'in_progress'; }
  public isCompleted(): boolean { return this.value === 'completed'; }
  public isFailed(): boolean { return this.value === 'failed'; }
}

// src/core/domains/task-management/value-objects/priority.vo.ts
type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export class Priority extends ValueObject<PriorityLevel> {
  private constructor(level: PriorityLevel) {
    super({ value: level });
  }

  static low(): Priority { return new Priority('low'); }
  static medium(): Priority { return new Priority('medium'); }
  static high(): Priority { return new Priority('high'); }
  static critical(): Priority { return new Priority('critical'); }

  get value(): PriorityLevel {
    return this.props.value;
  }

  public getNumericValue(): number {
    const priorities = { low: 1, medium: 2, high: 3, critical: 4 };
    return priorities[this.value];
  }
}
```

## Domain Services

### Task Scheduling Service
```typescript
// src/core/domains/task-management/services/task-scheduling.service.ts
import { Injectable } from '../../../shared/infrastructure/dependency-container';
import { Task } from '../entities/task.entity';
import { Priority } from '../value-objects/priority.vo';

@Injectable()
export class TaskSchedulingService {
  public prioritizeTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) =>
      b.priority.getNumericValue() - a.priority.getNumericValue()
    );
  }

  public canSchedule(task: Task, agentCapacity: number): boolean {
    if (agentCapacity <= 0) return false;

    // Critical tasks always schedulable
    if (task.priority.equals(Priority.critical())) return true;

    // Other logic based on capacity
    return true;
  }

  public calculateEstimatedDuration(task: Task): number {
    // Simple heuristic - would use ML in real implementation
    const baseTime = 300000; // 5 minutes
    const priorityMultiplier = {
      low: 0.5,
      medium: 1.0,
      high: 1.5,
      critical: 2.0
    };

    return baseTime * priorityMultiplier[task.priority.value];
  }
}
```

## Repository Interfaces & Implementations

### Task Repository Interface
```typescript
// src/core/domains/task-management/repositories/task.repository.ts
export interface ITaskRepository {
  save(task: Task): Promise<void>;
  findById(id: TaskId): Promise<Task | null>;
  findByAgentId(agentId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findPendingTasks(): Promise<Task[]>;
  delete(id: TaskId): Promise<void>;
}
```

### SQLite Implementation
```typescript
// src/core/domains/task-management/repositories/sqlite-task.repository.ts
@Injectable()
export class SqliteTaskRepository implements ITaskRepository {
  constructor(
    @Inject('Database') private db: Database,
    @Inject('Logger') private logger: ILogger
  ) {}

  async save(task: Task): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO tasks (
        id, description, priority, status, assigned_agent_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      task.id.value,
      task.description,
      task.priority.value,
      task.status.value,
      task.assignedAgentId,
      task.createdAt.toISOString(),
      task.updatedAt.toISOString()
    ]);

    this.logger.debug(`Task saved: ${task.id.value}`);
  }

  async findById(id: TaskId): Promise<Task | null> {
    const sql = 'SELECT * FROM tasks WHERE id = ?';
    const row = await this.db.get(sql, [id.value]);

    return row ? this.mapRowToTask(row) : null;
  }

  async findPendingTasks(): Promise<Task[]> {
    const sql = 'SELECT * FROM tasks WHERE status = ? ORDER BY priority DESC, created_at ASC';
    const rows = await this.db.all(sql, ['pending']);

    return rows.map(row => this.mapRowToTask(row));
  }

  private mapRowToTask(row: any): Task {
    return Task.reconstitute({
      id: TaskId.fromString(row.id),
      description: row.description,
      priority: Priority.fromString(row.priority),
      status: TaskStatus.fromString(row.status),
      assignedAgentId: row.assigned_agent_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    });
  }
}
```

## Application Layer

### Use Case Implementation
```typescript
// src/core/application/use-cases/assign-task.use-case.ts
@Injectable()
export class AssignTaskUseCase {
  constructor(
    @Inject('TaskRepository') private taskRepository: ITaskRepository,
    @Inject('AgentRepository') private agentRepository: IAgentRepository,
    @Inject('DomainEventBus') private eventBus: DomainEventBus,
    @Inject('Logger') private logger: ILogger
  ) {}

  async execute(command: AssignTaskCommand): Promise<AssignTaskResult> {
    try {
      // 1. Validate command
      await this.validateCommand(command);

      // 2. Load aggregates
      const task = await this.taskRepository.findById(command.taskId);
      if (!task) {
        throw new TaskNotFoundError(command.taskId);
      }

      const agent = await this.agentRepository.findById(command.agentId);
      if (!agent) {
        throw new AgentNotFoundError(command.agentId);
      }

      // 3. Business logic
      if (!agent.canAcceptTask(task)) {
        throw new AgentCannotAcceptTaskError(command.agentId, command.taskId);
      }

      task.assignTo(command.agentId);
      agent.acceptTask(task.id);

      // 4. Persist changes
      await Promise.all([
        this.taskRepository.save(task),
        this.agentRepository.save(agent)
      ]);

      // 5. Publish domain events
      const events = [
        ...task.getUncommittedEvents(),
        ...agent.getUncommittedEvents()
      ];

      for (const event of events) {
        await this.eventBus.publish(event);
      }

      task.markEventsAsCommitted();
      agent.markEventsAsCommitted();

      // 6. Return result
      this.logger.info(`Task ${command.taskId.value} assigned to agent ${command.agentId}`);

      return AssignTaskResult.success({
        taskId: task.id,
        agentId: command.agentId,
        assignedAt: new Date()
      });

    } catch (error) {
      this.logger.error(`Failed to assign task ${command.taskId.value}:`, error);
      return AssignTaskResult.failure(error);
    }
  }

  private async validateCommand(command: AssignTaskCommand): Promise<void> {
    if (!command.taskId) {
      throw new ValidationError('Task ID is required');
    }
    if (!command.agentId) {
      throw new ValidationError('Agent ID is required');
    }
  }
}
```

## Dependency Injection Setup

### Container Configuration
```typescript
// src/core/shared/infrastructure/dependency-container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

export class DependencyContainer {
  private container: Container;

  constructor() {
    this.container = new Container();
    this.setupBindings();
  }

  private setupBindings(): void {
    // Repositories
    this.container.bind<ITaskRepository>(TYPES.TaskRepository)
      .to(SqliteTaskRepository)
      .inSingletonScope();

    this.container.bind<IAgentRepository>(TYPES.AgentRepository)
      .to(SqliteAgentRepository)
      .inSingletonScope();

    // Services
    this.container.bind<TaskSchedulingService>(TYPES.TaskSchedulingService)
      .to(TaskSchedulingService)
      .inSingletonScope();

    // Use Cases
    this.container.bind<AssignTaskUseCase>(TYPES.AssignTaskUseCase)
      .to(AssignTaskUseCase)
      .inSingletonScope();

    // Infrastructure
    this.container.bind<ILogger>(TYPES.Logger)
      .to(ConsoleLogger)
      .inSingletonScope();

    this.container.bind<DomainEventBus>(TYPES.DomainEventBus)
      .to(InMemoryDomainEventBus)
      .inSingletonScope();
  }

  get<T>(serviceIdentifier: symbol): T {
    return this.container.get<T>(serviceIdentifier);
  }

  bind<T>(serviceIdentifier: symbol): BindingToSyntax<T> {
    return this.container.bind<T>(serviceIdentifier);
  }
}
```

## Modern TypeScript Configuration

### Strict TypeScript Setup
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@shared/*": ["src/core/shared/*"],
      "@domains/*": ["src/core/domains/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
```

## Testing Implementation

### Domain Unit Tests
```typescript
// src/core/domains/task-management/__tests__/entities/task.entity.test.ts
describe('Task Entity', () => {
  let task: Task;

  beforeEach(() => {
    task = Task.create('Test task', Priority.medium());
  });

  describe('creation', () => {
    it('should create task with pending status', () => {
      expect(task.status.isPending()).toBe(true);
      expect(task.description).toBe('Test task');
      expect(task.priority.equals(Priority.medium())).toBe(true);
    });

    it('should generate unique ID', () => {
      const task1 = Task.create('Task 1', Priority.low());
      const task2 = Task.create('Task 2', Priority.low());

      expect(task1.id.equals(task2.id)).toBe(false);
    });
  });

  describe('assignment', () => {
    it('should assign to agent and change status', () => {
      const agentId = 'agent-123';

      task.assignTo(agentId);

      expect(task.assignedAgentId).toBe(agentId);
      expect(task.status.isAssigned()).toBe(true);
    });

    it('should emit TaskAssignedEvent when assigned', () => {
      const agentId = 'agent-123';

      task.assignTo(agentId);

      const events = task.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TaskAssignedEvent);
    });

    it('should not allow assignment of completed task', () => {
      task.assignTo('agent-123');
      task.complete(TaskResult.success('done'));

      expect(() => task.assignTo('agent-456'))
        .toThrow('Cannot assign completed task');
    });
  });
});
```

### Integration Tests
```typescript
// src/core/domains/task-management/__tests__/integration/task-repository.integration.test.ts
describe('TaskRepository Integration', () => {
  let repository: SqliteTaskRepository;
  let db: Database;

  beforeEach(async () => {
    db = new Database(':memory:');
    await setupTasksTable(db);
    repository = new SqliteTaskRepository(db, new ConsoleLogger());
  });

  afterEach(async () => {
    await db.close();
  });

  it('should save and retrieve task', async () => {
    const task = Task.create('Test task', Priority.high());

    await repository.save(task);
    const retrieved = await repository.findById(task.id);

    expect(retrieved).toBeDefined();
    expect(retrieved!.id.equals(task.id)).toBe(true);
    expect(retrieved!.description).toBe('Test task');
    expect(retrieved!.priority.equals(Priority.high())).toBe(true);
  });

  it('should find pending tasks ordered by priority', async () => {
    const lowTask = Task.create('Low priority', Priority.low());
    const highTask = Task.create('High priority', Priority.high());

    await repository.save(lowTask);
    await repository.save(highTask);

    const pending = await repository.findPendingTasks();

    expect(pending).toHaveLength(2);
    expect(pending[0].id.equals(highTask.id)).toBe(true); // High priority first
    expect(pending[1].id.equals(lowTask.id)).toBe(true);
  });
});
```

## Performance Optimizations

### Entity Caching
```typescript
// src/core/shared/infrastructure/entity-cache.ts
@Injectable()
export class EntityCache<T extends Entity<any>> {
  private cache = new Map<string, { entity: T; timestamp: number }>();
  private readonly ttl: number = 300000; // 5 minutes

  set(id: string, entity: T): void {
    this.cache.set(id, { entity, timestamp: Date.now() });
  }

  get(id: string): T | null {
    const cached = this.cache.get(id);
    if (!cached) return null;

    // Check TTL
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(id);
      return null;
    }

    return cached.entity;
  }

  invalidate(id: string): void {
    this.cache.delete(id);
  }

  clear(): void {
    this.cache.clear();
  }
}
```

## Success Metrics

- [ ] **Domain Isolation**: 100% clean dependency boundaries
- [ ] **Test Coverage**: >90% unit test coverage for domain logic
- [ ] **Type Safety**: Strict TypeScript compilation with zero any types
- [ ] **Performance**: <50ms average use case execution time
- [ ] **Memory Efficiency**: <100MB heap usage for core domains
- [ ] **Plugin Architecture**: Modular domain loading capability

## Related V3 Skills

- `v3-ddd-architecture` - DDD architectural design
- `v3-mcp-optimization` - MCP server integration
- `v3-memory-unification` - AgentDB repository integration
- `v3-swarm-coordination` - Swarm domain implementation

## Usage Examples

### Complete Core Implementation
```bash
# Full core module implementation
Task("Core implementation",
     "Implement all core domains with DDD patterns and comprehensive testing",
     "core-implementer")
```

### Domain-Specific Implementation
```bash
# Single domain implementation
Task("Task domain implementation",
     "Implement task management domain with entities, services, and repositories",
     "core-implementer")
```


## Sub-skill: v3-ddd-architecture

# V3 DDD Architecture

## What This Skill Does

Designs and implements Domain-Driven Design (DDD) architecture for claude-flow v3, decomposing god objects into bounded contexts, implementing clean architecture patterns, and enabling modular, testable code structure.

## Quick Start

```bash
# Initialize DDD architecture analysis
Task("Architecture analysis", "Analyze current architecture and design DDD boundaries", "core-architect")

# Domain modeling (parallel)
Task("Domain decomposition", "Break down orchestrator god object into domains", "core-architect")
Task("Context mapping", "Map bounded contexts and relationships", "core-architect")
Task("Interface design", "Design clean domain interfaces", "core-architect")
```

## DDD Implementation Strategy

### Current Architecture Analysis
```
├── PROBLEMATIC: core/orchestrator.ts (1,440 lines - GOD OBJECT)
│   ├── Task management responsibilities
│   ├── Session management responsibilities
│   ├── Health monitoring responsibilities
│   ├── Lifecycle management responsibilities
│   └── Event coordination responsibilities
│
└── TARGET: Modular DDD Architecture
    ├── core/domains/
    │   ├── task-management/
    │   ├── session-management/
    │   ├── health-monitoring/
    │   ├── lifecycle-management/
    │   └── event-coordination/
    └── core/shared/
        ├── interfaces/
        ├── value-objects/
        └── domain-events/
```

### Domain Boundaries

#### 1. Task Management Domain
```typescript
// core/domains/task-management/
interface TaskManagementDomain {
  // Entities
  Task: TaskEntity;
  TaskQueue: TaskQueueEntity;

  // Value Objects
  TaskId: TaskIdVO;
  TaskStatus: TaskStatusVO;
  Priority: PriorityVO;

  // Services
  TaskScheduler: TaskSchedulingService;
  TaskValidator: TaskValidationService;

  // Repository
  TaskRepository: ITaskRepository;
}
```

#### 2. Session Management Domain
```typescript
// core/domains/session-management/
interface SessionManagementDomain {
  // Entities
  Session: SessionEntity;
  SessionState: SessionStateEntity;

  // Value Objects
  SessionId: SessionIdVO;
  SessionStatus: SessionStatusVO;

  // Services
  SessionLifecycle: SessionLifecycleService;
  SessionPersistence: SessionPersistenceService;

  // Repository
  SessionRepository: ISessionRepository;
}
```

#### 3. Health Monitoring Domain
```typescript
// core/domains/health-monitoring/
interface HealthMonitoringDomain {
  // Entities
  HealthCheck: HealthCheckEntity;
  Metric: MetricEntity;

  // Value Objects
  HealthStatus: HealthStatusVO;
  Threshold: ThresholdVO;

  // Services
  HealthCollector: HealthCollectionService;
  AlertManager: AlertManagementService;

  // Repository
  MetricsRepository: IMetricsRepository;
}
```

## Microkernel Architecture Pattern

### Core Kernel
```typescript
// core/kernel/claude-flow-kernel.ts
export class ClaudeFlowKernel {
  private domains: Map<string, Domain> = new Map();
  private eventBus: DomainEventBus;
  private dependencyContainer: Container;

  async initialize(): Promise<void> {
    // Load core domains
    await this.loadDomain('task-management', new TaskManagementDomain());
    await this.loadDomain('session-management', new SessionManagementDomain());
    await this.loadDomain('health-monitoring', new HealthMonitoringDomain());

    // Wire up domain events
    this.setupDomainEventHandlers();
  }

  async loadDomain(name: string, domain: Domain): Promise<void> {
    await domain.initialize(this.dependencyContainer);
    this.domains.set(name, domain);
  }

  getDomain<T extends Domain>(name: string): T {
    const domain = this.domains.get(name);
    if (!domain) {
      throw new DomainNotLoadedError(name);
    }
    return domain as T;
  }
}
```

### Plugin Architecture
```typescript
// core/plugins/
interface DomainPlugin {
  name: string;
  version: string;
  dependencies: string[];

  initialize(kernel: ClaudeFlowKernel): Promise<void>;
  shutdown(): Promise<void>;
}

// Example: Swarm Coordination Plugin
export class SwarmCoordinationPlugin implements DomainPlugin {
  name = 'swarm-coordination';
  version = '3.0.0';
  dependencies = ['task-management', 'session-management'];

  async initialize(kernel: ClaudeFlowKernel): Promise<void> {
    const taskDomain = kernel.getDomain<TaskManagementDomain>('task-management');
    const sessionDomain = kernel.getDomain<SessionManagementDomain>('session-management');

    // Register swarm coordination services
    this.swarmCoordinator = new UnifiedSwarmCoordinator(taskDomain, sessionDomain);
    kernel.registerService('swarm-coordinator', this.swarmCoordinator);
  }
}
```

## Domain Events & Integration

### Event-Driven Communication
```typescript
// core/shared/domain-events/
abstract class DomainEvent {
  public readonly eventId: string;
  public readonly aggregateId: string;
  public readonly occurredOn: Date;
  public readonly eventVersion: number;

  constructor(aggregateId: string) {
    this.eventId = crypto.randomUUID();
    this.aggregateId = aggregateId;
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }
}

// Task domain events
export class TaskAssignedEvent extends DomainEvent {
  constructor(
    taskId: string,
    public readonly agentId: string,
    public readonly priority: Priority
  ) {
    super(taskId);
  }
}

export class TaskCompletedEvent extends DomainEvent {
  constructor(
    taskId: string,
    public readonly result: TaskResult,
    public readonly duration: number
  ) {
    super(taskId);
  }
}

// Event handlers
@EventHandler(TaskCompletedEvent)
export class TaskCompletedHandler {
  constructor(
    private metricsRepository: IMetricsRepository,
    private sessionService: SessionLifecycleService
  ) {}

  async handle(event: TaskCompletedEvent): Promise<void> {
    // Update metrics
    await this.metricsRepository.recordTaskCompletion(
      event.aggregateId,
      event.duration
    );

    // Update session state
    await this.sessionService.markTaskCompleted(
      event.aggregateId,
      event.result
    );
  }
}
```

## Clean Architecture Layers

```typescript
// Architecture layers
┌─────────────────────────────────────────┐
│              Presentation               │  ← CLI, API, UI
├─────────────────────────────────────────┤
│              Application                │  ← Use Cases, Commands
├─────────────────────────────────────────┤
│               Domain                    │  ← Entities, Services, Events
├─────────────────────────────────────────┤
│            Infrastructure               │  ← DB, MCP, External APIs
└─────────────────────────────────────────┘

// Dependency direction: Outside → Inside
// Domain layer has NO external dependencies
```

### Application Layer (Use Cases)
```typescript
// core/application/use-cases/
export class AssignTaskUseCase {
  constructor(
    private taskRepository: ITaskRepository,
    private agentRepository: IAgentRepository,
    private eventBus: DomainEventBus
  ) {}

  async execute(command: AssignTaskCommand): Promise<TaskResult> {
    // 1. Validate command
    await this.validateCommand(command);

    // 2. Load aggregates
    const task = await this.taskRepository.findById(command.taskId);
    const agent = await this.agentRepository.findById(command.agentId);

    // 3. Business logic (in domain)
    task.assignTo(agent);

    // 4. Persist changes
    await this.taskRepository.save(task);

    // 5. Publish domain events
    task.getUncommittedEvents().forEach(event =>
      this.eventBus.publish(event)
    );

    // 6. Return result
    return TaskResult.success(task);
  }
}
```

## Module Configuration

### Bounded Context Modules
```typescript
// core/domains/task-management/module.ts
export const taskManagementModule = {
  name: 'task-management',

  entities: [
    TaskEntity,
    TaskQueueEntity
  ],

  valueObjects: [
    TaskIdVO,
    TaskStatusVO,
    PriorityVO
  ],

  services: [
    TaskSchedulingService,
    TaskValidationService
  ],

  repositories: [
    { provide: ITaskRepository, useClass: SqliteTaskRepository }
  ],

  eventHandlers: [
    TaskAssignedHandler,
    TaskCompletedHandler
  ]
};
```

## Migration Strategy

### Phase 1: Extract Domain Services
```typescript
// Extract services from orchestrator.ts
const extractionPlan = {
  week1: [
    'TaskManager → task-management domain',
    'SessionManager → session-management domain'
  ],
  week2: [
    'HealthMonitor → health-monitoring domain',
    'LifecycleManager → lifecycle-management domain'
  ],
  week3: [
    'EventCoordinator → event-coordination domain',
    'Wire up domain events'
  ]
};
```

### Phase 2: Implement Clean Interfaces
```typescript
// Clean separation with dependency injection
export class TaskController {
  constructor(
    @Inject('AssignTaskUseCase') private assignTask: AssignTaskUseCase,
    @Inject('CompleteTaskUseCase') private completeTask: CompleteTaskUseCase
  ) {}

  async assign(request: AssignTaskRequest): Promise<TaskResponse> {
    const command = AssignTaskCommand.fromRequest(request);
    const result = await this.assignTask.execute(command);
    return TaskResponse.fromResult(result);
  }
}
```

### Phase 3: Plugin System
```typescript
// Enable plugin-based extensions
const pluginSystem = {
  core: ['task-management', 'session-management', 'health-monitoring'],
  optional: ['swarm-coordination', 'learning-integration', 'performance-monitoring']
};
```

## Testing Strategy

### Domain Testing (London School TDD)
```typescript
// Pure domain logic testing
describe('Task Entity', () => {
  let task: TaskEntity;
  let mockAgent: jest.Mocked<AgentEntity>;

  beforeEach(() => {
    task = new TaskEntity(TaskId.create(), 'Test task');
    mockAgent = createMock<AgentEntity>();
  });

  it('should assign to agent when valid', () => {
    mockAgent.canAcceptTask.mockReturnValue(true);

    task.assignTo(mockAgent);

    expect(task.assignedAgent).toBe(mockAgent);
    expect(task.status.value).toBe('assigned');
  });

  it('should emit TaskAssignedEvent when assigned', () => {
    mockAgent.canAcceptTask.mockReturnValue(true);

    task.assignTo(mockAgent);

    const events = task.getUncommittedEvents();
    expect(events).toHaveLength(1);
    expect(events[0]).toBeInstanceOf(TaskAssignedEvent);
  });
});
```

## Success Metrics

- [ ] **God Object Elimination**: orchestrator.ts (1,440 lines) → 5 focused domains (<300 lines each)
- [ ] **Bounded Context Isolation**: 100% domain independence
- [ ] **Plugin Architecture**: Core + optional modules loading
- [ ] **Clean Architecture**: Dependency inversion maintained
- [ ] **Event-Driven Communication**: Loose coupling between domains
- [ ] **Test Coverage**: >90% domain logic coverage

## Related V3 Skills

- `v3-core-implementation` - Implementation of DDD domains
- `v3-memory-unification` - AgentDB integration within bounded contexts
- `v3-swarm-coordination` - Swarm coordination as domain plugin
- `v3-performance-optimization` - Performance optimization across domains

## Usage Examples

### Complete Domain Extraction
```bash
# Full DDD architecture implementation
Task("DDD architecture implementation",
     "Extract orchestrator into DDD domains with clean architecture",
     "core-architect")
```

### Plugin Development
```bash
# Create domain plugin
npm run create:plugin -- --name swarm-coordination --template domain
```


## Sub-skill: v3-integration-deep

# V3 Deep Integration

## What This Skill Does

Transforms claude-flow from parallel implementation to specialized extension of agentic-flow@alpha, eliminating massive code duplication while achieving performance improvements and feature parity.

## Quick Start

```bash
# Initialize deep integration
Task("Integration architecture", "Design agentic-flow@alpha adapter layer", "v3-integration-architect")

# Feature integration (parallel)
Task("SONA integration", "Integrate 5 SONA learning modes", "v3-integration-architect")
Task("Flash Attention", "Implement 2.49x-7.47x speedup", "v3-integration-architect")
Task("AgentDB coordination", "Setup 150x-12,500x search", "v3-integration-architect")
```

## Code Deduplication Strategy

### Current Overlap → Integration
```
┌─────────────────────────────────────────┐
│  claude-flow          agentic-flow      │
├─────────────────────────────────────────┤
│ SwarmCoordinator  →   Swarm System      │ 80% overlap (eliminate)
│ AgentManager      →   Agent Lifecycle   │ 70% overlap (eliminate)
│ TaskScheduler     →   Task Execution    │ 60% overlap (eliminate)
│ SessionManager    →   Session Mgmt      │ 50% overlap (eliminate)
└─────────────────────────────────────────┘

TARGET: <5,000 lines (vs 15,000+ currently)
```

## agentic-flow@alpha Feature Integration

### SONA Learning Modes
```typescript
class SONAIntegration {
  async initializeMode(mode: SONAMode): Promise<void> {
    switch(mode) {
      case 'real-time':   // ~0.05ms adaptation
      case 'balanced':    // general purpose
      case 'research':    // deep exploration
      case 'edge':        // resource-constrained
      case 'batch':       // high-throughput
    }
    await this.agenticFlow.sona.setMode(mode);
  }
}
```

### Flash Attention Integration
```typescript
class FlashAttentionIntegration {
  async optimizeAttention(): Promise<AttentionResult> {
    return this.agenticFlow.attention.flashAttention({
      speedupTarget: '2.49x-7.47x',
      memoryReduction: '50-75%',
      mechanisms: ['multi-head', 'linear', 'local', 'global']
    });
  }
}
```

### AgentDB Coordination
```typescript
class AgentDBIntegration {
  async setupCrossAgentMemory(): Promise<void> {
    await this.agentdb.enableCrossAgentSharing({
      indexType: 'HNSW',
      speedupTarget: '150x-12500x',
      dimensions: 1536
    });
  }
}
```

### MCP Tools Integration
```typescript
class MCPToolsIntegration {
  async integrateBuiltinTools(): Promise<void> {
    // Leverage 213 pre-built tools
    const tools = await this.agenticFlow.mcp.getAvailableTools();
    await this.registerClaudeFlowSpecificTools(tools);

    // Use 19 hook types
    const hookTypes = await this.agenticFlow.hooks.getTypes();
    await this.configureClaudeFlowHooks(hookTypes);
  }
}
```

## Migration Implementation

### Phase 1: Adapter Layer
```typescript
import { Agent as AgenticFlowAgent } from 'agentic-flow@alpha';

export class ClaudeFlowAgent extends AgenticFlowAgent {
  async handleClaudeFlowTask(task: ClaudeTask): Promise<TaskResult> {
    return this.executeWithSONA(task);
  }

  // Backward compatibility
  async legacyCompatibilityLayer(oldAPI: any): Promise<any> {
    return this.adaptToNewAPI(oldAPI);
  }
}
```

### Phase 2: System Migration
```typescript
class SystemMigration {
  async migrateSwarmCoordination(): Promise<void> {
    // Replace SwarmCoordinator (800+ lines) with agentic-flow Swarm
    const swarmConfig = await this.extractSwarmConfig();
    await this.agenticFlow.swarm.initialize(swarmConfig);
  }

  async migrateAgentManagement(): Promise<void> {
    // Replace AgentManager (1,736+ lines) with agentic-flow lifecycle
    const agents = await this.extractActiveAgents();
    for (const agent of agents) {
      await this.agenticFlow.agent.create(agent);
    }
  }

  async migrateTaskExecution(): Promise<void> {
    // Replace TaskScheduler with agentic-flow task graph
    const tasks = await this.extractTasks();
    await this.agenticFlow.task.executeGraph(this.buildTaskGraph(tasks));
  }
}
```

### Phase 3: Cleanup
```typescript
class CodeCleanup {
  async removeDeprecatedCode(): Promise<void> {
    // Remove massive duplicate implementations
    await this.removeFile('src/core/SwarmCoordinator.ts');    // 800+ lines
    await this.removeFile('src/agents/AgentManager.ts');      // 1,736+ lines
    await this.removeFile('src/task/TaskScheduler.ts');       // 500+ lines

    // Total reduction: 10,000+ → <5,000 lines
  }
}
```

## RL Algorithm Integration

```typescript
class RLIntegration {
  algorithms = [
    'PPO', 'DQN', 'A2C', 'MCTS', 'Q-Learning',
    'SARSA', 'Actor-Critic', 'Decision-Transformer'
  ];

  async optimizeAgentBehavior(): Promise<void> {
    for (const algorithm of this.algorithms) {
      await this.agenticFlow.rl.train(algorithm, {
        episodes: 1000,
        rewardFunction: this.claudeFlowRewardFunction
      });
    }
  }
}
```

## Performance Integration

### Flash Attention Targets
```typescript
const attentionBenchmark = {
  baseline: 'current attention mechanism',
  target: '2.49x-7.47x improvement',
  memoryReduction: '50-75%',
  implementation: 'agentic-flow@alpha Flash Attention'
};
```

### AgentDB Search Performance
```typescript
const searchBenchmark = {
  baseline: 'linear search in current systems',
  target: '150x-12,500x via HNSW indexing',
  implementation: 'agentic-flow@alpha AgentDB'
};
```

## Backward Compatibility

### Gradual Migration
```typescript
class BackwardCompatibility {
  // Phase 1: Dual operation
  async enableDualOperation(): Promise<void> {
    this.oldSystem.continue();
    this.newSystem.initialize();
    this.syncState(this.oldSystem, this.newSystem);
  }

  // Phase 2: Feature-by-feature migration
  async migrateGradually(): Promise<void> {
    const features = this.getAllFeatures();
    for (const feature of features) {
      await this.migrateFeature(feature);
      await this.validateFeatureParity(feature);
    }
  }

  // Phase 3: Complete transition
  async completeTransition(): Promise<void> {
    await this.validateFullParity();
    await this.deprecateOldSystem();
  }
}
```

## Success Metrics

- **Code Reduction**: <5,000 lines orchestration (vs 15,000+)
- **Performance**: 2.49x-7.47x Flash Attention speedup
- **Search**: 150x-12,500x AgentDB improvement
- **Memory**: 50-75% usage reduction
- **Feature Parity**: 100% v2 functionality maintained
- **SONA**: <0.05ms adaptation time
- **Integration**: All 213 MCP tools + 19 hook types available

## Related V3 Skills

- `v3-memory-unification` - Memory system integration
- `v3-performance-optimization` - Performance target validation
- `v3-swarm-coordination` - Swarm system migration
- `v3-security-overhaul` - Secure integration patterns


## Sub-skill: v3-mcp-optimization

# V3 MCP Optimization

## What This Skill Does

Optimizes claude-flow v3 MCP (Model Context Protocol) server implementation with advanced transport layer optimizations, connection pooling, load balancing, and comprehensive performance monitoring to achieve sub-100ms response times.

## Quick Start

```bash
# Initialize MCP optimization analysis
Task("MCP architecture", "Analyze current MCP server performance and bottlenecks", "mcp-specialist")

# Optimization implementation (parallel)
Task("Connection pooling", "Implement MCP connection pooling and reuse", "mcp-specialist")
Task("Load balancing", "Add dynamic load balancing for MCP tools", "mcp-specialist")
Task("Transport optimization", "Optimize transport layer performance", "mcp-specialist")
```

## MCP Performance Architecture

### Current State Analysis
```
Current MCP Issues:
├── Cold Start Latency: ~1.8s MCP server init
├── Connection Overhead: New connection per request
├── Tool Registry: Linear search O(n) for 213+ tools
├── Transport Layer: No connection reuse
└── Memory Usage: No cleanup of idle connections

Target Performance:
├── Startup Time: <400ms (4.5x improvement)
├── Tool Lookup: <5ms (O(1) hash table)
├── Connection Reuse: 90%+ connection pool hits
├── Response Time: <100ms p95
└── Memory Efficiency: 50% reduction
```

### MCP Server Architecture
```typescript
// src/core/mcp/mcp-server.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

interface OptimizedMCPConfig {
  // Connection pooling
  maxConnections: number;
  idleTimeoutMs: number;
  connectionReuseEnabled: boolean;

  // Tool registry
  toolCacheEnabled: boolean;
  toolIndexType: 'hash' | 'trie';

  // Performance
  requestTimeoutMs: number;
  batchingEnabled: boolean;
  compressionEnabled: boolean;

  // Monitoring
  metricsEnabled: boolean;
  healthCheckIntervalMs: number;
}

export class OptimizedMCPServer {
  private server: Server;
  private connectionPool: ConnectionPool;
  private toolRegistry: FastToolRegistry;
  private loadBalancer: MCPLoadBalancer;
  private metrics: MCPMetrics;

  constructor(config: OptimizedMCPConfig) {
    this.server = new Server({
      name: 'claude-flow-v3',
      version: '3.0.0'
    }, {
      capabilities: {
        tools: { listChanged: true },
        resources: { subscribe: true, listChanged: true },
        prompts: { listChanged: true }
      }
    });

    this.connectionPool = new ConnectionPool(config);
    this.toolRegistry = new FastToolRegistry(config.toolIndexType);
    this.loadBalancer = new MCPLoadBalancer();
    this.metrics = new MCPMetrics(config.metricsEnabled);
  }

  async start(): Promise<void> {
    // Pre-warm connection pool
    await this.connectionPool.preWarm();

    // Pre-build tool index
    await this.toolRegistry.buildIndex();

    // Setup request handlers with optimizations
    this.setupOptimizedHandlers();

    // Start health monitoring
    this.startHealthMonitoring();

    // Start server
    const transport = new StdioServerTransport();
    await this.server.connect(transport);

    this.metrics.recordStartup();
  }
}
```

## Connection Pool Implementation

### Advanced Connection Pooling
```typescript
// src/core/mcp/connection-pool.ts
interface PooledConnection {
  id: string;
  connection: MCPConnection;
  lastUsed: number;
  usageCount: number;
  isHealthy: boolean;
}

export class ConnectionPool {
  private pool: Map<string, PooledConnection> = new Map();
  private readonly config: ConnectionPoolConfig;
  private healthChecker: HealthChecker;

  constructor(config: ConnectionPoolConfig) {
    this.config = {
      maxConnections: 50,
      minConnections: 5,
      idleTimeoutMs: 300000, // 5 minutes
      maxUsageCount: 1000,
      healthCheckIntervalMs: 30000,
      ...config
    };

    this.healthChecker = new HealthChecker(this.config.healthCheckIntervalMs);
  }

  async getConnection(endpoint: string): Promise<MCPConnection> {
    const start = performance.now();

    // Try to get from pool first
    const pooled = this.findAvailableConnection(endpoint);
    if (pooled) {
      pooled.lastUsed = Date.now();
      pooled.usageCount++;

      this.recordMetric('pool_hit', performance.now() - start);
      return pooled.connection;
    }

    // Check pool capacity
    if (this.pool.size >= this.config.maxConnections) {
      await this.evictLeastUsedConnection();
    }

    // Create new connection
    const connection = await this.createConnection(endpoint);
    const pooledConn: PooledConnection = {
      id: this.generateConnectionId(),
      connection,
      lastUsed: Date.now(),
      usageCount: 1,
      isHealthy: true
    };

    this.pool.set(pooledConn.id, pooledConn);
    this.recordMetric('pool_miss', performance.now() - start);

    return connection;
  }

  async releaseConnection(connection: MCPConnection): Promise<void> {
    // Mark connection as available for reuse
    const pooled = this.findConnectionById(connection.id);
    if (pooled) {
      // Check if connection should be retired
      if (pooled.usageCount >= this.config.maxUsageCount) {
        await this.removeConnection(pooled.id);
      }
    }
  }

  async preWarm(): Promise<void> {
    const connections: Promise<MCPConnection>[] = [];

    for (let i = 0; i < this.config.minConnections; i++) {
      connections.push(this.createConnection('default'));
    }

    await Promise.all(connections);
  }

  private async evictLeastUsedConnection(): Promise<void> {
    let oldestConn: PooledConnection | null = null;
    let oldestTime = Date.now();

    for (const conn of this.pool.values()) {
      if (conn.lastUsed < oldestTime) {
        oldestTime = conn.lastUsed;
        oldestConn = conn;
      }
    }

    if (oldestConn) {
      await this.removeConnection(oldestConn.id);
    }
  }

  private findAvailableConnection(endpoint: string): PooledConnection | null {
    for (const conn of this.pool.values()) {
      if (conn.isHealthy &&
          conn.connection.endpoint === endpoint &&
          Date.now() - conn.lastUsed < this.config.idleTimeoutMs) {
        return conn;
      }
    }
    return null;
  }
}
```

## Fast Tool Registry

### O(1) Tool Lookup Implementation
```typescript
// src/core/mcp/fast-tool-registry.ts
interface ToolIndexEntry {
  name: string;
  handler: ToolHandler;
  metadata: ToolMetadata;
  usageCount: number;
  avgLatencyMs: number;
}

export class FastToolRegistry {
  private toolIndex: Map<string, ToolIndexEntry> = new Map();
  private categoryIndex: Map<string, string[]> = new Map();
  private fuzzyMatcher: FuzzyMatcher;
  private cache: LRUCache<string, ToolIndexEntry>;

  constructor(indexType: 'hash' | 'trie' = 'hash') {
    this.fuzzyMatcher = new FuzzyMatcher();
    this.cache = new LRUCache<string, ToolIndexEntry>(1000); // Cache 1000 most used tools
  }

  async buildIndex(): Promise<void> {
    const start = performance.now();

    // Load all available tools
    const tools = await this.loadAllTools();

    // Build hash index for O(1) lookup
    for (const tool of tools) {
      const entry: ToolIndexEntry = {
        name: tool.name,
        handler: tool.handler,
        metadata: tool.metadata,
        usageCount: 0,
        avgLatencyMs: 0
      };

      this.toolIndex.set(tool.name, entry);

      // Build category index
      const category = tool.metadata.category || 'general';
      if (!this.categoryIndex.has(category)) {
        this.categoryIndex.set(category, []);
      }
      this.categoryIndex.get(category)!.push(tool.name);
    }

    // Build fuzzy search index
    await this.fuzzyMatcher.buildIndex(tools.map(t => t.name));

    console.log(`Tool index built in ${(performance.now() - start).toFixed(2)}ms for ${tools.length} tools`);
  }

  findTool(name: string): ToolIndexEntry | null {
    // Try cache first
    const cached = this.cache.get(name);
    if (cached) return cached;

    // Try exact match
    const exact = this.toolIndex.get(name);
    if (exact) {
      this.cache.set(name, exact);
      return exact;
    }

    // Try fuzzy match
    const fuzzyMatches = this.fuzzyMatcher.search(name, 1);
    if (fuzzyMatches.length > 0) {
      const match = this.toolIndex.get(fuzzyMatches[0]);
      if (match) {
        this.cache.set(name, match);
        return match;
      }
    }

    return null;
  }

  findToolsByCategory(category: string): ToolIndexEntry[] {
    const toolNames = this.categoryIndex.get(category) || [];
    return toolNames
      .map(name => this.toolIndex.get(name))
      .filter(entry => entry !== undefined) as ToolIndexEntry[];
  }

  getMostUsedTools(limit: number = 10): ToolIndexEntry[] {
    return Array.from(this.toolIndex.values())
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  recordToolUsage(toolName: string, latencyMs: number): void {
    const entry = this.toolIndex.get(toolName);
    if (entry) {
      entry.usageCount++;
      // Moving average for latency
      entry.avgLatencyMs = (entry.avgLatencyMs + latencyMs) / 2;
    }
  }
}
```

## Load Balancing & Request Distribution

### Intelligent Load Balancer
```typescript
// src/core/mcp/load-balancer.ts
interface ServerInstance {
  id: string;
  endpoint: string;
  load: number;
  responseTime: number;
  isHealthy: boolean;
  maxConnections: number;
  currentConnections: number;
}

export class MCPLoadBalancer {
  private servers: Map<string, ServerInstance> = new Map();
  private routingStrategy: RoutingStrategy = 'least-connections';

  addServer(server: ServerInstance): void {
    this.servers.set(server.id, server);
  }

  selectServer(toolCategory?: string): ServerInstance | null {
    const healthyServers = Array.from(this.servers.values())
      .filter(server => server.isHealthy);

    if (healthyServers.length === 0) return null;

    switch (this.routingStrategy) {
      case 'round-robin':
        return this.roundRobinSelection(healthyServers);

      case 'least-connections':
        return this.leastConnectionsSelection(healthyServers);

      case 'response-time':
        return this.responseTimeSelection(healthyServers);

      case 'weighted':
        return this.weightedSelection(healthyServers, toolCategory);

      default:
        return healthyServers[0];
    }
  }

  private leastConnectionsSelection(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((least, current) =>
      current.currentConnections < least.currentConnections ? current : least
    );
  }

  private responseTimeSelection(servers: ServerInstance[]): ServerInstance {
    return servers.reduce((fastest, current) =>
      current.responseTime < fastest.responseTime ? current : fastest
    );
  }

  private weightedSelection(servers: ServerInstance[], category?: string): ServerInstance {
    // Prefer servers with lower load and better response time
    const scored = servers.map(server => ({
      server,
      score: this.calculateServerScore(server, category)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored[0].server;
  }

  private calculateServerScore(server: ServerInstance, category?: string): number {
    const loadFactor = 1 - (server.currentConnections / server.maxConnections);
    const responseFactor = 1 / (server.responseTime + 1);
    const categoryBonus = this.getCategoryBonus(server, category);

    return loadFactor * 0.4 + responseFactor * 0.4 + categoryBonus * 0.2;
  }

  updateServerMetrics(serverId: string, metrics: Partial<ServerInstance>): void {
    const server = this.servers.get(serverId);
    if (server) {
      Object.assign(server, metrics);
    }
  }
}
```

## Transport Layer Optimization

### High-Performance Transport
```typescript
// src/core/mcp/optimized-transport.ts
export class OptimizedTransport {
  private compression: boolean = true;
  private batching: boolean = true;
  private batchBuffer: MCPMessage[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  constructor(private config: TransportConfig) {}

  async send(message: MCPMessage): Promise<void> {
    if (this.batching && this.canBatch(message)) {
      this.addToBatch(message);
      return;
    }

    await this.sendImmediate(message);
  }

  private async sendImmediate(message: MCPMessage): Promise<void> {
    const start = performance.now();

    // Compress if enabled
    const payload = this.compression
      ? await this.compress(message)
      : message;

    // Send through transport
    await this.transport.send(payload);

    // Record metrics
    this.recordLatency(performance.now() - start);
  }

  private addToBatch(message: MCPMessage): void {
    this.batchBuffer.push(message);

    // Start batch timeout if not already running
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(
        () => this.flushBatch(),
        this.config.batchTimeoutMs || 10
      );
    }

    // Flush if batch is full
    if (this.batchBuffer.length >= this.config.maxBatchSize) {
      this.flushBatch();
    }
  }

  private async flushBatch(): Promise<void> {
    if (this.batchBuffer.length === 0) return;

    const batch = this.batchBuffer.splice(0);
    this.batchTimeout = null;

    // Send as single batched message
    await this.sendImmediate({
      type: 'batch',
      messages: batch
    });
  }

  private canBatch(message: MCPMessage): boolean {
    // Don't batch urgent messages or responses
    return message.type !== 'response' &&
           message.priority !== 'high' &&
           message.type !== 'error';
  }

  private async compress(data: any): Promise<Buffer> {
    // Use fast compression for smaller messages
    return gzipSync(JSON.stringify(data));
  }
}
```

## Performance Monitoring

### Real-time MCP Metrics
```typescript
// src/core/mcp/metrics.ts
interface MCPMetrics {
  requestCount: number;
  errorCount: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  connectionPoolHits: number;
  connectionPoolMisses: number;
  toolLookupTime: number;
  startupTime: number;
}

export class MCPMetricsCollector {
  private metrics: MCPMetrics;
  private responseTimeBuffer: number[] = [];
  private readonly bufferSize = 1000;

  constructor() {
    this.metrics = this.createInitialMetrics();
  }

  recordRequest(latencyMs: number): void {
    this.metrics.requestCount++;
    this.updateResponseTimes(latencyMs);
  }

  recordError(): void {
    this.metrics.errorCount++;
  }

  recordConnectionPoolHit(): void {
    this.metrics.connectionPoolHits++;
  }

  recordConnectionPoolMiss(): void {
    this.metrics.connectionPoolMisses++;
  }

  recordToolLookup(latencyMs: number): void {
    this.metrics.toolLookupTime = this.updateMovingAverage(
      this.metrics.toolLookupTime,
      latencyMs
    );
  }

  recordStartup(latencyMs: number): void {
    this.metrics.startupTime = latencyMs;
  }

  getMetrics(): MCPMetrics {
    return { ...this.metrics };
  }

  getHealthStatus(): HealthStatus {
    const errorRate = this.metrics.errorCount / this.metrics.requestCount;
    const poolHitRate = this.metrics.connectionPoolHits /
      (this.metrics.connectionPoolHits + this.metrics.connectionPoolMisses);

    return {
      status: this.determineHealthStatus(errorRate, poolHitRate),
      errorRate,
      poolHitRate,
      avgResponseTime: this.metrics.avgResponseTime,
      p95ResponseTime: this.metrics.p95ResponseTime
    };
  }

  private updateResponseTimes(latency: number): void {
    this.responseTimeBuffer.push(latency);

    if (this.responseTimeBuffer.length > this.bufferSize) {
      this.responseTimeBuffer.shift();
    }

    this.metrics.avgResponseTime = this.calculateAverage(this.responseTimeBuffer);
    this.metrics.p95ResponseTime = this.calculatePercentile(this.responseTimeBuffer, 95);
  }

  private calculatePercentile(arr: number[], percentile: number): number {
    const sorted = arr.slice().sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  private determineHealthStatus(errorRate: number, poolHitRate: number): 'healthy' | 'warning' | 'critical' {
    if (errorRate > 0.1 || poolHitRate < 0.5) return 'critical';
    if (errorRate > 0.05 || poolHitRate < 0.7) return 'warning';
    return 'healthy';
  }
}
```

## Tool Registry Optimization

### Pre-compiled Tool Index
```typescript
// src/core/mcp/tool-precompiler.ts
export class ToolPrecompiler {
  async precompileTools(): Promise<CompiledToolRegistry> {
    const tools = await this.loadAllTools();

    // Create optimized lookup structures
    const nameIndex = new Map<string, Tool>();
    const categoryIndex = new Map<string, Tool[]>();
    const fuzzyIndex = new Map<string, string[]>();

    for (const tool of tools) {
      // Exact name index
      nameIndex.set(tool.name, tool);

      // Category index
      const category = tool.metadata.category || 'general';
      if (!categoryIndex.has(category)) {
        categoryIndex.set(category, []);
      }
      categoryIndex.get(category)!.push(tool);

      // Pre-compute fuzzy variations
      const variations = this.generateFuzzyVariations(tool.name);
      for (const variation of variations) {
        if (!fuzzyIndex.has(variation)) {
          fuzzyIndex.set(variation, []);
        }
        fuzzyIndex.get(variation)!.push(tool.name);
      }
    }

    return {
      nameIndex,
      categoryIndex,
      fuzzyIndex,
      totalTools: tools.length,
      compiledAt: new Date()
    };
  }

  private generateFuzzyVariations(name: string): string[] {
    const variations: string[] = [];

    // Common typos and abbreviations
    variations.push(name.toLowerCase());
    variations.push(name.replace(/[-_]/g, ''));
    variations.push(name.replace(/[aeiou]/gi, '')); // Consonants only

    // Add more fuzzy matching logic as needed

    return variations;
  }
}
```

## Advanced Caching Strategy

### Multi-Level Caching
```typescript
// src/core/mcp/multi-level-cache.ts
export class MultiLevelCache {
  private l1Cache: Map<string, any> = new Map(); // In-memory, fastest
  private l2Cache: LRUCache<string, any>; // LRU cache, larger capacity
  private l3Cache: DiskCache; // Persistent disk cache

  constructor(config: CacheConfig) {
    this.l2Cache = new LRUCache<string, any>({
      max: config.l2MaxEntries || 10000,
      ttl: config.l2TTL || 300000 // 5 minutes
    });

    this.l3Cache = new DiskCache(config.l3Path || './.cache/mcp');
  }

  async get(key: string): Promise<any | null> {
    // Try L1 cache first (fastest)
    if (this.l1Cache.has(key)) {
      return this.l1Cache.get(key);
    }

    // Try L2 cache
    const l2Value = this.l2Cache.get(key);
    if (l2Value) {
      // Promote to L1
      this.l1Cache.set(key, l2Value);
      return l2Value;
    }

    // Try L3 cache (disk)
    const l3Value = await this.l3Cache.get(key);
    if (l3Value) {
      // Promote to L2 and L1
      this.l2Cache.set(key, l3Value);
      this.l1Cache.set(key, l3Value);
      return l3Value;
    }

    return null;
  }

  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    // Set in all levels
    this.l1Cache.set(key, value);
    this.l2Cache.set(key, value);

    if (options?.persistent) {
      await this.l3Cache.set(key, value);
    }

    // Manage L1 cache size
    if (this.l1Cache.size > 1000) {
      const firstKey = this.l1Cache.keys().next().value;
      this.l1Cache.delete(firstKey);
    }
  }
}
```

## Success Metrics

### Performance Targets
- [ ] **Startup Time**: <400ms MCP server initialization (4.5x improvement)
- [ ] **Response Time**: <100ms p95 for tool execution
- [ ] **Tool Lookup**: <5ms average lookup time
- [ ] **Connection Pool**: >90% hit rate
- [ ] **Memory Usage**: 50% reduction in idle memory
- [ ] **Error Rate**: <1% failed requests
- [ ] **Throughput**: >1000 requests/second

### Monitoring Dashboards
```typescript
const mcpDashboard = {
  metrics: [
    'Request latency (p50, p95, p99)',
    'Error rate by tool category',
    'Connection pool utilization',
    'Tool lookup performance',
    'Memory usage trends',
    'Cache hit rates (L1, L2, L3)'
  ],

  alerts: [
    'Response time >200ms for 5 minutes',
    'Error rate >5% for 1 minute',
    'Pool hit rate <70% for 10 minutes',
    'Memory usage >500MB for 5 minutes'
  ]
};
```

## Related V3 Skills

- `v3-core-implementation` - Core domain integration with MCP
- `v3-performance-optimization` - Overall performance optimization
- `v3-swarm-coordination` - MCP integration with swarm coordination
- `v3-memory-unification` - Memory sharing via MCP tools

## Usage Examples

### Complete MCP Optimization
```bash
# Full MCP server optimization
Task("MCP optimization implementation",
     "Implement all MCP performance optimizations with monitoring",
     "mcp-specialist")
```

### Specific Optimization
```bash
# Connection pool optimization
Task("MCP connection pooling",
     "Implement advanced connection pooling with health monitoring",
     "mcp-specialist")
```


## Sub-skill: v3-memory-unification

# V3 Memory Unification

## What This Skill Does

Consolidates disparate memory systems into unified AgentDB backend with HNSW vector search, achieving 150x-12,500x search performance improvements while maintaining backward compatibility.

## Quick Start

```bash
# Initialize memory unification
Task("Memory architecture", "Design AgentDB unification strategy", "v3-memory-specialist")

# AgentDB integration
Task("AgentDB setup", "Configure HNSW indexing and vector search", "v3-memory-specialist")

# Data migration
Task("Memory migration", "Migrate SQLite/Markdown to AgentDB", "v3-memory-specialist")
```

## Systems to Unify

### Legacy Systems → AgentDB
```
┌─────────────────────────────────────────┐
│  • MemoryManager (basic operations)     │
│  • DistributedMemorySystem (clustering) │
│  • SwarmMemory (agent-specific)         │
│  • AdvancedMemoryManager (features)     │
│  • SQLiteBackend (structured)           │
│  • MarkdownBackend (file-based)         │
│  • HybridBackend (combination)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       🚀 AgentDB with HNSW             │
│  • 150x-12,500x faster search          │
│  • Unified query interface             │
│  • Cross-agent memory sharing          │
│  • SONA learning integration           │
└─────────────────────────────────────────┘
```

## Implementation Architecture

### Unified Memory Service
```typescript
class UnifiedMemoryService implements IMemoryBackend {
  constructor(
    private agentdb: AgentDBAdapter,
    private indexer: HNSWIndexer,
    private migrator: DataMigrator
  ) {}

  async store(entry: MemoryEntry): Promise<void> {
    await this.agentdb.store(entry);
    await this.indexer.index(entry);
  }

  async query(query: MemoryQuery): Promise<MemoryEntry[]> {
    if (query.semantic) {
      return this.indexer.search(query); // 150x-12,500x faster
    }
    return this.agentdb.query(query);
  }
}
```

### HNSW Vector Search
```typescript
class HNSWIndexer {
  constructor(dimensions: number = 1536) {
    this.index = new HNSWIndex({
      dimensions,
      efConstruction: 200,
      M: 16,
      speedupTarget: '150x-12500x'
    });
  }

  async search(query: MemoryQuery): Promise<MemoryEntry[]> {
    const embedding = await this.embedContent(query.content);
    const results = this.index.search(embedding, query.limit || 10);
    return this.retrieveEntries(results);
  }
}
```

## Migration Strategy

### Phase 1: Foundation
```typescript
// AgentDB adapter setup
const agentdb = new AgentDBAdapter({
  dimensions: 1536,
  indexType: 'HNSW',
  speedupTarget: '150x-12500x'
});
```

### Phase 2: Data Migration
```typescript
// SQLite → AgentDB
const migrateFromSQLite = async () => {
  const entries = await sqlite.getAll();
  for (const entry of entries) {
    const embedding = await generateEmbedding(entry.content);
    await agentdb.store({ ...entry, embedding });
  }
};

// Markdown → AgentDB
const migrateFromMarkdown = async () => {
  const files = await glob('**/*.md');
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    await agentdb.store({
      id: generateId(),
      content,
      embedding: await generateEmbedding(content),
      metadata: { originalFile: file }
    });
  }
};
```

## SONA Integration

### Learning Pattern Storage
```typescript
class SONAMemoryIntegration {
  async storePattern(pattern: LearningPattern): Promise<void> {
    await this.memory.store({
      id: pattern.id,
      content: pattern.data,
      metadata: {
        sonaMode: pattern.mode,
        reward: pattern.reward,
        adaptationTime: pattern.adaptationTime
      },
      embedding: await this.generateEmbedding(pattern.data)
    });
  }

  async retrieveSimilarPatterns(query: string): Promise<LearningPattern[]> {
    return this.memory.query({
      type: 'semantic',
      content: query,
      filters: { type: 'learning_pattern' }
    });
  }
}
```

## Performance Targets

- **Search Speed**: 150x-12,500x improvement via HNSW
- **Memory Usage**: 50-75% reduction through optimization
- **Query Latency**: <100ms for 1M+ entries
- **Cross-Agent Sharing**: Real-time memory synchronization
- **SONA Integration**: <0.05ms adaptation time

## Success Metrics

- [ ] All 7 legacy memory systems migrated to AgentDB
- [ ] 150x-12,500x search performance validated
- [ ] 50-75% memory usage reduction achieved
- [ ] Backward compatibility maintained
- [ ] SONA learning patterns integrated
- [ ] Cross-agent memory sharing operational


## Sub-skill: v3-performance-optimization

# V3 Performance Optimization

## What This Skill Does

Validates and optimizes claude-flow v3 to achieve industry-leading performance through Flash Attention, AgentDB HNSW indexing, and comprehensive system optimization with continuous benchmarking.

## Quick Start

```bash
# Initialize performance optimization
Task("Performance baseline", "Establish v2 performance benchmarks", "v3-performance-engineer")

# Target validation (parallel)
Task("Flash Attention", "Validate 2.49x-7.47x speedup target", "v3-performance-engineer")
Task("Search optimization", "Validate 150x-12,500x search improvement", "v3-performance-engineer")
Task("Memory optimization", "Achieve 50-75% memory reduction", "v3-performance-engineer")
```

## Performance Target Matrix

### Flash Attention Revolution
```
┌─────────────────────────────────────────┐
│           FLASH ATTENTION               │
├─────────────────────────────────────────┤
│  Baseline: Standard attention           │
│  Target:   2.49x - 7.47x speedup       │
│  Memory:   50-75% reduction             │
│  Latency:  Sub-millisecond processing   │
└─────────────────────────────────────────┘
```

### Search Performance Revolution
```
┌─────────────────────────────────────────┐
│            SEARCH OPTIMIZATION         │
├─────────────────────────────────────────┤
│  Current:  O(n) linear search           │
│  Target:   150x - 12,500x improvement   │
│  Method:   HNSW indexing                │
│  Latency:  <100ms for 1M+ entries       │
└─────────────────────────────────────────┘
```

## Comprehensive Benchmark Suite

### Startup Performance
```typescript
class StartupBenchmarks {
  async benchmarkColdStart(): Promise<BenchmarkResult> {
    const startTime = performance.now();

    await this.initializeCLI();
    await this.initializeMCPServer();
    await this.spawnTestAgent();

    const totalTime = performance.now() - startTime;

    return {
      total: totalTime,
      target: 500, // ms
      achieved: totalTime < 500
    };
  }
}
```

### Memory Operation Benchmarks
```typescript
class MemoryBenchmarks {
  async benchmarkVectorSearch(): Promise<SearchBenchmark> {
    const queries = this.generateTestQueries(10000);

    // Baseline: Current linear search
    const baselineTime = await this.timeOperation(() =>
      this.currentMemory.searchAll(queries)
    );

    // Target: HNSW search
    const hnswTime = await this.timeOperation(() =>
      this.agentDBMemory.hnswSearchAll(queries)
    );

    const improvement = baselineTime / hnswTime;

    return {
      baseline: baselineTime,
      hnsw: hnswTime,
      improvement,
      targetRange: [150, 12500],
      achieved: improvement >= 150
    };
  }

  async benchmarkMemoryUsage(): Promise<MemoryBenchmark> {
    const baseline = process.memoryUsage().heapUsed;

    await this.loadTestDataset();
    const withData = process.memoryUsage().heapUsed;

    await this.enableOptimization();
    const optimized = process.memoryUsage().heapUsed;

    const reduction = (withData - optimized) / withData;

    return {
      baseline,
      withData,
      optimized,
      reductionPercent: reduction * 100,
      targetReduction: [50, 75],
      achieved: reduction >= 0.5
    };
  }
}
```

### Swarm Coordination Benchmarks
```typescript
class SwarmBenchmarks {
  async benchmark15AgentCoordination(): Promise<SwarmBenchmark> {
    const agents = await this.spawn15Agents();

    // Coordination latency
    const coordinationTime = await this.timeOperation(() =>
      this.coordinateSwarmTask(agents)
    );

    // Task decomposition
    const decompositionTime = await this.timeOperation(() =>
      this.decomposeComplexTask()
    );

    // Consensus achievement
    const consensusTime = await this.timeOperation(() =>
      this.achieveSwarmConsensus(agents)
    );

    return {
      coordination: coordinationTime,
      decomposition: decompositionTime,
      consensus: consensusTime,
      agentCount: 15,
      efficiency: this.calculateEfficiency(agents)
    };
  }
}
```

### Flash Attention Benchmarks
```typescript
class AttentionBenchmarks {
  async benchmarkFlashAttention(): Promise<AttentionBenchmark> {
    const sequences = this.generateSequences([512, 1024, 2048, 4096]);
    const results = [];

    for (const sequence of sequences) {
      // Baseline attention
      const baselineResult = await this.benchmarkStandardAttention(sequence);

      // Flash attention
      const flashResult = await this.benchmarkFlashAttention(sequence);

      results.push({
        sequenceLength: sequence.length,
        speedup: baselineResult.time / flashResult.time,
        memoryReduction: (baselineResult.memory - flashResult.memory) / baselineResult.memory,
        targetSpeedup: [2.49, 7.47],
        achieved: this.checkTarget(flashResult, [2.49, 7.47])
      });
    }

    return {
      results,
      averageSpeedup: this.calculateAverage(results, 'speedup'),
      averageMemoryReduction: this.calculateAverage(results, 'memoryReduction')
    };
  }
}
```

### SONA Learning Benchmarks
```typescript
class SONABenchmarks {
  async benchmarkAdaptationTime(): Promise<SONABenchmark> {
    const scenarios = [
      'pattern_recognition',
      'task_optimization',
      'error_correction',
      'performance_tuning'
    ];

    const results = [];

    for (const scenario of scenarios) {
      const startTime = performance.hrtime.bigint();
      await this.sona.adapt(scenario);
      const endTime = performance.hrtime.bigint();

      const adaptationTimeMs = Number(endTime - startTime) / 1000000;

      results.push({
        scenario,
        adaptationTime: adaptationTimeMs,
        target: 0.05, // ms
        achieved: adaptationTimeMs <= 0.05
      });
    }

    return {
      scenarios: results,
      averageTime: results.reduce((sum, r) => sum + r.adaptationTime, 0) / results.length,
      successRate: results.filter(r => r.achieved).length / results.length
    };
  }
}
```

## Performance Monitoring Dashboard

### Real-time Metrics
```typescript
class PerformanceMonitor {
  async collectMetrics(): Promise<PerformanceSnapshot> {
    return {
      timestamp: Date.now(),
      flashAttention: await this.measureFlashAttention(),
      searchPerformance: await this.measureSearchSpeed(),
      memoryUsage: await this.measureMemoryEfficiency(),
      startupTime: await this.measureStartupLatency(),
      sonaAdaptation: await this.measureSONASpeed(),
      swarmCoordination: await this.measureSwarmEfficiency()
    };
  }

  async generateReport(): Promise<PerformanceReport> {
    const snapshot = await this.collectMetrics();

    return {
      summary: this.generateSummary(snapshot),
      achievements: this.checkTargetAchievements(snapshot),
      trends: this.analyzeTrends(),
      recommendations: this.generateOptimizations(),
      regressions: await this.detectRegressions()
    };
  }
}
```

### Continuous Regression Detection
```typescript
class PerformanceRegression {
  async detectRegressions(): Promise<RegressionReport> {
    const current = await this.runFullBenchmark();
    const baseline = await this.getBaseline();

    const regressions = [];

    for (const [metric, currentValue] of Object.entries(current)) {
      const baselineValue = baseline[metric];
      const change = (currentValue - baselineValue) / baselineValue;

      if (change < -0.05) { // 5% regression threshold
        regressions.push({
          metric,
          baseline: baselineValue,
          current: currentValue,
          regressionPercent: change * 100,
          severity: this.classifyRegression(change)
        });
      }
    }

    return {
      hasRegressions: regressions.length > 0,
      regressions,
      recommendations: this.generateRegressionFixes(regressions)
    };
  }
}
```

## Optimization Strategies

### Memory Optimization
```typescript
class MemoryOptimization {
  async optimizeMemoryUsage(): Promise<OptimizationResult> {
    // Implement memory pooling
    await this.setupMemoryPools();

    // Enable garbage collection tuning
    await this.optimizeGarbageCollection();

    // Implement object reuse patterns
    await this.setupObjectPools();

    // Enable memory compression
    await this.enableMemoryCompression();

    return this.validateMemoryReduction();
  }
}
```

### CPU Optimization
```typescript
class CPUOptimization {
  async optimizeCPUUsage(): Promise<OptimizationResult> {
    // Implement worker thread pools
    await this.setupWorkerThreads();

    // Enable CPU-specific optimizations
    await this.enableSIMDInstructions();

    // Implement task batching
    await this.optimizeTaskBatching();

    return this.validateCPUImprovement();
  }
}
```

## Target Validation Framework

### Performance Gates
```typescript
class PerformanceGates {
  async validateAllTargets(): Promise<ValidationReport> {
    const results = await Promise.all([
      this.validateFlashAttention(),     // 2.49x-7.47x
      this.validateSearchPerformance(),  // 150x-12,500x
      this.validateMemoryReduction(),    // 50-75%
      this.validateStartupTime(),        // <500ms
      this.validateSONAAdaptation()      // <0.05ms
    ]);

    return {
      allTargetsAchieved: results.every(r => r.achieved),
      results,
      overallScore: this.calculateOverallScore(results),
      recommendations: this.generateRecommendations(results)
    };
  }
}
```

## Success Metrics

### Primary Targets
- [ ] **Flash Attention**: 2.49x-7.47x speedup validated
- [ ] **Search Performance**: 150x-12,500x improvement confirmed
- [ ] **Memory Reduction**: 50-75% usage optimization achieved
- [ ] **Startup Time**: <500ms cold start consistently
- [ ] **SONA Adaptation**: <0.05ms learning response time
- [ ] **15-Agent Coordination**: Efficient parallel execution

### Continuous Monitoring
- [ ] **Performance Dashboard**: Real-time metrics collection
- [ ] **Regression Testing**: Automated performance validation
- [ ] **Trend Analysis**: Performance evolution tracking
- [ ] **Alert System**: Immediate regression notification

## Related V3 Skills

- `v3-integration-deep` - Performance integration with agentic-flow
- `v3-memory-unification` - Memory performance optimization
- `v3-swarm-coordination` - Swarm performance coordination
- `v3-security-overhaul` - Secure performance patterns

## Usage Examples

### Complete Performance Validation
```bash
# Full performance suite
npm run benchmark:v3

# Specific target validation
npm run benchmark:flash-attention
npm run benchmark:agentdb-search
npm run benchmark:memory-optimization

# Continuous monitoring
npm run monitor:performance
```


## Sub-skill: v3-security-overhaul

# V3 Security Overhaul

## What This Skill Does

Orchestrates comprehensive security overhaul for claude-flow v3, addressing critical vulnerabilities and establishing security-first development practices using specialized v3 security agents.

## Quick Start

```bash
# Initialize V3 security domain (parallel)
Task("Security architecture", "Design v3 threat model and security boundaries", "v3-security-architect")
Task("CVE remediation", "Fix CVE-1, CVE-2, CVE-3 critical vulnerabilities", "security-auditor")
Task("Security testing", "Implement TDD London School security framework", "test-architect")
```

## Critical Security Fixes

### CVE-1: Vulnerable Dependencies
```bash
npm update @anthropic-ai/claude-code@^2.0.31
npm audit --audit-level high
```

### CVE-2: Weak Password Hashing
```typescript
// ❌ Old: SHA-256 with hardcoded salt
const hash = crypto.createHash('sha256').update(password + salt).digest('hex');

// ✅ New: bcrypt with 12 rounds
import bcrypt from 'bcrypt';
const hash = await bcrypt.hash(password, 12);
```

### CVE-3: Hardcoded Credentials
```typescript
// ✅ Generate secure random credentials
const apiKey = crypto.randomBytes(32).toString('hex');
```

## Security Patterns

### Input Validation (Zod)
```typescript
import { z } from 'zod';

const TaskSchema = z.object({
  taskId: z.string().uuid(),
  content: z.string().max(10000),
  agentType: z.enum(['security', 'core', 'integration'])
});
```

### Path Sanitization
```typescript
function securePath(userPath: string, allowedPrefix: string): string {
  const resolved = path.resolve(allowedPrefix, userPath);
  if (!resolved.startsWith(path.resolve(allowedPrefix))) {
    throw new SecurityError('Path traversal detected');
  }
  return resolved;
}
```

### Safe Command Execution
```typescript
import { execFile } from 'child_process';

// ✅ Safe: No shell interpretation
const { stdout } = await execFile('git', [userInput], { shell: false });
```

## Success Metrics

- **Security Score**: 90/100 (npm audit + custom scans)
- **CVE Resolution**: 100% of critical vulnerabilities fixed
- **Test Coverage**: >95% security-critical code
- **Implementation**: All secure patterns documented and tested


## Sub-skill: v3-swarm-coordination

# V3 Swarm Coordination

## What This Skill Does

Orchestrates the complete 15-agent hierarchical mesh swarm for claude-flow v3 implementation, coordinating parallel execution across domains while maintaining dependencies and timeline adherence.

## Quick Start

```bash
# Initialize 15-agent v3 swarm
Task("Swarm initialization", "Initialize hierarchical mesh for v3 implementation", "v3-queen-coordinator")

# Security domain (Phase 1 - Critical priority)
Task("Security architecture", "Design v3 threat model and security boundaries", "v3-security-architect")
Task("CVE remediation", "Fix CVE-1, CVE-2, CVE-3 vulnerabilities", "security-auditor")
Task("Security testing", "Implement TDD security framework", "test-architect")

# Core domain (Phase 2 - Parallel execution)
Task("Memory unification", "Implement AgentDB 150x improvement", "v3-memory-specialist")
Task("Integration architecture", "Deep agentic-flow@alpha integration", "v3-integration-architect")
Task("Performance validation", "Validate 2.49x-7.47x targets", "v3-performance-engineer")
```

## 15-Agent Swarm Architecture

### Hierarchical Mesh Topology
```
                    👑 QUEEN COORDINATOR
                         (Agent #1)
                             │
        ┌────────────────────┼────────────────────┐
        │                   │                    │
   🛡️ SECURITY         🧠 CORE              🔗 INTEGRATION
   (Agents #2-4)       (Agents #5-9)        (Agents #10-12)
        │                   │                    │
        └────────────────────┼────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                   │                    │
   🧪 QUALITY          ⚡ PERFORMANCE        🚀 DEPLOYMENT
   (Agent #13)         (Agent #14)          (Agent #15)
```

### Agent Roster
| ID | Agent | Domain | Phase | Responsibility |
|----|-------|--------|-------|----------------|
| 1 | Queen Coordinator | Orchestration | All | GitHub issues, dependencies, timeline |
| 2 | Security Architect | Security | Foundation | Threat modeling, CVE planning |
| 3 | Security Implementer | Security | Foundation | CVE fixes, secure patterns |
| 4 | Security Tester | Security | Foundation | TDD security testing |
| 5 | Core Architect | Core | Systems | DDD architecture, coordination |
| 6 | Core Implementer | Core | Systems | Core module implementation |
| 7 | Memory Specialist | Core | Systems | AgentDB unification |
| 8 | Swarm Specialist | Core | Systems | Unified coordination engine |
| 9 | MCP Specialist | Core | Systems | MCP server optimization |
| 10 | Integration Architect | Integration | Integration | agentic-flow@alpha deep integration |
| 11 | CLI/Hooks Developer | Integration | Integration | CLI modernization |
| 12 | Neural/Learning Dev | Integration | Integration | SONA integration |
| 13 | TDD Test Engineer | Quality | All | London School TDD |
| 14 | Performance Engineer | Performance | Optimization | Benchmarking validation |
| 15 | Release Engineer | Deployment | Release | CI/CD and v3.0.0 release |

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
**Active Agents**: #1, #2-4, #5-6
```typescript
const phase1 = async () => {
  // Parallel security and architecture foundation
  await Promise.all([
    // Security domain (critical priority)
    Task("Security architecture", "Complete threat model and security boundaries", "v3-security-architect"),
    Task("CVE-1 fix", "Update vulnerable dependencies", "security-implementer"),
    Task("CVE-2 fix", "Replace weak password hashing", "security-implementer"),
    Task("CVE-3 fix", "Remove hardcoded credentials", "security-implementer"),
    Task("Security testing", "TDD London School security framework", "test-architect"),

    // Core architecture foundation
    Task("DDD architecture", "Design domain boundaries and structure", "core-architect"),
    Task("Type modernization", "Update type system for v3", "core-implementer")
  ]);
};
```

### Phase 2: Core Systems (Week 3-6)
**Active Agents**: #1, #5-9, #13
```typescript
const phase2 = async () => {
  // Parallel core system implementation
  await Promise.all([
    Task("Memory unification", "Implement AgentDB with 150x-12,500x improvement", "v3-memory-specialist"),
    Task("Swarm coordination", "Merge 4 coordination systems into unified engine", "swarm-specialist"),
    Task("MCP optimization", "Optimize MCP server performance", "mcp-specialist"),
    Task("Core implementation", "Implement DDD modular architecture", "core-implementer"),
    Task("TDD core tests", "Comprehensive test coverage for core systems", "test-architect")
  ]);
};
```

### Phase 3: Integration (Week 7-10)
**Active Agents**: #1, #10-12, #13-14
```typescript
const phase3 = async () => {
  // Parallel integration and optimization
  await Promise.all([
    Task("agentic-flow integration", "Eliminate 10,000+ duplicate lines", "v3-integration-architect"),
    Task("CLI modernization", "Enhance CLI with hooks system", "cli-hooks-developer"),
    Task("SONA integration", "Implement <0.05ms learning adaptation", "neural-learning-developer"),
    Task("Performance benchmarking", "Validate 2.49x-7.47x targets", "v3-performance-engineer"),
    Task("Integration testing", "End-to-end system validation", "test-architect")
  ]);
};
```

### Phase 4: Release (Week 11-14)
**Active Agents**: All 15
```typescript
const phase4 = async () => {
  // Full swarm final optimization
  await Promise.all([
    Task("Performance optimization", "Final optimization pass", "v3-performance-engineer"),
    Task("Release preparation", "CI/CD pipeline and v3.0.0 release", "release-engineer"),
    Task("Final testing", "Complete test coverage validation", "test-architect"),

    // All agents: Final polish and optimization
    ...agents.map(agent =>
      Task("Final polish", `Agent ${agent.id} final optimization`, agent.name)
    )
  ]);
};
```

## Coordination Patterns

### Dependency Management
```typescript
class DependencyCoordination {
  private dependencies = new Map([
    // Security first (no dependencies)
    [2, []], [3, [2]], [4, [2, 3]],

    // Core depends on security foundation
    [5, [2]], [6, [5]], [7, [5]], [8, [5, 7]], [9, [5]],

    // Integration depends on core systems
    [10, [5, 7, 8]], [11, [5, 10]], [12, [7, 10]],

    // Quality and performance cross-cutting
    [13, [2, 5]], [14, [5, 7, 8, 10]], [15, [13, 14]]
  ]);

  async coordinateExecution(): Promise<void> {
    const completed = new Set<number>();

    while (completed.size < 15) {
      const ready = this.getReadyAgents(completed);

      if (ready.length === 0) {
        throw new Error('Deadlock detected in dependency chain');
      }

      // Execute ready agents in parallel
      await Promise.all(ready.map(agentId => this.executeAgent(agentId)));

      ready.forEach(id => completed.add(id));
    }
  }
}
```

### GitHub Integration
```typescript
class GitHubCoordination {
  async initializeV3Milestone(): Promise<void> {
    await gh.createMilestone({
      title: 'Claude-Flow v3.0.0 Implementation',
      description: '15-agent swarm implementation of 10 ADRs',
      dueDate: this.calculate14WeekDeadline()
    });
  }

  async createEpicIssues(): Promise<void> {
    const epics = [
      { title: 'Security Overhaul (CVE-1,2,3)', agents: [2, 3, 4] },
      { title: 'Memory Unification (AgentDB)', agents: [7] },
      { title: 'agentic-flow Integration', agents: [10] },
      { title: 'Performance Optimization', agents: [14] },
      { title: 'DDD Architecture', agents: [5, 6] }
    ];

    for (const epic of epics) {
      await gh.createIssue({
        title: epic.title,
        labels: ['epic', 'v3', ...epic.agents.map(id => `agent-${id}`)],
        assignees: epic.agents.map(id => this.getAgentGithubUser(id))
      });
    }
  }

  async trackProgress(): Promise<void> {
    // Hourly progress updates from each agent
    setInterval(async () => {
      for (const agent of this.agents) {
        await this.postAgentProgress(agent);
      }
    }, 3600000); // 1 hour
  }
}
```

### Communication Bus
```typescript
class SwarmCommunication {
  private bus = new QuicSwarmBus({
    maxAgents: 15,
    messageTimeout: 30000,
    retryAttempts: 3
  });

  async broadcastToSecurityDomain(message: SwarmMessage): Promise<void> {
    await this.bus.broadcast(message, {
      targetAgents: [2, 3, 4],
      priority: 'critical'
    });
  }

  async coordinateCoreSystems(message: SwarmMessage): Promise<void> {
    await this.bus.broadcast(message, {
      targetAgents: [5, 6, 7, 8, 9],
      priority: 'high'
    });
  }

  async notifyIntegrationTeam(message: SwarmMessage): Promise<void> {
    await this.bus.broadcast(message, {
      targetAgents: [10, 11, 12],
      priority: 'medium'
    });
  }
}
```

## Performance Coordination

### Parallel Efficiency Monitoring
```typescript
class EfficiencyMonitor {
  async measureParallelEfficiency(): Promise<EfficiencyReport> {
    const agentUtilization = await this.measureAgentUtilization();
    const coordinationOverhead = await this.measureCoordinationCost();

    return {
      totalEfficiency: agentUtilization.average,
      target: 0.85, // >85% utilization
      achieved: agentUtilization.average > 0.85,
      bottlenecks: this.identifyBottlenecks(agentUtilization),
      recommendations: this.generateOptimizations()
    };
  }
}
```

### Load Balancing
```typescript
class SwarmLoadBalancer {
  async balanceWorkload(): Promise<void> {
    const workloads = await this.analyzeAgentWorkloads();

    for (const [agentId, load] of workloads.entries()) {
      if (load > this.getCapacityThreshold(agentId)) {
        await this.redistributeWork(agentId);
      }
    }
  }

  async redistributeWork(overloadedAgent: number): Promise<void> {
    const availableAgents = this.getAvailableAgents();
    const tasks = await this.getAgentTasks(overloadedAgent);

    // Redistribute tasks to available agents
    for (const task of tasks) {
      const bestAgent = this.selectOptimalAgent(task, availableAgents);
      await this.reassignTask(task, bestAgent);
    }
  }
}
```

## Success Metrics

### Swarm Coordination
- [ ] **Parallel Efficiency**: >85% agent utilization time
- [ ] **Dependency Resolution**: Zero deadlocks or blocking issues
- [ ] **Communication Latency**: <100ms inter-agent messaging
- [ ] **Timeline Adherence**: 14-week delivery maintained
- [ ] **GitHub Integration**: <4h automated issue response

### Implementation Targets
- [ ] **ADR Coverage**: All 10 ADRs implemented successfully
- [ ] **Performance**: 2.49x-7.47x Flash Attention achieved
- [ ] **Search**: 150x-12,500x AgentDB improvement validated
- [ ] **Code Reduction**: <5,000 lines (vs 15,000+)
- [ ] **Security**: 90/100 security score achieved

## Related V3 Skills

- `v3-security-overhaul` - Security domain coordination
- `v3-memory-unification` - Memory system coordination
- `v3-integration-deep` - Integration domain coordination
- `v3-performance-optimization` - Performance domain coordination

## Usage Examples

### Initialize Complete V3 Swarm
```bash
# Queen Coordinator initializes full swarm
Task("V3 swarm initialization",
     "Initialize 15-agent hierarchical mesh for complete v3 implementation",
     "v3-queen-coordinator")
```

### Phase-based Execution
```bash
# Phase 1: Security-first foundation
npm run v3:phase1:security

# Phase 2: Core systems parallel
npm run v3:phase2:core-systems

# Phase 3: Integration and optimization
npm run v3:phase3:integration

# Phase 4: Release preparation
npm run v3:phase4:release
```
