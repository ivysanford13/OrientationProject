"""Browser coverage for the 2D oak-door crafting mini-game."""

from __future__ import annotations

import unittest
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri() + "#minecraft-door"


class MinecraftDoorMiniGameTests(unittest.TestCase):
    """Verify gathering, the real shaped recipe, and responsive play."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def open_game(
        self, width: int = 1180, height: int = 900
    ) -> tuple[Page, list[str]]:
        """Open the standalone build at the woodworking task."""

        page = self.browser.new_page(viewport={"width": width, "height": height})
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.goto(APP_URL)
        page.locator(".minecraft-game").wait_for()
        return page, errors

    def reach_door_grid(self, page: Page) -> None:
        """Collect two logs and convert them into eight planks."""

        page.locator('[data-action="minecraft-move-tree"]').click()
        page.locator(".mc-action-key").click()
        page.locator(".mc-action-key").click()
        page.locator('[data-action="minecraft-move-table"]').first.click()
        page.get_by_role("button", name="Craft 8 oak planks").click()
        page.locator('.mc-craft-slot[data-action="minecraft-grid"]').first.wait_for()

    def test_real_door_recipe_completes_and_reaches_reflection(self) -> None:
        page, errors = self.open_game()
        try:
            self.reach_door_grid(page)
            self.assertIn("8", page.locator(".mc-hotbar").inner_text())

            for index in (0, 1, 3, 4, 6, 7):
                page.locator(f'[data-grid-index="{index}"]').click()

            page.get_by_role("button", name="Craft oak door").click()
            self.assertIn("OAK DOOR ×3", page.locator(".mc-craft-success").inner_text())
            self.assertIn("DOOR", page.locator(".mc-hotbar").inner_text())
            self.assertIn("3", page.locator(".mc-hotbar").inner_text())

            page.get_by_role("button", name="Continue to enjoyment check").click()
            page.locator(".screen--reflection").wait_for()
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_wrong_six_plank_shape_stays_in_crafting(self) -> None:
        page, errors = self.open_game()
        try:
            self.reach_door_grid(page)
            for index in (0, 1, 2, 3, 4, 5):
                page.locator(f'[data-grid-index="{index}"]').click()

            page.get_by_role("button", name="Craft oak door").click()
            self.assertIn("not a door", page.locator(".mc-status").inner_text())
            self.assertEqual(page.locator(".mc-craft-success").count(), 0)
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_phone_layout_has_no_horizontal_overflow(self) -> None:
        page, errors = self.open_game(width=390, height=844)
        try:
            self.reach_door_grid(page)
            self.assertEqual(
                page.evaluate("document.documentElement.scrollWidth"),
                page.evaluate("document.documentElement.clientWidth"),
            )
            self.assertEqual(page.locator('[data-action="minecraft-grid"]').count(), 9)
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
