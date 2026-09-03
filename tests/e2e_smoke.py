"""Playwright smoke test for the generated offline Career Launchpad."""

from __future__ import annotations

import unittest
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()


class CareerLaunchpadSmokeTests(unittest.TestCase):
    """Exercise one complete map route in a real browser."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def open_fresh_page(self) -> tuple[Page, list[str]]:
        """Open the offline build with clean state and collect browser errors."""

        page = self.browser.new_page(viewport={"width": 1440, "height": 1000})
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        page.on(
            "console",
            lambda message: errors.append(message.text)
            if message.type == "error"
            else None,
        )
        page.goto(APP_URL)
        page.evaluate("window.localStorage.clear()")
        page.reload()
        return page, errors

    def test_complete_application_developer_route(self) -> None:
        page, errors = self.open_fresh_page()
        try:
            page.get_by_label("What should we call you?").fill("Dan")
            page.get_by_role("button", name="Choose my starter skills").click()

            for skill_id in (
                "starter-creative-thinking",
                "starter-coding-curiosity",
                "starter-hands-on-tech",
                "starter-visual-design",
            ):
                page.locator(f'[data-skill-id="{skill_id}"]').click()
            page.get_by_role("button", name="Reveal my world").click()

            self.assertEqual(page.locator(".hex-item").count(), 4)
            self.assertIn("BUILD AND CREATE", page.locator(".compass-card").inner_text())
            page.locator('[data-node-id="region-build-create"]').click()
            page.locator(".screen--challenge").wait_for()
            page.get_by_role("button", name="Skip game for now").click()
            page.get_by_role("button", name="Yes, keep going").click()
            self.assertEqual(page.locator(".hex-item").count(), 5)

            page.locator('[data-node-id="domain-software-apps"]').click()
            page.locator(".screen--challenge").wait_for()
            page.get_by_role("button", name="Skip game for now").click()
            page.get_by_role("button", name="Yes, keep going").click()
            self.assertEqual(page.locator(".hex-item").count(), 6)

            page.locator('[data-node-id="spec-code-build-uis"]').click()
            page.locator(".screen--career").wait_for()

            self.assertEqual(page.locator(".hex-item").count(), 7)
            self.assertEqual(
                len(page.evaluate("CareerLaunchpadApp.getState().earned")), 3
            )
            self.assertEqual(
                page.locator("#career-title").text_content(), "Application Developer"
            )
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_saved_third_mini_game_opens_career_without_third_reward(self) -> None:
        """Migrate a browser saved during the removed specialization challenge."""

        page, errors = self.open_fresh_page()
        try:
            page.evaluate(
                """state => localStorage.setItem('is-career-launchpad:v2', JSON.stringify(state))""",
                {
                    "version": 2,
                    "screen": "mini",
                    "name": "Dan",
                    "avatar": "cougar",
                    "starterSkills": [
                        "starter-creative-thinking",
                        "starter-coding-curiosity",
                        "starter-hands-on-tech",
                        "starter-visual-design",
                    ],
                    "recommendedRegionId": "region-build-create",
                    "activeRegionId": "region-build-create",
                    "activeDomainId": "domain-software-apps",
                    "completed": ["region-build-create", "domain-software-apps"],
                    "earned": [
                        {"skillId": "creativity", "nodeId": "region-build-create", "earnedAt": 1},
                        {"skillId": "software", "nodeId": "domain-software-apps", "earnedAt": 2},
                        {"skillId": "coder", "nodeId": "spec-code-build-uis", "earnedAt": 3},
                    ],
                    "rejected": [],
                    "selectedNodeId": "spec-code-build-uis",
                    "travelTargetId": None,
                    "travelFromId": None,
                    "lastCareerId": None,
                    "lastAward": False,
                    "reviewingNodeId": None,
                },
            )
            page.reload()

            page.locator(".screen--career").wait_for()
            self.assertEqual(page.locator("#career-title").text_content(), "Application Developer")
            self.assertEqual(page.locator(".hex-item").count(), 7)
            self.assertEqual(len(page.evaluate("CareerLaunchpadApp.getState().earned")), 3)
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
