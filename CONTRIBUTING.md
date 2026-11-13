# Contributing

Please open a focused issue or pull request with a reproducible fixture and expected behavior.

1. Use Node 20+; run `npm ci` for development tools.
2. Run `npm test` before proposing compiler changes.
3. Preserve readable-source compatibility unless a versioned change explicitly documents otherwise.
4. Verify compact conversions preserve output; do not hide lossy rounding inside token optimization.
5. For renderer changes, inspect real exported files in an independent player.
6. For token claims, report tokenizer version, encoding, exact corpus, guide/tool overhead assumptions and whether all outputs are equivalent.
7. Add original or permissively licensed fixtures only. Do not commit credentials, private assets, installed dependencies or Frolic source collections.

The launch website lives in `docs/`; its embedded studio has a small same-origin loading bridge. The root `trolic-studio.html` remains the standalone compiler demo. Changes to compiler source should be followed by `python3 bundle.py`; update the publication copy deliberately rather than assuming it regenerates automatically.
