// v3.2.4: Blink charm, the aurel sinks (Temper, Alms of the Moon, Provisions), shop dyes and the two New Game+ notches.
(function () {
  var S = window.SHARDS, W22 = S.world22, T22 = S.text22, W23 = S.world23, T23 = S.text23;
  // ---- Blink charm (2 notches): the dodge becomes a near-instant teleport, farther than the roll ----
  W22.cost.blink = 2; W22.charmOrder.push("blink"); W22.source.blink = "shop";
  T22.charms.names.blink = { order: "Veil Blink", cult: "Shade Blink" };
  T22.charms.desc.blink = "Your dodge becomes a near-instant teleport, farther than the roll. Costs 2 notches.";
  W23.shop.push({ id: "blink", kind: "charm", price: 1200, at: 3 });
  // ---- aurel sinks (merchant rows) ----
  S.world34 = {
    temper: { max: 10, base: 150, mul: 1.3, chance: 0.02 },            // level 1 = 150 aurels, +30% a level (about 1,590 at 10), 2% per level for a +1 hit
    alms: { max: 10, base: 250, step: 150 },                            // aurels into NIP, one at a time
    prov: [{ cost: 0, nip: 0 }, { cost: 300, nip: 2 }, { cost: 800, nip: 4 }, { cost: 2000, nip: 6 }],
    ngNotch: [{ id: "ngn1", price: 1500, ng: 1 }, { id: "ngn2", price: 3000, ng: 1 }],   // two extra notches, on sale in New Game+
    notchCap: 9,
    dyes: [
      { id: "crimson",  name: "Crimson",  price: 400,  ramp: ["#5A0F14", "#A3141F", "#E02A2A", "#FF6A5A"] },   // bright red
      { id: "sapphire", name: "Sapphire", price: 700,  ramp: ["#12265A", "#1F44A0", "#3C7BE0", "#8CB8FF"] },
      { id: "amethyst", name: "Amethyst", price: 1000, ramp: ["#2E1458", "#5A2AA0", "#8F5AE0", "#C9A6FF"] },
      { id: "rosewood", name: "Rosewood", price: 1400, ramp: ["#3A1A1A", "#6E2F33", "#A8545A", "#D98F92"] },
      { id: "gilded",   name: "Gilded",   price: 1800, ramp: ["#7A5A10", "#B8861B", "#E8B830", "#FFE680"] },
      { id: "ashen",    name: "Ashen",    price: 2100, ramp: ["#101010", "#1D1D1D", "#303030", "#4A4A4A"] },   // dark ash
      { id: "midnight", name: "Midnight", price: 2400, ramp: ["#05061A", "#0C1033", "#161E55", "#26337D"] }
    ]
  };
  var D = S.world34;
  D.dyes.forEach(function (d) { W23.shop.push({ id: "dye_" + d.id, kind: "dye", price: d.price, at: 0 }); });
  W23.shop.push({ id: "dye_none", kind: "dye", price: 0, at: 0 });
  W23.shop.push({ id: "temper", kind: "temper", price: 150, at: 0 }, { id: "alms", kind: "alms", price: 250, at: 0 });
  D.ngNotch.forEach(function (n) { W23.shop.push({ id: n.id, kind: "ngnotch", price: n.price, at: 0, ng: n.ng }); });
  T23.shop.items.temper = ["Temper", "Hone the weapon you hold. Each level: +2% chance for a strike to deal +1 damage."];
  T23.shop.items.alms = ["Alms of the Moon", "Turn aurels into 1 NIP. Up to 10 per file; the price rises each time."];
  T23.shop.items.ngn1 = ["Moon Notch I", "A new charm notch, found only after the Shattering turns again."];
  T23.shop.items.ngn2 = ["Moon Notch II", "A second new charm notch."];
  T23.shop.items.dye_none = ["Natural cloak", "Take off any dye."];
  D.dyes.forEach(function (d) { T23.shop.items["dye_" + d.id] = [d.name + " dye", "Recolours your outfit. Skin, outlines and fragment details keep their colours. Buy once, then wear or remove it here."]; });

  // ---- cosmetic groups. Each group is one merchant row: Left/Right (or the arrows) pick an option, Enter buys it, then wears/hides it. ----
  D.groups = [
    { id: "aura", name: "Aura", slot: "aura", opts: [
      { id: "ember", name: "Ember", price: 1500, desc: "Warm motes drift around you. For show only." }, { id: "frost", name: "Frost", price: 1800, desc: "Cold motes drift around you." },
      { id: "gilt", name: "Gilt", price: 2200, desc: "Gold motes drift around you." }, { id: "void", name: "Void", price: 3000, desc: "Violet motes drift around you." },
      { id: "rose", name: "Rose petals", price: 3500, desc: "Petals swirl around you." }] },
    { id: "glow", name: "Weapon glow", slot: "glow", opts: [
      { id: "ember", name: "Ember", price: 900, desc: "A tinted edge on whatever you hold, separate from enchant colours." }, { id: "frost", name: "Frost", price: 900, desc: "A cold glow on your weapon." },
      { id: "gilt", name: "Gilt", price: 900, desc: "A golden glow on your weapon." }, { id: "void", name: "Void", price: 900, desc: "A violet glow on your weapon." }] },
    { id: "trail", name: "Slash trail", slot: "trail", opts: [
      { id: "crimson", name: "Crimson", price: 700, desc: "Colour of your strike smear." }, { id: "gold", name: "Gold", price: 700, desc: "A golden strike smear." },
      { id: "frost", name: "Frost", price: 700, desc: "A pale blue strike smear." }, { id: "void", name: "Void", price: 700, desc: "A violet strike smear." }] },
    { id: "tint", name: "Afterimage", slot: "tint", opts: [
      { id: "crimson", name: "Crimson", price: 600, desc: "The echo you leave when dodging." }, { id: "gold", name: "Gold", price: 600, desc: "A golden dodge echo." },
      { id: "frost", name: "Frost", price: 600, desc: "A pale blue dodge echo." }, { id: "void", name: "Void", price: 600, desc: "A violet dodge echo." }] },
    { id: "foot", name: "Footsteps", slot: "foot", opts: [
      { id: "dust", name: "Dust", price: 800, desc: "Dust as you run and land." }, { id: "petals", name: "Petals", price: 800, desc: "Petals as you run and land." },
      { id: "embers", name: "Embers", price: 800, desc: "Embers as you run and land." }, { id: "ripples", name: "Ripples", price: 800, desc: "Ripples as you run and land." }] },
    { id: "comp", name: "Companion", slot: "comp", opts: [
      { id: "snake", name: "Small snake", price: 2000, desc: "A little snake follows you." }, { id: "crow", name: "Crow", price: 2000, desc: "A crow follows you." },
      { id: "golem", name: "Stone golem", price: 2500, desc: "A tiny stone golem follows you." }] },
    { id: "hud", name: "Frame style", slot: "hud", opts: [
      { id: "bone", name: "Bone", price: 1200, desc: "A frame style for the health bar and menus." }, { id: "ember", name: "Ember", price: 1200, desc: "An ember frame for the health bar and menus." },
      { id: "moon", name: "Moonsilver", price: 1200, desc: "A silver frame for the health bar and menus." }] },
    { id: "decor", name: "Hub decor", slot: "decor", decor: true, opts: [
      { id: "lilies", name: "Crimson lilies", price: 500, desc: "Show or hide after buying." }, { id: "banners", name: "Moon banners", price: 600, desc: "Show or hide after buying." },
      { id: "braziers", name: "Hearth braziers", price: 800, desc: "Cast a soft glow. Show or hide after buying." }, { id: "lanterns", name: "Paper lanterns", price: 1200, desc: "Swaying, with a soft glow." },
      { id: "statue", name: "Player statue", price: 2500, desc: "A stone likeness of you." }, { id: "moth", name: "Altar moth", price: 4000, desc: "A moth that circles the altar." }] },
    { id: "bgn", name: "Order exclusive", slot: "bg", decor: true, only: "order", opts: [{ id: "night", name: "Night Sky", price: 1500, desc: "Sets the hub to nighttime." }] },
    { id: "bgd", name: "Cult exclusive", slot: "bg", decor: true, only: "cult", opts: [{ id: "deep", name: "Deep Temple", price: 1500, desc: "The hideout set in the deep, lit by lanterns, with mushrooms and drifting spores." }] }
  ];
  D.groups.forEach(function (g) { W23.shop.push({ id: "cg_" + g.id, kind: "cosgroup", price: 0, at: 0, only: g.only }); });
  // ---- Delve provisions text ----
  S.text34 = { prov: "Provisions", provNone: "none", provNip: "{n} NIP", provDesc: "Pay aurels before the descent to start with NIP for the dungeon's shops. Repeats every run; not refunded if you quit.", provCant: "Not enough aurels for those provisions." };
})();
