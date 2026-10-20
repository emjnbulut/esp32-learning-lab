import {PARTS,GPIO_PIN,buildNets,pinPos,holePos} from './sim/circuit.mjs';
export const FIRST_CONNECTIONS=[
 ['esp:3V3','bb:bp2'],
 ['esp:GND.R','bb:bn3'],
 ['bb:j9','bb:bn9']
];
const samePoint=(a,b)=>a&&b&&a.every((n,i)=>Math.abs(n-b[i])<0.1);
export function placeFirstParts(diagram){
 const result=JSON.parse(JSON.stringify(diagram)),bb=result.parts.find(p=>p.id==='bb'&&p.type==='breadboard');
 if(!bb)return null;
 for(const [id,type,hole,rot] of [['r1','resistor','bp8',270],['led1','led','f8',0]]){
  let p=result.parts.find(p=>p.id===id);if(p&&p.type!==type)return null;
  if(!p){p={id,type,attrs:{...PARTS[type].attrs}};result.parts.push(p);}
  [p.x,p.y]=holePos(bb,hole);p.rot=rot;
  p.attrs={...PARTS[type].attrs,...p.attrs};
  if(type==='resistor')p.attrs.ohms=220;
 }
 return result;
}
export function firstCircuitChecks(diagram){
 const bb=diagram.parts.find(p=>p.id==='bb'&&p.type==='breadboard'),r=diagram.parts.find(p=>p.id==='r1'&&p.type==='resistor'),led=diagram.parts.find(p=>p.id==='led1'&&p.type==='led');
 if(!bb||!r||!led)return [false,false,false,false];
 const placed=samePoint(pinPos(r,'1'),holePos(bb,'bp8'))&&samePoint(pinPos(r,'2'),holePos(bb,'i8'))&&
  samePoint(pinPos(led,'A'),holePos(bb,'f8'))&&samePoint(pinPos(led,'C'),holePos(bb,'f9'))&&Number(r.attrs.ohms)===220;
 const nets=buildNets(diagram),pins=new Set(diagram.parts.flatMap(p=>PARTS[p.type].pins.map(([name])=>p.id+':'+name)));
 return [!!placed,...FIRST_CONNECTIONS.map(([a,b])=>pins.has(a)&&pins.has(b)&&nets.find(a)===nets.find(b))];
}
// A shortest route through physical wires. Breadboard strips and resting pins are implicit edges.
function shortRoute(diagram,from,to){
 const base=buildNets({...diagram,wires:[]}),start=base.find(from),end=base.find(to),edges=new Map();
 for(const [index,w] of diagram.wires.entries()){
  const a=base.find(w.a),b=base.find(w.b);
  if(!edges.has(a))edges.set(a,[]);if(!edges.has(b))edges.set(b,[]);
  edges.get(a).push([b,index]);edges.get(b).push([a,index]);
 }
 const previous=new Map([[start,null]]),queue=[start];
 for(let i=0;i<queue.length&&!previous.has(end);i++)for(const [next,index] of edges.get(queue[i])||[]){
  if(previous.has(next))continue;previous.set(next,[queue[i],index]);queue.push(next);
 }
 if(!previous.has(end))return [];
 const route=[];let node=end;while(previous.get(node)){const [prior,index]=previous.get(node);route.push(index);node=prior;}
 return route.reverse();
}
export function warningTargets(diagram,warning){
 const board=diagram.parts.find(p=>p.type==='esp32'),vars=warning.vars||{},pins=new Set(),parts=new Set(),wires=new Set();
 if(vars.part){const p=diagram.parts.find(p=>p.id===vars.part);if(p){parts.add(p.id);for(const [pin] of PARTS[p.type].pins)pins.add(p.id+':'+pin);}}
 if(board&&GPIO_PIN[vars.pin])pins.add(board.id+':'+GPIO_PIN[vars.pin]);
 if(board&&['3V3','VIN'].includes(vars.src))pins.add(board.id+':'+vars.src);
 const valid=new Set(diagram.parts.flatMap(p=>PARTS[p.type].pins.map(([name])=>p.id+':'+name)));
 for(const pin of pins)if(!valid.has(pin))pins.delete(pin);
 if(!pins.size)return {pins:[],parts:[],wires:[]};
 let route=[];
 if(board&&vars.src)route=shortRoute(diagram,board.id+':'+vars.src,board.id+':GND.R');
 if(route.length)for(const i of route)wires.add(i);
 else{
  const nets=buildNets(diagram),affected=new Set([...pins].map(p=>nets.find(p)));
  diagram.wires.forEach((w,i)=>{if(affected.has(nets.find(w.a))||affected.has(nets.find(w.b)))wires.add(i);});
 }
 for(const i of wires){pins.add(diagram.wires[i].a);pins.add(diagram.wires[i].b);}
 return {pins:[...pins],parts:[...parts],wires:[...wires]};
}
