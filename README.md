# Trolic v0.6 — Living vectors

**New:** compatible path morphs, animated fill and stroke, stroke weight, shape dimensions and corner radius; PNG still export, source history, a scene inspector and three original studies. [v0.6 reference](RELEASE-v0.6.md) · [Human guide](HUMAN-GUIDE.md) · [Live studio](https://codedbytahir.github.io/trolic/studio.html).

## Editable vectors for people and agents

**Current build:** [RELEASE-v0.6.md](RELEASE-v0.6.md). Readable v0.1–v0.3 source remains supported; new compact agent syntax is optional.

- **Measured source-token reduction:** 51.12% across eight fixtures with o200k_base; 50.87% with cl100k_base. Lossless Lottie export equivalence checked. These are source-text counts, not full API costs.
- **Definitions, styles, constants, bounded repeats and batch data** avoid repeating geometry and property blocks.
- **Stateful agent host library:** small atomic edits, optimistic revisions, selected-field inspection and concise receipts; no embedded model or network service.
- **249 automated tests** plus offline/browser checks. Model generation accuracy has not been benchmarked.
- **Previous builds backed up:** ../trolic-releases/README.md and checksum manifest.

### Agent quick start

```sh
node cli.mjs examples/orchard.trolic --target agent --output orchard.agent.trolic
node cli.mjs examples/agent/milo.trolic --check
node cli.mjs examples/agent/milo.trolic --target readable --output milo.readable.trolic
pip install -r requirements-token.txt
python token-optimize.py examples/orchard.trolic --encoding o200k_base --output orchard.optimized.trolic
npm test
```

Open **trolic-studio.html** offline. Use the Agent/Readable buttons to switch formats. The browser packer is heuristic; the optional Python optimizer measures candidate profiles with the selected tokenizer. The token benchmark and guide overhead are documented in RELEASE-v0.4.md. [AGENT-CARD.md](AGENT-CARD.md) is the short agent contract.

## Readable syntax and illustration features (carried forward)

Original, local-first vector-motion language and compiler. The v0.3 illustration feature set is retained. RELEASE-v0.3.md records its historical evidence and limitations. No Frolic code or artwork is included.

## Open immediately

Open **trolic-studio.html** in your browser. It embeds the compiler, eight examples and Lottie-web; no web server, npm installation, network, account or AI key required. The modular development version is `index.html` and requires an HTTP server.

The studio supports editing source, compiling, pausing/scrubbing playback, changing examples, switching between Lottie-web and the Trolic SVG sampler, and downloading JSON/SVG/source. File downloads may be restricted by an embedded preview sandbox; use the downloaded HTML in a regular browser if needed.

## Local CLI — Node 20+

Compiler and CLI have no npm dependencies:

```sh
node cli.mjs examples/orchard.trolic --check
node cli.mjs examples/aurelia.trolic --target lottie --output aurelia.json
node cli.mjs examples/tidal.trolic --target svg --time 3 --output tidal.svg
node cli.mjs examples/solstice.trolic --target ir --output solstice.ir.json
npm test
```

Serve the modular playground:

```sh
python3 -m http.server 8001 --bind 0.0.0.0
```

## Illustration capabilities

- **Paths:** M, L, H, V, C, S, Q, T, Z commands in both cases; multiple contours and even-odd fill rules. Cubic and quadratic curves export to Lottie Bézier geometry.
- **Strokes:** color, width, round/butt/square caps, round joins; `fill: "none"` supported.
- **Linear/radial gradients:** local coordinates and 2–16 ordered RGB stops with optional opacity.
- **Transform groups:** `group` nodes and `parent` references; nested position, rotation and scale.
- **Independent preview:** bundled Lottie-web 5.13.0, with original upstream MIT license in `vendor/`.
- **Corrected scalar keyframes and stroke paint ordering**, plus structured diagnostics, duplicate-property detection and safer CLI options.
- **Five original detailed compositions:** Orchard pear study, Milo cartoon fox, Aurelia botanical bloom, Tidal koi pond, Solstice paper landscape. Three basic motion fixtures are also included.
- **Standalone offline HTML** with embedded examples and player.

## Example syntax

Each statement/property occupies a separate line; property values are JSON. Groups and shapes use flat declarations with explicit parent IDs rather than nested source blocks.

```text
scene "Leaf" {
  size: [640, 480]
  duration: 3
  fps: 60
  background: "#10242b"
  group "plant" {
    position: [320, 300]
    animate rotation -10 -> 10 over 3s ease_in_out
  }
  path "leaf" {
    parent: "plant"
    position: [0, 0]
    path: "M 0 0 C -90 -80 -40 -180 0 -200 C 80 -140 80 -40 0 0 Z"
    gradient: {"type":"linear","from":[0,0],"to":[0,-200],"stops":[[0,"#24766c"],[1,"#d4f0a2"]]}
    stroke: "#a3d5ac"
    stroke_width: 1
  }
}
```

Scene: size, fps, duration, background. Nodes: `circle`, `rect`, `path`, `group`.

Common properties: parent, position, scale, rotation, opacity. Shape appearance: fill, stroke, stroke_width, line_cap, gradient. Geometry: size for ellipse/rect; radius for rect; path for paths. `circle` accepts two diameters and therefore also draws ellipses.

Units: position/size in pixels; rotation degrees; scale 1 = 100%; opacity 0..1; duration seconds. Colors: quoted #RRGGBB. Gradient overrides solid fill. Optional gradient stop opacity: [offset, "#RRGGBB", opacity]. Gradients are not animated. `line_join` supports miter/round/bevel; `fill_rule` supports nonzero/evenodd. Group opacity must remain 1 because null-parent opacity is not portable to Lottie; animate child opacity instead.

Animation:

```text
animate position [100, 200] -> [400, 200] over 1s delay 0.2s ease_out
```

Supported tracks: position, scale, opacity, rotation. One track per property. Use `keyframes rotation [[0,0],[1,15],[2,0]] ease_in_out` for multi-keyframe sequences (2..256 keys). Easing: linear, ease_in, ease_out, ease_in_out. Before/after track bounds, values hold at the first/last value. Looping in the playground restarts the timeline; it does not guarantee seamless animation. Source limits: 1 million characters, 500 nodes, 8,192 vertices and 128 contours per path, 32 hierarchy levels, 120 seconds, 120 fps, 8192px canvas dimensions. Path coordinates are limited to ±10,000,000. These are not a complete security sandbox.

## Testing and research

**249 unit/regression/CLI/agent/motion tests passed.** New v0.5 studies add 28 paired renderer frames (maximum whole-image mean RGB difference 0.37961/255). Historical v0.4 evidence follows: Eight scenes independently rendered with Lottie-web at four timestamps. Twenty-four paired screenshots compare Trolic SVG sampling against Lottie-web; the largest mean RGB pixel error is approximately 0.078/255 for these fixtures. No claim of all-player conformance. Offline import, retained preview after an error and renderer switching were also tested.

```sh
npm ci
npx playwright install --with-deps chromium
# Start the HTTP server in another terminal, then:
npm run test:browser
npm run test:compare
npm run test:offline
pip install Pillow
python check-comparisons.py
```

Browser tests default to http://127.0.0.1:8001; set TROLIC_URL to override. Test scripts run locally in Node; browser-facing code uses relative URLs, not localhost APIs.

See **RELEASE-v0.4.md** for historical token measurements; **RELEASE-v0.6.md** covers current motion, tests and limitations; RELEASE-v0.3.md covers the illustration milestone. **RESEARCH.md** records the historical v0.2 feature study and measurements. `artifacts/` includes compiled examples, SVGs, rendered screenshots and JSON reports. Measured median compilation: approximately 2.5 ms for Orchard and 1.4 ms for Milo in this sandbox, not a general performance guarantee.

## Build the standalone studio

```sh
python bundle.py
```

`make-examples.py` regenerates the v0.2 scenes; `illustrations.py` regenerates Orchard and Milo using Python's standard library. It is a developer authoring tool, not a Trolic procedural-language feature.

## Not yet implemented

General SVG import, arcs, arbitrary-topology morphing, masks, text shaping, general expression scripting, embedded AI generation, video export, dotLottie packaging and cloud API. A server can call the compiler today, but no production cloud service or untrusted-input isolation is included.

Compiler errors have parser line numbers; semantic errors identify the node declaration line (not yet the specific property). The IR is experimental and not yet a formal stable schema. Only the Lottie-web SVG renderer has been exercised here; Android/iOS and other renderers remain untested.

## License

Original Trolic code and artwork: MIT (LICENSE). Bundled Lottie-web: upstream MIT license retained in vendor/LOTTIE-LICENSE.md. No Frolic source is distributed in this package. Trolic name/trademark availability has not been checked.
