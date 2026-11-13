import {chromium} from '@playwright/test';
import {readFileSync,writeFileSync} from 'node:fs';
import {compile,svg} from './compiler.js';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:900,height:700},deviceScaleFactor:1});await page.goto(process.env.TROLIC_URL||'http://127.0.0.1:8001');await page.waitForSelector('#preview svg');
for(const name of ['bounce','reveal','orbit','aurelia','tidal','solstice','orchard','milo']){
 const result=compile(readFileSync(`examples/${name}.trolic`,'utf8'));const data=JSON.parse(result.output);
 for(const seconds of [.5,1.5,3]){
  const t=Math.min(seconds,(data.op-1)/data.fr),tag=`${name}-${seconds}`;
  await page.evaluate(async ({data,time})=>{
   const el=document.createElement('div');el.id='comparison';el.style.cssText=`width:${data.w}px;height:${data.h}px;position:fixed;left:0;top:0;z-index:100;background:white`;document.body.append(el);
   const anim=lottie.loadAnimation({container:el,renderer:'svg',loop:false,autoplay:false,animationData:data});window.comparisonPlayer=anim;
   await new Promise(resolve=>anim.addEventListener('DOMLoaded',resolve));anim.goToAndStop(time*data.fr,true);
  },{data,time:t});
  await page.locator('#comparison').screenshot({path:`artifacts/compare-${tag}-lottie.png`});
  await page.evaluate(s=>{window.comparisonPlayer.destroy();document.querySelector('#comparison').innerHTML=s;},svg(result.scene,t));
  await page.locator('#comparison').screenshot({path:`artifacts/compare-${tag}-trolic.png`});await page.evaluate(()=>document.querySelector('#comparison').remove());
 }
}
await browser.close();console.log('24 paired renderer snapshots captured');
