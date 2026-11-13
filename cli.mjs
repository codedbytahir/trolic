import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {compile,diagnose} from './compiler.js';
const usage='Usage: node cli.mjs input.trolic [--check] [--target lottie|svg|ir|agent|readable] [--output file] [--time seconds]';
const args=process.argv.slice(2);
if(args[0]==='--help'){console.log(usage);process.exit(0);}
try{
 const file=args.shift();if(!file||file.startsWith('--'))throw Error(usage);
 const options={target:'lottie',time:'0',check:false};
 while(args.length){const flag=args.shift();if(flag==='--check'){options.check=true;continue;}if(!['--target','--output','--time'].includes(flag))throw Error(`Unknown option: ${flag}`);const value=args.shift();if(value===undefined||value.startsWith('--'))throw Error(`Missing value for ${flag}`);options[flag.slice(2)]=value;}
 if((await stat(file)).size>1000000)throw Error('Input exceeds 1 MB CLI budget');
 const source=await readFile(file,'utf8');
 if(options.check){const report=diagnose(source,options.target);console.log(JSON.stringify(report));process.exit(report.ok?0:1);}
 const time=Number(options.time);if(!Number.isFinite(time)||time<0)throw Error('--time must be a nonnegative finite number');
 const result=compile(source,options.target,time);const out=options.output||(options.target==='svg'?'animation.svg':['agent','readable'].includes(options.target)?'scene.trolic':'animation.json');
 if(resolve(out)===resolve(file))throw Error('Refusing to overwrite the source file');
 await mkdir(dirname(out),{recursive:true});await writeFile(out,result.output);console.log(JSON.stringify({output:out,...result.stats}));
}catch(e){console.error(JSON.stringify({code:e.code||'TROLIC_CLI_ERROR',line:e.line||1,message:e.message}));process.exit(1);}
