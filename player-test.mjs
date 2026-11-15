import assert from 'node:assert/strict';
import {createTrolicPlayer} from './player.js';
const source='canvas 100 100 dur=2\ncircle dot p=[50,50] s=[20,20] f=#abcdef\n';
function fixture({loaded=true,reduced=false}={}){const listeners=new Set(),media={matches:reduced,addEventListener(n,f){listeners.add(f)},removeEventListener(n,f){listeners.delete(f)}};const document={defaultView:{matchMedia:()=>media},createElement(){return {style:{},setAttribute(){},remove(){container.children=container.children.filter(x=>x!==this)}}}};const container={nodeType:1,ownerDocument:document,children:[],appendChild(x){this.children.push(x)}};const items=[];const lottie={loadAnimation(options){const handlers=new Map();const item={options,isLoaded:loaded,playing:false,dead:false,frame:-1,addEventListener(n,f){handlers.set(n,f)},removeEventListener(n){handlers.delete(n)},emit(n){handlers.get(n)?.()},play(){this.playing=true},pause(){this.playing=false},goToAndStop(f){this.frame=f;this.playing=false},setSpeed(v){this.speed=v},destroy(){this.dead=true}};items.push(item);return item;}};return {container,lottie,items,media,listeners};}
let checks=0;const check=f=>{f();checks++};
const f=fixture();const p=await createTrolicPlayer(f.container,{lottie:f.lottie,source});
check(()=>assert.equal(p.duration,2));check(()=>assert.equal(f.items[0].playing,true));p.pause();check(()=>assert.equal(f.items[0].playing,false));p.seek(1);check(()=>assert.equal(f.items[0].frame,60));p.setSpeed(2);check(()=>assert.equal(f.items[0].speed,2));
await assert.rejects(p.setSource('bad'));checks++;check(()=>assert.equal(f.items[0].dead,false));check(()=>assert.equal(f.container.children.length,1));
await p.setSource(source);check(()=>assert.equal(f.items[0].dead,true));check(()=>assert.equal(f.container.children.length,1));
f.media.matches=true;for(const cb of f.listeners)cb();p.play();check(()=>assert.equal(f.items[1].frame,0));check(()=>assert.equal(f.items[1].playing,false));
for(const value of [-1,NaN,Infinity]){check(()=>assert.throws(()=>p.seek(value)));check(()=>assert.throws(()=>p.setSpeed(value)));}
p.destroy();p.destroy();check(()=>assert.equal(f.container.children.length,0));check(()=>assert.equal(f.listeners.size,0));check(()=>assert.throws(()=>p.play()));
const g=fixture();const q=await createTrolicPlayer(g.container,{lottie:g.lottie,source});g.lottie.loadAnimation=((original)=>opts=>{const item=original(opts);item.isLoaded=false;return item;})(g.lottie.loadAnimation);
const first=q.setSource(source);const rejected=assert.rejects(first,{name:'AbortError'});const second=q.setSource(source);await rejected;checks++;g.items.at(-1).emit('DOMLoaded');await second;check(()=>assert.equal(g.container.children.length,1));
const pending=q.setSource(source);const abort=assert.rejects(pending,{name:'AbortError'});q.destroy();await abort;checks++;check(()=>assert.equal(g.container.children.length,0));
const h=fixture({loaded:false});const failure=createTrolicPlayer(h.container,{lottie:h.lottie,source});h.items[0].emit('data_failed');await assert.rejects(failure,/failed/);checks++;check(()=>assert.equal(h.container.children.length,0));check(()=>assert.equal(h.listeners.size,0));
const t=fixture({loaded:false});await assert.rejects(createTrolicPlayer(t.container,{lottie:t.lottie,source,loadingTimeoutMs:100}),/Timed out/);checks++;check(()=>assert.equal(t.container.children.length,0));
console.log(`${checks} player lifecycle checks passed`);
