// Missions for units 6-11 (light and sound, the room, motion, relays and Wi-Fi, a web page, a smart room).
// missions.mjs calls sensorMissions() with its circuit helpers; the shape is the same as every other mission.
export function sensorMissions({D,BLINK_PARTS,BLINK_WIRES,W_GND,W_3V3,lines,ledKeys,lit,changes}){
 const BLK='#2b2b2b',RED='#d64541';
 const w=(a,b,color)=>({a,b,color});
 const BASE=[W_3V3,W_GND];
 const input=(s,key)=>Object.values(s.inputs).find(i=>key in i);
 const ldrAt=s=>input(s,'light')?.light??-1;
 const pirAt=s=>!!input(s,'motion')?.motion;
 const tempAt=s=>input(s,'temp')?.temp??-99;
 const lastLine=(s,re)=>lines(s).filter(l=>re.test(l.trim())).pop()||'';
 const percentNow=s=>{const m=lastLine(s,/^Light: \d+ %$/).match(/\d+/);return m?+m[0]:-1;};
 const screen=s=>(s.oledState.screen||[]).filter(x=>x.t==='text').map(x=>x.s);
 const screenText=s=>screen(s).join('|');
 const anyLit=s=>ledKeys(s).some(k=>lit(s,k));
 const notes=s=>s.buzzerLog.map(e=>e.f).filter(f=>f>0);
 const pulses=s=>s.events.filter(e=>e.motion===true).length;
 const lastPulse=s=>s.events.filter(e=>e.motion===true).pop()?.t;
 const fanOn=s=>!!s.relays.relay1;
 const html=s=>s.webState.lastHtml||'';
 // circuits
 const LDR=[{id:'ldr1',type:'ldr',at:'bb:j27'}];
 const LDR_WIRES=[w('bb:f27','bb:bn27',BLK),w('bb:f29','bb:bp29',RED),w('bb:f28','esp:D34','#8a3fc8')];
 const BUZZER=[{id:'buzzer1',type:'buzzer',at:'bb:j20'}];
 const BUZZER_WIRES=[w('bb:f20','bb:bn20',BLK),w('bb:f22','esp:D25','#2f6fd0')];
 const DHT=(col,pin='esp:D4')=>({parts:[{id:'dht1',type:'dht11',at:'bb:j'+col}],wires:[w('bb:f'+col,'bb:bp'+col,RED),w('bb:f'+(col+1),pin,'#f28c1c'),w('bb:f'+(col+2),'bb:bn'+(col+2),BLK)]});
 const OLED=col=>({parts:[{id:'oled1',type:'oled',at:'bb:j'+col}],wires:[w('bb:f'+col,'bb:bn'+col,BLK),w('bb:f'+(col+1),'bb:bp'+(col+1),RED),w('bb:f'+(col+2),'esp:D22','#2f9a3c'),w('bb:f'+(col+3),'esp:D21','#2f6fd0')]});
 const PIR=col=>({parts:[{id:'pir1',type:'pir',at:'bb:j'+col}],wires:[w('bb:f'+col,'bb:bp'+col,RED),w('bb:f'+(col+1),'esp:D27','#c9a400'),w('bb:f'+(col+2),'bb:bn'+(col+2),BLK)]});
 const RELAY=col=>({parts:[{id:'relay1',type:'relay',at:'bb:j'+col}],wires:[w('bb:f'+col,'bb:bp'+col,RED),w('bb:f'+(col+1),'bb:bn'+(col+1),BLK),w('bb:f'+(col+2),'esp:D26','#8a3fc8')]});
 const build=(...sets)=>D(sets.flatMap(x=>x.parts||[]),[...BASE,...sets.flatMap(x=>x.wires||[])]);
 const ldrSet={parts:LDR,wires:LDR_WIRES},buzzerSet={parts:BUZZER,wires:BUZZER_WIRES},ledSet={parts:BLINK_PARTS,wires:BLINK_WIRES.filter(x=>x!==W_GND)};
 const dhtSet=DHT(27),oledSet=OLED(22),pirSet=PIR(27),relaySet=RELAY(27);
 const buttonSet={parts:[{id:'btn1',type:'button',at:'bb:e14'}],wires:[w('esp:D22','bb:j14','#c9a400'),w('bb:j16','bb:bn16',BLK)]};
 const M={};
 // ---------- unit 6: light and sound ----------
 M.ldr={starter:{diagram:build(ldrSet),code:String.raw`const int LDR_PIN = 34;   // ADC1 pin, input only

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(LDR_PIN);   // 0–4095
  // turn raw into a percentage with map(), then print it as: Light: 42 %
  Serial.println(raw);
  delay(100);
}
`},solution:{diagram:build(ldrSet),code:String.raw`const int LDR_PIN = 34;   // ADC1 pin, input only

void setup() {
  Serial.begin(115200);
}

void loop() {
  int raw = analogRead(LDR_PIN);   // 0–4095
  int percent = map(raw, 0, 4095, 0, 100);
  Serial.print("Light: ");
  Serial.print(percent);
  Serial.println(" %");
  delay(100);
}
`},title:'A light meter',intro:'A light-dependent resistor (LDR) changes its resistance with light. With a 10 kΩ resistor it makes a voltage that analogRead() can measure. Turn the reading into a percentage.',
  steps:['Run the starter and drag the light slider in the Controls bar. Watch the raw numbers.','Convert the reading: `int percent = map(raw, 0, 4095, 0, 100);`','Print it as `Light: 42 %` with `Serial.print()` three times, then `Serial.println()` for the last part.'],
  hints:['More light means a bigger number: the LDR resistance drops and the middle of the divider moves towards 3.3 V.','Print the label first, then the number, then the unit: `Serial.print("Light: ");`'],
  goals:[{text:'The monitor shows Light: … %',check:s=>lines(s).some(l=>/^Light: \d+ %$/.test(l.trim()))},{text:'Dark: under 30 %',check:s=>(s.mem.dark=s.mem.dark||(ldrAt(s)<0.1&&percentNow(s)>=0&&percentNow(s)<30))},{text:'Bright: over 70 %',check:s=>(s.mem.bright=s.mem.bright||(ldrAt(s)>0.9&&percentNow(s)>70))}],
  script:{ms:1500,actions:[{at:300,ldr:'ldr1',light:0},{at:900,ldr:'ldr1',light:1}],ticks:[800,1400]}};
 const NIGHT=(body)=>String.raw`const int LDR_PIN = 34;
const int LED_PIN = 23;
const int DARK_LIMIT = 1500;   // below this it is dark

void setup() {
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int raw = analogRead(LDR_PIN);
${body}  delay(50);
}
`;
 M.nightlight={starter:{diagram:build(ldrSet,ledSet),code:NIGHT('  // LED on when raw is below DARK_LIMIT, off otherwise\n')},solution:{diagram:build(ldrSet,ledSet),code:NIGHT('  if (raw < DARK_LIMIT) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n')},
  title:'A night light',intro:'Make the LED switch on by itself when the room gets dark.',
  steps:['Run the starter and move the light slider: the LED does nothing yet.','Compare `raw` with `DARK_LIMIT` in an `if` / `else`.','Switch the LED on when it is dark and off when it is bright.'],
  hints:['A dark room gives a small reading, so the test is `raw < DARK_LIMIT`.','Use `digitalWrite(LED_PIN, HIGH);` in the `if` part and `LOW` in the `else` part.'],
  goals:[{text:'Bright: the LED is off',check:s=>(s.mem.b=s.mem.b||(ldrAt(s)>0.9&&!anyLit(s)&&s.now>200e3))},{text:'Dark: the LED is on',check:s=>(s.mem.d=s.mem.d||(ldrAt(s)<0.1&&anyLit(s)))}],
  script:{ms:1300,actions:[{at:100,ldr:'ldr1',light:1},{at:700,ldr:'ldr1',light:0}],ticks:[600,1200]}};
 const MELODY=(body)=>String.raw`const int BUZZER_PIN = 25;

void setup() {
}

void loop() {
  tone(BUZZER_PIN, 262, 300);   // note C
  delay(400);
${body}}
`;
 M.melody={starter:{diagram:build(buzzerSet),code:MELODY('  // add D (294 Hz) and E (330 Hz) in the same way\n  delay(1000);\n')},solution:{diagram:build(buzzerSet),code:MELODY('  tone(BUZZER_PIN, 294, 300);   // note D\n  delay(400);\n  tone(BUZZER_PIN, 330, 300);   // note E\n  delay(1000);\n')},
  title:'Play a melody',intro:'A passive buzzer makes a note when you give it a frequency in hertz (Hz). tone(pin, frequency, duration) plays a note and returns at once, so you add a delay() for the length of the note.',
  steps:['Run the starter: you hear the note C.','Add the note D: `tone(BUZZER_PIN, 294, 300);` followed by `delay(400);`','Add the note E (330 Hz) after it. Run and listen to C, D, E.'],
  hints:['The duration (300 ms) is how long the note sounds; the delay(400) is the gap before the next call.','Higher frequency means a higher note. Do, re, mi are 262, 294 and 330 Hz.'],
  goals:[{text:'Plays C (262 Hz)',check:s=>notes(s).includes(262)},{text:'Then D (294 Hz)',check:s=>notes(s).join(',').includes('262,294')},{text:'Then E (330 Hz)',check:s=>notes(s).join(',').includes('262,294,330')}],
  script:{ms:1700}};
 const ALARM=(body)=>String.raw`const int LDR_PIN = 34;
const int BUZZER_PIN = 25;
const int OPEN_LIMIT = 2500;   // above this the box is open

void setup() {
}

void loop() {
  int raw = analogRead(LDR_PIN);
${body}  delay(50);
}
`;
 M.alarm={starter:{diagram:build(ldrSet,buzzerSet),code:ALARM('  // sound the alarm with tone() while raw is above OPEN_LIMIT, otherwise call noTone()\n')},solution:{diagram:build(ldrSet,buzzerSet),code:ALARM('  if (raw > OPEN_LIMIT) {\n    tone(BUZZER_PIN, 880);\n  } else {\n    noTone(BUZZER_PIN);\n  }\n')},
  title:'Challenge: a box alarm',intro:'The LDR sits inside a closed box. When someone opens the lid, light falls in and the buzzer must sound until the lid is closed again.',
  steps:['Compare `raw` with `OPEN_LIMIT`.','While it is above the limit call `tone(BUZZER_PIN, 880);`','Otherwise call `noTone(BUZZER_PIN);` so the buzzer is silent.'],
  hints:['Without a duration, tone() keeps sounding until noTone() is called.','Closed box = dark = small reading.'],
  goals:[{text:'Box closed (dark): silence',check:s=>(s.mem.q=s.mem.q||(ldrAt(s)<0.1&&Object.keys(s.buzzers).length===0&&s.now>200e3))},{text:'Box open (bright): the buzzer sounds',check:s=>(s.mem.l=s.mem.l||(ldrAt(s)>0.9&&(s.buzzers.buzzer1||0)>0))}],
  script:{ms:1300,actions:[{at:100,ldr:'ldr1',light:0},{at:700,ldr:'ldr1',light:1}],ticks:[600,1200]}};
 // ---------- unit 7: sense the room ----------
 const TEMP=(loopBody)=>String.raw`#include <DHT.h>

DHT dht(4, DHT11);   // data pin on GPIO 4

void setup() {
  Serial.begin(115200);
  dht.begin();
}

void loop() {
${loopBody}  delay(2000);
}
`;
 M.temp={starter:{diagram:build(dhtSet),code:TEMP('  float t = dht.readTemperature();\n  // read the humidity too, then print both on one line: Temp: 24.0 C  Humidity: 50 %\n  Serial.println(t);\n')},
  solution:{diagram:build(dhtSet),code:TEMP('  float t = dht.readTemperature();\n  float h = dht.readHumidity();\n  if (isnan(t) || isnan(h)) {\n    Serial.println("Sensor error");\n  } else {\n    Serial.print("Temp: ");\n    Serial.print(t, 1);\n    Serial.print(" C  Humidity: ");\n    Serial.print(h, 0);\n    Serial.println(" %");\n  }\n')},
  title:'A thermometer',intro:'The DHT11 sends the temperature and the humidity over a single data wire. The DHT library does the difficult timing for you.',
  steps:['Run the starter and change the temperature with the sliders in the Controls bar.','Read the humidity: `float h = dht.readHumidity();`','Print one line like `Temp: 24.0 C  Humidity: 50 %`. Use `isnan()` to catch a failed reading.'],
  hints:['`Serial.print(t, 1);` prints one digit after the decimal point.','The DHT11 is slow: it can only give a new reading about every two seconds.'],
  goals:[{text:'The monitor shows Temp: … C  Humidity: … %',check:s=>lines(s).some(l=>/^Temp: -?\d+\.\d C  Humidity: \d+ %$/.test(l.trim()))},{text:'A warm room (30 degrees, 70 %) is reported correctly',check:s=>(s.mem.w=s.mem.w||/^Temp: 30\.0 C  Humidity: 70 %$/.test(lastLine(s,/^Temp/)))}],
  script:{ms:6000,actions:[{at:2500,dht:'dht1',temp:30,hum:70}],ticks:[5500]}};
 const OLEDHELLO=(body)=>String.raw`#include <Wire.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Wire.begin(21, 22);   // SDA = GPIO 21, SCL = GPIO 22
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Hello!");
${body}}

void loop() {
}
`;
 M.oled={starter:{diagram:build(oledSet),code:OLEDHELLO('  // send everything you drew to the screen\n')},solution:{diagram:build(oledSet),code:OLEDHELLO('  display.println("ESP32");\n  display.display();\n')},
  title:'Talk to the OLED',intro:'The OLED screen is connected with I²C: two wires, SDA and SCL. You draw into a memory buffer first and send it to the screen with display.display().',
  steps:['Run the starter: the screen stays black because nothing was sent to it.','Add a second line below the first: `display.println("ESP32");`','Send the buffer to the screen with `display.display();` at the end of setup().'],
  hints:['Everything before display.display() only changes the buffer in memory.','The first println() moves the cursor to the next line, so the second text appears below it.'],
  goals:[{text:'Something appears on the screen',check:s=>screen(s).length>0},{text:'The first line says Hello!',check:s=>/Hello!/.test(screenText(s))},{text:'A second line is shown below it',check:s=>screen(s).length>=2}],
  script:{ms:800}};
 const STATION=(body)=>String.raw`#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

DHT dht(4, DHT11);
Adafruit_SSD1306 display(128, 64, &Wire, -1);

void setup() {
  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  float h = dht.readHumidity();
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print("T: ");
  display.print(t, 1);
  display.println(" C");
${body}  display.display();
  delay(2000);
}
`;
 M.station={starter:{diagram:build(dhtSet,oledSet),code:STATION('  // show the humidity on the second line like this: H: 50 %\n')},solution:{diagram:build(dhtSet,oledSet),code:STATION('  display.print("H: ");\n  display.print(h, 0);\n  display.println(" %");\n')},
  title:'A tiny weather station',intro:'Combine two parts: the DHT11 measures and the OLED shows. Both are already wired. Finish the second line of the display.',
  steps:['Run the starter: only the temperature is shown.','After the temperature line add `display.print("H: ");`','Print the humidity with `display.print(h, 0);` and finish the line with `display.println(" %");`'],
  hints:['Each print() adds to the same line; println() ends it.','Change the temperature with the slider and wait two seconds: the screen follows.'],
  goals:[{text:'The temperature is on the screen',check:s=>/T: \d+\.\d C/.test(screenText(s))},{text:'The humidity is on the screen',check:s=>/H: \d+ %/.test(screenText(s))},{text:'It follows the sensor: 30 degrees',check:s=>(s.mem.w=s.mem.w||/T: 30\.0 C/.test(screenText(s)))}],
  script:{ms:6000,actions:[{at:2500,dht:'dht1',temp:30,hum:70}],ticks:[5500]}};
 // ---------- unit 8: catch the motion ----------
 const MOTION=(body)=>String.raw`const int PIR_PIN = 27;
const int LED_PIN = 23;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  int motion = digitalRead(PIR_PIN);
${body}  delay(50);
}
`;
 const PIR_LED=build(pirSet,ledSet);
 M.motion={starter:{diagram:PIR_LED,code:MOTION('  // light the LED while the PIR sensor reads HIGH, otherwise switch it off\n')},solution:{diagram:PIR_LED,code:MOTION('  if (motion == HIGH) {\n    digitalWrite(LED_PIN, HIGH);\n  } else {\n    digitalWrite(LED_PIN, LOW);\n  }\n')},
  title:'A motion light',intro:'A PIR sensor sets its OUT pin HIGH when it feels a warm body move in front of it. Use it to switch a light.',
  steps:['Run the starter and press the Motion button in the Controls bar. Nothing happens yet.','Test `motion == HIGH` in an `if` / `else`.','Switch the LED on while there is motion and off when it stops.'],
  hints:['The PIR needs 3.3 V on VCC and GND to work: it is already wired.','A real PIR stays HIGH for a few seconds after the movement. Here you control it yourself.'],
  goals:[{text:'No motion: the LED is off',check:s=>(s.mem.n=s.mem.n||(!pirAt(s)&&!anyLit(s)&&s.now>200e3))},{text:'Motion: the LED is on',check:s=>(s.mem.m=s.mem.m||(pirAt(s)&&anyLit(s)))}],
  script:{ms:1600,actions:[{at:500,pir:'pir1',motion:true},{at:1100,pir:'pir1',motion:false}],ticks:[400,900,1500]}};
 const VISITORS=(body)=>String.raw`const int PIR_PIN = 27;

int visitors = 0;
int lastState = LOW;

void setup() {
  pinMode(PIR_PIN, INPUT);
  Serial.begin(115200);
}

void loop() {
  int state = digitalRead(PIR_PIN);
${body}  lastState = state;
  delay(50);
}
`;
 M.visitors={starter:{diagram:build(pirSet),code:VISITORS('  if (state == HIGH) {\n    visitors = visitors + 1;\n    Serial.print("Visitors: ");\n    Serial.println(visitors);\n  }\n')},solution:{diagram:build(pirSet),code:VISITORS('  if (state == HIGH && lastState == LOW) {\n    visitors = visitors + 1;\n    Serial.print("Visitors: ");\n    Serial.println(visitors);\n  }\n')},
  title:'Count the visitors',intro:'Three people walk past. The sketch should say 3, but it counts the same person many times. Count only the moment the signal changes from LOW to HIGH.',
  steps:['Run the starter and watch the numbers: one pulse is counted again and again.','Count only when `state == HIGH && lastState == LOW`.','Run it again: three pulses give exactly 3.'],
  hints:['`lastState` remembers the reading from the previous loop. A new visitor is a change, not a level.','The same idea as the button toggle in unit 4.'],
  goals:[{text:'Prints Visitors: … for each new visitor',check:s=>lines(s).some(l=>/^Visitors: \d+$/.test(l.trim()))},{text:'Three pulses are counted as exactly 3',check:s=>pulses(s)>=3&&lastLine(s,/^Visitors/)==='Visitors: 3'&&!lines(s).some(l=>/^Visitors: 4$/.test(l.trim()))}],
  script:{ms:2400,actions:[{at:300,pir:'pir1',motion:true},{at:600,pir:'pir1',motion:false},{at:900,pir:'pir1',motion:true},{at:1200,pir:'pir1',motion:false},{at:1500,pir:'pir1',motion:true},{at:1800,pir:'pir1',motion:false}]}};
 const IRQ=(body)=>String.raw`const int PIR_PIN = 27;
const int LED_PIN = 23;

volatile bool motionSeen = false;

void IRAM_ATTR onMotion() {
  motionSeen = true;
}

void setup() {
  pinMode(LED_PIN, OUTPUT);
  pinMode(PIR_PIN, INPUT);
${body}}

void loop() {
  if (motionSeen) {
    motionSeen = false;
    digitalWrite(LED_PIN, HIGH);
    delay(300);
    digitalWrite(LED_PIN, LOW);
  }
  delay(1000);   // the sketch is busy with other work
}
`;
 M.irq={starter:{diagram:PIR_LED,code:IRQ('  // call onMotion() when the pin goes from LOW to HIGH (RISING)\n')},solution:{diagram:PIR_LED,code:IRQ('  attachInterrupt(digitalPinToInterrupt(PIR_PIN), onMotion, RISING);\n')},
  title:'Never miss a pulse',intro:'The loop is busy for a whole second, so it can miss a short pulse if it only reads the pin. An interrupt runs a small function the moment the pin changes, even in the middle of a delay().',
  steps:['Run the starter and press Motion for a short moment: the LED never flashes.','Register the interrupt in setup(): `attachInterrupt(digitalPinToInterrupt(PIR_PIN), onMotion, RISING);`','Run it again: each pulse sets the flag and the next pass of loop() flashes the LED.'],
  hints:['The interrupt function only sets a flag. The slow work (the LED flash) stays in loop().','A variable shared with an interrupt must be `volatile`.'],
  goals:[{text:'A short pulse makes the LED flash',check:s=>pulses(s)>=1&&ledKeys(s).some(k=>changes(s,k).some(c=>c.on))},{text:'Each pulse flashes once: two pulses, two flashes',check:s=>pulses(s)>=2&&ledKeys(s).some(k=>changes(s,k).filter(c=>c.on).length>=2)}],
  script:{ms:4500,actions:[{at:300,pir:'pir1',motion:true},{at:400,pir:'pir1',motion:false},{at:2300,pir:'pir1',motion:true},{at:2400,pir:'pir1',motion:false}],ticks:[1800,4400]}};
 // ---------- unit 9: relays and Wi-Fi ----------
 const RELAYBLINK=(body)=>String.raw`const int RELAY_PIN = 26;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // HIGH = off (this module is active-low)
}

void loop() {
${body}}
`;
 M.relay={starter:{diagram:build(relaySet),code:RELAYBLINK('  // switch the relay on (LOW), wait, switch it off (HIGH), wait\n')},solution:{diagram:build(relaySet),code:RELAYBLINK('  digitalWrite(RELAY_PIN, LOW);\n  delay(2000);\n  digitalWrite(RELAY_PIN, HIGH);\n  delay(2000);\n')},
  title:'Click: switch with a relay',intro:'A relay is a switch that a small signal can close. Many modules are active-low: LOW switches them on and HIGH switches them off. That is why setup() starts with HIGH.',
  steps:['Run the starter: the relay stays off.','In loop() write LOW to the relay pin and wait two seconds.','Write HIGH and wait two seconds again. Watch the indicator light and the click.'],
  hints:['If the relay clicks on at start-up, you forgot the first `digitalWrite(RELAY_PIN, HIGH);`.','Only ever switch a relay module you were given with low-voltage things. Never touch mains electricity yourself.'],
  goals:[{text:'The relay switches on',check:s=>s.relayLog.some(e=>e.on===true)},{text:'And off again',check:s=>{const i=s.relayLog.findIndex(e=>e.on===true);return i>=0&&s.relayLog.slice(i).some(e=>e.on===false);}}],
  script:{ms:5000,ticks:[3000]}};
 const RELAYBTN=(body)=>String.raw`const int BUTTON_PIN = 22;
const int RELAY_PIN = 26;

bool relayOn = false;
int lastState = HIGH;

void setup() {
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // HIGH = off (active-low)
}

void loop() {
  int state = digitalRead(BUTTON_PIN);
  if (state != lastState) {
    if (state == LOW) {
      relayOn = !relayOn;
${body}    }
    delay(50);
  }
  lastState = state;
}
`;
 M.relaybtn={starter:{diagram:build(relaySet,buttonSet),code:RELAYBTN('      // write the new state to the relay: LOW switches it on\n')},solution:{diagram:build(relaySet,buttonSet),code:RELAYBTN('      digitalWrite(RELAY_PIN, relayOn ? LOW : HIGH);\n')},
  title:'A button that switches a relay',intro:'Use the toggle idea from unit 4: one press switches the relay on, the next press switches it off.',
  steps:['Run the starter and press the button: `relayOn` changes but the relay does not.','Write the new state to the relay: `digitalWrite(RELAY_PIN, relayOn ? LOW : HIGH);`','Press the button twice.'],
  hints:['The module is active-low, so “on” means LOW.','`? :` picks LOW when relayOn is true, otherwise HIGH.'],
  goals:[{text:'First press: the relay switches on',check:s=>(s.mem.on=s.mem.on||(s.events.filter(e=>e.down===true).length>=1&&fanOn(s)))},{text:'Second press: it switches off again',check:s=>s.mem.on&&s.events.filter(e=>e.down===true).length>=2&&!fanOn(s)}],
  script:{ms:1400,actions:[{at:300,press:'btn1'},{at:450,release:'btn1'},{at:900,press:'btn1'},{at:1050,release:'btn1'}],ticks:[700,1300]}};
 const WIFI=(body)=>String.raw`#include <WiFi.h>

const char* SSID = "Workshop_WiFi";
const char* PASSWORD = "learn-esp32";

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(SSID, PASSWORD);
${body}  Serial.println();
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
}
`;
 M.wifi={starter:{diagram:build({parts:[],wires:[]}),code:WIFI('  // wait until WiFi.status() is WL_CONNECTED, printing a dot every 500 ms\n')},solution:{diagram:build({parts:[],wires:[]}),code:WIFI('  while (WiFi.status() != WL_CONNECTED) {\n    delay(500);\n    Serial.print(".");\n  }\n')},
  title:'Join the Wi-Fi',intro:'WiFi.begin() only starts the connection. It takes a second or two, so the sketch has to wait until WiFi.status() says WL_CONNECTED before it asks for the IP address.',
  steps:['Run the starter: the IP address is 0.0.0.0 because the connection is not ready.','Add a `while` loop that runs as long as `WiFi.status() != WL_CONNECTED`.','Inside it, wait 500 ms and print a dot. Run again: dots first, then the real address.'],
  hints:['`!=` means “is not equal to”.','Never put a real Wi-Fi password in a sketch that you share.'],
  goals:[{text:'Dots are printed while waiting',check:s=>/\.\.\./.test(s.out.replace(/\r?\n/g,''))&&/\.\.+\s*$/m.test(lines(s)[0]||'')},{text:'The real IP address is printed',check:s=>/IP address: 192\.168\.1\.42/.test(s.out)}],
  script:{ms:3000}};
 // ---------- unit 10: a web page ----------
 const WEBHEAD=String.raw`#include <WiFi.h>
#include <WebServer.h>

const char* SSID = "Workshop_WiFi";
const char* PASSWORD = "learn-esp32";

WebServer server(80);
`;
 const WEBSETUP=routes=>String.raw`
void setup() {
  Serial.begin(115200);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println(WiFi.localIP());
${routes}  server.begin();
}

void loop() {
  server.handleClient();
}
`;
 const WEB=(handler)=>WEBHEAD+String.raw`
void handleRoot() {
${handler}}
`+WEBSETUP('  server.on("/", handleRoot);\n');
 M.web={starter:{diagram:build({parts:[],wires:[]}),code:WEB('  // send the page: status 200, type "text/html", and a short text\n')},solution:{diagram:build({parts:[],wires:[]}),code:WEB('  server.send(200, "text/html", "<h1>Hello from my ESP32</h1>");\n')},
  title:'Your first web page',intro:'Your ESP32 can be a tiny web server. A browser asks for a path such as “/” and the function you registered with server.on() answers with a page.',
  steps:['Run the starter: the browser preview below the Serial Monitor stays empty.','In handleRoot() call `server.send(200, "text/html", "<h1>Hello from my ESP32</h1>");`','Run again: the preview shows your page.'],
  hints:['200 means “OK”. The second argument tells the browser that the answer is HTML.','`server.handleClient()` in loop() is what answers the browser; without it nobody is served.'],
  goals:[{text:'The server answers a request',check:s=>s.webState.requests>=1},{text:'The page says Hello',check:s=>/Hello/.test(html(s))}],
  script:{ms:3000}};
 const WEBTEMP=(body)=>String.raw`#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

const char* SSID = "Workshop_WiFi";
const char* PASSWORD = "learn-esp32";

DHT dht(4, DHT11);
WebServer server(80);

void handleRoot() {
  float t = dht.readTemperature();
  String page = "<h1>Room</h1>";
${body}  server.send(200, "text/html", page);
}
`+String.raw`
void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}
`;
 M.webtemp={starter:{diagram:build(dhtSet),code:WEBTEMP('  // add a paragraph with the temperature: <p>Temperature: 24.0 C</p>\n')},solution:{diagram:build(dhtSet),code:WEBTEMP('  page += "<p>Temperature: " + String(t, 1) + " C</p>";\n')},
  title:'A page with live data',intro:'Build the page out of text pieces and the sensor reading. Every time the browser reloads, handleRoot() runs again and reads the sensor again.',
  steps:['Run the starter: the page has a heading but no data.','Add the line `page += "<p>Temperature: " + String(t, 1) + " C</p>";`','Change the temperature with the slider and click the “/” route in the preview to reload.'],
  hints:['`String(t, 1)` turns a number into text with one decimal.','`+=` adds more text to the end of a String.'],
  goals:[{text:'The page shows the temperature',check:s=>/Temperature: \d+\.\d C/.test(html(s))},{text:'After reloading in a warm room it shows 30',check:s=>(s.mem.w=s.mem.w||/Temperature: 30\.0 C/.test(html(s)))}],
  script:{ms:5000,actions:[{at:3000,dht:'dht1',temp:30,hum:60},{at:3500,http:'/'}],ticks:[2500,4900]}};
 const WEBLED=(body)=>WEBHEAD+String.raw`
const int LED_PIN = 23;

void handleRoot() {
  server.send(200, "text/html", "<a href='/on'>Turn on</a> <a href='/off'>Turn off</a>");
}

void handleOn() {
${body[0]}}

void handleOff() {
${body[1]}}
`+String.raw`
void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.on("/on", handleOn);
  server.on("/off", handleOff);
  server.begin();
}

void loop() {
  server.handleClient();
}
`;
 M.webled={starter:{diagram:build(ledSet),code:WEBLED(['  // switch the LED on, then send the answer: server.send(200, "text/html", "LED is on");\n','  // switch the LED off, then send the answer\n'])},solution:{diagram:build(ledSet),code:WEBLED(['  digitalWrite(LED_PIN, HIGH);\n  server.send(200, "text/html", "LED is on");\n','  digitalWrite(LED_PIN, LOW);\n  server.send(200, "text/html", "LED is off");\n'])},
  title:'Challenge: a remote switch',intro:'Give your ESP32 three paths: “/” shows two links, “/on” switches the LED on and “/off” switches it off. Click the links in the preview like in a real browser.',
  steps:['Run the starter and click the routes in the preview: the LED does not react.','In handleOn() switch the LED on and send an answer.','In handleOff() switch it off and send an answer. Try both links.'],
  hints:['Every handler must call `server.send()`, otherwise the browser waits for an answer.','The links in the page are ordinary HTML: `<a href=\'/on\'>`.'],
  goals:[{text:'/on switches the LED on',check:s=>(s.mem.on=s.mem.on||(s.webState.uri==='/on'&&anyLit(s)))},{text:'/off switches it off again',check:s=>s.mem.on&&s.webState.uri==='/off'&&!anyLit(s)}],
  script:{ms:3500,actions:[{at:1500,http:'/on'},{at:2500,http:'/off'}],ticks:[2200,3400]}};
 // ---------- unit 11: your own smart room ----------
 const ROOM=(body)=>String.raw`const int LDR_PIN = 34;
const int PIR_PIN = 27;
const int LED_PIN = 23;
const int DARK_LIMIT = 1500;
const unsigned long HOLD_MS = 2000;   // stay on this long after the last motion

unsigned long lastMotion = 0;
bool lampOn = false;

void setup() {
  pinMode(PIR_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
}

void loop() {
  bool dark = analogRead(LDR_PIN) < DARK_LIMIT;
  if (digitalRead(PIR_PIN) == HIGH) {
    lastMotion = millis();
    lampOn = true;
  }
${body}  digitalWrite(LED_PIN, (lampOn && dark) ? HIGH : LOW);
  delay(20);
}
`;
 const PIR_AT=PIR(22);
 const ROOM_DIAGRAM=build(ledSet,ldrSet,PIR_AT);
 M.room={starter:{diagram:ROOM_DIAGRAM,code:ROOM('  // stop the lamp when HOLD_MS have passed since lastMotion\n')},solution:{diagram:ROOM_DIAGRAM,code:ROOM('  if (millis() - lastMotion > HOLD_MS) {\n    lampOn = false;\n  }\n')},
  title:'A smart lamp',intro:'Three parts work together: the lamp switches on only when it is dark and someone moves, and it stays on for two seconds after the last movement.',
  steps:['Run the starter: once the lamp is on, it never goes off.','Add an `if` that compares `millis() - lastMotion` with `HOLD_MS`.','When more time has passed, set `lampOn = false;` Test dark + motion, then daylight + motion.'],
  hints:['The same “now − last” trick as in unit 4 keeps working when millis() rolls over.','In daylight `dark` is false, so the lamp stays off even with motion.'],
  goals:[{text:'Dark and motion: the lamp is on',check:s=>(s.mem.a=s.mem.a||(ldrAt(s)<0.1&&pulses(s)>=1&&anyLit(s)))},{text:'Two seconds after the motion stops it switches off',check:s=>(s.mem.b=s.mem.b||(lastPulse(s)!==undefined&&!pirAt(s)&&s.now/1000-lastPulse(s)>2300&&ldrAt(s)<0.1&&!anyLit(s)))},{text:'In daylight the lamp stays off, even with motion',check:s=>(s.mem.c=s.mem.c||(ldrAt(s)>0.9&&pulses(s)>=2&&lastPulse(s)>4000&&!anyLit(s)))}],
  script:{ms:5000,actions:[{at:300,ldr:'ldr1',light:0},{at:600,pir:'pir1',motion:true},{at:900,pir:'pir1',motion:false},{at:4000,ldr:'ldr1',light:1},{at:4300,pir:'pir1',motion:true},{at:4500,pir:'pir1',motion:false}],ticks:[1200,3500,4800]}};
 const CLIMATE=(body)=>String.raw`#include <Wire.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

const int RELAY_PIN = 26;

DHT dht(4, DHT11);
Adafruit_SSD1306 display(128, 64, &Wire, -1);
bool fanOn = false;

void setup() {
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);   // HIGH = fan off
  Wire.begin(21, 22);
  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);
  display.setTextColor(WHITE);
  dht.begin();
}

void loop() {
  float t = dht.readTemperature();
  if (t >= 28) {
    fanOn = true;
  }
${body}  digitalWrite(RELAY_PIN, fanOn ? LOW : HIGH);
  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(0, 0);
  display.print("T: ");
  display.print(t, 1);
  display.println(" C");
  display.println(fanOn ? "Fan: ON" : "Fan: OFF");
  display.display();
  delay(2000);
}
`;
 const CLIMATE_DIAGRAM=build(DHT(22),relaySet,OLED(14));
 M.climate={starter:{diagram:CLIMATE_DIAGRAM,code:CLIMATE('  // switch the fan off again only when t falls to 26 or below\n')},solution:{diagram:CLIMATE_DIAGRAM,code:CLIMATE('  if (t <= 26) {\n    fanOn = false;\n  }\n')},
  title:'A fan with a memory',intro:'A fan that switches on at 28 degrees and off at 28 degrees would click all the time around that value. Use two limits: on at 28, off at 26. Between them the fan keeps its state. This is called hysteresis.',
  steps:['Run the starter and heat the room with the slider: the fan comes on but never goes off.','Add the second limit: when `t <= 26`, set `fanOn = false;`','Check 31, then 27 (still on), then 25 (off).'],
  hints:['Between 26 and 28 neither `if` is true, so `fanOn` simply keeps its value.','The OLED line shows the state of the variable, the relay follows it.'],
  goals:[{text:'Cool room: the fan is off',check:s=>(s.mem.a=s.mem.a||(tempAt(s)<26&&!fanOn(s)&&/Fan: OFF/.test(screenText(s))))},{text:'Hot room: the fan is on',check:s=>(s.mem.b=s.mem.b||(tempAt(s)>=28&&fanOn(s)&&/Fan: ON/.test(screenText(s))))},{text:'At 27 degrees the fan keeps running',check:s=>(s.mem.c=s.mem.c||(s.mem.b&&tempAt(s)===27&&fanOn(s)))},{text:'At 25 degrees it switches off',check:s=>(s.mem.d=s.mem.d||(s.mem.c&&tempAt(s)<=26&&!fanOn(s)))}],
  script:{ms:14000,actions:[{at:2500,dht:'dht1',temp:31,hum:50},{at:6500,dht:'dht1',temp:27,hum:50},{at:10500,dht:'dht1',temp:25,hum:50}],ticks:[1900,5900,9900,13900]}};
 const DASH=(body)=>String.raw`#include <WiFi.h>
#include <WebServer.h>
#include <DHT.h>

const char* SSID = "Workshop_WiFi";
const char* PASSWORD = "learn-esp32";

DHT dht(4, DHT11);
WebServer server(80);

void handleRoot() {
  float t = dht.readTemperature();
  int light = map(analogRead(34), 0, 4095, 0, 100);
  String page = "<h1>My smart room</h1>";
  page += "<p>Temperature: " + String(t, 1) + " C</p>";
${body}  server.send(200, "text/html", page);
}

void setup() {
  Serial.begin(115200);
  dht.begin();
  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }
  Serial.println(WiFi.localIP());
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}
`;
 const DASH_DIAGRAM=build(DHT(22),ldrSet);
 M.dashboard={starter:{diagram:DASH_DIAGRAM,code:DASH('  // add a paragraph with the light level: <p>Light: 42 %</p>\n')},solution:{diagram:DASH_DIAGRAM,code:DASH('  page += "<p>Light: " + String(light) + " %</p>";\n')},
  title:'Final project: a room dashboard',intro:'Bring it together: a web page that reports the temperature and the light level of your room, read fresh every time the page loads.',
  steps:['Run the starter: the page only has the temperature.','Add the light level with `page += "<p>Light: " + String(light) + " %</p>";`','Change both sliders, then click the “/” route to reload the page.'],
  hints:['`light` is already measured and converted to a percentage above your new line.','Show your dashboard to a friend: it is a real web server, only a simulated one here.'],
  goals:[{text:'The page shows the temperature',check:s=>/Temperature: \d+\.\d C/.test(html(s))},{text:'The page shows the light level',check:s=>/Light: \d+ %/.test(html(s))},{text:'After reloading in a warm room it shows 30',check:s=>(s.mem.w=s.mem.w||/Temperature: 30\.0 C/.test(html(s)))}],
  script:{ms:5000,actions:[{at:3000,dht:'dht1',temp:30,hum:60},{at:3500,http:'/'}],ticks:[2500,4900]}};
 return M;
}
