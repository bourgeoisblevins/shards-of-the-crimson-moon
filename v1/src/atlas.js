// Atlas loader — Brand paths from assets/MANIFEST.md. Missing required art throws.
(function () {
  "use strict";
  const root = () => window.SHARDS.ASSET_ROOT || "assets/";

  class Atlas {
    constructor() {
      this.images = new Map();
      this.meta = new Map();
      this.ready = false;
      this.errors = [];
      this._sil = document.createElement("canvas");
      this._sil.width = 64; this._sil.height = 64;
      this._sg = this._sil.getContext("2d");
      this._sg.imageSmoothingEnabled = false;
    }

    async loadAll() {
      const list = window.SHARDS.assetManifest;
      if (!list?.length) throw new Error("assetManifest empty");
      await Promise.all(list.map((e) => this._loadOne(e)));
      if (this.errors.length) {
        const msg = "ATLAS LOAD FAILED:\n" + this.errors.join("\n");
        console.error(msg);
        throw new Error(msg);
      }
      this._expandStripsFromWidth();
      this.ready = true;
    }

    /** Soft-load optional Brand drops; missing files are ignored (no audit fail). */
    async loadOptional(paths) {
      await Promise.all(paths.map((path) => new Promise((resolve) => {
        if (this.images.has(path)) return resolve();
        const img = new Image();
        img.onload = () => {
          this.images.set(path, img);
          if (!this.meta.has(path)) {
            this.meta.set(path, { path, kind: "image", fw: img.width, fh: img.height, frames: ["0"] });
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = root() + path;
      })));
      this._expandStripsFromWidth();
      this._registerSoftEnemySheets();
    }

    _expandStripsFromWidth() {
      const boss14 = window.SHARDS.bossFrameNames14;
      const playerFull = window.SHARDS.playerFrameNamesFull;
      const enemyFull = window.SHARDS.enemyFrameNamesFull;
      for (const [path, img] of this.images) {
        const m = this.meta.get(path);
        if (!m || m.kind !== "strip") continue;
        const fw = m.fw || img.height;
        const n = Math.max(1, Math.floor(img.width / fw));
        if (path.startsWith("boss-") && boss14 && n >= 14) {
          m.frames = boss14.slice();
        } else if (path.startsWith("boss-") && n > (m.frames || []).length) {
          const base = (m.frames || []).slice();
          while (base.length < n && boss14 && base.length < boss14.length) base.push(boss14[base.length]);
          m.frames = base;
        } else if (path.startsWith("player-") && playerFull && n > (m.frames || []).length) {
          m.frames = playerFull.slice(0, n);
        } else if (path.startsWith("enemy-") && enemyFull && n > (m.frames || []).length) {
          m.frames = enemyFull.slice(0, n);
        } else if (n > (m.frames || []).length) {
          // keep named prefix; pad numeric
          const frames = (m.frames || []).slice();
          while (frames.length < n) frames.push(String(frames.length));
          m.frames = frames;
        }
      }
    }

    _registerSoftEnemySheets() {
      const soft = window.SHARDS.enemySheetSoft || {};
      for (const [type, path] of Object.entries(soft)) {
        if (!this.images.has(path)) continue;
        window.SHARDS.enemySheet[type] = path;
        const img = this.images.get(path);
        if (!this.meta.has(path) || this.meta.get(path).kind === "image") {
          const fw = 16, fh = 24;
          const n = Math.max(1, Math.floor(img.width / fw));
          const names = (window.SHARDS.enemyFrameNamesFull || ["idle","walk0","walk1","hurt","death"]).slice(0, n);
          this.meta.set(path, { path, kind: "strip", fw, fh, frames: names });
        }
      }
      // skill VFX strips
      for (const path of ["vfx-skill-order.png", "vfx-skill-cult.png"]) {
        if (!this.images.has(path)) continue;
        const img = this.images.get(path);
        const fw = 16, fh = 16;
        const n = Math.max(1, Math.floor(img.width / fw));
        const frames = Array.from({ length: n }, (_, i) => "fx" + i);
        this.meta.set(path, { path, kind: "strip", fw, fh, frames });
      }
      if (this.images.has("tiles-deep-lairs.png")) {
        this.meta.set("tiles-deep-lairs.png", {
          path: "tiles-deep-lairs.png", kind: "grid", fw: 16, fh: 16, cols: 8, rows: 4,
          frames: Array.from({ length: 32 }, (_, i) => "tile" + i)
        });
      }
    }

    _loadOne(entry) {
      this.meta.set(entry.path, entry);
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          if (entry.kind === "strip") {
            const n = (entry.frames || []).length || 1;
            const expect = (entry.fw || 16) * n;
            // Allow longer sheets (extra Brand frames); only fail if shorter than declared base
            if (img.width < expect - 1) {
              this.errors.push(`${entry.path}: width ${img.width} < expected ~${expect}`);
            }
          }
          if (entry.kind === "grid") {
            const expectW = (entry.fw || 16) * (entry.cols || 8);
            const expectH = (entry.fh || 16) * (entry.rows || 4);
            if (img.width < expectW || img.height < expectH) {
              this.errors.push(`${entry.path}: grid ${img.width}x${img.height} < ${expectW}x${expectH}`);
            }
          }
          if (entry.kind === "parallax") {
            const expectW = (entry.fw || 320) * (entry.frames || ["sky","far","mid"]).length;
            if (img.width < expectW - 1 || img.height < (entry.fh || 180) - 1) {
              this.errors.push(`${entry.path}: parallax ${img.width}x${img.height} < ${expectW}x${entry.fh || 180}`);
            }
          }
          this.images.set(entry.path, img);
          resolve();
        };
        img.onerror = () => {
          this.errors.push(`${entry.path}: FAILED TO LOAD`);
          resolve();
        };
        img.src = root() + entry.path;
      });
    }

    require(path) {
      const img = this.images.get(path);
      if (!img) throw new Error("Missing atlas image: " + path);
      return img;
    }
    metaOf(path) {
      const m = this.meta.get(path);
      if (!m) throw new Error("Missing atlas meta: " + path);
      return m;
    }
    hasFrame(path, frameName) {
      const m = this.meta.get(path);
      if (!m) return false;
      return (m.frames || []).indexOf(frameName) >= 0;
    }
    resolveFrame(path, frameName, fallbacks) {
      if (this.hasFrame(path, frameName)) return frameName;
      for (const f of (fallbacks || [])) if (this.hasFrame(path, f)) return f;
      const frames = (this.meta.get(path) || {}).frames || [];
      return frames[0] || frameName;
    }

    drawMapped(g, path, logicalName, map, dx, dy, flipX, fw, fh) {
      const frame = (map && map[logicalName]) || logicalName;
      this.drawFrame(g, path, frame, dx, dy, flipX, fw, fh);
    }

    _blitFrame(g, path, frameName, dx, dy, flipX, fwOverride, fhOverride) {
      const img = this.require(path);
      const m = this.metaOf(path);
      if (m.kind === "grid") {
        const ix = (m.frames || []).indexOf(frameName);
        if (ix < 0) throw new Error(`Unknown grid frame '${frameName}' in ${path}`);
        const cols = m.cols || 8;
        const fw = m.fw || 16, fh = m.fh || 16;
        const col = ix % cols, row = (ix / cols) | 0;
        g.drawImage(img, col * fw, row * fh, fw, fh, dx | 0, dy | 0, fw, fh);
        return { fw, fh };
      }
      const frames = m.frames || ["0"];
      let ix = frames.indexOf(frameName);
      if (ix < 0) throw new Error(`Unknown frame '${frameName}' in ${path} (have ${frames.join(",")})`);
      const fw = fwOverride || m.fw || img.height;
      const fh = fhOverride || m.fh || img.height;
      const sx = ix * fw;
      g.save();
      if (flipX) {
        g.translate((dx | 0) + fw, dy | 0);
        g.scale(-1, 1);
        g.drawImage(img, sx, 0, fw, fh, 0, 0, fw, fh);
      } else {
        g.drawImage(img, sx, 0, fw, fh, dx | 0, dy | 0, fw, fh);
      }
      g.restore();
      return { fw, fh };
    }

    drawFrame(g, path, frameName, dx, dy, flipX, fwOverride, fhOverride) {
      this._blitFrame(g, path, frameName, dx, dy, flipX, fwOverride, fhOverride);
    }

    /** 1px void outline (#050404) then sprite. Palette-safe silhouette. */
    drawFrameOutlined(g, path, frameName, dx, dy, flipX, fwOverride, fhOverride, outlineColor) {
      const img = this.require(path);
      const m = this.metaOf(path);
      const fw = fwOverride || m.fw || 16;
      const fh = fhOverride || m.fh || 24;
      const frames = m.frames || ["0"];
      let ix = frames.indexOf(frameName);
      if (ix < 0) ix = 0;
      const sx = (m.kind === "grid") ? (ix % (m.cols || 8)) * fw : ix * fw;
      const sy = (m.kind === "grid") ? ((ix / (m.cols || 8)) | 0) * fh : 0;

      if (this._sil.width < fw + 2 || this._sil.height < fh + 2) {
        this._sil.width = fw + 2; this._sil.height = fh + 2;
        this._sg = this._sil.getContext("2d");
        this._sg.imageSmoothingEnabled = false;
      }
      const sg = this._sg;
      sg.clearRect(0, 0, fw + 2, fh + 2);
      sg.globalCompositeOperation = "source-over";
      sg.drawImage(img, sx, sy, fw, fh, 1, 1, fw, fh);
      sg.globalCompositeOperation = "source-in";
      sg.fillStyle = outlineColor || "#050404";
      sg.fillRect(0, 0, fw + 2, fh + 2);
      sg.globalCompositeOperation = "source-over";

      g.save();
      if (flipX) {
        g.translate((dx | 0) + fw, dy | 0);
        g.scale(-1, 1);
        for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          g.drawImage(this._sil, 0, 0, fw + 2, fh + 2, ox - 1, oy - 1, fw + 2, fh + 2);
        }
        g.drawImage(img, sx, sy, fw, fh, 0, 0, fw, fh);
      } else {
        for (const [ox, oy] of [[-1,0],[1,0],[0,-1],[0,1]]) {
          g.drawImage(this._sil, 0, 0, fw + 2, fh + 2, (dx | 0) + ox - 1, (dy | 0) + oy - 1, fw + 2, fh + 2);
        }
        g.drawImage(img, sx, sy, fw, fh, dx | 0, dy | 0, fw, fh);
      }
      g.restore();
    }

    drawTileIndex(g, path, index, dx, dy) {
      const img = this.require(path);
      const m = this.metaOf(path);
      const fw = m.fw || 16, fh = m.fh || 16, cols = m.cols || 8;
      const col = index % cols, row = (index / cols) | 0;
      g.drawImage(img, col * fw, row * fh, fw, fh, dx | 0, dy | 0, fw, fh);
    }

    drawImage(g, path, dx, dy, dw, dh) {
      const img = this.require(path);
      if (dw != null) g.drawImage(img, dx | 0, dy | 0, dw | 0, dh | 0);
      else g.drawImage(img, dx | 0, dy | 0);
    }

    drawParallaxLayer(g, path, layerName, dx, dy) {
      const img = this.require(path);
      const m = this.metaOf(path);
      const ix = (m.frames || []).indexOf(layerName);
      if (ix < 0) throw new Error(`Unknown parallax '${layerName}' in ${path}`);
      const fw = m.fw || 320, fh = m.fh || 180;
      g.drawImage(img, ix * fw, 0, fw, fh, dx | 0, dy | 0, fw, fh);
    }
  }

  window.SHARDS.Atlas = Atlas;
})();
