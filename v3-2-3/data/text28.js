// v2.8: Capital of the Plains strings (prompts, the Mysterious Stranger, tablets). Inventions are flagged in CANON_SUMMARY.md.
window.SHARDS = window.SHARDS || {};
(function () {
  var S = window.SHARDS;
  S.text28 = {
    grate: { prompt: "Enter: sewer grate", promptPad: "{A} sewer grate", promptTouch: "OK: sewer grate" },
    ladder: { prompt: "Enter: climb up", promptPad: "{A} climb up", promptTouch: "OK: climb up" },
    guardBreak: "Guard broken!",
    stranger: {
      first: ["I sat down on the toilet and got flushed down here!",
        "Take this, it floated past. Fair is fair. Mind the bones, they throw."],
      again: ["Still down here. Still flushed. The drains are not so bad once you stop breathing."],
      reward: 40, gift: "The Stranger gave you {n} aurels."
    }
  };
  var TB = S.text22 && S.text22.tablets;
  if (TB) TB.capital = [
    "Tannairius, god of thunder and wind, is patron of the plains. The wheat bows to his weather. The plainsmen bow to no one else.",
    "The Great War crossed these fields. The grass grew back. The people kept the names of the dead and forgot nothing.",
    "The castle on the grasslands became the capital after the war. The people came to its walls, and the city grew around them.",
    "Warrior Monks keep the gate in the Father's name. The Order's guards were taught to protect creation. Some now guard only what they fear to lose.",
    "Acolytes carry word between the temple and the street. Few of them would recognise the hooded one who now walks past their door.",
    "Pilgrims leave small golden tokens at the altar. The Golden Serpent coils above the door, steadfast in its coil.",
    "The archive is kept under the cathedral. Ledgers of ranks, temples, offerings, scripture and the war. A crown no one is meant to wear sits behind the Guardian.",
    "Carved by a lay brother sent down to clear the drains: The Order cleans what the city forgets. The city forgets a great deal."
  ];
})();
