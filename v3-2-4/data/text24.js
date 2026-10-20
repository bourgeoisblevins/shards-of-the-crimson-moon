// v2.4 text: new charms, Magik Staff, death loss, confirm modal, refunds, charge, regen.
(function () {
  var S = window.SHARDS, T22 = S.text22, T23 = S.text23;
  var N = {
    fleet: ["Fleet Sigil", "Dust Dancer", "Dodge carries you 40% farther."],
    deepflask: ["Deep Phial", "Bottomless Gourd", "+1 flask charge while worn."],
    quickfill: ["Brisk Offering", "Hungry Phial", "The flask fills with 2 fewer kills."],
    swiftdraw: ["Swift Draught", "Hasty Gulp", "Drink the flask 40% faster."],
    sparrow: ["Sparrow Feathers", "Bat Scraps", "Small wings: you fall slower."],
    starfall: ["Starfall Sigil", "Falling Ash", "Skill becomes a leap and ground slam."],
    hourglass: ["Pilgrim's Hourglass", "Slow Ember", "Regain 1 flask charge every 90 s."],
    snakecharmer: ["Snake Charmer", "Snake Charmer", "Drinking turns you into a fast snake for 2.5 s."],
    magikexp: ["Magik Explosion", "Magik Explosion", "Drinking blasts and slows nearby foes."],
    crimsonhunger: ["Crimson Hunger", "Crimson Hunger", "Every 2 kills heal 1. Flasks heal 1 less."],
    shatteredshadow: ["Shattered Shadow", "Shattered Shadow", "Dodge through a foe: a shadow bursts."],
    ashencovenant: ["Ashen Covenant", "Ashen Covenant", "Half health or less: +1 damage dealt and taken."],
    serpentguard: ["Serpent's Guard", "Serpent's Guard", "After a hit, take 1 less for 2.5 s. 25 s rest."],
    purifyflame: ["Purifying Flame", "Purifying Flame", "A charged kill refills half a flask charge."],
    unbrokenfaith: ["Unbroken Faith", "Unbroken Faith", "A near-miss dodge: take 1 less and hit harder."]
  };
  for (var id in N) { T22.charms.names[id] = { order: N[id][0], cult: N[id][1] }; T22.charms.desc[id] = N[id][2]; }
  var T = {
    death: { lost: "-{n} aurels", lostLine: "You lost {n} aurels.", note: "Death costs 1 to 7 aurels." },
    confirm: { title: "Forget this pilgrimage?", body: "Your saved path, fragments and aurels will be erased.", yes: "Yes", no: "No", hintKb: "Left/Right choose. Enter confirms. Esc cancels.", hintPad: "A confirm   B cancel", hintTouch: "Tap Yes or No.",
      endBody: "Starting anew erases this finished save.", endTitle: "Begin a new pilgrimage?" },
    ench: { refund: { order: "The old rite is undone. {n} NIP returned; the new one starts at tier 1.", cult: "Old brand scraped off. {n} NIP back. The new one starts at tier 1." }, refundHint: "({n} NIP refunded on switch)", ladder: "Switching resets the tier. You get back all NIP spent on the old one." },
    chargeHint: "Hold Strike to charge", charged: "Charged", ready: "Ready!",
    hud: { cost: "x{n}", regen: "Hourglass: next charge in {s}s", faith: "Faith!", guard: "Guarded", snake: "Snake form", shadow: "Shadow" },
    page: "Page {a}/{b}", pageHint: "Q/E or LB/RB: page",
    items: { mstaff: ["Magik Staff", "Heavy bolt. Costs 2 arrows per cast."] },
    boss: { charm: "Charm earned: {name}" },
    controls: { charge: "Hold Strike: charged blow" }
  };
  S.text24 = T;
  T23.weapon.names.mstaff = { order: "Magik Staff", cult: "Magik Staff" };
  T23.weapon.desc.mstaff = "Heavy bolt. Costs 2 arrows a cast.";
})();
