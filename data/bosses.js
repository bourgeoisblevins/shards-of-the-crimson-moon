window.SHARDS = window.SHARDS || {};
// Guide order difficulty ramp. Tuned so an average clear is ~1–3 tries.
window.SHARDS.bosses = {
  jeriah:     { hp: 14, speed: 0.55, size: [18, 40], core: 0.15, rest: 58, phase2At: 0.45, moves: ["charge","slam","cleave"], moves2: ["charge","slam","cleave","rain"], telegraph: 36 },
  azmardus:   { hp: 16, speed: 0.4,  size: [16, 42], core: 0.15, rest: 54, phase2At: 0.45, staffEye: true, moves: ["bolt","teleport","orb"], moves2: ["bolt","teleport","orb","barrage"], telegraph: 40 },
  nezradeem:  { hp: 18, speed: 0.48, size: [18, 46], core: 0.15, rest: 52, phase2At: 0.45, moves: ["arc","spikes","bonewall"], moves2: ["arc","spikes","bonewall","spiral"], telegraph: 40 },
  orchalsius: { hp: 20, speed: 0.52, size: [30, 56], core: 0.22, rest: 50, phase2At: 0.45, moves: ["pillar","bolt","wave"], moves2: ["pillar","bolt","wave","erupt"], telegraph: 36 },
  silent:     { hp: 18, speed: 0.78, size: [16, 38], core: 0.12, rest: 46, phase2At: 0.4, moves: ["dash","fade","slash"], moves2: ["dash","fade","slash","mirror"], telegraph: 32 },
  gladius:    { hp: 24, speed: 0.62, size: [36, 46], core: 0.22, rest: 48, phase2At: 0.4, moves: ["leap","swipe","howl"], moves2: ["leap","swipe","howl","frenzy"], telegraph: 34 }
};
// v2: frame set per move. atkN in the boss sheets follows the moves2 order.
window.SHARDS.bossMoveIndex = {};
for (const [id, b] of Object.entries(window.SHARDS.bosses)) {
  window.SHARDS.bossMoveIndex[id] = {};
  b.moves2.forEach((m, i) => { window.SHARDS.bossMoveIndex[id][m] = i + 1; });
}
// behavior: melee | ranged | jumper | charger | bound
// bound: monastery shades. They cannot leave the ground they died on (leashed to
// their spawn, never step off their terrace). translucent: drawn without the void
// outline/rim so the dithered robe reads as see-through.
window.SHARDS.enemyStats = {
  ash_walker:      { hp: 2, speed: 0.55, damage: 1, w: 12, h: 18, behavior: "melee", score: 1 },
  ruin_archer:     { hp: 2, speed: 0.28, damage: 1, w: 12, h: 18, behavior: "ranged", ranged: true, score: 1 },
  warped_hog:      { hp: 3, speed: 0.85, damage: 1, w: 14, h: 16, behavior: "charger", score: 1 },
  rift_spitter:    { hp: 2, speed: 0.32, damage: 1, w: 12, h: 16, behavior: "ranged", ranged: true, score: 1 },
  hollow_sentinel: { hp: 3, speed: 0.32, damage: 1, w: 12, h: 20, behavior: "melee", score: 1 },
  dust_wraith:     { hp: 2, speed: 0.7,  damage: 1, w: 12, h: 16, behavior: "jumper", score: 1 },
  ember_crawler:   { hp: 3, speed: 0.5,  damage: 1, w: 14, h: 14, behavior: "melee", score: 1 },
  blaze_imp:       { hp: 2, speed: 0.55, damage: 1, w: 12, h: 14, behavior: "ranged", ranged: true, score: 1 },
  canopy_stalker:  { hp: 3, speed: 0.7,  damage: 1, w: 12, h: 18, behavior: "jumper", score: 1 },
  vine_spitter:    { hp: 2, speed: 0.28, damage: 1, w: 12, h: 18, behavior: "ranged", ranged: true, score: 1 },
  frost_wolf:      { hp: 3, speed: 0.9,  damage: 1, w: 14, h: 16, behavior: "charger", score: 1 },
  ice_archer:      { hp: 2, speed: 0.28, damage: 1, w: 12, h: 18, behavior: "ranged", ranged: true, score: 1 },
  monastery_shade: { hp: 2, speed: 0.34, damage: 1, w: 12, h: 20, behavior: "bound", leash: 40, translucent: true, score: 1 },
  // v2.5
  deep_pig:        { hp: 6, speed: 0.6,  damage: 1, w: 24, h: 18, behavior: "charger", score: 2 },
  ash_griffin:     { hp: 4, speed: 0.75, damage: 2, w: 20, h: 22, behavior: "dive", score: 2 },
  sand_snake:      { hp: 2, speed: 0.8,  damage: 1, w: 16, h: 10, behavior: "jumper", score: 1 },
  mummy:           { hp: 5, speed: 0.3,  damage: 2, w: 12, h: 22, behavior: "melee", score: 2 },
  pirate:          { hp: 4, speed: 0.6,  damage: 1, w: 12, h: 20, behavior: "melee", score: 1 },
  pirate_gunner:   { hp: 3, speed: 0.3,  damage: 1, w: 12, h: 20, behavior: "ranged", ranged: true, score: 1 },
  pirate_captain:  { hp: 8, speed: 0.7,  damage: 2, w: 16, h: 24, behavior: "charger", score: 5 }
};
