// Trolic v0.7 editor model: validated, atomic source edits; no renderer or DOM dependency.
import {parse,compile,sample} from './compiler.js';
import {aliases} from './agent.js';
import {timeSeconds} from './motion.js';
export const editableProperties=['position','size','rotation','scale','anchor','opacity','fill','stroke','stroke_width','radius'];
const studioAliases={position:'p',size:'s',rotation:'r',scale:'z',anchor:'a',opacity:'o',fill:'f',stroke:'ink',stroke_width:'sw',radius:'round'};
export const effectProperties={fade_in:'opacity',fade_out:'opacity',pop:'scale',spring_in:'scale',pulse:'scale',float:'position',shake:'position',spin:'rotation',draw:'trim_end'};
export function propertyState(node,property){
 if(!editableProperties.includes(property))return {editable:false,reason:'Not a visual-edit property'};
 if(node.tracks.some(t=>t.property===property)||node.effects.some(f=>effectProperties[f[0]]===property))return {editable:false,reason:'Controlled by animation. Edit its track or effect in Source.'};
 if(node.kind==='group'&&!['position','rotation','scale','anchor'].includes(property))return {editable:false,reason:'This appearance property does not apply to groups.'};
 if(property==='fill'&&node.gradient)return {editable:false,reason:'Gradient fill. Edit its stops in Source.'};
 if(property==='size'&&!['circle','rect'].includes(node.kind))return {editable:false,reason:'Only circle and rectangle have editable dimensions.'};
 if(property==='radius'&&node.kind!=='rect')return {editable:false,reason:'Corner radius applies to rectangles.'};
 return {editable:true,reason:''};
}
export function patchNodeSource(source,id,changes){
 const scene=parse(source),node=scene.nodes.find(n=>n.id===id);if(!node)throw Error('Unknown selected node');
 if(!changes||typeof changes!=='object'||Array.isArray(changes)||!Object.keys(changes).length||Object.keys(changes).length>10)throw Error('Provide 1..10 property changes');
 for(const [key,value]of Object.entries(changes)){const state=propertyState(node,key);if(!state.editable)throw Error(key+': '+state.reason);if(value===undefined||JSON.stringify(value)===undefined)throw Error('Missing property value');}
 return studioWriteFields(source,id,changes,scene);
}
function studioTrackTuple(t,fps){const alias=Object.entries(aliases).find(([a,p])=>p===t.property)?.[0];if(!alias)throw Error('Unknown animation property');const frames=Object.hasOwn(t,'frames')?t.frames:[[0,t.from],[timeSeconds(t.duration,fps),t.to]],options={...(t.options??{})};if(t.delay!==undefined&&options.delay===undefined)options.delay=t.delay;return [alias,frames,t.ease??'ease_in_out',...(Object.keys(options).length?[options]:[])];}
function studioWriteFields(source,id,changes,scene){ let candidate;
 if(/^\s*(?:\/\/[^\n]*\n\s*)*canvas\s/.test(source)){
  candidate=source.replace(/\s*$/,'')+'\nedit '+JSON.stringify(id)+' '+Object.entries(changes).map(([k,v])=>({...studioAliases,tracks:'t',effects:'fx',in_time:'in',out_time:'out'})[k]+'='+JSON.stringify(k==='tracks'?v.map(t=>studioTrackTuple(t,scene.fps)):v)).join(' ')+'\n';
 }else{
  const lines=source.split('\n');let start=-1,end=-1;
  for(let i=0;i<lines.length;i++){const m=lines[i].trim().match(/^(circle|rect|path|group)\s+("(?:[^"\\]|\\.)*")\s*\{$/);if(m&&JSON.parse(m[2])===id){start=i;break;}}
  if(start<0)throw Error('Cannot locate source declaration');for(let i=start+1;i<lines.length;i++)if(lines[i].trim()==='}'){end=i;break;}if(end<0)throw Error('Cannot locate source block end');
  const inserts=[];if(Object.hasOwn(changes,'tracks')){const kept=lines.slice(start+1,end).filter(line=>!/^\s*(?:track|animate|keyframes)\s/.test(line));lines.splice(start+1,end-start-1,...kept);end=start+1+kept.length;for(const t of changes.tracks){const tuple=studioTrackTuple(t,scene.fps);inserts.push('  track '+t.property+' '+JSON.stringify({frames:tuple[1],ease:tuple[2],...(tuple[3]?{options:tuple[3]}:{})}));}}for(const [key,value]of Object.entries(changes)){if(key==='tracks')continue;const index=lines.findIndex((line,i)=>i>start&&i<end&&line.trim().startsWith(key+':'));if(index>=0){const indent=lines[index].match(/^\s*/)[0];lines[index]=indent+key+': '+JSON.stringify(value);}else inserts.push('  '+key+': '+JSON.stringify(value));}
  lines.splice(end,0,...inserts);candidate=lines.join('\n');
 }
 compile(candidate);return candidate;
}
export function patchAnimationSource(source,id,changes){const scene=parse(source);if(!scene.nodes.some(n=>n.id===id))throw Error('Unknown selected node');if(!changes||typeof changes!=='object'||Array.isArray(changes)||!Object.keys(changes).length||Object.keys(changes).some(k=>!['tracks','effects','in_time','out_time'].includes(k)))throw Error('Animation changes: tracks, effects, in_time, out_time');if(changes.tracks!==undefined&&(!Array.isArray(changes.tracks)||changes.tracks.length>16))throw Error('At most 16 source tracks');if(changes.effects!==undefined&&(!Array.isArray(changes.effects)||changes.effects.length>8))throw Error('At most 8 effects');return studioWriteFields(source,id,changes,scene);}

export class StudioDocument{
 #entries;#at=0;#revision=0;#limit;
 constructor(source,{limit=50}={}){if(!Number.isInteger(limit)||limit<2||limit>100)throw Error('History limit must be 2..100');compile(source);this.#entries=[source];this.#limit=limit;}
 get source(){return this.#entries[this.#at];}get revision(){return this.#revision;}get canUndo(){return this.#at>0;}get canRedo(){return this.#at<this.#entries.length-1;}
 commit(source,{revision=this.#revision}={}){if(revision!==this.#revision)throw Error('Revision conflict; refresh the selected scene');compile(source);if(source===this.source)return {changed:false,revision:this.#revision};this.#entries=this.#entries.slice(0,this.#at+1);this.#entries.push(source);if(this.#entries.length>this.#limit)this.#entries.shift();this.#at=this.#entries.length-1;this.#revision++;return {changed:true,revision:this.#revision};}
 patch(id,changes,options){return this.commit(patchNodeSource(this.source,id,changes),options);}
 undo(){if(!this.canUndo)return false;this.#at--;this.#revision++;return true;}
 redo(){if(!this.canRedo)return false;this.#at++;this.#revision++;return true;}
}
// Affine matrices use SVG's [a,b,c,d,e,f] layout. Drag deltas are converted to parent-local units.
const multiplyStudio=(a,b)=>[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]];
export function parentMatrix(scene,id,time=0){const node=scene.nodes.find(n=>n.id===id);if(!node)throw Error('Unknown selected node');const chain=[];let p=node.parent;while(p!==null){const n=scene.nodes.find(n=>n.id===p);if(!n)throw Error('Unknown parent');chain.unshift(sample(n,time));p=n.parent;if(chain.length>32)throw Error('Hierarchy limit exceeded');}let matrix=[1,0,0,1,0,0];for(const n of chain){const angle=n.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle),a=c*n.scale[0],b=s*n.scale[0],cc=-s*n.scale[1],d=c*n.scale[1];matrix=multiplyStudio(matrix,[a,b,cc,d,n.position[0]-a*n.anchor[0]-cc*n.anchor[1],n.position[1]-b*n.anchor[0]-d*n.anchor[1]]);}return matrix;}
export function localDelta(matrix,dx,dy){if(!Array.isArray(matrix)||matrix.length!==6||!matrix.every(Number.isFinite)||![dx,dy].every(Number.isFinite))throw Error('Invalid drag transform');const [a,b,c,d]=matrix,det=a*d-b*c;if(Math.abs(det)<1e-10)throw Error('Cannot drag inside a collapsed parent transform');return [(d*dx-c*dy)/det,(-b*dx+a*dy)/det];}
export function encodeDraft(source,selection=null,now=Date.now()){if(typeof source!=='string'||source.length>1000000||!Number.isFinite(now)||!(selection===null||typeof selection==='string'&&selection.length<=128))throw Error('Invalid local draft');return JSON.stringify({format:'trolic-draft',version:1,source,selection,savedAt:now});}
export function decodeDraft(text){if(typeof text!=='string'||text.length>6100000)throw Error('Invalid draft size');let data;try{data=JSON.parse(text);}catch{throw Error('Draft is not valid JSON');}if(!data||data.format!=='trolic-draft'||data.version!==1||typeof data.source!=='string'||data.source.length>1000000||!Number.isFinite(data.savedAt)||!(data.selection===null||typeof data.selection==='string'&&data.selection.length<=128))throw Error('Unsupported or invalid draft');return data;}
