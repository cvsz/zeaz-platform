from __future__ import annotations

import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / ".codex" / "suite" / "master-meta-cloud-suite.json"


def load_manifest() -> dict:
    return json.loads(MANIFEST.read_text())


def test_codex_suite_validator_passes() -> None:
    result = subprocess.run(
        ["python3", "docs/codex/scripts/validate_codex_suite.py"],
        cwd=ROOT,
        check=False,
        text=True,
        capture_output=True,
    )
    assert result.returncode == 0, result.stderr + result.stdout
    assert "Codex suite validation passed" in result.stdout


def test_codex_suite_has_all_phase_lanes() -> None:
    data = load_manifest()
    assert [lane["phase"] for lane in data["phase_lanes"]] == [f"F{index}" for index in range(13)]
    for lane in data["phase_lanes"]:
        assert (ROOT / lane["prompt_file"]).is_file()
        assert lane["default_validations"]


def test_codex_suite_disables_external_mutation() -> None:
    contract = load_manifest()["safety_contract"]
    assert contract["offline_default"] is True
    assert contract["api_checks_opt_in_only"] is True
    assert contract["requires_human_approval_for_mutation"] is True
    assert contract["terraform_apply_allowed"] is False
    assert contract["terraform_destroy_allowed"] is False
    assert contract["external_mutation_allowed"] is False
    assert contract["secret_printing_allowed"] is False
    assert contract["global_cloudflare_api_key_allowed"] is False
    assert contract["allow_all_access_policy_allowed"] is False
