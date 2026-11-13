> For token-efficient v0.4 authoring, start with AGENT-CARD.md and RELEASE-v0.4.md. This longer guide documents the still-supported readable syntax.

# Authoring Trolic v0.3 with an external AI assistant

Trolic does not embed a model or contact an AI provider. You can give the following brief, README and original examples to your preferred assistant, then validate its output locally.

## Suggested instruction

Produce original editable Trolic v0.3 source, not raw SVG markup, JavaScript, raster imagery, or JSON pretending to be Trolic.

Use one scene block with one statement per line. Properties take JSON values. Declare circle, rect, path and group nodes at scene scope. IDs must be unique; parent references point only to groups. Set every node's position explicitly; a node's coordinates are local to its parent. Shapes use centered geometry; path coordinates are literal local coordinates. Later siblings paint on top.

For naturalistic vector work: design a coherent silhouette, choose a light direction, layer constrained highlights/shadows on the same silhouette, add a contact shadow and restrained details. Use gradient stop opacity for fading overlays. Gradients are not masks or lighting simulation. Keep details inside the silhouette yourself: clipping is not implemented.

For cartoon work: use clear silhouettes, consistent stroke widths, intentional expressive facial features and manageable transform groups. Use a group placed at the joint/pivot to animate a limb. Keep group opacity equal to 1. Use matching first/last keyframe values for a position-continuous loop; this does not automatically ensure velocity continuity.

Paths support M/L/H/V/C/S/Q/T/Z in both cases and multiple contours. No arcs, arbitrary SVG import, filters, clipping masks, text, expressions or scripting. Use fill_rule "evenodd" for cutouts. Use gradients rather than unsupported blur effects. Stop opacity is an optional third element in [offset,"#RRGGBB",opacity].

Motion: `animate position [0,0] -> [20,0] over 1s ease_out` or `keyframes rotation [[0,-5],[1,5],[2,-5]] ease_in_out`. Only position, scale, rotation and opacity; one track per property. Explicit scene duration must cover all keys. Easing applies per segment. No spring syntax.

Do not claim code is correct without compiling it. Work in a validate → render → inspect → patch loop. Preserve IDs while editing. Prefer a small number of meaningful paths to hundreds of unnecessary layers. Do not introduce features absent from the supported grammar.

## Validation loop

```sh
node cli.mjs illustration.trolic --check
node cli.mjs illustration.trolic --target svg --time 1 --output illustration.svg
node cli.mjs illustration.trolic --target lottie --output illustration.json
```

In the studio, inspect both Trolic SVG and independent Lottie-web playback. Final delivery should include editable source plus exported files. Check the real production target player as well; local validation alone does not certify visual quality, accessibility or platform compatibility.
