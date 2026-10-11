window.SHARDS = window.SHARDS || {};
window.SHARDS.text = {
  title: {
    wordmark: "SHARDS OF THE CRIMSON MOON",
    subline: "After the Shattering",
    migrated: "Your earlier pilgrimage carried over.",
    framing: "The Cult hunts the fragments so the soul in the Crimson Moon can return.",
    pressStart: "Press Enter / A",
    menuNew: "New pilgrimage",
    menuContinue: "Continue",
    menuSettings: "Settings",
    menuReset: "Forget this pilgrimage",
    resetConfirm: "Forget the path and every claimed fragment?",
    yes: "Yes", no: "No"
  },
  controls: {
    heading: "Controls",
    kb: [
      "Move: Arrows / A D",
      "Jump: Z / Space / W",
      "Strike: X / J",
      "Dodge: C / K / Shift",
      "Skill: V / L",
      "Speak / confirm: Enter",
      "Pause: Esc"
    ],
    pad: [
      "Move: Left stick / D-pad",
      "Jump / interact: A",
      "Dodge: B",
      "Strike: X",
      "Skill: Y",
      "Pause: Start"
    ]
  },
  pathSelect: {
    heading: "Choose your path",
    order: {
      name: "The Order", role: "Warrior monk",
      blurb: [
        "Serve the Order of the Golden Serpent.",
        "Keep the fragments apart, or destroy them."
      ]
    },
    cult: {
      name: "The Cult", role: "cult acolyte",
      blurb: [
        "Take General Jeriah's orders in the hideout.",
        "Hunt the five apostles who will not yield."
      ]
    },
    lockNote: "Your path is kept until you forget this pilgrimage."
  },
  hubs: {
    order: { name: "The Plains", place: "Order temple", guide: "Ryan" },
    cult:  { name: "Cult hideout", place: "", guide: "General Jeriah" }
  },
  guideLines: {
    order: [
      "Noah taught us: follow not me, but the path the Father has set.",
      "Beware the lies of the Shattered One. They offer power but bring only ruin.",
      "Guard the Nexus with your lives. Without it, all shall fall.",
      "Labor is sacred. Stand firm against the chaos of the world.",
      "General Jeriah leads the Cult. He alone still hears Blevins.",
      "Keep the fragments apart. Destroy them, if it can be done.",
      "Our acolytes became monks at the Mountain Monastery. We grieve them."
    ],
    cult: [
      "I alone still hear him. The Crimson King wants all of his pieces back.",
      "Our own apostles are too far gone to yield their fragments. So we hunt them.",
      "I take no joy in this order, acolyte. It is the only road to his return.",
      "Azmardus will swear he serves me. He serves only himself.",
      "I hold the Heart. Bring me the other five, and the Reclamation begins.",
      "The Silent Apostle is too bound to the Shadow to yield it. Take it."
    ]
  },
  hub: {
    talk: "Enter: speak",
    travelHeading: "Where will you go?",
    travelLocked: "Not yet",
    travelClaimed: "Claimed",
    travelBack: "Stay",
    allSixOrder: "All six fragments are in your keeping. Bring them to the altar.",
    allSixCult: "Five taken, and the Heart with me. Lay them at the altar.",
    altarPrompt: "Enter: lay the fragments at the altar"
  },
  zones: {
    vespera:  { name: "Vespera", sub: "The Crimson Ruins", hint: "in Vespera", note: "The abandoned Cult town, also called the Hollow. Collapsed houses, ruined shrines, and the old entrance to the Deep." },
    deep:     { name: "The Deep", sub: "", hint: "in the Deep", note: "Blevins' unfinished creation. No Nexus holds its laws." },
    aurelion: { name: "Aurelion", sub: "The Towering Ruins", hint: "in Aurelion", note: "The Golden City of the first great age. Its people vanished, seemingly overnight. How it fell is unknown." },
    deepLairs:{ name: "The Deep", sub: "Empty fortresses", travel: "The Deep's fortresses", hint: "in the Deep's forts", note: "Further in, where the Cult's war migrants built fortresses and castles that now stand empty." },
    // Retired from travel in shards-v5 (the Shadow moved to the monastery); kept for old builds.
    saffrika: { name: "Saffrika", sub: "Northern jungle", hint: "in Saffrika", note: "The last great stretch of jungle, in the north. Much of the rest died in the war." },
    monastery:{ name: "Mountain Monastery", sub: "The silent monastery", hint: "in the monastery", hintBy: { cult: "at the summit" }, travel: "Mountain Monastery", note: "The Order's training ground for centuries. The Silent Dark Apostle killed every monk, and their shades never left." },
    sakura:   { name: "Frozen mountains", sub: "Near Sakura", hint: "near Sakura", note: "The mountains Allenbraze froze at Blevins' command." }
  },
  fragments: { heart: "Heart", eye: "Eye", bone: "Bone", blaze: "Blaze", shadow: "Shadow", claw: "Claw" },
  bossLabels: {
    jeriah: "General Jeriah", azmardus: "Azmardus the Great", nezradeem: "Nezradeem",
    orchalsius: "Orchalsius", silent: "", gladius: "Gladius"
  },
  // Per path. A string is one intro box; an array is pages (Enter advances).
  // The path's reason row is added under the last page.
  bossIntro: {
    order: {
      jeriah: "General Jeriah leads the Cult and still hears Blevins. The Heart is his.",
      azmardus: [
        "Azmardus: \"Monk. I guard the Eye from the Cult. We want the same thing.\"",
        "Uncorrupted, and loyal to no one. He wants the Eye's power for himself.",
        "You refuse him. He raises his staff."
      ],
      nezradeem: "Nezradeem, once an Order priest, is living bone. The Bone remade him.",
      orchalsius: "Orchalsius, Behemoth of the Flame. The Blaze burns in him.",
      silent: [
        "The Order sent its acolytes here to become monks. The Silent Dark Apostle killed every one.",
        "Their shades never left. They are bound here, denied reincarnation.",
        "He steps out of the shadows without a word. Grieve them after this."
      ],
      gladius: "Gladius the Frost Walker. The Claw is in his hands of ice."
    },
    cult: {
      azmardus: [
        "Azmardus: \"Acolyte. I am loyal to General Jeriah. The Eye is safe with me.\"",
        "Uncorrupted, and loyal to no one. He wants the Eye's power for himself.",
        "You refuse him. He raises his staff."
      ],
      nezradeem: "Nezradeem is living bone now, too far gone to give the Bone up.",
      orchalsius: "Orchalsius, Behemoth of the Flame. The Blaze has his mind. He will not let go.",
      silent: [
        "General Jeriah sent you up the mountain. The monastery's monks are long dead.",
        "The Silent Dark Apostle. The Shadow is all he is now. He cannot yield it."
      ],
      gladius: "Gladius the Frost Walker. The Claw is bound into his hands of ice."
    }
  },
  bossReason: {
    order: "Take it. Keep it apart, or destroy it.",
    cult: "Jeriah's order: take it by force."
  },
  claim: {
    order: "You take the {frag}. Ryan will keep it apart, or destroy it if it can be done.",
    cult: "You take the {frag}. It goes to General Jeriah, beside the Heart."
  },
  hud: { hp: "HP", paused: "Paused", resume: "Resume", fragments: "Fragments", settings: "Settings", toHub: "Return to the hub", toTitle: "Title" },
  settings: {
    heading: "Settings",
    master: "Master volume",
    music: "Music",
    sfx: "SFX",
    fullscreen: "Fullscreen",
    vibration: "Vibration",
    back: "Back"
  },
  defeat: { heading: "You fall.", sub: "Your claimed fragments are kept.", retry: "Retry arena", toHub: "Return to the hub" },
  zoneClear: { prompt: "Enter: return to the hub", gate: "Enter: face the bearer" },

  prompts: {
    talk: "Talk",
    travel: "Travel",
    gate: "Enter",
    altar: "Altar"
  },
  tutorial: {
    move: "Move with arrows or A D",
    jump: "Jump with Z or Space",
    strike: "Strike with X",
    dodge: "Dodge with C",
    skill: "Skill with V",
    done: "Speak with the guide, then use the shrine."
  },
  tutorialBy: {
    kb: {
      move: "Move with arrows or A D",
      jump: "Jump with Z or Space",
      strike: "Strike with X",
      dodge: "Dodge with C",
      skill: "Skill with V",
      done: "Speak with the guide, then use the shrine."
    },
    touch: {
      move: "Move with the left pads",
      jump: "Tap Jump on the right",
      strike: "Tap Strike to attack",
      dodge: "Tap Dodge to roll",
      skill: "Tap Skill for your path art",
      done: "Talk to the guide, then Travel."
    },
    // v7: {A} {B} ... are controller glyphs (assets/ui/pad-glyphs.png, data/pad-glyphs.js)
    gamepad: {
      move: "Move with {LS} or {DPad}",
      jump: "Jump with {A}",
      strike: "Strike with {X}",
      dodge: "Dodge with {B}",
      skill: "Skill with {Y}",
      done: "Talk to the guide with {A}, then Travel."
    }
  },
  // v6 touch copy: replaces key names whenever the touch layer is the active scheme
  touch: {
    pressStart: "Begin",
    controls: [
      "Left pads: move",
      "Right pads: jump, strike",
      "Upper pads: dodge, skill",
      "OK: talk, travel, gates"
    ],
    pathConfirm: "Tap a path, then tap it again.",
    again: "Tap it again to confirm.",
    gate: "OK: face the bearer",
    claimPrompt: "Tap: return to the hub",
    end: "Tap: title",
    fragBack: "Tap here to go back",
    rotateHead: "Turn your phone",
    rotateBody: "The pilgrimage is played sideways. Hold it in landscape."
  },
  // v7 controller copy: replaces key names whenever the gamepad is the active device.
  // Tokens draw as pixel-art Xbox glyphs: {A} {B} {X} {Y} {LB} {RB} {LT} {RT} {Start} {View} {LS} {DPad}
  pad: {
    pressStart: "Press {A}",
    talk: "{A} Talk",
    travel: "{A} Travel",
    altar: "{A} Lay them down",
    next: "{A} Next",
    skip: "{A} Skip",
    gate: "{A} Face the bearer",
    claimPrompt: "{A} Return to the hub",
    end: "{A} Title",
    menu: "{A} Select  {B} Back",
    title: "{A} Select",
    path: "{A} Pick  {B} Back",
    settings: "{DPad} Adjust  {A} Select  {B} Back",
    pause: "{A} Select  {B} Resume",
    fragBack: "{B} Back",
    defeat: "{A} Select",
    heading: "Controller",
    layout: [
      "{LS} Move",
      "{A} Jump/Use",
      "{X} Strike",
      "{B} Dodge",
      "{Y} Skill",
      "{LB} Flask",
      "{RB} Shoot",
      "{View} Bag",
      "{Start} Pause"
    ]
  },
  // Who the cult guide names in "Hunt {bearer} {place}."
  hintBearer: {
    jeriah: "Jeriah", azmardus: "Azmardus", nezradeem: "Nezradeem",
    orchalsius: "Orchalsius", silent: "the Silent Apostle", gladius: "Gladius"
  },
  bossShort: {
    jeriah: "Jeriah", azmardus: "Azmardus", nezradeem: "Nezradeem",
    orchalsius: "Orchalsius", silent: "", gladius: "Gladius"
  },
  pause: {
    fragments: "Fragments",
    back: "Back"
  },
  fragmentPage: {
    heading: "Fragments",
    claimed: "Claimed",
    unclaimed: "Unclaimed",
    held: "Held by Jeriah",
    heldFound: "With Jeriah, cult hideout",
    bearer: "Bearer",
    found: "Found",
    entries: {
      heart:  { name: "Heart",  bearer: "General Jeriah",     found: "Vespera, the Crimson Ruins" },
      eye:    { name: "Eye",    bearer: "Azmardus the Great", found: "The Deep" },
      bone:   { name: "Bone",   bearer: "Nezradeem",          found: "Aurelion, the Towering Ruins" },
      blaze:  { name: "Blaze",  bearer: "Orchalsius",         found: "The Deep, empty fortresses" },
      shadow: { name: "Shadow", bearer: "The Silent Dark Apostle", found: "Mountain Monastery" },
      claw:   { name: "Claw",   bearer: "Gladius",            found: "Frozen mountains near Sakura" }
    }
  },
  guideNext: {
    order: "Seek the {frag} {place}.",
    cult: "Hunt {bearer} {place}.",
    all: "All six are gathered. Go to the altar."
  },
  endings: {
    order: {
      heading: "The fragments are kept apart",
      lines: [
        "The Order keeps the six fragments apart: Heart, Eye, Bone, Blaze, Shadow, and Claw.",
        "Each is guarded, or destroyed if it can be.",
        "They will never be reunited. The Shattered One is not restored.",
        "The Nexus is guarded. Labor is sacred."
      ]
    },
    cult: {
      heading: "The Reclamation",
      lines: [
        "General Jeriah brings the six together: Heart, Eye, Bone, Blaze, Shadow, and Claw.",
        "\"The Reclamation begins. The Crimson King will return.\""
      ]
    },
    end: "Enter: title"
  }
};
