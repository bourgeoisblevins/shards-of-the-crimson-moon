// v2.3 text. Every string fits the 480x270 text-fit rules; all lore-safe (fragments are claimed or taken, Blevins is never named).
window.SHARDS = window.SHARDS || {};
window.SHARDS.text23 = {
  currency: "Aurels",
  nip: { short: "NIP", long: "Nexus Influence Power", tip: "NIP: Nexus Influence Power. How much power and control you have over the Nexus." },
  weapon: {
    names: {
      staff:   { order: "Pilgrim's Staff", cult: "Ash-Wood Staff" },
      scythe:  { order: "Harvest Scythe", cult: "Reaper's Scythe" },
      sword:   { order: "Temple Sword", cult: "Borrowed Sword" },
      spear:   { order: "Warden's Spear", cult: "Hunter's Spear" },
      hammer:  { order: "Stone Hammer", cult: "Behemoth Maul" },
      daggers: { order: "Twin Daggers", cult: "Shadow Daggers" },
      bow:     { order: "Hunter's Bow", cult: "Hunter's Bow" },
      knives:  { order: "Throwing Knives", cult: "Throwing Knives" }
    },
    desc: {
      staff: "Balanced. Quick, steady arc.",
      scythe: "The first swing reaches far.",
      sword: "Fast recovery. Even reach.",
      spear: "Long thrusts. Light blows.",
      hammer: "Slow and heavy. Great shove.",
      daggers: "Very fast. Short reach.",
      bow: "Arcing shot. Uses arrows.",
      knives: "Two straight knives per throw."
    },
    stat: { reach: "Reach", dmg: "Damage", speed: "Speed", shove: "Shove" }
  },
  ench: {
    names: {
      flame:  { order: "Flame", cult: "Ember" }, frost: { order: "Frost", cult: "Rime" }, shadow: { order: "Shadow", cult: "Shadow" },
      holy:   { order: "Radiance", cult: "Pale Light" }, bone: { order: "Bone", cult: "Bone" }, claw: { order: "Claw", cult: "Claw" }
    },
    desc: {
      flame: "Hits burn the foe over time.", frost: "Hits slow the foe. Tier 3 freezes.",
      shadow: "Strikes after a dodge hit harder.", holy: "Every few hits mend you by one.",
      bone: "Hits shove far. Tier 2+ stagger.", claw: "Hits make the foe bleed."
    },
    tier: "Tier",
    none: "None"
  },
  hud: { arrows: "Arrows", flask: "Flask", full: "Health is full", empty: "The flask is empty", noArrows: "No arrows", bowFull: "Quiver full" },
  got: { weapon: "{name} found", arrows: "+{n} arrows", aurels: "+{n} aurels", dup: "Already owned: +{n} aurels", nip: "+{n} NIP", flask: "Flask refilled" },
  inv: {
    heading: "Inventory", tabs: ["Weapons", "Items", "Lore"], main: "Main", ranged: "Ranged", equip: "Equip", equipped: "Equipped",
    arrows: "Arrows", flask: "Flask", aurels: "Aurels", nip: "NIP", charms: "Charms", open: "Open Charms", fragments: "Fragments",
    hint: "{A} Equip  {B} Back  Left/Right: tab", hintKb: "Enter: equip   Esc: back   Left/Right: tab", hintTouch: "Tap to equip. Tabs at the top.",
    enchant: "Enchant", noLore: "No tablets read yet", tabletsRead: "Tablets read",
    swapMain: "Main weapon", swapRanged: "Ranged weapon"
  },
  shop: {
    heading: { order: "The Pilgrim's Stall", cult: "The Peddler's Cart" },
    hello: { order: "Peace on the road. Spend your aurels well.", cult: "Aurels talk. Pick something sharp." },
    buy: "Buy", sold: "Sold out", locked: "Claim {n} fragments", owned: "Owned", cant: "Not enough aurels", bought: "Bought: {name}",
    hint: "{A} Buy  {B} Leave", hintKb: "Enter: buy   Esc: leave", hintTouch: "Tap an item, tap again to buy",
    cat: { up: "Upgrades", charm: "Charms", weapon: "Weapons", ranged: "Ranged", ammo: "Supplies" },
    items: {
      flask1: ["Flask Vessel I", "One more flask charge."], flask2: ["Flask Vessel II", "One more flask charge."], flask3: ["Flask Vessel III", "One more flask charge."],
      hp1: ["Heart Phial I", "Max health +1."], hp2: ["Heart Phial II", "Max health +1."], notch: ["Charm Notch", "One more charm notch."],
      quiver1: ["Quiver I", "Carry 7 arrows."], quiver2: ["Quiver II", "Carry 9 arrows."], ammo: ["Arrow Bundle", "Three arrows."]
    },
    talk: "Talk", promptTalk: "A: Trade", promptTalkTouch: "OK: Trade", promptTalkKb: "Enter: Trade"
  },
  leader: {
    order: {
      name: "Ryan",
      menu: ["Counsel", "Enchant weapons", "Leave"],
      hello: "Bring me what the Nexus gave you. I will measure it into your weapon.",
      none: "You have no NIP to spend. Face the next fragment-bearer first.",
      done: "It is done. Bear it lightly.",
      cant: "You do not have the NIP for that tier.",
      max: "That weapon cannot hold more.",
      tip: "NIP is Nexus Influence Power: how much power and control you have over the Nexus. I only ask that you use it for others."
    },
    cult: {
      name: "General Jeriah",
      menu: ["Counsel", "Enchant weapons", "Leave"],
      hello: "The Nexus is a tool. Sharpen it. Hand me your NIP and your blade.",
      none: "No NIP. Take another bearer and come back.",
      done: "Good. Now it bites.",
      cant: "Not enough NIP for that tier. Earn it.",
      max: "That is as keen as steel can be.",
      tip: "NIP is Nexus Influence Power: how much control you have over the Nexus. Hold more of it and you bend more of the world."
    },
    heading: "Enchanting", pick: "Choose a weapon", pickEnch: "Choose an enchantment", cost: "Cost", have: "NIP",
    hint: "{A} Choose  {B} Back", hintKb: "Enter: choose   Esc: back", hintTouch: "Tap to choose, tap again to confirm"
  },
  shrine: { heading: "Shrine", heading_cult: "Brazier", charms: "Charms", teleport: "Teleport", close: "Continue", noCharms: "Charms (none yet)",
    names: { order: ["Threshold Shrine", "Crossing Shrine", "High Shrine", "Gate Shrine"], cult: ["Threshold Brazier", "Crossing Brazier", "High Brazier", "Gate Brazier"] },
    hub: { order: "Ryan's Temple (Hub)", cult: "Jeriah's Hideout (Hub)" },
    tpHeading: "Teleport", tpHint: "{A} Travel  {B} Back", tpHintKb: "Up/Down: pick   Enter: travel   Esc: back", tpHintTouch: "Tap a shrine, tap again to travel",
    tpHere: "(here)", tpNone: "No other lit shrines yet.", tpGo: "Travel", tpDone: "Shrine lit" },
  set: { size: "Touch size", scheme: "Touch controls", buttons: "Buttons", stick: "Joystick", fsOn: "On", fsOff: "Off",
    fsNote: "iPhone and iPad Safari cannot go fullscreen from a page. Use Share > Add to Home Screen, then open Shards from your home screen.",
    fsNoteShort: "iOS: Share > Add to Home Screen for fullscreen.", fsFail: "Fullscreen is blocked here.", fsAndroid: "Tap again if nothing happens.",
    pause: "Fullscreen" },
  pause: { inventory: "Inventory", fullscreen: "Fullscreen" },
  pad: { flask: "LB: Flask", shoot: "RB: Shoot", inv: "View: Inventory" },
  titleKb: ["Move: A D  Jump: Z", "Strike X  Dodge C  Skill V", "Flask F  Shoot G (R: up)", "Inventory I  Pause Esc", "Confirm: Enter"],
  titlePad: ["Move: stick  Jump: A", "X Strike  B Dodge  Y Skill", "LB Flask  RB Shoot", "View Bag  Start Pause", "A Confirm  B Back"],
  controls: { flask: "F / LB  Flask", shoot: "G / RB  Shoot", inv: "I / View  Inventory", up: "R  Shoot up" }
};
(function () {
  const T = window.SHARDS.text22; if (!T || !T.charms || T.charms._v23) return; T.charms._v23 = true;
  T.charms.names.shove = { order: "Shoving Palm", cult: "Brute's Knuckle" };
  T.charms.names.magnet = { order: "Alms Magnet", cult: "Tithe Hook" };
  T.charms.desc.shove = "Your hits shove foes 60% farther.";
  T.charms.desc.magnet = "Aurels and arrows fly to you.";
})();
