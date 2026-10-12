# Shards of the Crimson Moon v2

A 480×270 pixel pilgrimage at integer scale (2× = 960×540, 4× = 1920×1080, never fractional),
with 16-bit-style art. The approved style and palette are in `ART_DIRECTION_V2.md` and
`PALETTE_V2_EXPANDED.md`. The asset contract and the frame list are in `ASSET_SPEC.md`.

## Run

```bash
python3 -m http.server 8765
# http://127.0.0.1:8765/
```

You can also open `index.html` straight from disk (file://). It is an installable PWA
(`manifest.json` + `sw.js`, cache `shards-v2-1`). Touch controls appear on touch devices.

Saves use the key `shards-crimson-moon-2.0`. On first run, a valid v1 save (`shards-crimson-moon-v2`)
is carried over and the title says so. A broken v1 save is ignored and you start fresh.

## Controls

- **Keyboard:**
  - Move: Arrows or A/D
  - Jump: Z or Space
  - Strike: X or J
  - Dodge: C, K or Shift
  - Skill: V or L
  - Confirm: Enter
  - Pause: Esc
- **Xbox pad:**
  - Move: stick or D-pad
  - A: jump, or interact when a prompt is showing; confirm in menus
  - B: dodge; back in menus
  - X: strike
  - Y: skill
  - Start: pause
  - Prompts show button icons while the pad is in use, and there is a Vibration setting (`PLAY.md`).

## Art pipeline

All art is generated from code in `tools/v2/`:

```bash
cd tools/v2
python3 build_levels.py     # 14 levels: sky/far/mid/play layers + collision art
python3 build_art.py        # packs sheets, UI, FX, portraits, thumbs, icons -> assets/, data/art.js
```

## Verify

```bash
node tools/audit.mjs                     # data, canon wording, art contract, frames
python3 tools/v2/color_audit_v2.py       # palette, no #FFFFFF, binary alpha
node tests/text-fit.mjs                  # text fits at 480x270
node tests/smoke.mjs                     # boot, every scene, v1-save migration
node tests/audio-smoke.mjs
node tests/reach.mjs                     # every traverse can be finished
node tests/playthrough.mjs               # Order: 6 bosses + ending; Cult: 5 bosses + ending
node tests/mobile.mjs                    # iPhone 13 + Pixel 7, touch only
node tests/gamepad.mjs                   # mocked Xbox pad
node tests/shots.mjs                     # shots/v2-final-*.png at 1920x1080
```
