// Trolic v0.5 portable motion lowering. No renderer-specific filters or expressions.
export const standardCurves={linear:[0,0,1,1],ease_in:[.42,0,1,1],ease_out:[0,0,.58,1],ease_in_out:[.42,0,.58,1]};
export function timeSeconds(value,fps=60){
 if(typeof value==='number'&&Number.isFinite(value))return value;
 if(typeof value==='string'){const m=value.match(/^(\d+(?:\.\d+)?)(ms|s|f)$/);if(m)return Number(m[1])*(m[2]==='ms'?.001:m[2]==='f'?1/fps:1);}
 throw Error('Time must be finite seconds or a string such as 600ms, 2s or 30f');
}
export function curveFor(easing){if(easing==='step')return null;if(typeof easing==='string'&&Object.hasOwn(standardCurves,easing))return standardCurves[easing];if(Array.isArray(easing)&&easing.length===4&&easing.every(Number.isFinite)&&easing[0]>=0&&easing[0]<=1&&easing[2]>=0&&easing[2]<=1&&Math.abs(easing[1])<=3&&Math.abs(easing[3])<=3)return easing;throw Error('Invalid easing; use a named curve, step, or [x1,y1,x2,y2]');}
export function motionProgress(t,easing){if(t<=0)return 0;if(t>=1)return 1;if(easing==='linear')return t;const c=curveFor(easing);if(!c)return 0;const [x1,y1,x2,y2]=c,b=(u,a,d)=>3*(1-u)**2*u*a+3*(1-u)*u*u*d+u**3;let lo=0,hi=1;for(let i=0;i<24;i++){const m=(lo+hi)/2;if(b(m,x1,x2)<t)lo=m;else hi=m;}return b((lo+hi)/2,y1,y2);}
export function lowerTrack(track,fps){
 if(!track||typeof track!=='object')throw Error('Invalid track');const easing=track.ease??'ease_in_out';curveFor(easing);
 const raw=Object.hasOwn(track,'frames')?track.frames:[[0,track.from],[track.duration,track.to]];
 if(!Array.isArray(raw)||raw.length<2||raw.length>256)throw Error('A track requires 2..256 keyframes');
 const frames=raw.map(f=>{if(!Array.isArray(f)||f.length!==2)throw Error('Keyframe must be [time,value]');return [timeSeconds(f[0],fps),f[1]];});let last=-1;
 for(const f of frames){if(f[0]<0||f[0]<=last)throw Error('Keyframe times must be nonnegative and strictly increasing');last=f[0];}
 const options=track.options??{};if(!options||typeof options!=='object'||Array.isArray(options)||Object.keys(options).some(k=>!['repeat','yoyo','delay','easings'].includes(k)))throw Error('Track options: repeat, yoyo, delay, easings');
 const segmentCurves=options.easings??Array(frames.length-1).fill(easing);if(!Array.isArray(segmentCurves)||segmentCurves.length!==frames.length-1)throw Error('easings must match the number of keyframe segments');for(const curve of segmentCurves)curveFor(curve);
 const count=options.repeat??1,reverse=options.yoyo??false,delay=timeSeconds(options.delay??track.delay??0,fps);
 if(!Number.isInteger(count)||count<1||count>16||typeof reverse!=='boolean'||delay<0)throw Error('Repeat must be 1..16, yoyo boolean, delay nonnegative');
 const start=frames[0][0],span=frames.at(-1)[0]-start,result=[];
 // Non-yoyo repeats must meet at the seam; avoid hidden discontinuity/duplicate keys.
 if(count>1&&!reverse&&JSON.stringify(frames[0][1])!==JSON.stringify(frames.at(-1)[1]))throw Error('Repeated tracks require matching endpoints, or yoyo=true');
 for(let i=0;i<count;i++){
  const backwards=reverse&&i%2===1,source=backwards?[...frames].reverse():frames;
  for(let j=0;j<source.length;j++){if(i&&j===0)continue;const f=source[j],local=backwards?frames.at(-1)[0]-f[0]:f[0]-start;result.push([delay+start+i*span+local,f[1]]);}
 }
 if(result.length>256)throw Error('Expanded track exceeds 256 keyframes');
 // Reversed asymmetric easing must be mirrored to truly reverse a segment. Store per-key curves.
 const segmentEases=[];for(let i=0;i<count;i++){const backwards=reverse&&i%2===1;for(let j=0;j<frames.length-1;j++){const original=segmentCurves[backwards?frames.length-2-j:j],c=curveFor(original);segmentEases.push(backwards&&c?[1-c[2],1-c[3],1-c[0],1-c[1]]:original);}}
 return {property:track.property,frames:result,ease:easing,segmentEases};
}
export function lowerEffects(node,fps){
 if(!Array.isArray(node.effects)||node.effects.length>8)throw Error('fx must contain at most 8 effect tuples');const out=[];
 const scaled=(a,k)=>a.map(x=>x*k),mix=(a,b,u)=>a.map((x,i)=>x+(b[i]-x)*u);
 for(const fx of node.effects){if(!Array.isArray(fx)||fx.length<2||fx.length>5)throw Error('Effect: [name,duration,delay?,repeat?,amount?]');const [name,duration,delay=0,count=1,amount]=fx,d=timeSeconds(duration,fps),wait=timeSeconds(delay,fps);
 if(d<=0||wait<0||!Number.isInteger(count)||count<1||count>16)throw Error('Invalid effect duration, delay or repeat');let property,frames,ease='ease_in_out';
 if(name==='fade_in'||name==='fade_out'){if(count!==1)throw Error('Fade effects do not repeat');property='opacity';frames=[[0,name==='fade_in'?0:node.opacity],[d,name==='fade_in'?node.opacity:0]];ease='ease_out';}
 else if(name==='pop'){if(count!==1)throw Error('pop does not repeat');const factor=amount??.6;if(!Number.isFinite(factor)||factor<0||factor>1)throw Error('pop amount must be 0..1');property='scale';frames=[[0,scaled(node.scale,factor)],[d*.65,scaled(node.scale,1.08)],[d,node.scale]];}
 else if(name==='spring_in'){if(count!==1)throw Error('spring_in does not repeat');const factor=amount??.4;if(!Number.isFinite(factor)||factor<0||factor>1)throw Error('spring_in amount must be 0..1');property='scale';ease='linear';frames=Array.from({length:25},(_,i)=>{const t=i/24,p=i===24?1:1-Math.exp(-6*t)*(Math.cos(12*t)+.5*Math.sin(12*t));return [d*t,mix(scaled(node.scale,factor),node.scale,p)];});}
 else if(name==='pulse'){const a=amount??.08;if(!Number.isFinite(a)||a<0||a>1)throw Error('pulse amount must be 0..1');property='scale';frames=[[0,node.scale],[d/2,scaled(node.scale,1+a)],[d,node.scale]];}
 else if(name==='float'){const a=amount??[0,-12];if(!Array.isArray(a)||a.length!==2||!a.every(Number.isFinite))throw Error('float amount must be [dx,dy]');property='position';frames=[[0,node.position],[d/2,node.position.map((x,i)=>x+a[i])],[d,node.position]];}
 else if(name==='shake'){const a=amount??6;if(!Number.isFinite(a)||a<0||a>1000)throw Error('shake amount must be 0..1000');property='position';frames=Array.from({length:9},(_,i)=>[d*i/8,[node.position[0]+(i===0||i===8?0:(i%2?1:-1)*a*(1-i/9)),node.position[1]]]);ease='linear';}
 else if(name==='spin'){const a=amount??360;if(!Number.isFinite(a)||Math.abs(a)>36000)throw Error('spin amount invalid');property='rotation';frames=[[0,node.rotation],[d*count,node.rotation+a*count]];ease='linear';out.push(lowerTrack({property,frames,ease,delay:wait},fps));continue;}
 else if(name==='draw'){if(count!==1)throw Error('draw does not repeat');property='trim_end';frames=[[0,node.trim_start],[d,node.trim_end]];ease='ease_out';}
 else throw Error('Unknown effect: '+name);
 out.push(lowerTrack({property,frames,ease,options:{delay:wait,repeat:count}},fps));
 }
 return out;
}
export const aspectPresets={square:[1080,1080],portrait:[1080,1350],story:[1080,1920],landscape:[1920,1080],cinema:[1920,800]};
export function canvasSize(token,heightOrWidth,overrides={}){
 let size;if(Object.hasOwn(aspectPresets,token)){size=[...aspectPresets[token]];if(overrides.w!==undefined&&overrides.h!==undefined)throw Error('Use only w or h with a preset');if(overrides.w!==undefined)size=[overrides.w,Math.round(overrides.w*size[1]/size[0])];if(overrides.h!==undefined)size=[Math.round(overrides.h*size[0]/size[1]),overrides.h];}
 else if(/^\d+(?:\.\d+)?:\d+(?:\.\d+)?$/.test(token)){const [a,b]=token.split(':').map(Number);if(a<=0||b<=0)throw Error('Aspect ratio must be positive');if(overrides.w!==undefined&&overrides.h!==undefined)throw Error('Use only w or h with a ratio');const w=overrides.w??(overrides.h===undefined?1080:Math.round(overrides.h*a/b));size=[w,overrides.h??Math.round(w*b/a)];}
 else{if(overrides.w!==undefined||overrides.h!==undefined)throw Error('w/h overrides require a preset or ratio');size=[Number(token),Number(heightOrWidth)];}
 if(size.some(n=>!Number.isFinite(n)||n<=0||n>8192))throw Error('Canvas dimensions must be positive and <=8192');return size;
}
