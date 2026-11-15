// Run from the repository root: node examples/v1/agent.mjs
import {AgentSession} from '../../agent-tools.js';
const session=new AgentSession('canvas 100 100 dur=2\ncircle dot p=[50,50] s=[20,20] f=#abcdef');
console.log(session.inspect(['dot'],{fields:['p','f']}));
console.log(session.edit('edit dot f=#fedcba',{revision:session.revision}));
console.log(session.export('svg'));
