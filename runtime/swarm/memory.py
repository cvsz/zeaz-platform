import psycopg2
from psycopg2.extras import RealDictCursor
import numpy as np
import logging
import json
from typing import List, Dict, Any, Optional

logger = logging.getLogger("SharedMemory")

class SharedMemory:
    def __init__(self, db_url: str = "postgresql://postgres:postgres@localhost:5432/postgres"):
        self.db_url = db_url
        self._init_db()

    def _init_db(self):
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()
            cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
            cur.execute("""
                CREATE TABLE IF NOT EXISTS swarm_memory (
                    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
                    agent_id text,
                    tenant_id text,
                    content text,
                    metadata jsonb,
                    embedding vector(1536),
                    created_at timestamptz DEFAULT now()
                )
            """)
            cur.execute("CREATE INDEX IF NOT EXISTS swarm_memory_embedding_idx ON swarm_memory USING ivfflat (embedding cos_ops) WITH (lists = 100)")
            conn.commit()
            cur.close()
            conn.close()
        except Exception as e:
            logger.error(f"Failed to initialize SharedMemory DB: {e}")

    def store_memory(self, agent_id: str, content: str, embedding: List[float], metadata: Dict[str, Any] = None, tenant_id: str = "system"):
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor()
            cur.execute("""
                INSERT INTO swarm_memory (agent_id, tenant_id, content, metadata, embedding)
                VALUES (%s, %s, %s, %s, %s)
            """, (agent_id, tenant_id, content, json.dumps(metadata or {}), embedding))
            conn.commit()
            cur.close()
            conn.close()
            logger.debug(f"Memory stored for agent {agent_id}")
        except Exception as e:
            logger.error(f"Failed to store memory: {e}")

    def search_memory(self, embedding: List[float], limit: int = 5, tenant_id: str = "system") -> List[Dict[str, Any]]:
        try:
            conn = psycopg2.connect(self.db_url)
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT agent_id, content, metadata, created_at, 
                       (embedding <=> %s::vector) as distance
                FROM swarm_memory
                WHERE tenant_id = %s
                ORDER BY distance ASC
                LIMIT %s
            """, (embedding, tenant_id, limit))
            results = cur.fetchall()
            cur.close()
            conn.close()
            return results
        except Exception as e:
            logger.error(f"Failed to search memory: {e}")
            return []
