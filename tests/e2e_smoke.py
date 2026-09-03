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
            page.locator('[data-action="minecraft-move-tree"]').click()
            page.locator(".mc-action-key").click()
            page.locator(".mc-action-key").click()
            page.locator('[data-action="minecraft-move-table"]').first.click()
            page.locator('[data-action="minecraft-craft-planks"]').click()
            for grid_index in (0, 1, 3, 4, 6, 7):
                page.locator(f'[data-grid-index="{grid_index}"]').click()
            page.locator('[data-action="minecraft-craft-door"]').click()
            page.locator('[data-action="finish-game"]').click()
            page.get_by_role("button", name="Yes, keep going").click()
            self.assertEqual(page.locator(".hex-item").count(), 5)

            page.locator('[data-node-id="domain-software-apps"]').click()
            page.locator(".screen--challenge").wait_for()
            for command in (
                "move",
                "left",
                "move",
                "move",
                "right",
                "move",
                "move",
                "move",
            ):
                page.locator(f'[data-scratch-id="{command}"]').click()
            page.locator('[data-action="scratch-check"]').click()
            page.get_by_role("button", name="Continue to enjoyment check").click()
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

    def test_analyze_region_jigsaw_completes_with_keyboard_controls(self) -> None:
        """Solve the playable six-panel task and preserve the reward contract."""

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
                        "starter-numbers-patterns",
                        "starter-problem-solving",
                        "starter-security-mindset",
                        "starter-coding-curiosity",
                    ],
                    "recommendedRegionId": "region-analyze-solve",
                    "activeRegionId": "region-analyze-solve",
                    "activeDomainId": None,
                    "completed": [],
                    "earned": [],
                    "rejected": [],
                    "selectedNodeId": "region-analyze-solve",
                    "travelTargetId": None,
                    "travelFromId": None,
                    "lastCareerId": None,
                    "lastAward": False,
                    "reviewingNodeId": None,
                },
            )
            page.reload()
            page.locator(".jigsaw-console").wait_for()

            self.assertEqual(page.locator(".jigsaw-piece").count(), 6)
            self.assertEqual(page.locator(".jigsaw-slot").count(), 6)
            self.assertEqual(page.get_by_role("button", name="Continue to trail check").count(), 0)
            self.assertIn(
                "dock--inline", page.locator("#skill-dock").get_attribute("class") or ""
            )
            self.assertEqual(
                page.evaluate("document.documentElement.scrollWidth"),
                page.evaluate("window.innerWidth"),
            )

            for piece_index in range(6):
                piece = page.locator(f'[data-piece-index="{piece_index}"]')
                piece.focus()
                piece.press("Enter")
                slot = page.locator(f'[data-slot-index="{piece_index}"]')
                slot.focus()
                slot.press("Enter")

            page.get_by_role("button", name="Continue to trail check").click()
            page.locator(".screen--reflection").wait_for()
            page.get_by_role("button", name="Yes, keep going").click()

            self.assertEqual(page.locator(".hex-item").count(), 5)
            self.assertEqual(
                page.evaluate("CareerLaunchpadApp.getState().earned[0].skillId"),
                "analyst",
            )
            self.assertEqual(errors, [])
        finally:
            page.close()

    def test_people_region_team_builder_guides_and_accepts_any_three(self) -> None:
        """Draft a complementary crew and preserve the normal reward contract."""

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
                        "starter-communication",
                        "starter-leadership",
                        "starter-empathy",
                        "starter-problem-solving",
                    ],
                    "recommendedRegionId": "region-people-lead",
                    "activeRegionId": "region-people-lead",
                    "activeDomainId": None,
                    "completed": [],
                    "earned": [],
                    "rejected": [],
                    "selectedNodeId": "region-people-lead",
                    "travelTargetId": None,
                    "travelFromId": None,
                    "lastCareerId": None,
                    "lastAward": False,
                    "reviewingNodeId": None,
                },
            )
            page.reload()
            page.locator(".team-console").wait_for()

            self.assertEqual(page.locator(".crew-candidate").count(), 6)
            self.assertEqual(page.locator(".crew-candidate.is-suggested").count(), 3)
            initial_advice = page.locator(".crew-advice").inner_text()
            self.assertIn("Nova or Pixel add fresh ideas", initial_advice)
            self.assertIn("Patch adds hands-on building", initial_advice)
            self.assertTrue(page.get_by_role("button", name="Lock in this crew").is_disabled())

            for candidate_id in ("nova", "patch", "orbit"):
                page.locator(f'[data-candidate-id="{candidate_id}"]').click()

            self.assertEqual(page.locator(".crew-slot.is-filled").count(), 3)
            self.assertIn("all four strengths covered", page.locator(".crew-advice").inner_text())
            self.assertFalse(page.get_by_role("button", name="Lock in this crew").is_disabled())

            page.get_by_role("button", name="Lock in this crew").click()
            page.locator(".screen--reflection").wait_for()
            page.get_by_role("button", name="Yes, keep going").click()

            self.assertEqual(page.locator(".hex-item").count(), 5)
            self.assertEqual(
                page.evaluate("CareerLaunchpadApp.getState().earned[0].skillId"),
                "people-skills",
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
