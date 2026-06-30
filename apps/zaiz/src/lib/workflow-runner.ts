import { composeSystemPrompt, runStream, type ChatMessage, type SkillId } from "./glm";
import { AGENT_MAP } from "./agents";
import type { Workflow, WorkflowNode, WorkflowEvent } from "./workflows";
import { WORKFLOW_MAP, WORKFLOWS } from "./workflows";

/**
 * Workflow runner — server-only.
 *
 * Executes a workflow DAG by running each node in topological order.
 * Each node runs a GLM completion, and its output feeds downstream nodes.
 */

interface NodeResult {
  nodeId: string;
  output: string;
}

/** Topologically sort workflow nodes by their dependencies. */
function topologicalSort(nodes: WorkflowNode[]): WorkflowNode[] {
  const sorted: WorkflowNode[] = [];
  const visited = new Set<string>();
  const visiting = new Set<string>();

  function visit(node: WorkflowNode) {
    if (visited.has(node.id)) return;
    if (visiting.has(node.id)) return; // cycle — skip
    visiting.add(node.id);
    for (const depId of node.dependsOn) {
      const dep = nodes.find((n) => n.id === depId);
      if (dep) visit(dep);
    }
    visiting.delete(node.id);
    visited.add(node.id);
    sorted.push(node);
  }

  for (const node of nodes) visit(node);
  return sorted;
}

/** Resolve a prompt template, substituting {input} and {prev} / {prev:N}. */
function resolvePrompt(
  template: string,
  input: string,
  prevResults: NodeResult[],
): string {
  let result = template.replace(/\{input\}/g, input);
  // {prev} — all previous outputs joined
  const allPrev = prevResults.map((r) => r.output).join("\n\n---\n\n");
  result = result.replace(/\{prev\}/g, allPrev);
  // {prev:N} — specific previous output by index
  result = result.replace(/\{prev:(\d+)\}/g, (_, idx) => {
    const i = parseInt(idx);
    return prevResults[i]?.output ?? "";
  });
  return result;
}

/** Run a single workflow node, yielding content deltas. */
async function* runNode(
  node: WorkflowNode,
  input: string,
  prevResults: NodeResult[],
  opts: { skill?: string | null; modules?: string[]; workspace?: string | null; model?: string | null },
): AsyncGenerator<string, void, unknown> {
  const agent = AGENT_MAP.get(node.agent);
  const systemPrompt = composeSystemPrompt({
    mode: node.mode,
    skill: (opts.skill ?? agent?.defaultSkill ?? null) as SkillId | null,
    modules: opts.modules as never,
    workspace: opts.workspace,
    model: opts.model,
  });

  const executorSystem = `${systemPrompt}\n\n${agent?.executorPrompt ?? ""}`;
  const userPrompt = resolvePrompt(node.prompt, input, prevResults);

  const messages: ChatMessage[] = [
    { role: "user", content: userPrompt },
  ];

  yield* runStream(executorSystem, messages, opts.model ?? null);
}

/** Run a complete workflow, yielding WorkflowEvent objects. */
export async function* streamWorkflow(
  workflowId: string,
  input: string,
  opts: { skill?: string | null; modules?: string[]; workspace?: string | null; model?: string | null },
): AsyncGenerator<WorkflowEvent, void, unknown> {
  const workflow = WORKFLOW_MAP.get(workflowId);
  if (!workflow) {
    yield { type: "error", content: `Unknown workflow: ${workflowId}` };
    return;
  }

  yield {
    type: "start",
    workflowId: workflow.id,
    workflowName: workflow.name,
    nodeCount: workflow.nodes.length,
  };

  const sorted = topologicalSort(workflow.nodes);
  const results: NodeResult[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const node = sorted[i];
    yield { type: "node_start", nodeId: node.id, nodeLabel: node.label, index: i };

    // Collect results from dependencies
    const depResults = node.dependsOn
      .map((depId) => results.find((r) => r.nodeId === depId))
      .filter((r): r is NodeResult => r !== undefined);

    let output = "";
    try {
      for await (const delta of runNode(node, input, depResults, opts)) {
        output += delta;
        yield { type: "node_delta", nodeId: node.id, content: delta };
      }
    } catch (err) {
      yield {
        type: "error",
        content: `Node "${node.label}" failed: ${err instanceof Error ? err.message : "unknown"}`,
      };
      return;
    }

    results.push({ nodeId: node.id, output });
    yield { type: "node_end", nodeId: node.id };
  }

  yield { type: "done" };
}

export { WORKFLOWS };
