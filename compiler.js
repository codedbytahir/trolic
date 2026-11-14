import {timeSeconds,curveFor,motionProgress,lowerTrack,lowerEffects} from './motion.js';
import {expandAgent,packScene} from './agent.js';
import {pathContours,shapeItems} from './geometry.js';
// Trolic v0.5: independent, dependency-free compiler shared by browser and Node.
export class TrolicError extends Error { constructor(message,line=1){super(message);this.line=line;this.code='TROLIC_INVALID_SOURCE';} }
const locations=new WeakMap(),preparedTracks=new WeakMap(),visibleWindows=new WeakMap();
const tracksFor=n=>preparedTracks.get(n)||n.tracks;
function parseLegacy(source){
 if(typeof source!=='string'||source.length>1000000)throw new TrolicError('Source exceeds 1 million character budget');
 const lines=source.split(/\r?\n/), scene={version:'0.5',name:'Untitled',size:[512,512],fps:60,duration:2,background:'transparent',nodes:[]};let current=null,depth=0,header=false;
 for(let i=0;i<lines.length;i++){
  const s=lines[i].trim();if(!s||s.startsWith('//'))continue;
  const fail=m=>{throw new TrolicError(m,i+1)};
  if(!header){const m=s.match(/^scene\s+("(?:[^"\\]|\\.)*")\s*\{$/);if(!m)fail('Expected scene "Name" {');try{scene.name=JSON.parse(m[1]);}catch{fail('Invalid JSON scene name');}locations.set(scene,{line:i+1,properties:new Set()});header=true;depth=1;continue;}
  if(s==='}'){if(depth===2){current=null;depth=1;}else if(depth===1)depth=0;else fail('Unexpected closing brace');continue;}
  if(depth===0)fail('Unexpected content after scene');
  const shape=s.match(/^(circle|rect|path|group)\s+("(?:[^"\\]|\\.)*")\s*\{$/);
  if(shape){if(depth!==1)fail('Use parent references instead of nested declarations');let nodeId;try{nodeId=JSON.parse(shape[2]);}catch{fail('Invalid JSON node ID');}current={kind:shape[1],parent:null,id:nodeId,position:[256,256],size:shape[1]==='circle'?[80,80]:[120,80],fill:'#6366f1',radius:0,stroke:'none',stroke_width:1,line_cap:'round',line_join:'round',fill_rule:'nonzero',gradient:null,path:'',opacity:1,scale:[1,1],rotation:0,anchor:[0,0],effects:[],trim_start:0,trim_end:1,in_time:0,out_time:null,tracks:[]};locations.set(current,{line:i+1,properties:new Set()});scene.nodes.push(current);if(scene.nodes.length>500)fail('Maximum 500 nodes');depth=2;continue;}
  const track=s.match(/^track\s+(\w+)\s+(.+)$/);
  if(track){if(!current)fail('Track must be inside a node');let config;try{config=JSON.parse(track[2]);}catch{fail('Track config must be JSON');}if(!config||typeof config!=='object'||Array.isArray(config)||Object.keys(config).some(k=>!['frames','ease','options'].includes(k)))fail('Track config: frames, ease, options');current.tracks.push({property:track[1],ease:'ease_in_out',...config});continue;}
  const sequence=s.match(/^keyframes\s+(position|scale|opacity|rotation|trim_end)\s+(.+?)(?:\s+(linear|ease_in|ease_out|ease_in_out|step))?$/);
  if(sequence){if(!current)fail('Keyframes must be inside a node');let frames;try{frames=JSON.parse(sequence[2]);}catch{fail('Keyframes must be JSON [[seconds,value], ...]');}current.tracks.push({property:sequence[1],frames,ease:sequence[3]||'ease_in_out'});continue;}
  const anim=s.match(/^animate\s+(position|scale|opacity|rotation|trim_end)\s+(.+?)\s*->\s*(.+?)\s+over\s+([\d.]+)s(?:\s+delay\s+([\d.]+)s)?(?:\s+(linear|ease_in|ease_out|ease_in_out|step))?$/);
  if(anim){if(!current)fail('Animation must be inside a shape');try{current.tracks.push({property:anim[1],from:JSON.parse(anim[2]),to:JSON.parse(anim[3]),duration:Number(anim[4]),delay:Number(anim[5]||0),ease:anim[6]||'ease_in_out'});}catch{fail('Animation values must be JSON numbers or arrays');}continue;}
  const prop=s.match(/^(\w+):\s*(.+)$/);if(!prop)fail('Expected property: JSON-value, shape block, or animate statement');
  const allowed=current?['parent','position','size','fill','radius','stroke','stroke_width','line_cap','line_join','fill_rule','gradient','path','opacity','scale','rotation','anchor','effects','trim_start','trim_end','in_time','out_time']:['size','fps','duration','background'];if(!allowed.includes(prop[1]))fail(`Unknown property "${prop[1]}"`);
  const location=locations.get(current||scene);if(location.properties.has(prop[1]))fail(`Duplicate property: ${prop[1]}`);location.properties.add(prop[1]);
  try{(current||scene)[prop[1]]=JSON.parse(prop[2]);}catch{fail('Property value must be valid JSON (quote colors)');}
 }
 if(!header||depth!==0)throw new TrolicError('Unclosed or missing scene block',lines.length);
 return validate(scene);
}
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const vector=x=>Array.isArray(x)&&x.length===2&&x.every(v=>finite(v)&&Math.abs(v)<=1e7);
const color=x=>typeof x==='string'&&/^#[\da-f]{6}$/i.test(x);
export function validate(s){
 let context=s;const bad=m=>{throw new TrolicError(m,locations.get(context)?.line||1)};
 if(!s||typeof s!=='object'||!Array.isArray(s.nodes))bad('Invalid scene IR');
 if(!vector(s.size)||s.size.some(x=>x<=0||x>8192))bad('Scene size must be two positive numbers up to 8192');
 if(!finite(s.fps)||s.fps<1||s.fps>120)bad('fps must be 1..120');
 const autoDuration=s.duration==='auto';let furthest=0;try{if(!autoDuration)s.duration=timeSeconds(s.duration,s.fps);}catch(e){bad(e.message)}
 if(!autoDuration&&(!finite(s.duration)||s.duration<=0||s.duration>120))bad('duration must be >0 and <=120 seconds');
 if(s.background!=='transparent'&&!color(s.background))bad('background must be transparent or #RRGGBB');
 if(s.nodes.length>500)bad('Maximum 500 shapes');const ids=new Set();
 for(const n of s.nodes){context=n;if(!n||!['circle','rect','path','group'].includes(n.kind)||typeof n.id!=='string'||!n.id.length||n.id.length>128||!Array.isArray(n.tracks))bad('Invalid node IR');if(ids.has(n.id))bad(`Duplicate shape ID: ${n.id}`);ids.add(n.id);
 for(const p of ['position','size','scale','anchor'])if(!vector(n[p]))bad(`${n.id}.${p} must be a two-number vector`);
 if(n.size.some(x=>x<=0)||(n.fill!=='none'&&!color(n.fill))||!finite(n.radius)||n.radius<0||!finite(n.rotation)||!finite(n.opacity)||n.opacity<0||n.opacity>1)bad(`Invalid geometry or appearance on ${n.id}`);
 if(n.stroke!=='none'&&!color(n.stroke))bad(`Invalid stroke on ${n.id}`);
 if(!finite(n.stroke_width)||n.stroke_width<0||!['round','butt','square'].includes(n.line_cap))bad(`Invalid stroke geometry on ${n.id}`);
 if(n.kind==='path'){try{pathContours(n.path)}catch(e){bad(`${n.id}: ${e.message}`)}}
 if(!['nonzero','evenodd'].includes(n.fill_rule)||!['miter','round','bevel'].includes(n.line_join))bad('Invalid fill rule or line join');
 if(n.gradient!==null){const g=n.gradient;if(!g||typeof g!=='object')bad('Gradient must be an object or null');if(!['linear','radial'].includes(g.type)||!vector(g.from)||!vector(g.to)||g.from.every((x,i)=>x===g.to[i])||!Array.isArray(g.stops)||g.stops.length<2||g.stops.length>16)bad(`Invalid gradient on ${n.id}`);let last=-1;for(const stop of g.stops){if(!Array.isArray(stop)||(stop.length!==2&&stop.length!==3)||!finite(stop[0])||stop[0]<0||stop[0]>1||stop[0]<last||!color(stop[1])||(stop.length===3&&(!finite(stop[2])||stop[2]<0||stop[2]>1)))bad(`Invalid gradient stops on ${n.id}`);last=stop[0];}if(g.stops[0][0]!==0||g.stops.at(-1)[0]!==1)bad('Gradient stops must span 0 to 1');}
 let tracks;try{tracks=[...n.tracks.map(t=>lowerTrack(t,s.fps)),...lowerEffects(n,s.fps)];}catch(e){bad(e.message)}preparedTracks.set(n,tracks);
 if(n.kind==='group'&&(n.opacity!==1||tracks.some(t=>t.property==='opacity')))bad('Group opacity is not portable; animate child opacity instead');
 if(!finite(n.trim_start)||!finite(n.trim_end)||n.trim_start<0||n.trim_end>1||n.trim_start>n.trim_end)bad('Trim range must satisfy 0 <= start <= end <= 1');
 const props=new Set();for(const t of tracks){if(props.has(t.property))bad(`Only one track per property: ${n.id}.${t.property}`);props.add(t.property);
 if(!['position','scale','opacity','rotation','trim_end'].includes(t.property))bad('Invalid animation property');
 const frames=t.frames;if(frames.length>256)bad('Expanded track exceeds 256 keys');
 const check=['position','scale'].includes(t.property)?vector:finite;
 for(const frame of frames){if(!check(frame[1]))bad(`Invalid keyframe value: ${n.id}.${t.property}`);if(['opacity','trim_end'].includes(t.property)&&(frame[1]<0||frame[1]>1))bad('Opacity/trim keyframes must stay between 0 and 1');}
 if(['opacity','trim_end'].includes(t.property)){for(const e of t.segmentEases){const c=curveFor(e);if(c&&(c[1]<0||c[1]>1||c[3]<0||c[3]>1))bad('Overshooting easing is not supported for opacity or trim');}}
 if(t.property==='trim_end'&&frames.some(f=>f[1]<n.trim_start))bad('Trim end must not precede static trim start');furthest=Math.max(furthest,frames.at(-1)[0]);
 }
 const trimming=n.trim_start!==0||n.trim_end!==1||props.has('trim_end');
 if(trimming&&(n.kind==='group'||n.fill!=='none'||n.gradient!==null||n.stroke==='none'||n.stroke_width<=0))bad('Trim requires a stroked, unfilled shape');
 if(trimming&&n.kind==='path'&&pathContours(n.path).length!==1)bad('Trim supports a single contour per node');
 try{const start=timeSeconds(n.in_time,s.fps);if(start<0)bad('Layer in time must be nonnegative');if(n.out_time!==null){const end=timeSeconds(n.out_time,s.fps);if(end<=start)bad('Layer out time must be after in time');furthest=Math.max(furthest,end);}furthest=Math.max(furthest,start);}catch(e){bad(e.message)}
 }
 if(autoDuration)s.duration=furthest>0?furthest:2;
 if(s.duration>120)bad('Expanded scene exceeds 120 seconds');
 for(const n of s.nodes){context=n;for(const t of tracksFor(n))if(t.frames.at(-1)[0]>s.duration+1e-9)bad(`Track exceeds scene duration: ${n.id}.${t.property}`);}

 const byId=new Map(s.nodes.map(n=>[n.id,n]));
 for(const n of s.nodes){context=n;const seen=new Set([n.id]);let p=n.parent;while(p!==null){if(typeof p!=='string'||!byId.has(p))bad(`Unknown parent on ${n.id}`);if(seen.has(p))bad(`Parent cycle on ${n.id}`);if(byId.get(p).kind!=='group')bad('Parent must reference a group');seen.add(p);p=byId.get(p).parent;if(seen.size>33)bad('Maximum hierarchy depth is 32');}}
 for(const n of s.nodes){context=n;let start=timeSeconds(n.in_time,s.fps),end=n.out_time===null?s.duration:timeSeconds(n.out_time,s.fps);if(start>=s.duration||end>s.duration+1e-9)bad('Layer visibility must fit scene duration');let parent=n.parent;while(parent!==null){const p=byId.get(parent);start=Math.max(start,timeSeconds(p.in_time,s.fps));end=Math.min(end,p.out_time===null?s.duration:timeSeconds(p.out_time,s.fps));parent=p.parent;}visibleWindows.set(n,[start,end]);}
 return s;
}
const curves={linear:[0,0,1,1],ease_in:[.42,0,1,1],ease_out:[0,0,.58,1],ease_in_out:[.42,0,.58,1]};
const ease=motionProgress;
const framesOf=t=>Object.hasOwn(t,'frames')?t.frames:[[t.delay,t.from],[t.delay+t.duration,t.to]];
export function sample(node,time){const result={...node};for(const t of tracksFor(node)){const f=t.frames;if(time<=f[0][0]){result[t.property]=f[0][1];continue;}if(time>=f.at(-1)[0]){result[t.property]=f.at(-1)[1];continue;}let index=0;while(f[index+1][0]<time)index++;const [start,from]=f[index],[end,to]=f[index+1];const p=ease((time-start)/(end-start),t.segmentEases?.[index]??t.ease);result[t.property]=Array.isArray(from)?from.map((x,i)=>x+(to[i]-x)*p):from+(to-from)*p;}return result;}

const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
export function svg(scene,time=0){validate(scene);return svgFrame(scene,time);}
function svgFrame(scene,time=0){if(!finite(time))throw new TrolicError('Frame time must be finite');const [w,h]=scene.size;let defs='';
 function render(node){const window=visibleWindows.get(node);if(window&&(time<window[0]||time>=window[1]))return '';const n=sample(node,time);const trimming=n.trim_start!==0||n.trim_end!==1||tracksFor(node).some(t=>t.property==='trim_end');if(trimming&&n.trim_end<=n.trim_start)return '';const trimAttrs=trimming?` pathLength="1" stroke-dasharray="${n.trim_end-n.trim_start} ${1-(n.trim_end-n.trim_start)}" stroke-dashoffset="${-n.trim_start}"`:'';let paint=n.fill;
 if(n.gradient){const g=n.gradient,id=`trolic-gradient-${scene.nodes.indexOf(node)}`,stops=g.stops.map(([o,c,a=1])=>`<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('');defs+=g.type==='linear'?`<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${g.from[0]}" y1="${g.from[1]}" x2="${g.to[0]}" y2="${g.to[1]}">${stops}</linearGradient>`:`<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${g.from[0]}" cy="${g.from[1]}" r="${Math.hypot(g.to[0]-g.from[0],g.to[1]-g.from[1])}">${stops}</radialGradient>`;paint=`url(#${id})`;}
 const geometry=n.kind==='group'?scene.nodes.filter(c=>c.parent===n.id).map(render).join(''):n.kind==='path'?`<path d="${escape(n.path)}"${trimAttrs}/>`:n.kind==='circle'?`<ellipse rx="${n.size[0]/2}" ry="${n.size[1]/2}"${trimAttrs}/>`:`<rect x="${-n.size[0]/2}" y="${-n.size[1]/2}" width="${n.size[0]}" height="${n.size[1]}" rx="${n.radius}"${trimAttrs}/>`;
 return `<g id="${escape(n.id)}" fill="${paint}" stroke="${n.stroke}" stroke-width="${n.stroke_width}" stroke-linecap="${n.line_cap}" stroke-linejoin="${n.line_join}" fill-rule="${n.fill_rule}" opacity="${n.opacity}" transform="translate(${n.position.join(' ')}) rotate(${n.rotation}) scale(${n.scale.join(' ')}) translate(${-n.anchor[0]} ${-n.anchor[1]})">${geometry}</g>`;}
 const content=(scene.background==='transparent'?'':`<rect width="${w}" height="${h}" fill="${scene.background}"/>`)+scene.nodes.filter(n=>n.parent===null).map(render).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${defs}</defs>${content}</svg>`;
}
export function createRenderer(scene){const snapshot=JSON.parse(JSON.stringify(scene));validate(snapshot);return {duration:snapshot.duration,size:[...snapshot.size],frame:time=>svgFrame(snapshot,time)};}

const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
export function lottie(scene){validate(scene);const fps=scene.fps,op=scene.duration*fps;
 const order=[];function visit(n){order.push(n.id);if(n.kind==='group')scene.nodes.filter(c=>c.parent===n.id).forEach(visit);}scene.nodes.filter(n=>n.parent===null).forEach(visit);
 function property(n,p,convert=x=>Array.isArray(x)?x:[x]){const t=tracksFor(n).find(t=>t.property===p);if(!t)return {a:0,k:convert(n[p])};const frames=t.frames;if(frames.every(f=>JSON.stringify(f[1])===JSON.stringify(frames[0][1])))return {a:0,k:convert(frames[0][1])};const key=x=>{const v=convert(x);return Array.isArray(v)?v:[v]};return {a:1,k:frames.map((f,index)=>{const last=index===frames.length-1,curve=last?null:curveFor(t.segmentEases?.[index]??t.ease);return {t:f[0]*fps,s:key(f[1]),...(!last?(curve?{e:key(frames[index+1][1]),o:{x:[curve[0]],y:[curve[1]]},i:{x:[curve[2]],y:[curve[3]]}}:{h:1,e:key(frames[index+1][1])}):{})}})};}

 const layers=scene.nodes.map((n,index)=>({ddd:0,ind:index+1,ty:n.kind==='group'?3:4,...(n.parent!==null?{parent:scene.nodes.findIndex(p=>p.id===n.parent)+1}:{}),nm:n.id,sr:1,ks:{o:property(n,'opacity',x=>x*100),r:property(n,'rotation',x=>x),p:property(n,'position',x=>[...x,0]),a:{a:0,k:[...n.anchor,0]},s:property(n,'scale',x=>[x[0]*100,x[1]*100,100])},ao:0,...(n.kind==='group'?{}:{shapes:shapeItems(n,p=>property(n,p,x=>x*100),n.trim_start!==0||n.trim_end!==1||tracksFor(n).some(t=>t.property==='trim_end'))}),ip:Math.max(0,(visibleWindows.get(n)?.[0]??0)*fps),op:Math.max((visibleWindows.get(n)?.[0]??0),(visibleWindows.get(n)?.[1]??scene.duration))*fps,st:0,bm:0})).sort((a,b)=>order.indexOf(b.nm)-order.indexOf(a.nm));
 if(scene.background!=='transparent')layers.push({ddd:0,ind:layers.length+1,ty:1,nm:'Background',sw:scene.size[0],sh:scene.size[1],sc:scene.background,ks:{o:{a:0,k:100},r:{a:0,k:0},p:{a:0,k:[0,0,0]},a:{a:0,k:[0,0,0]},s:{a:0,k:[100,100,100]}},ip:0,op,st:0});
 return {v:'5.12.2',fr:fps,ip:0,op,w:scene.size[0],h:scene.size[1],nm:scene.name,ddd:0,assets:[],layers};
}
export function compile(source,target='lottie',time=0){const scene=parse(source);if(!['lottie','svg','ir','agent','readable'].includes(target))throw new TrolicError(`Unknown target: ${target}`);const output=target==='agent'?packScene(scene):target==='readable'?readable(source):target==='svg'?svg(scene,time):JSON.stringify(target==='ir'?scene:lottie(scene));return {output,scene,stats:{shapes:scene.nodes.length,tracks:scene.nodes.reduce((a,n)=>a+tracksFor(n).length,0),sourceTracks:scene.nodes.reduce((a,n)=>a+n.tracks.length,0),keyframes:scene.nodes.reduce((a,n)=>a+tracksFor(n).reduce((v,t)=>v+t.frames.length,0),0),bytes:new TextEncoder().encode(output).length}};}

// Non-throwing boundary for editors and future AI tools; does not execute generated code.
export function diagnose(source,target='lottie'){try{const r=compile(source,target);return {ok:true,diagnostics:[],stats:r.stats}}catch(e){return {ok:false,diagnostics:[{code:e.code||'TROLIC_INTERNAL_ERROR',line:e.line||1,severity:'error',message:e.message}]}}}

export function parse(source){if(typeof source==='string'&&/^\s*(?:\/\/[^\n]*\n\s*)*canvas\s/.test(source)){const expanded=expandAgent(source);try{return parseLegacy(expanded.source)}catch(e){if(e.line)e.line=expanded.map[e.line-1]||e.line;throw e;}}return parseLegacy(source);}
export function compact(source,options={}){return packScene(parse(source),options);}

export function readable(source){parse(source);return /^\s*(?:\/\/[^\n]*\n\s*)*canvas\s/.test(source)?expandAgent(source).source:source;}

// Proportional timeline retiming; source remains editable and effects remain compact.
export function retime(source,duration){const scene=parse(source),next=timeSeconds(duration,scene.fps);if(!Number.isFinite(next)||next<=0||next>120)throw new TrolicError('Duration must be >0 and <=120 seconds');const factor=next/scene.duration;
 for(const n of scene.nodes){n.in_time=timeSeconds(n.in_time,scene.fps)*factor;if(n.out_time!==null)n.out_time=timeSeconds(n.out_time,scene.fps)*factor;
  n.effects=n.effects.map(f=>{const fx=[...f];fx[1]=timeSeconds(fx[1],scene.fps)*factor;fx[2]=timeSeconds(fx[2]??0,scene.fps)*factor;return fx;});
  for(const t of n.tracks){if(Object.hasOwn(t,'frames'))t.frames=t.frames.map(([time,v])=>[timeSeconds(time,scene.fps)*factor,v]);else t.duration=timeSeconds(t.duration,scene.fps)*factor;
   if(t.delay!==undefined)t.delay=timeSeconds(t.delay,scene.fps)*factor;if(t.options?.delay!==undefined)t.options.delay=timeSeconds(t.options.delay,scene.fps)*factor;}
 }scene.duration=next;validate(scene);return packScene(scene);}
export function reframe(source,size,{fit='contain'}={}){const scene=parse(source);if(!Array.isArray(size)||size.length!==2||size.some(x=>!Number.isFinite(x)||x<=0||x>8192)||!['contain','cover'].includes(fit))throw new TrolicError('Invalid frame size or fit');if(scene.nodes.length>=500)throw new TrolicError('Reframing needs one available group slot');const factor=Math[fit==='contain'?'min':'max'](size[0]/scene.size[0],size[1]/scene.size[1]);let id='_frame',i=0;while(scene.nodes.some(n=>n.id===id))id='_frame'+(++i);
 const wrapper=parse('canvas 1 1\ngroup frame p=[0,0]').nodes[0];wrapper.id=id;wrapper.position=[(size[0]-scene.size[0]*factor)/2,(size[1]-scene.size[1]*factor)/2];wrapper.scale=[factor,factor];for(const n of scene.nodes)if(n.parent===null)n.parent=id;scene.nodes.unshift(wrapper);scene.size=[...size];validate(scene);return packScene(scene);}
