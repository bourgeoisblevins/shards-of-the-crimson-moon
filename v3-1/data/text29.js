// v2.9: file select, save slots, Continue caption, export/import, saving indicator.
window.SHARDS = window.SHARDS || {};
(function () {
  window.SHARDS.text29 = {
    title: { continue: "Continue", files: "Files", newPilgrimage: "New Pilgrimage", note: "Your save was moved into File 1." },
    files: {
      heading: "Select a file", slot: "File {n}", empty: "Empty", order: "Order monk", cult: "Cult acolyte",
      play: "Play", continue: "Continue", newp: "New Pilgrimage", copy: "Copy to...", del: "Delete", export: "Export save", import: "Import save", back: "Back",
      copyTo: "Copy to which file?", pick: "Choose an action",
      time: "{h}h {m}m", frags: "Fragments", crown: "Crown", aurels: "Aurels", nip: "NIP", done: "{p}% complete", ver: "saved on {v}",
      hub: "The pilgrim's hub", migrated: "Your earlier save was moved into File 1.", recovered: "Restored from the backup copy.", corrupt: "Unreadable save",
      corruptHint: "Delete it or start a new pilgrimage here.",
      hintKb: "Up/Down: choose   Enter: open   Esc: back", hintPad: "{A} open   {B} back", hintTouch: "Tap a file",
      delTitle: "Delete this file?", delBody: "This file will be erased. This cannot be undone.",
      overTitle: "Overwrite this file?", overBody: "The saved pilgrimage in this file will be replaced.",
      copied: "Copied to File {n}.", deleted: "File {n} deleted.", exported: "Save exported.", imported: "Imported into File {n}.",
      importFail: "Could not import: {e}", importPick: "Choose a save file...", saveFail: "Could not save! Storage may be full.", noFile: "No file chosen."
    },
    hud: { saving: "Saving..." },
    pause: { saveTitle: "Save and return to title" }
  };
})();
