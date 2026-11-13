# Trolic v0.3 — Illustration & Stability

## What this release means

v0.3 extends Trolic from geometric motion studies toward usable vector-illustration authoring. It includes two original illustrations with editable Trolic source, SVG exports and Lottie exports:

- **Orchard:** a naturalistic pear study, using layered translucent shading, highlights, contact shadows, leaf veins and deterministic skin speckles. 124 nodes; no animation tracks.
- **Milo:** an outlined cartoon fox explorer with facial detail, clothing, a backpack and a waving arm. 43 nodes; two multi-keyframe tracks.

All artwork is constructed from vector geometry. No raster image, downloaded illustration or Frolic code is embedded. The illustration authoring script is `illustrations.py`. This is not a photorealistic renderer and there is no built-in text-to-image or text-to-vector model.

## New authoring capabilities

### Expanded path geometry

`M L H V C S Q T Z`, absolute and relative, repeated coordinate sets and multiple contours. Quadratic and smooth curves normalize to cubic handles without curve sampling. Arcs remain explicitly unsupported.

`fill_rule: "evenodd"` enables cutouts/holes. The Milo jacket badge uses compound contours as an actual illustration fixture. `line_join` accepts `miter`, `round` or `bevel`; miter limit is fixed at 4.

### Translucent gradient stops

Gradient stops can be `[offset, "#RRGGBB", opacity]`, where opacity is 0..1. This supports soft shading and fading highlights without raster textures. Example:

```text
gradient: {"type":"radial","from":[0,0],"to":[120,0],"stops":[[0,"#383820",0.3],[1,"#383820",0]]}
```

These are gradients, not Gaussian-blur filters or physically based lighting. Layered painter's-order geometry is still how illustrations are composed.

### Multi-keyframe motion

```text
keyframes rotation [[0,-2],[1.5,1],[3,-2],[4.5,1],[6,-2]] ease_in_out
```

Times are seconds. Values match the target property type. Each track has 2..256 strictly increasing keys within scene duration. The selected easing applies to every segment. Existing two-endpoint `animate` statements still work. Only one track per property is allowed. Endpoint matching helps loops, but does not guarantee continuous velocity at the seam.

## Stability improvements

- Duplicate properties fail instead of silently overriding earlier values.
- Invalid JSON scene/node names return structured Trolic errors.
- Semantic diagnostics identify the offending node's declaration line; property-level semantic spans are not yet implemented.
- `diagnose(source, target)` is a non-throwing interface for editors and future AI tooling.
- Relative geometry, smooth controls and closed-contour endpoint tangents have regression tests.
- Bounded coordinates, total per-path vertices, contours and track lengths.
- CLI `--check` reports structured results without writing an export.
- CLI rejects unknown/missing options, invalid export times and source-file overwrite.
- Studio imports `.trolic` projects and keeps the last valid preview when compilation fails. Uncompiled edits are labeled.
- Renderer switching uses the last compiled scene rather than trying to compile invalid editor text.

A notable export correction: Lottie style ordering previously caused the fill to cover part of a stroke. v0.3 changes paint-item ordering so outlines remain above fills, matching SVG. The fox fixture made this visually obvious. A regression test checks the ordering.

## Evidence collected

### Automated checks

- **75 tests passed:** 13 original, 23 vector, 30 stability and 9 CLI tests.
- Stability tests include a 150-scene generated deterministic corpus and 300 malformed-source inputs. These are limited regression exercises, not comprehensive fuzzing or security certification.
- Eight scenes rendered in **Lottie-web 5.13.0, SVG renderer**, at four timestamps each, without detected page errors or invalid numeric markup.
- **24 paired screenshots:** eight scenes at three timestamps, comparing Trolic SVG sampling to Lottie-web at identical dimensions. Largest full-image mean absolute RGB error: approximately **0.078 out of 255**. Reports and screenshots are in `artifacts/`.
- Offline studio tested with HTTP(S) blocked, including project import and recovery after a compilation error.

Pixel averages can hide localized differences. This is evidence for these fixtures in Chromium, not full Lottie specification conformance, accessibility certification, mobile compatibility, or a guarantee for arbitrary artwork.

### Compile measurements in this workspace

Node v20.20.2; 20 warmups, then 100 parse/validate/Lottie-export measurements per scene. Excludes file I/O and playback.

| Illustration | JSON bytes | gzip bytes | Median compile ms | p95 ms |
|---|---:|---:|---:|---:|
| Orchard | 58,114 | 4,377 | 2.522 | 5.137 |
| Milo | 27,968 | 2,936 | 1.419 | 2.024 |

Gzip is an observed compressed size, not the CLI's default file format. Timings are environment-dependent, not service-level guarantees. `node benchmark.mjs` reproduces the measurement process.

## Practical use and boundaries

Suitable today for manually/externally-AI-authored vector illustrations within the supported subset, SVG asset export, and testing Lottie motion in the bundled web player. Local and browser compilation do not need an API key or service.

Before production delivery:
1. Check exports in the actual target app/player and at intended sizes.
2. Review paths, outlines, visual details and playback performance.
3. Check file budgets, especially with many layered details.
4. Retain the editable `.trolic` file alongside the export.
5. Use workers, time/memory limits and isolation before exposing compilation to untrusted users.

Not included: cloud API, embedded AI generation, general SVG import, text shaping, masks, arbitrary filters, arcs, path morphing, springs, trim-path animation, dotLottie/video export, authoring parameters/symbols or mobile-player testing. The compiler IR remains experimental. v0.2 source examples remain supported, but old serialized IR objects are not promised compatibility.

## Standards and reference basis

- SVG path semantics and reflected controls: https://www.w3.org/TR/SVG2/paths.html
- SVG filling/stroking: https://www.w3.org/TR/SVG2/painting.html
- SVG gradients: https://www.w3.org/TR/SVG2/pservers.html
- Lottie shapes, fill rules, strokes, gradients and cubic-handle geometry: https://lottiefiles.github.io/lottie-docs/shapes/

This implementation is original. Public Frolic examples informed the broad earlier feature priorities, not copied artwork or compiler source. See `RESEARCH.md` for the historical v0.2 study. The original Trolic code/artwork is MIT-licensed; Lottie-web retains its upstream license in `vendor/`.
