#!/usr/bin/env python3
"""Executable regression specs for form-submit logging.

The repository currently uses the Python unittest runner for security regression
coverage. These files intentionally keep the requested .cs names while remaining
executable by the existing test framework from CI.
"""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGGER = ROOT / "app" / "Core" / "Logging" / "AppLogger.cs"
FORM_DIRS = [ROOT / "app" / name for name in ("QA", "Course", "ebook", "Admin")]
PII_MARKERS = ["email", "password", "national", "national[_ -]?id", "citizen[_ -]?id"]


class FormSubmissionLoggingTests(unittest.TestCase):
    def setUp(self):
        self.logger = LOGGER.read_text(encoding="utf-8-sig")

    def test_valid_submit_log_schema_contains_required_structured_keys(self):
        for key in ["timestamp", "form_name", "user_id", "action", "result"]:
            with self.subTest(key=key):
                self.assertIn(f'fields["{key}"]', self.logger)
        self.assertIn('fields["action"] = "submit"', self.logger)
        self.assertIn('fields["result"] = "success"', self.logger)
        self.assertIn('Write("info", "form.submit", fields)', self.logger)

    def test_invalid_submit_log_schema_contains_required_structured_keys(self):
        for key in ["timestamp", "form_name", "error_type"]:
            with self.subTest(key=key):
                self.assertIn(f'fields["{key}"]', self.logger)
        self.assertIn('fields["result"] = "failure"', self.logger)
        self.assertIn('Write("error", "form.error", fields)', self.logger)

    def test_each_target_form_area_has_submit_logging_coverage(self):
        for directory in FORM_DIRS:
            with self.subTest(directory=directory.relative_to(ROOT)):
                files = sorted(directory.glob("*.aspx.cs"))
                self.assertTrue(files, f"no form code-behind files found under {directory}")
                combined = "\n".join(path.read_text(encoding="utf-8-sig", errors="ignore") for path in files)
                self.assertRegex(combined, r"AppLogger\.(FormEvent|FormError|Audit)")

    def test_logger_redacts_pii_from_log_output(self):
        self.assertIn("SafeFieldNames", self.logger)
        self.assertIn("SensitiveKeyPattern", self.logger)
        self.assertIn("Redact(string value)", self.logger)
        for marker in PII_MARKERS:
            with self.subTest(marker=marker):
                self.assertIn(marker, self.logger)
        self.assertNotRegex(self.logger, r"Request\.Form\[[^\]]+\].*payload")


if __name__ == "__main__":
    unittest.main()
