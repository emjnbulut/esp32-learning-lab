// Simulator: runs a compiled sketch against a diagram. The UI calls advance() once per frame;
// tests call runFor() with scripted button/knob actions. All times are virtual microseconds.
import {compile,Machine,CodeError,fmtValue,printf} from './arduino.mjs';
import {SerialInput} from './serial-input.mjs';
import {PARTS,LED_COLORS,ESP_GPIO,GPIO_PIN,INPUT_ONLY,buildNets,solve} from './circuit.mjs';
const MODE={1:'INPUT',3:'OUTPUT',5:'INPUT_PULLUP',9:'INPUT_PULLDOWN'};
const V33=3.3,R_OUT=10,R_PULL=45000,LED_FULL=0.010;
const RGB_VF={R:1.9,G:2.4,B:2.6};
function hash(a,b){let h=(a*374761393+b*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return ((h^(h>>>16))>>>0)/4294967296;}
export class Simulator{
 constructor(diagram,code){this.diagram=diagram;this.code=code;this.baud=115200;this.reset();}
 reset(){this.clock=0;this.deadline=0;this.now=0;this.pins={};this.out='';this.serialLog=[];this.ledLog=[];this.buzzerLog=[];this.relayLog=[];this.writes=[];this.events=[];this.warnings=[];this.warned=new Set();
  this.leds={};this.ledI={};this.logged={};this.buzzers={};this.relays={};this.irqs={};this.pendingIsr=[];this.interruptsEnabled=true;this.status='idle';this.error=null;this.begun=false;this.codeBaud=null;this.rx=new SerialInput(this);this.dirty=true;this.contactSig='';this.seed=1;this.rand=null;
  this.dhtState={pin:null,begun:false};this.oledState={begun:false,size:1,color:1,cx:0,cy:0,buf:[],screen:[],draws:0,invert:false};
  this.wifiState={status:6,ssid:'',ip:'192.168.1.42',rssi:-52};this.webState={begun:false,port:80,routes:new Map(),queue:[],uri:'/',lastCode:0,lastType:'',lastHtml:'',requests:0};
  this.inputs={};for(const p of this.diagram.parts){
   if(p.type==='button')this.inputs[p.id]={down:false,ev:[]};
   if(p.type==='pot')this.inputs[p.id]={pos:p.attrs.pos??0.5};
   if(p.type==='ldr')this.inputs[p.id]={light:p.attrs.light??0.5};
   if(p.type==='dht11')this.inputs[p.id]={temp:p.attrs.temp??24,hum:p.attrs.hum??50};
   if(p.type==='pir')this.inputs[p.id]={motion:!!p.attrs.motion};
  }}
 compile(){try{this.program=compile(this.code);return null;}catch(e){if(e instanceof CodeError)return e;throw e;}}
 start(){this.reset();const e=this.compile();if(e){this.error=e;this.status='error';return e;}
  this.nets=buildNets(this.diagram);this.board=this.diagram.parts.find(p=>p.type==='esp32');
  if(this.diagram.parts.filter(p=>p.type==='esp32').length>1)this.warn('two-boards','Only the first ESP32 is simulated.');
  this.machine=new Machine(this.program,this);this.gen=this.machine.run();this.status='running';this.refresh();return null;}
 stop(){this.status=this.status==='error'?'error':'stopped';this.gen=null;this.leds={};this.buzzers={};this.relays={};}
 // run until the virtual clock reaches now+us
 advance(us){if(this.status!=='running')return;this.now+=us;
  try{while(this.clock<this.now){this.deadline=this.now;const r=this.gen.next();if(r.done){this.status='stopped';break;}}
   for(const s of Object.values(this.pins))if(s.tone&&this.clock>=s.tone.until)this.dirty=true;
   this.refresh();}
  catch(e){this.status='error';this.error=e instanceof CodeError?e:new CodeError('Simulator error: '+e.message);if(!(e instanceof CodeError))console.error(e);}}
 runFor(ms,actions=[]){const end=this.now+ms*1000;const todo=[...actions].sort((a,b)=>a.at-b.at);
  while(this.now<end&&this.status==='running'){const next=todo.length?Math.min(todo[0].at*1000,end):end;const step=Math.min(next-this.now,10000);if(step>0)this.advance(step);
   while(todo.length&&todo[0].at*1000<=this.now){const a=todo.shift();if(a.press!==undefined)this.press(a.press,true);if(a.release!==undefined)this.press(a.release,false);if(a.pot!==undefined)this.setPot(a.pot,a.pos);if(a.ldr!==undefined)this.setLight(a.ldr,a.light);if(a.dht!==undefined)this.setDht(a.dht,a);if(a.pir!==undefined)this.setPir(a.pir,a.motion);if(a.http!==undefined)this.requestHttp(a.http);if(a.serial!==undefined)this.receiveSerial(a.serial);}}
  return this;}
 // warnings keep an English template so the UI can translate them; msg is the filled-in English text
 warn(key,tpl,vars={}){if(this.warned.has(key))return;this.warned.add(key);let msg=tpl;for(const k in vars)msg=msg.split('{'+k+'}').join(vars[k]);this.warnings.push({key,tpl,vars,msg,t:this.clock/1000});}
 random(){if(this.rand)return this.rand();return Math.random();}
 randomSeed(s){let x=(Number(s)>>>0)||1;this.rand=()=>{x^=x<<13;x>>>=0;x^=x>>>17;x^=x<<5;x>>>=0;return x/4294967296;};}
 // ---------- inputs ----------
 press(id,down){const s=this.inputs[id];if(!s||s.down===down)return;s.down=down;const t=Math.max(this.clock,this.now);s.ev.push({t,down,dur:2000+hash(s.ev.length,this.seed)*4000});if(s.ev.length>40)s.ev.shift();this.events.push({t:t/1000,id,down});this.dirty=true;this.refresh();}
 setPot(id,pos){const s=this.inputs[id];if(!s)return;s.pos=Math.min(1,Math.max(0,pos));this.events.push({t:this.now/1000,id,pos:s.pos});this.dirty=true;}
 setLight(id,light){const s=this.inputs[id];if(!s)return;s.light=Math.min(1,Math.max(0,Number(light)));this.events.push({t:this.now/1000,id,light:s.light});this.dirty=true;}
 setDht(id,{temp,hum}){const s=this.inputs[id];if(!s)return;if(temp!==undefined)s.temp=Math.max(-40,Math.min(125,Number(temp)));if(hum!==undefined)s.hum=Math.max(0,Math.min(100,Number(hum)));this.events.push({t:this.now/1000,id,temp:s.temp,hum:s.hum});this.dirty=true;}
 setPir(id,motion){const s=this.inputs[id];if(!s||s.motion===!!motion)return;s.motion=!!motion;this.events.push({t:this.now/1000,id,motion:s.motion});this.dirty=true;this.refresh();}
 requestHttp(uri){if(this.status!=='running'||!this.webState.begun)return false;this.webState.queue.push({uri:String(uri||'/')});this.events.push({t:this.now/1000,http:String(uri||'/')});return true;}
 contact(part,t){const s=this.inputs[part.id];const e=s.ev.filter(x=>x.t<=t).pop();if(!e)return false;const dt=t-e.t;
  if(part.attrs.bounce&&dt<e.dur){const slot=Math.floor(dt/500);return hash(slot,Math.round(e.t))<0.5?!e.down:e.down;}return e.down;}
 receiveSerial(text){return this.status==='running'&&this.begun&&this.rx.enqueue(text);}
 // ---------- host API used by the interpreter ----------
 initDevice(cls,name,args){if(cls==='DHT')this.dhtState.pin=Number(args[0]);if(cls==='WebServer')this.webState.port=Number(args[0])||80;}
 gpioOk(pin,fn){pin=Number(pin);if(!(pin in GPIO_PIN)){this.warn('pin'+pin,'GPIO {pin} is not on this ESP32 DevKit board ({fn}). Check the pin number.',{pin,fn});return false;}
  if(pin===1||pin===3)this.warn('uart'+pin,'GPIO {pin} is used by the USB serial connection. Pick another pin.',{pin});return true;}
 pin(p){return this.pins[p]||(this.pins[p]={mode:null,out:0,duty:null,tone:null});}
 pinMode(p,m){if(!this.gpioOk(p,'pinMode'))return;const s=this.pin(p);s.mode=MODE[m]||'INPUT';if(s.mode==='OUTPUT'&&INPUT_ONLY.has(Number(p)))this.warn('io'+p,'GPIO {pin} is input-only: it cannot drive an LED. Use a pin such as 23 or 25.',{pin:p});this.dirty=true;this.refresh();}
 digitalWrite(p,v){if(!this.gpioOk(p,'digitalWrite'))return;const s=this.pin(p);if(s.mode!=='OUTPUT'){if(s.mode&&s.mode.startsWith('INPUT')){s.mode=v?'INPUT_PULLUP':'INPUT';}else this.warn('nomode'+p,'digitalWrite({pin}) before pinMode({pin}, OUTPUT): the pin is not driven.',{pin:p});}
  s.out=v?1:0;s.duty=null;this.writes.push({t:this.clock/1000,pin:Number(p),v:s.out});this.dirty=true;this.refresh();}
 analogWrite(p,v){if(!this.gpioOk(p,'analogWrite'))return;const s=this.pin(p);s.mode='OUTPUT';const d=Math.min(255,Math.max(0,Math.round(v)))/255;s.duty=d>0&&d<1?d:null;s.out=d>=1?1:0;if(s.duty!==null)s.out=0;this.writes.push({t:this.clock/1000,pin:Number(p),v:Math.round(d*255),pwm:true});this.dirty=true;this.refresh();}
 ledcAttach(p){this.pin(p).mode='OUTPUT';return 1;}
 ledcWrite(p,v){this.analogWrite(p,v);return 1;}
 tone(p,f,ms){if(!this.gpioOk(p,'tone'))return;const s=this.pin(p);s.mode='OUTPUT';s.tone={f:Number(f),until:ms?this.clock+ms*1000:Infinity};s.duty=0.5;this.dirty=true;this.refresh();}
 noTone(p){const s=this.pin(p);s.tone=null;s.duty=null;s.out=0;this.dirty=true;this.refresh();}
 attachInterrupt(p,fn,mode){p=Number(p);
  if(!this.gpioOk(p,'attachInterrupt'))return;this.irqs[p]={fn,mode:Number(mode)||3,last:this.digitalRead(p)};}
 detachInterrupt(p){delete this.irqs[Number(p)];}
 checkIrqs(){if(!this.nets||!Object.keys(this.irqs).length)return;
  for(const [p,irq] of Object.entries(this.irqs)){const n=this.nodeOf(Number(p)),cur=n&&this.sol?.driven(n)?(this.sol.v(n)>V33/2?1:0):irq.last;
   if(cur!==irq.last){const prev=irq.last;irq.last=cur;if((irq.mode===1&&prev===0&&cur===1)||(irq.mode===2&&prev===1&&cur===0)||irq.mode===3){if(this.interruptsEnabled&&this.pendingIsr.length<32)this.pendingIsr.push(irq.fn);}}}}
 digitalRead(p){if(!this.gpioOk(p,'digitalRead'))return 0;const s=this.pin(p);if(s.mode==='OUTPUT')return s.duty!==null?(s.duty>=0.5?1:0):s.out;
  if(!s.mode)this.warn('nomodeR'+p,'digitalRead({pin}) before pinMode({pin}, INPUT…).',{pin:p});this.ensure();const n=this.nodeOf(p);
  if(!n||!this.sol.driven(n))return this.random()<0.5?0:1;return this.sol.v(n)>V33/2?1:0;}
 analogRead(p){if(!this.gpioOk(p,'analogRead'))return 0;if(![32,33,34,35,36,39,4,0,2,15,13,12,14,27,25,26].includes(Number(p)))this.warn('adc'+p,'GPIO {pin} cannot read analog values.',{pin:p});
  this.ensure();const n=this.nodeOf(p);if(!n||!this.sol.driven(n))return Math.floor(this.random()*4096);
  const raw=Math.round(this.sol.v(n)/V33*4095+(this.random()*4-2));return Math.max(0,Math.min(4095,raw));}
 serial(m,args,types,machine,port='Serial'){
  if(port==='Serial2')throw new CodeError('Serial2 is not connected to the USB Serial Monitor. Use Serial instead.');
  if(port!=='Serial')return this.device(port,m,args,types,machine);
  switch(m){
   case 'begin':this.begun=true;this.codeBaud=Number(args[0]);return;
   case 'print':case 'println':case 'printf':case 'write':{let s=m==='printf'?printf(String(args[0]),args.slice(1).map((v,i)=>({v,t:types[i+1]}))):m==='write'?String.fromCharCode(args[0]):(args.length?fmtValue(args[0],types[0],args[1]):'');if(m==='println')s+='\r\n';
    if(!this.begun){this.warn('nobegin','Serial.begin(115200) is missing in setup(): nothing is printed.');return 0;}
    this.out+=s;if(this.out.length>20000)this.out=this.out.slice(-15000);this.serialLog.push({t:this.clock/1000,s});if(this.serialLog.length>4000)this.serialLog.splice(0,1000);this.clock+=s.length*87;return s.length;}
   case 'available':return this.rx.available;case 'read':return this.rx.read();case 'peek':return this.rx.peek();
   case 'readString':return this.rx.readString();case 'readStringUntil':return this.rx.readString(Number(args[0])&255);
   case 'parseInt':return this.rx.parseNumber();case 'parseFloat':return this.rx.parseNumber(true);
   case 'setTimeout':this.rx.timeout=Math.max(0,Number(args[0])>>>0);return;
   case 'end':this.begun=false;this.rx.clear();return;
   case 'flush':return;}}
 oledWired(){return this.diagram.parts.some(p=>p.type==='oled'&&this.node(p.id+':GND')==='GND'&&this.sol?.v(this.node(p.id+':VCC'))>2.5&&this.node(p.id+':SCL')===this.nodeOf(22)&&this.node(p.id+':SDA')===this.nodeOf(21));}
 dhtPart(){return this.diagram.parts.find(p=>p.type==='dht11'&&this.node(p.id+':GND')==='GND'&&this.sol?.v(this.node(p.id+':VCC'))>2.5&&(this.dhtState.pin!==null?this.node(p.id+':DATA')===this.nodeOf(this.dhtState.pin):Object.keys(GPIO_PIN).some(g=>this.node(p.id+':DATA')===this.nodeOf(Number(g)))));}
 device(port,m,args,types,machine){
  if(port==='Wire')return 1;
  if(port==='dht'){
   if(m==='begin'){this.dhtState.begun=true;return;}
   this.ensure();const p=this.dhtState.begun&&this.dhtPart();if(!p)return NaN;
   const s=this.inputs[p.id];return m==='readTemperature'?(args[0]?s.temp*1.8+32:s.temp):s.hum;
  }
  if(port==='display'){
   const o=this.oledState;
   switch(m){
    case 'begin':o.begun=true;return 1;
    case 'clearDisplay':o.buf=[];return;
    case 'setTextSize':o.size=Math.max(1,Math.min(4,Number(args[0])||1));return;
    case 'setTextColor':o.color=Number(args[0]??1);return;
    case 'setCursor':o.cx=Number(args[0])||0;o.cy=Number(args[1])||0;return;
    case 'print':case 'println':case 'printf':{
     const s=m==='printf'?printf(String(args[0]),args.slice(1).map((v,i)=>({v,t:types[i+1]}))):(args.length?fmtValue(args[0],types[0],args[1]):'');
     const parts=String(s).split(/\r?\n/);
     parts.forEach((line,idx)=>{if(line)o.buf.push({t:'text',x:o.cx,y:o.cy,size:o.size,color:o.color,s:line});if(idx<parts.length-1||m==='println'){o.cx=0;o.cy+=8*o.size;}else o.cx+=line.length*6*o.size;});
     return s.length;}
    case 'drawPixel':o.buf.push({t:'pixel',x:Number(args[0]),y:Number(args[1]),color:Number(args[2]??1)});return;
    case 'drawLine':o.buf.push({t:'line',x0:Number(args[0]),y0:Number(args[1]),x1:Number(args[2]),y1:Number(args[3]),color:Number(args[4]??1)});return;
    case 'drawRect':o.buf.push({t:'rect',x:Number(args[0]),y:Number(args[1]),w:Number(args[2]),h:Number(args[3]),color:Number(args[4]??1),fill:false});return;
    case 'fillRect':o.buf.push({t:'rect',x:Number(args[0]),y:Number(args[1]),w:Number(args[2]),h:Number(args[3]),color:Number(args[4]??1),fill:true});return;
    case 'invertDisplay':o.invert=!!args[0];return;
    case 'display':this.ensure();if(o.begun&&this.oledWired()){o.screen=o.buf.map(x=>({...x}));o.draws++;}return;
   }
  }
  if(port==='WiFi'){
   const w=this.wifiState;
   switch(m){
    case 'mode':return 1;
    case 'begin':w.ssid=String(args[0]||'Workshop_WiFi');w.status=3;w.beginAt=this.clock;return 3;
    case 'status':return w.status===3&&this.clock-(w.beginAt||0)<1200000?0:w.status;
    case 'localIP':return w.status===3&&this.clock-(w.beginAt||0)>=1200000?w.ip:'0.0.0.0';
    case 'RSSI':return w.rssi;
    case 'scanNetworks':return 2;
    case 'SSID':return Number(args[0])===1?'Neighbor_Net':(w.ssid||'Workshop_WiFi');
    case 'disconnect':w.status=6;return 1;
   }
  }
  if(port==='server'){
   const w=this.webState;
   switch(m){
    case 'on':w.routes.set(String(args[0]||'/'),args[1]);return;
    case 'begin':w.begun=true;if(!w.queue.length&&w.routes.has('/'))w.queue.push({uri:'/'});return;
    case 'uri':return w.uri;
    case 'send':w.lastCode=Number(args[0])||200;w.lastType=String(args[1]||'text/html');w.lastHtml=String(args[2]||'');w.requests++;return;
    case 'handleClient':{if(!w.begun||!w.queue.length)return;const req=w.queue.shift();w.uri=req.uri;const fn=w.routes.get(req.uri);if(fn)return machine.callFn(fn);return;}
   }
  }
 }
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
    case 'resistor':els.push({t:'R',a:k('1'),b:k('2'),r:Number(p.attrs.ohms)||220,tag:{part:p.id}});break;
    case 'button':if(this.contact(p,t))els.push({t:'R',a:k('L1'),b:k('R1'),r:0.05,tag:{part:p.id}});break;
    case 'pot':{const pos=this.inputs[p.id].pos,R=Number(p.attrs.ohms)||10000;els.push({t:'R',a:k('GND'),b:k('SIG'),r:Math.max(1,R*pos),tag:{part:p.id}},{t:'R',a:k('SIG'),b:k('VCC'),r:Math.max(1,R*(1-pos)),tag:{part:p.id}});break;}
    case 'ldr':{const lv=this.inputs[p.id]?.light??p.attrs.light??0.5,rLdr=Math.round(50000*Math.pow(0.04,lv));els.push({t:'R',a:k('VCC'),b:k('SIG'),r:rLdr,tag:{part:p.id,ldr:true}},{t:'R',a:k('SIG'),b:k('GND'),r:10000,tag:{part:p.id}});break;}
    case 'dht11':els.push({t:'R',a:k('VCC'),b:k('DATA'),r:10000,tag:{part:p.id}});break;
    case 'pir':if(k('GND')==='GND'&&(k('VCC')===N(b.id+':3V3')||k('VCC')===N(b.id+':VIN')))els.push({t:'V',a:k('OUT'),v:this.inputs[p.id]?.motion?V33:0,r:20,tag:{part:p.id}});break;
    case 'relay':els.push({t:'R',a:k('VCC'),b:k('IN'),r:1000,tag:{part:p.id}});break;
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
  }
  for(const e of els){
   if(e.tag?.gpio!==undefined&&Math.abs(e.i)>0.04)this.warn('over'+e.tag.gpio,'GPIO {pin} is supplying {mA} mA: that is a short circuit or a missing resistor. A real pin can be damaged.',{pin:e.tag.gpio,mA:Math.round(Math.abs(e.i)*1000)});
   if(e.tag?.src&&e.i>0.5)this.warn('short'+e.tag.src,'Short circuit: {src} is connected straight to GND. Remove that wire.',{src:e.tag.src});
   if(e.t==='D'&&e.i>0.03)this.warn('led'+e.tag.led+(e.tag.ch||''),'{part} gets about {mA} mA. A real LED burns out without a resistor: add 220 Ω in series.',{part:e.tag.led,mA:Math.round(e.i*1000)});}
  const t=this.clock/1000;
  const bz={};for(const e of els)if(e.tag?.buzzer){const on=Math.abs(e.i)>0.005;const drv=e.b==='GND'&&Object.entries(this.pins).find(([g,s])=>s.tone&&this.node(this.board.id+':'+GPIO_PIN[g])===e.a);if(drv)bz[e.tag.buzzer]=drv[1].tone.f;else if(on)bz[e.tag.buzzer]=(this.diagram.parts.find(p=>p.id===e.tag.buzzer).attrs.kind==='active'?2300:0);}
  for(const p of this.diagram.parts)if(p.type==='buzzer'){const f=bz[p.id]||0,prev=this.buzzers[p.id]||0;if(f!==prev){this.buzzerLog.push({t,id:p.id,f});if(this.buzzerLog.length>2000)this.buzzerLog.splice(0,500);}}
  this.buzzers=bz;
  const rel={};for(const p of this.diagram.parts)if(p.type==='relay'){const vcc=this.sol.v(this.node(p.id+':VCC')),gnd=this.node(p.id+':GND')==='GND',inNode=this.node(p.id+':IN'),vin=this.sol.v(inNode),drv=this.sol.driven(inNode);
   const on=vcc>2.5&&gnd&&drv&&(p.attrs.activeLow!==false?vin<1.2:vin>2.0);rel[p.id]=on;if(Boolean(this.relays[p.id])!==on){this.relayLog.push({t,id:p.id,on});if(this.relayLog.length>1000)this.relayLog.splice(0,300);}}
  this.relays=rel;
  this.ledI=leds;for(const [key,i] of Object.entries(leds)){const b=Math.max(0,Math.min(1,i/LED_FULL));const prev=this.logged[key];if(prev===undefined||Math.abs(prev-b)>0.02||(b===0)!==(prev===0)){this.logged[key]=b;this.ledLog.push({t,id:key,b});if(this.ledLog.length>6000)this.ledLog.splice(0,2000);}this.leds[key]=b;}
  this.checkIrqs();}
 measure(pinA,pinB){
  if(!this.nets)this.nets=buildNets(this.diagram);
  if(!this.board)this.board=this.diagram.parts.find(p=>p.type==='esp32');
  this.ensure();
  const na=this.node(pinA),nb=this.node(pinB);
  const vaBase=this.sol?this.sol.v(na):0,vbBase=this.sol?this.sol.v(nb):0;
  let va=vaBase,vb=vbBase,duty=null;
  const pwm=Object.entries(this.pins).filter(([,s])=>s.mode==='OUTPUT'&&s.duty!==null);
  for(const [g,s] of pwm){
   const hiSol=solve(this.elements({[g]:1}));
   va+=(hiSol.v(na)-vaBase)*s.duty;vb+=(hiSol.v(nb)-vbBase)*s.duty;
   if(this.nodeOf(Number(g))===na)duty=Math.round(s.duty*100);
  }
  const els=this.elements().filter(e=>e.t==='R'&&((e.a===na&&e.b===nb)||(e.a===nb&&e.b===na)));
  const gSum=els.reduce((acc,e)=>acc+1/Math.max(e.r,1e-3),0);
  const ohms=na===nb?0:(gSum>0?Math.round(1/gSum):null);
  const continuity=na===nb||(ohms!==null&&ohms<=50);
  return {v:Number((va-vb).toFixed(2)),duty,ohms,continuity};
 }
 globalsView(){
  if(!this.program?.globalVars||!this.machine)return [];
  return this.program.globalVars.map(v=>{const raw=this.machine.g[v.slot];return {name:v.name,type:v.type,value:Array.isArray(raw)?'['+raw.slice(0,6).join(', ')+(raw.length>6?'…':'')+']':raw};});
 }
 // ---------- view for the UI ----------
 view(){return {leds:this.leds,buzzers:this.buzzers,relays:this.relays,oled:this.oledState,web:this.webState,wifi:this.wifiState,
  pressed:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'down' in s).map(([k,s])=>[k,s.down])),
  pots:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'pos' in s).map(([k,s])=>[k,s.pos])),
  ldrs:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'light' in s).map(([k,s])=>[k,s.light])),
  dhts:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'temp' in s).map(([k,s])=>[k,{temp:s.temp,hum:s.hum}])),
  pirs:Object.fromEntries(Object.entries(this.inputs).filter(([k,s])=>'motion' in s).map(([k,s])=>[k,s.motion])),
  builtin:this.pins[2]?.mode==='OUTPUT'?(this.pins[2].duty??this.pins[2].out):0,time:this.now/1000};}
}
