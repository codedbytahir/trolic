Trolic Agent Syntax v0.4. One instruction per line. No JS/eval.
canvas W H bg=#RRGGBB dur=SECONDS fps=60 name="Title"
circle|rect|path|group ID key=value ...
Fields: p position, s size, f fill, r rotation(deg), z scale, o opacity, d SVG-path, g gradient, ink stroke, sw stroke-width, round corner-radius, cap butt|round|square, join miter|round|bevel, rule nonzero|evenodd, parent GROUP.
Values: JSON, bare names/colors, $constant. Quote names with spaces. Defaults: p=[256,256], s=[80,80] circles/[120,80] rects, f=#6366f1, z=[1,1], o=1, r=0, ink=none. Set positions explicitly.
g=["l"|"r",[x1,y1],[x2,y2],[[offset,"#RRGGBB",optionalOpacity],...]]
t=[["p"|"r"|"z"|"o",[[seconds,value],...],optionalEasing]]
Easing: linear/ease_in/ease_out/ease_in_out(default).
let NAME VALUE
style NAME key=value ...
circle ID @STYLE ...
def NAME KIND key=value ...
use NAME ID overrides ...
repeat DEF PREFIX COUNT p=[x,y] step=[dx,dy] r=0 turn=ANGLE
batch DEF PREFIX cols=["p","s"] data=[[[10,20],[5,5]],[[30,40],[6,6]]]
Batch IDs are PREFIX0, PREFIX1...; optional ids=["a","b"].
edit ID key=value ...
Stable IDs. Group opacity stays 1. Paths: M L H V C S Q T Z, relative/absolute, compound allowed; no arcs. No text/masks/filters. 500 expanded nodes max. Validate, render, inspect. Reuse definitions; batch irregular detail; repeat regular patterns. Do not round coordinates unless visual loss is acceptable. For session edits, send only edit lines with expected revision; request a receipt, not the whole scene.

## v0.5 motion additions
Canvas: `canvas story w=540 dur=auto` or `canvas 16:9 w=960`. Times: numeric seconds or `500ms`, `2s`, `30f` strings (inside JSON, quote units). Node aliases: `a` pivot, `in`/`out` global visibility, `ts`/`te` trim range, `fx` effects. Effects: `[name,duration,delay?,repeat?,amount?]`. Names: fade_in, fade_out, pop, spring_in, pulse, float, shake, spin, draw. Float amount is `[dx,dy]`; draw requires unfilled single-contour stroke. No duplicate animated properties across fx/tracks. Tracks: `["p",[[0,[0,0]],["2s",[100,0]]],"ease_out",{"repeat":2,"yoyo":true}]`. Custom easing `[x1,y1,x2,y2]` and `step` supported. `repeat ... stagger=80ms` offsets definition motion. Read RELEASE-v0.5.md for limits and defaults.

## v0.6 expressive tracks
Additional `t` properties: `d` path string, `f` solid color, `ink` stroke color, `sw` stroke width, `s` shape dimensions, `round` rectangle radius. Morphs require a single contour and matching normalized vertices/closure. Color values are #RRGGBB; no fill=none or gradient fill animation. Positive shape dimensions; nonnegative width/radius. New appearance tracks reject overshooting easing. See RELEASE-v0.6.md.
