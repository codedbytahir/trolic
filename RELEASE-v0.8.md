# Trolic v0.8 — Timeline studio

**Status:** tested local build. v0.7 is published; v0.8 has not been pushed or released on GitHub. Use this build's standalone studio for the new per-segment easing syntax.

## A working timeline

The studio now shows layer visibility windows and property keyframes in global scene seconds. Filter to a selected layer, zoom horizontally, click a lane/ruler to seek, select a key, and edit its time, JSON value and outgoing easing.

- Drag an explicit key for a timing preview, then release to commit one undoable edit. Escape cancels.
- Arrow Left/Right nudges a focused key by one frame; Shift nudges ten frames.
- Optional frame snapping applies to UI timing edits and pointer seeking. The model API accepts unsnapped seconds.
- Key times must remain strictly between their neighbors; crossing/reordering is rejected rather than silently reassigning easing. Use delete/add to reorder.
- Add a key at the playhead, delete a key while retaining at least two, or remove the selected track.
- Add a supported property track to a layer. It begins with identical base values at zero and scene end; change a key value to create motion.
- Edit layer in/out points, or use Until scene end. Visibility bars show declared windows; parent windows may clip them further. Changing visibility does not shift global track times.
- Selection, preview, source, draft recovery and the 50-snapshot undo/redo history remain synchronized. Uncompiled Source changes guard timeline edits.

The all-layer view shows at most 128 layers to keep the DOM bounded. Select any layer to focus its rows, including layers beyond that initial limit. This is not timeline virtualization or a frame-rate guarantee.

## Explicit conversion of generated motion

Effects, repeats/yoyo and nonzero delays appear as generated keyframes. Their timing/value fields are read-only until you choose **Convert to editable keyframes**. This affects only the selected property:

- An effect is removed and replaced with an explicit track for that property.
- A delayed/repeated track becomes global-time explicit keys.
- Expanded values, times and segment easing are preserved, including mirrored asymmetric yoyo curves.
- Conversion is one undoable transaction. The recipe is no longer live after conversion; Undo restores it.

Tests verify byte-identical Lottie output for conversion of all nine supported effects and an asymmetric delayed yoyo track. This is stronger than approximate preview matching, but does not certify every possible input/player combination.

## Per-segment easing in source

The language adds optional `options.easings`, one easing per original keyframe segment. Existing global track easing remains the default when this array is absent.

```trolic
canvas 640 360 dur=4
circle orb p=[100,180] s=[40,40] f=#9dc9b2 t=[["p",[[0,[100,180]],[2,[540,180]],[4,[100,180]]],"linear",{"easings":["ease_in","ease_out"]}]]
```

Each item is a named easing, `step`, or `[x1,y1,x2,y2]`. Repeats reuse the original segment list; yoyo reverses its order and mirrors cubic control points. The existing step/yoyo hold convention is retained. Existing constraints still apply: overshooting easing is rejected for color, opacity, trim and constrained geometry properties.

Readable syntax uses the same options:

```text
track position {"frames":[[0,[100,180]],[2,[540,180]],[4,[100,180]]],"ease":"linear","options":{"easings":["ease_in","ease_out"]}}
```

### What editing changes

Editing a track normalizes that selected track into explicit global-time keys. Compact source receives an instance `edit` override; reusable definitions and comments remain. In readable source, animation statements on the edited node are reserialized as track statements while unrelated nodes/text are retained. Time units/formatting on those statements need not remain unchanged.

An inserted key uses the sampled current value and a linear outgoing segment. Inserting/deleting keys can change in-between motion; exact curve subdivision is **not** claimed. Color samples use the existing rounded encoded-RGB sampler. Removing a track restores its original base property rather than freezing the playhead value.

## Two original studies

- **Tempo:** geometric voices with independently timed size and color segments, plus an orbit and stroke reveal.
- **Curves:** ease, hold and overshoot profiles on three parallel paths.

The artwork and source are original Trolic fixtures, not proprietary animation assets. The two examples use actual per-segment properties in exported Lottie JSON; no player expressions or browser-only animation substitute is used.

## Editor API

`timeline-model.js` exposes non-DOM operations returning validated candidate source:

```js
import {editTimelineKey, convertTimelineTrack} from './timeline-model.js';
const explicit = convertTimelineTrack(source, 'beacon', 'scale');
const candidate = editTimelineKey(explicit, 'beacon', 'scale', 1, {
  time: 0.75,
  value: [1.2, 1.2],
  easing: 'ease_out'
});
// Commit through StudioDocument with the expected revision.
```

Other operations include timeline inspection, key insertion/deletion, track creation/removal and visibility editing. Validation failures do not commit source or history. APIs are local utilities, not an authentication or execution-isolation boundary.

## Validation

- **378 automated tests:** prior 312 plus 66 timeline/model tests (`npm test`).
- **25 prior fixtures** retain byte-identical Lottie output compared with the preserved official v0.7 compiler.
- Offline timeline tests cover time/value/easing edits, undo/redo, insertion/deletion, pointer retiming, keyboard nudges, rejected edits, exact generated-effect conversion, adding/removing tracks, visibility windows, uncompiled-source guards, horizontal zoom and desktop/mobile overflow.
- Previous offline/import, agent conversion, v0.7 visual editing/recovery and expressive-motion/PNG regressions pass.
- **14 paired frames** from the two new scenes compare Trolic SVG with Lottie-web SVG. Maximum whole-image mean absolute RGB difference: **0.07717 / 255**. Not pixel identity; whole-image averages can hide localized errors. Reports are in `artifacts/timing-comparison.json`; paired PNGs are retained in the workspace/repository. The compact ZIP contains reports and current studio evidence rather than every paired PNG.

No new end-to-end API-cost, agent-generation reliability, performance or all-player compatibility claim is made.

## Deliberate limits

No multi-key drag, key clipboard, snapping to other keys, graphical Bézier handles, automatic curve-preserving subdivision, arbitrary key reordering, markers, audio tracks, frame caching or video export. Track values use JSON, not specialized path/gradient editors. Per-track keys remain bounded at 256; source/node/duration safeguards still apply. Timeline controls do not bypass morph topology, group opacity or renderer portability restrictions.

v0.1–v0.7 archives remain preserved with checksums. The public site remains v0.7 until a separate v0.8 publication.
