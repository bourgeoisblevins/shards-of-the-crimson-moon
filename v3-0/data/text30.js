// v3.0: the Dungeon (Delve mode) text.
window.SHARDS = window.SHARDS || {};
(function () {
  window.SHARDS.text30 = {
    hub: { name: "Delve into the Dungeon", prompt: "Enter: Delve", promptPad: "{A} Delve", promptTouch: "OK: Delve",
      confirmTitle: "Delve into the Dungeon?", confirmBody: "Every floor is harder. 3 failures end the run. Upgrades last for the run only; half the aurels and NIP you earn come home.",
      best: "Deepest floor: {n}" },
    hud: { floor: "Floor {n}", foes: "Foes {n}", fails: "Failures {n}/3", open: "The way down is open.", exit: "Enter: Descend", exitPad: "{A} Descend", exitTouch: "OK: Descend",
      rescued: "A stray foe was brought back.", beacon: "The last foes glow.", dissolved: "A lost foe crumbles away.", locked: "Defeat every foe first." },
    fail: { title: "Failure {n} of 3", body: "The floor begins again.", last: "That was the third failure.", prompt: "Enter: Retry", promptPad: "{A} Retry", promptTouch: "OK: Retry" },
    pick: { heading: "Choose an upgrade", sub: "Floor {n} cleared", hint: "Left/Right: choose   Enter: take", hintPad: "{A} take", hintTouch: "Tap a card, tap again to take",
      rar: ["Common", "Rare", "Epic", "Legendary"],
      charm: "Charm: {name}", charmDesc: "Worn for this run.",
      weapon: "{name}", weaponDesc: "Enchanted: {ench} {k}. Equipped for this run.", weaponDescMax: "Enchanted: {ench} and {ench2}, both maxed.",
      vital: "Vitality", vitalDesc: "+{n} max health.", flask: "Deeper Flask", flaskDesc: "+1 flask charge.", might: "Might", mightDesc: "+1 strike damage.",
      mend: "Mending", mendDesc: "Heal fully and +1 max health.", quiver: "Quiver", quiverDesc: "+{n} arrows (and refilled).",
      nip: "NIP", nipDesc: "+{n} NIP (half come home).", aurels: "Aurels", aurelsDesc: "+{n} aurels (half come home)." },
    end: { title: "The Dungeon Ends", sub: "Three failures.", ret: "Enter: Return to the hub", retPad: "{A} Return to the hub", retTouch: "OK: Return",
      rows: ["Enemies killed", "Floors cleared", "Deepest floor", "Time", "Damage dealt", "Damage taken", "Aurels earned", "NIP earned", "Upgrades picked", "Foes rescued"],
      best: "New best depth!", bestIs: "Best depth: {n}", home: "Brought home: {a} aurels, {n} NIP", boss: "Bosses felled" }
  };
})();
