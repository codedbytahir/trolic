// Original SVG path normalizer. Supports M/L/H/V/C/S/Q/T/Z, both cases, multiple contours.
// Arc commands are intentionally rejected. All curves lower to exact cubic handles.
export function pathContours(text){
 if(typeof text!=='string'||text.length>100000)throw Error('Path must be a string of at most 100000 characters');
 const pattern=/[MLHVCSQTZmlhvcsqtz]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g;
 if(text.replace(pattern,'').replace(/[\s,]/g,'')!=='')throw Error('Supported path commands: M L H V C S Q T Z (absolute or relative); arcs are not supported');
 const tokens=text.match(pattern)||[];const contours=[];let k=0,cmd=null,active=null,current=[0,0],start=[0,0],previous='',control=null,total=0;
 const command=x=>/^[a-z]$/i.test(x);
 const number=()=>{if(k>=tokens.length||command(tokens[k]))throw Error('Incomplete path command');const n=Number(tokens[k++]);if(!Number.isFinite(n)||Math.abs(n)>1e7)throw Error('Path coordinates must be finite and within ±10000000');return n;};
 const point=relative=>{const p=[number(),number()];return relative?p.map((x,i)=>x+current[i]):p;};
 const push=p=>{active.v.push(p);active.i.push([0,0]);active.o.push([0,0]);current=p;if(++total>8192)throw Error('Maximum 8192 path vertices across all contours');};
 const finish=()=>{if(active){if(active.v.length<2)throw Error('Each contour requires at least two vertices');contours.push(active);active=null;if(contours.length>128)throw Error('Maximum 128 path contours');}};
 const curve=(a,b,end)=>{active.o[active.o.length-1]=a.map((x,i)=>x-current[i]);push(end);active.i[active.i.length-1]=b.map((x,i)=>x-end[i]);};
 while(k<tokens.length){if(command(tokens[k]))cmd=tokens[k++];if(!cmd)throw Error('Expected path command');const op=cmd.toUpperCase(),relative=cmd!==op;
 if(op==='M'){const p=point(relative);finish();active={v:[],i:[],o:[],c:false};push(p);start=p;cmd=relative?'l':'L';control=null;}
 else if(op==='Z'){if(!active)throw Error('Close command requires an open contour');active.c=true;
  const end=active.v.at(-1);if(active.v.length>2&&end.every((x,i)=>x===start[i])){active.i[0]=active.i.pop();active.o.pop();active.v.pop();}
  finish();current=start;cmd=null;control=null;
 }else{if(!active)throw Error('Path contour must start with M');
  if(op==='L'){push(point(relative));control=null;}
  else if(op==='H'){push([number()+(relative?current[0]:0),current[1]]);control=null;}
  else if(op==='V'){push([current[0],number()+(relative?current[1]:0)]);control=null;}
  else if(op==='C'){const a=point(relative),b=point(relative),end=point(relative);curve(a,b,end);control=b;}
  else if(op==='S'){const a=['C','S'].includes(previous)?current.map((x,i)=>2*x-control[i]):[...current];const b=point(relative),end=point(relative);curve(a,b,end);control=b;}
  else if(op==='Q'||op==='T'){const q=op==='Q'?point(relative):(['Q','T'].includes(previous)?current.map((x,i)=>2*x-control[i]):[...current]);const end=point(relative),a=q.map((x,i)=>current[i]+(x-current[i])*2/3),b=q.map((x,i)=>end[i]+(x-end[i])*2/3);curve(a,b,end);control=q;}
  else throw Error('Unsupported path command');
 }
 previous=op;
 }
 finish();if(!contours.length)throw Error('Path requires a contour');return contours;
}
export function pathData(text){const contours=pathContours(text);if(contours.length!==1)throw Error('Use pathContours for compound paths');return contours[0];}
const rgb=c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255);
const constant=k=>({a:0,k});
export function shapeItems(n,animatedProperty,trim=false){
 const rule=n.fill_rule==='evenodd'?2:1;
 const items=n.kind==='path'?pathContours(n.path).map(p=>({ty:'sh',ks:constant(p),d:1})):[{ty:n.kind==='circle'?'el':'rc',d:1,s:constant(n.size),p:constant([0,0]),...(n.kind==='rect'?{r:constant(n.radius)}:{})}];
 if(n.gradient){const g=n.gradient,colors=g.stops.flatMap(([offset,c])=>[offset,...rgb(c)]);if(g.stops.some(s=>s.length===3))colors.push(...g.stops.flatMap(s=>[s[0],s[2]??1]));items.push({ty:'gf',o:constant(100),r:rule,t:g.type==='radial'?2:1,s:constant(g.from),e:constant(g.to),h:constant(0),a:constant(0),g:{p:g.stops.length,k:constant(colors)}});}
 else if(n.fill!=='none')items.push({ty:'fl',c:constant([...rgb(n.fill),1]),o:constant(100),r:rule});
 if(n.stroke!=='none'&&n.stroke_width>0)items.splice(n.kind==='path'?items.filter(x=>x.ty==='sh').length:1,0,{ty:'st',c:constant([...rgb(n.stroke),1]),o:constant(100),w:constant(n.stroke_width),lc:{butt:1,round:2,square:3}[n.line_cap],lj:{miter:1,round:2,bevel:3}[n.line_join],ml:4});
 if(trim)items.push({ty:"tm",s:constant(n.trim_start*100),e:animatedProperty("trim_end"),o:constant(0),m:1});
 return items;
}
