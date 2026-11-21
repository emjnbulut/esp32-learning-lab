// Missions for the published episodes 5-9 (PWM, RGB, analog input, map() and the level bar, the pedestrian
// crossing) and the episode 10 reflex game. Code and pins follow esp32-from-zero/lessons/NN-*/code.
// missions.mjs calls episodeMissions() with its circuit and check helpers; the shape is the same as every other mission.
export function episodeMissions(h){
 const {D,BLINK_PARTS,BLINK_WIRES,BUTTON_PART,BUTTON_WIRES,POT_PART,POT_WIRES,RGB_PARTS,RGB_WIRES,W_GND,W_3V3,lines,ledKeys,lit,changes,durations,blinkKey,pressed,presses,potAt,rgbIs,levels}=h;
 const BLK='#2b2b2b',RED='#d64541';
 const w=(a,b,color)=>({a,b,color});
 const uniq=ws=>ws.filter((x,i)=>ws.findIndex(y=>y.a===x.a&&y.b===x.b)===i);
 const M={};
 // ---------- circuits (PINMAP: red 23, yellow 18, green 17, RGB 25/26/27, button 22, knob 34) ----------
 const YELLOW_PARTS=[{id:'led2',type:'led',at:'bb:b5',attrs:{color:'yellow'}},{id:'r2',type:'resistor',at:'bb:d2'}];
 const YELLOW_WIRES=[w('esp:D18','bb:a2','#c9a400'),w('bb:a6','bb:tn6',BLK)];
 const GREEN_PARTS=[{id:'led3',type:'led',at:'bb:b11',attrs:{color:'green'}},{id:'r3',type:'resistor',at:'bb:d8'}];
 const GREEN_WIRES=[w('esp:TX2','bb:a8','#2f9a3c'),w('bb:a12','bb:tn12',BLK),w('esp:GND.R','bb:tn2',BLK)];
 const BREATHE=D([...BLINK_PARTS,BUTTON_PART],[...BLINK_WIRES,...BUTTON_WIRES]);
 const MODES=D([...RGB_PARTS,BUTTON_PART],uniq([...RGB_WIRES,...BUTTON_WIRES]));
 const KNOB=D([...BLINK_PARTS,POT_PART],[...BLINK_WIRES,...POT_WIRES]);
 const LEVEL=D([...BLINK_PARTS,...YELLOW_PARTS,...GREEN_PARTS,POT_PART],uniq([...BLINK_WIRES,...YELLOW_WIRES,...GREEN_WIRES,...POT_WIRES]));
 const LOCK=D([...RGB_PARTS,BUTTON_PART,POT_PART],uniq([...RGB_WIRES,...BUTTON_WIRES,...POT_WIRES]));
 // episode 9: everything from episodes 3-8 is on the board, no new wire
 const RGB_SHIFT=RGB_PARTS.map(p=>({...p,id:p.id==='rgb1'?'rgb1':p.id.replace('r','rr')}));
 const CROSS=D([...BLINK_PARTS,...YELLOW_PARTS,...GREEN_PARTS,...RGB_SHIFT,BUTTON_PART,POT_PART],uniq([...BLINK_WIRES,...YELLOW_WIRES,...GREEN_WIRES,...RGB_WIRES,...BUTTON_WIRES,...POT_WIRES]));
 // episode 10: button moves to GPIO 19, OLED on SDA 21 / SCL 22, passive buzzer on GPIO 32
 const BTN19={id:'btn1',type:'button',at:'bb:e10'},BTN19_WIRES=[w('esp:D19','bb:j10','#c9a400'),w('bb:j12','bb:bn12',BLK)];
 const BUZ32={id:'buzzer1',type:'buzzer',at:'bb:j16'},BUZ32_WIRES=[w('bb:f16','bb:bn16',BLK),w('bb:f18','esp:D32','#2f6fd0')];
 const OLED22={id:'oled1',type:'oled',at:'bb:j22'},OLED22_WIRES=[w('bb:f22','bb:bn22',BLK),w('bb:f23','bb:bp23',RED),w('bb:f24','esp:D22','#2f9a3c'),w('bb:f25','esp:D21','#2f6fd0')];
 const BEEP=D([BTN19,BUZ32],[W_3V3,W_GND,...BTN19_WIRES,...BUZ32_WIRES]);
 const REFLEX=D([BTN19,BUZ32,OLED22],[W_3V3,W_GND,...BTN19_WIRES,...BUZ32_WIRES,...OLED22_WIRES]);
 // ---------- check helpers ----------
 const on=(s,k)=>(s.leds[k]||0)>0.15;
 const lastNum=s=>{const n=lines(s).map(l=>l.trim()).filter(l=>/^-?\d+$/.test(l));return n.length?+n[n.length-1]:-1;};
 const lastPwm=(s,pin)=>{const x=s.writes.filter(q=>q.pin===pin);return x.length?x[x.length-1].v:-1;};
 const pressTimes=s=>s.events.filter(e=>e.down===true).map(e=>e.t);
 const ledAfter=(s,k,t)=>s.ledLog.filter(e=>e.id===k&&e.t>t).length;
 const onPeriods=(s,k)=>{const c=changes(s,k),out=[];for(let i=1;i<c.length;i++)if(c[i-1].on&&!c[i].on)out.push(c[i].t-c[i-1].t);return out;};
 const screen=s=>(s.oledState.screen||[]).filter(x=>x.t==='text').map(x=>x.s).join(' ');
 const notes=s=>s.buzzerLog.filter(e=>e.f>0);
 const silent=s=>!Object.values(s.buzzers).some(f=>f>0);
 // ---------- episode 5: a fade that never waits ----------
 const FADE=(body)=>String.raw`const int LED_PIN = 23;
const int BUTTON_PIN = 22;

int brightness = 0;            // 0 (off) .. 255 (full)
int step = 1;                  // +1 = brighter, -1 = dimmer
unsigned long lastStep = 0;
bool fading = true;            // false = paused

int lastState = HIGH;          // the button, as in episode 4
unsigned long lastChange = 0;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // PART 1 - the button: a new press pauses or resumes the fade
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) {
      fading = !fading;
    }
  }

  // PART 2 - the fade: every 4 ms, one small step
  if (fading && now - lastStep >= 4) {
    lastStep = now;
${body}  }
}
`;
 M.breathe={starter:{diagram:BREATHE,code:FADE('    // add step to brightness, turn around at 255 and at 0, then analogWrite it\n')},
  solution:{diagram:BREATHE,code:FADE(`    brightness = brightness + step;
    if (brightness >= 255) {
      brightness = 255;
      step = -1;               // reached the top: go down
    }
    if (brightness <= 0) {
      brightness = 0;
      step = 1;                // reached the bottom: go up
    }
    analogWrite(LED_PIN, brightness);
    Serial.println(brightness);
`)},
  title:'A fade that never waits',intro:'Episode 5: the LED breathes, and a press pauses it at once. No delay(): every 4 ms millis() allows one small step, so loop() keeps reading the button.',
  steps:['Inside PART 2, add one step: `brightness = brightness + step;`','Turn around at the ends: at 255 set `step = -1;`, at 0 set `step = 1;`','Show it: `analogWrite(LED_PIN, brightness);` Run it, then press the button twice.'],
  hints:['255 steps × 4 ms ≈ 1 second up and 1 second down.','The button part is already done. It flips `fading`, and PART 2 only steps while fading is true.'],
  goals:[{text:'The LED breathes: brighter, then dimmer',check:s=>ledKeys(s).some(k=>{const b=s.ledLog.filter(e=>e.id===k).map(e=>e.b);if(levels(s,k)<12)return false;const top=Math.max(...b),i=b.indexOf(top);return top>0.3&&b.slice(i).some(x=>x<top-0.1);})},
   {text:'A press pauses the fade',check:s=>{const t=pressTimes(s);if(t.length%2!==1||s.now/1000-t[t.length-1]<400)return false;return ledKeys(s).some(k=>ledAfter(s,k,t[t.length-1]+80)===0);}},
   {text:'The next press lets it breathe again',check:s=>{const t=pressTimes(s);if(t.length<2||t.length%2!==0)return false;return ledKeys(s).some(k=>ledAfter(s,k,t[t.length-1]+80)>=10);}}],
  script:{ms:3000,actions:[{at:1300,press:'btn1'},{at:1420,release:'btn1'},{at:2200,press:'btn1'},{at:2320,release:'btn1'}],ticks:[1250,2150,2950]}};
 // ---------- episode 6: one button, four color modes ----------
 const MODE_CODE=(body)=>String.raw`const int RED_PIN = 25;
const int GREEN_PIN = 26;
const int BLUE_PIN = 27;
const int BUTTON_PIN = 22;

int mode = 0;                  // 0 red, 1 green, 2 blue, 3 fade
int level = 0;                 // mode 3: 0 (all blue) .. 255 (all red)
int step = 1;
unsigned long lastStep = 0;
int lastState = HIGH;
unsigned long lastChange = 0;

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // PART 1 - the button: every new press goes to the next mode
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) {
      mode = mode + 1;
      if (mode > 3) {
        mode = 0;              // after the last mode, start again
      }
      Serial.print("mode ");
      Serial.println(mode);
    }
  }

  // PART 2 - the color for the current mode
${body}}
`;
 M.modes={starter:{diagram:MODES,code:MODE_CODE(`  if (mode == 0) {
    setColor(255, 0, 0);       // red
  }
  // add mode 1 (green), mode 2 (blue) and mode 3 (a slow blue <-> red fade)
`)},
  solution:{diagram:MODES,code:MODE_CODE(`  if (mode == 0) {
    setColor(255, 0, 0);       // red
  } else if (mode == 1) {
    setColor(0, 255, 0);       // green
  } else if (mode == 2) {
    setColor(0, 0, 255);       // blue
  } else {
    if (now - lastStep >= 8) {
      lastStep = now;
      level = level + step;
      if (level >= 255) {
        level = 255;
        step = -1;
      }
      if (level <= 0) {
        level = 0;
        step = 1;
      }
    }
    setColor(level, 0, 255 - level);  // more red = less blue
  }
`)},
  title:'One button, four colors',intro:'Episode 6: each press moves to the next mode: red, green, blue, then a slow blue-to-red fade, and back to red. The button always reacts at once, because nothing waits.',
  steps:['Run the starter and press the button: the Serial Monitor counts the modes, but the LED stays red.','Add `else if (mode == 1)` for green and `else if (mode == 2)` for blue.','For mode 3, step `level` every 8 ms like the episode 5 fade and call `setColor(level, 0, 255 - level);`'],
  hints:['The fade is the same trick as the breathing LED: a millis() check, a step, and a turn at 0 and 255.','Red and blue always add up to 255, so the color slides from blue through purple to red.'],
  goals:[{text:'Mode 0: red',check:s=>(s.mem.r=s.mem.r||(presses(s)===0&&s.now>200e3&&rgbIs(s,1,0,0)))},{text:'One press: green',check:s=>(s.mem.g=s.mem.g||(presses(s)===1&&rgbIs(s,0,1,0)))},{text:'Next press: blue',check:s=>(s.mem.b=s.mem.b||(presses(s)===2&&rgbIs(s,0,0,1)))},
   {text:'Mode 3: a slow fade between blue and red',check:s=>(s.mem.f=s.mem.f||(presses(s)===3&&levels(s,'rgb1:R')>=10&&levels(s,'rgb1:B')>=10))},{text:'One more press: back to red',check:s=>(s.mem.back=s.mem.back||(presses(s)===4&&rgbIs(s,1,0,0)))}],
  script:{ms:4300,actions:[500,1000,1500,3600].flatMap(t=>[{at:t,press:'btn1'},{at:t+120,release:'btn1'}]),ticks:[400,900,1400,3500,4200]}};
 // ---------- episode 7: read a knob ----------
 M.knob={starter:{diagram:KNOB,code:`const int POT_PIN = 34;        // the knob's middle leg

void setup() {
  Serial.begin(115200);
}

void loop() {
  // read the knob into value, print it, wait 100 ms
}
`},solution:{diagram:KNOB,code:`const int POT_PIN = 34;        // the knob's middle leg

void setup() {
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(POT_PIN);  // 0 = one end (0 V), 4095 = other end (3.3 V)
  Serial.println(value);
  delay(100);
}
`},title:'Read the knob',intro:'Episode 7: a button answers yes or no, a knob answers how much. analogRead() measures the voltage on the middle leg and gives back a number from 0 (0 V) to 4095 (3.3 V).',
  steps:['Read the knob: `int value = analogRead(POT_PIN);`','Print it and wait a little: `Serial.println(value);` and `delay(100);`','Run it and turn the knob (drag it, or use the Controls bar) to both ends and to the middle.'],
  hints:['A pin you only read with analogRead() needs no pinMode().','Near the two ends the ESP32 reading flattens a little, so you may not see exactly 0 or 4095.'],
  goals:[{text:'Numbers appear in the monitor',check:s=>lines(s).filter(l=>/^\d+$/.test(l.trim())).length>=3},{text:'Knob at one end: close to 0',check:s=>(s.mem.lo=s.mem.lo||(potAt(s)<0.03&&lastNum(s)>=0&&lastNum(s)<120))},{text:'Knob at the other end: close to 4095',check:s=>(s.mem.hi=s.mem.hi||(potAt(s)>0.97&&lastNum(s)>3975))},{text:'Knob in the middle: about 2000',check:s=>(s.mem.mid=s.mem.mid||(Math.abs(potAt(s)-0.5)<0.1&&lastNum(s)>1700&&lastNum(s)<2400))}],
  script:{ms:1700,actions:[{at:200,pot:'pot1',pos:0},{at:700,pot:'pot1',pos:1},{at:1200,pot:'pot1',pos:0.5}],ticks:[600,1100,1600]}};
 const KNOBLED=(body)=>String.raw`const int POT_PIN = 34;        // the knob
const int LED_PIN = 23;        // the red LED

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(POT_PIN);    // the knob: 0 .. 4095
${body}  delay(20);
}
`;
 M.knobled={starter:{diagram:KNOB,code:KNOBLED('  // scale it to 0 .. 255 (divide by 16) and analogWrite it to the LED\n')},
  solution:{diagram:KNOB,code:KNOBLED('  int brightness = value / 16;        // the same position, 0 .. 255\n  analogWrite(LED_PIN, brightness);\n  Serial.println(brightness);\n')},
  title:'The knob dims the LED',intro:'analogWrite() only takes 0 to 255, but the knob gives up to 4095. The knob’s scale is 16 times bigger, so we divide by 16 and both ends of the knob land on both ends of the brightness.',
  steps:['Scale the reading: `int brightness = value / 16;`','Show it: `analogWrite(LED_PIN, brightness);`','Run it and turn the knob from one end to the other.'],
  hints:['4095 / 16 is about 255.','Divide by 32 instead and the LED never gets past half power: the biggest number is then about 127.'],
  goals:[{text:'Knob at one end: LED dark',check:s=>(s.mem.lo=s.mem.lo||(potAt(s)<0.03&&ledKeys(s).every(k=>(s.leds[k]||0)<0.03)))},{text:'Knob at the other end: LED fully bright',check:s=>(s.mem.hi=s.mem.hi||(potAt(s)>0.97&&ledKeys(s).some(k=>(s.leds[k]||0)>0.45)))},{text:'Knob in the middle: LED half bright',check:s=>(s.mem.mid=s.mem.mid||(Math.abs(potAt(s)-0.5)<0.1&&ledKeys(s).some(k=>s.leds[k]>0.12&&s.leds[k]<0.4)))}],
  script:{ms:1500,actions:[{at:200,pot:'pot1',pos:0},{at:600,pot:'pot1',pos:1},{at:1000,pot:'pot1',pos:0.5}],ticks:[500,900,1400]}};
 const ZONES=(body)=>String.raw`const int POT_PIN = 34;        // the knob
const int LED_PIN = 23;        // the red LED

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(POT_PIN);     // the knob: 0 .. 4095
  if (value < 1365) {                  // left third
    analogWrite(LED_PIN, 20);          // dim
${body}  Serial.println(value);
  delay(20);
}
`;
 M.zones={starter:{diagram:KNOB,code:ZONES('  }\n  // add the middle third (120) with else if, and the right third (255) with else\n')},
  solution:{diagram:KNOB,code:ZONES('  } else if (value < 2730) {           // middle third\n    analogWrite(LED_PIN, 120);         // medium\n  } else {                             // right third\n    analogWrite(LED_PIN, 255);         // full\n  }\n')},
  title:'Three zones',intro:'Like the low, medium and high marks on a stove: cut the knob into three equal parts. 4095 / 3 is about 1365, so the cuts are at 1365 and 2730. The zones exist only in your code.',
  steps:['After the first if, add `else if (value < 2730)` with `analogWrite(LED_PIN, 120);`','Add `else` with `analogWrite(LED_PIN, 255);` for the right third.','Run it and turn the knob slowly from left to right.'],
  hints:['else if is only checked when the test before it was false.','A reading of exactly 1365 lands in the middle zone: < means strictly less.'],
  goals:[{text:'Left third: dim (20)',check:s=>(s.mem.l=s.mem.l||(potAt(s)<0.3&&lastPwm(s,23)===20))},{text:'Middle third: medium (120)',check:s=>(s.mem.m=s.mem.m||(Math.abs(potAt(s)-0.5)<0.1&&lastPwm(s,23)===120))},{text:'Right third: full (255)',check:s=>(s.mem.r=s.mem.r||(potAt(s)>0.7&&lastPwm(s,23)===255))}],
  script:{ms:1300,actions:[{at:100,pot:'pot1',pos:0.15},{at:500,pot:'pot1',pos:0.5},{at:900,pot:'pot1',pos:0.85}],ticks:[450,850,1250]}};
 M.knobblink={starter:{diagram:KNOB,code:null},solution:{diagram:KNOB,code:`const int POT_PIN = 34;        // the knob
const int LED_PIN = 23;        // the red LED

unsigned long lastBlink = 0;
bool ledOn = false;
int interval = 400;            // picked by the knob

void setup() {
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // PART 1 - the knob picks the interval
  int value = analogRead(POT_PIN);
  if (value < 1365) {
    interval = 100;
  } else if (value < 2730) {
    interval = 400;
  } else {
    interval = 1000;
  }

  // PART 2 - the blink, same trick as episode 4
  if (now - lastBlink >= interval) {
    lastBlink = now;
    ledOn = !ledOn;
    digitalWrite(LED_PIN, ledOn ? HIGH : LOW);
  }
}
`},title:'Challenge: knob blink speed',intro:'The LED blinks all the time and the knob picks the speed in three zones: every 100 ms, every 400 ms and every second. The twist: nothing may wait with delay().',
  steps:['Use today’s zones to set a variable `interval` to 100, 400 or 1000.','Blink with the millis() trick from episode 4: `if (now - lastBlink >= interval)`.','Remove every delay() and turn the knob through all three zones.'],
  hints:['You need `unsigned long lastBlink` and `bool ledOn` as global variables.','`digitalWrite(LED_PIN, ledOn ? HIGH : LOW);` after flipping ledOn.'],
  goals:[{text:'Left third: it changes every 100 ms',check:s=>(s.mem.f=s.mem.f||(potAt(s)<0.33&&!!blinkKey(s,100,100,0.2)))},{text:'Middle third: every 400 ms',check:s=>(s.mem.m=s.mem.m||(Math.abs(potAt(s)-0.5)<0.17&&!!blinkKey(s,400,400,0.15)))},{text:'Right third: every 1000 ms',check:s=>(s.mem.s=s.mem.s||(potAt(s)>0.67&&!!blinkKey(s,1000,1000,0.1)))},{text:'No delay() in the sketch',check:s=>!/\bdelay\s*\(/.test(s.code.replace(/\/\/.*$/gm,''))&&!!(s.mem.f||s.mem.m||s.mem.s)}],
  script:{ms:11000,actions:[{at:50,pot:'pot1',pos:0.1},{at:1000,pot:'pot1',pos:0.5},{at:3800,pot:'pot1',pos:0.9}],ticks:[990,3790,10900]}};
 // ---------- episode 8: a 3-LED level bar and the safe lock ----------
 const LEVEL_CODE=(body)=>String.raw`const int POT_PIN = 34;
const int GREEN_PIN = 17;
const int YELLOW_PIN = 18;
const int RED_PIN = 23;

void setup() {
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(YELLOW_PIN, OUTPUT);
  pinMode(RED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  int value = analogRead(POT_PIN);       // 0 .. 4095
  int level = map(value, 0, 4096, 0, 4); // 0, 1, 2 or 3
  if (level == 0) {                      // nothing
    digitalWrite(GREEN_PIN, LOW);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(RED_PIN, LOW);
  } else if (level == 1) {               // green
    digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(YELLOW_PIN, LOW);
    digitalWrite(RED_PIN, LOW);
${body}  Serial.println(level);
  delay(20);
}
`;
 const bar=(s,g,y,r)=>[['led3',g],['led2',y],['led1',r]].every(([k,want])=>on(s,k)===!!want);
 M.levelbar={starter:{diagram:LEVEL,code:LEVEL_CODE('  }\n  // add level 2 (green + yellow) and level 3 (all three)\n')},
  solution:{diagram:LEVEL,code:LEVEL_CODE(`  } else if (level == 2) {               // green + yellow
    digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(YELLOW_PIN, HIGH);
    digitalWrite(RED_PIN, LOW);
  } else {                               // all three
    digitalWrite(GREEN_PIN, HIGH);
    digitalWrite(YELLOW_PIN, HIGH);
    digitalWrite(RED_PIN, HIGH);
  }
`)},
  title:'A 3-LED level bar',intro:'Episode 8: like the battery icon on a phone. map() turns the knob into a level from 0 to 3, and the level says how many LEDs are on, counting from green. Green is on GPIO 17, yellow on 18, red on 23.',
  steps:['Run the starter and turn the knob: only green ever lights.','Add `else if (level == 2)` with green and yellow on.','Add `else` with all three on. Turn the knob from one end to the other.'],
  hints:['Why `map(value, 0, 4096, 0, 4)`? map() rounds down, so with 0, 4095, 0, 3 the top level would only come at the very last mark. Four equal slices fix it.','Every branch sets all three LEDs, so no LED is left on from the level before.'],
  goals:[{text:'Knob at the start: all off',check:s=>(s.mem.z=s.mem.z||(potAt(s)<0.1&&s.now>100e3&&bar(s,0,0,0)))},{text:'A bit further: only green',check:s=>(s.mem.g=s.mem.g||(Math.abs(potAt(s)-0.375)<0.1&&bar(s,1,0,0)))},{text:'More than half: green and yellow',check:s=>(s.mem.y=s.mem.y||(Math.abs(potAt(s)-0.625)<0.1&&bar(s,1,1,0)))},{text:'At the end: all three',check:s=>(s.mem.r=s.mem.r||(potAt(s)>0.95&&bar(s,1,1,1)))}],
  script:{ms:1350,actions:[{at:50,pot:'pot1',pos:0.05},{at:400,pot:'pot1',pos:0.375},{at:700,pot:'pot1',pos:0.625},{at:1000,pot:'pot1',pos:1}],ticks:[350,650,950,1300]}};
 const LOCK_CODE=(body)=>String.raw`const int POT_PIN = 34;
const int BUTTON_PIN = 22;
const int RED_PIN = 25;
const int GREEN_PIN = 26;
const int BLUE_PIN = 27;

int step = 0;                  // how many numbers were right: 0, 1, 2 (3 = open)
int lastState = HIGH;
unsigned long lastChange = 0;
unsigned long lastPrint = 0;

void setColor(int r, int g, int b) {
  analogWrite(RED_PIN, r);
  analogWrite(GREEN_PIN, g);
  analogWrite(BLUE_PIN, b);
}

void setup() {
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  pinMode(BLUE_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
  setColor(0, 0, 40);          // dim blue: locked
}

void loop() {
  unsigned long now = millis();
  int number = map(analogRead(POT_PIN), 0, 4095, 0, 99);
  if (now - lastPrint >= 200) {          // show the dial 5 times a second
    lastPrint = now;
    Serial.println(number);
  }

  int state = digitalRead(BUTTON_PIN);
  if (state != lastState && now - lastChange >= 50) {
    lastChange = now;
    lastState = state;
    if (state == LOW) {
${body}    }
  }
}
`;
 M.safelock={starter:{diagram:LOCK,code:LOCK_CODE('      // a new press: check number against 25, 70, 40 (one per step, +-3 is fine)\n')},
  solution:{diagram:LOCK,code:LOCK_CODE(`      int target = 25;
      if (step == 1) {
        target = 70;
      } else if (step == 2) {
        target = 40;
      }
      if (number >= target - 3 && number <= target + 3) {
        step = step + 1;
        Serial.print("ok, step ");
        Serial.println(step);
        if (step == 3) {
          setColor(0, 255, 0);           // open!
          Serial.println("OPEN");
        }
      } else {
        step = 0;                        // wrong: flash red, start over
        setColor(255, 0, 0);
        delay(400);
        setColor(0, 0, 40);
        Serial.println("wrong, start again");
      }
`)},
  title:'Challenge: rotary safe lock',intro:'The episode 8 challenge. The knob dials a number from 0 to 99. Dial 25 and press, dial 70 and press, dial 40 and press: the safe opens and the RGB LED turns green. A wrong number flashes red and starts over.',
  steps:['Pick the target for this step: 25, then 70, then 40.','If the number is within 3 of the target, go one step further; at step 3 show green and print OPEN.','Otherwise go back to step 0 and flash red. Watch the dial numbers in the Serial Monitor while you turn the knob.'],
  hints:['`number >= target - 3 && number <= target + 3` accepts 22 to 28 for 25: a knob is never exact.','`map(analogRead(POT_PIN), 0, 4095, 0, 99)` turns the knob into the dial.'],
  goals:[{text:'The dial reaches 99 at the end of the knob',check:s=>(s.mem.d=s.mem.d||(potAt(s)>0.97&&lastNum(s)>=98))},{text:'A wrong number flashes red',check:s=>(s.mem.w=s.mem.w||(presses(s)>=1&&s.ledLog.some(e=>e.id==='rgb1:R'&&e.b>0.1)))},{text:'25, 70, 40: the safe opens (green)',check:s=>(s.mem.o=s.mem.o||(presses(s)>=3&&rgbIs(s,0,1,0)))}],
  script:{ms:3000,actions:[{at:100,pot:'pot1',pos:1},{at:600,pot:'pot1',pos:0.9},{at:700,press:'btn1'},{at:820,release:'btn1'},{at:1400,pot:'pot1',pos:0.2576},{at:1500,press:'btn1'},{at:1620,release:'btn1'},{at:1900,pot:'pot1',pos:0.7121},{at:2000,press:'btn1'},{at:2120,release:'btn1'},{at:2400,pot:'pot1',pos:0.4091},{at:2500,press:'btn1'},{at:2620,release:'btn1'}],ticks:[500,950,2950]}};
 // ---------- episode 9: the smart pedestrian crossing ----------
 const HEAD=String.raw`const int CAR_RED = 23;
const int CAR_YELLOW = 18;
const int CAR_GREEN = 17;
const int WALK_RED = 25;       // RGB red leg
const int WALK_GREEN = 26;     // RGB green leg
const int BUTTON_PIN = 22;
const int POT_PIN = 34;

int state = 0;                 // 0 cars green, 1 cars yellow, 2 walk, 3 walk blinking
unsigned long stateStart = 0;  // when the current step began (ms)
bool request = false;          // somebody pressed and waits
`;
 const HELPERS=String.raw`int lastButton = HIGH;
unsigned long lastChange = 0;
bool blinkOn = true;
unsigned long lastBlink = 0;

// set all five lights in one call (HIGH = on, LOW = off)
void lights(int red, int yellow, int green, int walkRed, int walkGreen) {
  digitalWrite(CAR_RED, red);
  digitalWrite(CAR_YELLOW, yellow);
  digitalWrite(CAR_GREEN, green);
  digitalWrite(WALK_RED, walkRed);
  digitalWrite(WALK_GREEN, walkGreen);
}

// a new step = a new number in state + a new start time
void goTo(int newState, unsigned long now) {
  state = newState;
  stateStart = now;
  Serial.print("state ");
  Serial.println(state);
}

void setup() {
  pinMode(CAR_RED, OUTPUT);
  pinMode(CAR_YELLOW, OUTPUT);
  pinMode(CAR_GREEN, OUTPUT);
  pinMode(WALK_RED, OUTPUT);
  pinMode(WALK_GREEN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();

  // PART 1 - the button: a new press while the cars have green is a request
  int b = digitalRead(BUTTON_PIN);
  if (b != lastButton && now - lastChange >= 50) {
    lastChange = now;
    lastButton = b;
`;
 const STEPS01=String.raw`
  // PART 2 - the steps
  unsigned long inState = now - stateStart;
  unsigned long greenTime = map(analogRead(POT_PIN), 0, 4095, 3000, 10000);
  if (state == 0) {                      // cars green, walker waits
    lights(LOW, LOW, HIGH, HIGH, LOW);
    if (request && inState >= greenTime) {
      goTo(1, now);
    }
  } else if (state == 1) {               // cars yellow for 2 s
    lights(LOW, HIGH, LOW, HIGH, LOW);
    if (inState >= 2000) {
      request = false;
      goTo(2, now);
    }
`;
 const STEPS23=walk=>String.raw`  } else if (state == 2) {               // cars red, walker green
    lights(HIGH, LOW, LOW, LOW, HIGH);
    if (inState >= ${walk}) {
      goTo(3, now);
    }
  } else {                               // the walk light blinks for 2 s
    if (now - lastBlink >= 250) {
      lastBlink = now;
      blinkOn = !blinkOn;
    }
    lights(HIGH, LOW, LOW, LOW, blinkOn ? HIGH : LOW);
    if (inState >= 2000) {
      goTo(0, now);
    }
  }
}
`;
 const PRESS1=String.raw`    if (b == LOW && state == 0) {
      request = true;
      Serial.println("request");
    }
  }
`;
 const CROSSING=HEAD+HELPERS+PRESS1+STEPS01+STEPS23('4000');
 const rgbOn=(s,c)=>(s.leds['rgb1:'+c]||0)>0.1;
 const carsGreen=s=>on(s,'led3')&&!on(s,'led2')&&!on(s,'led1')&&rgbOn(s,'R')&&!rgbOn(s,'G');
 M.crossing={starter:{diagram:CROSS,code:HEAD+HELPERS+PRESS1+STEPS01+'  }\n  // add step 2 (cars red, walker green for 4 s) and step 3 (walk light blinks for 2 s, then back to 0)\n}\n'},
  solution:{diagram:CROSS,code:CROSSING},
  title:'A smart pedestrian crossing',intro:'Mini project 1 (episode 9). The three LEDs are the car lights, the RGB LED is the walk light, the button asks to cross and the knob sets the cars’ green time (3 to 10 s). One variable, state, says which step we are in; millis() says how long.',
  steps:['Run the starter and press the button: after the green time the cars get yellow, then everything stops.','Add step 2: `lights(HIGH, LOW, LOW, LOW, HIGH);` and after 4000 ms `goTo(3, now);`','Add step 3: blink `blinkOn` every 250 ms, show it on the walk light, and after 2000 ms `goTo(0, now);`'],
  hints:['Like a washing machine: each step knows how long it has been running (`inState`) and moves on when its time is up.','Always change the step with goTo(): it writes down the new start time too.'],
  goals:[{text:'Nobody asks: cars green, walker red',check:s=>(s.mem.idle=s.mem.idle||(presses(s)===0&&s.now>300e3&&carsGreen(s)))},{text:'A press: the cars get yellow',check:s=>(s.mem.y=s.mem.y||(presses(s)>=1&&on(s,'led2')&&!on(s,'led3')))},{text:'Then cars red and walker green',check:s=>(s.mem.w=s.mem.w||(on(s,'led1')&&rgbOn(s,'G')&&!rgbOn(s,'R')))},{text:'The walk light blinks before the end',check:s=>(s.mem.b=s.mem.b||(!!s.mem.w&&changes(s,'rgb1:G').length>=6))},{text:'Then the cars get green again',check:s=>(s.mem.again=s.mem.again||(!!s.mem.b&&carsGreen(s)))}],
  script:{ms:12600,actions:[{at:50,pot:'pot1',pos:0},{at:3500,press:'btn1'},{at:3650,release:'btn1'}],ticks:[1000,4500,7000,11000,12500]}};
 const PRESS_CODE=(body)=>String.raw`const int BUTTON_PIN = 22;
const int LED_PIN = 18;        // the yellow LED

int lastButton = HIGH;
unsigned long lastChange = 0;
unsigned long pressStart = 0;  // the parking ticket: when the button went down

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();
  int b = digitalRead(BUTTON_PIN);
  if (b != lastButton && now - lastChange >= 50) {
    lastChange = now;
    lastButton = b;
    if (b == LOW) {                      // pressed: stamp the ticket
      pressStart = now;
      digitalWrite(LED_PIN, HIGH);
    } else {                             // released: how long was it?
      digitalWrite(LED_PIN, LOW);
${body}    }
  }
}
`;
 const held=(s,word)=>lines(s).map(l=>l.trim().match(/^(\d+) ms: (short|long)$/)).filter(m=>m&&m[2]===word).map(m=>+m[1]);
 M.presstime={starter:{diagram:CROSS,code:PRESS_CODE('      // held = now - pressStart; print it, then "short" (under 250 ms) or "long"\n')},
  solution:{diagram:CROSS,code:PRESS_CODE(`      unsigned long held = now - pressStart;
      Serial.print(held);
      Serial.print(" ms: ");
      if (held < 250) {
        Serial.println("short");
      } else {
        Serial.println("long");
      }
`)},
  title:'How long was it held?',intro:'Like a parking ticket: stamp the time when the button goes down (pressStart), and at the release now - pressStart is how long it was held. The yellow LED shows the press.',
  steps:['At the release, work out `unsigned long held = now - pressStart;`','Print it like this: `120 ms: short` with `Serial.print(held);` and `Serial.print(" ms: ");`','Finish the line with short (under 250 ms) or long. Tap the button, then hold it for about a second.'],
  hints:['Print the number and " ms: " with Serial.print(), and the last word with Serial.println().','The debounce from episode 4 is already there, so one press is one ticket.'],
  goals:[{text:'Yellow is on while the button is held',check:s=>(s.mem.h=s.mem.h||(pressed(s)&&on(s,'led2')))},{text:'A quick tap prints its time and short',check:s=>held(s,'short').some(n=>n>=40&&n<250)},{text:'A long hold prints its time and long',check:s=>held(s,'long').some(n=>n>=650&&n<=950)}],
  script:{ms:1800,actions:[{at:300,press:'btn1'},{at:420,release:'btn1'},{at:800,press:'btn1'},{at:1600,release:'btn1'}],ticks:[350,700,1700]}};
 const PRESS2=String.raw`    if (b == LOW && state == 0) {
      request = true;
      pressStart = now;
      walkTime = 4000;
      Serial.println("request");
    }
    if (b == HIGH && request && now - pressStart >= 1000) {
      walkTime = 8000;           // released after a long hold
      Serial.println("slow walker: 8 s");
    }
  }
`;
 const walkPeriods=s=>onPeriods(s,'rgb1:G').filter(x=>x>2500);
 M.slowwalker={starter:{diagram:CROSS,code:null},
  solution:{diagram:CROSS,code:HEAD+'unsigned long pressStart = 0;  // the parking ticket\nunsigned long walkTime = 4000; // 4 s, or 8 s for a slow walker\n'+HELPERS+PRESS2+STEPS01+STEPS23('walkTime')},
  title:'Challenge: slow walker mode',intro:'The episode 9 homework. If the request button is held for more than a second, the walk light stays green twice as long: 8 seconds instead of 4.',
  steps:['Add two variables: `unsigned long pressStart` (the parking ticket) and `unsigned long walkTime = 4000;`','At the press, stamp `pressStart` and set walkTime back to 4000. At the release, if it was held 1000 ms or more, set `walkTime = 8000;`','Make step 2 last `walkTime`. Try a short press, then a long hold.'],
  hints:['The release is the moment `b == HIGH` after a press: `now - pressStart` is how long it was held.','Only one number changes in step 2: `inState >= walkTime`.'],
  goals:[{text:'A short press: the walker gets 4 s',check:s=>walkPeriods(s).some(x=>x>=3800&&x<=4400)},{text:'A long hold: the walker gets 8 s',check:s=>walkPeriods(s).some(x=>x>=7800&&x<=8400)}],
  script:{ms:25500,actions:[{at:50,pot:'pot1',pos:0},{at:3500,press:'btn1'},{at:3650,release:'btn1'},{at:12000,press:'btn1'},{at:13300,release:'btn1'}],ticks:[10000,25400]}};
 // ---------- episode 10 (coming): a passive buzzer and the reflex game 2.0 ----------
 const BEEP_CODE=(body)=>String.raw`const int BUTTON_PIN = 19;     // the button's new place (the OLED needs 22)
const int BUZZER_PIN = 32;     // passive buzzer

int lastButton = HIGH;
unsigned long lastChange = 0;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  unsigned long now = millis();
  int b = digitalRead(BUTTON_PIN);
  if (b != lastButton && now - lastChange >= 50) {
    lastChange = now;
    lastButton = b;
    if (b == LOW) {
      Serial.println("press");
${body}    }
  }
}
`;
 M.beep={starter:{diagram:BEEP,code:BEEP_CODE('      // play a short 880 Hz beep here\n')},solution:{diagram:BEEP,code:BEEP_CODE('      tone(BUZZER_PIN, 880, 150);   // 880 Hz for 150 ms\n')},
  title:'A beep on every press',intro:'A passive buzzer plays the pitch you give it. tone(pin, frequency, duration) starts a note and returns at once, so loop() keeps reading the button. The button moves to GPIO 19, because the OLED screen needs GPIO 22.',
  steps:['Run the starter and press the button: the Serial Monitor says press, but it is silent.','Add `tone(BUZZER_PIN, 880, 150);` where the press is detected.','Run it and press a few times.'],
  hints:['The third number is the length in ms. Without it the note plays until noTone(BUZZER_PIN).','A higher frequency is a higher note: 440 Hz is the A that orchestras tune to, 880 Hz is one octave above.'],
  goals:[{text:'A press plays an 880 Hz beep',check:s=>notes(s).some(e=>e.f===880)},{text:'The beep stops by itself',check:s=>(s.mem.q=s.mem.q||(notes(s).length>=1&&silent(s)&&!pressed(s)))},{text:'Every press beeps',check:s=>presses(s)>=3&&notes(s).filter(e=>e.f===880).length>=3}],
  script:{ms:1600,actions:[200,600,1000].flatMap(t=>[{at:t,press:'btn1'},{at:t+100,release:'btn1'}]),ticks:[550,1500]}};
 const REFLEX_CODE=(inc,decl,load,save)=>String.raw`#include <Wire.h>
#include <Adafruit_SSD1306.h>
${inc}
const int BUTTON_PIN = 19;
const int BUZZER_PIN = 32;

Adafruit_SSD1306 display(128, 64, &Wire, -1);
${decl}unsigned long best = 9999;     // the record in ms (9999 = no record yet)
int state = 0;                 // 0 ready, 1 wait, 2 go!, 3 result
unsigned long stateStart = 0;
unsigned long waitTime = 2000;
int lastButton = HIGH;
unsigned long lastChange = 0;

// two big lines on the OLED: draw them, then show them
void show(String line1, String line2) {
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println(line1);
  display.println(line2);
  display.display();
}

void goTo(int newState, unsigned long now) {
  state = newState;
  stateStart = now;
}

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  Serial.begin(115200);
  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
${load}  show("PRESS", "best " + String(best));
}

void loop() {
  unsigned long now = millis();
  bool pressed = false;
  int b = digitalRead(BUTTON_PIN);
  if (b != lastButton && now - lastChange >= 50) {
    lastChange = now;
    lastButton = b;
    if (b == LOW) {
      pressed = true;
    }
  }

  unsigned long inState = now - stateStart;
  if (state == 0) {                      // ready: a press starts a round
    if (pressed) {
      show("WAIT...", "");
      waitTime = random(1000, 3000);
      goTo(1, now);
    }
  } else if (state == 1) {               // wait a random time
    if (inState >= waitTime) {
      show("GO!", "");
      tone(BUZZER_PIN, 880, 100);
      goTo(2, now);
    }
  } else if (state == 2) {               // GO!: measure the reaction
    if (pressed) {
      unsigned long reaction = inState;
      Serial.print("reaction: ");
      Serial.print(reaction);
      Serial.println(" ms");
      if (reaction < best) {
        best = reaction;
${save}        tone(BUZZER_PIN, 1319, 300);     // a high note for a new record
        show(String(reaction) + " ms", "RECORD!");
      } else {
        show(String(reaction) + " ms", "best " + String(best));
      }
      goTo(3, now);
    }
  } else {                               // show the result for 3 s
    if (inState >= 3000) {
      show("PRESS", "best " + String(best));
      goTo(0, now);
    }
  }
}
`;
 M.reflex={starter:{diagram:REFLEX,code:REFLEX_CODE('','','','        // save the new record in Preferences\n')},
  solution:{diagram:REFLEX,code:REFLEX_CODE('#include <Preferences.h>\n','Preferences prefs;             // a small drawer in flash that keeps values without power\n','  prefs.begin("reflex", false);\n  best = prefs.getULong("best", 9999);\n','        prefs.putULong("best", best);\n')},
  title:'Challenge: reflex game 2.0',intro:'The episode 10 project. Press to start: the screen says WAIT..., then GO! with a beep. Press as fast as you can: your time in ms appears on the OLED, and a new record plays a high note. The record must survive a restart, like unplugging the board.',
  steps:['Run it and play a round: the record is forgotten when you press Restart.','Add `#include <Preferences.h>` and `Preferences prefs;` In setup(): `prefs.begin("reflex", false);` and `best = prefs.getULong("best", 9999);`','On a new record, save it: `prefs.putULong("best", best);` Play, then press Restart: the screen still shows your best.'],
  hints:['A variable lives in memory that forgets everything without power. Preferences keeps values in flash.','Save only on a new record, not after every round: flash wears out after many writes.'],
  goals:[{text:'The screen says WAIT... then GO!',check:s=>{if(/WAIT/.test(screen(s)))s.mem.wait=true;if(s.mem.wait&&/GO!/.test(screen(s)))s.mem.go=true;return !!s.mem.go;}},{text:'GO! comes with a beep',check:s=>!!s.mem.go&&notes(s).length>=1},{text:'Your time in ms appears on the screen',check:s=>/\d+ ms/.test(screen(s))},{text:'A new record is saved with Preferences',check:s=>s.prefsLog.some(e=>e.v<9999)},{text:'After Restart the screen shows the saved record',check:s=>{if(s.now<600e3&&!s.prefsLog.length){const v=Object.entries(s.nvs).find(([k])=>/\/best$/.test(k))?.[1];if(v!==undefined&&v<9999&&screen(s).includes('best '+v))s.mem.kept=true;}return !!s.mem.kept;}}],
  // presses during WAIT do nothing, so tapping every 150 ms catches GO! whatever the random wait was
  script:{ms:4200,nvs:{'reflex/best':500},actions:[{at:300,press:'btn1'},{at:420,release:'btn1'},...Array.from({length:17},(_,i)=>1000+i*150).flatMap(t=>[{at:t,press:'btn1'},{at:t+70,release:'btn1'}])],ticks:Array.from({length:79},(_,i)=>200+i*50)}};
 return M;
}
