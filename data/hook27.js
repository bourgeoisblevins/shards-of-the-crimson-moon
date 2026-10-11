// v2.7: hook, grapple and swing tuning + the pure pendulum model. The engine (src/engine.js) and the reach checker
// (tests/reach.mjs) both use step()/start()/release(), so what the checker proves is what the player gets.
// Everything here is a v2.7 INVENTION pending Ryan's approval (see CANON_SUMMARY.md): the archive has no hook, rope or swing-ring entry.
(function () {
  var S = window.SHARDS = window.SHARDS || {};
  var H = S.hook27 = {
    G: 0.30,          // gravity along the rope (px/frame^2): ~1.6 s per full swing at 80 px
    DAMP: 0.9992, PUMP: 0.0008, VMAX: 5.0, AMAX: 1.32, LMIN: 46, LMAX: 128,
    GRAB: 22,         // auto-latch radius when you press Jump in mid-air next to a ring
    SOLO: 6,          // frames after release before a ring can be grabbed again
    // whip (Sunthread Whip / Embercord Lash): longer, faster, better reward. rope (Pilgrim's Rope-Hook / Chain-Anchor): always available.
    whip: { ledge: 132, swing: 124, shoot: 5, reel: 5.4, cd: 12, boost: 1.14, hop: 2.2, pop: 1.6, dy: 36 },
    rope: { ledge: 98, swing: 96, shoot: 9, reel: 3.1, cd: 26, boost: 1.0, hop: 1.2, pop: 0, dy: 36 },
    themes: { vespera: "ring", deep: "root", aurelion: "gold", deepLairs: "sconce", saffrika: "branch", sakura: "ice", monastery: "bell", sandria: "hoop", capital: "serpent", bonus_belfry: "bell", bonus_embers: "ember", bonus_spores: "root" },
    start: function (ax, ay, cx, cy, vx, vy, Lmax) {
      var dx = cx - ax, dy = cy - ay, L = Math.max(H.LMIN, Math.min(Lmax || H.LMAX, Math.sqrt(dx * dx + dy * dy)));
      var th = Math.atan2(dx, dy); th = Math.max(-H.AMAX, Math.min(H.AMAX, th));
      var vt = vx * Math.cos(th) - vy * Math.sin(th);
      var om = Math.max(-0.07, Math.min(0.07, vt / L));
      return { ax: ax, ay: ay, L: L, th: th, om: om, t: 0 };
    },
    step: function (s, dir) {
      s.t++;
      s.om += -(H.G / s.L) * Math.sin(s.th);
      if (dir) { if (s.om * dir >= -0.004) s.om += dir * H.PUMP; else s.om *= 0.985; }
      s.om *= H.DAMP; var lim = H.VMAX / s.L; if (s.om > lim) s.om = lim; if (s.om < -lim) s.om = -lim; s.th += s.om;
      if (s.th > H.AMAX) { s.th = H.AMAX; s.om = -Math.abs(s.om) * 0.3; }
      if (s.th < -H.AMAX) { s.th = -H.AMAX; s.om = Math.abs(s.om) * 0.3; }
    },
    pos: function (s) { return { x: s.ax + s.L * Math.sin(s.th), y: s.ay + s.L * Math.cos(s.th) }; },
    vel: function (s) { return { vx: s.L * s.om * Math.cos(s.th), vy: -s.L * s.om * Math.sin(s.th) }; },
    release: function (s, kind) {
      var v = H.vel(s), k = (kind === "whip" ? H.whip : H.rope), up = v.vy < 0 ? k.hop : k.hop * 0.4;
      return { vx: v.vx * k.boost, vy: v.vy * k.boost - up };
    }
  };
  H.text = {
    tips: {
      kb: { hook: "Jump, then press T near a glowing ring to latch on.", swing: "Left/Right pump the swing. Jump lets go. Down drops.", ledge: "Press T beside a marked ledge to be pulled up." },
      gamepad: { hook: "Jump, then press {RT} near a glowing ring to latch on.", swing: "Stick pumps the swing. {A} lets go. Down drops.", ledge: "Press {RT} beside a marked ledge to be pulled up." },
      touch: { hook: "Jump, then tap HOOK near a glowing ring to latch on.", swing: "Left/Right pump the swing. Jump lets go. Down drops.", ledge: "Tap HOOK beside a marked ledge to be pulled up." }
    },
    advKb: "Enter: next", advTouch: "Tap: next",
    names: { whip: ["Sunthread Whip", "Embercord Lash"], rope: ["Pilgrim's Rope-Hook", "Chain-Anchor"] },
    desc: "Hook (T / RT / HOOK pad): shoots a whip or, without one, a rope-hook to a marked ledge or a ring. The whip reaches farther, reels faster and gives a hop on landing."
  };
})();
