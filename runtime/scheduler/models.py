from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from enum import Enum
from datetime import datetime

class TaskStatus(Enum):
    PENDING = "PENDING"
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    RETRYING = "RETRYING"
    CANCELLED = "CANCELLED"

class TaskPriority(Enum):
    LOW = 0
    NORMAL = 1
    HIGH = 2
    URGENT = 3

class CognitiveTask(BaseModel):
    task_id: str
    tenant_id: str
    action_type: str
    payload: Dict[str, Any]
    priority: TaskPriority = TaskPriority.NORMAL
    status: TaskStatus = TaskStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    started_at: Optional[datetime] = None
    finished_at: Optional[datetime] = None
    retry_count: int = 0
    max_retries: int = 3
    affinity_requirements: Dict[str, Any] = {}
    lease_duration: int = 60 # seconds
    
    class Config:
        use_enum_values = True

class WorkloadSnapshot(BaseModel):
    provider_id: str
    current_load: float # 0.0 to 1.0
    active_tasks: int
    queue_depth: int
    latency_ms: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
