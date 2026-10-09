// Keyboard + gamepad + touch. Touch chrome only when a touch device is detected.
(function () {
  "use strict";

  // Rumble presets: [strongMagnitude, weakMagnitude, ms] steps played back to back.
  // prio: a lower-priority pulse never interrupts a stronger one still playing.
  const RUMBLE = {
    hit:   { prio: 1, steps: [[0.0, 0.35, 45]] },                       // light tick: your strike lands
    dodge: { prio: 1, steps: [[0.1, 0.3, 50]] },                        // small pulse
    claim: { prio: 1, queue: true, steps: [[0.25, 0.45, 90]] },         // small pulse, waits for a boss rumble
    hurt:  { prio: 2, steps: [[0.65, 0.5, 170]] },                      // stronger: you take damage
    phase: { prio: 3, steps: [[1.0, 0.8, 110], [0.8, 0.6, 110], [0.6, 0.45, 110], [0.4, 0.3, 110], [0.22, 0.16, 110], [0.1, 0.08, 110]] },
    bossDeath: { prio: 3, steps: [[1.0, 1.0, 130], [0.9, 0.8, 130], [0.75, 0.65, 130], [0.6, 0.5, 130], [0.45, 0.38, 130], [0.32, 0.26, 130], [0.2, 0.16, 130], [0.1, 0.08, 130]] },
  };

  class Input {
    constructor(canvas) {
      this.canvas = canvas;
      this.keys = Object.create(null);
      this.just = Object.create(null);
      this.padJust = Object.create(null);
      this.touch = Object.create(null);
      this.touchJust = Object.create(null);
      this.isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
      this.lastDevice = this.isTouch ? "touch" : "kb";
      this.padConnected = false;
      this.padIndex = null;
      this._padEvents = false;
      this.onDevice = null;
      this.rumbleLog = [];
      this._rumbleTimers = []; this._rumbleUntil = 0; this._rumblePrio = 0; this._rumbleQueued = 0;
      this.bindings = {
        left: ["ArrowLeft", "a"],
        right: ["ArrowRight", "d"],
        jump: [" ", "ArrowUp", "w", "z"],
        strike: ["x", "j"],
        dodge: ["c", "k", "Shift"],
        skill: ["v", "l"],
        confirm: ["Enter"],
        cancel: ["Escape"],
        up: ["ArrowUp", "w"],
        down: ["ArrowDown", "s"],
      };
      // gamepad buttons (standard mapping)
      this.padMap = {
        strike: 0, jump: 1, dodge: 2, skill: 3,
        confirm: 0, cancel: 9,
        back: 1, // B backs out of menus (only menu scenes read "back"; in play B is jump)
        // axes and D-pad handled separately
      };
      this._bind();
    }

    _norm(e) {
      if (e.key === " ") return " ";
      if (e.key.length === 1) return e.key.toLowerCase();
      return e.key;
    }

    _bind() {
      window.addEventListener("keydown", (e) => {
        if (this.lastDevice !== "kb" && this.onDevice) { this.lastDevice = "kb"; this.onDevice("kb"); }
        this.lastDevice = "kb";
        const k = this._norm(e);
        if (!this.keys[k]) this.just[k] = true;
        this.keys[k] = true;
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Escape","Enter"].includes(e.key)) e.preventDefault();
      });
      window.addEventListener("keyup", (e) => { this.keys[this._norm(e)] = false; });
      window.addEventListener("gamepadconnected", (e) => { this._padEvents = true; this._onPadConnected(e); });
      window.addEventListener("gamepaddisconnected", (e) => this._onPadDisconnected(e));
    }

    clearJust() {
      for (const k in this.just) delete this.just[k];
      for (const k in this.padJust) delete this.padJust[k];
      for (const k in this.touchJust) delete this.touchJust[k];
    }

    heldKey(name) {
      const list = this.bindings[name] || [];
      return list.some((k) => !!this.keys[k]);
    }
    pressedKey(name) {
      const list = this.bindings[name] || [];
      return list.some((k) => !!this.just[k]);
    }

    // ---------- gamepad (v7) ----------
    // Standard mapping: 0 A, 1 B, 2 X, 3 Y, 4 LB, 5 RB, 6 LT, 7 RT, 8 View, 9 Start,
    // 10 LS, 11 RS, 12-15 D-pad. A pad that was connected before the page loaded is
    // only exposed after its first button press, so every frame we look again.
    _padList() {
      let pads = [];
      try { pads = navigator.getGamepads ? Array.from(navigator.getGamepads() || []) : []; } catch (_) { pads = []; }
      return pads.filter((p) => p && p.connected !== false);
    }
    _onPadConnected(e) {
      const gp = e && e.gamepad;
      this.padConnected = true;
      if (gp && gp.index != null) this.padIndex = gp.index;
      this.lastDevice = "gamepad";
      if (this.onDevice) this.onDevice("gamepad");
    }
    _onPadDisconnected(e) {
      const gp = e && e.gamepad;
      if (!gp || gp.index === this.padIndex) { this.padIndex = null; this._releasePad(); }
      const left = this._padList().filter((p) => !gp || p.index !== gp.index);
      this.padConnected = left.length > 0;
      if (!this.padConnected && this.lastDevice === "gamepad") {
        this.lastDevice = this.isTouch ? "touch" : "kb";
        if (this.onDevice) this.onDevice(this.lastDevice);
      }
    }
    _releasePad() {
      for (const k of Object.keys(this.keys)) if (k.startsWith("__pad")) this.keys[k] = false;
    }
    activePad() {
      const list = this._padList();
      if (!list.length) return null;
      return list.find((p) => p.index === this.padIndex) || list[0];
    }

    pollGamepad() {
      const list = this._padList();
      if (list.length && !this.padConnected) this.padConnected = true;
      if (!list.length) {
        if (this.padConnected) this._onPadDisconnected(null); // unplugged without an event
        return;
      }
      const isDown = (gp, i) => { const b = gp.buttons && gp.buttons[i]; return !!(b && (b.pressed || b.value > 0.5)); };
      // follow whichever pad was touched last (two pads plugged in: the one in your hands)
      for (const p of list) {
        if (p.index === this.padIndex) continue;
        if ((p.buttons || []).some((b, i) => isDown(p, i)) || (p.axes || []).slice(0, 2).some((a) => Math.abs(a) > 0.5)) {
          this.padIndex = p.index; this._releasePad(); break;
        }
      }
      const gp = list.find((p) => p.index === this.padIndex) || list[0];
      this.padIndex = gp.index;
      const ax = (gp.axes && gp.axes[0]) || 0, ay = (gp.axes && gp.axes[1]) || 0;
      const dirs = {
        left: ax < -0.5 || isDown(gp, 14), right: ax > 0.5 || isDown(gp, 15),
        up: ay < -0.5 || isDown(gp, 12), down: ay > 0.5 || isDown(gp, 13),
      };
      let fresh = false;
      for (const [d, on] of Object.entries(dirs)) {
        const flag = "__pad" + d[0].toUpperCase();
        if (on && !this.keys[flag]) { this.padJust[d] = true; fresh = true; }
        this.keys[flag] = on;
      }
      for (const [action, btn] of Object.entries(this.padMap)) {
        const on = isDown(gp, btn);
        const flag = "__pad_" + action;
        if (on && !this.keys[flag]) { this.padJust[action] = true; fresh = true; }
        this.keys[flag] = on;
      }
      // any other newly pressed button (bumpers, triggers, View) also claims the device
      const raw = (gp.buttons || []).map((b, i) => isDown(gp, i));
      if (this._padRaw) raw.forEach((on, i) => { if (on && !this._padRaw[i]) fresh = true; });
      this._padRaw = raw;
      if (fresh && this.lastDevice !== "gamepad") {
        this.lastDevice = "gamepad";
        if (this.onDevice) this.onDevice("gamepad");
      }
    }

    // ---------- rumble (v7) ----------
    // dual-rumble via vibrationActuator.playEffect where supported, else the older
    // hapticActuators[0].pulse(), else nothing. Never throws. The engine decides
    // whether to call (Vibration setting on, last input from the gamepad).
    _actuate(strong, weak, ms) {
      const gp = this.activePad();
      if (!gp) return false;
      try {
        const va = gp.vibrationActuator;
        const ok = va && typeof va.playEffect === "function" &&
          (!Array.isArray(va.effects) || va.effects.includes("dual-rumble")) &&
          (!va.type || va.type === "dual-rumble" || Array.isArray(va.effects));
        if (ok) {
          const pr = va.playEffect("dual-rumble", { startDelay: 0, duration: ms, strongMagnitude: strong, weakMagnitude: weak });
          if (pr && typeof pr.catch === "function") pr.catch(() => {});
          return true;
        }
        const ha = gp.hapticActuators && gp.hapticActuators[0];
        if (ha && typeof ha.pulse === "function") {
          const pr = ha.pulse(Math.max(strong, weak), ms);
          if (pr && typeof pr.catch === "function") pr.catch(() => {});
          return true;
        }
      } catch (_) { /* unsupported pad: no-op */ }
      return false;
    }
    rumble(kind) {
      const fx = RUMBLE[kind];
      if (!fx) return false;
      const now = performance.now();
      // a heavy rumble is not cut short by a light tick; a queued pulse (claim) waits for it
      if (now < this._rumbleUntil && fx.prio < this._rumblePrio) {
        if (fx.queue) {
          clearTimeout(this._rumbleQueued);
          this._rumbleQueued = setTimeout(() => this.rumble(kind), this._rumbleUntil - now + 60);
        }
        return false;
      }
      for (const t of this._rumbleTimers) clearTimeout(t);
      this._rumbleTimers = [];
      let at = 0;
      fx.steps.forEach(([strong, weak, ms], i) => {
        const fire = () => this._actuate(strong, weak, ms + (i < fx.steps.length - 1 ? 20 : 0));
        if (at === 0) fire(); else this._rumbleTimers.push(setTimeout(fire, at));
        at += ms;
      });
      this._rumbleUntil = now + at;
      this._rumblePrio = fx.prio;
      this.rumbleLog.push(kind);
      if (this.rumbleLog.length > 32) this.rumbleLog.shift();
      return true;
    }

    held(name) {
      if (this.heldKey(name)) return true;
      if (name === "left" && this.keys.__padL) return true;
      if (name === "right" && this.keys.__padR) return true;
      if (name === "up" && this.keys.__padU) return true;
      if (name === "down" && this.keys.__padD) return true;
      if (this.keys["__pad_" + name]) return true;
      if (this.touch[name]) return true;
      return false;
    }
    pressed(name) {
      if (this.pressedKey(name)) return true;
      if (this.padJust[name]) return true;
      if (this.touchJust[name]) return true;
      return false;
    }

    // One-frame press from a tapped menu row / dialogue box (no held state).
    tap(name) {
      this.lastDevice = "touch";
      this.touchJust[name] = true;
    }
    // Touch UI — call from engine draw with atlas; hit-test setTouch
    setTouch(name, down) {
      if (down) this.lastDevice = "touch";
      if (down && !this.touch[name]) this.touchJust[name] = true;
      this.touch[name] = down;
    }
  }

  window.SHARDS.Input = Input;
})();
