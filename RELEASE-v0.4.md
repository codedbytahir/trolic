# Trolic v0.4 — Agent Syntax & Token Efficiency

## Result

An optional compact authoring language now compiles through the same validated scene model and Lottie/SVG backends as readable Trolic. Existing readable sources continue to work.

Across the eight existing example scenes, the distributed agent sources use **51.12% fewer source tokens with o200k_base** and **50.87% fewer with cl100k_base**. Every distributed conversion produces **byte-for-byte identical Lottie JSON** to the original source. No coordinates were rounded, artwork removed, IDs renamed, or animation simplified to achieve these results.

This is a measured authoring-format improvement, not a claim about total API cost, model accuracy, reasoning-token usage or every provider's tokenizer.

## Preservation first

Before modifying the compiler, v0.1, v0.2 and v0.3 release archives were copied to `../trolic-releases/` and SHA-256 checksums recorded in its `manifest.json`. The pre-v0.4 workspace archive matched the previous v0.3 release byte-for-byte. Those archives are not rewritten by this build.

## Research and design choices

Primary references:
- [OpenAI tiktoken](https://github.com/openai/tiktoken): encoding text using named tokenizers rather than estimating from characters or word counts.
- [Hugging Face tokenization pipeline](https://huggingface.co/docs/tokenizers/main/en/pipeline): normalization, pre-tokenization, tokenizer-model and post-processing stages explain why changes in punctuation/spacing and vocabulary are tokenizer-dependent.

We used tiktoken **0.14.0**, testing both `cl100k_base` and `o200k_base`. The compiler itself does not depend on tiktoken.

Design conclusions:
1. Remove repeated structure before making syntax cryptic. Definitions, batch data and small edits give larger structural gains than merely shortening property names.
2. Use readable stable field aliases, not binary/base64/gzip text that a model would have to decode.
3. Retain an explicit schema and precise validation so savings do not come from ambiguous context-dependent syntax.
4. Treat token optimization as tokenizer-specific. A shorter string is not necessarily fewer tokens. Runtime packing uses heuristics; the optional offline optimizer evaluates multiple lossless profiles with the chosen tokenizer.
5. Keep the full scene outside the model context during edits where the host can maintain state. Return small receipts and inspect only needed IDs/fields.

## What was implemented

### Compact declarations

```text
canvas 640 480 bg=#10131d dur=3 name="Agent demo"
circle orb p=[100,200] s=[80,80] f=#c4f76b
edit orb f=#ff0000
```

The new `canvas` header identifies agent syntax. Readable `scene "Name" { ... }` sources are still supported. Values use JSON, simple bare names/colors or references; quoted strings and structured values may contain spaces.

Field aliases:

| Alias | Meaning | Alias | Meaning |
|---|---|---|---|
| p | position | s | size |
| f | fill | ink | stroke |
| r | rotation | z | scale |
| o | opacity | sw | stroke width |
| d | path | g | gradient |
| parent | parent group | round | corner radius |
| cap | line cap | join | line join |
| rule | fill rule | t | animation tracks |

Gradient: `g=["l" or "r", from, to, stops]`. Track tuples: `t=[[propertyAlias, [[seconds,value],...], optionalEasing], ...]`. Track property aliases are p/r/z/o. Existing geometry, opacity, parenting and motion limits still apply.

### Reuse

```text
canvas 640 640 bg=#111f2b dur=4
let gold #edcc88
style outline ink=#233845 sw=2
group flower p=[320,320]
def petal path p=[0,0] parent=flower d="M 0 0 Q -75 -130 0 -210 Q 75 -130 0 0 Z" f=$gold
repeat petal leaf- 16 p=[0,0] turn=22.5
circle center parent=flower p=[0,0] s=[60,60] f=$gold @outline
```

- `let`: immutable literal/structured constants. Use `$name` for a complete value, or `"$name"` inside JSON. A literal string beginning with `$` is escaped with an additional `$`.
- `style`: shared fields, applied with `@name`. Duplicate inline fields are rejected; do not use a style plus an inline duplicate of its field.
- `def` / `use`: a single-node prototype with per-instance overrides. Definitions are not arbitrary executable functions or subtree-prefab systems.
- `repeat`: bounded instances with linear position steps and rotation increments. No arbitrary expression language or eval.
- `batch`: column-oriented irregular instance data, useful for details such as pores, seeds and particles. Optional explicit IDs retain arbitrary original names.

```text
def dot circle parent=flower f=#674d30
batch dot seed- cols=["p","s","o"] data=[[[10,20],[3,3],0.5],[[30,40],[2,2],0.4]]
```

This creates seed-0 and seed-1. The source is small, but expanded layers still cost playback resources. Source compression does not guarantee smaller runtime output.

### Lossless conversion and profile selection

- `compact(source)` automatically extracts suitable definitions, batches, styles and constants using heuristics.
- `--target agent` converts readable source to the compact form.
- `--target readable` expands compact source for inspection.
- `token-optimize.py` counts tokens for multiple packing-option profiles, verifies exact Lottie export equivalence, and selects the least tokens **among those candidates** for one named encoding. It is not a globally optimal program synthesizer.
- Distributed `examples/agent/` fixtures select the best tested o200k_base profile. They may differ from the default heuristic packer's output.

## Measurements

Exact source text token counts for the distributed compact fixtures:

| Example | Original o200k tokens | Agent tokens | Reduction |
|---|---:|---:|---:|
| Aurelia | 8,056 | 2,119 | 73.70% |
| Orchard | 8,200 | 5,296 | 35.41% |
| Milo | 3,493 | 2,102 | 39.82% |
| Tidal | 3,286 | 1,744 | 46.93% |
| Solstice | 2,330 | 1,026 | 55.97% |
| First Light | 157 | 106 | 32.48% |
| Passing Signals | 138 | 94 | 31.88% |
| Color Reveal | 209 | 157 | 24.88% |
| **Total** | **25,869** | **12,644** | **51.12%** |

A whitespace-only legacy baseline totals 23,513 o200k tokens. Compact sources are **46.23% smaller in tokens even against that baseline**. Equivalent cl100k figures: 25,825 original; 23,469 whitespace-trimmed; 12,689 compact; 45.93% reduction against trimmed source.

The short AGENT-CARD.md costs **446 tokens** under each tested encoding. Counting that card once plus the entire compact corpus still reduces tokens by approximately 49.4% against the original corpus under o200k. This is not a full prompt comparison: no legacy guide, chat wrappers, tool schemas, reasoning or repair attempts were included. On a tiny one-off scene, sending the new guide can outweigh source savings. Reuse the schema across a session when possible.

No hosted or local model-generation success benchmark was run. Token count alone does not establish that models generate valid scenes more reliably. Other providers/tokenizers may produce different results.

## Small-edit agent protocol

`agent-tools.js` provides an **in-memory host library**, not a cloud service or MCP server:

```js
const session = new AgentSession(source);
session.inspect(['pear'], { fields: ['r'] });
session.edit('edit pear r=5', { revision: 0 });
// { ok: true, revision: 1, edited: 1, nodes: 124 }
```

The host retains source. Agents send only edit lines and the expected revision. Invalid edits leave source/revision unchanged. Stale revisions are rejected. Session edits should use literal property values; automatically packed constant/style names are implementation details and may change between revisions. Inspection is limited to 1–10 IDs and selected fields; path data is not returned by default. Exports/full source are available explicitly when the host needs them.

The illustrative edit `edit pear r=5` costs 5 source tokens and the example JSON receipt costs 17 tokens under both measured encodings. This excludes tool wrappers, schemas, revision-argument encoding and model context; it is not an end-to-end API cost measurement. Session state is process-local and is not authenticated, persisted or shared across machines.

## Validation and safety

- **123 automated tests:** the previous 75 plus 48 agent-syntax/session tests.
- Exact-export equivalence checks for all eight original scenes and each benchmark packing candidate.
- Offline studio tested for agent-source rendering, source-format conversion and the repeat recipe.
- Original independent Lottie-web rendering tests still pass for all eight scenes.
- Bounded expansion: 500 nodes, 1M input characters, approximately 900K expanded property characters, 100K per literal, cumulative constant-copy budget and nesting limits. These are compiler safeguards, not an untrusted-code/cloud sandbox.
- Unknown instructions/fields, prototype-sensitive keys, invalid templates, duplicate IDs/fields, malformed batches and invalid repeats are rejected.

New syntax expands to existing readable syntax and then passes the same semantic validation. Some expansion-budget diagnostics use line 1; parser and downstream mapped node errors generally identify the compact invocation line. The serialized IR remains experimental.

## Use

```sh
node cli.mjs examples/orchard.trolic --target agent --output orchard.agent.trolic
node cli.mjs examples/agent/milo.trolic --check
node cli.mjs examples/agent/milo.trolic --target readable --output milo.readable.trolic
node cli.mjs examples/agent/milo.trolic --target svg --time 3 --output milo.svg
pip install tiktoken==0.14.0
python token-optimize.py examples/orchard.trolic --encoding o200k_base --output orchard.optimized.trolic
npm test
python token-benchmark.py
```

First-time tokenizer installation/encoding acquisition can require network access. Normal compilation, the studio and agent session operations do not use an AI API.

Open `trolic-studio.html` offline for compact/readable conversion and all examples. `AGENT-CARD.md` is the short generation contract; `agent-test.mjs` is executable behavior documentation.
