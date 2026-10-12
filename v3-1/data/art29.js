window.SHARDS = window.SHARDS || {};
(function(){var A = window.SHARDS.art; var S = {"ui29-icons":{"path":"sheets/ui29-icons.png","fw":14,"fh":14,"ax":0,"ay":0,"n":11,"cols":11,"index":{"order":0,"cult":1,"crown":2,"pipOn":3,"pipOff":4,"save0":5,"save1":6,"save2":7,"save3":8,"empty":9,"warn":10,"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"10":10},"anims":{"save":4}}}; var U = {"slot29": {"path": "ui/slot29.png", "c": 6, "s": 16}, "slot29-sel": {"path": "ui/slot29-sel.png", "c": 6, "s": 16}, "slot29-empty": {"path": "ui/slot29-empty.png", "c": 6, "s": 16}, "slot29-warn": {"path": "ui/slot29-warn.png", "c": 6, "s": 16}};
for (var k in S) A.sheets[k] = S[k];
for (var u in U) A.ui[u.replace("-", "_")] = U[u];
})();
