# Trolic v1.0 · integration and delivery

Local release candidate. Publication has not occurred; GitHub authentication is
required. Public stable version remains v0.8 until the separate v0.9 publication
is completed. No npm registry publication is claimed.

## Included scope

Dependency-free ESM compiler SDK; typed core/editor/agent/player entry points;
framework-neutral, caller-injected Lottie-web helper; Studio delivery checks,
checked export, JSON report downloads and optional byte budgets; CLI preflight;
vanilla browser, Node and agent examples; documented compatibility policy.
Existing offline source editing, visual selection, history, recovery, timeline,
SVG/PNG/Lottie export and compact agent authoring remain available.

## Getting started

- Open `trolic-studio.html` offline; select an example and Compile scene.
- Open Delivery preflight for explicit profile checks and checked JSON export.
  Ordinary Lottie JSON export remains unprofiled and is labeled separately.
- `npm ci && npm test` runs unit/model/SDK/player tests.
- `npm run test:types && npm run test:package` checks declared types and a clean
  tarball consumer, including rejection of deliberately invalid TypeScript.
- `npm run test:release` runs core offline integration gates (requires installed
  Playwright Chromium). The CI workflow also runs actual Lottie-web integration,
  website tests, and the browser example with a local HTTP server.
- `npm pack` creates a local SDK tarball. Install that local file in your app;
  the package is not yet available from npm.
- Serve this repository to open `examples/v1/browser.html`. Run
  `node examples/v09/node.mjs` and `node examples/v1/agent.mjs` for Node examples.

## Validation

465 unit/model/SDK/player/CLI checks pass, plus 27 byte-identical prior scene
exports. Strict types, isolated packed-consumer positive/negative type tests,
actual Lottie-web SVG integration, offline Studio workflows, delivery UI and
desktop/mobile site interactions pass. A clean extracted release archive passes
`npm ci`, tests, type checks and both bundle/site rebuilds. These checks do not
certify all browsers, hostile input safety or all Lottie players. Detailed
results: `artifacts/v1-readiness.json`.

## Migration

No language syntax migration is required from v0.8 or v0.9. Existing direct
compiler imports work in a source checkout; packaged consumers should use the
four documented package entry points, not internal file paths. No CommonJS
entry point. Package version is 1.0.0; parsed IR remains version 0.8. Previously
published archives remain separate and unmodified.

See API.md, DELIVERY.md, STABILITY.md and HUMAN-GUIDE.md. A v1 number does not
remove the documented renderer, security, browser, motion or support limits.
