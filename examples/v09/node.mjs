// From repository root: node examples/v09/node.mjs
import {compileForProfile} from '../../api.js';
const source='canvas 100 100 dur=2\ncircle dot p=[50,50] s=[20,20] f=#abcdef';
const {report}=compileForProfile(source,{profile:'portable-basic',budgets:{maxBytes:10000}});
console.log(JSON.stringify(report,null,2));
