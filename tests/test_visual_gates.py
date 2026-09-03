"""Computed visual release gates for the generated Career Launchpad artifact.

These checks use browser geometry rather than screenshots so regressions remain
deterministic across the supported Chromium environment.  Every scenario loads
the standalone ``index.html`` and waits for motion to settle before measuring.
"""

from __future__ import annotations

import copy
import unittest
from pathlib import Path
from typing import Any

from playwright.sync_api import Browser, BrowserContext, Locator, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()
STORAGE_KEY = "is-career-launchpad:v2"
SETTLE_MS = 950
TOUCH_TARGET_PX = 44
SUBPIXEL_TOLERANCE_PX = 0.1

REGION_PATHS: dict[str, tuple[str, str, str]] = {
    "region-build-create": (
        "domain-software-apps",
        "spec-code-build-uis",
        "application-developer",
    ),
    "region-analyze-solve": (
        "domain-data-insights",
        "spec-explain-trends-data",
        "data-analyst",
    ),
    "region-people-lead": (
        "domain-users-products",
        "spec-set-strategy-prioritize-value",
        "product-manager",
    ),
}

STARTER_LOADOUTS: dict[str, list[str]] = {
    "region-build-create": [
        "starter-creative-thinking",
        "starter-coding-curiosity",
        "starter-hands-on-tech",
        "starter-visual-design",
    ],
    "region-analyze-solve": [
        "starter-numbers-patterns",
        "starter-problem-solving",
        "starter-security-mindset",
        "starter-coding-curiosity",
    ],
    "region-people-lead": [
        "starter-communication",
        "starter-leadership",
        "starter-empathy",
        "starter-visual-design",
    ],
}


class CareerLaunchpadVisualGates(unittest.TestCase):
    """Block geometric collisions, undersized copy, and generic world art."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def new_page(self, width: int, height: int) -> tuple[Page, list[str]]:
        """Open an isolated reduced-motion page and collect browser errors."""

        context: BrowserContext = self.browser.new_context(
            viewport={"width": width, "height": height},
            reduced_motion="reduce",
        )
        self.addCleanup(context.close)
        page = context.new_page()
        errors: list[str] = []
        page.on("pageerror", lambda error: errors.append(f"pageerror: {error}"))
        page.on(
            "console",
            lambda message: errors.append(f"console: {message.text}")
            if message.type == "error"
            else None,
        )
        page.goto(APP_URL, wait_until="load")
        page.evaluate("localStorage.clear()")
        page.reload(wait_until="load")
        self.settle(page)
        return page, errors

    @staticmethod
    def settle(page: Page) -> None:
        """Wait until layout and authored motion have reached stable geometry."""

        page.wait_for_load_state("load")
        page.wait_for_timeout(SETTLE_MS)

    @staticmethod
    def base_state(page: Page, region_id: str, stage: int = 0) -> dict[str, Any]:
        """Create valid persisted state for a region and map depth."""

        domain_id, specialization_id, career_id = REGION_PATHS[region_id]
        node_ids = [region_id, domain_id, specialization_id]
        earned = page.evaluate(
            """nodeIds => {
                const model = CareerLaunchpadApp.getModel();
                const all = [];
                model.regions.forEach(region => {
                    all.push(region);
                    region.children.forEach(domain => {
                        all.push(domain);
                        domain.children.forEach(node => all.push(node));
                    });
                });
                return nodeIds.map((id, index) => {
                    const node = all.find(item => item.id === id);
                    return { skillId: node.earnedSkill, nodeId: id, earnedAt: index + 1 };
                });
            }""",
            node_ids,
        )
        completed = node_ids[:stage]
        return {
            "version": 2,
            "screen": "map",
            "name": "Visual QA",
            "avatar": "cougar",
            "starterSkills": STARTER_LOADOUTS[region_id],
            "recommendedRegionId": region_id,
            "activeRegionId": region_id,
            "activeDomainId": domain_id if stage >= 2 else None,
            "completed": completed,
            "earned": earned[:stage],
            "rejected": [],
            "selectedNodeId": specialization_id if stage >= 3 else (domain_id if stage >= 2 else None),
            "travelTargetId": None,
            "travelFromId": None,
            "lastCareerId": career_id if stage >= 3 else None,
            "lastAward": False,
            "reviewingNodeId": None,
            "interview": {
                "careerId": None,
                "questionIndex": 0,
                "answers": {},
                "feedback": {},
                "status": "idle",
                "returnScreen": "career",
            },
        }

    def state_for_screen(self, page: Page, screen: str) -> dict[str, Any]:
        """Return valid state for a requested visual surface."""

        if screen == "landing":
            return {
                "version": 2,
                "screen": "landing",
                "name": "",
                "avatar": "cougar",
                "starterSkills": [],
                "recommendedRegionId": None,
                "activeRegionId": None,
                "activeDomainId": None,
                "completed": [],
                "earned": [],
                "rejected": [],
                "selectedNodeId": None,
                "travelTargetId": None,
                "travelFromId": None,
                "lastCareerId": None,
                "lastAward": False,
                "reviewingNodeId": None,
                "interview": {
                    "careerId": None,
                    "questionIndex": 0,
                    "answers": {},
                    "feedback": {},
                    "status": "idle",
                    "returnScreen": "career",
                },
            }

        stage = 3 if screen in {"career", "interview-question"} else 2 if screen == "reflection" else 0
        state = self.base_state(page, "region-build-create", stage)
        state["screen"] = screen
        if screen == "skill-select":
            state["starterSkills"] = STARTER_LOADOUTS["region-build-create"]
            state["completed"] = []
            state["earned"] = []
            state["activeDomainId"] = None
            state["selectedNodeId"] = None
        elif screen == "reflection":
            state["selectedNodeId"] = REGION_PATHS["region-build-create"][1]
        elif screen == "interview-question":
            state["interview"] = {
                "careerId": "application-developer",
                "questionIndex": 0,
                "answers": {},
                "feedback": {},
                "status": "in-progress",
                "returnScreen": "career",
            }
        return state

    def load_state(self, page: Page, state: dict[str, Any], selector: str) -> None:
        """Persist state, reload the offline artifact, and settle its layout."""

        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, state],
        )
        page.reload(wait_until="load")
        page.locator(selector).wait_for()
        self.settle(page)

    @staticmethod
    def overlap_area(first: Locator, second: Locator) -> float:
        """Return viewport intersection area for two visible elements."""

        first_box = first.bounding_box()
        second_box = second.bounding_box()
        if not first_box or not second_box:
            raise AssertionError(
                f"unmeasurable geometry: first={first.count()} second={second.count()}"
            )
        horizontal = max(
            0.0,
            min(first_box["x"] + first_box["width"], second_box["x"] + second_box["width"])
            - max(first_box["x"], second_box["x"]),
        )
        vertical = max(
            0.0,
            min(first_box["y"] + first_box["height"], second_box["y"] + second_box["height"])
            - max(first_box["y"], second_box["y"]),
        )
        return horizontal * vertical

    def assert_zero_overlap(self, first: Locator, second: Locator, label: str) -> None:
        """Require two rendered elements to occupy separate pixels."""

        overlap = self.overlap_area(first, second)
        self.assertLessEqual(overlap, 0.5, f"{label}: overlap={overlap:.1f}px²")

    @staticmethod
    def font_size(locator: Locator) -> float:
        """Return the computed font size in CSS pixels."""

        return float(locator.evaluate("element => parseFloat(getComputedStyle(element).fontSize)"))

    @staticmethod
    def assert_clean(errors: list[str]) -> None:
        """Fail on uncaught page or console errors."""

        if errors:
            raise AssertionError("; ".join(errors))

    def test_mobile_dock_never_covers_career_map_or_reflection_content(self) -> None:
        """Protect the exact phone collisions found by the visual audit."""

        page, errors = self.new_page(320, 568)
        failures: list[str] = []

        def record_overlap(first: Locator, second: Locator, label: str) -> None:
            overlap = self.overlap_area(first, second)
            if overlap > 0.5:
                failures.append(f"{label}: overlap={overlap:.1f}px²")

        career = self.state_for_screen(page, "career")
        self.load_state(page, career, ".screen--career")
        dock = page.locator("#skill-dock")
        record_overlap(dock, page.locator('[data-action="back-map"]').first, "320 career back")
        record_overlap(dock, page.locator("#career-title"), "320 career title")

        reflection = self.state_for_screen(page, "reflection")
        self.load_state(page, reflection, ".screen--reflection")
        dock = page.locator("#skill-dock")
        record_overlap(dock, page.locator("#reflection-title"), "320 reflection heading")

        map_state = self.base_state(page, "region-build-create", stage=2)
        self.load_state(page, map_state, ".screen--map")
        dock = page.locator("#skill-dock")
        record_overlap(dock, page.locator(".world-stage-label"), "320 map chapter")
        active_stops = page.locator('.world-stop:not([disabled])')
        for index in range(active_stops.count()):
            stop = active_stops.nth(index)
            if stop.is_visible():
                record_overlap(dock, stop, f"320 active map stop {index}")

        page_390, errors_390 = self.new_page(390, 844)
        self.load_state(page_390, self.base_state(page_390, "region-build-create", stage=2), ".screen--map")
        record_overlap(
            page_390.locator("#skill-dock"),
            page_390.locator(".map-avatar"),
            "390 map avatar",
        )
        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors + errors_390)

    def test_desktop_interview_dock_does_not_cover_form_controls(self) -> None:
        page, errors = self.new_page(1280, 720)
        state = self.state_for_screen(page, "interview-question")
        self.load_state(page, state, ".interview-question")
        dock = page.locator("#skill-dock")
        targets = {
            "desktop interview textarea": page.locator("#interview-answer"),
            "desktop interview submit CTA": page.locator(
                '#interview-answer-form button[type="submit"]'
            ),
        }
        failures = []
        for label, target in targets.items():
            overlap = self.overlap_area(dock, target)
            if overlap > 0.5:
                failures.append(f"{label}: overlap={overlap:.1f}px²")
        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_result_dock_and_pretitle_labels_keep_clear_reading_bands(self) -> None:
        """Protect the desktop result card and the small labels above display caps."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844), (844, 390), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)

            career = self.state_for_screen(page, "career")
            self.load_state(page, career, ".screen--career")
            self.assert_zero_overlap(
                page.locator("#skill-dock"),
                page.locator(".practice-card"),
                f"{width}x{height} result dock/practice card",
            )

            for label_selector, title_selector, screen_label in (
                (".career-hero > .eyebrow", "#career-title", "career"),
            ):
                label_box = page.locator(label_selector).bounding_box()
                title_box = page.locator(title_selector).bounding_box()
                self.assertIsNotNone(label_box)
                self.assertIsNotNone(title_box)
                gap = title_box["y"] - (label_box["y"] + label_box["height"])
                if gap < 8:
                    failures.append(
                        f"{width}x{height} {screen_label} pretitle gap={gap:.1f}px"
                    )

            challenge = self.base_state(page, "region-build-create", stage=0)
            challenge["screen"] = "mini"
            challenge["selectedNodeId"] = "region-build-create"
            self.load_state(page, challenge, ".screen--challenge")
            label_box = page.locator(".challenge-copy > .eyebrow").bounding_box()
            title_box = page.locator("#challenge-title").bounding_box()
            self.assertIsNotNone(label_box)
            self.assertIsNotNone(title_box)
            gap = title_box["y"] - (label_box["y"] + label_box["height"])
            if gap < 8:
                failures.append(
                    f"{width}x{height} challenge pretitle gap={gap:.1f}px"
                )

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

    def test_each_primary_screen_starts_at_scroll_zero_on_phone(self) -> None:
        page, errors = self.new_page(390, 844)
        selectors = {
            "landing": ".screen--landing",
            "skill-select": ".screen--skills",
            "map": ".screen--map",
            "career": ".screen--career",
            "reflection": ".screen--reflection",
            "interview-question": ".interview-question",
        }
        failures: list[str] = []
        for screen, selector in selectors.items():
            state = self.state_for_screen(page, screen)
            self.load_state(page, state, selector)
            page.evaluate("window.scrollTo(0, document.documentElement.scrollHeight)")
            page.reload(wait_until="load")
            page.locator(selector).wait_for()
            self.settle(page)
            scroll_y = float(page.evaluate("window.scrollY"))
            if scroll_y > 1:
                failures.append(f"{screen} scrollY={scroll_y:.1f}")
        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_source_disclosures_and_links_have_phone_sized_click_areas(self) -> None:
        page, errors = self.new_page(390, 844)
        career = self.state_for_screen(page, "career")
        self.load_state(page, career, ".screen--career")

        failures: list[str] = []

        def inspect_details(details: Locator, surface: str) -> None:
            summary = details.locator("summary")
            summary_box = summary.bounding_box()
            if not summary_box or summary_box["height"] + SUBPIXEL_TOLERANCE_PX < TOUCH_TARGET_PX:
                failures.append(f"{surface} summary height={summary_box and summary_box['height']:.1f}")
            details.evaluate("element => { element.open = true; }")
            links = details.locator(".source-list a")
            for index in range(links.count()):
                link = links.nth(index)
                box = link.bounding_box()
                if (
                    not box
                    or box["height"] + SUBPIXEL_TOLERANCE_PX < TOUCH_TARGET_PX
                    or box["width"] + SUBPIXEL_TOLERANCE_PX < TOUCH_TARGET_PX
                ):
                    label = link.inner_text().strip()
                    failures.append(
                        f"{surface} link {label!r} area={box and (round(box['width'], 1), round(box['height'], 1))}"
                    )

        inspect_details(page.locator("details.career-sources"), "career sources")

        intro = copy.deepcopy(career)
        intro["screen"] = "interview-intro"
        intro["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 0,
            "answers": {},
            "feedback": {},
            "status": "idle",
            "returnScreen": "career",
        }
        self.load_state(page, intro, ".interview-intro")
        inspect_details(page.locator("details.interview-sources"), "interview sources")

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_skill_selection_action_bar_never_obscures_progress_or_choices(self) -> None:
        """Keep loadout progress and every skill card clear of the action bar."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844), (844, 390), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            skills = self.state_for_screen(page, "skill-select")
            self.load_state(page, skills, ".screen--skills")

            footer = page.locator(".skills-footer")
            progress = page.locator(".selection-meter")
            progress_overlap = self.overlap_area(footer, progress)
            if progress_overlap > 0.5:
                failures.append(
                    f"{width}x{height} footer/progress overlap={progress_overlap:.1f}px²"
                )

            cards = page.locator(".starter-skill")
            for index in range(cards.count()):
                overlap = self.overlap_area(footer, cards.nth(index))
                if overlap > 0.5:
                    failures.append(
                        f"{width}x{height} footer/skill {index + 1} overlap={overlap:.1f}px²"
                    )

            confirm = footer.locator('[data-action="confirm-skills"]')
            confirm.scroll_into_view_if_needed()
            self.assertTrue(confirm.is_visible())

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

    def test_mobile_feedback_focus_order_matches_visual_order(self) -> None:
        """Keep keyboard navigation moving forward through the stacked feedback cards."""

        page, errors = self.new_page(390, 844)
        state = self.base_state(page, "region-build-create", stage=3)
        state["screen"] = "interview-feedback"
        state["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 0,
            "answers": {"appdev-q1-story": "I built a class project and measured the result."},
            "feedback": {
                "appdev-q1-story": {
                    "level": "developing",
                    "wordCount": 9,
                    "matchedCriterionIds": ["context", "contribution"],
                    "missingCriterionIds": ["result"],
                }
            },
            "status": "feedback",
            "returnScreen": "career",
        }
        self.load_state(page, state, ".interview-feedback")

        summary = page.locator("details.strong-answer summary")
        summary_box = summary.bounding_box()
        self.assertIsNotNone(summary_box)
        self.assertGreaterEqual(
            summary_box["height"] + SUBPIXEL_TOLERANCE_PX,
            TOUCH_TARGET_PX,
        )

        self.assertEqual(page.evaluate("document.activeElement.id"), "feedback-title")
        expected = [
            '[data-action="interview-edit"]',
            "details.strong-answer summary",
            '[data-action="interview-next"]',
        ]
        document_tops: list[float] = []
        for selector in expected:
            page.keyboard.press("Tab")
            self.assertTrue(
                page.locator(selector).evaluate("element => element === document.activeElement"),
                f"focus did not advance to {selector}",
            )
            document_tops.append(
                float(
                    page.locator(selector).evaluate(
                        "element => element.getBoundingClientRect().top + window.scrollY"
                    )
                )
            )

        self.assertEqual(document_tops, sorted(document_tops))
        self.assert_clean(errors)

    def test_map_hud_and_body_copy_meet_deterministic_font_floors(self) -> None:
        page, errors = self.new_page(390, 844)
        map_state = self.base_state(page, "region-build-create", stage=2)
        self.load_state(page, map_state, ".screen--map")

        failures: list[str] = []

        def inspect(selector: str, minimum: float, group: str) -> None:
            locators = page.locator(selector)
            visible = 0
            for index in range(locators.count()):
                locator = locators.nth(index)
                if not locator.is_visible():
                    continue
                visible += 1
                size = self.font_size(locator)
                if size + 0.01 < minimum:
                    failures.append(f"{group} {selector}[{index}]={size:.1f}px < {minimum:.0f}px")
            if not visible:
                failures.append(f"{group} {selector} rendered no visible labels")

        for selector in (
            ".world-stage-label span",
            ".world-landmark:not(.start-camp) small",
            ".stop-copy small",
            ".map-avatar small",
            ".compass-card > span",
            ".compass-card small",
            ".skill-dock .dock-label h2",
            ".skill-dock .dock-label p",
            ".skill-dock .hex-item strong",
            ".skill-dock .hex-item small",
        ):
            inspect(selector, 10, "map/HUD")
        for selector in (
            ".world-header > div:first-child > p:last-child",
            ".stop-copy strong",
            ".map-action-row p",
        ):
            inspect(selector, 12, "body")

        skills = self.state_for_screen(page, "skill-select")
        self.load_state(page, skills, ".screen--skills")
        inspect(".starter-skill small", 12, "body")

        reflection = self.state_for_screen(page, "reflection")
        self.load_state(page, reflection, ".screen--reflection")
        inspect(".reflection-choice small", 12, "body")

        interview = self.state_for_screen(page, "interview-question")
        self.load_state(page, interview, ".interview-question")
        inspect(".question-card label", 12, "body label")
        inspect(".question-helper", 12, "body")
        inspect(".answer-meta", 10, "metadata")

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_each_world_has_distinct_route_geometry_and_topography(self) -> None:
        page, errors = self.new_page(1280, 900)
        route_paths: dict[str, str] = {}
        markers: dict[str, tuple[Any, ...]] = {}

        for region_id in REGION_PATHS:
            self.load_state(page, self.base_state(page, region_id, stage=2), ".screen--map")
            route_paths[region_id] = page.locator(".quest-path path").get_attribute("d") or ""
            markers[region_id] = tuple(
                page.evaluate(
                    """() => {
                        const world = document.querySelector('.rpg-world');
                        const style = getComputedStyle(world);
                        const terrain = getComputedStyle(world, '::after');
                        const landmarkTypes = Array.from(
                            document.querySelectorAll('.world-landmark:not(.start-camp) .landmark-art')
                        ).map(item => item.className).sort().join('|');
                        return [
                            world.className,
                            style.getPropertyValue('--scene-sky').trim(),
                            style.getPropertyValue('--scene-terrain').trim(),
                            style.getPropertyValue('--scene-mountain').trim(),
                            style.getPropertyValue('--scene-accent').trim(),
                            terrain.backgroundColor,
                            terrain.boxShadow,
                            landmarkTypes,
                        ];
                    }"""
                )
            )

        failures: list[str] = []
        if len(set(route_paths.values())) != 3:
            failures.append(f"route paths are not region-distinct: {route_paths}")
        if len(set(markers.values())) != 3:
            failures.append(f"computed topography markers are not region-distinct: {markers}")
        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_avatar_and_skill_dock_never_cover_visible_map_decisions(self) -> None:
        """Protect route cards across phone, short-landscape, and desktop maps."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844), (844, 390), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            for region_id in REGION_PATHS:
                for stage in (0, 1, 2):
                    state = self.base_state(page, region_id, stage=stage)
                    self.load_state(page, state, ".screen--map")
                    avatar = page.locator(".map-avatar")
                    dock = page.locator("#skill-dock")
                    stops = page.locator(".world-stop")
                    for index in range(stops.count()):
                        stop = stops.nth(index)
                        if not stop.is_visible():
                            continue
                        node_id = stop.get_attribute("data-node-id")
                        avatar_overlap = self.overlap_area(avatar, stop)
                        if avatar_overlap > 0.5:
                            failures.append(
                                f"{width}x{height} {region_id} stage={stage} avatar/card {node_id} overlap={avatar_overlap:.1f}px²"
                            )
                        if not stop.is_disabled():
                            dock_overlap = self.overlap_area(dock, stop)
                            if dock_overlap > 0.5:
                                failures.append(
                                    f"{width}x{height} {region_id} stage={stage} dock/choice {node_id} overlap={dock_overlap:.1f}px²"
                                )
        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

    def test_active_route_titles_never_hide_which_choice_they_represent(self) -> None:
        """Require every specialization label to render in full without ellipsis."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844), (844, 390), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            for region_id in REGION_PATHS:
                state = self.base_state(page, region_id, stage=2)
                self.load_state(page, state, ".screen--map")
                titles = page.locator(".world-stop--choice:not([disabled]) .stop-copy strong")
                self.assertEqual(titles.count(), 2)
                for index in range(titles.count()):
                    title = titles.nth(index)
                    geometry = title.evaluate(
                        """element => ({
                            text: element.textContent.trim(),
                            whiteSpace: getComputedStyle(element).whiteSpace,
                            clientWidth: element.clientWidth,
                            scrollWidth: element.scrollWidth,
                        })"""
                    )
                    if geometry["whiteSpace"] == "nowrap":
                        failures.append(
                            f"{width}x{height} {region_id} {geometry['text']!r} cannot wrap"
                        )
                    if geometry["scrollWidth"] > geometry["clientWidth"] + 1:
                        failures.append(
                            f"{width}x{height} {region_id} {geometry['text']!r} clips horizontally"
                        )

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

    def test_skill_badges_keep_the_supplied_visual_language(self) -> None:
        """Require icon-led blue badges in the picker and growing journey stack."""

        page, errors = self.new_page(390, 844)
        skills = self.state_for_screen(page, "skill-select")
        self.load_state(page, skills, ".screen--skills")

        picker_icons = page.locator(".starter-glyph .hex-icon")
        self.assertEqual(picker_icons.count(), 10)
        icon_names = picker_icons.evaluate_all(
            "elements => elements.map(element => element.dataset.icon)"
        )
        self.assertNotIn("spark", icon_names)
        self.assertGreaterEqual(len(set(icon_names)), 8)

        map_state = self.base_state(page, "region-build-create", stage=1)
        self.load_state(page, map_state, ".screen--map")
        badges = page.locator("#skill-dock .hex-item")
        self.assertEqual(badges.count(), 5)
        self.assertEqual(
            badges.last.locator(".hex-icon").get_attribute("data-icon"),
            "lightbulb",
        )
        visual = badges.last.evaluate(
            """element => ({
                clip: getComputedStyle(element).clipPath,
                face: getComputedStyle(element, '::after').backgroundImage,
                keyline: getComputedStyle(element).backgroundColor,
            })"""
        )
        self.assertIn("polygon", visual["clip"])
        self.assertIn("linear-gradient", visual["face"])
        self.assertNotEqual(visual["keyline"], "rgba(0, 0, 0, 0)")
        self.assert_clean(errors)

    def test_single_cougar_explorer_is_consistent_across_the_journey(self) -> None:
        """Use one embedded cougar asset for landing, travel, and reflection."""

        page, errors = self.new_page(390, 844)
        landing = page.locator(".landing-explorer-stage .explorer-avatar")
        self.assertEqual(landing.count(), 1)
        self.assertEqual(page.locator(".avatar-choice").count(), 0)
        source = landing.get_attribute("src") or ""
        self.assertTrue(source.startswith("data:image/png;base64,"))

        map_state = self.base_state(page, "region-build-create", stage=1)
        self.load_state(page, map_state, ".screen--map")
        map_avatar = page.locator(".map-avatar .explorer-avatar")
        self.assertEqual(map_avatar.count(), 1)
        self.assertEqual(map_avatar.get_attribute("src"), source)

        reflection = self.state_for_screen(page, "reflection")
        self.load_state(page, reflection, ".screen--reflection")
        reflection_avatar = page.locator(".reflection-avatar .explorer-avatar")
        self.assertEqual(reflection_avatar.count(), 1)
        self.assertEqual(reflection_avatar.get_attribute("src"), source)
        self.assert_clean(errors)

    def test_reflection_cougar_frames_copy_without_covering_choices(self) -> None:
        """Keep the checkpoint guide prominent and clear of decision content."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844), (1440, 1000)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            reflection = self.state_for_screen(page, "reflection")
            self.load_state(page, reflection, ".screen--reflection")

            avatar = page.locator(".reflection-avatar .explorer-avatar")
            avatar_box = avatar.bounding_box()
            if not avatar_box or avatar_box["width"] < 70 or avatar_box["height"] < 70:
                failures.append(f"{width}x{height} reflection cougar is not visually prominent")
                continue

            targets = {
                "checkpoint label": page.locator(".reflection-card .screen-kicker"),
                "reflection title": page.locator("#reflection-title"),
                "first choice": page.locator(".reflection-choice").first,
            }
            for label, target in targets.items():
                overlap = self.overlap_area(avatar, target)
                if overlap > 0.5:
                    failures.append(
                        f"{width}x{height} cougar/{label} overlap={overlap:.1f}px²"
                    )

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)


if __name__ == "__main__":
    unittest.main()
