// v3.0: the Dungeon (Delve mode). A seeded generator that assembles floors from the existing platform kinds
// (ground, one-way ledges), spike hazards and the existing enemy table. Pure: no engine access, usable from node tests.
window.SHARDS = window.SHARDS || {};
(function () {
  const G = 330, H = 400, STEP = 34, JUMPGAP = 40; // floor line, level height, ledge rise (jump apex is ~43 px), widest pit (reach checked)
  function rng(seed) { let a = (seed >>> 0) || 1; return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const TIERS = {
    1: ["ash_walker", "ruin_archer", "warped_hog", "rift_spitter", "hollow_sentinel", "dust_wraith", "ember_crawler", "blaze_imp", "frost_wolf", "ice_archer", "sand_snake", "sewer_skeleton", "plains_crow", "plains_wolf"],
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
  const FB = 560, HH = 640, STEPY = 34, MINFY = FB - 300;
  const isRest = (d) => d % 4 === 2 && d % 5 !== 0;
  const restKind = (d) => (((d - 2) / 4) | 0) % 2 === 0 ? "merchant" : "enchanter";
  function finish(L, plats, haz, enemyDefs) { return L; }
  // v3.1: vertical floors. The route climbs and drops between floor levels (stairs of one-way ledges, zig-zag towers, hook steps), forks into a
  // low and a high route, and crosses pits with swing rings, moving platforms, crumbling or blinking platforms; blades and falling masonry guard floors.
  function gen(seed, depth, opts) {
    const R = rng((seed * 2654435761 + depth * 40503) >>> 0), ri = (a, b) => a + Math.floor(R() * (b - a + 1)), pick = (a) => a[Math.floor(R() * a.length)];
    const theme = THEMES[(depth - 1 + ri(0, THEMES.length - 1)) % THEMES.length], swap = SWAPS[ri(0, SWAPS.length - 1)];
    const plats = [], haz = [], swings = [], ledges = [], gaps = [], movers = [], crumbles = [], blinks = [], blades = [], fallers = [], kinds = [];
    const rest = isRest(depth);
    let x = 0, fy = FB;
    const ground = (gx, w, y) => { plats.push({ x: gx, y: y == null ? fy : y, w, h: HH - (y == null ? fy : y), k: "ground" }); };
    const ledge = (lx, ly, w) => { plats.push({ x: lx, y: ly, w, h: 12, oneWay: true, k: "ledge" }); };
    const stairs = (x0, n) => { let lx = x0 + 30; for (let i = 0; i < n; i++) { ledge(lx, fy - STEPY * (i + 1), 56); lx += 44; } return lx - 44; };
    const spike = (sx, w) => haz.push({ x: sx, y: fy - 12, w, h: 12, kind: "spike" });
    const pitSpikes = (gx, w) => haz.push({ x: gx + 2, y: HH - 16, w: w - 4, h: 12, kind: "spike" });
    const has = (t) => kinds.includes(t);
    const T = {
      flat() { const w = ri(200, 320); ground(x, w); x += w; },
      spikes() { const w = ri(220, 320), sw = ri(24, 40); ground(x, w); spike(x + ri(50, Math.max(51, w - sw - 50)), sw); x += w; },
      pit() { const gap = ri(26, JUMPGAP), w = ri(140, 220); ground(x, 100); x += 100; pitSpikes(x, gap); x += gap; ground(x, w); x += w; },
      climb() { const n = ri(2, 4); if (fy - STEPY * n < MINFY) return T.flat(); ground(x, 100); const lx = stairs(x, n), xg = lx + 40; ground(x + 100, Math.max(0, xg - x - 100)); fy -= STEPY * n; x = xg; ground(x, ri(160, 220)); x += ri(160, 220); },
      drop() { const d = pick([1, 2, 3]) * STEPY; if (fy + d > FB) return T.flat(); const w = ri(160, 240); ground(x, 80); x += 80; fy += d; ground(x, w); x += w; },
      tower() { const n = pick([4, 6]); if (fy - STEPY * n < MINFY) return T.climb(); ground(x, 100); for (let i = 0; i < n; i++) ledge(x + 20 + (i % 2) * 64, fy - STEPY * (i + 1), 56); const xg = x + 84 + 46; ground(x + 100, Math.max(0, xg - x - 100)); fy -= STEPY * n; x = xg; const w = ri(180, 240); ground(x, w); x += w; },
      branch() { // a low route (spikes) and a high route (ledges and a crumbling plank) over the same span
        const S = 400; if (fy - 102 < MINFY) return T.flat();
        ground(x, S); spike(x + 150, 32); spike(x + 270, 32);
        ledge(x + 20, fy - 34, 56); ledge(x + 64, fy - 68, 56); ledge(x + 108, fy - 102, 56);
        crumbles.push({ x: x + 176, y: fy - 102, w: 44, delay: 44, respawn: 170 }); ledge(x + 232, fy - 102, 80); ledge(x + 336, fy - 102, 60);
        x += S; ground(x, 60); x += 60;
      },
      swing() { const gap = ri(120, 160); ground(x, 110); const lx = x + 110; pitSpikes(lx, gap); const w = ri(150, 220); ground(lx + gap, w);
        swings.push({ x: lx + Math.round(gap / 2), y: fy - 74 }); gaps.push({ id: "dg-" + gaps.length, swing: swings.length - 1, req: true, from: { x: lx - 22, y: fy - 20 }, dir: 1, land: { x: lx + gap + 6, w: 30, y: fy - 20 } });
        x = lx + gap + w; },
      mover() { const gap = ri(90, 130), w = ri(150, 220); ground(x, 100); const lx = x + 100; pitSpikes(lx, gap); ground(lx + gap, w); movers.push({ x: lx - 4, y: fy, w: 52, ax: gap - 52 + 8, ay: 0, per: 240, ph: 0 }); x = lx + gap + w; },
      crumble() { const n = ri(2, 3), gap = 16 + n * 44 + (n - 1) * 14 + 16, w = ri(150, 220); ground(x, 100); const lx = x + 100; pitSpikes(lx, gap); ground(lx + gap, w); for (let i = 0; i < n; i++) crumbles.push({ x: lx + 16 + i * 58, y: fy, w: 44, delay: 44, respawn: 170 }); x = lx + gap + w; },
      blink() { const n = ri(2, 3), gap = 16 + n * 44 + (n - 1) * 14 + 16, w = ri(150, 220); ground(x, 100); const lx = x + 100; pitSpikes(lx, gap); ground(lx + gap, w); for (let i = 0; i < n; i++) blinks.push({ x: lx + 16 + i * 58, y: fy, w: 44, on: 200, off: 40, ph: i * 70 }); x = lx + gap + w; },
      blades() { const w = ri(300, 380); ground(x, w); blades.push({ x: x + 110, y: fy - 112, len: 92, speed: 0.012, ph: 0, arc: 1.15 }); if (w > 330) blades.push({ x: x + 250, y: fy - 112, len: 92, speed: 0.012, ph: 0.5, arc: 1.15 }); x += w; },
      fallers() { const w = ri(260, 340); ground(x, w); fallers.push({ x: x + 100, y: fy - 130, kind: "masonry", range: 30, w: 14, h: 16 }, { x: x + 200, y: fy - 130, kind: "masonry", range: 30, w: 14, h: 16 }); x += w; },
      hook() { if (fy - 84 < MINFY) return T.flat(); ground(x, 190); ledges.push({ x: x + 190, y: fy - 84, w: 56 }); x += 190; fy -= 84; const w = ri(180, 240); ground(x, w); x += w; }
    };
    const W8 = [["flat", 3, 1], ["spikes", 2, 1], ["pit", 2, 1], ["climb", 2, 1], ["drop", 1.5, 1], ["tower", 1.5, 3], ["branch", 1.5, 3], ["swing", 1.5, 2], ["mover", 1.2, 3], ["crumble", 1.5, 2], ["blink", 1, 5], ["blades", 1.5, 4], ["fallers", 1, 5], ["hook", 1, 2]];
    const elite = isElite(depth), enemies = [], doors = [], pool = allowed(depth), types = [];
    let chamberX, W, exit;
    if (rest) {
      W = 620; ground(0, W); chamberX = 0; fy = FB; exit = { x: W - 44, y: fy - 48, w: 24, h: 48 };
    } else {
      const count = Math.min(12, ri(4, 6) + Math.floor(depth / 2)), list = [];
      for (let i = 0; i < count; i++) { const av = W8.filter((q) => depth >= q[2]); let t = R() * av.reduce((a, q) => a + q[1], 0), c = av[0][0]; for (const q of av) { if (t < q[1]) { c = q[0]; break; } t -= q[1]; } list.push(c); }
      if (depth === 1) list[ri(1, count - 2)] = "hook"; else { list[ri(1, count - 2)] = "swing"; if (depth >= 4) list[ri(1, count - 2)] = "hook"; }
      ground(0, 260); x = 260;
      for (const c of list) { const before = x; T[c](); kinds.push(c); if (x === before) { T.flat(); } }
      chamberX = x; const chW = 340; ground(x, chW); W = x + chW;
      exit = { x: W - 44, y: fy - 48, w: 24, h: 48 };
    }
    // merge touching slabs of one level
    for (let i = plats.length - 1; i > 0; i--) { const a = plats[i]; if (a.k !== "ground" || a.w <= 0) { if (a.k === "ground" && a.w <= 0) plats.splice(i, 1); continue; } const b = plats.find((q, j) => j !== i && q.k === "ground" && q.y === a.y && q.x + q.w === a.x); if (b) { b.w += a.w; plats.splice(i, 1); } }
    const spots = [], slots = [];
    for (const p of plats) {
      if (p.k === "ground") { for (let sx = p.x + 12; sx <= p.x + p.w - 12; sx += 24) spots.push({ x: sx, y: p.y }); for (let sx = p.x + 30; sx < p.x + p.w - 30; sx += 28) slots.push({ x: sx, top: p.y }); }
      else { for (let sx = p.x + 10; sx <= p.x + p.w - 10; sx += 20) spots.push({ x: sx, y: p.y }); slots.push({ x: p.x + p.w / 2, top: p.y }); }
    }
    // braziers (decor) on floors
    const braz = [{ x: 90, y: FB }, { x: exit.x - 34, y: exit.y + 48 }];
    for (const p of plats) if (p.k === "ground" && p.w > 200 && p.x > 300 && braz.length < 7 && R() < 0.5) braz.push({ x: p.x + Math.round(p.w * 0.4), y: p.y });
    if (!rest) {
      const n = enemyCount(depth);
      for (let i = 0; i < Math.min(5, 3 + Math.floor(depth / 4)); i++) { const k = pick(pool); if (!types.includes(k)) types.push(k); }
      const blocked = (sl) => haz.some((h) => h.kind === "spike" && Math.abs(h.y + 12 - sl.top) < 4 && sl.x > h.x - 14 && sl.x < h.x + h.w + 14) || blades.some((b) => Math.abs(sl.x - b.x) < 60 && Math.abs(sl.top - (b.y + 112)) < 4);
      const free = slots.filter((s) => s.x > 220 && !blocked(s) && (!elite || s.x < chamberX - 20));
      for (let i = 0; i < n && free.length; i++) { const s = free.splice(Math.floor(R() * free.length), 1)[0], t = pick(types), st = stats(t); enemies.push({ type: t, x: Math.round(s.x - st.w / 2), y: s.top - st.h, hpMul: hpMul(depth), dmgAdd: dmgAdd(depth) }); }
      if (opts && opts.double) { const k = enemies.length; for (let i = 0; i < k; i++) { const e = enemies[i]; enemies.push(Object.assign({}, e, { x: e.x + 14 })); } }   // v3.2 modifier: Double Enemies (a twin beside each foe)
      if (elite) {
        const t = pick(allowed(Math.max(depth, 4)).filter((k) => stats(k).hp >= 3)), st = stats(t);
        doors.push({ id: "dg-gate", kind: "elite", x: chamberX - 18, y: fy - 48 });
        enemies.push({ type: t, x: chamberX + 150, y: fy - st.h, elite: true, id: "dg-elite", room: { x: chamberX + 20, y: 0, w: 320, h: HH }, hpMul: hpMul(depth), dmgAdd: dmgAdd(depth) });
      }
    }
    const kind = rest ? restKind(depth) : null;
    return {
      w: W, h: HH, bg: theme.id, kind: "traverse", zone: theme.id, title: (rest ? (kind === "merchant" ? "Dungeon - Merchant, Floor " : "Dungeon - Enchanter, Floor ") : "Dungeon - Floor ") + depth, ambient: theme.ambient, tiled: true, dark: !!theme.dark && !rest,
      spawn: { x: 40, y: FB - 20 }, platforms: plats, hazards: haz, enemies, doors, swings, ledges, gaps27: gaps, movers, crumbles, blinks, blades, fallers,
      dungeon: { seed, depth, exit, spots, swap, theme: theme.id, elite, chamberX, rest: kind, npc: rest ? { x: 300, y: FB } : null, braz, kinds: kinds.slice() }
    };
  }
  window.SHARDS.dungeon30 = { gen, G, H, isRest, restKind, FB, HH, THEMES, SWAPS, SWAPHEX, TIERS, BOSS_ZONES, isBoss, isElite, enemyCount, hpMul, dmgAdd, allowed, rng };
})();
