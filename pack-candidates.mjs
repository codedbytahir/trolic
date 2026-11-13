import {readFileSync} from 'node:fs';import {compact,compile} from './compiler.js';
const source=readFileSync(process.argv[2],'utf8'),expected=compile(source).output;const candidates=[],seen=new Set();
for(const reuse of [false,true])for(const batch of [false,true])for(const styles of [false,true])for(const constants of [false,true]){const options={reuse,batch,styles,constants},text=compact(source,options);if(seen.has(text)&&!(reuse&&batch&&styles&&constants))continue;seen.add(text);if(compile(text).output!==expected)throw Error('Lossless conversion failed');candidates.push({options,source:text});}
process.stdout.write(JSON.stringify(candidates));
