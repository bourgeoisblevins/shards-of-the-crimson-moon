# Shards of the Crimson Moon — how to play

**Play in the browser (phone or computer):** https://bourgeoisblevins.github.io/shards-of-the-crimson-moon/

## On a phone

1. Open the link above and hold the phone **sideways** (portrait shows a "Turn your phone" screen and the game waits).
2. The first tap goes full screen where the browser allows it (Android Chrome). On iPhone, Safari has no
   full-screen API: use **Share > Add to Home Screen** and launch the game from its icon for full screen.
3. Everything is played by touch: tap menu rows directly, hold the left pads to move, use the right pads to
   jump / strike / dodge / use your skill. Several fingers at once work (run and jump, run and strike).
4. **OK** appears at the bottom centre when there is something to do: talk to the guide, open Travel at the
   pad, enter a boss gate, or use the altar. Tap the dialogue box to read on. **II** (top right) pauses.
5. Starting a new pilgrimage over a save, forgetting a save, and choosing a path need a second tap on the
   same row, so a stray tap never wipes progress or locks a path.

## On a computer

1. Unzip `shards-of-the-crimson-moon-v1.zip`.
2. Either:
   - **Double-open:** open `index.html` in Chrome, Edge, or Firefox (`file://` works), or
   - **Local server:** from this folder run `python3 -m http.server 8080` and visit `http://localhost:8080/`.
3. If a hosted link is provided, open that URL instead.

## With a controller (Xbox or any standard gamepad)

1. Plug in or pair the controller, then press any button. Browsers only reveal a controller after
   a button press, so a pad that was connected before the page opened shows up on its first press.
2. While a controller is connected, the title screen shows its layout. As soon as you use the pad,
   every on-screen prompt switches to Xbox button icons: the tutorial banners, **A Talk / Travel**,
   **A Next** on dialogue, **A Skip** on a boss intro, **A Face the bearer** at a gate, and the
   menu hints (**A Select, B Back**). Press any key, or touch the screen, and the prompts change back
   to the keyboard or touch ones straight away. Unplugging the pad also switches back.
3. **Rumble:** a light tick when your strike lands, a stronger pulse when you are hit, a small pulse
   on a dodge and when you claim a fragment, and a long, fading rumble when a boss changes phase and
   when it falls. It only rumbles while you are playing on the pad. Turn it off under
   **Settings > Vibration** (saved with your other settings). Controllers or browsers without rumble
   support simply stay still.
4. In menus: stick or D-pad moves, **A** selects, **B** goes back (B still jumps in play). **Start** pauses.

## Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | Arrows / A D | Stick / D-pad | Left pads |
| Jump | Z / Space / W | A | Jump |
| Strike | X / J | X | Strike |
| Dodge | C / K / Shift | B | Dodge |
| Skill | V / L | Y | Skill |
| Talk / confirm | Enter | A | OK pad, or tap the dialogue / menu row |
| Back (menus) | Esc | B | Back row |

On a controller, A is both jump and interact: while a prompt is showing (guide, travel pad,
gate, altar) A interacts; anywhere else it jumps. B dodges in play and backs out of menus.
| Pause | Esc | Start | II pad (top right) |

Order skill: radiant burst. Cult skill: crimson dash.

## Install as an app

When the game is served over **http** or **https** (not `file://`):

1. Open the site in Chrome / Edge on desktop or Android, or Safari on iPhone / iPad.
2. Use **Install app** / **Add to Home Screen** from the browser menu (iPhone: Share > Add to Home Screen).
   It launches full screen, in landscape, with the Serpent's Eye icon.
3. The PWA caches core files for offline play after the first visit.

## v2.2: longer ruins, charms and powerups

- **Each traverse is now a ruin of three levels, 3200 px wide.** The gate to the boss needs **three sigils** (Order sigils or cult sigils). They lie on different branches: a vault past a breakable wall, a high ledge reached by a spring, and a locked elite room. The HUD shows `Seals n/3`.
- **Shrines and braziers** heal you, set your respawn, and let you change charms. If you fall you wake at the last one; foes return, but sigils, opened shortcuts and broken walls stay.
- **Levers** far from the start open a shortcut back. **Cracked walls** (strike them) and **? blocks** (jump into them from below) hold charms, notches, vessels and powerups.
- **Moves:** double jump and wall cling come from charms. Hold Jump to glide with the Gale Feather. Press Down + Jump on a thin ledge to drop through.
- **Charms** (Pause > Charms): 14 charms, each costs notches (3 at the start, up to 6 by finding notch upgrades). Equip them at a shrine or in the hub. On touch, tap a charm once to select and again to equip.
- **Powerups** are temporary: Ember Flask (Y throws fire), Gale Feather (higher jump, glide), Warding Sigil (unharmed for a time), Guard Bubble (blocks one hit), Speed Rite (run faster). Their timers show under your health.
- **Map** (Pause > Map) fills in as you explore. Shrine, seal and gate marks are shown.
- **Difficulty** (Settings): Pilgrim, Standard, Penitent. Standard is harder than v2.
- **Zone hazards:** Vespera falling masonry and crumbling floors; the Deep darkness (follow the glowing caps); the Deep's fortresses swinging blades and trap doors; Aurelion wind and crumbling spires; the Monastery ice and bells (strike a bell to raise its platforms); the frozen mountains slippery ice and falling icicles.
- Fragments you claim show on your body: Heart pulse, Eye sigil, Bone pauldrons, Blaze hands, Shadow trail, Claw gauntlets.

## Paths

- **Order of the Golden Serpent** (warrior monk): take all six fragments from the Apostles of the Shattered, General Jeriah included, so Ryan can keep them apart, or destroy them if it can be done. Six bosses.
- **Cult of the Crimson Moon** (cult acolyte): take General Jeriah's orders in the cult hideout. Jeriah, still in communion with Blevins, already holds the Heart. The other apostles are too far gone to yield their fragments, so you hunt five of them: Azmardus, Nezradeem, Orchalsius, the Silent Dark Apostle, and Gladius. Vespera is on the Order path only. Five bosses.
- **Azmardus** claims to be on your side on either path. He is not.

## Where the fragments are

| Fragment | Bearer | Zone | Paths |
|---|---|---|---|
| Heart | General Jeriah | Vespera, the Crimson Ruins | Order (on the cult path Jeriah holds it) |
| Eye | Azmardus the Great | The Deep | both |
| Bone | Nezradeem | Aurelion, the Towering Ruins | both |
| Blaze | Orchalsius | The Deep, empty fortresses | both |
| Shadow | The Silent Dark Apostle | **Mountain Monastery**, the silent monastery | both |
| Claw | Gladius | Frozen mountains near Sakura | both |

The **Mountain Monastery** was the Order's training ground. Its terraces are climbed like stairs: walls block you, so jump each step. The monk shades there cannot leave the ground they stand on. In the arena, watch the floor: the Silent Dark Apostle shadow-steps, and an ember mark shows where he will appear.

Your path and claimed fragments are saved in the browser (`localStorage`). Older cult saves that fought Jeriah for the Heart load fine: the Heart goes back to Jeriah and your other fragments are kept. Saves from before the Mountain Monastery (when the Shadow was in Saffrika) carry over: a Shadow claimed in Saffrika stays claimed, and a save that had reached Saffrika continues at the monastery.
