# AgentDB Advanced & Learning Guide

This guide details the advanced features, distributed QUIC synchronization, hybrid vector-metadata search, and reinforcement learning algorithms available via AgentDB (`agentic-flow/reasoningbank`) within the ZeaZ Platform.

---

## 1. Advanced Architecture & QUIC Sync

QUIC synchronization provides sub-millisecond, low-latency, encrypted, and multiplexed data synchronization across multi-node distributed environments.

### Core Configuration Topology

```typescript
import { createAgentDBAdapter } from 'agentic-flow/reasoningbank';

const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/distributed.db',
  enableQUICSync: true,
  syncPort: 4433,
  syncPeers: [
    '192.168.1.10:4433',
    '192.168.1.11:4433',
    '192.168.1.12:4433'
  ],
  syncInterval: 1000,
  syncBatchSize: 100,
  maxRetries: 3,
  compression: true
});
```

### Environment Variables Matrix

```bash
AGENTDB_QUIC_SYNC=true
AGENTDB_QUIC_PORT=4433
AGENTDB_QUIC_PEERS=192.168.1.11:4433,192.168.1.12:4433
```

---

## 2. Hybrid Search (Vector + Metadata)

Hybrid search integrates dense semantic vectors with metadata filtering schemas (e.g. range, tags, logical bounds).

```typescript
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'research-papers',
  k: 20,
  filters: {
    year: { $gte: 2023 },
    category: 'machine-learning',
    citations: { $gte: 50 }
  },
  hybridWeights: {
    vectorSimilarity: 0.7,
    metadataScore: 0.3
  }
});
```

### Distance Metrics Available

1. **Cosine Similarity** (`cosine`): Best for text/semantic search. Range: `[-1, 1]`.
2. **Euclidean Distance** (`euclidean` / `L2`): Best for image/spatial embeddings. Range: `[0, ∞]`.
3. **Dot Product** (`dot`): Fastest calculation, best for pre-normalized vectors. Range: `[-∞, ∞]`.

---

## 3. Reinforcement Learning Plugins (9 Algorithms)

AgentDB supports 9 WASM-accelerated reinforcement learning algorithms to train autonomous agents via offline experiences or online trials.

### Available Reinforcement Learning Templates

| Template | Type | Best Use Cases | Key Configs |
|:---|:---|:---|:---|
| **decision-transformer** | Offline RL / Sequence Modeling | Imitation learning from historical logs | `context_length`, `embed_dim`, `n_heads` |
| **q-learning** | Value-Based (Off-Policy) | Discrete action spaces, grid systems | `learning_rate`, `gamma`, `epsilon` |
| **sarsa** | Value-Based (On-Policy) | Safe online exploration, conservative | `learning_rate`, `gamma`, `epsilon` |
| **actor-critic** | Policy Gradient / Value Baseline | Continuous action spaces, robotics | `actor_lr`, `critic_lr`, `entropy_coef` |
| **active-learning** | Query-Based | Minimizing labeling costs with human feedback | `query_strategy`, `uncertainty_threshold` |
| **adversarial-training** | Robustness | Protecting policies from adversarial attacks | `perturbation_scale`, `attack_type` |
| **curriculum-learning** | Progressive Difficulty | Complex multi-stage task training | `difficulty_thresholds`, `pacing_fn` |
| **federated-learning** | Distributed | Collaborative model training with privacy | `aggregator_url`, `local_epochs` |
| **multi-task-learning** | Transfer Learning | Sharing layers across similar task domains | `shared_dims`, `task_weights` |

---

## 4. Production Optimization Patterns

### Connection Singleton Pool

```typescript
class AgentDBPool {
  private static instance: AgentDBAdapter;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await createAgentDBAdapter({
        dbPath: '.agentdb/production.db',
        quantizationType: 'scalar',
        cacheSize: 2000
      });
    }
    return this.instance;
  }
}
```

### MMR (Maximal Marginal Relevance)

Improves result diversity to avoid redundancy:

```typescript
const diverseResults = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 10,
  useMMR: true,
  mmrLambda: 0.5 // 0 = maximum relevance, 1 = maximum diversity
});
```
