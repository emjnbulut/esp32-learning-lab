// Hands-on missions. Each one has a starter (what the learner opens), a solution, steps, hints and
// goals checked live against the running simulation. `script` drives tests/missions.test.mjs.
import {resolveDiagram} from './sim/circuit.mjs';
const ESP={id:'esp',type:'esp32',x:0,y:0},BB={id:'bb',type:'breadboard',x:160,y:0};
const tray=(id,type,i,extra={})=>({id,type,x:190+i*60,y:250,...extra});
const D=(parts,wires=[])=>resolveDiagram({parts:[ESP,BB,...parts],wires});
// ---------- circuits ----------
const W_GND={a:'esp:GND.R',b:'bb:bn3',color:'#2b2b2b'},W_3V3={a:'esp:3V3',b:'bb:bp2',color:'#d64541'};
const ALWAYS_ON=D([{id:'r1',type:'resistor',at:'bb:bp8',rot:270},{id:'led1',type:'led',at:'bb:f8'}],[W_3V3,W_GND,{a:'bb:j9',b:'bb:bn9',color:'#2b2b2b'}]);
const BLINK_PARTS=[{id:'r1',type:'resistor',at:'bb:h5'},{id:'led1',type:'led',at:'bb:f8'}];
const BLINK_WIRES=[W_GND,{a:'esp:D23',b:'bb:j5',color:'#2f9a3c'},{a:'bb:j9',b:'bb:bn9',color:'#2b2b2b'}];
const BLINK=D(BLINK_PARTS,BLINK_WIRES);
const BUTTON_PART={id:'btn1',type:'button',at:'bb:e14'};
const BUTTON_WIRES=[{a:'esp:D22',b:'bb:j14',color:'#c9a400'},{a:'bb:j16',b:'bb:bn16',color:'#2b2b2b'}];
const GREEN_PARTS=[{id:'r2',type:'resistor',at:'bb:d20'},{id:'led2',type:'led',at:'bb:b23',attrs:{color:'green'}}];
const GREEN_WIRES=[{a:'esp:D25',b:'bb:a20',color:'#2f6fd0'},{a:'bb:a24',b:'bb:tn24',color:'#2b2b2b'},{a:'esp:GND.R',b:'bb:tn2',color:'#2b2b2b'}];
const POT_PART={id:'pot1',type:'pot',at:'bb:j27'};
const POT_WIRES=[W_3V3,{a:'bb:f27',b:'bb:bn27',color:'#2b2b2b'},{a:'bb:f29',b:'bb:bp29',color:'#d64541'},{a:'bb:f28',b:'esp:D34',color:'#8a3fc8'}];
const RGB_PARTS=[{id:'rgb1',type:'rgb',at:'bb:h22'},{id:'r1',type:'resistor',at:'bb:e22',rot:90},{id:'r2',type:'resistor',at:'bb:e24',rot:90},{id:'r3',type:'resistor',at:'bb:e25',rot:90}];
const RGB_WIRES=[W_GND,{a:'bb:j23',b:'bb:bn23',color:'#2b2b2b'},{a:'esp:D25',b:'bb:a22',color:'#d64541'},{a:'esp:D26',b:'bb:a24',color:'#2f9a3c'},{a:'esp:D27',b:'bb:a25',color:'#2f6fd0'}];
// ---------- checks ----------
const lines=s=>s.out.split(/\r?\n/).filter(Boolean);
const ledKeys=s=>Object.keys(s.leds);
const lit=(s,k)=>(s.leds[k]||0)>0.15;
function changes(s,k){const out=[];let prev=null;for(const e of s.ledLog){if(e.id!==k)continue;const on=e.b>0.15;if(on!==prev){out.push({t:e.t,on});prev=on;}}return out;}
// the first entry is the state at start-up, not a change: intervals start at the first real change
function durations(s,k){const c=changes(s,k);const on=[],off=[];for(let i=2;i<c.length;i++)(c[i-1].on?on:off).push(c[i].t-c[i-1].t);return {on:on.slice(-3),off:off.slice(-3)};}
const flips=(s,k)=>Math.max(0,changes(s,k).length-1);
const close=(xs,v,tol)=>xs.length>=2&&xs.every(x=>Math.abs(x-v)<=v*tol);
const blinkKey=(s,on,off,tol=0.12)=>ledKeys(s).find(k=>{const d=durations(s,k);return close(d.on,on,tol)&&close(d.off,off,tol);});
const pinMode=(s,p,m)=>s.pins[p]?.mode===m;
const pressed=s=>Object.values(s.inputs).some(i=>i.down);
const presses=s=>s.events.filter(e=>e.down===true).length;
const levels=(s,k)=>new Set(s.ledLog.filter(e=>e.id===k).map(e=>Math.round(e.b*40))).size;
export const MISSIONS={
 hello:{starter:{diagram:D([]),code:`void setup() {
  // 1. start the serial connection at 115200 baud

  // 2. print a greeting
}

void loop() {
}
`},solution:{diagram:D([]),code:`void setup() {
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
}
`},title:'Hello, ESP32!',intro:'Episode 1 in the browser: no driver, no cable. Your ESP32 speaks to you through the Serial Monitor.',
  steps:['Inside setup(), start the serial connection: `Serial.begin(115200);`','On the next line, print a greeting: `Serial.println("Hello, ESP32!");`','Press ▶ Run and watch the Serial Monitor under the circuit.'],
  hints:['Every line of code ends with a semicolon ;','Text goes in double quotes: "Hello, ESP32!". Upper/lower case matters: Serial, println.'],
  goals:[{text:'Serial is started at 115200 baud',check:s=>s.codeBaud===115200},{text:'The monitor shows Hello, ESP32!',check:s=>s.out.includes('Hello, ESP32!')},{text:'The greeting appears once, not over and over',check:s=>s.now>1.5e6&&s.out.split('Hello, ESP32!').length===2}],script:{ms:2000}},
 counter:{starter:{diagram:D([]),code:`int seconds = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  // add one to seconds, print the sentence, wait one second
}
`},solution:{diagram:D([]),code:`int seconds = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  seconds = seconds + 1;
  Serial.printf("I have been running for %d seconds\\n", seconds);
  delay(1000);
}
`},title:'Count the seconds',intro:'loop() runs again and again. Use it to count, exactly like the end of episode 1.',
  steps:['In loop(), add one to the variable: `seconds = seconds + 1;`','Print the sentence with the number: `Serial.printf("I have been running for %d seconds\\n", seconds);`','Wait a second: `delay(1000);` then press ▶ Run.'],
  hints:['%d inside printf is replaced by the number you pass after the comma.','Without delay(1000) the numbers race by thousands of times a second.'],
  goals:[{text:'Prints “I have been running for N seconds”',check:s=>lines(s).filter(l=>/running for \d+ seconds/.test(l)).length>=2},{text:'The number goes up by one each line',check:s=>{const n=lines(s).map(l=>l.match(/running for (\d+) seconds/)).filter(Boolean).map(m=>+m[1]);return n.length>=3&&n.slice(1).every((v,i)=>v===n[i]+1);}},
   {text:'One line per second',check:s=>{const t=s.serialLog.filter(e=>/running for/.test(e.s)).map(e=>e.t);return t.length>=3&&t.slice(1).every((v,i)=>Math.abs(v-t[i]-1000)<60);}}],script:{ms:3500}},
 circuit:{starter:{diagram:D([tray('r1','resistor',0),tray('led1','led',1)]),code:`// No code today: this LED gets its power from the 3V3 pin.
void setup() {
}

void loop() {
}
`},solution:{diagram:ALWAYS_ON,code:`// No code today: this LED gets its power from the 3V3 pin.
void setup() {
}

void loop() {
}
`},title:'Your first circuit',intro:'Episode 2: an LED that lights from the 3.3 V pin. Build it on the breadboard, then press Run (that is plugging in the USB cable).',
  steps:['Drag a wire from the board’s 3V3 pin to the red + rail of the breadboard, and from a GND pin to the blue − rail.','Put the resistor between the + rail and a free column (select it and press R to turn it upright).','Put the LED’s long leg (+) in the same column as the resistor, the short leg (−) in the next column.','Wire the short leg’s column to the − rail. Press ▶ Run.'],
  hints:['Each column of five holes (a–e or f–j) is one connection; the middle gap separates the halves.','Hover over a pin or hole to see its name. The LED’s + leg is the anode.','LED dark? Check the direction of the LED and that both legs are in different columns.'],
  goals:[{text:'The LED lights',check:s=>ledKeys(s).some(k=>lit(s,k))},{text:'A resistor keeps the current safe (under 20 mA)',check:s=>ledKeys(s).some(k=>lit(s,k)&&(s.ledI[k]||0)<0.02)},{text:'No short circuit or overload',check:s=>s.now>300e3&&!s.warnings.some(w=>/Short|supplying|burns/.test(w.msg))}],script:{ms:500}},
 fix:{starter:{diagram:D([{id:'r1',type:'resistor',at:'bb:bp8',rot:270},{id:'led1',type:'led',at:'bb:f9',rot:180}],[W_3V3,{a:'esp:GND.R',b:'bb:bp3',color:'#2b2b2b'},{a:'bb:j9',b:'bb:bn9',color:'#2b2b2b'}]),code:`void setup() {
}

void loop() {
}
`},solution:{diagram:ALWAYS_ON,code:`void setup() {
}

void loop() {
}
`},title:'Find the mistakes',intro:'Someone built the episode 2 circuit, but the LED stays dark. There are two classic mistakes in it. Find and fix them.',
  steps:['Press ▶ Run and read the warnings under the Serial Monitor.','Check every wire: does GND really go to the blue − rail?','Check the LED: is the long leg (+) on the resistor side? Select it and press R twice to turn it around, or drag it.'],
  hints:['One wire puts GND on the + rail, right next to 3V3: that is a short circuit.','The LED is placed the wrong way round: its + leg points away from the resistor.'],
  goals:[{text:'No short circuit',check:s=>s.now>300e3&&!s.warnings.some(w=>/Short|supplying/.test(w.msg))},{text:'The LED lights',check:s=>ledKeys(s).some(k=>lit(s,k))}],script:{ms:500}},
 blink:{starter:{diagram:ALWAYS_ON,code:`const int LED_PIN = 23;        // the GPIO our LED is wired to

void setup() {
  // make LED_PIN an output
}

void loop() {
  // on, wait 500 ms, off, wait 500 ms
}
`},solution:{diagram:BLINK,code:`const int LED_PIN = 23;        // the GPIO our LED is wired to

void setup() {
  pinMode(LED_PIN, OUTPUT);    // our code drives this pin
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, HIGH); // 3.3 V -> LED on
  Serial.println("LED on");
  delay(500);
  digitalWrite(LED_PIN, LOW);  // 0 V -> LED off
  Serial.println("LED off");
  delay(500);
}
`},title:'Blink an LED',intro:'Episode 3: move the resistor from 3V3 to GPIO 23, so your program can switch the LED on and off.',
  steps:['Delete the red wire from 3V3 (click it, press Delete).','Move the resistor so one end sits in a free column, and wire D23 to that column. The LED stays on the other end as before.','In setup(): `pinMode(LED_PIN, OUTPUT);` and `Serial.begin(115200);`','In loop(): `digitalWrite(LED_PIN, HIGH);`, print "LED on", `delay(500);`, then the same with LOW and "LED off". Press ▶ Run.'],
  hints:['HIGH puts 3.3 V on the pin, LOW puts 0 V.','The LED stays always on? The resistor probably still gets power from the + rail.','Always dark? Check that D23 really reaches the resistor’s column.'],
  goals:[{text:'GPIO 23 is an output',check:s=>pinMode(s,23,'OUTPUT')},{text:'The LED blinks: 500 ms on, 500 ms off',check:s=>!!blinkKey(s,500,500)},{text:'The monitor shows LED on / LED off',check:s=>/LED on/.test(s.out)&&/LED off/.test(s.out)}],script:{ms:2600}},
 fast:{starter:{diagram:BLINK,code:null},solution:{diagram:BLINK,code:`const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);
  delay(100);
}
`},title:'Five blinks a second',intro:'Changing numbers cannot break anything. Make the LED blink five times per second.',
  steps:['Work out the wait: one blink is one “on” plus one “off”.','Change both delay() values and press ↺ to restart.'],
  hints:['1000 ms / 5 = 200 ms per blink, split into two equal halves.'],
  goals:[{text:'The LED blinks 5 times per second (100 ms on, 100 ms off)',check:s=>!!blinkKey(s,100,100,0.2)}],script:{ms:1200}},
 pair:{starter:{diagram:D([...BLINK_PARTS,tray('r2','resistor',2),tray('led2','led',3,{attrs:{color:'green'}})],BLINK_WIRES),code:null},solution:{diagram:D([...BLINK_PARTS,...GREEN_PARTS],[...BLINK_WIRES,...GREEN_WIRES]),code:`const int RED_PIN = 23;
const int GREEN_PIN = 25;

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
}

void loop() {
  digitalWrite(RED_PIN, HIGH);
  digitalWrite(GREEN_PIN, LOW);
  delay(500);
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, HIGH);
  delay(500);
}
`},title:'Challenge: take turns',intro:'Add a green LED on GPIO 25. The two LEDs take turns: red on, green off; then the other way round.',
  steps:['Build a second LED circuit: GPIO 25 → resistor → green LED → GND. The top − rail needs its own GND wire.','Declare GREEN_PIN = 25 and make it an output.','In loop(), switch both LEDs, then wait 500 ms, twice.'],
  hints:['Any safe GPIO works: 4, 13, 14, 16–19, 21–23, 25–27, 32, 33. The lesson checker looks at the LEDs, not at the pin number.','The two blocks in loop() are mirror images: what is HIGH in the first is LOW in the second.'],
  goals:[{text:'Two LEDs blink (500 ms each)',check:s=>ledKeys(s).filter(k=>{const d=durations(s,k);return close(d.on,500,0.12);}).length>=2},{text:'They are never on at the same time',check:s=>{const ks=ledKeys(s).filter(k=>changes(s,k).length>=3);if(ks.length<2)return false;s.mem.both=s.mem.both||ks.filter(k=>lit(s,k)).length>1;return s.now>2e6&&!s.mem.both;}}],script:{ms:2600}},
 press:{starter:{diagram:D([...BLINK_PARTS,tray('btn1','button',2)],BLINK_WIRES),code:`const int BUTTON_PIN = 22;     // the button pulls this pin to GND
const int LED_PIN = 23;

void setup() {
  // the button pin: input with the internal pull-up
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  // read the button, print it, light the LED while it reads LOW
  delay(50);
}
`},solution:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;     // the button pulls this pin to GND
const int LED_PIN = 23;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP); // HIGH until pressed
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  Serial.println(state);
  if (state == LOW) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  delay(50);
}
`},title:'Read a button',intro:'Episode 4: the ESP32 listens. Put the button across the middle gap and wire it between GPIO 22 and GND.',
  steps:['Place the button across the middle gap (its legs in rows e and f).','Wire D22 to one side of the button, the other side to the − rail.','In setup(): `pinMode(BUTTON_PIN, INPUT_PULLUP);`','In loop(): read it with `digitalRead(BUTTON_PIN)`, print the value, and light the LED when it is LOW.','Run, then hold the button (click it, or use the Controls bar).'],
  hints:['With INPUT_PULLUP the pin reads 1 (HIGH) when released and 0 (LOW) when pressed.','The left two legs are always connected, so are the right two. Wire D22 and GND to different sides.','Try INPUT instead of INPUT_PULLUP and watch the numbers jump: a floating pin.'],
  goals:[{text:'GPIO 22 uses INPUT_PULLUP',check:s=>pinMode(s,22,'INPUT_PULLUP')},{text:'Held down: the LED is on',check:s=>(s.mem.on=s.mem.on||(pressed(s)&&ledKeys(s).some(k=>lit(s,k))))},{text:'Released: the LED is off again',check:s=>(s.mem.off=s.mem.off||(s.mem.on&&!pressed(s)&&!ledKeys(s).some(k=>lit(s,k))))},{text:'The monitor shows 1 and 0',check:s=>{const l=lines(s);return l.includes('1')&&l.includes('0');}}],
  script:{ms:1600,actions:[{at:500,press:'btn1'},{at:900,release:'btn1'}],ticks:[700,1300]}},
 toggle:{starter:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

int lastState = HIGH;          // the button is not pressed at the start
bool ledOn = false;
int presses = 0;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState) {    // the button changed
    if (state == LOW) {        // ...and it's now pressed: a new press
      presses++;
      ledOn = !ledOn;
      digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
      Serial.print("presses: ");
      Serial.println(presses);
    }
  }
  lastState = state;
}
`},solution:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

int lastState = HIGH;          // the button is not pressed at the start
bool ledOn = false;
int presses = 0;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState) {    // the button changed
    if (state == LOW) {        // ...and it's now pressed: a new press
      presses++;
      ledOn = !ledOn;
      digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
      Serial.print("presses: ");
      Serial.println(presses);
    }
    delay(50);                 // debounce: wait until the contacts stop bouncing
  }
  lastState = state;
}
`},title:'On, off: one press each',intro:'Each press should flip the LED. This code almost works, but the contacts bounce: run it, press a few times and watch the counter.',
  steps:['Run the code and press the button five times. Count, and compare with “presses:” in the monitor.','Find where the button changes and add the fix from episode 4: wait 50 ms after every change.','Restart and press again: each press must flip the LED exactly once.'],
  hints:['Metal contacts bounce for a few milliseconds, so one press looks like several.','Add `delay(50);` inside `if (state != lastState) { … }`, after the inner if.'],
  goals:[{text:'You pressed at least 4 times',check:s=>presses(s)>=4},{text:'Every press flipped the LED exactly once',check:s=>{const p=presses(s);const f=Math.max(0,...ledKeys(s).map(k=>flips(s,k)));return p>=4&&f===p;}},{text:'The counter matches your presses',check:s=>{const m=s.out.match(/presses: (\d+)\s*$/);return !!m&&+m[1]===presses(s)&&presses(s)>=4;}}],
  script:{ms:2600,actions:[300,700,1100,1500,1900].flatMap(t=>[{at:t,press:'btn1'},{at:t+150,release:'btn1'}])},expectStarterFails:true},
 nowait:{starter:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

bool blinking = true;
bool ledOn = false;
unsigned long lastBlink = 0;   // when the LED last changed (ms)

int lastState = HIGH;
unsigned long lastChange = 0;  // when the button last changed (ms)

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // 1. the button: a new press switches blinking on or off
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) {
      blinking = !blinking;
      Serial.println(blinking ? "blinking" : "stopped");
    }
  }

  // 2. the LED: flip it every 500 ms, without waiting
}
`},solution:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

bool blinking = true;
bool ledOn = false;
unsigned long lastBlink = 0;   // when the LED last changed (ms)

int lastState = HIGH;
unsigned long lastChange = 0;  // when the button last changed (ms)

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // 1. the button: a new press switches blinking on or off
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) {
      blinking = !blinking;
      Serial.println(blinking ? "blinking" : "stopped");
    }
  }

  // 2. the LED: flip it every 500 ms, without waiting
  if (blinking && now - lastBlink >= 500) {
    lastBlink = now;
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
  }
  if (!blinking && ledOn) {
    ledOn = false;
    digitalWrite(LED_PIN, LOW);
  }
}
`},title:'Two things at once',intro:'delay() freezes everything. Blink with millis() instead, so the button is heard at any moment.',
  steps:['Under “2. the LED”, check the clock: `if (blinking && now - lastBlink >= 500) { … }`','Inside: remember the time, flip ledOn and write it to the pin.','When blinking is off, make sure the LED goes dark.','Run: the LED blinks, a press stops it at once, another press starts it again.'],
  hints:['Always subtract: now − lastBlink. Never wait with delay() here.','After stopping: `if (!blinking && ledOn) { ledOn = false; digitalWrite(LED_PIN, LOW); }`'],
  goals:[{text:'The LED blinks every 500 ms',check:s=>!!blinkKey(s,500,500)},{text:'A press stops the blinking',check:s=>{if(/stopped/.test(s.out)&&!ledKeys(s).some(k=>lit(s,k))){const t=s.serialLog.filter(e=>/stopped/.test(e.s)).pop()?.t;if(t!==undefined&&s.now/1000-t>800)s.mem.stop=true;}return !!s.mem.stop;}},
   {text:'The press is noticed within 60 ms',check:s=>{const p=s.events.filter(e=>e.down).map(e=>e.t),st=s.serialLog.filter(e=>/stopped|blinking/.test(e.s)).map(e=>e.t);return p.length>0&&st.length>0&&st.every(t=>p.some(x=>t>=x&&t-x<60));}}],
  script:{ms:4800,actions:[{at:2600,press:'btn1'},{at:2750,release:'btn1'}],ticks:[2550,3900]},expectStarterFails:true},
 two:{starter:{diagram:D([...BLINK_PARTS,BUTTON_PART,tray('r2','resistor',2),tray('led2','led',3,{attrs:{color:'green'}})],[...BLINK_WIRES,...BUTTON_WIRES]),code:null},solution:{diagram:D([...BLINK_PARTS,BUTTON_PART,...GREEN_PARTS],[...BLINK_WIRES,...BUTTON_WIRES,...GREEN_WIRES]),code:`const int BUTTON_PIN = 22;
const int RED_PIN = 23;        // switched on/off by the button
const int GREEN_PIN = 25;      // always blinking

bool redBlinking = true;
bool redOn = false, greenOn = false;
unsigned long lastRed = 0, lastGreen = 0;

int lastState = HIGH;
unsigned long lastChange = 0;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) redBlinking = !redBlinking;
  }

  if (redBlinking && now - lastRed >= 500) {
    lastRed = now;
    redOn = !redOn;
    digitalWrite(RED_PIN, redOn ? HIGH : LOW);
  }
  if (!redBlinking && redOn) {
    redOn = false;
    digitalWrite(RED_PIN, LOW);
  }

  if (now - lastGreen >= 150) {
    lastGreen = now;
    greenOn = !greenOn;
    digitalWrite(GREEN_PIN, greenOn ? HIGH : LOW);
  }
}
`},title:'Challenge: two LEDs, two speeds',intro:'Red blinks every 500 ms and the button switches it on and off. Green blinks every 150 ms, always. Nothing ever waits.',
  steps:['Wire a green LED to GPIO 25 (with its own resistor and GND).','Give each LED its own timer: lastRed and lastGreen.','Keep the button code from the previous mission for the red LED.'],
  hints:['Each “every so often” job gets its own `if (now - last… >= interval)` block.','Start from your solution of the previous mission and copy the LED block for green.'],
  goals:[{text:'One LED blinks every 500 ms',check:s=>!!blinkKey(s,500,500)},{text:'Another LED blinks every 150 ms at the same time',check:s=>!!blinkKey(s,150,150,0.2)},{text:'A press stops the slow LED, the fast one keeps going',check:s=>{const fast=blinkKey(s,150,150,0.25);if(fast&&s.events.some(e=>e.down)){const slow=ledKeys(s).find(k=>k!==fast&&changes(s,k).length>=2);const last=slow&&changes(s,slow).pop();if(last&&!last.on&&s.now/1000-last.t>900)s.mem.ok=true;}return !!s.mem.ok;}}],
  script:{ms:4800,actions:[{at:2600,press:'btn1'},{at:2750,release:'btn1'}],ticks:[2550,4700]}},
 fade:{starter:{diagram:BLINK,code:`const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  // count from 0 to 255 and back, writing each value with analogWrite()
}
`},solution:{diagram:BLINK,code:`const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  for (int v = 0; v <= 255; v++) {
    analogWrite(LED_PIN, v);
    delay(4);
  }
  for (int v = 255; v >= 0; v--) {
    analogWrite(LED_PIN, v);
    delay(4);
  }
}
`},title:'Breathe in, breathe out',intro:'PWM switches the pin on and off very fast; analogWrite(pin, 0–255) sets how long it stays on. Make the LED fade up and down.',
  steps:['Write a for loop from 0 to 255: `for (int v = 0; v <= 255; v++) { … }`','Inside: `analogWrite(LED_PIN, v);` and a short `delay(4);`','Add a second loop that counts back down to 0. Run it.'],
  hints:['255 steps × 4 ms ≈ 1 second up, 1 second down.','On the ESP32, analogWrite() uses the LEDC PWM hardware for you.'],
  goals:[{text:'The LED shows many brightness levels',check:s=>ledKeys(s).some(k=>levels(s,k)>=12)},{text:'It goes from dark to bright and back',check:s=>ledKeys(s).some(k=>{const b=s.ledLog.filter(e=>e.id===k).map(e=>e.b);const hi=b.findIndex(x=>x>0.4);return hi>0&&b.slice(hi).some(x=>x<0.05)&&b.slice(0,hi).some(x=>x<0.05);})}],script:{ms:2600}},
 colors:{starter:{diagram:D([...RGB_PARTS],RGB_WIRES),code:`const int RED_PIN = 25, GREEN_PIN = 26, BLUE_PIN = 27;

void color(int r, int g, int b) {
  // write r, g and b to the three pins
}

void setup() {
}

void loop() {
  color(255, 0, 0);   // red
  delay(1000);
  // then green, blue and purple
}
`},solution:{diagram:D([...RGB_PARTS],RGB_WIRES),code:`const int RED_PIN = 25, GREEN_PIN = 26, BLUE_PIN = 27;

void color(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void setup() {
}

void loop() {
  color(255, 0, 0);   // red
  delay(1000);
  color(0, 255, 0);   // green
  delay(1000);
  color(0, 0, 255);   // blue
  delay(1000);
  color(255, 0, 255); // purple
  delay(1000);
}
`},title:'Three colors in one LED',intro:'An RGB LED is three LEDs in one case. Mix light with three analogWrite() calls.',
  steps:['Fill in color(): three analogWrite() calls, one per pin.','In loop(), show red, green, blue and purple, one second each.','Run and watch the LED change.'],
  hints:['Purple is red + blue: color(255, 0, 255).','This is a common-cathode RGB LED: the long leg goes to GND and 255 means full brightness.'],
  goals:[{text:'Red',check:s=>(s.mem.r=s.mem.r||rgbIs(s,1,0,0))},{text:'Green',check:s=>(s.mem.g=s.mem.g||rgbIs(s,0,1,0))},{text:'Blue',check:s=>(s.mem.b=s.mem.b||rgbIs(s,0,0,1))},{text:'Purple (red + blue)',check:s=>(s.mem.p=s.mem.p||rgbIs(s,1,0,1))}],script:{ms:4300,ticks:[500,1500,2500,3500]}},
 dimmer:{starter:{diagram:D([...BLINK_PARTS,POT_PART],[...BLINK_WIRES,...POT_WIRES]),code:`const int POT_PIN = 34;   // ADC1: works with WiFi on
const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(POT_PIN);   // 0–4095
  // turn raw into a brightness 0–255 with map(), then analogWrite it
  Serial.println(raw);
  delay(20);
}
`},solution:{diagram:D([...BLINK_PARTS,POT_PART],[...BLINK_WIRES,...POT_WIRES]),code:`const int POT_PIN = 34;   // ADC1: works with WiFi on
const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(POT_PIN);   // 0–4095
  int level = map(raw, 0, 4095, 0, 255);
  analogWrite(LED_PIN, level);
  Serial.println(raw);
  delay(20);
}
`},title:'A dimmer knob',intro:'The potentiometer gives 0–3.3 V on its middle leg; analogRead() turns it into 0–4095. Use it to set the LED brightness.',
  steps:['Run the starter and turn the knob (drag it, or use the Controls bar). Watch the numbers.','Convert: `int level = map(raw, 0, 4095, 0, 255);`','Write it to the LED: `analogWrite(LED_PIN, level);` Restart and turn the knob from one end to the other.'],
  hints:['The ESP32 ADC has 12 bits: 0 to 4095. Old Arduino tutorials use 1023 because the Uno has 10 bits.','analogWrite() takes 0 to 255.'],
  goals:[{text:'Knob at one end: LED dark',check:s=>(s.mem.lo=s.mem.lo||(potAt(s)<0.03&&ledKeys(s).every(k=>(s.leds[k]||0)<0.03)))},{text:'Knob at the other end: LED fully bright',check:s=>(s.mem.hi=s.mem.hi||(potAt(s)>0.97&&ledKeys(s).some(k=>(s.leds[k]||0)>0.45)))},{text:'Knob in the middle: LED half bright',check:s=>(s.mem.mid=s.mem.mid||(Math.abs(potAt(s)-0.5)<0.1&&ledKeys(s).some(k=>s.leds[k]>0.12&&s.leds[k]<0.4)))}],
  script:{ms:1500,actions:[{at:200,pot:'pot1',pos:0},{at:600,pot:'pot1',pos:1},{at:1000,pot:'pot1',pos:0.5}],ticks:[500,900,1400]}},
 speed:{starter:{diagram:D([...BLINK_PARTS,POT_PART],[...BLINK_WIRES,...POT_WIRES]),code:null},solution:{diagram:D([...BLINK_PARTS,POT_PART],[...BLINK_WIRES,...POT_WIRES]),code:`const int POT_PIN = 34;
const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int wait = map(analogRead(POT_PIN), 0, 4095, 50, 1000);
  digitalWrite(LED_PIN, HIGH);
  delay(wait);
  digitalWrite(LED_PIN, LOW);
  delay(wait);
}
`},title:'Challenge: a speed knob',intro:'Now the knob sets the blinking speed: fast at one end, slow at the other.',
  steps:['Read the knob and map it to a wait time, for example 50 to 1000 ms.','Blink with that wait time.','Turn the knob to both ends while it runs.'],
  hints:['`int wait = map(analogRead(POT_PIN), 0, 4095, 50, 1000);`'],
  goals:[{text:'At one end it blinks fast (under 200 ms)',check:s=>(s.mem.fast=s.mem.fast||ledKeys(s).some(k=>{const d=durations(s,k);return d.on.length>=2&&d.on.slice(-2).every(x=>x<200);}))},{text:'At the other end it blinks slowly (over 700 ms)',check:s=>(s.mem.slow=s.mem.slow||ledKeys(s).some(k=>{const d=durations(s,k);return d.on.length>=2&&d.on.slice(-2).every(x=>x>700);}))}],
  script:{ms:6000,actions:[{at:100,pot:'pot1',pos:0},{at:1500,pot:'pot1',pos:1}],ticks:[1400,5900]}}
};
function potAt(s){const p=Object.values(s.inputs).find(i=>'pos' in i);return p?p.pos:-1;}
function rgbIs(s,r,g,b){const id=Object.keys(s.leds).find(k=>k.endsWith(':R'));if(!id)return false;const base=id.slice(0,-2);const v=['R','G','B'].map(c=>s.leds[base+':'+c]||0);const want=[r,g,b];return v.every((x,i)=>want[i]?x>0.1:x<0.02);}
// "Your turn" tasks: small follow-ups that start from the learner's own work on the parent mission
Object.assign(MISSIONS,{
 hello2:{parent:'hello',solution:{diagram:D([]),code:`void setup() {
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
  Serial.println("My name is Pin by Pin.");
}

void loop() {
}
`},title:'Your turn: say more',intro:'Print a second line under the greeting, for example your name. Each line should appear once.',
  steps:['Add a second `Serial.println(…)` in setup() with your own text.','Run it and read the monitor.'],
  hints:['Put it right under the greeting, still inside setup(). Code in loop() would repeat.'],
  goals:[{text:'Two different lines are printed',check:s=>new Set(lines(s)).size>=2},{text:'Each line appears only once',check:s=>s.now>1.5e6&&lines(s).length>=2&&lines(s).length===new Set(lines(s)).size}],script:{ms:2000}},
 counter2:{parent:'counter',solution:{diagram:D([]),code:`int seconds = 0;

void setup() {
  Serial.begin(115200);
  Serial.println("Hello, ESP32!");
}

void loop() {
  seconds = seconds + 1;
  Serial.printf("Count: %d\\n", seconds);
  delay(500);
}
`},title:'Your turn: count faster',intro:'Make the counter go up twice a second.',
  steps:['Change the wait in loop() so a new line comes every half second.','Restart and watch the timing.'],
  hints:['Half a second is 500 milliseconds.'],
  goals:[{text:'The number goes up by one each line',check:s=>{const n=lines(s).map(l=>l.match(/(\d+)\D*$/)).filter(Boolean).map(m=>+m[1]);return n.length>=3&&n.slice(-3).every((v,i,a)=>i===0||v===a[i-1]+1);}},{text:'A new line every 500 ms',check:s=>{const t=s.serialLog.filter(e=>/\d/.test(e.s)&&!/Hello/.test(e.s)).map(e=>e.t);return t.length>=3&&t.slice(-3).every((v,i,a)=>i===0||Math.abs(v-a[i-1]-500)<40);}}],script:{ms:2200}},
 circuit2:{parent:'circuit',solution:{diagram:D([{id:'r1',type:'resistor',at:'bb:bp8',rot:270},{id:'led1',type:'led',at:'bb:f8'},{id:'r2',type:'resistor',at:'bb:bp14',rot:270},{id:'led2',type:'led',at:'bb:f14',attrs:{color:'green'}}],[W_3V3,W_GND,{a:'bb:j9',b:'bb:bn9',color:'#2b2b2b'},{a:'bb:j15',b:'bb:bn15',color:'#2b2b2b'}]),code:`void setup() {
}

void loop() {
}
`},title:'Your turn: a second LED',intro:'Add a second LED with its own resistor, also powered from the + rail. Both should light.',
  steps:['Add an LED and a resistor with “+ Add part”.','Build the same path again in other columns: + rail → resistor → LED long leg … short leg → − rail.','Run it.'],
  hints:['Every LED needs its own resistor.','The rails run along the whole board, so you can use any free column.'],
  goals:[{text:'Two LEDs light',check:s=>ledKeys(s).filter(k=>lit(s,k)).length>=2},{text:'Both stay under 20 mA',check:s=>{const on=ledKeys(s).filter(k=>lit(s,k));return on.length>=2&&on.every(k=>(s.ledI[k]||0)<0.02);}}],script:{ms:500}},
 blink2:{parent:'blink',solution:{diagram:BLINK,code:`const int LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  delay(100);
  digitalWrite(LED_PIN, LOW);
  delay(1900);
}
`},title:'Your turn: a lighthouse',intro:'From episode 3: a short flash, then a long dark pause. Make the LED shine for 100 ms and stay dark for 1900 ms.',
  steps:['Change the two delay() values.','Restart and count: one flash every two seconds.'],
  hints:['The first delay comes after HIGH (on time), the second after LOW (off time).'],
  goals:[{text:'100 ms on, 1900 ms off',check:s=>!!blinkKey(s,100,1900,0.15)}],script:{ms:6500}},
 press2:{parent:'press',solution:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  if (state == LOW) {
    digitalWrite(LED_PIN, LOW);
  } else {
    digitalWrite(LED_PIN, HIGH);
  }
  delay(50);
}
`},title:'Your turn: the other way round',intro:'Now the LED is on all the time and goes dark only while you hold the button.',
  steps:['Swap HIGH and LOW in the two digitalWrite() lines.','Run, then hold the button and let go.'],
  hints:['Pressed still reads LOW; only what you do with it changes.'],
  goals:[{text:'Released: the LED is on',check:s=>(s.mem.on=s.mem.on||(!pressed(s)&&s.now>200e3&&ledKeys(s).some(k=>lit(s,k))))},{text:'Held down: the LED is off',check:s=>(s.mem.off=s.mem.off||(pressed(s)&&!ledKeys(s).some(k=>lit(s,k))))}],
  script:{ms:1200,actions:[{at:500,press:'btn1'},{at:900,release:'btn1'}],ticks:[300,750]}},
 toggle2:{parent:'toggle',solution:{diagram:D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]),code:`const int BUTTON_PIN = 22;
const int LED_PIN = 23;

int lastState = HIGH;
bool ledOn = false;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState) {
    if (state == LOW) {
      ledOn = !ledOn;
      digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
      Serial.println(ledOn ? "LED ON" : "LED OFF");
    }
    delay(50);
  }
  lastState = state;
}
`},title:'Your turn: say ON or OFF',intro:'Instead of counting, print what the LED is doing: “LED ON” or “LED OFF”.',
  steps:['Replace the two Serial lines with one: `Serial.println(ledOn ? "LED ON" : "LED OFF");`','Run and press a few times.'],
  hints:['`? :` picks the first text when ledOn is true, otherwise the second.'],
  goals:[{text:'Prints LED ON and LED OFF',check:s=>/LED ON/.test(s.out)&&/LED OFF/.test(s.out)&&presses(s)>=2},{text:'The last message matches the LED',check:s=>{const l=lines(s).filter(x=>/LED (ON|OFF)/.test(x)).pop();if(!l||presses(s)<3)return false;return /ON/.test(l)===ledKeys(s).some(k=>lit(s,k));}}],
  script:{ms:1800,actions:[300,700,1100].flatMap(t=>[{at:t,press:'btn1'},{at:t+150,release:'btn1'}])}},
 nowait2:{parent:'nowait',solution:null,title:'Your turn: faster, still listening',intro:'Make the LED blink every 200 ms. The button must still stop it at once.',
  steps:['Change the interval in the blink check from 500 to 200.','Run, then press the button while it blinks.'],
  hints:['Only one number changes: `now - lastBlink >= 200`.'],
  goals:[{text:'The LED blinks every 200 ms',check:s=>!!blinkKey(s,200,200,0.2)},{text:'A press still stops it',check:s=>{if(/stopped/.test(s.out)&&!ledKeys(s).some(k=>lit(s,k))){const t=s.serialLog.filter(e=>/stopped/.test(e.s)).pop()?.t;if(t!==undefined&&s.now/1000-t>500)s.mem.stop=true;}return !!s.mem.stop;}}],
  script:{ms:2600,actions:[{at:1300,press:'btn1'},{at:1450,release:'btn1'}],ticks:[1250]}},
 fade2:{parent:'fade',solution:null,title:'Your turn: halfway',intro:'Let the LED fade up only to half brightness, then back down.',
  steps:['Change the top of both loops from 255 to about 127.','Restart and watch: it never gets fully bright.'],
  hints:['Half of 255 is about 127. Change it in both for loops.'],
  goals:[{text:'It still fades smoothly',check:s=>s.writes.filter(w=>w.pwm).length>50},{text:'It stops at about half (around 127)',check:s=>{const v=s.writes.filter(w=>w.pwm).map(w=>w.v);return v.length>50&&Math.max(...v)>=115&&Math.max(...v)<=140;}}],script:{ms:1500}},
 colors2:{parent:'colors',solution:null,title:'Your turn: yellow and white',intro:'Add two more colors to the show: yellow (red + green) and white (all three).',
  steps:['Add `color(255, 255, 0);` with a delay for yellow.','Add white with all three channels on. Run it.'],
  hints:['Light mixes differently from paint: red + green = yellow.'],
  goals:[{text:'Yellow',check:s=>(s.mem.y=s.mem.y||rgbIs(s,1,1,0))},{text:'White',check:s=>(s.mem.w=s.mem.w||rgbIs(s,1,1,1))}],script:{ms:6300,ticks:[500,1500,2500,3500,4500,5500]}},
 dimmer2:{parent:'dimmer',solution:null,title:'Your turn: turn it around',intro:'Make the knob work the other way: bright where it was dark, dark where it was bright.',
  steps:['Swap the last two numbers in map(): `map(raw, 0, 4095, 255, 0)`.','Restart and turn the knob to both ends.'],
  hints:['map() can count down as well as up.'],
  goals:[{text:'Knob at the start: LED fully bright',check:s=>(s.mem.lo=s.mem.lo||(potAt(s)<0.03&&ledKeys(s).some(k=>(s.leds[k]||0)>0.45)))},{text:'Knob at the end: LED dark',check:s=>(s.mem.hi=s.mem.hi||(potAt(s)>0.97&&ledKeys(s).every(k=>(s.leds[k]||0)<0.03)))}],
  script:{ms:1100,actions:[{at:200,pot:'pot1',pos:0},{at:600,pot:'pot1',pos:1}],ticks:[500,1000]}}
});
// solutions written as a small change of the parent's solution
const tweak=(id,from,to)=>({diagram:MISSIONS[MISSIONS[id].parent].solution.diagram,code:MISSIONS[MISSIONS[id].parent].solution.code.split(from).join(to)});
MISSIONS.nowait2.solution=tweak('nowait2','now - lastBlink >= 500','now - lastBlink >= 200');
MISSIONS.fade2.solution=tweak('fade2','255','127');
MISSIONS.colors2.solution=tweak('colors2','  color(255, 0, 255); // purple\n  delay(1000);\n','  color(255, 0, 255); // purple\n  delay(1000);\n  color(255, 255, 0); // yellow\n  delay(1000);\n  color(255, 255, 255); // white\n  delay(1000);\n');
MISSIONS.dimmer2.solution=tweak('dimmer2','map(raw, 0, 4095, 0, 255)','map(raw, 0, 4095, 255, 0)');
for(const m of Object.values(MISSIONS))if(m.parent)m.starter={code:MISSIONS[m.parent].solution.code,diagram:MISSIONS[m.parent].solution.diagram};
// missions whose starter keeps the previous mission's code take it from there
const PREV={fast:'blink',pair:'blink',two:'nowait',speed:'dimmer'};
for(const [id,m] of Object.entries(MISSIONS)){m.id=id;if(m.starter.code===null)m.starter.code=MISSIONS[PREV[id]].solution.code;}
export function checkGoals(m,s){if(!s.mem)s.mem={};if(!s.passed)s.passed=new Set();m.goals.forEach((g,i)=>{try{if(!s.passed.has(i)&&g.check(s))s.passed.add(i);}catch{}});return m.goals.map((g,i)=>s.passed.has(i));}
