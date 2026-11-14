import {canvasSize,timeSeconds,aspectPresets} from './motion.js';
// Trolic Agent Syntax (TAS) v0.6. Bounded declarative expansion; no eval or scripts.
export const aliases={p:'position',s:'size',f:'fill',r:'rotation',z:'scale',o:'opacity',d:'path',g:'gradient',ink:'stroke',sw:'stroke_width',cap:'line_cap',join:'line_join',rule:'fill_rule',round:'radius',parent:'parent',t:'tracks',a:'anchor',fx:'effects',ts:'trim_start',te:'trim_end',in:'in_time',out:'out_time'};
const reverse=Object.fromEntries(Object.entries(aliases).map(([a,b])=>[b,a]));
const copy=x=>JSON.parse(JSON.stringify(x));
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const defaults={position:[256,256],size:[120,80],fill:'#6366f1',rotation:0,scale:[1,1],opacity:1,path:'',gradient:null,stroke:'none',stroke_width:1,line_cap:'round',line_join:'round',fill_rule:'nonzero',radius:0,parent:null,anchor:[0,0],effects:[],trim_start:0,trim_end:1,in_time:0,out_time:null,tracks:[]};
function agentError(message,line){const e=new Error(message);e.code='TROLIC_AGENT_ERROR';e.line=line;throw e;}
// Whitespace separates fields only outside JSON arrays, objects and quoted strings.
export function fields(text,line=1){const out=[];let start=0,depth=0,quoted=false,escaped=false;
 for(let i=0;i<=text.length;i++){const c=text[i];if(quoted){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c==='"')quoted=false;}else{if(c==='"')quoted=true;else if(c==='['||c==='{')depth++;else if(c===']'||c==='}'){depth--;if(depth<0)agentError('Unbalanced value',line);}if((i===text.length||/\s/.test(c))&&depth===0){const token=text.slice(start,i).trim();if(token)out.push(token);start=i+1;}}}
 if(quoted||depth!==0)agentError('Unterminated JSON value',line);return out;
}
export function expandAgent(source){
 if(typeof source!=='string'||source.length>1000000)agentError('Source exceeds 1 million character budget',1);
 const lines=source.split(/\r?\n/),vars=new Map(),defs=new Map(),styles=new Map(),nodes=[],ids=new Map();let canvas=null,expansionBytes=0,valueWork=0;
 const checkedCopy=v=>{const text=JSON.stringify(v);valueWork+=text.length;if(text.length>100000||valueWork>2000000)agentError('Constant/value expansion budget exceeded',1);return JSON.parse(text);};
 const literal=(text,line)=>{
  let value;if(text.startsWith('$')){if(!vars.has(text.slice(1)))agentError(`Unknown constant ${text}`,line);return checkedCopy(vars.get(text.slice(1)));}
  try{value=JSON.parse(text);}catch{if(/^(?:#[0-9a-fA-F]{6}|[a-zA-Z_][\w.-]*|\d+(?:\.\d+)?(?:ms|s|f))$/.test(text))value=text;else agentError('Expected JSON value, color, name, or $constant',line);}
  function resolve(v,depth=0){if(typeof v==='string'&&v.startsWith('$$'))return v.slice(1);if(depth>32)agentError('Value nesting exceeds 32',line);if(typeof v==='string'&&/^\$[A-Za-z_]\w*$/.test(v)){if(!vars.has(v.slice(1)))agentError(`Unknown constant ${v}`,line);return checkedCopy(vars.get(v.slice(1)));}if(Array.isArray(v))return v.map(x=>resolve(x,depth+1));if(v&&typeof v==='object'){const o=Object.create(null);for(const [k,x] of Object.entries(v)){if(['__proto__','constructor','prototype'].includes(k))agentError('Reserved key',line);o[k]=resolve(x,depth+1);}return o;}return v;}return checkedCopy(resolve(value));
 };
 const assignments=(tokens,line,raw=false)=>{const props={};for(const token of tokens){if(token.startsWith('@')){if(raw)agentError('Style not permitted here',line);const style=styles.get(token.slice(1));if(!style)agentError('Unknown style',line);for(const [k,v]of Object.entries(style)){if(Object.hasOwn(props,k))agentError(`Duplicate field ${k}`,line);props[k]=copy(v);}continue;}
  const m=token.match(/^([a-zA-Z_]\w*)=(.+)$/);if(!m)agentError(`Expected key=value, got ${token}`,line);if(['__proto__','constructor','prototype'].includes(m[1]))agentError('Reserved key',line);const key=raw?m[1]:(Object.hasOwn(aliases,m[1])?aliases[m[1]]:undefined);if(!key)agentError(`Unknown field ${m[1]}`,line);if(Object.hasOwn(props,key))agentError(`Duplicate field ${m[1]}`,line);props[key]=literal(m[2],line);
 }return props;};
 const name=(text,line)=>{if(!text)agentError('Missing name',line);let value=text;try{if(text.startsWith('"'))value=JSON.parse(text);}catch{agentError('Invalid quoted name',line);}if(typeof value!=='string'||!value.length||value.length>128)agentError('Invalid name',line);return value;};
 const add=(kind,id,props,line)=>{if(!['circle','rect','path','group'].includes(kind))agentError(`Unknown node kind ${kind}`,line);if(ids.has(id))agentError(`Duplicate ID ${id}`,line);if(nodes.length>=500)agentError('Maximum 500 expanded nodes',line);expansionBytes+=JSON.stringify(props).length+200;if(expansionBytes>900000)agentError('Expanded scene exceeds budget',line);const n={kind,id,...copy(props),_line:line};nodes.push(n);ids.set(id,n);};
 for(let i=0;i<lines.length;i++){const line=i+1,s=lines[i].trim();if(!s||s.startsWith('//'))continue;const a=fields(s,line),op=a.shift();
  if(!canvas){if(op!=='canvas'||a.length<1)agentError('Expected canvas WIDTH HEIGHT or a preset/ratio',line);const first=a.shift(),special=Object.hasOwn(aspectPresets,first)||first.includes(':'),second=special?null:a.shift(),p=assignments(a,line,true);if(Object.keys(p).some(k=>!['bg','dur','fps','name','w','h'].includes(k)))agentError('Unknown canvas field',line);let size;try{size=canvasSize(first,second,p);}catch(e){agentError(e.message,line)}canvas={name:'Untitled',size,duration:2,fps:60,background:'transparent',...Object.fromEntries(Object.entries(p).filter(([k])=>!['w','h'].includes(k)).map(([k,v])=>[{bg:'background',dur:'duration',fps:'fps',name:'name'}[k],v]))};continue;}

  if(op==='let'){if(a.length!==2)agentError('let NAME VALUE',line);const id=name(a[0],line);if(!/^[A-Za-z_]\w*$/.test(id)||vars.has(id))agentError('Invalid or duplicate constant',line);vars.set(id,literal(a[1],line));}
  else if(op==='style'){const id=name(a.shift(),line);if(styles.has(id))agentError('Duplicate style',line);styles.set(id,assignments(a,line));}
  else if(op==='def'){const id=name(a.shift(),line),kind=a.shift();if(defs.has(id)||!['circle','rect','path','group'].includes(kind))agentError('Invalid or duplicate definition',line);defs.set(id,{kind,props:assignments(a,line)});}
  else if(op==='use'){const template=defs.get(a.shift()),id=name(a.shift(),line);if(!template)agentError('Unknown definition',line);add(template.kind,id,{...template.props,...assignments(a,line)},line);}
  else if(op==='batch'){const template=defs.get(a.shift()),prefix=name(a.shift(),line),p=assignments(a,line,true);if(!template)agentError('Unknown batch definition',line);if(Object.keys(p).some(k=>!['cols','data','ids'].includes(k)))agentError('Unknown batch option',line);const cols=typeof p.cols==='string'?p.cols.split(','):p.cols;if(!Array.isArray(cols)||new Set(cols).size!==cols.length||cols.some(k=>!Object.hasOwn(aliases,k))||!Array.isArray(p.data)||p.data.length>500)agentError('Invalid batch columns/data',line);if(p.ids!==undefined&&(!Array.isArray(p.ids)||p.ids.length!==p.data.length))agentError('Invalid batch ids',line);
   for(let j=0;j<p.data.length;j++){const row=p.data[j];if(!Array.isArray(row)||row.length!==cols.length)agentError('Batch row length differs from columns',line);const props={...template.props};cols.forEach((k,index)=>props[aliases[k]]=row[index]);const id=p.ids===undefined?prefix+j:p.ids[j];add(template.kind,name(JSON.stringify(id),line),props,line);}}
  else if(op==='repeat'){const template=defs.get(a.shift()),prefix=name(a.shift(),line),count=Number(a.shift()),p=assignments(a,line,true);if(!template||!Number.isInteger(count)||count<1||count>500)agentError('repeat DEF PREFIX COUNT [p=[x,y] step=[dx,dy] r=0 turn=30 parent=ID]',line);if(Object.keys(p).some(k=>!['p','step','r','turn','parent','stagger'].includes(k)))agentError('Unknown repeat option',line);const position=p.p??template.props.position??[256,256],step=p.step??[0,0],rotation=p.r??template.props.rotation??0,turn=p.turn??0;
   if(![position,step].every(v=>Array.isArray(v)&&v.length===2&&v.every(Number.isFinite))||![rotation,turn].every(Number.isFinite))agentError('Invalid repeat transform',line);
   for(let j=0;j<count;j++){const props=copy(template.props),offset=p.stagger===undefined?0:timeSeconds(p.stagger,canvas.fps)*j;if(!Number.isFinite(offset)||offset<0)agentError('Invalid stagger',line);if(offset){if(!props.effects?.length&&!props.tracks?.length)agentError('Stagger requires effects or tracks',line);if(props.effects)props.effects=props.effects.map(f=>{const fx=[...f];fx[2]=timeSeconds(fx[2]??0,canvas.fps)+offset;return fx;});if(props.tracks)props.tracks=props.tracks.map(t=>[t[0],t[1],t[2]??'ease_in_out',{...(t[3]??{}),delay:timeSeconds(t[3]?.delay??0,canvas.fps)+offset}]);}add(template.kind,prefix+j,{...props,position:position.map((v,k)=>v+j*step[k]),rotation:rotation+j*turn,...(p.parent!==undefined?{parent:p.parent}:{})},line);}}
  else if(op==='edit'){const node=ids.get(name(a.shift(),line));if(!node)agentError('Unknown edit ID',line);Object.assign(node,assignments(a,line),{_line:line});}
  else if(['circle','rect','path','group'].includes(op)){const id=name(a.shift(),line);add(op,id,assignments(a,line),line);}
  else agentError(`Unknown instruction ${op}`,line);
 }
 if(!canvas)agentError('Missing canvas',1);
 const output=[],map=[];const emit=(s,line)=>{output.push(s);map.push(line);};emit(`scene ${JSON.stringify(canvas.name)} {`,1);for(const key of ['size','duration','fps','background'])emit(`${key}: ${JSON.stringify(canvas[key])}`,1);
 for(const node of nodes){const line=node._line;emit(`${node.kind} ${JSON.stringify(node.id)} {`,line);for(const [key,value]of Object.entries(node)){if(['id','kind','_line','tracks'].includes(key))continue;let v=value;if(key==='gradient'&&Array.isArray(v)){if(v.length!==4)agentError('g=[l|r,from,to,stops]',line);v={type:({l:'linear',r:'radial'})[v[0]]||v[0],from:v[1],to:v[2],stops:v[3]};}emit(`${key}: ${JSON.stringify(v)}`,line);}
  if(node.tracks!==undefined){if(!Array.isArray(node.tracks))agentError('t requires track tuples',line);for(const t of node.tracks){if(!Array.isArray(t)||t.length<2||t.length>4||!['p','z','r','o','te','f','ink','sw','s','round','d'].includes(t[0]))agentError('Track: [p|z|r|o,[[time,value],...],easing?]',line);emit(`track ${aliases[t[0]]} ${JSON.stringify({frames:t[1],ease:t[2]??'ease_in_out',...(t[3]!==undefined?{options:t[3]}:{})})}`,line);}}
  emit('}',line);
 }emit('}',lines.length);const expanded=output.join('\n');if(expanded.length>1000000)agentError('Expanded source exceeds 1 million characters',lines.length);return {source:expanded,map};
}
const atom=v=>typeof v==='string'&&v.startsWith('$')?JSON.stringify('$'+v):typeof v==='string'&&/^(?:#[0-9a-fA-F]{6}|[a-zA-Z_][\w.-]*)$/.test(v)?v:JSON.stringify(v);
const idText=id=>/^[A-Za-z_][\w.-]*$/.test(id)?id:JSON.stringify(id);
function shortGradient(g){return g===null?null:[g.type==='radial'?'r':'l',g.from,g.to,g.stops];}
function shortTracks(tracks){return tracks.map(t=>{const frames=Object.hasOwn(t,'frames')?t.frames:[[t.delay,t.from],[t.delay+t.duration,t.to]];return [reverse[t.property],frames,...(t.options!==undefined?[t.ease??'ease_in_out',t.options]:t.ease==='ease_in_out'?[]:[t.ease])];});}

export function packScene(scene,{reuse=true,batch=true,styles=true,constants=true}={}){
 const lines=[`canvas ${scene.size.join(' ')}${scene.background==='transparent'?'':` bg=${atom(scene.background)}`}${scene.duration===2?'':` dur=${scene.duration}`}${scene.fps===60?'':` fps=${scene.fps}`}${scene.name==='Untitled'?'':` name=${JSON.stringify(scene.name.startsWith('$')?'$'+scene.name:scene.name)}`}`];
 const normalized=scene.nodes.map(n=>{const props={};for(const [key,defaultValue]of Object.entries(defaults)){const d=key==='size'&&n.kind==='circle'?[80,80]:defaultValue;let value=n[key];if(!equal(value,d))props[reverse[key]]=key==='gradient'?shortGradient(value):key==='tracks'?shortTracks(value):value;}return {kind:n.kind,id:n.id,props};});
 const dynamic=new Set(['p','s','r','z','o','t']);const groups=new Map();
 for(const n of normalized){const sig=JSON.stringify([n.kind,Object.entries(n.props).filter(([k])=>!dynamic.has(k))]);if(!groups.has(sig))groups.set(sig,[]);groups.get(sig).push(n);n.signature=sig;}
 const defs=new Map();let counter=0;
 const propsText=p=>Object.entries(p).map(([k,v])=>`${k}=${atom(v)}`).join(' ');
 if(reuse)for(const [sig,ns]of groups){if(ns.length<3)continue;const common={...ns[0].props};for(const key of Object.keys(common))if(ns.some(n=>!Object.hasOwn(n.props,key)||!equal(n.props[key],common[key])))delete common[key];if(propsText(common).length<25)continue;const name='a'+counter++;defs.set(sig,{name,common});lines.push(`def ${name} ${ns[0].kind} ${propsText(common)}`);}
 for(let i=0;i<normalized.length;){const n=normalized[i],def=defs.get(n.signature);
  if(def&&batch){let end=i+1;while(end<normalized.length&&normalized[end].signature===n.signature)end++;if(end-i>=3){const run=normalized.slice(i,end),rest=node=>Object.fromEntries(Object.entries(node.props).filter(([k])=>!Object.hasOwn(def.common,k))),cols=[...new Set(run.flatMap(node=>Object.keys(rest(node))))];const rows=run.map(node=>cols.map(k=>rest(node)[k]??(k==='g'?shortGradient(defaults[aliases[k]]):k==='t'?[]:k==='s'&&node.kind==='circle'?[80,80]:defaults[aliases[k]])));const m=run[0].id.match(/^(.*?)(\d+)$/),prefix=m&&m[1].length>0&&m[2]==='0'&&run.every((node,j)=>node.id===m[1]+j)?m[1]:null;lines.push(`batch ${def.name} ${idText(prefix||'item')} cols=${JSON.stringify(cols)} data=${JSON.stringify(rows)}${prefix===null?` ids=${JSON.stringify(run.map(n=>n.id))}`:''}`);i=end;continue;}}
  const props=def?Object.fromEntries(Object.entries(n.props).filter(([k])=>!Object.hasOwn(def.common,k))):n.props;lines.push(`${def?`use ${def.name}`:n.kind} ${idText(n.id)}${Object.keys(props).length?' '+propsText(props):''}`);i++;
 }
 return optimizeAgent(lines,{styles,constants}).join('\n')+'\n';
}

function optimizeAgent(input,{styles,constants}){
 let lines=[...input];const declarations=[];
 if(styles){const groups=new Map(),selected=new Set(['ink','sw','parent','cap','join','rule']);
  for(let i=1;i<lines.length;i++){const tokens=fields(lines[i]);if(!['circle','rect','path','group','def','use'].includes(tokens[0]))continue;const style=tokens.filter(t=>selected.has(t.split('=')[0])).sort();if(style.length<2||style.join(' ').length<18)continue;const signature=JSON.stringify(style);if(!groups.has(signature))groups.set(signature,[]);groups.get(signature).push(i);}
  let index=0;for(const [signature,indices]of groups){if(indices.length<3)continue;const id='s'+index++,remove=new Set(JSON.parse(signature));declarations.push(`style ${id} ${JSON.parse(signature).join(' ')}`);for(const i of indices)lines[i]=fields(lines[i]).filter(t=>!remove.has(t)).join(' ')+` @${id}`;}
 }
 lines=[lines[0],...declarations,...lines.slice(1)];
 if(constants){const values=new Map();for(let i=1;i<lines.length;i++)for(const token of fields(lines[i])){const m=token.match(/^[a-zA-Z_]\w*=(.+)$/);if(!m||m[1].length<6||m[1].startsWith('$'))continue;const value=m[1];values.set(value,(values.get(value)||0)+1);}
  const bindings=new Map(),lets=[];let index=0;for(const [value,count]of values){if(count<3||(value.length-3)*count<value.length+10)continue;const id=index<26?String.fromCharCode(97+index):'v'+index;index++;bindings.set(value,id);lets.push(`let ${id} ${value}`);}
  lines=lines.map((line,i)=>i===0?line:fields(line).map(token=>{const m=token.match(/^([a-zA-Z_]\w*)=(.+)$/);return m&&bindings.has(m[2])?`${m[1]}=$${bindings.get(m[2])}`:token;}).join(' '));lines=[lines[0],...lets,...lines.slice(1)];
 }
 return lines;
}
