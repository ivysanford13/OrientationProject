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
                }).filter(entry => entry.skillId);
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
            state["selectedNodeId"] = REGION_PATHS["region-build-create"][0]
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
                page.locator(".career-result-actions"),
                f"{width}x{height} result dock/action group",
            )

            for label_selector, title_selector, screen_label in (
                (".career-result-heading > .screen-kicker", "#career-title", "career"),
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
            reward_badge = page.locator(".reward-callout .badge-hex--original")
            self.assertEqual(reward_badge.count(), 1)
            reward_visual = reward_badge.evaluate(
                """badge => ({
                    background: getComputedStyle(badge).backgroundColor,
                    mask: getComputedStyle(badge.querySelector('.skill-badge-art')).clipPath,
                })"""
            )
            self.assertEqual(reward_visual["background"], "rgba(0, 0, 0, 0)")
            self.assertIn("polygon", reward_visual["mask"])
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
            ".stop-copy small",
            ".map-avatar small",
            ".compass-card > span",
            ".compass-card small",
            ".skill-dock .dock-label h2",
            ".skill-dock .dock-label p",
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
            route_paths[region_id] = page.locator(".quest-path .route-line").first.get_attribute("d") or ""
            markers[region_id] = tuple(
                page.evaluate(
                    """() => {
                        const world = document.querySelector('.rpg-world');
                        const style = getComputedStyle(world);
                        const terrain = getComputedStyle(world, '::after');
                        return [
                            world.className,
                            style.getPropertyValue('--scene-sky').trim(),
                            style.getPropertyValue('--scene-terrain').trim(),
                            style.getPropertyValue('--scene-mountain').trim(),
                            style.getPropertyValue('--scene-accent').trim(),
                            terrain.backgroundColor,
                            terrain.boxShadow,
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

    def test_map_uses_skill_badges_without_decorative_landmark_chips(self) -> None:
        """Keep destination meaning in each route card instead of side labels."""

        page, errors = self.new_page(1440, 900)
        for stage in (0, 1, 2):
            state = self.base_state(page, "region-build-create", stage=stage)
            self.load_state(page, state, ".screen--map")
            self.assertEqual(page.locator(".world-landmark, .world-milestones").count(), 0)

            stops = page.locator(".world-stop")
            self.assertGreater(stops.count(), 0)
            for index in range(stops.count()):
                badge = stops.nth(index).locator(".stop-icon--badge")
                self.assertEqual(badge.count(), 1)
                artwork = badge.locator(".skill-badge-art, .hex-icon")
                self.assertEqual(artwork.count(), 1)

            original_badge = page.locator(".stop-icon--badge.badge-hex--original").first
            if original_badge.count():
                mask = original_badge.locator(".skill-badge-art").evaluate(
                    "image => getComputedStyle(image).clipPath"
                )
                background = original_badge.evaluate(
                    "badge => getComputedStyle(badge).backgroundColor"
                )
                self.assertIn("polygon", mask)
                self.assertEqual(background, "rgba(0, 0, 0, 0)")

            quiet_motion = page.evaluate(
                """() => ({
                    pulse: getComputedStyle(document.querySelector('.route-pulse')).display,
                    routeAnimation: getComputedStyle(document.querySelector('.route-line')).animationName,
                    routeFilter: getComputedStyle(document.querySelector('.route-line')).filter,
                    trail: getComputedStyle(document.querySelector('.map-avatar'), '::before').display,
                })"""
            )
            self.assertEqual(
                quiet_motion,
                {
                    "pulse": "none",
                    "routeAnimation": "none",
                    "routeFilter": "none",
                    "trail": "none",
                },
            )

        self.assert_clean(errors)

    def test_final_map_cards_keep_separate_reading_zones(self) -> None:
        """Prevent completed history, active choices, and the HUD from stacking."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((844, 390), (1280, 720), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            for region_id in REGION_PATHS:
                state = self.base_state(page, region_id, stage=2)
                self.load_state(page, state, ".screen--map")
                cards = page.locator(".world-stop:visible")
                for first_index in range(cards.count()):
                    for second_index in range(first_index + 1, cards.count()):
                        overlap = self.overlap_area(
                            cards.nth(first_index), cards.nth(second_index)
                        )
                        if overlap > 0.5:
                            failures.append(
                                f"{width}x{height} {region_id} cards {first_index}/{second_index} overlap={overlap:.1f}px²"
                            )
                hud = page.locator(".world-stage-label")
                for index in range(cards.count()):
                    overlap = self.overlap_area(hud, cards.nth(index))
                    if overlap > 0.5:
                        failures.append(
                            f"{width}x{height} {region_id} HUD/card {index} overlap={overlap:.1f}px²"
                        )

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

    def test_world_camera_advances_through_three_spatial_checkpoints(self) -> None:
        """Require one close panorama crop to pan without zoom pumping."""

        page, errors = self.new_page(1440, 900)
        camera_frames: list[dict[str, float]] = []
        for stage in (0, 1, 2):
            state = self.base_state(page, "region-build-create", stage=stage)
            self.load_state(page, state, ".screen--map")
            panorama = page.locator(".world-panorama")
            self.assertEqual(panorama.count(), 1)
            camera_frames.append(
                page.locator(".atlas-art").evaluate(
                    """element => {
                        const style = getComputedStyle(element);
                        return {
                            x: parseFloat(style.backgroundPositionX),
                            y: parseFloat(style.backgroundPositionY),
                            zoom: parseFloat(style.backgroundSize.split(' ')[1]),
                        };
                    }"""
                )
            )

            meter = page.locator(".journey-meter li")
            self.assertEqual(meter.count(), 3)
            self.assertEqual(page.locator(".journey-meter li.is-current").count(), 1)
            self.assertIn("is-current", meter.nth(stage).get_attribute("class") or "")
            self.assertEqual(page.locator(".journey-meter li.is-complete").count(), stage)

        rounded_x = {round(frame["x"], 1) for frame in camera_frames}
        self.assertEqual(len(rounded_x), 3, camera_frames)
        self.assertTrue(all(frame["zoom"] >= 200 for frame in camera_frames), camera_frames)
        self.assertEqual(len({round(frame["zoom"], 1) for frame in camera_frames}), 1, camera_frames)
        self.assertGreater(abs(camera_frames[0]["x"] - camera_frames[2]["x"]), 75, camera_frames)

        travel_state = self.base_state(page, "region-build-create", stage=1)
        self.load_state(page, travel_state, ".screen--map")
        traveling = page.evaluate(
            """() => {
                document.querySelector('[data-node-id="domain-software-apps"]').click();
                const atlas = getComputedStyle(document.querySelector('.atlas-art'));
                return {
                    world: Boolean(document.querySelector('.rpg-world.is-traveling')),
                    avatar: Boolean(document.querySelector('.map-avatar.is-traveling')),
                    destination: Boolean(document.querySelector('.world-stop.is-destination')),
                    cameraAnimation: atlas.animationName,
                    cameraZoom: atlas.backgroundSize,
                };
            }"""
        )
        self.assertEqual(
            traveling,
            {
                "world": True,
                "avatar": True,
                "destination": True,
                "cameraAnimation": "none",
                "cameraZoom": "auto 250%",
            },
        )
        self.assert_clean(errors)

    def test_route_branches_snap_to_and_react_with_destination_cards(self) -> None:
        """Keep every route endpoint paired with its pointer and keyboard target."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((390, 844), (1440, 900)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            for stage in (0, 1, 2):
                state = self.base_state(page, "region-build-create", stage=stage)
                self.load_state(page, state, ".screen--map")
                offsets = page.evaluate(
                    """() => [...document.querySelectorAll('.route-option')].map(group => {
                        const path = group.querySelector('.route-line');
                        const endpoint = path.getPointAtLength(path.getTotalLength());
                        const screenPoint = new DOMPoint(endpoint.x, endpoint.y)
                            .matrixTransform(path.getScreenCTM());
                        const card = document.querySelector(
                            `.world-stop[data-route-node-id="${group.dataset.routeNodeId}"]`
                        ).getBoundingClientRect();
                        return {
                            id: group.dataset.routeNodeId,
                            x: Math.abs(screenPoint.x - (card.left + card.width / 2)),
                            y: Math.abs(screenPoint.y - (card.top + card.height / 2)),
                        };
                    })"""
                )
                for offset in offsets:
                    if offset["x"] > 1 or offset["y"] > 1:
                        failures.append(
                            f"{width}x{height} stage={stage} {offset['id']} endpoint offset "
                            f"x={offset['x']:.1f} y={offset['y']:.1f}"
                        )

            state = self.base_state(page, "region-build-create", stage=1)
            self.load_state(page, state, ".screen--map")
            first_choice = page.locator('[data-node-id="domain-software-apps"]')
            first_choice.focus()
            self.assertIn("has-route-focus", page.locator(".rpg-world").get_attribute("class") or "")
            self.assertEqual(page.locator(".route-option.is-focused").count(), 1)
            opacities = page.locator(".route-option").evaluate_all(
                "groups => groups.map(group => parseFloat(getComputedStyle(group).opacity))"
            )
            self.assertGreater(opacities[0], opacities[1])

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(all_errors)

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

    def test_short_landscape_chapter_hud_never_covers_route_choices(self) -> None:
        """Keep the compact chapter meter in the left clearing beside forks."""

        page, errors = self.new_page(844, 390)
        failures: list[str] = []
        for stage in (1, 2):
            state = self.base_state(page, "region-build-create", stage=stage)
            self.load_state(page, state, ".screen--map")
            hud = page.locator(".world-stage-label")
            choices = page.locator(".world-stop--choice:not([disabled])")
            self.assertEqual(choices.count(), 2)
            for index in range(choices.count()):
                overlap = self.overlap_area(hud, choices.nth(index))
                if overlap > 0.5:
                    failures.append(
                        f"stage={stage} HUD/choice overlap={overlap:.1f}px²"
                    )

        self.assertEqual(failures, [], "; ".join(failures))
        self.assert_clean(errors)

    def test_phone_chapter_hud_yields_to_travel_banner(self) -> None:
        """Give the full-width phone destination banner an unobstructed band."""

        failures: list[str] = []
        all_errors: list[str] = []
        for width, height in ((320, 568), (390, 844)):
            page, errors = self.new_page(width, height)
            all_errors.extend(errors)
            for stage in (1, 2):
                state = self.base_state(page, "region-build-create", stage=stage)
                self.load_state(page, state, ".screen--map")
                target_id = (
                    "domain-software-apps"
                    if stage == 1
                    else "spec-code-build-uis"
                )
                geometry = page.evaluate(
                    """targetId => {
                        document.querySelector(`[data-node-id="${targetId}"]`).click();
                        const hud = document.querySelector('.world-stage-label');
                        const banner = document.querySelector('.travel-banner');
                        const style = getComputedStyle(hud);
                        const a = hud.getBoundingClientRect();
                        const b = banner.getBoundingClientRect();
                        return {
                            hidden: style.visibility === 'hidden' || Number(style.opacity) === 0,
                            overlap: Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) *
                                Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)),
                        };
                    }""",
                    target_id,
                )
                # A hidden HUD may retain its layout rectangle, but it cannot
                # visually obscure or intercept the banner during travel.
                if not geometry["hidden"]:
                    failures.append(
                        f"{width}x{height} stage={stage} hidden={geometry['hidden']} overlap={geometry['overlap']:.1f}px²"
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

    def test_skill_selection_updates_without_rerendering_or_scrolling(self) -> None:
        """A loadout click must leave the same screen node and viewport in place."""

        page, errors = self.new_page(390, 844)
        skills = self.state_for_screen(page, "skill-select")
        self.load_state(page, skills, ".screen--skills")
        target = page.locator('[data-skill-id="starter-visual-design"]')
        target.scroll_into_view_if_needed()
        before = page.evaluate(
            """() => {
                window.__skillScreenBeforeClick = document.querySelector('.screen--skills');
                return { scrollY: window.scrollY };
            }"""
        )
        target.click()
        after = page.evaluate(
            """() => ({
                sameScreen: document.querySelector('.screen--skills') === window.__skillScreenBeforeClick,
                scrollY: window.scrollY,
                activeSkill: document.activeElement && document.activeElement.dataset.skillId,
                selectedCount: document.querySelectorAll('.starter-skill[aria-pressed="true"]').length,
                dockCount: document.querySelectorAll('#skill-dock .hex-item').length,
            })"""
        )

        self.assertTrue(after["sameScreen"])
        self.assertLessEqual(abs(after["scrollY"] - before["scrollY"]), 1)
        self.assertEqual(after["activeSkill"], "starter-visual-design")
        self.assertEqual(after["selectedCount"], 3)
        self.assertEqual(after["dockCount"], 3)
        self.assert_clean(errors)

    def test_map_travel_starts_inside_the_existing_world(self) -> None:
        """Choosing a stop must animate the existing map instead of refreshing it."""

        page, errors = self.new_page(390, 844)
        state = self.base_state(page, "region-build-create", stage=1)
        self.load_state(page, state, ".screen--map")
        result = page.evaluate(
            """() => {
                const world = document.querySelector('.rpg-world');
                const scrollY = window.scrollY;
                document.querySelector('[data-node-id="domain-software-apps"]').click();
                return {
                    sameWorld: document.querySelector('.rpg-world') === world,
                    scrollYBefore: scrollY,
                    scrollYAfter: window.scrollY,
                    traveling: world.classList.contains('is-traveling'),
                    hasBanner: Boolean(world.querySelector('.travel-banner')),
                };
            }"""
        )

        self.assertTrue(result["sameWorld"])
        self.assertEqual(result["scrollYAfter"], result["scrollYBefore"])
        self.assertTrue(result["traveling"])
        self.assertTrue(result["hasBanner"])
        self.assert_clean(errors)

    def test_skill_badges_keep_the_supplied_visual_language(self) -> None:
        """Require icon-led blue badges in the picker and growing journey stack."""

        page, errors = self.new_page(390, 844)
        skills = self.state_for_screen(page, "skill-select")
        self.load_state(page, skills, ".screen--skills")

        picker_badges = page.locator(".starter-badge-art")
        self.assertEqual(picker_badges.count(), 10)
        badge_sources = picker_badges.evaluate_all(
            "elements => elements.map(element => element.currentSrc)"
        )
        self.assertEqual(len(set(badge_sources)), 10)
        self.assertTrue(all(source.startswith("data:image/jpeg;base64,") for source in badge_sources))

        map_state = self.base_state(page, "region-build-create", stage=1)
        self.load_state(page, map_state, ".screen--map")
        badges = page.locator("#skill-dock .hex-item")
        self.assertEqual(badges.count(), 5)
        earned_art = badges.last.locator(".skill-badge-art")
        self.assertEqual(earned_art.count(), 1)
        self.assertTrue((earned_art.get_attribute("src") or "").startswith("data:image/jpeg;base64,"))
        visual = badges.last.evaluate(
            """element => ({
                clip: getComputedStyle(element).clipPath,
                face: getComputedStyle(element.querySelector('.hex-face')).inset,
                recreatedLayer: getComputedStyle(element, '::after').display,
            })"""
        )
        self.assertIn("polygon", visual["clip"])
        self.assertIn(visual["face"], ("0px", "0px 0px 0px"))
        self.assertEqual(visual["recreatedLayer"], "none")
        self.assert_clean(errors)

    def test_skill_dock_keeps_portrait_honeycomb_geometry(self) -> None:
        """Keep the supplied tall proportions in a stable bottom-right honeycomb."""

        page, errors = self.new_page(1440, 900)
        state = self.base_state(page, "region-build-create", stage=3)
        state["screen"] = "career"
        self.load_state(page, state, ".screen--career")

        dock = page.locator("#skill-dock")
        badges = dock.locator(".hex-item")
        self.assertEqual(badges.count(), 7)
        boxes = [badges.nth(index).bounding_box() for index in range(7)]
        self.assertTrue(all(box is not None for box in boxes))
        badge_boxes = [box for box in boxes if box is not None]

        for box in badge_boxes:
            self.assertGreater(box["height"], box["width"])
            self.assertAlmostEqual(box["width"] / box["height"], 66 / 76, delta=0.03)

        top_row = [badge_boxes[index] for index in (0, 1, 4)]
        bottom_row = [badge_boxes[index] for index in (2, 3, 5, 6)]
        top_centers = [box["y"] + box["height"] / 2 for box in top_row]
        bottom_centers = [box["y"] + box["height"] / 2 for box in bottom_row]
        self.assertLessEqual(max(top_centers) - min(top_centers), 0.5)
        self.assertLessEqual(max(bottom_centers) - min(bottom_centers), 0.5)
        self.assertAlmostEqual(bottom_centers[0] - top_centers[0], 57, delta=0.5)

        top_x = sorted(box["x"] for box in top_row)
        bottom_x = sorted(box["x"] for box in bottom_row)
        self.assertTrue(all(abs((right - left) - 66) <= 0.5 for left, right in zip(top_x, top_x[1:])))
        self.assertTrue(all(abs((right - left) - 66) <= 0.5 for left, right in zip(bottom_x, bottom_x[1:])))
        self.assertAlmostEqual(top_x[0] - bottom_x[0], 33, delta=0.5)

        # Career screens intentionally keep the tray in normal flow, but its
        # cluster remains right-aligned. Map screens use the fixed HUD anchor.
        inline_dock = dock.bounding_box()
        self.assertIsNotNone(inline_dock)
        assert inline_dock is not None
        self.assertLessEqual(1440 - (inline_dock["x"] + inline_dock["width"]), 55)

        map_state = self.base_state(page, "region-build-create", stage=2)
        self.load_state(page, map_state, ".screen--map")
        fixed_dock = page.locator("#skill-dock").bounding_box()
        self.assertIsNotNone(fixed_dock)
        assert fixed_dock is not None
        self.assertLessEqual(1440 - (fixed_dock["x"] + fixed_dock["width"]), 20)
        self.assertLessEqual(900 - (fixed_dock["y"] + fixed_dock["height"]), 20)
        self.assert_clean(errors)

    def test_eighth_skill_extends_honeycomb_without_earned_sublabel(self) -> None:
        """An eighth skill must occupy the remaining upper-row slot."""

        page, errors = self.new_page(1440, 900)
        state = self.base_state(page, "region-build-create", stage=3)
        state["screen"] = "career"
        state["completed"].append("spec-architect-software")
        state["earned"].append(
            {
                "skillId": "designer",
                "nodeId": "spec-architect-software",
                "earnedAt": 4,
            }
        )
        self.load_state(page, state, ".screen--career")

        badges = page.locator("#skill-dock .hex-item")
        self.assertEqual(badges.count(), 8)
        artwork_sizes = badges.locator(".skill-badge-art").evaluate_all(
            "images => images.map(image => [image.naturalWidth, image.naturalHeight])"
        )
        self.assertEqual(set(map(tuple, artwork_sizes)), {(145, 167)})
        seventh = badges.nth(6).bounding_box()
        eighth = badges.nth(7).bounding_box()
        sixth = badges.nth(5).bounding_box()
        fifth = badges.nth(4).bounding_box()
        self.assertIsNotNone(seventh)
        self.assertIsNotNone(eighth)
        self.assertIsNotNone(sixth)
        self.assertIsNotNone(fifth)
        assert seventh is not None and eighth is not None and sixth is not None and fifth is not None
        self.assertAlmostEqual(seventh["y"], sixth["y"], delta=0.5)
        self.assertAlmostEqual(seventh["x"] - sixth["x"], 66, delta=0.5)
        self.assertAlmostEqual(eighth["y"], fifth["y"], delta=0.5)
        self.assertAlmostEqual(eighth["x"] - fifth["x"], 66, delta=0.5)
        self.assertAlmostEqual(eighth["x"] - seventh["x"], 33, delta=0.5)
        self.assertAlmostEqual(seventh["y"] - eighth["y"], 57, delta=0.5)
        self.assertEqual(page.locator("#skill-dock .hex-item.is-earned small").count(), 0)
        self.assertEqual(page.locator("#skill-dock .hex-item.is-starter small").count(), 0)
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
