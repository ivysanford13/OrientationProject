"""Deterministic browser QA matrix for the offline Career Launchpad build.

The runner deliberately tests the generated root ``index.html`` instead of a
development server.  This keeps the checks representative of the assignment
deliverable: a user can download the file, open it, and complete a route with
no network, account, or API dependency.

Each named loop records inspect/action/assert/result details to ``QA_LOG.md``.
The command exits non-zero when any loop fails so it can be used as a release
gate by the lead agent.
"""

from __future__ import annotations

import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Iterable, Optional

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()
LOG_PATH = Path(__file__).resolve().parent / "QA_LOG.md"
STORAGE_KEY = "is-career-launchpad:v1"


@dataclass(frozen=True)
class Route:
    """One complete terminal path through the three-tier map."""

    label: str
    region_id: str
    domain_id: str
    specialization_id: str
    career_title: str
    skills: tuple[str, str, str]


ROUTES: tuple[Route, ...] = (
    Route("Application Developer", "region-build-create", "domain-software-apps", "spec-code-build-uis", "Application Developer", ("Creativity", "Software", "Coder")),
    Route("Software Engineer", "region-build-create", "domain-software-apps", "spec-architect-software", "Software Engineer", ("Creativity", "Software", "Designer")),
    Route("Cloud Engineer", "region-build-create", "domain-systems-tech", "spec-deploy-cloud-platforms", "Cloud Engineer", ("Creativity", "Hardware", "Cloud Builder")),
    Route("Systems Engineer", "region-build-create", "domain-systems-tech", "spec-support-connected-systems", "Systems Engineer", ("Creativity", "Hardware", "Systems Thinker")),
    Route("Data Analyst", "region-analyze-solve", "domain-data-insights", "spec-explain-trends-data", "Data Analyst", ("Analyst", "Numbers", "Trendy")),
    Route("Data Scientist", "region-analyze-solve", "domain-data-insights", "spec-predict-outcomes-models", "Data Scientist", ("Analyst", "Numbers", "Fortune Teller")),
    Route("Cybersecurity Analyst", "region-analyze-solve", "domain-security-risk", "spec-detect-investigate-threats", "Cybersecurity Analyst", ("Analyst", "Hacker", "Detective")),
    Route("IT Risk Analyst", "region-analyze-solve", "domain-security-risk", "spec-evaluate-controls-risk", "IT Risk Analyst", ("Analyst", "Hacker", "Bodyguard")),
    Route("IT Project Manager", "region-people-lead", "domain-projects-delivery", "spec-plan-timelines-delivery", "IT Project Manager", ("People Skills", "Speech", "Logistical")),
    Route("Business Analyst", "region-people-lead", "domain-projects-delivery", "spec-improve-processes-requirements", "Business Analyst", ("People Skills", "Speech", "Renovator")),
    Route("UX Designer", "region-people-lead", "domain-users-products", "spec-research-design-experiences", "UX Designer", ("People Skills", "Market Reach", "Creative")),
    Route("Product Manager", "region-people-lead", "domain-users-products", "spec-set-strategy-prioritize-value", "Product Manager", ("People Skills", "Market Reach", "Strategist")),
)


@dataclass
class LoopResult:
    """Recorded outcome for one QA loop."""

    number: int
    name: str
    inspect: str
    action: str
    assertion: str
    status: str = "PASS"
    details: str = ""
    duration_ms: int = 0


class QARunner:
    """Own browser lifecycle, deterministic state reset, and loop logging."""

    def __init__(self) -> None:
        self.playwright = sync_playwright().start()
        self.browser: Browser = self.playwright.chromium.launch(headless=True)
        self.contexts: list[BrowserContext] = []
        self.results: list[LoopResult] = []

    def close(self) -> None:
        """Close all browser resources even when a loop fails."""

        try:
            for context in reversed(self.contexts):
                try:
                    context.close()
                except Exception:
                    pass
            self.browser.close()
        finally:
            self.playwright.stop()

    def context(self, viewport: dict[str, int], reduced_motion: bool = False) -> BrowserContext:
        """Create an isolated browser context for a loop."""

        context = self.browser.new_context(
            viewport=viewport,
            reduced_motion="reduce" if reduced_motion else "no-preference",
        )
        self.contexts.append(context)
        return context

    def fresh_page(
        self,
        viewport: Optional[dict[str, int]] = None,
        reduced_motion: bool = False,
        context: Optional[BrowserContext] = None,
    ) -> tuple[Page, BrowserContext, list[str], list[str]]:
        """Open ``index.html`` and return page plus browser diagnostics."""

        owned_context = context or self.context(viewport or {"width": 1440, "height": 1000}, reduced_motion)
        page = owned_context.new_page()
        errors: list[str] = []
        requests: list[str] = []
        page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
        page.on(
            "console",
            lambda message: errors.append(f"console: {message.text}")
            if message.type == "error"
            else None,
        )
        page.on("request", lambda request: requests.append(request.url))
        page.goto(APP_URL, wait_until="load")
        # A local file has no network lifecycle to settle; a short render wait
        # is deterministic and avoids waiting on browser network-idle heuristics.
        page.wait_for_timeout(25)
        page.evaluate("window.localStorage.clear()")
        page.reload(wait_until="load")
        page.wait_for_timeout(25)
        page.wait_for_timeout(35)
        return page, owned_context, errors, requests

    @staticmethod
    def start(page: Page, name: str = "QA Explorer") -> None:
        """Start a journey through the semantic landing controls."""

        page.get_by_label("What should we call you?").fill(name)
        page.get_by_role("button", name=re.compile("Enter the field guide")).click()
        page.locator(".screen--map").wait_for()

    @staticmethod
    def assert_clean(page: Page, errors: list[str]) -> None:
        """Fail on browser errors and on an unrendered application surface."""

        if errors:
            raise AssertionError("; ".join(errors))
        if page.locator("#app").inner_text().strip() == "":
            raise AssertionError("#app rendered no visible content")

    @staticmethod
    def assert_no_horizontal_overflow(page: Page) -> None:
        """Ensure the current responsive surface does not create page overflow."""

        dimensions = page.evaluate(
            """() => ({
                scrollWidth: document.documentElement.scrollWidth,
                clientWidth: document.documentElement.clientWidth,
                bodyScrollWidth: document.body.scrollWidth,
                bodyClientWidth: document.body.clientWidth,
            })"""
        )
        if dimensions["scrollWidth"] > dimensions["clientWidth"] + 1:
            raise AssertionError(f"horizontal overflow: {dimensions}")
        if dimensions["bodyScrollWidth"] > dimensions["bodyClientWidth"] + 1:
            raise AssertionError(f"body horizontal overflow: {dimensions}")

    @staticmethod
    def skip_node(page: Page, node_id: str) -> None:
        """Open a visible map node and acknowledge its placeholder challenge."""

        node = page.locator(f'[data-node-id="{node_id}"]')
        if node.count() != 1:
            raise AssertionError(f"expected one map node {node_id}, found {node.count()}")
        if node.is_disabled():
            raise AssertionError(f"map node {node_id} is still locked")
        node.click()
        page.locator(".screen--challenge").wait_for()
        if page.locator('[aria-label="Planned mini-game workspace"]').count() != 1:
            raise AssertionError(f"placeholder workspace missing for {node_id}")
        button = page.get_by_role("button", name=re.compile("Skip for now|Keep this skill"))
        if button.count() != 1:
            raise AssertionError(f"expected one skip control for {node_id}, found {button.count()}")
        button.click()
        page.wait_for_timeout(20)

    def run_loop(
        self,
        name: str,
        inspect: str,
        action: str,
        assertion: str,
        fn: Callable[[], str],
    ) -> None:
        """Run one named inspect/action/assert loop and capture timing."""

        result = LoopResult(len(self.results) + 1, name, inspect, action, assertion)
        started = time.perf_counter()
        try:
            result.details = fn()
        except Exception as error:  # pragma: no cover - exercised by release failures
            result.status = "FAIL"
            result.details = f"{type(error).__name__}: {error}"
        finally:
            result.duration_ms = int((time.perf_counter() - started) * 1000)
            self.results.append(result)
            print(f"{result.number:02d} {result.status} {result.name} ({result.duration_ms} ms)", flush=True)

    def route_loop(self, route: Route) -> str:
        """Exercise one full route and verify its exact three-skill reward."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, route.label)
            if page.locator(".region-card:enabled").count() != 3:
                raise AssertionError("map did not expose exactly three open regions")
            self.skip_node(page, route.region_id)
            if page.locator(".hex-item").count() != 1:
                raise AssertionError("region reward did not create one skill hex")
            self.skip_node(page, route.domain_id)
            if page.locator(".hex-item").count() != 2:
                raise AssertionError("domain reward did not create second skill hex")
            self.skip_node(page, route.specialization_id)
            page.locator("#career-title").wait_for()
            title = page.locator("#career-title").inner_text().strip()
            if title.casefold() != route.career_title.casefold():
                raise AssertionError(f"expected career {route.career_title!r}, got {title!r}")
            state = page.evaluate("CareerLaunchpadApp.getState()")
            earned_labels = page.locator(".hex-item strong").all_inner_texts()
            if len(state["completed"]) != 3 or len(state["earned"]) != 3:
                raise AssertionError(f"route state should contain exactly 3 completed/rewards: {state}")
            if earned_labels != list(route.skills):
                raise AssertionError(f"expected reward order {route.skills}, got {earned_labels}")
            self.assert_clean(page, errors)
            return f"career={title}; rewards={', '.join(earned_labels)}"
        finally:
            pass

    def landing_layout(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 1440, "height": 1000})
        try:
            if page.locator(".screen--landing").count() != 1:
                raise AssertionError("landing screen missing")
            if page.locator("#welcome-title").bounding_box()["width"] < 300:
                raise AssertionError("desktop landing title unexpectedly narrow")
            if page.locator(".avatar-choice").count() != 4:
                raise AssertionError("landing should offer four explorers")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return "1440px landing; four avatars; no horizontal overflow"
        finally:
            pass

    def tablet_layout(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 900, "height": 900})
        try:
            self.start(page)
            regions = page.locator(".map-regions")
            columns = regions.evaluate("element => getComputedStyle(element).gridTemplateColumns")
            if len(columns.split()) != 3:
                raise AssertionError(f"tablet map should preserve three region columns; computed columns={columns!r}")
            if page.locator(".region-card:enabled").count() != 3:
                raise AssertionError("tablet map should show all three top-level regions")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return f"900px tablet; map columns={columns!r}; three region columns remain readable"
        finally:
            pass

    def mobile_route(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 390, "height": 844})
        try:
            self.start(page, "Mobile Explorer")
            region = page.locator(f'[data-node-id="{ROUTES[0].region_id}"]')
            region.click()
            page.locator(".screen--challenge").wait_for()
            challenge_width = page.locator(".challenge-layout").bounding_box()["width"]
            page.get_by_role("button", name=re.compile("Skip for now")).click()
            page.wait_for_timeout(30)
            if challenge_width > 390:
                raise AssertionError(f"mobile challenge is wider than viewport: {challenge_width}")
            self.skip_node(page, ROUTES[0].domain_id)
            self.skip_node(page, ROUTES[0].specialization_id)
            if page.locator("#career-title").inner_text().strip().casefold() != ROUTES[0].career_title.casefold():
                raise AssertionError("mobile terminal career did not render")
            if page.locator(".hex-item").count() != 3:
                raise AssertionError("mobile route did not preserve the three-skill stack")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return f"390px mobile; challenge width={challenge_width:.0f}px; terminal route works"
        finally:
            pass

    def resume_loop(self) -> str:
        context = self.context({"width": 1200, "height": 900})
        page, _context, errors, _requests = self.fresh_page(context=context)
        try:
            self.start(page, "Resume Explorer")
            self.skip_node(page, ROUTES[0].region_id)
            persisted = page.evaluate(f"JSON.parse(localStorage.getItem('{STORAGE_KEY}'))")
            if persisted["completed"] != [ROUTES[0].region_id]:
                raise AssertionError(f"unexpected persisted state: {persisted}")
            page.close()
            resumed = context.new_page()
            resumed.goto(APP_URL, wait_until="load")
            resumed.wait_for_timeout(30)
            resumed.wait_for_timeout(30)
            if not resumed.locator(".screen--map").count():
                raise AssertionError("new page did not resume at the map")
            if "Resume Explorer" not in resumed.locator(".map-start").inner_text():
                raise AssertionError("resumed map omitted player name")
            if resumed.locator(".hex-item").count() != 1:
                raise AssertionError("resumed map omitted earned skill")
            self.assert_clean(resumed, errors)
            return "persisted completed region, player name, and one skill across reload"
        finally:
            pass

    def restart_loop(self) -> str:
        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "Reset Explorer")
            self.skip_node(page, ROUTES[0].region_id)
            page.locator('[data-node-id="domain-software-apps"]').click()
            page.get_by_role("button", name="Restart").click()
            dialog = page.get_by_role("dialog")
            dialog.wait_for()
            if "fresh journey" not in dialog.inner_text().lower():
                raise AssertionError("restart confirmation did not explain the reset")
            dialog.get_by_role("button", name="Restart journey").click()
            page.locator(".screen--landing").wait_for()
            if page.locator(".hex-item").count() != 0:
                raise AssertionError("restart left skill hexes behind")
            if page.locator("#player-name").input_value() != "":
                raise AssertionError("restart left player name behind")
            persisted = page.evaluate(f"JSON.parse(localStorage.getItem('{STORAGE_KEY}'))")
            if persisted["screen"] != "landing" or persisted["completed"]:
                raise AssertionError(f"restart did not clear state: {persisted}")
            self.assert_clean(page, errors)
            return "confirmation dialog shown; restart cleared UI and localStorage"
        finally:
            pass

    def keyboard_loop(self) -> str:
        page, context, errors, _requests = self.fresh_page()
        try:
            page.locator("#player-name").focus()
            page.keyboard.type("Keyboard Explorer")
            page.keyboard.press("Enter")
            page.locator(".screen--map").wait_for()
            # Let the app's post-render focus helper finish before selecting
            # the first map node with keyboard input.
            page.wait_for_timeout(70)
            for node_id in (ROUTES[0].region_id, ROUTES[0].domain_id, ROUTES[0].specialization_id):
                target = page.locator(f'[data-node-id="{node_id}"]')
                target.focus()
                page.keyboard.press("Enter")
                page.locator(".screen--challenge").wait_for()
                page.wait_for_timeout(70)
                skip = page.get_by_role("button", name=re.compile("Skip for now|Keep this skill"))
                skip.focus()
                page.keyboard.press("Enter")
                page.wait_for_timeout(20)
            if page.locator("#career-title").inner_text().strip().casefold() != ROUTES[0].career_title.casefold():
                raise AssertionError("keyboard route did not reach terminal career")
            state = page.evaluate("CareerLaunchpadApp.getState()")
            if len(state["earned"]) != 3:
                raise AssertionError("keyboard route did not award three skills")
            self.assert_clean(page, errors)
            return "name entry, three map transitions, and rewards completed through focus + Enter"
        finally:
            pass

    def reduced_motion_loop(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 1200, "height": 900}, reduced_motion=True)
        try:
            if page.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches") is not True:
                raise AssertionError("reduced-motion media query was not enabled")
            self.start(page, "Low Motion Explorer")
            self.skip_node(page, ROUTES[0].region_id)
            animation = page.locator(".hex-item").evaluate("element => getComputedStyle(element).animationDuration")
            if animation not in {"0s", "0.01s", "1e-05s"}:
                raise AssertionError(f"skill reward animation was not reduced: {animation}")
            self.assert_clean(page, errors)
            return f"prefers-reduced-motion=true; reward animation duration={animation}"
        finally:
            pass

    def offline_loop(self) -> str:
        page, context, errors, requests = self.fresh_page({"width": 1200, "height": 900})
        try:
            self.start(page, "Offline Explorer")
            self.skip_node(page, ROUTES[0].region_id)
            self.skip_node(page, ROUTES[0].domain_id)
            self.skip_node(page, ROUTES[0].specialization_id)
            external = [url for url in requests if not url.startswith("file:")]
            if external:
                raise AssertionError(f"external requests observed: {external}")
            if not page.url.startswith("file:"):
                raise AssertionError(f"app left offline file URL: {page.url}")
            html = page.content().lower()
            if "<script src=" in html or '<link rel="stylesheet"' in html:
                raise AssertionError("generated HTML still references external runtime assets")
            self.assert_clean(page, errors)
            return "terminal route completed from file:// with no external requests or linked runtime assets"
        finally:
            pass

    def write_log(self) -> None:
        """Write a compact, human-readable release-gate report."""

        passed = sum(result.status == "PASS" for result in self.results)
        lines = [
            "# Career Launchpad QA Matrix",
            "",
            f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S %z')}",
            f"Target: `{APP_URL}`",
            f"Result: **{passed}/{len(self.results)} PASS**",
            "",
        ]
        for result in self.results:
            lines.extend(
                [
                    f"## {result.number:02d}. {result.name} — {result.status}",
                    f"- inspect: {result.inspect}",
                    f"- action: {result.action}",
                    f"- assert: {result.assertion}",
                    f"- result: {result.details}",
                    f"- duration: {result.duration_ms} ms",
                    "",
                ]
            )
        LOG_PATH.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    """Run exactly twenty named release loops and return a shell status."""

    runner = QARunner()
    try:
        for route in ROUTES:
            runner.run_loop(
                f"Complete route — {route.label}",
                f"fresh state exposes {route.region_id} → {route.domain_id} → {route.specialization_id}",
                "start journey; skip each planned mini-game placeholder in order",
                f"career title={route.career_title}; exactly three rewards={', '.join(route.skills)}; no browser errors",
                lambda route=route: runner.route_loop(route),
            )
        runner.run_loop(
            "Desktop landing layout",
            "1440×1000 landing screen, title, form, and avatar controls",
            "load fresh offline file and inspect bounding boxes",
            "visible landing hierarchy, four avatars, and no horizontal overflow",
            runner.landing_layout,
        )
        runner.run_loop(
            "Tablet map layout",
            "900×900 map and computed responsive grid",
            "start journey at tablet viewport",
            "three regions remain visible and stack into one column without overflow",
            runner.tablet_layout,
        )
        runner.run_loop(
            "Mobile route and layout",
            "390×844 route screens and viewport dimensions",
            "complete a route through the mobile placeholders",
            "challenge fits viewport, terminal career renders, three hexes remain visible, no overflow",
            runner.mobile_route,
        )
        runner.run_loop(
            "LocalStorage resume",
            "saved v1 state after first region reward",
            "close page, open a second page in the same browser context",
            "map, player name, completed node, and reward survive reload",
            runner.resume_loop,
        )
        runner.run_loop(
            "Restart confirmation and reset",
            "restart action and confirmation dialog after progress",
            "open restart, inspect copy, confirm restart",
            "landing returns with empty name, empty stack, and cleared persisted progress",
            runner.restart_loop,
        )
        runner.run_loop(
            "Keyboard-only primary flow",
            "focusable form, map nodes, skip button, and state transitions",
            "type and activate controls with keyboard focus + Enter only",
            "complete a full terminal route and earn three skills without pointer clicks",
            runner.keyboard_loop,
        )
        runner.run_loop(
            "Reduced-motion behavior",
            "prefers-reduced-motion media emulation and reward animation style",
            "complete first placeholder under reduced-motion context",
            "media query is true and reward animation is effectively instantaneous",
            runner.reduced_motion_loop,
        )
        runner.run_loop(
            "Offline and external-request safety",
            "file URL, request log, and generated HTML dependency markers",
            "complete terminal route with request listener attached",
            "no non-file requests, no script/link runtime dependencies, and route still functions",
            runner.offline_loop,
        )
    finally:
        runner.write_log()
        runner.close()

    failed = [result for result in runner.results if result.status != "PASS"]
    print(f"QA matrix: {len(runner.results) - len(failed)}/{len(runner.results)} PASS")
    for result in runner.results:
        print(f"{result.number:02d} {result.status} {result.name} ({result.duration_ms} ms)")
        if result.status != "PASS":
            print(f"    {result.details}")
    print(f"Log: {LOG_PATH}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
