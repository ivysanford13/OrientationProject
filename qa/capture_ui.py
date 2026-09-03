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
        page.get_by_role("button", name="Choose my starter skills").click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "02-skill-loadout.png", full_page=True)

        for skill_id in (
            "starter-creative-thinking",
            "starter-coding-curiosity",
            "starter-hands-on-tech",
            "starter-visual-design",
        ):
            page.locator(f'[data-skill-id="{skill_id}"]').click()
        page.get_by_role("button", name="Reveal my world").click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "03-world-map.png", full_page=True)

        page.locator('[data-node-id="region-build-create"]').click()
        page.wait_for_timeout(350)
        page.screenshot(path=SCREENSHOT_DIR / "04-avatar-travel.png", full_page=True)
        page.locator(".screen--challenge").wait_for()
        page.screenshot(path=SCREENSHOT_DIR / "05-placeholder.png", full_page=True)
        page.get_by_role("button", name="Skip game for now").click()
        page.screenshot(path=SCREENSHOT_DIR / "06-enjoyment-check.png", full_page=True)
        page.get_by_role("button", name="Yes, keep going").click()
        page.wait_for_timeout(700)
        page.screenshot(path=SCREENSHOT_DIR / "07-shifted-world.png", full_page=True)

        page.locator('[data-node-id="domain-software-apps"]').click()
        page.locator(".screen--challenge").wait_for()
        page.get_by_role("button", name="Skip game for now").click()
        page.get_by_role("button", name="Yes, keep going").click()
        page.locator('[data-node-id="spec-code-build-uis"]').click()
        page.locator(".screen--challenge").wait_for()
        page.get_by_role("button", name="Skip game for now").click()
        page.get_by_role("button", name="Yes, keep going").click()
        page.wait_for_timeout(600)
        page.screenshot(path=SCREENSHOT_DIR / "08-career.png", full_page=True)
        browser.close()


if __name__ == "__main__":
    capture()
