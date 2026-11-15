# Trolic SDK · v1.0

Dependency-free ESM runtime; Node 20+ or a modern browser. No npm release yet.
The package is named `@codedbytahir/trolic`. Use `npm pack` in this checkout,
then install the resulting tarball in your application. TypeScript declarations
are included; React and Lottie-web are not runtime dependencies.

```js
import {compile, analyzeDelivery} from '@codedbytahir/trolic';
const source = 'canvas 100 100 dur=2\ncircle dot p=[50,50] s=[20,20] f=#abcdef';
const {output} = compile(source); // Lottie JSON string
console.log(analyzeDelivery(source, {profile:'portable-basic'}));
```

Core exports: parse, validate, compile, diagnose, svg, lottie, sample, compact,
readable, retime, reframe, createRenderer, deliveryProfiles, analyzeDelivery,
compileForProfile, TrolicError and TrolicDeliveryError. Compiler targets: lottie,
svg, ir, agent, readable. Times passed to SVG sampling are seconds.

Optional entry points:
- `/editor`: StudioDocument, atomic source patches and timeline utilities.
- `/agent`: AgentSession, revision-checked compact-source edits.
- `/player`: createTrolicPlayer; inject your own Lottie-web library.

```js
import {createTrolicPlayer} from '@codedbytahir/trolic/player';
const player = await createTrolicPlayer(container, {
  lottie, source, label:'Orbit animation', autoplay:true
});
await player.setSource(nextSource);
player.seek(0.5);
player.destroy(); // call when your component unmounts
```

Use a dedicated container with explicit dimensions. Creation waits for DOMLoaded.
Invalid source, profile failure, render failure and timeout reject the promise.
Updates stage a new renderer and retain the old one until the replacement is
ready. A superseded pending update rejects with AbortError: always handle update
promises. Reduced motion defaults to a static first frame; play does not override
that preference. Seek intentionally allows choosing a static frame. No network
or CDN is loaded by this helper. It is a browser helper, not an SSR renderer.

The experimental parsed IR keeps schema version 0.8 because language syntax is
unchanged. Package/API version 1.0 identifies these new integration facilities.
Types are authoring aids; runtime validation remains authoritative. Not a sandbox
for hostile inputs, not a performance or universal-player guarantee.
