// Simulator: runs a compiled sketch against a diagram. The UI calls advance() once per frame;
// tests call runFor() with scripted button/knob actions. All times are virtual microseconds.
import {compile,Machine,CodeError,fmtValue,printf} from './arduino.mjs';
import {PARTS,LED_COLORS,ESP_GPIO,GPIO_PIN,INPUT_ONLY,buildNets,solve} from './circuit.mjs';
const MODE={1:'INPUT',3:'OUTPUT',5:'INPUT_PULLUP',9:'INPUT_PULLDOWN'};
const V33=3.3,R_OUT=10,R_PULL=45000,LED_FULL=0.010;
const RGB_VF={R:1.9,G:2.4,B:2.6};
function hash(a,b){let h=(a*374761393+b*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
export class Simulator{
 constructor(diagram,code){this.diagram=diagram;this.code=code;this.baud=115200;this.reset();}
 reset(){this.clock=0;this.deadline=0;this.now=0;this.pins={};this.out='';this.serialLog=[];this.ledLog=[];this.writes=[];this.events=[];this.warnings=[];this.warned=new Set();
  this.leds={};this.buzzers={};this.status='idle';this.error=null;this.begun=false;this.codeBaud=null;this.dirty=true;this.contactSig='';this.seed=1;this.rand=null;
  this.inputs={};for(const p of this.diagram.parts){if(p.type==='button')this.inputs[p.id]={down:false,ev:[]};if(p.type==='pot')this.inputs[p.id]={pos:p.attrs.pos??0.5};}}
 compile(){try{this.program=compile(this.code);return null;}catch(e){if(e instanceof CodeError)return e;throw e;}}
 start(){this.reset();const e=this.compile();if(e){this.error=e;this.status='error';return e;}
  this.nets=buildNets(this.diagram);this.board=this.diagram.parts.find(p=>p.type==='esp32');
  if(this.diagram.parts.filter(p=>p.type==='esp32').length>1)this.warn('two-boards','Only the first ESP32 is simulated.');
  this.machine=new Machine(this.program,this);this.gen=this.machine.run();this.status='running';this.refresh();return null;}
 stop(){this.status=this.status==='error'?'error':'stopped';this.gen=null;this.leds={};this.buzzers={};}
 // run until the virtual clock reaches now+us
 advance(us){if(this.status!=='running')return;this.now+=us;
  try{while(this.clock<this.now){this.deadline=this.now;const r=this.gen.next();if(r.done){this.status='stopped';break;}}this.refresh();}
  catch(e){this.status='error';this.error=e instanceof CodeError?e:new CodeError('Simulator error: '+e.message);if(!(e instanceof CodeError))console.error(e);}}
 runFor(ms,actions=[]){const end=this.now+ms*1000;const todo=[...actions].sort((a,b)=>a.at-b.at);
  while(this.now<end&&this.status==='running'){const next=todo.length?Math.min(todo[0].at*1000,end):end;const step=Math.min(next-this.now,10000);if(step>0)this.advance(step);
   while(todo.length&&todo[0].at*1000<=this.now){const a=todo.shift();if(a.press!==undefined)this.press(a.press,true);if(a.release!==undefined)this.press(a.release,false);if(a.pot!==undefined)this.setPot(a.pot,a.pos);}}
  return this;}
 warn(key,msg){if(this.warned.has(key))return;this.warned.add(key);this.warnings.push({key,msg,t:this.clock/1000});}
 random(){if(this.rand)return this.rand();return Math.random();}
 randomSeed(s){let x=(Number(s)>>>0)||1;this.rand=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
 // ---------- inputs ----------
 press(id,down){const s=this.inputs[id];if(!s||s.down===down)return;s.down=down;const t=Math.max(this.clock,this.now);s.ev.push({t,down,dur:2000+hash(s.ev.length,this.seed)*4000});if(s.ev.length>40)s.ev.shift();this.events.push({t:t/1000,id,down});this.dirty=true;}
 setPot(id,pos){const s=this.inputs[id];if(!s)return;s.pos=Math.min(1,Math.max(0,pos));this.events.push({t:this.now/1000,id,pos:s.pos});this.dirty=true;}
 contact(part,t){const s=this.inputs[part.id];const e=s.ev.filter(x=>x.t<=t).pop();if(!e)return false;const dt=t-e.t;
  if(part.attrs.bounce&&dt<e.dur){const slot=Math.floor(dt/500);return hash(slot,Math.round(e.t))<0.5?!e.down:e.down;}return e.down;}
 // ---------- host API used by the interpreter ----------
 gpioOk(pin,fn){pin=Number(pin);if(!(pin in GPIO_PIN)){this.warn('pin'+pin,`GPIO ${pin} is not on this ESP32 DevKit board (${fn}). Check the pin number.`);return false;}
  if(pin===1||pin===3)this.warn('uart'+pin,`GPIO ${pin} is used by the USB serial connection. Pick another pin.`);return true;}
 pin(p){return this.pins[p]||(this.pins[p]={mode:null,out:0,duty:null,tone:null});}
 pinMode(p,m){if(!this.gpioOk(p,'pinMode'))return;const s=this.pin(p);s.mode=MODE[m]||'INPUT';if(s.mode==='OUTPUT'&&INPUT_ONLY.has(Number(p)))this.warn('io'+p,`GPIO ${p} is input-only: it cannot drive an LED. Use a pin such as 23 or 25.`);this.dirty=true;this.refresh();}
 digitalWrite(p,v){if(!this.gpioOk(p,'digitalWrite'))return;const s=this.pin(p);if(s.mode!=='OUTPUT'){if(s.mode&&s.mode.startsWith('INPUT')){s.mode=v?'INPUT_PULLUP':'INPUT';}else this.warn('nomode'+p,`digitalWrite(${p}) before pinMode(${p}, OUTPUT): the pin is not driven.`);}
  s.out=v?1:0;s.duty=null;this.writes.push({t:this.clock/1000,pin:Number(p),v:s.out});this.dirty=true;this.refresh();}
 analogWrite(p,v){if(!this.gpioOk(p,'analogWrite'))return;const s=this.pin(p);s.mode='OUTPUT';const d=Math.min(255,Math.max(0,Math.round(v)))/255;s.duty=d>0&&d<1?d:null;s.out=d>=1?1:0;if(s.duty!==null)s.out=0;this.writes.push({t:this.clock/1000,pin:Number(p),v:Math.round(d*255),pwm:true});this.dirty=true;this.refresh();}
 ledcAttach(p){this.pin(p).mode='OUTPUT';return 1;}
 ledcWrite(p,v){this.analogWrite(p,v);return 1;}
 tone(p,f,ms){if(!this.gpioOk(p,'tone'))return;const s=this.pin(p);s.mode='OUTPUT';s.tone={f:Number(f),until:ms?this.clock+ms*1000:Infinity};s.duty=0.5;this.dirty=true;this.refresh();}
 noTone(p){const s=this.pin(p);s.tone=null;s.duty=null;s.out=0;this.dirty=true;this.refresh();}
 attachInterrupt(){throw new CodeError('attachInterrupt() is not supported in the simulator yet. Read the pin in loop() instead.');}
 detachInterrupt(){}
 digitalRead(p){if(!this.gpioOk(p,'digitalRead'))return 0;const s=this.pin(p);if(s.mode==='OUTPUT')return s.duty!==null?(s.duty>=0.5?1:0):s.out;
  if(!s.mode)this.warn('nomodeR'+p,`digitalRead(${p}) before pinMode(${p}, INPUT…).`);this.ensure();const n=this.nodeOf(p);
  if(!n||!this.sol.driven(n))return this.random()<0.5?0:1;return this.sol.v(n)>V33/2?1:0;}
 analogRead(p){if(!this.gpioOk(p,'analogRead'))return 0;if(![32,33,34,35,36,39,4,0,2,15,13,12,14,27,25,26].includes(Number(p)))this.warn('adc'+p,`GPIO ${p} cannot read analog values.`);
  this.ensure();const n=this.nodeOf(p);if(!n||!this.sol.driven(n))return Math.floor(this.random()*4096);
  const raw=Math.round(this.sol.v(n)/V33*4095+(this.random()*4-2));return Math.max(0,Math.min(4095,raw));}
 serial(m,args,types){
  switch(m){
   case 'begin':this.begun=true;this.codeBaud=Number(args[0]);return;
   case 'print':case 'println':case 'printf':case 'write':{let s=m==='printf'?printf(String(args[0]),args.slice(1).map((v,i)=>({v,t:types[i+1]}))):m==='write'?String.fromCharCode(args[0]):(args.length?fmtValue(args[0],types[0],args[1]):'');if(m==='println')s+='\r\n';
    if(!this.begun){this.warn('nobegin','Serial.begin(115200) is missing in setup(): nothing is printed.');return 0;}
    this.out+=s;if(this.out.length>20000)this.out=this.out.slice(-15000);this.serialLog.push({t:this.clock/1000,s});if(this.serialLog.length>4000)this.serialLog.splice(0,1000);this.clock+=s.length*87;return s.length;}
   case 'available':return 0;case 'read':case 'peek':return -1;case 'readString':case 'readStringUntil':return '';case 'parseInt':case 'parseFloat':return 0;}}
 // ---------- circuit ----------
 nodeOf(gpio){if(!this.board)return null;const label=GPIO_PIN[gpio];return label?this.node(this.board.id+':'+label):null;}
 node(k){const n=this.nets.find(k);return n===this.gnd?'GND':n;}
 elements(over={}){const els=[];const b=this.board;if(!b)return els;const t=this.clock;this.gnd=this.nets.find(b.id+':GND.L');const N=k=>this.node(k);
  els.push({t:'V',a:N(b.id+':3V3'),v:V33,r:0.5,tag:{src:'3V3'}},{t:'V',a:N(b.id+':VIN'),v:5,r:0.5,tag:{src:'VIN'}});
  for(const [gpio,s] of Object.entries(this.pins)){const label=GPIO_PIN[gpio];if(!label)continue;const a=N(b.id+':'+label);
   if(s.mode==='OUTPUT'){const hi=gpio in over?over[gpio]:(s.duty!==null?0:s.out);els.push({t:'V',a,v:hi?V33:0,r:R_OUT,tag:{gpio:Number(gpio)}});}
   else if(s.mode==='INPUT_PULLUP')els.push({t:'V',a,v:V33,r:R_PULL});else if(s.mode==='INPUT_PULLDOWN')els.push({t:'V',a,v:0,r:R_PULL});}
  for(const p of this.diagram.parts){const k=pin=>N(p.id+':'+pin);
   switch(p.type){
    case 'led':els.push({t:'D',a:k('A'),k:k('C'),vf:(LED_COLORS[p.attrs.color]||LED_COLORS.red).vf,rs:5,tag:{led:p.id}});break;
    case 'resistor':els.push({t:'R',a:k('1'),b:k('2'),r:Number(p.attrs.ohms)||220});break;
    case 'button':if(this.contact(p,t))els.push({t:'R',a:k('L1'),b:k('R1'),r:0.05});break;
    case 'pot':{const pos=this.inputs[p.id].pos,R=Number(p.attrs.ohms)||10000;els.push({t:'R',a:k('GND'),b:k('SIG'),r:Math.max(1,R*pos)},{t:'R',a:k('SIG'),b:k('VCC'),r:Math.max(1,R*(1-pos))});break;}
    case 'rgb':for(const ch of ['R','G','B'])els.push(p.attrs.common==='anode'?{t:'D',a:k('COM'),k:k(ch),vf:RGB_VF[ch],rs:5,tag:{led:p.id,ch}}:{t:'D',a:k(ch),k:k('COM'),vf:RGB_VF[ch],rs:5,tag:{led:p.id,ch}});break;
    case 'buzzer':els.push({t:'R',a:k('+'),b:k('-'),r:80,tag:{buzzer:p.id}});break;}}
  return els;}
 ensure(){const sig=this.diagram.parts.filter(p=>p.type==='button').map(p=>this.contact(p,this.clock)?1:0).join('');if(sig!==this.contactSig){this.contactSig=sig;this.dirty=true;}if(this.dirty)this.refresh(true);}
 refresh(force){if(!force&&!this.dirty)return;if(!this.nets)return;this.dirty=false;for(const [g,s] of Object.entries(this.pins))if(s.tone&&this.clock>=s.tone.until){s.tone=null;s.duty=null;}
  const els=this.elements();this.sol=solve(els);
  const leds={};const add=(e,amp)=>{const key=e.tag.ch?e.tag.led+':'+e.tag.ch:e.tag.led;leds[key]=(leds[key]||0)+amp;};
  for(const e of els)if(e.t==='D')add(e,e.i);
  // PWM pins: average each LED between its LOW and HIGH state, weighted by duty
  const pwm=Object.entries(this.pins).filter(([g,s])=>s.mode==='OUTPUT'&&s.duty!==null);
  for(const [g,s] of pwm){const hiEls=this.elements({[g]:1});solve(hiEls);for(const e of hiEls)if(e.t==='D'){const key=e.tag.ch?e.tag.led+':'+e.tag.ch:e.tag.led;leds[key]+=(e.i-(els.find(x=>x.t==='D'&&x.tag.led===e.tag.led&&x.tag.ch===e.tag.ch)?.i||0))*s.duty;}
   for(const e of hiEls)if(e.tag?.buzzer&&Math.abs(e.i)>0.005)this.buzzers[e.tag.buzzer]=s.tone?s.tone.f:0;}
  for(const e of els){
   if(e.tag?.gpio!==undefined&&Math.abs(e.i)>0.04)this.warn('over'+e.tag.gpio,`GPIO ${e.tag.gpio} is supplying ${Math.round(Math.abs(e.i)*1000)} mA: that is a short circuit or a missing resistor. A real pin can be damaged.`);
   if(e.tag?.src&&e.i>0.5)this.warn('short'+e.tag.src,`Short circuit: ${e.tag.src} is connected straight to GND. Remove that wire.`);
   if(e.t==='D'&&e.i>0.03)this.warn('led'+e.tag.led+(e.tag.ch||''),`${e.tag.led} gets about ${Math.round(e.i*1000)} mA. A real LED burns out without a resistor: add 220 Ω in series.`);}
  const bz={};for(const e of els)if(e.tag?.buzzer){const on=Math.abs(e.i)>0.005;const drv=Object.entries(this.pins).find(([g,s])=>s.tone&&this.node(this.board.id+':'+GPIO_PIN[g])===e.a);if(drv)bz[e.tag.buzzer]=drv[1].tone.f;else if(on)bz[e.tag.buzzer]=(this.diagram.parts.find(p=>p.id===e.tag.buzzer).attrs.kind==='active'?2300:0);}
  this.buzzers=bz;
  const t=this.clock/1000;for(const [key,i] of Object.entries(leds)){const b=Math.max(0,Math.min(1,i/LED_FULL));const prev=this.leds[key];if(prev===undefined||Math.abs(prev-b)>0.02){this.ledLog.push({t,id:key,b});if(this.ledLog.length>6000)this.ledLog.splice(0,2000);}this.leds[key]=b;}}
 // ---------- view for the UI ----------
 view(){return {leds:this.leds,buzzers:this.buzzers,pressed:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'down' in s).map(([k,s])=>[k,s.down])),pots:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'pos' in s).map(([k,s])=>[k,s.pos])),builtin:this.pins[2]?.mode==='OUTPUT'?(this.pins[2].duty??this.pins[2].out):0,time:this.now/1000};}
}
