import type {CompileTarget} from './index.js';
export type InspectionAlias='p'|'s'|'f'|'r'|'z'|'o'|'d'|'g'|'ink'|'sw'|'cap'|'join'|'rule'|'round'|'parent'|'t'|'a'|'fx'|'ts'|'te'|'in'|'out';
export declare class AgentSession {constructor(source:string);readonly revision:number;readonly source:string;inspect(ids:string[],options?:{fields?:InspectionAlias[]}):{id:string;kind:string;fields:Record<string,unknown>}[];edit(edits:string,options:{revision:number}):{ok:true;revision:number;edited:number;nodes:number};export(target?:CompileTarget,time?:number):string}
