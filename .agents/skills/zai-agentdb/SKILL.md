---
name: zai-agentdb
description: Master skill combining related sub-skills
---

# zai-agentdb

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Sub-skill: agentdb-advanced

# AgentDB Advanced Features

## What This Skill Does

Covers advanced AgentDB capabilities for distributed systems, multi-database coordination, custom distance metrics, hybrid search (vector + metadata), QUIC synchronization, and production deployment patterns. Enables building sophisticated AI systems with sub-millisecond cross-node communication and advanced search capabilities.

**Performance**: <1ms QUIC sync, hybrid search with filters, custom distance metrics.

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow)
- Understanding of distributed systems (for QUIC sync)
- Vector search fundamentals

---

## QUIC Synchronization

### What is QUIC Sync?

QUIC (Quick UDP Internet Connections) enables sub-millisecond latency synchronization between AgentDB instances across network boundaries with automatic retry, multiplexing, and encryption.

**Benefits**:
- <1ms latency between nodes
- Multiplexed streams (multiple operations simultaneously)
- Built-in encryption (TLS 1.3)
- Automatic retry and recovery
- Event-based broadcasting

### Enable QUIC Sync

```typescript
import { createAgentDBAdapter } from 'agentic-flow/reasoningbank';

// Initialize with QUIC synchronization
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/distributed.db',
  enableQUICSync: true,
  syncPort: 4433,
  syncPeers: [
    '192.168.1.10:4433',
    '192.168.1.11:4433',
    '192.168.1.12:4433',
  ],
});

// Patterns automatically sync across all peers
await adapter.insertPattern({
  // ... pattern data
});

// Available on all peers within ~1ms
```

### QUIC Configuration

```typescript
const adapter = await createAgentDBAdapter({
  enableQUICSync: true,
  syncPort: 4433,              // QUIC server port
  syncPeers: ['host1:4433'],   // Peer addresses
  syncInterval: 1000,          // Sync interval (ms)
  syncBatchSize: 100,          // Patterns per batch
  maxRetries: 3,               // Retry failed syncs
  compression: true,           // Enable compression
});
```

### Multi-Node Deployment

```bash
# Node 1 (192.168.1.10)
AGENTDB_QUIC_SYNC=true \
AGENTDB_QUIC_PORT=4433 \
AGENTDB_QUIC_PEERS=192.168.1.11:4433,192.168.1.12:4433 \
node server.js

# Node 2 (192.168.1.11)
AGENTDB_QUIC_SYNC=true \
AGENTDB_QUIC_PORT=4433 \
AGENTDB_QUIC_PEERS=192.168.1.10:4433,192.168.1.12:4433 \
node server.js

# Node 3 (192.168.1.12)
AGENTDB_QUIC_SYNC=true \
AGENTDB_QUIC_PORT=4433 \
AGENTDB_QUIC_PEERS=192.168.1.10:4433,192.168.1.11:4433 \
node server.js
```

---

## Distance Metrics

### Cosine Similarity (Default)

Best for normalized vectors, semantic similarity:

```bash
# CLI
npx agentdb@latest query ./vectors.db "[0.1,0.2,...]" -m cosine

# API
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  metric: 'cosine',
  k: 10,
});
```

**Use Cases**:
- Text embeddings (BERT, GPT, etc.)
- Semantic search
- Document similarity
- Most general-purpose applications

**Formula**: `cos(θ) = (A · B) / (||A|| × ||B||)`
**Range**: [-1, 1] (1 = identical, -1 = opposite)

### Euclidean Distance (L2)

Best for spatial data, geometric similarity:

```bash
# CLI
npx agentdb@latest query ./vectors.db "[0.1,0.2,...]" -m euclidean

# API
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  metric: 'euclidean',
  k: 10,
});
```

**Use Cases**:
- Image embeddings
- Spatial data
- Computer vision
- When vector magnitude matters

**Formula**: `d = √(Σ(ai - bi)²)`
**Range**: [0, ∞] (0 = identical, ∞ = very different)

### Dot Product

Best for pre-normalized vectors, fast computation:

```bash
# CLI
npx agentdb@latest query ./vectors.db "[0.1,0.2,...]" -m dot

# API
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  metric: 'dot',
  k: 10,
});
```

**Use Cases**:
- Pre-normalized embeddings
- Fast similarity computation
- When vectors are already unit-length

**Formula**: `dot = Σ(ai × bi)`
**Range**: [-∞, ∞] (higher = more similar)

### Custom Distance Metrics

```typescript
// Implement custom distance function
function customDistance(vec1: number[], vec2: number[]): number {
  // Weighted Euclidean distance
  const weights = [1.0, 2.0, 1.5, ...];
  let sum = 0;
  for (let i = 0; i < vec1.length; i++) {
    sum += weights[i] * Math.pow(vec1[i] - vec2[i], 2);
  }
  return Math.sqrt(sum);
}

// Use in search (requires custom implementation)
```

---

## Hybrid Search (Vector + Metadata)

### Basic Hybrid Search

Combine vector similarity with metadata filtering:

```typescript
// Store documents with metadata
await adapter.insertPattern({
  id: '',
  type: 'document',
  domain: 'research-papers',
  pattern_data: JSON.stringify({
    embedding: documentEmbedding,
    text: documentText,
    metadata: {
      author: 'Jane Smith',
      year: 2025,
      category: 'machine-learning',
      citations: 150,
    }
  }),
  confidence: 1.0,
  usage_count: 0,
  success_count: 0,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Hybrid search: vector similarity + metadata filters
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'research-papers',
  k: 20,
  filters: {
    year: { $gte: 2023 },          // Published 2023 or later
    category: 'machine-learning',   // ML papers only
    citations: { $gte: 50 },       // Highly cited
  },
});
```

### Advanced Filtering

```typescript
// Complex metadata queries
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'products',
  k: 50,
  filters: {
    price: { $gte: 10, $lte: 100 },      // Price range
    category: { $in: ['electronics', 'gadgets'] },  // Multiple categories
    rating: { $gte: 4.0 },                // High rated
    inStock: true,                        // Available
    tags: { $contains: 'wireless' },      // Has tag
  },
});
```

### Weighted Hybrid Search

Combine vector and metadata scores:

```typescript
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'content',
  k: 20,
  hybridWeights: {
    vectorSimilarity: 0.7,  // 70% weight on semantic similarity
    metadataScore: 0.3,     // 30% weight on metadata match
  },
  filters: {
    category: 'technology',
    recency: { $gte: Date.now() - 30 * 24 * 3600000 },  // Last 30 days
  },
});
```

---

## Multi-Database Management

### Multiple Databases

```typescript
// Separate databases for different domains
const knowledgeDB = await createAgentDBAdapter({
  dbPath: '.agentdb/knowledge.db',
});

const conversationDB = await createAgentDBAdapter({
  dbPath: '.agentdb/conversations.db',
});

const codeDB = await createAgentDBAdapter({
  dbPath: '.agentdb/code.db',
});

// Use appropriate database for each task
await knowledgeDB.insertPattern({ /* knowledge */ });
await conversationDB.insertPattern({ /* conversation */ });
await codeDB.insertPattern({ /* code */ });
```

### Database Sharding

```typescript
// Shard by domain for horizontal scaling
const shards = {
  'domain-a': await createAgentDBAdapter({ dbPath: '.agentdb/shard-a.db' }),
  'domain-b': await createAgentDBAdapter({ dbPath: '.agentdb/shard-b.db' }),
  'domain-c': await createAgentDBAdapter({ dbPath: '.agentdb/shard-c.db' }),
};

// Route queries to appropriate shard
function getDBForDomain(domain: string) {
  const shardKey = domain.split('-')[0];  // Extract shard key
  return shards[shardKey] || shards['domain-a'];
}

// Insert to correct shard
const db = getDBForDomain('domain-a-task');
await db.insertPattern({ /* ... */ });
```

---

## MMR (Maximal Marginal Relevance)

Retrieve diverse results to avoid redundancy:

```typescript
// Without MMR: Similar results may be redundant
const standardResults = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 10,
  useMMR: false,
});

// With MMR: Diverse, non-redundant results
const diverseResults = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 10,
  useMMR: true,
  mmrLambda: 0.5,  // Balance relevance (0) vs diversity (1)
});
```

**MMR Parameters**:
- `mmrLambda = 0`: Maximum relevance (may be redundant)
- `mmrLambda = 0.5`: Balanced (default)
- `mmrLambda = 1`: Maximum diversity (may be less relevant)

**Use Cases**:
- Search result diversification
- Recommendation systems
- Avoiding echo chambers
- Exploratory search

---

## Context Synthesis

Generate rich context from multiple memories:

```typescript
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'problem-solving',
  k: 10,
  synthesizeContext: true,  // Enable context synthesis
});

// ContextSynthesizer creates coherent narrative
console.log('Synthesized Context:', result.context);
// "Based on 10 similar problem-solving attempts, the most effective
//  approach involves: 1) analyzing root cause, 2) brainstorming solutions,
//  3) evaluating trade-offs, 4) implementing incrementally. Success rate: 85%"

console.log('Patterns:', result.patterns);
// Extracted common patterns across memories
```

---

## Production Patterns

### Connection Pooling

```typescript
// Singleton pattern for shared adapter
class AgentDBPool {
  private static instance: AgentDBAdapter;

  static async getInstance() {
    if (!this.instance) {
      this.instance = await createAgentDBAdapter({
        dbPath: '.agentdb/production.db',
        quantizationType: 'scalar',
        cacheSize: 2000,
      });
    }
    return this.instance;
  }
}

// Use in application
const db = await AgentDBPool.getInstance();
const results = await db.retrieveWithReasoning(queryEmbedding, { k: 10 });
```

### Error Handling

```typescript
async function safeRetrieve(queryEmbedding: number[], options: any) {
  try {
    const result = await adapter.retrieveWithReasoning(queryEmbedding, options);
    return result;
  } catch (error) {
    if (error.code === 'DIMENSION_MISMATCH') {
      console.error('Query embedding dimension mismatch');
      // Handle dimension error
    } else if (error.code === 'DATABASE_LOCKED') {
      // Retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 100));
      return safeRetrieve(queryEmbedding, options);
    }
    throw error;
  }
}
```

### Monitoring and Logging

```typescript
// Performance monitoring
const startTime = Date.now();
const result = await adapter.retrieveWithReasoning(queryEmbedding, { k: 10 });
const latency = Date.now() - startTime;

if (latency > 100) {
  console.warn('Slow query detected:', latency, 'ms');
}

// Log statistics
const stats = await adapter.getStats();
console.log('Database Stats:', {
  totalPatterns: stats.totalPatterns,
  dbSize: stats.dbSize,
  cacheHitRate: stats.cacheHitRate,
  avgSearchLatency: stats.avgSearchLatency,
});
```

---

## CLI Advanced Operations

### Database Import/Export

```bash
# Export with compression
npx agentdb@latest export ./vectors.db ./backup.json.gz --compress

# Import from backup
npx agentdb@latest import ./backup.json.gz --decompress

# Merge databases
npx agentdb@latest merge ./db1.sqlite ./db2.sqlite ./merged.sqlite
```

### Database Optimization

```bash
# Vacuum database (reclaim space)
sqlite3 .agentdb/vectors.db "VACUUM;"

# Analyze for query optimization
sqlite3 .agentdb/vectors.db "ANALYZE;"

# Rebuild indices
npx agentdb@latest reindex ./vectors.db
```

---

## Environment Variables

```bash
# AgentDB configuration
AGENTDB_PATH=.agentdb/reasoningbank.db
AGENTDB_ENABLED=true

# Performance tuning
AGENTDB_QUANTIZATION=binary     # binary|scalar|product|none
AGENTDB_CACHE_SIZE=2000
AGENTDB_HNSW_M=16
AGENTDB_HNSW_EF=100

# Learning plugins
AGENTDB_LEARNING=true

# Reasoning agents
AGENTDB_REASONING=true

# QUIC synchronization
AGENTDB_QUIC_SYNC=true
AGENTDB_QUIC_PORT=4433
AGENTDB_QUIC_PEERS=host1:4433,host2:4433
```

---

## Troubleshooting

### Issue: QUIC sync not working

```bash
# Check firewall allows UDP port 4433
sudo ufw allow 4433/udp

# Verify peers are reachable
ping host1

# Check QUIC logs
DEBUG=agentdb:quic node server.js
```

### Issue: Hybrid search returns no results

```typescript
// Relax filters
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 100,  // Increase k
  filters: {
    // Remove or relax filters
  },
});
```

### Issue: Memory consolidation too aggressive

```typescript
// Disable automatic optimization
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  optimizeMemory: false,  // Disable auto-consolidation
  k: 10,
});
```

---

## Learn More

- **QUIC Protocol**: docs/quic-synchronization.pdf
- **Hybrid Search**: docs/hybrid-search-guide.md
- **GitHub**: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- **Website**: https://agentdb.ruv.io

---

**Category**: Advanced / Distributed Systems
**Difficulty**: Advanced
**Estimated Time**: 45-60 minutes


## Sub-skill: agentdb-learning

# AgentDB Learning Plugins

## What This Skill Does

Provides access to 9 reinforcement learning algorithms via AgentDB's plugin system. Create, train, and deploy learning plugins for autonomous agents that improve through experience. Includes offline RL (Decision Transformer), value-based learning (Q-Learning), policy gradients (Actor-Critic), and advanced techniques.

**Performance**: Train models 10-100x faster with WASM-accelerated neural inference.

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow)
- Basic understanding of reinforcement learning (recommended)

---

## Quick Start with CLI

### Create Learning Plugin

```bash
# Interactive wizard
npx agentdb@latest create-plugin

# Use specific template
npx agentdb@latest create-plugin -t decision-transformer -n my-agent

# Preview without creating
npx agentdb@latest create-plugin -t q-learning --dry-run

# Custom output directory
npx agentdb@latest create-plugin -t actor-critic -o ./plugins
```

### List Available Templates

```bash
# Show all plugin templates
npx agentdb@latest list-templates

# Available templates:
# - decision-transformer (sequence modeling RL - recommended)
# - q-learning (value-based learning)
# - sarsa (on-policy TD learning)
# - actor-critic (policy gradient with baseline)
# - curiosity-driven (exploration-based)
```

### Manage Plugins

```bash
# List installed plugins
npx agentdb@latest list-plugins

# Get plugin information
npx agentdb@latest plugin-info my-agent

# Shows: algorithm, configuration, training status
```

---

## Quick Start with API

```typescript
import { createAgentDBAdapter } from 'agentic-flow/reasoningbank';

// Initialize with learning enabled
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/learning.db',
  enableLearning: true,       // Enable learning plugins
  enableReasoning: true,
  cacheSize: 1000,
});

// Store training experience
await adapter.insertPattern({
  id: '',
  type: 'experience',
  domain: 'game-playing',
  pattern_data: JSON.stringify({
    embedding: await computeEmbedding('state-action-reward'),
    pattern: {
      state: [0.1, 0.2, 0.3],
      action: 2,
      reward: 1.0,
      next_state: [0.15, 0.25, 0.35],
      done: false
    }
  }),
  confidence: 0.9,
  usage_count: 1,
  success_count: 1,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Train learning model
const metrics = await adapter.train({
  epochs: 50,
  batchSize: 32,
});

console.log('Training Loss:', metrics.loss);
console.log('Duration:', metrics.duration, 'ms');
```

---

## Available Learning Algorithms (9 Total)

### 1. Decision Transformer (Recommended)

**Type**: Offline Reinforcement Learning
**Best For**: Learning from logged experiences, imitation learning
**Strengths**: No online interaction needed, stable training

```bash
npx agentdb@latest create-plugin -t decision-transformer -n dt-agent
```

**Use Cases**:
- Learn from historical data
- Imitation learning from expert demonstrations
- Safe learning without environment interaction
- Sequence modeling tasks

**Configuration**:
```json
{
  "algorithm": "decision-transformer",
  "model_size": "base",
  "context_length": 20,
  "embed_dim": 128,
  "n_heads": 8,
  "n_layers": 6
}
```

### 2. Q-Learning

**Type**: Value-Based RL (Off-Policy)
**Best For**: Discrete action spaces, sample efficiency
**Strengths**: Proven, simple, works well for small/medium problems

```bash
npx agentdb@latest create-plugin -t q-learning -n q-agent
```

**Use Cases**:
- Grid worlds, board games
- Navigation tasks
- Resource allocation
- Discrete decision-making

**Configuration**:
```json
{
  "algorithm": "q-learning",
  "learning_rate": 0.001,
  "gamma": 0.99,
  "epsilon": 0.1,
  "epsilon_decay": 0.995
}
```

### 3. SARSA

**Type**: Value-Based RL (On-Policy)
**Best For**: Safe exploration, risk-sensitive tasks
**Strengths**: More conservative than Q-Learning, better for safety

```bash
npx agentdb@latest create-plugin -t sarsa -n sarsa-agent
```

**Use Cases**:
- Safety-critical applications
- Risk-sensitive decision-making
- Online learning with exploration

**Configuration**:
```json
{
  "algorithm": "sarsa",
  "learning_rate": 0.001,
  "gamma": 0.99,
  "epsilon": 0.1
}
```

### 4. Actor-Critic

**Type**: Policy Gradient with Value Baseline
**Best For**: Continuous actions, variance reduction
**Strengths**: Stable, works for continuous/discrete actions

```bash
npx agentdb@latest create-plugin -t actor-critic -n ac-agent
```

**Use Cases**:
- Continuous control (robotics, simulations)
- Complex action spaces
- Multi-agent coordination

**Configuration**:
```json
{
  "algorithm": "actor-critic",
  "actor_lr": 0.001,
  "critic_lr": 0.002,
  "gamma": 0.99,
  "entropy_coef": 0.01
}
```

### 5. Active Learning

**Type**: Query-Based Learning
**Best For**: Label-efficient learning, human-in-the-loop
**Strengths**: Minimizes labeling cost, focuses on uncertain samples

**Use Cases**:
- Human feedback incorporation
- Label-efficient training
- Uncertainty sampling
- Annotation cost reduction

### 6. Adversarial Training

**Type**: Robustness Enhancement
**Best For**: Safety, robustness to perturbations
**Strengths**: Improves model robustness, adversarial defense

**Use Cases**:
- Security applications
- Robust decision-making
- Adversarial defense
- Safety testing

### 7. Curriculum Learning

**Type**: Progressive Difficulty Training
**Best For**: Complex tasks, faster convergence
**Strengths**: Stable learning, faster convergence on hard tasks

**Use Cases**:
- Complex multi-stage tasks
- Hard exploration problems
- Skill composition
- Transfer learning

### 8. Federated Learning

**Type**: Distributed Learning
**Best For**: Privacy, distributed data
**Strengths**: Privacy-preserving, scalable

**Use Cases**:
- Multi-agent systems
- Privacy-sensitive data
- Distributed training
- Collaborative learning

### 9. Multi-Task Learning

**Type**: Transfer Learning
**Best For**: Related tasks, knowledge sharing
**Strengths**: Faster learning on new tasks, better generalization

**Use Cases**:
- Task families
- Transfer learning
- Domain adaptation
- Meta-learning

---

## Training Workflow

### 1. Collect Experiences

```typescript
// Store experiences during agent execution
for (let i = 0; i < numEpisodes; i++) {
  const episode = runEpisode();

  for (const step of episode.steps) {
    await adapter.insertPattern({
      id: '',
      type: 'experience',
      domain: 'task-domain',
      pattern_data: JSON.stringify({
        embedding: await computeEmbedding(JSON.stringify(step)),
        pattern: {
          state: step.state,
          action: step.action,
          reward: step.reward,
          next_state: step.next_state,
          done: step.done
        }
      }),
      confidence: step.reward > 0 ? 0.9 : 0.5,
      usage_count: 1,
      success_count: step.reward > 0 ? 1 : 0,
      created_at: Date.now(),
      last_used: Date.now(),
    });
  }
}
```

### 2. Train Model

```typescript
// Train on collected experiences
const trainingMetrics = await adapter.train({
  epochs: 100,
  batchSize: 64,
  learningRate: 0.001,
  validationSplit: 0.2,
});

console.log('Training Metrics:', trainingMetrics);
// {
//   loss: 0.023,
//   valLoss: 0.028,
//   duration: 1523,
//   epochs: 100
// }
```

### 3. Evaluate Performance

```typescript
// Retrieve similar successful experiences
const testQuery = await computeEmbedding(JSON.stringify(testState));
const result = await adapter.retrieveWithReasoning(testQuery, {
  domain: 'task-domain',
  k: 10,
  synthesizeContext: true,
});

// Evaluate action quality
const suggestedAction = result.memories[0].pattern.action;
const confidence = result.memories[0].similarity;

console.log('Suggested Action:', suggestedAction);
console.log('Confidence:', confidence);
```

---

## Advanced Training Techniques

### Experience Replay

```typescript
// Store experiences in buffer
const replayBuffer = [];

// Sample random batch for training
const batch = sampleRandomBatch(replayBuffer, batchSize: 32);

// Train on batch
await adapter.train({
  data: batch,
  epochs: 1,
  batchSize: 32,
});
```

### Prioritized Experience Replay

```typescript
// Store experiences with priority (TD error)
await adapter.insertPattern({
  // ... standard fields
  confidence: tdError,  // Use TD error as confidence/priority
  // ...
});

// Retrieve high-priority experiences
const highPriority = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'task-domain',
  k: 32,
  minConfidence: 0.7,  // Only high TD-error experiences
});
```

### Multi-Agent Training

```typescript
// Collect experiences from multiple agents
for (const agent of agents) {
  const experience = await agent.step();

  await adapter.insertPattern({
    // ... store experience with agent ID
    domain: `multi-agent/${agent.id}`,
  });
}

// Train shared model
await adapter.train({
  epochs: 50,
  batchSize: 64,
});
```

---

## Performance Optimization

### Batch Training

```typescript
// Collect batch of experiences
const experiences = collectBatch(size: 1000);

// Batch insert (500x faster)
for (const exp of experiences) {
  await adapter.insertPattern({ /* ... */ });
}

// Train on batch
await adapter.train({
  epochs: 10,
  batchSize: 128,  // Larger batch for efficiency
});
```

### Incremental Learning

```typescript
// Train incrementally as new data arrives
setInterval(async () => {
  const newExperiences = getNewExperiences();

  if (newExperiences.length > 100) {
    await adapter.train({
      epochs: 5,
      batchSize: 32,
    });
  }
}, 60000);  // Every minute
```

---

## Integration with Reasoning Agents

Combine learning with reasoning for better performance:

```typescript
// Train learning model
await adapter.train({ epochs: 50, batchSize: 32 });

// Use reasoning agents for inference
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'decision-making',
  k: 10,
  useMMR: true,              // Diverse experiences
  synthesizeContext: true,    // Rich context
  optimizeMemory: true,       // Consolidate patterns
});

// Make decision based on learned experiences + reasoning
const decision = result.context.suggestedAction;
const confidence = result.memories[0].similarity;
```

---

## CLI Operations

```bash
# Create plugin
npx agentdb@latest create-plugin -t decision-transformer -n my-plugin

# List plugins
npx agentdb@latest list-plugins

# Get plugin info
npx agentdb@latest plugin-info my-plugin

# List templates
npx agentdb@latest list-templates
```

---

## Troubleshooting

### Issue: Training not converging
```typescript
// Reduce learning rate
await adapter.train({
  epochs: 100,
  batchSize: 32,
  learningRate: 0.0001,  // Lower learning rate
});
```

### Issue: Overfitting
```typescript
// Use validation split
await adapter.train({
  epochs: 50,
  batchSize: 64,
  validationSplit: 0.2,  // 20% validation
});

// Enable memory optimization
await adapter.retrieveWithReasoning(queryEmbedding, {
  optimizeMemory: true,  // Consolidate, reduce overfitting
});
```

### Issue: Slow training
```bash
# Enable quantization for faster inference
# Use binary quantization (32x faster)
```

---

## Learn More

- **Algorithm Papers**: See docs/algorithms/ for detailed papers
- **GitHub**: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- **MCP Integration**: `npx agentdb@latest mcp`
- **Website**: https://agentdb.ruv.io

---

**Category**: Machine Learning / Reinforcement Learning
**Difficulty**: Intermediate to Advanced
**Estimated Time**: 30-60 minutes


## Sub-skill: agentdb-memory-patterns

# AgentDB Memory Patterns

## What This Skill Does

Provides memory management patterns for AI agents using AgentDB's persistent storage and ReasoningBank integration. Enables agents to remember conversations, learn from interactions, and maintain context across sessions.

**Performance**: 150x-12,500x faster than traditional solutions with 100% backward compatibility.

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow or standalone)
- Understanding of agent architectures

## Quick Start with CLI

### Initialize AgentDB

```bash
# Initialize vector database
npx agentdb@latest init ./agents.db

# Or with custom dimensions
npx agentdb@latest init ./agents.db --dimension 768

# Use preset configurations
npx agentdb@latest init ./agents.db --preset large

# In-memory database for testing
npx agentdb@latest init ./memory.db --in-memory
```

### Start MCP Server for Claude Code

```bash
# Start MCP server (integrates with Claude Code)
npx agentdb@latest mcp

# Add to Claude Code (one-time setup)
claude mcp add agentdb npx agentdb@latest mcp
```

### Create Learning Plugin

```bash
# Interactive plugin wizard
npx agentdb@latest create-plugin

# Use template directly
npx agentdb@latest create-plugin -t decision-transformer -n my-agent

# Available templates:
# - decision-transformer (sequence modeling RL)
# - q-learning (value-based learning)
# - sarsa (on-policy TD learning)
# - actor-critic (policy gradient)
# - curiosity-driven (exploration-based)
```

## Quick Start with API

```typescript
import { createAgentDBAdapter } from 'agentic-flow/reasoningbank';

// Initialize with default configuration
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/reasoningbank.db',
  enableLearning: true,      // Enable learning plugins
  enableReasoning: true,      // Enable reasoning agents
  quantizationType: 'scalar', // binary | scalar | product | none
  cacheSize: 1000,            // In-memory cache
});

// Store interaction memory
const patternId = await adapter.insertPattern({
  id: '',
  type: 'pattern',
  domain: 'conversation',
  pattern_data: JSON.stringify({
    embedding: await computeEmbedding('What is the capital of France?'),
    pattern: {
      user: 'What is the capital of France?',
      assistant: 'The capital of France is Paris.',
      timestamp: Date.now()
    }
  }),
  confidence: 0.95,
  usage_count: 1,
  success_count: 1,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Retrieve context with reasoning
const context = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'conversation',
  k: 10,
  useMMR: true,              // Maximal Marginal Relevance
  synthesizeContext: true,    // Generate rich context
});
```

## Memory Patterns

### 1. Session Memory
```typescript
class SessionMemory {
  async storeMessage(role: string, content: string) {
    return await db.storeMemory({
      sessionId: this.sessionId,
      role,
      content,
      timestamp: Date.now()
    });
  }

  async getSessionHistory(limit = 20) {
    return await db.query({
      filters: { sessionId: this.sessionId },
      orderBy: 'timestamp',
      limit
    });
  }
}
```

### 2. Long-Term Memory
```typescript
// Store important facts
await db.storeFact({
  category: 'user_preference',
  key: 'language',
  value: 'English',
  confidence: 1.0,
  source: 'explicit'
});

// Retrieve facts
const prefs = await db.getFacts({
  category: 'user_preference'
});
```

### 3. Pattern Learning
```typescript
// Learn from successful interactions
await db.storePattern({
  trigger: 'user_asks_time',
  response: 'provide_formatted_time',
  success: true,
  context: { timezone: 'UTC' }
});

// Apply learned patterns
const pattern = await db.matchPattern(currentContext);
```

## Advanced Patterns

### Hierarchical Memory
```typescript
// Organize memory in hierarchy
await memory.organize({
  immediate: recentMessages,    // Last 10 messages
  shortTerm: sessionContext,    // Current session
  longTerm: importantFacts,     // Persistent facts
  semantic: embeddedKnowledge   // Vector search
});
```

### Memory Consolidation
```typescript
// Periodically consolidate memories
await memory.consolidate({
  strategy: 'importance',       // Keep important memories
  maxSize: 10000,              // Size limit
  minScore: 0.5                // Relevance threshold
});
```

## CLI Operations

### Query Database

```bash
# Query with vector embedding
npx agentdb@latest query ./agents.db "[0.1,0.2,0.3,...]"

# Top-k results
npx agentdb@latest query ./agents.db "[0.1,0.2,0.3]" -k 10

# With similarity threshold
npx agentdb@latest query ./agents.db "0.1 0.2 0.3" -t 0.75

# JSON output
npx agentdb@latest query ./agents.db "[...]" -f json
```

### Import/Export Data

```bash
# Export vectors to file
npx agentdb@latest export ./agents.db ./backup.json

# Import vectors from file
npx agentdb@latest import ./backup.json

# Get database statistics
npx agentdb@latest stats ./agents.db
```

### Performance Benchmarks

```bash
# Run performance benchmarks
npx agentdb@latest benchmark

# Results show:
# - Pattern Search: 150x faster (100µs vs 15ms)
# - Batch Insert: 500x faster (2ms vs 1s)
# - Large-scale Query: 12,500x faster (8ms vs 100s)
```

## Integration with ReasoningBank

```typescript
import { createAgentDBAdapter, migrateToAgentDB } from 'agentic-flow/reasoningbank';

// Migrate from legacy ReasoningBank
const result = await migrateToAgentDB(
  '.swarm/memory.db',           // Source (legacy)
  '.agentdb/reasoningbank.db'   // Destination (AgentDB)
);

console.log(`✅ Migrated ${result.patternsMigrated} patterns`);

// Train learning model
const adapter = await createAgentDBAdapter({
  enableLearning: true,
});

await adapter.train({
  epochs: 50,
  batchSize: 32,
});

// Get optimal strategy with reasoning
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'task-planning',
  synthesizeContext: true,
  optimizeMemory: true,
});
```

## Learning Plugins

### Available Algorithms (9 Total)

1. **Decision Transformer** - Sequence modeling RL (recommended)
2. **Q-Learning** - Value-based learning
3. **SARSA** - On-policy TD learning
4. **Actor-Critic** - Policy gradient with baseline
5. **Active Learning** - Query selection
6. **Adversarial Training** - Robustness
7. **Curriculum Learning** - Progressive difficulty
8. **Federated Learning** - Distributed learning
9. **Multi-task Learning** - Transfer learning

### List and Manage Plugins

```bash
# List available plugins
npx agentdb@latest list-plugins

# List plugin templates
npx agentdb@latest list-templates

# Get plugin info
npx agentdb@latest plugin-info <name>
```

## Reasoning Agents (4 Modules)

1. **PatternMatcher** - Find similar patterns with HNSW indexing
2. **ContextSynthesizer** - Generate rich context from multiple sources
3. **MemoryOptimizer** - Consolidate similar patterns, prune low-quality
4. **ExperienceCurator** - Quality-based experience filtering

## Best Practices

1. **Enable quantization**: Use scalar/binary for 4-32x memory reduction
2. **Use caching**: 1000 pattern cache for <1ms retrieval
3. **Batch operations**: 500x faster than individual inserts
4. **Train regularly**: Update learning models with new experiences
5. **Enable reasoning**: Automatic context synthesis and optimization
6. **Monitor metrics**: Use `stats` command to track performance

## Troubleshooting

### Issue: Memory growing too large
```bash
# Check database size
npx agentdb@latest stats ./agents.db

# Enable quantization
# Use 'binary' (32x smaller) or 'scalar' (4x smaller)
```

### Issue: Slow search performance
```bash
# Enable HNSW indexing and caching
# Results: <100µs search time
```

### Issue: Migration from legacy ReasoningBank
```bash
# Automatic migration with validation
npx agentdb@latest migrate --source .swarm/memory.db
```

## Performance Characteristics

- **Vector Search**: <100µs (HNSW indexing)
- **Pattern Retrieval**: <1ms (with cache)
- **Batch Insert**: 2ms for 100 patterns
- **Memory Efficiency**: 4-32x reduction with quantization
- **Backward Compatibility**: 100% compatible with ReasoningBank API

## Learn More

- GitHub: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- Documentation: node_modules/agentic-flow/docs/AGENTDB_INTEGRATION.md
- MCP Integration: `npx agentdb@latest mcp` for Claude Code
- Website: https://agentdb.ruv.io


## Sub-skill: agentdb-optimization

# AgentDB Performance Optimization

## What This Skill Does

Provides comprehensive performance optimization techniques for AgentDB vector databases. Achieve 150x-12,500x performance improvements through quantization, HNSW indexing, caching strategies, and batch operations. Reduce memory usage by 4-32x while maintaining accuracy.

**Performance**: <100µs vector search, <1ms pattern retrieval, 2ms batch insert for 100 vectors.

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow)
- Existing AgentDB database or application

---

## Quick Start

### Run Performance Benchmarks

```bash
# Comprehensive performance benchmarking
npx agentdb@latest benchmark

# Results show:
# ✅ Pattern Search: 150x faster (100µs vs 15ms)
# ✅ Batch Insert: 500x faster (2ms vs 1s for 100 vectors)
# ✅ Large-scale Query: 12,500x faster (8ms vs 100s at 1M vectors)
# ✅ Memory Efficiency: 4-32x reduction with quantization
```

### Enable Optimizations

```typescript
import { createAgentDBAdapter } from 'agentic-flow/reasoningbank';

// Optimized configuration
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/optimized.db',
  quantizationType: 'binary',   // 32x memory reduction
  cacheSize: 1000,               // In-memory cache
  enableLearning: true,
  enableReasoning: true,
});
```

---

## Quantization Strategies

### 1. Binary Quantization (32x Reduction)

**Best For**: Large-scale deployments (1M+ vectors), memory-constrained environments
**Trade-off**: ~2-5% accuracy loss, 32x memory reduction, 10x faster

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'binary',
  // 768-dim float32 (3072 bytes) → 96 bytes binary
  // 1M vectors: 3GB → 96MB
});
```

**Use Cases**:
- Mobile/edge deployment
- Large-scale vector storage (millions of vectors)
- Real-time search with memory constraints

**Performance**:
- Memory: 32x smaller
- Search Speed: 10x faster (bit operations)
- Accuracy: 95-98% of original

### 2. Scalar Quantization (4x Reduction)

**Best For**: Balanced performance/accuracy, moderate datasets
**Trade-off**: ~1-2% accuracy loss, 4x memory reduction, 3x faster

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'scalar',
  // 768-dim float32 (3072 bytes) → 768 bytes (uint8)
  // 1M vectors: 3GB → 768MB
});
```

**Use Cases**:
- Production applications requiring high accuracy
- Medium-scale deployments (10K-1M vectors)
- General-purpose optimization

**Performance**:
- Memory: 4x smaller
- Search Speed: 3x faster
- Accuracy: 98-99% of original

### 3. Product Quantization (8-16x Reduction)

**Best For**: High-dimensional vectors, balanced compression
**Trade-off**: ~3-7% accuracy loss, 8-16x memory reduction, 5x faster

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'product',
  // 768-dim float32 (3072 bytes) → 48-96 bytes
  // 1M vectors: 3GB → 192MB
});
```

**Use Cases**:
- High-dimensional embeddings (>512 dims)
- Image/video embeddings
- Large-scale similarity search

**Performance**:
- Memory: 8-16x smaller
- Search Speed: 5x faster
- Accuracy: 93-97% of original

### 4. No Quantization (Full Precision)

**Best For**: Maximum accuracy, small datasets
**Trade-off**: No accuracy loss, full memory usage

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'none',
  // Full float32 precision
});
```

---

## HNSW Indexing

**Hierarchical Navigable Small World** - O(log n) search complexity

### Automatic HNSW

AgentDB automatically builds HNSW indices:

```typescript
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/vectors.db',
  // HNSW automatically enabled
});

// Search with HNSW (100µs vs 15ms linear scan)
const results = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 10,
});
```

### HNSW Parameters

```typescript
// Advanced HNSW configuration
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/vectors.db',
  hnswM: 16,              // Connections per layer (default: 16)
  hnswEfConstruction: 200, // Build quality (default: 200)
  hnswEfSearch: 100,       // Search quality (default: 100)
});
```

**Parameter Tuning**:
- **M** (connections): Higher = better recall, more memory
  - Small datasets (<10K): M = 8
  - Medium datasets (10K-100K): M = 16
  - Large datasets (>100K): M = 32
- **efConstruction**: Higher = better index quality, slower build
  - Fast build: 100
  - Balanced: 200 (default)
  - High quality: 400
- **efSearch**: Higher = better recall, slower search
  - Fast search: 50
  - Balanced: 100 (default)
  - High recall: 200

---

## Caching Strategies

### In-Memory Pattern Cache

```typescript
const adapter = await createAgentDBAdapter({
  cacheSize: 1000,  // Cache 1000 most-used patterns
});

// First retrieval: ~2ms (database)
// Subsequent: <1ms (cache hit)
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 10,
});
```

**Cache Tuning**:
- Small applications: 100-500 patterns
- Medium applications: 500-2000 patterns
- Large applications: 2000-5000 patterns

### LRU Cache Behavior

```typescript
// Cache automatically evicts least-recently-used patterns
// Most frequently accessed patterns stay in cache

// Monitor cache performance
const stats = await adapter.getStats();
console.log('Cache Hit Rate:', stats.cacheHitRate);
// Aim for >80% hit rate
```

---

## Batch Operations

### Batch Insert (500x Faster)

```typescript
// ❌ SLOW: Individual inserts
for (const doc of documents) {
  await adapter.insertPattern({ /* ... */ });  // 1s for 100 docs
}

// ✅ FAST: Batch insert
const patterns = documents.map(doc => ({
  id: '',
  type: 'document',
  domain: 'knowledge',
  pattern_data: JSON.stringify({
    embedding: doc.embedding,
    text: doc.text,
  }),
  confidence: 1.0,
  usage_count: 0,
  success_count: 0,
  created_at: Date.now(),
  last_used: Date.now(),
}));

// Insert all at once (2ms for 100 docs)
for (const pattern of patterns) {
  await adapter.insertPattern(pattern);
}
```

### Batch Retrieval

```typescript
// Retrieve multiple queries efficiently
const queries = [queryEmbedding1, queryEmbedding2, queryEmbedding3];

// Parallel retrieval
const results = await Promise.all(
  queries.map(q => adapter.retrieveWithReasoning(q, { k: 5 }))
);
```

---

## Memory Optimization

### Automatic Consolidation

```typescript
// Enable automatic pattern consolidation
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'documents',
  optimizeMemory: true,  // Consolidate similar patterns
  k: 10,
});

console.log('Optimizations:', result.optimizations);
// {
//   consolidated: 15,  // Merged 15 similar patterns
//   pruned: 3,         // Removed 3 low-quality patterns
//   improved_quality: 0.12  // 12% quality improvement
// }
```

### Manual Optimization

```typescript
// Manually trigger optimization
await adapter.optimize();

// Get statistics
const stats = await adapter.getStats();
console.log('Before:', stats.totalPatterns);
console.log('After:', stats.totalPatterns);  // Reduced by ~10-30%
```

### Pruning Strategies

```typescript
// Prune low-confidence patterns
await adapter.prune({
  minConfidence: 0.5,     // Remove confidence < 0.5
  minUsageCount: 2,       // Remove usage_count < 2
  maxAge: 30 * 24 * 3600, // Remove >30 days old
});
```

---

## Performance Monitoring

### Database Statistics

```bash
# Get comprehensive stats
npx agentdb@latest stats .agentdb/vectors.db

# Output:
# Total Patterns: 125,430
# Database Size: 47.2 MB (with binary quantization)
# Avg Confidence: 0.87
# Domains: 15
# Cache Hit Rate: 84%
# Index Type: HNSW
```

### Runtime Metrics

```typescript
const stats = await adapter.getStats();

console.log('Performance Metrics:');
console.log('Total Patterns:', stats.totalPatterns);
console.log('Database Size:', stats.dbSize);
console.log('Avg Confidence:', stats.avgConfidence);
console.log('Cache Hit Rate:', stats.cacheHitRate);
console.log('Search Latency (avg):', stats.avgSearchLatency);
console.log('Insert Latency (avg):', stats.avgInsertLatency);
```

---

## Optimization Recipes

### Recipe 1: Maximum Speed (Sacrifice Accuracy)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'binary',  // 32x memory reduction
  cacheSize: 5000,             // Large cache
  hnswM: 8,                    // Fewer connections = faster
  hnswEfSearch: 50,            // Low search quality = faster
});

// Expected: <50µs search, 90-95% accuracy
```

### Recipe 2: Balanced Performance

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'scalar',  // 4x memory reduction
  cacheSize: 1000,             // Standard cache
  hnswM: 16,                   // Balanced connections
  hnswEfSearch: 100,           // Balanced quality
});

// Expected: <100µs search, 98-99% accuracy
```

### Recipe 3: Maximum Accuracy

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'none',    // No quantization
  cacheSize: 2000,             // Large cache
  hnswM: 32,                   // Many connections
  hnswEfSearch: 200,           // High search quality
});

// Expected: <200µs search, 100% accuracy
```

### Recipe 4: Memory-Constrained (Mobile/Edge)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'binary',  // 32x memory reduction
  cacheSize: 100,              // Small cache
  hnswM: 8,                    // Minimal connections
});

// Expected: <100µs search, ~10MB for 100K vectors
```

---

## Scaling Strategies

### Small Scale (<10K vectors)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'none',    // Full precision
  cacheSize: 500,
  hnswM: 8,
});
```

### Medium Scale (10K-100K vectors)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'scalar',  // 4x reduction
  cacheSize: 1000,
  hnswM: 16,
});
```

### Large Scale (100K-1M vectors)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'binary',  // 32x reduction
  cacheSize: 2000,
  hnswM: 32,
});
```

### Massive Scale (>1M vectors)

```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'product',  // 8-16x reduction
  cacheSize: 5000,
  hnswM: 48,
  hnswEfConstruction: 400,
});
```

---

## Troubleshooting

### Issue: High memory usage

```bash
# Check database size
npx agentdb@latest stats .agentdb/vectors.db

# Enable quantization
# Use 'binary' for 32x reduction
```

### Issue: Slow search performance

```typescript
// Increase cache size
const adapter = await createAgentDBAdapter({
  cacheSize: 2000,  // Increase from 1000
});

// Reduce search quality (faster)
const result = await adapter.retrieveWithReasoning(queryEmbedding, {
  k: 5,  // Reduce from 10
});
```

### Issue: Low accuracy

```typescript
// Disable or use lighter quantization
const adapter = await createAgentDBAdapter({
  quantizationType: 'scalar',  // Instead of 'binary'
  hnswEfSearch: 200,           // Higher search quality
});
```

---

## Performance Benchmarks

**Test System**: AMD Ryzen 9 5950X, 64GB RAM

| Operation | Vector Count | No Optimization | Optimized | Improvement |
|-----------|-------------|-----------------|-----------|-------------|
| Search | 10K | 15ms | 100µs | 150x |
| Search | 100K | 150ms | 120µs | 1,250x |
| Search | 1M | 100s | 8ms | 12,500x |
| Batch Insert (100) | - | 1s | 2ms | 500x |
| Memory Usage | 1M | 3GB | 96MB | 32x (binary) |

---

## Learn More

- **Quantization Paper**: docs/quantization-techniques.pdf
- **HNSW Algorithm**: docs/hnsw-index.pdf
- **GitHub**: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- **Website**: https://agentdb.ruv.io

---

**Category**: Performance / Optimization
**Difficulty**: Intermediate
**Estimated Time**: 20-30 minutes


## Sub-skill: agentdb-query

# AgentDB Query

Query and manage AgentDB through the controller bridge. AgentDB exposes 15 `agentdb_*` MCP tools; this skill enumerates the standard usage path.

## When to use

When you need to store, retrieve, or search knowledge across agent sessions. AgentDB provides hierarchical storage, causal knowledge graphs, semantic routing, and context synthesis.

## Steps

1. **Check health** — `mcp__claude-flow__agentdb_health`. Sanity-check `available: true`.
2. **Start session** — `mcp__claude-flow__agentdb_session-start` if not already active.
3. **Store knowledge** — `mcp__claude-flow__agentdb_hierarchical-store` for structured tier-keyed data (tiers: `working|episodic|semantic`).
4. **Recall knowledge** — `mcp__claude-flow__agentdb_hierarchical-recall` with a query.
5. **Search patterns** — `mcp__claude-flow__agentdb_pattern-search` for learned patterns (ReasoningBank-routed).
6. **Synthesize context** — `mcp__claude-flow__agentdb_context-synthesize` to combine multiple memories.
7. **Build causal graph** — `mcp__claude-flow__agentdb_causal-edge` to link related knowledge.

## Available controller groups

Call `mcp__claude-flow__agentdb_controllers` to list the runtime registry. Functional categories surfaced via the 15 MCP tools:

- **Hierarchical** — `agentdb_hierarchical-store`, `_recall` (tier-routed)
- **Pattern** — `agentdb_pattern-store`, `_search` (ReasoningBank-routed)
- **Semantic** — `agentdb_semantic-route`, `_context-synthesize`
- **Causal** — `agentdb_causal-edge` (graph-node backend with bridge fallback)
- **Lifecycle** — `agentdb_health`, `_controllers`, `_session-start`, `_session-end`
- **Bulk** — `agentdb_batch` (≤500 entries), `_consolidate`
- **Quality** — `agentdb_feedback`

## Important: namespace handling

Namespace strings apply to `memory_*` and `embeddings_search` only. The `agentdb_hierarchical-*`, `agentdb_pattern-*`, and `agentdb_causal-edge` tools route by **tier** or **controller**, not namespace. Don't pass `namespace: 'foo'` to those tools — it will be silently ignored. See plugin README "Namespace convention".

## Operational fallbacks (branch on these)

- `controller: 'memory-store-fallback'` — pattern persisted via `memory_store --namespace pattern`. NOT a failure.
- `_graphNodeBackend: true` — causal-edge handled by `@ruvector/graph-node`.
- `success: false, error: '...Use memory_store/memory_search instead.'` — bridge unavailable; switch to `memory_*` tools per the README replacement table.

## CLI alternative

```bash
npx @claude-flow/cli@latest memory search --query "your query" --namespace patterns
npx @claude-flow/cli@latest memory store --key "key" --value "value" --namespace patterns
npx @claude-flow/cli@latest memory list --namespace patterns
```


## Sub-skill: agentdb-vector-search

# AgentDB Vector Search

## What This Skill Does

Implements vector-based semantic search using AgentDB's high-performance vector database with **150x-12,500x faster** operations than traditional solutions. Features HNSW indexing, quantization, and sub-millisecond search (<100µs).

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow or standalone)
- OpenAI API key (for embeddings) or custom embedding model

## Quick Start with CLI

### Initialize Vector Database

```bash
# Initialize with default dimensions (1536 for OpenAI ada-002)
npx agentdb@latest init ./vectors.db

# Custom dimensions for different embedding models
npx agentdb@latest init ./vectors.db --dimension 768  # sentence-transformers
npx agentdb@latest init ./vectors.db --dimension 384  # all-MiniLM-L6-v2

# Use preset configurations
npx agentdb@latest init ./vectors.db --preset small   # <10K vectors
npx agentdb@latest init ./vectors.db --preset medium  # 10K-100K vectors
npx agentdb@latest init ./vectors.db --preset large   # >100K vectors

# In-memory database for testing
npx agentdb@latest init ./vectors.db --in-memory
```

### Query Vector Database

```bash
# Basic similarity search
npx agentdb@latest query ./vectors.db "[0.1,0.2,0.3,...]"

# Top-k results
npx agentdb@latest query ./vectors.db "[0.1,0.2,0.3]" -k 10

# With similarity threshold (cosine similarity)
npx agentdb@latest query ./vectors.db "0.1 0.2 0.3" -t 0.75 -m cosine

# Different distance metrics
npx agentdb@latest query ./vectors.db "[...]" -m euclidean  # L2 distance
npx agentdb@latest query ./vectors.db "[...]" -m dot        # Dot product

# JSON output for automation
npx agentdb@latest query ./vectors.db "[...]" -f json -k 5

# Verbose output with distances
npx agentdb@latest query ./vectors.db "[...]" -v
```

### Import/Export Vectors

```bash
# Export vectors to JSON
npx agentdb@latest export ./vectors.db ./backup.json

# Import vectors from JSON
npx agentdb@latest import ./backup.json

# Get database statistics
npx agentdb@latest stats ./vectors.db
```

## Quick Start with API

```typescript
import { createAgentDBAdapter, computeEmbedding } from 'agentic-flow/reasoningbank';

// Initialize with vector search optimizations
const adapter = await createAgentDBAdapter({
  dbPath: '.agentdb/vectors.db',
  enableLearning: false,       // Vector search only
  enableReasoning: true,       // Enable semantic matching
  quantizationType: 'binary',  // 32x memory reduction
  cacheSize: 1000,             // Fast retrieval
});

// Store document with embedding
const text = "The quantum computer achieved 100 qubits";
const embedding = await computeEmbedding(text);

await adapter.insertPattern({
  id: '',
  type: 'document',
  domain: 'technology',
  pattern_data: JSON.stringify({
    embedding,
    text,
    metadata: { category: "quantum", date: "2025-01-15" }
  }),
  confidence: 1.0,
  usage_count: 0,
  success_count: 0,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Semantic search with MMR (Maximal Marginal Relevance)
const queryEmbedding = await computeEmbedding("quantum computing advances");
const results = await adapter.retrieveWithReasoning(queryEmbedding, {
  domain: 'technology',
  k: 10,
  useMMR: true,              // Diverse results
  synthesizeContext: true,    // Rich context
});
```

## Core Features

### 1. Vector Storage
```typescript
// Store with automatic embedding
await db.storeWithEmbedding({
  content: "Your document text",
  metadata: { source: "docs", page: 42 }
});
```

### 2. Similarity Search
```typescript
// Find similar documents
const similar = await db.findSimilar("quantum computing", {
  limit: 5,
  minScore: 0.75
});
```

### 3. Hybrid Search (Vector + Metadata)
```typescript
// Combine vector similarity with metadata filtering
const results = await db.hybridSearch({
  query: "machine learning models",
  filters: {
    category: "research",
    date: { $gte: "2024-01-01" }
  },
  limit: 20
});
```

## Advanced Usage

### RAG (Retrieval Augmented Generation)
```typescript
// Build RAG pipeline
async function ragQuery(question: string) {
  // 1. Get relevant context
  const context = await db.searchSimilar(
    await embed(question),
    { limit: 5, threshold: 0.7 }
  );

  // 2. Generate answer with context
  const prompt = `Context: ${context.map(c => c.text).join('\n')}
Question: ${question}`;

  return await llm.generate(prompt);
}
```

### Batch Operations
```typescript
// Efficient batch storage
await db.batchStore(documents.map(doc => ({
  text: doc.content,
  embedding: doc.vector,
  metadata: doc.meta
})));
```

## MCP Server Integration

```bash
# Start AgentDB MCP server for Claude Code
npx agentdb@latest mcp

# Add to Claude Code (one-time setup)
claude mcp add agentdb npx agentdb@latest mcp

# Now use MCP tools in Claude Code:
# - agentdb_query: Semantic vector search
# - agentdb_store: Store documents with embeddings
# - agentdb_stats: Database statistics
```

## Performance Benchmarks

```bash
# Run comprehensive benchmarks
npx agentdb@latest benchmark

# Results:
# ✅ Pattern Search: 150x faster (100µs vs 15ms)
# ✅ Batch Insert: 500x faster (2ms vs 1s for 100 vectors)
# ✅ Large-scale Query: 12,500x faster (8ms vs 100s at 1M vectors)
# ✅ Memory Efficiency: 4-32x reduction with quantization
```

## Quantization Options

AgentDB provides multiple quantization strategies for memory efficiency:

### Binary Quantization (32x reduction)
```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'binary',  // 768-dim → 96 bytes
});
```

### Scalar Quantization (4x reduction)
```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'scalar',  // 768-dim → 768 bytes
});
```

### Product Quantization (8-16x reduction)
```typescript
const adapter = await createAgentDBAdapter({
  quantizationType: 'product',  // 768-dim → 48-96 bytes
});
```

## Distance Metrics

```bash
# Cosine similarity (default, best for most use cases)
npx agentdb@latest query ./db.sqlite "[...]" -m cosine

# Euclidean distance (L2 norm)
npx agentdb@latest query ./db.sqlite "[...]" -m euclidean

# Dot product (for normalized vectors)
npx agentdb@latest query ./db.sqlite "[...]" -m dot
```

## Advanced Features

### HNSW Indexing
- **O(log n) search complexity**
- **Sub-millisecond retrieval** (<100µs)
- **Automatic index building**

### Caching
- **1000 pattern in-memory cache**
- **<1ms pattern retrieval**
- **Automatic cache invalidation**

### MMR (Maximal Marginal Relevance)
- **Diverse result sets**
- **Avoid redundancy**
- **Balance relevance and diversity**

## Performance Tips

1. **Enable HNSW indexing**: Automatic with AgentDB, 10-100x faster
2. **Use quantization**: Binary (32x), Scalar (4x), Product (8-16x) memory reduction
3. **Batch operations**: 500x faster for bulk inserts
4. **Match dimensions**: 1536 (OpenAI), 768 (sentence-transformers), 384 (MiniLM)
5. **Similarity threshold**: Start at 0.7 for quality, adjust based on use case
6. **Enable caching**: 1000 pattern cache for frequent queries

## Troubleshooting

### Issue: Slow search performance
```bash
# Check if HNSW indexing is enabled (automatic)
npx agentdb@latest stats ./vectors.db

# Expected: <100µs search time
```

### Issue: High memory usage
```bash
# Enable binary quantization (32x reduction)
# Use in adapter: quantizationType: 'binary'
```

### Issue: Poor relevance
```bash
# Adjust similarity threshold
npx agentdb@latest query ./db.sqlite "[...]" -t 0.8  # Higher threshold

# Or use MMR for diverse results
# Use in adapter: useMMR: true
```

### Issue: Wrong dimensions
```bash
# Check embedding model dimensions:
# - OpenAI ada-002: 1536
# - sentence-transformers: 768
# - all-MiniLM-L6-v2: 384

npx agentdb@latest init ./db.sqlite --dimension 768
```

## Database Statistics

```bash
# Get comprehensive stats
npx agentdb@latest stats ./vectors.db

# Shows:
# - Total patterns/vectors
# - Database size
# - Average confidence
# - Domains distribution
# - Index status
```

## Performance Characteristics

- **Vector Search**: <100µs (HNSW indexing)
- **Pattern Retrieval**: <1ms (with cache)
- **Batch Insert**: 2ms for 100 vectors
- **Memory Efficiency**: 4-32x reduction with quantization
- **Scalability**: Handles 1M+ vectors efficiently
- **Latency**: Sub-millisecond for most operations

## Learn More

- GitHub: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- Documentation: node_modules/agentic-flow/docs/AGENTDB_INTEGRATION.md
- MCP Integration: `npx agentdb@latest mcp` for Claude Code
- Website: https://agentdb.ruv.io
- CLI Help: `npx agentdb@latest --help`
- Command Help: `npx agentdb@latest help <command>`


## Sub-skill: reasoningbank-agentdb

# ReasoningBank with AgentDB

## What This Skill Does

Provides ReasoningBank adaptive learning patterns using AgentDB's high-performance backend (150x-12,500x faster). Enables agents to learn from experiences, judge outcomes, distill memories, and improve decision-making over time with 100% backward compatibility.

**Performance**: 150x faster pattern retrieval, 500x faster batch operations, <1ms memory access.

## Prerequisites

- Node.js 18+
- AgentDB v1.0.7+ (via agentic-flow)
- Understanding of reinforcement learning concepts (optional)

---

## Quick Start with CLI

### Initialize ReasoningBank Database

```bash
# Initialize AgentDB for ReasoningBank
npx agentdb@latest init ./.agentdb/reasoningbank.db --dimension 1536

# Start MCP server for Claude Code integration
npx agentdb@latest mcp
claude mcp add agentdb npx agentdb@latest mcp
```

### Migrate from Legacy ReasoningBank

```bash
# Automatic migration with validation
npx agentdb@latest migrate --source .swarm/memory.db

# Verify migration
npx agentdb@latest stats ./.agentdb/reasoningbank.db
```

---

## Quick Start with API

```typescript
import { createAgentDBAdapter, computeEmbedding } from 'agentic-flow/reasoningbank';

// Initialize ReasoningBank with AgentDB
const rb = await createAgentDBAdapter({
  dbPath: '.agentdb/reasoningbank.db',
  enableLearning: true,      // Enable learning plugins
  enableReasoning: true,      // Enable reasoning agents
  cacheSize: 1000,            // 1000 pattern cache
});

// Store successful experience
const query = "How to optimize database queries?";
const embedding = await computeEmbedding(query);

await rb.insertPattern({
  id: '',
  type: 'experience',
  domain: 'database-optimization',
  pattern_data: JSON.stringify({
    embedding,
    pattern: {
      query,
      approach: 'indexing + query optimization',
      outcome: 'success',
      metrics: { latency_reduction: 0.85 }
    }
  }),
  confidence: 0.95,
  usage_count: 1,
  success_count: 1,
  created_at: Date.now(),
  last_used: Date.now(),
});

// Retrieve similar experiences with reasoning
const result = await rb.retrieveWithReasoning(embedding, {
  domain: 'database-optimization',
  k: 5,
  useMMR: true,              // Diverse results
  synthesizeContext: true,    // Rich context synthesis
});

console.log('Memories:', result.memories);
console.log('Context:', result.context);
console.log('Patterns:', result.patterns);
```

---

## Core ReasoningBank Concepts

### 1. Trajectory Tracking

Track agent execution paths and outcomes:

```typescript
// Record trajectory (sequence of actions)
const trajectory = {
  task: 'optimize-api-endpoint',
  steps: [
    { action: 'analyze-bottleneck', result: 'found N+1 query' },
    { action: 'add-eager-loading', result: 'reduced queries' },
    { action: 'add-caching', result: 'improved latency' }
  ],
  outcome: 'success',
  metrics: { latency_before: 2500, latency_after: 150 }
};

const embedding = await computeEmbedding(JSON.stringify(trajectory));

await rb.insertPattern({
  id: '',
  type: 'trajectory',
  domain: 'api-optimization',
  pattern_data: JSON.stringify({ embedding, pattern: trajectory }),
  confidence: 0.9,
  usage_count: 1,
  success_count: 1,
  created_at: Date.now(),
  last_used: Date.now(),
});
```

### 2. Verdict Judgment

Judge whether a trajectory was successful:

```typescript
// Retrieve similar past trajectories
const similar = await rb.retrieveWithReasoning(queryEmbedding, {
  domain: 'api-optimization',
  k: 10,
});

// Judge based on similarity to successful patterns
const verdict = similar.memories.filter(m =>
  m.pattern.outcome === 'success' &&
  m.similarity > 0.8
).length > 5 ? 'likely_success' : 'needs_review';

console.log('Verdict:', verdict);
console.log('Confidence:', similar.memories[0]?.similarity || 0);
```

### 3. Memory Distillation

Consolidate similar experiences into patterns:

```typescript
// Get all experiences in domain
const experiences = await rb.retrieveWithReasoning(embedding, {
  domain: 'api-optimization',
  k: 100,
  optimizeMemory: true,  // Automatic consolidation
});

// Distill into high-level pattern
const distilledPattern = {
  domain: 'api-optimization',
  pattern: 'For N+1 queries: add eager loading, then cache',
  success_rate: 0.92,
  sample_size: experiences.memories.length,
  confidence: 0.95
};

await rb.insertPattern({
  id: '',
  type: 'distilled-pattern',
  domain: 'api-optimization',
  pattern_data: JSON.stringify({
    embedding: await computeEmbedding(JSON.stringify(distilledPattern)),
    pattern: distilledPattern
  }),
  confidence: 0.95,
  usage_count: 0,
  success_count: 0,
  created_at: Date.now(),
  last_used: Date.now(),
});
```

---

## Integration with Reasoning Agents

AgentDB provides 4 reasoning modules that enhance ReasoningBank:

### 1. PatternMatcher

Find similar successful patterns:

```typescript
const result = await rb.retrieveWithReasoning(queryEmbedding, {
  domain: 'problem-solving',
  k: 10,
  useMMR: true,  // Maximal Marginal Relevance for diversity
});

// PatternMatcher returns diverse, relevant memories
result.memories.forEach(mem => {
  console.log(`Pattern: ${mem.pattern.approach}`);
  console.log(`Similarity: ${mem.similarity}`);
  console.log(`Success Rate: ${mem.success_count / mem.usage_count}`);
});
```

### 2. ContextSynthesizer

Generate rich context from multiple memories:

```typescript
const result = await rb.retrieveWithReasoning(queryEmbedding, {
  domain: 'code-optimization',
  synthesizeContext: true,  // Enable context synthesis
  k: 5,
});

// ContextSynthesizer creates coherent narrative
console.log('Synthesized Context:', result.context);
// "Based on 5 similar optimizations, the most effective approach
//  involves profiling, identifying bottlenecks, and applying targeted
//  improvements. Success rate: 87%"
```

### 3. MemoryOptimizer

Automatically consolidate and prune:

```typescript
const result = await rb.retrieveWithReasoning(queryEmbedding, {
  domain: 'testing',
  optimizeMemory: true,  // Enable automatic optimization
});

// MemoryOptimizer consolidates similar patterns and prunes low-quality
console.log('Optimizations:', result.optimizations);
// { consolidated: 15, pruned: 3, improved_quality: 0.12 }
```

### 4. ExperienceCurator

Filter by quality and relevance:

```typescript
const result = await rb.retrieveWithReasoning(queryEmbedding, {
  domain: 'debugging',
  k: 20,
  minConfidence: 0.8,  // Only high-confidence experiences
});

// ExperienceCurator returns only quality experiences
result.memories.forEach(mem => {
  console.log(`Confidence: ${mem.confidence}`);
  console.log(`Success Rate: ${mem.success_count / mem.usage_count}`);
});
```

---

## Legacy API Compatibility

AgentDB maintains 100% backward compatibility with legacy ReasoningBank:

```typescript
import {
  retrieveMemories,
  judgeTrajectory,
  distillMemories
} from 'agentic-flow/reasoningbank';

// Legacy API works unchanged (uses AgentDB backend automatically)
const memories = await retrieveMemories(query, {
  domain: 'code-generation',
  agent: 'coder'
});

const verdict = await judgeTrajectory(trajectory, query);

const newMemories = await distillMemories(
  trajectory,
  verdict,
  query,
  { domain: 'code-generation' }
);
```

---

## Performance Characteristics

- **Pattern Search**: 150x faster (100µs vs 15ms)
- **Memory Retrieval**: <1ms (with cache)
- **Batch Insert**: 500x faster (2ms vs 1s for 100 patterns)
- **Trajectory Judgment**: <5ms (including retrieval + analysis)
- **Memory Distillation**: <50ms (consolidate 100 patterns)

---

## Advanced Patterns

### Hierarchical Memory

Organize memories by abstraction level:

```typescript
// Low-level: Specific implementation
await rb.insertPattern({
  type: 'concrete',
  domain: 'debugging/null-pointer',
  pattern_data: JSON.stringify({
    embedding,
    pattern: { bug: 'NPE in UserService.getUser()', fix: 'Add null check' }
  }),
  confidence: 0.9,
  // ...
});

// Mid-level: Pattern across similar cases
await rb.insertPattern({
  type: 'pattern',
  domain: 'debugging',
  pattern_data: JSON.stringify({
    embedding,
    pattern: { category: 'null-pointer', approach: 'defensive-checks' }
  }),
  confidence: 0.85,
  // ...
});

// High-level: General principle
await rb.insertPattern({
  type: 'principle',
  domain: 'software-engineering',
  pattern_data: JSON.stringify({
    embedding,
    pattern: { principle: 'fail-fast with clear errors' }
  }),
  confidence: 0.95,
  // ...
});
```

### Multi-Domain Learning

Transfer learning across domains:

```typescript
// Learn from backend optimization
const backendExperience = await rb.retrieveWithReasoning(embedding, {
  domain: 'backend-optimization',
  k: 10,
});

// Apply to frontend optimization
const transferredKnowledge = backendExperience.memories.map(mem => ({
  ...mem,
  domain: 'frontend-optimization',
  adapted: true,
}));
```

---

## CLI Operations

### Database Management

```bash
# Export trajectories and patterns
npx agentdb@latest export ./.agentdb/reasoningbank.db ./backup.json

# Import experiences
npx agentdb@latest import ./experiences.json

# Get statistics
npx agentdb@latest stats ./.agentdb/reasoningbank.db
# Shows: total patterns, domains, confidence distribution
```

### Migration

```bash
# Migrate from legacy ReasoningBank
npx agentdb@latest migrate --source .swarm/memory.db --target .agentdb/reasoningbank.db

# Validate migration
npx agentdb@latest stats .agentdb/reasoningbank.db
```

---

## Troubleshooting

### Issue: Migration fails
```bash
# Check source database exists
ls -la .swarm/memory.db

# Run with verbose logging
DEBUG=agentdb:* npx agentdb@latest migrate --source .swarm/memory.db
```

### Issue: Low confidence scores
```typescript
// Enable context synthesis for better quality
const result = await rb.retrieveWithReasoning(embedding, {
  synthesizeContext: true,
  useMMR: true,
  k: 10,
});
```

### Issue: Memory growing too large
```typescript
// Enable automatic optimization
const result = await rb.retrieveWithReasoning(embedding, {
  optimizeMemory: true,  // Consolidates similar patterns
});

// Or manually optimize
await rb.optimize();
```

---

## Learn More

- **AgentDB Integration**: node_modules/agentic-flow/docs/AGENTDB_INTEGRATION.md
- **GitHub**: https://github.com/ruvnet/agentic-flow/tree/main/packages/agentdb
- **MCP Integration**: `npx agentdb@latest mcp`
- **Website**: https://agentdb.ruv.io

---

**Category**: Machine Learning / Reinforcement Learning
**Difficulty**: Intermediate
**Estimated Time**: 20-30 minutes


## Sub-skill: reasoningbank-intelligence

# ReasoningBank Intelligence

## What This Skill Does

Implements ReasoningBank's adaptive learning system for AI agents to learn from experience, recognize patterns, and optimize strategies over time. Enables meta-cognitive capabilities and continuous improvement.

## Prerequisites

- agentic-flow v1.5.11+
- AgentDB v1.0.4+ (for persistence)
- Node.js 18+

## Quick Start

```typescript
import { ReasoningBank } from 'agentic-flow/reasoningbank';

// Initialize ReasoningBank
const rb = new ReasoningBank({
  persist: true,
  learningRate: 0.1,
  adapter: 'agentdb' // Use AgentDB for storage
});

// Record task outcome
await rb.recordExperience({
  task: 'code_review',
  approach: 'static_analysis_first',
  outcome: {
    success: true,
    metrics: {
      bugs_found: 5,
      time_taken: 120,
      false_positives: 1
    }
  },
  context: {
    language: 'typescript',
    complexity: 'medium'
  }
});

// Get optimal strategy
const strategy = await rb.recommendStrategy('code_review', {
  language: 'typescript',
  complexity: 'high'
});
```

## Core Features

### 1. Pattern Recognition
```typescript
// Learn patterns from data
await rb.learnPattern({
  pattern: 'api_errors_increase_after_deploy',
  triggers: ['deployment', 'traffic_spike'],
  actions: ['rollback', 'scale_up'],
  confidence: 0.85
});

// Match patterns
const matches = await rb.matchPatterns(currentSituation);
```

### 2. Strategy Optimization
```typescript
// Compare strategies
const comparison = await rb.compareStrategies('bug_fixing', [
  'tdd_approach',
  'debug_first',
  'reproduce_then_fix'
]);

// Get best strategy
const best = comparison.strategies[0];
console.log(`Best: ${best.name} (score: ${best.score})`);
```

### 3. Continuous Learning
```typescript
// Enable auto-learning from all tasks
await rb.enableAutoLearning({
  threshold: 0.7,        // Only learn from high-confidence outcomes
  updateFrequency: 100   // Update models every 100 experiences
});
```

## Advanced Usage

### Meta-Learning
```typescript
// Learn about learning
await rb.metaLearn({
  observation: 'parallel_execution_faster_for_independent_tasks',
  confidence: 0.95,
  applicability: {
    task_types: ['batch_processing', 'data_transformation'],
    conditions: ['tasks_independent', 'io_bound']
  }
});
```

### Transfer Learning
```typescript
// Apply knowledge from one domain to another
await rb.transferKnowledge({
  from: 'code_review_javascript',
  to: 'code_review_typescript',
  similarity: 0.8
});
```

### Adaptive Agents
```typescript
// Create self-improving agent
class AdaptiveAgent {
  async execute(task: Task) {
    // Get optimal strategy
    const strategy = await rb.recommendStrategy(task.type, task.context);

    // Execute with strategy
    const result = await this.executeWithStrategy(task, strategy);

    // Learn from outcome
    await rb.recordExperience({
      task: task.type,
      approach: strategy.name,
      outcome: result,
      context: task.context
    });

    return result;
  }
}
```

## Integration with AgentDB

```typescript
// Persist ReasoningBank data
await rb.configure({
  storage: {
    type: 'agentdb',
    options: {
      database: './reasoning-bank.db',
      enableVectorSearch: true
    }
  }
});

// Query learned patterns
const patterns = await rb.query({
  category: 'optimization',
  minConfidence: 0.8,
  timeRange: { last: '30d' }
});
```

## Performance Metrics

```typescript
// Track learning effectiveness
const metrics = await rb.getMetrics();
console.log(`
  Total Experiences: ${metrics.totalExperiences}
  Patterns Learned: ${metrics.patternsLearned}
  Strategy Success Rate: ${metrics.strategySuccessRate}
  Improvement Over Time: ${metrics.improvement}
`);
```

## Best Practices

1. **Record consistently**: Log all task outcomes, not just successes
2. **Provide context**: Rich context improves pattern matching
3. **Set thresholds**: Filter low-confidence learnings
4. **Review periodically**: Audit learned patterns for quality
5. **Use vector search**: Enable semantic pattern matching

## Troubleshooting

### Issue: Poor recommendations
**Solution**: Ensure sufficient training data (100+ experiences per task type)

### Issue: Slow pattern matching
**Solution**: Enable vector indexing in AgentDB

### Issue: Memory growing large
**Solution**: Set TTL for old experiences or enable pruning

## Learn More

- ReasoningBank Guide: agentic-flow/src/reasoningbank/README.md
- AgentDB Integration: packages/agentdb/docs/reasoningbank.md
- Pattern Learning: docs/reasoning/patterns.md
