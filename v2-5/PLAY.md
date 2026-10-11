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

## v2.3: weapons, flask, aurels, shops, NIP

**New controls** (keyboard / controller / touch)
| Action | Keyboard | Controller | Touch |
|---|---|---|---|
| Flask (channel a heal, ~0.75 s, damage interrupts) | F or Q | LB | Flask button |
| Shoot the ranged weapon (hold Up / R to aim up) | G or B (R aims up) | RB | Shoot button |
| Inventory (charms, weapons, fragments, lore) | I or Tab | View | Bag button |
| Everything from before (A jump/use, B dodge/back, X strike, Y skill, Start pause) | unchanged | unchanged | unchanged |

**Health flask.** You start with 3 charges (shop upgrades raise it to 6). Kills fill the meter: one charge per 5 kills on Standard (4 Pilgrim, 6 Penitent; elites count extra). Resting at a shrine refills it. Channelling roots you; any hit interrupts it and spends nothing. It will not start at full health.

**Aurels** are the coin of the temples and the ash-camps. Enemies drop 1-3 small aurels, elites 5+, bosses 60. They fly to you inside a magnet range. Death costs 1-7 aurels (see v2.4).

**Shops.** In each hub a merchant (Order: temple almoner; cult: ash-peddler) sells max-HP and flask upgrades, a notch, quiver size, arrows, charms (Shoving Palm, Alms Magnet and others) and weapons. Some stock unlocks as you claim fragments.

**Weapons** (open Inventory to swap; MAIN melee + RANGED):
Pilgrim's Staff / Ash-Wood Staff (starter, balanced), Harvest Scythe / Reaper's Scythe (long first swing), Temple Sword / Borrowed Sword (fast), Warden's / Hunter's Spear (long thrust), Stone Hammer / Behemoth Maul (slow, huge knockback; boss reward), Twin Daggers / Shadow Daggers (very fast, short; boss reward). Ranged: Hunter's Bow (start) and Throwing Knives.

**Arrows.** Max 5 (7 and 9 with quiver upgrades). Shooting costs 1. Enemy drop roll (once per kill): 50% one arrow, 20% two arrows, 30% nothing; capped at your max. Shops and some secrets refill them.

**Enemies** are knocked back and briefly stunned when hit (heavy weapons more, bosses little, elites reduced). Walkers and crawlers are solid: they cannot pass through you (a small push-out keeps you from being trapped). Dust wraiths and monastery shades phase through you, but they hurt.

**NIP = Nexus Influence Power** - Ryan's definition: how much power and control you have over the Nexus. Bosses grant it (1-2 each). Spend it with your leader (Ryan for the Order, General Jeriah for the cult) to enchant a weapon: Flame/Ember (burn), Frost/Rime (slow, then freeze), Shadow (afterimage on dodge), Radiance/Pale Light (heal on kills), Bone (stagger), Claw (bleed). Three tiers cost 1, 2, 3 NIP. Bosses resist status effects.

**Shrine teleport.** Resting at a shrine opens a menu: Charms, Teleport, Close. Teleport shows a map of every shrine you have lit in this zone plus the hub; pick one to travel. It sets your respawn, refills the flask and respawns enemies, like resting does.

**Touch settings.** Settings now has a Touch size slider (70%-150%, live preview) and Touch controls: Buttons or Joystick (floating left stick, action buttons on the right). **Fullscreen** is in Settings and the Pause menu. Android Chrome: works on tap. iPhone/iPad Safari has no fullscreen API for pages - use Share > Add to Home Screen and launch from the icon (the app runs standalone, landscape).

**Redesigns.** Ryan, General Jeriah, Azmardus and the Silent Dark Apostle were redrawn from their archive portraits (bearded Ryan with the golden blade; Jeriah with the burning Heart in black plate; Azmardus pale and black-haired with the eye-staff; the Silent Apostle in horned black plate).

**Platforms.** Blinking and crumbling platforms now overlap (the next one is up at least half a second before the last one leaves; no gaps) and flicker faster as they are about to change.

## v2.4: charms, charged strike, Magik Staff, bouncing fire

**New control.** Hold Strike (X / Square / touch Strike) for about half a second: a ring fills at your feet and chimes when ready; release for a charged blow (+1 damage, 1.4x reach, 1.8x knockback; short cooldown). Tapping still does the normal combo.

**Dodge** now has +50% invulnerability frames (8 -> 12). **Death** costs 1-7 aurels: 70% chance of 1-4 (uniform), 30% chance of 5-7 (uniform), never more than you hold; "-N aurels" shows on respawn.

**Enchanting.** Replacing an enchantment with a different one refunds its full NIP cost. Upgrading the same enchantment pays only the difference (the ladder is 1/2/3, so tier n costs n).

**New Pilgrimage / Forget** ask first: Yes/No, default No (Enter or A confirms, Esc or B cancels, or tap).

**Magik Staff** (ranged; 180 aurels at the shop, tier 2): bolt does 3 damage and costs 2 arrows per cast (HUD shows x2). Won't fire with fewer than 2.

**Ember Flask rework.** Slower bouncing fireball (up to 3 bounces off floor and walls, 2 damage per hit, leaves a flame for ~1.7 s that deals 1).

**Enemy projectiles** differ by shooter: ruin archer (fast straight arrow), rift spitter (arcing slow orb), ice archer (slows), blaze imp (burns), vine spitter (arcing seed, spore puddle), and others. Slow and burn show on your HUD.

**Charms (notches, source).** 31 charms, shown on two pages (Left/Right past the edge, L/R, or tap the page arrows).
| Charm | Notch | Effect | Source |
|---|---|---|---|
| Fleet Sigil | 1 | dodge 40% farther | shop |
| Deep Phial | 2 | +1 flask charge | shop |
| Quickfill Sigil | 2 | flask fills in fewer kills | shop |
| Swift Draw | 1 | flask channel 40% shorter | shop |
| Sparrow Feathers | 1 | mild slow-fall (small wings) | shop |
| Starfall | 2 | replaces your skill with a leaping star slam (area damage) | shop |
| Pilgrim's Hourglass | 2 | +1 flask charge every 90 s (timer ring on the HUD) | shop |
| Snake Charmer | 2 | heal as a fast snake, still channelling (2.5 s) | cult shop, Nezradeem |
| Magik Explosion | 2 | heal bursts: 2 damage and slow nearby | cult shop, Azmardus |
| Crimson Hunger | 2 | every 2 kills heal 1, flask heals 1 less | cult shop, Jeriah |
| Shattered Shadow | 2 | dodging through an enemy leaves a shadow that explodes | cult shop, Silent Apostle |
| Ashen Covenant | 1 | +1 damage and +1 damage taken at half HP or less | cult shop, Orchalsius |
| Serpent's Guard | 2 | after a hit, 2.5 s of damage reduction (25 s cooldown) | Order shop |
| Purifying Flame | 2 | charged kill refills half a flask charge | Order shop, cult gift |
| Unbroken Faith | 1 | near-miss dodge grants 4 s defence (2 s cooldown) | Order shop, Gladius |

Boss claims also hand over the listed charm if you do not own it. Charm damage bonuses are capped at +3 (before Glass Cannon).

## v2.5: new stages, new foes, bonus stages
- **Travel menu**: after the six apostle zones you will find **Saffrika: Slum Waterways** (unlocks after 2 fragment claims) and **Sandria: Gonduras Pyramids** (after 4). They are optional: they never count toward the fragments you need.
- **Water**: wade or swim in Saffrika's canals. Press **Jump while under water to swim**. Docks, rope lines and stairs keep you out of it.
- **Seal gate**: in both new stages, 3 seals lift the gate (press A at the gate). Beat the elite behind it (the Pirate Captain, the Gonduran Warden) to clear the stage. First clears pay aurels and NIP; replays pay a little aurels.
- **Sheriff Dandy** waits near the start of Saffrika: press A to talk.
- **Foes**: Deep pigs charge. **Ash griffins** (Aurelion, Sakura) telegraph, leap and dive diagonally; dodge the dive and hit them while they are stunned. Sandria: snakes lunge, mummies are slow and heavy, **tumbleweeds** roll through the streets (strike them or jump). Mushroom caps are platforms, bounce shrooms launch you, spore clouds hurt and slow.
- **Bonus stages**: three hidden keys sit behind breakable walls in the Deep, the Deep's forts and the Monastery. Each opens a stage in **Travel > Bonus Stages**: the Belfry of Echoes, the Ember Pit and the Spore Hollow. Replay them any time.

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
