// v2.5 text: Saffrika, Sandria, bonus stages, Sheriff Dandy. Lore from the archive (saffrika-slums, pirates-of-saffrika,
// pirate-hideout, sandria, ruins-of-gonduras, curse-of-gonduras). Sheriff Dandy has no archive entry: he is a v2.5 invention.
(function () {
  var S = window.SHARDS;
  S.text25 = {
    zones: {
      saffrika: { name: "Saffrika", sub: "The Slum Waterways", travel: "Saffrika: Slum Waterways", hint: "in the Saffrika slums", note: "Cliffside fishing huts over the southern waterways. Pirates on the water." },
      sandria: { name: "Sandria", sub: "Pyramids of Gonduras", travel: "Sandria: Gonduras Pyramids", hint: "in Sandria", note: "A trade city raised by the survivors of Gonduras, in the shadow of the pyramids." },
      bonus_belfry: { name: "The Belfry of Echoes", sub: "Bonus", hint: "in the Belfry", note: "A hidden bell tower. Climb it without rest." },
      bonus_embers: { name: "The Ember Pit", sub: "Bonus", hint: "in the Ember Pit", note: "A closed pit of ash. Three waves." },
      bonus_spores: { name: "The Spore Hollow", sub: "Bonus", hint: "in the Spore Hollow", note: "A hidden hollow of living caps and drifting spores." }
    },
    dandy: [
      "Sheriff Dandy: Evening, pilgrim. I keep the law on these southern waterways. There is not much of it left, but I keep what there is.",
      "Sheriff Dandy: The huts cling to these cliffs and the boats feed the families. The pirates feed on the boats. Crossing the canals is how folk get by, and how they get robbed.",
      "Sheriff Dandy: Mind the water. It wades deep. Docks and rope lines keep you dry, and the swimmer's stroke will save you if you fall in.",
      "Sheriff Dandy: Three tide-seals hang in the shacks. The pirate dock's gate will not lift without them. Past it, their captain holds the last dock. Clear it and the fishermen sleep easy.",
      "Sheriff Dandy: And pilgrim. Mind the gallows on the hill. They have seen enough."
    ],
    talk: { prompt: "Enter: talk", promptPad: "{A} talk", promptTouch: "OK: talk" },
    gate: { open: "The pirate gate lifts.", locked: "The gate needs {n} more tide-seals.", lockedOne: "The gate needs 1 more tide-seal.", have: "Tide-seals {n}/{need}", key: "Enter: lift the gate", keyPad: "{A} lift the gate", keyTouch: "OK: lift the gate" },
    clear: {
      saffrika: "The docks are clear.", sandria: "The warden is at rest.",
      bonus_belfry: "Belfry conquered.", bonus_embers: "Ember Pit cleared.", bonus_spores: "Hollow conquered."
    },
    ui: {
      bonus: "Bonus Stages", bonusRow: "Bonus Stages  [{n}/3]", bonusLocked: "???  Hidden", bonusDone: "[Done]", bonusNew: "[New]", locked: "Locked",
      side: "[{need} claims]", cleared: "[Cleared]", back: "Back", clearHint: "Press Enter", clearHintPad: "{A} continue", clearHintTouch: "Tap to continue",
      reward: { aurels: "+{n} aurels", nip: "+{n} NIP", notch: "+1 charm notch", weapon: "Weapon: {name}", replay: "Replay reward +{n} aurels" },
      keyGot: "A hidden stage opens: {name}.", keyHint: "Bonus Stages is in the travel menu.", prize: "Stage prize claimed.",
      bonusHelp: "Replay any time. Rewards are paid once.", swim: "Water: Jump to swim"
    }
  };
  Object.assign(S.text.zones, S.text25.zones);
  S.stages25 = [
    { id: "saffrika", kind: "side", need: 2, music: "saffrika", reward: { aurels: 200, nip: 1, replay: 40 } },
    { id: "sandria", kind: "side", need: 4, music: "sandria", reward: { aurels: 300, nip: 1, replay: 40 } },
    { id: "bonus_belfry", kind: "bonus", key: "belfry", music: "bonus", reward: { aurels: 250, nip: 2, replay: 60 } },
    { id: "bonus_embers", kind: "bonus", key: "embers", music: "bonus", reward: { aurels: 400, weapon: "scythe", replay: 60 } },
    { id: "bonus_spores", kind: "bonus", key: "spores", music: "bonus", reward: { aurels: 150, notch: 1, replay: 60 } }
  ];
})();
