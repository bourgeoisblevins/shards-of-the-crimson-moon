window.SHARDS = window.SHARDS || {};
/* v3.2.5 The Arena: levels, enemies, bosses and the reward table. Loaded after data/bosses.js.
   Canon: Nexus Archive "Arena" (neutral ground; prisoners arrive by wagon trail or railroad and fight to earn
   their freedom; reputation matters) and "The Warden" (no banner but his own rule). See docs/ARENA-3.2.5.md. */
(function () {
  const S = window.SHARDS;
  const floor = { x: 0, y: 164, w: 400, h: 16 };
  S.levels.pit35 = {
    w: 400, h: 180, bg: "pit35", kind: "arena", zone: "pit35", title: "The Arena", ambient: "dust",
    spawn: { x: 194, y: 140 }, bossSpawn: { x: 300, y: 60 },
    platforms: [floor, { x: 24, y: 124, w: 80, h: 8, oneWay: true }, { x: 296, y: 124, w: 80, h: 8, oneWay: true }, { x: 168, y: 104, w: 64, h: 8, oneWay: true }],
    gates: [24, 376], warden: { x: 200, y: 69 }, enemies: [], pickups: [], hazards: [], decor: []
  };
  S.levels.pit35cell = {
    w: 320, h: 180, bg: "pit35cell", kind: "arena", zone: "pit35", title: "The Cells", ambient: "dust",
    spawn: { x: 88, y: 140 }, platforms: [{ x: 0, y: 164, w: 320, h: 16 }, { x: 10, y: 139, w: 74, h: 8, oneWay: true }],
    props: [
      { k: "dresser", x: 112, w: 26 },
      { k: "pra", sheet: "npc35-pra", x: 50, y: 139, face: 1 },
      { k: "prb", sheet: "npc35-prb", x: 166, face: -1 },
      { k: "prc", sheet: "npc35-prc", x: 222, face: -1 },
      { k: "guard", sheet: "npc35-guard", x: 262, face: -1 },
      { k: "door", x: 294, w: 26 }
    ], enemies: [], pickups: [], hazards: [], decor: []
  };
  // Enemies (each drawn from an archive entry; see docs/ARENA-3.2.5.md)
  Object.assign(S.enemyStats, {
    pit_brawler:   { hp: 4, speed: 0.72, damage: 1, w: 14, h: 26, behavior: "pitBrawl", score: 1 },               // Plains culture fighters (Nijjlias)
    pit_cutthroat: { hp: 3, speed: 0.8,  damage: 1, w: 12, h: 26, behavior: "pitCut", ranged: true, score: 1 },   // Saffrika mob, moved by rail
    pit_netter:    { hp: 4, speed: 0.6,  damage: 1, w: 14, h: 26, behavior: "pitNet", ranged: true, score: 1 },   // Pirates of Saffrika
    pit_shield:    { hp: 7, speed: 0.42, damage: 2, w: 18, h: 22, behavior: "pitShield", score: 2 },              // Dwarves of the Keep
    ashen_wolf:    { hp: 3, speed: 1.0,  damage: 1, w: 24, h: 14, behavior: "pitWolf", score: 1 },                // Corrupted Beasts: Ashen Wolves
    // deep waves: older story foes as arena prisoners and captured beasts (palette swaps, tools/v35/recolor35.py)
    pit_pirate:    { hp: 4, speed: 0.62, damage: 1, w: 12, h: 20, behavior: "melee", score: 1 },                  // Pirates of Saffrika (pirate)
    pit_bowman:    { hp: 3, speed: 0.3,  damage: 1, w: 12, h: 18, behavior: "ranged", ranged: true, score: 1 },   // Saffrika culture: clan bowmen (ruin_archer)
    pit_monk:      { hp: 6, speed: 0.6,  damage: 2, w: 14, h: 22, behavior: "brute", score: 2 },                  // Warrior Monks, cast out (monk_brawler)
    pit_staff:     { hp: 5, speed: 0.55, damage: 1, w: 12, h: 22, behavior: "staff", score: 2 },                  // Warrior Monks, cast out (monk_staff)
    pit_turned:    { hp: 6, speed: 0.6,  damage: 1, w: 24, h: 18, behavior: "charger", score: 2 },                // Hog-like Creatures of the Deep (deep_pig)
    pit_griffin:   { hp: 4, speed: 0.75, damage: 2, w: 20, h: 22, behavior: "dive", score: 2 },                   // Dark Griffins (ash_griffin)
    pit_captain:   { hp: 8, speed: 0.7,  damage: 2, w: 16, h: 24, behavior: "charger", score: 3 }                 // Pirates of Saffrika (pirate_captain)
  });
  // Bosses: three Corrupted Beasts / war-engines, rotated by block. Tier scaling in pit35.boss.
  Object.assign(S.bosses, {
    cinderbear: { hp: 26, speed: 0.5, size: [64, 50], core: 0.16, rest: 54, phase2At: 0.55, moves: ["bearCharge", "bearSwipe", "bearSlam"], moves2: ["bearCharge", "bearSwipe", "bearSlam", "bearRoar"], telegraph: 36 },
    hollowstag: { hp: 24, speed: 0.62, size: [44, 60], core: 0.14, rest: 50, phase2At: 0.55, moves: ["stagStill", "stagCharge", "stagToss"], moves2: ["stagStill", "stagCharge", "stagToss", "stagLeap"], telegraph: 32 },
    pitgolem:   { hp: 30, speed: 0.4, size: [50, 64], core: 0.14, rest: 58, phase2At: 0.55, moves: ["golPunch", "golPound", "golThrow"], moves2: ["golPunch", "golPound", "golThrow", "golCharge"], telegraph: 36 }
  });
  Object.assign(S.bossMoveIndex, { cinderbear: {}, hollowstag: {}, pitgolem: {} });
  Object.assign(S.palettes.bosses, {
    cinderbear: { ramp: ["#1C1814", "#2E2924", "#9A2E22", "#E0604A", "#EDBE52"] },
    hollowstag: { ramp: ["#17131C", "#2C2433", "#4B3E48", "#BFB59A", "#CFC2AB"] },
    pitgolem:   { ramp: ["#1E2022", "#3B3C3A", "#6A6A64", "#C9A227", "#E8C547"] }
  });
  // Reward and pacing table (balanced against world23/26/34; numbers are documented in docs/ARENA-3.2.5.md)
  S.pit35 = {
    countdown: 480,            // 8 s between waves (60 fps)
    block: 10,                 // a boss after every 10 waves
    waveAurels: [12, 3, 120],  // wave n pays min(120, 12 + 3n) aurels (flat 120 from wave 36 on)
    blockBonus: [150, 900],    // the k-th boss pays min(900, 150 * k) aurels (flat 900 from the 6th boss on)
    nipHalf: 1,                // each arena boss is worth half a NIP (one NIP per two bosses, counted across runs)
    respawnShare: 0.5,         // the Warden buys you back once per run for half of the aurels earned in it
    bosses: ["cinderbear", "hollowstag", "pitgolem"],
    boss: { hpTier: 0.35, rest: 0.85, dmgCap: 3 },   // tier t = every full rotation of three: +35% HP per tier, 15% shorter rests (floor 30 frames), +1 damage per tier up to +3
    // wave n: count, alive cap and enemy mix. Endless: every curve below is defined for any n >= 1.
    count: (n) => Math.min(12, 3 + Math.floor(n * 0.6)),
    cap: (n) => Math.min(6, 2 + Math.floor((n + 2) / 4)),
    hpMul: (n) => 1 + 0.07 * Math.min(n - 1, 30) + 0.025 * Math.max(0, n - 31) + 0.2 * Math.floor((n - 1) / 10),
    dmgAdd: (n) => Math.min(3, Math.floor((n - 1) / 12)),
    // [type, debut wave]. Waves 1-10 are the arena's own fighters; the older story foes come in from wave 11.
    pool: [["pit_brawler", 1], ["ashen_wolf", 3], ["pit_cutthroat", 4], ["pit_netter", 6], ["pit_shield", 8],
           ["pit_pirate", 11], ["pit_bowman", 13], ["pit_monk", 15], ["pit_staff", 18], ["pit_turned", 21], ["pit_griffin", 24], ["pit_captain", 28]],
    mix: (n) => Math.min(5, 3 + Math.floor(n / 20)),  // each wave draws from this many of the unlocked kinds (the newest debut always included)
    elite: (n) => (n >= 12 ? Math.min(0.25, 0.04 * (n - 10)) : 0),
    waveGold: function (n) { const w = this.waveAurels; return Math.min(w[2], w[0] + w[1] * n); },
    bossGold: function (k) { return Math.min(this.blockBonus[1], this.blockBonus[0] * k); }
  };
})();
