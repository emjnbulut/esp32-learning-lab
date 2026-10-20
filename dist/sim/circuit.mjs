// Parts, nets and a small DC solver. Geometry uses 10 units per 0.1" breadboard pitch; every part
// is placed by its anchor (pin 0 sits on the anchor) and may be rotated in 90° steps.
export const PITCH=10;
const ESP_LEFT=['EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','GND.L','VIN'];
const ESP_RIGHT=['D23','D22','TX0','RX0','D21','D19','D18','D5','TX2','RX2','D4','D2','D15','GND.R','3V3'];
export const ESP_GPIO={VP:36,VN:39,TX0:1,RX0:3,TX2:17,RX2:16};
for(const n of [...ESP_LEFT,...ESP_RIGHT]){const m=n.match(/^D(\d+)$/);if(m)ESP_GPIO[n]=Number(m[1]);}
export const GPIO_PIN=Object.fromEntries(Object.entries(ESP_GPIO).map(([k,v])=>[v,k]));
export const INPUT_ONLY=new Set([34,35,36,39]);
const BB_ROWS={tp:0,tn:10,a:30,b:40,c:50,d:60,e:70,f:100,g:110,h:120,i:130,j:140,bp:160,bn:170};
const RAIL_COLS=[2,3,4,5,6,8,9,10,11,12,14,15,16,17,18,20,21,22,23,24,26,27,28,29,30];
function bbHoles(){const h=[];for(const [r,y] of Object.entries(BB_ROWS)){const rail=r.length===2;for(let c=1;c<=30;c++){if(rail&&!RAIL_COLS.includes(c))continue;h.push({name:r+c,x:(c-1)*PITCH,y,net:rail?'rail-'+r:(('abcde'.includes(r)?'top':'bot')+c)});}}return h;}
const BB_HOLES=bbHoles();
export const LED_COLORS={red:{vf:2.0,css:'#ff4d3a'},green:{vf:2.1,css:'#3bd16f'},yellow:{vf:2.1,css:'#ffd23a'},blue:{vf:2.9,css:'#3d8bff'},white:{vf:2.9,css:'#f4f6ff'},orange:{vf:2.0,css:'#ff8a2a'}};
// pins: [name,x,y]; box: [x0,y0,x1,y1] for hit testing and layout
export const PARTS={
 esp32:{label:'ESP32 DevKit',pins:[...ESP_LEFT.map((n,i)=>[n,0,i*PITCH]),...ESP_RIGHT.map((n,i)=>[n,90,i*PITCH])],box:[-14,-58,104,176]},
 breadboard:{label:'Breadboard',pins:BB_HOLES.map(h=>[h.name,h.x,h.y]),box:[-14,-12,304,182]},
 led:{label:'LED',pins:[['A',0,0],['C',PITCH,0]],box:[-6,-38,16,4],attrs:{color:'red'}},
 resistor:{label:'Resistor',pins:[['1',0,0],['2',3*PITCH,0]],box:[-3,-6,33,6],attrs:{ohms:220}},
 button:{label:'Push button',pins:[['L1',0,0],['R1',2*PITCH,0],['L2',0,3*PITCH],['R2',2*PITCH,3*PITCH]],box:[-5,-3,25,33],attrs:{bounce:true}},
 pot:{label:'Potentiometer',pins:[['GND',0,0],['SIG',PITCH,0],['VCC',2*PITCH,0]],box:[-12,-42,32,4],attrs:{ohms:10000,pos:0.5}},
 rgb:{label:'RGB LED',pins:[['R',0,0],['COM',PITCH,0],['G',2*PITCH,0],['B',3*PITCH,0]],box:[-4,-40,34,4],attrs:{common:'cathode'}},
 buzzer:{label:'Buzzer',pins:[['-',0,0],['+',2*PITCH,0]],box:[-12,-34,32,4],attrs:{}},
 ldr:{label:'LDR light sensor',pins:[['GND',0,0],['SIG',PITCH,0],['VCC',2*PITCH,0]],box:[-10,-42,30,4],attrs:{light:0.5}},
 dht11:{label:'DHT11 sensor',pins:[['VCC',0,0],['DATA',PITCH,0],['GND',2*PITCH,0]],box:[-8,-44,28,4],attrs:{temp:24,hum:50}},
 oled:{label:'OLED display',pins:[['GND',0,0],['VCC',PITCH,0],['SCL',2*PITCH,0],['SDA',3*PITCH,0]],box:[-16,-54,46,4],attrs:{}},
 pir:{label:'PIR motion sensor',pins:[['VCC',0,0],['OUT',PITCH,0],['GND',2*PITCH,0]],box:[-10,-44,30,4],attrs:{motion:false}},
 relay:{label:'Relay module',pins:[['VCC',0,0],['GND',PITCH,0],['IN',2*PITCH,0]],box:[-10,-46,30,4],attrs:{activeLow:true}}
};
export function rotatePt(x,y,rot){switch(((rot||0)%360+360)%360){case 90:return [-y,x];case 180:return [-x,-y];case 270:return [y,-x];default:return [x,y];}}
export function pinPos(part,name){const def=PARTS[part.type];const p=def.pins.find(q=>q[0]===name);if(!p)return null;const [x,y]=rotatePt(p[1],p[2],part.rot);return [part.x+x,part.y+y];}
export function partPins(part){return PARTS[part.type].pins.map(([n,x,y])=>{const [rx,ry]=rotatePt(x,y,part.rot);return {name:n,x:part.x+rx,y:part.y+ry};});}
// "bb:e10" style anchors used by lesson authors
export function holePos(bb,name){const h=BB_HOLES.find(q=>q.name===name);if(!h)throw new Error('No breadboard hole '+name);return [bb.x+h.x,bb.y+h.y];}
export function resolveDiagram(d){const parts=d.parts.map(p=>({rot:0,attrs:{},...p,attrs:{...(PARTS[p.type].attrs||{}),...(p.attrs||{})}}));
 for(const p of parts)if(p.at){const [ref,hole]=p.at.split(':');const bb=parts.find(q=>q.id===ref);[p.x,p.y]=holePos(bb,hole);delete p.at;}
 return {parts,wires:(d.wires||[]).map(w=>({...w}))};}

// ---------- nets ----------
class DSU{constructor(){this.p=new Map();}find(x){let r=x;while(this.p.has(r)&&this.p.get(r)!==r)r=this.p.get(r);if(!this.p.has(r))this.p.set(r,r);let c=x;while(c!==r){const n=this.p.get(c);this.p.set(c,r);c=n;}return r;}union(a,b){const ra=this.find(a),rb=this.find(b);if(ra!==rb)this.p.set(ra,rb);}}
export function buildNets(diagram){const dsu=new DSU();const key=(id,pin)=>id+':'+pin;
 const bbs=diagram.parts.filter(p=>p.type==='breadboard');
 for(const bb of bbs)for(const h of BB_HOLES)dsu.union(key(bb.id,h.name),bb.id+'#'+h.net);
 // part pins resting on breadboard holes join them
 const holeAt=new Map();for(const bb of bbs)for(const h of BB_HOLES){const [x,y]=holePos(bb,h.name);holeAt.set(Math.round(x)+','+Math.round(y),key(bb.id,h.name));}
 const onHole={};
 for(const p of diagram.parts){if(p.type==='breadboard')continue;for(const pin of partPins(p)){const k=holeAt.get(Math.round(pin.x)+','+Math.round(pin.y));if(k){dsu.union(key(p.id,pin.name),k);onHole[key(p.id,pin.name)]=k;}}
  if(p.type==='button'){dsu.union(key(p.id,'L1'),key(p.id,'L2'));dsu.union(key(p.id,'R1'),key(p.id,'R2'));}
  if(p.type==='esp32')dsu.union(key(p.id,'GND.L'),key(p.id,'GND.R'));}
 for(const w of diagram.wires)dsu.union(w.a,w.b);
 return {find:k=>dsu.find(k),onHole};}

// ---------- DC solver ----------
// elements: {t:'R',a,b,r} {t:'D',a,k,vf,rs,tag} {t:'V',a,v,r,tag} ; node 'GND' is the reference
function gauss(A,b){const n=b.length;for(let c=0;c<n;c++){let m=c;for(let r=c+1;r<n;r++)if(Math.abs(A[r][c])>Math.abs(A[m][c]))m=r;[A[c],A[m]]=[A[m],A[c]];[b[c],b[m]]=[b[m],b[c]];const piv=A[c][c];if(Math.abs(piv)<1e-18)continue;
  for(let r=c+1;r<n;r++){const f=A[r][c]/piv;if(!f)continue;for(let k=c;k<n;k++)A[r][k]-=f*A[c][k];b[r]-=f*b[c];}}
 const x=new Array(n).fill(0);for(let r=n-1;r>=0;r--){let s=b[r];for(let k=r+1;k<n;k++)s-=A[r][k]*x[k];x[r]=Math.abs(A[r][r])<1e-18?0:s/A[r][r];}return x;}
export function solve(elements){
 const nodes=new Map();const idx=n=>{if(n==='GND')return -1;if(!nodes.has(n))nodes.set(n,nodes.size);return nodes.get(n);};
 for(const e of elements){if(e.t==='V')idx(e.a);else{idx(e.a);idx(e.t==='D'?e.k:e.b);}}
 const N=nodes.size;const diodes=elements.filter(e=>e.t==='D');diodes.forEach(d=>d.on=false);
 let V=new Array(N).fill(0);
 for(let iter=0;iter<30;iter++){
  const A=Array.from({length:N},()=>new Array(N).fill(0)),b=new Array(N).fill(0);
  const g2=(a,c,g)=>{const i=idx(a),j=idx(c);if(i>=0)A[i][i]+=g;if(j>=0)A[j][j]+=g;if(i>=0&&j>=0){A[i][j]-=g;A[j][i]-=g;}};
  const inj=(a,cur)=>{const i=idx(a);if(i>=0)b[i]+=cur;};
  for(let i=0;i<N;i++)A[i][i]+=1e-9; // tiny leak keeps floating nodes solvable
  for(const e of elements){
   if(e.t==='R')g2(e.a,e.b,1/Math.max(e.r,1e-3));
   else if(e.t==='V'){g2(e.a,'GND',1/e.r);inj(e.a,e.v/e.r);}
   else if(e.t==='D'&&e.on){const g=1/e.rs;g2(e.a,e.k,g);inj(e.a,e.vf*g);inj(e.k,-e.vf*g);}}
  V=gauss(A,b);
  const v=n=>n==='GND'?0:V[idx(n)];let changed=false;
  for(const d of diodes){const vd=v(d.a)-v(d.k);if(!d.on&&vd>d.vf+1e-4){d.on=true;changed=true;}else if(d.on&&vd<d.vf-1e-6){d.on=false;changed=true;}}
  if(!changed)break;}
 const v=n=>n==='GND'?0:(nodes.has(n)?V[idx(n)]:0);
 for(const e of elements){if(e.t==='R')e.i=(v(e.a)-v(e.b))/Math.max(e.r,1e-3);else if(e.t==='V')e.i=(e.v-v(e.a))/e.r;else if(e.t==='D')e.i=e.on?(v(e.a)-v(e.k)-e.vf)/e.rs:0;}
 // nodes with a conductive path to ground or a source are driven; the rest float
 const adj=new Map();const link=(a,c)=>{if(!adj.has(a))adj.set(a,[]);if(!adj.has(c))adj.set(c,[]);adj.get(a).push(c);adj.get(c).push(a);};
 for(const e of elements){if(e.t==='R')link(e.a,e.b);else if(e.t==='V')link(e.a,'GND');else if(e.t==='D'&&e.on)link(e.a,e.k);}
 const driven=new Set(['GND']);const q=['GND'];while(q.length){const n=q.pop();for(const m of adj.get(n)||[])if(!driven.has(m)){driven.add(m);q.push(m);}}
 return {v,driven:n=>driven.has(n)};
}
