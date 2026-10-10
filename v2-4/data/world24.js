// v2.4 rules data: dodge grace, aurel loss on death, ten-plus new charms, Magik Staff, enemy projectiles, skill swap, regen flask.
(function () {
  var S = window.SHARDS, W22 = S.world22, W23 = S.world23;
  var NEW = ["fleet", "deepflask", "quickfill", "swiftdraw", "sparrow", "starfall", "hourglass",
             "snakecharmer", "magikexp", "crimsonhunger", "shatteredshadow", "ashencovenant", "serpentguard", "purifyflame", "unbrokenfaith"];
  W22.charmOrder = W22.charmOrder.concat(NEW);
  var C = { fleet: 1, deepflask: 2, quickfill: 2, swiftdraw: 1, sparrow: 1, starfall: 2, hourglass: 2,
            snakecharmer: 2, magikexp: 2, crimsonhunger: 2, shatteredshadow: 2, ashencovenant: 1, serpentguard: 2, purifyflame: 2, unbrokenfaith: 1 };
  for (var k in C) W22.cost[k] = C[k];
  // Sources. shop = hub merchant (faction-listed ones only in that hub); boss = reward after a boss claim (any path).
  W22.source.fleet = "shop"; W22.source.deepflask = "shop"; W22.source.quickfill = "shop"; W22.source.swiftdraw = "shop";
  W22.source.sparrow = "shop"; W22.source.starfall = "shop"; W22.source.hourglass = "shop";
  W22.source.snakecharmer = "shop:cult|boss:nezradeem"; W22.source.magikexp = "shop:cult|boss:azmardus";
  W22.source.crimsonhunger = "shop:cult|boss:jeriah"; W22.source.shatteredshadow = "shop:cult|boss:silent";
  W22.source.ashencovenant = "shop:cult|boss:orchalsius";
  W22.source.serpentguard = "shop:order"; W22.source.purifyflame = "shop:order|gift:cult:3"; W22.source.unbrokenfaith = "shop:order|boss:gladius";
  // fragment id of each boss -> charm reward (claimed fragment ids are used by enterClaim)
  var w24 = {
    newCharms: NEW,
    dodge: { graceFrac: 0.5, fleetMul: 1.4 },                    // +50% total i-frames; Fleet: dodge speed x1.4
    death: { lo: [1, 4], hi: [5, 7], pHi: 0.3 },                  // P(1-4)=70% uniform, P(5-7)=30% uniform
    bossCharm: { jeriah: "crimsonhunger", azmardus: "magikexp", nezradeem: "snakecharmer", orchalsius: "ashencovenant", silent: "shatteredshadow", gladius: "unbrokenfaith" },
    charm: {
      deepflask: { flask: 1 }, quickfill: { kills: 2, min: 2 }, swiftdraw: { mul: 0.6 },
      sparrow: { fall: 2.8 },                                     // max fall speed (normal 4.5)
      hourglass: { frames: 5400 },                                // 90 s
      snake: { frames: 150, spd: 1.45 },
      magik: { r: 46, dmg: 2, slow: 200, slowMul: 0.5 },
      hunger: { kills: 2, hp: 1, flaskPenalty: 1 },
      shadow: { fuse: 40, r: 34, dmg: 2, max: 3 },
      ashen: { hpFrac: 0.5, dmg: 1, taken: 1 },
      guard: { window: 150, cd: 1500, cut: 1 },
      purify: { meter: 0.5 },
      faith: { window: 240, cd: 120, cut: 1, dmg: 1, near: 10 }
    },
    charge: { min: 34, full: 34, dmg: 1, reach: 1.4, kb: 1.8, cd: 26 },
    star: { rise: 14, dmg: 2, r: 44, cd: 100 },
    ember: { speed: 1.9, up: 1.3, grav: 0.1, bounces: 3, dmg: 2, flameDmg: 1, flameLife: 100, life: 190, cd: 34 },
    mstaff: { dmg: 3, speed: 3.2, grav: 0, cd: 40, life: 70, up: 1.7, cost: 2 }
  };
  W22.gifts.cult.push({ at: 3, charm: "purifyflame" }, { at: 4, charm: "serpentguard" });   // Jeriah hands the Order's two shop-only charms to cult pilgrims
  S.world24 = w24;
  W23.mstaff = w24.mstaff;
  W23.ranged = W23.ranged.concat(["mstaff"]);
  var sh = W23.shop;
  sh.push({ id: "mstaff", kind: "ranged", price: 180, at: 2 });
  var P = [["fleet", 70, 1], ["swiftdraw", 90, 1], ["sparrow", 90, 1], ["quickfill", 150, 2], ["deepflask", 180, 2], ["hourglass", 200, 3], ["starfall", 220, 4]];
  P.forEach(function (a) { sh.push({ id: a[0], kind: "charm", price: a[1], at: a[2] }); });
  [["snakecharmer", 190, 1], ["magikexp", 170, 2], ["crimsonhunger", 200, 2], ["ashencovenant", 120, 2], ["shatteredshadow", 210, 3]].forEach(function (a) { sh.push({ id: a[0], kind: "charm", price: a[1], at: a[2], only: "cult" }); });
  [["serpentguard", 170, 1], ["purifyflame", 190, 2], ["unbrokenfaith", 140, 2]].forEach(function (a) { sh.push({ id: a[0], kind: "charm", price: a[1], at: a[2], only: "order" }); });
})();
