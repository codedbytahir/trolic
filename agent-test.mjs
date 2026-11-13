import assert from 'node:assert/strict';import {readFileSync,readdirSync}from'node:fs';
import {compile,compact,parse,diagnose}from'./compiler.js';import{expandAgent,fields}from'./agent.js';import{AgentSession}from'./agent-tools.js';
let count=0;const test=(name,fn)=>{fn();count++;console.log('PASS',name)};
const basic='canvas 640 480 bg=#10131d dur=3 name="Agent demo"\ncircle orb p=[100,200] s=[80,80] f=#c4f76b\n';
test('agent syntax compiles',()=>assert.equal(parse(basic).nodes[0].id,'orb'));
test('JSON strings and arrays lexed as single fields',()=>assert.equal(fields('path "long id" d="M 0 0 L 20 20" p=[2, 3]').length,4));
test('JSON object fields accepted',()=>assert.equal(diagnose(basic+'circle two g={"type":"linear","from":[0,0],"to":[1,0],"stops":[[0,"#ffffff"],[1,"#000000"]]}').ok,true));
test('compact gradient shorthand',()=>assert.equal(parse(basic+'circle two g=["l",[0,0],[1,0],[[0,"#ffffff"],[1,"#000000"]]]').nodes[1].gradient.type,'linear'));
test('constants resolved',()=>assert.equal(parse('canvas 100 100\nlet green #00ff00\ncircle a f=$green').nodes[0].fill,'#00ff00'));
test('styles resolved',()=>assert.equal(parse(basic+'style ink ink=#000000 sw=3\ncircle two @ink').nodes[1].stroke_width,3));
test('definition overrides',()=>assert.equal(parse(basic+'def dot circle f=#ffffff\nuse dot two f=#ff0000').nodes[1].fill,'#ff0000'));
test('bounded repeat transforms',()=>{const s=parse('canvas 200 200\ndef dot circle\nrepeat dot d- 4 p=[0,0] step=[10,0] turn=20');assert.deepEqual(s.nodes[3].position,[30,0]);assert.equal(s.nodes[3].rotation,60)});
test('batches expand stable IDs',()=>assert.equal(parse('canvas 200 200\ndef dot circle\nbatch dot d- cols=["p"] data=[[[1,2]],[[3,4]]]').nodes[1].id,'d-1'));
test('batch explicit IDs',()=>assert.equal(parse('canvas 200 200\ndef dot circle\nbatch dot x cols=["p"] data=[[[1,2]]] ids=["special"]').nodes[0].id,'special'));
test('edits affect node only',()=>assert.equal(parse(basic+'edit orb f=#ff0000').nodes[0].fill,'#ff0000'));
test('unknown field rejected',()=>assert.equal(diagnose(basic+'circle x fake=3').ok,false));
test('prototype key rejected',()=>assert.equal(diagnose(basic+'circle x __proto__={}').ok,false));
test('inherited property name rejected',()=>assert.equal(diagnose(basic+'circle x toString=2').ok,false));
test('unknown constants rejected',()=>assert.equal(diagnose(basic+'circle x f=$missing').ok,false));
test('duplicate constants rejected',()=>assert.equal(diagnose(basic+'let a 1\nlet a 2').ok,false));
test('duplicate fields rejected',()=>assert.equal(diagnose(basic+'circle x p=[1,2] p=[3,4]').ok,false));
test('duplicate IDs rejected',()=>assert.equal(diagnose(basic+'circle orb').ok,false));
test('negative repeat rejected',()=>assert.equal(diagnose(basic+'def dot circle\nrepeat dot x -1').ok,false));
test('repeat expansion bounded',()=>assert.equal(diagnose(basic+'def dot circle\nrepeat dot x 501').ok,false));
test('malformed batch rejected',()=>assert.equal(diagnose(basic+'def dot circle\nbatch dot x cols=["p"] data=[[1,2]]').ok,false));
test('unknown edit rejected',()=>assert.equal(diagnose(basic+'edit absent f=#ffffff').ok,false));
test('JSON nesting limited',()=>assert.equal(diagnose(basic+'let a '+ '['.repeat(40)+'0'+']'.repeat(40)).ok,false));
test('reference growth limited',()=>{let s=basic+'let a [0]\n';for(let i=0;i<30;i++)s+=`let v${i} ["$${i?'v'+(i-1):'a'}","$${i?'v'+(i-1):'a'}"]\n`;assert.equal(diagnose(s).ok,false)});
test('mapped source line on semantic failure',()=>{const r=diagnose(basic+'circle bad sw=-1');assert.equal(r.diagnostics[0].line,3)});
test('session atomic edits',()=>{const s=new AgentSession(basic);const original=s.export();assert.throws(()=>s.edit('edit orb sw=-1',{revision:0}));assert.equal(s.export(),original);assert.equal(s.revision,0)});
test('session small receipt',()=>{const s=new AgentSession(basic);const r=s.edit('edit orb f=#ff0000',{revision:0});assert.equal(r.revision,1);assert.equal(r.source,undefined);assert.equal(s.inspect(['orb'])[0].fields.f,'#ff0000')});
test('stale revision rejected',()=>assert.throws(()=>new AgentSession(basic).edit('edit orb f=#ffffff',{revision:1})));
test('session prevents instruction injection',()=>assert.throws(()=>new AgentSession(basic).edit('circle new',{revision:0})));
test('inspection bounded',()=>assert.throws(()=>new AgentSession(basic).inspect(Array(11).fill('orb'))));
test('dollar scene name preserved',()=>{const s='scene "$name" {\n}';assert.equal(compile(compact(s)).output,compile(s).output)});
for(const f of readdirSync('examples').filter(f=>f.endsWith('.trolic')))test('lossless packing '+f,()=>{const s=readFileSync('examples/'+f,'utf8');for(const opts of [{},{reuse:false,batch:false,styles:false,constants:false}]){assert.equal(compile(compact(s,opts)).output,compile(s).output);assert.equal(compile(compact(s,opts),'svg',0.75).output,compile(s,'svg',0.75).output);}});


test('distributed compact fixtures preserve exact export',()=>{for(const f of readdirSync('examples').filter(f=>f.endsWith('.trolic'))){assert.equal(compile(readFileSync('examples/agent/'+f,'utf8')).output,compile(readFileSync('examples/'+f,'utf8')).output);}});
test('agent export target roundtrips',()=>assert.equal(compile(compile(basic,'agent').output).output,compile(basic).output));
test('readable export target roundtrips',()=>assert.equal(compile(compile(basic,'readable').output).output,compile(basic).output));
test('repeat recipe produces bounded scene',()=>assert.equal(parse(readFileSync('examples/agent/sunwheel.trolic','utf8')).nodes.length,19));


test('numeric IDs survive batch conversion',()=>{const s='canvas 100 100\ndef dot circle ink=#123456 sw=2\nuse dot "0" p=[1,2]\nuse dot "1" p=[3,4]\nuse dot "2" p=[5,6]';assert.equal(compile(compact(s)).output,compile(s).output);});
test('quoted parent IDs survive style factoring',()=>{const s='canvas 100 100\ngroup "long parent" p=[0,0]\ncircle a parent="long parent" ink=#123456 sw=2\ncircle b parent="long parent" ink=#123456 sw=2\ncircle c parent="long parent" ink=#123456 sw=2';assert.equal(compile(compact(s)).output,compile(s).output);});
test('dollar parent IDs remain literal',()=>{const s='canvas 100 100\ngroup "$root" p=[0,0]\ncircle a parent="$$root"';assert.equal(compile(compact(s)).output,compile(s).output);});


test('inspection returns only requested fields',()=>{const n=new AgentSession(basic).inspect(['orb'],{fields:['p']})[0];assert.deepEqual(Object.keys(n.fields),['p']);});
test('inspection rejects unknown fields',()=>assert.throws(()=>new AgentSession(basic).inspect(['orb'],{fields:['missing']})));
console.log(`${count} agent tests passed`);
