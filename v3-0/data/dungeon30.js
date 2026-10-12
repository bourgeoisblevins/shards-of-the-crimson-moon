// v3.0: the Dungeon (Delve mode). A seeded generator that assembles floors from the existing platform kinds
// (ground, one-way ledges), spike hazards and the existing enemy table. Pure: no engine access, usable from node tests.
window.SHARDS = window.SHARDS || {};
(function () {
  const G = 330, H = 400, STEP = 34, JUMPGAP = 40; // floor line, level height, ledge rise (jump apex is ~43 px), widest pit (reach checked)
  function rng(seed) { let a = (seed >>> 0) || 1; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const TIERS = {
    1: ["ash_walker", "ruin_archer", "warped_hog", "rift_spitter", "hollow_sentinel", "dust_wraith", "ember_crawler", "blaze_imp", "canopy_stalker", "vine_spitter", "frost_wolf", "ice_archer", "sand_snake", "sewer_skeleton", "plains_crow", "plains_wolf"],
    2: ["ash_griffin", "deep_pig", "mummy", "pirate", "pirate_gunner", "monk_bell"],
    3: ["monk_staff", "monk_brawler", "pirate_captain"]
  };
  // themes: an existing zone's background and tile art. swaps: palette filters laid over the stage art (all colours come from the game palette at runtime)
  const THEMES = [
    { id: "vespera", ambient: "ember", dark: false }, { id: "deep", ambient: "purple", dark: true }, { id: "aurelion", ambient: "dust", dark: false },
    { id: "deepLairs", ambient: "ember", dark: false }, { id: "monastery", ambient: "monastery", dark: false }, { id: "sakura", ambient: "snow", dark: false }, { id: "sandria", ambient: "dust", dark: false }
  ];
  const SWAPS = ["none", "ember", "gold", "verdigris", "violet", "frost", "ash"];
  const SWAPHEX = { ember: "#8B1E2D", gold: "#C9A227", verdigris: "#4F7A3A", violet: "#6A2C5E", frost: "#4E6470", ash: "#6B6458" }; // all from data/palettes.js
  const BOSS_ZONES = ["vespera", "deep", "aurelion", "deepLairs", "monastery", "sakura"];
  const isBoss = (d) => d % 5 === 0, isElite = (d) => d % 5 === 3;
  const stats = (t) => (window.SHARDS.enemyStats && window.SHARDS.enemyStats[t]) || { w: 12, h: 20, hp: 3 };
  function allowed(depth) { return [].concat(TIERS[1], depth >= 3 ? TIERS[2] : [], depth >= 6 ? TIERS[3] : []); }
  function enemyCount(depth) { return Math.min(14, 3 + Math.floor(depth * 1.1)); }
  const hpMul = (d) => 1 + 0.12 * (d - 1);
  const dmgAdd = (d) => (d >= 11 ? 2 : d >= 6 ? 1 : 0);
  function gen(seed, depth) {
    const R = rng((seed * 2654435761 + depth * 40503) >>> 0), ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = (a) => a[Math.floor(R() * a.length)];
    const theme = THEMES[(depth - 1 + ri(0, THEMES.length - 1)) % THEMES.length], swap = SWAPS[ri(0, SWAPS.length - 1)];
    const plats = [], haz = [], slots = [], spots = []; // slots: places an enemy may stand {x, top}
    const addGround = (x, w) => { plats.push({ x, y: G, w, h: H - G, k: "ground" }); for (let sx = x + 12; sx <= x + w - 12; sx += 24) spots.push({ x: sx, y: G }); for (let sx = x + 30; sx < x + w - 30; sx += 28) slots.push({ x: sx, top: G }); };
    const addLedge = (x, y, w) => { plats.push({ x, y, w, h: 12, oneWay: true, k: "ledge" }); for (let sx = x + 10; sx <= x + w - 10; sx += 20) spots.push({ x: sx, y }); slots.push({ x: x + w / 2, top: y }); };
    const target = Math.min(2400, 1000 + depth * 60), spawnX = 40;
    let x = 0;
    addGround(0, 260); x = 260;
    let chunks = 0;
    while (x < target) {
      const t = R(), w = ri(200, 320);
      if (t < 0.22 && chunks > 0) { // a pit (jumpable) between two floors
        const gap = ri(26, JUMPGAP); haz.push({ x: x + 2, y: H - 16, w: gap - 4, h: 12, kind: "spike" }); x += gap; addGround(x, w); x += w;
      } else if (t < 0.40) { // spikes on the floor
        addGround(x, w); const sw = ri(24, 40), sx = x + ri(50, Math.max(51, w - sw - 50)); haz.push({ x: sx, y: G - 12, w: sw, h: 12, kind: "spike" }); x += w;
      } else if (t < 0.68) { // a stair of one-way ledges up to a small landing
        addGround(x, w); const n = ri(2, 4); let lx = x + 30;
        for (let i = 0; i < n; i++) { addLedge(lx, G - STEP * (i + 1), 56); lx += 44; }
        x += Math.max(w, lx - x + 60);
        if (plats[plats.length - 1].k === "ledge") { const last = plats[plats.length - 1]; if (last.x + last.w > x) x = last.x + last.w + 20; }
        // fill any floor still missing under the stair
        const lastG = plats.filter((p) => p.k === "ground").pop(); if (lastG.x + lastG.w < x) { lastG.w = x - lastG.x; }
      } else { addGround(x, w); x += w; }
      chunks++;
    }
    // final chamber: flat, with the exit at its far end
    const chamberX = x, chW = 340;
    const lastG = plats.filter((p) => p.k === "ground").pop();
    if (lastG.x + lastG.w >= chamberX - 1) { lastG.w = chamberX + chW - lastG.x; } else addGround(chamberX, chW);
    for (let i = plats.length - 1; i > 0; i--) { // one slab per run of floor: no seams between chunks
      const a = plats[i];
      if (a.k !== "ground") continue;
      const b = plats.find((q, j) => j !== i && q.k === "ground" && q.x + q.w === a.x);
      if (b) { b.w += a.w; plats.splice(i, 1); }
    }
    spots.length = 0; slots.length = 0; // rebuild after extending the last floor
    for (const p of plats) { if (p.k === "ground") { for (let sx = p.x + 12; sx <= p.x + p.w - 12; sx += 24) spots.push({ x: sx, y: p.y }); for (let sx = p.x + 30; sx < p.x + p.w - 30; sx += 28) slots.push({ x: sx, top: p.y }); } else { for (let sx = p.x + 10; sx <= p.x + p.w - 10; sx += 20) spots.push({ x: sx, y: p.y }); slots.push({ x: p.x + p.w / 2, top: p.y }); } }
    const W = chamberX + chW, exit = { x: W - 44, y: G - 48, w: 24, h: 48 };
    // enemies
    const n = enemyCount(depth), pool = allowed(depth), kinds = [];
    for (let i = 0; i < Math.min(5, 3 + Math.floor(depth / 4)); i++) { const k = pick(pool); if (!kinds.includes(k)) kinds.push(k); }
    const elite = isElite(depth), enemies = [], used = [];
    const free = slots.filter((s) => s.x > 220 && s.x < chamberX - 20 || (s.x >= chamberX && s.x < W - 90 && !elite));
    for (let i = 0; i < n && free.length; i++) {
      const s = free.splice(Math.floor(R() * free.length), 1)[0], t = pick(kinds), st = stats(t);
      if (used.some((u) => Math.abs(u - s.x) < 22 && false)) continue;
      enemies.push({ type: t, x: Math.round(s.x - st.w / 2), y: s.top - st.h, hpMul: hpMul(depth), dmgAdd: dmgAdd(depth) }); used.push(s.x);
    }
    const doors = [];
    if (elite) { // mini boss in the chamber behind a gate that shuts when the player is inside (the v2.9 rule)
      const t = pick(allowed(Math.max(depth, 4)).filter((k) => stats(k).hp >= 3)), st = stats(t);
      doors.push({ id: "dg-gate", kind: "elite", x: chamberX - 18, y: G - 48 });
      enemies.push({ type: t, x: chamberX + 150, y: G - st.h, elite: true, id: "dg-elite", room: { x: chamberX + 20, y: 0, w: chW - 20, h: H }, hpMul: hpMul(depth), dmgAdd: dmgAdd(depth) });
    }
    return {
      w: W, h: H, bg: theme.id, kind: "traverse", zone: theme.id, title: "Dungeon - Floor " + depth, ambient: theme.ambient, tiled: true, dark: !!theme.dark,
      spawn: { x: spawnX, y: G - 20 }, platforms: plats, hazards: haz, enemies, doors,
      dungeon: { seed, depth, exit, spots, swap, theme: theme.id, elite, chamberX }
    };
  }
  window.SHARDS.dungeon30 = { gen, G, H, THEMES, SWAPS, SWAPHEX, TIERS, BOSS_ZONES, isBoss, isElite, enemyCount, hpMul, dmgAdd, allowed, rng };
})();
