# v1 compatibility and support policy

v1 stabilizes the documented ESM entry points, accepted source syntax and
public SDK option names. Intended future policy: compatible fixes in patches,
additive features in minors, breaking documented API changes in majors.
This is a project commitment, not an uptime, support or correctness warranty.

- Supported baseline: Node 20+, ESM; modern Chromium is the automated browser
  target. Firefox, Safari, React Native and native Lottie players are not
  independently validated by this release.
- Core runtime has no third-party dependencies. The optional browser helper
  requires caller-supplied Lottie-web. The offline Studio bundles upstream
  Lottie-web with its license. No embedded AI or network service.
- Language and parsed IR retain `version: "0.8"`. The package is 1.0.0;
  `API_VERSION` is 1.0. Internal IR shape is still experimental. Keep source,
  not serialized IR, as the editable project format.
- Generated JSON bytes may change with bug fixes; semantic preservation is the
  intent. This release separately checks all 27 saved fixtures against v0.9.
- SVG strings are escaped by the compiler, but input validation and budgets are
  not a security sandbox. Isolate hostile workloads, impose time/memory limits,
  and do not expose a compilation endpoint without your own safeguards.
- Drafts use browser storage, not durable backups. Download source. Compiling
  source does not execute JavaScript; applications must still treat inputs and
  outputs as untrusted and apply their own hosting/CSP policy.
- Delivery profiles are project policies, not cross-platform certification.
  Test your actual files in your actual shipping player and target devices.

Known exclusions: text shaping, masks, arbitrary SVG import, general topology
morphing, filters, video/audio export, dotLottie packaging, collaboration and
multi-key timeline choreography. No generation-success, runtime-performance,
accessibility-conformance or universal visual-equivalence certification.

Report reproducible issues through the repository issue tracker. Include the
smallest source, package/player versions, expected behavior and actual result;
do not include private scenes or credentials. There is no promised response SLA.
