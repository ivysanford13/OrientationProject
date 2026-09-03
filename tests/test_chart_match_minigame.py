"""Browser coverage for the playable data-to-chart matching mini-game."""

from __future__ import annotations

import unittest
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri() + "#chart-match"


class ChartMatchMiniGameTests(unittest.TestCase):
    """Verify wrong answers, keyboard play, cable drawing, and progression."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def open_game(self, width: int = 1180) -> tuple[Page, list[str]]:
        """Open the standalone build directly at the chart task."""

        page = self.browser.new_page(viewport={"width": width, "height": 900})
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.goto(APP_URL)
        page.locator(".chart-match-game").wait_for()
        return page, errors

    def connect(self, page: Page, sheet_id: str, chart_id: str) -> None:
        """Use the keyboard-equivalent two-click interaction."""

        page.locator(f'[data-chart-sheet-id="{sheet_id}"]').click()
        page.locator(f'[data-chart-id="{chart_id}"]').click()

    def test_three_correct_matches_draw_cables_and_unlock_progression(self) -> None:
        page, errors = self.open_game()
        try:
            self.connect(page, "oxygen-trend", "chart-line")
            self.connect(page, "room-tasks", "chart-bars")
            self.connect(page, "crew-mix", "chart-donut")

            page.get_by_role("button", name="Task complete").wait_for()
            self.assertEqual(page.locator(".chart-match-line[d]").count(), 3)
            self.assertEqual(page.locator(".data-sheet-card.is-matched").count(), 3)
            self.assertIn("All feeds restored", page.locator(".chart-match-status").inner_text())

            page.get_by_role("button", name="Task complete").click()
            page.locator(".screen--reflection").wait_for()
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_wrong_match_stays_open_and_preserves_selection(self) -> None:
        page, errors = self.open_game()
        try:
            self.connect(page, "oxygen-trend", "chart-donut")
            self.assertIn("different story", page.locator(".chart-match-status").inner_text())
            self.assertEqual(page.locator(".data-sheet-card.is-matched").count(), 0)
            self.assertEqual(
                page.locator('[data-chart-sheet-id="oxygen-trend"]').get_attribute("aria-pressed"),
                "true",
            )
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_dragging_a_cable_connects_the_matching_chart(self) -> None:
        page, errors = self.open_game()
        try:
            source = page.locator('[data-chart-sheet-id="oxygen-trend"]')
            target = page.locator('[data-chart-target-id="chart-line"]')
            source_box = source.bounding_box()
            target_box = target.bounding_box()
            assert source_box is not None and target_box is not None
            page.mouse.move(
                source_box["x"] + source_box["width"] / 2,
                source_box["y"] + source_box["height"] / 2,
            )
            page.mouse.down()
            page.mouse.move(
                target_box["x"] + target_box["width"] / 2,
                target_box["y"] + target_box["height"] / 2,
                steps=8,
            )
            page.mouse.up()
            self.assertEqual(page.locator(".data-sheet-card.is-matched").count(), 1)
            self.assertEqual(page.locator('.chart-match-line[data-chart-line-for="oxygen-trend"][d]').count(), 1)
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_mobile_keeps_all_controls_available(self) -> None:
        page, errors = self.open_game(width=390)
        try:
            self.assertEqual(page.locator(".data-sheet-card").count(), 3)
            self.assertEqual(page.locator(".chart-target-card").count(), 3)
            self.connect(page, "crew-mix", "chart-donut")
            self.assertEqual(page.locator(".data-sheet-card.is-matched").count(), 1)
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
