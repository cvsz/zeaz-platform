import type { Workflow, WorkflowEngine } from './engine'

export const repoUpgradeWorkflow: Workflow = {
  id: 'repo-upgrade',
  name: 'Repository Upgrade',
  description: 'Automated repository dependency upgrades with security validation',
  status: 'idle',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  steps: [
    {
      id: 'audit-deps',
      name: 'Audit Dependencies',
      type: 'agent',
      config: { agentRole: 'security' },
      input: 'Scan all dependencies for outdated and vulnerable packages',
      dependsOn: [],
    },
    {
      id: 'generate-plan',
      name: 'Generate Upgrade Plan',
      type: 'agent',
      config: { agentRole: 'architect' },
      input: 'Create an upgrade plan based on dependency audit results',
      dependsOn: ['audit-deps'],
    },
    {
      id: 'execute-upgrade',
      name: 'Execute Upgrades',
      type: 'agent',
      config: { agentRole: 'devops' },
      input: 'Execute the planned dependency upgrades safely',
      dependsOn: ['generate-plan'],
    },
    {
      id: 'verify-upgrade',
      name: 'Verify Upgrades',
      type: 'agent',
      config: { agentRole: 'reviewer' },
      input: 'Verify all upgrades completed successfully with no regressions',
      dependsOn: ['execute-upgrade'],
    },
  ],
}

export const securityAuditWorkflow: Workflow = {
  id: 'security-audit',
  name: 'Security Audit',
  description: 'Automated full security audit of the platform',
  status: 'idle',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  steps: [
    {
      id: 'scan-dependencies',
      name: 'Dependency Vulnerability Scan',
      type: 'agent',
      config: { agentRole: 'security' },
      input: 'Scan all package dependencies for known CVEs and vulnerabilities',
    },
    {
      id: 'code-analysis',
      name: 'Static Code Analysis',
      type: 'agent',
      config: { agentRole: 'reviewer' },
      input: 'Analyze codebase for security anti-patterns and vulnerabilities',
      dependsOn: ['scan-dependencies'],
    },
    {
      id: 'threat-model',
      name: 'Threat Modeling',
      type: 'agent',
      config: { agentRole: 'architect' },
      input: 'Create threat model based on scan results and architecture',
      dependsOn: ['code-analysis'],
    },
    {
      id: 'generate-report',
      name: 'Generate Security Report',
      type: 'agent',
      config: { agentRole: 'research' },
      input: 'Compile comprehensive security audit report with remediation steps',
      dependsOn: ['threat-model'],
    },
  ],
}

export const dependencyUpdateWorkflow: Workflow = {
  id: 'dependency-update',
  name: 'Dependency Update',
  description: 'Safe automated dependency updates with rollback capability',
  status: 'idle',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  steps: [
    {
      id: 'inventory',
      name: 'Inventory Dependencies',
      type: 'agent',
      config: { agentRole: 'devops' },
      input: 'Catalog all current dependencies and their versions',
    },
    {
      id: 'check-compat',
      name: 'Check Compatibility',
      type: 'llm',
      config: { llmModel: 'claude-sonnet' },
      input: 'Check compatibility of latest versions with current codebase',
      dependsOn: ['inventory'],
    },
    {
      id: 'apply-updates',
      name: 'Apply Updates',
      type: 'mcp',
      config: { mcpProvider: 'npm', mcpTool: 'update' },
      input: 'Safely apply dependency updates',
      dependsOn: ['check-compat'],
    },
    {
      id: 'verify',
      name: 'Verify Build',
      type: 'agent',
      config: { agentRole: 'sre' },
      input: 'Verify build and tests pass after updates',
      dependsOn: ['apply-updates'],
    },
  ],
}

export const releasePipelineWorkflow: Workflow = {
  id: 'release-pipeline',
  name: 'Release Pipeline',
  description: 'End-to-end automated release pipeline',
  status: 'idle',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  steps: [
    {
      id: 'version-bump',
      name: 'Version Bump',
      type: 'agent',
      config: { agentRole: 'pm' },
      input: 'Determine and apply version bump based on changes',
    },
    {
      id: 'changelog',
      name: 'Generate Changelog',
      type: 'agent',
      config: { agentRole: 'research' },
      input: 'Generate changelog from commit history',
      dependsOn: ['version-bump'],
    },
    {
      id: 'build',
      name: 'Build Artifacts',
      type: 'agent',
      config: { agentRole: 'devops' },
      input: 'Build all artifacts for release',
      dependsOn: ['changelog'],
    },
    {
      id: 'test',
      name: 'Run Tests',
      type: 'agent',
      config: { agentRole: 'sre' },
      input: 'Run full test suite and verify quality gates',
      dependsOn: ['build'],
    },
    {
      id: 'publish',
      name: 'Publish Release',
      type: 'agent',
      config: { agentRole: 'devops' },
      input: 'Publish release artifacts and tag git',
      dependsOn: ['test'],
    },
    {
      id: 'notify',
      name: 'Notify Team',
      type: 'llm',
      config: { llmModel: 'claude-sonnet' },
      input: 'Generate release notification for the team',
      dependsOn: ['publish'],
    },
  ],
}

export const incidentResponseWorkflow: Workflow = {
  id: 'incident-response',
  name: 'Incident Response',
  description: 'Automated incident detection, diagnosis, and remediation',
  status: 'idle',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  steps: [
    {
      id: 'detect',
      name: 'Detect Incident',
      type: 'agent',
      config: { agentRole: 'sre' },
      input: 'Analyze alerts and determine incident severity and scope',
    },
    {
      id: 'diagnose',
      name: 'Diagnose Root Cause',
      type: 'agent',
      config: { agentRole: 'sre' },
      input: 'Diagnose root cause of the detected incident',
      dependsOn: ['detect'],
    },
    {
      id: 'remediate',
      name: 'Auto-Remediate',
      type: 'agent',
      config: { agentRole: 'devops' },
      input: 'Execute automated remediation actions based on diagnosis',
      dependsOn: ['diagnose'],
    },
    {
      id: 'postmortem',
      name: 'Generate Postmortem',
      type: 'agent',
      config: { agentRole: 'reviewer' },
      input: 'Create postmortem report with timeline and prevention steps',
      dependsOn: ['remediate'],
    },
  ],
}

export function registerDefaultWorkflows(engine: WorkflowEngine): void {
  engine.register(repoUpgradeWorkflow)
  engine.register(securityAuditWorkflow)
  engine.register(dependencyUpdateWorkflow)
  engine.register(releasePipelineWorkflow)
  engine.register(incidentResponseWorkflow)
}
