import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import {mkdtempSync,writeFileSync,readFileSync,rmSync,existsSync} from 'node:fs';import {join} from 'node:path';
const dir=mkdtempSync('artifacts/cli-test-');let count=0;const test=(n,f)=>{f();count++;console.log('PASS',n)};const run=args=>spawnSync(process.execPath,['cli.mjs',...args],{encoding:'utf8'});
try{
const file=join(dir,'test.trolic');const source='scene "Test" {\ncircle "orb" {\n}\n}';writeFileSync(file,source);
test('check mode structured success',()=>{const r=run([file,'--check']);assert.equal(r.status,0);assert.equal(JSON.parse(r.stdout).ok,true)});
test('check mode no file side effect',()=>assert.equal(existsSync(join(dir,'animation.json')),false));
test('unknown CLI options rejected',()=>assert.equal(run([file,'--banana']).status,1));
test('missing flag value rejected',()=>assert.equal(run([file,'--output']).status,1));
test('source overwrite blocked',()=>{assert.equal(run([file,'--output',file]).status,1);assert.equal(readFileSync(file,'utf8'),source)});
test('invalid timestamp rejected',()=>assert.equal(run([file,'--time','NaN']).status,1));
test('SVG output written',()=>{const out=join(dir,'test.svg');assert.equal(run([file,'--target','svg','--output',out]).status,0);assert.match(readFileSync(out,'utf8'),/^<svg/)});
test('bad source check reports failure',()=>{writeFileSync(file,'bad');const r=run([file,'--check']);assert.equal(r.status,1);assert.equal(JSON.parse(r.stdout).ok,false)});
test('help succeeds',()=>assert.equal(run(['--help']).status,0));
}finally{rmSync(dir,{recursive:true,force:true});}
console.log(`${count} CLI tests passed`);
