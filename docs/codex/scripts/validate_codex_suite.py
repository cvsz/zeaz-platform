#!/usr/bin/env python3
"""Offline validator for the Zeaz Master Meta Codex Cloud Suite."""
from __future__ import annotations

import json
import sys
import tomllib
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[3]
MANIFEST = ROOT / ".codex" / "suite" / "master-meta-cloud-suite.json"
EXPECTED_PHASES = [f"F{index}" for index in range(13)]
REQUIRED_PR_SECTIONS = {
    "summary",
    "phase implemented",
    "files changed",
    "validation commands run",
    "security notes",
    "rollback notes",
    "manual setup required",
    "known limitations",
}
DANGEROUS_VALIDATION_TERMS = (" apply", " destroy", "--yes", "CONFIRM_APPLY=yes", "CONFIRM_RESTORE=yes")


def fail(message: str) -> None:
    print(f"ERROR: {message}", file=sys.stderr)
    raise SystemExit(1)


def load_manifest() -> dict[str, Any]:
    if not MANIFEST.is_file():
        fail(f"missing manifest: {MANIFEST.relative_to(ROOT)}")
    try:
        data = json.loads(MANIFEST.read_text())
    except json.JSONDecodeError as exc:
        fail(f"manifest is invalid JSON: {exc}")
    if not isinstance(data, dict):
        fail("manifest root must be an object")
    return data


def require_bool(contract: dict[str, Any], key: str, expected: bool) -> None:
    actual = contract.get(key)
    if actual is not expected:
        fail(f"safety_contract.{key} must be {expected!r}")


def validate_safety_contract(data: dict[str, Any]) -> None:
    contract = data.get("safety_contract")
    if not isinstance(contract, dict):
        fail("safety_contract must be present")
    for key in (
        "offline_default",
        "api_checks_opt_in_only",
        "requires_human_approval_for_mutation",
    ):
        require_bool(contract, key, True)
    for key in (
        "terraform_apply_allowed",
        "terraform_destroy_allowed",
        "external_mutation_allowed",
        "secret_printing_allowed",
        "global_cloudflare_api_key_allowed",
        "allow_all_access_policy_allowed",
    ):
        require_bool(contract, key, False)


def load_agent_config(agent_id: str, config_file: str) -> dict[str, Any]:
    config_path = ROOT / config_file
    if not config_path.is_file():
        fail(f"agent {agent_id} references missing config_file: {config_file}")
    try:
        config = tomllib.loads(config_path.read_text())
    except tomllib.TOMLDecodeError as exc:
        fail(f"agent {agent_id} config is invalid TOML: {exc}")
    if not isinstance(config, dict):
        fail(f"agent {agent_id} config must be a TOML table")
    return config


def validate_agent_config(agent_id: str, config_file: str) -> None:
    config = load_agent_config(agent_id, config_file)
    name = config.get("name")
    if not isinstance(name, str) or not name.strip():
        fail(f"agent {agent_id} config must define a non-empty name")
    if name != agent_id:
        fail(f"agent {agent_id} config name must match agent id, got: {name}")
    description = config.get("description")
    if not isinstance(description, str) or not description.strip():
        fail(f"agent {agent_id} config must define a non-empty description")
    instructions = config.get("developer_instructions")
    if not isinstance(instructions, str) or not instructions.strip():
        fail(f"agent {agent_id} config must define non-empty developer_instructions")


def validate_agents(data: dict[str, Any]) -> None:
    agents = data.get("agent_roster")
    if not isinstance(agents, list) or not agents:
        fail("agent_roster must be a non-empty list")
    seen: set[str] = set()
    for agent in agents:
        if not isinstance(agent, dict):
            fail("each agent_roster item must be an object")
        agent_id = agent.get("id")
        config_file = agent.get("config_file")
        if not isinstance(agent_id, str) or not agent_id:
            fail("each agent must include an id")
        if agent_id in seen:
            fail(f"duplicate agent id: {agent_id}")
        seen.add(agent_id)
        if not isinstance(config_file, str) or not config_file:
            fail(f"agent {agent_id} must reference a config_file")
        validate_agent_config(agent_id, config_file)
        if agent.get("mode") != "read-only":
            fail(f"agent {agent_id} must remain read-only")


def validate_phase_lanes(data: dict[str, Any]) -> None:
    lanes = data.get("phase_lanes")
    if not isinstance(lanes, list):
        fail("phase_lanes must be a list")
    phases = [lane.get("phase") for lane in lanes if isinstance(lane, dict)]
    if phases != EXPECTED_PHASES:
        fail(f"phase_lanes must list phases {EXPECTED_PHASES}, got {phases}")
    for lane in lanes:
        prompt_file = lane.get("prompt_file")
        if not isinstance(prompt_file, str) or not (ROOT / prompt_file).is_file():
            fail(f"phase {lane.get('phase')} references missing prompt_file: {prompt_file}")
        validations = lane.get("default_validations")
        if not isinstance(validations, list) or not validations:
            fail(f"phase {lane.get('phase')} must include default_validations")
        for command in validations:
            if not isinstance(command, str):
                fail(f"phase {lane.get('phase')} validation commands must be strings")
            padded = f" {command} "
            if any(term in padded for term in DANGEROUS_VALIDATION_TERMS):
                fail(f"phase {lane.get('phase')} includes unsafe validation command: {command}")


def validate_handoff(data: dict[str, Any]) -> None:
    handoff = data.get("handoff_contract")
    if not isinstance(handoff, dict):
        fail("handoff_contract must be present")
    sections = handoff.get("pull_request_body_required_sections")
    if not isinstance(sections, list) or set(sections) != REQUIRED_PR_SECTIONS:
        fail("pull_request_body_required_sections does not match AGENTS.md requirements")


def main() -> int:
    data = load_manifest()
    validate_safety_contract(data)
    validate_agents(data)
    validate_phase_lanes(data)
    validate_handoff(data)
    print("Codex suite validation passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
