#!/usr/bin/env python3
"""Authentication and authorization bypass regressions for admin endpoints."""
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ADMIN_DIR = ROOT / "app" / "Admin"
SECURITY_SUPPORT = ROOT / "app" / "SecuritySupport.cs"


class AuthBypassTests(unittest.TestCase):
    def test_each_admin_page_requires_admin_role(self):
        admin_pages = sorted(ADMIN_DIR.glob("*.aspx.cs"))
        self.assertTrue(admin_pages, "admin code-behind pages must exist")
        for page in admin_pages:
            with self.subTest(page=page.relative_to(ROOT)):
                source = page.read_text(encoding="utf-8-sig", errors="ignore")
                self.assertIn('AuthorizationSecurity.RequireRole(this, "Admin")', source)
                self.assertIn("return", source)

    def test_unauthenticated_admin_requests_redirect_to_login(self):
        source = SECURITY_SUPPORT.read_text(encoding="utf-8-sig", errors="ignore")
        self.assertIn("RequireAuthenticated(Page page)", source)
        self.assertIn('page.Session["SessionID"] == null', source)
        self.assertIn('page.Response.Redirect(page.ResolveUrl("~/web/"), false)', source)
        self.assertIn("CompleteRequest()", source)

    def test_non_admin_sessions_cannot_access_admin_endpoints(self):
        source = SECURITY_SUPPORT.read_text(encoding="utf-8-sig", errors="ignore")
        self.assertIn("RequireRole(Page page, string role)", source)
        self.assertIn("IsInRole(page, role)", source)
        self.assertIn('page.Session["Role"]', source)
        self.assertIn('page.Session["RANK"]', source)
        self.assertIn('SecurityTelemetry.Warn("authorization.role", "forbidden"', source)
        self.assertIn('page.Response.Redirect(page.ResolveUrl("~/Default.aspx"), false)', source)


if __name__ == "__main__":
    unittest.main()
