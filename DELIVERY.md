# Explicit delivery preflight

`analyzeDelivery(source, options)` returns `{ok, profile, evidence, features,
stats, issues}`. Invalid source produces an error report. Invalid configuration
throws. `compileForProfile` returns the compiler result plus `report`, or throws
TrolicDeliveryError for a blocked delivery. No features are silently removed.

`lottie-web-svg` permits implemented features. Project renderer fixtures use
Lottie-web SVG; this is not certification of every animation or renderer.
`portable-basic` is an intentionally conservative project policy, NOT verified
Android/iOS compatibility: it rejects gradients, compound paths, path morphs,
trim, appearance animation, custom cubic easing and even-odd fills.

Default limits emit warnings: 100 nodes, 300 lowered tracks, 2,000 lowered keys,
250,000 UTF-8 JSON bytes, 30 seconds, 60 fps and 20,000 path vertices. Vertices
count source paths and morph key paths, not tessellated renderer complexity.
Explicit `budgets` turn corresponding limits into blocking errors:

```js
compileForProfile(source, {
  profile:'lottie-web-svg', budgets:{maxBytes:100000,maxNodes:50}
});
```

```sh
node cli.mjs examples/bounce.trolic --check --profile portable-basic
node cli.mjs examples/bounce.trolic --profile lottie-web-svg --budget-kb 100 --output animation.json
```

Budget flags require a profile and Lottie target. Reports are policy checks, not
benchmarks, device testing, visual equivalence proofs or security audits.
