import random
import re
import string
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOGIN = ROOT / "app" / "login.aspx.cs"
SUPPORT = ROOT / "app" / "SecuritySupport.cs"
WEB_CONFIG = ROOT / "app" / "Web.config"
CCONNECT = ROOT / "app" / "CConnect.cs"
EXAMDB = ROOT / "app" / "examdb" / "application" / "config" / "database.php"


class SecurityRegressionTests(unittest.TestCase):
    def test_login_uses_parameterized_queries_for_authentication_and_reset(self):
        source = LOGIN.read_text(encoding="utf-8-sig")
        self.assertIn("[username]=@NAME", source)
        self.assertIn("[password]=@PASSWORD", source)
        self.assertIn("[email]=@EMAIL", source)
        self.assertIn("VALUES(@USERID,@TOKEN,'1',@CREATEDATE)", source)
        self.assertNotRegex(source, r"where\s+\[?email\]?\s*=\s*['\"]\s*\+")

    def test_login_has_no_hardcoded_smtp_secret_or_recipient(self):
        source = LOGIN.read_text(encoding="utf-8-sig")
        self.assertNotIn("smtp.gmail.com", source)
        self.assertNotIn("NetworkCredential(\"", source)
        self.assertNotIn("bb212525", source)
        self.assertIn("ConfigurationManager.AppSettings[\"SmtpFromAddress\"]", source)

    def test_login_defends_against_xss_and_bruteforce(self):
        source = LOGIN.read_text(encoding="utf-8-sig")
        self.assertIn("HttpUtility.JavaScriptStringEncode", source)
        self.assertIn("LoginRateLimiter.IsAllowed", source)
        self.assertIn("LoginRateLimiter.Reset", source)

    def test_secure_random_and_weak_crypto_removed_from_security_paths(self):
        login_source = LOGIN.read_text(encoding="utf-8-sig")
        cconnect_source = CCONNECT.read_text(encoding="utf-8-sig")
        self.assertIn("RandomNumberGenerator.Create()", login_source)
        self.assertNotIn("new Random", login_source)
        self.assertNotIn("MD5.Create", cconnect_source)
        self.assertIn("SHA256.Create", cconnect_source)

    def test_database_helper_logs_failures_instead_of_silently_swallowing_them(self):
        source = CCONNECT.read_text(encoding="utf-8-sig")
        self.assertNotRegex(source, r"catch\s*\{\s*\}")
        self.assertIn("LogSqlError(ex)", source)
        self.assertIn("SecurityTelemetry.Error", source)

    def test_web_config_removes_secrets_and_enables_security_controls(self):
        config = WEB_CONFIG.read_text(encoding="utf-8")
        self.assertNotIn("Password=", config)
        self.assertNotIn("User ID=sa", config)
        self.assertIn("Integrated Security=True", config)
        self.assertIn("httpOnlyCookies=\"true\"", config)
        self.assertIn("requireSSL=\"true\"", config)
        self.assertIn("sameSite=\"Strict\"", config)
        self.assertIn("Content-Security-Policy", config)
        self.assertIn("maxAllowedContentLength=\"52428800\"", config)

    def test_legacy_config_secrets_are_externalized(self):
        sensitive_files = [
            ROOT / "app" / "knowledge" / "db.config",
            ROOT / "app" / "knowledge_old" / "db.config",
            ROOT / "app" / "knowledge_crash" / "db.config",
            ROOT / "app" / "devexpress" / "portaleAgente.dll.config",
            EXAMDB,
        ]
        combined = "\n".join(path.read_text(encoding="utf-8-sig", errors="ignore") for path in sensitive_files)
        for leaked_value in ["Staging001", "CPACtest2015", "edupol2563#", "oainfo2007", "User ID=sa", "Password="]:
            self.assertNotIn(leaked_value, combined)
        self.assertIn("getenv('EXAMDB_DB_PASSWORD')", combined)
        self.assertIn("Integrated Security=True", combined)

    def test_observability_hooks_are_present(self):
        source = SUPPORT.read_text(encoding="utf-8-sig")
        self.assertIn("TraceSource", source)
        self.assertIn("traceparent", source)
        self.assertIn("Trace-Id", source)
        self.assertIn("timestamp", source)

    def test_qa_upload_handlers_validate_paths_and_parameterize_metadata(self):
        upload_files = [
            ROOT / "app" / "QA" / "resultupload.aspx.cs",
            ROOT / "app" / "QA" / "Activityupload.aspx.cs",
            ROOT / "app" / "USER_QA" / "Activityupload.aspx.cs",
            ROOT / "app" / "USER_QA" / "Uploadfile1.aspx.cs",
        ]
        for path in upload_files:
            with self.subTest(path=path):
                source = path.read_text(encoding="utf-8-sig")
                self.assertIn("FileUploadSecurity.IsSafeSegment", source)
                self.assertIn("FileUploadSecurity.Save", source)
                self.assertIn("SafeUploadResult", source)
                self.assertIn('sqlCmdText("INSERT INTO', source)
                self.assertIn("sqlCmdAddParam", source)
                self.assertNotRegex(source, r"\.SaveAs\(")
                self.assertNotRegex(source, r"INSERT INTO[^\n]+\+[^\n]+")

    def test_qa_upload_rendering_encodes_file_output_and_ids(self):
        render_files = [
            ROOT / "app" / "QA" / "resultupload.aspx.cs",
            ROOT / "app" / "QA" / "Activityupload.aspx.cs",
            ROOT / "app" / "USER_QA" / "Activityupload.aspx.cs",
        ]
        for path in render_files:
            with self.subTest(path=path):
                source = path.read_text(encoding="utf-8-sig")
                self.assertIn("HttpUtility.HtmlEncode(fileName)", source)
                self.assertIn("HttpUtility.UrlPathEncode(fileName)", source)
                self.assertIn("int.TryParse(sqlDataReader.GetValue(0).ToString(), out fileId)", source)
                self.assertIn("int.TryParse(id, out fileId)", source)


class InputValidationFuzzTests(unittest.TestCase):
    def test_username_validator_rejects_fuzzed_control_and_metacharacter_payloads(self):
        source = SUPPORT.read_text(encoding="utf-8-sig")
        match = re.search(r'UserNamePattern = new Regex\("([^\"]+)"', source)
        self.assertIsNotNone(match)
        pattern = re.compile(match.group(1).encode("utf-8").decode("unicode_escape"))
        dangerous_alphabet = "'\";<>/\\\x00\r\n\t" + string.punctuation
        random.seed(1337)
        for _ in range(1000):
            payload = "".join(random.choice(dangerous_alphabet) for _ in range(random.randint(1, 160)))
            if any(ch in payload for ch in "'\";<>/\\\x00\r\n\t"):
                self.assertIsNone(pattern.fullmatch(payload), payload)

    def test_username_validator_accepts_expected_identifier_shapes(self):
        source = SUPPORT.read_text(encoding="utf-8-sig")
        match = re.search(r'UserNamePattern = new Regex\("([^\"]+)"', source)
        self.assertIsNotNone(match)
        pattern = re.compile(match.group(1).encode("utf-8").decode("unicode_escape"))
        for value in ["alice", "alice.smith", "alice-smith", "alice_smith", "alice@example.gov", "A123456"]:
            self.assertIsNotNone(pattern.fullmatch(value), value)


if __name__ == "__main__":
    unittest.main()
