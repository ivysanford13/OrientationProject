#!/usr/bin/env python3
"""Bundle the editable Career Launchpad source into one offline HTML file."""

from __future__ import annotations

import base64
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = PROJECT_ROOT / "src"
DEFAULT_OUTPUT = PROJECT_ROOT / "index.html"


def read_source(filename: str) -> str:
    """Return one UTF-8 source file, failing clearly when it is missing."""

    path = SOURCE_DIR / filename
    if not path.is_file():
        raise FileNotFoundError(f"Required source file is missing: {path}")
    return path.read_text(encoding="utf-8")


def image_data_uri(filename: str) -> str:
    """Return a supported image asset as an offline-safe data URI."""

    path = SOURCE_DIR / "assets" / filename
    if not path.is_file():
        raise FileNotFoundError(f"Required image asset is missing: {path}")
    mime_by_suffix = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg"}
    mime_type = mime_by_suffix.get(path.suffix.lower())
    if mime_type is None:
        raise ValueError(f"Unsupported image format: {path.suffix}")
    encoded = base64.b64encode(path.read_bytes()).decode("ascii")
    return f"data:{mime_type};base64,{encoded}"


def build(output_path: Path = DEFAULT_OUTPUT) -> Path:
    """Inline the stylesheet and scripts into the standalone deliverable."""

    template = read_source("template.html")
    replacements = {
        "__INLINE_CSS__": read_source("styles.css"),
        "__INLINE_DATA__": read_source("data.js"),
        "__INLINE_RESEARCH__": read_source("research-data.js"),
        "__INLINE_APP__": read_source("app.js"),
        "__EXPLORER_AVATAR_DATA_URI__": image_data_uri("byu-cougar-explorer.png"),
        "__WORLD_BUILD_ATLAS_DATA_URI__": image_data_uri("career-world-build-v2.jpg"),
        "__WORLD_ANALYZE_ATLAS_DATA_URI__": image_data_uri("career-world-analyze-v2.jpg"),
        "__WORLD_PEOPLE_ATLAS_DATA_URI__": image_data_uri("career-world-people-v2.jpg"),
    }

    document = template
    for marker, source in replacements.items():
        if marker not in document:
            raise ValueError(f"Template marker is missing: {marker}")
        document = document.replace(marker, source)

    unresolved = [marker for marker in replacements if marker in document]
    if unresolved:
        raise ValueError(f"Unresolved template markers: {', '.join(unresolved)}")

    output_path.write_text(document, encoding="utf-8")
    return output_path


if __name__ == "__main__":
    built_file = build()
    print(f"Built {built_file}")
