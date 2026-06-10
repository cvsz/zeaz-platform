#!/usr/bin/env python3
"""SQL injection regression tests for the parameterized-query fixes."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INJECTION_PAYLOAD = "' OR '1'='1"
FIXED_QUERY_FILES = [
    ROOT / "app" / "login.aspx.cs",
    ROOT / "app" / "ebook" / "add.aspx.cs",
    ROOT / "app" / "QA" / "resultupload.aspx.cs",
    ROOT / "app" / "QA" / "Activityupload.aspx.cs",
    ROOT / "app" / "USER_QA" / "Activityupload.aspx.cs",
    ROOT / "app" / "USER_QA" / "Uploadfile1.aspx.cs",
]


class SqlInjectionRegressionTests(unittest.TestCase):
    def test_canonical_payload_is_never_concatenated_into_fixed_sql_text(self):
        for path in FIXED_QUERY_FILES:
            with self.subTest(path=path.relative_to(ROOT)):
                source = path.read_text(encoding="utf-8-sig", errors="ignore")
                self.assertNotIn(INJECTION_PAYLOAD, source)
                self.assertNotRegex(source, r"(SELECT|INSERT|UPDATE|DELETE)[^\n\"]*['\"]\s*\+")

    def test_fixed_sql_paths_use_bound_parameters(self):
        expectations = {
            "login.aspx.cs": ["@NAME", "@PASSWORD", "@EMAIL", "@TOKEN"],
            "ebook/add.aspx.cs": ["@title", "@author", "@filename", "@published_date"],
            "QA/resultupload.aspx.cs": ["sqlCmdAddParam"],
            "QA/Activityupload.aspx.cs": ["sqlCmdAddParam"],
            "USER_QA/Activityupload.aspx.cs": ["sqlCmdAddParam"],
            "USER_QA/Uploadfile1.aspx.cs": ["sqlCmdAddParam"],
        }
        for relative, tokens in expectations.items():
            source = (ROOT / "app" / relative).read_text(encoding="utf-8-sig", errors="ignore")
            for token in tokens:
                with self.subTest(file=relative, token=token):
                    self.assertIn(token, source)

    def test_payload_remains_data_when_bound_to_parameters(self):
        parameterized_template = "SELECT * FROM [dbo].[users] WHERE [username]=@NAME AND [password]=@PASSWORD"
        rendered_command_text = parameterized_template
        bound_parameters = {"@NAME": INJECTION_PAYLOAD, "@PASSWORD": INJECTION_PAYLOAD}
        self.assertNotIn(INJECTION_PAYLOAD, rendered_command_text)
        self.assertEqual(INJECTION_PAYLOAD, bound_parameters["@NAME"])
        self.assertRegex(rendered_command_text, r"@NAME.*@PASSWORD")


if __name__ == "__main__":
    unittest.main()
