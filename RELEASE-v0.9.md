# v0.9 · local SDK preview

Public stable release remains v0.8. No v0.9 push, release or npm publication.

Implemented locally:
- Dependency-free ESM package with core, editor, player and agent subpaths.
- TypeScript declarations for all four entry points.
- Caller-injected Lottie-web browser helper: atomic replacement, lifecycle
  cleanup, cancellation, timeout, reduced motion and accessible labels.
- Feature inventory and explicit delivery policies/budgets, also exposed in CLI.
- Human API/delivery guides and a runnable Node integration example.

Validation performed: existing 378 checks plus 46 SDK checks and 30 player
lifecycle checks; strict TypeScript declaration compilation; actual Lottie-web
SVG browser integration; clean tarball consumer imports of all entry points
and installed CLI version check. These do not certify universal compatibility.

Still before a polished v0.9 release: publishable website/Studio versioning,
more integration examples and consumer type fixtures, reproducible full release
archive, and full site/offline visual regression. Current language IR remains
0.8 because no syntax change was introduced. Previous releases are preserved.
