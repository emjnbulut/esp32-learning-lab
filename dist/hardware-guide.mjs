import {buildNets,partPins,ESP_GPIO,PARTS} from './sim/circuit.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Describe actual shared nets, including component legs resting on breadboard holes.
export function wiringReference(diagram){
 const nets=buildNets(diagram),groups=new Map(),active=new Set();
 const group=key=>{const net=nets.find(key);if(!groups.has(net))groups.set(net,{terminals:[],holes:new Set()});return groups.get(net);};
 for(const p of diagram.parts){if(p.type==='breadboard')continue;
  for(const pin of partPins(p)){const key=p.id+':'+pin.name,g=group(key);
   g.terminals.push({key,board:p.type==='esp32',gpio:ESP_GPIO[pin.name]});
   if(nets.onHole[key]){g.holes.add(nets.onHole[key]);active.add(nets.find(key));}
  }
 }
 for(const wire of diagram.wires)for(const key of [wire.a,wire.b]){
  const g=group(key);active.add(nets.find(key));
  if(diagram.parts.some(p=>p.type==='breadboard'&&key.startsWith(p.id+':')))g.holes.add(key);
 }
 return [...groups.entries()].filter(([net])=>active.has(net)).map(([,g])=>({terminals:g.terminals,holes:[...g.holes]}));
}
const LIBRARIES=[
 {header:'DHT.h',names:['DHT sensor library','Adafruit Unified Sensor'],url:'https://github.com/adafruit/DHT-sensor-library'},
 {header:'Adafruit_SSD1306.h',names:['Adafruit SSD1306','Adafruit GFX Library'],url:'https://github.com/adafruit/Adafruit_SSD1306'}
];
export function hardwareGuide(diagram,t,code=''){
 const nets=wiringReference(diagram);
 const libraries=LIBRARIES.filter(l=>code.split('\n').some(line=>/^\s*#\s*include\s*[<"]/.test(line)&&line.includes(l.header)));
 const libraryStep=libraries.length?'<li>'+t('In Arduino Library Manager, install the libraries used by this sketch and accept their dependencies:')+' <ul>'+libraries.map(l=>'<li><a target="_blank" rel="noopener" href="'+l.url+'">'+l.names.join(' + ')+'</a></li>').join('')+'</ul></li>':'';
 const pins=[...new Set(nets.flatMap(n=>n.terminals.filter(p=>p.board).map(p=>p.key+(p.gpio===undefined?'':' / GPIO '+p.gpio))))];
 const rows=nets.map((n,i)=>'<tr><th scope="row">'+(i+1)+'</th><td>'+n.terminals.map(p=>esc(p.key)).join('<br>')+'</td><td>'+n.holes.map(esc).join('<br>')+'</td></tr>').join('');
 const p=s=>'<p>'+t(s)+'</p>';
 return '<dialog class="hardware-guide" id="hardware-guide" aria-labelledby="hardware-title">'+
 '<div class="hardware-head"><h2 id="hardware-title">'+t('From browser to your ESP32')+'</h2><button class="lab-link" id="hardware-close" autofocus>'+t('Close')+'</button></div>'+
 p('For a classic ESP32 DevKit / ESP32-WROOM-32. Match the printed GPIO labels on your own board; pin positions differ between boards. ESP32-C3 and ESP32-S3 need their own pin maps.')+
 '<h3>'+t('1. Check your connections')+'</h3>'+
 p('Unplug USB before changing wires. GPIO signals are 3.3 V: never connect a GPIO to 5 V. Use a series resistor with each LED. Check its anode (+) and cathode (-).')+
 p('This reference describes your current drawing, including any mistakes. Check simulator warnings first. Breadboard rails may be split on a real board; verify continuity.')+
 '<p><b>'+t('Board pins used')+'</b><br><span class="hardware-pins">'+(pins.length?pins.map(esc).join('<br>'):t('No board pins are connected yet.'))+'</span></p>'+
 '<p><b>'+t('Components in this project')+'</b></p><ul>'+diagram.parts.filter(p=>!['esp32','breadboard'].includes(p.type)).map(p=>'<li>'+esc(p.id)+' · '+t(PARTS[p.type].label)+(p.type==='resistor'?' · '+esc(p.attrs.ohms??220)+' Ω':'')+'</li>').join('')+'</ul>'+
 '<details open><summary>'+t('Connection groups in this project')+'</summary>'+
 p('Terminals in the same row are connected. A resistor or LED joins different rows through the component. A = LED anode; C = LED cathode.')+
 (rows?'<div class="hardware-table"><table><thead><tr><th>'+t('Group')+'</th><th>'+t('Component terminals')+'</th><th>'+t('Breadboard holes')+'</th></tr></thead><tbody>'+rows+'</tbody></table></div>':p('No connections yet. Build your circuit before moving to hardware.'))+'</details>'+
 '<h3>'+t('2. Download and upload')+'</h3><ol>'+
 '<li>'+t('Close this guide and use Download .ino to save the code currently in the editor.')+'</li>'+
 '<li>'+t('Install Arduino IDE and the esp32 package by Espressif Systems in Boards Manager. Select your exact board and its USB port.')+'</li>'+
 libraryStep+'<li>'+t('Open the .ino file and click Verify, then Upload. If the IDE asks, save it in a folder with the same sketch name. If upload stalls, follow your board instructions for the BOOT button.')+'</li>'+
 '<li>'+t('Open Serial Monitor at the baud rate in Serial.begin(). For readStringUntil with a newline delimiter, select Newline (LF).')+'</li></ol>'+
 '<h3>'+t('3. Know what the simulator supports')+'</h3>'+
 p('This is an Arduino behavior simulator, not an ESP32 firmware emulator. It supports basic variables, functions, loops, one-dimensional arrays and String; GPIO, timing, PWM, analog input, tone and USB Serial input/output are modeled.')+
 p('Wi-Fi (station mode), a small web server, GPIO interrupts, and the DHT11, SSD1306 OLED, PIR, LDR and relay parts are simulated in simplified form. Bluetooth, other Arduino libraries and real radio behavior are not. Serial2 is not connected to this USB monitor. Real timing, ADC readings and component tolerances can differ.')+
 p('GPIO 34, 35, 36 and 39 are input-only on the classic ESP32. GPIO 1 and 3 serve USB serial. Some pins affect boot; check your board pinout before choosing pins.')+
 '<p class="hardware-sources">'+t('Official references')+': <a target="_blank" rel="noopener" href="https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html">'+t('IDE and upload setup')+'</a> · <a target="_blank" rel="noopener" href="https://docs.espressif.com/projects/esp-idf/en/stable/esp32/api-reference/peripherals/gpio.html">'+t('ESP32 GPIO reference')+'</a> · <a target="_blank" rel="noopener" href="https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html">'+t('Board and power reference')+'</a></p></dialog>';
}
