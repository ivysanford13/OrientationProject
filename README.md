# IS Career Launchpad

A retro RPG-style Information Systems career explorer for incoming BYU students. Students join a pixel-art BYU cougar guide, choose four strengths from a ten-skill loadout, receive a recommended career world, and watch their explorer travel through a three-level path. The first two selections have one-minute mini-games and enjoyment checks; the third selects a career style and opens its career result directly.

## Run the prototype

Open `index.html` directly in a browser. It is a self-contained offline build with no server or API key.

## Edit the prototype

- `src/data.js` contains the ten starter skills and recommendation weights, every map node, the first two tiers' skill rewards and mini-game placeholders, and career matches.
- `src/app.js` contains progression and persistence logic.
- `src/research-data.js` contains the verified salary ledger and authored interview-practice content; the build inlines it for offline use.
- `src/styles.css` contains the visual system and animation.
- `src/assets/career-world-*-v2.jpg` contains the three original floating-island scenes used behind the semantic map controls; the build embeds each scene once for offline use.
- `src/template.html` contains the document shell.

After editing, rebuild the deliverable:

```bash
python3 scripts/build.py
```

Run the lightweight regression tests:

```bash
python3 -m unittest discover -s tests
python3 tests/e2e_smoke.py
python3 qa/run_qa_matrix.py
```

## Mini-games

The Analyze and Solve region includes a playable six-panel scanner jigsaw designed for a sub-60-second session. It supports drag-and-drop plus click, touch, and keyboard placement; completing it reaches the same enjoyment checkpoint used by the journey. The People and Lead region also includes its playable crew draft. Remaining activities stay editable 60-second placeholders with **Skip game for now** controls.

Choosing **Yes, keep going** after any activity awards that node's skill and advances the map; choosing **No, try another trail** locks that branch and sends the player back to the sibling choice. The final specialization selection has no mini-game, awards its career skill immediately, and opens its career result directly.

Each career world uses its own cinematic atlas image as non-interactive scenery. The map holds one close zoom while its data-driven camera pans from the starting clearing to the crossroads and then the career platform. Route branches snap to their destination cards and respond individually to hover, keyboard focus, and travel selection. Route telemetry, destination cards, chapter labels, and the cougar are separate DOM layers, so the journey remains keyboard-accessible and any region's art can be replaced without rewriting progression logic.

## Research and interview practice

Career results include a national BLS OEWS May 2023 10th–25th percentile entry proxy, its federal SOC mapping, and a Sources disclosure explaining limitations. Application Developer, Data Analyst, Cybersecurity Analyst, and Product Manager also include three-question offline practice interviews with transparent keyword-based rubric feedback; answers are stored only in local browser storage and never affect route progress. See [`docs/RESEARCH_NOTES.md`](docs/RESEARCH_NOTES.md) for attribution and methodology.

## Current journey

1. Create an explorer.
2. Select exactly four of ten starter skills.
3. Receive a scored recommendation for Build and Create, Analyze and Solve, or People and Lead.
4. Move the avatar to a map point and complete its mini-game or preview its placeholder.
5. Answer whether the activity felt enjoyable; advance or reroute accordingly.
6. Choose a career style and reach its career match with four starter skills plus three earned skills in the bottom-right honeycomb.
