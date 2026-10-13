// v2.2 text: charms, powerups, seals, shrines, map, difficulty, lore tablets. All strings live here.
// Fragments are claimed or taken, never dropped. Blevins is never shown.
window.SHARDS = window.SHARDS || {};
window.SHARDS.text22 = {
  charms: {
    heading: "Charms",
    notches: "Notches",
    equip: "Equip", unequip: "Remove", full: "Not enough notches", locked: "Not found yet",
    readOnly: "Rest at a shrine or in the hub to change charms.",
    cost: "Cost",
    hint: "{A} Equip  {B} Back",
    hintKb: "Enter: equip   Esc: back",
    hintTouch: "Tap a charm, tap again to equip",
    back: "Back",
    names: {
      arc:       { order: "Open Hand Sigil",   cult: "Reaper's Edge" },
      quick:     { order: "Swift Prayer",      cult: "Quickened Blade" },
      ghost:     { order: "Veil Step",         cult: "Wraith Cloak" },
      leap:      { order: "Gale Wings",        cult: "Moth Wings" },
      grip:      { order: "Talon Grip",        cult: "Claw Hooks" },
      rend:      { order: "Rending Step",      cult: "Gutting Dash" },
      tithe:     { order: "Blood Tithe",       cult: "Crimson Tithe" },
      stand:     { order: "Last Stand",        cult: "Cornered Fury" },
      focus:     { order: "Sunlit Focus",      cult: "Ember Focus" },
      thorn:     { order: "Thorned Mantle",    cult: "Barbed Hood" },
      ward:      { order: "Warded Mantle",     cult: "Bone Ward" },
      lantern:   { order: "Pilgrim's Lantern", cult: "Ember Lantern" },
      resonance: { order: "Fragment Resonance", cult: "Shard Resonance" },
      glass:     { order: "Glass Heart",       cult: "Glass Heart" }
    },
    desc: {
      arc: "Wider strike arc.",
      quick: "Strike much faster.",
      ghost: "Longer dodge invulnerability.",
      leap: "A second jump in the air.",
      grip: "Cling to walls without sliding.",
      rend: "Your dodge cuts foes it passes through.",
      tithe: "Every 4 kills restore 1 HP.",
      stand: "+1 damage at 2 HP or less.",
      focus: "Skill recharges faster and hits harder.",
      thorn: "Foes that hit you take 1 damage.",
      ward: "Blocks one hit each rest.",
      lantern: "A wider light in the dark.",
      resonance: "+1 damage per 3 claimed fragments.",
      glass: "Double damage dealt and taken."
    }
  },
  passives: {
    heart: "Heart: +1 max HP",
    eye: "Eye: longer reach, secrets glint",
    bone: "Bone: longer recovery after a hit",
    blaze: "Blaze: skill hits +1",
    shadow: "Shadow: longer dodge",
    claw: "Claw: no slipping on ice"
  },
  power: {
    ember: "Ember Flask", gale: "Gale Feather", ward: "Warding Sigil", guard: "Guard Bubble", speed: "Speed Rite",
    got: { ember: "Ember Flask: Y throws fire", gale: "Gale Feather: hold jump to glide", ward: "Warding Sigil: unharmed for a time", guard: "Guard Bubble: blocks one hit", speed: "Speed Rite: you run faster" },
    expire: "The power fades."
  },
  seals: {
    order: "Order sigil", cult: "Cult sigil",
    hud: "Seals {n}/{need}",
    got: { order: "Order sigil taken: {n}/{need}", cult: "Cult sigil taken: {n}/{need}" },
    locked: "The gate is sealed. {n} more to find.",
    lockedOne: "The gate is sealed. 1 more to find.",
    open: "The seals answer. The gate opens."
  },
  rest: { prompt: "Rest", promptPad: "{A} Rest", promptTouch: "OK: Rest", done: "You rest. Charms may be changed.", lit: "Shrine lit" },
  lever: { prompt: "Pull", promptPad: "{A} Pull", promptTouch: "OK: Pull", done: "A far gate grinds open." },
  tablet: { prompt: "Read", promptPad: "{A} Read", promptTouch: "OK: Read" },
  got: {
    charm: "Charm found: {name}", notch: "A new notch: {n} total", vessel: "Vessel: max HP {n}",
    gift: "{who} gives you a charm: {name}"
  },
  elite: { warn: "The room seals behind you.", slain: "The way opens." },
  map: { heading: "Map", legend: "Shrine  Seal  Gate", back: "Back", hint: "{B} Back", hintKb: "Esc: back", hintTouch: "Tap to close" },
  pause: { charms: "Charms", map: "Map", charmsLocked: "Charms (rest first)" },
  diff: {
    label: "Difficulty",
    pilgrim: "Pilgrim", standard: "Standard", penitent: "Penitent",
    blurb: { pilgrim: "Gentler foes. Forgiving hits.", standard: "The intended pilgrimage.", penitent: "Hard foes. Harder bosses." }
  },
  defeat: { retry: "Return to the shrine", sub: "Claimed fragments and found seals are kept.", retryArena: "Retry arena" },
  gifts: { order: "Ryan", cult: "General Jeriah" },
  hints: {
    order: [
      "The ruins hold three sigils. Find them, and the gate will answer.",
      "Rest at a lit shrine. It heals you, and it is where you return if you fall.",
      "A lever far from the gate will open a way back. Pull it.",
      "Cracked walls hide old charms. Strike them."
    ],
    cult: [
      "General Jeriah wants the gate open. Take the sigils from the ruin.",
      "Light a brazier and rest there. If you die, you wake beside it.",
      "A lever across the ruin opens the short way home. Pull it.",
      "Cracked walls hold old relics. Break them."
    ]
  },
  tablets: {
    vespera: [
      "Vespera fell before the Shattering ended. The Order kept its sigils behind the gate.",
      "Here the General trained his first acolytes. The stones still remember."
    ],
    deep: [
      "The Deep has no sun. Carry a light, or follow the glowing caps.",
      "The Eye sees what the dark hides."
    ],
    aurelion: [
      "Aurelion's spires were gold once. The wind came after the fall.",
      "Climb the broken stairs. The old city is still tall."
    ],
    deepLairs: [
      "Empty fortresses. The war migrants left the chains, the traps, and the dead.",
      "Mind the trap-doors. The towers fall a long way."
    ],
    monastery: [
      "The bell calls the shades, and it moves the old stair.",
      "The monks are gone. Their silence is not."
    ],
    sakura: [
      "Ice on the stone. Ice on the branch. Keep your footing.",
      "The Frost Walker marks his door with falling ice."
    ]
  },
  zoneNames: { vespera: "Vespera", deep: "The Deep", aurelion: "Aurelion", deepLairs: "The Deep's fortresses", monastery: "Mountain Monastery", sakura: "Frozen mountains" }
};

// v2.2: the guide also gives the new traversal hints
(function () {
  const S = window.SHARDS, T = S.text22, G = S.text && S.text.guideLines;
  if (!G || !T || !T.hints) return;
  for (const p of ["order", "cult"]) if (G[p] && !G[p]._v22) { T.hints[p].forEach((h) => G[p].push(h)); G[p]._v22 = true; }
})();
