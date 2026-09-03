"""Capture representative Career Launchpad screens for visual QA."""

from __future__ import annotations

from pathlib import Path

from playwright.sync_api import sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()
SCREENSHOT_DIR = PROJECT_ROOT / "qa" / "screenshots"


def capture() -> None:
    """Save desktop screenshots of the primary user journey."""

    SCREENSHOT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        page.goto(APP_URL)
        page.evaluate("window.localStorage.clear()")
        page.reload()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "01-landing.png", full_page=True)

        page.get_by_label("What should we call you?").fill("Dan")
        page.get_by_role("button", name="Enter the field guide").click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "02-map.png", full_page=True)

        page.locator('[data-node-id="region-build-create"]').click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "03-placeholder.png", full_page=True)
        page.get_by_role("button", name="Skip for now").click()
        page.wait_for_timeout(900)
        page.screenshot(path=SCREENSHOT_DIR / "04-reward-map.png", full_page=True)

        page.locator('[data-node-id="domain-software-apps"]').click()
        page.get_by_role("button", name="Skip for now").click()
        page.locator('[data-node-id="spec-code-build-uis"]').click()
        page.get_by_role("button", name="Skip for now").click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "05-career.png", full_page=True)
        browser.close()


if __name__ == "__main__":
    capture()
