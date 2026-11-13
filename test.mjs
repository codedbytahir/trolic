import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {parse,compile,sample,lottie,svg} from './compiler.js';
const source=readFileSync('examples/bounce.trolic','utf8');let count=0;
function test(name,fn){fn();count++;console.log('PASS',name);}
test('parse original example',()=>assert.equal(parse(source).nodes.length,2));
test('deterministic compilation',()=>assert.equal(compile(source).output,compile(source).output));
test('position endpoint',()=>assert.ok(Math.abs(sample(parse(source).nodes[1],2).position[1]-340)<.001));
test('position start',()=>assert.ok(Math.abs(sample(parse(source).nodes[1],0).position[1]-100)<.001));
test('lottie scene dimensions',()=>assert.equal(lottie(parse(source)).w,640));
test('SVG export',()=>assert.match(svg(parse(source)),/<ellipse/));
test('unknown property rejected',()=>assert.throws(()=>parse(source.replace('fps:','typo:')),/Unknown property/));
test('invalid color rejected',()=>assert.throws(()=>parse(source.replace('#c4f76b','red')),/appearance/));
test('unclosed scene rejected',()=>assert.throws(()=>parse(source.slice(0,source.lastIndexOf('}'))),/Unclosed/));
test('time budget enforced',()=>assert.throws(()=>parse(source.replace('over 1.2s','over 9s')),/exceeds/));
test('duplicate IDs rejected',()=>assert.throws(()=>parse(source.replace('"orb"','"platform"')),/Duplicate/));
test('constant tracks folded',()=>{const s=parse(source.replace('[0.6, 0.6]','[1, 1]'));assert.equal(lottie(s).layers[0].ks.s.a,0);});
test('unknown target rejected',()=>assert.throws(()=>compile(source,'pdf'),/Unknown target/));
console.log(`${count} tests passed`);
