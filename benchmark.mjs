import {readFileSync,writeFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import {gzipSync} from 'node:zlib';
import {compile} from './compiler.js';
const results=[];
for(const name of ['bounce','aurelia','tidal','solstice','orchard','milo']){
 const source=readFileSync(`examples/${name}.trolic`,'utf8');for(let i=0;i<20;i++)compile(source);
 const times=[];for(let i=0;i<100;i++){const t=performance.now();compile(source);times.push(performance.now()-t);}times.sort((a,b)=>a-b);const r=compile(source);
 results.push({name,sourceBytes:Buffer.byteLength(source),outputBytes:r.stats.bytes,gzipOutputBytes:gzipSync(r.output).length,nodes:r.stats.shapes,tracks:r.stats.tracks,medianCompileMs:+times[50].toFixed(3),p95CompileMs:+times[95].toFixed(3)});
}
writeFileSync('artifacts/benchmarks.json',JSON.stringify({environment:`Node ${process.version}, sandbox; 20 warmups, 100 measurements per scene; parse+validate+Lottie export; not playback timing`,results},null,2));console.table(results);
