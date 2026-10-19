import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {Simulator} from '../dist/sim/runtime.mjs';import {resolveDiagram} from '../dist/sim/circuit.mjs';
const SRC='../../esp32-from-zero/lessons/';const sketch=p=>{try{return fs.readFileSync(new URL(SRC+p,import.meta.url),'utf8');}catch{return null;}};
const base=[{id:'esp',type:'esp32',x:0,y:0},{id:'bb',type:'breadboard',x:200,y:0}];
// GPIO 23 -> 220 ohm (a4-a7) -> LED (e7 anode, e8 cathode) -> GND
const ledCircuit=(extra={})=>resolveDiagram({parts:[...base,{id:'r1',type:'resistor',at:'bb:a4'},{id:'led1',type:'led',at:'bb:e7',...extra.led}],wires:[{a:'esp:D23',b:'bb:c4'},{a:'bb:c8',b:'esp:GND.R'},...(extra.wires||[])]});
const BLINK=`const int LED_PIN = 23;
void setup() { pinMode(LED_PIN, OUTPUT); Serial.begin(115200); }
void loop() { digitalWrite(LED_PIN, HIGH); Serial.println("LED on"); delay(500); digitalWrite(LED_PIN, LOW); Serial.println("LED off"); delay(500); }`;
const lit=(s,id='led1')=>(s.leds[id]||0)>0.1;

test('blink lights the LED through the resistor with about 6 mA',()=>{const s=new Simulator(ledCircuit(),BLINK);assert.equal(s.start(),null);s.runFor(250);assert.ok(lit(s));assert.ok(Math.abs(s.leds.led1-0.58)<0.08,String(s.leds.led1));
 s.runFor(500);assert.ok(!lit(s));s.runFor(500);assert.ok(lit(s));const on=s.ledLog.filter(e=>e.id==='led1'&&e.b>0.1).map(e=>e.t);assert.ok(Math.abs(on[1]-on[0]-1000)<5,on.join());assert.deepEqual(s.warnings,[]);assert.match(s.out,/LED on\r\nLED off\r\nLED on/);});

test('the real episode 3 sketch drives the same circuit',{skip:!sketch('03-blink-an-led/code/blink_led/blink_led.ino')},()=>{const s=new Simulator(ledCircuit(),sketch('03-blink-an-led/code/blink_led/blink_led.ino'));assert.equal(s.start(),null);s.runFor(1200);assert.ok(s.ledLog.filter(e=>e.id==='led1').length>=3);});

test('an LED without a resistor warns about burning out; a reversed LED stays dark',()=>{
 const noR=resolveDiagram({parts:[...base,{id:'led1',type:'led',at:'bb:e7'}],wires:[{a:'esp:D23',b:'bb:c7'},{a:'bb:c8',b:'esp:GND.R'}]});const s=new Simulator(noR,BLINK);s.start();s.runFor(100);assert.match(s.warnings.map(w=>w.msg).join(),/burns out/);
 const rev=resolveDiagram({parts:[...base,{id:'r1',type:'resistor',at:'bb:a4'},{id:'led1',type:'led',at:'bb:e8',rot:180}],wires:[{a:'esp:D23',b:'bb:c4'},{a:'bb:c8',b:'esp:GND.R'}]});
 const s2=new Simulator(rev,BLINK);s2.start();s2.runFor(100);assert.ok(!lit(s2));});

test('3V3 straight to GND is reported as a short circuit',()=>{const d=resolveDiagram({parts:base,wires:[{a:'esp:3V3',b:'esp:GND.L'}]});const s=new Simulator(d,'void setup(){}\nvoid loop(){}');s.start();s.runFor(10);assert.match(s.warnings[0].msg,/Short circuit/);});

const buttonCircuit=(bounce=true)=>resolveDiagram({parts:[...base,{id:'r1',type:'resistor',at:'bb:a4'},{id:'led1',type:'led',at:'bb:e7'},{id:'btn',type:'button',at:'bb:e12',attrs:{bounce}}],
 wires:[{a:'esp:D23',b:'bb:c4'},{a:'bb:c8',b:'esp:GND.R'},{a:'esp:D22',b:'bb:h12'},{a:'bb:h14',b:'esp:GND.R'}]});
test('button with INPUT_PULLUP lights the LED while held (episode 4)',()=>{const src=sketch('04-buttons-and-millis/code/button_led/button_led.ino')||`void setup(){pinMode(22, INPUT_PULLUP);pinMode(23, OUTPUT);Serial.begin(115200);}
void loop(){int s=digitalRead(22);Serial.println(s);digitalWrite(23, s==LOW?HIGH:LOW);delay(50);}`;
 const s=new Simulator(buttonCircuit(),src);assert.equal(s.start(),null);s.runFor(300);assert.ok(!lit(s));assert.match(s.out,/1\r\n1\r\n/);
 s.runFor(300,[{at:s.now/1000+10,press:'btn'}]);assert.ok(lit(s));s.runFor(300,[{at:s.now/1000+10,release:'btn'}]);assert.ok(!lit(s));});

test('without a pull-up the released pin floats',()=>{const s=new Simulator(buttonCircuit(),'void setup(){pinMode(22, INPUT);Serial.begin(115200);}\nvoid loop(){Serial.println(digitalRead(22));delay(10);}');s.start();s.runFor(500);const vals=new Set(s.out.split('\r\n').filter(Boolean));assert.deepEqual([...vals].sort(),['0','1']);});

const COUNT=`int lastState = HIGH; int presses = 0;
void setup(){ pinMode(22, INPUT_PULLUP); Serial.begin(115200); }
void loop(){ int state = digitalRead(22); if (state != lastState) { if (state == LOW) { presses++; Serial.println(presses); } DEBOUNCE } lastState = state; }`;
test('contact bounce makes one press count several times until the code debounces',()=>{
 const press=(s)=>{for(let i=0;i<5;i++)s.runFor(200,[{at:s.now/1000+20,press:'btn'},{at:s.now/1000+120,release:'btn'}]);return s.out.trim().split('\r\n').map(Number).pop();};
 const raw=new Simulator(buttonCircuit(),COUNT.replace('DEBOUNCE',''));raw.start();assert.ok(press(raw)>5,'bouncy count');
 const deb=new Simulator(buttonCircuit(),COUNT.replace('DEBOUNCE','delay(50);'));deb.start();assert.equal(press(deb),5);
 const clean=new Simulator(buttonCircuit(false),COUNT.replace('DEBOUNCE',''));clean.start();assert.equal(press(clean),5);});

test('potentiometer reads 0-4095 and analogWrite dims the LED',()=>{const d=resolveDiagram({parts:[...base,{id:'r1',type:'resistor',at:'bb:a4'},{id:'led1',type:'led',at:'bb:e7'},{id:'pot',type:'pot',at:'bb:j20'}],
  wires:[{a:'esp:D23',b:'bb:c4'},{a:'bb:c8',b:'esp:GND.R'},{a:'bb:f20',b:'esp:GND.L'},{a:'bb:f21',b:'esp:D34'},{a:'bb:f22',b:'esp:3V3'}]});
 const s=new Simulator(d,'void setup(){Serial.begin(115200);}\nvoid loop(){int raw=analogRead(34);analogWrite(23, map(raw,0,4095,0,255));Serial.println(raw);delay(20);}');assert.equal(s.start(),null);
 s.runFor(100);let last=Number(s.out.trim().split('\r\n').pop());assert.ok(Math.abs(last-2048)<30,String(last));const half=s.leds.led1;
 s.runFor(100,[{at:s.now/1000+1,pot:'pot',pos:1}]);last=Number(s.out.trim().split('\r\n').pop());assert.ok(last>4080);assert.ok(s.leds.led1>half*1.8,`${s.leds.led1} vs ${half}`);
 s.runFor(100,[{at:s.now/1000+1,pot:'pot',pos:0}]);assert.ok(s.leds.led1<0.02);});

test('RGB LED mixes PWM channels',()=>{const d=resolveDiagram({parts:[...base,{id:'rgb',type:'rgb',at:'bb:e20'},{id:'r1',type:'resistor',x:600,y:0},{id:'r2',type:'resistor',x:600,y:40},{id:'r3',type:'resistor',x:600,y:80}],
  wires:[{a:'esp:D25',b:'r1:1'},{a:'r1:2',b:'bb:a20'},{a:'esp:D26',b:'r2:1'},{a:'r2:2',b:'bb:a22'},{a:'esp:D27',b:'r3:1'},{a:'r3:2',b:'bb:a23'},{a:'bb:a21',b:'esp:GND.R'}]});
 const s=new Simulator(d,`void setup(){}
void loop(){analogWrite(25,255);analogWrite(26,0);analogWrite(27,128);delay(100);}`);assert.equal(s.start(),null);s.runFor(50);
 assert.ok(s.leds['rgb:R']>0.3,JSON.stringify(s.leds));assert.ok(!(s.leds['rgb:G']>0.02));assert.ok(s.leds['rgb:B']>0.02&&s.leds['rgb:B']<s.leds['rgb:R'],JSON.stringify(s.leds));assert.deepEqual(s.warnings,[]);});
