// v2.2 rules data: charms (notch cost, source), temporary powerups, difficulty, hub gifts.
window.SHARDS = window.SHARDS || {};
window.SHARDS.world22 = {
  charmOrder: ["arc", "quick", "ghost", "leap", "grip", "rend", "tithe", "stand", "focus", "thorn", "ward", "lantern", "resonance", "glass"],
  cost: { arc: 1, quick: 1, ghost: 1, leap: 2, grip: 1, rend: 2, tithe: 2, stand: 1, focus: 2, thorn: 1, ward: 2, lantern: 1, resonance: 2, glass: 1 },
  // Where each charm is found. "secret" = a hidden room, "elite" = an elite's drop, "gift" = a hub NPC.
  source: {
    arc: "gift:order:0", ghost: "elite:vespera", // cult: both come as gifts from Jeriah (below)
    lantern: "secret:deep", thorn: "elite:deep",
    leap: "secret:aurelion", quick: "elite:aurelion",
    rend: "secret:deepLairs", tithe: "elite:deepLairs",
    grip: "secret:monastery", ward: "elite:monastery",
    focus: "secret:sakura", stand: "elite:sakura",
    resonance: "gift", glass: "gift"
  },
  // Gifts by number of claimed fragments (any path). The cult has no Vespera, so Jeriah hands out its two.
  gifts: {
    order: [{ at: 2, charm: "resonance" }, { at: 4, charm: "glass" }],
    cult: [{ at: 1, charm: "arc" }, { at: 2, charm: "resonance" }, { at: 3, charm: "ghost" }, { at: 4, charm: "glass" }]
  },
  power: { ember: { t: 1500 }, gale: { t: 1500 }, ward: { t: 540 }, guard: { t: 3000 }, speed: { t: 1500 } },
  diff: {
    pilgrim:  { dmg: 0.67, hp: 0.8,  boss: 0.8,  inv: 76, bossDmg: 1,   heal: 1 },
    standard: { dmg: 1,    hp: 1.35, boss: 1.35, inv: 56, bossDmg: 1,   heal: 0 },
    penitent: { dmg: 1.6,  hp: 1.7,  boss: 1.8,  inv: 44, bossDmg: 2,   heal: 0 }
  },
  order: ["pilgrim", "standard", "penitent"]
};
