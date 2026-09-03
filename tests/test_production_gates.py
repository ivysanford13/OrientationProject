"""Focused production-quality regression gates for Career Launchpad.

These tests intentionally call the same checks used by ``qa/run_qa_matrix.py``
so a fast targeted run and the full human-readable matrix cannot drift apart.
"""

from __future__ import annotations

import sys
import unittest
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from qa.run_qa_matrix import QARunner


class CareerLaunchpadProductionGateTests(unittest.TestCase):
    """Protect negative paths, responsive safety, and accessibility details."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.runner = QARunner()

    @classmethod
    def tearDownClass(cls) -> None:
        cls.runner.close()

    def test_resume_unconfirmed_four_skill_loadout_is_playable(self) -> None:
        self.runner.resume_unconfirmed_skills_loop()

    def test_completed_node_revisit_preserves_route_integrity(self) -> None:
        self.runner.completed_node_revisit_loop()

    def test_reflection_ctas_are_clear_of_skill_dock(self) -> None:
        self.runner.reflection_dock_overlap_loop()

    def test_career_cta_is_clear_of_skill_dock(self) -> None:
        self.runner.career_dock_overlap_loop()

    def test_short_landscape_map_is_clear_of_skill_dock(self) -> None:
        self.runner.short_landscape_dock_loop()

    def test_reflection_reflows_without_horizontal_scroll(self) -> None:
        self.runner.reflection_reflow_loop()

    def test_editing_starter_skills_is_confirmed_and_cancellable(self) -> None:
        self.runner.edit_skills_confirmation_loop()

    def test_skill_selection_retains_keyboard_focus(self) -> None:
        self.runner.skill_focus_retention_loop()

    def test_skill_dock_aria_labelledby_resolves(self) -> None:
        self.runner.dock_accessible_name_loop()

    def test_malformed_v2_storage_recovers_without_errors(self) -> None:
        self.runner.malformed_storage_recovery_loop()

    def test_deterministic_accessibility_metrics(self) -> None:
        self.runner.deterministic_accessibility_metrics_loop()


if __name__ == "__main__":
    unittest.main()
