// v3.0: the Dungeon (Delve mode) text.
window.SHARDS = window.SHARDS || {};
(function () {
  window.SHARDS.text30 = {
    hub: { name: "Delve into the Dungeon", prompt: "Enter: Delve", promptPad: "{A} Delve", promptTouch: "OK: Delve",
      confirmTitle: "Delve into the Dungeon?", confirmBody: "Every run starts from scratch: no fragments, charms or upgrades. Floors get harder; 3 failures end the run. Gear is yours again afterwards, and half the aurels and NIP you earn come home.",
      best: "Deepest floor: {n}" },
    hud: { floor: "Floor {n}", foes: "Foes {n}", fails: "Failures {n}/3", open: "The way down is open.", exit: "Enter: Descend", exitPad: "{A} Descend", exitTouch: "OK: Descend",
      rescued: "A stray foe was brought back.", beacon: "The last foes glow.", dissolved: "A lost foe crumbles away.", locked: "Defeat every foe first." },
    frag: { crown: "The Crown", crownDesc: "The Crown of the Crimson King: +1 max health, and the Crown shows.",
      desc: { heart: "+1 max health. The Heart shows.", eye: "Wider strikes. The Eye shows.", bone: "Longer safety after a hit. The Bone shows.", blaze: "Skills burn hotter. The Blaze shows.", shadow: "A longer dodge. The Shadow shows.", claw: "Frost cannot hold you. The Claw shows." } },
    shop: { merchant: "The Merchant", enchanter: "The Enchanter", purse: "Purse: {n} aurels", nipHave: "Run NIP: {n}", leave: "Leave", sold: "Sold", refund: "+{n} NIP", need: "Need {n} more {cur}.", bought: "Taken: {name}", aurels: "aurels",
      heal: "Healing Draught", healDesc: "Heal fully and refill the flask.", enchant: "{ench} {k}", enchantDesc: "Enchant your {weapon} (this run).", sharpen: "Sharpen", sharpenDesc: "+1 strike damage.", disenchant: "Disenchant", disenchantDesc: "Strip an enchant, get 1 NIP back.",
      prompt: "Enter: Trade", promptPad: "{A} Trade", promptTouch: "OK: Trade", hint: "Up/Down: choose   Enter: buy   Esc: leave", hintPad: "{A} buy  {B} leave", hintTouch: "Tap a row, tap again to buy" },
    egg: ["The six shards hum as one.", "A small moth of dust and light settles on your shoulder. It has no name, and it knows you.", "The Lantern Moth joins you. Aurels drift to it, and it will find you again on every delve."],
    fail: { title: "Failure {n} of 3", body: "The floor begins again.", last: "That was the third failure.", prompt: "Enter: Retry", promptPad: "{A} Retry", promptTouch: "OK: Retry" },
    pick: { heading: "Choose an upgrade", sub: "Floor {n} cleared", hint: "Left/Right: choose   Enter: take", hintPad: "{A} take", hintTouch: "Tap a card, tap again to take",
      rar: ["Common", "Rare", "Epic", "Legendary"],
      fragment: "Fragment: {name}",
      charm: "Charm: {name}", charmDesc: "Worn for this run.",
      weapon: "{name}", weaponDesc: "Enchanted: {ench} {k}. Equipped for this run.", weaponDescMax: "Enchanted: {ench} and {ench2}, both maxed.",
      vital: "Vitality", vitalDesc: "+{n} max health.", flask: "Deeper Flask", flaskDesc: "+1 flask charge.", might: "Might", mightDesc: "+1 strike damage.",
      mend: "Mending", mendDesc: "Heal fully and +1 max health.", quiver: "Quiver", quiverDesc: "+{n} arrows (and refilled).",
      nip: "NIP", nipDesc: "+{n} NIP (half come home).", aurels: "Aurels", aurelsDesc: "+{n} aurels (half come home)." },
    end: { title: "The Dungeon Ends", sub: "Three failures.", ret: "Enter: Return to the hub", retPad: "{A} Return to the hub", retTouch: "OK: Return",
      rows: ["Enemies killed", "Floors cleared", "Deepest floor", "Time", "Damage dealt", "Damage taken", "Aurels earned", "NIP earned", "Upgrades picked", "Foes rescued"],
      best: "New best depth!", bestIs: "Best depth: {n}", home: "Brought home: {a} aurels, {n} NIP", boss: "Bosses felled", moth: "Lantern Moth found" }
  };
})();
