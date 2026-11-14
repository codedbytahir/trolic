# Trolic v0.5 — portable motion

The v0.5 source and offline studio are included in this revision. See HUMAN-GUIDE.md for authoring and integration. The launch page explains human workflows and uses a minimal Hallmark-informed design. See https://github.com/codedbytahir/trolic/releases/tag/v0.5.0 for release downloads.

## New capabilities

- Nine effect names: `fade_in`, `fade_out`, `pop`, `spring_in`, `pulse`, `float`, `shake`, `spin`, `draw`. All lower to ordinary keyframes or trim paths, without player expressions or filters.
- Keyframe timing in seconds, milliseconds or frames; explicit delay; 1–16 bounded repetitions; yoyo with correctly mirrored asymmetric easing.
- Custom cubic Bézier easing and hold/step keyframes.
- `dur=auto` derives duration from expanded motion and explicit layer out points. Static scenes default to two seconds.
- Layer visibility windows, inherited through groups, with half-open `[in,out)` semantics. Tracks retain global scene time: `in` does not shift a track.
- Explicit local anchor/pivot `a=[x,y]`.
- Stroke draw-on via normalized `ts`/`te` (trim start/end).
- Aspect presets and arbitrary ratios; proportionate contain/cover reframing that preserves art coordinates through a parent group.
- Duration retiming that scales keyframes, effect times, delays, and layer windows.
- Repeat-stagger for reusable definitions.
- Studio speed, loop switch, restart, frame stepping, canvas fit, retiming, keyframe statistics and four new examples.
- `createRenderer(scene)` validates a private snapshot once instead of revalidating on each SVG frame.

## Quick start

Open `trolic-studio.html` directly; all assets and examples are embedded. Or run `python -m http.server 8001 --bind 0.0.0.0` in this directory and open `index.html`.

```trolic
canvas story w=540 bg=#121b2a dur=auto fps=60
circle orb p=[270,420] s=[160,160] f=#9ee6d4 fx=[["pop","700ms"],["float","2s","700ms",2,[0,-24]]]
path check p=[270,420] d="M -35 0 L -8 28 L 40 -30" f=none ink=#ffffff sw=7 fx=[["draw","800ms","600ms"]]
```

`fx` tuples are `[name,duration,delay?,repeat?,amount?]`. Repeat is the total number of plays. `spin` amount is degrees per play; `float` amount is `[dx,dy]`; `shake` amplitude is pixels; `pulse` amount is fractional scale gain; `pop`/`spring_in` amount is initial scale fraction. Fades, pop, spring-in and draw play once. Pulse/float/shake have closed endpoints and may repeat. Do not mix an effect with a track/effect targeting the same property on the same node.

### Compact tracks

```trolic
canvas 16:9 w=960 dur=auto
circle shuttle p=[100,270] s=[50,50] f=#9ee6d4 t=[["p",[[0,[100,270]],["2s",[860,270]]],[0.3,0.05,0.7,0.95],{"repeat":2,"yoyo":true,"delay":"500ms"}]]
```

Track tuple: `[property,frames,easing?,options?]`. Properties: `p` position, `z` scale, `r` rotation, `o` opacity, `te` trim end. Frames: `[time,value]`. Easing: old named curves, `step`, or `[x1,y1,x2,y2]`. Options: `{repeat,yoyo,delay}`. Delays are relative to global scene time, not layer visibility. Non-yoyo repeated tracks require matching endpoints to avoid ambiguous discontinuities. Opacity and trim reject overshooting easing.

Readable block syntax adds:

```text
track position {"frames":[[0,[0,0]],[1,[100,0]]],"ease":"ease_out","options":{"repeat":2,"yoyo":true}}
```

Readable properties: `anchor`, `effects`, `trim_start`, `trim_end`, `in_time`, `out_time`. Compact aliases: `a`, `fx`, `ts`, `te`, `in`, `out`. Previous animation/keyframe forms remain supported.

### Canvas

`canvas square`, `portrait`, `story`, `landscape`, `cinema`: defaults 1080×1080, 1080×1350, 1080×1920, 1920×1080, 1920×800. Set one dimension with `w=...` or `h=...`. `canvas 16:9 w=960` makes 960×540. Custom numeric `canvas W H` remains supported. Changing the canvas declaration does not reposition art: use studio Apply frame or API `reframe` for that.

```js
import {reframe,retime,compile,createRenderer} from './compiler.js';
const wide = reframe(source,[1920,1080],{fit:'contain'});
const slower = retime(wide,8);
const result = compile(slower);
const preview = createRenderer(result.scene);
const frameSVG = preview.frame(2);
```

Reframing uses one group slot; repeated reframing adds wrappers, subject to hierarchy/node limits. Retiming returns compact editable source; comments and original formatting are not preserved.

### Stagger

```trolic
canvas 640 360 dur=auto
def dot circle s=[24,24] f=#9ee6d4 fx=[["fade_in","400ms"]]
repeat dot d- 8 p=[60,180] step=[70,0] stagger=80ms
```

## Research and portability decisions

- [Lottie shapes](https://lottiefiles.github.io/lottie-docs/shapes/): trim paths use `ty:tm`, start/end percentages, offset degrees, mode 1. Trolic exports this modifier and uses normalized SVG path lengths for the other renderer.
- [Lottie layers](https://lottiefiles.github.io/lottie-docs/layers/): visibility maps to `ip`/`op`; transforms map to `ks`. Ancestor visibility windows are intersected explicitly for child layers.
- [CSS Easing Level 1](https://www.w3.org/TR/css-easing-1/): cubic Bézier timing maps input progress to output progress. Trolic solves X before evaluating Y; reverse playback mirrors the control points.
- [SVG coordinates](https://www.w3.org/TR/SVG2/coords.html): contain uses the minimum scale ratio, cover uses the maximum; center translation handles remaining margins/cropping.

Research informed original Trolic implementation. No proprietary Frolic compiler or unlicensed example collection is included.

### Deliberate limits

Draw/trim supports one stroked, unfilled contour per shape (including rectangles and ellipses); compound-path trim is rejected. No blur, drop-shadow filters, masks, morphing, text shaping, SVG arcs, footage, or audio were added. Group opacity remains rejected because it is not equivalent across these export paths. The spring effect is a bounded 25-key sampled damped response, not a physics solver. Runtime is local and deterministic, not a hosted animation/AI service. Tested against Lottie-web's SVG renderer, not every mobile or third-party Lottie player.

## Validation

- **187 tests:** existing 123 plus 64 new motion tests. `npm test`.
- Existing eight-scene Lottie-web browser suite, four timestamps per scene: passed.
- Offline standalone studio: rendering, invalid-edit retention, renderer switch and import: passed.
- New studio controls and mobile overflow: passed (`node studio05-test.mjs`, local server required).
- New renderer comparison: four scenes × seven requested times, 28 paired SVG/Lottie-web screenshots. Times beyond short scene duration are clamped to its last frame. Maximum whole-image mean absolute RGB difference: **0.37961 / 255**; this is not pixel identity and can hide localized discrepancies. See `artifacts/motion-comparison.json` and screenshots. No NaN/Infinity or browser page errors in this suite.
- Exact v0.4 source-token savings are historical measurements, not a new v0.5 benchmark. No claim of reduced end-to-end API costs or improved agent reliability is made.

## Preservation

v0.1–v0.4 ZIP backups remain separately under `trolic-releases`, with checksums. v0.5 does not overwrite those archives. The archive for this build is `trolic-v0.5.zip`.
