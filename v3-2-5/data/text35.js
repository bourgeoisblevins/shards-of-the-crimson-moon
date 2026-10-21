window.SHARDS = window.SHARDS || {};
/* v3.2.5 The Arena: every string. Lore per the Nexus Archive entries "Arena", "The Warden", "Corrupted Beasts",
   "Stone Golems", "Saffrika Railway", "Saffrika Mob", "Pirates of Saffrika", "Plains Culture", "Dwarves", "Sakura Culture", "Sandria Culture". */
(function () {
  const S = window.SHARDS;
  Object.assign(S.text.bossLabels, { cinderbear: "The Cinder Bear", hollowstag: "The Hollow Stag", pitgolem: "The Pit Golem" });
  Object.assign(S.text.bossShort || (S.text.bossShort = {}), { cinderbear: "Cinder Bear", hollowstag: "Hollow Stag", pitgolem: "Pit Golem" });
  S.text.zones.pit35 = { name: "The Arena", sub: "Neutral ground. Fight for coin, or for freedom.", travel: "The Arena", note: "Waves, beasts, and the Warden's word." };
  S.text35 = {
    travel: "The Arena", best: "[best wave {n}]", none: "[no record yet]",
    debut: "New in the pit: {name}",
    foes: { pit_brawler: "Plains brawler", ashen_wolf: "Ashen wolves", pit_cutthroat: "Saffrika cutthroat", pit_netter: "Pirate netter", pit_shield: "Dwarven shieldbearer",
            pit_pirate: "Chained pirate", pit_bowman: "Saffrikan bowman", pit_monk: "Cast-out monk", pit_staff: "Cast-out staff monk", pit_turned: "Turned Vesperan", pit_griffin: "Hooded griffin", pit_captain: "Pirate captain in irons" },
    who: { warden: "The Warden", guard: "Guard", pra: "Sakura elder", prb: "Sandria weaver", prc: "Rail convict" },
    intro: ["No crown rules this pit, and no god. Mine does.", "You came by wagon trail or by rail, like the rest. Fight, and the pit pays you. Live long enough, and you may ask me for your freedom."],
    introAgain: ["Back in the sand. The crowd remembers you."],
    wave: "Wave {n}", next: "Wave {n} in {s}", bossNext: "The gate opens in {s}", cleared: "Wave {n} cleared  +{a} aurels",
    bossIn: "Something is coming through the north gate.",
    bossLines: {
      cinderbear: "Taken from the ash of the Hidden Forest. It still smoulders. Mind the charge.",
      hollowstag: "It stands like a dead tree until you come close. Then it does not stand still.",
      pitgolem: "Dwarven make, from the Great War. Still walking. Break the stone and strike what burns inside."
    },
    teach: { bearWall: "It hit the wall. Strike while it is dazed.", stagStill: "Still as wood. Do not walk into its crown.", golArmor: "The stone turns blades. Strike the core when it opens.", golCore: "The core is open." },
    bossDown: "+{a} aurels",
    nip: "+1 NIP (every second arena beast)", nipHalf: "Half a NIP banked",
    choice: {
      line: "The beast is down and the crowd wants more. Rest in a cell and fight on, or ask me for your freedom. I keep my word.",
      heal: "Be healed, fight on", free: "Request my freedom",
      healNote: "Health and flasks refilled. Change charms at the dresser.", freeNote: "Leave with everything you earned."
    },
    freed: "Granted. Go, and tell them the pit pays what it owes.",
    dead: {
      title: "Down in the sand",
      line: "The Warden will buy you back once, for half of what you earned in the pit.",
      pay: "Pay {n} aurels and rise", stay: "Stay down (keep the rest)", used: "The Warden buys no one back twice."
    },
    respawned: "The crowd roars. Back on your feet.",
    res: {
      freeTitle: "Freedom granted", deadTitle: "Carried out of the pit", leftTitle: "You walked out",
      waves: "Waves cleared: {n}", best: "Best wave: {n}", newBest: "New best", bosses: "Beasts felled: {n}",
      aurels: "Aurels kept: {n}", nip: "NIP earned: {n}", kept: "Everything you earned is yours.",
      ok: "Enter: back to the hub", okPad: "{A} back to the hub", okTouch: "Tap: back to the hub"
    },
    cell: {
      title: "The Cells",
      dresser: { prompt: "Enter: dresser", promptPad: "{A} dresser", promptTouch: "OK: dresser" },
      talk: { prompt: "Enter: talk", promptPad: "{A} talk", promptTouch: "OK: talk" },
      door: { prompt: "Enter: back to the pit", promptPad: "{A} back to the pit", promptTouch: "OK: back to the pit" },
      next: "Block {b}: waves {a} to {z}"
    },
    lines: {
      pra: ["In Sakura we speak two tongues. Down here there is only one, and it is steel.", "I fought forty fights in this sand. My knees fought thirty of them.", "Coin can be taken from you in here. A name cannot. That is why they fight for one."],
      prb: ["I wove nets for the fishers at home. Here they hand my nets to pirates.", "The guards argue in four languages. The Warden answers in none of them.", "The old hands talk of one who fought until the Warden had nothing left to send at him. Then he walked out."],
      prc: ["Rode the rail out of Saffrika in irons. Sheriff Dandy's men do not miss a train.", "Mob or sheriff, it is the same chain.", "Out here a sentence is counted in fights. I am on my ninth."],
      guard: ["The door opens when you say so. Not before.", "Rest. The crowd will wait. It always does.", "No banner on this wall. The Warden's word is the only law here."]
    },
    ambient: {
      pra: ["...forty-one...", "Sakura snow, I miss even that."],
      prb: ["Mind the netters. They aim low.", "Tie the wraps tight."],
      prc: ["Hear that? The rail.", "Nine fights. Nine."]
    }
  };
})();
Object.assign(window.SHARDS.text35.teach, { shield: "Its shield turns blows from the front. Strike from behind, from above, or right after its bash.", stagWall: "Its crown is caught in the wall. Strike now.", golWall: "It struck the wall. The stone is dazed." });
