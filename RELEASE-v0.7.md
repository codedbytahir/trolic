# Trolic v0.7 — Usable studio

v0.7 focuses on selecting, changing and recovering editable work. It adds no new animation primitives. Existing v0.6 animation exports remain unchanged for the tested corpus.

**Publication:** v0.7 source and the offline studio are included in this revision. Release downloads: https://github.com/codedbytahir/trolic/releases/tag/v0.7.0 .

## What ships

### Select in either renderer

Click artwork in the Lottie-web or Trolic SVG preview, or choose a named layer. Selection pauses playback and draws a preview-only bounds outline. Search the layer list by name or kind. Parent/child indentation and front-to-back sibling ordering help find small or overlapping shapes. Keyboard users can select layer buttons and tab through the properties form.

The outline is a screen-aligned bounds indicator, not an editable vector contour or exact painted-stroke bound. Empty, invisible and some logical group layers may not have visible bounds. Selection metadata and overlays never enter JSON, SVG or PNG exports.

### Edit base properties

The property form edits position, circle/rectangle dimensions, rotation, scale, pivot, opacity, solid fill, stroke, stroke width and rectangle corner radius, where applicable. Press **Apply properties** to commit one validated transaction.

- Properties driven by a track or effect are read-only here, with an explanation. Edit their animation in Source.
- Gradient fills are read-only; edit their stops in Source.
- Group appearance controls are disabled; group transform controls remain editable.
- If Source contains uncompiled changes, visual edits are disabled until you compile or undo those changes. The visible artwork always represents the last valid scene.
- Invalid edits do not modify source or commit history. The compiler remains the authority for valid values and portable combinations.

This is not yet a graphical keyframe editor, color-gradient editor, path-point editor, resize-handle system or group-opacity compositor.

### Position with a drag outline

Drag selected artwork to move its outline; release to apply the position. The artwork itself updates on release, not continuously during the gesture. Escape or a pointer cancellation discards the move. An accepted gesture is one undoable transaction.

The move is transformed into the node's parent-local coordinates, including sampled animated ancestors, rotations, scales and pivots. A collapsed parent transform or animated position is guarded. Dragged coordinates round to 0.001 scene units; numeric property edits do not use that rounding. There is no snapping, alignment guide or touch pinch/zoom tool in this release.

### Preserve editable source

Visual changes in compact/agent syntax append explicit `edit` overrides. Definitions, constants, batches, original declarations and author comments remain untouched. Only the selected instance changes, not its reusable definition.

Readable block syntax stays readable: changed property lines are replaced or inserted in the selected node's block; unrelated text is preserved. This is not a general-purpose lossless source formatter. Agent overrides accumulate; explicitly convert/compact the source if you want to flatten them, noting that conversion does not preserve comments.

### Atomic source history

`StudioDocument` stores the last **50** valid source snapshots with monotonic revisions, atomic commits and redo branching. Visual edits and source compiles use the same history. Undo first discards uncompiled editor changes; subsequent undo/redo moves through valid snapshots. History is in memory, not persisted or cloud-synchronized.

### Local autosave and recovery

The studio saves the current source and selected ID after a 500ms idle period, including unfinished/invalid source. One draft is stored per browser origin under `trolic.studio.draft.v1`.

On reopening, **Restore draft** is offered rather than automatically replacing the starter. Until you choose Restore or Use current scene, the previous stored draft is left alone. Restoring invalid source retains the last valid preview and shows a diagnostic so you can finish the edit.

- **Clear saved draft** removes it and pauses autosave for the current page; the editor is unchanged.
- Storage denial, quota exhaustion or unreadable drafts do not prevent compilation. The studio recommends downloading Source.
- Storage is browser-local and may be evicted or cleared. File-URL behavior depends on browser policy. Export Source for a durable backup.
- This is one recovery draft, not a named-project manager, cross-tab merge engine, sync service or persistent undo history.

### Actionable diagnostics

Rejected compiles and property edits show a diagnostic panel, contextual hints and a **Go to reported line** action when a line is available. The editor focuses and selects that line. Compiler diagnostics may point to a declaration rather than an exact token; no column precision is claimed. The last valid preview remains available.

## Try it

Open `trolic-studio.html` directly, or serve the checkout and open `index.html`.

1. Choose **Signal / Editable starter**.
2. Select **tile** in the layer list, or click the pale rectangle in the preview.
3. Change Fill to `#d5c59f`, then Apply properties.
4. Drag its outline and release. Undo and redo the edit.
5. Select **beacon**: its scale fields explain that Pulse controls them.
6. Change source without compiling: property edits are guarded.
7. Compile an invalid color, use Go to reported line, and correct it.
8. Reload and explicitly restore the local draft.

## Reusable editor model

```js
import {StudioDocument, patchNodeSource} from './studio-model.js';
const document = new StudioDocument(source);
const revision = document.revision;
document.patch('tile', {fill:'#d5c59f'}, {revision});
const nextSource = document.source;
document.undo();
```

`patchNodeSource` validates the original and candidate source and rejects unsupported or animation-controlled fields. `StudioDocument` supports revision checks, bounded source history and atomic transactions. It is an editor utility, not an authentication or isolation boundary.

## Validation

- **312 automated tests**: previous 249 plus 63 editor-model tests (`npm test`).
- **24 prior fixtures** compiled using preserved v0.6 modules: byte-identical Lottie output. See `artifacts/v07-compatibility.json`.
- Offline end-to-end tests cover selection in both renderers, searchable layers, source-preserving edits, rejected edits, undo/redo, parent-local drag in both players, Escape cancellation, animated field locks, uncompiled-source guards, reported-line selection, valid and invalid draft recovery, selection recovery, clearing drafts, blocked storage, and desktop/mobile overflow (`npm run test:usable-studio`).
- Previous offline/import, compact-source, expressive-motion/PNG and v0.5 studio-control regressions pass.
- The Signal starter is original Trolic artwork and is included as source, SVG and Lottie JSON.

No new player-conformance, frame-rate, production-readiness, token-cost or autonomous-agent reliability claim is made. Existing compiler safeguards are not sandboxing.

## Scope left for later

A visual timeline, animated-value editing, drag resize/rotation handles, multi-select, layer hide/lock/reorder, snapping, full path editing, named projects, persistent transaction history and broader target-player validation remain future work. v0.7 improves the authoring workflow without claiming to replace a mature animation suite.

Previous v0.1–v0.6 archives remain preserved separately with checksums.

### Distribution contents

The v0.7 ZIP includes source, tests, fixtures, original SVG build assets, reports, generated Pages preview and the current studio screenshots. Historical paired-renderer PNGs remain in their previous release archives and the repository rather than being duplicated in every ZIP. Run `python tools/package_release.py --output /path/to/trolic-v0.7.zip` to reproduce this packaging policy after building the studio/site.
