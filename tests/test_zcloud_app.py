from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ZCLOUD = ROOT / "apps" / "zcloud"


def read(relative: str) -> str:
    return (ZCLOUD / relative).read_text(encoding="utf-8")


def test_zcloud_release_files_exist():
    required = [
        "README.md",
        "IMPORT_SOURCE.md",
        "docs/release-notes.md",
        "index.html",
        "public/index.html",
        "src/app.js",
        "src/catalog.js",
        "src/styles.css",
        "scripts/validate-zcloud.mjs",
    ]
    missing = [path for path in required if not (ZCLOUD / path).is_file()]
    assert not missing


def test_zcloud_tracks_cloudpanel_v2_source_and_coverage():
    corpus = "\n".join(
        read(path)
        for path in ["README.md", "IMPORT_SOURCE.md", "docs/release-notes.md", "src/catalog.js"]
    )
    assert "https://github.com/cloudpanel-io/docs/tree/master/v2" in corpus
    for expected in [
        "Ubuntu 24.04",
        "Debian 13",
        "WordPress",
        "Node.js with PM2",
        "Python with uWSGI",
        "Reverse Proxy",
        "Provider firewall first",
        "two-factor authentication",
    ]:
        assert expected in corpus


def test_zcloud_has_static_security_controls_without_inline_styles():
    html = read("index.html")
    css = read("src/styles.css")
    assert "Content-Security-Policy" in html
    assert "connect-src 'none'" in html
    assert " style=" not in html
    assert "Zeaz Unified Design System token" in css
    assert "transition" in css


def test_zcloud_contains_no_disallowed_placeholders_or_private_keys():
    forbidden = ["replace-me", "changeme", "dummy-secret", "fake-token", "BEGIN PRIVATE KEY"]
    text_suffixes = {".html", ".css", ".js", ".mjs", ".json", ".md"}
    corpus = "\n".join(
        path.read_text(encoding="utf-8")
        for path in ZCLOUD.rglob("*")
        if path.is_file() and path.suffix in text_suffixes
    )
    for marker in forbidden:
        assert marker.lower() not in corpus.lower()
