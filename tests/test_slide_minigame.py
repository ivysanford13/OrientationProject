"""Browser coverage for the Projects and Delivery slide mini-game."""

from __future__ import annotations

import unittest
from pathlib import Path

from playwright.sync_api import Browser, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()


class SlideMiniGameTests(unittest.TestCase):
    """Protect slide rendering, placement, review, and progression."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def open_game(self) -> tuple[Page, list[str]]:
        """Open the standalone build directly at the slide task."""

        page = self.browser.new_page(viewport={"width": 1180, "height": 900})
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
                "activeDomainId": "domain-projects-delivery",
                "completed": ["region-people-lead"],
                "earned": [
                    {
                        "nodeId": "region-people-lead",
                        "skillId": "people-skills",
                    }
                ],
                "rejected": [],
                "selectedNodeId": "domain-projects-delivery",
                "travelTargetId": None,
                "travelFromId": None,
                "lastCareerId": None,
                "lastAward": False,
                "reviewingNodeId": None,
            },
        )
        page.reload()
        page.locator(".slide-workspace").wait_for()
        return page, errors

    def test_slide_uses_embedded_explorer_and_reaches_reflection(self) -> None:
        """The illustration must render offline and the full task must advance."""

        page, errors = self.open_game()
        try:
            source = page.locator(".slide-component-thumb").get_attribute("src") or ""
            self.assertTrue(source.startswith("data:image/png;base64,"))

            placements = (
                ("title", "headline"),
                ("subtitle", "subline"),
                ("illustration", "visual"),
                ("facts", "facts"),
                ("cta", "cta"),
            )
            for component_id, slot_id in placements:
                page.locator(
                    f'[data-action="slide-select"][data-slide-id="{component_id}"]'
                ).click()
                page.locator(f'[data-slide-slot="{slot_id}"]').click()

            page.get_by_role("button", name="Review my slide").click()
            for answer in ("students", "grouped", "support", "action"):
                page.locator(f'[data-slide-answer="{answer}"]').click()
            self.assertIn("4 / 4", page.locator(".qna-score").inner_text())

            page.get_by_role("button", name="Continue to enjoyment check").click()
            page.locator(".screen--reflection").wait_for()
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
