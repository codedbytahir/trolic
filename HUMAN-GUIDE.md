# Trolic for humans

Trolic is a small, experimental text-based language for vector illustration and motion. You do not need an AI account to use it. It is not an automatic prompt-to-video service.

## Try it in five minutes

1. Open the [web studio](https://codedbytahir.github.io/trolic/studio.html), or download `trolic-studio.html` from this repository and open it in a browser. The downloaded studio works offline.
2. Choose an example. Lagoon, Chroma and Atelier show v0.6 path, color and geometry motion. Orbital shows a rocket entrance; Prism demonstrates stroke drawing; Affirm is a vertical interface card.
3. Pause, scrub, then change a color such as `#9ee6d4`. Click **Compile scene**. The preview retains the last valid scene if an edit is invalid.
4. Change an effect duration, for example `"700ms"` to `"1200ms"`. Use **Duration → Retime motion** to scale the entire timeline instead.
5. Choose a canvas preset, select **Contain artwork** or **Cover canvas**, and click **Apply frame**. Merely editing the canvas declaration does not reposition existing art.
6. Download **Lottie JSON**, **SVG frame**, **PNG frame**, and **Source**. Keep source for later edits.

## A first scene

Paste this in the editor and compile:

```trolic
canvas square w=600 bg=#121b2a dur=auto
circle badge p=[300,300] s=[180,180] f=#9ee6d4 fx=[["pop","700ms"]]
path check p=[300,300] d="M -40 0 L -10 30 L 45 -35" f=none ink=#ffffff sw=8 fx=[["draw","800ms","600ms"]]
```

- `canvas`: output size, background and duration. `dur=auto` fits the motion.
- `circle badge`: shape kind and stable, unique name.
- `p=[300,300]`: position in canvas coordinates; X increases rightward, Y downward.
- `s=[180,180]`: shape size. `f`: fill color. `ink`: stroke color. `sw`: stroke width.
- `fx`: effect tuples `[name,duration,delay?,repeat?,amount?]`.
- `d`: SVG-style path commands. Draw-on needs an unfilled, stroked, single-contour shape.

You can use **Readable syntax** for longer property names or **Agent syntax** for compact source. Conversion preserves scene output, not comments or original formatting.

## Where to use it

| Destination | Export | Integration |
| --- | --- | --- |
| Website or web application | Lottie JSON | Load using a compatible Lottie player such as lottie-web; test your animation in that player. |
| Mobile interface | Lottie JSON | Test the exact Android/iOS player you use. This project has only validated Lottie-web's SVG renderer. |
| Website illustration, slide or documentation | SVG frame | Insert the exported static vector image. It is not an animated SVG. |
| Square, portrait, story or wide layout | Reframed scene, then JSON/SVG | Use Apply frame. For MP4/GIF or a social upload, a separate video-rendering pipeline is required. |
| Learning, code review or design-system prototype | `.trolic` source | Commit editable source, reuse definitions, and compile deterministic exports. |

### Minimal web integration

Install a compatible player in your own project (`npm install lottie-web`), then load the exported JSON:

```js
import lottie from 'lottie-web';
lottie.loadAnimation({
  container: document.querySelector('#animation'),
  renderer: 'svg',
  loop: true,
  autoplay: true,
  path: '/animations/badge.json'
});
```

Provide a container with explicit dimensions. Serve the JSON from the correct path; double-clicking an HTML page may block JSON loading. Respect reduced-motion preferences and avoid using decorative animations as the only way to communicate an important state. Give meaningful graphics accessible labels; hide purely decorative ones from assistive technology.

## Why choose it?

Trolic is particularly useful when you want editable text, local compilation, reproducible exports, small reusable scenes, or an assistant-friendly authoring format. Its original code and artwork are MIT-licensed; the bundled Lottie-web player retains its upstream license.

It is **not proven best overall**. A graphical timeline editor is often better for complex choreography. A mature graphics suite is better for text shaping, masking, morphing, complex effects and video workflows. Trolic does not include general SVG import, footage, audio, collaboration or a hosted AI generator.

Historical v0.4 measurements found roughly 51% fewer source tokens across eight fixtures under two specific encodings. That does not prove better visual quality, faster playback, improved agent reliability or lower end-to-end API costs. Expanded source still becomes expanded animation layers.

## v0.6 controls and limits

- Effects: fade_in, fade_out, pop, spring_in, pulse, float, shake, spin, draw.
- Track properties: position, scale, rotation, opacity and trim end.
- Time: numeric seconds, or quoted `"500ms"`, `"2s"`, `"30f"` inside JSON.
- Delay, repeat and yoyo; custom cubic Bézier curves and step timing.
- Pivots, visibility windows, stagger, canvas presets and proportional retiming.
- Spring entrance is sampled keyframes, not a physics engine. Only one track/effect may target a property on a given node. Group opacity remains unsupported.
- Limits include 500 nodes, 256 expanded keys per track and a 120-second scene maximum. Budgets do not make untrusted workloads safe to execute without isolation.

See [the v0.5 reference and research](RELEASE-v0.6.md), [the agent card](AGENT-CARD.md), and [the project report](PROJECT-REPORT.md).

### Expressive motion

v0.6 adds path, solid fill, stroke color, stroke width, size and corner-radius tracks. Morphs require a single contour with matching normalized vertex counts and closure; correspondence is your responsibility. Use the inspector to see source motion, Ctrl/Cmd+Enter to compile and Undo edit / Redo edit for the last 20 successful source snapshots. PNG is a still export, not video.
