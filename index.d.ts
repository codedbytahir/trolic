export declare const VERSION: '1.0.0';
export declare const API_VERSION: '1.0';
export type Vec2 = [number, number];
/** Runtime validation enforces six hex digits; this template only enforces the prefix. */
export type HexColor = `#${string}`;
export type Time = number | `${number}${'ms' | 's' | 'f'}`;
export type Easing = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'step' | [number,number,number,number];
export interface TrackValues {position:Vec2;scale:Vec2;rotation:number;opacity:number;trim_end:number;fill:HexColor;stroke:HexColor;stroke_width:number;size:Vec2;radius:number;path:string}
export type AnimationProperty = keyof TrackValues;
export type Keyframe<T = number | Vec2 | string> = [Time,T];
export interface TrackOptions {repeat?:number;yoyo?:boolean;delay?:Time;easings?:Easing[]}
export type AnimationTrack = {[P in AnimationProperty]: {property:P;ease?:Easing;options?:TrackOptions} & ({frames:Keyframe<TrackValues[P]>[]} | {from:TrackValues[P];to:TrackValues[P];duration:Time;delay?:Time})}[AnimationProperty];
export type EffectName = 'fade_in'|'fade_out'|'pop'|'spring_in'|'pulse'|'float'|'shake'|'spin'|'draw';
export type Effect = [EffectName,Time,Time?,number?,(number|Vec2)?];
export interface Gradient {type:'linear'|'radial';from:Vec2;to:Vec2;stops:[number,HexColor,number?][]}
/** Experimental IR. Types describe the current shape, not a permanently stable serialization schema. */
export interface SceneNode {kind:'circle'|'rect'|'path'|'group';id:string;parent:string|null;position:Vec2;size:Vec2;fill:HexColor|'none';radius:number;stroke:HexColor|'none';stroke_width:number;line_cap:'round'|'butt'|'square';line_join:'miter'|'round'|'bevel';fill_rule:'nonzero'|'evenodd';gradient:Gradient|null;path:string;opacity:number;scale:Vec2;rotation:number;anchor:Vec2;effects:Effect[];trim_start:number;trim_end:number;in_time:Time;out_time:Time|null;tracks:AnimationTrack[]}
export interface Scene {version:string;name:string;size:Vec2;fps:number;duration:number;background:HexColor|'transparent';nodes:SceneNode[]}
export type CompileTarget = 'lottie'|'svg'|'ir'|'agent'|'readable';
export interface CompileStats {shapes:number;tracks:number;sourceTracks:number;keyframes:number;bytes:number}
export interface CompileResult {output:string;scene:Scene;stats:CompileStats}
export interface Diagnostic {code:string;line:number;severity:'error';message:string}
export type Diagnosis = {ok:true;diagnostics:Diagnostic[];stats:CompileStats} | {ok:false;diagnostics:Diagnostic[]};
export declare class TrolicError extends Error {constructor(message:string,line?:number);line:number;code:string}
export declare function parse(source:string):Scene;
export declare function validate(scene:Scene):Scene;
export declare function compile(source:string,target?:CompileTarget,time?:number):CompileResult;
export declare function diagnose(source:string,target?:CompileTarget):Diagnosis;
export declare function svg(scene:Scene,time?:number):string;
export interface LottieAnimation {v:string;fr:number;ip:number;op:number;w:number;h:number;nm:string;ddd:number;assets:unknown[];layers:Record<string,unknown>[]}
export declare function lottie(scene:Scene):LottieAnimation;
export declare function sample(node:SceneNode,time:number):SceneNode;
export interface CompactOptions {reuse?:boolean;batch?:boolean;styles?:boolean;constants?:boolean}
export declare function compact(source:string,options?:CompactOptions):string;
export declare function readable(source:string):string;
export declare function retime(source:string,duration:Time):string;
export declare function reframe(source:string,size:Vec2,options?:{fit?:'contain'|'cover'}):string;
export interface FrameRenderer {duration:number;size:Vec2;frame(time:number):string}
export declare function createRenderer(scene:Scene):FrameRenderer;
export type DeliveryProfile = 'lottie-web-svg'|'portable-basic';
export interface DeliveryBudgets {maxNodes?:number;maxTracks?:number;maxKeyframes?:number;maxBytes?:number;maxDuration?:number;maxFps?:number;maxVertices?:number}
export interface DeliveryOptions {profile?:DeliveryProfile;budgets?:DeliveryBudgets}
export interface DeliveryIssue {code:string;severity:'error'|'warning';message:string;line?:number;feature?:string;nodeIds?:string[];metric?:string;value?:number;limit?:number}
export interface DeliveryMetrics {nodes:number;tracks:number;keyframes:number;jsonBytes:number;vertices:number;duration:number;fps:number;width:number;height:number}
export interface DeliveryFeature {name:string;count:number;nodeIds:string[]}
export interface DeliveryReport {ok:boolean;profile:DeliveryProfile;evidence:string;features:DeliveryFeature[];stats:DeliveryMetrics|null;issues:DeliveryIssue[]}
export declare const deliveryProfiles:Readonly<Record<DeliveryProfile,Readonly<{label:string;evidence:string;restricted:readonly string[]}>>>;
/** Invalid source returns an error report; invalid options throw. Does not repair or simplify. */
export declare function analyzeDelivery(source:string,options?:DeliveryOptions):DeliveryReport;
export declare class TrolicDeliveryError extends Error {constructor(report:DeliveryReport);code:'TROLIC_DELIVERY_BLOCKED';report:DeliveryReport}
export declare function compileForProfile(source:string,options?:DeliveryOptions):CompileResult & {report:DeliveryReport};
