# Shards of the Crimson Moon (v3.2)

A 480×270 pixel pilgrimage at integer scale (2× = 960×540, 4× = 1920×1080, never fractional),
with 16-bit-style art. How to play, and what each version added, is in `PLAY.md`.

## Run

```bash
python3 -m http.server 8765
# http://127.0.0.1:8765/
```

You can also open `index.html` straight from disk (file://). Served over http(s) it is an installable PWA
(`manifest.json` + `sw.js`). The service worker cache is named after the build (`shards-v3-2`). It precaches
all code and art on the first visit, so the game then plays offline. Code is served stale-while-revalidate,
art cache-first, and caches from older versions are deleted when a new version activates.
Touch controls appear on touch devices, and Xbox-style pads are supported.

## Saves

- There are three save files, each stored under the `shards29:` key prefix in localStorage. They export and import as `shards-of-the-crimson-moon-save` JSON.
- Older saves are migrated automatically:
  - single-slot v2 saves (`shards-crimson-moon-2.0`)
  - v1 saves (`shards-crimson-moon-v2`)
- The Delve device leaderboard is stored in `shards-delve-board-v32`.

## Controls

- **Keyboard:**
  - Move: Arrows or A/D
  - Jump: Z or Space
  - Strike: X or J
  - Dodge: C, K or Shift
  - Skill: V or L
  - Confirm: Enter
  - Pause/back: Esc
- **Xbox pad:**
  - Move: stick or D-pad
  - A: jump, or interact when a prompt is showing; confirm in menus
  - B: dodge; back in menus
  - X: strike
  - Y: skill
  - Start: pause

## What ships

The download contains only the playable game: `index.html`, `manifest.json`, `sw.js`, `css/`, `data/`, `src/`, `assets/`, this README and `PLAY.md`.
The art generators (`tools/`), the test suites (`tests/`), the design notes (`docs/`, `CANON_SUMMARY.md`, art direction) and the screenshots live in the development repository. They are not included in the zip.
