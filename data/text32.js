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
    boardHint: "Left/Right: file / device   Esc: back", newRecord: "New record: #{n} on this device"
  },
  modifiers: [
    { id: "glass", name: "Glass Cannon", desc: "Deal double damage, take double damage." },
    { id: "double", name: "Double Enemies", desc: "A twin stands beside every foe." },
    { id: "hasty", name: "Hasty Foes", desc: "Enemies move and act faster." },
    { id: "dry", name: "Dry Flask", desc: "The flask does not refill between floors." }
  ],
  rush: {
    name: "Boss Rush", hard: "Hard Rematches", hardShort: "Hard",
    locked: "Defeat every apostle on your path first.",
    rushDesc: "Every apostle on your path, back to back. One flask charge between fights.",
    hardDesc: "A tougher rematch. Win once for a cloak dye.",
    between: "Apostle {i} of {n} down. Next...", clearTitle: "Boss Rush cleared", failTitle: "The rush ends",
    time: "Time {t}", best: "Best {t}", beaten: "Apostles beaten: {i} of {n}",
    rewardRush: "Reward: the Pilgrim's Gold cloak dye.", rewardDye: "Reward: the {name} cloak dye.", already: "You already have this dye.",
    ok: "Enter: back to the hub", okPad: "{A} back to the hub", okTouch: "Tap: back to the hub"
  },
  dyes: { label: "Cloak dye", none: "Natural" },
  ngp: {
    offer: "New Game+", offerDesc: "Begin again with your charms, weapons and skills. Enemies are stronger and the seals hide in new places.",
    confirm: "Start New Game+ on this file? Fragments, stages and map progress reset; charms, weapons, enchants and skills stay.",
    tag: "NG+{n}", line: "I remember you\u2026 from another age."
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
  cult: [["Of the six, only General Jeriah still hears him.", "\"Our own Apostles will not give up what is his.\"", "\"Go, acolyte. Hunt them. The Crimson King must return.\""]]
};
