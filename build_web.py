"""Build downloadable standalone web versions (single-file HTML + static web ZIP)."""

from __future__ import annotations

import re
import shutil
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PUBLIC_DIR = BASE_DIR / "public"
DIST_DIR = BASE_DIR / "dist"


def strip_esm(code: str) -> str:
    # Remove single-line and multi-line import statements
    code = re.sub(
        r'^\s*import\s+(?:[\s\S]*?\s+from\s+)?["\'][^"\']+["\'];\s*\n?',
        "",
        code,
        flags=re.MULTILINE,
    )
    # Remove export keywords on declarations
    code = re.sub(r"^\s*export\s+(?=(?:async\s+)?function\b|const\b|let\b|var\b|class\b)", "", code, flags=re.MULTILINE)
    return code.strip()


def build() -> tuple[Path, Path]:
    html_src = (PUBLIC_DIR / "index.html").read_text(encoding="utf-8")
    css_src = (PUBLIC_DIR / "styles.css").read_text(encoding="utf-8")
    food_db_src = strip_esm((PUBLIC_DIR / "food-db.js").read_text(encoding="utf-8"))
    storage_src = strip_esm((PUBLIC_DIR / "storage.js").read_text(encoding="utf-8"))
    app_src = strip_esm((PUBLIC_DIR / "app.js").read_text(encoding="utf-8"))

    bundle_js = (
        "(function () {\n"
        '  "use strict";\n\n'
        "  // === food-db.js ===\n"
        f"{food_db_src}\n\n"
        "  // === storage.js ===\n"
        f"{storage_src}\n\n"
        "  // === app.js ===\n"
        f"{app_src}\n"
        "})();\n"
    )

    DIST_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Single-file standalone HTML (works via file:// double-click or any static host)
    single_html = html_src.replace(
        '<link rel="stylesheet" href="./styles.css" />',
        f"<style>\n{css_src}\n  </style>",
    ).replace(
        '<script type="module" src="./app.js"></script>',
        f"<script>\n{bundle_js}\n  </script>",
    )
    single_path = DIST_DIR / "CalorieNote-網頁試用版.html"
    single_path.write_text(single_html, encoding="utf-8")

    # 2. Multi-file static web folder (classic script, also works via file:// or static hosting)
    static_dir = DIST_DIR / "web-static"
    if static_dir.exists():
        shutil.rmtree(static_dir)
    static_dir.mkdir(parents=True, exist_ok=True)

    static_html = html_src.replace(
        '<script type="module" src="./app.js"></script>',
        '<script src="./app.bundle.js"></script>',
    )
    (static_dir / "index.html").write_text(static_html, encoding="utf-8")
    (static_dir / "styles.css").write_text(css_src, encoding="utf-8")
    (static_dir / "app.bundle.js").write_text(bundle_js, encoding="utf-8")

    # 3. ZIP archive containing both the single HTML and static web folder
    zip_path = DIST_DIR / "CalorieNote-網頁試用版.zip"
    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        zf.write(single_path, arcname="CalorieNote-網頁試用版.html")
        for f in sorted(static_dir.iterdir()):
            zf.write(f, arcname=f"web-static/{f.name}")

    return single_path, zip_path


if __name__ == "__main__":
    single, zip_file = build()
    print(f"Built single HTML: {single} ({single.stat().st_size} bytes)")
    print(f"Built ZIP package: {zip_file} ({zip_file.stat().st_size} bytes)")
