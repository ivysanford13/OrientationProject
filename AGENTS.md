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

- A user can enter a name, meet the single BYU cougar explorer, and select exactly four of ten starter skills.
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
- The supplied pixel-art BYU cougar is the only explorer avatar; it appears consistently on the landing page, map, and reflection checkpoints.
- Career results keep the skill tray in normal document flow; a fixed bottom-right tray can obscure the interview-practice card on desktop.
- Small route labels above condensed display headlines need a reserved vertical band because the cap glyphs visually rise beyond their line box.
- Embed shared binary art once per standalone build and reuse its data-URI constant across renderers; repeated inline copies unnecessarily inflate the HTML.
- After replacing a screen's DOM, treat focus left on a detached trigger as stale; move focus to the new heading so keyboard and screen-reader users receive the new context.
- Map decision titles must wrap in full at every supported viewport; ellipses hide the meaning of a route and make the choice depend on guessing.
- Any map-card typography or size change requires collision checks against the avatar and floating skill dock at phone, short-landscape, and desktop viewports.
- Rejecting the last open sibling must climb to the nearest viable branch—or another ranked world—while preserving earned skills; never render a zero-route map.
- Playwright journey setup must synchronize on persisted state after each rerendering selection; visually timed click sequences can produce flaky release evidence under sustained load.
- The loadout action bar belongs in document flow; a sticky footer can obscure the selection meter and skill cards, especially before any compact-screen scrolling.
- High-detail world art remains a decorative layer beneath semantic route controls; never bake destinations, labels, or the cougar into the map image.
- Travel animation must park the cougar beside its destination card, not on top of it, and the visible route must terminate at the active stop.
- Programmatically focused screen headings should announce context without rendering a control-style focus rectangle; reserve visible rings for interactive elements.
- The skill HUD is a true two-row honeycomb, not a horizontal carousel: preserve the supplied tall hex proportions and stable cell positions as rewards are added.
- Each career region is one traversable panorama: advancing a chapter pans the camera deeper into the same world while the cougar travels between route stops; do not revert to static stage backdrops.
