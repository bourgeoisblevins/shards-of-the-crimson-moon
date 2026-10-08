// Keyboard + gamepad + touch. Touch chrome only when a touch device is detected.
(function () {
  "use strict";

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
        // axes handled separately
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
        this.lastDevice = "kb";
        const k = this._norm(e);
        if (!this.keys[k]) this.just[k] = true;
        this.keys[k] = true;
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Escape","Enter"].includes(e.key)) e.preventDefault();
      });
      window.addEventListener("keyup", (e) => { this.keys[this._norm(e)] = false; });
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

    pollGamepad() {
      const pads = navigator.getGamepads ? navigator.getGamepads() : [];
      const gp = pads && pads[0];
      if (!gp) return;
      // any button/axis activity marks gamepad as last device
      const active = (gp.axes || []).some(a => Math.abs(a) > 0.4) || (gp.buttons || []).some(b => b && b.pressed);
      if (active) this.lastDevice = "gamepad";
      const ax = gp.axes[0] || 0;
      if (ax < -0.4) { if (!this.keys.__padL) this.padJust.left = true; this.keys.__padL = true; }
      else this.keys.__padL = false;
      if (ax > 0.4) { if (!this.keys.__padR) this.padJust.right = true; this.keys.__padR = true; }
      else this.keys.__padR = false;
      const ay = gp.axes[1] || 0;
      if (ay < -0.4) { if (!this.keys.__padU) this.padJust.up = true; this.keys.__padU = true; }
      else this.keys.__padU = false;
      if (ay > 0.4) { if (!this.keys.__padD) this.padJust.down = true; this.keys.__padD = true; }
      else this.keys.__padD = false;
      for (const [action, btn] of Object.entries(this.padMap)) {
        const pressed = gp.buttons[btn] && gp.buttons[btn].pressed;
        const flag = "__pad_" + action;
        if (pressed && !this.keys[flag]) this.padJust[action] = true;
        this.keys[flag] = !!pressed;
      }
      // D-pad
      if (gp.buttons[14]?.pressed) { this.keys.__padL = true; }
      if (gp.buttons[15]?.pressed) { this.keys.__padR = true; }
      if (gp.buttons[12]?.pressed) { this.keys.__padU = true; }
      if (gp.buttons[13]?.pressed) { this.keys.__padD = true; }
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
