// Framework-neutral browser adapter. Inject your own Lottie-web instance; no CDN or model calls.
import {compileForProfile} from './delivery.js';
const playerAbort=message=>{const error=new Error(message);error.name='AbortError';return error;};
export async function createTrolicPlayer(container,options){
 if(!container||container.nodeType!==1||!container.ownerDocument||typeof container.appendChild!=='function')throw TypeError('Provide a dedicated DOM container');
 if(!options||typeof options!=='object'||Object.keys(options).some(k=>!['lottie','source','loop','autoplay','respectReducedMotion','label','profile','budgets','loadingTimeoutMs','onError'].includes(k)))throw TypeError('Invalid player options');
 const {lottie}=options;if(typeof lottie?.loadAnimation!=='function')throw TypeError('Inject a Lottie-web library with loadAnimation');
 for(const key of ['loop','autoplay','respectReducedMotion'])if(options[key]!==undefined&&typeof options[key]!=='boolean')throw TypeError(key+' must be boolean');
 if(options.label!==undefined&&(typeof options.label!=='string'||options.label.length>512))throw TypeError('Label must be at most 512 characters');
 if(options.onError!==undefined&&typeof options.onError!=='function')throw TypeError('onError must be a function');
 const timeoutMs=options.loadingTimeoutMs??10000;if(!Number.isInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)throw TypeError('Loading timeout must be 100..60000 ms');
 const document=container.ownerDocument,view=document.defaultView,media=options.respectReducedMotion===false?null:view?.matchMedia?.('(prefers-reduced-motion: reduce)');let destroyed=false,generation=0,current=null,pending=null,wantsPlay=options.autoplay??true,speed=1;
 const notify=error=>{try{options.onError?.(error);}catch{/* A notification callback must not break cleanup. */}};
 const dispose=(animation,host)=>{try{animation?.destroy();}catch{/* Cleanup must still remove owned DOM and listeners. */}finally{host.remove();}};
 const alive=()=>{if(destroyed)throw Error('Player has been destroyed');};
 function playback(){if(!current)return;current.animation.setSpeed?.(speed);if(media?.matches)current.animation.goToAndStop(0,true);else if(wantsPlay)current.animation.play();else current.animation.pause();}
 const preferenceChange=()=>playback();if(media?.addEventListener)media.addEventListener('change',preferenceChange);else media?.addListener?.(preferenceChange);
 async function setSource(source){alive();let compiled;try{compiled=compileForProfile(source,{profile:options.profile??'lottie-web-svg',budgets:options.budgets??{}});}catch(error){notify(error);throw error;}
  const id=++generation;pending?.cancel(playerAbort('Superseded by a newer source'));const host=document.createElement('div');host.className='trolic-player';host.style.width='100%';host.style.height='100%';host.style.display='none';if(options.label){host.setAttribute('role','img');host.setAttribute('aria-label',options.label);}else host.setAttribute('aria-hidden','true');container.appendChild(host);
  return new Promise((resolve,reject)=>{let animation=null,settled=false,timer=null;
   function cleanup(){clearTimeout(timer);animation?.removeEventListener?.('DOMLoaded',ready);animation?.removeEventListener?.('data_failed',failed);if(pending?.id===id)pending=null;}
   function fail(error){if(settled)return;settled=true;cleanup();dispose(animation,host);if(error.name!=='AbortError')notify(error);reject(error);}
   function failed(){fail(Error('Lottie player failed to load the compiled animation'));}
   function ready(){if(settled)return;if(destroyed||id!==generation){fail(playerAbort('Source request is no longer active'));return;}cleanup();const previous=current;try{current={animation,host,compiled};host.style.display='block';playback();}catch(error){current=previous;settled=true;dispose(animation,host);notify(error);reject(error);return;}settled=true;if(previous)dispose(previous.animation,previous.host);resolve(compiled.report);}
   pending={id,cancel:fail};try{animation=lottie.loadAnimation({container:host,renderer:'svg',loop:options.loop??true,autoplay:false,animationData:JSON.parse(compiled.output)});if(!animation||typeof animation.addEventListener!=='function'||['destroy','play','pause','goToAndStop'].some(name=>typeof animation[name]!=='function')||(animation.setSpeed!==undefined&&typeof animation.setSpeed!=='function'))throw Error('Lottie library returned an invalid animation');animation.addEventListener('DOMLoaded',ready);animation.addEventListener('data_failed',failed);timer=setTimeout(()=>fail(Error('Timed out waiting for Lottie DOMLoaded')),timeoutMs);if(animation.isLoaded)queueMicrotask(ready);}catch(error){fail(error);}
  });
 }
 const controller={setSource,play(){alive();wantsPlay=true;playback();},pause(){alive();wantsPlay=false;current?.animation.pause();},seek(seconds){alive();if(!Number.isFinite(seconds)||seconds<0)throw RangeError('Seek time must be finite and nonnegative');wantsPlay=false;if(current){const scene=current.compiled.scene,frame=Math.min(seconds*scene.fps,Math.max(0,scene.duration*scene.fps-.001));current.animation.goToAndStop(frame,true);}},setSpeed(value){alive();if(!Number.isFinite(value)||value<.1||value>4)throw RangeError('Playback speed must be 0.1..4');speed=value;current?.animation.setSpeed?.(speed);},get duration(){return current?.compiled.scene.duration??0;},get report(){return current?.compiled.report??null;},destroy(){if(destroyed)return;destroyed=true;generation++;pending?.cancel(playerAbort('Player destroyed'));if(current){dispose(current.animation,current.host);current=null;}if(media?.removeEventListener)media.removeEventListener('change',preferenceChange);else media?.removeListener?.(preferenceChange);}};
 try{await setSource(options.source);return controller;}catch(error){controller.destroy();throw error;}
}
