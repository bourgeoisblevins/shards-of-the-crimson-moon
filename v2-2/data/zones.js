// Zone / boss / fragment wiring. Place names match LORE.md arena assignments.
// Saffrika (northern jungle) is retired from travel since shards-v5: its level,
// tiles, parallax, and music stay in the build but no zone points at them.
// Order path: 6 arenas (unlock 0..5). Cult path: 5 arenas (unlock 0..4); Jeriah holds the Heart.
// Geometry is authored in data/levels.js (stepped terraces, one altar/focal per screen).
window.SHARDS = window.SHARDS || {};
window.SHARDS.zones = [
  {
    id: "vespera",
    bossId: "jeriah",
    fragment: "heart",
    palette: "jeriah",
    orderUnlock: 0,
    // Cult path: Jeriah is the quest-giver and already holds the Heart.
    // Vespera is Order-only; the Heart counts as gathered (held, not claimed).
    cultHeldBy: "jeriah",
    cultUnlock: null
  },
  {
    id: "deep",
    bossId: "azmardus",
    fragment: "eye",
    palette: "azmardus",
    orderUnlock: 1,
    cultUnlock: 0
  },
  {
    id: "aurelion",
    bossId: "nezradeem",
    fragment: "bone",
    palette: "nezradeem",
    orderUnlock: 2,
    cultUnlock: 1
  },
  {
    id: "deepLairs",
    bossId: "orchalsius",
    fragment: "blaze",
    palette: "orchalsius",
    orderUnlock: 3,
    cultUnlock: 2
  },
  {
    // The Silent Dark Apostle's arena (Ryan, shards-v5). Replaces Saffrika as
    // the Shadow zone on both paths, same unlock slot.
    id: "monastery",
    bossId: "silent",
    fragment: "shadow",
    palette: "silent",
    orderUnlock: 4,
    cultUnlock: 3
  },
  {
    id: "sakura",
    bossId: "gladius",
    fragment: "claw",
    palette: "gladius",
    orderUnlock: 5,
    cultUnlock: 4
  }
];

window.SHARDS.fragmentOrder = ["heart", "eye", "bone", "blaze", "shadow", "claw"];

// Retired zones: kept on disk, never offered in travel. Saves from before v5
// map their progress to the zone listed here (engine normalizeSave).
window.SHARDS.retiredZones = { saffrika: "monastery" };
