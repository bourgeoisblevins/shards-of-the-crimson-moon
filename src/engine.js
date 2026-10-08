// Shards of the Crimson Moon — engine (atlas-driven, no rectangle actors)
(function () {
  "use strict";
  const W = 320, H = 180;
  const P = () => window.SHARDS.palettes;
  const T = () => window.SHARDS.text;
  const SAVE_KEY = "shards-crimson-moon-v2";

  const canvas = document.getElementById("game");
  const fb = document.createElement("canvas");
  fb.width = W; fb.height = H;
  let g = fb.getContext("2d", { alpha: false });
  g.imageSmoothingEnabled = false;
  // v6: portrait phones get a 180x320 "turn your phone" screen drawn with the same font/panels
  const PW = 180, PH = 320;
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
      cssFit = Math.max(1, Math.min(4, Math.floor(maxW / W), Math.floor(maxH / H)));
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
    canvas.style.width = Math.floor(lw * cssFit) + "px";
    canvas.style.height = Math.floor(lh * cssFit) + "px";
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
      settings: { master: 0.7, music: 0.45, sfx: 0.7, fullscreen: false }
    };
  }
  let save = defaultSave();
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) save = Object.assign(defaultSave(), JSON.parse(raw));
  } catch (_) {}
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
    save.version = 5;
  }
  normalizeSave();
  function persist() {
    save.settings = {
      master: synth.volume.master, music: synth.volume.music, sfx: synth.volume.sfx,
      fullscreen: !!document.fullscreenElement
    };
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (_) {}
  }
  function resetSave() {
    const settings = save.settings;
    save = defaultSave();
    save.settings = settings;
    persist();
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
  let tutPrompt = "", tutTimer = 0;
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
  function measure(str) {
    const font = window.SHARDS.font;
    let w = 0;
    for (const ch of str) w += (font.g[ch] || font.g["?"] || { a: 4 }).a;
    return w;
  }
  function drawText(str, x, y, color, align) {
    if (align === "center") x = (x - measure(str) / 2) | 0;
    if (align === "right") x = (x - measure(str)) | 0;
    let cx = x | 0;
    for (const ch of str) cx += drawGlyph(ch, cx, y | 0, color);
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
    lines.forEach((ln, i) => drawText(ln, x, y + i * 12, color));
    return y + lines.length * 12;
  }

  function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(x | 0, y | 0, w | 0, h | 0); }
  function panel(x, y, w, h) {
    // Nine-slice from ui-panel.9.png (12×12). Still a sprite, not a free rectangle actor.
    const img = atlas.require("ui-panel.9.png");
    const t = 4; // corner
    // corners
    g.drawImage(img, 0, 0, t, t, x, y, t, t);
    g.drawImage(img, 12 - t, 0, t, t, x + w - t, y, t, t);
    g.drawImage(img, 0, 12 - t, t, t, x, y + h - t, t, t);
    g.drawImage(img, 12 - t, 12 - t, t, t, x + w - t, y + h - t, t, t);
    // edges
    g.drawImage(img, t, 0, 4, t, x + t, y, w - 2 * t, t);
    g.drawImage(img, t, 12 - t, 4, t, x + t, y + h - t, w - 2 * t, t);
    g.drawImage(img, 0, t, t, 4, x, y + t, t, h - 2 * t);
    g.drawImage(img, 12 - t, t, t, 4, x + w - t, y + t, t, h - 2 * t);
    // center
    g.drawImage(img, t, t, 4, 4, x + t, y + t, w - 2 * t, h - 2 * t);
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
      coyote: 0, jumpBuf: 0,
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
    seedAmbient();
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
    seedAmbient();
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
    seedAmbient();
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
  function enterClaim(frag) {
    scene = "claim";
    const tmpl = path === "order" ? T().claim.order : T().claim.cult;
    claimMsg = tmpl.replace("{frag}", T().fragments[frag]);
    if (heldByAlly(frag)) { claimTimer = 0; enterHub(); return; } // never claim what Jeriah holds
    claimTimer = 160;
    save.claimed[frag] = true; persist();
    synth.sfx("claim");
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
    cameraX = Math.max(0, (level.altar.x + 8) - W / 2);
    seedAmbient();
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
  let godMode = false;
  function hurtPlayer(n, kbDir) {
    if (!player || player.inv > 0 || player.dodge > 0 || player.dead || godMode) return;
    player.hp -= n; player.inv = 50; flash = 4; shake = 6;
    player.vy = -2.2; player.vx = (kbDir || -player.facing) * 2.4;
    player.anim = "hurt"; player.animT = 0;
    synth.sfx("hurt"); doHitstop(3);
    if (player.hp <= 0) { player.dead = true; player.anim = "death"; enterDefeat(); }
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
    if (p.dead) return;
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
      p.dodge = 12; p.dodgeCD = 40; synth.sfx("dodge");
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

    resolve(p, level.platforms);
    if (p.inv > 0) p.inv--;

    // anim state when not attacking/dodging
    if (p.dodge === 0 && p.skill === 0 && p.atk === 0 && p.anim !== "hurt") {
      if (!p.onGround) p.anim = p.vy < 0 ? "jump" : "fall";
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
    e.anim = "hurt"; synth.sfx("enemyHurt"); doHitstop(2); shake = 3;
    spark(e.x + e.w / 2, e.y + e.h / 2, P().order.light, 5);
    if (e.hp <= 0) { e.dead = true; e.anim = "death"; e.animT = 0; synth.sfx("enemyDeath"); }
  }
  function damageBoss(n) {
    if (!boss || boss.inv > 0 || boss.dead) return;
    boss.hp -= n; boss.inv = 16;
    boss.vx = player.facing * 2.2; boss.vy = -1.4;
    boss.anim = "hurt"; synth.sfx("hit"); doHitstop(3); shake = 4; flash = 2;
    spark(boss.x + boss.w / 2, boss.y + boss.h / 2, P().order.light, 8);
    if (boss.phase === 1 && boss.hp / boss.maxHp <= boss.phase2At) {
      boss.phase = 2; boss.anim = "phase2"; boss.animT = 0; boss.cd = 30;
      spark(boss.x + 8, boss.y + 8, P().cult.ember, 16); shake = 8;
      if (typeof synth.setBossPhase === "function") synth.setBossPhase(2);
    }
    if (boss.hp <= 0) { boss.dead = true; boss.anim = "death"; synth.sfx("bossDefeat"); enterClaim(boss.fragment); }
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
        b.y = Math.min(player.y, level.h - 60);
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
    if (b.visible && !b.dead && aabb(player, b) && player.inv === 0 && player.dodge === 0) hurtPlayer(1, Math.sign(player.x - b.x) || -player.facing);
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
        x: Math.random() * (level.w || W),
        y: Math.random() * H,
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
      if (a.y < -4) a.y = H + 4;
      if (a.y > H + 4) a.y = -4;
      if (a.x < cameraX - 8) a.x = cameraX + W + 8;
      if (a.x > cameraX + W + 8) a.x = cameraX - 8;
    }
  }
  function drawAmbient() {
    for (const a of ambient) {
      if ((a.twinkle % 20) < 3) continue;
      rect(worldX(a.x), a.y | 0, 1, 1, a.color);
    }
  }

  function updateCamera() {
    if (!level || !player) { cameraX = 0; cameraLook = 0; return; }
    if (level.w <= W) { cameraX = 0; cameraLook = 0; return; }
    // look-ahead toward facing, smooth; deadzone ±24 around center
    const lookTarget = player.facing * 36;
    cameraLook += (lookTarget - cameraLook) * 0.08;
    const focus = player.x + player.w / 2 + cameraLook;
    const screenX = focus - cameraX;
    const deadL = W * 0.5 - 24, deadR = W * 0.5 + 24;
    if (screenX < deadL) cameraX -= (deadL - screenX) * 0.2;
    else if (screenX > deadR) cameraX += (screenX - deadR) * 0.2;
    // soft follow remainder
    const ideal = focus - W / 2;
    cameraX += (ideal - cameraX) * 0.06;
    // touch: traversals may scroll 48px past the end so the boss gate clears the right pads
    const endPad = (touchUI() && level.kind === "traverse") ? 48 : 0;
    cameraX = Math.max(0, Math.min(level.w - W + endPad, cameraX));
  }

  // ---------- scene updates ----------
  function controlScheme() {
    if (input.isTouch && input.lastDevice === "touch") return "touch";
    if (input.lastDevice === "gamepad") return "gamepad";
    return "kb";
  }
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
      t.move = true; tutPrompt = tutLine("jump"); tutTimer = 180; persist();
    } else if (t.move && !t.jump && input.pressed("jump")) {
      t.jump = true; tutPrompt = tutLine("strike"); tutTimer = 180; persist();
    } else if (t.jump && !t.strike && input.pressed("strike")) {
      t.strike = true; tutPrompt = tutLine("dodge"); tutTimer = 180; persist();
    } else if (t.strike && !t.dodge && input.pressed("dodge")) {
      t.dodge = true; tutPrompt = tutLine("skill"); tutTimer = 180; persist();
    } else if (t.dodge && !t.skill && input.pressed("skill")) {
      t.skill = true; tutPrompt = tutLine("done"); tutTimer = 210; persist();
    } else if (!t.move && tutTimer <= 0 && !tutPrompt) {
      tutPrompt = tutLine("move"); tutTimer = 240;
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
    if (input.pressed("cancel")) { scene = "hub"; return; }
    if (input.pressed("confirm")) {
      synth.sfx("menu");
      if (travelIx === n - 1) { scene = "hub"; return; }
      const z = zones[travelIx];
      if (save.claimed[z.fragment] || !zoneUnlocked(z)) return;
      goScene(() => enterTraverse(z.id));
    }
  }
  function updateTraverse() {
    updatePlayer(); playerStrikeHit(); updateEnemies(); updateProjectiles(); updateParticles(); updatePickups(); updateCamera();
    const gate = level.bossGate;
    if (gate && aabb(player, gate) && input.pressed("confirm")) {
      const zid = level.zone; synth.sfx("gate"); goScene(() => enterArena(zid));
    }
  }
  function updateArena() {
    updatePlayer(); playerStrikeHit(); updateBoss(); updateProjectiles(); updateParticles(); updatePickups(); updateAmbient(); updateCamera();
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
    if (input.pressed("cancel")) enterTitle();
  }
  function updateSettings() {
    if (input.pressed("up")) { settingsIx = (settingsIx + 4) % 5; synth.sfx("menuMove"); }
    if (input.pressed("down")) { settingsIx = (settingsIx + 1) % 5; synth.sfx("menuMove"); }
    const adj = (input.pressed("left") ? -0.1 : input.pressed("right") ? 0.1 : 0);
    if (settingsIx === 0 && adj) { synth.setVolume("master", synth.volume.master + adj); persist(); }
    if (settingsIx === 1 && adj) { synth.setVolume("music", synth.volume.music + adj); persist(); }
    if (settingsIx === 2 && adj) { synth.setVolume("sfx", synth.volume.sfx + adj); persist(); }
    if (settingsIx === 3 && input.pressed("confirm")) {
      if (!document.fullscreenElement) enterFullscreen();
      else document.exitFullscreen?.();
      persist();
    }
    if (settingsIx === 4 && (input.pressed("confirm") || input.pressed("cancel"))) {
      scene = settingsFrom === "pause" ? "pause" : "title";
    }
    if (input.pressed("cancel") && settingsIx !== 4) scene = settingsFrom === "pause" ? "pause" : "title";
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
      if (input.pressed("cancel") || input.pressed("confirm")) { pausePage = "main"; return; }
      if (input.pressed("up")) fragScroll = Math.max(0, fragScroll - 1);
      if (input.pressed("down")) fragScroll = Math.min(3, fragScroll + 1);
      return;
    }
    if (input.pressed("cancel")) {
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

  // ---------- draw ----------
  function worldX(x) { return (x - cameraX) | 0; }

  function resolveTileset(bg) {
    let path = window.SHARDS.tilesetFor[bg] || window.SHARDS.tilesetFor[level && level.zone] || "tiles-plains.png";
    if (!atlas.images.has(path) && window.SHARDS.tilesetFallback && window.SHARDS.tilesetFallback[path]) {
      path = window.SHARDS.tilesetFallback[path];
    }
    if (!atlas.images.has(path)) path = "tiles-deep.png";
    return path;
  }
  function drawSpike(x, y) {
    if (level.bg === "monastery") { atlas.drawTileIndex(g, resolveTileset(level.bg), 17, x, y); return; }
    if (atlas.images.has(window.SHARDS.spikeTile || "tile-hazard-spike.png")) {
      atlas.drawImage(g, window.SHARDS.spikeTile || "tile-hazard-spike.png", x, y);
    } else {
      const tiles = resolveTileset(level.bg);
      atlas.drawTileIndex(g, tiles, 17, x, y);
    }
  }


  function drawParallaxTiled(pathP, layer, factor) {
    const off = -((cameraX * factor) | 0);
    let x = off % 320;
    if (x > 0) x -= 320;
    // tile across framebuffer (and a bit beyond for scroll)
    for (; x < W + 320; x += 320) {
      atlas.drawParallaxLayer(g, pathP, layer, x, 0);
    }
  }
  function drawBG() {
    const bg = level.parallax || level.bg; // arenas may use a variant sheet
    const pathP = `parallax/${bg}.png`;
    rect(0, 0, W, H, P().ground.void);
    try {
      drawParallaxTiled(pathP, "sky", 0.1);
      drawParallaxTiled(pathP, "far", 0.3);
      drawWindowLight(bg, 0.3);
      drawParallaxTiled(pathP, "mid", 0.6);
    } catch (e) {
      // Brand sheets required; keep void fill if a layer fails mid-draw
      console.warn("parallax", e.message || e);
    }
    drawDressing();
  }
  // A faint light that moves from one dark window of the far monastery to
  // another (parallaxLights in asset-manifest.js). Dim gold, 1x2 px, no glow.
  let windowLightT = 0;
  function drawWindowLight(bg, factor) {
    const lights = (window.SHARDS.parallaxLights || {})[bg];
    if (!lights || !lights.length) return;
    windowLightT++;
    const period = 320, ph = windowLightT % period;
    if (ph < 50 || ph > 270) return; // dark between windows
    const ix = (Math.floor(windowLightT / period) * 5) % lights.length;
    const [wx, wy] = lights[ix];
    const c = (ph < 90 || ph > 230) ? P().order.templeDeep : P().order.temple;
    let x = -((cameraX * factor) | 0) % 320;
    if (x > 0) x -= 320;
    for (; x < W + 320; x += 320) {
      const sx = x + wx;
      if (sx >= 0 && sx < W) rect(sx, wy, 1, 2, c);
    }
  }
  // World-space backdrop art (monastery hall, stele, bell, shrine, arch).
  function drawDressing() {
    for (const d of (level.dressing || [])) {
      if (!atlas.images.has(d.img)) continue;
      const img = atlas.images.get(d.img);
      const dx = worldX(d.x);
      if (dx > W || dx + (img.width || 0) < 0) continue;
      atlas.drawImage(g, d.img, dx, d.y | 0);
    }
  }

  function drawPlatforms() {
    const tiles = resolveTileset(level.bg);
    for (const p of level.platforms) {
      const topY = p.y | 0;
      const oneWay = !!p.oneWay || (p.h <= 12 && p.y < (level.h - 24));
      // Saffrika: lighter mossy tops (tiles 20/21) so terraces match jungle parallax
      const mossy = (level.bg === "saffrika");
      const topL = mossy ? 20 : 4;
      const topR = mossy ? 21 : 5;
      const topM = mossy ? 20 : 4;
      if (oneWay) {
        for (let x = 0; x < p.w; x += 16) {
          const isL = x === 0, isR = x + 16 >= p.w;
          const wx = worldX(p.x + x);
          const top = isL ? topL : (isR ? topR : topM);
          atlas.drawTileIndex(g, tiles, top, wx, topY);
          if (isL) atlas.drawTileIndex(g, tiles, 30, wx, topY);
          if (isR) atlas.drawTileIndex(g, tiles, 31, wx, topY);
          atlas.drawTileIndex(g, tiles, isR ? 29 : 28, wx, topY + 2);
          if (mossy) {
            rect(wx, topY, Math.min(16, p.w - x), 1, P().order.boneShade);
            rect(wx, topY + 1, Math.min(16, p.w - x), 1, P().order.temple);
          }
        }
        continue;
      }
      for (let yy = 16; yy < p.h; yy += 16) {
        for (let x = 0; x < p.w; x += 16) {
          const edge = mossy ? ((x === 0) ? 6 : (x + 16 >= p.w ? 7 : 2))
            : ((x === 0) ? 6 : (x + 16 >= p.w ? 7 : 1));
          atlas.drawTileIndex(g, tiles, edge, worldX(p.x + x), topY + yy);
        }
      }
      for (let x = 0; x < p.w; x += 16) {
        const isL = x === 0, isR = x + 16 >= p.w;
        atlas.drawTileIndex(g, tiles, isL ? topL : (isR ? topR : topM), worldX(p.x + x), topY);
      }
      atlas.drawTileIndex(g, tiles, 30, worldX(p.x), topY);
      if (p.w > 16) atlas.drawTileIndex(g, tiles, 31, worldX(p.x + p.w - 16), topY);
      if (mossy) {
        // light moss / bone lip so terraces read against bright jungle parallax
        rect(worldX(p.x), topY, p.w, 1, P().order.boneShade);
        rect(worldX(p.x), topY + 1, p.w, 1, P().order.temple);
      }
    }
    // decor props from level.decor
    for (const d of (level.decor || [])) {
      atlas.drawTileIndex(g, tiles, d.tile|0, worldX(d.x), d.y|0);
    }
    if (level.altar) {
      const ap = level.bg === "orderHub" ? "tile-altar-order.png"
        : level.bg === "cultHub" ? "tile-altar-cult.png"
        : (path === "order" ? "tile-altar-order.png" : "tile-altar-cult.png");
      const ax = worldX(level.altar.x), ay = level.altar.y;
      atlas.drawImage(g, ap, ax, ay);
      // palette-safe pulse (no blur): 1px hairline blink
      altarPulse = (altarPulse + 1) % 60;
      if (altarPulse < 30) {
        const c = (ap.indexOf("order") >= 0) ? P().order.illumination : P().cult.ember;
        rect(ax + 3, ay - 2, 10, 1, c);
        rect(ax + 5, ay - 4, 6, 1, c);
        rect(ax + 6, ay - 6, 4, 1, c);
      }
      // contrast hairline under altar
      rect(ax - 1, ay + 15, 18, 1, (ap.indexOf("order") >= 0) ? P().order.nexus : P().cult.ember);
    }
    for (const h of (level.hazards || [])) {
      for (let x = 0; x < h.w; x += 16) {
        if (h.kind === "ember") atlas.drawImage(g, "tile-hazard-ember.png", worldX(h.x + x), h.y);
        else drawSpike(worldX(h.x + x), h.y);
      }
    }
    if (level.bossGate) {
      const gate = level.bossGate;
      const gx = worldX(gate.x);
      atlas.drawTileIndex(g, tiles, 18, gx, gate.y);
      atlas.drawTileIndex(g, tiles, 19, gx + 16, gate.y);
      atlas.drawTileIndex(g, tiles, 16, gx + 8, gate.y + 16);
      // accent rim so gate reads against dark tiles
      const gc = path === "order" ? P().order.illumination : P().cult.emberLight;
      rect(gx - 1, gate.y - 1, 34, 1, gc);
      rect(gx - 1, gate.y + 31, 34, 1, gc);
    }
    if (level.travelPad) {
      const pad = level.travelPad;
      atlas.drawImage(g, path === "order" ? "tile-altar-order.png" : "tile-altar-cult.png",
        worldX(pad.x + 16), pad.y - 8);
    }
  }
  function drawPlayer() {
    const sheet = path === "order" ? "player-order.png" : "player-cult.png";
    const flip = player.facing < 0;
    const map = window.SHARDS.playerFrame;
    let anim = player.anim || "idle";
    if (anim === "run") anim = "walk" + ((player.animT / 6 | 0) % 4);
    if (anim === "dodge") anim = player.dodge > 6 ? "dodge0" : "dodge1";
    if (anim === "skill") anim = player.skill > 10 ? "skill0" : "skill1";
    let frame = map[anim] || map.idle;
    frame = atlas.resolveFrame(sheet, frame, ["idle"]);
    const dx = worldX(player.x) - 2;
    const dy = player.y | 0;
    atlas.drawFrameOutlined(g, sheet, frame, dx, dy, flip, 16, 24, P().ground.void);
    // skill VFX (Brand) or slash fallback
    if (player.skill > 0) {
      const vfx = path === "order" ? "vfx-skill-order.png" : "vfx-skill-cult.png";
      const fi = Math.min(3, ((22 - player.skill) / 5) | 0);
      const sx = worldX(player.x + player.w / 2 - 8);
      const sy = (player.y + 4) | 0;
      try {
        if (atlas.images.has(vfx)) atlas.drawFrame(g, vfx, "fx" + fi, sx, sy, flip);
        else atlas.drawFrame(g, "vfx-slash.png", "slash" + Math.min(2, fi), sx, sy, flip);
      } catch (_) {}
    } else if (player.atk > 0 && player.atk < 10) {
      const si = Math.min(2, (10 - player.atk) | 0);
      const sx = worldX(player.facing > 0 ? player.x + player.w : player.x - 16);
      try { atlas.drawFrame(g, "vfx-slash.png", "slash" + si, sx, player.y + 4, player.facing < 0); } catch (_) {}
    }
  }
  function drawBoss() {
    if (!boss) return;
    const bs = window.SHARDS.bossSheet[boss.id];
    const map = window.SHARDS.bossFrame;
    let anim = boss.anim || "idle";
    if (anim === "move") anim = (boss.animT % 20 < 10) ? "walk0" : "walk1";
    let want = map[anim] || "idle";
    // Fallback windupN/activeN → windup/active when sheet still has 7 frames
    const fallbacks = [];
    if (/^windup[123]$/.test(want)) fallbacks.push("windup");
    if (/^active[123]$/.test(want)) fallbacks.push("active");
    if (want === "phase2") fallbacks.push("windup", "idle");
    const frame = atlas.resolveFrame(bs.path, want, fallbacks);
    if (boss.visible !== false && !(boss.inv > 0 && (boss.inv % 4 < 2) && anim !== "defeat" && anim !== "death")) {
      const ox = worldX(boss.x) - (((bs.fw) - boss.w) / 2 | 0);
      const oy = (boss.y - (bs.fh - boss.h)) | 0;
      atlas.drawFrameOutlined(g, bs.path, frame, ox, oy, boss.facing < 0, bs.fw, bs.fh, P().ground.void);
    }
    // Telegraph marks (accent color ground/line)
    for (const m of teleMarks) {
      rect(worldX(m.x), m.y | 0, m.w | 0, m.h | 0, m.color);
    }
    // Entire boss chrome hidden while intro card + dialogue are up
    if (introHold > 0) return;
    const bw = 104;
    const bx = ((W - bw) / 2) | 0;
    const isSilent = boss.id === "silent";
    const label = isSilent ? "" : ((T().bossShort && T().bossShort[boss.id]) || T().bossLabels[boss.id] || "");
    const nameH = label ? 10 : 0;
    const panelH = 6 + nameH + 4 + 4; // pad + name + gap + bar + pad
    const py = 4;
    panel(bx - 4, py, bw + 8, panelH);
    let y = py + 3;
    if (label) {
      drawText(label, W / 2, y, P().order.boneShade, "center");
      y += nameH;
    }
    if (isSilent) {
      atlas.drawFrame(g, "ui-fragments.png", "shadow", bx - 2, y, false, 8, 8);
    }
    const barX = isSilent ? bx + 8 : bx;
    const barW = isSilent ? bw - 8 : bw;
    for (let i = 0; i < barW; i += 4) atlas.drawFrame(g, "ui-hp.png", "empty", barX + i, y, false, 4, 4);
    const fillW = (barW * Math.max(0, boss.hp / boss.maxHp)) | 0;
    for (let i = 0; i < fillW; i += 4) atlas.drawFrame(g, "ui-hp.png", "filled", barX + i, y, false, 4, 4);
  }
  function drawEnemies() {
    for (const e of enemies) {
      if (e.dead && e.animT > 30) continue;
      if (e.inv > 0 && (e.inv % 4 < 2) && !e.dead) continue;
      const sheet = window.SHARDS.enemySheet[e.type];
      const map = window.SHARDS.enemyFrame;
      let anim = e.anim || "idle";
      if (anim === "walk") anim = (e.animT % 16 < 8) ? "walk0" : "walk1";
      let want = map[anim] || "idle";
      const frame = atlas.resolveFrame(sheet, want, anim === "death" ? ["hurt"] : anim === "attack" ? ["walk1"] : ["idle"]);
      const ox = worldX(e.x) - 1;
      const oy = (e.y - (24 - e.h)) | 0;
      if (e.translucent) {
        // dithered shade: no void outline or rim, so the ground shows through
        atlas.drawFrame(g, sheet, frame, ox, oy, e.facing < 0, 16, 24);
        continue;
      }
      atlas.drawFrameOutlined(g, sheet, frame, ox, oy, e.facing < 0, 16, 24, P().ground.void);
      // subtle zone accent rim (1px, palette only) — not a palette-swap of the sheet
      if (e.accent && !e.dead) {
        rect(ox + 2, oy + 22, 12, 1, e.accent);
      }
    }
  }
  function drawPickups() {
    for (const p of pickups) {
      if (p.taken) continue;
      const px = worldX(p.x), py = p.y | 0;
      // contrast flash under interactive pickups
      rect(px - 1, py - 1, 10, 10, P().order.illumination);
      rect(px, py, 8, 8, P().ground.obsidian);
      if (p.type === "heal" && atlas.images.has("icons/heal.png")) {
        atlas.drawImage(g, "icons/heal.png", px, py);
      } else if (p.type === "heal") {
        atlas.drawFrame(g, "ui-fragments.png", "heart", px, py, false, 8, 8);
      } else {
        atlas.drawFrame(g, "ui-fragments.png", p.type, px, py, false, 8, 8);
      }
    }
  }
  function drawHUD() {
    for (let i = 0; i < player.maxHp; i++) {
      atlas.drawFrame(g, "ui-hp.png", i < player.hp ? "filled" : "empty", 8 + i * 8, 8, false, 4, 4);
    }
    const frags = window.SHARDS.fragmentOrder;
    for (let i = 0; i < frags.length; i++) {
      const x = W - 8 - (frags.length - i) * 10;
      if (save.claimed[frags[i]]) atlas.drawFrame(g, "ui-fragments.png", frags[i], x, 6, false, 8, 8);
      else if (heldByAlly(frags[i])) {
        // held by Jeriah, not claimed by the player: half-lit with an ember underline
        drawFragIcon(frags[i], x, 6, "half");
        rect(x, 15, 8, 1, P().cult.ember);
      } else {
        // empty slot: the fragment's silhouette in Ash
        drawFragIcon(frags[i], x, 6, "empty");
      }
    }
  }
  // Palette-safe dimming (v5): no globalAlpha, so the HUD never blends into
  // off-palette colors over any backdrop. "half" = void checker over the icon,
  // "empty" = flat Ash silhouette.
  const fragIconCanvas = document.createElement("canvas");
  fragIconCanvas.width = 8; fragIconCanvas.height = 8;
  const fragIconG = fragIconCanvas.getContext("2d");
  function drawFragIcon(f, x, y, mode) {
    fragIconG.globalCompositeOperation = "source-over";
    fragIconG.clearRect(0, 0, 8, 8);
    atlas.drawFrame(fragIconG, "ui-fragments.png", f, 0, 0, false, 8, 8);
    fragIconG.globalCompositeOperation = "source-atop";
    if (mode === "empty") {
      fragIconG.fillStyle = P().ground.ash;
      fragIconG.fillRect(0, 0, 8, 8);
    } else {
      fragIconG.fillStyle = P().ground.void;
      for (let yy = 0; yy < 8; yy++) for (let xx = (yy & 1); xx < 8; xx += 2) fragIconG.fillRect(xx, yy, 1, 1);
    }
    fragIconG.globalCompositeOperation = "source-over";
    g.drawImage(fragIconCanvas, x | 0, y | 0);
  }
  function portraitPathForBoss(id) {
    if (!id || id === "silent") {
      // Silent may have a portrait file but never show a name; portrait OK without nameplate
      const p = "portrait-boss-silent.png";
      return atlas.images.has(p) ? p : null;
    }
    const p = "portrait-boss-" + id + ".png";
    return atlas.images.has(p) ? p : null;
  }
  function drawPrompt(worldXPos, worldYPos, label) {
    const tw = measure(label) + 10;
    const px = worldX(worldXPos) - (tw / 2 | 0);
    const py = (worldYPos - 14) | 0;
    if (py < 4 || px < 2 || px + tw > W - 2) return;
    panel(px, py, tw, 12);
    drawText(label, px + tw / 2, py + 3, P().order.illumination, "center");
  }
  function drawDialogue(str, portraitPath) {
    // Touch (v6): while the player can still move (hub talk, boss gate), the box sits at
    // the top so the pads never cover it; the box itself is a tap-to-confirm target.
    const top = touchUI() && (scene === "hub" || scene === "traverse");
    const y = top ? 20 : H - 56;
    if (top) { touchDialogue = true; tapTarget(16, y, 288, 48, () => input.tap("confirm")); }
    if (!portraitPath) {
      // no speaker: a plain panel sized to the text (the frame art carries an empty portrait slot)
      const lines = paraLines(str, W - 48);
      const h = Math.max(24, lines.length * 11 + 13);
      const yy = top ? y : H - 8 - h;
      panel(16, yy, W - 32, h);
      lines.forEach((ln, i) => drawText(ln, 24, yy + 7 + i * 11, P().order.bone));
      return;
    }
    if (atlas.images.has("ui-dialogue-frame.png")) {
      atlas.drawImage(g, "ui-dialogue-frame.png", 16, y);
      let tx = 24;
      if (portraitPath) {
        try { atlas.drawImage(g, portraitPath, 20, y + 8, 32, 32); tx = 60; } catch (_) {}
      }
      const lines = paraLines(str, W - tx - 28);
      lines.slice(0, 3).forEach((ln, i) => drawText(ln, tx, y + 10 + i * 11, P().order.bone));
    } else {
      const lines = paraLines(str, portraitPath ? W - 80 : W - 48);
      const h = Math.max(40, lines.length * 12 + 12);
      const yy = H - 8 - h;
      panel(16, yy, W - 32, h);
      let tx = 24;
      if (portraitPath) {
        try { atlas.drawImage(g, portraitPath, 20, yy + 4, 32, 32); tx = 56; } catch (_) {}
      }
      lines.forEach((ln, i) => drawText(ln, tx, yy + 6 + i * 12, P().order.bone));
    }
  }

  function drawTitle() {
    rect(0, 0, W, H, P().ground.obsidian);
    // Logo + subtitle (top)
    try {
      const img = atlas.require(wordmarkPath);
      g.drawImage(img, ((W - img.width) / 2) | 0, 6);
    } catch (_) {
      drawText(T().title.wordmark, W / 2, 14, P().order.bone, "center");
    }
    drawText(T().title.subline, W / 2, 56, P().ground.ash, "center");

    // Menu centered with clear spacing (no overlap)
    const has = !!save.path;
    const items = has
      ? [T().title.menuNew, T().title.menuContinue, T().title.menuSettings, T().title.menuReset]
      : [touchUI() ? T().touch.pressStart : T().title.pressStart, T().title.menuSettings];
    const menuTop = 72;
    const lineH = touchUI() ? 20 : 14;
    items.forEach((it, i) => {
      const sel = i === menuIx;
      drawText((sel ? "> " : "  ") + it, W / 2, menuTop + i * lineH, sel ? P().order.illumination : P().order.boneShade, "center");
      // New (with a save) and Forget wipe progress: on touch they need a second tap.
      const twoTap = has && (i === 0 || i === 3);
      menuRow(60, menuTop + i * lineH, W - 120, lineH, "title" + i, twoTap, () => { menuIx = i; });
    });
    if (touchUI()) {
      const ctrlY = menuTop + items.length * lineH + 10;
      const lines = T().touch.controls;
      if (ctrlY + 11 + lines.length * 10 <= H - 1) {
        rect(8, ctrlY - 4, W - 16, 1, P().ground.stone);
        drawText(T().controls.heading, W / 2, ctrlY, P().order.illumination, "center");
        lines.forEach((ln, i) => drawText(ln, W / 2, ctrlY + 11 + i * 10, P().ground.smoke, "center"));
      } else if (armedKey === "title0" || armedKey === "title3") {
        drawText(T().touch.again, W / 2, H - 14, P().ground.smoke, "center");
      }
      return;
    }

    // Compact two-column controls below menu — never touches menu
    const ctrlY = menuTop + items.length * lineH + 10;
    rect(8, ctrlY - 4, W - 16, 1, P().ground.stone);
    drawText(T().controls.heading, 16, ctrlY, P().order.illumination);
    drawText("Gamepad", 170, ctrlY, P().order.illumination);
    const kbShort = T().controls.kb.slice(0, 5);
    const padShort = T().controls.pad.slice(0, 5);
    kbShort.forEach((ln, i) => drawText(ln, 16, ctrlY + 10 + i * 8, P().ground.smoke));
    padShort.forEach((ln, i) => drawText(ln, 170, ctrlY + 10 + i * 8, P().ground.smoke));
  }

  function drawPath() {
    rect(0, 0, W, H, P().ground.void);
    drawText(T().pathSelect.heading, W / 2, 8, P().order.illumination, "center");
    const rows = [
      { y: 24, key: "order", accent: P().order.nexus, sel: menuIx === 0, nameC: P().order.illumination },
      { y: 92, key: "cult", accent: P().cult.ember, sel: menuIx === 1, nameC: P().cult.emberLight }
    ];
    rows.forEach((r, i) => menuRow(12, r.y, W - 24, 64, "path" + i, true, () => { menuIx = i; }, true));
    for (const r of rows) {
      panel(12, r.y, W - 24, 64);
      if (r.sel) rect(12, r.y, W - 24, 2, r.accent);
      const d = T().pathSelect[r.key];
      drawText((r.sel ? "> " : "  ") + d.name, 20, r.y + 6, r.sel ? r.nameC : P().order.bone);
      drawText(d.role, W - 20, r.y + 6, P().ground.smoke, "right");
      let y = r.y + 20;
      for (const line of d.blurb) y = drawWrapped(line, 28, y, W - 56, P().order.boneShade);
    }
    drawText(touchUI() ? T().touch.pathConfirm : T().pathSelect.lockNote, W / 2, 164, P().ground.ash, "center");
  }

  function drawSettings() {
    rect(0, 0, W, H, P().ground.obsidian);
    drawText(T().settings.heading, W / 2, 24, P().order.illumination, "center");
    const rows = [
      `${T().settings.master}: ${(synth.volume.master * 100) | 0}`,
      `${T().settings.music}: ${(synth.volume.music * 100) | 0}`,
      `${T().settings.sfx}: ${(synth.volume.sfx * 100) | 0}`,
      `${T().settings.fullscreen}: ${document.fullscreenElement ? "On" : "Off"}`,
      T().settings.back
    ];
    const t = touchUI(), top = t ? 46 : 56, pitch = t ? 22 : 16;
    rows.forEach((r, i) => {
      const sel = i === settingsIx;
      const y = top + i * pitch;
      drawText((sel ? "> " : "  ") + r, 40, y, sel ? P().order.illumination : P().order.boneShade);
      if (!t) return;
      if (i <= 2) {
        // volume rows: left half lowers, right half raises
        drawText("-", 24, y, P().ground.smoke); drawText("+", W - 28, y, P().ground.smoke);
        const key = ["master", "music", "sfx"][i];
        const ty = y - ((pitch - 9) >> 1);
        tapTarget(8, ty, W / 2 - 8, pitch, () => { settingsIx = i; synth.setVolume(key, synth.volume[key] - 0.1); persist(); });
        tapTarget(W / 2, ty, W / 2 - 8, pitch, () => { settingsIx = i; synth.setVolume(key, synth.volume[key] + 0.1); persist(); });
      } else menuRow(8, y, W - 16, pitch, "set" + i, false, () => { settingsIx = i; });
    });
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
  function drawHubNPCs() {
    for (const n of (level.npcs || [])) {
      const flip = (n.facing || 1) < 0;
      const frame = "idle";
      const dx = worldX(n.x), dy = n.y | 0;
      // Palette-shift so idlers are not Ryan / Jeriah clones: bone/ash monks, soot acolytes
      const mode = n.tint === "ember" || n.tint === "ash" || path === "cult" ? "cultIdle" : "orderIdle";
      drawIdlerTinted(n.sheet, frame, dx, dy, flip, mode);
      const c = mode === "cultIdle" ? P().cult.blood : P().order.boneShade;
      rect(dx + 3, dy + 23, 10, 1, c);
      // hood hint: 1px ash/bone cap over head
      rect(dx + 4, dy + 1, 8, 1, mode === "cultIdle" ? P().ground.obsidian : P().ground.ash);
      rect(dx + 5, dy + 2, 6, 1, mode === "cultIdle" ? P().cult.blackRed : P().ground.stone2);
    }
  }
  function drawIdlerTinted(sheet, frame, dx, dy, flip, mode) {
    const fw = 16, fh = 24;
    if (!atlas._idler) {
      atlas._idler = document.createElement("canvas");
      atlas._idler.width = fw + 2; atlas._idler.height = fh + 2;
      atlas._ig = atlas._idler.getContext("2d");
      atlas._ig.imageSmoothingEnabled = false;
    }
    const ig = atlas._ig;
    // Build flat palette body (no Ryan gold / cult-leader ember identity)
    ig.clearRect(0, 0, fw + 2, fh + 2);
    atlas.drawFrame(ig, sheet, frame, 1, 1, false, fw, fh);
    ig.globalCompositeOperation = "source-in";
    ig.fillStyle = mode === "cultIdle" ? P().cult.blackRed : P().ground.ash;
    ig.fillRect(0, 0, fw + 2, fh + 2);
    ig.globalCompositeOperation = "source-atop";
    ig.globalAlpha = 0.55;
    ig.fillStyle = mode === "cultIdle" ? P().ground.stone2 : P().order.boneShade;
    ig.fillRect(1, 1, fw, fh);
    ig.globalAlpha = 1;
    ig.globalCompositeOperation = "source-over";
    // 1px void outline by blitting offset silhouettes
    g.save();
    const drawSil = (ox, oy) => {
      if (flip) {
        g.translate(dx + fw, dy);
        g.scale(-1, 1);
        g.drawImage(atlas._idler, ox - 1, oy - 1);
        g.setTransform(1,0,0,1,0,0);
      } else {
        g.drawImage(atlas._idler, dx + ox - 1, dy + oy - 1);
      }
    };
    // outline in void via recolor — quick: draw body then dark ring using fill
    // body
    if (flip) {
      g.translate(dx + fw, dy); g.scale(-1, 1);
      // outline
      g.globalCompositeOperation = "source-over";
      for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        g.drawImage(atlas._idler, ox - 1, oy - 1);
      }
      // re-tint center already ash; OK
      g.drawImage(atlas._idler, -1, -1);
      g.setTransform(1,0,0,1,0,0);
    } else {
      for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
        g.drawImage(atlas._idler, dx + ox - 1, dy + oy - 1);
      }
      g.drawImage(atlas._idler, dx - 1, dy - 1);
    }
    g.restore();
  }
  function drawHubUI() {
    drawHubNPCs();
    const guide = level.guide;
    if (guide.id === "ryan") {
      atlas.drawFrameOutlined(g, "guide-ryan.png", hubSaid ? "talk" : "idle", worldX(guide.x), guide.y, true, 16, 24, P().ground.void);
    } else {
      // Cult: General Jeriah (his boss sheet, idle frame) stands in the hideout as quest-giver.
      const bs = window.SHARDS.bossSheet[guide.id] || window.SHARDS.bossSheet.jeriah;
      atlas.drawFrameOutlined(g, bs.path, "idle", worldX(guide.x) - ((bs.fw - 16) / 2 | 0), guide.y + 24 - bs.fh, true, bs.fw, bs.fh, P().ground.void);
    }
    const pad = level.travelPad;
    const nearGuide = Math.abs(player.x - guide.x) < 28 && Math.abs(player.y - guide.y) < 28;
    const nearTravel = pad && Math.abs((player.x + player.w / 2) - (pad.x + pad.w / 2)) < 40 && Math.abs(player.y - (pad.y - 4)) < 36;
    const portrait = guide.id === "ryan" ? "portrait-ryan.png" : "portrait-boss-" + guide.id + ".png";
    const nearAltar = allClaimed() && level.altar && aabb(player, { x: level.altar.x - 10, y: level.altar.y - 10, w: level.altar.w + 20, h: level.altar.h + 28 });
    const dialogueOpen = (nearGuide && hubSaid) || nearAltar;
    // Prompts only when dialogue is closed
    if (!dialogueOpen) {
      if (nearGuide && !hubSaid) drawPrompt(guide.x + 8, guide.y, T().prompts.talk);
      if (nearTravel) drawPrompt(pad.x + pad.w / 2, pad.y - 8, T().prompts.travel);
      if (nearAltar) drawPrompt(level.altar.x + 8, level.altar.y, T().prompts.altar);
    }
    if (nearGuide && hubSaid) {
      const line = T().guideLines[path][lineIx % T().guideLines[path].length];
      drawDialogue(line + "\n" + nextFragmentHint(), portrait);
    } else if (nearAltar) {
      drawDialogue(path === "order" ? T().hub.allSixOrder : T().hub.allSixCult);
    }
    // Tutorial banner — only when title card is gone
    if (tutPrompt && tutTimer > 0 && titleCard <= 0 && !(touchUI() && dialogueOpen)) {
      const tw = Math.min(W - 24, measure(tutPrompt) + 16);
      panel(((W - tw) / 2) | 0, 20, tw, 14);
      drawText(tutPrompt, W / 2, 24, P().order.illumination, "center");
    }
  }

  function drawTravel() {
    g.fillStyle = "rgba(5,4,4,0.7)"; g.fillRect(0, 0, W, H);
    const t = touchUI();
    // touch: the list uses the full screen so every row is a ~44 px tall tap target
    if (t) panel(4, 2, W - 8, H - 4); else panel(16, 16, W - 32, H - 32);
    drawText(T().hub.travelHeading, W / 2, t ? 8 : 24, P().order.illumination, "center");
    const zones = pathZones(); // cult: Vespera is Order-only
    const pitch = t ? Math.min(24, Math.floor((H - 26) / (zones.length + 1))) : 12;
    let y = t ? 26 : 44;
    zones.forEach((z, i) => {
      const zt = T().zones[z.id];
      const claimed = !!save.claimed[z.fragment];
      const unlocked = zoneUnlocked(z);
      const sel = i === travelIx;
      let label = zt.travel || (zt.name + (zt.sub ? " - " + zt.sub : ""));
      let c = P().order.boneShade;
      if (!unlocked) { label += "  [" + T().hub.travelLocked + "]"; c = P().ground.ash; }
      if (claimed) { label += "  [" + T().hub.travelClaimed + "]"; c = P().order.temple; }
      if (sel) c = P().order.illumination;
      drawText((sel ? "> " : "  ") + label, 28, y, c);
      menuRow(16, y, W - 32, pitch, "travel" + i, false, () => { travelIx = i; });
      y += pitch;
    });
    const stay = travelIx === zones.length;
    drawText((stay ? "> " : "  ") + T().hub.travelBack, 28, y + (t ? 0 : 4), stay ? P().order.illumination : P().order.boneShade);
    menuRow(16, y + (t ? 0 : 4), W - 32, pitch, "travelStay", false, () => { travelIx = zones.length; });
  }


  function drawTitleCard() {
    if (titleCard <= 0 || !titleCardText) return;
    titleCard--;
    const a = titleCard > 70 ? (90 - titleCard) : titleCard < 20 ? titleCard : 20;
    // use panel, no translucent crimson
    const tw = Math.min(W - 32, measure(titleCardText) + 24);
    const tx = ((W - tw) / 2) | 0;
    // touch: wide cards drop below the pause pad (x 290-318, y 20-48)
    const ty = (touchUI() && tx + tw > W - 32) ? 52 : 28;
    panel(tx, ty, tw, 20);
    drawText(titleCardText, W / 2, ty + 6, P().order.illumination, "center");
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
      // stepped dither using void rectangles (no blur) — alpha via discrete bands
      const bands = Math.min(8, fade);
      for (let i = 0; i < bands; i++) {
        rect(0, i * 2, W, 2, P().ground.void);
        rect(0, H - 2 - i * 2, W, 2, P().ground.void);
      }
      if (fade > 8) rect(0, 0, W, H, P().ground.void);
    }
  }
  function goScene(fn) {
    fade = 1; fadeDir = 1; fadeNext = fn;
  }

  // ---------- touch layer (v6) ----------
  // Pads: 28x28 plates (>= 44 CSS px at the 1.6x+ fit every phone gets in landscape).
  // Multi-touch: every active finger is mapped to a pad on each touchstart/move/end, so
  // holding Right while tapping Jump or Strike works, and sliding between Left/Right steers.
  // Menus: rows are tap targets registered while drawing (tapTarget / menuRow).
  const PAD_ACTS = ["left", "right", "jump", "strike", "dodge", "skill", "cancel", "confirm", "up", "down"];
  let tapTargets = [], drawnTargets = [], padHeld = new Set(), touchDialogue = false, lastTouchDialogue = false;
  let armedKey = "", fsTried = false;
  function touchUI() { return input.isTouch && input.lastDevice === "touch"; }
  function tapTarget(x, y, w, h, fn) { if (touchUI()) tapTargets.push({ x, y, w, h, fn }); }
  // A menu row: tap selects and confirms. twoTap rows (destructive / path lock) select on the
  // first tap and confirm on a second tap of the same row.
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
      { name: "left", act: "left", x: 4, y: H - 32 },
      { name: "right", act: "right", x: 36, y: H - 32 },
      { name: "strike", act: "strike", x: W - 64, y: H - 32 },
      { name: "jump", act: "jump", x: W - 32, y: H - 32 },
      { name: "dodge", act: "dodge", x: W - 64, y: H - 64 },
      { name: "skill", act: "skill", x: W - 32, y: H - 64 },
    ];
    // Pause sits under the fragment row (top right), clear of HP, fragments and boss bar;
    // hidden while a top dialogue box is open.
    if (!lastTouchDialogue) L.push({ name: "pause", act: "cancel", x: W - 30, y: 20 });
    if (contextAction()) L.push({ name: "ok", act: "confirm", x: (W / 2 - 14) | 0, y: H - 32 });
    return L;
  }
  function drawTouch() {
    lastTouchDialogue = touchDialogue;
    const layout = touchLayout();
    for (const b of layout) {
      atlas.drawFrame(g, "ui/touch-pad.png", padHeld.has(b.name) ? b.name + "-on" : b.name, b.x, b.y, false, 28, 28);
    }
  }
  function toGame(t) {
    const r = canvas.getBoundingClientRect();
    return { x: ((t.clientX - r.left) / r.width) * W, y: ((t.clientY - r.top) / r.height) * H };
  }
  function padAt(gx, gy) {
    const L = touchLayout();
    let best = null, bd = 1e9;
    for (const b of L) {
      const r = (b.name === "pause" || b.name === "ok") ? 17 : 21;
      const d = Math.max(Math.abs(gx - (b.x + 14)), Math.abs(gy - (b.y + 14)));
      if (d <= r && d < bd) { bd = d; best = b; }
    }
    // the whole lower-left corner (incl. the letterbox) steers
    if (!best && gy > H - 72 && gx < 76) best = L.find(b => b.name === (gx < 34 ? "left" : "right")) || null;
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
      // pads win over tap targets (the play scenes register only the dialogue box)
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
    // Fullscreen on the first tap where the browser allows it (Android Chrome; iPhone
    // Safari has no element fullscreen, so Add to Home Screen is the full-screen path).
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
  // no pinch zoom (iOS gesture events), double-tap zoom, long-press menus or selection
  for (const ev of ["gesturestart", "gesturechange", "gestureend", "dblclick", "contextmenu", "selectstart"]) {
    document.addEventListener(ev, (e) => e.preventDefault(), { passive: false });
  }

  function drawRotate() {
    const keep = g; g = pg;
    rect(0, 0, PW, PH, P().ground.obsidian);
    try { const img = atlas.require(wordmarkPath); g.drawImage(img, ((PW - img.width) / 2) | 0, 34); } catch (_) {}
    panel(10, 116, PW - 20, 132);
    try { atlas.drawImage(g, "ui/rotate-device.png", ((PW - 72) / 2) | 0, 132); } catch (_) {}
    drawText(T().touch.rotateHead, PW / 2, 186, P().order.illumination, "center");
    const lines = wrapLines(T().touch.rotateBody, PW - 44);
    lines.forEach((ln, i) => drawText(ln, PW / 2, 204 + i * 12, P().order.boneShade, "center"));
    rect(24, 274, PW - 48, 1, P().ground.stone);
    drawText(T().title.subline, PW / 2, 282, P().ground.ash, "center");
    g = keep;
  }

  function drawClaim() {
    rect(0, 0, W, H, P().ground.obsidian);
    panel(24, 56, W - 48, 52);
    drawWrapped(claimMsg, 36, 68, W - 72, P().order.bone);
    drawText(touchUI() ? T().touch.claimPrompt : T().zoneClear.prompt, W / 2, 140, P().ground.smoke, "center");
    tapTarget(0, 0, W, H, () => input.tap("confirm"));
  }
  function drawDefeat() {
    rect(0, 0, W, H, P().ground.obsidian);
    drawText(T().defeat.heading, W / 2, 48, P().order.bone, "center");
    drawText(T().defeat.sub, W / 2, 64, P().ground.ash, "center");
    [T().defeat.retry, T().defeat.toHub].forEach((it, i) => {
      const sel = i === menuIx;
      const pitch = touchUI() ? 22 : 14;
      drawText((sel ? "> " : "  ") + it, W / 2, 96 + i * pitch, sel ? P().order.illumination : P().order.boneShade, "center");
      menuRow(60, 96 + i * pitch, W - 120, pitch, "defeat" + i, false, () => { menuIx = i; });
    });
  }
  function drawEnding() {
    // Final scene: hub altar backdrop + guide + fragments, text in a bottom panel.
    // Order: Ryan at the temple altar, six fragments set apart. Cult: General Jeriah
    // in the hideout, six fragments brought together. Existing sprites only; Blevins
    // is never drawn and the Crimson Moon is not shown as a destination.
    rect(0, 0, W, H, P().ground.obsidian);
    const isOrder = path === "order";
    const head = isOrder ? T().endings.order.heading : T().endings.cult.heading;
    const tw = W - 40, lh = 11;
    const rows = [];
    const show = Math.min(endingIx + 1, endingLines.length);
    for (let i = 0; i < show; i++) { for (const ln of wrapLines(endingLines[i], tw)) rows.push(ln); rows.push(null); }
    if (rows.length && rows[rows.length - 1] === null) rows.pop();
    let bodyH = 0; for (const r of rows) bodyH += r === null ? 3 : lh;
    const ph = 8 + 12 + bodyH + 4 + 10 + 6;
    const py = H - 4 - ph;
    // raise the scene so the altar, guide and fragments sit fully above the panel
    const lift = (level && level.altar) ? Math.max(24, (level.altar.y + 18) - (py - 2)) : 30;
    if (level) {
      g.save(); g.translate(0, -lift);
      drawBG(); drawAmbient(); drawPlatforms();
      g.restore();
      // BG parallax ends at H; fill the lifted gap under the scene
      rect(0, H - lift, W, lift, P().ground.obsidian);
      const a = level.altar;
      if (a) {
        const ax = worldX(a.x), ay = a.y - lift;
        try {
          if (isOrder) atlas.drawFrameOutlined(g, "guide-ryan.png", "idle", ax - 20, ay - 8, false, 16, 24, P().ground.void);
          else {
            const bs = window.SHARDS.bossSheet.jeriah; // feet on the same line as Ryan's
            atlas.drawFrameOutlined(g, bs.path, "idle", ax - 20 - ((bs.fw - 16) / 2 | 0), ay + 16 - bs.fh, false, bs.fw, bs.fh, P().ground.void);
          }
        } catch (_) {}
        const frags = window.SHARDS.fragmentOrder;
        if (isOrder) {
          // six fragments kept apart: a spaced row, each on its own bone hairline
          const sp = 18, x0 = ((ax + 8) - (sp * (frags.length - 1) + 8) / 2) | 0, fy = ay - 34;
          frags.forEach((f, i) => {
            const fx = x0 + i * sp;
            atlas.drawFrame(g, "ui-fragments.png", f, fx, fy, false, 8, 8);
            rect(fx, fy + 10, 8, 1, P().order.nexus);
          });
        } else {
          // six fragments brought together: a tight 3x2 cluster over the hideout altar
          const sp = 10, cx = ((ax + 8) - (sp * 2 + 8) / 2) | 0, fy = ay - 30;
          frags.forEach((f, i) => {
            atlas.drawFrame(g, "ui-fragments.png", f, cx + (i % 3) * sp, fy + ((i / 3) | 0) * sp, false, 8, 8);
          });
          rect(cx - 2, fy + 2 * sp + 1, sp * 2 + 12, 1, P().cult.ember);
        }
      }
    }
    panel(12, py, W - 24, ph);
    drawText(head, W / 2, py + 8, P().order.illumination, "center");
    let y = py + 8 + 14;
    for (const r of rows) { if (r === null) { y += 3; continue; } drawText(r, 20, y, P().order.bone); y += lh; }
    if (endingIx >= endingLines.length - 1) drawText(touchUI() ? T().touch.end : T().endings.end, W / 2, py + ph - 14, P().ground.smoke, "center");
    tapTarget(0, 0, W, H, () => input.tap("confirm"));
  }
  function drawFragmentsPage() {
    g.fillStyle = "rgba(5,4,4,0.75)"; g.fillRect(0, 0, W, H);
    panel(16, 12, W - 32, H - 24);
    drawText(T().fragmentPage.heading, W / 2, 18, P().order.illumination, "center");
    const frags = window.SHARDS.fragmentOrder;
    let y = 34;
    // 3 entries per page (scroll 0..3) so the last row never runs into the Back line
    for (let i = fragScroll; i < Math.min(fragScroll + 3, frags.length); i++) {
      const f = frags[i];
      const e = T().fragmentPage.entries[f];
      const claimed = !!save.claimed[f];
      const held = !claimed && heldByAlly(f); // cult: Jeriah holds the Heart
      atlas.drawFrame(g, "ui-fragments.png", f, 28, y, false, 8, 8);
      drawText(e.name, 42, y, claimed || held ? P().order.illumination : P().order.boneShade);
      const status = claimed ? T().fragmentPage.claimed : held ? T().fragmentPage.held : T().fragmentPage.unclaimed;
      drawText(status, W - 28, y, claimed ? P().order.nexus : held ? P().cult.emberLight : P().ground.ash, "right");
      drawText(T().fragmentPage.bearer + ": " + e.bearer, 42, y + 10, P().ground.smoke);
      drawText(T().fragmentPage.found + ": " + (held ? T().fragmentPage.heldFound : e.found), 42, y + 20, P().ground.ash);
      y += 34;
    }
    if (touchUI()) {
      drawText(T().touch.fragBack, W / 2, H - 32, P().ground.smoke, "center");
      tapTarget(16, H - 44, W - 32, 32, () => input.tap("cancel"));
      // scroll: upper half of the list goes up, lower half goes down; gold ticks show more
      tapTarget(16, 12, W - 32, 62, () => input.tap("up"));
      tapTarget(16, 74, W - 32, H - 118, () => input.tap("down"));
      if (fragScroll > 0) { rect(W - 26, 30, 5, 1, P().order.nexus); rect(W - 25, 29, 3, 1, P().order.nexus); rect(W - 24, 28, 1, 1, P().order.nexus); }
      if (fragScroll < 3) { rect(W - 26, H - 48, 5, 1, P().order.nexus); rect(W - 25, H - 47, 3, 1, P().order.nexus); rect(W - 24, H - 46, 1, 1, P().order.nexus); }
    } else drawText(T().pause.back + " (Esc/Enter)", W / 2, H - 32, P().ground.smoke, "center");
  }
  function drawPause() {
    if (pausePage === "fragments") { drawFragmentsPage(); return; }
    g.fillStyle = "rgba(5,4,4,0.65)"; g.fillRect(0, 0, W, H);
    const t = touchUI(), top = t ? 50 : 56, pitch = t ? 21 : 16;
    panel(60, t ? 20 : 28, W - 120, t ? 140 : 124);
    drawText(T().hud.paused, W / 2, t ? 30 : 36, P().order.illumination, "center");
    [T().hud.resume, T().hud.fragments, T().hud.settings, T().hud.toHub, T().hud.toTitle].forEach((it, i) => {
      const sel = i === pauseIx;
      drawText((sel ? "> " : "  ") + it, W / 2, top + i * pitch, sel ? P().order.illumination : P().order.boneShade, "center");
      menuRow(60, top + i * pitch, W - 120, pitch, "pause" + i, false, () => { pauseIx = i; });
    });
  }

  function drawWorld() {
    drawBG();
    drawAmbient();
    drawPlatforms();
    for (const pr of projectiles) {
      rect(worldX(pr.x), pr.y, pr.w, pr.h, pr.color);
    }
    drawPickups();
    drawEnemies();
    if (player) drawPlayer();
    if (scene === "arena" || scene === "pause") drawBoss();
    for (const p of particles) rect(worldX(p.x), p.y | 0, 2, 2, p.color);
    if (player) drawHUD();
    if (scene === "hub" || (scene === "pause" && level.kind === "hub")) drawHubUI();
    if (scene === "travel") drawTravel();
    if (scene === "traverse") {
      const gate = level.bossGate;
      if (gate && aabb(player, gate)) {
        drawDialogue(touchUI() ? T().touch.gate : T().zoneClear.gate);
      }
    }
    if (scene === "arena" && introHold > 0 && boss) {
      // Boss intro name card (portrait when present). Silent: portrait only, never a name.
      const label = T().bossLabels[boss.id];
      const port = portraitPathForBoss(boss.id);
      if (label) {
        const textW = measure(label);
        const padX = 10, padY = 8;
        const portW = port ? 40 : 0;
        const tw = Math.min(W - 16, Math.max(textW + portW + padX * 2, port ? 88 : 48));
        const th = port ? 48 : (10 + padY * 2);
        const tx = ((W - tw) / 2) | 0;
        const ty = 32;
        panel(tx, ty, tw, th);
        if (port) try { atlas.drawImage(g, port, tx + 6, ty + 8, 32, 32); } catch (_) {}
        const textX = port ? tx + 44 : tx + tw / 2;
        const textY = port ? ty + 20 : ty + padY + 1;
        drawText(label, textX, textY, P().order.illumination, port ? undefined : "center");
      } else if (port) {
        panel(((W - 40) / 2) | 0, 40, 40, 40);
        try { atlas.drawImage(g, port, ((W - 32) / 2) | 0, 44, 32, 32); } catch (_) {}
      }
      tapTarget(0, 0, W, H, () => input.tap("confirm"));
      const intro = introPages[Math.min(introPage, introPages.length - 1)] || "";
      const last = introPage >= introPages.length - 1;
      drawDialogue(last ? intro + "\n" + T().bossReason[path] : intro, port);
    }
    if (scene === "pause") drawPause();
    // Zone title card on traversal / hub entry only — never over boss bar
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
      drawWrapped("BOOT ERROR: " + bootError, 8, 8, W - 16, P().cult.ember);
    } else if (flash > 0) {
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
    const sx = shake ? (((Math.random() * 3) | 0) - 1) : 0;
    const sy = shake ? (((Math.random() * 3) | 0) - 1) : 0;
    out.drawImage(fb, Math.round(sx * scale), Math.round(sy * scale), canvas.width, canvas.height);
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
      enterClaim(boss.fragment);
    },
    damageBoss(n) { if (boss) { boss.inv = 0; damageBoss(n || 1); } },
    save() { return JSON.parse(JSON.stringify(save)); },
    pos() { return player ? { x: player.x, y: player.y, scene, levelId } : { scene }; },
    place(x, y) { if (player) { player.x = x; player.y = y; player.vx = player.vy = 0; cameraX = Math.max(0, Math.min((level.w || W) - W, x - W / 2)); } },
    scene() { return scene; },
    boss() { return boss ? { id: boss.id, hp: boss.hp, phase: boss.phase, dead: boss.dead, x: boss.x, y: boss.y, visible: boss.visible, move: boss.move, teleT: boss.teleT, moveT: boss.moveT } : null; },
    forceTouch(on) { input.isTouch = !!on; if (on) input.lastDevice = "touch"; sizeCanvas(); },
    touchInfo() {
      return { touchUI: touchUI(), portrait, scale, cssFit, pads: touchLayout().map(b => ({ name: b.name, x: b.x, y: b.y, w: 28, h: 28 })),
        targets: drawnTargets.map(t => ({ x: t.x, y: t.y, w: t.w, h: t.h })), dialogueTop: lastTouchDialogue, held: [...padHeld],
        canvas: (() => { const r = canvas.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; })() };
    },
    menu() { return { menuIx, travelIx, pauseIx, settingsIx, pausePage, introHold, endingIx, tutPrompt, tutorial: save.tutorial, volume: Object.assign({}, synth.volume), hubSaid, titleCard }; },
    player() { return player ? { x: player.x, y: player.y, vx: player.vx, vy: player.vy, hp: player.hp, onGround: !!player.onGround, anim: player.anim } : null; },
    setIntro(n) { introHold = n|0; },
    skipIntro() { introHold = 0; introPage = introPages.length - 1; if (level) { save.seenIntro[level.zone || levelId] = true; persist(); } },
    god(on) { godMode = on !== false; if (player) player.inv = godMode ? 9999 : 0; },
    isGod() { return !!godMode; }
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
