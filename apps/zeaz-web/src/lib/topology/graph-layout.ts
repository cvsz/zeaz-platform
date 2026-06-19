export interface Node {
  id: string;
  state: string;
  type: string;
  x: number;
  y: number;
}

export interface Edge {
  source: string;
  target: string;
}

export class TopologyLayoutEngine {
  private nodes: Node[] = [];
  private edges: Edge[] = [];

  constructor() {}

  updateTopology(topology: any) {
    // Basic force-directed or fixed layout logic
    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];
    
    // Router node
    newNodes.push({ id: 'router', state: 'HEALTHY', type: 'ROUTER', x: 400, y: 300 });

    let index = 0;
    const providerCount = Object.keys(topology).length;
    for (const [id, status] of Object.entries(topology)) {
      const angle = (index / providerCount) * 2 * Math.PI;
      const radius = 150;
      
      newNodes.push({
        id,
        state: (status as any).state,
        type: 'PROVIDER',
        x: 400 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle)
      });
      
      newEdges.push({ source: 'router', target: id });
      index++;
    }
    
    this.nodes = newNodes;
    this.edges = newEdges;
  }

  getNodes() { return this.nodes; }
  getEdges() { return this.edges; }
}
