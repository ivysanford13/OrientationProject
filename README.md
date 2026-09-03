# IS Career Launchpad

A retro RPG-style Information Systems career explorer for incoming BYU students. Students choose four strengths from a ten-skill loadout, receive a recommended career world, and watch their avatar travel through a three-level path. Every planned one-minute mini-game ends with an enjoyment check: **yes** awards a new skill and advances the map; **no** closes that trail and returns the student to its alternative.

## Run the prototype

Open `index.html` directly in a browser. It is a self-contained offline build with no server or API key.

## Edit the prototype

- `src/data.js` contains the ten starter skills and recommendation weights, every map node, skill reward, mini-game placeholder, and career match.
- `src/app.js` contains progression and persistence logic.
- `src/research-data.js` contains the verified salary ledger and authored interview-practice content; the build inlines it for offline use.
- `src/styles.css` contains the visual system and animation.
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

## Version-one mini-games

The first version reserves an editable 60-second scene for every map point. Selecting **Skip game for now** reaches the enjoyment checkpoint. Choosing **Yes, keep going** awards that node's skill and advances the map; choosing **No, try another trail** locks that branch and sends the player back to the sibling choice. Full gameplay can replace any placeholder later without changing this progression contract.

## Research and interview practice

Career results include a national BLS OEWS May 2023 10th–25th percentile entry proxy, its federal SOC mapping, and a Sources disclosure explaining limitations. Application Developer, Data Analyst, Cybersecurity Analyst, and Product Manager also include three-question offline practice interviews with transparent keyword-based rubric feedback; answers are stored only in local browser storage and never affect route progress. See [`docs/RESEARCH_NOTES.md`](docs/RESEARCH_NOTES.md) for attribution and methodology.

## Current journey

1. Create an explorer.
2. Select exactly four of ten starter skills.
3. Receive a scored recommendation for Build and Create, Analyze and Solve, or People and Lead.
4. Move the avatar to a map point and preview its mini-game placeholder.
5. Answer whether the activity felt enjoyable; advance or reroute accordingly.
6. Reach a career match with four starter skills plus three earned skills in the bottom-right honeycomb.
