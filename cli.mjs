#!/usr/bin/env node
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {compile,diagnose} from './compiler.js';
import {analyzeDelivery,compileForProfile} from './delivery.js';
import {VERSION} from './api.js';
const usage='Usage: node cli.mjs input.trolic [--check] [--target lottie|svg|ir|agent|readable] [--output file] [--time seconds] [--profile lottie-web-svg|portable-basic] [--budget-kb N] [--max-nodes N]';
const args=process.argv.slice(2);
if(args[0]==='--version'){console.log(VERSION);process.exit(0);}
if(args[0]==='--help'){console.log(usage);process.exit(0);}
try{
 const file=args.shift();if(!file||file.startsWith('--'))throw Error(usage);
 const options={target:'lottie',time:'0',check:false};
 while(args.length){const flag=args.shift();if(flag==='--check'){options.check=true;continue;}if(!['--target','--output','--time','--profile','--budget-kb','--max-nodes'].includes(flag))throw Error(`Unknown option: ${flag}`);const value=args.shift();if(value===undefined||value.startsWith('--'))throw Error(`Missing value for ${flag}`);options[flag.slice(2)]=value;}
 if((await stat(file)).size>1000000)throw Error('Input exceeds 1 MB CLI budget');
 const source=await readFile(file,'utf8');
 if(!options.profile&&(options['budget-kb']!==undefined||options['max-nodes']!==undefined))throw Error('Delivery budgets require --profile');
 if(options.profile&&options.target!=='lottie')throw Error('--profile checks Lottie delivery; use --target lottie');
 const deliveryOptions={profile:options.profile,budgets:{...(options['budget-kb']!==undefined?{maxBytes:Math.floor(Number(options['budget-kb'])*1024)}:{}),...(options['max-nodes']!==undefined?{maxNodes:Number(options['max-nodes'])}:{})}};
 if(options.check){const report=options.profile?analyzeDelivery(source,deliveryOptions):diagnose(source,options.target);console.log(JSON.stringify(report));process.exit(report.ok?0:1);}
 const time=Number(options.time);if(!Number.isFinite(time)||time<0)throw Error('--time must be a nonnegative finite number');
 const result=options.profile?compileForProfile(source,deliveryOptions):compile(source,options.target,time);const out=options.output||(options.target==='svg'?'animation.svg':['agent','readable'].includes(options.target)?'scene.trolic':'animation.json');
 if(resolve(out)===resolve(file))throw Error('Refusing to overwrite the source file');
 await mkdir(dirname(out),{recursive:true});await writeFile(out,result.output);console.log(JSON.stringify({output:out,...result.stats}));
}catch(e){console.error(JSON.stringify({code:e.code||'TROLIC_CLI_ERROR',line:e.line||1,message:e.message,...(e.report?{issues:e.report.issues}:{})}));process.exit(1);}
