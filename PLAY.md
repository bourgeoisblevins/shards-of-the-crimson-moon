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
| Hook / grapple (v2.7) | T / N | RT | HOOK pad (right cluster, left of Shoot) |
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

## v2.6: boss fights, replays and a secret
- **Replay any cleared stage** from the travel menu (marked [Cleared]). Enemies respawn and pay aurels; seals and shortcuts stay open. A boss rematch pays aurels only (no fragment, NIP or charm twice).
- **Every apostle now fights differently.** Watch the telegraphs, read the toast at the start of each new mechanic, and expect three phases. Jeriah guards (hit his back), Azmardus makes decoys, Nezradeem regrows bone arms, Orchalsius crashes into walls and floods the floor with lava, the Silent Apostle hides in the dark until you light a brazier, Gladius grows ice and rages.
- **The finale.** Order: gather every fragment, go to the altar; an acolyte summons Blevins and Noah John comes to help you (he strikes Blevins and heals you now and then). Cult: take the Crown from the Capital of the Plains (unlocked after two fragments; sneak past guards through shadow, then beat the Archive Guardian), then start the ritual at the altar: Noah John is the boss and Blevins fights beside you.


## v2.6 additions
- **Guard:** buy *Serpent's Guard / Crimson Ward* in Inventory > Skills, then hold **E** or **H** (pad: **LT**; touch: the new shield button) to brace. Frontal hits spend a guard pip; at zero the guard breaks. Skills add a perfect parry (guard just before a hit), projectile deflection, a shield bash (strike while guarding), more pips, faster pip regeneration, and a riposte.
- **Skills tab:** 16 nodes in three branches. Spend NIP to learn; press confirm on a learned skill to refund it in full (anything that depends on it is refunded too).
- **Enchantments:** put up to three on a weapon; **Disenchant** (last row of the enchant menu) removes them all and refunds every NIP. Enchanted weapons glow gold (Order) or red (Cult); a fully upgraded enchantment tints the weapon.
- **Lore tablets:** every tablet in a stage has different text. The title screen shows the version in the corner.

## Weapons (v2.6)
Each weapon fights differently: spear = long thrusts, a lunging third thrust, and a vaulting plunge when you strike in the air; hammer = two slow slams with armor and shockwaves; daggers = four-hit flurry ending in a back-step; sword = 1-2 then a launcher; scythe = long sweeps, pull-in finisher; staff = two arcs then a spinning guard; whip = long angled lashes, hook finisher; katana = quick cuts, crit-bleed third hit, draw-strike when you strike during a dodge. Full table in docs/V26.md.
## Blessed skills
In the Skills tab (right-hand "Blessed" column) learn Scorching Winds, Petal Slash, Vine Stun or Lightning Summon; press the Skill key (V / L / Y button, or tap the panel) on a learned one to make it your Y special.

## v2.7: the hook, hook ledges and swing rings

- **Hook (T / N, pad RT, touch HOOK pad).** Shoots a line at the best marked target in front of or above you: a **hook ledge** (a gold chevron appears over it when it is in range) or a **swing ring** (it glows, brighter when in range). Hold Left or Right to prefer that side. With nothing in range the line just whips out and back.
- **With a whip** (Sunthread Whip / Embercord Lash): longer reach (132 vs 98), a fast pull, a hop when you land on the ledge, and +14% launch speed off a swing.
- **Without a whip** you always have a substitute: the Order's **Pilgrim's Rope-Hook**, the Cult's **Chain-Anchor**. Same jobs, shorter reach, slower reel, no landing hop. You are never locked out of a route for lacking a whip, and equipping the whip switches over at once.
- **Ledge pull.** Hook a ledge to be reeled to it and stand on top. Jump or Dodge while reeling to let go. A few ledges (marked with a chevron) are tall walls you must climb this way.
- **Swing rings.** Jump, then press Hook near a ring (or just press Jump in mid-air when you are right next to one: it latches automatically). You swing as a pendulum. **Left/Right pump the swing** (only in the direction you are already moving), **Jump lets go** (you keep the speed and fly), **Down drops** you. Time the release near the top of the arc, toward where you want to land. Enemies can still hit you on the rope (a hit knocks you off). Bumping a wall or landing on a ledge ends the swing.
- **Where.** Swing rings and hook ledges are in all six traverses, Saffrika, Sandria, the Capital of the Plains and the bonus stages (see docs/V27.md for the full list). Rings are themed per place: iron rings (Vespera), roots (the Deep), gold rings (Aurelion), sconces (the Fortress), branches (Saffrika), ice hooks (Sakura), bells (the Monastery), bone hoops (Sandria), serpent rings (the Capital), embers (the Ember Pit).
- **Required vs optional.** Some gaps cannot be crossed without a ring or a wall without a ledge pull; every one of them is solvable with the substitute rope-hook alone. Others lead to caches of aurels and are optional. The first ring you meet shows a short tooltip.

## v2.7 notes: menus and dialogue
- **Inventory tabs, in order:** Weapons, **Charms, Skills, Lore**. Left/Right (D-pad on a pad, tap the tab on touch) walk them; on the Skills tab, moving past the first or last skill column steps to Charms or Lore.
- **Dialogue always waits for you.** Boss intros, last words, claim and stage-clear cards and cutscene lines advance only on Enter / A / a tap (a "next" prompt is always shown). Only short non-story hints are timed.
- **Touch:** the new HOOK pad sits in the right-hand cluster; the Guard pad (once learned) and HOOK are both held-button pads.

## v2.8: Capital of the Plains (cult path)
The Capital is one long stealth stage: the open plains (fields, farms, a stream, the road), the walled city, the cathedral and its archive. Stay in the cast shadows of trees, houses, stalls and buttresses to hide (a small eye shows above you). Three seals open the archive gate: one is in the **sewer** (step on a sewer grate and press interact; climb the ladder to come back up), one tops the watchtower, one is in the archive. Down there a **Mysterious Stranger** may have something to say. Monks (staff: strikes and blocks, bell: chants and buffs, brawler: charges), crows, wolves and bone-throwing sewer skeletons guard the way. Flocks of birds cross the sky now and then; they are only scenery.

## v2.9: save files
- **Three files.** *Continue* on the title screen joins the file you played last (a small caption shows File number, path and playtime). *Files* (or *New Pilgrimage* when nothing is saved) opens the **file select**: three panels with the path portrait, fragments (or the Crown), aurels, NIP, zone, playtime, percent complete and the version it was last saved on. Pick a file for: **Play**, **New Pilgrimage** (asks before replacing), **Copy to...**, **Export save**, **Import save**, **Delete** (asks; defaults to No).
- Keyboard: Up/Down, Enter, Esc. Pad: D-pad, A open, B back. Touch: tap a file, tap an action, tap Back (all targets are at least 44 px).
- **Your old save** moves into File 1 automatically the first time v2.9 starts (once; the original is left as a backup) and becomes the Continue file. The file select shows a note.
- **Autosave** happens at shrines, stage clears and story events, at least once a minute while playing, and when you leave or close the page. A "Saving..." icon shows at the top right. Playtime is saved. *Pause > Save and return to title* saves and goes to the file select.
- **Safe writes:** every save is written to a temp key, verified (checksum), then swapped in, with a backup copy of the previous save. A damaged file is restored from its backup ("Restored from the backup copy"); an unreadable one can be deleted or replaced, and never affects the other files.
- **Export / Import:** *Export save* downloads `shards-fileN-path-date.json` (on phones it opens the share sheet where available). *Import save* picks a `.json`/`.shards` file into the chosen file; older versions are migrated, bad / tampered / newer-version files are rejected with a message, and an occupied file asks before being overwritten.
- **Settings scope:** volume, fullscreen, vibration, touch layout and size, and Ledge assist are **global** (shared by every file). **Difficulty is per file**, as is everything else (flask, aurels, NIP, charms, weapons, enchants, skills, stages, bonus unlocks, tablets, maps, shrines).
- **Mini bosses** (red outline) no longer exist until you are inside their room and the gate has shut behind you, so they cannot be lured out or shot through the gate. This also holds after dying, resting or replaying.
- **Nezradeem** raises sewer skeletons from the floor in phases 2 and 3 (at most 2, then 3 at a time; they throw arcing bones and drop nothing).

## v3.0: the Dungeon (Delve mode)

- **Where:** a red portal marked "Delve into the Dungeon" stands at the left end of both the Order and Cult hubs. Stand beside it and press Enter (pad A, touch OK); a confirm modal explains the rules first.
- **Floors:** each floor is generated from a seed out of the game's own floors, ledges, spikes and enemies, on one of seven zone looks (Vespera, Deep, Aurelion, Deep Lairs, Monastery, Sakura, Sandria) and one of seven palette filters (none, ember, gold, verdigris, violet, frost, ash). Kill every foe and the door at the right end opens; press Enter at the door to descend. The counter at the top shows floor, foes left and failures.
- **Stuck foes:** an enemy that falls out of the level or gets pinned in the ground is put back on a floor at once. If nothing is hit or killed for 15 s the last foes glow with a beacon and edge arrows point to them; at 25 s they are teleported beside you; at 50 s they crumble away so the floor can never soft-lock.
- **Upgrades:** after each floor pick 1 of 3 cards (a charm, an enchanted weapon, Vitality / Deeper Flask / Might / Mending / Quiver, NIP or aurels). Rarity (Common, Rare, Epic, Legendary) rises with depth. Every 3rd floor (3, 8, 13...) ends in a gated mini boss; every 5th floor is a boss from the existing arenas.
- **3 failures** end the run and show the stats (kills, floors cleared, deepest floor, time, damage dealt and taken, aurels, NIP, upgrades picked, foes rescued). OK returns to the hub. The first two failures just restart the same floor.
- **What you keep:** every upgrade is for the run only (charms, weapons, enchants, health, flask, quiver are restored to your pre-run file). Half of the aurels and NIP you earned in the run come home. Best depth is kept per save file.
- **Quitting:** leaving through the pause menu (To the hub) ends the run and shows the stats; "Save and return to title" abandons it (no rewards).

## v3.1: Dungeon updates
* Rest floors (every 4th floor): talk to the **Merchant** (aurels) or the **Enchanter** (NIP) with the interact button; purchases last for the run. The exit is open on rest floors.
* Cards now show pictures with rarity frames. From floor 6 Epic/Legendary **fragment cards** appear (Crown on the cult path); they last for the run.
* Runs always start from a bare baseline; your real gear is restored afterwards.
* Collecting all six fragments in one run reveals a secret companion.

## v3.2: intro, endgame, NG+, Delve seeds

- **Intro.** A new file opens with a short cutscene for your path. It covers the Nexus, the Deep, the Great War and the Shattering, then hands you to Ryan (Order) or General Jeriah (cult).
  - Confirm or tap advances the text.
  - To skip, hold confirm for a second, or press Esc or B, or tap SKIP.
- **Endgame** (on the hub travel list, once you hold every fragment on your path, or after an ending):
  - **Boss Rush.** Fight every boss on your path in a row. Your HP carries over, and you get one flask back between fights. Your first clear unlocks the Pilgrim's Gold cloak dye.
  - **Hard rematches.** Bosses have more HP, move faster and hit harder. Your first win against each one unlocks that boss's cloak dye.
  - **Cloak dyes.** Choose a dye in the Endgame menu. It recolours your cloak everywhere except in the Delve.
  - **New Game+.** Start the story again and keep your charms, weapons, enchantments, skills, aurels and NIP. Enemies and bosses get tougher with each cycle, and the seals move to different secret spots.
- **Delve setup.** The portal now opens a setup screen with these options:
  - **Seed.** Choose Random, Daily (everyone gets the same dungeon that day), or a 6-character code you can type and share. The code is shown on the HUD and on the results screen.
  - **Modifiers:**
    - Glass Cannon: you deal and take double damage.
    - Double Enemies.
    - Hasty Foes.
    - Dry Flask: your flask isn't refilled after the first floor.
  - **Records.** See the best depths for this file and for this device (the device board covers every file), plus today's daily best.
- **Azmardus.** He now casts red comet bolts, a three-comet volley and a slow homing eye-orb (only one at a time). Magic sparks gather where he is about to reappear after a teleport.
- **Look.** Fragments, including the cult Crown, are now part of the player sprite instead of being pasted on top. Weapons no longer poke into the floor art.

## v3.2.1: intro fixes
- **Fragments in the intro.** The Shattering and Apostle scenes now show the true six fragments on both paths, with Jeriah holding the Heart.
- **New cult scene.** The cult intro has a scene about the Crown of the Crimson King: it is kept in the Plains Capital's cathedral archive, guarded by the golden serpent, and the ritual that joins the fragments needs it (Jeriah already keeps the Heart).
- **War and Deep scenes.** The Deep scene now uses the in-game hogs and pigs. The Great War scene shows Golden Order monks, Noah John's disciples, cult acolytes and the six Apostles fighting, and a wall of fire sweeps across after it.

## v3.2.2: Delve and inventory fixes
- **Weapons stay whole:** the weapon and its swing effects are drawn over the floor, so a staff or whip tip below your feet is never cut off.
- **Delve setup screen:** its own torch-lit background. A cursor marks the selected row and the other rows are grayed. Modifiers are `[X]` / `[ ]` checkboxes, and each shows its reward. The description under the list says what the selected row does and how much more you take home. Modifier bonuses add up: Glass Cannon +25%, Double Enemies +25%, Hasty Foes +15%, Dry Flask +15%. The bonus applies to the aurels and NIP you take home and is shown on the run summary. Keyboard, pad and touch all work.
- **Rest floors:** leaving the Merchant or Enchanter floor through the door takes you straight to the next floor, with no upgrade card.
- **Wave floors:** from floor 4, about one floor in seven (4, 11, 25, 32...) is a wave floor. Enemies come in 3 to 5 waves near you. Waves get larger and enemies get tougher the deeper you go. The door opens after the last wave.
- **Stuck enemies:** if a floor has had no progress for 45 s, a beacon marks the remaining enemies. They are teleported to you at 90 s and crumble at 150 s. Enemies that fall out of bounds or get stuck in walls are still rescued at once.
- **Crown lore:** in the story the Crown does not replace the Heart. General Jeriah already keeps the Heart, and the cult needs the Crown for the ritual that joins the fragments. In gameplay, the Crown takes the Heart's stage slot so both paths have the same number of stages.
- **Inventory:** on the Charms tab, the notches, fragments and tip no longer overlap the grid. **LB / RB** switch tabs, and the tab bar shows the button glyphs.
- **New Game+ marker:** a New Game+ file shows a "+" after the path on the file select and in the title screen's Continue caption (for example "Cult acolyte+"). Later cycles show "+2", "+3" and so on.
- **Cloak dyes:** the Cloak dye row opens a picker that lists every dye. Tap a dye (or select it and press Enter / A) to wear it; the choice is saved. Locked dyes are grayed out with a lock, and the menu notes: "Boss rematches and Boss Rush unlock new dyes." Tapping a locked dye shows the same note. On phones each tile is at least 44 px tall.
- **New Game+ cycles:** the next cycle (NG+2, NG+3...) unlocks only after you defeat the final boss of your current cycle. Until then the option is grayed out and says why. Existing saves are kept. An NG+ save from before this fix unlocks its next cycle once the current cycle is finished.

## v3.2.3: endgame unlock
- **Boss Rush, hard rematches and New Game+** unlock together, on a first playthrough or on New Game+, once you have defeated the final boss of your current cycle. Until then they are grayed out with "Defeat the final boss to unlock." A save that has already seen the ending unlocks at once.
- **File select:** each file shows the build it was last saved on (for example "saved on v3.2.3"), instead of "v3.1" for every v3.2 save.
- **Gates hold:** a closed gate (seal gate, mini-boss arena gate, Delve elite gate) now blocks the whole column up to the ceiling above it. You cannot wall-slide or wall-jump on it, and no wall jump, double jump, wing glide, dash, grapple, swing or ledge grab carries you past it.
- **Stage map:** the map now looks like Hollow Knight's. Rooms fill in as you explore them and are saved with your file, one map per stage. Explored areas get clean outlines, and a blinking marker shows where you are. Icons, with a legend, mark shrines, seals, gates (open or closed), the boss arena, the Delve exit, secrets you have found and NPCs. Zoom with Enter, A, LB/RB or the +/- buttons; pan with the arrows or stick, or tap the map to centre it. In the Delve the map shows the current floor only.
- **Shurikens (shop, 110 aurels):** a fast throw that sticks in the foe and pops for 1 more damage 1.5 s later (up to 3 stuck at once). With a flame-enchanted main weapon the pop deals +1. Uses arrows like the bow.
- **Blow Darts (shop, 140 aurels):** a quiet dart that stuns a foe for 2 s (longer with a frost-enchanted main weapon). Bosses are stunned only briefly, and less for each dart within 6 s. Uses arrows like the bow. Both weapons can also turn up as Delve cards.
- **Monastery crows:** slate-grey crows now perch on the Mountain Monastery climb ledges and the open east ledge. They telegraph, then dive at you; a miss leaves them stunned on the ground.
- **Inventory:** the Weapons list scrolls and stays above the aurel/NIP/flask/ammo row. The preview panel sits below the tab bar so Lore and the RB glyph are no longer covered, and the preview labels no longer overlap.
- **Lantern Moth everywhere:** once you have found the Lantern Moth in the Delve, it follows you in the hub and in every story stage too, not only in Delves, and its aurel pull goes with it. The unlock is saved per file. It keeps out of boss intros.

## v3.2.4
- **Enchanter:** shurikens, blow darts and every other ranged weapon you own now appear in the enchant menu. The list scrolls.
- **Touch:** drag a finger up or down to scroll the weapons list, the enchanter list and the lore list.
- **Hubs:** monks and cult members stand clear of the merchant and guide.
- **Guard:** holding Guard now raises a drawn shield in front of you instead of an arc.
- **Mountain Monastery shades:** can knock you into the air without damage (telegraphed pulse) and slowly dissolve and reappear nearer to you.
- **Skill tree:** Seeking Grace / Seeking Hunger (6 NIP). Shots keep their direction but home on the nearest foe ahead.
- **Magik Staff:** bolts burst on contact and hurt nearby foes.
- **Fixes after review:** Seeking Grace now sits at the lower right of the skill tree with its own icon; homing shots lose a little speed on each turn (never below 70%); the enchanter list shows scroll arrows and a line between melee and ranged weapons, so Blow Darts at the bottom are easy to find; the guard shield is larger, centred on the chest and sits in front of the body.
- **Round 3:** shades teleport more often; their gust now rises under you (it tracks you, then locks briefly before firing, so you can dodge or jump it), uses black and grey smoke, and lifts you far less; the guard shield is tall and slim; the enchanter list shows 6 rows on touch so Blow Darts clear the text box.
- **Round 4:** shade gust lifts you to about 2x a normal jump's height. New: **Veil Blink / Shade Blink** charm (2 notches, 1,200 aurels at the merchant once 3 fragments are claimed): the dodge becomes a near-instant teleport (up to 64 units), with afterimages and black-and-grey smoke. Aurel sinks: **Temper** (merchant row for the weapon you hold, 10 levels, +2% chance per level for +1 damage, 150 aurels rising 30% a level), **Alms of the Moon** (aurels to NIP, 10 per file, 250 rising by 150) and **Provisions** (Delve setup: 300 / 800 / 2,000 aurels for 2 / 4 / 6 NIP). Shop dyes (Crimson, Sapphire, Amethyst, Rosewood, Gilded, Ashen, Midnight; 400-2,400). Cosmetic rows (Left/Right picks an option, Enter buys then wears or hides): auras, weapon glow, slash trail, afterimage tint, footsteps, companion, frame style, hub decor, and the Night Sky (Order) / Deep Temple (Cult) hubs. Two Moon Notches go on sale in New Game+ (notch cap is now 9). The older boss dyes now actually apply (the dye table was never defined in 3.2.3).
- **Round 5:** merchant is tabbed (Upgrades, Charms, Cosmetics with Dyes / Auras / Hub decor / Effects / Extras) with a live preview; the endgame Cloak dye row is gone; the inventory has a Cosmetics tab after Skills (locked items show a padlock); hub cosmetics are On/Off toggles in the shop; dyes now recolour the whole outfit (Order robe and trim, Cult robe).
- **Round 6:** Deep Temple uses the Deep cavern art with larger glowing mushrooms and more spores; boss and Rush dyes are no longer sold (they appear in the inventory Cosmetics tab, locked until earned); snake and golem companions walk on the floor with gravity, drop below at ledges and catch up when the player is far away; the slash trail cosmetic recolours the weapon's own slash art instead of adding an effect.
- **Round 7:** Deep Temple hub keeps the hub's temple steps, altar, braziers and banners over the Deep cavern; the dotted slash smear is removed (the weapon's own slash art remains, and the Slash trail cosmetic recolours it).
- **Round 8:** snake and golem companions now stand on floating, one-way and moving platforms instead of falling through them.
- **Round 9:** the hub Player statue is now a stone-grey copy of your own sprite on a plinth, in front of the travel gate; the stone golem companion was redrawn (mossy shoulders, glowing eyes and chest rune, walking legs and arms).
- **Round 10:** stone golem is taller (22 px instead of 14) and stands on the floor (its foot offset was in the wrong units, which left it hovering); snake foot offset corrected too.
- **Round 11:** the Player statue now stands on the first step, between the Delve portal and the guide (Ryan or Jeriah), in both hubs; the Order monk who stood there moved over to make room.

## v3.2.5: the Arena
- **Entry:** pick "The Arena" on the travel screen (above "Stay"). It shows your best wave.
- **Waves:** clear a wave, then get 8 seconds to breathe. HP does not refill between waves. Every 10th wave is followed by a beast.
- **After each beast, the Warden asks:**
  - **Heal:** full HP and flasks, then the cell. Open the dresser to change charms, talk to the prisoners, and use the door to fight on.
  - **Freedom:** walk out with everything.
- **Death:** once per run you may pay half the aurels earned in that run to get back up. The run is endless; you choose when to stop.
- **Foes:**
  - Waves 1-10: Plains brawler, Ashen wolves (always in pairs), Saffrika cutthroat (knives), Pirate netter (nets slow you), Dwarven shieldbearer (hit him from behind).
  - From wave 11: chained pirates, Saffrikan bowmen, cast-out monks, turned Vesperans, hooded griffins and pirate captains in irons.
- **Beasts:**
  - Cinder Bear: bait it into a wall to stun it.
  - Hollow Stag: don't stand close while it is still.
  - Pit Golem: armoured; hit it after a ground pound or while it is stunned.
- **Pay:**
  - Waves: 15 aurels for wave 1, rising by 3 a wave up to 120.
  - Beasts: 150 × the beast's number, up to 900, plus half a NIP each.


## v3.2.6: Arena fixes
- **Floor:** arena kills drop no coins; you are paid per wave and per beast. Arrow bundles still drop when your quiver is short. At most 3 lie on the floor, they fade after 6 s, and leftovers go into your quiver when the wave ends.
- **Touch:** only the action button (or a tap on the prompt itself) talks or opens the dresser, so walking with the joystick never starts a dialogue.
- **Pay:**
  - Waves: 10 aurels for wave 1, rising by 2 a wave up to 80.
  - Beasts: 100 × the beast's number, up to 600, plus 1 NIP each.
