// v2.3 rules data: weapons, ranged weapons, enchantments, NIP, shop, economy, flask. All numbers live here.
window.SHARDS = window.SHARDS || {};
window.SHARDS.world23 = {
  // Strike tuning per weapon. reach = px of arc beyond the body for hit 1/2/3 of the combo (Open Hand adds
  // +10). dmg per hit of the combo. cd = recovery multiplier (1 = the v2.2 staff). kb = knockback multiplier.
  melee: ["staff", "scythe", "sword", "spear", "hammer", "daggers"],
  weapons: {
    staff:   { reach: [16, 16, 18], dmg: [1, 1, 2], cd: 1.0,  kb: 1.0, hitH: 16, stun: 10 },
    scythe:  { reach: [27, 18, 20], dmg: [1, 1, 2], cd: 1.08, kb: 0.9, hitH: 18, stun: 10 },
    sword:   { reach: [18, 18, 21], dmg: [1, 1, 2], cd: 0.82, kb: 0.8, hitH: 16, stun: 9 },
    spear:   { reach: [27, 27, 32], dmg: [1, 1, 1], cd: 1.2,  kb: 0.7, hitH: 10, stun: 8 },
    hammer:  { reach: [17, 17, 21], dmg: [2, 2, 3], cd: 1.75, kb: 2.4, hitH: 22, stun: 20 },
    daggers: { reach: [12, 12, 14], dmg: [1, 1, 1], cd: 0.62, kb: 0.35, hitH: 14, stun: 6 }
  },
  start: { order: "staff", cult: "scythe" },
  ranged: ["bow", "knives"],
  // Arrows: a single roll per kill. r < 0.50 -> 1 arrow, r < 0.70 -> 2 arrows, else nothing (30%).
  arrowRoll: { one: 0.5, two: 0.7 },
  bow:    { dmg: 1, speed: 4.4, grav: 0.035, cd: 26, life: 80, up: 2.1 },
  knives: { dmg: 1, speed: 4.8, grav: 0.0, cd: 18, life: 46, up: 1.4, count: 2 },
  arrowMax: 5, arrowMaxBuy: [7, 9],
  // Flask: kills fill the meter; N kills = one charge. A shrine refills it fully.
  flask: { start: 3, max: 6, heal: 2, channel: 46, killsPer: { pilgrim: 4, standard: 5, penitent: 6 }, elite: 5 },
  // Aurels. Per kill: coins of value 2 (count 1-3). Elite: 5 big coins of 10. Boss: 60 (paid on the claim).
  coin: { small: 2, big: 10, eliteCoins: 5, boss: 60, magnet: 54, magnetCharm: 120, life: 780 },
  // Boss NIP (first defeat only). Order has six bosses, the cult five.
  nip: { jeriah: 1, azmardus: 1, nezradeem: 1, orchalsius: 2, silent: 2, gladius: 2 },
  nipCost: [1, 2, 3],
  ench: ["flame", "frost", "shadow", "holy", "bone", "claw"],
  enchFaction: { order: ["flame", "frost", "holy", "bone", "shadow", "claw"], cult: ["flame", "frost", "shadow", "bone", "claw", "holy"] },
  // Shop. at = fragments claimed to unlock. kind: up (upgrade), charm, weapon, ranged, ammo.
  shop: [
    { id: "flask1", kind: "up", price: 80,  at: 0 }, { id: "flask2", kind: "up", price: 140, at: 2 }, { id: "flask3", kind: "up", price: 220, at: 4 },
    { id: "hp1", kind: "up", price: 200, at: 1 }, { id: "hp2", kind: "up", price: 320, at: 3 },
    { id: "notch", kind: "up", price: 260, at: 2 },
    { id: "quiver1", kind: "up", price: 50, at: 0 }, { id: "quiver2", kind: "up", price: 100, at: 2 },
    { id: "ammo", kind: "ammo", price: 12, at: 0 },
    { id: "shove", kind: "charm", price: 80, at: 0 }, { id: "magnet", kind: "charm", price: 60, at: 0 },
    { id: "tithe", kind: "charm", price: 150, at: 2 }, { id: "focus", kind: "charm", price: 160, at: 3 },
    { id: "sword", kind: "weapon", price: 120, at: 0 }, { id: "spear", kind: "weapon", price: 140, at: 1 },
    { id: "daggers", kind: "weapon", price: 160, at: 2 }, { id: "staff", kind: "weapon", price: 100, at: 0, only: "cult" },
    { id: "scythe", kind: "weapon", price: 100, at: 0, only: "order" }, { id: "knives", kind: "ranged", price: 90, at: 1 }
  ],
  // Weapons found in the world. Hammer = Orchalsius's reward. Daggers = Silent Dark Apostle's reward (if not yet owned).
  bossWeapon: { orchalsius: "hammer", silent: "daggers" },
  vaultWeapon: { vespera: "sword", deep: "knives", aurelion: "spear" },
  merchant: { order: { x: 316, y: 140 }, cult: { x: 300, y: 140 } },
  merchantNear: 30,
  // Enchantments: stats by tier (1..3). Bosses take reduced status effects (see engine bossK).
  enchFx: {
    flame:  { burnTicks: [3, 4, 5], gap: 50 },
    frost:  { slow: [0.35, 0.5, 0.6], time: [100, 130, 160], freeze: [0, 0, 18] },
    shadow: { after: [1, 1, 2], window: 36 },
    holy:   { every: [12, 10, 8], heal: 1 },
    bone:   { kb: [1.5, 1.9, 2.4], stagger: [0, 8, 14] },
    claw:   { ticks: [3, 4, 5], gap: 44 }
  },
  bossK: 0.5,
  shrineNames: { cp1: 0, cp6: 1, cp9: 2, cp12: 3 },
  touch: { min: 0.7, max: 1.5, step: 0.1, stickR: 26 }
};
// v2.3: two shop charms join the loadout (16 in all). A charm bought in the shop and later found is refunded as aurels.
(function () {
  const W = window.SHARDS.world22; if (!W || W._v23) return; W._v23 = true;
  W.charmOrder.push("shove", "magnet"); W.cost.shove = 1; W.cost.magnet = 1;
  W.source.shove = "shop"; W.source.magnet = "shop";
})();
