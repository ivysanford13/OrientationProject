# IS Career Launchpad — Interview Practice & Replay Interaction Spec

Status: implementation-ready proposal for the offline v1 prototype  
Scope: interview practice for four careers, completed-node recap/replay, three-way reflection, safe progress preservation, and a small Path Library.

This spec does not require an account, network request, API key, or AI model. All question text, rubric criteria, feedback strings, and source metadata are authored in `src/data.js`; `src/app.js` only runs the deterministic state transitions.

## Product intent

The career result should answer two practical questions for a new IS student:

1. “What might this job ask me to do?”
2. “What could I say or practice next?”

Interview practice is a short evidence-building loop, not a simulated recruiter and not an aptitude score. The player types an answer, receives transparent rubric feedback, and can try again without changing their career match or earned skills.

## Four initial interview paths

Implement these four first so the module covers all three worlds and demonstrates different response types:

| Career id | Response emphasis | Example question focus |
| --- | --- | --- |
| `application-developer` | technical explanation + user value | Explain a small app you built and how you tested it. |
| `data-analyst` | evidence + communication | Describe how you would turn messy data into a useful recommendation. |
| `cybersecurity-analyst` | investigation + judgment | Walk through how you would investigate a suspicious login alert. |
| `product-manager` | prioritization + tradeoffs | Explain how you would choose between two competing feature requests. |

Other careers should render a clearly labeled “Interview practice is being prepared” state until authored data exists. Never silently substitute a different career’s questions.

## Data contract

Add a separate `interviews` collection to the public data object. Keep the career profile as the source of role facts and use `sourceRefs` for attribution.

```js
{
  id: "interview-application-developer",
  careerId: "application-developer",
  title: "Application Developer interview practice",
  intro: "Practice explaining a small build, your decisions, and how you learned from testing.",
  estimatedMinutes: 4,
  questionIds: [
    "appdev-q1-story",
    "appdev-q2-debug",
    "appdev-q3-next"
  ],
  sourceRefs: ["src-career-profile", "src-oreilly-interview-basics"],
  questions: [
    {
      id: "appdev-q1-story",
      step: 1,
      type: "experience",
      prompt: "Tell us about a small application, class project, or prototype you would be proud to explain.",
      helper: "It is okay to use coursework or a personal project.",
      minWords: 20,
      rubric: {
        criteria: [
          { id: "context", label: "Sets the context", signals: ["project", "app", "user", "problem"] },
          { id: "contribution", label: "Names their contribution", signals: ["built", "designed", "wrote", "implemented", "created"] },
          { id: "result", label: "Explains an outcome", signals: ["tested", "improved", "learned", "result", "working"] }
        ],
        guidance: "A strong answer gives the situation, your contribution, and what changed because of the work.",
        strongAnswer: "I built a small scheduling app for a class project. I translated the requirements into a simple form, wrote the validation, and tested it with classmates. Their feedback showed that the first flow was confusing, so I simplified it and documented the design decision."
      }
    },
    {
      id: "appdev-q2-debug",
      step: 2,
      type: "scenario",
      prompt: "A user reports that a form sometimes loses their work. What would you do first?",
      helper: "Describe your investigation before proposing a fix.",
      minWords: 18,
      rubric: {
        criteria: [
          { id: "reproduce", label: "Reproduces or narrows the issue", signals: ["reproduce", "steps", "when", "browser", "input"] },
          { id: "evidence", label: "Uses evidence", signals: ["log", "error", "console", "test", "observe"] },
          { id: "communicate", label: "Communicates the next step", signals: ["user", "document", "team", "explain", "update"] }
        ],
        guidance: "Lead with a reproducible question, collect evidence, and keep the user or team informed.",
        strongAnswer: "I would ask for the steps, browser, and type of input that caused the loss, then try to reproduce it. I would inspect errors and add a focused test before changing the form. I would document what I found and explain the next step to the user and team."
      }
    },
    {
      id: "appdev-q3-next",
      step: 3,
      type: "growth",
      prompt: "What is one technical skill you would practice next for this kind of role?",
      helper: "Connect the skill to a concrete project or practice loop.",
      minWords: 12,
      rubric: {
        criteria: [
          { id: "skill", label: "Names a relevant skill", signals: ["javascript", "python", "sql", "testing", "git", "api", "programming"] },
          { id: "plan", label: "Names a practice plan", signals: ["build", "practice", "course", "project", "weekly", "read"] }
        ],
        guidance: "Name one skill and one small way you will practice it.",
        strongAnswer: "I would practice testing by adding unit tests to my next Python project. I would write one test for the expected behavior and one for an edge case, then use Git to track what I learned."
      }
    }
  ]
}
```

Create equivalent authored question sets for the other three career ids. Keep each set to three questions: experience, role scenario, and next-step plan. This fits the intended ten-minute journey without turning the result into a long form.

### Source ledger shape

```js
{
  id: "src-oreilly-interview-basics",
  title: "Technical Interviewing: Effective Questions, Answers, and Techniques",
  publisher: "O'Reilly Media",
  url: null,
  accessed: "2026-09-03",
  status: "research-pending",
  note: "Replace the placeholder URL only after the source is verified. Used for interview-practice framing; not used to generate automated feedback."
}
```

For the offline build, render title, publisher, access date, and URL as a visible Sources disclosure. The app must not fetch the URL. If a source has not been verified, mark it `research-pending` and do not present its claims as facts. A verified career-facts source can use the U.S. Bureau of Labor Statistics Occupational Outlook Handbook, for example the software developer page: `https://www.bls.gov/ooh/computer-and-information-technology/software-developers.htm`. Keep the source attached to the claims it supports; do not imply that a career profile or interview prompt was generated by that source.

## Deterministic rubric behavior

Feedback must be explainable from the player’s own text. Do not label it “AI feedback,” “interviewer impression,” or “correctness.”

```js
function evaluateAnswer(answer, rubric) {
  const normalized = answer.toLowerCase();
  const words = normalized.match(/[a-z0-9']+/g) || [];
  const matched = rubric.criteria.filter((criterion) =>
    criterion.signals.some((signal) => normalized.includes(signal))
  );
  const ratio = matched.length / rubric.criteria.length;
  const level = words.length >= rubric.minWords && ratio >= 0.67
    ? "strong"
    : words.length >= Math.max(8, Math.floor(rubric.minWords / 2)) && ratio >= 0.34
      ? "developing"
      : "starting";
  return {
    level,
    wordCount: words.length,
    matchedCriterionIds: matched.map((criterion) => criterion.id),
    missingCriterionIds: rubric.criteria
      .filter((criterion) => !matched.includes(criterion))
      .map((criterion) => criterion.id)
  };
}
```

Display:

- `Strong foundation` when the answer meets the strong threshold.
- `Developing answer` when some evidence is present.
- `Good starting point` when the answer is short or does not contain rubric signals.

Always show “You mentioned…” and “Try adding…” based on matched/missing criteria. Preserve the player’s exact answer locally and offer “Edit and try again.” Identical input must always produce identical level, matched criteria, and missing criteria.

## Interview screens

### 1. Interview intro

Open from the career result with `Practice a mock interview`. Show the role, three-question count, estimated time, and a short “This is practice, not a grade” note. Include `Start practice` and `Back to career`. If a prior attempt exists, show `Continue attempt` and `Try again`.

### 2. Question screen

Use the existing interview visual language: progress rail on the left at desktop, stacked above the form on mobile. Include:

- `Question 1 of 3` and career title
- prompt and helper text
- labeled textarea with a 1,000-character maximum
- visible word count and minimum-word hint
- `Check my answer` disabled only when empty
- `Save and exit` (preserves the draft)
- optional `Show a hint` disclosure that reveals the authored rubric guidance, not the strong answer

Submit with Enter only when focus is on the button; allow `Cmd/Ctrl+Enter` from the textarea as an enhancement.

### 3. Feedback screen

After checking an answer, keep the prompt and answer visible. Show the deterministic level, word count, matched criteria, missing criteria, authored guidance, and a collapsible strong-answer example. Buttons:

- `Next question`
- `Edit and try again`
- `Save and exit`

Do not block progress on “starting” feedback; the goal is practice and reflection.

### 4. Interview debrief

After question three, show all three answer statuses, the player’s strongest rubric area, one next practice suggestion, and sources. Buttons:

- `Practice again` — resets only this interview run
- `Return to career`
- `Open Path Library`

Never change `completed`, `rejected`, `earned`, `activeRegionId`, or `activeDomainId` from interview actions.

## State additions

Extend the active state without deleting existing fields:

```js
interview: {
  careerId: null,
  questionIndex: 0,
  answers: {},
  feedback: {},
  status: "idle", // idle | in-progress | feedback | complete
  returnScreen: "career"
},
journeys: [],
reflection: {
  nodeId: null,
  choice: null // enjoyed | maybe | not-for-me
}
```

Archived journey shape:

```js
{
  id: "journey-<timestamp>",
  name,
  avatar,
  starterSkills,
  recommendedRegionId,
  completed,
  rejected,
  earned,
  lastCareerId,
  completedAt
}
```

When migrating v2 state, use `journeys: []` and an idle interview object. Preserve the active route exactly. Interview drafts should be capped to the current authored question ids; unknown ids are ignored safely.

## Completed-node recap and replay

Change the map action by node status:

| Node state | Button label | Result |
| --- | --- | --- |
| open | `Explore <node>` | Existing travel → challenge flow |
| completed | `Review <node>` | Read-only recap; no reflection or route mutation |
| rejected | `Trail closed` | Disabled, with explanation and Path Library access |

The recap screen shows the node description, authored mini-game concept, earned skill, answer history (`Enjoyed` / `Maybe` / `Not for me`), and `Replay challenge`. Replay runs the mini-game with `mode: "replay"`; completion returns to recap and never awards, rejects, or advances.

Guard all mutation handlers with the node status. In particular, `rejectNode(completedId)` must be a no-op, and a completed node must never re-enter the enjoyment checkpoint.

## Three-way enjoyment reflection

Replace the current binary choice with:

1. `I enjoyed it — keep going`  
   Marks the node completed, awards its skill once, and advances.
2. `Maybe — show me another example`  
   Does not complete or reject. Return to the current fork with the node still open and a `Try again later` state.
3. `Not for me — try the other trail`  
   Opens a confirmation modal explaining that the trail will close for this journey. On confirmation, marks it rejected and opens its sibling.

The reflection copy must continue to state that there is no wrong answer. “Maybe” is the safe default for uncertainty and must not punish exploration.

## Progress-preserving confirmations

Use one shared confirmation pattern for actions that can discard active work:

- `Restart journey`: archive option + clear active journey.
- `Start another path`: archive current journey + begin new loadout.
- `Edit starter skills`: archive current journey before resetting route decisions.
- leaving an in-progress interview: save draft automatically, then return.

Modal requirements:

- state exactly what is preserved and what is reset
- show completed node count and earned skill count
- primary safe action: `Keep exploring`
- destructive action names the consequence: `Archive and start another path`
- Escape, close button, and backdrop preserve the journey

## Path Library

Expose `Path Library` after the first completed node, in the header or career result. Keep it compact and offline:

- active journey card with progress
- archived journey cards with region, career, date, and skill count
- 12 career cards grouped by world
- statuses: `Current`, `Completed`, `Available`, `Trail closed`
- completed career opens its recap and interview practice
- available career opens a preview only; it does not mutate the active route

The library is the replay surface. It prevents `Start another path` from erasing the player’s history and makes the 12 terminal careers discoverable.

## QA acceptance criteria

### Interview

- All four authored careers open the correct question set and role title offline.
- Three questions progress in order; refresh resumes the current question and draft.
- Empty answers cannot submit; 1,000-character limit is enforced visibly.
- Same answer + same rubric always yields the same feedback object.
- Feedback shows matched and missing criteria without claiming human or AI judgment.
- `Practice again` resets only the interview run.
- Interview actions never modify map completion, rejection, earned skills, or career id.
- Sources disclosure shows authored attribution and makes no network request.

### Replay and reflection

- Completed-node recap cannot award duplicate skills or reject the node.
- Replay returns to recap, never to reflection, and leaves progression unchanged.
- `Maybe` leaves the route open; `Not for me` requires confirmation before rejection.
- Confirmed rejection opens the sibling route and preserves earned skills.
- Revisit, reload, and browser back behavior preserve the active route.

### Preservation and accessibility

- Restart/edit/new-path confirmations expose safe and destructive actions with clear labels.
- Archived journeys survive reload and can be reopened.
- Every new screen has one focused heading and keyboard-reachable controls.
- Textarea, disclosures, modal focus trap, and announcements work with keyboard and screen reader.
- Controls remain at least 44px and pass the existing mobile/tablet no-overflow checks.
- Reduced-motion mode removes travel, reward, and screen-transition motion.
- Offline QA reports zero non-file requests and zero console errors.
