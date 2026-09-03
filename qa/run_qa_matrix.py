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
STORAGE_KEY = "is-career-launchpad:v2"


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

STARTER_LOADOUTS: dict[str, tuple[str, str, str, str]] = {
    "region-build-create": (
        "starter-creative-thinking",
        "starter-coding-curiosity",
        "starter-hands-on-tech",
        "starter-visual-design",
    ),
    "region-analyze-solve": (
        "starter-numbers-patterns",
        "starter-problem-solving",
        "starter-security-mindset",
        "starter-coding-curiosity",
    ),
    "region-people-lead": (
        "starter-communication",
        "starter-leadership",
        "starter-empathy",
        "starter-visual-design",
    ),
}

REGION_LABELS = {
    "region-build-create": "build and create",
    "region-analyze-solve": "analyze and solve",
    "region-people-lead": "people and lead",
}


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
    def start(
        page: Page,
        name: str = "QA Explorer",
        region_id: str = "region-build-create",
    ) -> None:
        """Create an explorer, choose four skills, and reveal a matched world."""

        page.get_by_label("What should we call you?").fill(name)
        page.get_by_role("button", name=re.compile("Choose my starter skills")).click()
        page.locator(".screen--skills").wait_for()
        for skill_id in STARTER_LOADOUTS[region_id]:
            page.locator(f'[data-skill-id="{skill_id}"]').click()
        if page.locator(".hex-item").count() != 4:
            raise AssertionError("starter loadout did not create four skill hexes")
        page.get_by_role("button", name=re.compile("Reveal my world")).click()
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
    def finish_node(page: Page, node_id: str, enjoyed: bool = True) -> None:
        """Travel to a node, skip its placeholder, and answer the enjoyment check."""

        node = page.locator(f'[data-node-id="{node_id}"]')
        if node.count() != 1:
            raise AssertionError(f"expected one map node {node_id}, found {node.count()}")
        if node.is_disabled():
            raise AssertionError(f"map node {node_id} is still locked")
        node.click()
        page.locator(".screen--challenge").wait_for()
        if page.locator('[aria-label="Planned mini-game workspace"]').count() != 1:
            raise AssertionError(f"placeholder workspace missing for {node_id}")
        button = page.get_by_role("button", name=re.compile("Skip game for now"))
        if button.count() != 1:
            raise AssertionError(f"expected one skip control for {node_id}, found {button.count()}")
        button.click()
        page.locator(".screen--reflection").wait_for()
        choice = page.get_by_role(
            "button", name=re.compile("Yes, keep going" if enjoyed else "No, try another trail")
        )
        choice.click()
        page.wait_for_timeout(30)

    @staticmethod
    def reject_first_sibling(page: Page, target_id: str) -> Optional[str]:
        """Reject the first sibling when the desired route is the second branch."""

        model = page.evaluate("CareerLaunchpadApp.getModel()")
        all_nodes = []
        for region in model["regions"]:
            all_nodes.append(region)
            for domain in region["children"]:
                all_nodes.append(domain)
                all_nodes.extend(domain["children"])
        target = next(node for node in all_nodes if node["id"] == target_id)
        siblings = [node for node in all_nodes if node.get("parentId") == target.get("parentId")]
        if len(siblings) < 2 or siblings[0]["id"] == target_id:
            return None
        rejected_id = siblings[0]["id"]
        QARunner.finish_node(page, rejected_id, enjoyed=False)
        if rejected_id not in page.evaluate("CareerLaunchpadApp.getState().rejected"):
            raise AssertionError(f"no-response did not record rejected route {rejected_id}")
        if page.locator(f'[data-node-id="{rejected_id}"]').is_enabled():
            raise AssertionError(f"rejected route {rejected_id} remained enabled")
        if not page.locator(f'[data-node-id="{target_id}"]').is_enabled():
            raise AssertionError(f"alternative route {target_id} was not forced open")
        return rejected_id

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
        """Exercise a matched RPG route, including forced reroutes when useful."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, route.label, route.region_id)
            compass = page.locator(".compass-card").inner_text().casefold()
            expected_region = REGION_LABELS[route.region_id]
            if expected_region not in compass:
                raise AssertionError(f"starter loadout recommended wrong region: {compass!r}")
            if page.locator(".world-stop:enabled").count() != 1:
                raise AssertionError("matched world did not expose exactly one first stop")
            self.finish_node(page, route.region_id)
            if page.locator(".hex-item").count() != 5:
                raise AssertionError("region reward did not extend four-skill loadout")
            rejected = []
            rejected_domain = self.reject_first_sibling(page, route.domain_id)
            if rejected_domain:
                rejected.append(rejected_domain)
            self.finish_node(page, route.domain_id)
            if page.locator(".hex-item").count() != 6:
                raise AssertionError("domain reward did not create sixth skill hex")
            rejected_spec = self.reject_first_sibling(page, route.specialization_id)
            if rejected_spec:
                rejected.append(rejected_spec)
            self.finish_node(page, route.specialization_id)
            page.locator("#career-title").wait_for()
            title = page.locator("#career-title").inner_text().strip()
            if title.casefold() != route.career_title.casefold():
                raise AssertionError(f"expected career {route.career_title!r}, got {title!r}")
            state = page.evaluate("CareerLaunchpadApp.getState()")
            earned_labels = page.locator(".hex-item.is-earned strong").all_inner_texts()
            if len(state["completed"]) != 3 or len(state["earned"]) != 3:
                raise AssertionError(f"route state should contain exactly 3 completed/rewards: {state}")
            if earned_labels != list(route.skills):
                raise AssertionError(f"expected reward order {route.skills}, got {earned_labels}")
            if page.locator(".hex-item").count() != 7:
                raise AssertionError("terminal skill stack should contain 4 starter + 3 earned hexes")
            self.assert_clean(page, errors)
            detail = f"career={title}; 4 starter + rewards={', '.join(earned_labels)}"
            if rejected:
                detail += f"; forced reroute from={', '.join(rejected)}"
            return detail
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
            page.get_by_label("What should we call you?").fill("Loadout QA")
            page.get_by_role("button", name="Choose my starter skills").click()
            if page.locator(".starter-skill").count() != 10:
                raise AssertionError("starter loadout should contain exactly ten choices")
            for skill_id in STARTER_LOADOUTS["region-build-create"]:
                page.locator(f'[data-skill-id="{skill_id}"]').click()
            fifth = page.locator('[data-skill-id="starter-numbers-patterns"]')
            if fifth.is_enabled():
                raise AssertionError("a fifth starter skill remained selectable")
            selected = page.locator('.starter-skill[aria-pressed="true"]').count()
            if selected != 4:
                raise AssertionError(f"loadout allowed more than four selections: {selected}")
            if not page.get_by_role("button", name="Reveal my world").is_enabled():
                raise AssertionError("four selections did not enable the world reveal")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return "1440px landing; four avatars; exactly 10 skills with a four-choice cap; no overflow"
        finally:
            pass

    def tablet_layout(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 900, "height": 900})
        try:
            self.start(page)
            world = page.locator(".rpg-world")
            if not world.is_visible():
                raise AssertionError("tablet RPG world is not visible")
            if page.locator(".world-stop:enabled").count() != 1:
                raise AssertionError("tablet matched world should expose one first stop")
            if page.locator(".hex-item").count() != 4:
                raise AssertionError("tablet skill HUD should begin with four starter hexes")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return "900px tablet; matched RPG world, avatar, and four-skill HUD visible"
        finally:
            pass

    def mobile_route(self) -> str:
        page, context, errors, _requests = self.fresh_page({"width": 390, "height": 844})
        try:
            route = ROUTES[3]
            self.start(page, "Mobile Explorer")
            region = page.locator(f'[data-node-id="{route.region_id}"]')
            region.click()
            page.locator(".screen--challenge").wait_for()
            challenge_width = page.locator(".challenge-layout").bounding_box()["width"]
            page.get_by_role("button", name="Skip game for now").click()
            page.get_by_role("button", name=re.compile("Yes, keep going")).click()
            if challenge_width > 390:
                raise AssertionError(f"mobile challenge is wider than viewport: {challenge_width}")

            # Exercise the lower option at both forks. The travel render resets
            # scroll, so these bounds catch cards or avatars hidden by the HUD.
            for node_id in (route.domain_id, route.specialization_id):
                page.locator(f'[data-node-id="{node_id}"]').click()
                page.locator(".map-avatar.is-traveling").wait_for()
                page.wait_for_timeout(650)
                dock = page.locator(".skill-dock").bounding_box()
                target = page.locator(f'[data-node-id="{node_id}"]').bounding_box()
                avatar = page.locator(".map-avatar").bounding_box()
                if not dock or not target or not avatar:
                    raise AssertionError("mobile travel elements did not render")
                if target["y"] + target["height"] > dock["y"]:
                    raise AssertionError("mobile lower choice is covered by the skill dock")
                if avatar["y"] + avatar["height"] > dock["y"]:
                    raise AssertionError("mobile traveling avatar is covered by the skill dock")
                page.locator(".screen--challenge").wait_for()
                page.get_by_role("button", name="Skip game for now").click()
                page.get_by_role("button", name=re.compile("Yes, keep going")).click()

            if page.locator("#career-title").inner_text().strip().casefold() != route.career_title.casefold():
                raise AssertionError("mobile terminal career did not render")
            if page.locator(".hex-item").count() != 7:
                raise AssertionError("mobile route did not preserve four starter + three earned skills")
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            return f"390px mobile; lower forks and avatar clear HUD; challenge width={challenge_width:.0f}px"
        finally:
            pass

    def resume_loop(self) -> str:
        context = self.context({"width": 1200, "height": 900})
        page, _context, errors, _requests = self.fresh_page(context=context)
        try:
            self.start(page, "Resume Explorer")
            self.finish_node(page, ROUTES[0].region_id)
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
            if "Resume Explorer" not in resumed.locator(".map-avatar").inner_text():
                raise AssertionError("resumed map omitted player name")
            if resumed.locator(".hex-item").count() != 5:
                raise AssertionError("resumed map omitted starter or earned skills")
            self.assert_clean(resumed, errors)
            return "persisted completed region, player name, and one skill across reload"
        finally:
            pass

    def restart_loop(self) -> str:
        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "Reset Explorer")
            self.finish_node(page, ROUTES[0].region_id)
            page.locator('[data-node-id="domain-software-apps"]').click()
            page.locator(".screen--challenge").wait_for()
            page.get_by_role("button", name="Restart", exact=True).click()
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
            page.locator(".screen--skills").wait_for()
            for skill_id in STARTER_LOADOUTS[ROUTES[0].region_id]:
                choice = page.locator(f'[data-skill-id="{skill_id}"]')
                choice.focus()
                page.keyboard.press("Enter")
                page.wait_for_timeout(25)
            reveal = page.get_by_role("button", name="Reveal my world")
            reveal.focus()
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
                skip = page.get_by_role("button", name="Skip game for now")
                skip.focus()
                page.keyboard.press("Enter")
                page.locator(".screen--reflection").wait_for()
                yes = page.get_by_role("button", name=re.compile("Yes, keep going"))
                yes.focus()
                page.keyboard.press("Enter")
                page.wait_for_timeout(35)
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
            self.finish_node(page, ROUTES[0].region_id)
            animation = page.locator(".hex-item.is-earned").evaluate("element => getComputedStyle(element).animationDuration")
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
            self.finish_node(page, ROUTES[0].region_id)
            self.finish_node(page, ROUTES[0].domain_id)
            self.finish_node(page, ROUTES[0].specialization_id)
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
                f"four-skill loadout recommends {route.region_id} → {route.domain_id} → {route.specialization_id}",
                "select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings",
                f"career title={route.career_title}; four starter + three rewards={', '.join(route.skills)}; rejected siblings stay locked",
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
            "900×900 recommended RPG world, avatar, and skill HUD",
            "start journey at tablet viewport",
            "focused world and four starter hexes remain readable without overflow",
            runner.tablet_layout,
        )
        runner.run_loop(
            "Mobile route and layout",
            "390×844 route screens and viewport dimensions",
            "choose four skills and complete a route through mobile placeholders and enjoyment checks",
            "challenge fits viewport, terminal career renders, seven hexes remain accessible, no overflow",
            runner.mobile_route,
        )
        runner.run_loop(
            "LocalStorage resume",
            "saved v2 loadout, recommendation, and first region reward",
            "close page, open a second page in the same browser context",
            "map, player name, four starters, completed node, and earned reward survive reload",
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
            "focusable form, ten-skill loadout, world stops, placeholder, enjoyment, and state transitions",
            "type and activate all primary controls with keyboard focus + Enter only",
            "complete a full terminal route with seven skills and no pointer clicks",
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
