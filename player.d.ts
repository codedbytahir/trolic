import type {DeliveryOptions,DeliveryReport} from './index.js';
export interface LottieAnimationItem {isLoaded?:boolean;addEventListener(name:'DOMLoaded'|'data_failed',handler:()=>void):unknown;removeEventListener?(name:'DOMLoaded'|'data_failed',handler:()=>void):unknown;play():void;pause():void;goToAndStop(frame:number,isFrame:boolean):void;setSpeed?(value:number):void;destroy():void}
export interface LottieLibrary {loadAnimation(options:{container:HTMLElement;renderer:'svg';loop:boolean;autoplay:boolean;animationData:unknown}):LottieAnimationItem}
export interface TrolicPlayerOptions extends DeliveryOptions {lottie:LottieLibrary;source:string;loop?:boolean;autoplay?:boolean;respectReducedMotion?:boolean;label?:string;loadingTimeoutMs?:number;onError?:(error:unknown)=>void}
export interface TrolicPlayer {setSource(source:string):Promise<DeliveryReport>;play():void;pause():void;seek(seconds:number):void;setSpeed(value:number):void;readonly duration:number;readonly report:DeliveryReport|null;destroy():void}
/** Async DOM-ready creation. Superseded requests reject with AbortError; invalid updates keep the last valid player. */
export declare function createTrolicPlayer(container:HTMLElement,options:TrolicPlayerOptions):Promise<TrolicPlayer>;
