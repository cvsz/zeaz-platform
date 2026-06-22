/**
 * Agent Workflows — client-safe types + presets.
 *
 * A workflow is a directed acyclic graph (DAG) of agents that collaborate.
 * Each node is an agent with a role; edges define execution order.
 * The server executes the workflow by running each node in topological order,
 * passing outputs from upstream nodes as context.
 */

import type { AgentId } from "./agents";
import type { CliMode } from "./zlm-modes";

export type WorkflowNodeId = string;

export interface WorkflowNode {
  id: WorkflowNodeId;
  label: string;
  agent: AgentId;
  mode: CliMode;
  /** IDs of nodes whose output feeds into this node. */
  dependsOn: WorkflowNodeId[];
  /** The prompt template; {input} is replaced by the user's goal, {prev} by upstream outputs. */
  prompt: string;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
}

/** Predefined workflow presets. */
export const WORKFLOWS: Workflow[] = [
  {
    id: "full-stack-feature",
    name: "Full-Stack Feature",
    description: "Architect → Generate → Review → Test — builds a feature end-to-end.",
    nodes: [
      {
        id: "architect",
        label: "Architect",
        agent: "architect",
        mode: "generate",
        dependsOn: [],
        prompt: "Design the architecture for: {input}. Define the file structure, key functions, and data flow.",
      },
      {
        id: "generate",
        label: "Generate Code",
        agent: "architect",
        mode: "generate",
        dependsOn: ["architect"],
        prompt: "Based on this architecture:\n{prev}\n\nGenerate the complete code for: {input}",
      },
      {
        id: "review",
        label: "Review",
        agent: "bug-hunter",
        mode: "review",
        dependsOn: ["generate"],
        prompt: "Review this code for bugs, security, and best practices:\n{prev}",
      },
      {
        id: "test",
        label: "Write Tests",
        agent: "refactorer",
        mode: "generate",
        dependsOn: ["generate", "review"],
        prompt: "Write tests for this code, addressing the review findings:\nCode:\n{prev:0}\n\nReview:\n{prev:1}",
      },
    ],
  },
  {
    id: "bug-fix-pipeline",
    name: "Bug Fix Pipeline",
    description: "Reproduce → Debug → Fix → Test — systematic bug resolution.",
    nodes: [
      {
        id: "reproduce",
        label: "Reproduce",
        agent: "bug-hunter",
        mode: "debug",
        dependsOn: [],
        prompt: "Create a minimal reproduction for this bug: {input}",
      },
      {
        id: "fix",
        label: "Fix",
        agent: "bug-hunter",
        mode: "generate",
        dependsOn: ["reproduce"],
        prompt: "The bug reproduction:\n{prev}\n\nProvide the minimal fix for: {input}",
      },
      {
        id: "verify",
        label: "Verify",
        agent: "refactorer",
        mode: "review",
        dependsOn: ["fix"],
        prompt: "Verify this fix is correct and doesn't introduce regressions:\n{prev}",
      },
    ],
  },
  {
    id: "code-quality",
    name: "Code Quality",
    description: "Review → Refactor → Document — improve existing code.",
    nodes: [
      {
        id: "review",
        label: "Review",
        agent: "bug-hunter",
        mode: "review",
        dependsOn: [],
        prompt: "Review this code for quality issues:\n{input}",
      },
      {
        id: "refactor",
        label: "Refactor",
        agent: "refactorer",
        mode: "optimize",
        dependsOn: ["review"],
        prompt: "Based on this review:\n{prev}\n\nRefactor the code: {input}",
      },
      {
        id: "document",
        label: "Document",
        agent: "architect",
        mode: "explain",
        dependsOn: ["refactor"],
        prompt: "Write documentation for this refactored code:\n{prev}",
      },
    ],
  },
];

export const WORKFLOW_MAP = new Map(WORKFLOWS.map((w) => [w.id, w]));

/** Wire events for /api/workflows (NDJSON). */
export type WorkflowEvent =
  | { type: "start"; workflowId: string; workflowName: string; nodeCount: number }
  | { type: "node_start"; nodeId: string; nodeLabel: string; index: number }
  | { type: "node_delta"; nodeId: string; content: string }
  | { type: "node_end"; nodeId: string }
  | { type: "done" }
  | { type: "error"; content: string };
