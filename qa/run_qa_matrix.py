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
            page.wait_for_function(
                "skillId => CareerLaunchpadApp.getState().starterSkills.includes(skillId)",
                arg=skill_id,
            )
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
    def overlap_area(first: dict[str, float], second: dict[str, float]) -> float:
        """Return the intersection area of two Playwright bounding boxes."""

        horizontal = max(
            0.0,
            min(first["x"] + first["width"], second["x"] + second["width"])
            - max(first["x"], second["x"]),
        )
        vertical = max(
            0.0,
            min(first["y"] + first["height"], second["y"] + second["height"])
            - max(first["y"], second["y"]),
        )
        return horizontal * vertical

    @classmethod
    def assert_no_overlap(cls, first, second, label: str) -> None:
        """Fail when two visible locators cover any of the same pixels."""

        first_box = first.bounding_box()
        second_box = second.bounding_box()
        if not first_box or not second_box:
            raise AssertionError(f"{label} did not render measurable boxes")
        overlap = cls.overlap_area(first_box, second_box)
        if overlap > 0.5:
            raise AssertionError(
                f"{label} overlap={overlap:.0f}px²; first={first_box}; second={second_box}"
            )

    @staticmethod
    def contrast_ratio(locator) -> float:
        """Calculate the text/background contrast ratio for an opaque element."""

        return float(
            locator.evaluate(
                """element => {
                    const style = getComputedStyle(element);
                    const channels = value => (value.match(/[0-9.]+/g) || [])
                        .slice(0, 3).map(Number).map(channel => channel / 255);
                    const luminance = value => {
                        const rgb = channels(value).map(channel => channel <= 0.04045
                            ? channel / 12.92
                            : Math.pow((channel + 0.055) / 1.055, 2.4));
                        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
                    };
                    const foreground = luminance(style.color);
                    const background = luminance(style.backgroundColor);
                    return (Math.max(foreground, background) + 0.05)
                        / (Math.min(foreground, background) + 0.05);
                }"""
            )
        )

    @staticmethod
    def solve_jigsaw(page: Page) -> None:
        """Complete the six-panel scanner task through its public controls."""

        for piece_index in range(6):
            page.locator(f'[data-piece-index="{piece_index}"]').click()
            page.locator(f'[data-slot-index="{piece_index}"]').click()
        continue_button = page.get_by_role(
            "button", name=re.compile("Continue to trail check")
        )
        if continue_button.count() != 1:
            raise AssertionError("jigsaw completion did not reveal its continue action")
        continue_button.click()

    @staticmethod
    def publish_deploy_game(page: Page) -> None:
        """Stage and host the sample page through the keyboard-equivalent controls."""

        page.locator('[data-action="select-deploy-file"]').click()
        page.locator('[data-action="stage-deploy-file"]').click()
        host_button = page.get_by_role("button", name="Host", exact=True)
        if host_button.count() != 1:
            raise AssertionError("deploy task did not reveal its Host action")
        host_button.click()
        continue_button = page.get_by_role(
            "button", name=re.compile("Continue to trail check")
        )
        if continue_button.count() != 1:
            raise AssertionError("deploy task did not reveal its continue action")
        continue_button.click()

    @staticmethod
    def solve_scratch_game(page: Page) -> None:
        """Guide the cat around the obstacle using the visible command blocks."""

        for command in ("move", "left", "move", "move", "right", "move", "move", "move"):
            page.locator(f'[data-scratch-id="{command}"]').click()
        page.locator('[data-action="scratch-check"]').click()
        continue_button = page.get_by_role(
            "button", name=re.compile("Continue to enjoyment check")
        )
        if continue_button.count() != 1:
            raise AssertionError("Scratch task did not reveal its continue action")
        continue_button.click()

    @staticmethod
    def solve_chart_match_game(page: Page) -> None:
        """Connect each spreadsheet to its authored chart target."""

        matches = (
            ("oxygen-trend", "chart-line"),
            ("room-tasks", "chart-bars"),
            ("crew-mix", "chart-donut"),
        )
        for sheet_id, chart_id in matches:
            page.locator(f'[data-chart-sheet-id="{sheet_id}"]').click()
            page.locator(f'[data-chart-id="{chart_id}"]').click()
        continue_button = page.get_by_role(
            "button", name=re.compile("Task complete")
        )
        if continue_button.count() != 1:
            raise AssertionError("chart matching did not reveal its continue action")
        continue_button.click()

    @staticmethod
    def solve_minecraft_door_game(page: Page) -> None:
        """Complete the oak-log, plank, and shaped-door recipe loop."""

        page.locator('[data-action="minecraft-move-tree"]').click()
        page.locator(".mc-action-key").click()
        page.locator(".mc-action-key").click()
        page.locator('[data-action="minecraft-move-table"]').first.click()
        page.locator('[data-action="minecraft-craft-planks"]').click()
        for grid_index in (0, 1, 3, 4, 6, 7):
            page.locator(f'[data-grid-index="{grid_index}"]').click()
        page.locator('[data-action="minecraft-craft-door"]').click()
        page.locator('[data-action="finish-game"]').click()

    @staticmethod
    def finish_node(page: Page, node_id: str, enjoyed: bool = True) -> None:
        """Complete a mini-game stop or open a terminal career selection."""

        node = page.locator(f'[data-node-id="{node_id}"]')
        if node.count() != 1:
            raise AssertionError(f"expected one map node {node_id}, found {node.count()}")
        if node.is_disabled():
            raise AssertionError(f"map node {node_id} is still locked")
        node.click()
        page.locator(".screen--challenge, .screen--career").first.wait_for()
        if page.locator(".screen--career").count():
            if not enjoyed:
                raise AssertionError("terminal career selections do not support rejection")
            return
        if page.locator(".minecraft-game").count():
            QARunner.solve_minecraft_door_game(page)
        elif page.locator(".jigsaw-console").count():
            QARunner.solve_jigsaw(page)
        elif page.locator(".team-builder-game").count():
            candidates = page.locator('[data-action="toggle-teammate"]:not([disabled])')
            for candidate_index in range(3):
                candidates.nth(candidate_index).click()
            lock_crew = page.get_by_role("button", name=re.compile("Lock in this crew"))
            if lock_crew.count() != 1 or not lock_crew.is_enabled():
                raise AssertionError("team-builder completion did not enable its continue action")
            lock_crew.click()
        elif page.locator(".deploy-game").count():
            QARunner.publish_deploy_game(page)
        elif page.locator(".scratch-workspace").count():
            QARunner.solve_scratch_game(page)
        elif page.locator(".chart-match-game").count():
            QARunner.solve_chart_match_game(page)
        else:
            if page.locator('[aria-label="Planned mini-game workspace"]').count() != 1:
                raise AssertionError(f"mini-game workspace missing for {node_id}")
            button = page.get_by_role("button", name=re.compile("Skip game for now"))
            if button.count() != 1:
                raise AssertionError(f"expected one skip control for {node_id}, found {button.count()}")
            button.click()
        page.locator(".screen--reflection").wait_for()
        choice = page.get_by_role(
            "button", name=re.compile("Yes, keep going" if enjoyed else "No, try another trail")
        )
        choice.click()
        if not enjoyed:
            # Rejection is intentionally destructive, so the production flow
            # requires an explicit confirmation after the reflection choice.
            dialog = page.get_by_role("dialog")
            if dialog.count() != 1:
                raise AssertionError(f"rejection confirmation missing for {node_id}")
            confirm = dialog.get_by_role("button", name=re.compile("Close this trail"))
            if confirm.count() != 1:
                raise AssertionError(f"rejection confirmation action missing for {node_id}")
            confirm.click()
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
            self.finish_node(page, route.specialization_id)
            page.locator("#career-title").wait_for()
            title = page.locator("#career-title").inner_text().strip()
            if title.casefold() != route.career_title.casefold():
                raise AssertionError(f"expected career {route.career_title!r}, got {title!r}")
            state = page.evaluate("CareerLaunchpadApp.getState()")
            # Read authored labels rather than CSS-transformed presentation;
            # the supplied badge design intentionally renders them uppercase.
            earned_labels = [
                label.strip()
                for label in page.locator(".hex-item.is-earned strong").all_text_contents()
            ]
            if len(state["completed"]) != 3 or len(state["earned"]) != 3:
                raise AssertionError(f"route state should contain exactly 3 completed selections and rewards: {state}")
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
            if page.locator(".landing-explorer-stage .explorer-avatar").count() != 1:
                raise AssertionError("landing should present exactly one cougar explorer")
            if page.locator(".avatar-choice").count() != 0:
                raise AssertionError("legacy avatar choices should not remain")
            avatar_source = page.locator(".landing-explorer-stage .explorer-avatar").get_attribute("src") or ""
            if not avatar_source.startswith("data:image/png;base64,"):
                raise AssertionError("cougar explorer should be embedded in the offline HTML")
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
            return "1440px landing; one embedded cougar explorer; exactly 10 skills with a four-choice cap; no overflow"
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
                if node_id == route.domain_id:
                    page.locator(".screen--challenge").wait_for()
                    page.get_by_role("button", name="Skip game for now").click()
                    page.get_by_role("button", name=re.compile("Yes, keep going")).click()
                else:
                    page.locator(".screen--career").wait_for()

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
            for node_id in (ROUTES[0].region_id, ROUTES[0].domain_id):
                target = page.locator(f'[data-node-id="{node_id}"]')
                target.focus()
                page.keyboard.press("Enter")
                page.locator(".screen--challenge").wait_for()
                page.wait_for_timeout(70)
                if page.locator(".scratch-workspace").count():
                    for command in ("move", "left", "move", "move", "right", "move", "move", "move"):
                        block = page.locator(f'[data-scratch-id="{command}"]')
                        block.focus()
                        page.keyboard.press("Enter")
                    run_button = page.locator('[data-action="scratch-check"]')
                    run_button.focus()
                    page.keyboard.press("Enter")
                    continue_button = page.get_by_role(
                        "button", name=re.compile("Continue to enjoyment check")
                    )
                    continue_button.focus()
                    page.keyboard.press("Enter")
                else:
                    skip = page.get_by_role("button", name="Skip game for now")
                    skip.focus()
                    page.keyboard.press("Enter")
                page.locator(".screen--reflection").wait_for()
                yes = page.get_by_role("button", name=re.compile("Yes, keep going"))
                yes.focus()
                page.keyboard.press("Enter")
                page.wait_for_timeout(35)
            target = page.locator(f'[data-node-id="{ROUTES[0].specialization_id}"]')
            target.focus()
            page.keyboard.press("Enter")
            page.locator(".screen--career").wait_for()
            if page.locator("#career-title").inner_text().strip().casefold() != ROUTES[0].career_title.casefold():
                raise AssertionError("keyboard route did not reach terminal career")
            state = page.evaluate("CareerLaunchpadApp.getState()")
            if len(state["earned"]) != 3:
                raise AssertionError("keyboard route did not award exactly three skills")
            self.assert_clean(page, errors)
            return "name entry, two mini-games, and direct career selection completed through focus + Enter"
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

    def resume_unconfirmed_skills_loop(self) -> str:
        """Ensure Resume initializes a playable world for an unconfirmed loadout."""

        page, context, errors, _requests = self.fresh_page({"width": 1200, "height": 900})
        try:
            page.get_by_label("What should we call you?").fill("Pending Explorer")
            page.get_by_role("button", name="Choose my starter skills").click()
            for skill_id in STARTER_LOADOUTS["region-build-create"]:
                page.locator(f'[data-skill-id="{skill_id}"]').click()
            page.get_by_role("button", name="Back").click()
            resume = page.get_by_role("button", name=re.compile("Resume Pending Explorer"))
            if resume.count() != 1:
                raise AssertionError("four chosen skills did not expose one Resume action")
            resume.click()
            page.locator(".screen--map").wait_for()
            state = page.evaluate("CareerLaunchpadApp.getState()")
            enabled_stops = page.locator(".world-stop:enabled").count()
            if not state["activeRegionId"] or enabled_stops != 1:
                raise AssertionError(
                    "Resume opened a dead map: "
                    f"activeRegionId={state['activeRegionId']!r}; enabled stops={enabled_stops}"
                )
            self.assert_clean(page, errors)
            return f"Resume initialized {state['activeRegionId']} with one enabled first stop"
        finally:
            pass

    def completed_node_revisit_loop(self) -> str:
        """Ensure replaying a completed stop cannot reject it or duplicate rewards."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "Revisit Explorer")
            self.finish_node(page, "region-build-create")
            self.finish_node(page, "domain-software-apps")
            before = page.evaluate("CareerLaunchpadApp.getState()")

            page.locator('[data-node-id="domain-software-apps"]').click()
            page.locator(".screen--challenge").wait_for()
            skip = page.get_by_role("button", name=re.compile("Skip game for now"))
            if skip.count():
                skip.click()
            no_choice = page.get_by_role("button", name=re.compile("No, try another trail"))
            if no_choice.count():
                no_choice.click()
                dialog = page.get_by_role("dialog")
                if dialog.count() != 1:
                    raise AssertionError("completed-node rejection confirmation missing")
                close = dialog.get_by_role("button", name=re.compile("Close this trail"))
                if close.count() != 1:
                    raise AssertionError("completed-node confirmation action missing")
                close.click()
            page.wait_for_timeout(60)

            after = page.evaluate("CareerLaunchpadApp.getState()")
            if "domain-software-apps" in after["rejected"]:
                raise AssertionError("a completed domain became rejected during review")
            if after["completed"] != before["completed"]:
                raise AssertionError(
                    f"review mutated completed nodes: before={before['completed']}; after={after['completed']}"
                )
            if after["earned"] != before["earned"]:
                raise AssertionError(
                    f"review mutated earned rewards: before={before['earned']}; after={after['earned']}"
                )
            self.assert_clean(page, errors)
            return "completed/rejected remained mutually exclusive and reward list was unchanged"
        finally:
            pass

    def exhausted_sibling_reroute_loop(self) -> str:
        """Ensure saying no to both sibling domains opens another viable world."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "Reroute Explorer", "region-build-create")
            self.finish_node(page, "region-build-create")
            self.finish_node(page, "domain-software-apps", enjoyed=False)
            self.finish_node(page, "domain-systems-tech", enjoyed=False)

            state = page.evaluate("CareerLaunchpadApp.getState()")
            if state["screen"] != "map":
                raise AssertionError(f"second no-response left screen={state['screen']!r}")
            if state["activeRegionId"] == "region-build-create":
                raise AssertionError("exhausted Build and Create world remained active")
            expected_rejected = {"domain-software-apps", "domain-systems-tech"}
            if not expected_rejected.issubset(set(state["rejected"])):
                raise AssertionError(f"domain rejections were not preserved: {state['rejected']}")
            if len(state["earned"]) != 1 or state["earned"][0]["nodeId"] != "region-build-create":
                raise AssertionError(f"earned region skill was not preserved: {state['earned']}")
            enabled_forward = page.locator(".world-stop:not(.is-complete):enabled")
            if enabled_forward.count() != 1:
                raise AssertionError(
                    f"rerouted world should expose one first stop, found {enabled_forward.count()}"
                )
            if "0 forward routes open" in page.locator(".map-action-row").inner_text().casefold():
                raise AssertionError("rerouted map still reports zero forward routes")
            self.assert_clean(page, errors)
            return (
                "both rejected domains stayed closed; earned skill stayed saved; "
                f"compass opened {state['activeRegionId']} with one forward route"
            )
        finally:
            pass

    def reflection_dock_overlap_loop(self) -> str:
        """Check that the fixed skill HUD never covers reflection choices."""

        checked: list[str] = []
        for width, height in ((320, 568), (390, 844)):
            page, context, errors, _requests = self.fresh_page({"width": width, "height": height})
            self.start(page, f"Reflection {width}")
            page.locator('[data-node-id="region-build-create"]').click()
            page.locator(".screen--challenge").wait_for()
            self.solve_minecraft_door_game(page)
            page.locator(".screen--reflection").wait_for()
            page.wait_for_timeout(500)
            dock = page.locator(".skill-dock")
            for label in ("Yes, keep going", "No, try another trail"):
                choice = page.get_by_role("button", name=re.compile(label))
                self.assert_no_overlap(dock, choice, f"{width}×{height} dock/{label}")
            self.assert_clean(page, errors)
            checked.append(f"{width}×{height}")
        return f"reflection CTAs clear of dock at {', '.join(checked)}"

    def career_dock_overlap_loop(self) -> str:
        """Check that the desktop skill HUD does not cover the career CTA."""

        page, context, errors, _requests = self.fresh_page({"width": 1440, "height": 900})
        try:
            self.start(page, "Career CTA Explorer")
            for node_id in ("region-build-create", "domain-software-apps", "spec-code-build-uis"):
                self.finish_node(page, node_id)
            page.locator(".screen--career").wait_for()
            page.wait_for_timeout(500)
            self.assert_no_overlap(
                page.locator(".skill-dock"),
                page.get_by_role("button", name=re.compile("Start another path")),
                "1440×900 dock/Start another path",
            )
            self.assert_clean(page, errors)
            return "1440×900 career CTA has zero overlap with the skill dock"
        finally:
            pass

    def short_landscape_dock_loop(self) -> str:
        """Check that the fixed dock stays outside the active landscape map."""

        checked: list[str] = []
        for width, height in ((844, 390), (667, 375)):
            page, context, errors, _requests = self.fresh_page({"width": width, "height": height})
            self.start(page, f"Landscape {width}")
            self.finish_node(page, "region-build-create")
            page.locator(".screen--map").wait_for()
            page.wait_for_timeout(500)
            self.assert_no_overlap(
                page.locator(".skill-dock"),
                page.locator(".rpg-world"),
                f"{width}×{height} dock/active map",
            )
            self.assert_clean(page, errors)
            checked.append(f"{width}×{height}")
        return f"active map clear of fixed dock at {', '.join(checked)}"

    def reflection_reflow_loop(self) -> str:
        """Require reflection pages to reflow without horizontal scrolling."""

        checked: list[str] = []
        for width, height in ((320, 568), (390, 844)):
            page, context, errors, _requests = self.fresh_page({"width": width, "height": height})
            self.start(page, f"Reflow {width}")
            page.locator('[data-node-id="region-build-create"]').click()
            page.locator(".screen--challenge").wait_for()
            self.solve_minecraft_door_game(page)
            page.locator(".screen--reflection").wait_for()
            page.wait_for_timeout(500)
            self.assert_no_horizontal_overflow(page)
            self.assert_clean(page, errors)
            checked.append(f"{width}px")
        return f"reflection reflows at {', '.join(checked)}"

    def edit_skills_confirmation_loop(self) -> str:
        """Require destructive loadout edits to be cancellable without data loss."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "Edit Safety Explorer")
            self.finish_node(page, "region-build-create")
            before = page.evaluate("CareerLaunchpadApp.getState()")
            page.get_by_role("button", name="Edit starter skills").click()
            page.wait_for_timeout(100)
            dialog = page.get_by_role("dialog")
            if dialog.count() != 1:
                raise AssertionError("Edit starter skills cleared progress without confirmation")
            dialog_text = dialog.inner_text().casefold()
            if not any(word in dialog_text for word in ("progress", "earned", "clear", "reset")):
                raise AssertionError("edit confirmation does not explain the progress at risk")
            cancel = dialog.get_by_role(
                "button", name=re.compile("Cancel|Keep exploring|Continue journey|Go back", re.I)
            )
            if cancel.count() < 1:
                raise AssertionError("edit confirmation has no clear cancel action")
            cancel.first.click()
            page.wait_for_timeout(60)
            after = page.evaluate("CareerLaunchpadApp.getState()")
            for key in ("completed", "earned", "rejected"):
                if after[key] != before[key]:
                    raise AssertionError(
                        f"canceling starter-skill edit mutated {key}: before={before[key]}; after={after[key]}"
                    )
            if after["screen"] != "map":
                raise AssertionError(f"canceling starter-skill edit returned to {after['screen']!r}, not map")
            self.assert_clean(page, errors)
            return "edit warning explained data loss and cancel preserved all journey progress"
        finally:
            pass

    def skill_focus_retention_loop(self) -> str:
        """Require a toggled skill card to retain keyboard focus after rerender."""

        page, context, errors, _requests = self.fresh_page()
        try:
            page.get_by_label("What should we call you?").fill("Focus Explorer")
            page.get_by_role("button", name="Choose my starter skills").click()
            skill_id = "starter-creative-thinking"
            page.locator(f'[data-skill-id="{skill_id}"]').focus()
            page.keyboard.press("Enter")
            page.wait_for_timeout(100)
            active = page.evaluate(
                "document.activeElement && document.activeElement.getAttribute('data-skill-id')"
            )
            if active != skill_id:
                raise AssertionError(f"focus moved away from acted skill: expected={skill_id}; active={active!r}")
            if page.locator(f'[data-skill-id="{skill_id}"]').get_attribute("aria-pressed") != "true":
                raise AssertionError("keyboard activation did not select the focused skill")
            self.assert_clean(page, errors)
            return f"keyboard focus remained on {skill_id} after selection"
        finally:
            pass

    def dock_accessible_name_loop(self) -> str:
        """Require every skill-dock aria-labelledby reference to resolve."""

        page, context, errors, _requests = self.fresh_page()
        try:
            self.start(page, "ARIA Explorer")
            dock = page.locator("#skill-dock")
            references = (dock.get_attribute("aria-labelledby") or "").split()
            if not references:
                raise AssertionError("skill dock has no aria-labelledby reference")
            unresolved = page.evaluate(
                "ids => ids.filter(id => !document.getElementById(id) || !document.getElementById(id).textContent.trim())",
                references,
            )
            if unresolved:
                raise AssertionError(f"skill dock aria-labelledby does not resolve: {unresolved}")
            self.assert_clean(page, errors)
            return f"skill dock accessible name resolves through {', '.join(references)}"
        finally:
            pass

    def malformed_storage_recovery_loop(self) -> str:
        """Require malformed version-two persistence to recover without errors."""

        payloads = (
            {
                "version": 2,
                "screen": "career",
                "selectedNodeId": "missing-career-node",
                "earned": [],
            },
            {
                "version": 2,
                "screen": "landing",
                "starterSkills": [],
                "earned": [None],
            },
        )
        for payload in payloads:
            page, context, errors, _requests = self.fresh_page()
            errors.clear()
            page.evaluate(
                "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
                [STORAGE_KEY, payload],
            )
            page.reload(wait_until="load")
            page.wait_for_timeout(100)
            if page.locator(".screen").count() != 1 or not page.locator("#app").inner_text().strip():
                raise AssertionError(f"malformed storage produced a blank app: {payload}")
            self.assert_clean(page, errors)
        return "invalid career node and malformed earned entry both recovered to a clean screen"

    def deterministic_accessibility_metrics_loop(self) -> str:
        """Gate deterministic touch size, HUD text size, and CTA contrast."""

        page, context, errors, _requests = self.fresh_page({"width": 390, "height": 844})
        try:
            self.start(page, "Metrics Explorer")
            self.finish_node(page, "region-build-create")
            violations: list[str] = []

            edit_box = page.get_by_role("button", name="Edit starter skills").bounding_box()
            if not edit_box or edit_box["height"] < 44 or edit_box["width"] < 44:
                violations.append(f"Edit starter skills target={edit_box}")

            hex_metrics = page.locator(".hex-item").evaluate_all(
                """items => items.map(item => {
                    const box = item.getBoundingClientRect();
                    const strong = item.querySelector('strong');
                    const small = item.querySelector('small');
                    return {
                        label: item.getAttribute('aria-label'),
                        width: box.width,
                        height: box.height,
                        strongPx: strong ? parseFloat(getComputedStyle(strong).fontSize) : 0,
                        smallPx: small ? parseFloat(getComputedStyle(small).fontSize) : null,
                    };
                })"""
            )
            for metric in hex_metrics:
                if metric["width"] < 44 or metric["height"] < 44:
                    violations.append(
                        f"{metric['label']} target={metric['width']:.1f}×{metric['height']:.1f}"
                    )
                if metric["strongPx"] < 10 or (metric["smallPx"] is not None and metric["smallPx"] < 8):
                    violations.append(
                        f"{metric['label']} primary={metric['strongPx']:.1f}px secondary={metric['smallPx']}"
                    )

            self.finish_node(page, "domain-software-apps")
            self.finish_node(page, "spec-code-build-uis")
            career_cta = page.get_by_role("button", name=re.compile("Start another path"))
            contrast = self.contrast_ratio(career_cta)
            if contrast < 4.5:
                violations.append(f"Start another path contrast={contrast:.2f}:1")

            if violations:
                raise AssertionError("; ".join(violations))
            self.assert_clean(page, errors)
            return f"touch targets >=44px, primary HUD text >=10px, rendered secondary text >=8px, career CTA contrast={contrast:.2f}:1"
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
    """Run all named release loops and return a shell status."""

    runner = QARunner()
    try:
        for route in ROUTES:
            runner.run_loop(
                f"Complete route — {route.label}",
                f"four-skill loadout recommends {route.region_id} → {route.domain_id} → {route.specialization_id}",
                "select four starter skills; travel; skip placeholders; answer yes, with no-reroutes for second siblings",
                f"career title={route.career_title}; four starter + three rewards={', '.join(route.skills)}; rejected domain siblings stay locked",
                lambda route=route: runner.route_loop(route),
            )
        runner.run_loop(
            "Desktop landing layout",
            "1440×1000 landing screen, title, form, and single cougar explorer",
            "load fresh offline file and inspect bounding boxes",
            "visible landing hierarchy, one embedded cougar avatar, and no horizontal overflow",
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
        runner.run_loop(
            "Resume unconfirmed four-skill loadout",
            "landing resume state after choosing four skills but leaving before world reveal",
            "choose four skills; go Back; select Resume",
            "Resume initializes an active region and exactly one playable first stop",
            runner.resume_unconfirmed_skills_loop,
        )
        runner.run_loop(
            "Completed-node revisit integrity",
            "completed domain, earned reward, and rejected-route state",
            "complete a domain; revisit it; attempt the no-response path",
            "completed and rejected remain mutually exclusive; earned/completed arrays do not mutate",
            runner.completed_node_revisit_loop,
        )
        runner.run_loop(
            "Exhausted sibling reroute",
            "Build and Create after both domain choices receive confirmed no-responses",
            "earn the region skill; reject Software and Apps; reject forced Systems and Tech",
            "both domains remain closed, the earned skill remains saved, and the compass opens one viable first stop in another world",
            runner.exhausted_sibling_reroute_loop,
        )
        runner.run_loop(
            "Reflection CTA dock clearance",
            "fixed HUD and both reflection choices at 320×568 and 390×844",
            "open the first reflection at each viewport and compare settled bounding boxes",
            "skill dock has zero pixel overlap with both reflection choices",
            runner.reflection_dock_overlap_loop,
        )
        runner.run_loop(
            "Career CTA dock clearance",
            "fixed HUD and Start another path at 1440×900",
            "complete Application Developer route and compare settled bounding boxes",
            "skill dock has zero pixel overlap with the career CTA",
            runner.career_dock_overlap_loop,
        )
        runner.run_loop(
            "Short-landscape map dock clearance",
            "fixed HUD and active map at 844×390 and 667×375",
            "advance to the domain fork and compare settled bounding boxes",
            "skill dock has zero pixel overlap with the active RPG map",
            runner.short_landscape_dock_loop,
        )
        runner.run_loop(
            "Reflection narrow-screen reflow",
            "document and body widths on reflection at 320px and 390px",
            "open the first reflection and inspect horizontal scroll dimensions",
            "document and body widths never exceed the viewport",
            runner.reflection_reflow_loop,
        )
        runner.run_loop(
            "Starter-skill edit data-loss confirmation",
            "earned progress before entering the destructive loadout-edit flow",
            "select Edit starter skills; inspect warning; cancel",
            "warning explains data loss and cancel preserves progress",
            runner.edit_skills_confirmation_loop,
        )
        runner.run_loop(
            "Skill-card keyboard focus retention",
            "active element before and after keyboard selection of a starter skill",
            "focus one skill card and activate it with Enter",
            "the acted skill remains selected and retains focus after rerender",
            runner.skill_focus_retention_loop,
        )
        runner.run_loop(
            "Skill dock accessible name",
            "rendered dock aria-labelledby references",
            "start a journey and resolve every referenced id in the DOM",
            "each reference exists and contains accessible naming text",
            runner.dock_accessible_name_loop,
        )
        runner.run_loop(
            "Malformed v2 storage recovery",
            "invalid selected career node and malformed earned entry",
            "inject each payload into localStorage and reload",
            "app recovers to one rendered screen with no page or console errors",
            runner.malformed_storage_recovery_loop,
        )
        runner.run_loop(
            "Deterministic accessibility metrics",
            "edit and HUD touch targets, HUD text sizes, and coral career CTA contrast",
            "measure computed boxes, font sizes, and foreground/background luminance",
            "targets >=44px; primary HUD labels >=10px; rendered secondary labels >=8px; normal CTA text contrast >=4.5:1",
            runner.deterministic_accessibility_metrics_loop,
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
