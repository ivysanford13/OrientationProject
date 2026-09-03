# OrientationProject Agent Guide

## Product Goal

Build a polished, browser-runnable Information Systems career exploration prototype. The first version implements the complete landing, map, progression, career-result, and growing skill-stack experience. Mini-games are intentionally editable placeholders with a single **Skip for now** action.

## Architecture Rules

- Keep editable source files in `src/` and generate the standalone root `index.html` with `scripts/build.py`.
- The generated `index.html` must work offline with no server, external requests, account, or API key.
- `src/data.js` is the source of truth for the map, mini-game placeholders, earned skills, and career outcomes.
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

- A user can enter a name, choose an avatar, and begin the career journey.
- The map exposes the complete three-region, six-domain, twelve-specialization hierarchy.
- Selecting a node opens its planned mini-game placeholder.
- **Skip for now** records the node as complete, awards its configured skill, animates the new hex into the bottom skill stack, and reveals the next map tier.
- A complete route awards three skills and ends at the correct career match.
- Users can restart, revisit completed nodes, and complete another route.
- Layout works at mobile, tablet, and desktop sizes and respects reduced motion.
- The root `index.html` runs offline and produces no browser console errors.

## Corrections & Lessons Learned

- The map is a three-level decision tree based on Build + Create, Analyze + Solve, and People + Lead; do not reduce it to a flat career picker.
- Every map point has a planned mini-game and awards the skill named in the product specification.
- Version-one mini-games are placeholders only. Do not overbuild gameplay before the shared progression and editing structure is validated.
- The bottom hexagonal skill stack visibly grows after every completed or skipped mini-game.
