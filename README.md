# IS Career Launchpad

A retro RPG-style Information Systems career explorer for incoming BYU students. Students move through a three-level career map, preview planned one-minute mini-games, and grow a hexagonal skill stack after every activity.

## Run the prototype

Open `index.html` directly in a browser. It is a self-contained offline build with no server or API key.

## Edit the prototype

- `src/data.js` contains every map node, skill reward, mini-game placeholder, and career match.
- `src/app.js` contains progression and persistence logic.
- `src/styles.css` contains the visual system and animation.
- `src/template.html` contains the document shell.

After editing, rebuild the deliverable:

```bash
python3 scripts/build.py
```

Run the lightweight regression tests:

```bash
python3 -m unittest discover -s tests
```

## Version-one mini-games

The first version reserves an editable 60-second scene for every map point. Selecting **Skip for now** simulates completion, awards that node's skill, and continues the journey. Full gameplay will be implemented in later iterations.
