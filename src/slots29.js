// v2.9: save slots. Pure storage (no engine dependencies): three slots, each stored as a checksummed envelope.
// Write = temp key, verify by reading it back, copy the previous good slot to ":bak", then swap it into place.
// Read = main if its checksum matches, else the backup (state "recovered"), else "corrupt" (raw text is kept until deleted).
window.SHARDS = window.SHARDS || {};
(function () {
  var P = "shards29:", N = 3, FORMAT = "shards-of-the-crimson-moon-save", MAXBYTES = 2000000;
  var ls = function () { try { return window.localStorage; } catch (_) { return null; } };
  function sum(str) { var h = 2166136261 >>> 0; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); }
  function get(k) { var s = ls(); try { return s ? s.getItem(P + k) : null; } catch (_) { return null; } }
  function set(k, v) { var s = ls(); if (!s) return false; try { s.setItem(P + k, v); return true; } catch (_) { return false; } }
  function del(k) { var s = ls(); try { if (s) s.removeItem(P + k); } catch (_) {} }
  function envelope(data) { var body = JSON.stringify(data); return { raw: JSON.stringify({ fmt: 1, saved: Date.now(), ver: data.version | 0, sum: sum(body), data: data }), body: body }; }
  function check(raw) { // -> envelope object or null
    if (!raw) return null;
    try { var e = JSON.parse(raw); if (!e || e.fmt !== 1 || !e.data || typeof e.data !== "object") return null; if (sum(JSON.stringify(e.data)) !== e.sum) return null; return e; } catch (_) { return null; }
  }
  var API = {
    N: N, FORMAT: FORMAT, sum: sum,
    read: function (i) {
      var main = get("s" + i), bak = get("s" + i + ":bak");
      if (!main && !bak) return { state: "empty" };
      var e = check(main);
      if (e) return { state: "ok", data: e.data, saved: e.saved, ver: e.ver };
      var b = check(bak);
      if (b) return { state: "recovered", data: b.data, saved: b.saved, ver: b.ver };
      return { state: "corrupt", raw: main || bak };
    },
    write: function (i, data) {
      var env = envelope(data), prev = get("s" + i);
      if (!set("s" + i + ":tmp", env.raw)) return false;
      var back = check(get("s" + i + ":tmp"));
      if (!back) { del("s" + i + ":tmp"); return false; }
      if (prev && check(prev)) set("s" + i + ":bak", prev);
      var ok = set("s" + i, env.raw);
      del("s" + i + ":tmp");
      return ok;
    },
    heal: function (i) { var r = API.read(i); if (r.state === "recovered") API.write(i, r.data); return r; },
    remove: function (i) { del("s" + i); del("s" + i + ":bak"); del("s" + i + ":tmp"); },
    copy: function (a, b) { var r = API.read(a); if (!r.data) return false; return API.write(b, JSON.parse(JSON.stringify(r.data))); },
    meta: function () { try { return JSON.parse(get("meta") || "{}") || {}; } catch (_) { return {}; } },
    setMeta: function (m) { return set("meta", JSON.stringify(m)); },
    globals: function () { try { return JSON.parse(get("g") || "null"); } catch (_) { return null; } },
    setGlobals: function (g) { return set("g", JSON.stringify(g)); },
    // export file: a plain JSON document that carries its own checksum
    exportText: function (i) {
      var r = API.read(i); if (!r.data) return null;
      return JSON.stringify({ format: FORMAT, fileVersion: 1, game: (window.SHARDS.VERSION || ""), exported: new Date().toISOString(), saveVersion: r.data.version | 0, sum: sum(JSON.stringify(r.data)), save: r.data }, null, 1);
    },
    // validation for imports; returns { ok, data, error }
    parseImport: function (text) {
      if (typeof text !== "string" || !text.trim()) return { ok: false, error: "The file is empty." };
      if (text.length > MAXBYTES) return { ok: false, error: "The file is too large to be a save." };
      var o; try { o = JSON.parse(text); } catch (_) { return { ok: false, error: "The file is not valid JSON." }; }
      var d = null;
      if (o && o.format === FORMAT && o.save && typeof o.save === "object") {
        if (o.sum && sum(JSON.stringify(o.save)) !== o.sum) return { ok: false, error: "The checksum does not match: the file was changed or damaged." };
        d = o.save;
      } else if (o && o.fmt === 1 && o.data && typeof o.data === "object") { // a raw slot envelope
        if (sum(JSON.stringify(o.data)) !== o.sum) return { ok: false, error: "The checksum does not match: the file was changed or damaged." };
        d = o.data;
      } else if (o && typeof o === "object" && !Array.isArray(o) && (o.path === "order" || o.path === "cult") && o.claimed) d = o; // a bare older save
      if (!d) return { ok: false, error: "This is not a Shards of the Crimson Moon save." };
      if (d.path !== "order" && d.path !== "cult" && d.path !== null) return { ok: false, error: "The save has no valid path (Order or cult)." };
      if (!d.claimed || typeof d.claimed !== "object" || Array.isArray(d.claimed)) return { ok: false, error: "The save has no fragment record." };
      if ((d.version | 0) > 30) return { ok: false, error: "This save is from a newer version of the game (v" + (d.version | 0) + ")." };
      return { ok: true, data: JSON.parse(JSON.stringify(d)) };
    }
  };
  window.SHARDS.slots = API;
})();
