"""Browser coverage for the playable website-hosting mini-game."""

from __future__ import annotations

import unittest
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()


class DeployMiniGameTests(unittest.TestCase):
    """Verify drag, keyboard fallback, hosting, and progression behavior."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def open_game(
        self, width: int = 1180, height: int = 860
    ) -> tuple[Page, list[str]]:
        """Open the offline build directly at the Users and Product task."""

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
        page.evaluate(
            """state => localStorage.setItem('is-career-launchpad:v2', JSON.stringify(state))""",
            {
                "version": 2,
                "screen": "mini",
                "name": "Dan",
                "avatar": "cougar",
                "starterSkills": [
                    "starter-communication",
                    "starter-leadership",
                    "starter-empathy",
                    "starter-visual-design",
                ],
                "recommendedRegionId": "region-people-lead",
                "activeRegionId": "region-people-lead",
                "activeDomainId": "domain-users-products",
                "completed": ["region-people-lead"],
                "earned": [
                    {
                        "nodeId": "region-people-lead",
                        "skillId": "people-skills",
                    }
                ],
                "rejected": [],
                "selectedNodeId": "domain-users-products",
                "travelTargetId": None,
                "travelFromId": None,
                "lastCareerId": None,
                "lastAward": False,
                "reviewingNodeId": None,
            },
        )
        page.reload()
        page.locator(".deploy-game").wait_for()
        return page, errors

    def test_drag_file_then_host_reveals_progression(self) -> None:
        """The Host action must appear only after the file reaches the folder."""

        page, errors = self.open_game()
        try:
            self.assertEqual(page.locator('[data-action="host-site"]').count(), 0)
            page.locator(".deploy-file").drag_to(page.locator(".deploy-folder"))

            host = page.get_by_role("button", name="Host", exact=True)
            host.wait_for()
            self.assertIn("portfolio.html is ready", page.locator(".deploy-status").inner_text())
            host.click()

            self.assertIn("SITE IS LIVE", page.locator(".deploy-live-card").inner_text())
            page.get_by_role("button", name="Continue to trail check").click()
            page.locator(".screen--reflection").wait_for()
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_click_sequence_is_keyboard_equivalent(self) -> None:
        """Selecting the file and folder reproduces the drag gesture."""

        page, errors = self.open_game()
        try:
            page.get_by_role("button", name="portfolio.html HTML document").click()
            self.assertIn("selected", page.locator(".deploy-status").inner_text())
            page.get_by_role("button", name="GitHub Local folder").click()
            page.get_by_role("button", name="Host", exact=True).click()
            self.assertIn("Website online", page.locator(".deploy-status").inner_text())
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_phone_layout_stays_inside_the_viewport(self) -> None:
        """Keep the installer task usable without sideways scrolling."""

        page, errors = self.open_game(width=390, height=844)
        try:
            self.assertEqual(
                page.evaluate("document.documentElement.scrollWidth"),
                page.evaluate("document.documentElement.clientWidth"),
            )
            page.get_by_role("button", name="portfolio.html HTML document").click()
            page.get_by_role("button", name="GitHub Local folder").click()
            page.get_by_role("button", name="Host", exact=True).click()
            self.assertEqual(
                page.evaluate("document.documentElement.scrollWidth"),
                page.evaluate("document.documentElement.clientWidth"),
            )
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
