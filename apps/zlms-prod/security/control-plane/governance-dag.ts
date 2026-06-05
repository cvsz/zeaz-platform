export type NodeStatus = 'pending' | 'running' | 'succeeded' | 'failed' | 'skipped';
export type NodeKind = 'policy' | 'scan' | 'sbom' | 'aggregate' | 'remediate' | 'canary' | 'rollback' | 'metrics';

export interface DagNode {
  id: string;
  kind: NodeKind;
  needs: string[];
  critical: boolean;
  maxRuntimeMinutes: number;
}

export interface DagExecution {
  ordered: DagNode[];
  levels: DagNode[][];
}

const SAFE_ID = /^[a-z0-9][a-z0-9_.:-]{0,127}$/i;

export class GovernanceDag {
  private readonly nodes = new Map<string, DagNode>();

  addNode(node: DagNode): void {
    if (!SAFE_ID.test(node.id)) throw new Error(`invalid DAG node id: ${node.id}`);
    if (this.nodes.has(node.id)) throw new Error(`duplicate DAG node: ${node.id}`);
    if (node.needs.includes(node.id)) throw new Error(`DAG node cannot depend on itself: ${node.id}`);
    if (!Number.isInteger(node.maxRuntimeMinutes) || node.maxRuntimeMinutes <= 0 || node.maxRuntimeMinutes > 360) {
      throw new Error(`invalid maxRuntimeMinutes for ${node.id}`);
    }
    this.nodes.set(node.id, { ...node, needs: [...node.needs].sort() });
  }

  static securityControlPlane(): GovernanceDag {
    const dag = new GovernanceDag();
    dag.addNode({ id: 'policy-gate', kind: 'policy', needs: [], critical: true, maxRuntimeMinutes: 10 });
    dag.addNode({ id: 'workflow-lock', kind: 'policy', needs: ['policy-gate'], critical: true, maxRuntimeMinutes: 5 });
    dag.addNode({ id: 'codeql', kind: 'scan', needs: ['workflow-lock'], critical: true, maxRuntimeMinutes: 90 });
    dag.addNode({ id: 'semgrep', kind: 'scan', needs: ['workflow-lock'], critical: true, maxRuntimeMinutes: 45 });
    dag.addNode({ id: 'trivy-fs', kind: 'scan', needs: ['workflow-lock'], critical: true, maxRuntimeMinutes: 45 });
    dag.addNode({ id: 'secret-scan', kind: 'scan', needs: ['workflow-lock'], critical: true, maxRuntimeMinutes: 30 });
    dag.addNode({ id: 'sbom', kind: 'sbom', needs: ['workflow-lock'], critical: true, maxRuntimeMinutes: 30 });
    dag.addNode({ id: 'sarif-aggregate', kind: 'aggregate', needs: ['codeql', 'semgrep', 'trivy-fs', 'secret-scan'], critical: true, maxRuntimeMinutes: 10 });
    dag.addNode({ id: 'remediation-queue', kind: 'remediate', needs: ['sarif-aggregate', 'sbom'], critical: false, maxRuntimeMinutes: 15 });
    dag.addNode({ id: 'canary-remediation', kind: 'canary', needs: ['remediation-queue'], critical: false, maxRuntimeMinutes: 30 });
    dag.addNode({ id: 'rollback-orchestration', kind: 'rollback', needs: ['canary-remediation'], critical: false, maxRuntimeMinutes: 15 });
    dag.addNode({ id: 'metrics', kind: 'metrics', needs: ['sarif-aggregate', 'rollback-orchestration'], critical: true, maxRuntimeMinutes: 5 });
    return dag;
  }

  validate(): DagExecution {
    for (const node of this.nodes.values()) {
      for (const need of node.needs) {
        if (!this.nodes.has(need)) throw new Error(`DAG node ${node.id} requires missing node ${need}`);
      }
    }

    const incoming = new Map<string, number>();
    const outgoing = new Map<string, string[]>();
    for (const node of this.nodes.values()) {
      incoming.set(node.id, node.needs.length);
      for (const need of node.needs) outgoing.set(need, [...(outgoing.get(need) ?? []), node.id].sort());
    }

    const queue = [...incoming.entries()].filter(([, count]) => count === 0).map(([id]) => id).sort();
    const ordered: DagNode[] = [];
    const levels: DagNode[][] = [];

    while (queue.length > 0) {
      const currentLevel = queue.splice(0, queue.length);
      const levelNodes: DagNode[] = [];
      for (const id of currentLevel) {
        const node = this.nodes.get(id);
        if (!node) continue;
        ordered.push(node);
        levelNodes.push(node);
        for (const target of outgoing.get(id) ?? []) {
          const next = (incoming.get(target) ?? 0) - 1;
          incoming.set(target, next);
          if (next === 0) queue.push(target);
        }
      }
      queue.sort();
      levels.push(levelNodes);
    }

    if (ordered.length !== this.nodes.size) {
      const cyclic = [...incoming.entries()].filter(([, count]) => count > 0).map(([id]) => id).sort();
      throw new Error(`DAG contains a cycle: ${cyclic.join(', ')}`);
    }

    return { ordered, levels };
  }
}
