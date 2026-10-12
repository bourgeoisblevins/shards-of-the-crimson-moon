// v2.6: boss variety + the secret Blevins fights. Text and tuning only (no colours here: the palette audit applies).
// Everything about Blevins' routes, the Moonglass trigger and the alternate endings is a v2.6 INVENTION pending Ryan's approval
// (see CANON_SUMMARY.md); the forms and look come from the archive (blevins, shattering-of-the-blevins, crimson-moon and the six fragment entries).
(function () {
  var S = window.SHARDS;
  S.VERSION = "v3.1";   // single source for the title screen (the build bumps this constant)
  S.w26 = {
    hpMul: { jeriah: 1.25, azmardus: 1.2, nezradeem: 1.25, orchalsius: 1.2, silent: 1.2, gladius: 1.15 },
    blevins: { hp: 78, forms: [1, 0.74, 0.5, 0.26], size: { 1: [22, 52], 2: [62, 40], 3: [34, 50], 4: [46, 62] }, speed: { 1: 0.6, 2: 0.55, 3: 0.85, 4: 0.5 } },
    rematch: { aurelsMul: 0.5, nip: 0 }
  };
  S.text.bossLabels.blevins = "Blevins, the Shattered One"; S.text.bossShort.blevins = "Blevins";
  S.text.bossLabels.guardian = "The Archive Guardian"; S.text.bossShort.guardian = "Guardian";
  S.text.bossLabels.noah = "Noah John, Vessel of the Father"; S.text.bossShort.noah = "Noah John";
  S.text.travelClaimedReplay = "Cleared";
  S.text26 = {
    lines: {
      jeriahGuard: "Jeriah guards. Dodge through him and strike his back.",
      jeriahAura: "His soldiers shield him. Cut them down first.",
      azDecoy: "Illusions flicker. Strike the true Azmardus.",
      azPop: "The illusion shatters.",
      nezLimbs: "Break the bone arms to expose him.",
      nezExpose: "Exposed! Strike now.",
      orchCrash: "He is stunned after the crash. Strike!",
      orchFlood: "Lava floods the floor. Take the high ground.",
      silentDark: "The dark hides him. Strike a brazier for light.",
      silentLit: "The light pins him. He cannot step through shadow.",
      gladIce: "Ice grows platforms. The floor turns slick.",
      gladRage: "The yeti rages. Mind the walls.",
      phase3: "His shape breaks. Final phase.",
      formChange: "Blevins changes shape!",
      blevinsStun: "He is stunned. Strike!",
      rematch: "Rematch won. +{n} aurels. The fragment stays claimed.",
      glass: "A splinter of the Moon: Moonglass. +3 NIP.",
      lastJeriah: "Jeriah: \"Hold the Heart... it is warm.\"",
      lastAz: "Azmardus: \"Which of us was the lie?\"",
      lastNez: "Nezradeem: \"The bone remembers... being a priest.\"",
      lastOrch: "Orchalsius: \"The fire... lets go.\"",
      lastSilent: "...the lights return. The shades breathe out.",
      lastGlad: "Gladius: \"Cold. Quiet. Thank you.\""
    },
    intro: {
      order: [
        "An acolyte of the Crimson Moon steps from the dark, a Cult blade at his wrist. The red Moon fills the sky.",
        "\"Blevins, rise. They have gathered you for me.\" Marble, a golden crown, one red eye. The Shattered One stands.",
        "Noah John has returned from the heavens. He stands at your side. Hold the line."
      ],
      cult: [
        "The ritual burns. The Crown takes its place and the six fragments knit Blevins whole beside you.",
        "A light tears the sky. Noah John comes down from the heavens, a staff of gold in his hand, to end it.",
        "\"I will not let him walk again.\" Fight at Blevins' side."
      ],
      guardian: [
        "The vault door opens on coils of gold. The Archive Guardian lifts its hood, a sun-disc scribed on every scale.",
        "It does not hate you. It keeps the Crown, as it has kept every record the Order ever entrusted to it.",
        "Strike when its head is low."
      ]
    },
    altar28: {
      order: ["You step up to the altar and draw the six fragments from your pack. One by one you set them on the stone.", "The sixth fragment settles. The altar burns crimson and the red Moon climbs the sky. Something answers."],
      cult: ["You climb to the altar with the Crown of the Crimson King and the five fragments. You set them on the stone, the Crown last.", "The Crown takes its place. The altar burns red and the Crimson Moon rises. The ritual has begun."]
    },
    story: {
      order: [
        { w: null, t: "The six shards hum in the light of the Lightbearer's flame." },
        { w: "ryan", t: "Ryan: \"It is done. We can put an end to the Reclamation.\"" },
        { w: "acolyte", t: "Acolyte: \"Thank you, pilgrim. You gathered what we could not.\" He drops his hood and opens a vein on the altar stone." },
        { w: null, t: "The flame turns crimson. The six fragments rise and a body of cracked marble forms around them: Blevins." },
        { w: "noah", t: "Noah John: \"Though a man, I was raised in the Serpent's light. I will not let him walk again.\" He descends from the heavens, halo burning." },
        { w: "ryan", t: "Ryan: \"Noah John! Pilgrim, he fights beside you. Now!\"" }
      ],
      cult: [
        { w: null, t: "The Crown sits above the five fragments. Speak the old words." },
        { w: "jeriah", t: "Jeriah: \"The Crown remembers. Speak the old words, acolyte. Bring him home.\"" },
        { w: null, t: "The Moon burns red. Blevins steps out of the Crown's light: marble, gold, and a single red eye. He turns to you and bows." },
        { w: "noah", t: "Noah John: \"I came back to close this door. Stand aside, child, or stand against me.\" A column of gold light splits the sky." },
        { w: "jeriah", t: "Jeriah: \"The demigod himself. Keep him from the altar!\"" }
      ]
    }
  };

  // ---- v2.6 phase 2: Capital of the Plains (cult only), the Crown, Noah John and Blevins' finale ----
  Object.assign(S.text26.lines, {
    crownHint: "Steal the Crown of the Crimson King from the Cathedral archives, in the Capital of the Plains.", hidden: "Hidden in shadow", guardStun: "Its head is low. Strike!", guardScale: "Its scales turn your blade. Wait for the head to drop.",
    guardGlyph: "The archive glyphs flare. Step between the columns.", crown: "The Crown of the Crimson King is yours.",
    noahBless: "Noah John's blessing: +1 HP and a ward.", noahStrike: "Noah John strikes true.", allyStrike: "Blevins strikes true.", allyShift: "Blevins shifts shape beside you."
  });
  S.text26.ench = { disenchant: "Disenchant", disenchantDesc: "Strip every enchantment from this weapon and take back all the NIP spent on it.", refundAll: "Every enchantment is stripped. {n} NIP returned.", nothing: "Nothing to remove.", cap: "A weapon holds three enchantments at most. Disenchant to start over." };
  S.text26.crownEntry = { name: "Crown", bearer: "The Archive Guardian", found: "Capital of the Plains, Cathedral archive" };
  S.text25.zones.capital = { name: "Capital of the Plains", sub: "The Cathedral Archive", travel: "Capital: Cathedral Archive", hint: "in the Capital of the Plains", note: "The castle city of the Central Plains. Under its cathedral, the archive keeps the Crown of the Crimson King." };
  S.text25.clear.capital = "The Crown is taken.";
  Object.assign(S.text.zones, { capital: S.text25.zones.capital });
  S.stages25.push({ id: "capital", kind: "side", need: 2, cultOnly: true, music: "plains", reward: { aurels: 300, nip: 1, replay: 40 } });

  // ---- v2.6: lore tablets. Every tablet in a stage carries different lore (archive: abandonment-of-vespera, birth-of-the-deep, fall-of-aurelion,
  // the Deep's fortresses, massacre-of-the-mountain-monastery, freezing-of-sakura, razing-of-saffrika, destruction-of-gonduras, plains-capital, order-of-the-golden-serpent).
  var TB = S.text22.tablets;
  Object.assign(TB, {
    vespera: ["Vespera was raised by the Cult of the Crimson Moon around an old entrance into the Deep. It was a staging ground, not a home.",
      "When the Order of the Golden Serpent broke the Cult in the war's last stages, the town was left behind. Its people fled, fell, or vanished.",
      "Collapsed houses, ruined shrines, chambers beneath the stone. Even the scholars cannot say what the strange structures were for."],
    deep: ["Blevins was given the Architectship of Life. He believed he could make more if he were not bound by Bourgeois' design.",
      "He built the Deep, a realm apart from the Father's world. He could not make a Nexus for it. The Deep is still unfinished.",
      "His soul survives in the Crimson Moon, and so the Deep still changes. Do not trust its stairs.",
      "The Cult teaches that six pieces of his shattered body must be reunited, and that the Deep will be completed when he is."],
    aurelion: ["Aurelion was among the first great cities of humanity, raised when the Order stood at its height.",
      "Then, seemingly overnight, it ceased to be a city. No siege, no plague, no great battle is recorded.",
      "The Last King's letters grew frantic. He named Vespera, and warned that Nijjlias must be found. His own name is lost."],
    deepLairs: ["The Cult migrated into the Deep, seeking escape from a world they named a world of corrupt gods.",
      "They built these fortresses and castles. Now they are empty. The war migrants left chains, traps and the dead.",
      "Those who stayed too long were rewritten into hog-like husks. The Cult calls them Blevins' first children."],
    monastery: ["For centuries this was a holy training ground of the Order. Monks copied the holy texts and trained in the combat arts.",
      "Then everyone inside died. The Silent Dark Apostle did it, and not one monk survived.",
      "They became shades, bound to the ground and denied rest. The bell does not call them. It holds them.",
      "The Order trained warrior monks here. The silence is not peace; it is what was left of the chant of the guardians."],
    sakura: ["The God of Winter, Allenbraze, froze Sakura at the command of Blevins. The mountains froze with it.",
      "Nasuke Giro barely escaped. The town kept its cherry blossoms in the old festivals of renewal.",
      "Gladius, freed from the Arena, was caught in the winter. The cold made him the Frost Walker.",
      "A green anomaly around the Arena stayed untouched by frost. No one has explained it."],
    saffrika: ["Forces of Blevins razed the jungle of Saffrika and slaughtered the people of Sharfiki Bongo.",
      "He became an outcast and waged a one-man war, until he found Noah John.",
      "The slum waterways grew from the ruin. Pirates hold the water now, and they pay no tithe to any temple."],
    sandria: ["During the Great War, armies of Blevins laid siege to Gonduras. Maze-traps and pyramid strongholds did not save it.",
      "One disciple unleashed a storm of ash and flame. The pyramids endured; the city did not.",
      "Survivors founded Sandria in the pyramids' shadow. It is a trade city, and it remembers the siege."],
    capital: ["The castle on the grasslands became the capital after the Great War. The people of the plains came to it, and the city grew around the walls.",
      "The temples of the Order served as courts, hospitals and archives. Here the archive is kept under the cathedral, behind a vault door.",
      "Pilgrims leave small golden tokens at the altar. The archive keeps something older: a crown no one is meant to wear.",
      "As the serpent is steadfast in its coil, so must man hold fast to his pursuit. The Guardian holds its coil about the vault.",
      "The Crown of the Crimson King. The Order sealed it away after the Shattering rather than melt it. The seal is old, and the Cult has read the records."]
  });
  // give every tablet in a level a distinct index (the old levels reused index 1 twice)
  Object.keys(S.levels).forEach(function (k) {
    var lv = S.levels[k]; if (!lv || !lv.tablets) return;
    lv.tablets.forEach(function (t, n) { t.i = n; });
  });
  // sandria had two tablets: add a third beside the exit
  if (S.levels.sandria_traverse) {
    var sl = S.levels.sandria_traverse;
    if (sl.tablets && sl.tablets.length === 2) sl.tablets.push({ x: sl.tablets[1].x - 60, y: sl.tablets[1].y, i: 2 });
  }

  // ---- v2.6: skill tree (Inventory > Skills). Bought with NIP, any node refunds in full (with whatever hangs off it). ----
  S.skills26 = {
    guard: { pips: 3, bulwarkPips: 2, regen: 150, regenFast: 80, parryWindow: 10, breakStun: 60, bash: { cd: 50, stun: 50, range: 26 }, riposteTime: 90, riposteDmg: 2, deflectDmg: 2 },
    branches: [{ id: "guard", x: 80 }, { id: "skill", x: 240 }, { id: "vigil", x: 340 }],
    nodes: [
      { id: "guard", x: 80, y: 50, cost: 1, req: null }, { id: "bulwark", x: 20, y: 92, cost: 1, req: "guard" }, { id: "parry", x: 80, y: 92, cost: 2, req: "guard" },
      { id: "bash", x: 140, y: 92, cost: 2, req: "guard" }, { id: "regen", x: 20, y: 134, cost: 1, req: "bulwark" }, { id: "deflect", x: 56, y: 134, cost: 2, req: "parry" },
      { id: "riposte", x: 104, y: 134, cost: 2, req: "parry" },
      { id: "sk_dmg", x: 240, y: 50, cost: 2, req: null }, { id: "sk_cd", x: 240, y: 92, cost: 2, req: "sk_dmg" }, { id: "sk_aegis", x: 240, y: 134, cost: 3, req: "sk_cd" },
      { id: "dodge", x: 340, y: 50, cost: 2, req: null }, { id: "aurel", x: 300, y: 92, cost: 1, req: "dodge" }, { id: "flask", x: 340, y: 92, cost: 2, req: "dodge" },
      { id: "arrow", x: 380, y: 92, cost: 2, req: "dodge" }, { id: "vital", x: 340, y: 134, cost: 3, req: "flask" }, { id: "will", x: 380, y: 134, cost: 2, req: "arrow" }
    ],
    text: {
      ui: { tab: "Skills", heading: { guard: "Guard", skill: "Skill", vigil: "Vigil" }, owned: "Learned", locked: "Needs {req}", cost: "Cost {n} NIP", refund: "Select to refund",
        buy: "Learned: {name}", cant: "Not enough NIP.", needReq: "Learn {req} first.", refundTitle: "Refund {name}?", refundBody: "You get {n} NIP back{extra}.", extra: " (and the skills that depend on it)",
        hint: "{A} Learn / refund  {B} Back  D-pad: move", hintKb: "Arrows: move   Enter: learn or refund   Esc: back", hintTouch: "Tap a skill. Tap again to learn or refund.", guardKey: "Hold Guard (E / H, LT) to brace." },
      names: {
        guard: ["Serpent's Guard", "Crimson Ward"], bulwark: ["Bulwark of Gold", "Blood Bulwark"], parry: ["Perfect Parry", "Blood Parry"], bash: ["Sunbreaker Bash", "Moonbreaker Bash"],
        regen: ["Steadfast Coil", "Hollow Coil"], deflect: ["Mirror of Light", "Mirror of Ash"], riposte: ["Righteous Riposte", "Reaping Riposte"],
        sk_dmg: ["Keen Flame", "Keen Ember"], sk_cd: ["Swift Flame", "Swift Ember"], sk_aegis: ["Sun Aegis", "Ember Aegis"],
        dodge: ["Fleet Step", "Shade Step"], aurel: ["Pilgrim's Purse", "Looter's Purse"], flask: ["Quick Draught", "Quick Draught"], arrow: ["Fletcher's Faith", "Hunter's Hex"],
        vital: ["Vital Light", "Crimson Vigor"], will: ["Iron Resolve", "Iron Hunger"]
      },
      desc: {
        guard: "Hold Guard to brace. Frontal hits are blocked, at the cost of a guard pip.", bulwark: "+2 guard pips.", parry: "Guard just before a hit lands: a perfect parry costs no pip and staggers the attacker.",
        bash: "Strike while guarding: a shield bash that knocks back and stuns the foe in front. Costs a pip.", regen: "Guard pips refill almost twice as fast.",
        deflect: "A guarded projectile is thrown back at its source.", riposte: "After a perfect parry your next strike hits for +2.",
        sk_dmg: "Your special skill hits for +1.", sk_cd: "Your special skill recharges 30% faster.", sk_aegis: "Casting the skill grants half a second of invulnerability.",
        dodge: "Your dodge lasts 4 frames longer.", aurel: "+25% aurels from drops.", flask: "The flask is drawn 20% faster.", arrow: "Arrows and knives hit for +1.",
        vital: "+1 maximum health.", will: "You are knocked back far less when hurt."
      }
    }
  };

  // ================= v2.6 weapon movesets (data-driven; the engine reads these for every strike) =================
  // hit: a = attack pose 1..3, r = reach px, h = hitbox height, yo = vertical offset of the box centre, d = damage, kb = knockback mult, st = stun frames,
  // lu = lunge speed (px/frame over lt frames), hop = small hop, cd = recovery frames, sh = hitbox/smear shape, fin = finisher effect.
  S.moves26 = {
    staff: { hits: [
      { a: 1, r: 18, h: 16, yo: 0, d: 1, kb: 1.0, st: 10, lu: 0.5, lt: 4, cd: 14, sh: "arc" },
      { a: 2, r: 20, h: 16, yo: 0, d: 1, kb: 1.0, st: 10, lu: 0.5, lt: 4, cd: 14, sh: "arc" },
      { a: 3, r: 26, h: 20, yo: 0, d: 2, kb: 1.3, st: 14, lu: 0, lt: 0, cd: 26, sh: "spin", fin: "guard" }], air: null, note: "Two arcs, then a spinning guard sweep (hits both sides, brief invulnerability)." },
    scythe: { hits: [
      { a: 1, r: 34, h: 20, yo: 0, d: 1, kb: 0.9, st: 10, lu: 0.9, lt: 5, cd: 20, sh: "sweep" },
      { a: 2, r: 26, h: 20, yo: 2, d: 1, kb: 0.9, st: 10, lu: 0.4, lt: 4, cd: 16, sh: "sweep" },
      { a: 3, r: 30, h: 22, yo: 0, d: 2, kb: 0.6, st: 12, lu: 0.4, lt: 4, cd: 28, sh: "sweep", fin: "pull" }], air: null, note: "Long first sweep, return sweep, then a reaping pull-in." },
    sword: { hits: [
      { a: 1, r: 19, h: 16, yo: 0, d: 1, kb: 0.8, st: 9, lu: 0.8, lt: 4, cd: 11, sh: "arc" },
      { a: 2, r: 20, h: 16, yo: 0, d: 1, kb: 0.8, st: 9, lu: 0.8, lt: 4, cd: 11, sh: "arc" },
      { a: 3, r: 24, h: 24, yo: -4, d: 2, kb: 0.7, st: 12, lu: 1.6, lt: 5, cd: 22, sh: "rise", fin: "launch" }], air: null, note: "Balanced 1-2, then a rising launcher that pops the foe into the air." },
    spear: { hits: [
      { a: 1, r: 32, h: 8, yo: 0, d: 1, kb: 0.7, st: 8, lu: 1.0, lt: 4, cd: 17, sh: "thrust" },
      { a: 1, r: 34, h: 8, yo: 0, d: 1, kb: 0.7, st: 8, lu: 1.0, lt: 4, cd: 17, sh: "thrust" },
      { a: 3, r: 46, h: 10, yo: 0, d: 2, kb: 1.1, st: 12, lu: 2.4, lt: 6, cd: 30, sh: "thrust", fin: "lunge" }], air: "plunge", note: "Two quick thrusts, then a long lunging skewer. Airborne strike = vaulting plunge (bounces you back up on a hit)." },
    hammer: { hits: [
      { a: 3, r: 22, h: 26, yo: 2, d: 2, kb: 2.2, st: 20, lu: 0.3, lt: 3, cd: 36, sh: "slam", fin: "shock", armor: true },
      { a: 3, r: 26, h: 28, yo: 4, d: 3, kb: 2.6, st: 24, lu: 0.3, lt: 3, cd: 48, sh: "slam", fin: "shock2", armor: true }], air: "slam", note: "Two slow overhead slams; the swing has super-armor and each slam sends a ground shockwave. Airborne = crashing slam." },
    daggers: { hits: [
      { a: 1, r: 13, h: 14, yo: 0, d: 1, kb: 0.3, st: 6, lu: 0.5, lt: 3, cd: 8, sh: "stab" },
      { a: 2, r: 13, h: 14, yo: 0, d: 1, kb: 0.3, st: 6, lu: 0.5, lt: 3, cd: 8, sh: "stab" },
      { a: 1, r: 14, h: 14, yo: 0, d: 1, kb: 0.3, st: 6, lu: 0.5, lt: 3, cd: 8, sh: "stab" },
      { a: 3, r: 16, h: 16, yo: 0, d: 1, kb: 0.8, st: 10, lu: -2.4, lt: 5, cd: 20, sh: "cross", fin: "backstep", multi: true }], air: null, note: "Four-hit flurry; the finisher is a double cross-slash that skips you backward." },
    whip: { hits: [
      { a: 1, r: 42, h: 12, yo: 0, d: 1, kb: 0.4, st: 8, lu: 0, lt: 0, cd: 10, sh: "lash" },
      { a: 2, r: 40, h: 22, yo: -8, d: 1, kb: 0.4, st: 8, lu: 0, lt: 0, cd: 10, sh: "lash-up" },
      { a: 1, r: 40, h: 20, yo: 8, d: 1, kb: 0.4, st: 8, lu: 0, lt: 0, cd: 10, sh: "lash-down", fin: "tug" },
      { a: 3, r: 54, h: 14, yo: 0, d: 1, kb: 0.5, st: 14, lu: 0, lt: 0, cd: 22, sh: "crack", fin: "hook" }], air: null, note: "Fast four-hit flow: forward flick, rising and low diagonals (hit at angles), then a long crack that hooks foes in. Hold Up while striking to lash overhead." },
    katana: { hits: [
      { a: 1, r: 22, h: 12, yo: 0, d: 1, kb: 0.5, st: 8, lu: 1.8, lt: 4, cd: 9, sh: "slash" },
      { a: 2, r: 22, h: 12, yo: 0, d: 1, kb: 0.5, st: 8, lu: 1.8, lt: 4, cd: 9, sh: "slash" },
      { a: 3, r: 30, h: 14, yo: 0, d: 3, kb: 0.9, st: 12, lu: 3.0, lt: 5, cd: 22, sh: "dash", fin: "bleed", crit: true }], air: null,
      draw: { r: 44, h: 16, d: 3, kb: 1.1, st: 16, lu: 3.4, lt: 5, cd: 22 }, dashBonus: { lu: 2.0, r: 8 }, note: "Quick 1-2, then a crit dash-cut that bleeds. Strike during a dodge = draw-strike counter. Running first hit = dash-slash." }
  };
  S.world23.melee.push("whip", "katana");
  S.world23.weapons.whip = { reach: [42, 40, 54], dmg: [1, 1, 1], cd: 0.8, kb: 0.4, hitH: 14, stun: 8 };
  S.world23.weapons.katana = { reach: [22, 22, 30], dmg: [1, 1, 3], cd: 0.7, kb: 0.5, hitH: 12, stun: 8 };
  S.world23.shop.push({ id: "whip", kind: "weapon", price: 150, at: 2 }, { id: "katana", kind: "weapon", price: 220, at: 3 });
  S.text23.weapon.names.whip = { order: "Sunthread Whip", cult: "Embercord Lash" };
  S.text23.weapon.names.katana = { order: "Petalsteel Katana", cult: "Moonreaver Katana" };
  S.text23.weapon.desc.whip = "Long, flowing lash. Hooks foes in.";
  S.text23.weapon.desc.katana = "Fast and precise. Dodge, then draw.";
  // ================= v2.6 blessed-weapon special skills (archive: blessed-weapons, twin-blades-of-scorching-wind, sakuras-petal, hunters-bow) =================
  S.blessed26 = {
    winds: { cd: 150, dmg: 2, reach: 78, h: 30, life: 26, push: 3.2 },
    petal: { cd: 110, dmg: 1, n: 5, speed: 3.6, life: 44, spread: 0.2 },
    vine: { cd: 175, dmg: 1, reach: 74, h: 14, stun: 100, life: 22 },
    lightning: { cd: 210, dmg: 4, range: 150, w: 26, delay: 18, life: 12 }
  };
  S.skills26.nodes.push(
    { id: "winds", x: 402, y: 50, cost: 3, req: null, blessed: true }, { id: "petal", x: 402, y: 92, cost: 3, req: null, blessed: true },
    { id: "vine", x: 430, y: 50, cost: 3, req: null, blessed: true }, { id: "lightning", x: 430, y: 92, cost: 4, req: null, blessed: true });
  S.skills26.branches.push({ id: "blessed", x: 417 });
  S.skills26.nodes.forEach(function (n) { if (n.id === "arrow" || n.id === "will") n.x = 372; n.y += 5; });
  var SX = S.skills26.text;
  SX.ui.heading.blessed = "Blessed";
  SX.ui.activate = "Skill key: make active";  SX.ui.active = "ACTIVE";  SX.ui.activeToast = "Active skill: {name}"; SX.ui.baseToast = "Active skill: the old one";
  Object.assign(SX.names, { winds: ["Scorching Winds", "Scorching Winds"], petal: ["Petal Slash", "Petal Slash"], vine: ["Vine Stun", "Vine Stun"], lightning: ["Lightning Summon", "Lightning Summon"] });
  Object.assign(SX.desc, {
    winds: "Habib Asal's Twin Blades: a sweeping wave of scorching wind that sears and shoves. Replaces your special (Y) when active.",
    petal: "Sakura's Petal: a fan of petal-blades flies out and slices the foes ahead. Replaces your special when active.",
    vine: "The Hunter's Bow's vines: a lash that entangles and stuns all it touches. Replaces your special when active.",
    lightning: "Noah John's blessing, Lightbearer style: lightning falls on the nearest foe ahead. Replaces your special when active."
  });
  var G = S.text.guideLines;
})();
