import type {Scene,SceneNode,Vec2,AnimationTrack,AnimationProperty,Effect,Time,Easing,TrackValues} from './index.js';
export type EditableProperty = 'position'|'size'|'rotation'|'scale'|'anchor'|'opacity'|'fill'|'stroke'|'stroke_width'|'radius';
export type NodeChanges = Partial<Pick<SceneNode,EditableProperty>>;
export declare const editableProperties:readonly EditableProperty[];
export declare const effectProperties:Readonly<Record<string,AnimationProperty>>;
export declare function propertyState(node:SceneNode,property:string):{editable:boolean;reason:string};
export declare function patchNodeSource(source:string,id:string,changes:NodeChanges):string;
export declare function patchAnimationSource(source:string,id:string,changes:{tracks?:AnimationTrack[];effects?:Effect[];in_time?:Time;out_time?:Time|null}):string;
export interface RevisionOptions {revision?:number}
export declare class StudioDocument {constructor(source:string,options?:{limit?:number});readonly source:string;readonly revision:number;readonly canUndo:boolean;readonly canRedo:boolean;commit(source:string,options?:RevisionOptions):{changed:boolean;revision:number};patch(id:string,changes:NodeChanges,options?:RevisionOptions):{changed:boolean;revision:number};undo():boolean;redo():boolean}
export type Matrix2D=[number,number,number,number,number,number];
export declare function parentMatrix(scene:Scene,id:string,time?:number):Matrix2D;
export declare function localDelta(matrix:Matrix2D,dx:number,dy:number):Vec2;
export interface Draft {format:'trolic-draft';version:1;source:string;selection:string|null;savedAt:number}
export declare function encodeDraft(source:string,selection?:string|null,now?:number):string;
export declare function decodeDraft(text:string):Draft;
export interface TimelineRow {nodeId:string;property:AnimationProperty;origin:'track'|'effect';rawIndex:number;generated:boolean;effect?:string;frames:[number,number|Vec2|string][];easings:Easing[]}
export declare function timelineData(source:string):{scene:Scene;rows:TimelineRow[]};
export declare function convertTimelineTrack(source:string,id:string,property:AnimationProperty):string;
export declare function editTimelineKey<P extends AnimationProperty>(source:string,id:string,property:P,index:number,changes:{time?:number;value?:TrackValues[P];easing?:Easing}):string;
export declare function addTimelineKey(source:string,id:string,property:AnimationProperty,time:number):string;
export declare function deleteTimelineKey(source:string,id:string,property:AnimationProperty,index:number):string;
export declare function removeTimelineTrack(source:string,id:string,property:AnimationProperty):string;
export declare function availableTimelineProperties(node:SceneNode):AnimationProperty[];
export declare function addTimelineTrack(source:string,id:string,property:AnimationProperty):string;
export declare function editTimelineVisibility(source:string,id:string,start:number,end:number|null):string;
export declare function snapTimelineTime(time:number,fps:number,duration:number):number;
