from __future__ import annotations

import hashlib
import hmac
import json
import os
import sys
from pathlib import Path

import pytest

PR_BOT_ROOT = Path(__file__).resolve().parents[2] / "services" / "pr-bot"
sys.path.insert(0, str(PR_BOT_ROOT))

os.environ.setdefault("GH_APP_ID", "123456")
os.environ.setdefault("GH_WEBHOOK_SECRET", "unit-test-secret")
os.environ.setdefault(
    "GH_PRIVATE_KEY",
    "test-private-key-placeholder",
)

from src.memory import ReviewMemoryStore
from src.opa import evaluate_gate
from src.rl import Feedback, ReviewerBandit
from src.security import verify_webhook_signature


def test_gate_blocks_critical_and_warns_medium() -> None:
    result = evaluate_gate(
        [
            {"severity": "critical", "comment": "SQL injection risk"},
            {"severity": "medium", "comment": "Use stricter typing"},
        ]
    )
    assert result["deny"] == ["BLOCKER: SQL injection risk"]
    assert result["warn"] == ["Use stricter typing"]


def test_rl_bandit_updates_weights_deterministically() -> None:
    bandit = ReviewerBandit()
    bandit.update(
        Feedback(repo="acme/repo", accepted=True, severity="high", category="security")
    )
    bandit.update(
        Feedback(repo="acme/repo", accepted=False, severity="low", category="perf")
    )
    snapshot = bandit.snapshot()
    assert snapshot["security"] == pytest.approx(1.1)
    assert snapshot["perf"] == pytest.approx(0.9)
    assert bandit.select_agents()[0] == "security"


def test_verify_signature_uses_hmac_sha256() -> None:
    payload = json.dumps({"event": "pull_request"}).encode("utf-8")
    fixture_secret = "abc123"
    digest = hmac.new(fixture_secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    signature = f"sha256={digest}"
    assert verify_webhook_signature(fixture_secret, payload, signature)
    assert not verify_webhook_signature(fixture_secret, payload, "sha256=deadbeef")


def test_memory_store_validates_embedding_dimensions() -> None:
    store = ReviewMemoryStore(db_url="postgresql://unused", embedding_dimensions=4)
    with pytest.raises(ValueError):
        store.search_similar([0.1, 0.2], limit=1)
