// Shards of the Crimson Moon — chiptune score + SFX (WebAudio, sample-free).
//
// A tiny tracker: songs are sections of patterns (note strings, chord-driven
// generators, drum grids) on pulse (12.5/25/50%), 4-bit triangle and LFSR-noise
// channels, each note shaped by an ADSR envelope. Notes are scheduled ahead on
// the AudioContext clock (lookahead scheduler); timers only wake the scheduler.
//
// Public API used by engine.js (unchanged names/signatures):
//   new SHARDS.Synth()          .volume {master,music,sfx}   .setVolume(kind, v)
//   .resume()  .play(track)  .sfx(name)  .stopMusic()  .forScene(scene, path, zoneId)
// Additions (optional for the engine):
//   .play(track, zoneIdOrPath)  track may also be a zone id ("vespera", "deep", ...),
//                               "endingOrder", "endingCult", "boss2".
//   .setBossPhase(n)            1 or 2 (phase 2 = faster tempo + extra layers).
//   .sfx(name)                  names listed in SFX below (aliases: strike, hurt,
//                               death, pickup, claim, skill, menu are context-aware).
//   SHARDS.Synth.renderTrack / renderSfx / tracks() / sfxNames() for offline previews.
(function () {
  "use strict";
  window.SHARDS = window.SHARDS || {};
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  const DEBUG = /[?&]debug=1(&|$)/.test(location.search);
  const log = (...a) => { if (DEBUG) console.log("[audio]", ...a); };

  // ======================================================================
  // Pitch + pattern notation
  // ======================================================================
  const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const acc = (a) => (a === "b" ? -1 : a === "s" ? 1 : 0);
  function noteMidi(s) {
    const m = /^([A-G])(b|s)?(-?\d)$/.exec(s);
    if (!m) throw new Error("audio: bad note " + s);
    return 12 * (+m[3] + 1) + PC[m[1]] + acc(m[2]);
  }
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  // "D5:4 F5+A5:8 r:4 E5:2!"  (len in steps, r = rest, + = chord, ! = accent, | ignored)
  function seq(str) {
    const evs = []; let pos = 0;
    for (const tok of str.trim().split(/\s+/)) {
      if (!tok || tok === "|") continue;
      const m = /^([^:!]+)(?::(\d+))?(!)?$/.exec(tok);
      if (!m) throw new Error("audio: bad token " + tok);
      const len = m[2] ? +m[2] : 4;
      if (m[1] !== "r") evs.push({ at: pos, len, notes: m[1].split("+").map(noteMidi), vel: m[3] ? 1 : 0.86 });
      pos += len;
    }
    return { evs, len: pos };
  }
  const asSeq = (v) => (typeof v === "string" ? seq(v) : v);
  const trans = (s, n) => { s = asSeq(s); return { len: s.len, evs: s.evs.map((e) => ({ ...e, notes: e.notes.map((x) => x + n) })) }; };
  const rep = (s, n) => Array(n).fill(s).join("");
  const hits = (len, map) => { const a = Array(len).fill("."); for (const k in map) a[k] = map[k]; return a.join(""); };

  const QUAL = {
    "": [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus2: [0, 2, 7], sus4: [0, 5, 7],
    "5": [0, 7], "6": [0, 4, 7, 9], "7": [0, 4, 7, 10], m7: [0, 3, 7, 10], maj7: [0, 4, 7, 11],
    m7b5: [0, 3, 6, 10], add9: [0, 4, 7, 14], m6: [0, 3, 7, 9]
  };
  // "Dm Bb:8 A:8 F/C Asus4" — default length = one bar
  function chords(str, barSteps) {
    const out = []; let pos = 0;
    for (const tok of str.trim().split(/\s+/)) {
      if (!tok || tok === "|") continue;
      const m = /^([A-G])(b|s)?([a-z0-9]*?)(?:\/([A-G])(b|s)?)?(?::(\d+))?$/.exec(tok);
      if (!m) throw new Error("audio: bad chord " + tok);
      let a = m[2], q = m[3];
      if (!(q in QUAL) && a === "s") { q = "s" + q; a = undefined; }
      if (!(q in QUAL)) throw new Error("audio: bad chord quality " + tok);
      const len = m[6] ? +m[6] : barSteps;
      const root = (PC[m[1]] + acc(a) + 12) % 12;
      const bass = m[4] ? (PC[m[4]] + acc(m[5]) + 12) % 12 : null;
      out.push({ at: pos, len, root, tones: QUAL[q], bass });
      pos += len;
    }
    return out;
  }
  // Chord-driven generator: digits = chord-tone index (0 root,1 3rd,2 5th,3 next tone/oct...)
  // "-" sustains, "." rests. Pattern restarts on every chord change.
  const gen = (pat, oct, o) => Object.assign({ pat, oct }, o || {});
  function genFromChords(chs, g, total, isBass) {
    const evs = [];
    for (const c of chs) {
      if (c.at >= total) break;
      let cur = null;
      for (let i = 0; i < c.len && c.at + i < total; i++) {
        const ch = g.pat[i % g.pat.length];
        if (ch >= "0" && ch <= "9") {
          const k = +ch, n = c.tones.length;
          let midi = 12 * (g.oct + 1) + c.root + c.tones[k % n] + 12 * Math.floor(k / n);
          if (k === 0 && (isBass || g.bass) && c.bass != null) midi = 12 * (g.oct + 1) + c.bass;
          cur = { at: c.at + i, len: 1, notes: [midi], vel: g.vel || 0.86 };
          evs.push(cur);
        } else if (ch === "-" && cur) cur.len++;
        else cur = null;
      }
    }
    return evs;
  }
  // diatonic transpose (keeps chromatic notes chromatic)
  function dia(s, n, keyPc, mode) {
    s = asSeq(s);
    const f = (m) => {
      const rel = m - keyPc, oct = Math.floor(rel / 12), pc = ((rel % 12) + 12) % 12;
      let i = mode.length - 1; while (i > 0 && mode[i] > pc) i--;
      const chroma = pc - mode[i], d = i + n, L = mode.length;
      return keyPc + 12 * (oct + Math.floor(d / L)) + mode[((d % L) + L) % L] + chroma;
    };
    return { len: s.len, evs: s.evs.map((e) => ({ ...e, notes: e.notes.map(f) })) };
  }
  const AEOLIAN = [0, 2, 3, 5, 7, 8, 10];

  // ======================================================================
  // Waveforms + noise (generated once per AudioContext)
  // ======================================================================
  const WAVE_FN = {
    p12: (x) => (x < 0.125 ? 1 : -1),
    p25: (x) => (x < 0.25 ? 1 : -1),
    p50: (x) => (x < 0.5 ? 1 : -1),
    tri: (x) => { const q = Math.floor(x * 32); const s = q < 16 ? q : 31 - q; return s / 7.5 - 1; } // 4-bit stepped
  };
  const COEF = {};
  function coef(name) {
    if (COEF[name]) return COEF[name];
    const fn = WAVE_FN[name], N = 512, H = 40;
    const re = new Float32Array(H + 1), im = new Float32Array(H + 1), xs = new Float32Array(N);
    for (let i = 0; i < N; i++) xs[i] = fn((i + 0.5) / N);
    for (let h = 1; h <= H; h++) {
      let a = 0, b = 0;
      for (let i = 0; i < N; i++) { const ph = 2 * Math.PI * h * (i + 0.5) / N; a += xs[i] * Math.cos(ph); b += xs[i] * Math.sin(ph); }
      re[h] = 2 * a / N; im[h] = 2 * b / N;
    }
    return (COEF[name] = [re, im]);
  }
  const BANKS = new WeakMap();
  function bank(A) {
    let b = BANKS.get(A);
    if (b) return b;
    b = { waves: {} };
    for (const k of Object.keys(WAVE_FN)) { const [re, im] = coef(k); b.waves[k] = A.createPeriodicWave(re, im); }
    const sr = A.sampleRate;
    // long-mode 15-bit LFSR ("white" chip noise), held 2 samples
    b.white = A.createBuffer(1, sr, sr);
    let d = b.white.getChannelData(0), r = 1;
    for (let i = 0; i < d.length; i++) {
      if ((i & 1) === 0) { const bit = (r ^ (r >> 1)) & 1; r = (r >> 1) | (bit << 14); }
      d[i] = (r & 1) ? 0.8 : -0.8;
    }
    // short-mode LFSR (93-step metallic loop), held 6 samples
    b.metal = A.createBuffer(1, sr >> 1, sr);
    d = b.metal.getChannelData(0); r = 1;
    for (let i = 0; i < d.length; i++) {
      if (i % 6 === 0) { const bit = (r ^ (r >> 6)) & 1; r = (r >> 1) | (bit << 14); }
      d[i] = (r & 1) ? 0.8 : -0.8;
    }
    BANKS.set(A, b);
    return b;
  }
  function setWave(A, osc, name) {
    if (name === "sine" || name === "triangle") osc.type = name;
    else osc.setPeriodicWave(bank(A).waves[name] || bank(A).waves.p50);
  }

  // ======================================================================
  // Voices
  // ======================================================================
  // one-shot tone with pitch sweep (sfx + drums)
  function tone(A, out, t, o) {
    const osc = A.createOscillator(), g = A.createGain();
    setWave(A, osc, o.wave || "p50");
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(5, o.f2), t + (o.slide || o.dur));
    if (o.det) osc.detune.value = o.det;
    const a = Math.min(o.a || 0.003, o.dur * 0.5), v = Math.max(0.0002, o.vol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    if (o.hold) g.gain.setValueAtTime(v, t + a + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    let lfo = null;
    if (o.vib) {
      lfo = A.createOscillator(); const lg = A.createGain();
      lfo.type = "triangle"; lfo.frequency.value = o.vib.rate; lg.gain.value = o.vib.depth;
      lfo.connect(lg); lg.connect(osc.detune); lfo.start(t); lfo.stop(t + o.dur + 0.02);
    }
    osc.connect(g); g.connect(out);
    osc.start(t); osc.stop(t + o.dur + 0.02);
  }
  // filtered noise burst
  function noise(A, out, t, o) {
    const B = bank(A), src = A.createBufferSource(), g = A.createGain();
    src.buffer = o.metal ? B.metal : B.white; src.loop = true;
    if (o.rate) src.playbackRate.value = o.rate;
    let node = src;
    if (o.type) {
      const f = A.createBiquadFilter();
      f.type = o.type; f.Q.value = o.Q || 0.7;
      f.frequency.setValueAtTime(o.fq, t);
      if (o.fq2) f.frequency.exponentialRampToValueAtTime(o.fq2, t + (o.sweep || o.dur));
      if (o.fpath) for (const [dt, fr] of o.fpath) f.frequency.exponentialRampToValueAtTime(fr, t + dt);
      src.connect(f); node = f;
    }
    const a = Math.min(o.a || 0.002, o.dur * 0.6), v = Math.max(0.0002, o.vol);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(v, t + a);
    if (o.hold) g.gain.setValueAtTime(v, t + a + o.hold);
    g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
    node.connect(g); g.connect(out);
    src.start(t, Math.random() * 0.4); src.stop(t + o.dur + 0.02);
  }

  // Music note with ADSR, optional dual-osc detune, vibrato, wobble, bell partial.
  function playNote(A, out, send, inst, midi, t, dur, vel) {
    const f = mtof(midi + (inst.oct || 0) * 12);
    const a = Math.min(inst.a == null ? 0.005 : inst.a, dur * 0.5);
    const d = inst.d || 0.1, s = inst.s == null ? 0.7 : inst.s, r = inst.r || 0.06;
    const peak = (inst.vol || 0.1) * vel * (inst.det ? 0.62 : 1);
    const g = A.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.setTargetAtTime(Math.max(0.0001, peak * s), t + a, d / 3);
    g.gain.setTargetAtTime(0.0001, t + dur, r / 3);
    g.connect(out); if (send) g.connect(send);
    const end = t + dur + r * 1.7 + 0.02;
    const dets = inst.det ? [-inst.det / 2, inst.det / 2] : [0];
    const drift = inst.wob ? (Math.random() - 0.5) * (inst.wob.drift || 0) : 0;
    const oscs = dets.map((dc) => {
      const o = A.createOscillator();
      setWave(A, o, inst.wave);
      if (inst.bend) { o.frequency.setValueAtTime(f * Math.pow(2, -inst.bend / 12), t); o.frequency.exponentialRampToValueAtTime(f, t + 0.035); }
      else o.frequency.setValueAtTime(f, t);
      if (inst.wob) {
        const w = inst.wob, val = (tt) => dc + drift + w.depth * Math.sin(2 * Math.PI * w.rate * tt) + w.depth * 0.5 * Math.sin(2 * Math.PI * w.rate * 2.37 * tt + 1.3);
        o.detune.setValueAtTime(val(t), t);
        for (let tt = t + 0.3; tt < end; tt += 0.3) o.detune.linearRampToValueAtTime(val(tt), tt);
      } else if (dc) o.detune.value = dc;
      o.connect(g); o.start(t); o.stop(end);
      return o;
    });
    if (inst.vib && dur > inst.vib.delay + 0.08) {
      const l = A.createOscillator(), lg = A.createGain();
      l.type = "triangle"; l.frequency.value = inst.vib.rate;
      lg.gain.setValueAtTime(0, t + inst.vib.delay);
      lg.gain.linearRampToValueAtTime(inst.vib.depth, t + inst.vib.delay + 0.2);
      l.connect(lg); for (const o of oscs) lg.connect(o.detune);
      l.start(t); l.stop(end);
    }
    if (inst.partial) {
      const p = inst.partial, o2 = A.createOscillator(), g2 = A.createGain();
      setWave(A, o2, p.wave || "tri");
      o2.frequency.value = f * p.ratio;
      g2.gain.setValueAtTime(0.0001, t);
      g2.gain.linearRampToValueAtTime(peak * p.vol, t + 0.003);
      g2.gain.setTargetAtTime(0.0001, t + 0.003, p.d / 3);
      o2.connect(g2); g2.connect(out); if (send) g2.connect(send);
      o2.start(t); o2.stop(t + p.d * 2 + 0.05);
    }
  }

  // Drum kit on noise + triangle channels.
  function drum(A, out, c, t, v) {
    const acc2 = (c === "K" || c === "S" || c === "H" || c === "X") ? 1.3 : 1;
    switch (c) {
      case "k": case "K":
        tone(A, out, t, { wave: "tri", f: 165, f2: 42, dur: 0.17, vol: 0.75 * v * acc2, a: 0.002 });
        noise(A, out, t, { dur: 0.025, vol: 0.22 * v * acc2, type: "lowpass", fq: 2600 }); break;
      case "s": case "S":
        noise(A, out, t, { dur: 0.15, vol: 0.5 * v * acc2, type: "bandpass", fq: 1900, Q: 0.8 });
        tone(A, out, t, { wave: "tri", f: 210, f2: 130, dur: 0.08, vol: 0.45 * v * acc2 }); break;
      case "h": case "H":
        noise(A, out, t, { dur: 0.035, vol: 0.2 * v * acc2, type: "highpass", fq: 7200 }); break;
      case "o":
        noise(A, out, t, { dur: 0.24, vol: 0.17 * v, type: "highpass", fq: 6200 }); break;
      case "x": case "X":
        noise(A, out, t, { dur: 0.07, vol: 0.13 * v * acc2, type: "bandpass", fq: 5200, Q: 1.4, a: 0.01 }); break;
      case "t":
        tone(A, out, t, { wave: "tri", f: 125, f2: 70, dur: 0.24, vol: 0.75 * v });
        noise(A, out, t, { dur: 0.04, vol: 0.14 * v, type: "lowpass", fq: 700 }); break;
      case "m":
        tone(A, out, t, { wave: "tri", f: 175, f2: 105, dur: 0.18, vol: 0.65 * v });
        noise(A, out, t, { dur: 0.03, vol: 0.12 * v, type: "lowpass", fq: 1100 }); break;
      case "n":
        tone(A, out, t, { wave: "tri", f: 250, f2: 155, dur: 0.14, vol: 0.55 * v });
        noise(A, out, t, { dur: 0.025, vol: 0.1 * v, type: "lowpass", fq: 1600 }); break;
      case "r":
        tone(A, out, t, { wave: "p25", f: 1100, dur: 0.018, vol: 0.12 * v });
        noise(A, out, t, { dur: 0.025, vol: 0.18 * v, type: "highpass", fq: 3200 }); break;
      case "c":
        for (let i = 0; i < 3; i++) noise(A, out, t + i * 0.011, { dur: 0.02, vol: 0.3 * v, type: "bandpass", fq: 1300, Q: 1.2 });
        noise(A, out, t + 0.033, { dur: 0.12, vol: 0.25 * v, type: "bandpass", fq: 1200, Q: 1.2 }); break;
      case "f": // ritual frame drum
        tone(A, out, t, { wave: "tri", f: 98, f2: 54, dur: 0.38, vol: 0.7 * v });
        noise(A, out, t, { dur: 0.14, vol: 0.28 * v, type: "lowpass", fq: 420 }); break;
      case "g": // gong / tam
        noise(A, out, t, { dur: 2.4, vol: 0.22 * v, metal: true, rate: 0.55, type: "bandpass", fq: 700, fq2: 280, Q: 1.5, a: 0.01 });
        noise(A, out, t, { dur: 1.6, vol: 0.06 * v, type: "highpass", fq: 2500, a: 0.02 });
        tone(A, out, t, { wave: "tri", f: 58, f2: 52, dur: 2.2, vol: 0.32 * v }); break;
      case "z": // metallic clank
        noise(A, out, t, { dur: 0.1, vol: 0.24 * v, metal: true, rate: 1.4, type: "highpass", fq: 1400 }); break;
      case "w": // wind swell
        noise(A, out, t, { dur: 3.6, vol: 0.42 * v, type: "bandpass", fq: 420, fpath: [[1.6, 1150], [3.5, 380]], Q: 4, a: 1.4 }); break;
      case "i": // ice tick
        noise(A, out, t, { dur: 0.05, vol: 0.09 * v, metal: true, rate: 2.6, type: "highpass", fq: 6000 }); break;
    }
  }

  // ======================================================================
  // Instruments
  // ======================================================================
  const I = (base, o) => Object.assign({}, base, o || {});
  const LEAD50 = { wave: "p50", a: 0.012, d: 0.3, s: 0.7, r: 0.1, vol: 0.105, gate: 0.94, vib: { depth: 15, rate: 5.2, delay: 0.2 } };
  const LEAD25 = { wave: "p25", a: 0.008, d: 0.25, s: 0.65, r: 0.08, vol: 0.1, gate: 0.9, bend: 0.6, vib: { depth: 18, rate: 5.8, delay: 0.16 } };
  const LEAD12 = { wave: "p12", a: 0.006, d: 0.2, s: 0.6, r: 0.08, vol: 0.11, gate: 0.9, vib: { depth: 20, rate: 6, delay: 0.14 } };
  const PAD = { wave: "p25", a: 0.25, d: 0.6, s: 0.8, r: 0.5, vol: 0.038, gate: 1 };
  const ARP = { wave: "p12", a: 0.003, d: 0.09, s: 0.25, r: 0.05, vol: 0.045, gate: 0.8 };
  const BASS = { wave: "tri", a: 0.004, d: 0.08, s: 0.9, r: 0.05, vol: 0.2, gate: 0.92 };
  const STAB = { wave: "p50", a: 0.004, d: 0.07, s: 0.3, r: 0.04, vol: 0.055, gate: 0.7 };
  const BELL = { wave: "p12", a: 0.002, d: 1.2, s: 0, r: 1.3, vol: 0.085, gate: 1, partial: { ratio: 3, wave: "tri", vol: 0.8, d: 0.6 } };
  const KIT = { kit: true, vol: 0.5 };

  // ======================================================================
  // The score
  // ======================================================================
  const DEEP_A = "r:8 Gb4:4 F4:4 | Ab4:8 Gb4:4 F4:4 | Eb4:12 D4:4 | Db4:16 | r:4 C5:4 Db5:4 C5:4 | Ab4:8 F4:8 | Gb4:4 F4:4 Db4:4 Bb3:4 | C4:16";
  const DEEP_B = "Eb5:6 C5:2 Ab4:8 | Bb4:4 Db5:4 C5:8 | Gb5:8 Eb5:8 | C5:16 | Ab5:6 G5:2 F5:8 | Gb5:4 F5:4 Db5:8 | Eb5:4 Db5:4 C5:4 B4:4 | C5:16";
  const BOSS_A = "G5:2 G5:2 D5:2 G5:2 Bb5:4 A5:4 | G5:2 G5:2 Eb5:2 G5:2 Bb5:4 C6:4 | D6:4 C6:2 Bb5:2 A5:4 G5:4 | Fs5:8 A5:4 D6:4 | G6:4 F6:2 D6:2 Bb5:4 G5:4 | Eb6:4 D6:2 C6:2 Bb5:4 G5:4 | C6:4 Eb6:4 D6:4 C6:2 A5:2 | Fs5:4 G5:2 A5:2 Bb5:2 C6:2 D6:4";
  const BOSS_B = "Bb4:4 Eb5:4 G5:6 F5:2 | A5:4 C6:4 F5:8 | Fs5:4 A5:4 D6:6 C6:2 | Bb5:8 G5:8 | C6:4 Eb6:4 G6:6 F6:2 | Eb6:4 D6:4 Bb5:4 G5:4 | A5:4 D6:4 Fs5:4 A5:4 | D6:2 C6:2 Bb5:2 A5:2 G5:2 Fs5:2 Eb5:2 D5:2";
  const BOSS_C = "C5:8 Eb5:8 | D5:12 r:4 | Fs5:8 A5:8 | D6:16 | Eb6:8 D6:4 C6:4 | Bb5:8 G5:8 | A5:4 Fs5:4 D5:4 A5:4 | D6:16";
  const CULT_A = "r:4 G4:4 Ab4:4 G4:4 | Eb4:8 D4:4 C4:4 | C5:6 Bb4:2 Ab4:8 | G4:4 Ab4:4 C5:8 | F4:6 G4:2 Ab4:4 F4:4 | C5:8 Ab4:8 | G4:4 C5:8 G4:4 | B4:12 r:4";
  const CULT_B = "Eb5:8 C5:8 | D5:6 Bb4:2 F4:8 | Eb5:4 D5:4 C5:8 | G4:16 | Ab4:4 C5:4 Eb5:8 | F5:8 D5:8 | C5:6 Ab4:2 F4:8 | G4:8 B4:8";

  const SONG_DEFS = {
    title: {
      title: "Shards of the Crimson Moon", mode: "D Aeolian (harmonic-minor cadences)", bpm: 66, spb: 4,
      echo: { beats: 0.75, fb: 0.36, mix: 0.3, lp: 2200 },
      inst: {
        lead: I(LEAD50, { vol: 0.1, a: 0.03, r: 0.3, vib: { depth: 14, rate: 4.6, delay: 0.3 }, echo: 0.5 }),
        harm: I(PAD, { vol: 0.04 }),
        bass: I(BASS, { r: 0.2 }),
        arp: I(ARP, { vol: 0.04, echo: 0.6 }),
        bell: I(BELL, { echo: 0.5 }),
        drums: I(KIT, { vol: 0.5 })
      },
      sections: {
        intro: {
          bars: 4, chords: "Dm Dm Bb A",
          harm: gen("1---------------", 4), bass: gen("0---------------", 2), arp: gen("0...2...3...2...", 4),
          bell: "A5+D6:32 F5+Bb5:16 E5+A5+Cs6:16",
          drums: hits(64, { 0: "g", 48: "t", 52: "t", 56: "m", 60: "t" })
        },
        A: {
          bars: 8, chords: "Dm Bb F C Dm Gm Bb:8 A:8 Dm",
          lead: "A4:4 D5:6 E5:2 F5:4 | G5:6 F5:2 D5:8 | C5:4 F5:6 G5:2 A5:4 | G5:8 E5:4 C5:4 | D5:4 A5:6 G5:2 F5:4 | G5:4 Bb5:6 A5:2 G5:4 | F5:4 D5:4 E5:4 Cs5:4 | D5:16",
          harm: "F4:16 D4:16 C4:8 F4:8 E4:16 F4:16 D4:16 D4:8 E4:8 F4:16",
          bass: gen("0-------2-------", 2), arp: gen("0.1.2.3.2.1.0.1.", 4),
          bell: "A5+D6:64 A5+D6:64",
          drums: "t.......x.......m.......x...m.n."
        },
        B: {
          bars: 8, chords: "Bb C Am Dm Gm C Asus4 A",
          lead: "D5:4 F5:4 Bb5:6 A5:2 | G5:4 E5:4 C5:8 | E5:4 A5:6 G5:2 E5:4 | F5:6 E5:2 D5:8 | Bb5:4 A5:4 G5:4 D5:4 | E5:4 G5:4 C6:8 | D6:8 E6:4 D6:4 | Cs6:8 A5:8",
          harm: gen("1---------------", 4), bass: gen("0-------2-------", 2),
          arp: gen("0123210301232103", 4),
          bell: "F5+Bb5:64 G5+D6:64",
          drums: "t...x...m...x...t...x...m.m.n.n."
        }
      },
      order: ["intro", "A", "B"]
    },

    orderHub: {
      gain: 1.3,
      title: "Temple of the Dawn Order", mode: "G Mixolydian", bpm: 100, spb: 4,
      echo: { beats: 0.5, fb: 0.25, mix: 0.22, lp: 3500 },
      inst: {
        lead: I(LEAD25, { vol: 0.095, echo: 0.3 }),
        harm: I(PAD, { wave: "p50", vol: 0.035 }),
        arp: I(ARP, { vol: 0.042 }),
        bass: I(BASS, { gate: 0.6 }),
        bell: I(BELL, { vol: 0.08, echo: 0.6, partial: { ratio: 3, wave: "tri", vol: 0.9, d: 0.8 } }),
        drums: I(KIT, { vol: 0.38 })
      },
      sections: {
        A: {
          bars: 8, chords: "G F C G G F Dm G",
          lead: "D5:2 G5:2 A5:2 B5:4 A5:2 G5:4 | F5:6 E5:2 F5:2 A5:2 G5:4 | E5:4 G5:4 C6:4 B5:2 A5:2 | G5:12 r:4 | B5:2 A5:2 G5:2 A5:2 B5:4 D6:4 | C6:4 A5:4 F5:4 A5:4 | D5:4 F5:4 A5:4 C6:2 B5:2 | G5:16",
          harm: gen("1-------2-------", 4), arp: gen("0.2.3.2.0.2.3.2.", 4), bass: gen("0...0.2.3...2.0.", 2),
          bell: "G5+D6:32 C6+G6:32 G5+D6:32 D6+A6:32",
          drums: "k.h.s.h.k.khs.h."
        },
        B: {
          bars: 8, chords: "C Am F G C Am F F",
          lead: "G5:6 E5:2 C5:8 | E5:4 A5:4 G5:4 E5:4 | F5:6 G5:2 A5:8 | B5:4 A5:4 G5:4 D5:4 | E5:6 G5:2 C6:8 | B5:4 A5:4 E5:8 | F5:4 A5:4 C6:4 A5:4 | G5:8 F5:4 D5:4",
          harm: gen("1-------2-------", 4), arp: gen("0.2.3.2.0.2.3.2.", 4), bass: gen("0...0.2.3...2.0.", 2),
          bell: "C6+G6:32 F5+C6:32 C6+G6:32 F5+C6:32",
          drums: "k.h.s.h.k.khs.h."
        },
        C: { // temple-bell interlude
          bars: 4, chords: "G F C G",
          bell: "G5:8 D6:8 | F5:8 C6:8 | E5:8 G5:8 | D5+G5:16",
          harm: gen("0---------------", 4), bass: gen("0-------2-------", 2),
          drums: hits(64, { 0: "x", 8: "x", 16: "x", 24: "x", 32: "x", 40: "x", 48: "x", 56: "o" })
        }
      },
      order: ["A", "B", "C"]
    },

    cultHub: {
      gain: 1.15,
      title: "Beneath the Ashen Altar", mode: "C Aeolian (harmonic-minor V)", bpm: 84, spb: 4,
      echo: { beats: 1, fb: 0.3, mix: 0.25, lp: 1500 },
      inst: {
        lead: I(LEAD50, { vol: 0.085, a: 0.04, r: 0.2, vib: { depth: 10, rate: 4, delay: 0.3 }, echo: 0.4 }),
        harm: I(PAD, { wave: "p25", a: 0.04, vol: 0.045, s: 0.6 }),
        drone: I(PAD, { wave: "p12", vol: 0.03, a: 0.5, r: 0.8 }),
        bass: I(BASS, { vol: 0.22, gate: 0.55 }),
        drums: I(KIT, { vol: 0.5 }), gong: I(KIT, { vol: 0.55 })
      },
      sections: {
        A: {
          bars: 8, chords: "Cm Cm Ab Ab Fm Fm Gsus4 G",
          lead: CULT_A, harm: dia(CULT_A, -3, 0, AEOLIAN),
          drone: gen("0---------------", 2), bass: gen("0.0.0.0.0.0.3.0.", 2),
          drums: "f...x.f.r...x...f...x.f.r..rx.r.", gong: hits(128, { 0: "g" })
        },
        B: {
          bars: 8, chords: "Ab Bb Cm Cm Ab Bb Fm G",
          lead: CULT_B, harm: dia(CULT_B, -3, 0, AEOLIAN),
          drone: gen("0---------------", 2), bass: gen("0.0.0.0.0.0.3.0.", 2),
          drums: "f...x.f.r...x...f...x.f.r..rx.r.", gong: hits(128, { 64: "g" })
        }
      },
      order: ["A", "B"]
    },

    vespera: {
      gain: 1.3,
      title: "Crimson Ruins of Vespera", mode: "E Phrygian", bpm: 126, spb: 4, zone: true,
      echo: { beats: 0.75, fb: 0.22, mix: 0.18, lp: 2500 },
      inst: {
        lead: I(LEAD50, { vol: 0.1, echo: 0.3 }), harm: I(STAB, { wave: "p25", vol: 0.05 }),
        arp: I(ARP, { vol: 0.04 }), bass: I(BASS, { gate: 0.7 }), drums: I(KIT, { vol: 0.42 })
      },
      sections: {
        A: {
          bars: 8, chords: "Em F Em Dm Em F G F",
          lead: "E5:6 F5:2 E5:4 B4:4 | C5:4 A4:4 F5:6 E5:2 | E5:4 G5:4 F5:4 E5:4 | D5:8 F5:4 A5:4 | B5:6 C6:2 B5:4 G5:4 | A5:4 F5:4 C6:6 B5:2 | B5:4 D6:4 C6:4 B5:4 | A5:4 G5:2 F5:2 E5:8",
          harm: gen("2..2..2.2..2..2.", 4), arp: gen("0102010301020103", 4), bass: gen("0..0..0.0..0..3.", 2),
          drums: "k..hs..hk.khs.hh"
        },
        B: {
          bars: 8, chords: "Am Em F G Am C Dm F",
          lead: "A4:4 C5:4 E5:8 | B4:4 E5:4 G5:8 | F5:6 E5:2 C5:8 | D5:4 G5:4 B5:8 | C6:6 B5:2 A5:8 | G5:4 E5:4 C5:8 | D5:4 F5:4 A5:4 D6:4 | C6:4 A5:4 G5:4 F5:4",
          harm: trans("A4:4 C5:4 E5:8 | B4:4 E5:4 G5:8 | F5:6 E5:2 C5:8 | D5:4 G5:4 B5:8 | C6:6 B5:2 A5:8 | G5:4 E5:4 C5:8 | D5:4 F5:4 A5:4 D6:4 | C6:4 A5:4 G5:4 F5:4", -12),
          arp: gen("0102010301020103", 4), bass: gen("0..0..0.0..0..3.", 2),
          drums: "k.h.s.h.k.h.s.hs"
        },
        C: {
          bars: 4, chords: "F F Em Em",
          lead: "F5:16 | E5:8 F5:8 | B4:16 | r:16",
          arp: gen("0102010301020103", 4), bass: gen("0.0.0.0.0.0.0.0.", 2),
          drums: "k...t...k...m...k...t...m.m.n.nS"
        }
      },
      order: ["A", "B", "C"]
    },

    deep: {
      title: "The Deep", mode: "C Locrian (pedal + tritone drift)", bpm: 88, spb: 4, zone: true,
      echo: { beats: 0.5, fb: 0.45, mix: 0.35, lp: 1300 },
      inst: {
        lead: I(LEAD50, { vol: 0.125, det: 18, wob: { depth: 20, rate: 0.23, drift: 16 }, vib: null, echo: 0.5 }),
        harm: I(PAD, { wave: "p50", vol: 0.035, det: 24, wob: { depth: 26, rate: 0.17, drift: 10 } }),
        arp: I(ARP, { wave: "p25", vol: 0.04, det: 12, wob: { depth: 18, rate: 0.31, drift: 20 }, echo: 0.6 }),
        bass: I(BASS, { vol: 0.21 }), drums: I(KIT, { vol: 0.45 })
      },
      sections: {
        A: {
          bars: 8, chords: "Cdim Db Cdim Gb Cdim Db Bbm Gb",
          lead: DEEP_A, harm: gen("1---------------", 4), arp: gen("0.1.2.1.0.1.2.3.", 4),
          bass: "C2:16 | C2:12 Db2:4 | C2:16 | Gb1:16 | C2:16 | C2:12 Db2:4 | Bb1:16 | Gb1:16",
          drums: "k.....k...z.....k.....k...z...z."
        },
        B: {
          bars: 8, chords: "Ab Gb Cdim Cdim Fm Gb Cdim Db",
          lead: DEEP_B, harm: gen("1---------------", 4), arp: gen("0.1.2.1.0.1.2.3.", 4),
          bass: gen("0-------2-------", 2), drums: "k.....k...z.....k.....k...z...z."
        }
      },
      order: ["A", "B"]
    },

    deepLairs: {
      title: "Lairs Beneath the Deep", mode: "B Locrian (detuned, sub-octave)", bpm: 76, spb: 4, zone: true,
      echo: { beats: 0.75, fb: 0.5, mix: 0.38, lp: 1000 },
      inst: {
        lead: I(LEAD50, { vol: 0.135, det: 30, wob: { depth: 30, rate: 0.19, drift: 24 }, vib: null, echo: 0.5 }),
        drone: I(PAD, { wave: "p12", vol: 0.04, det: 34, a: 0.8, r: 1, wob: { depth: 35, rate: 0.11, drift: 20 } }),
        glint: I(BELL, { vol: 0.05, det: 22, wob: { depth: 40, rate: 0.4, drift: 30 }, echo: 0.8 }),
        bass: I(BASS, { vol: 0.22, r: 0.15 }), drums: I(KIT, { vol: 0.5 })
      },
      sections: {
        L1: {
          bars: 8, chords: "G F Bdim Bdim Em F Bdim C",
          lead: trans(DEEP_B, -13), drone: gen("0---------------", 3), bass: gen("0-----0-0-------", 2),
          glint: "r:12 F6:4 r:32 B5:2 C6:2 r:44 G6:4 r:28",
          drums: "k.k.............k.k.........z..."
        },
        L2: {
          bars: 8, chords: "Bdim C Bdim F Bdim C Am F",
          lead: trans(DEEP_A, -1), drone: gen("0---------------", 3), bass: gen("0-----0-0-------", 2),
          glint: "r:28 C7:2 B6:2 r:34 F6:4 r:40 E6:4 r:14",
          drums: "k.k.............k.k.....z...z.z."
        }
      },
      order: ["L1", "L2"]
    },

    aurelion: {
      title: "Halls of Aurelion", mode: "Eb Lydian", bpm: 92, spb: 4, zone: true,
      echo: { beats: 0.75, fb: 0.5, mix: 0.45, lp: 3200 },
      inst: {
        lead: I(LEAD50, { vol: 0.09, a: 0.05, r: 0.4, vib: { depth: 12, rate: 4.8, delay: 0.35 }, echo: 0.6 }),
        harm: I(PAD, { vol: 0.035, a: 0.6 }), arp: I(ARP, { vol: 0.05, d: 0.2, s: 0.3, echo: 0.9 }),
        bass: I(BASS, { vol: 0.18, r: 0.3 }), drums: I(KIT, { vol: 0.5 }), gong: I(KIT, { vol: 0.4 })
      },
      sections: {
        A: {
          bars: 8, chords: "Eb F/Eb Eb F/Eb Gm F Cm F",
          lead: "Bb5:12 G5:4 | A5:16 | G5:8 Bb5:4 D6:4 | C6:16 | D6:8 Bb5:8 | A5:8 C6:8 | Eb6:12 D6:4 | C6:12 r:4",
          harm: gen("1---------------", 4), arp: gen("0.1.2.3.4.5.4.3.", 4), bass: gen("0---------------", 2),
          drums: hits(32, { 0: "t" }), gong: hits(128, { 0: "g" })
        },
        B: {
          bars: 8, chords: "Cm Dm Eb F Gm Dm Eb F",
          lead: "G5:8 Eb5:8 | F5:8 A5:8 | Bb5:12 C6:4 | A5:16 | Bb5:6 C6:2 D6:8 | F6:8 D6:4 A5:4 | G5:16 | A5:8 F5:8",
          harm: gen("1---------------", 4), arp: gen("0.1.2.3.4.5.4.3.", 4), bass: gen("0---------------", 2),
          drums: hits(32, { 0: "t", 24: "t" }), gong: hits(128, { 96: "g" })
        }
      },
      order: ["A", "B"]
    },

    saffrika: {
      gain: 1.6,
      title: "Drums of Saffrika", mode: "A Dorian (12/8)", bpm: 108, spb: 3, barSteps: 12, zone: true,
      inst: {
        lead: I(LEAD25, { vol: 0.095, vib: { depth: 22, rate: 6.5, delay: 0.12 } }),
        harm: I(STAB, { wave: "p12", vol: 0.06 }),
        bass: I(BASS, { gate: 0.45, d: 0.1, s: 0.5 }),
        drums: I(KIT, { vol: 0.5 }), shaker: I(KIT, { vol: 0.4 })
      },
      sections: {
        A: {
          bars: 8, chords: "Am G Am D Am G Em D",
          lead: "A4:3 C5:3 E5:2 D5:1 C5:3 | D5:3 B4:3 G4:6 | A4:3 C5:3 E5:3 G5:3 | Fs5:6 E5:3 D5:3 | E5:2 E5:1 G5:3 A5:3 G5:3 | B5:3 A5:3 G5:3 D5:3 | E5:3 G5:3 B4:3 D5:3 | Fs5:3 A5:3 Fs5:3 D5:3",
          harm: gen("..2..1..2..1", 4), bass: gen("0..2..0.32..", 2),
          drums: "k.m.n.t.mkn.", shaker: "X.xX.xX.xX.x"
        },
        B: {
          bars: 8, chords: "Am Am G G D D Em Em",
          lead: "A5:6 G5:3 E5:3 | r:6 E5:3 G5:3 | D6:6 B5:3 G5:3 | r:6 B5:3 D6:3 | A5:6 Fs5:3 D5:3 | r:6 A5:3 B5:3 | G5:3 E5:3 D5:3 B4:3 | E5:12",
          harm: "r:12 | A4:2 C5:1 D5:3 r:6 | r:12 | G4:2 B4:1 D5:3 r:6 | r:12 | D5:2 E5:1 Fs5:3 r:6 | r:12 | r:12",
          bass: gen("0..2..0.32..", 2), drums: "k.mmn.t.mknn", shaker: "X.xX.xX.xX.x"
        },
        C: { // drum break with chant answers
          bars: 4, chords: "Am Am G Am",
          harm: "A5:3 r:9 | G5:3 E5:3 r:6 | D5:3 r:9 | E5:3 G5:3 A5:3 r:3",
          bass: gen("0.....0..0..", 2), drums: "k.n.n.tmk.nm", shaker: "x.xx.xx.xx.x"
        }
      },
      order: ["A", "B", "C"]
    },

    // Mountain Monastery (shards-v5): the Shadow's zone. Cold, sparse, chant-like:
    // a slow plainchant line doubled a fifth below (organum) over an open-fifth
    // drone, a low bronze bell, wind. Title from the shades' entry in the archive.
    monastery: {
      gain: 1.05,
      title: "Prayer Without Rest", mode: "D Dorian (organum over a fifth drone)", bpm: 56, spb: 4, zone: true,
      echo: { beats: 1.5, fb: 0.46, mix: 0.42, lp: 1700 },
      inst: {
        chant: I(LEAD50, { wave: "tri", vol: 0.15, a: 0.14, d: 0.7, s: 0.8, r: 0.45, gate: 1, echo: 0.55, vib: { depth: 7, rate: 4.2, delay: 0.45 } }),
        organum: I(LEAD50, { wave: "p50", vol: 0.032, a: 0.2, d: 0.8, s: 0.75, r: 0.5, gate: 1, echo: 0.35, vib: null }),
        drone: I(PAD, { wave: "tri", vol: 0.075, a: 1.4, d: 1, s: 0.9, r: 1.6, gate: 1 }),
        hum: I(PAD, { wave: "p25", vol: 0.012, a: 1.8, r: 1.8, gate: 1 }),
        bass: I(BASS, { vol: 0.07, a: 0.9, d: 1, s: 0.9, r: 1.2, gate: 1 }),
        bell: I(BELL, { wave: "tri", vol: 0.13, d: 2.4, r: 2.6, echo: 0.8, partial: { ratio: 2.76, wave: "tri", vol: 0.45, d: 1.3 } }),
        drums: I(KIT, { vol: 0.32 })
      },
      sections: {
        A: {
          bars: 8,
          chant: "D4:8 E4:4 F4:4 | G4:8 F4:4 E4:4 | F4:4 G4:4 A4:8 | A4:12 r:4 | C5:4 A4:4 G4:8 | F4:4 G4:4 E4:8 | D4:4 E4:4 F4:4 E4:4 | D4:12 r:4",
          organum: trans("D4:8 E4:4 F4:4 | G4:8 F4:4 E4:4 | F4:4 G4:4 A4:8 | A4:12 r:4 | C5:4 A4:4 G4:8 | F4:4 G4:4 E4:8 | D4:4 E4:4 F4:4 E4:4 | D4:12 r:4", -7),
          drone: rep("D3+A3:16 ", 8), hum: rep("D4+A4:32 ", 4), bass: rep("D2:16 ", 8),
          bell: "D4:16 | r:16 | r:16 | r:16 | A3:16 | r:16 | r:16 | r:16",
          drums: hits(128, { 0: "w", 72: "i", 104: "i" })
        },
        B: {
          bars: 8,
          chant: "A4:8 C5:4 D5:4 | D5:12 r:4 | C5:4 D5:4 E5:4 D5:4 | C5:8 A4:8 | G4:4 A4:4 C5:8 | B4:4 A4:4 G4:8 | F4:4 E4:4 F4:4 G4:4 | A4:12 r:4",
          organum: trans("A4:8 C5:4 D5:4 | D5:12 r:4 | C5:4 D5:4 E5:4 D5:4 | C5:8 A4:8 | G4:4 A4:4 C5:8 | B4:4 A4:4 G4:8 | F4:4 E4:4 F4:4 G4:4 | A4:12 r:4", -7),
          drone: "D3+A3:16 D3+A3:16 C3+G3:16 C3+G3:16 G2+D3:16 G2+D3:16 A2+E3:16 A2+E3:16",
          hum: rep("D4+A4:32 ", 4),
          bass: "D2:32 C2:32 G1:32 A1:32",
          bell: "r:16 | r:16 | G3:16 | r:16 | r:16 | r:16 | A3:16 | r:16",
          drums: hits(128, { 0: "w", 64: "w", 40: "i", 120: "i" })
        },
        C: { // the hall empties: drone, bell, wind, one line of chant far off
          bars: 4,
          chant: "r:16 | r:16 | A4:8 G4:4 E4:4 | D4:16",
          drone: rep("D3+A3:16 ", 4), bass: rep("D2:16 ", 4),
          bell: "D4:16 | r:16 | r:16 | r:16",
          drums: hits(64, { 0: "g", 8: "w", 44: "i" })
        }
      },
      order: ["A", "B", "C"]
    },

    sakura: {
      gain: 1.15,
      title: "Snows Above Sakura", mode: "E minor pentatonic", bpm: 72, spb: 4, zone: true,
      echo: { beats: 1, fb: 0.5, mix: 0.5, lp: 4200 },
      inst: {
        lead: I(BELL, { vol: 0.125, echo: 0.8, partial: { ratio: 3, wave: "tri", vol: 0.7, d: 0.9 } }),
        harm: I(PAD, { wave: "p50", vol: 0.03, a: 0.8, r: 1.2 }),
        bass: I(BASS, { vol: 0.11, a: 0.2, r: 0.8 }), drums: I(KIT, { vol: 0.45 })
      },
      sections: {
        A: {
          bars: 8, chords: "Em7 Em7 Asus2 Asus2 Dsus2 Dsus2 Em7 Em7",
          lead: "B5:4 D6:4 E6:8 | r:8 D6:4 B5:4 | A5:12 r:4 | E6:4 D6:4 B5:8 | D6:6 E6:2 D6:4 A5:4 | r:16 | G5:4 A5:4 B5:8 | E5:16",
          harm: gen("1---------------", 4), bass: gen("0---------------", 2),
          drums: hits(64, { 0: "w", 40: "i", 56: "i" })
        },
        B: {
          bars: 8, chords: "G6 G6 Dsus2 Dsus2 Asus2 Asus2 Em7 Em7",
          lead: "G6:8 E6:4 D6:4 | B5:16 | A5:4 B5:4 D6:8 | r:8 E6:8 | B5:6 A5:2 G5:8 | E5:4 G5:4 A5:8 | B5:12 D6:4 | E6:16",
          harm: gen("1---------------", 4), bass: gen("0---------------", 2),
          drums: hits(64, { 0: "w", 24: "i", 44: "i" })
        }
      },
      order: ["A", "B"]
    },

    boss: {
      gain: 1.1,
      title: "Wrath of the Shardbearer", mode: "G harmonic minor", bpm: 150, spb: 4,
      phase2: { bpm: 164 },
      inst: {
        lead: I(LEAD25, { vol: 0.12, gate: 0.85, vib: { depth: 14, rate: 6.5, delay: 0.12 } }),
        harm: I(PAD, { wave: "p25", a: 0.02, vol: 0.04 }),
        bass: I(BASS, { gate: 0.75, vol: 0.21 }),
        drums: I(KIT, { vol: 0.45 }),
        arp_p2: I(ARP, { vol: 0.035, gate: 0.6 }),
        low_p2: I(LEAD50, { vol: 0.055, vib: null, gate: 0.8 }),
        hat_p2: I(KIT, { vol: 0.3 })
      },
      sections: {
        A: {
          bars: 8, chords: "Gm Eb Cm D Gm Eb Cm:8 D:8 D",
          lead: BOSS_A, harm: gen("2---------------", 4), bass: gen("0.000.300.000.32", 2),
          drums: "k.h.s.hkk.h.s.hh",
          arp_p2: gen("0123012301230123", 5), low_p2: trans(BOSS_A, -12), hat_p2: "hhHhhhHhhhHhhhHh"
        },
        B: {
          bars: 8, chords: "Eb F D Gm Cm Eb D D",
          lead: BOSS_B, harm: gen("2---------------", 4), bass: gen("0.000.300.000.32", 2),
          drums: "k.h.s.hkk.hks.hS",
          arp_p2: gen("0123012301230123", 5), low_p2: trans(BOSS_B, -12), hat_p2: "hhHhhhHhhhHhhhHh"
        },
        C: {
          bars: 8, chords: "Cm Cm D D Eb Eb D D",
          lead: BOSS_C, harm: gen("0---------------", 4), bass: gen("0.0.0.0.0.0.0.00", 2),
          drums: rep("k...t...k.t.m.n.", 7) + "s.s.s.sssssSSSSS",
          arp_p2: gen("0123210301232103", 5), low_p2: trans(BOSS_C, -12), hat_p2: "h.H.h.H.h.H.h.H."
        }
      },
      order: ["A", "B", "C"]
    },

    endingOrder: {
      title: "Hymn of the Restored Light", mode: "F Ionian (major)", bpm: 72, spb: 4,
      echo: { beats: 1, fb: 0.3, mix: 0.3, lp: 3000 },
      inst: {
        lead: I(LEAD50, { vol: 0.1, a: 0.04, r: 0.35, vib: { depth: 13, rate: 4.8, delay: 0.3 }, echo: 0.4 }),
        alto: I(PAD, { wave: "p25", vol: 0.045, a: 0.08 }),
        tenor: I(PAD, { wave: "p12", vol: 0.04, a: 0.08 }),
        bass: I(BASS, { vol: 0.2, r: 0.25 }),
        bell: I(BELL, { echo: 0.6 }), drums: I(KIT, { vol: 0.45 })
      },
      sections: {
        H: {
          bars: 16, chords: "F Bb F/C C F Bb Gm:8 C:8 F Dm Bb F C Bb F/A Gm:8 C7:8 F",
          lead: "F4:4 A4:4 C5:8 | D5:4 C5:4 Bb4:8 | A4:4 C5:4 F5:4 E5:4 | G5:12 r:4 | A5:4 G5:4 F5:8 | F5:4 D5:4 Bb4:8 | Bb4:4 D5:4 C5:4 E5:4 | F5:16 | A5:6 G5:2 F5:8 | D5:4 F5:4 Bb5:8 | A5:4 F5:4 C6:8 | G5:8 E5:8 | F5:4 Bb5:4 D6:4 C6:4 | C6:8 A5:8 | Bb5:4 G5:4 E5:4 G5:4 | F5:16",
          alto: gen("1-------1-------", 4), tenor: gen("2---------------", 3), bass: gen("0-------0-------", 2),
          bell: "F5+C6:112 F5+A5+C6:16 A5+F6:112 F5+A5+C6+F6:16",
          drums: hits(256, { 48: "t", 52: "t", 56: "m", 112: "t", 176: "t", 180: "t", 184: "m", 240: "g" })
        }
      },
      order: ["H"]
    },

    endingCult: {
      title: "The Crimson Ascendant", mode: "C minor, rising chromatic (unresolved)", bpm: 80, spb: 4,
      echo: { beats: 0.75, fb: 0.4, mix: 0.3, lp: 1800 },
      inst: {
        lead: I(LEAD50, { vol: 0.1, a: 0.03, r: 0.3, vib: { depth: 18, rate: 5.5, delay: 0.25 }, echo: 0.4 }),
        harm: I(ARP, { vol: 0.04, gate: 0.7 }),
        choir: I(PAD, { wave: "p50", vol: 0.035, a: 0.6 }),
        bass: I(BASS, { vol: 0.21, gate: 0.8 }),
        drums: I(KIT, { vol: 0.5 }), fx: I(KIT, { vol: 0.45 })
      },
      sections: {
        X: {
          bars: 8, chords: "Cm:32 Db:32 Ddim:32 Ebaug:32", cresc: [0.55, 0.8],
          lead: "C5:8 D5:4 Eb5:4 | G4:16 | Db5:8 Eb5:4 F5:4 | Ab4:16 | D5:8 Eb5:4 F5:4 | Ab4:16 | Eb5:8 F5:4 G5:4 | B4:16",
          harm: gen("2121212121212121", 4), choir: gen("0---------------", 3), bass: gen("0-------0---0-0-", 2),
          drums: "f.......f.......", fx: hits(128, { 0: "g" })
        },
        Y: {
          bars: 8, chords: "Fm:32 Gb:32 Gsus4:32 Abaug:32", cresc: [0.8, 1.15],
          lead: "F5:8 G5:4 Ab5:4 | C5:16 | Gb5:8 Ab5:4 Bb5:4 | Db5:16 | G5:8 Ab5:4 C6:4 | D5:16 | Ab5:8 Bb5:4 C6:4 | E5:16",
          harm: gen("2121212121212121", 4), choir: gen("0---------------", 3), bass: gen("0-------0---0-0-", 2),
          drums: "f...f...f..ff.r.", fx: hits(128, { 64: "g", 100: "w" })
        }
      },
      order: ["X", "Y"]
    }
  };

  // ---------- compile songs into step timelines ----------
  function compileSong(id, def) {
    const barSteps = def.barSteps || 16, timeline = [];
    let pos = 0;
    for (const secName of def.order) {
      const sec = def.sections[secName], total = sec.bars * barSteps;
      const chs = sec.chords ? chords(sec.chords, barSteps) : [];
      for (const ch of Object.keys(sec)) {
        if (ch === "bars" || ch === "chords" || ch === "cresc") continue;
        const inst = def.inst[ch];
        if (!inst) throw new Error("audio: " + id + " has no instrument for " + ch);
        const layer = /_p2$/.test(ch) ? 2 : 0, val = sec[ch];
        let evs;
        if (inst.kit) {
          const g = val.replace(/[\s|]/g, ""); evs = [];
          for (let i = 0; i < total; i++) { const c = g[i % g.length]; if (c !== ".") evs.push({ at: i, drum: c, vel: 1 }); }
        } else if (val && val.pat) evs = genFromChords(chs, val, total, ch === "bass");
        else evs = asSeq(val).evs.filter((e) => e.at < total);
        for (const e of evs) {
          let vel = e.vel || 0.86;
          if (sec.cresc) vel *= sec.cresc[0] + (sec.cresc[1] - sec.cresc[0]) * (e.at / total);
          const step = pos + e.at;
          (timeline[step] || (timeline[step] = [])).push({ ch, inst, layer, notes: e.notes, len: e.len || 1, drum: e.drum, vel });
        }
      }
      pos += total;
    }
    const song = Object.assign({}, def, { id, barSteps, timeline, length: pos });
    song.loopSeconds = (phase) => pos * 60 / ((phase === 2 && def.phase2 ? def.phase2.bpm : def.bpm) * def.spb);
    song.seconds = song.loopSeconds(1);
    return song;
  }
  const SONGS = {};
  for (const k of Object.keys(SONG_DEFS)) SONGS[k] = compileSong(k, SONG_DEFS[k]);
  const ZONE_KEYS = Object.keys(SONGS).filter((k) => SONGS[k].zone);

  // ======================================================================
  // Sequencer (one per playing song; pumped by the Synth's lookahead tick)
  // ======================================================================
  class SongPlayer {
    constructor(A, dest, song, startAt) {
      this.A = A; this.song = song;
      this.out = A.createGain(); this.out.connect(dest);
      this.sends = {}; this.echoIn = null;
      if (song.echo) {
        const e = song.echo, d = A.createDelay(2), fb = A.createGain(), lp = A.createBiquadFilter(), wet = A.createGain();
        this.echoIn = A.createGain(); this.delay = d;
        d.delayTime.value = Math.min(1.9, e.beats * 60 / song.bpm);
        fb.gain.value = e.fb; lp.type = "lowpass"; lp.frequency.value = e.lp || 2500; wet.gain.value = e.mix;
        this.echoIn.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(wet); wet.connect(this.out);
        this._echoNodes = [d, fb, lp, wet];
      }
      this.step = 0; this.nextTime = startAt; this.stopAt = Infinity;
      this.phase = 1; this.targetPhase = 1; this.bpm = song.bpm;
    }
    stepDur() { return 60 / this.bpm / this.song.spb; }
    queuePhase(n) { this.targetPhase = n; }
    setPhaseNow(n) {
      this.phase = this.targetPhase = n;
      this.bpm = n === 2 && this.song.phase2 ? this.song.phase2.bpm : this.song.bpm;
    }
    fadeIn(now, secs) {
      const g = this.out.gain; g.setValueAtTime(0.0001, now); g.linearRampToValueAtTime(this.song.gain || 1, now + Math.max(0.05, secs));
    }
    fadeOut(now, secs) {
      const g = this.out.gain, v = g.value;
      g.cancelScheduledValues(now); g.setValueAtTime(v, now); g.linearRampToValueAtTime(0.0001, now + secs);
      this.stopAt = Math.min(this.stopAt, now + secs);
    }
    send(ch, inst) {
      if (!inst.echo || !this.echoIn) return null;
      let s = this.sends[ch];
      if (!s) { s = this.sends[ch] = this.A.createGain(); s.gain.value = inst.echo; s.connect(this.echoIn); }
      return s;
    }
    pump(until) {
      const song = this.song, end = Math.min(until, this.stopAt);
      while (this.nextTime < end) {
        if (this.phase !== this.targetPhase && this.step % song.spb === 0) this.setPhaseNow(this.targetPhase);
        const evs = song.timeline[this.step], sd = this.stepDur(), t = this.nextTime;
        if (evs) for (const ev of evs) {
          if (ev.layer && this.phase < ev.layer) continue;
          if (ev.drum) drum(this.A, this.out, ev.drum, t, ev.vel * ev.inst.vol);
          else {
            const dur = Math.max(0.03, ev.len * sd * (ev.inst.gate || 0.9)), snd = this.send(ev.ch, ev.inst);
            for (const m of ev.notes) playNote(this.A, this.out, snd, ev.inst, m, t, dur, ev.vel);
          }
        }
        this.nextTime += sd;
        if (++this.step >= song.length) this.step = 0;
      }
    }
    dispose() {
      try { this.out.disconnect(); } catch (_) {}
      if (this._echoNodes) for (const n of this._echoNodes) { try { n.disconnect(); } catch (_) {} }
    }
  }

  // ======================================================================
  // SFX
  // ======================================================================
  const nT = (A, o, t, notes, gap, opts) => notes.forEach((m, i) => tone(A, o, t + i * gap, Object.assign({ f: mtof(m) }, opts)));
  const SFX = {
    // ---- v2.3 ----
    bowShot(A, o, t) {
      noise(A, o, t, { dur: 0.05, vol: 0.2, type: "bandpass", fq: 900, fq2: 1800, Q: 2, a: 0.002 });
      tone(A, o, t, { wave: "tri", f: 220, f2: 120, dur: 0.07, vol: 0.3 });
      noise(A, o, t + 0.02, { dur: 0.16, vol: 0.2, type: "bandpass", fq: 3600, fq2: 1400, Q: 1.8, a: 0.01 });
    },
    knifeThrow(A, o, t) {
      noise(A, o, t, { dur: 0.12, vol: 0.28, type: "bandpass", fq: 1800, fq2: 5200, Q: 2.2, a: 0.004 });
      tone(A, o, t, { wave: "p12", f: 1500, f2: 900, dur: 0.05, vol: 0.07 });
    },
    bow(A, o, t) { tone(A, o, t, { wave: "tri", f: 120, f2: 190, dur: 0.1, vol: 0.2 }); },
    arrowHit(A, o, t) {
      noise(A, o, t, { dur: 0.05, vol: 0.3, type: "lowpass", fq: 3000, fq2: 800 });
      tone(A, o, t, { wave: "p25", f: 520, f2: 260, dur: 0.05, vol: 0.12 });
    },
    arrowGet(A, o, t) { nT(A, o, t, [79, 84], 0.05, { wave: "p25", dur: 0.06, vol: 0.1 }); },
    coin(A, o, t) { nT(A, o, t, [88, 95], 0.045, { wave: "p12", dur: 0.07, vol: 0.09 }); },
    buy(A, o, t) { nT(A, o, t, [76, 83, 88], 0.06, { wave: "p25", dur: 0.09, vol: 0.1 }); noise(A, o, t, { dur: 0.1, vol: 0.12, metal: true, rate: 2, type: "highpass", fq: 3000 }); },
    menu(A, o, t) { nT(A, o, t, [72, 79], 0.05, { wave: "tri", dur: 0.1, vol: 0.3 }); },
    weaponSwap(A, o, t) {
      noise(A, o, t, { dur: 0.06, vol: 0.2, metal: true, rate: 1.4, type: "highpass", fq: 2000 });
      tone(A, o, t + 0.03, { wave: "p25", f: 620, f2: 940, dur: 0.07, vol: 0.09 });
    },
    flaskStart(A, o, t) { tone(A, o, t, { wave: "tri", f: 330, f2: 440, dur: 0.18, vol: 0.28 }); noise(A, o, t, { dur: 0.15, vol: 0.1, type: "bandpass", fq: 1200, fq2: 2400, Q: 1.2, a: 0.04 }); },
    flaskHeal(A, o, t) { nT(A, o, t, [72, 76, 79, 84], 0.07, { wave: "tri", dur: 0.22, vol: 0.32 }); nT(A, o, t, [84, 88], 0.09, { wave: "p12", dur: 0.12, vol: 0.05 }); },
    flaskFill(A, o, t) { nT(A, o, t, [91, 96], 0.06, { wave: "p12", dur: 0.08, vol: 0.08 }); },
    enchant(A, o, t) {
      nT(A, o, t, [60, 67, 72, 76, 84], 0.09, { wave: "p25", dur: 0.2, vol: 0.12 });
      noise(A, o, t, { dur: 0.7, vol: 0.2, type: "bandpass", fq: 400, fq2: 4200, Q: 1.4, a: 0.2 });
      tone(A, o, t, { wave: "tri", f: 90, f2: 180, dur: 0.6, vol: 0.4 });
    },
    enchHit(A, o, t) { tone(A, o, t, { wave: "p12", f: 1700, f2: 900, dur: 0.06, vol: 0.07 }); noise(A, o, t, { dur: 0.06, vol: 0.16, type: "bandpass", fq: 3800, fq2: 2200, Q: 2 }); },
    teleport(A, o, t) {
      noise(A, o, t, { dur: 0.7, vol: 0.28, type: "bandpass", fq: 300, fq2: 6000, Q: 1.6, a: 0.25 });
      nT(A, o, t, [60, 67, 74, 81, 88], 0.07, { wave: "tri", dur: 0.3, vol: 0.28 });
      tone(A, o, t + 0.3, { wave: "p25", f: 1400, f2: 300, dur: 0.35, vol: 0.08 });
    },
    strike1(A, o, t) {
      noise(A, o, t, { dur: 0.09, vol: 0.3, type: "bandpass", fq: 2400, fq2: 6000, Q: 1.2, a: 0.004 });
      tone(A, o, t, { wave: "p12", f: 1400, f2: 500, dur: 0.06, vol: 0.09 });
    },
    strike2(A, o, t) {
      noise(A, o, t, { dur: 0.1, vol: 0.3, type: "bandpass", fq: 3200, fq2: 7600, Q: 1.4, a: 0.004 });
      tone(A, o, t, { wave: "p12", f: 1800, f2: 700, dur: 0.06, vol: 0.09 });
      tone(A, o, t + 0.025, { wave: "p25", f: 2400, f2: 1300, dur: 0.045, vol: 0.05 });
    },
    strike3(A, o, t) { // heavy finisher
      noise(A, o, t, { dur: 0.22, vol: 0.42, type: "lowpass", fq: 5200, fq2: 380, Q: 1.6, a: 0.006 });
      tone(A, o, t, { wave: "p25", f: 950, f2: 170, dur: 0.15, vol: 0.13 });
      tone(A, o, t + 0.012, { wave: "tri", f: 270, f2: 58, dur: 0.2, vol: 0.45 });
    },
    hit(A, o, t) {
      tone(A, o, t, { wave: "tri", f: 240, f2: 50, dur: 0.13, vol: 0.55 });
      noise(A, o, t, { dur: 0.08, vol: 0.34, type: "lowpass", fq: 3600, fq2: 700 });
      noise(A, o, t, { dur: 0.04, vol: 0.16, metal: true, rate: 1.7, type: "highpass", fq: 1500 });
    },
    enemyHurt(A, o, t) {
      tone(A, o, t, { wave: "p25", f: 780, f2: 330, dur: 0.1, vol: 0.1 });
      tone(A, o, t + 0.05, { wave: "p25", f: 640, f2: 260, dur: 0.09, vol: 0.07 });
    },
    enemyDeath(A, o, t) {
      for (let i = 0; i < 5; i++) tone(A, o, t + i * 0.045, { wave: "p50", f: 640 * Math.pow(0.78, i), f2: 300 * Math.pow(0.78, i), dur: 0.06, vol: 0.085 });
      noise(A, o, t, { dur: 0.45, vol: 0.3, type: "bandpass", fq: 2400, fq2: 170, Q: 0.9 });
      tone(A, o, t + 0.05, { wave: "tri", f: 180, f2: 40, dur: 0.32, vol: 0.38 });
    },
    playerHurt(A, o, t) {
      tone(A, o, t, { wave: "p50", f: 440, f2: 140, dur: 0.18, vol: 0.13 });
      tone(A, o, t, { wave: "p12", f: 455, f2: 147, dur: 0.18, vol: 0.08 });
      noise(A, o, t, { dur: 0.13, vol: 0.3, type: "lowpass", fq: 2300, fq2: 480 });
    },
    dodge(A, o, t) {
      noise(A, o, t, { dur: 0.22, vol: 0.4, type: "bandpass", fq: 480, fq2: 3300, Q: 2.4, a: 0.05 });
      tone(A, o, t, { wave: "tri", f: 300, f2: 640, dur: 0.12, vol: 0.12 });
    },
    radiant(A, o, t) { // Order radiant burst: rising shimmer
      [67, 71, 74, 79, 83, 86, 91].forEach((m, i) => tone(A, o, t + i * 0.035, { wave: i % 2 ? "p12" : "p25", f: mtof(m), dur: 0.38, vol: 0.075 }));
      tone(A, o, t, { wave: "tri", f: mtof(67), dur: 0.95, vol: 0.26, a: 0.03, vib: { rate: 7, depth: 25 } });
      tone(A, o, t + 0.25, { wave: "p12", f: mtof(91), dur: 0.85, vol: 0.045, a: 0.06, vib: { rate: 9, depth: 40 } });
      noise(A, o, t + 0.04, { dur: 0.9, vol: 0.07, type: "highpass", fq: 7000, a: 0.15 });
    },
    crimsonDash(A, o, t) { // Cult crimson dash: low whoosh
      noise(A, o, t, { dur: 0.42, vol: 0.55, type: "lowpass", fq: 240, fpath: [[0.13, 1400], [0.41, 170]], Q: 3, a: 0.04 });
      tone(A, o, t, { wave: "p50", f: 110, f2: 52, dur: 0.32, vol: 0.11 });
      tone(A, o, t, { wave: "tri", f: 84, f2: 38, dur: 0.38, vol: 0.42 });
    },
    // ---- v2.2 world sfx ----
    jump(A, o, t) { tone(A, o, t, { wave: "p25", f: 300, f2: 620, dur: 0.09, vol: 0.07 }); },
    jump2(A, o, t) { tone(A, o, t, { wave: "p12", f: 520, f2: 980, dur: 0.1, vol: 0.07 }); noise(A, o, t, { dur: 0.06, vol: 0.08, type: "highpass", fq: 2600 }); },
    spring(A, o, t) { tone(A, o, t, { wave: "tri", f: 200, f2: 900, dur: 0.16, vol: 0.3 }); tone(A, o, t + 0.04, { wave: "p25", f: 700, f2: 1500, dur: 0.1, vol: 0.06 }); },
    checkpoint(A, o, t) { nT(A, o, t, [60, 67, 72, 79], 0.09, { wave: "tri", dur: 0.5, vol: 0.2, vib: { rate: 5, depth: 12 } }); noise(A, o, t, { dur: 0.5, vol: 0.06, type: "bandpass", fq: 1800, fq2: 900, Q: 1 }); },
    lever(A, o, t) { tone(A, o, t, { wave: "tri", f: 140, f2: 70, dur: 0.12, vol: 0.4 }); noise(A, o, t + 0.02, { dur: 0.08, vol: 0.22, metal: true, rate: 1.4, type: "bandpass", fq: 1200, Q: 2 }); tone(A, o, t + 0.14, { wave: "p25", f: 330, dur: 0.08, vol: 0.08 }); },
    door(A, o, t) { noise(A, o, t, { dur: 0.7, vol: 0.28, type: "lowpass", fq: 700, fq2: 240 }); tone(A, o, t, { wave: "tri", f: 90, f2: 45, dur: 0.7, vol: 0.4 }); },
    locked(A, o, t) { tone(A, o, t, { wave: "p50", f: 150, dur: 0.07, vol: 0.12 }); tone(A, o, t + 0.09, { wave: "p50", f: 120, dur: 0.1, vol: 0.12 }); },
    crumble(A, o, t) { noise(A, o, t, { dur: 0.25, vol: 0.25, type: "bandpass", fq: 900, fq2: 400, Q: 1.2 }); tone(A, o, t, { wave: "tri", f: 110, f2: 80, dur: 0.2, vol: 0.2 }); },
    crumbleFall(A, o, t) { noise(A, o, t, { dur: 0.5, vol: 0.3, type: "lowpass", fq: 1800, fq2: 200 }); tone(A, o, t, { wave: "tri", f: 120, f2: 40, dur: 0.4, vol: 0.4 }); },
    faller(A, o, t) { tone(A, o, t, { wave: "p12", f: 900, f2: 400, dur: 0.08, vol: 0.06 }); noise(A, o, t, { dur: 0.1, vol: 0.12, type: "bandpass", fq: 2200, Q: 1.6 }); },
    fallerLand(A, o, t) { noise(A, o, t, { dur: 0.22, vol: 0.34, type: "lowpass", fq: 2600, fq2: 300 }); tone(A, o, t, { wave: "tri", f: 160, f2: 50, dur: 0.18, vol: 0.4 }); },
    hazard(A, o, t) { tone(A, o, t, { wave: "p50", f: 330, f2: 90, dur: 0.2, vol: 0.14 }); noise(A, o, t, { dur: 0.15, vol: 0.3, type: "bandpass", fq: 2800, fq2: 600, Q: 1.4 }); },
    seal(A, o, t) { nT(A, o, t, [67, 72, 76, 79, 84], 0.07, { wave: "p25", dur: 0.28, vol: 0.09 }); tone(A, o, t + 0.1, { wave: "tri", f: mtof(79), dur: 0.8, vol: 0.2, vib: { rate: 5, depth: 18 } }); },
    breakHit(A, o, t) { noise(A, o, t, { dur: 0.1, vol: 0.3, type: "bandpass", fq: 1500, fq2: 700, Q: 1.2 }); tone(A, o, t, { wave: "tri", f: 180, f2: 90, dur: 0.1, vol: 0.3 }); },
    breakWall(A, o, t) { noise(A, o, t, { dur: 0.6, vol: 0.4, type: "lowpass", fq: 3200, fq2: 220 }); tone(A, o, t, { wave: "tri", f: 140, f2: 36, dur: 0.5, vol: 0.5 }); nT(A, o, t + 0.2, [72, 76, 79], 0.06, { wave: "p12", dur: 0.2, vol: 0.06 }); },
    block(A, o, t) { tone(A, o, t, { wave: "p50", f: 220, f2: 330, dur: 0.07, vol: 0.14 }); tone(A, o, t + 0.07, { wave: "p25", f: 660, f2: 880, dur: 0.12, vol: 0.09 }); },
    bell(A, o, t) { tone(A, o, t, { wave: "tri", f: mtof(55), dur: 1.4, vol: 0.28 }); tone(A, o, t, { wave: "p12", f: mtof(67.2), dur: 0.9, vol: 0.07 }); noise(A, o, t, { dur: 0.05, vol: 0.2, metal: true, rate: 1.3, type: "highpass", fq: 1800 }); },
    fire(A, o, t) { noise(A, o, t, { dur: 0.25, vol: 0.3, type: "bandpass", fq: 400, fq2: 2600, Q: 1.1, a: 0.01 }); tone(A, o, t, { wave: "p25", f: 300, f2: 720, dur: 0.14, vol: 0.09 }); },
    guard(A, o, t) { tone(A, o, t, { wave: "p25", f: 880, f2: 1320, dur: 0.18, vol: 0.12 }); tone(A, o, t + 0.05, { wave: "tri", f: 440, dur: 0.3, vol: 0.2 }); },
    power(A, o, t) { nT(A, o, t, [64, 68, 71, 76, 80, 83], 0.045, { wave: "p12", dur: 0.16, vol: 0.075 }); tone(A, o, t + 0.1, { wave: "tri", f: mtof(88), dur: 0.5, vol: 0.14 }); },
    powerEnd(A, o, t) { nT(A, o, t, [79, 74, 69, 62], 0.07, { wave: "p25", dur: 0.18, vol: 0.08 }); },
    charmGet(A, o, t) { nT(A, o, t, [60, 64, 67, 72, 76, 79, 84], 0.065, { wave: "p25", dur: 0.3, vol: 0.085 }); tone(A, o, t + 0.2, { wave: "tri", f: mtof(84), dur: 1.0, vol: 0.2, vib: { rate: 6, depth: 20 } }); },
    charmEquip(A, o, t) { tone(A, o, t, { wave: "p50", f: 440, dur: 0.05, vol: 0.1 }); tone(A, o, t + 0.05, { wave: "p25", f: 880, f2: 1320, dur: 0.14, vol: 0.1 }); },
    charmOff(A, o, t) { tone(A, o, t, { wave: "p50", f: 660, f2: 330, dur: 0.12, vol: 0.1 }); },
    heal(A, o, t) {
      nT(A, o, t, [72, 76, 79, 84, 88], 0.05, { wave: "p12", dur: 0.18, vol: 0.075 });
      tone(A, o, t + 0.06, { wave: "tri", f: mtof(84), dur: 0.55, vol: 0.2, vib: { rate: 6, depth: 20 } });
    },
    fragment(A, o, t) { // big rewarding claim fanfare
      noise(A, o, t, { dur: 1.8, vol: 0.12, metal: true, rate: 0.7, type: "bandpass", fq: 900, fq2: 400, Q: 1.2 });
      nT(A, o, t, [60, 64, 67, 72, 76, 79], 0.055, { wave: "p25", dur: 0.22, vol: 0.085 });
      [[65, 69, 72], [67, 71, 74]].forEach((ch, i) => ch.forEach((m) => tone(A, o, t + 0.36 + i * 0.26, { wave: "p50", f: mtof(m + 12), dur: 0.24, vol: 0.05 })));
      const tc = t + 0.9;
      tone(A, o, tc, { wave: "p50", f: mtof(84), dur: 1.9, vol: 0.09, hold: 0.5, vib: { rate: 5.5, depth: 18 } });
      tone(A, o, tc, { wave: "p25", f: mtof(79), dur: 1.8, vol: 0.06, hold: 0.5 });
      tone(A, o, tc, { wave: "p12", f: mtof(76), dur: 1.7, vol: 0.06, hold: 0.4 });
      tone(A, o, tc, { wave: "tri", f: mtof(48), dur: 1.9, vol: 0.4, hold: 0.5 });
      tone(A, o, t + 0.36, { wave: "tri", f: mtof(53), dur: 0.26, vol: 0.35 });
      tone(A, o, t + 0.62, { wave: "tri", f: mtof(55), dur: 0.26, vol: 0.35 });
      nT(A, o, tc + 0.1, [96, 91, 88, 84, 91, 96], 0.07, { wave: "p12", dur: 0.25, vol: 0.035 });
      noise(A, o, tc, { dur: 1.6, vol: 0.08, type: "highpass", fq: 6500, a: 0.2 });
      drum(A, o, "g", tc, 0.7);
    },
    menuMove(A, o, t) { tone(A, o, t, { wave: "p50", f: 880, dur: 0.035, vol: 0.06 }); },
    menuSelect(A, o, t) {
      tone(A, o, t, { wave: "p25", f: 660, dur: 0.05, vol: 0.08 });
      tone(A, o, t + 0.055, { wave: "p25", f: 990, dur: 0.09, vol: 0.08 });
    },
    blip(A, o, t) { tone(A, o, t, { wave: "p50", f: [523, 587, 659, 784][(Math.random() * 4) | 0], dur: 0.035, vol: 0.055 }); },
    dialogue(A, o, t) {
      for (let i = 0; i < 4; i++) tone(A, o, t + i * 0.06, { wave: "p50", f: [523, 587, 659, 784, 880][(Math.random() * 5) | 0], dur: 0.035, vol: 0.05 });
    },
    gate(A, o, t) {
      noise(A, o, t, { dur: 0.12, vol: 0.3, metal: true, rate: 1.1, type: "highpass", fq: 900 });
      noise(A, o, t, { dur: 1.5, vol: 0.5, type: "lowpass", fq: 140, fq2: 320, Q: 2, a: 0.2, hold: 0.6 });
      tone(A, o, t, { wave: "tri", f: 55, f2: 41, dur: 1.5, vol: 0.4, hold: 0.6 });
      nT(A, o, t + 0.3, [52, 59, 64, 71, 76], 0.18, { wave: "p12", dur: 0.4, vol: 0.06 });
      drum(A, o, "z", t + 1.3, 0.8);
    },
    telegraph(A, o, t) { // boss wind-up warning
      [0, 0.15].forEach((d) => {
        tone(A, o, t + d, { wave: "p50", f: 440, f2: 900, dur: 0.13, vol: 0.11 });
        tone(A, o, t + d, { wave: "p12", f: 447, f2: 912, dur: 0.13, vol: 0.06 });
      });
      noise(A, o, t, { dur: 0.35, vol: 0.12, type: "highpass", fq: 3000, fq2: 8000, a: 0.25 });
    },
    bossPhase(A, o, t) { // phase-2 roar
      noise(A, o, t, { dur: 1.1, vol: 0.5, type: "lowpass", fq: 300, fpath: [[0.35, 1600], [1.05, 180]], Q: 2.5, a: 0.08 });
      tone(A, o, t, { wave: "p50", f: 72, f2: 46, dur: 1.0, vol: 0.13, vib: { rate: 11, depth: 60 } });
      tone(A, o, t, { wave: "tri", f: 58, f2: 44, dur: 1.1, vol: 0.4 });
    },
    bossDefeat(A, o, t) {
      [0, 0.24, 0.52, 0.88].forEach((d, i) => {
        noise(A, o, t + d, { dur: 0.75, vol: 0.55 - i * 0.06, type: "lowpass", fq: 3200, fq2: 110 });
        tone(A, o, t + d, { wave: "tri", f: 130 - i * 12, f2: 30, dur: 0.6, vol: 0.55 });
      });
      noise(A, o, t + 0.2, { dur: 2.8, vol: 0.32, type: "lowpass", fq: 1300, fq2: 60, a: 0.1 });
      nT(A, o, t, [84, 79, 74, 69, 64, 59, 54, 49], 0.075, { wave: "p50", dur: 0.12, vol: 0.075 });
      drum(A, o, "g", t + 0.9, 0.9);
    },
    playerDeath(A, o, t) {
      [76, 74, 71, 69, 67, 64].forEach((m, i) => tone(A, o, t + i * 0.16, { wave: "p50", f: mtof(m), f2: mtof(m - 1), dur: 0.2, vol: 0.1 }));
      tone(A, o, t, { wave: "tri", f: mtof(52), f2: mtof(40), dur: 1.3, vol: 0.32, slide: 1.2 });
      noise(A, o, t, { dur: 1.2, vol: 0.18, type: "lowpass", fq: 900, fq2: 100, a: 0.2 });
      tone(A, o, t + 0.98, { wave: "p25", f: mtof(52), dur: 1.0, vol: 0.08, a: 0.02, vib: { rate: 4, depth: 30 } });
    }
  };
  // loudness trims (dB-matched against the music bus in the offline renders)
  const SFX_GAIN = { bowShot: 2.4, coin: 2, buy: 2, menu: 2.6, flaskHeal: 1.6, flaskStart: 1.6, teleport: 1.4, enchant: 1.3, strike1: 2.6, strike2: 2.8, strike3: 1.2, hit: 1.3, enemyHurt: 2.8, enemyDeath: 1.1, playerHurt: 2, dodge: 2,
    radiant: 1.4, crimsonDash: 1.4, heal: 1.8, menuMove: 4, menuSelect: 2.6, blip: 4, dialogue: 3, telegraph: 1.6, playerDeath: 1.5 };
  function fireSfx(A, out, key, t) {
    const k = SFX_GAIN[key] || 1;
    let dest = out;
    if (k !== 1) { dest = A.createGain(); dest.gain.value = k; dest.connect(out); }
    SFX[key](A, dest, t);
  }
  const SFX_LEN = { fragment: 3.2, bossDefeat: 3.6, playerDeath: 2.3, gate: 2.0, radiant: 1.4, bossPhase: 1.4 };
  const SFX_ALIAS = { hurt: "playerHurt", death: "playerDeath", pickup: "heal", claim: "fragment", fragmentClaim: "fragment",
    gateOpen: "gate", warning: "telegraph", bossWarning: "telegraph", whoosh: "dodge", dash: "crimsonDash", shimmer: "radiant", select: "menuSelect", move: "menuMove" };

  // ======================================================================
  // Synth — public façade used by the engine
  // ======================================================================
  function makeChain(A, vol, muted) {
    const master = A.createGain(), comp = A.createDynamicsCompressor(), music = A.createGain(), duck = A.createGain(), sfx = A.createGain();
    comp.threshold.value = -14; comp.knee.value = 8; comp.ratio.value = 3; comp.attack.value = 0.004; comp.release.value = 0.2;
    duck.connect(music); music.connect(master); sfx.connect(master); master.connect(comp); comp.connect(A.destination);
    master.gain.value = muted ? 0 : vol.master; music.gain.value = vol.music; sfx.gain.value = vol.sfx;
    return { master, comp, music, duck, sfx };
  }
  const engineDebug = () => window.SHARDS && window.SHARDS.debug;

  class Synth {
    constructor() {
      this.ctx = null; this.master = null; this.musicGain = null; this.sfxGain = null; this.duckGain = null;
      this.volume = { master: 0.7, music: 0.45, sfx: 0.7 };
      this.muted = false; this.enabled = true;
      this.current = null; this.player = null; this.fading = [];
      this.pending = null; this.timer = null; this.bossPhase = 1;
      this.trackLog = []; this.lastPath = null;
      this._strike = { ix: 0, at: 0 }; this._explicit = {}; this._ducked = false; this._pollAt = 0;
      Synth.instance = this; window.SHARDS.audio = this;
      this._installUnlock();
    }

    // ---- context + volume ----
    ensure() {
      if (this.ctx || !AudioCtx) return;
      this.ctx = new AudioCtx();
      const c = makeChain(this.ctx, this.volume, this.muted);
      this.master = c.master; this.musicGain = c.music; this.sfxGain = c.sfx; this.duckGain = c.duck;
      bank(this.ctx);
      log("AudioContext created (" + this.ctx.sampleRate + " Hz)");
    }
    applyVolume() {
      if (!this.master) return;
      const t = this.ctx.currentTime;
      this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume.master, t, 0.015);
      this.musicGain.gain.setTargetAtTime(this.volume.music, t, 0.015);
      this.sfxGain.gain.setTargetAtTime(this.volume.sfx, t, 0.015);
    }
    setVolume(kind, v) {
      if (!(kind in this.volume)) return;
      this.volume[kind] = Math.round(Math.max(0, Math.min(1, v)) * 100) / 100;
      this.applyVolume();
    }
    _installUnlock() {
      const evs = ["pointerdown", "mousedown", "keydown", "touchend"];
      const h = () => { this.resume(); if (this._live()) evs.forEach((e) => window.removeEventListener(e, h, true)); };
      evs.forEach((e) => window.addEventListener(e, h, true));
      document.addEventListener("visibilitychange", () => this._kick());
    }
    // Only creates/resumes the context once the page has had a user gesture.
    resume() {
      if (!AudioCtx) return;
      const ua = navigator.userActivation;
      if (!this.ctx && ua && !ua.hasBeenActive) return;
      this.ensure();
      if (this.ctx.state !== "running") {
        const p = this.ctx.resume();
        if (p && p.then) p.then(() => this._onRunning(), () => {});
      } else this._onRunning();
    }
    _live() { return !!this.ctx && this.ctx.state === "running"; }
    _onRunning() {
      if (!this._live()) return;
      if (this.pending) { const k = this.pending; this.pending = null; this._start(k); }
      this._kick();
    }

    // ---- engine state helpers (read-only use of the public debug API) ----
    _scene() { try { return engineDebug().scene(); } catch (_) { return null; } }
    _path() {
      try { const p = engineDebug().save().path; if (p) return p; } catch (_) {}
      return this.lastPath || "order";
    }
    _zone() {
      try {
        const id = String(engineDebug().pos().levelId || "").replace(/_traverse$/, "");
        return ZONE_KEYS.includes(id) ? id : null;
      } catch (_) { return null; }
    }
    _resolve(track, opt) {
      let t = String(track == null ? "" : track);
      if (t.indexOf("zone:") === 0) t = t.slice(5);
      if (t === "order") t = "orderHub";
      if (t === "cult") t = "cultHub";
      if (t === "zone" || t === "traverse") t = (opt && ZONE_KEYS.includes(opt)) ? opt : (this._zone() || "vespera");
      if (t === "ending") t = ((opt === "order" || opt === "cult") ? opt : this._path()) === "cult" ? "endingCult" : "endingOrder";
      if (t === "boss2" || t === "arena") t = "boss";
      return SONGS[t] ? t : (this._zone() || "vespera");
    }

    // ---- music ----
    play(track, opt) {
      if (!this.enabled) return;
      const key = this._resolve(track, opt);
      if (track === "boss2") this.bossPhase = 2;
      else if (key === "boss" && this.current !== "boss") this.bossPhase = 1;
      if (!this._live()) {
        if (this.pending !== key) log(`music queued: ${key} (waiting for first user gesture)`);
        this.pending = key;
        this.resume();
        return;
      }
      this._start(key);
    }
    _start(key, xf) {
      this.pending = null;
      this._unduck();
      if (this.player && this.current === key) return;
      const A = this.ctx, song = SONGS[key], prev = this.current, now = A.currentTime;
      const fade = xf != null ? xf : key === "boss" ? 0.6 : /^ending/.test(key) ? 2.5 : 1.5;
      if (this.player) { this.player.fadeOut(now, fade); this.fading.push(this.player); }
      // Cap concurrent fades (rapid scene hops in debug/smoke). Hard-stop the oldest.
      while (this.fading.length > 2) { const old = this.fading.shift(); old.dispose(); }
      if (key === "boss" && ZONE_KEYS.includes(prev) && !this._explicit.gate) this._fire("gate");
      const p = new SongPlayer(A, this.duckGain, song, now + 0.05);
      p.fadeIn(now, prev || this.fading.length ? fade : 1.2);
      if (key === "boss") { p.setPhaseNow(this.bossPhase === 2 ? 2 : 1); }
      if (key === "orderHub") this.lastPath = "order";
      if (key === "cultHub") this.lastPath = "cult";
      this.player = p; this.current = key;
      this.trackLog.push({ track: key, title: song.title, ms: Math.round(performance.now()) });
      log(`music: ${prev || "(silence)"} -> ${key} | "${song.title}" — ${song.mode}, ${song.bpm} BPM${song.phase2 ? " (phase 2: " + song.phase2.bpm + ")" : ""}, loop ${song.seconds.toFixed(1)}s, crossfade ${fade}s`);
      this._kick();
    }
    stopMusic(fade) {
      this.pending = null;
      if (this.player && this.ctx) { this.player.fadeOut(this.ctx.currentTime, fade == null ? 0.8 : fade); this.fading.push(this.player); log(`music: ${this.current} -> (silence)`); }
      this.player = null; this.current = null;
    }
    setBossPhase(n, _fromPoll) {
      // Explicit calls win for a moment; afterwards the poll keeps music in sync with the
      // engine's boss.phase (so a retry after death drops back to phase 1 automatically).
      if (!_fromPoll) this._manualPhaseUntil = performance.now() + 3000;
      n = n >= 2 ? 2 : 1;
      const changed = this.bossPhase !== n;
      this.bossPhase = n;
      const p = this.player;
      if (p && p.song.phase2 && p.targetPhase !== n) {
        p.queuePhase(n);
        if (n === 2) this._fire("bossPhase");
        log(`boss phase -> ${n} (${n === 2 ? p.song.phase2.bpm : p.song.bpm} BPM)`);
      } else if (changed) log(`boss phase set to ${n}`);
    }
    forScene(scene, path, zoneId) {
      if (scene === "title" || scene === "path") return this.play("title");
      if (scene === "hub" || scene === "travel") return this.play(path === "cult" ? "cultHub" : "orderHub");
      if (scene === "traverse" || scene === "zone") return this.play("zone", zoneId);
      if (scene === "arena") return this.play("boss");
      if (scene === "ending") return this.play("ending", path);
      return this.play("zone", zoneId);
    }
    _duck() {
      if (!this.duckGain || this._ducked) return;
      this._ducked = true;
      const g = this.duckGain.gain, t = this.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0.25, t + 0.8);
    }
    _unduck() {
      if (!this.duckGain || !this._ducked) return;
      this._ducked = false;
      const g = this.duckGain.gain, t = this.ctx.currentTime;
      g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(1, t + 0.5);
    }

    // Lookahead scheduler: wakes ~25x/s, schedules notes on the audio clock.
    _kick() {
      if (this.timer || !this.ctx) return;
      this._tick();
    }
    _tick() {
      this.timer = null;
      const A = this.ctx;
      if (!A) return;
      const now = A.currentTime, hidden = document.hidden, ahead = hidden ? 1.6 : 0.2;
      if (now >= this._pollAt) { this._pollAt = now + 0.15; this._poll(); }
      if (this.player) this.player.pump(now + ahead);
      this.fading = this.fading.filter((p) => {
        p.pump(now + ahead);
        if (now > p.stopAt + 1.2) { p.dispose(); return false; }
        return true;
      });
      if (this.player || this.fading.length) this.timer = setTimeout(() => this._tick(), hidden ? 500 : 40);
    }
    // Follow engine state that has no explicit audio hook yet (boss phase, zone).
    _poll() {
      const dbg = engineDebug();
      if (!dbg || !this.current) return;
      try {
        if (this.current === "boss") {
          const b = dbg.boss();
          if (b && this._lastBossHp != null && b.hp > this._lastBossHp) this._manualPhaseUntil = 0; // new fight (retry)
          this._lastBossHp = b ? b.hp : null;
          const manual = performance.now() < (this._manualPhaseUntil || 0);
          if (b && !b.dead && !manual && b.phase !== this.bossPhase) this.setBossPhase(b.phase, true);
        } else if (ZONE_KEYS.includes(this.current) && dbg.scene() === "traverse") {
          const z = this._zone();
          if (z && z !== this.current) this._start(z);
        }
      } catch (_) {}
    }

    // ---- sfx ----
    _fire(key, delay) {
      if (!this.ctx || !SFX[key]) return;
      fireSfx(this.ctx, this.sfxGain, key, this.ctx.currentTime + 0.005 + (delay || 0));
    }
    sfx(name, opt) {
      if (!this.enabled) return;
      if (!this.ctx) { this.resume(); if (!this.ctx) return; }
      if (this.ctx.state !== "running") this.resume();
      let key = SFX_ALIAS[name] || name;
      if (SFX[key] && name !== "strike" && name !== "skill" && name !== "menu") this._explicit[key] = true;
      if (key === "strike") {
        const now = performance.now(), s = this._strike;
        let n = +opt || 0;
        if (!n) n = (now - s.at < 680 && s.ix < 3) ? s.ix + 1 : 1;
        s.ix = n; s.at = now; key = "strike" + n;
      } else if (key === "skill") {
        key = (opt === "cult" || opt === "order" ? opt : this._path()) === "cult" ? "crimsonDash" : "radiant";
      } else if (key === "menu") {
        this._unduck();
        key = this._scene() === "hub" && !this._explicit.dialogue && !this._explicit.blip ? "dialogue" : "menuSelect";
      } else if (key === "hit") {
        this._fire("hit");
        if (this._scene() === "traverse" && !this._explicit.enemyHurt) this._fire("enemyHurt", 0.02);
        return;
      } else if (key === "fragment") {
        if (this.current === "boss") {
          this.stopMusic(0.5);
          this.bossPhase = 1;
          if (!this._explicit.bossDefeat) { this._fire("bossDefeat"); this._fire("fragment", 1.0); return; }
        }
      } else if (key === "playerDeath") {
        this._duck();
      } else if (key === "bossDefeat" && this.current === "boss") {
        this.stopMusic(0.5);
      }
      if (!SFX[key]) key = "menuSelect";
      this._fire(key);
    }

    // ---- legacy helpers (kept for compatibility) ----
    beep(freq, dur, type, gain, when) {
      if (!this.ctx) return;
      tone(this.ctx, this.sfxGain, when || this.ctx.currentTime, { wave: type === "triangle" ? "tri" : "p50", f: freq, dur: dur, vol: gain || 0.15 });
    }
    noise(dur, gain) {
      if (!this.ctx) return;
      noise(this.ctx, this.sfxGain, this.ctx.currentTime, { dur: dur, vol: gain || 0.1 });
    }
  }

  // ---- offline rendering (previews / tests) ----
  Synth.tracks = () => Object.keys(SONGS).map((k) => {
    const s = SONGS[k];
    return { key: k, title: s.title, mode: s.mode, bpm: s.bpm, phase2Bpm: s.phase2 ? s.phase2.bpm : null, seconds: +s.seconds.toFixed(2), zone: !!s.zone };
  });
  Synth.sfxNames = () => Object.keys(SFX);
  Synth._defs = SONG_DEFS; // internal: used by tools/tests to validate pattern lengths
  Synth.renderTrack = function (key, opts) {
    opts = opts || {};
    const song = SONGS[key];
    if (!song) return Promise.reject(new Error("unknown track " + key));
    const sr = opts.sampleRate || 44100, phase = opts.phase === 2 ? 2 : 1;
    const play = opts.seconds || song.loopSeconds(phase), tail = opts.tail == null ? 1.5 : opts.tail;
    const A = new OfflineCtx(1, Math.ceil((play + tail) * sr), sr);
    const c = makeChain(A, { master: opts.master == null ? 1 : opts.master, music: opts.music == null ? 0.45 : opts.music, sfx: 0.7 });
    const p = new SongPlayer(A, c.duck, song, 0);
    if (phase === 2) p.setPhaseNow(2);
    p.out.gain.value = song.gain || 1;
    p.pump(play);
    return A.startRendering();
  };
  Synth.renderSfx = function (name, opts) {
    opts = opts || {};
    const key = SFX_ALIAS[name] || name;
    if (!SFX[key]) return Promise.reject(new Error("unknown sfx " + name));
    const sr = opts.sampleRate || 44100, len = SFX_LEN[key] || 1.0;
    const A = new OfflineCtx(1, Math.ceil((len + 0.2) * sr), sr);
    const c = makeChain(A, { master: opts.master == null ? 1 : opts.master, music: 0.45, sfx: opts.sfx == null ? 0.7 : opts.sfx });
    fireSfx(A, c.sfx, key, 0.01);
    return A.startRendering();
  };

  window.SHARDS.Synth = Synth;
})();
