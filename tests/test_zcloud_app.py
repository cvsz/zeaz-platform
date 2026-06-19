# tests/test_zcloud_app.py

from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
ZCLOUD = ROOT / "apps" / "zcloud"


FORBIDDEN_PATTERNS = (
    (
        "placeholder_replace_me",
        re.compile(r"\breplace-me\b", re.IGNORECASE),
    ),
    (
        "placeholder_changeme",
        re.compile(r"\bchangeme\b", re.IGNORECASE),
    ),
    (
        "placeholder_dummy_secret",
        re.compile(r"\bdummy-secret\b", re.IGNORECASE),
    ),
    (
        "placeholder_fake_token",
        re.compile(r"\bfake-token\b", re.IGNORECASE),
    ),
    (
        "private_key_generic",
        re.compile(
            r"BEGIN\s+PRIVATE\s+KEY",
            re.IGNORECASE,
        ),
    ),
)


def test_zcloud_contains_no_disallowed_placeholders_or_private_keys():
    text_suffixes = {
        ".html",
        ".css",
        ".js",
        ".mjs",
        ".json",
        ".md",
    }

    violations: list[str] = []

    for path in ZCLOUD.rglob("*"):
        if not path.is_file():
            continue

        if path.suffix not in text_suffixes:
            continue

        content = path.read_text(
            encoding="utf-8",
            errors="ignore",
        )

        for rule_name, pattern in FORBIDDEN_PATTERNS:
            match = pattern.search(content)

            if match:
                violations.append(
                    (
                        f"{path.relative_to(ZCLOUD)} "
                        f"[{rule_name}] "
                        f"matched '{match.group(0)}'"
                    )
                )

    assert not violations, (
        "Forbidden placeholders or private key material found:\n"
        + "\n".join(violations)
    )