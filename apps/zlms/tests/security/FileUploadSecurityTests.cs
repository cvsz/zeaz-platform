#!/usr/bin/env python3
"""File upload security regressions for ebook uploads."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
EBOOK_ADD = ROOT / "app" / "ebook" / "add.aspx.cs"


class FileUploadSecurityTests(unittest.TestCase):
    def setUp(self):
        self.source = EBOOK_ADD.read_text(encoding="utf-8-sig", errors="ignore")

    def test_dangerous_server_side_extensions_are_rejected_with_http_400(self):
        for extension in [".php", ".exe", ".aspx", ".jsp"]:
            with self.subTest(extension=extension):
                self.assertRegex(self.source, r"AllowedPdfExtensions\s*=\s*\{\s*\"\.pdf\"\s*\}")
                self.assertNotIn(f'"{extension}"', self.source)
        self.assertIn("Response.StatusCode = 400", self.source)
        self.assertIn("Only PDF files are accepted", self.source)
        self.assertNotRegex(self.source, r"StatusLabel\.Text\s*=\s*ex\.")

    def test_valid_pdf_upload_path_succeeds_with_pdf_mime_and_signature_checks(self):
        self.assertIn('".pdf"', self.source)
        self.assertIn('IsAllowedMime(PdfUploadControl.PostedFile.ContentType, "application/pdf")', self.source)
        self.assertIn("HasPdfSignature(PdfUploadControl.PostedFile)", self.source)
        self.assertIn('StatusLabel.Text = "Upload status: File uploaded!"', self.source)
        self.assertIn("SaveEbookFile(PdfUploadControl.PostedFile, savedPdfFileName)", self.source)

    def test_upload_storage_uses_safe_generated_names_under_app_data(self):
        self.assertIn('Guid.NewGuid().ToString("N") + extension.ToLowerInvariant()', self.source)
        self.assertIn('private const string EbookUploadVirtualPath = "~/App_Data/ebook_assets/"', self.source)
        self.assertIn("Path.GetFullPath(Path.Combine(uploadRoot, Path.GetFileName(fileName)))", self.source)
        self.assertIn("StartsWith(Path.GetFullPath(uploadRoot)", self.source)


if __name__ == "__main__":
    unittest.main()
