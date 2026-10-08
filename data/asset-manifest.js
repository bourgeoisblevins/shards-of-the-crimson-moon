// Wired to Brand Ambassador delivery (assets/MANIFEST.md). Do not rename Brand PNGs.
window.SHARDS = window.SHARDS || {};
window.SHARDS.ASSET_ROOT = "assets/";

window.SHARDS.assetManifest = (function () {
  const S = (path, frames, fw, fh) => ({ path, kind: "strip", fw, fh, frames });
  const G = (path, fw, fh, cols, rows, names) => ({ path, kind: "grid", fw, fh, cols, rows, frames: names });
  const I = (path, fw, fh) => ({ path, kind: "image", fw, fh, frames: ["0"] });

  const tileNames = Array.from({ length: 32 }, (_, i) => "tile" + i);
  const list = [];

  list.push(I("wordmark.png", 170, 47));

  // Players — Brand (extra dodge/skill frames soft-detected from sheet width)
  const playerFrames = ["idle","walk0","walk1","walk2","walk3","jump","fall","strike0","strike1","strike2","hurt","death","dodge0","dodge1","skill0","skill1"];
  list.push(S("player-order.png", playerFrames, 16, 24));
  list.push(S("player-cult.png", playerFrames, 16, 24));
  window.SHARDS.playerFrameNamesFull = playerFrames;

  // Guides
  // Order: Ryan. Cult: General Jeriah is the quest-giver (boss-jeriah.png idle +
  // portrait-boss-jeriah.png). The old unnamed-Mentor sheet is only used, palette-
  // shifted, for the background acolytes in the hideout (levels.js cultHub npcs).
  list.push(S("guide-ryan.png", ["idle","talk"], 16, 24));
  list.push(S("guide-cult-mentor.png", ["idle","talk"], 16, 24));
  list.push(I("portrait-ryan.png", 32, 32));
  list.push(I("portrait-cult-mentor.png", 32, 32));

  // Bosses — base 7; engine expands to 14 from sheet width when present
  const bossFrames7 = ["idle","walk0","walk1","windup","active","hurt","defeat"];
  const bossFrames14 = bossFrames7.concat(["windup1","active1","windup2","active2","windup3","active3","phase2"]);
  window.SHARDS.bossFrameNames14 = bossFrames14;
  list.push(S("boss-jeriah.png", bossFrames7, 18, 28));
  list.push(S("boss-azmardus.png", bossFrames7, 16, 28));
  list.push(S("boss-nezradeem.png", bossFrames7, 18, 28));
  list.push(S("boss-orchalsius.png", bossFrames7, 20, 30));
  list.push(S("boss-silent.png", bossFrames7, 14, 26));
  list.push(S("boss-gladius.png", bossFrames7, 22, 30));

  // Regular enemies (Brand: 3 shared types — mapped per zone; soft sheets preferred)
  const enemyFrames = ["idle","walk0","walk1","hurt","death"];
  list.push(S("enemy-cult-thrall.png", ["idle","walk0","walk1","hurt","death"], 16, 24));
  list.push(S("enemy-bone-spawn.png", ["idle","walk0","walk1","hurt","death"], 16, 24));
  list.push(S("enemy-ember-hound.png", ["idle","walk0","walk1","hurt","death"], 16, 24));
  // Dedicated zone enemies (Brand ART_GAPS)
  const enemy6 = ["idle","walk0","walk1","attack","hurt","death"];
  list.push(S("enemy-ruin-archer.png", enemy6, 16, 24));
  list.push(S("enemy-rift-spitter.png", enemy6, 16, 24));
  list.push(S("enemy-dust-wraith.png", enemy6, 16, 24));
  list.push(S("enemy-blaze-imp.png", enemy6, 16, 24));
  list.push(S("enemy-vine-spitter.png", enemy6, 16, 24));
  list.push(S("enemy-frost-wolf.png", enemy6, 16, 24));
  list.push(S("enemy-ice-archer.png", enemy6, 16, 24));
  // Mountain Monastery (tools/make_monastery.py): bound monk shades
  list.push(S("enemy-monastery-shade.png", enemy6, 16, 24));
  list.push(S("vfx-skill-order.png", ["fx0","fx1","fx2","fx3"], 16, 16));
  list.push(S("vfx-skill-cult.png", ["fx0","fx1","fx2","fx3"], 16, 16));
  list.push(I("icons/heal.png", 8, 8));
  list.push(I("icons/icon-32.png", 32, 32));
  list.push(I("ui-dialogue-frame.png", 288, 48));
  for (const id of ["jeriah","azmardus","nezradeem","orchalsius","silent","gladius"]) {
    list.push(I("portrait-boss-" + id + ".png", 32, 32));
  }
  window.SHARDS.enemyFrameNamesFull = enemyFrames;

  // Tilesets — 8×4 grid
  for (const t of ["plains","cult-hideout","vespera","deep","aurelion","saffrika","monastery","sakura"]) {
    list.push(G("tiles-" + t + ".png", 16, 16, 8, 4, tileNames));
  }
  list.push(I("tile-altar-order.png", 16, 16));
  list.push(I("tile-altar-cult.png", 16, 16));
  list.push(I("tile-hazard-ember.png", 16, 16));
  // Mountain Monastery dressing (world-space images drawn behind platforms; levels.js dressing)
  list.push(I("dress-monastery-hall.png", 400, 180));
  list.push(I("dress-monastery-stele.png", 24, 40));
  list.push(I("dress-monastery-bell.png", 40, 56));
  list.push(I("dress-monastery-shrine.png", 40, 56));
  list.push(I("dress-monastery-arch.png", 64, 80));

  // UI / VFX Brand
  list.push(S("ui-hp.png", ["filled","empty"], 4, 4));
  list.push(S("ui-fragments.png", ["heart","eye","bone","blaze","shadow","claw"], 8, 8));
  list.push(I("ui-panel.9.png", 12, 12));
  list.push(S("vfx-slash.png", ["slash0","slash1","slash2"], 16, 16));
  list.push(S("vfx-hit.png", ["hit0","hit1","hit2"], 8, 8));
  list.push(S("vfx-claim.png", ["claim0","claim1","claim2","claim3"], 16, 16));

  list.push(I("icons/icon-192.png", 192, 192));
  list.push(I("icons/icon-512.png", 512, 512));
  // v6: retired, kept on disk; the touch layer uses ui/touch-pad.png
  // list.push(S("ui/touch-buttons.png", ["left","right","jump","strike","dodge","skill","pause"], 24, 24));
  // v6 mobile layer (tools/make_touch.py): 28x28 plates, idle + pressed ("-on")
  (function () {
    const n = ["left","right","jump","strike","dodge","skill","pause","ok"];
    list.push(S("ui/touch-pad.png", n.concat(n.map(x => x + "-on")), 28, 28));
  })();
  list.push(I("ui/rotate-device.png", 72, 40));
  list.push(I("icons/icon-180.png", 180, 180));

  // Parallax — Brand 960×180 (sky|far|mid)
  // saffrika stays loaded but is retired from travel (Shadow moved to the monastery)
  for (const z of ["orderHub","cultHub","vespera","deep","aurelion","deepLairs","saffrika","monastery","monastery-hall","sakura"]) {
    list.push({ path: "parallax/" + z + ".png", kind: "parallax", fw: 320, fh: 180, frames: ["sky","far","mid"] });
  }

  return list;
})();

// Soft-optional Brand drops (loaded if present; not required by audit)
window.SHARDS.optionalAssets = [
  "tiles-deep-lairs.png",
  "tile-hazard-spike.png"
];

window.SHARDS.enemySheet = {
  ash_walker: "enemy-cult-thrall.png", ruin_archer: "enemy-ruin-archer.png",
  warped_hog: "enemy-ember-hound.png", rift_spitter: "enemy-rift-spitter.png",
  hollow_sentinel: "enemy-bone-spawn.png", dust_wraith: "enemy-dust-wraith.png",
  ember_crawler: "enemy-ember-hound.png", blaze_imp: "enemy-blaze-imp.png",
  canopy_stalker: "enemy-bone-spawn.png", vine_spitter: "enemy-vine-spitter.png",
  frost_wolf: "enemy-frost-wolf.png", ice_archer: "enemy-ice-archer.png",
  monastery_shade: "enemy-monastery-shade.png"
};
window.SHARDS.enemySheetSoft = {};

window.SHARDS.tilesetFor = {
  orderHub: "tiles-plains.png", cultHub: "tiles-cult-hideout.png",
  vespera: "tiles-vespera.png", deep: "tiles-deep.png", aurelion: "tiles-aurelion.png",
  deepLairs: "tiles-deep-lairs.png",
  saffrika: "tiles-saffrika.png", monastery: "tiles-monastery.png", sakura: "tiles-sakura.png"
};
window.SHARDS.tilesetFallback = { "tiles-deep-lairs.png": "tiles-deep.png" };
window.SHARDS.spikeTile = "tile-hazard-spike.png";

window.SHARDS.bossSheet = {
  jeriah: { path: "boss-jeriah.png", fw: 18, fh: 28 },
  azmardus: { path: "boss-azmardus.png", fw: 16, fh: 28 },
  nezradeem: { path: "boss-nezradeem.png", fw: 18, fh: 28 },
  orchalsius: { path: "boss-orchalsius.png", fw: 20, fh: 30 },
  silent: { path: "boss-silent.png", fw: 14, fh: 26 },
  gladius: { path: "boss-gladius.png", fw: 22, fh: 30 }
};

window.SHARDS.enemyTypes = {
  vespera: ["ash_walker","ruin_archer"], deep: ["warped_hog","rift_spitter"],
  aurelion: ["hollow_sentinel","dust_wraith"], deepLairs: ["ember_crawler","blaze_imp"],
  saffrika: ["canopy_stalker","vine_spitter"], monastery: ["monastery_shade"],
  sakura: ["frost_wolf","ice_archer"]
};

// Far-layer windows of the monastery (x, y in the 320-wide far layer). A faint
// light moves between them (engine drawWindowLight). Mirrors FAR_WINDOWS in
// tools/make_monastery.py.
window.SHARDS.parallaxLights = {
  monastery: [[106,107],[114,107],[126,107],[134,107],[110,94],[118,94],[130,94],
              [112,83],[120,83],[128,83],[116,73],[124,73]]
};

// Move index 0/1/2 → windupN/activeN when 14-frame sheets present
window.SHARDS.bossMoveIndex = {
  jeriah: { charge:1, slam:2, cleave:3, rain:1 },
  azmardus: { bolt:1, teleport:2, orb:3, barrage:1 },
  nezradeem: { arc:1, spikes:2, bonewall:3, spiral:2 },
  orchalsius: { pillar:1, bolt:2, wave:3, erupt:1 },
  silent: { dash:1, fade:2, slash:3, mirror:2 },
  gladius: { leap:1, swipe:2, howl:3, frenzy:1 }
};

window.SHARDS.playerFrame = {
  idle: "idle", run: "walk0", walk0: "walk0", walk1: "walk1", walk2: "walk2", walk3: "walk3",
  jump: "jump", fall: "fall",
  attack1: "strike0", attack2: "strike1", attack3: "strike2",
  strike0: "strike0", strike1: "strike1", strike2: "strike2",
  dodge: "dodge0", dodge0: "dodge0", dodge1: "dodge1",
  skill: "skill0", skill0: "skill0", skill1: "skill1", hurt: "hurt", death: "death"
};
window.SHARDS.bossFrame = {
  idle: "idle", move: "walk0", walk0: "walk0", walk1: "walk1",
  atk1_tele: "windup1", atk2_tele: "windup2", atk3_tele: "windup3",
  atk1_active: "active1", atk2_active: "active2", atk3_active: "active3",
  windup: "windup", active: "active", phase2: "phase2", hurt: "hurt", death: "defeat", defeat: "defeat"
};
window.SHARDS.enemyFrame = {
  idle: "idle", walk: "walk0", walk0: "walk0", walk1: "walk1", attack: "attack", hurt: "hurt", death: "death"
};
