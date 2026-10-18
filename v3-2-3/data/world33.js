// v3.2.3: two new ranged weapons. Shurikens stick into the foe and pop for 1 more damage 1.5 s later; blow darts stun
// (2 s on foes; bosses get 0.75 s, halved for each dart that lands within 6 s). Both use arrows, 1 per shot, like the bow.
// Balance (damage per arrow / per second of cooldown): bow 1 / 26f, knives 2 / 18f, Magik Staff 3 for 2 arrows / 40f,
// shurikens 1 + 1 delayed / 22f, darts 1 + stun / 34f.
(function () {
  var S = window.SHARDS, W23 = S.world23, T23 = S.text23;
  W23.shuriken = { dmg: 1, speed: 5.0, grav: 0, cd: 22, life: 52, up: 1.6, stick: { delay: 90, dmg: 1, max: 3 } };
  W23.darts = { dmg: 1, speed: 5.6, grav: 0.012, cd: 34, life: 64, up: 1.5, stun: 120, bossStun: 45, bossDecay: 0.5, bossWindow: 360, frostMul: 1.5 };
  W23.ranged = W23.ranged.concat(["shuriken", "darts"]);
  W23.shop.push({ id: "shuriken", kind: "ranged", price: 110, at: 1 }, { id: "darts", kind: "ranged", price: 140, at: 2 });
  T23.weapon.names.shuriken = { order: "Shurikens", cult: "Shurikens" };
  T23.weapon.names.darts = { order: "Blow Darts", cult: "Blow Darts" };
  T23.weapon.desc.shuriken = "Sticks in a foe, then pops for +1 damage 1.5 s later. Flame enchant: +1 pop.";
  T23.weapon.desc.darts = "Stuns a foe for 2 s; bosses only briefly, less each time. Frost enchant: longer stun.";
})();
