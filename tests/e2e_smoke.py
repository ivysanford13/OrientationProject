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
            page.get_by_role("button", name="Enter the field guide").click()

            self.assertEqual(page.locator(".region-card:enabled").count(), 3)
            self.assertEqual(page.locator(".map-node--domain:enabled").count(), 0)

            page.locator('[data-node-id="region-build-create"]').click()
            page.get_by_role("button", name="Skip for now").click()
            self.assertEqual(page.locator(".hex-item").count(), 1)

            page.locator('[data-node-id="domain-software-apps"]').click()
            page.get_by_role("button", name="Skip for now").click()
            self.assertEqual(page.locator(".hex-item").count(), 2)

            page.locator('[data-node-id="spec-code-build-uis"]').click()
            page.get_by_role("button", name="Skip for now").click()

            self.assertEqual(page.locator(".hex-item").count(), 3)
            self.assertEqual(
                page.locator("#career-title").text_content(), "Application Developer"
            )
            self.assertEqual(errors, [])
        finally:
            page.close()


if __name__ == "__main__":
    unittest.main()
