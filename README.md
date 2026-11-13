# Trolic ✳

### Less context. More creation.

An experimental, local-first vector motion language for people and AI agents. Original illustrations, editable text source, a dependency-free JavaScript compiler, and a self-contained offline studio.

**[Explore the website](https://codedbytahir.github.io/trolic/)** · **[Launch the studio](https://codedbytahir.github.io/trolic/studio.html)** · **[Download v0.4](https://github.com/codedbytahir/trolic/releases/tag/v0.4.0)** · **[Project report](PROJECT-REPORT.md)**

![An original Trolic botanical vector illustration](docs/assets/aurelia.svg)

## What works today

- Readable syntax **and** compact agent syntax compile through the same validated scene model.
- Vector paths, compound contours, fills, strokes, transparent gradient shading, and transform groups.
- Multi-keyframe position, rotation, scale and opacity animation with four easing curves.
- Reusable constants, styles and single-node definitions; bounded repeats and column-based batches.
- Atomic, revision-checked agent edits with selected-field inspection and concise receipts.
- Lottie JSON, static SVG-frame and experimental IR exports.
- An offline HTML studio with independent Lottie-web playback and Trolic SVG sampling.

## Token savings—with the scope made explicit

Exact source-text counts across the eight existing fixtures, using tiktoken 0.14.0:

| Encoding | Original source | Compact source | Reduction |
|---|---:|---:|---:|
| `o200k_base` | 25,869 | 12,644 | **51.12%** |
| `cl100k_base` | 25,825 | 12,689 | **50.87%** |

Every distributed conversion produces byte-for-byte identical Lottie JSON. No coordinates were rounded or visual details removed. Against whitespace-trimmed legacy source, the o200k reduction is 46.23%.

These are **not total API-cost savings**. They exclude chat wrappers, tool schemas, reasoning and retries. The short agent guide adds 446 tokens. Small one-off scenes may not benefit after guide overhead. Actual model-generation success rates and other providers' tokenizers have not been benchmarked.

[Read the methodology](RELEASE-v0.4.md) · [Inspect the measured data](artifacts/token-benchmark.json) · [Read the agent card](AGENT-CARD.md)

## Try it locally

Requires Node 20+. The compiler/CLI need no npm packages.

```sh
git clone https://github.com/codedbytahir/trolic.git
cd trolic

node cli.mjs examples/agent/milo.trolic --check
node cli.mjs examples/agent/milo.trolic --target svg --time 3 --output milo.svg
node cli.mjs examples/orchard.trolic --target agent --output orchard.agent.trolic
npm test
```

Open `trolic-studio.html` directly in a browser for the offline studio. Or serve this directory to use the modular `index.html` developer playground:

```sh
python3 -m http.server 8001
```

The public launch site is in `docs/`. Its embedded studio is a publication copy with a same-origin source-loading bridge. Core development uses the root studio and compiler.

## A small scene

```text
canvas 640 480 bg=#10131d dur=3 name="Agent demo"
circle orb p=[100,200] s=[80,80] f=#c4f76b
def dot circle s=[12,12] f=#edcc88
repeat dot dot- 5 p=[200,350] step=[35,0]
edit orb r=5
```

For a real agent integration, the host can keep scene state and accept small edits:

```js
import { AgentSession } from './agent-tools.js';

const session = new AgentSession(source);
session.inspect(['orb'], { fields: ['p', 'r'] });
session.edit('edit orb r=5', { revision: 0 });
// { ok: true, revision: 1, edited: 1, nodes: ... }
```

This is an in-memory library—not an authenticated/persistent cloud API or MCP server.

## Original artwork

| Fixture | Study |
|---|---|
| Orchard | Naturalistic pear, translucent shading, leaf veins and skin details |
| Milo | Cartoon fox explorer, clear outlines and a waving arm |
| Aurelia | Layered botanical bloom with reusable geometry |
| Tidal | Koi fish, lily pads and water rings |
| Solstice | Paper-style mountains, river, trees and sun |
| Sunwheel | Compact procedural repeat recipe |

Sources are in `examples/`; compact equivalents are in `examples/agent/`. Gallery images are actual SVG exports, not raster mockups.

## Testing and development

**123 automated tests** pass locally: parser/export regressions, geometry, validation, CLI behavior, compact conversion, bounded expansion and agent-session transactions. Eight original scenes have been exercised in Lottie-web at four timestamps; 24 paired snapshots compared it with Trolic SVG sampling. Those tests are evidence for these fixtures, not full cross-platform conformance.

```sh
npm ci
npm test
npx playwright install --with-deps chromium
npm run test:offline
npm run test:agent-browser

# Optional exact-token profile selection and measurement
pip install -r requirements-token.txt
python token-optimize.py examples/orchard.trolic --encoding o200k_base --output orchard.optimized.trolic
python token-benchmark.py
```

First-time dependency/encoding acquisition requires network access. Normal compilation does not call an AI API.

## Documentation

- [Language/setup reference](LANGUAGE.md)
- [Short agent contract](AGENT-CARD.md)
- [Agent authoring guide](AI-AUTHORING.md)
- [v0.4 methodology and limitations](RELEASE-v0.4.md)
- [v0.3 illustration milestone](RELEASE-v0.3.md)
- [Historical feature research](RESEARCH.md)
- [Project report](PROJECT-REPORT.md)
- [Archived-version checksums](releases/previous-versions.json)

## Status and limitations

Trolic is **experimental**, not a production-certified renderer or photorealistic engine. It does not include a model, cloud API, arbitrary scripting, general SVG import, arcs, text shaping, masks, filters, springs, trim paths, dotLottie packaging or video export. The IR is not a stable public interchange contract. Only the Lottie-web SVG renderer has been exercised here; test your real target player before shipping.

Source compression does not reduce expanded layer count or guarantee faster playback. Compiler budgets are safeguards, not a security sandbox. Host untrusted compilation in isolated workers with input, memory and time limits.

## History and backups

v0.1 introduced the compiler; v0.2 added vector geometry and independent playback; v0.3 expanded illustration and stability; v0.4 adds compact agent authoring and measured token profiling. Original v0.1–v0.3 ZIP archives are attached to the v0.4 release as historical backups. Their checksums are recorded in `releases/previous-versions.json`. The v0.4 release tag does not imply those old archives share the current source tree.

## License and independence

Original Trolic code and artwork: [MIT](LICENSE). Bundled Lottie-web retains its upstream license in `vendor/LOTTIE-LICENSE.md`. This repository contains no Frolic source code or downloaded Frolic animation assets. Public examples informed broad feature research; Trolic is an independent implementation, not an official LottieFiles product or a claim of feature parity. Name/trademark clearance has not been established.

A project published by [codedbytahir](https://github.com/codedbytahir).
