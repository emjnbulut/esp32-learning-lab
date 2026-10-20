import test from 'node:test';import assert from 'node:assert/strict';
import {Simulator} from '../dist/sim/runtime.mjs';import {resolveDiagram} from '../dist/sim/circuit.mjs';
import {SERIAL_CAPACITY} from '../dist/sim/serial-input.mjs';
const diagram=()=>resolveDiagram({parts:[{id:'esp',type:'esp32',x:0,y:0}],wires:[]});
function sim(code){const s=new Simulator(diagram(),code);assert.equal(s.start(),null);return s;}
test('USB Serial byte reads consume UTF-8 data while peek and available do not',()=>{
 const s=sim('void setup(){Serial.begin(115200);}\nvoid loop(){if(Serial.available()){Serial.println(Serial.available());Serial.println(Serial.peek());Serial.println(Serial.peek());Serial.println(Serial.read());Serial.println(Serial.read());Serial.println(Serial.read());}}');
 s.runFor(1);assert.equal(s.receiveSerial('Ç'),true);s.runFor(10);
 assert.equal(s.out,'2\r\n195\r\n195\r\n195\r\n135\r\n-1\r\n');assert.equal(s.rx.available,0);
});
test('line endings are delivered as bytes for all four monitor choices',()=>{
 for(const ending of ['', '\n','\r','\r\n']){
  const s=sim('void setup(){Serial.begin(115200);}\nvoid loop(){if(Serial.available())Serial.println(Serial.read());}');
  s.runFor(1);assert.equal(s.receiveSerial('A'+ending),true);s.runFor(20);
  assert.deepEqual(s.out.trim().split(/\s+/).map(Number),[65,...[...ending].map(c=>c.charCodeAt(0))]);
 }
});
test('readStringUntil waits across frames, consumes the delimiter and preserves the next line',()=>{
 const s=sim("void setup(){Serial.begin(115200);Serial.setTimeout(100);}\nvoid loop(){if(Serial.available()){String line=Serial.readStringUntil('\\n');Serial.println(line);}}");
 s.runFor(100,[{at:10,serial:'hel'},{at:25,serial:'lo\nnext\r\n'}]);
 assert.equal(s.out,'hello\r\nnext\r\r\n');assert.equal(s.rx.available,0);assert.equal(s.status,'running');
});
test('readString returns UTF-8 text after the timeout and resets the wait after each byte',()=>{
 const s=sim('void setup(){Serial.begin(115200);Serial.setTimeout(30);String line=Serial.readString();Serial.print(line);Serial.print("|");Serial.println(millis());}\nvoid loop(){}');
 s.runFor(100,[{at:10,serial:'Ça'},{at:25,serial:'y'}]);
 assert.match(s.out,/^Çay\|(\d+)\r\n$/);const time=Number(s.out.match(/\|(\d+)/)[1]);assert.ok(time>=54&&time<=57,String(time));
});
test('parseInt and parseFloat skip prefixes and leave the delimiter unread',()=>{
 const s=sim('void setup(){Serial.begin(115200);Serial.setTimeout(20);}\nvoid loop(){if(Serial.available()){int n=Serial.parseInt();char sep=Serial.read();float f=Serial.parseFloat();Serial.println(n);Serial.println(sep);Serial.println(f,2);Serial.println(Serial.read());}}');
 s.runFor(1);s.receiveSerial('value=-42; 3.25!');s.runFor(30);
 assert.equal(s.out,'-42\r\n;\r\n3.25\r\n33\r\n');
});
test('empty timed reads return after simulated time without blocking the host',()=>{
 const s=sim("void setup(){Serial.begin(115200);Serial.setTimeout(20);Serial.println(Serial.parseInt());Serial.println(Serial.readStringUntil('\\n'));Serial.println(millis());}\nvoid loop(){}");
 s.runFor(5);assert.equal(s.out,'');s.runFor(80);assert.match(s.out,/^0\r\n\r\n(\d+)\r\n$/);assert.ok(Number(s.out.trim().split(/\s+/).at(-1))>=40);
 const zero=sim('void setup(){Serial.begin(115200);Serial.setTimeout(0);Serial.println(Serial.parseFloat());}\nvoid loop(){}');zero.runFor(1);assert.equal(zero.out,'0.00\r\n');
});
test('input is bounded atomically, rejected before begin/after stop, and cleared by restart or end',()=>{
 const s=sim('void setup(){Serial.begin(115200);}\nvoid loop(){delay(10000);}');
 assert.equal(s.receiveSerial('before begin'),false);s.runFor(1);
 assert.equal(s.receiveSerial('x'.repeat(SERIAL_CAPACITY)),true);assert.equal(s.receiveSerial('y'),false);assert.equal(s.rx.available,SERIAL_CAPACITY);
 s.stop();assert.equal(s.receiveSerial('after stop'),false);s.start();assert.equal(s.rx.available,0);s.runFor(1);
 s.receiveSerial('queued');s.serial('end',[],[]);assert.equal(s.rx.available,0);assert.equal(s.receiveSerial('after end'),false);
});
test('Serial2 is explicitly unsupported by the USB monitor rather than reading its input',()=>{
 const s=sim('void setup(){Serial2.begin(115200);}\nvoid loop(){}');s.runFor(10);assert.equal(s.status,'error');assert.match(s.error.message,/Serial2.*USB Serial Monitor/);
});
