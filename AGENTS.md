# OrientationProject Agent Guide

## Product Goal

Build a polished, browser-runnable Information Systems career exploration prototype. The first version implements the complete landing, four-of-ten skill loadout, recommendation, avatar-led world map, progression, career-result, and growing skill-stack experience. Mini-games are intentionally editable placeholders followed by a required enjoyment check.

## Architecture Rules

- Keep editable source files in `src/` and generate the standalone root `index.html` with `scripts/build.py`.
- The generated `index.html` must work offline with no server, external requests, account, or API key.
- `src/data.js` is the source of truth for the map, mini-game placeholders, earned skills, and career outcomes.
- Starter-skill affinity weights also live in `src/data.js`; tuning recommendations must not require controller changes.
- `src/app.js` owns behavior and state. `src/styles.css` owns presentation. `src/template.html` owns the document shell.
- Mini-game rendering must be data-driven so each placeholder can later be replaced independently without changing navigation or skill-award logic.
- Use semantic HTML controls over SVG/CSS scenery. Every interaction must work by keyboard.
- Preserve reduced-motion support and do not encode state by color alone.

## Git Workflow

- Work on feature branches and merge through pull requests.
- Agents must avoid editing files outside their assigned ownership.
- The lead/orchestrator owns integration, generated artifacts, and final fixes.
- Do not commit secrets, credentials, generated browser profiles, or dependency caches.

## Version-One Acceptance Criteria

- A user can enter a name, choose an avatar, and select exactly four of ten starter skills.
- The four skills appear immediately in the bottom-right honeycomb and deterministically recommend one of three regions.
- The focused world map reveals only the current region, then its two domains, then the chosen domain's two specializations.
- The avatar visibly travels from its current stage to the selected point before the mini-game opens.
- Selecting a node opens its planned mini-game placeholder.
- After skipping a placeholder, **Yes** awards its configured skill and advances; **No** locks that option and forces the sibling route.
- A complete route starts with four skills, awards three more, and ends at the correct career match.
- Users can restart, revisit completed nodes, and complete another route.
- Layout works at mobile, tablet, and desktop sizes and respects reduced motion.
- The root `index.html` runs offline and produces no browser console errors.

## Corrections & Lessons Learned

- The map is a three-level decision tree based on Build + Create, Analyze + Solve, and People + Lead; do not reduce it to a flat career picker.
- Every map point has a planned mini-game and awards the skill named in the product specification.
- Version-one mini-games are placeholders only. Do not overbuild gameplay before the shared progression and editing structure is validated.
- The bottom hexagonal skill stack visibly grows after every completed or skipped mini-game.
- Starter skills must be selected before the first path and must drive the initial region recommendation.
- The map is a focused RPG world that shifts one tier at a time; do not return to the all-branches decision-tree presentation.
- Skill tiles live in a compact honeycomb HUD at the bottom-right rather than a full-width footer.
- A mini-game reward is conditional on answering that the student enjoyed the activity; a no response closes that branch and forces its alternative.
- Persistent HUD elements must become normal-flow content on compact and interview screens so they never cover decisions or response fields.
- Modal confirmation handlers must both mutate state and close the modal so the page is never left inert after a confirmed action.
- When a data factory gains new visual metadata, explicitly preserve that field through normalization instead of silently dropping it.
- Programmatic focus after screen changes should use `preventScroll` and reset the new screen to the top.
- Skill rewards use the supplied deep-blue enamel hexagon language: pale keyline, dark outline, line-art pictogram, condensed uppercase label, and honeycomb stacking.
