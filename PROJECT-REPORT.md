# Trolic project report

## v0.6 update

The current milestone adds compatible path morphing, solid fill/stroke color animation, stroke width, geometry dimensions and corner radius. The studio adds PNG stills, source history and a node-motion inspector. Validation: 249 automated tests, byte-identical Lottie export for 21 preserved earlier fixtures and 21 paired new renderer frames (maximum whole-image mean RGB difference 0.25662/255). See RELEASE-v0.6.md for contracts, research and limits. These are local test results, not production certification.

## Executive summary

Trolic is an original experimental vector-motion language and toolchain. It translates readable or compact agent-authored text into a validated scene model, Lottie JSON and static SVG. A self-contained browser studio works offline; a dependency-free JavaScript compiler also runs under Node.

The v0.5 language milestone, adds portable effects, stroke drawing, duration units, repeats/yoyo, pivots, visibility windows, aspect presets, reframing and retiming. v0.4 introduced compact source and measured source-token savings. The public launch adds a showcase, embedded studio, documentation, benchmark explorer, testing workflow and preserved prior-version downloads.

## v0.5 validation and human workflow

187 automated tests pass (123 previous plus 64 motion tests). Four new scenes were compared against Lottie-web SVG across 28 paired frames; maximum whole-image mean RGB difference was 0.37961/255. Offline and mobile controls were checked. This is not proof of all-player compatibility or pixel identity.

The launch page now explains suitable uses, a four-step authoring/export workflow, realistic tradeoffs and new motion examples. [HUMAN-GUIDE.md](HUMAN-GUIDE.md) provides integration instructions; [RELEASE-v0.5.md](RELEASE-v0.5.md) records syntax and portability research. Historical token evidence remains labeled v0.4 and is not a new v0.5 benchmark.

## Motivation

AI-authored vector scenes become expensive and difficult to edit when they repeat geometry, long property names and complete object blocks. More useful abstraction can reduce that repeated context without replacing editable geometry with raster output or an opaque compressed payload.

Trolic explores three complementary approaches:

1. A compact but explicitly defined authoring syntax.
2. Structural reuse: constants, styles, prototypes, bounded repeats and batch data.
3. Host-maintained scene state: stable IDs, small atomic edits and short receipts rather than whole-scene rewrites.

Token efficiency and reliable model generation are separate questions. This project has measured the former; it has not yet benchmarked autonomous generation success, retries or total API spending.

## Architecture

```text
Readable source ───────────────┐
                             ├─ parse → validate → scene model → Lottie JSON
Agent source → bounded expand┘                             ├→ SVG frame
                                                           └→ experimental IR

AgentSession: process-local source + revision + inspection/edit/export interface
Studio: same compiler + Trolic SVG sampler + bundled Lottie-web SVG player
```

Key modules:

| Component | Purpose |
|---|---|
| `compiler.js` | Parsing, semantic checks, interpolation, exports and diagnostics |
| `geometry.js` | SVG-path subset normalization, exact curve conversion, Lottie paint items |
| `agent.js` | Compact grammar, bounded expansion, structural packing |
| `agent-tools.js` | In-memory transactional agent session |
| `cli.mjs` | Local validation and export commands |
| `bundle.py` | Standalone offline studio generation |
| `token-optimize.py` | Optional exact-token candidate-profile selection |
| `token-benchmark.py` | Reproducible source-token measurements |

No arbitrary user-authored JavaScript is evaluated. There is no included AI model, hosted generation API, persistent multi-tenant service or MCP server.

## Release progression

### v0.1 — Foundation
Original readable syntax, circles/rectangles, transform animation, easing, local CLI, SVG preview and Lottie export.

### v0.2 — Vector studio
Paths, gradients, strokes and transform hierarchy. Original botanical, koi and landscape fixtures. Independent Lottie-web testing exposed and helped correct animated scalar-keyframe encoding.

### v0.3 — Illustration and stability
Relative/smooth/compound paths, even-odd cutouts, gradient transparency and multi-keyframe motion. Orchard and Milo illustrate naturalistic shading and cartoon expression. More validation and safer CLI behavior. Independent comparison exposed fill/stroke ordering differences, corrected with an export regression test.

### v0.4 — Agent syntax
Compact declarations; constants/styles; single-node definitions; bounded repeats; irregular batches; heuristic packing and optional tokenizer-aware profile selection. Agent sessions support selected-field inspection, revision checks and atomic edits. Legacy readable source remains accepted.

## Measured token results

Source text counted with tiktoken 0.14.0. The distributed compact sources use the least o200k_base tokens among tested lossless packing profiles, not a globally optimal encoding.

| Encoding | Original | Distributed compact | Reduction |
|---|---:|---:|---:|
| o200k_base | 25,869 | 12,644 | 51.12% |
| cl100k_base | 25,825 | 12,689 | 50.87% |

Eight existing fixtures were measured. Every candidate accepted by the benchmark compiles to byte-for-byte identical Lottie JSON. No precision reduction or artwork removal is used.

Compared with whitespace-only trimming, compact sources still reduce o200k tokens by 46.23%. The short agent guide adds 446 tokens in each tested encoding. Guide overhead can outweigh savings for a small one-off scene. Chat formatting, tool schemas, reasoning and retries are excluded. Results are not universal across tokenizers or tasks.

A simple property edit costs five source tokens in the measured encodings; an illustrative receipt costs 17. Tool protocol, revision argument and conversation overhead are additional. Small-edit savings depend on a host actually retaining state outside model context.

Evidence: [raw measurements](artifacts/token-benchmark.json), [methodology](RELEASE-v0.4.md), [benchmark source](token-benchmark.py).

## Quality and test evidence

- 123 automated local tests covering parser/export behavior, curves, appearance validation, malformed inputs, CLI safety, lossless packing and atomic sessions.
- Eight scenes rendered in Lottie-web 5.13.0's SVG renderer at four timestamps each.
- 24 paired snapshots compared independent Lottie-web rendering to Trolic SVG sampling; largest full-image mean RGB difference approximately 0.078/255 for those fixtures.
- Offline tests cover source conversion, project import, retained valid previews after errors and renderer switching.
- A public CI workflow repeats unit and offline-browser tests for pushes and pull requests. Local passing evidence is not a claim that a remote CI run has already passed.

Full-image averages can conceal localized defects. These checks do not constitute Lottie-specification conformance, fuzzing completeness, accessibility certification, mobile-player testing or a production security assessment.

## Original illustration library

Orchard uses transparent gradient overlays and constrained vector shapes for depth; Milo uses consistent outlines and transform-keyframed character gestures. Aurelia, Tidal and Solstice cover repeated botanical geometry, animal silhouettes and layered environments. Sunwheel demonstrates a compact repeat recipe.

Illustrations are editable vector fixtures, not claims of physically based or photorealistic rendering. External scripts regenerate original examples; those scripts should not be mistaken for arbitrary scripting supported inside the language.

## Publication and preservation

The public GitHub repository contains the original compiler, tests, examples, methodology and a static launch site in `docs/`. GitHub Pages serves that site and a same-origin embedded studio. The website uses original SVG artwork, system fonts and local runtime assets, with no analytics or AI API calls. Normal web hosting still receives ordinary HTTP requests.

Prior v0.1–v0.3 archives are retained as release assets with SHA-256 records. No GitHub credential, local credential file, installed dependency tree, private app content, or downloaded Frolic source collection belongs in the public repository. The token used for authorized publication was handled outside the repository and should be revoked because it was exposed in chat.

## Current limitations

- Experimental IR; no formal long-term compatibility promise.
- No included model, cloud API, general SVG importer, arcs, text shaping, masks, arbitrary filters, path morphing, springs, trim-path animation, dotLottie or video export.
- Only Lottie-web SVG rendering has been exercised, not iOS/Android or every runtime.
- Repeated source can expand into many layers; compact authoring does not ensure compact output or cheap playback.
- Compiler budgets do not replace OS/process isolation for untrusted workloads.
- Agent sessions are process-local: no persistence, authentication, distributed coordination or tenant isolation.
- Token-count reductions do not establish model task accuracy or cost reductions for complete agent workflows.
- Name/trademark clearance has not been performed.

## Recommended next milestones

1. Benchmark multiple external agents on identical generation/editing tasks: valid-compilation rate, visual task success, input/output tokens and repairs.
2. Formalize a versioned AST/IR schema and property-level source spans.
3. Add measured springs, trim paths and carefully tested geometry imports.
4. Expand independent rendering checks to target mobile players and other renderers.
5. Add isolated workers, explicit budgets and service-level tests before any cloud API.
6. Evaluate source/output/runtime complexity together rather than optimizing source tokens alone.

## Research references and attribution

- [tiktoken](https://github.com/openai/tiktoken)
- [Hugging Face tokenization pipeline](https://huggingface.co/docs/tokenizers/main/en/pipeline)
- [W3C SVG path semantics](https://www.w3.org/TR/SVG2/paths.html)
- [W3C SVG painting](https://www.w3.org/TR/SVG2/painting.html)
- [Lottie shape documentation](https://lottiefiles.github.io/lottie-docs/shapes/)

Public Frolic examples informed earlier broad feature prioritization. This repository includes no Frolic compiler or original example-source collection and is not affiliated with LottieFiles. Original Trolic code and artwork are MIT-licensed; bundled third-party software retains its own license notices.
