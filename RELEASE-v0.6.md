# Trolic v0.6 — Living vectors

v0.6 expands what can change over time, rather than adding renderer-specific filters. Original source remains compact and editable. This is an experimental toolchain, not a production certification.

## New expressive tracks

| Compact alias | Readable property | Values | Supported nodes |
| --- | --- | --- | --- |
| `d` | `path` | SVG path strings | Single-contour paths with matching topology |
| `f` | `fill` | `#RRGGBB` | Solid-filled shapes |
| `ink` | `stroke` | `#RRGGBB` | Stroked shapes |
| `sw` | `stroke_width` | Nonnegative scalar | Stroked shapes, including zero-width starts |
| `s` | `size` | Positive `[width,height]` | Circle/ellipse and rectangle |
| `round` | `radius` | Nonnegative scalar | Rectangle |

All use the existing `t` tuple, explicit times, easing, bounded repeats/yoyo and delay. Previous position, scale, rotation, opacity and trim-end tracks remain supported. Each node accepts at most 16 source tracks and cannot animate the same property twice.

```trolic
canvas square w=600 bg=#f3f0e8 dur=4
rect tile p=[300,300] s=[240,240] round=20 f=#456c56 ink=#324d3f sw=1 t=[["f",[[0,"#456c56"],[2,"#b16b47"],[4,"#456c56"]]],["s",[[0,[240,240]],[2,[300,180]],[4,[240,240]]]],["round",[[0,20],[2,80],[4,20]]],["sw",[[0,1],[2,6],[4,1]]]]
```

## Path morphing

Paths normalize into cubic vertices plus relative incoming/outgoing handles. Corresponding points and handles interpolate, with the track's timing curve. Lottie receives actual animated shape keyframes, not a substitute transform animation. SVG receives a normalized cubic path for each frame.

```trolic
canvas 640 400 dur=auto
let a "M 0 -90 C 90 -90 90 90 0 90 C -90 90 -90 -90 0 -90 Z"
let b "M 0 -120 C 140 -10 140 10 0 120 C -140 10 -140 -10 0 -120 Z"
path form p=[320,200] d=$a f=#82b8a1 t=[["d",[[0,"$a"],[2,"$b"]],"ease_in_out",{"repeat":2,"yoyo":true}]]
```

### Explicit morph contract

- Base path and every keyframe must contain **one contour**, have the same normalized vertex count, and agree on open/closed state.
- Vertex correspondence is the author's responsibility. Equal counts alone do not ensure a good-looking morph. Winding/start point are not automatically repaired.
- Different SVG commands may normalize compatibly (for example quadratic and cubic curves). Arcs remain unsupported.
- No auto-remeshing, contour splitting, text outlining or arbitrary SVG-to-SVG matching.
- Scene-wide budget: at most 65,536 normalized morph keyframe vertices after repeat expansion; existing path/source limits also apply.
- Compound static paths are still supported, but animated compound paths are rejected.

## Color and geometry semantics

Color interpolation uses encoded RGB channels (not linear-light or perceptual color space), rounded to 8-bit channels in the SVG sampler. Lottie players may round channels differently. Solid fill animation is rejected when a gradient or `fill=none` would make its meaning ambiguous. Stroke animation requires a non-none base stroke.

New appearance/geometry tracks reject overshooting timing curves to avoid negative sizes/radii/widths and out-of-range colors. Position, scale and rotation keep their previous easing behavior. Corner radii follow native rectangle clamping when too large for the current size. Geometry size changes are distinct from transform scale: a stroke need not thicken when the rectangle itself grows.

## Studio improvements

- Real **PNG frame download**, rendered from the SVG sampler at canvas resolution. This is a static still, not video/GIF. Export is limited to 16 megapixels.
- Source-history **Undo edit / Redo edit** across successful builds (last 20 snapshots). Undo first discards uncompiled edits; browser-native text undo remains available inside the editor. History is in memory, not cloud storage.
- **Scene inspector** lists node IDs, kinds and source motion properties/effects using safe DOM text insertion.
- **Ctrl/Cmd+Enter** compiles; keyboard focus styling and status announcements are included.
- Three new original examples: **Lagoon**, **Chroma**, **Atelier**. Gradients, original path geometry and motion are authored in Trolic, not imported proprietary source.

## Research and implementation

[Lottie property documentation](https://lottiefiles.github.io/lottie-docs/properties/) distinguishes scalar, vector, color and Bézier shape properties. Shape animation keyframes wrap a contour object in a one-element array; static shape properties hold a contour directly. This distinction is covered by tests and independent playback.

[SVG path semantics](https://www.w3.org/TR/SVG2/paths.html) inform exact cubic normalization and closed-contour serialization. Trolic interpolates normalized geometry explicitly; it does not rely on CSS path interpolation or browser-specific animation.

The minimal v0.5 launch design is retained and refreshed with v0.6 material. See `.hallmark/design-review.md` for its source and audit limitations.

## Validation and reproducibility

- **249 automated tests**: previous 187 plus 62 expressive-motion tests (`npm test`).
- **21 pre-v0.6 fixtures** (readable, compact and v0.5 motion studies) independently compiled with preserved v0.5 modules: byte-identical Lottie output.
- **21 new paired frames**: three scenes × seven times compared between Trolic SVG and Lottie-web SVG. Maximum whole-image mean absolute RGB difference: **0.25662 / 255**. Not pixel identity; whole-image means can hide localized differences. Screenshots and `artifacts/expressive-comparison.json` are included.
- Offline studio tests cover both players, history, keyboard compilation, inspector, actual PNG download signature and mobile overflow.
- Existing offline/agent suites remain passing. Lottie-web is the independently exercised player; no universal Android/iOS or other-player compatibility claim.
- No new agent generation-success, total API cost, frame-rate or token-savings claim is made. Historical v0.4 token measurements remain historical.

## Still not supported

Masks, blur/shadow filters, animated gradients, text shaping, general SVG import, arcs, arbitrary-topology morphs, group-opacity compositing, footage, audio, MP4/GIF and hosted collaboration. The sampled spring is not a physics solver. Compiler budgets are safeguards, not sandboxing.

Previous v0.1–v0.5 release archives remain preserved separately. Open `trolic-studio.html` for the standalone offline tool.
