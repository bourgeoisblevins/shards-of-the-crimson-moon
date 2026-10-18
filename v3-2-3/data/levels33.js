// v3.2.3: Monastery crows (the Plains crow in Monastery colours) perched on the climb ledges and the open east ledge.
// Placed clear of checkpoints and seals; they dive at the player and land stunned on a miss.
(function () {
  var L = window.SHARDS.levels.monastery_traverse; if (!L) return;
  [[2110, 48], [2110, 368], [2450, 508], [4120, 348]].forEach(function (p) { L.enemies.push({ type: "monastery_crow", x: p[0], y: p[1] }); });
})();
