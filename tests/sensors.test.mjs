import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS,checkGoals} from '../dist/missions.mjs';
import {Simulator} from '../dist/sim/runtime.mjs';
const clone=structuredClone;
function run(id,code=MISSIONS[id].solution.code,diagram=MISSIONS[id].solution.diagram){const s=new Simulator(clone(diagram),code);assert.equal(s.start(),null);s.random=()=>0.5;return s;}
const text=s=>s.oledState.screen.filter(x=>x.t==='text').map(x=>x.s).join('');
const disconnected=(id,pin)=>{const d=clone(MISSIONS[id].solution.diagram);const s=run(id);const target=s.node(pin);d.wires=d.wires.filter(w=>s.node(w.a)!==target&&s.node(w.b)!==target);return d;};

test('LDR divider responds to light through the actual ADC net',()=>{
 const s=run('ldr');s.setLight('ldr1',0);s.runFor(200);const dark=s.analogRead(34);s.setLight('ldr1',1);s.runFor(200);assert.ok(dark<1500);assert.ok(s.analogRead(34)>3000);assert.match(s.out,/Light: 83 %/);
});
test('DHT needs its data wire, power and ground and follows both controls',()=>{
 const s=run('temp');s.setDht('dht1',{temp:30,hum:70});s.runFor(2100);assert.match(s.out,/Temp: 30.0 C  Humidity: 70 %/);
 for(const pin of ['dht1:DATA','dht1:VCC','dht1:GND']){const broken=run('temp',undefined,disconnected('temp',pin));broken.runFor(100);assert.match(broken.out,/Sensor error/,pin);}
});
test('OLED sends a buffered frame only when wired and display() is called',()=>{
 const starter=run('oled',MISSIONS.oled.starter.code);starter.runFor(100);assert.equal(starter.oledState.screen.length,0);
 const s=run('station');s.runFor(100);assert.match(text(s),/T: 24.0 C/);assert.match(text(s),/H: 50 %/);
 s.setDht('dht1',{temp:30,hum:70});s.runFor(2100);assert.match(text(s),/T: 30.0 C/);assert.match(text(s),/H: 70 %/);
 const broken=run('oled',undefined,disconnected('oled','oled1:SDA'));broken.runFor(100);assert.equal(broken.oledState.screen.length,0);
});
const irqCode=extra=>`volatile int pulses=0;void onMotion(){pulses++;}void setup(){pinMode(27,INPUT);attachInterrupt(digitalPinToInterrupt(27),onMotion,RISING);${extra}}void loop(){delay(1000);}`;
test('a short PIR edge runs its ISR during delay rather than waiting for loop',()=>{
 const s=run('irq',irqCode(''));s.runFor(100);s.setPir('pir1',true);s.runFor(10);s.setPir('pir1',false);s.runFor(10);
 assert.equal(s.globalsView().find(v=>v.name==='pulses').value,1);assert.ok(s.now<1000000);assert.equal(s.status,'running');
});
test('interrupt masking, re-enabling and detach affect real PIR edges',()=>{
 const code=irqCode('noInterrupts();').replace('delay(1000);','if(millis()>=200) interrupts(); if(millis()>=400) detachInterrupt(27); delay(10);');
 const s=run('irq',code);s.runFor(100);s.setPir('pir1',true);s.runFor(50);assert.equal(s.globalsView()[0].value,0);s.setPir('pir1',false);s.runFor(100);s.setPir('pir1',true);s.runFor(50);assert.equal(s.globalsView()[0].value,1);
 s.setPir('pir1',false);s.runFor(150);s.setPir('pir1',true);s.runFor(50);assert.equal(s.globalsView()[0].value,1);
});
test('an unwired interrupt registration is supported without fabricating edges',()=>{
 const s=run('hello','void handler(){} void setup(){pinMode(22,INPUT);attachInterrupt(22,handler,CHANGE);}void loop(){delay(100);}');s.runFor(200);assert.equal(s.status,'running');assert.equal(s.pendingIsr.length,0);
});
test('relay startup transients cannot complete the switching mission',()=>{
 const s=run('relay',MISSIONS.relay.starter.code);s.runFor(5000);assert.ok(checkGoals(MISSIONS.relay,s).every(x=>!x));
 const ready=run('relay');ready.runFor(5000);assert.ok(checkGoals(MISSIONS.relay,ready).every(Boolean));
 const broken=run('relay',undefined,disconnected('relay','relay1:IN'));broken.runFor(5000);assert.ok(!broken.relayLog.some(x=>x.on));
});
test('multimeter measures supply voltage, series resistance, continuity and PWM',()=>{
 const s=run('blink');s.runFor(100);
 assert.ok(Math.abs(s.measure('esp:3V3','esp:GND.R').v-3.3)<0.01);
 assert.equal(s.measure('r1:1','r1:2').ohms,220);
 assert.equal(s.measure('esp:GND.R','bb:bn9').continuity,true);
 s.analogWrite(23,128);assert.ok(Math.abs(s.measure('esp:D23','esp:GND.R').v-1.65)<0.05);assert.equal(s.measure('esp:D23','esp:GND.R').duty,50);
});
test('HTTP handlers change the physical LED and refresh sensor readings on request',()=>{
 const s=run('webled');s.runFor(1900);s.requestHttp('/on');s.runFor(100);assert.equal(s.webState.lastHtml,'LED is on');assert.ok(s.leds.led1>0.15);
 s.requestHttp('/off');s.runFor(100);assert.equal(s.webState.lastHtml,'LED is off');assert.equal(s.leds.led1,0);
 const d=run('dashboard');d.runFor(1900);assert.match(d.webState.lastHtml,/24.0 C/);d.setDht('dht1',{temp:30,hum:70});d.setLight('ldr1',1);assert.doesNotMatch(d.webState.lastHtml,/30.0 C/);d.requestHttp('/');d.runFor(100);assert.match(d.webState.lastHtml,/30.0 C/);assert.match(d.webState.lastHtml,/Light: 83 %/);
});
