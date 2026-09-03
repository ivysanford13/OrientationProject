"""Regression tests for the standalone Career Launchpad build."""

from __future__ import annotations

import importlib.util
import tempfile
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
BUILD_SCRIPT = PROJECT_ROOT / "scripts" / "build.py"


def load_build_module():
    """Load the build script without requiring scripts to be a package."""

    spec = importlib.util.spec_from_file_location("career_launchpad_build", BUILD_SCRIPT)
    if spec is None or spec.loader is None:
        raise RuntimeError("Unable to load scripts/build.py")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


class BuildTests(unittest.TestCase):
    """Verify that the generated HTML is complete and offline-safe."""

    def test_build_inlines_every_source(self) -> None:
        build_module = load_build_module()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "index.html"
            build_module.build(output)
            document = output.read_text(encoding="utf-8")

        self.assertIn("<style", document)
        self.assertIn("CAREER_LAUNCHPAD_DATA", document)
        self.assertNotIn("__INLINE_CSS__", document)
        self.assertNotIn("__INLINE_DATA__", document)
        self.assertNotIn("__INLINE_APP__", document)
        self.assertNotIn("__EXPLORER_AVATAR_DATA_URI__", document)
        self.assertNotIn("__WORLD_BUILD_ATLAS_DATA_URI__", document)
        self.assertNotIn("__WORLD_ANALYZE_ATLAS_DATA_URI__", document)
        self.assertNotIn("__WORLD_PEOPLE_ATLAS_DATA_URI__", document)

    def test_build_embeds_one_sized_cougar_asset(self) -> None:
        """Keep the single-file avatar efficient and layout-stable."""

        build_module = load_build_module()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "index.html"
            build_module.build(output)
            document = output.read_text(encoding="utf-8")
            output_size = output.stat().st_size

        self.assertEqual(document.count("data:image/png;base64,"), 1)
        self.assertIn('width="1254" height="1254"', document)
        self.assertEqual(document.count("data:image/jpeg;base64,"), 3)
        self.assertLess(output_size, 4_700_000)

    def test_build_has_no_external_runtime_dependencies(self) -> None:
        build_module = load_build_module()
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "index.html"
            build_module.build(output)
            document = output.read_text(encoding="utf-8").lower()

        self.assertNotIn("<script src=", document)
        self.assertNotIn("<link rel=\"stylesheet\"", document)


if __name__ == "__main__":
    unittest.main()
