> Historical v0.2 report. For the current build, see RELEASE-v0.3.md; features, measurements and test counts below describe v0.2.

# Trolic v0.2 — research and implementation decisions

## Scope and provenance

This build studies publicly served examples to identify useful capabilities, then implements an original compiler against public SVG/Lottie documentation. The Trolic repository does not contain Frolic source. The three new scenes are original compositions created by `make-examples.py`; that generator uses only Python's standard library.

The earlier collection contains 45 unchanged `.vd` files. This is not a complete Frolic grammar, implementation, or performance comparison. Publicly readable examples do not grant a permissive license to repackage their source.

## 1. What richer examples actually rely on

A lexical presence scan of those 45 source files found:

| Token | Files containing token |
|---|---:|
| group | 44 |
| gradient_fill | 39 |
| ellipse | 39 |
| path | 32 |
| rectangle | 30 |
| stroke | 26 |
| script | 20 |
| bake | 16 |

Method: search whole-word tokens in the downloaded files. This measures feature-related vocabulary, not parsed constructs: comments, helper functions and script code may also contain those words. Counts are prioritization evidence, not a language specification.

The important finding is that sophisticated illustration does not primarily require exotic animation features. Curved silhouettes, layered forms, gradients, line detail, and reusable transforms make a much larger visual difference than circles and rectangles alone. Procedural scripting improves authoring efficiency, but is a separate problem from geometry and export correctness.

Primary evidence:
- Public gallery manifest: https://lottie.ai/showcase.json
- Original example: https://lottie.ai/showcase/vault_app_launch.vd
- Gallery source-fetch implementation: https://lottie.ai/js/showcase-cache-DS_0zTBP.js
- Featured metadata: https://lottie.ai/js/showcase-metadata-CoNlB8Em.js

Hashed retrieval records remain in the earlier `frolic-research/provenance.json` collection. Site asset filenames may change.

## 2. Standards research → implementation

### Paths

The [W3C SVG path specification](https://www.w3.org/TR/SVG2/paths.html) defines move, line, cubic, quadratic, arc and close-path semantics. Trolic deliberately implements a restricted, validated subset: uppercase absolute `M`, `L`, `C`, `Q`, `Z`, with one contour per node.

[Lottie path documentation](https://lottiefiles.github.io/lottie-docs/shapes/#path) represents geometry as vertices plus incoming and outgoing handles. For a cubic from P0 to P3 with controls P1/P2, Trolic stores outgoing P1−P0 and incoming P2−P3. For a quadratic control Q, the equivalent cubic handles are 2/3(Q−P0) and 2/3(Q−P2). Quadratic conversion is mathematical, not sampled approximation.

We reject unsupported commands rather than rendering a different shape silently. SVG is a much larger format: this build is NOT a general SVG importer, nor does it support compound holes or arcs.

### Paint

[Lottie shape documentation](https://lottiefiles.github.io/lottie-docs/shapes/) separates geometry from paint items. Trolic's per-node styles lower to explicit fill, stroke and gradient items. Gradients use object-local coordinates and stop/color arrays; only opaque RGB stops are supported in v0.2. Trolic validates sorted stops spanning 0..1 and distinct start/end coordinates.

SVG and Lottie exports share the same geometry and paint semantics. Linear gradients use two endpoints. Radial gradients use the start as center and the distance to the end as radius. Stroke caps are explicit; joins are round.

### Hierarchy

Transform groups become nested SVG groups and Lottie null-parent layers. Lottie null-parent opacity is not inherited like SVG group opacity, so v0.2 rejects non-unit/animated group opacity. This is preferable to claiming parity while producing different images. Sibling drawing order is resolved from the hierarchy before emitting Lottie layers.

### Animation correctness

Independent renderer testing exposed an inherited v0.1 export bug: scalar animated keyframe values were numbers, rather than arrays. It affected rotation. Fixing the keyframe representation reduced the Aurelia 3-second snapshot mean RGB error from approximately 12.09 to 0.052 on a 0..255 scale. A regression test now checks scalar keyframe encoding.

## 3. Verification performed

- **36 unit/regression tests:** 13 original tests plus 23 vector tests.
- Six scenes rendered by bundled **Lottie-web 5.13.0, SVG renderer**, at four timestamps each; no browser page errors or NaN/Infinity output detected by that smoke test.
- **18 paired screenshots:** six scenes at 0.5, 1.5 and 3 seconds (clamped just before the final frame for shorter scenes). Both renderers captured at identical canvas size in Chromium.
- Per-pixel mean absolute RGB error across each image ranges from about **0.008 to 0.078 out of 255**. Report: `artifacts/renderer-comparison.json`.
- Standalone HTML loaded from a local file with HTTP(S) requests blocked and successfully rendered/switched examples.

Pixel comparisons are regression evidence for these cases, not proof of complete equivalence or cross-platform fidelity. Full-image averages can hide localized defects. No iOS, Android, Canvas-renderer, GPU, frame-rate or memory benchmark is claimed.

Reproduction: see README. Snapshot comparisons use Pillow; browser tests use Playwright and its Chromium installation. `check-comparisons.py` requires 18 pairs and checks a mean-error threshold of 0.2/255 per image.

## 4. Actual optimization measurements

Measured in this workspace with Node v20.20.2, 20 warmups and 100 timed parse+validate+Lottie-export calls per scene:

| Scene | Nodes including groups | Tracks | JSON bytes | gzip bytes | Median compile ms |
|---|---:|---:|---:|---:|---:|
| First Light | 2 | 2 | 1,351 | 451 | 0.063 |
| Aurelia | 86 | 23 | 50,794 | 2,536 | 2.295 |
| Tidal | 46 | 2 | 24,143 | 1,956 | 1.513 |
| Solstice | 24 | 1 | 15,724 | 1,433 | 0.760 |

These are small-scene, warm-process observations, not stable latency guarantees or comparisons against Frolic. Gzip size is a compression measurement; CLI output remains ordinary JSON. Exact metadata is in `artifacts/benchmarks.json`.

Current efficiency choices:
- No per-frame keyframe expansion for supported easing tracks.
- Constant endpoint tracks fold to static properties.
- Quadratic paths lower exactly to cubic handles.
- Minified export JSON; no raster textures in the example scenes.
- Source, vertex, scene-size, duration and hierarchy limits bound common accidental complexity.

Remaining inefficiencies: repeated geometry is emitted per layer; path parsing and validation are repeated; SVG sampling revalidates the scene; hierarchy operations use simple scans. A formal cached IR, shared geometry and measured export optimization should precede any claim of being a highly optimized production engine.

## 5. Why this is still not Frolic feature parity

This release can draw considerably richer vectors, but still has one two-endpoint track per property, no general expressions, no motion springs, no arbitrary SVG import, no compound paths, no text shaping, no masks, no procedural DSL repetition and no embedded AI generation. The example generator is an external development script, not a hidden language feature.

Prioritized next work:
1. Formal AST/IR schemas with accurate semantic source spans; public format versioning and migration rules.
2. Multi-keyframe sequences, deterministic springs, trim-path strokes, seamless loop tooling.
3. Bounded repeat/instance syntax, symbols and typed design tokens to reduce authoring repetition.
4. SVG path normalization/import, compound contours, clipping and carefully tested masks.
5. AI editing protocol: inspect scene → patch stable node → validate → render frame → compare.
6. Isolated cloud compilation/rendering API using the same compiler; input limits, timeouts and memory controls.

Arbitrary scripts should not be enabled merely to imitate an example's syntax. A small deterministic expression language with budgets is the safer long-term AI-facing design.
