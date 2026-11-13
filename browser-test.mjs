import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {compile} from './compiler.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TROLIC_URL||'http://127.0.0.1:8001');await page.waitForSelector('#preview svg');
const report={renderer:'lottie-web 5.13.0 SVG',cases:[],pageErrors:errors};
for(const name of ['bounce','reveal','orbit','aurelia','tidal','solstice','orchard','milo']){
 const source=readFileSync(`examples/${name}.trolic`,'utf8');const {output}=compile(source);
 const result=await page.evaluate(async ({data})=>{
  const el=document.createElement('div');el.style.cssText='width:800px;height:640px;position:fixed;left:0;top:0;background:white;z-index:100';el.id='test-render';document.body.append(el);
  const anim=lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:data});
  await new Promise((resolve,reject)=>{anim.addEventListener('DOMLoaded',resolve);anim.addEventListener('data_failed',()=>reject(Error('data_failed')));setTimeout(()=>reject(Error('render timeout')),5000);});
  const frames=[];for(const seconds of [0,.5,1.5,3]){anim.goToAndStop(Math.min(seconds*data.fr,data.op-1),true);const svg=el.querySelector('svg');frames.push({seconds,paths:svg.querySelectorAll('path').length,gradients:svg.querySelectorAll('linearGradient,radialGradient').length,invalid:/NaN|Infinity/.test(svg.outerHTML),length:svg.outerHTML.length});}
  return {frames};
 },{data:JSON.parse(output)});
 await page.locator('#test-render').screenshot({path:`artifacts/${name}-lottie.png`});await page.evaluate(()=>document.querySelector('#test-render').remove());
 report.cases.push({name,bytes:output.length,...result});if(result.frames.some(f=>f.invalid||f.paths===0))throw Error('Invalid rendered scene '+name);
}
await page.selectOption('#example','tidal');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('46 shapes'));
await page.selectOption('#renderer','trolic');await page.waitForSelector('#preview svg path');
await page.selectOption('#renderer','lottie');await page.waitForSelector('#preview svg path');
await page.screenshot({path:'artifacts/playground.png',fullPage:true});
if(errors.length)throw Error(errors.join('\n'));
writeFileSync('artifacts/browser-test-results.json',JSON.stringify(report,null,2));console.log(`PASS: ${report.cases.length} scenes rendered at 4 timestamps by Lottie-web; no page errors.`);
await browser.close();
