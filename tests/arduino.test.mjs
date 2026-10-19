import test from 'node:test';import assert from 'node:assert/strict';
import {compile,Machine,CodeError,fmtValue,printf} from '../dist/sim/arduino.mjs';
// A tiny host: records serial output and pin writes, runs the machine for a span of virtual time.
function host(){const h={clock:0,deadline:0,out:'',writes:[],modes:{},inputs:{},random:Math.random,
 pinMode(p,m){h.modes[p]=m;},digitalWrite(p,v){h.writes.push([h.clock/1000,p,v?1:0]);},digitalRead(p){return h.inputs[p]??1;},analogWrite(p,v){h.writes.push([h.clock/1000,p,v]);},analogRead(p){return h.inputs[p]??0;},
 serial(m,args,types){if(m==='begin'){h.baud=args[0];return;}if(m==='print'||m==='println'){h.out+=(args.length?fmtValue(args[0],types[0],args[1]):'')+(m==='println'?'\r\n':'');return;}if(m==='printf'){h.out+=printf(args[0],args.slice(1).map((v,i)=>({v,t:types[i+1]})));return;}}};return h;}
function run(src,ms,h=host()){const m=new Machine(compile(src),h);const g=m.run();h.deadline=ms*1000;g.next();return h;}
const lines=h=>h.out.split('\r\n').filter(Boolean);

test('episode 1 sketch prints a greeting and counts seconds with printf',()=>{const h=run(`int seconds = 0;
void setup() { Serial.begin(115200); delay(1000); Serial.println("Hello, ESP32!"); }
void loop() { seconds = seconds + 1; Serial.printf("I have been running for %d seconds\\n", seconds); delay(1000); }`,3500);
 assert.equal(h.baud,115200);assert.match(h.out,/^Hello, ESP32!\r\nI have been running for 1 seconds\nI have been running for 2 seconds\nI have been running for 3 seconds\n$/);});

test('episode 3 blink toggles GPIO 23 every 500 ms',()=>{const h=run(`const int LED_PIN = 23;
void setup() { pinMode(LED_PIN, OUTPUT); Serial.begin(115200); }
void loop() { digitalWrite(LED_PIN, HIGH); Serial.println("LED on"); delay(500); digitalWrite(LED_PIN, LOW); Serial.println("LED off"); delay(500); }`,2100);
 assert.equal(h.modes[23],3);const w=h.writes.filter(x=>x[1]===23);assert.deepEqual(w.map(x=>x[2]),[1,0,1,0,1]);assert.ok(Math.abs(w[2][0]-w[0][0]-1000)<1);assert.deepEqual(lines(h).slice(0,3),['LED on','LED off','LED on']);});

test('integer math, unsigned subtraction, float printing and String joins behave like the ESP32',()=>{const h=run(`void setup(){ Serial.begin(115200);
 int a = 7 / 2; float b = 7 / 2.0; unsigned long x = 5; unsigned long y = x - 10; byte c = 300; char ch = 'A';
 Serial.println(a); Serial.println(b); Serial.println(y); Serial.println(c); Serial.println(ch); Serial.println(b, 3); Serial.println(255, HEX); Serial.println(5, BIN);
 String s = "Count: "; s += 3; Serial.println(s + " ok"); Serial.println(String(3.14159, 3)); Serial.println(map(3072, 0, 4095, 0, 255)); Serial.println(true); Serial.println(-7 % 3); Serial.println(constrain(300, 0, 255));
 int arr[] = {1, 2, 3}; int sum = 0; for (int i = 0; i < 3; i++) sum += arr[i]; Serial.println(sum); Serial.println(sizeof(arr) / sizeof(arr[0]));
 }
void loop(){}`,10);
 assert.deepEqual(lines(h),['3','3.50','4294967291','44','A','3.500','FF','101','Count: 3 ok','3.142','191','1','-1','255','6','3']);});

test('functions, while, do-while, switch, ternary and globals',()=>{const h=run(`int calls = 0;
int square(int v) { calls++; return v * v; }
void show(int n) { switch (n) { case 1: Serial.println("one"); break; case 2: case 3: Serial.println("few"); break; default: Serial.println("many"); } }
void setup(){ Serial.begin(9600); int i = 0; while (i < 3) { i++; } do { i--; } while (i > 1);
 Serial.println(square(i + 2)); show(1); show(3); show(9); Serial.println(calls > 0 ? "called" : "not"); }
void loop(){}`,10);assert.deepEqual(lines(h),['9','one','few','many','called']);});

test('millis() based code never blocks and sees time advance',()=>{const h=run(`unsigned long last = 0; int n = 0;
void setup(){ Serial.begin(115200); }
void loop(){ unsigned long now = millis(); if (now - last >= 250) { last = now; n++; Serial.println(n); } }`,1010);
 assert.deepEqual(lines(h),['1','2','3','4']);});

test('compiler-style errors point at the right line',()=>{
 const cases=[['void setup(){ int x = 1 }\nvoid loop(){}',/Expected ";"/,1],['void setup(){\n  pinMode(LEDPIN, OUTPUT);\n}\nvoid loop(){}',/"LEDPIN" was not declared/,2],['void setup(){}\n',/void loop\(\)/,1],
  ['void setup(){\n Serial.println("Count: " + 5);\n}\nvoid loop(){}',/Text in quotes cannot be joined/,2],['const int P = 2;\nvoid setup(){ P = 3; }\nvoid loop(){}',/const/,2],['void setup(){\n digitalWrite(23);\n}\nvoid loop(){}',/takes 2 arguments, not 1/,2],
  ['void setup(){\n if (true) {\n}\nvoid loop(){}',/missing above/,4]];
 for(const [src,re,line] of cases){assert.throws(()=>compile(src),e=>e instanceof CodeError&&re.test(e.message)&&e.line===line,src);}});

test('runtime errors are reported with a line',()=>{assert.throws(()=>run('int a[3];\nvoid setup(){\n a[3] = 1;\n}\nvoid loop(){}',10),e=>e instanceof CodeError&&/outside the array/.test(e.message)&&e.line===3);
 assert.throws(()=>run('void setup(){ int z = 0;\n Serial.println(5 / z);\n}\nvoid loop(){}',10),e=>/Division by zero/.test(e.message)&&e.line===2);});

test('#define constants work like the Arduino preprocessor',()=>{const h=run('#include <Arduino.h>\n#define LED 23 // the pin\n#define WAIT 100\nvoid setup(){ pinMode(LED, OUTPUT); }\nvoid loop(){ digitalWrite(LED, HIGH); delay(WAIT); digitalWrite(LED, LOW); delay(WAIT); }',250);
 assert.deepEqual(h.writes.map(w=>w[2]),[1,0,1]);});
