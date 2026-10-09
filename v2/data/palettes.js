// Locked palettes from /workspace/shards-design/ART_DIRECTION.md (Oct 8 2026).
// Every hex color used anywhere in the game must come from this file.
// tools/audit.mjs fails the build if any other hex appears in src/, data/, css/, or index.html.
window.SHARDS = window.SHARDS || {};
window.SHARDS.palettes = {
  ground: {
    void: "#050404",     // letterbox, deepest shadow
    obsidian: "#0B0A09", // panels, title ground, dark UI ground
    stone: "#1C1814",    // raised surfaces, terraces
    stone2: "#2E2924",
    stone3: "#3A342C",
    ash: "#4A443C",
    smoke: "#6B6458"
  },
  order: {
    templeDeep: "#5C4A14",
    temple: "#8A6E1F",    // depth
    nexus: "#C9A227",     // gold light
    illumination: "#E8C547", // highlight / glow edge
    boneShade: "#B8AA92",
    bone: "#E8DCC8",      // body text
    light: "#FFF6DE"      // brightest value in the game; replaces pure white (hit flash, emphasis)
  },
  cult: {
    black: "#14080A",
    blackRed: "#2A0C12",
    blood: "#5A1420",
    crimson: "#8B1E2D",
    ember: "#B42334",
    emberLight: "#E0604A"
  },
  // Mountain Monastery (tools/make_monastery.py). Cold stone, snow, deep shadow;
  // dim Order gold is the only light. Shade hues are the bound monks.
  monastery: {
    void: "#0D0F13", deep: "#171B21", stone: "#232830", stone2: "#323843",
    stone3: "#454C56", stone4: "#626A73", mist: "#8A9298",
    snowShade: "#AEB4B6", snow: "#D6D9D4",
    shadeDark: "#4E6470", shade: "#7F98A2", shadeLight: "#B8CACD"
  },
  // Controller glyphs (tools/make_pad_glyphs.py -> assets/ui/pad-glyphs.png). Muted
  // Xbox-style face colors tuned to the game: green and steel blue are new; B uses the
  // cult crimson ramp, Y the Order gold ramp, shoulders/sticks the bone ramp.
  pad: {
    greenDark: "#2E4A25", green: "#4F7A3A", greenLight: "#86AE5E",
    blueDark: "#22384E", blue: "#3F6688", blueLight: "#7898B8"
  },
  bosses: {
    jeriah:     { fragment: "heart",  ramp: ["#2A0C12", "#5A1420", "#8B1E2D", "#B42334", "#5C5A57", "#8E8A84"] },
    azmardus:   { fragment: "eye",    ramp: ["#1E0C24", "#3E1A40", "#6A2C5E", "#9A4478", "#D07AA4"] },
    nezradeem:  { fragment: "bone",   ramp: ["#4A443C", "#8A7E6A", "#B8AA92", "#E8DCC8", "#6E5A22"] },
    orchalsius: { fragment: "blaze",  ramp: ["#5A1420", "#B42334", "#E0604A", "#F2A65A", "#FFE3A3"] },
    silent:     { fragment: "shadow", ramp: ["#050404", "#0B0A09", "#1C1814", "#2E2924", "#B42334"] }, // ember is the only accent
    gladius:    { fragment: "claw",   ramp: ["#2A1A12", "#4E2E1C", "#7A4A2A", "#A8703F", "#D2A070"] }
  }
};
