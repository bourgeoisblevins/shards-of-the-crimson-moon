# Shards of the Crimson Moon — how to play

## On a computer

1. Unzip `shards-of-the-crimson-moon-v1.zip`.
2. Either:
   - **Double-open:** open `index.html` in Chrome, Edge, or Firefox (`file://` works), or
   - **Local server:** from this folder run `python3 -m http.server 8080` and visit `http://localhost:8080/`.
3. If a hosted link is provided, open that URL instead.

## Controls

| Action | Keyboard | Gamepad | Touch |
|---|---|---|---|
| Move | Arrows / A D | Stick / D-pad | Left pads |
| Jump | Z / Space / W | B | Jump |
| Strike | X / J | A | Strike |
| Dodge | C / K / Shift | X | Dodge |
| Skill | V / L | Y | Skill |
| Talk / confirm | Enter | A | Jump also confirms |
| Pause | Esc | Start | Pause |

Order skill: radiant burst. Cult skill: crimson dash.

## Install as an app

When the game is served over **http** or **https** (not `file://`):

1. Open the site in Chrome / Edge on desktop or mobile.
2. Use **Install app** / **Add to Home Screen** from the browser menu.
3. The PWA caches core files for offline play after the first visit.

## Paths

- **Order of the Golden Serpent** (warrior monk): take all six fragments from the Apostles of the Shattered, General Jeriah included, so Ryan can keep them apart, or destroy them if it can be done. Six bosses.
- **Cult of the Crimson Moon** (cult acolyte): take General Jeriah's orders in the cult hideout. Jeriah, still in communion with Blevins, already holds the Heart. The other apostles are too far gone to yield their fragments, so you hunt five of them: Azmardus, Nezradeem, Orchalsius, the Silent Dark Apostle, and Gladius. Vespera is on the Order path only. Five bosses.
- **Azmardus** claims to be on your side on either path. He is not.

## Where the fragments are

| Fragment | Bearer | Zone | Paths |
|---|---|---|---|
| Heart | General Jeriah | Vespera, the Crimson Ruins | Order (on the cult path Jeriah holds it) |
| Eye | Azmardus the Great | The Deep | both |
| Bone | Nezradeem | Aurelion, the Towering Ruins | both |
| Blaze | Orchalsius | The Deep, empty fortresses | both |
| Shadow | The Silent Dark Apostle | **Mountain Monastery**, the silent monastery | both |
| Claw | Gladius | Frozen mountains near Sakura | both |

The **Mountain Monastery** was the Order's training ground. Its terraces are climbed like stairs: walls block you, so jump each step. The monk shades there cannot leave the ground they stand on. In the arena, watch the floor: the Silent Dark Apostle shadow-steps, and an ember mark shows where he will appear.

Your path and claimed fragments are saved in the browser (`localStorage`). Older cult saves that fought Jeriah for the Heart load fine: the Heart goes back to Jeriah and your other fragments are kept. Saves from before the Mountain Monastery (when the Shadow was in Saffrika) carry over: a Shadow claimed in Saffrika stays claimed, and a save that had reached Saffrika continues at the monastery.
