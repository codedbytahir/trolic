// In-memory agent integration: keep source outside the model context; return concise receipts.
import {parse,compile,compact} from './compiler.js';
import {aliases,fields,packScene} from './agent.js';
export class AgentSession {
 #source;#revision=0;
 constructor(source){compile(source);this.#source=compact(source);}
 get revision(){return this.#revision;}
 get source(){return this.#source;}
 inspect(ids,{fields:keys=['p','s','f','r','parent']}={}){if(!Array.isArray(keys)||keys.length>20||keys.some(k=>!Object.hasOwn(aliases,k)))throw Error('Unknown inspection fields');if(!Array.isArray(ids)||ids.length<1||ids.length>10)throw Error('Inspect 1..10 IDs');const scene=parse(this.#source);return ids.map(id=>{const node=scene.nodes.find(n=>n.id===id);if(!node)throw Error(`Unknown ID ${id}`);return {id,kind:node.kind,fields:Object.fromEntries(keys.map(short=>[short,node[aliases[short]]]))};});}
 edit(edits,{revision}={}){if(revision!==this.#revision)throw Error(`Revision conflict; current=${this.#revision}`);if(typeof edits!=='string'||edits.length>100000)throw Error('Edit budget exceeded');const lines=edits.split(/\r?\n/).filter(s=>s.trim());if(!lines.length||lines.length>100||lines.some(s=>fields(s.trim())[0]!=='edit'))throw Error('Only 1..100 edit instructions are accepted');
  const candidate=this.#source+'\n'+edits;const result=compile(candidate);this.#source=packScene(result.scene);this.#revision++;return {ok:true,revision:this.#revision,edited:lines.length,nodes:result.stats.shapes};}
 export(target='lottie',time=0){return compile(this.#source,target,time).output;}
}
