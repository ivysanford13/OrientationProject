"""Release gates for researched career context and interview practice.

The suite exercises the generated standalone ``index.html`` through Playwright.
It intentionally seeds completed routes so interview behavior can be tested in
isolation without weakening the end-to-end route tests in the QA matrix.
"""

from __future__ import annotations

import copy
import re
import unittest
from pathlib import Path
from typing import Any

from playwright.sync_api import Browser, BrowserContext, Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]
APP_URL = (PROJECT_ROOT / "index.html").as_uri()
STORAGE_KEY = "is-career-launchpad:v2"
TOUCH_TARGET_PX = 44
SUBPIXEL_TOLERANCE_PX = 0.1

CAREER_PATHS: dict[str, tuple[str, str, str]] = {
    "application-developer": ("region-build-create", "domain-software-apps", "spec-code-build-uis"),
    "software-engineer": ("region-build-create", "domain-software-apps", "spec-architect-software"),
    "cloud-engineer": ("region-build-create", "domain-systems-tech", "spec-deploy-cloud-platforms"),
    "systems-engineer": ("region-build-create", "domain-systems-tech", "spec-support-connected-systems"),
    "data-analyst": ("region-analyze-solve", "domain-data-insights", "spec-explain-trends-data"),
    "data-scientist": ("region-analyze-solve", "domain-data-insights", "spec-predict-outcomes-models"),
    "cybersecurity-analyst": ("region-analyze-solve", "domain-security-risk", "spec-detect-investigate-threats"),
    "it-risk-analyst": ("region-analyze-solve", "domain-security-risk", "spec-evaluate-controls-risk"),
    "it-project-manager": ("region-people-lead", "domain-projects-delivery", "spec-plan-timelines-delivery"),
    "business-analyst": ("region-people-lead", "domain-projects-delivery", "spec-improve-processes-requirements"),
    "ux-designer": ("region-people-lead", "domain-users-products", "spec-research-design-experiences"),
    "product-manager": ("region-people-lead", "domain-users-products", "spec-set-strategy-prioritize-value"),
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

SUPPORTED_CAREERS = {
    "application-developer",
    "data-analyst",
    "cybersecurity-analyst",
    "product-manager",
}


class InterviewModuleTests(unittest.TestCase):
    """Protect research provenance, practice flow, and saved route integrity."""

    @classmethod
    def setUpClass(cls) -> None:
        cls.playwright = sync_playwright().start()
        cls.browser: Browser = cls.playwright.chromium.launch(headless=True)

    @classmethod
    def tearDownClass(cls) -> None:
        cls.browser.close()
        cls.playwright.stop()

    def new_page(
        self,
        viewport: dict[str, int] | None = None,
    ) -> tuple[Page, list[str], list[str]]:
        """Open the offline artifact with isolated storage and diagnostics."""

        context: BrowserContext = self.browser.new_context(
            viewport=viewport or {"width": 1280, "height": 900},
        )
        self.addCleanup(context.close)
        page = context.new_page()
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
        page.evaluate("window.localStorage.clear()")
        page.reload(wait_until="load")
        page.locator("#app").wait_for()
        return page, errors, requests

    @staticmethod
    def research(page: Page) -> dict[str, Any]:
        """Return the research payload embedded in the generated artifact."""

        return page.evaluate("window.CAREER_RESEARCH_DATA")

    @staticmethod
    def completed_career_state(page: Page, career_id: str) -> dict[str, Any]:
        """Create a valid terminal route state for one authored career."""

        region_id, domain_id, specialization_id = CAREER_PATHS[career_id]
        return page.evaluate(
            """([regionId, domainId, specializationId, starterSkills]) => {
                const model = CareerLaunchpadApp.getModel();
                const region = model.regions.find(item => item.id === regionId);
                const domain = region.children.find(item => item.id === domainId);
                const specialization = domain.children.find(item => item.id === specializationId);
                const nodes = [region, domain, specialization];
                const rejectedSibling = domain.children.find(item => item.id !== specializationId);
                return {
                    version: 2,
                    screen: 'career',
                    name: 'Interview QA',
                    avatar: 'comet',
                    starterSkills,
                    recommendedRegionId: regionId,
                    activeRegionId: regionId,
                    activeDomainId: domainId,
                    completed: nodes.map(item => item.id),
                    earned: nodes.map((item, index) => ({
                        skillId: item.earnedSkill,
                        nodeId: item.id,
                        earnedAt: index + 1,
                    })),
                    rejected: rejectedSibling ? [rejectedSibling.id] : [],
                    selectedNodeId: specializationId,
                    travelTargetId: null,
                    travelFromId: null,
                    lastCareerId: specialization.career.id,
                    lastAward: true,
                    reviewingNodeId: null,
                    interview: {
                        careerId: null,
                        questionIndex: 0,
                        answers: {},
                        feedback: {},
                        status: 'idle',
                        returnScreen: 'career',
                    },
                };
            }""",
            [region_id, domain_id, specialization_id, STARTER_LOADOUTS[region_id]],
        )

    def show_career(self, page: Page, career_id: str) -> dict[str, Any]:
        """Load a completed career without replaying the already-gated map."""

        payload = self.completed_career_state(page, career_id)
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, payload],
        )
        page.reload(wait_until="load")
        page.locator("#career-title").wait_for()
        return payload

    def open_first_question(self, page: Page, career_id: str) -> dict[str, Any]:
        """Open a career's authored practice and advance to question one."""

        payload = self.show_career(page, career_id)
        page.locator('[data-action="open-interview"]').click()
        page.locator(".interview-intro").wait_for()
        page.locator('[data-action="interview-start"]').click()
        page.locator(".interview-question").wait_for()
        return payload

    @staticmethod
    def assert_clean(errors: list[str]) -> None:
        """Fail on any uncaught browser or console error."""

        if errors:
            raise AssertionError("; ".join(errors))

    @staticmethod
    def assert_no_horizontal_overflow(page: Page) -> None:
        """Fail when the current document exceeds its mobile viewport."""

        width = page.evaluate(
            """() => ({
                viewport: document.documentElement.clientWidth,
                document: document.documentElement.scrollWidth,
                body: document.body.scrollWidth,
            })"""
        )
        if width["document"] > width["viewport"] + 1 or width["body"] > width["viewport"] + 1:
            raise AssertionError(f"horizontal overflow: {width}")

    @staticmethod
    def progress_snapshot(page: Page) -> dict[str, Any]:
        """Return only route state that interview actions may never mutate."""

        return page.evaluate(
            """() => {
                const state = CareerLaunchpadApp.getState();
                return {
                    completed: state.completed,
                    rejected: state.rejected,
                    earned: state.earned,
                };
            }"""
        )

    def test_research_data_contract_and_generated_artifact_are_complete(self) -> None:
        page, errors, _requests = self.new_page()
        research = self.research(page)
        salaries = research["salaryByCareerId"]
        interviews = {item["careerId"]: item for item in research["interviews"]}
        sources = {item["id"]: item for item in research["sourceLedger"]}

        self.assertEqual(set(salaries), set(CAREER_PATHS))
        self.assertEqual(set(interviews), SUPPORTED_CAREERS)
        self.assertIn("10th-to-25th percentile", research["salaryContext"]["entryProxy"])
        self.assertIn("national", research["salaryContext"]["dataset"].casefold())
        self.assertGreaterEqual(len(research["salaryContext"]["method"]), 4)

        for career_id, salary in salaries.items():
            self.assertRegex(salary["soc"], r"^\d{2}-\d{4}$", career_id)
            self.assertRegex(salary["entryRange"]["label"], r"^\$[\d,]+–\$[\d,]+$", career_id)
            self.assertLess(salary["entryRange"]["low"], salary["entryRange"]["high"], career_id)
            self.assertTrue(salary["mapping"].strip(), career_id)
            self.assertTrue(salary["proxyLimitations"].strip(), career_id)
            for source_id in salary["sourceRefs"]:
                self.assertIn(source_id, sources, f"{career_id}: unresolved source {source_id}")

        for career_id, interview in interviews.items():
            self.assertEqual(len(interview["questions"]), 3, career_id)
            self.assertEqual(interview["questionIds"], [item["id"] for item in interview["questions"]])
            self.assertIn("authored practice content", interview["attribution"])
            for question in interview["questions"]:
                self.assertGreaterEqual(len(question["criteria"]), 2)
                self.assertEqual(question["rubric"]["criteria"], question["criteria"])
                self.assertTrue(question["guidance"].strip())
                self.assertTrue(question["strongAnswer"].strip())
                for source_id in question["sourceRefs"]:
                    self.assertIn(source_id, sources, f"{question['id']}: unresolved source")

        for source_id, source in sources.items():
            self.assertTrue(source["title"].strip(), source_id)
            self.assertRegex(source["url"], r"^https://", source_id)
            self.assertEqual(source["status"], "verified", source_id)
        self.assert_clean(errors)

    def test_all_twelve_careers_render_sourced_salary_methodology_offline(self) -> None:
        page, errors, requests = self.new_page()
        research = self.research(page)
        sources = {item["id"]: item for item in research["sourceLedger"]}

        for career_id, salary in research["salaryByCareerId"].items():
            self.show_career(page, career_id)
            salary_card = page.locator(".career-stat").first
            salary_text = salary_card.inner_text()
            self.assertIn("ENTRY RANGE · NATIONAL PROXY", salary_text, career_id)
            self.assertIn(salary["entryRange"]["label"], salary_text, career_id)
            self.assertIn(f"SOC {salary['soc']}", salary_text, career_id)
            self.assertIn("BLS OEWS May 2023", salary_text, career_id)
            self.assertIn("10th–25th percentile", salary_text, career_id)

            disclosure = page.locator("details.career-sources")
            self.assertEqual(
                disclosure.locator("summary").inner_text().casefold(),
                "sources & salary methodology",
            )
            disclosure.evaluate("element => { element.open = true; }")
            disclosure_text = disclosure.inner_text()
            self.assertIn("national occupational benchmark", disclosure_text, career_id)
            self.assertIn(salary["occupation"], disclosure_text, career_id)
            self.assertIn(salary["soc"], disclosure_text, career_id)
            self.assertIn(salary["mapping"], disclosure_text, career_id)
            self.assertIn(salary["proxyLimitations"], disclosure_text, career_id)

            expected_source_ids = list(dict.fromkeys(salary["sourceRefs"] + ["src-bls-oews-methods"]))
            link_titles = disclosure.locator(".source-list a").all_inner_texts()
            hrefs = disclosure.locator(".source-list a").evaluate_all(
                "elements => elements.map(element => element.href)"
            )
            self.assertEqual(link_titles, [sources[source_id]["title"] for source_id in expected_source_ids])
            self.assertEqual(hrefs, [sources[source_id]["url"] for source_id in expected_source_ids])

        external_requests = [url for url in requests if not url.startswith("file:")]
        self.assertEqual(external_requests, [], f"runtime external requests: {external_requests}")
        self.assert_clean(errors)

    def test_supported_careers_open_the_correct_three_question_interview(self) -> None:
        page, errors, _requests = self.new_page()
        research = self.research(page)
        interviews = {item["careerId"]: item for item in research["interviews"]}
        sources = {item["id"]: item for item in research["sourceLedger"]}

        for career_id in sorted(SUPPORTED_CAREERS):
            self.show_career(page, career_id)
            page.locator('[data-action="open-interview"]').click()
            intro = page.locator(".interview-intro")
            intro.wait_for()
            self.assertIn(
                interviews[career_id]["title"].replace(" interview practice", "").casefold(),
                intro.inner_text().casefold(),
            )
            self.assertIn(interviews[career_id]["intro"], intro.inner_text())
            source_details = intro.locator("details.interview-sources")
            source_details.evaluate("element => { element.open = true; }")
            self.assertIn("authored practice content", source_details.inner_text())
            self.assertEqual(
                source_details.locator(".source-list a").all_inner_texts(),
                [sources[source_id]["title"] for source_id in interviews[career_id]["sourceRefs"]],
            )

            page.locator('[data-action="interview-start"]').click()
            question = page.locator(".interview-question")
            question.wait_for()
            self.assertEqual(page.locator(".rail-step").count(), 3)
            self.assertEqual(
                page.locator("#question-title").inner_text().casefold(),
                interviews[career_id]["questions"][0]["prompt"].casefold(),
            )
            state = page.evaluate("CareerLaunchpadApp.getState().interview")
            self.assertEqual(state["careerId"], career_id)
            self.assertEqual(state["questionIndex"], 0)
            self.assertEqual(state["status"], "in-progress")
        self.assert_clean(errors)

    def test_unsupported_career_has_a_clear_coming_next_state(self) -> None:
        page, errors, _requests = self.new_page()
        for career_id in sorted(set(CAREER_PATHS) - SUPPORTED_CAREERS):
            self.show_career(page, career_id)
            card = page.locator(".practice-card--soon")
            self.assertTrue(card.is_visible(), career_id)
            self.assertIn("coming next.", card.inner_text().casefold(), career_id)
            self.assertIn("dedicated practice path", card.inner_text().casefold(), career_id)
            self.assertEqual(page.locator('[data-action="open-interview"]').count(), 0, career_id)
        self.assert_clean(errors)

    def test_feedback_edit_next_debrief_and_replay_preserve_route_progress(self) -> None:
        page, errors, _requests = self.new_page()
        self.open_first_question(page, "application-developer")
        research = self.research(page)
        interview = next(
            item for item in research["interviews"] if item["careerId"] == "application-developer"
        )
        before = self.progress_snapshot(page)

        submit = page.locator('#interview-answer-form button[type="submit"]')
        self.assertTrue(submit.is_disabled())
        weak_answer = (
            "In a class project for a user problem, the context involved a confusing schedule "
            "and several requirements that made the project difficult for our group to understand."
        )
        page.locator("#interview-answer").fill(weak_answer)
        expected_words = len(re.findall(r"[a-z0-9']+", weak_answer.casefold()))
        self.assertEqual(page.locator("#word-count").inner_text(), f"{expected_words} words")
        self.assertFalse(submit.is_disabled())
        self.assertEqual(
            page.evaluate("CareerLaunchpadApp.getState().interview.answers['appdev-q1-story']"),
            weak_answer,
        )
        submit.click()
        feedback = page.evaluate("CareerLaunchpadApp.getState().interview.feedback['appdev-q1-story']")
        self.assertEqual(feedback["matchedCriterionIds"], ["context"])
        self.assertEqual(feedback["missingCriterionIds"], ["contribution", "result"])
        self.assertEqual(
            page.evaluate("CareerLaunchpadApp.getState().screen"),
            "interview-feedback",
            "submitting a valid answer must navigate to the visible feedback screen",
        )
        page.locator(".interview-feedback").wait_for()
        self.assertEqual(page.locator(".criteria-list--matched li").count(), 1)
        self.assertEqual(page.locator(".criteria-list--missing li").count(), 2)

        page.locator('[data-action="interview-edit"]').click()
        self.assertEqual(page.locator("#interview-answer").input_value(), weak_answer)
        strong_answer = (
            "For a class project, I built an app for a user problem. I implemented the form "
            "and tested the working result with classmates. Their feedback improved the final experience."
        )
        page.locator("#interview-answer").fill(strong_answer)
        submit = page.locator('#interview-answer-form button[type="submit"]')
        submit.click()
        strong_feedback = page.evaluate(
            "CareerLaunchpadApp.getState().interview.feedback['appdev-q1-story']"
        )
        self.assertEqual(strong_feedback["level"], "strong")
        self.assertEqual(strong_feedback["matchedCriterionIds"], ["context", "contribution", "result"])
        self.assertEqual(strong_feedback["missingCriterionIds"], [])
        self.assertEqual(page.locator(".criteria-list--missing").count(), 0)

        page.locator('[data-action="interview-next"]').click()
        self.assertEqual(
            page.locator("#question-title").inner_text().casefold(),
            interview["questions"][1]["prompt"].casefold(),
        )
        second_answer = (
            "I would reproduce the steps in the browser with the same input, inspect the console "
            "error and logs, write a focused test, then document the update for the user and team."
        )
        page.locator("#interview-answer").fill(second_answer)
        page.locator("#interview-answer").press("Control+Enter")
        page.locator(".interview-feedback").wait_for()
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.status"), "feedback")

        page.locator('[data-action="interview-next"]').click()
        self.assertEqual(
            page.locator("#question-title").inner_text().casefold(),
            interview["questions"][2]["prompt"].casefold(),
        )
        third_answer = (
            "I would practice Python testing by building a weekly project, reading documentation, "
            "and using Git to record each test and programming lesson."
        )
        page.locator("#interview-answer").fill(third_answer)
        page.locator('#interview-answer-form button[type="submit"]').click()
        page.locator(".interview-feedback").wait_for()
        page.locator('[data-action="interview-next"]').click()

        debrief = page.locator(".interview-debrief")
        debrief.wait_for()
        self.assertEqual(page.locator(".debrief-list li").count(), 3)
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.status"), "complete")
        self.assertEqual(self.progress_snapshot(page), before)

        page.locator('[data-action="interview-replay"]').click()
        page.locator(".interview-question").wait_for()
        replay_state = page.evaluate("CareerLaunchpadApp.getState().interview")
        self.assertEqual(replay_state["questionIndex"], 0)
        self.assertEqual(replay_state["status"], "in-progress")
        self.assertEqual(replay_state["answers"], {})
        self.assertEqual(replay_state["feedback"], {})
        self.assertEqual(self.progress_snapshot(page), before)
        self.assert_clean(errors)

    def test_seeded_feedback_supports_edit_next_debrief_and_replay(self) -> None:
        """Exercise downstream controls independently from answer submission."""

        page, errors, _requests = self.new_page()
        research = self.research(page)
        interview = next(
            item for item in research["interviews"] if item["careerId"] == "application-developer"
        )
        base = self.completed_career_state(page, "application-developer")
        before = {
            "completed": base["completed"],
            "rejected": base["rejected"],
            "earned": base["earned"],
        }

        feedback_state = copy.deepcopy(base)
        feedback_state["screen"] = "interview-feedback"
        feedback_state["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 0,
            "answers": {"appdev-q1-story": "A saved project answer."},
            "feedback": {
                "appdev-q1-story": {
                    "level": "starting",
                    "wordCount": 4,
                    "matchedCriterionIds": ["context"],
                    "missingCriterionIds": ["contribution", "result"],
                }
            },
            "status": "feedback",
            "returnScreen": "career",
        }
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, feedback_state],
        )
        page.reload(wait_until="load")
        page.locator(".interview-feedback").wait_for()
        page.locator('[data-action="interview-edit"]').click()
        page.locator(".interview-question").wait_for()
        self.assertEqual(page.locator("#interview-answer").input_value(), "A saved project answer.")
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.status"), "in-progress")

        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, feedback_state],
        )
        page.reload(wait_until="load")
        page.locator('[data-action="interview-next"]').click()
        page.locator(".interview-question").wait_for()
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.questionIndex"), 1)
        self.assertEqual(
            page.locator("#question-title").inner_text().casefold(),
            interview["questions"][1]["prompt"].casefold(),
        )

        debrief_state = copy.deepcopy(base)
        debrief_state["screen"] = "interview-feedback"
        debrief_state["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 2,
            "answers": {
                question["id"]: f"Saved answer for question {index + 1}."
                for index, question in enumerate(interview["questions"])
            },
            "feedback": {
                question["id"]: {
                    "level": "developing",
                    "wordCount": 8,
                    "matchedCriterionIds": [question["criteria"][0]["id"]],
                    "missingCriterionIds": [
                        criterion["id"] for criterion in question["criteria"][1:]
                    ],
                }
                for question in interview["questions"]
            },
            "status": "feedback",
            "returnScreen": "career",
        }
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, debrief_state],
        )
        page.reload(wait_until="load")
        page.locator('[data-action="interview-next"]').click()
        page.locator(".interview-debrief").wait_for()
        self.assertEqual(page.locator(".debrief-list li").count(), 3)
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.status"), "complete")
        self.assertEqual(self.progress_snapshot(page), before)

        page.locator('[data-action="interview-replay"]').click()
        page.locator(".interview-question").wait_for()
        replay = page.evaluate("CareerLaunchpadApp.getState().interview")
        self.assertEqual(replay["questionIndex"], 0)
        self.assertEqual(replay["answers"], {})
        self.assertEqual(replay["feedback"], {})
        self.assertEqual(self.progress_snapshot(page), before)
        self.assert_clean(errors)

    def test_save_exit_continue_and_draft_survive_reload(self) -> None:
        page, errors, _requests = self.new_page()
        self.open_first_question(page, "application-developer")
        before = self.progress_snapshot(page)
        draft = "My draft project answer is specific enough to save, but I am not ready to submit it yet."

        page.locator("#interview-answer").fill(draft)
        self.assertEqual(
            page.evaluate("CareerLaunchpadApp.getState().interview.answers['appdev-q1-story']"),
            draft,
        )
        page.reload(wait_until="load")
        page.locator(".interview-question").wait_for()
        self.assertEqual(page.locator("#interview-answer").input_value(), draft)

        page.locator('[data-action="interview-save-exit"]').first.click()
        page.locator("#career-title").wait_for()
        self.assertEqual(self.progress_snapshot(page), before)
        self.assertIn("Continue practice", page.locator('[data-action="open-interview"]').inner_text())

        page.locator('[data-action="open-interview"]').click()
        page.locator(".interview-intro").wait_for()
        self.assertIn("Continue practice", page.locator('[data-action="interview-start"]').inner_text())
        page.locator('[data-action="interview-start"]').click()
        self.assertEqual(page.locator("#interview-answer").input_value(), draft)
        self.assertEqual(self.progress_snapshot(page), before)
        self.assert_clean(errors)

    def test_command_enter_submits_and_preserves_route_progress(self) -> None:
        """Gate the macOS Command+Enter shortcut independently from Control."""

        page, errors, _requests = self.new_page()
        self.open_first_question(page, "data-analyst")
        before = self.progress_snapshot(page)
        answer = (
            "For a class project, our goal was to answer a decision question. I cleaned and "
            "compared the data in a chart, found an insight, and made a specific recommendation."
        )
        page.locator("#interview-answer").fill(answer)
        page.locator("#interview-answer").press("Meta+Enter")
        page.locator(".interview-feedback").wait_for()
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().screen"), "interview-feedback")
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.status"), "feedback")
        self.assertEqual(self.progress_snapshot(page), before)
        self.assert_clean(errors)

    def test_mobile_keyboard_flow_reflows_and_preserves_progress(self) -> None:
        page, errors, _requests = self.new_page({"width": 390, "height": 844})
        self.show_career(page, "product-manager")
        before = self.progress_snapshot(page)
        self.assert_no_horizontal_overflow(page)

        practice = page.locator('[data-action="open-interview"]')
        practice.focus()
        self.assertTrue(practice.evaluate("element => element === document.activeElement"))
        page.keyboard.press("Enter")
        page.locator(".interview-intro").wait_for()
        self.assertEqual(page.locator("#interview-title").get_attribute("tabindex"), "-1")
        start = page.locator('[data-action="interview-start"]')
        start.focus()
        page.keyboard.press("Enter")
        page.locator(".interview-question").wait_for()
        self.assert_no_horizontal_overflow(page)

        textarea = page.locator("#interview-answer")
        textarea.focus()
        self.assertTrue(textarea.evaluate("element => element === document.activeElement"))
        answer = (
            "Our team had a customer project goal with competing scope. I compared impact and effort, "
            "chose the priority, gathered feedback, and measured the improved result after launch."
        )
        textarea.fill(answer)
        self.assertRegex(page.locator("#word-count").inner_text(), r"^\d+ words$")
        textarea.press("Control+Enter")
        self.assertEqual(
            page.evaluate("CareerLaunchpadApp.getState().screen"),
            "interview-feedback",
            "Ctrl+Enter must navigate to the visible feedback screen",
        )
        page.locator(".interview-feedback").wait_for()
        self.assert_no_horizontal_overflow(page)
        self.assertEqual(self.progress_snapshot(page), before)

        # Every visible interview action should meet the WCAG touch-target floor.
        button_heights = page.locator(".interview-screen button:visible").evaluate_all(
            "elements => elements.map(element => element.getBoundingClientRect().height)"
        )
        self.assertTrue(button_heights)
        self.assertGreaterEqual(
            min(button_heights) + SUBPIXEL_TOLERANCE_PX,
            TOUCH_TARGET_PX,
        )
        self.assert_clean(errors)

    def test_mobile_seeded_feedback_is_reachable_and_clear_of_the_skill_dock(self) -> None:
        """Check the mobile feedback surface even if live submission is broken."""

        page, errors, _requests = self.new_page({"width": 390, "height": 844})
        base = self.completed_career_state(page, "application-developer")
        base["screen"] = "interview-feedback"
        base["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 0,
            "answers": {"appdev-q1-story": "A saved project answer with useful context."},
            "feedback": {
                "appdev-q1-story": {
                    "level": "starting",
                    "wordCount": 7,
                    "matchedCriterionIds": ["context"],
                    "missingCriterionIds": ["contribution", "result"],
                }
            },
            "status": "feedback",
            "returnScreen": "career",
        }
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, base],
        )
        page.reload(wait_until="load")
        page.locator(".interview-feedback").wait_for()
        self.assert_no_horizontal_overflow(page)

        targets = page.locator(".interview-screen button:visible").evaluate_all(
            """elements => elements.map(element => ({
                label: element.innerText.trim(),
                width: element.getBoundingClientRect().width,
                height: element.getBoundingClientRect().height,
            }))"""
        )
        undersized = [
            target
            for target in targets
            if target["width"] + SUBPIXEL_TOLERANCE_PX < TOUCH_TARGET_PX
            or target["height"] + SUBPIXEL_TOLERANCE_PX < TOUCH_TARGET_PX
        ]
        self.assertEqual(undersized, [], f"undersized mobile interview actions: {undersized}")

        next_button = page.locator('[data-action="interview-next"]')
        next_button.scroll_into_view_if_needed()
        page.wait_for_timeout(50)
        boxes = page.evaluate(
            """() => {
                const first = document.querySelector('[data-action="interview-next"]').getBoundingClientRect();
                const second = document.querySelector('#skill-dock').getBoundingClientRect();
                return {
                    first: { left: first.left, top: first.top, right: first.right, bottom: first.bottom },
                    second: { left: second.left, top: second.top, right: second.right, bottom: second.bottom },
                };
            }"""
        )
        horizontal = max(
            0,
            min(boxes["first"]["right"], boxes["second"]["right"])
            - max(boxes["first"]["left"], boxes["second"]["left"]),
        )
        vertical = max(
            0,
            min(boxes["first"]["bottom"], boxes["second"]["bottom"])
            - max(boxes["first"]["top"], boxes["second"]["top"]),
        )
        self.assertLessEqual(horizontal * vertical, 0.5, f"feedback CTA overlaps skill dock: {boxes}")

        next_button.focus()
        page.keyboard.press("Enter")
        page.locator(".interview-question").wait_for()
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().interview.questionIndex"), 1)
        self.assert_no_horizontal_overflow(page)
        self.assert_clean(errors)

    def test_malformed_interview_storage_recovers_without_blank_or_error(self) -> None:
        page, errors, _requests = self.new_page()
        base = self.completed_career_state(page, "application-developer")

        unsupported = copy.deepcopy(base)
        unsupported["screen"] = "interview-question"
        unsupported["interview"] = {
            "careerId": "not-an-authored-career",
            "questionIndex": "NaN",
            "answers": 7,
            "feedback": "bad",
            "status": "corrupt",
            "returnScreen": None,
        }
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, unsupported],
        )
        page.reload(wait_until="load")
        page.locator("#career-title").wait_for()
        self.assertEqual(page.evaluate("CareerLaunchpadApp.getState().screen"), "career")
        self.assertEqual(
            page.evaluate("CareerLaunchpadApp.getState().interview"),
            {
                "careerId": None,
                "questionIndex": 0,
                "answers": {},
                "feedback": {},
                "status": "idle",
                "returnScreen": "career",
            },
        )

        clamped = copy.deepcopy(base)
        clamped["screen"] = "interview-question"
        clamped["interview"] = {
            "careerId": "application-developer",
            "questionIndex": 999,
            "answers": {
                "appdev-q3-next": "x" * 1200,
                "unknown-question": "must be removed",
            },
            "feedback": {"unknown-question": {"level": "strong"}},
            "status": "corrupt",
            "returnScreen": "somewhere-else",
        }
        page.evaluate(
            "([key, value]) => localStorage.setItem(key, JSON.stringify(value))",
            [STORAGE_KEY, clamped],
        )
        page.reload(wait_until="load")
        page.locator(".interview-question").wait_for()
        recovered = page.evaluate("CareerLaunchpadApp.getState().interview")
        self.assertEqual(recovered["careerId"], "application-developer")
        self.assertEqual(recovered["questionIndex"], 2)
        self.assertEqual(recovered["status"], "idle")
        self.assertEqual(recovered["returnScreen"], "career")
        self.assertEqual(set(recovered["answers"]), {"appdev-q3-next"})
        self.assertEqual(len(recovered["answers"]["appdev-q3-next"]), 1000)
        self.assertEqual(recovered["feedback"], {})
        self.assertEqual(page.locator("#interview-answer").input_value(), "x" * 1000)
        self.assertEqual(self.progress_snapshot(page), {
            "completed": clamped["completed"],
            "rejected": clamped["rejected"],
            "earned": clamped["earned"],
        })
        self.assert_clean(errors)


if __name__ == "__main__":
    unittest.main()
