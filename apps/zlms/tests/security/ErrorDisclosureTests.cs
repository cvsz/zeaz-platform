#!/usr/bin/env python3
"""Error disclosure regressions for fixed endpoints."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WEB_CONFIG = ROOT / "app" / "Web.config"
LOGGER = ROOT / "app" / "Core" / "Logging" / "AppLogger.cs"
TARGET_DIRS = [ROOT / "app" / name for name in ("QA", "Course", "ebook", "Admin")]
FORBIDDEN_RESPONSE_PATTERNS = [
    r"Response\.Write\s*\(\s*ex\.",
    r"Label\w*\.Text\s*=\s*ex\.",
    r"StatusLabel\.Text\s*=\s*ex\.",
    r"StackTrace",
    r"SqlConnectionStringBuilder",
]


class ErrorDisclosureTests(unittest.TestCase):
    def test_server_errors_use_safe_public_response_message(self):
        logger = LOGGER.read_text(encoding="utf-8-sig", errors="ignore")
        self.assertIn("SafeErrorMessage()", logger)
        self.assertIn("An unexpected error occurred while processing this form", logger)
        self.assertNotIn("connectionString", logger.lower())

    def test_production_web_config_hides_framework_error_details(self):
        config = WEB_CONFIG.read_text(encoding="utf-8-sig", errors="ignore")
        self.assertIn('debug="false"', config)
        self.assertIn('<customErrors defaultRedirect="UpdatingSystem.aspx" mode="On">', config)
        self.assertNotIn('mode="Off"', config)

    def test_fixed_endpoints_do_not_reflect_internal_error_details(self):
        for directory in TARGET_DIRS:
            for path in sorted(directory.glob("*.aspx.cs")):
                source = path.read_text(encoding="utf-8-sig", errors="ignore")
                for pattern in FORBIDDEN_RESPONSE_PATTERNS:
                    with self.subTest(path=path.relative_to(ROOT), pattern=pattern):
                        self.assertNotRegex(source, pattern)


if __name__ == "__main__":
    unittest.main()
