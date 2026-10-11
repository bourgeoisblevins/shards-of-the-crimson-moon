window.SHARDS = window.SHARDS || {};
// Guide order difficulty ramp. Tuned so an average clear is ~1–3 tries.
window.SHARDS.bosses = {
  jeriah:     { hp: 14, speed: 0.55, size: [18, 40], core: 0.15, rest: 58, phase2At: 0.62, phase3At: 0.3, moves: ["charge","slam","cleave","guard"], moves2: ["charge","slam","cleave","guard","command"], moves3: ["charge","heartburst","slam","guard","cleave"], telegraph: 36 },
  azmardus:   { hp: 16, speed: 0.4,  size: [16, 42], core: 0.15, rest: 54, phase2At: 0.65, phase3At: 0.3, staffEye: true, moves: ["bolt","teleport","orb","decoys"], moves2: ["bolt","decoys","orb","barrage","gaze"], moves3: ["decoys","barrage","gaze","orb","teleport"], telegraph: 40 },
  nezradeem:  { hp: 18, speed: 0.48, size: [18, 46], core: 0.15, rest: 52, phase2At: 0.68, phase3At: 0.34, moves: ["arc","spikes","bonewall","limbslam"], moves2: ["arc","spikes","bonewall","spiral","limbslam"], moves3: ["arc","bonewall","spiral","limbslam","regrow"], telegraph: 40 },
  orchalsius: { hp: 20, speed: 0.52, size: [30, 56], core: 0.22, rest: 50, phase2At: 0.66, phase3At: 0.3, moves: ["pillar","bolt","wave","ramcharge"], moves2: ["pillar","bolt","wave","erupt","ramcharge","flood"], moves3: ["ramcharge","flood","erupt","pillar","ramcharge"], telegraph: 36 },
  silent:     { hp: 18, speed: 0.78, size: [16, 38], core: 0.12, rest: 46, phase2At: 0.6, phase3At: 0.28, moves: ["dash","fade","slash"], moves2: ["dash","fade","slash","mirror","snuff"], moves3: ["dash","mirror","volley","snuff","fade"], telegraph: 32 },
  gladius:    { hp: 24, speed: 0.62, size: [36, 46], core: 0.22, rest: 48, phase2At: 0.66, phase3At: 0.35, moves: ["leap","swipe","howl","frostgrow"], moves2: ["leap","swipe","howl","frenzy","frostgrow","icepillar"], moves3: ["leap","frenzy","icepillar","yetirage","howl"], telegraph: 34 },
  guardian:   { hp: 34, speed: 0, size: [84, 70], core: 0.2, rest: 46, phase2At: 0.66, phase3At: 0.33, moves: ["gd_strike", "gd_spit", "gd_sweep"], moves2: ["gd_strike", "gd_sweep", "gd_glyphs", "gd_spit"], moves3: ["gd_strike", "gd_glyphs", "gd_sweep", "gd_coil"], telegraph: 36 },
  noah:       { hp: 52, speed: 0.55, size: [16, 46], core: 0.2, rest: 42, phase2At: 0.5, moves: ["nj_lance", "nj_smite", "nj_halo"], moves2: ["nj_lance", "nj_smite", "nj_halo", "nj_judgment"], telegraph: 34 },
  blevins:    { hp: 78, speed: 0.6, size: [22, 52], core: 0.15, rest: 40, phase2At: -1, moves: ["bl_lance","bl_orbs","bl_shardrain"], moves2: ["bl_lance","bl_orbs","bl_shardrain"], telegraph: 34 }
};
// v2: frame set per move. atkN in the boss sheets follows the moves2 order.
window.SHARDS.bossMoveIndex = {
  jeriah: { charge: 1, slam: 2, cleave: 3, rain: 4 }, azmardus: { bolt: 1, teleport: 2, orb: 3, barrage: 4 }, nezradeem: { arc: 1, spikes: 2, bonewall: 3, spiral: 4 },
  orchalsius: { pillar: 1, bolt: 2, wave: 3, erupt: 4 }, silent: { dash: 1, fade: 2, slash: 3, mirror: 4 }, gladius: { leap: 1, swipe: 2, howl: 3, frenzy: 4 }, blevins: {}, guardian: {}, noah: {}
};
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
