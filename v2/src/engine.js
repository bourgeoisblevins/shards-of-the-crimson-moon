// Shards of the Crimson Moon — engine (atlas-driven, no rectangle actors)
(function () {
  "use strict";
  // v2: the frame is 480x270 native pixels. The simulation keeps v1's tested world units
  // (a 320x180 view) and every world coordinate is drawn at WS = 1.5 px per unit, so jump
  // arcs, reach, AI ranges and hitboxes stay exactly as play-tested while all art is native.
  const W = 480, H = 270, WS = 1.5, VW = 320, VH = 180;
  const P = () => window.SHARDS.palettes;
  const T = () => window.SHARDS.text;
  // v2 save. v1 (now at /v1/) keeps "shards-crimson-moon-v2" (its own historic key name);
  // v2 reads it once to carry a pilgrimage over and never writes to it.
  const SAVE_KEY = "shards-crimson-moon-2.0";
  const V1_SAVE_KEY = "shards-crimson-moon-v2";

  const canvas = document.getElementById("game");
  const fb = document.createElement("canvas");
  fb.width = W; fb.height = H;
  let g = fb.getContext("2d", { alpha: false });
  g.imageSmoothingEnabled = false;
  // v6: portrait phones get a 180x320 "turn your phone" screen drawn with the same font/panels
  const PW = 270, PH = 480;
  const pfb = document.createElement("canvas");
  pfb.width = PW; pfb.height = PH;
  const pg = pfb.getContext("2d", { alpha: false });
  pg.imageSmoothingEnabled = false;

  const atlas = new window.SHARDS.Atlas();
  const synth = new window.SHARDS.Synth();
  const input = new window.SHARDS.Input(canvas);

  let scale = 4, cssFit = 4, portrait = false;
  function sizeCanvas() {
    // Desktop: largest integer scale that fits (1x..4x), never fractional.
    // Touch (v6): fill the safe area. The backing store matches device pixels and the
    // 320x180 frame is blitted nearest-neighbour, so pixels stay hard-edged.
    let maxW = window.innerWidth || W * 4;
    let maxH = window.innerHeight || H * 4;
    const fr = document.getElementById("frame");
    if (fr && window.getComputedStyle) {
      const cs = getComputedStyle(fr);
      maxW -= (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      maxH -= (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
    }
    const touch = input.isTouch;
    const wasPortrait = portrait;
    portrait = !!touch && maxH > maxW;
    const lw = portrait ? PW : W, lh = portrait ? PH : H;
    if (!touch) {
      cssFit = Math.max(1, Math.min(8, Math.floor(maxW / W), Math.floor(maxH / H)));
      scale = cssFit;
      canvas.width = W * scale;
      canvas.height = H * scale;
    } else {
      cssFit = Math.max(0.5, Math.min(maxW / lw, maxH / lh));
      const dpr = Math.min(3, window.devicePixelRatio || 1);
      canvas.width = Math.round(lw * cssFit * dpr);
      canvas.height = Math.round(lh * cssFit * dpr);
      scale = canvas.width / lw;
    }
    // CSS size = backing / dpr exactly, so the browser never resamples the frame
    const dprUsed = touch ? Math.min(3, window.devicePixelRatio || 1) : 1;
    canvas.style.width = (touch ? canvas.width / dprUsed : Math.floor(lw * cssFit)) + "px";
    canvas.style.height = (touch ? canvas.height / dprUsed : Math.floor(lh * cssFit)) + "px";
    if (portrait !== wasPortrait) { try { releasePads(); } catch (_) { /* first call, before the touch layer exists */ } }
    document.documentElement.style.background = P().ground.void;
    document.body.style.background = P().ground.void;
  }
  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);
  window.addEventListener("orientationchange", () => setTimeout(sizeCanvas, 60));
  if (window.visualViewport) window.visualViewport.addEventListener("resize", sizeCanvas);

  // ---------- save ----------
  function defaultSave() {
    return {
      path: null, claimed: {}, guideIndex: { order: 0, cult: 0 }, seenIntro: {},
      tutorial: { move: false, jump: false, strike: false, dodge: false, skill: false },
      settings: { master: 0.7, music: 0.45, sfx: 0.7, fullscreen: false, vibration: true }
    };
  }
  let save = defaultSave();
  let migrated = false; // v1 pilgrimage carried over this session (title note)
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) save = Object.assign(defaultSave(), JSON.parse(raw));
    else {
      // First v2 run: carry a v1 pilgrimage over (path, claims, guide lines, intros seen,
      // tutorial, audio settings). Unknown or broken v1 data starts fresh instead.
      const old = localStorage.getItem(V1_SAVE_KEY);
      if (old) {
        const o = JSON.parse(old);
        if (o && typeof o === "object" && (o.path === "order" || o.path === "cult")) {
          save = Object.assign(defaultSave(), {
            path: o.path, claimed: Object.assign({}, o.claimed || {}),
            guideIndex: Object.assign({ order: 0, cult: 0 }, o.guideIndex || {}),
            seenIntro: Object.assign({}, o.seenIntro || {}),
            tutorial: Object.assign(defaultSave().tutorial, o.tutorial || {}),
            settings: Object.assign(defaultSave().settings, o.settings || {})
          });
          save.migratedFrom = "v1"; migrated = true;
        }
      }
    }
  } catch (_) { save = defaultSave(); }
  // Saves before shards-v4: the cult path fought Jeriah for the Heart. Now Jeriah
  // is the cult's quest-giver and holds the Heart himself, so a cult save never
  // owns it. Drop the old flag; the five hunted fragments carry over as they are.
  function normalizeSave() {
    if (!save.claimed || typeof save.claimed !== "object") save.claimed = {};
    if (!save.guideIndex) save.guideIndex = { order: 0, cult: 0 };
    if (save.path === "cult") {
      for (const z of window.SHARDS.zones) if (z.cultHeldBy) delete save.claimed[z.fragment];
    }
    // shards-v5: the Shadow moved from Saffrika to the Mountain Monastery. Claims
    // are keyed by fragment and unlocks count claims, so a save at or past
    // Saffrika lands on the monastery in the same unlock slot. Zone-keyed flags
    // (seenIntro) follow the retired zone to its replacement.
    if (!save.seenIntro || typeof save.seenIntro !== "object") save.seenIntro = {};
    const retired = window.SHARDS.retiredZones || {};
    for (const old of Object.keys(retired)) {
      if (save.seenIntro[old]) { save.seenIntro[retired[old]] = true; delete save.seenIntro[old]; }
    }
    for (const f of Object.keys(save.claimed)) if (!(window.SHARDS.fragmentOrder || []).includes(f)) delete save.claimed[f];
    save.version = 20;
  }
  normalizeSave();
  function persist() {
    save.settings = {
      master: synth.volume.master, music: synth.volume.music, sfx: synth.volume.sfx,
      fullscreen: !!document.fullscreenElement,
      vibration: vibrationOn()
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) {}
  }
  function resetSave() {
    const settings = save.settings;
    save = defaultSave();
    save.settings = settings;
    persist();
  }
  // v7: controller rumble. Saves from before v7 have no flag: on by default.
  let vibration = !(save.settings && save.settings.vibration === false);
  function vibrationOn() { return vibration; }
  function setVibration(on) { vibration = !!on; persist(); if (vibration) rumble("claim"); }
  // Rumble only for a player holding the pad: Vibration on and the last input came from it.
  function rumble(kind) {
    if (!vibration || input.lastDevice !== "gamepad") return false;
    return input.rumble(kind);
  }
  function applySettings() {
    synth.setVolume("master", save.settings.master);
    synth.setVolume("music", save.settings.music);
    synth.setVolume("sfx", save.settings.sfx);
  }
  applySettings();

  // ---------- state ----------
  let scene = "boot";
  let path = save.path;
  let levelId = null, level = null;
  let player = null, boss = null;
  let enemies = [], pickups = [], projectiles = [], particles = [];
  let cameraX = 0, cameraLook = 0;
  let titleCard = 0, titleCardText = "";
  let fade = 0, fadeDir = 0, fadeNext = null; // fade 0..16, dir +1 out / -1 in
  let ambient = [];
  let altarPulse = 0;
  let claimMsg = "", claimTimer = 0;
  let lineIx = 0, travelIx = 0, pauseIx = 0, menuIx = 0, endingIx = 0, settingsIx = 0;
  let endingLines = [];
  let flash = 0, shake = 0, hitstop = 0;
  let hubSaid = false, introHold = 0;
  let pausePage = "main"; // main | fragments
  let fragScroll = 0;
  let teleMarks = []; // boss telegraph ground markers
  let tutPrompt = "", tutTimer = 0; // tutPrompt: step key; the line is picked per device at draw
  let bossIntroCard = 0;
  let introPages = [""], introPage = 0, introPageTime = 180;
  let musicTrack = null;
  let bootError = null;
  let wordmarkPath = "wordmark.png";

  // ---------- font ----------
  function drawGlyph(ch, x, y, color) {
    const font = window.SHARDS.font;
    const gl = font.g[ch] || font.g["?"];
    if (!gl) return 4;
    g.fillStyle = color;
    for (let row = 0; row < gl.r.length; row++) {
      let bits = gl.r[row], col = 0;
      while (bits) { if (bits & 1) g.fillRect(x + col, y + row, 1, 1); bits >>= 1; col++; }
    }
    return gl.a;
  }
  // v7: "{A}"-style tokens draw controller glyphs inline (data/pad-glyphs.js metrics,
  // assets/ui/pad-glyphs.png). A glyph advances its width + 1 px, like a letter.
  const PAD_TOKEN = /\{(A|B|X|Y|LB|RB|LT|RT|Start|View|LS|DPad)\}/g;
  function textParts(str) {
    str = String(str);
    const out = [];
    let at = 0;
    PAD_TOKEN.lastIndex = 0;
    for (let m; (m = PAD_TOKEN.exec(str));) {
      if (m.index > at) out.push(str.slice(at, m.index));
      out.push({ pad: m[1] });
      at = m.index + m[0].length;
    }
    if (at < str.length) out.push(str.slice(at));
    return out;
  }
  function padGlyphAdvance(name) {
    const pg = window.SHARDS.padGlyphs;
    const gl = pg && pg.g[name];
    return gl ? gl.w + pg.gap : 0;
  }
  function drawPadGlyph(name, x, y) {
    const pg = window.SHARDS.padGlyphs;
    const gl = pg && pg.g[name];
    if (!gl) return 0;
    const img = atlas.images.get(pg.path);
    if (img) g.drawImage(img, gl.x, 0, gl.w, pg.h, x | 0, y | 0, gl.w, pg.h);
    return gl.w + pg.gap;
  }
  function measure(str) {
    const font = window.SHARDS.font;
    let w = 0;
    for (const part of textParts(str)) {
      if (typeof part !== "string") { w += padGlyphAdvance(part.pad); continue; }
      for (const ch of part) w += (font.g[ch] || font.g["?"] || { a: 4 }).a;
    }
    return w;
  }
  function hasPadGlyph(str) { PAD_TOKEN.lastIndex = 0; return PAD_TOKEN.test(String(str)); }
  function drawText(str, x, y, color, align) {
    if (align === "center") x = (x - measure(str) / 2) | 0;
    if (align === "right") x = (x - measure(str)) | 0;
    let cx = x | 0;
    for (const part of textParts(str)) {
      if (typeof part !== "string") { cx += drawPadGlyph(part.pad, cx, y | 0); continue; }
      for (const ch of part) cx += drawGlyph(ch, cx, y | 0, color);
    }
    return cx - x;
  }
  function wrapLines(str, maxW) {
    const words = str.split(" ");
    const out = []; let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (measure(test) > maxW && line) { out.push(line); line = w; }
      else line = test;
    }
    if (line) out.push(line);
    return out;
  }
  // "\n" starts a new row (guide line / next hint, boss intro / reason).
  function paraLines(str, maxW) {
    return String(str).split("\n").reduce((acc, p) => acc.concat(wrapLines(p, maxW)), []);
  }
  function drawWrapped(str, x, y, maxW, color) {
    const lines = wrapLines(str, maxW);
    lines.forEach((ln, i) => drawText(ln, x, y + i * 15, color));
    return y + lines.length * 15;
  }

  // ---------- physics ----------
  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  function resolve(ent, plats) {
    ent.onGround = false;
    const prevX = ent.x;
    ent.x += ent.vx;
    if (ent.x < 0) { ent.x = 0; ent.vx = 0; }
    if (level && ent.x + ent.w > level.w) { ent.x = level.w - ent.w; ent.vx = 0; }
    // `solid` terraces (monastery stairs) also block from the side; everything
    // else stays pass-through from below and the sides, as before.
    for (const p of plats) {
      if (!p.solid) continue;
      if (ent.y + ent.h > p.y + 1 && ent.y < p.y + p.h && ent.x + ent.w > p.x && ent.x < p.x + p.w) {
        if (prevX + ent.w <= p.x + 0.01) { ent.x = p.x - ent.w; ent.vx = 0; }
        else if (prevX >= p.x + p.w - 0.01) { ent.x = p.x + p.w; ent.vx = 0; }
      }
    }
    const prevBottom = ent.y + ent.h;
    ent.y += ent.vy;
    for (const p of plats) {
      const crossing = prevBottom <= p.y + 0.01 && ent.y + ent.h > p.y;
      const over = ent.x + ent.w > p.x && ent.x < p.x + p.w;
      if (ent.vy >= 0 && crossing && over) {
        ent.y = p.y - ent.h; ent.vy = 0; ent.onGround = true; ent.ground = p;
      }
    }
    if (level && ent.y + ent.h > level.h) { ent.y = level.h - ent.h; ent.vy = 0; ent.onGround = true; }
  }

  // ---------- entities ----------
  function makePlayer(x, y) {
    return {
      x, y, w: 12, h: 20, vx: 0, vy: 0, onGround: false, facing: 1,
      hp: 5, maxHp: 5, inv: 0,
      atk: 0, atkCD: 0, combo: 0, comboTimer: 0,
      dodge: 0, dodgeCD: 0, skillCD: 0, skill: 0,
      coyote: 0, jumpBuf: 0, hurtT: 0, landT: 0, deathT: 0, airVy: 0,
      anim: "idle", animT: 0, dead: false
    };
  }
  function makeBoss(zone) {
    const tune = window.SHARDS.bosses[zone.bossId];
    const sp = level.bossSpawn;
    return {
      id: zone.bossId, fragment: zone.fragment,
      x: sp.x, y: sp.y, w: tune.size[0], h: tune.size[1],
      vx: 0, vy: 0, onGround: false, facing: -1,
      hp: tune.hp, maxHp: tune.hp, speed: tune.speed,
      moves: tune.moves.slice(), moves2: (tune.moves2 || tune.moves).slice(),
      phase2At: tune.phase2At || 0.5, phase: 1,
      rest: tune.rest, staffEye: !!tune.staffEye,
      t: 0, cd: 40, move: null, moveT: 0, teleT: 0, fading: 0,
      inv: 0, dead: false, visible: true, anim: "idle", animT: 0
    };
  }
  function makeEnemy(def) {
    const st = window.SHARDS.enemyStats[def.type];
    const zoneId = (level && (level.zone || level.bg)) || "vespera";
    const z = window.SHARDS.zones.find(z => z.id === zoneId);
    const ramp = (z && P().bosses[z.palette || z.bossId]) ? P().bosses[z.palette || z.bossId].ramp : P().ground.ash;
    return {
      type: def.type, x: def.x, y: def.y, w: st.w, h: st.h,
      vx: 0, vy: 0, onGround: false, facing: -1,
      hp: st.hp, maxHp: st.hp, speed: st.speed, damage: st.damage,
      ranged: !!st.ranged, behavior: st.behavior || (st.ranged ? "ranged" : "melee"),
      inv: 0, cd: 30 + Math.random() * 40, chargeT: 0, jumpT: 0,
      homeX: def.x, leash: st.leash || 40, translucent: !!st.translucent, attackT: 0,
      accent: Array.isArray(ramp) ? ramp[Math.min(3, ramp.length - 1)] : P().ground.ash,
      anim: "idle", animT: 0, dead: false, visible: true
    };
  }

  // Order: six arenas, six claims. Cult: Jeriah holds the Heart (held, not
  // claimed), so the cult hunts five arenas and finishes on five kills.
  function heldByAlly(f) {
    if (path !== "cult") return false;
    const z = window.SHARDS.zones.find(z => z.fragment === f);
    return !!(z && z.cultHeldBy);
  }
  function pathZones() {
    return window.SHARDS.zones.filter(z => !(path === "cult" && z.cultHeldBy));
  }
  function gathered(f) { return !!save.claimed[f] || heldByAlly(f); }
  function claimedCount() {
    return pathZones().filter(z => save.claimed[z.fragment]).length;
  }
  function zoneUnlocked(z) {
    if (path === "cult" && z.cultHeldBy) return false;
    return claimedCount() >= (path === "order" ? z.orderUnlock : z.cultUnlock);
  }
  function allClaimed() {
    return window.SHARDS.fragmentOrder.every(gathered);
  }

  function setMusic(track) {
    if (musicTrack === track) return;
    musicTrack = track;
    synth.play(track);
  }

  // ---------- scenes ----------
  function enterTitle() { scene = "title"; menuIx = 0; path = save.path; setMusic("title"); cameraX = 0; }
  function enterPath() { scene = "path"; menuIx = 0; setMusic("title"); }
  let settingsFrom = "title";
  function openSettings(from) { scene = "settings"; settingsIx = 0; settingsFrom = from || "title"; }

  function enterHub() {
    if (!path) { enterPath(); return; }
    levelId = path === "order" ? "orderHub" : "cultHub";
    level = window.SHARDS.levels[levelId];
    player = makePlayer(level.spawn.x, level.spawn.y);
    boss = null; enemies = []; projectiles = []; particles = [];
    pickups = []; cameraX = 0;
    scene = "hub"; hubSaid = false;
    seedAmbient(); fxList = [];
    titleCard = 90; titleCardText = level.title || "";
    fade = 16; fadeDir = -1;
    lineIx = save.guideIndex[path] || 0;
    setMusic(path === "order" ? "orderHub" : "cultHub");
  }
  function enterTravel() { scene = "travel"; travelIx = 0; }
  function liveZone(zoneId) {
    const retired = window.SHARDS.retiredZones || {};
    return retired[zoneId] || zoneId;
  }
  function enterTraverse(zoneId) {
    zoneId = liveZone(zoneId);
    const def = window.SHARDS.zones.find(z => z.id === zoneId);
    if (!def || !window.SHARDS.levels[zoneId + "_traverse"]) { enterHub(); return; }
    if (path === "cult" && def && def.cultHeldBy) { enterHub(); return; } // Order-only zone
    levelId = zoneId + "_traverse";
    level = window.SHARDS.levels[levelId];
    player = makePlayer(level.spawn.x, level.spawn.y);
    boss = null;
    enemies = (level.enemies || []).map(makeEnemy);
    pickups = (level.pickups || []).map(p => ({ ...p, w: 8, h: 8, taken: false }));
    projectiles = []; particles = []; cameraX = 0;
    scene = "traverse";
    seedAmbient(); fxList = [];
    titleCard = 90; titleCardText = level.title || "";
    fade = 16; fadeDir = -1;
    setMusic(zoneId);
  }
  function enterArena(zoneId) {
    zoneId = liveZone(zoneId);
    const def = window.SHARDS.zones.find(z => z.id === zoneId);
    if (!def || !window.SHARDS.levels[zoneId]) { enterHub(); return; }
    if (path === "cult" && def && def.cultHeldBy) { enterHub(); return; } // Order-only zone
    levelId = zoneId;
    level = window.SHARDS.levels[zoneId];
    player = makePlayer(level.spawn.x, level.spawn.y);
    boss = makeBoss(def);
    enemies = [];
    pickups = (level.pickups || []).map(p => ({ ...p, w: 8, h: 8, taken: false }));
    projectiles = []; particles = []; teleMarks = []; cameraX = 0;
    scene = "arena";
    seedAmbient(); fxList = [];
    titleCard = 0; titleCardText = ""; // zone title only on traverse
    fade = 16; fadeDir = -1;
    const first = !save.seenIntro[zoneId];
    const byPath = T().bossIntro[path] || {};
    const pages = byPath[def.bossId] != null ? byPath[def.bossId] : (T().bossIntro.order || {})[def.bossId];
    introPages = Array.isArray(pages) ? pages.slice() : [pages || ""];
    introPage = 0;
    introPageTime = first ? 180 : 90;
    introHold = introPageTime; // name card + delay aggro, per intro page
    bossIntroCard = introHold;
    setMusic("boss");
  }
  let lastClaimed = null;
  function enterClaim(frag) {
    scene = "claim"; lastClaimed = frag; claimT = 0;
    const tmpl = path === "order" ? T().claim.order : T().claim.cult;
    claimMsg = tmpl.replace("{frag}", T().fragments[frag]);
    if (heldByAlly(frag)) { claimTimer = 0; enterHub(); return; } // never claim what Jeriah holds
    claimTimer = 160;
    save.claimed[frag] = true; persist();
    synth.sfx("claim"); rumble("claim");
  }
  function enterDefeat() { scene = "defeat"; menuIx = 0; synth.sfx("death"); }
  function enterEnding() {
    scene = "ending";
    endingLines = path === "order" ? T().endings.order.lines : T().endings.cult.lines;
    endingIx = endingLines.length; // show full text; Enter advances past end
    // Stage hub for ambient particles matching the ending backdrop
    const hubId = path === "order" ? "orderHub" : "cultHub";
    level = window.SHARDS.levels[hubId];
    levelId = hubId;
    cameraX = Math.max(0, Math.min(level.w - VW, (level.altar.x + 8) - VW / 2));
    seedAmbient(); fxList = [];
    setMusic("ending");
  }

  // ---------- combat helpers ----------
  function doHitstop(n) { hitstop = Math.max(hitstop, n); }
  function spark(x, y, color, n) {
    for (let i = 0; i < (n || 6); i++) {
      particles.push({
        x, y, vx: (Math.random() - 0.5) * 2.4, vy: (Math.random() - 0.5) * 2.4 - 0.4,
        life: 16 + Math.random() * 12, color
      });
    }
  }
  // v2 sprite effects (hit sparks, dust, puffs, boss blasts) in world units
  let fxList = [];
  const FX_LEN = { hit: 12, dust: 15, puff: 18, boom: 24, claim: 40 };
  function fxAdd(kind, x, y, o) {
    fxList.push({ kind, x, y, t: 0, dur: FX_LEN[kind] || 16, big: !!(o && o.big), flip: !!(o && o.flip) });
    if (fxList.length > 64) fxList.shift();
  }
  function updateFx() { for (const f of fxList) f.t++; fxList = fxList.filter(f => f.t < f.dur); if (boss && boss.flashT > 0) boss.flashT--; }
  let godMode = false;
  function hurtPlayer(n, kbDir) {
    if (!player || player.inv > 0 || player.dodge > 0 || player.dead || godMode) return;
    player.hp -= n; player.inv = 50; flash = 4; shake = 6;
    player.vy = -2.2; player.vx = (kbDir || -player.facing) * 2.4;
    player.anim = "hurt"; player.animT = 0; player.hurtT = 18;
    synth.sfx("hurt"); doHitstop(3); rumble("hurt");
    fxAdd("hit", player.x + player.w / 2, player.y + player.h / 2, { big: false });
    // v2: the death animation plays (~0.8 s) before the defeat screen
    if (player.hp <= 0) { player.dead = true; player.anim = "death"; player.animT = 0; player.deathT = 48; shake = 10; }
  }

  function fireBolt(from, dir, color) {
    projectiles.push({
      x: from.x + from.w / 2, y: from.y + from.h / 2 - 2,
      w: 6, h: 4, vx: dir * 2.2, vy: 0, life: 90, color, harm: true
    });
  }

  // ---------- player update ----------
  function updatePlayer() {
    const p = player;
    if (p.dead) {
      p.animT++; p.vx *= 0.85; p.vy = Math.min(4.5, p.vy + 0.17); resolve(p, level.platforms);
      if (p.deathT > 0 && --p.deathT === 0) enterDefeat();
      return;
    }
    const spd = 1.45, jumpV = -3.85, grav = 0.17;
    let mx = 0;
    if (input.held("left")) mx -= 1;
    if (input.held("right")) mx += 1;

    if (p.dodge > 0) {
      p.dodge--;
      p.vx = p.facing * 2.8;
      p.inv = Math.max(p.inv, 2);
      p.anim = "dodge";
    } else if (p.skill > 0) {
      p.skill--;
      if (path === "order") {
        // radiant burst — hurt nearby
        if (p.skill === 18) {
          synth.sfx("skill");
          for (const e of enemies) if (!e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 48) damageEnemy(e, 2);
          if (boss && !boss.dead && Math.hypot(boss.x - p.x, boss.y - p.y) < 56) damageBoss(2);
          spark(p.x + 6, p.y + 10, P().order.illumination, 14);
          flash = 3;
        }
        p.vx = mx * 0.4; p.anim = "skill";
      } else {
        // crimson dash
        if (p.skill === 14) synth.sfx("skill");
        p.vx = p.facing * 3.4;
        p.inv = Math.max(p.inv, 2);
        p.anim = "skill";
        if (p.skill === 10) {
          for (const e of enemies) {
            if (!e.dead && aabb({ x: p.x - 4, y: p.y, w: p.w + 8, h: p.h }, e)) damageEnemy(e, 2);
          }
          if (boss && !boss.dead && aabb({ x: p.x - 4, y: p.y, w: p.w + 8, h: p.h }, boss)) damageBoss(2);
        }
      }
    } else {
      p.vx = mx * spd;
      if (mx) p.facing = mx;
    }

    if (input.pressed("jump")) p.jumpBuf = 10;
    if (p.onGround) p.coyote = 8; else p.coyote = Math.max(0, p.coyote - 1);
    if (p.jumpBuf > 0 && p.coyote > 0 && p.dodge === 0) {
      p.vy = jumpV; p.onGround = false; p.coyote = 0; p.jumpBuf = 0;
    }
    p.jumpBuf = Math.max(0, p.jumpBuf - 1);
    p.vy = Math.min(4.5, p.vy + grav);

    if (p.atkCD > 0) p.atkCD--;
    if (p.skillCD > 0) p.skillCD--;
    if (p.dodgeCD > 0) p.dodgeCD--;
    if (p.comboTimer > 0) p.comboTimer--; else p.combo = 0;
    if (p.atk > 0) p.atk--;

    if (input.pressed("dodge") && p.dodgeCD === 0 && p.dodge === 0 && p.skill === 0) {
      p.dodge = 12; p.dodgeCD = 40; synth.sfx("dodge"); rumble("dodge");
    }
    if (input.pressed("skill") && p.skillCD === 0 && p.skill === 0 && p.dodge === 0) {
      p.skill = path === "order" ? 22 : 16; p.skillCD = 90;
    }
    if (input.pressed("strike") && p.atkCD === 0 && p.dodge === 0 && introHold === 0) {
      p.combo = Math.min(3, p.combo + 1);
      p.comboTimer = 40;
      p.atk = 10; p.atkCD = p.combo === 3 ? 22 : 14;
      p.anim = "attack" + p.combo;
      p.animT = 0;
      synth.sfx("strike", p.combo || 1);
      if (p.combo === 3) p.combo = 0;
    }

    const wasAir = !p.onGround, fallV = p.vy;
    const prevDodge = p.dodge;
    resolve(p, level.platforms);
    if (p.inv > 0) p.inv--;
    if (wasAir && p.onGround && fallV > 2.2) { p.landT = 7; fxAdd("dust", p.x + p.w / 2, p.y + p.h, {}); }
    if (p.landT > 0) p.landT--;
    if (p.hurtT > 0) p.hurtT--;
    if (p.dodge === 11 && prevDodge === 11 && p.onGround) fxAdd("dust", p.x + p.w / 2 - p.facing * 4, p.y + p.h, { flip: p.facing < 0 });

    // anim state when not attacking/dodging
    if (p.dodge === 0 && p.skill === 0 && p.atk === 0) {
      if (p.hurtT > 0) p.anim = "hurt";
      else if (!p.onGround) p.anim = p.vy < 0 ? "jump" : "fall";
      else if (p.landT > 0 && Math.abs(p.vx) < 0.1) p.anim = "land";
      else if (Math.abs(p.vx) > 0.1) p.anim = "run";
      else p.anim = "idle";
    }
    p.animT++;

    for (const h of (level.hazards || [])) {
      if (aabb(p, h) && p.inv === 0 && p.dodge === 0) hurtPlayer(1, -p.facing);
    }
  }

  function damageEnemy(e, n) {
    if (e.inv > 0 || e.dead) return;
    e.hp -= n; e.inv = 12; e.vx = player.facing * 2; e.vy = -1.5;
    if (e.behavior === "bound") { e.vx = 0; e.vy = 0; e.attackT = 0; }
    e.anim = "hurt"; synth.sfx("enemyHurt"); doHitstop(2); shake = 3; rumble("hit");
    spark(e.x + e.w / 2, e.y + e.h / 2, P().order.light, 5);
    e.flashT = 4;
    fxAdd("hit", e.x + e.w / 2 - player.facing * 2, e.y + e.h / 2, { flip: player.facing < 0 });
    if (e.hp <= 0) { e.dead = true; e.anim = "death"; e.animT = 0; synth.sfx("enemyDeath"); fxAdd("puff", e.x + e.w / 2, e.y + e.h, {}); }
  }
  function damageBoss(n) {
    if (!boss || boss.inv > 0 || boss.dead) return;
    boss.hp -= n; boss.inv = 16;
    boss.vx = player.facing * 2.2; boss.vy = -1.4;
    boss.anim = "hurt"; synth.sfx("hit"); doHitstop(3); shake = 4; flash = 2; rumble("hit");
    spark(boss.x + boss.w / 2, boss.y + boss.h / 2, P().order.light, 8);
    boss.flashT = 4;
    fxAdd("hit", player.facing > 0 ? Math.max(boss.x, player.x + player.w) : Math.min(boss.x + boss.w, player.x), player.y + player.h / 2, { big: true, flip: player.facing < 0 });
    if (boss.phase === 1 && boss.hp / boss.maxHp <= boss.phase2At) {
      boss.phase = 2; boss.anim = "phase2"; boss.animT = 0; boss.cd = 30;
      spark(boss.x + 8, boss.y + 8, P().cult.ember, 16); shake = 8;
      if (typeof synth.setBossPhase === "function") synth.setBossPhase(2);
      if (boss.hp > 0) rumble("phase");
    }
    if (boss.hp <= 0) {
      // v2: Contra-style death: the body breaks apart in a chain of blasts, then the claim
      boss.dead = true; boss.anim = "death"; boss.animT = 0; boss.deathT = 72; boss.visible = true;
      projectiles = []; clearTeleMarks();
      synth.sfx("bossDefeat"); rumble("bossDeath"); doHitstop(10); shake = 14; flash = 3;
    }
  }

  function playerStrikeHit() {
    if (player.atk !== 8 && player.atk !== 7) return;
    const hit = {
      x: player.facing > 0 ? player.x + player.w : player.x - 16,
      y: player.y + 2, w: 16, h: 16
    };
    for (const e of enemies) if (!e.dead && aabb(hit, e)) damageEnemy(e, player.combo === 0 ? 2 : 1);
    if (boss && !boss.dead && boss.visible && aabb(hit, boss)) damageBoss(1);
  }

  // ---------- boss AI ----------
  // Contact damage comes from the core of the body (tune.core = inset fraction per side), so a
  // 200 px behemoth's tusks and mane read as reach art without making it impossible to pass.
  function bossCore(b) {
    const c = (window.SHARDS.bosses[b.id] || {}).core || 0;
    return { x: b.x + b.w * c, y: b.y + b.h * c * 0.5, w: b.w * (1 - 2 * c), h: b.h * (1 - c * 0.5) };
  }
  function bossAccent(b) {
    const r = P().bosses[b.id]?.ramp;
    if (b.id === "silent") return P().cult.ember; // his ramp is all shadow; ember is the one accent
    return (r && r[3]) || P().cult.ember;
  }
  // Top of the first platform at or below feetY that spans [x, x+w].
  function groundBelow(x, w, feetY) {
    let best = level.h;
    for (const p of level.platforms) {
      if (p.y >= feetY - 1 && p.y < best && x + w > p.x && x < p.x + p.w) best = p.y;
    }
    return best;
  }
  function clearTeleMarks() { teleMarks = []; }
  function addTeleMark(x, y, w, h, color, life) {
    teleMarks.push({ x, y, w, h, color, life: life || 36 });
  }
  function startMove(b, name) {
    b.move = name; b.moveT = 0;
    b.teleT = (window.SHARDS.bosses[b.id].telegraph || 36);
    const mi = (window.SHARDS.bossMoveIndex[b.id] || {})[name] || 1;
    b.anim = "atk" + mi + "_tele";
    b.animT = 0;
    synth.sfx("telegraph");
    clearTeleMarks();
    const accent = bossAccent(b);
    // Readable ground / line markers (0.4–0.7s at 60fps ≈ 24–42f)
    if (name === "charge" || name === "dash" || name === "frenzy" || name === "cleave" || name === "swipe" || name === "slash" || name === "arc") {
      const dir = b.facing;
      addTeleMark(b.x + (dir > 0 ? b.w : -48), b.y + b.h - 2, 48, 3, accent, b.teleT);
    } else if (name === "slam" || name === "leap" || name === "howl" || name === "wave") {
      addTeleMark(player.x - 8, level.h - 20, 28, 4, accent, b.teleT);
    } else if (name === "bolt" || name === "orb" || name === "barrage") {
      addTeleMark(b.x + b.w / 2 - 2, b.y + 8, 4, 40, accent, b.teleT);
    } else if (name === "spikes" || name === "spiral" || name === "bonewall" || name === "pillar" || name === "erupt" || name === "rain") {
      addTeleMark(player.x - 10, level.h - 22, 28, 4, accent, b.teleT);
    } else if (name === "fade" || name === "mirror") {
      // Shadow-step: he picks the spot now and the floor there darkens, so the
      // teleport is telegraphed (mark where he goes and where he leaves).
      const side = Math.random() < 0.5 ? -1 : 1;
      let tx = player.x + side * 40;
      if (tx < 8 || tx > level.w - b.w - 8) tx = player.x - side * 40;
      b.stepX = Math.max(8, Math.min(level.w - b.w - 8, tx));
      b.stepY = groundBelow(b.stepX, b.w, player.y + player.h);
      addTeleMark(b.stepX - 4, b.stepY - 2, b.w + 8, 3, accent, b.teleT + 20);
      addTeleMark(b.x - 2, b.y + b.h - 2, b.w + 4, 2, P().ground.void, b.teleT);
    } else if (name === "teleport") {
      addTeleMark(player.x - 6, player.y + player.h - 2, 24, 3, accent, b.teleT);
    } else {
      addTeleMark(b.x, b.y + b.h - 2, b.w, 3, accent, b.teleT);
    }
  }
  function activateMove(b) {
    const name = b.move;
    b.anim = b.anim.replace("_tele", "_active");
    clearTeleMarks();
    if ((name === "fade" || name === "mirror") && b.stepX != null) {
      addTeleMark(b.stepX - 4, b.stepY - 2, b.w + 8, 3, bossAccent(b), 20);
      spark(b.x + b.w / 2, b.y + b.h - 4, P().ground.void, 6);
    }
    if (name === "charge" || name === "dash" || name === "frenzy") { b.vx = b.facing * (name === "frenzy" ? 3.5 : 2.6); b.moveT = 28; }
    else if (name === "slam" || name === "leap") { b.vy = -4.4; b.vx = b.facing * 1.5; b.moveT = 50; }
    else if (name === "teleport" || name === "fade" || name === "mirror") { b.visible = false; b.moveT = 40; }
    else if (name === "bolt" || name === "orb" || name === "barrage") { b.moveT = 30; }
    else if (name === "spikes" || name === "bonewall" || name === "spiral") { b.moveT = 44; }
    else if (name === "pillar" || name === "wave" || name === "erupt" || name === "rain") { b.moveT = 40; }
    else if (name === "cleave" || name === "swipe" || name === "slash" || name === "howl") { b.moveT = 26; b.vx = b.facing * 1.6; }
    else { b.moveT = 24; }
  }
  function tickMove(b) {
    if (b.teleT > 0) {
      b.teleT--;
      // no particle spam during telegraph
      if (b.teleT === 0) activateMove(b);
      return;
    }
    b.moveT--;
    const name = b.move;
    if ((name === "bolt" || name === "orb") && b.moveT === 18) fireBolt(b, b.facing, P().bosses[b.id]?.ramp?.[3] || P().cult.ember);
    if (name === "barrage" && b.moveT % 8 === 0) fireBolt(b, b.facing, P().cult.emberLight);
    if ((name === "spikes" || name === "spiral") && b.moveT === 24) {
      for (let i = -2; i <= 2; i++) {
        projectiles.push({
          x: player.x + i * 16, y: level.h - 28, w: 6, h: 16,
          vx: 0, vy: -1.2, life: 40, color: P().bosses.nezradeem.ramp[2], harm: true, ground: true
        });
      }
    }
    if ((name === "pillar" || name === "erupt" || name === "rain") && b.moveT === 22) {
      projectiles.push({
        x: player.x - 4, y: 30, w: 10, h: 4, vx: 0, vy: 3.4, life: 50,
        color: P().cult.emberLight, harm: true
      });
    }
    if ((name === "teleport" || name === "fade" || name === "mirror") && b.moveT === 20) {
      if ((name === "fade" || name === "mirror") && b.stepX != null) {
        b.x = b.stepX; b.y = Math.min(b.stepY - b.h, level.h - 16 - b.h); b.stepX = null;
        b.facing = player.x < b.x ? -1 : 1;
      } else {
        b.x = Math.max(8, Math.min(level.w - b.w - 8, player.x + (Math.random() < 0.5 ? -40 : 40)));
        b.y = Math.min(player.y + player.h - b.h, level.h - 16 - b.h);
      }
      b.visible = true;
      if (name === "mirror") fireBolt(b, b.facing, P().ground.smoke);
    }
    if ((name === "slam" || name === "leap") && b.onGround && b.moveT < 28 && b.moveT > 18) {
      shake = 5; spark(b.x + b.w / 2, b.y + b.h, P().ground.ash, 4);
    }
    if (b.moveT <= 0) { b.move = null; b.cd = b.rest; b.vx *= 0.3; b.anim = "idle"; }
  }
  function updateBoss() {
    const b = boss;
    if (!b || b.dead) return;
    b.t++; b.animT = (b.animT || 0) + 1;
    if (introHold > 0) { b.vx = 0; resolve(b, level.platforms); return; }
    const dx = player.x - b.x;
    if (!b.move) b.facing = dx < 0 ? -1 : 1;
    b.vy = Math.min(4.5, b.vy + 0.18);
    if (b.move) tickMove(b);
    else {
      b.cd--;
      b.vx = b.facing * b.speed;
      b.anim = "move";
      if (b.cd <= 0) {
        const pool = b.phase === 2 ? b.moves2 : b.moves;
        startMove(b, pool[(Math.random() * pool.length) | 0]);
      }
    }
    if (b.visible) resolve(b, level.platforms);
    if (b.inv > 0) b.inv--;
    if (b.visible && !b.dead && aabb(player, bossCore(b)) && player.inv === 0 && player.dodge === 0) hurtPlayer(1, Math.sign(player.x - b.x) || -player.facing);
  }

  function updateEnemies() {
    for (const e of enemies) {
      if (e.dead) { e.animT++; continue; }
      e.animT++;
      if (e.inv > 0) e.inv--;
      e.vy = Math.min(4.5, e.vy + 0.18);
      const dx = player.x - e.x;
      e.facing = dx < 0 ? -1 : 1;
      e.cd--;
      const beh = e.behavior || (e.ranged ? "ranged" : "melee");
      if (beh === "ranged") {
        e.vx = Math.abs(dx) < 48 ? -e.facing * e.speed * 0.4 : 0;
        e.anim = Math.abs(e.vx) > 0.05 ? "walk" : "idle";
        if (e.cd <= 0 && Math.abs(dx) < 170) {
          fireBolt(e, e.facing, e.accent || P().ground.smoke); e.cd = 90; e.anim = "attack";
        }
      } else if (beh === "charger") {
        if (e.chargeT > 0) {
          e.chargeT--; e.vx = e.facing * e.speed * 2.4; e.anim = "walk";
        } else {
          e.vx = e.facing * e.speed * 0.6; e.anim = "walk";
          if (e.cd <= 0 && Math.abs(dx) < 90 && Math.abs(player.y - e.y) < 28) {
            e.chargeT = 28; e.cd = 70; e.anim = "attack";
          }
        }
      } else if (beh === "bound") {
        // Monastery shade: drifts toward the living, but only as far as the
        // ground it is bound to (leash from where it fell, never off its terrace).
        if (e.attackT > 0) {
          e.attackT--; e.vx = 0; e.anim = "attack";
        } else {
          const near = Math.abs(dx) < 110 && Math.abs(player.y - e.y) < 40;
          let dir = near ? e.facing : (Math.abs(e.x - e.homeX) > 2 ? Math.sign(e.homeX - e.x) : 0);
          let vx = dir * e.speed;
          const nx = e.x + vx * 6;
          if (Math.abs(nx - e.homeX) > e.leash) vx = 0;
          const gnd = e.ground;
          if (gnd && e.onGround !== false && (nx < gnd.x || nx + e.w > gnd.x + gnd.w)) vx = 0;
          e.vx = vx;
          e.anim = Math.abs(vx) > 0.05 ? "walk" : "idle";
          if (!near) e.facing = dir || e.facing;
          if (e.cd <= 0 && Math.abs(dx) < 26 && Math.abs(player.y - e.y) < 20) {
            e.cd = 64; e.attackT = 16; e.anim = "attack"; synth.sfx("telegraph");
          }
        }
      } else if (beh === "jumper") {
        e.vx = e.facing * e.speed; e.anim = "walk";
        if (e.onGround && e.cd <= 0 && Math.abs(dx) < 100) {
          e.vy = -3.6; e.vx = e.facing * e.speed * 1.6; e.cd = 70; e.anim = "attack"; e.onGround = false;
        }
      } else {
        e.vx = e.facing * e.speed; e.anim = "walk";
        if (e.cd <= 0 && Math.abs(dx) < 28) { e.cd = 50; e.anim = "attack"; }
      }
      resolve(e, level.platforms);
      if (aabb(player, e) && player.inv === 0 && player.dodge === 0) hurtPlayer(e.damage, Math.sign(player.x - e.x) || -player.facing);
    }
  }

  function updateProjectiles() {
    for (const pr of projectiles) {
      pr.x += pr.vx; pr.y += pr.vy; pr.life--;
      if (pr.ground && pr.vy < 0 && pr.life < 25) pr.vy = 0;
      if (pr.harm && aabb(player, pr) && player.inv === 0 && player.dodge === 0) hurtPlayer(1);
    }
    projectiles = projectiles.filter(pr => pr.life > 0 && pr.y < (level ? level.h + 20 : 200));
  }
  function updateParticles() {
    for (const p of particles) { p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.life--; }
    particles = particles.filter(p => p.life > 0);
  }
  function updatePickups() {
    for (const p of pickups) {
      if (p.taken) continue;
      if (aabb(player, { x: p.x, y: p.y, w: 8, h: 8 })) {
        p.taken = true;
        if (p.type === "heal") {
          player.hp = Math.min(player.maxHp, player.hp + 2);
          synth.sfx("pickup"); spark(p.x, p.y, P().order.nexus, 8);
        }
      }
    }
  }

  function seedAmbient() {
    ambient = [];
    if (!level) return;
    const kind = level.ambient || "dust";
    const n = 28;
    const colors = {
      ember: [P().cult.ember, P().cult.emberLight, P().cult.crimson],
      snow: [P().order.bone, P().order.boneShade, P().order.light],
      spore: [P().order.boneShade, P().ground.smoke, P().order.temple],
      dust: [P().ground.ash, P().ground.smoke, P().order.boneShade],
      purple: [P().bosses.azmardus.ramp[2], P().bosses.azmardus.ramp[3], P().bosses.azmardus.ramp[1]],
      gold: [P().order.nexus, P().order.illumination, P().order.temple],
      monastery: [P().monastery.snowShade, P().monastery.mist, P().monastery.stone4]
    }[kind] || [P().ground.ash];
    const count = kind === "monastery" ? 16 : n; // sparse, slow snow
    for (let i = 0; i < count; i++) {
      ambient.push({
        x: Math.random() * (level.w || VW),
        y: Math.random() * VH,
        vx: (Math.random() - 0.5) * (kind === "snow" ? 0.3 : 0.15),
        vy: kind === "ember" ? -0.2 - Math.random() * 0.35
          : kind === "snow" ? 0.25 + Math.random() * 0.3
          : kind === "monastery" ? 0.12 + Math.random() * 0.16
          : (Math.random() - 0.5) * 0.2,
        life: 9999,
        color: colors[(Math.random() * colors.length) | 0],
        twinkle: (Math.random() * 40) | 0
      });
    }
  }
  function updateAmbient() {
    if (!level) return;
    for (const a of ambient) {
      a.x += a.vx; a.y += a.vy; a.twinkle++;
      if (a.y < -4) a.y = VH + 4;
      if (a.y > VH + 4) a.y = -4;
      if (a.x < cameraX - 8) a.x = cameraX + VW + 8;
      if (a.x > cameraX + VW + 8) a.x = cameraX - 8;
    }
  }

  function updateCamera() {
    if (!level || !player) { cameraX = 0; cameraLook = 0; return; }
    if (level.w <= VW) { cameraX = 0; cameraLook = 0; return; }
    // look-ahead toward facing, smooth; deadzone ±24 around center
    const lookTarget = player.facing * 36;
    cameraLook += (lookTarget - cameraLook) * 0.08;
    const focus = player.x + player.w / 2 + cameraLook;
    const screenX = focus - cameraX;
    const deadL = VW * 0.5 - 24, deadR = VW * 0.5 + 24;
    if (screenX < deadL) cameraX -= (deadL - screenX) * 0.2;
    else if (screenX > deadR) cameraX += (screenX - deadR) * 0.2;
    // soft follow remainder
    const ideal = focus - VW / 2;
    cameraX += (ideal - cameraX) * 0.06;
    // touch: traversals may scroll 48px past the end so the boss gate clears the right pads
    const endPad = (touchUI() && level.kind === "traverse") ? 48 : 0;
    cameraX = Math.max(0, Math.min(level.w - VW + endPad, cameraX));
  }

  // ---------- scene updates ----------
  function controlScheme() {
    if (input.isTouch && input.lastDevice === "touch") return "touch";
    if (input.lastDevice === "gamepad") return "gamepad";
    return "kb";
  }
  // v7: the gamepad is the active device -> prompts show controller glyphs.
  function padUI() { return input.lastDevice === "gamepad"; }
  // B (and Esc / Start) back out of menus. In play B is jump, so only menu scenes read it.
  function menuBack() { return input.pressed("cancel") || input.pressed("back"); }
  function tutLine(step) {
    const sch = controlScheme();
    const pack = (T().tutorialBy || {})[sch] || T().tutorial;
    return pack[step] || T().tutorial[step] || "";
  }
  function advanceTutorial() {
    // Only one top banner: wait for zone title card to finish
    if (titleCard > 0) { tutPrompt = ""; return; }
    if (!save.tutorial) save.tutorial = { move: false, jump: false, strike: false, dodge: false, skill: false };
    const t = save.tutorial;
    if (!t.move && (input.held("left") || input.held("right"))) {
      t.move = true; tutPrompt = "jump"; tutTimer = 180; persist();
    } else if (t.move && !t.jump && input.pressed("jump")) {
      t.jump = true; tutPrompt = "strike"; tutTimer = 180; persist();
    } else if (t.jump && !t.strike && input.pressed("strike")) {
      t.strike = true; tutPrompt = "dodge"; tutTimer = 180; persist();
    } else if (t.strike && !t.dodge && input.pressed("dodge")) {
      t.dodge = true; tutPrompt = "skill"; tutTimer = 180; persist();
    } else if (t.dodge && !t.skill && input.pressed("skill")) {
      t.skill = true; tutPrompt = "done"; tutTimer = 210; persist();
    } else if (!t.move && tutTimer <= 0 && !tutPrompt) {
      tutPrompt = "move"; tutTimer = 240;
    }
    if (tutTimer > 0) tutTimer--;
    else { if (t.skill) tutPrompt = ""; }
  }
  function updateHub() {
    updatePlayer(); updateAmbient(); updateCamera(); advanceTutorial();
    for (const n of (level.npcs || [])) n.animT = (n.animT || 0) + 1;
    const guide = level.guide;
    const nearGuide = Math.abs(player.x - guide.x) < 28 && Math.abs(player.y - guide.y) < 28;
    const pad = level.travelPad;
    const nearTravel = pad && Math.abs((player.x + player.w / 2) - (pad.x + pad.w / 2)) < 40 && Math.abs(player.y - (pad.y - 4)) < 36;
    if (nearGuide && input.pressed("confirm")) {
      if (hubSaid) {
        lineIx = (lineIx + 1) % T().guideLines[path].length;
        save.guideIndex[path] = lineIx; persist();
      }
      hubSaid = true; synth.sfx("dialogue"); return;
    }
    if (allClaimed()) {
      const a = level.altar;
      if (aabb(player, { x: a.x - 10, y: a.y - 10, w: a.w + 20, h: a.h + 28 }) && input.pressed("confirm")) {
        enterEnding(); return;
      }
    }
    if (nearTravel && input.pressed("confirm")) { synth.sfx("menu"); enterTravel(); }
  }
  function updateTravel() {
    const zones = pathZones();
    const n = zones.length + 1;
    if (input.pressed("up")) { travelIx = (travelIx + n - 1) % n; synth.sfx("menuMove"); }
    if (input.pressed("down")) { travelIx = (travelIx + 1) % n; synth.sfx("menuMove"); }
    if (menuBack()) { scene = "hub"; return; }
    if (input.pressed("confirm")) {
      synth.sfx("menu");
      if (travelIx === n - 1) { scene = "hub"; return; }
      const z = zones[travelIx];
      if (save.claimed[z.fragment] || !zoneUnlocked(z)) return;
      goScene(() => enterTraverse(z.id));
    }
  }
  function updateTraverse() {
    for (const e of enemies) if (e.flashT > 0) e.flashT--;
    updatePlayer(); playerStrikeHit(); updateEnemies(); updateProjectiles(); updateParticles(); updatePickups(); updateCamera();
    const gate = level.bossGate;
    if (gate && aabb(player, gate) && input.pressed("confirm")) {
      const zid = level.zone; synth.sfx("gate"); goScene(() => enterArena(zid));
    }
  }
  function updateBossDeath() {
    const b = boss;
    if (!b || !b.dead || !(b.deathT > 0)) return;
    b.deathT--; b.animT++;
    if (b.deathT % 6 === 0) {
      fxAdd("boom", b.x + Math.random() * b.w, b.y + Math.random() * b.h * 0.9, { big: b.deathT % 18 === 0 });
      shake = Math.max(shake, 4);
    }
    if (b.deathT === 20) { flash = 4; shake = 16; fxAdd("boom", b.x + b.w / 2, b.y + b.h / 2, { big: true }); }
    if (b.deathT === 0) { b.visible = false; enterClaim(b.fragment); }
  }
  function updateArena() {
    updatePlayer(); playerStrikeHit(); updateBoss(); updateBossDeath(); updateProjectiles(); updateParticles(); updatePickups(); updateAmbient(); updateCamera();
    for (const m of teleMarks) m.life--;
    teleMarks = teleMarks.filter(m => m.life > 0);
  }
  function updateTitle() {
    const has = !!save.path;
    const items = has ? 4 : 2; // new, continue, settings, reset OR start, settings
    if (input.pressed("up")) { menuIx = (menuIx + items - 1) % items; synth.sfx("menuMove"); }
    if (input.pressed("down")) { menuIx = (menuIx + 1) % items; synth.sfx("menuMove"); }
    if (input.pressed("confirm")) {
      synth.resume(); synth.sfx("menu");
      if (!has) {
        if (menuIx === 0) enterPath();
        else openSettings("title");
        return;
      }
      if (menuIx === 0) { resetSave(); enterPath(); }
      else if (menuIx === 1) { path = save.path; enterHub(); }
      else if (menuIx === 2) openSettings("title");
      else { resetSave(); enterTitle(); }
    }
  }
  function updatePath() {
    if (input.pressed("left") || input.pressed("right") || input.pressed("up") || input.pressed("down")) {
      menuIx ^= 1; synth.sfx("menuMove");
    }
    if (input.pressed("confirm")) {
      synth.sfx("menu"); path = menuIx === 0 ? "order" : "cult"; save.path = path; normalizeSave(); persist(); enterHub();
    }
    if (menuBack()) enterTitle();
  }
  const SETTINGS_ROWS = 6; // master, music, sfx, fullscreen, vibration (v7), back
  function updateSettings() {
    if (input.pressed("up")) { settingsIx = (settingsIx + SETTINGS_ROWS - 1) % SETTINGS_ROWS; synth.sfx("menuMove"); }
    if (input.pressed("down")) { settingsIx = (settingsIx + 1) % SETTINGS_ROWS; synth.sfx("menuMove"); }
    const adj = (input.pressed("left") ? -0.1 : input.pressed("right") ? 0.1 : 0);
    if (settingsIx === 0 && adj) { synth.setVolume("master", synth.volume.master + adj); persist(); }
    if (settingsIx === 1 && adj) { synth.setVolume("music", synth.volume.music + adj); persist(); }
    if (settingsIx === 2 && adj) { synth.setVolume("sfx", synth.volume.sfx + adj); persist(); }
    if (settingsIx === 3 && input.pressed("confirm")) {
      if (!document.fullscreenElement) enterFullscreen();
      else document.exitFullscreen?.();
      persist();
    }
    if (settingsIx === 4 && (input.pressed("confirm") || input.pressed("left") || input.pressed("right"))) {
      setVibration(!vibration); synth.sfx("menuMove");
    }
    if (settingsIx === 5 && (input.pressed("confirm") || menuBack())) {
      scene = settingsFrom === "pause" ? "pause" : "title";
    }
    if (menuBack() && settingsIx !== 5) scene = settingsFrom === "pause" ? "pause" : "title";
  }
  function updateClaim() {
    claimTimer--;
    if (claimTimer <= 0 || input.pressed("confirm")) enterHub();
  }
  function updateDefeat() {
    if (input.pressed("up") || input.pressed("down")) menuIx ^= 1;
    if (input.pressed("confirm")) {
      synth.sfx("menu");
      if (menuIx === 0) {
        // retry arena or traverse
        if (level && level.kind === "arena") enterArena(level.zone || levelId);
        else if (level && level.kind === "traverse") enterTraverse(level.zone);
        else enterHub();
      } else enterHub();
    }
  }
  function updateEnding() {
    if (input.pressed("confirm")) {
      endingIx++;
      if (endingIx > endingLines.length) { resetSave(); enterTitle(); }
    }
  }
  function updatePause() {
    if (pausePage === "fragments") {
      if (menuBack() || input.pressed("confirm")) { pausePage = "main"; return; }
      if (input.pressed("up")) fragScroll = Math.max(0, fragScroll - 1);
      if (input.pressed("down")) fragScroll = Math.min(3, fragScroll + 1);
      return;
    }
    if (menuBack()) {
      pausePage = "main";
      scene = level.kind === "hub" ? "hub" : (level.kind === "traverse" ? "traverse" : "arena");
      return;
    }
    const n = 5;
    if (input.pressed("up")) { pauseIx = (pauseIx + n - 1) % n; synth.sfx("menuMove"); }
    if (input.pressed("down")) { pauseIx = (pauseIx + 1) % n; synth.sfx("menuMove"); }
    if (input.pressed("confirm")) {
      synth.sfx("menu");
      if (pauseIx === 0) scene = level.kind === "hub" ? "hub" : (level.kind === "traverse" ? "traverse" : "arena");
      else if (pauseIx === 1) { pausePage = "fragments"; fragScroll = 0; }
      else if (pauseIx === 2) openSettings("pause");
      else if (pauseIx === 3) enterHub();
      else enterTitle();
    }
  }

  let lastScene = "";
  function update() {
    if (scene !== lastScene) { armedKey = ""; lastScene = scene; }
    input.pollGamepad();
    if (hitstop > 0) { hitstop--; input.clearJust(); return; }
    updateFx();
    if (flash > 0) flash--;
    if (shake > 0) shake--;
    if (introHold > 0) {
      introHold--;
      if (input.pressed("confirm") || introHold === 0) {
        // multi-page intros (Azmardus) advance a page; the last page starts the fight
        if (introPage < introPages.length - 1) { introPage++; introHold = introPageTime; }
        else introHold = 0;
      }
      if (introHold === 0 && level) { save.seenIntro[level.zone || levelId] = true; persist(); }
    }
    // v2 pad layout: A is jump and interact. While an interaction prompt is up (guide,
    // travel pad, altar, boss gate) A interacts instead of jumping.
    if ((scene === "hub" || scene === "traverse") && input.padJust.jump && contextAction()) {
      delete input.padJust.jump;
    }
    if (scene === "title") updateTitle();
    else if (scene === "path") updatePath();
    else if (scene === "settings") updateSettings();
    else if (scene === "hub") {
      if (input.pressed("cancel")) { pauseIx = 0; pausePage = "main"; scene = "pause"; }
      else updateHub();
    } else if (scene === "travel") updateTravel();
    else if (scene === "traverse") {
      if (input.pressed("cancel")) { pauseIx = 0; pausePage = "main"; scene = "pause"; }
      else updateTraverse();
    } else if (scene === "arena") {
      if (input.pressed("cancel")) { pauseIx = 0; pausePage = "main"; scene = "pause"; }
      else if (introHold === 0) updateArena();
      else { updateBoss(); }
    } else if (scene === "claim") updateClaim();
    else if (scene === "defeat") updateDefeat();
    else if (scene === "ending") updateEnding();
    else if (scene === "pause") updatePause();
    input.clearJust();
  }

  // ---------- draw (v2: native 480x270) ----------
  // World units -> pixels: px = round(x * WS) - camPx. The camera snaps to whole pixels so
  // parallax and sprites never jitter by sub-pixels.
  const ART = () => window.SHARDS.art;
  let camPx = 0;
  const LH = 15; // text line height
  function wx(x) { return Math.round(x * WS) - camPx; }
  function wy(y) { return Math.round(y * WS); }
  function worldX(x) { return wx(x); }

  // ----- sprites -----
  const flashCanvas = document.createElement("canvas");
  const flashG = flashCanvas.getContext("2d");
  function sheetOf(name) { return ART().sheets[name]; }
  function frameIndex(s, frame) {
    if (typeof frame === "number") return Math.max(0, Math.min(s.n - 1, frame));
    const i = s.index[frame];
    return i == null ? 0 : i;
  }
  function hasFrame(name, frame) { const s = sheetOf(name); return !!(s && s.index[frame] != null); }
  // Draw a frame so the sheet anchor (ax, ay: feet centre for actors) lands on screen point
  // (px, py). flip mirrors around the anchor. mode "flash" draws the hit silhouette in light.
  function blitFrame(name, frame, px, py, flip, mode) {
    const s = sheetOf(name); if (!s) return false;
    const img = atlas.images.get(s.path); if (!img) return false;
    const fi = frameIndex(s, frame);
    const cols = s.cols || s.n;
    const srcX = (fi % cols) * s.fw, srcY = ((fi / cols) | 0) * s.fh;
    const dx = Math.round(flip ? px - (s.fw - s.ax) : px - s.ax), dy = Math.round(py - s.ay);
    let src = img, sx0 = srcX, sy0 = srcY;
    if (mode === "flash") {
      if (flashCanvas.width < s.fw || flashCanvas.height < s.fh) { flashCanvas.width = Math.max(flashCanvas.width, s.fw); flashCanvas.height = Math.max(flashCanvas.height, s.fh); }
      flashG.globalCompositeOperation = "source-over";
      flashG.clearRect(0, 0, flashCanvas.width, flashCanvas.height);
      flashG.drawImage(img, srcX, srcY, s.fw, s.fh, 0, 0, s.fw, s.fh);
      flashG.globalCompositeOperation = "source-in";
      flashG.fillStyle = P().order.light; flashG.fillRect(0, 0, s.fw, s.fh);
      flashG.globalCompositeOperation = "source-over";
      src = flashCanvas; sx0 = 0; sy0 = 0;
    }
    if (flip) {
      g.save(); g.translate(dx + s.fw, dy); g.scale(-1, 1);
      g.drawImage(src, sx0, sy0, s.fw, s.fh, 0, 0, s.fw, s.fh);
      g.restore();
    } else g.drawImage(src, sx0, sy0, s.fw, s.fh, dx, dy, s.fw, s.fh);
    return true;
  }
  // actor at world feet-centre (cx, bottom)
  function drawActor(name, frame, cx, bottom, flip, mode) {
    return blitFrame(name, frame, Math.round(cx * WS) - camPx, Math.round(bottom * WS), flip, mode);
  }
  function animFrame(name, base, t, speed, loop) {
    const s = sheetOf(name); if (!s) return base + "0";
    const n = (s.anims && s.anims[base]) || 1;
    let i = (t / (speed || 6)) | 0;
    i = loop === false ? Math.min(n - 1, i) : i % n;
    return base + i;
  }

  // ----- text & panels -----
  function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function panel(x, y, w, h, style) {
    const ui = ART().ui[style || "panel"] || ART().ui.panel;
    const img = atlas.images.get(ui.path);
    x = x | 0; y = y | 0; w = w | 0; h = h | 0;
    if (!img) { rect(x, y, w, h, P().ground.obsidian); return; }
    const c = ui.c, s = ui.s, m = s - 2 * c;
    g.drawImage(img, c, c, m, m, x + c, y + c, w - 2 * c, h - 2 * c);
    for (let xx = x + c; xx < x + w - c; xx += m) {
      const ww = Math.min(m, x + w - c - xx);
      g.drawImage(img, c, 0, ww, c, xx, y, ww, c);
      g.drawImage(img, c, s - c, ww, c, xx, y + h - c, ww, c);
    }
    for (let yy = y + c; yy < y + h - c; yy += m) {
      const hh = Math.min(m, y + h - c - yy);
      g.drawImage(img, 0, c, c, hh, x, yy, c, hh);
      g.drawImage(img, s - c, c, c, hh, x + w - c, yy, c, hh);
    }
    g.drawImage(img, 0, 0, c, c, x, y, c, c);
    g.drawImage(img, s - c, 0, c, c, x + w - c, y, c, c);
    g.drawImage(img, 0, s - c, c, c, x, y + h - c, c, c);
    g.drawImage(img, s - c, s - c, c, c, x + w - c, y + h - c, c, c);
  }
  function drawImg(path, x, y) { const img = atlas.images.get(path); if (img) g.drawImage(img, x | 0, y | 0); return img; }
  // menu cursor: the serpent-eye marker, 2-frame shimmer
  let uiT = 0;
  function cursor(x, y) { blitFrame("ui-cursor", ((uiT / 16) | 0) % 2, x, y, false); }
  function menuText(label, cx, y, sel, align) {
    const c = sel ? P().order.illumination : P().order.boneShade;
    const w = measure(label);
    let x = align === "left" ? cx : (cx - w / 2) | 0;
    drawText(label, x, y, c);
    if (sel) cursor(x - 12, y + 1);
    return x;
  }

  // ----- background, level art -----
  function levelArt() { return level && ART().levels[levelId]; }
  function drawLayer(path, f, y) {
    const img = atlas.images.get(path); if (!img) return;
    const x = -Math.round(camPx * f);
    g.drawImage(img, x, y || 0);
    // layers are painted wide enough for the level; repeat only as a safety net
    if (x + img.width < W) g.drawImage(img, x + img.width, y || 0);
  }
  function drawBG() {
    const la = levelArt();
    rect(0, 0, W, H, P().ground.void);
    if (!la) { drawFallbackPlatforms(); return; }
    for (const L of la.layers) drawLayer(L.path, L.f, L.y);
    drawAnims(la, "back");
    if (la.play) drawLayer(la.play, 1, 0);
    drawAnims(la, "play");
  }
  function drawFront() {
    const la = levelArt(); if (!la) return;
    if (la.front) drawLayer(la.front, 1, 0);
    drawAnims(la, "front");
    if (la.near) drawLayer(la.near.path, la.near.f, la.near.y);
    drawFog(la);
  }
  let animT = 0;
  function drawAnims(la, layer) {
    for (const a of la.anims || []) {
      if ((a.layer || "play") !== layer) continue;
      const f = a.f == null ? 1 : a.f;
      const px = a.x - Math.round(camPx * f);
      if (px < -96 || px > W + 96) continue;
      const s = sheetOf(a.sheet); if (!s) continue;
      const n = (s.anims && s.anims[a.anim]) || 1;
      const fr = a.anim + (((animT + (a.ph || 0)) / (a.spd || 6) | 0) % n);
      blitFrame(a.sheet, fr, px, a.y, !!a.flip);
    }
  }
  // fog bands: pre-dithered strips scrolled at their own drift (no alpha)
  function drawFog(la) {
    for (const b of la.fog || []) {
      const img = atlas.images.get(b.path); if (!img) continue;
      let x = -Math.round(camPx * (b.f || 1) + animT * (b.drift || 0)) % img.width;
      if (x > 0) x -= img.width;
      for (; x < W; x += img.width) g.drawImage(img, x, b.y);
    }
  }
  function drawAmbient() {
    for (const a of ambient) {
      if ((a.twinkle % 20) < 3) continue;
      const big = (a.twinkle % 7) === 0;
      rect(wx(a.x), wy(a.y), big ? 2 : 1, big ? 2 : 1, a.color);
    }
  }
  // debug-only fallback when a level has no baked art (never shipped: audit requires art)
  function drawFallbackPlatforms() {
    for (const p of level.platforms) rect(wx(p.x), wy(p.y), Math.round(p.w * WS), Math.round(p.h * WS), P().ground.stone2);
  }

  // interactables that change state at runtime are sprites, not baked into the level art
  function drawInteractables() {
    if (level.altar && level.kind === "hub") {
      const a = level.altar;
      const lit = allClaimed();
      drawActor(path === "order" ? "altar-order" : "altar-cult", animFrame(path === "order" ? "altar-order" : "altar-cult", lit ? "lit" : "idle", animT, 8), a.x + a.w / 2, a.y + a.h, false);
    }
    if (level.travelPad) {
      const pad = level.travelPad;
      drawActor("travel-pad", animFrame("travel-pad", path === "order" ? "order" : "cult", animT, 7), pad.x + pad.w / 2, pad.y, false);
    }
    if (level.bossGate) {
      const gt = level.bossGate;
      const near = player && aabb(player, gt);
      drawActor("gate-" + (level.zone || "vespera"), animFrame("gate-" + (level.zone || "vespera"), near ? "open" : "idle", animT, 8), gt.x + gt.w / 2, gt.y + gt.h, false);
    }
    for (const h of (level.hazards || [])) {
      const sh = "hazard-" + (h.kind === "ember" ? "ember" : (level.zone || "vespera"));
      const s = sheetOf(sh) || sheetOf("hazard-vespera");
      if (!s) continue;
      for (let x = 0; x < h.w; x += 16) {
        blitFrame(sheetOf(sh) ? sh : "hazard-vespera", animFrame(sheetOf(sh) ? sh : "hazard-vespera", "idle", animT + x, 7), wx(h.x + x), wy(h.y + h.h), false);
      }
    }
  }

  // ----- actors -----
  function playerSheet() { return path === "cult" ? "player-cult" : "player-order"; }
  function playerFrame(p) {
    const sh = playerSheet();
    if (p.dead) return animFrame(sh, "death", p.animT, 8, false);
    if (p.skill > 0) { const tot = path === "order" ? 22 : 16; return animFrame(sh, "skill", tot - p.skill, path === "order" ? 6 : 4, false); }
    if (p.dodge > 0) return animFrame(sh, "roll", 12 - p.dodge, 3, false);
    if (p.atk > 0) {
      const k = Math.max(1, Math.min(3, (p.anim || "attack1").replace("attack", "") | 0));
      const ph = p.atk >= 9 ? 0 : p.atk >= 6 ? 1 : 2; // wind-up, smear (active 8/7), follow-through
      const fr = "atk" + k + "_" + (k === 3 && p.atk <= 2 ? 3 : ph);
      return hasFrame(sh, fr) ? fr : "atk" + k + "_" + ph;
    }
    switch (p.anim) {
      case "hurt": return "hurt0";
      case "jump": return animFrame(sh, "jump", p.animT, 6, false);
      case "fall": return animFrame(sh, "fall", p.animT, 6);
      case "land": return "land0";
      case "run": return animFrame(sh, "run", p.animT, 5);
      default: return animFrame(sh, "idle", p.animT, 10);
    }
  }
  function drawPlayer() {
    const p = player;
    if (p.inv > 0 && !p.dead && p.dodge === 0 && p.skill === 0 && (p.inv % 6) < 2 && p.hurtT === 0) return;
    drawActor(playerSheet(), playerFrame(p), p.x + p.w / 2, p.y + p.h, p.facing < 0, p.hurtT > 14 ? "flash" : null);
    if (p.skill > 0) {
      const fx = path === "order" ? "fx-skill-order" : "fx-skill-cult";
      const tot = path === "order" ? 22 : 16;
      drawActor(fx, animFrame(fx, "fx", tot - p.skill, 4, false), p.x + p.w / 2, p.y + p.h, p.facing < 0);
    }
  }
  function bossFrame(b) {
    const sh = "boss-" + b.id;
    const p2 = b.phase === 2 && hasFrame(sh, "p2_idle0") ? "p2_" : "";
    if (b.dead) return animFrame(sh, "death", b.animT, 8, false);
    if (b.anim === "phase2" && b.animT < 40) return animFrame(sh, "phase", b.animT, 10, false);
    if (b.anim === "hurt") return p2 + "hurt0";
    const m = /^atk(\d)_(tele|active)$/.exec(b.anim || "");
    if (m) {
      const base = p2 + "atk" + m[1] + "_" + m[2];
      return animFrame(sh, hasFrame(sh, base + "0") ? base : "atk" + m[1] + "_" + m[2], b.animT, m[2] === "tele" ? 8 : 5, m[2] !== "tele");
    }
    if (b.anim === "move" && Math.abs(b.vx) > 0.05) return animFrame(sh, p2 + "walk", b.animT, 7);
    return animFrame(sh, p2 + "idle", b.animT, 10);
  }
  function drawBoss() {
    if (!boss) return;
    drawTeleMarks();
    const b = boss;
    const blink = b.inv > 0 && !b.dead && (b.inv % 4 < 2) && b.anim !== "phase2";
    if (b.visible !== false && !(blink && !(b.flashT > 0))) {
      drawActor("boss-" + b.id, bossFrame(b), b.x + b.w / 2, b.y + b.h, b.facing < 0, (b.flashT > 0 && !b.dead) || (b.dead && b.deathT < 24 && (b.deathT % 4) < 2) ? "flash" : null);
    }
  }
  function drawBossBar() {
    const b = boss;
    if (!b || introHold > 0 || b.dead) return;
    const bar = ART().ui.bossbar;
    const isSilent = b.id === "silent";
    const label = isSilent ? "" : ((T().bossShort && T().bossShort[b.id]) || T().bossLabels[b.id] || "");
    const x = ((W - bar.w) / 2) | 0, y = 24;
    if (label) {
      const tw = measure(label) + 16;
      panel(((W - tw) / 2) | 0, 4, tw, 20, "plate");
      drawText(label, W / 2, 8, P().order.bone, "center");
    }
    drawImg(bar.path, x, y);
    const ramp = P().bosses[b.id].ramp;
    const fw = Math.max(0, Math.round(bar.iw * Math.max(0, b.hp / b.maxHp)));
    const hi = isSilent ? P().cult.ember : ramp[Math.min(3, ramp.length - 1)];
    const lo = isSilent ? P().cult.blood : ramp[1];
    if (fw > 0) {
      rect(x + bar.ix, y + bar.iy, fw, bar.ih, lo);
      rect(x + bar.ix, y + bar.iy, fw, 2, hi);
      rect(x + bar.ix + fw - 1, y + bar.iy, 1, bar.ih, P().order.light);
    }
    if (b.phase === 2) rect(x + bar.ix + Math.round(bar.iw * b.phase2At), y + bar.iy - 1, 1, bar.ih + 2, P().order.nexus);
  }
  function drawTeleMarks() {
    for (const m of teleMarks) {
      const x = wx(m.x), y = wy(m.y), w = Math.max(2, Math.round(m.w * WS)), h = Math.max(2, Math.round(m.h * WS));
      const on = ((animT >> 2) & 1) === 0;
      if (m.color === P().ground.void) { rect(x, y, w, h, P().ground.void); continue; }
      // chevron-striped warning strip, blinking: readable, no alpha
      for (let i = 0; i < w; i++) {
        const stripe = ((i + (animT >> 1)) % 8) < 4;
        rect(x + i, y, 1, h, stripe === on ? m.color : P().ground.void);
      }
      rect(x, y - 1, w, 1, on ? P().order.light : m.color);
    }
  }
  function enemyFrame(e) {
    const sh = "enemy-" + e.type;
    if (e.dead) return animFrame(sh, "death", e.animT, 6, false);
    if (e.anim === "hurt" && e.inv > 4) return "hurt0";
    if (e.anim === "attack") return animFrame(sh, "attack", e.animT, 8);
    if (e.anim === "walk") return animFrame(sh, "walk", e.animT, 7);
    return animFrame(sh, "idle", e.animT, 12);
  }
  function drawEnemies() {
    for (const e of enemies) {
      if (e.dead && e.animT > 30) continue;
      if (e.inv > 0 && (e.inv % 4 < 2) && !e.dead && !(e.flashT > 0)) continue;
      drawActor("enemy-" + e.type, enemyFrame(e), e.x + e.w / 2, e.y + e.h, e.facing < 0, e.flashT > 0 && !e.dead ? "flash" : null);
    }
  }
  function drawPickups() {
    for (const p of pickups) {
      if (p.taken) continue;
      drawActor("pickup-heal", animFrame("pickup-heal", "idle", animT, 8), p.x + 4, p.y + 8, false);
    }
  }
  function drawProjectiles() {
    for (const pr of projectiles) {
      const x = wx(pr.x), y = wy(pr.y), w = Math.round(pr.w * WS), h = Math.round(pr.h * WS);
      const fl = (animT >> 2) & 1;
      if (pr.ground) {        // bone spikes rising from the floor
        for (let i = 0; i < w; i++) { const t = Math.abs(i - w / 2) / (w / 2); rect(x + i, y + Math.round(t * h * 0.5), 1, h - Math.round(t * h * 0.5), i < w / 2 ? P().order.boneShade : P().ground.ash); }
        rect(x + (w >> 1), y, 1, 2, P().order.light);
      } else if (pr.vy > 1) {  // falling fire / pillar drops
        rect(x + 1, y - h * 2, w - 2, h * 2, P().cult.blood);
        rect(x, y - h, w, h + 2, P().cult.emberLight);
        rect(x + 2, y, w - 4, 2, fl ? P().order.illumination : P().order.light);
      } else {                 // bolts: tapered body, bright core, flickering tail
        const dir = pr.vx >= 0 ? 1 : -1;
        rect(x, y, w, h, pr.color);
        rect(x + (dir > 0 ? w - 3 : 0), y + 1, 3, h - 2, P().order.light);
        rect(x - dir * (3 + fl * 2) + (dir > 0 ? 0 : w), y + 2, 3 + fl * 2, h - 4, pr.color);
      }
    }
  }
  function drawParticles() {
    for (const p of particles) rect(wx(p.x), wy(p.y), 2, 2, p.color);
  }
  function drawFx() {
    for (const f of fxList) {
      const sh = "fx-" + f.kind + (f.big && sheetOf("fx-" + f.kind + "-big") ? "-big" : "");
      const s = sheetOf(sh); if (!s) continue;
      const fr = Math.min(s.n - 1, Math.floor(f.t / f.dur * s.n));
      blitFrame(sh, fr, wx(f.x), wy(f.y), f.flip);
    }
  }

  // ----- HUD -----
  function drawHUD() {
    // health: serpent-scale pips on a small plate
    panel(4, 4, 12 + player.maxHp * 14, 22, "plate");
    for (let i = 0; i < player.maxHp; i++) blitFrame("ui-hud", i < player.hp ? "hp" : "hp-empty", 10 + i * 14, 8, false);
    const frags = window.SHARDS.fragmentOrder;
    const fx0 = W - 8 - frags.length * 18;
    panel(fx0 - 6, 4, frags.length * 18 + 10, 24, "plate");
    for (let i = 0; i < frags.length; i++) {
      const f = frags[i], x = fx0 + i * 18;
      blitFrame("ui-hud", "sock", x, 7, false);
      if (save.claimed[f]) blitFrame("ui-hud", f, x, 7, false);
      else if (heldByAlly(f)) { blitFrame("ui-hud", f + "-held", x, 7, false); rect(x + 2, 23, 12, 1, P().cult.ember); }
      else blitFrame("ui-hud", f + "-dim", x, 7, false);
    }
  }
  function drawFragIcon(f, x, y, mode) {
    blitFrame("ui-frag16", mode === "empty" ? f + "-dim" : mode === "half" ? f + "-held" : f, x, y, false);
  }
  function portraitPath(id) {
    const p = ART().portraits[id];
    return p && atlas.images.has(p) ? p : null;
  }
  function portraitPathForBoss(id) { return portraitPath(id || "silent"); }
  function drawPortrait(path, x, y) {
    drawImg(ART().ui.portraitFrame.path, x, y);
    drawImg(path, x + 4, y + 4);
  }
  function drawPrompt(worldXPos, worldYPos, label) {
    const glyph = hasPadGlyph(label);
    const tw = measure(label) + 14, th = glyph ? 22 : 20;
    const px = wx(worldXPos) - (tw / 2 | 0);
    const py = wy(worldYPos) - th - 4;
    if (py < 4 || px < 2 || px + tw > W - 2) return;
    panel(px, py, tw, th, "plate");
    drawText(label, px + tw / 2, py + (glyph ? 4 : 5), P().order.illumination, "center");
  }
  function drawPadTab(label, right, boxTop) {
    const tw = measure(label) + 14;
    panel(right - tw, boxTop - 20, tw, 22, "plate");
    drawText(label, right - tw / 2, boxTop - 16, P().order.illumination, "center");
  }
  // Dialogue: portrait in a gold frame + up to 4 lines. Touch while the player can still
  // move (hub, gate): the box sits at the top so the pads never cover it, and it is a tap target.
  function dialogueGeom(str, portrait) {
    const tx = portrait ? 92 : 36;
    const lines = paraLines(str, W - 24 - tx - 14);
    const h = Math.max(portrait ? 72 : 36, lines.length * LH + 18);
    return { tx, lines, h };
  }
  function drawDialogue(str, portraitP, padHint) {
    const top = touchUI() && (scene === "hub" || scene === "traverse");
    const d = dialogueGeom(str, portraitP);
    const y = top ? 30 : H - 10 - d.h;
    if (top) { touchDialogue = true; tapTarget(24, y, W - 48, d.h, () => input.tap("confirm")); }
    panel(24, y, W - 48, d.h);
    if (portraitP) drawPortrait(portraitP, 32, y + ((d.h - 56) >> 1));
    d.lines.forEach((ln, i) => drawText(ln, d.tx, y + 10 + i * LH, P().order.bone));
    if (padHint && padUI()) drawPadTab(padHint, W - 28, y);
  }

  // ----- screens -----
  function drawTitle() {
    uiT++;
    drawImg(ART().ui.title.path, 0, 0);
    drawAnimsScreen(ART().ui.title.anims);
    const wm = ART().ui.wordmark;
    drawImg(wm.path, ((W - wm.w) / 2) | 0, 14);
    const has = !!save.path;
    const items = has
      ? [T().title.menuNew, T().title.menuContinue, T().title.menuSettings, T().title.menuReset]
      : [touchUI() ? T().touch.pressStart : padUI() ? T().pad.pressStart : T().title.pressStart, T().title.menuSettings];
    const t = touchUI();
    const lineH = t ? 28 : 18;
    const menuTop = 112;
    const mw = 220, mh = items.length * lineH + 14;
    panel(((W - mw) / 2) | 0, menuTop - 9, mw, mh);
    items.forEach((it, i) => {
      menuText(it, W / 2, menuTop + i * lineH + (t ? 5 : 0), i === menuIx, "center");
      const twoTap = has && (i === 0 || i === 3);
      menuRow(((W - mw) / 2) | 0, menuTop + i * lineH + (t ? 5 : 0), mw, lineH, "title" + i, twoTap, () => { menuIx = i; });
    });
    let y = menuTop - 9 + mh + 8;
    if (migrated && save.migratedFrom === "v1") {
      drawText(T().title.migrated || "", W / 2, y, P().order.nexus, "center"); y += LH;
    }
    if (t) {
      if (armedKey === "title0" || armedKey === "title3") drawText(T().touch.again, W / 2, H - 20, P().order.boneShade, "center");
      return;
    }
    // controls: keyboard and controller columns, or the connected pad's glyph layout
    const cy = Math.max(y + 2, 192);
    // inset so the two pilgrims on the side ledges stay visible
    panel(66, cy - 6, W - 132, H - cy - 2);
    if (input.padConnected) {
      drawText(T().pad.heading, 78, cy, P().order.illumination);
      if (padUI()) drawText(T().pad.title, W - 78, cy, P().ground.smoke, "right");
      const lay = T().pad.layout, rows = 2, colW = 114;
      lay.forEach((ln, i) => drawText(ln, 80 + ((i / rows) | 0) * colW, cy + 18 + (i % rows) * 17, P().order.boneShade));
      return;
    }
    drawText(T().controls.heading, 78, cy, P().order.illumination);
    drawText("Gamepad", 250, cy, P().order.illumination);
    const kb = T().controls.kb.slice(0, 4), pd = T().controls.pad.slice(0, 4);
    kb.forEach((ln, i) => drawText(ln, 78, cy + 15 + i * 12, P().order.boneShade));
    pd.forEach((ln, i) => drawText(ln, 250, cy + 15 + i * 12, P().order.boneShade));
  }
  function drawAnimsScreen(list) {
    for (const a of list || []) {
      const s = sheetOf(a.sheet); if (!s) continue;
      const n = (s.anims && s.anims[a.anim]) || 1;
      blitFrame(a.sheet, a.anim + (((uiT + (a.ph || 0)) / (a.spd || 6) | 0) % n), a.x, a.y, !!a.flip);
    }
  }

  function drawPath() {
    uiT++;
    drawImg(ART().ui.pathBg.path, 0, 0);
    drawText(T().pathSelect.heading, W / 2, 10, P().order.illumination, "center");
    if (padUI()) drawText(T().pad.path, W - 14, 10, P().ground.smoke, "right");
    const cols = [
      { x: 12, key: "order", sheet: "player-order", accent: P().order.nexus, nameC: P().order.illumination, por: "monk" },
      { x: 246, key: "cult", sheet: "player-cult", accent: P().cult.ember, nameC: P().cult.emberLight, por: "acolyte" }
    ];
    cols.forEach((c, i) => menuRow(c.x, 30, 222, 210, "path" + i, true, () => { menuIx = i; }, true));
    cols.forEach((c, i) => {
      const sel = menuIx === i;
      panel(c.x, 30, 222, 210, sel ? "panelSel" : "panel");
      const d = T().pathSelect[c.key];
      const pp = portraitPath(c.por);
      if (pp) drawPortrait(pp, c.x + 10, 40);
      drawText(d.name, c.x + 74, 46, sel ? c.nameC : P().order.bone);
      drawText(d.role, c.x + 74, 62, P().ground.smoke);
      if (sel) rect(c.x + 74, 78, measure(d.name), 1, c.accent);
      let y = 104;
      for (const line of d.blurb) y = drawWrapped(line, c.x + 12, y, 198, P().order.boneShade) + 4;
      blitFrame(c.sheet, sel ? animFrame(c.sheet, "idle", uiT, 10) : "idle0", c.x + 111, 232, i === 1);
    });
    const note = touchUI() ? T().touch.pathConfirm : T().pathSelect.lockNote, nw = measure(note) + 16;
    panel((W - nw) >> 1, 245, nw, 19, "plate");
    drawText(note, W / 2, 250, P().ground.ash, "center");
  }

  function drawSettings() {
    uiT++;
    drawImg(ART().ui.menuBg.path, 0, 0);
    const rows = [
      `${T().settings.master}: ${(synth.volume.master * 100) | 0}`,
      `${T().settings.music}: ${(synth.volume.music * 100) | 0}`,
      `${T().settings.sfx}: ${(synth.volume.sfx * 100) | 0}`,
      `${T().settings.fullscreen}: ${document.fullscreenElement ? "On" : "Off"}`,
      `${T().settings.vibration}: ${vibration ? "On" : "Off"}`,
      T().settings.back
    ];
    const t = touchUI(), pitch = t ? 34 : 22, top = t ? 52 : 70;
    panel(60, top - 40, W - 120, rows.length * pitch + 56);
    drawText(T().settings.heading, W / 2, top - 30, P().order.illumination, "center");
    rows.forEach((r, i) => {
      const y = top + i * pitch;
      menuText(r, 110, y, i === settingsIx, "left");
      if (i <= 2) {
        // volume: a 10-step gauge
        const v = Math.round([synth.volume.master, synth.volume.music, synth.volume.sfx][i] * 10);
        for (let k = 0; k < 10; k++) rect(300 + k * 8, y + 2, 6, 7, k < v ? P().order.nexus : P().ground.stone3);
      }
      if (!t) return;
      if (i <= 2) {
        drawText("-", 76, y, P().order.boneShade); drawText("+", W - 82, y, P().order.boneShade);
        const key = ["master", "music", "sfx"][i];
        const ty = y - ((pitch - 9) >> 1);
        tapTarget(60, ty, W / 2 - 60, pitch, () => { settingsIx = i; synth.setVolume(key, synth.volume[key] - 0.1); persist(); });
        tapTarget(W / 2, ty, W / 2 - 60, pitch, () => { settingsIx = i; synth.setVolume(key, synth.volume[key] + 0.1); persist(); });
      } else menuRow(60, y, W - 120, pitch, "set" + i, false, () => { settingsIx = i; });
    });
    if (padUI()) drawText(T().pad.settings, W / 2, H - 22, P().ground.smoke, "center");
  }

  function nextFragmentHint() {
    const order = window.SHARDS.fragmentOrder;
    for (const f of order) {
      if (!gathered(f)) {
        const z = window.SHARDS.zones.find(z => z.fragment === f);
        const zt = T().zones[z.id];
        const place = (zt.hintBy && zt.hintBy[path]) || zt.hint || (zt.name + (zt.sub ? ", " + zt.sub : ""));
        const bearer = (T().hintBearer || {})[z.bossId] || T().bossShort[z.bossId] || "";
        return T().guideNext[path].replace("{frag}", T().fragments[f]).replace("{place}", place).replace("{bearer}", bearer);
      }
    }
    return T().guideNext.all;
  }
  function idlerSheet(n, i) {
    if (n.sheet2) return n.sheet2;
    const fac = levelId === "cultHub" ? "cult" : "order";
    return "idler-" + fac + "-" + "abc"[i % 3];
  }
  function drawHubNPCs() {
    (level.npcs || []).forEach((n, i) => {
      const sh = idlerSheet(n, i);
      drawActor(sh, animFrame(sh, "idle", (n.animT || 0) + i * 37, 12), n.x + 8, n.y + 24, (n.facing || 1) < 0);
    });
  }
  function guideSheet() { return level.guide.id === "ryan" ? "npc-ryan" : "npc-jeriah"; }
  function drawGuide() {
    const gd = level.guide, sh = guideSheet();
    const near = player && Math.abs(player.x - gd.x) < 28 && Math.abs(player.y - gd.y) < 28;
    const fr = near && hubSaid ? animFrame(sh, "talk", animT, 9) : animFrame(sh, "idle", animT, 12);
    drawActor(sh, fr, gd.x + 8, gd.y + 24, player ? player.x < gd.x : true);
  }
  function drawHubUI() {
    const guide = level.guide;
    const pad = level.travelPad;
    const nearGuide = Math.abs(player.x - guide.x) < 28 && Math.abs(player.y - guide.y) < 28;
    const nearTravel = pad && Math.abs((player.x + player.w / 2) - (pad.x + pad.w / 2)) < 40 && Math.abs(player.y - (pad.y - 4)) < 36;
    const portrait = portraitPath(guide.id === "ryan" ? "ryan" : guide.id);
    const nearAltar = allClaimed() && level.altar && aabb(player, { x: level.altar.x - 10, y: level.altar.y - 10, w: level.altar.w + 20, h: level.altar.h + 28 });
    const dialogueOpen = (nearGuide && hubSaid) || nearAltar;
    if (!dialogueOpen) {
      const pu = padUI();
      if (nearGuide && !hubSaid) drawPrompt(guide.x + 8, guide.y - 14, pu ? T().pad.talk : T().prompts.talk);
      if (nearTravel) drawPrompt(pad.x + pad.w / 2, pad.y - 22, pu ? T().pad.travel : T().prompts.travel);
      if (nearAltar) drawPrompt(level.altar.x + 8, level.altar.y - 8, pu ? T().pad.altar : T().prompts.altar);
    }
    if (nearGuide && hubSaid) {
      const line = T().guideLines[path][lineIx % T().guideLines[path].length];
      drawDialogue(line + "\n" + nextFragmentHint(), portrait, T().pad.next);
    } else if (nearAltar) {
      drawDialogue(path === "order" ? T().hub.allSixOrder : T().hub.allSixCult, null, T().pad.altar);
    }
    if (tutPrompt && tutTimer > 0 && titleCard <= 0 && !(touchUI() && dialogueOpen)) {
      const line = tutLine(tutPrompt);
      const tw = Math.min(W - 36, measure(line) + 24);
      const glyph = hasPadGlyph(line);
      panel(((W - tw) / 2) | 0, 34, tw, glyph ? 24 : 22);
      drawText(line, W / 2, glyph ? 39 : 40, P().order.illumination, "center");
    }
  }

  function drawTravel() {
    uiT++;
    rect(0, 0, W, H, P().ground.void);
    const t = touchUI();
    const zones = pathZones();
    if (t) panel(6, 4, W - 12, H - 8); else panel(16, 14, W - 32, H - 28);
    drawText(T().hub.travelHeading, t ? W / 2 : 150, t ? 10 : 24, P().order.illumination, "center");
    const pitch = t ? Math.min(36, Math.floor((H - 30) / (zones.length + 1))) : 24;
    let y = t ? 30 : 48;
    const listW = t ? W - 24 : 270;
    zones.forEach((z, i) => {
      const zt = T().zones[z.id];
      const claimed = !!save.claimed[z.fragment];
      const unlocked = zoneUnlocked(z);
      const sel = i === travelIx;
      let label = zt.travel || (t ? zt.name + (zt.sub ? " - " + zt.sub : "") : zt.name); // desktop: the preview card shows the subtitle
      let c = P().order.boneShade;
      if (!unlocked) { label += "  [" + T().hub.travelLocked + "]"; c = P().ground.ash; }
      if (claimed) { label += "  [" + T().hub.travelClaimed + "]"; c = P().order.temple; }
      if (sel) c = P().order.illumination;
      blitFrame("ui-frag16", claimed ? z.fragment : z.fragment + "-dim", 30, y + (t ? 4 : 0) - 3, false);
      drawText(label, 52, y + (t ? 4 : 0), c);
      if (sel) cursor(18, y + (t ? 5 : 1));
      menuRow(12, y + (t ? 4 : 0), listW, pitch, "travel" + i, false, () => { travelIx = i; });
      y += pitch;
    });
    const stay = travelIx === zones.length;
    menuText(T().hub.travelBack, 52, y + (t ? 4 : 4), stay, "left");
    menuRow(12, y + (t ? 4 : 4), listW, pitch, "travelStay", false, () => { travelIx = zones.length; });
    if (!t) {
      // preview of the selected destination
      const z = zones[Math.min(travelIx, zones.length - 1)];
      const th = ART().thumbs[z.id];
      const px = 300, py = 46;
      if (th) { drawImg(ART().ui.thumbFrame.path, px - 4, py - 4); drawImg(th, px, py); }
      const zt = T().zones[z.id];
      const nm = zt.name;
      drawText(nm, px + 76, py + 98, P().order.bone, "center");
      if (zt.sub) drawText(zt.sub, px + 76, py + 114, P().ground.smoke, "center");
      if (padUI()) drawText(T().pad.menu, W - 30, H - 34, P().ground.smoke, "right");
    }
  }

  function drawTitleCard() {
    if (titleCard <= 0 || !titleCardText) return;
    titleCard--;
    const tw = Math.min(W - 40, measure(titleCardText) + 32);
    const tx = ((W - tw) / 2) | 0;
    const ty = (touchUI() && tx + tw > W - 50) ? 78 : 40;
    panel(tx, ty, tw, 26, "plate");
    drawText(titleCardText, W / 2, ty + 8, P().order.illumination, "center");
  }
  function drawFade() {
    if (fade <= 0 && fadeDir === 0) return;
    if (fadeDir) {
      fade += fadeDir;
      if (fade >= 16 && fadeDir > 0) {
        fadeDir = -1;
        if (fadeNext) { fadeNext(); fadeNext = null; }
      }
      if (fade <= 0 && fadeDir < 0) { fade = 0; fadeDir = 0; }
    }
    if (fade > 0) {
      // ordered-dither wipe in void (no alpha)
      const lv = Math.min(16, fade);
      if (lv >= 16) rect(0, 0, W, H, P().ground.void);
      else { g.fillStyle = fadePattern(lv); g.fillRect(0, 0, W, H); }
    }
  }
  const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  const fadePatterns = {};
  function fadePattern(lv) {
    if (fadePatterns[lv]) return fadePatterns[lv];
    const c = document.createElement("canvas"); c.width = 4; c.height = 4;
    const cg = c.getContext("2d"); cg.fillStyle = P().ground.void;
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (BAYER[y][x] < lv) cg.fillRect(x, y, 1, 1);
    return (fadePatterns[lv] = g.createPattern(c, "repeat"));
  }
  function goScene(fn) {
    fade = 1; fadeDir = 1; fadeNext = fn;
  }

  // ---------- touch layer (v6, v2 scale) ----------
  // Pads: 42x42 plates (>= 44 CSS px at the ~1.1x+ fit every phone gets in landscape).
  // Multi-touch: every active finger maps to a pad on each touchstart/move/end.
  const PAD_ACTS = ["left", "right", "jump", "strike", "dodge", "skill", "cancel", "confirm", "up", "down"];
  const PAD = 42;
  let tapTargets = [], drawnTargets = [], padHeld = new Set(), touchDialogue = false, lastTouchDialogue = false;
  let armedKey = "", fsTried = false;
  function touchUI() { return input.isTouch && input.lastDevice === "touch"; }
  function tapTarget(x, y, w, h, fn) { if (touchUI()) tapTargets.push({ x, y, w, h, fn }); }
  function menuRow(x, textY, w, pitch, key, twoTap, select, isBox) {
    if (!touchUI()) return;
    const y = isBox ? textY : textY - ((pitch - 9) >> 1);
    tapTarget(x, y, w, pitch, () => {
      select();
      if (!twoTap || armedKey === key) { armedKey = ""; input.tap("confirm"); }
      else { armedKey = key; synth.sfx("menuMove"); }
    });
  }
  function hubNear() {
    const out = { guide: false, travel: false, altar: false };
    if (scene !== "hub" || !level || !player || !level.guide) return out;
    const guide = level.guide, pad = level.travelPad;
    out.guide = Math.abs(player.x - guide.x) < 28 && Math.abs(player.y - guide.y) < 28;
    out.travel = !!pad && Math.abs((player.x + player.w / 2) - (pad.x + pad.w / 2)) < 40 && Math.abs(player.y - (pad.y - 4)) < 36;
    const a = level.altar;
    out.altar = !!(allClaimed() && a && aabb(player, { x: a.x - 10, y: a.y - 10, w: a.w + 20, h: a.h + 28 }));
    return out;
  }
  function contextAction() {
    if (!player || !level) return false;
    if (scene === "hub") { const n = hubNear(); return n.guide || n.travel || n.altar; }
    if (scene === "traverse") return !!(level.bossGate && aabb(player, level.bossGate));
    return false;
  }
  function touchLayout() {
    if (!touchUI() || portrait) return [];
    const play = scene === "hub" || scene === "traverse" || (scene === "arena" && introHold <= 0);
    if (!play) return [];
    const L = [
      { name: "left", act: "left", x: 6, y: H - 48 },
      { name: "right", act: "right", x: 54, y: H - 48 },
      { name: "strike", act: "strike", x: W - 96, y: H - 48 },
      { name: "jump", act: "jump", x: W - 48, y: H - 48 },
      { name: "dodge", act: "dodge", x: W - 96, y: H - 96 },
      { name: "skill", act: "skill", x: W - 48, y: H - 96 },
    ];
    if (!lastTouchDialogue) L.push({ name: "pause", act: "cancel", x: W - 46, y: 32 });
    if (contextAction()) L.push({ name: "ok", act: "confirm", x: (W / 2 - 21) | 0, y: H - 48 });
    return L;
  }
  function drawTouch() {
    lastTouchDialogue = touchDialogue;
    for (const b of touchLayout()) blitFrame("ui-touch", padHeld.has(b.name) ? b.name + "-on" : b.name, b.x, b.y, false);
  }
  function toGame(t) {
    const r = canvas.getBoundingClientRect();
    return { x: ((t.clientX - r.left) / r.width) * W, y: ((t.clientY - r.top) / r.height) * H };
  }
  function padAt(gx, gy) {
    const L = touchLayout();
    let best = null, bd = 1e9;
    for (const b of L) {
      const r = (b.name === "pause" || b.name === "ok") ? 25 : 31;
      const d = Math.max(Math.abs(gx - (b.x + PAD / 2)), Math.abs(gy - (b.y + PAD / 2)));
      if (d <= r && d < bd) { bd = d; best = b; }
    }
    if (!best && gy > H - 108 && gx < 114) best = L.find(b => b.name === (gx < 51 ? "left" : "right")) || null;
    return best;
  }
  function syncPads(list) {
    const names = new Set(), acts = new Set();
    for (const t of list) {
      const p = toGame(t);
      const b = padAt(p.x, p.y);
      if (b) { names.add(b.name); acts.add(b.act); }
    }
    for (const a of PAD_ACTS) {
      const on = acts.has(a);
      if (on !== !!input.touch[a]) input.setTouch(a, on);
    }
    padHeld = names;
  }
  function releasePads() { padHeld = new Set(); for (const a of PAD_ACTS) input.touch[a] = false; }
  function isStandalone() {
    return (window.matchMedia && (matchMedia("(display-mode: fullscreen)").matches || matchMedia("(display-mode: standalone)").matches)) || navigator.standalone === true;
  }
  function enterFullscreen() {
    const el = document.documentElement;
    const req = el.requestFullscreen ? () => el.requestFullscreen({ navigationUI: "hide" })
      : el.webkitRequestFullscreen ? () => el.webkitRequestFullscreen() : null;
    if (!req) return;
    try {
      const pr = req();
      const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock("landscape").catch(() => {}); } catch (_) {} };
      if (pr && pr.then) pr.then(lock).catch(() => {}); else lock();
    } catch (_) {}
  }
  function onTouchStart(e) {
    if (e.cancelable) e.preventDefault();
    input.isTouch = true; input.lastDevice = "touch";
    synth.resume();
    if (portrait) return;
    for (const t of e.changedTouches) {
      const p = toGame(t);
      if (padAt(p.x, p.y)) continue;
      for (let i = drawnTargets.length - 1; i >= 0; i--) {
        const tg = drawnTargets[i];
        if (p.x >= tg.x && p.x < tg.x + tg.w && p.y >= tg.y && p.y < tg.y + tg.h) { tg.fn(); break; }
      }
    }
    syncPads(e.touches);
  }
  function onTouchMove(e) { if (e.cancelable) e.preventDefault(); if (!portrait) syncPads(e.touches); }
  function onTouchEnd(e) {
    if (e.cancelable) e.preventDefault();
    synth.resume();
    syncPads(e.touches);
    if (!fsTried && !isStandalone() && !document.fullscreenElement &&
        (document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
      fsTried = true; enterFullscreen();
    }
  }
  const tOpts = { passive: false };
  document.addEventListener("touchstart", onTouchStart, tOpts);
  document.addEventListener("touchmove", onTouchMove, tOpts);
  document.addEventListener("touchend", onTouchEnd, tOpts);
  document.addEventListener("touchcancel", (e) => syncPads(e.touches), tOpts);
  for (const ev of ["gesturestart", "gesturechange", "gestureend", "dblclick", "contextmenu", "selectstart"]) {
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  }

  function drawRotate() {
    const keep = g; g = pg;
    uiT++;
    drawImg(ART().ui.rotateBg.path, 0, 0);
    const wm = ART().ui.wordmark;
    const sc = atlas.images.get(ART().ui.wordmarkSmall.path);
    if (sc) g.drawImage(sc, ((PW - sc.width) / 2) | 0, 40);
    panel(14, 176, PW - 28, 200);
    blitFrame("ui-rotate", ((uiT / 24) | 0) % 2, PW / 2, 236, false);
    drawText(T().touch.rotateHead, PW / 2, 280, P().order.illumination, "center");
    const lines = wrapLines(T().touch.rotateBody, PW - 64);
    lines.forEach((ln, i) => drawText(ln, PW / 2, 302 + i * LH, P().order.boneShade, "center"));
    drawText(T().title.subline, PW / 2, 440, P().ground.ash, "center");
    void wm;
    g = keep;
  }

  let claimT = 0;
  function drawClaim() {
    claimT++;
    drawImg(ART().ui.menuBg.path, 0, 0);
    const frag = lastClaimed;
    if (frag) {
      blitFrame("fx-claim", Math.min(sheetOf("fx-claim").n - 1, (claimT / 4) | 0), W / 2, 92, false);
      blitFrame("ui-frag32", frag, W / 2, 92, false);
    }
    const lines = wrapLines(claimMsg, W - 120);
    const h = lines.length * LH + 22;
    panel(48, 142, W - 96, h);
    lines.forEach((ln, i) => drawText(ln, W / 2, 152 + i * LH, P().order.bone, "center"));
    drawText(touchUI() ? T().touch.claimPrompt : padUI() ? T().pad.claimPrompt : T().zoneClear.prompt, W / 2, 152 + h + 6, P().ground.smoke, "center");
    tapTarget(0, 0, W, H, () => input.tap("confirm"));
  }
  function drawDefeat() {
    uiT++;
    drawImg(ART().ui.defeatBg.path, 0, 0);
    panel(110, 56, W - 220, 150);
    drawText(T().defeat.heading, W / 2, 72, P().order.bone, "center");
    drawText(T().defeat.sub, W / 2, 92, P().ground.smoke, "center");
    const pitch = touchUI() ? 32 : 20;
    [T().defeat.retry, T().defeat.toHub].forEach((it, i) => {
      menuText(it, W / 2, 126 + i * pitch, i === menuIx, "center");
      menuRow(110, 126 + i * pitch, W - 220, pitch, "defeat" + i, false, () => { menuIx = i; });
    });
    if (padUI()) drawText(T().pad.defeat, W / 2, 188, P().ground.smoke, "center");
  }
  // Final scene: the hub at night-light with the guide and the six fragments; text in a bottom
  // panel. Order: Ryan at the temple altar, six fragments set apart. Cult: General Jeriah in the
  // hideout, six fragments brought together. Blevins is never drawn; the Moon is no destination.
  let endT = 0;
  function drawEnding() {
    endT++; animT++;
    const isOrder = path === "order";
    const head = isOrder ? T().endings.order.heading : T().endings.cult.heading;
    const tw = W - 64;
    const rows = [];
    const show = Math.min(endingIx + 1, endingLines.length);
    for (let i = 0; i < show; i++) { for (const ln of wrapLines(endingLines[i], tw)) rows.push(ln); rows.push(null); }
    if (rows.length && rows[rows.length - 1] === null) rows.pop();
    let bodyH = 0; for (const r of rows) bodyH += r === null ? 5 : LH;
    const ph = 12 + 18 + bodyH + 6 + 16 + 6;
    const py = H - 6 - ph;
    if (level) {
      const a = level.altar;
      camPx = Math.max(0, Math.min(Math.round(level.w * WS) - W, Math.round((a.x + 8) * WS) - W / 2));
      const lift = Math.max(0, wy(a.y + a.h) + 6 - (py - 2));
      g.save(); g.translate(0, -lift);
      drawBG(); drawAmbient();
      const ax = a.x + a.w / 2;
      drawActor(isOrder ? "altar-order" : "altar-cult", animFrame(isOrder ? "altar-order" : "altar-cult", "lit", animT, 8), ax, a.y + a.h, false);
      const gsh = isOrder ? "npc-ryan" : "npc-jeriah";
      drawActor(gsh, animFrame(gsh, "idle", animT, 12), ax - 26, a.y + a.h, false);
      drawActor(playerSheet(), animFrame(playerSheet(), "idle", animT, 10), ax + 26, a.y + a.h, true);
      const frags = window.SHARDS.fragmentOrder;
      const cx = wx(ax), cy = wy(a.y) - 30;
      frags.forEach((f, i) => {
        let fx, fy;
        if (isOrder) { fx = cx - 75 + i * 30; fy = cy - 10 + ((i % 2) ? -6 : 0); } // set apart, each alone
        else { const ang = (i / 6) * Math.PI * 2 + endT * 0.01; fx = cx + Math.round(Math.cos(ang) * 16); fy = cy - 8 + Math.round(Math.sin(ang) * 9); } // brought together
        const bob = ((endT >> 4) + i) % 2;
        blitFrame("ui-frag16", f, fx - 8, fy - 8 + bob, false);
      });
      drawFront();
      g.restore();
      if (lift > 0) rect(0, H - lift, W, lift, P().ground.void);
    } else rect(0, 0, W, H, P().ground.obsidian);
    panel(16, py, W - 32, ph);
    drawText(head, W / 2, py + 10, P().order.illumination, "center");
    let y = py + 12 + 18;
    for (const r of rows) { if (r === null) { y += 5; continue; } drawText(r, 32, y, P().order.bone); y += LH; }
    if (endingIx >= endingLines.length - 1) drawText(touchUI() ? T().touch.end : padUI() ? T().pad.end : T().endings.end, W / 2, py + ph - 20, P().ground.smoke, "center");
    tapTarget(0, 0, W, H, () => input.tap("confirm"));
  }
  function drawFragmentsPage() {
    panel(20, 8, W - 40, H - 16);
    drawText(T().fragmentPage.heading, W / 2, 18, P().order.illumination, "center");
    const frags = window.SHARDS.fragmentOrder;
    let y = 42;
    for (let i = fragScroll; i < Math.min(fragScroll + 3, frags.length); i++) {
      const f = frags[i];
      const e = T().fragmentPage.entries[f];
      const claimed = !!save.claimed[f];
      const held = !claimed && heldByAlly(f);
      drawFragIcon(f, 36, y - 3, claimed ? "full" : held ? "half" : "empty");
      drawText(e.name, 60, y, claimed || held ? P().order.illumination : P().order.boneShade);
      const status = claimed ? T().fragmentPage.claimed : held ? T().fragmentPage.held : T().fragmentPage.unclaimed;
      drawText(status, W - 40, y, claimed ? P().order.nexus : held ? P().cult.emberLight : P().ground.ash, "right");
      drawText(T().fragmentPage.bearer + ": " + e.bearer, 60, y + LH, P().ground.smoke);
      drawText(T().fragmentPage.found + ": " + (held ? T().fragmentPage.heldFound : e.found), 60, y + LH * 2, P().ground.ash);
      y += 62;
    }
    const nx = W - 34;
    if (fragScroll > 0) blitFrame("ui-cursor", "up", nx, 40, false);
    if (fragScroll < 3) blitFrame("ui-cursor", "down", nx, H - 52, false);
    if (touchUI()) {
      drawText(T().touch.fragBack, W / 2, H - 30, P().ground.smoke, "center");
      tapTarget(20, H - 46, W - 40, 38, () => input.tap("cancel"));
      tapTarget(20, 8, W - 40, 100, () => input.tap("up"));
      tapTarget(20, 108, W - 40, H - 154, () => input.tap("down"));
    } else drawText(padUI() ? T().pad.fragBack : T().pause.back + " (Esc/Enter)", W / 2, H - 30, P().ground.smoke, "center");
  }
  function drawPause() {
    uiT++;
    if (pausePage === "fragments") { drawFragmentsPage(); return; }
    const t = touchUI(), pitch = t ? 32 : 22;
    const items = [T().hud.resume, T().hud.fragments, T().hud.settings, T().hud.toHub, T().hud.toTitle];
    const ph = 44 + items.length * pitch + (padUI() ? 20 : 4);
    const py = ((H - ph) / 2) | 0;
    panel(120, py, W - 240, ph);
    drawText(T().hud.paused, W / 2, py + 12, P().order.illumination, "center");
    const top = py + 40;
    items.forEach((it, i) => {
      menuText(it, W / 2, top + i * pitch, i === pauseIx, "center");
      menuRow(120, top + i * pitch, W - 240, pitch, "pause" + i, false, () => { pauseIx = i; });
    });
    if (padUI()) drawText(T().pad.pause, W / 2, py + ph - 20, P().ground.smoke, "center");
  }

  function drawWorld() {
    animT++;
    camPx = Math.round(cameraX * WS);
    drawBG();
    drawInteractables();
    drawPickups();
    if (scene === "hub" || (scene === "pause" && level.kind === "hub") || scene === "travel") { drawHubNPCs(); drawGuide(); }
    drawEnemies();
    if (scene === "arena" || (scene === "pause" && level.kind === "arena")) drawBoss();
    if (player) drawPlayer();
    drawProjectiles();
    drawFx();
    drawParticles();
    drawFront();
    drawAmbient();
    if (player) drawHUD();
    if (boss && (scene === "arena" || scene === "pause")) drawBossBar();
    if (scene === "hub" || (scene === "pause" && level.kind === "hub")) drawHubUI();
    if (scene === "travel") drawTravel();
    if (scene === "traverse") {
      const gate = level.bossGate;
      if (gate && aabb(player, gate)) drawDialogue(touchUI() ? T().touch.gate : padUI() ? T().pad.gate : T().zoneClear.gate);
    }
    if (scene === "arena" && introHold > 0 && boss) {
      // Boss intro card. Silent: portrait only, never a name.
      const label = T().bossLabels[boss.id];
      const port = portraitPathForBoss(boss.id);
      const textW = label ? measure(label) : 0;
      const tw = Math.min(W - 24, Math.max(textW + (port ? 84 : 32), port ? 64 : 48));
      const th = port ? 64 : 28;
      const tx = ((W - tw) / 2) | 0, ty = 34;
      panel(tx, ty, tw, th);
      if (port) drawPortrait(port, tx + 4, ty + 4);
      if (label) drawText(label, port ? tx + 70 : W / 2, port ? ty + 26 : ty + 9, P().order.illumination, port ? undefined : "center");
      tapTarget(0, 0, W, H, () => input.tap("confirm"));
      const intro = introPages[Math.min(introPage, introPages.length - 1)] || "";
      const last = introPage >= introPages.length - 1;
      drawDialogue(last ? intro + "\n" + T().bossReason[path] : intro, null, last ? T().pad.skip : T().pad.next);
    }
    if (scene === "pause") drawPause();
    if (scene !== "arena") {
      if (touchDialogue && titleCard > 0) titleCard--;
      else drawTitleCard();
    }
  }

  function draw() {
    if (portrait && !bootError) {
      drawRotate();
      const out = canvas.getContext("2d");
      out.imageSmoothingEnabled = false;
      out.drawImage(pfb, 0, 0, canvas.width, canvas.height);
      return;
    }
    tapTargets = []; touchDialogue = false;
    if (bootError) {
      rect(0, 0, W, H, P().ground.obsidian);
      drawWrapped("BOOT ERROR: " + bootError, 12, 12, W - 24, P().cult.ember);
    } else if (flash > 0 && scene !== "claim") {
      rect(0, 0, W, H, P().order.light);
    } else if (scene === "title") drawTitle();
    else if (scene === "path") drawPath();
    else if (scene === "settings") drawSettings();
    else if (scene === "claim") drawClaim();
    else if (scene === "defeat") drawDefeat();
    else if (scene === "ending") drawEnding();
    else if (level) drawWorld();
    else rect(0, 0, W, H, P().ground.obsidian);

    drawTouch();
    drawFade();
    drawnTargets = fadeDir ? [] : tapTargets;

    const out = canvas.getContext("2d");
    out.imageSmoothingEnabled = false;
    out.fillStyle = P().ground.void;
    out.fillRect(0, 0, canvas.width, canvas.height);
    const m = shake > 8 ? 2 : 1;
    const ox = shake ? (((Math.random() * 3) | 0) - 1) * m : 0;
    const oy = shake ? (((Math.random() * 3) | 0) - 1) * m : 0;
    out.drawImage(fb, Math.round(ox * scale), Math.round(oy * scale), canvas.width, canvas.height);
  }

  // ---------- debug ----------
  window.SHARDS.debug = {
    claim(frag) { if (heldByAlly(frag)) return; save.claimed[frag] = true; persist(); },
    claimAll() { for (const z of pathZones()) save.claimed[z.fragment] = true; persist(); },
    setPath(p) { path = p; save.path = p; normalizeSave(); persist(); },
    travelZones() { return pathZones().map(z => z.id); },
    allGathered() { return allClaimed(); },
    held() { return window.SHARDS.fragmentOrder.filter(f => !save.claimed[f] && heldByAlly(f)); },
    introPages() { return introPages.slice(); },
    toAltar() { if (scene === "hub" && level && level.altar && player) { player.x = level.altar.x + 2; player.y = level.altar.y - player.h; player.vx = player.vy = 0; } },
    hint() { return path ? nextFragmentHint() : ""; },
    travel() { if (scene === "hub") enterTravel(); },
    hub() { enterHub(); },
    ending() { enterEnding(); },
    warp(zoneId) { path = path || "order"; save.path = path; persist(); enterArena(zoneId); },
    traverse(zoneId) { path = path || "order"; save.path = path; persist(); enterTraverse(zoneId); },
    killBoss() {
      if (!boss || boss.dead) return;
      boss.inv = 0; boss.hp = 0; boss.dead = true; boss.anim = "death";
      rumble("bossDeath");
      enterClaim(boss.fragment);
    },
    damageBoss(n) { if (boss) { boss.inv = 0; damageBoss(n || 1); } },
    save() { return JSON.parse(JSON.stringify(save)); },
    pos() { return player ? { x: player.x, y: player.y, scene, levelId } : { scene }; },
    place(x, y) { if (player) { player.x = x; player.y = y; player.vx = player.vy = 0; cameraX = Math.max(0, Math.min((level.w || VW) - VW, x - VW / 2)); } },
    scene() { return scene; },
    boss() { return boss ? { id: boss.id, hp: boss.hp, phase: boss.phase, dead: boss.dead, x: boss.x, y: boss.y, visible: boss.visible, move: boss.move, teleT: boss.teleT, moveT: boss.moveT } : null; },
    forceTouch(on) { input.isTouch = !!on; if (on) input.lastDevice = "touch"; sizeCanvas(); },
    touchInfo() {
      return { touchUI: touchUI(), portrait, scale, cssFit, pads: touchLayout().map(b => ({ name: b.name, x: b.x, y: b.y, w: PAD, h: PAD })), W, H,
        targets: drawnTargets.map(t => ({ x: t.x, y: t.y, w: t.w, h: t.h })), dialogueTop: lastTouchDialogue, held: [...padHeld],
        canvas: (() => { const r = canvas.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })() };
    },
    menu() { return { menuIx, travelIx, pauseIx, settingsIx, pausePage, introHold, endingIx, tutPrompt: tutPrompt ? tutLine(tutPrompt) : "", tutStep: tutPrompt, tutorial: save.tutorial, volume: Object.assign({}, synth.volume), hubSaid, titleCard }; },
    player() { return player ? { x: player.x, y: player.y, vx: player.vx, vy: player.vy, hp: player.hp, onGround: !!player.onGround, anim: player.anim } : null; },
    setIntro(n) { introHold = n|0; },
    skipIntro() { introHold = 0; introPage = introPages.length - 1; if (level) { save.seenIntro[level.zone || levelId] = true; persist(); } },
    god(on) { godMode = on !== false; if (player) player.inv = godMode ? 9999 : 0; },
    // v7 controller: active device, glyph prompts, rumble log, Vibration setting
    pad() { return { lastDevice: input.lastDevice, padUI: padUI(), connected: !!input.padConnected, index: input.padIndex, vibration, rumbleLog: input.rumbleLog.slice() }; },
    setVibration(on) { setVibration(on); return vibration; },
    isGod() { return !!godMode; },
    // v2
    res() { return { W, H, WS, VW, VH }; },
    fx() { return fxList.map(f => f.kind); },
    migrated() { return { migrated, from: save.migratedFrom || null }; },
    bossDying() { return !!(boss && boss.dead && boss.deathT > 0); },
    art() { return { levelArt: !!levelArt(), sheets: Object.keys(ART().sheets).length }; }
  };

  // ---------- loop ----------
  let last = performance.now(), acc = 0;
  const STEP = 1000 / 60;
  function frame(now) {
    acc += Math.min(100, now - last); last = now;
    if (portrait) acc = 0; // portrait phone: the game waits behind the rotate screen
    while (acc >= STEP) { update(); acc -= STEP; }
    draw();
    requestAnimationFrame(frame);
  }

  window.SHARDS.start = async function () {
    sizeCanvas();
    try {
      await atlas.loadAll();
      await atlas.loadOptional(window.SHARDS.optionalAssets || [
        "tiles-deep-lairs.png",
        "tile-hazard-spike.png"
      ]);
    } catch (e) {
      bootError = e.message || String(e);
      scene = "boot";
      requestAnimationFrame(frame);
      return;
    }
    // ?debug=1 keeps debug API; optional warp
    const params = new URLSearchParams(location.search);
    if (params.get("debug") === "1") {
      document.documentElement.dataset.debug = "1";
    }
    enterTitle();
    // Unlock audio on first gesture
    const unlock = () => { synth.resume(); window.removeEventListener("keydown", unlock); canvas.removeEventListener("pointerdown", unlock); };
    window.addEventListener("keydown", unlock);
    canvas.addEventListener("pointerdown", unlock);
    requestAnimationFrame(frame);
  };
})();
