// v3.2 text: intro cutscenes, Delve setup, records, modifiers, Boss Rush, hard rematches, New Game+.
window.SHARDS = window.SHARDS || {};
window.SHARDS.text32 = {
  delve: {
    title: "Delve into the Dungeon",
    rules: "Every run starts from scratch. 3 failures end it. Half the aurels and NIP you earn come home.",
    seed: "Seed", random: "Random", daily: "Daily {d}", custom: "Custom {c}",
    editHint: "Up/Down: change   Left/Right: move   Enter: done", editHintTouch: "Tap the arrows, tap OK when done", editHintPad: "D-pad: change  {A} done",
    mods: "Modifiers", begin: "Delve", back: "Back", records: "Records",
    hint: "Up/Down: choose   Enter/Left/Right: change   Esc: back", hintPad: "{A} change  {B} back", hintTouch: "Tap a row to change it",
    hudSeed: "Seed {c}", endSeed: "Seed {c} ({m})", modeRandom: "random", modeDaily: "daily", modeCustom: "custom",
    boardTitle: "Records", boardSlot: "This file", boardDevice: "This device", boardEmpty: "No runs yet.", boardRow: "{d}  Floor {n}  {c}{mods}",
    boardHint: "Left/Right: file / device   Esc: back", wave: "Wave {i} / {n}", newRecord: "New record: #{n} on this device"
  },
  modifiers: [
    { id: "glass", name: "Glass Cannon", bonus: 25, desc: "You deal double damage, and you take double damage." },
    { id: "double", name: "Double Enemies", bonus: 25, desc: "A twin stands beside every foe." },
    { id: "hasty", name: "Hasty Foes", bonus: 15, desc: "Enemies move and act faster." },
    { id: "dry", name: "Dry Flask", bonus: 15, desc: "Your flask does not refill between floors." }
  ],
  map33: { you: "You", shrine: "Shrine", seal: "Seal", gate: "Gate", boss: "Boss", exit: "Exit", secret: "Secret", npc: "NPC", floor: "Floor {n}", explored: "Explored {n}%", zoom: "Zoom x{n}",
    hintKb: "Arrows: pan   Enter: zoom   Esc: back", hintPad: "{A} zoom  {LB}{RB} zoom  {B} back", hintTouch: "+/-: zoom   Tap the map to centre it" },
  setup33: {
    title: "Delve: prepare the descent",
    seedRow: "Seed: {v}", seedRandom: "Random", seedDaily: "Daily ({d})", seedCustom: "Custom {c}",
    on: "[X]", off: "[ ]", bonus: "+{n}%", total: "Rewards taken home: +{n}%", totalNone: "Rewards taken home: normal",
    rewardLine: "Rewards taken home +{n}%.",
    descRandom: "A new dungeon every run. Rewards taken home: normal.",
    descDaily: "Daily: everyone who delves today gets the same floors, cards and shops. Code {c}. Rewards taken home: normal.",
    descCustom: "Replay or share a dungeon by its 6-character code. Enter to type it. Rewards taken home: normal.",
    descRecords: "Your best runs on this file and on this device.",
    descBegin: "Every run starts from scratch. 3 failures end it. Half the aurels and NIP you earn come home.",
    descBack: "Return to the hub.",
    records: "Records", begin: "Begin the descent", back: "Back",
    deepest: "Deepest floor reached: {n}", dailyNone: "No daily runs yet.", dailyBest: "Today's daily best: floor {n}",
    hint: "Up/Down: choose   Enter: change   Esc: back", hintPad: "{A} change  {B} back", hintTouch: "Tap a row to choose it, tap again to change it",
    endBonus: "Modifier bonus +{n}%"
  },

  rush: {
    name: "Boss Rush", hard: "Hard Rematches", hardShort: "Hard",
    locked: "Defeat the final boss to unlock.",
    rushDesc: "Every apostle on your path, back to back. One flask charge between fights.",
    hardDesc: "A tougher rematch. Win once for a cloak dye.",
    between: "Apostle {i} of {n} down. Next...", clearTitle: "Boss Rush cleared", failTitle: "The rush ends",
    time: "Time {t}", best: "Best {t}", beaten: "Apostles beaten: {i} of {n}",
    rewardRush: "Reward: the Pilgrim's Gold cloak dye.", rewardDye: "Reward: the {name} cloak dye.", already: "You already have this dye.",
    ok: "Enter: back to the hub", okPad: "{A} back to the hub", okTouch: "Tap: back to the hub"
  },
  dyes: { label: "Cloak dye", none: "Natural", back: "Back", title: "Cloak dyes", locked: "Locked.", lockTag: "locked", wornTag: "worn", wearing: "Wearing {name}.", tapWear: "Tap to wear it.", keyWear: "Enter / A: wear it.", note: "Boss rematches and Boss Rush unlock new dyes." },
  ngp: {
    offer: "New Game+", offerDesc: "Begin again with your charms, weapons and skills. Enemies are stronger and the seals hide in new places.",
    confirm: "Start New Game+ on this file? Fragments, stages and map progress reset; charms, weapons, enchants and skills stay.",
    tag: "NG+{n}", lockTag: "(locked)", locked: "Defeat the final boss of this cycle to unlock NG+{n}.", line: "I remember you\u2026 from another age."
  }
};

window.SHARDS.text32.intro = {
  skipKb: "Hold Enter or press Esc to skip", skipPad: "Hold A or press B to skip", skipTouch: "SKIP",
  common: [
    ["Bourgeois, the Golden Father, made the Nexus to bind the world.", "He set five gods beneath him to keep it."],
    ["One god, Blevins, wanted more. Without a Nexus he made the Deep.", "It was never finished. It rewrote the living into his first children."],
    ["Then came the Great War. Nations fell, and Saffrika burned.", "Noah John, though a man, broke every form the Shattered One wore.", "And the body burst into six fragments."],
    ["Six Apostles claimed the pieces.", "His soul cut a rift into the Crimson Moon. It cannot leave without a body.", "It is still up there. Waiting."]
  ],
  order: [["Centuries on, Ryan still keeps the Order, his blessed blade unaging.", "\"The fragments must never be joined again.\"", "\"Go, monk. Take them from the Apostles, and keep them apart.\""]],
  cult: [["General Jeriah already keeps the Heart. The other pieces must be taken back.", "But the ritual that joins the fragments needs one thing more: the Crown of the Crimson King.", "The Order sealed it in the cathedral archive of the Plains Capital, guarded by a golden serpent.", "Without the Crown, the pieces cannot be joined."], ["Of the six, only General Jeriah still hears him.", "\"Our own Apostles will not give up what is his.\"", "\"Go, acolyte. Hunt them. The Crimson King must return.\""]]
};
