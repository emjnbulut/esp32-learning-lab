// SVG drawings for the parts, in part-local coordinates (the anchor/pin 0 is at 0,0).
// Dynamic pieces carry ids so the lab can update them every frame without re-rendering.
import {PARTS,PITCH,LED_COLORS} from './circuit.mjs';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const BANDS=['#1b1b1b','#7a4a21','#d22b2b','#f28c1c','#f2d21c','#2f9a3c','#2f5fd0','#8a3fc8','#8c8c8c','#f4f4f4'];
export function bands(ohms){let v=Math.round(Number(ohms)||0);if(v<10)return [BANDS[0],BANDS[Math.min(9,v)],BANDS[0]];const s=String(v);const exp=s.length-2;return [BANDS[+s[0]],BANDS[+s[1]],BANDS[Math.min(9,exp)]];}
export function fmtOhms(o){o=Number(o);return o>=1e6?(o/1e6)+' MΩ':o>=1000?(o/1000)+' kΩ':o+' Ω';}
function esp32(p){const def=PARTS.esp32;let s=`<rect x="-14" y="-58" width="118" height="234" rx="6" fill="#1d2a38" stroke="#0f1720"/>`;
 s+=`<rect x="8" y="-52" width="74" height="60" rx="2" fill="#c9ced6" stroke="#9aa1aa"/><path d="M14 -46h8v8h8v-8h8v8h8v-8h8v8h8v-8h8" fill="none" stroke="#8a9099" stroke-width="1.5"/><text x="45" y="-18" text-anchor="middle" font-size="6" fill="#4d5560" font-family="monospace">ESP-WROOM-32</text>`;
 s+=`<rect x="31" y="162" width="28" height="16" rx="2" fill="#b9bec6" stroke="#80868f"/><rect x="2" y="150" width="10" height="7" rx="1" fill="#3a4654"/><rect x="78" y="150" width="10" height="7" rx="1" fill="#3a4654"/><text x="7" y="148" text-anchor="middle" font-size="4" fill="#9fb0c0">EN</text><text x="83" y="148" text-anchor="middle" font-size="4" fill="#9fb0c0">BOOT</text>`;
 s+=`<circle cx="28" cy="150" r="2.6" fill="#ff3b30" opacity=".9"/><circle id="esp-led-${p.id}" cx="62" cy="150" r="2.6" fill="#24435f"/><text x="62" y="158" text-anchor="middle" font-size="3.6" fill="#9fb0c0">IO2</text><text x="45" y="138" text-anchor="middle" font-size="7" fill="#e3e9ef" font-family="sans-serif" font-weight="700">ESP32</text><text x="45" y="128" text-anchor="middle" font-size="4.5" fill="#9fb0c0" font-family="monospace">DEVKIT V1</text>`;
 for(const [n,x,y] of def.pins){const lbl=n.replace(/\.[LR]$/,'');s+=`<rect x="${x-3}" y="${y-3}" width="6" height="6" rx="1" fill="#d6b45a" stroke="#8d7330" stroke-width=".6"/><text x="${x===0?6:84}" y="${y+2}" text-anchor="${x===0?'start':'end'}" font-size="5" fill="#e3e9ef" font-family="monospace">${lbl}</text>`;}
 return s;}
function breadboard(){let s=`<rect x="-14" y="-12" width="318" height="194" rx="5" fill="#f4f1e8" stroke="#d7d1c2"/><rect x="-14" y="81" width="318" height="12" fill="#e7e2d4"/>`;
 s+=`<path d="M-4 -6H296M-4 176H296" stroke="#d64541" stroke-width="1"/><path d="M-4 16H296M-4 154H296" stroke="#3a6fd8" stroke-width="1"/>`;
 s+=`<text x="-10" y="3" font-size="7" fill="#d64541">+</text><text x="-10" y="13" font-size="7" fill="#3a6fd8">−</text><text x="-10" y="163" font-size="7" fill="#d64541">+</text><text x="-10" y="173" font-size="7" fill="#3a6fd8">−</text>`;
 let d='';for(const [n,x,y] of PARTS.breadboard.pins)d+=`M${x-1.6} ${y-1.6}h3.2v3.2h-3.2z`;s+=`<path d="${d}" fill="#3b3a36"/>`;
 for(const [r,y] of [['a',30],['b',40],['c',50],['d',60],['e',70],['f',100],['g',110],['h',120],['i',130],['j',140]])s+=`<text x="-9" y="${y+2}" font-size="5" fill="#8b8576" font-family="monospace">${r}</text>`;
 for(let c=1;c<=30;c+=(c===1?4:5))s+=`<text x="${(c-1)*PITCH}" y="23" text-anchor="middle" font-size="5" fill="#8b8576" font-family="monospace">${c}</text><text x="${(c-1)*PITCH}" y="92" text-anchor="middle" font-size="5" fill="#8b8576" font-family="monospace">${c}</text>`;
 return s;}
function led(p){const c=(LED_COLORS[p.attrs.color]||LED_COLORS.red).css;
 return `<circle id="glow-${p.id}" cx="5" cy="-26" r="18" fill="${c}" opacity="0"/><path d="M0 0V-12M10 0V-10" stroke="#9a9a9a" stroke-width="1.4"/><path d="M0 -12l-1 -2" stroke="#9a9a9a" stroke-width="1.4"/>
 <path d="M-3 -13H13V-27a8 8 0 0 0 -16 0z" fill="#888" stroke="#00000044"/><path id="led-${p.id}" d="M-3 -13H13V-27a8 8 0 0 0 -16 0z" fill="${c}" fill-opacity=".45" stroke="#0000004d" stroke-width=".7"/>
 <path d="M-4 -13H14" stroke="#00000033" stroke-width="2"/><path d="M0 -28v7" stroke="#ffffff99" stroke-width="1.5" stroke-linecap="round"/><text x="-7" y="-1" font-size="5" fill="#666">+</text>`;}
function resistor(p){const b=bands(p.attrs.ohms);return `<path d="M0 0H30" stroke="#9a9a9a" stroke-width="1.4"/><rect x="6" y="-4" width="18" height="8" rx="3.5" fill="#d9c08f" stroke="#a88e5b" stroke-width=".7"/>
 <rect x="9" y="-4" width="2" height="8" fill="${b[0]}"/><rect x="13" y="-4" width="2" height="8" fill="${b[1]}"/><rect x="17" y="-4" width="2" height="8" fill="${b[2]}"/><rect x="21" y="-4" width="1.5" height="8" fill="#c9a43a"/>`;}
function button(p){return `<path d="M0 0v4M20 0v4M0 30v-4M20 30v-4" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-4" y="3" width="28" height="24" rx="2" fill="#2c2f33" stroke="#111"/>
 <circle cx="0.5" cy="7" r="1.6" fill="#555"/><circle cx="19.5" cy="7" r="1.6" fill="#555"/><circle cx="0.5" cy="23" r="1.6" fill="#555"/><circle cx="19.5" cy="23" r="1.6" fill="#555"/>
 <circle id="btn-${p.id}" cx="10" cy="15" r="7.5" fill="${p.attrs.cap||'#d64541'}" stroke="#00000066"/>`;}
function pot(p){return `<path d="M0 0v-6M10 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-10" y="-38" width="40" height="32" rx="3" fill="#2f5fa8" stroke="#1f3f70"/>
 <circle cx="10" cy="-22" r="11" fill="#d7dbe0" stroke="#8a9099"/><g id="pot-${p.id}" transform="rotate(${-135+270*(p.attrs.pos??0.5)} 10 -22)"><path d="M10 -22V-31" stroke="#2c2f33" stroke-width="2.4" stroke-linecap="round"/></g>
 <text x="0" y="-8" text-anchor="middle" font-size="3.6" fill="#dbe6ff">GND</text><text x="10" y="-8" text-anchor="middle" font-size="3.6" fill="#dbe6ff">SIG</text><text x="20" y="-8" text-anchor="middle" font-size="3.6" fill="#dbe6ff">VCC</text>`;}
function rgb(p){return `<circle id="glow-${p.id}" cx="15" cy="-26" r="20" fill="#fff" opacity="0"/><path d="M0 0V-12M10 0V-12M20 0V-12M30 0V-12" stroke="#9a9a9a" stroke-width="1.4"/>
 <path id="rgb-${p.id}" d="M3 -13H27V-26a12 12 0 0 0 -24 0z" fill="#e9eef2" fill-opacity=".85" stroke="#0000004d" stroke-width=".7"/><path d="M8 -28v7" stroke="#ffffffaa" stroke-width="1.5" stroke-linecap="round"/>
 <text x="0" y="6" text-anchor="middle" font-size="4" fill="#666">R</text><text x="10" y="6" text-anchor="middle" font-size="4" fill="#666">${p.attrs.common==='anode'?'+':'−'}</text><text x="20" y="6" text-anchor="middle" font-size="4" fill="#666">G</text><text x="30" y="6" text-anchor="middle" font-size="4" fill="#666">B</text>`;}
function buzzer(p){return `<path d="M0 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><circle cx="10" cy="-18" r="15" fill="#222" stroke="#000"/><circle cx="10" cy="-18" r="3" fill="#444"/>
 <g id="bz-${p.id}" opacity="0" stroke="#ff8a2a" stroke-width="1.4" fill="none"><path d="M30 -26a12 12 0 0 1 0 16M35 -30a18 18 0 0 1 0 24"/></g><text x="22" y="-4" font-size="6" fill="#d64541">+</text>`;}
function ldr(p){const lv=p.attrs.light??0.5;return `<path d="M0 0v-6M10 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-8" y="-38" width="36" height="32" rx="3" fill="#1e4d3b" stroke="#123326"/>
 <circle id="ldr-${p.id}" cx="10" cy="-24" r="11" fill="#ffd23a" opacity="${(0.1+0.55*lv).toFixed(2)}"/><circle cx="10" cy="-24" r="8" fill="#e8cfa0" stroke="#b85d28" stroke-width="1.2"/>
 <path d="M5 -27h10l-10 3h10l-10 3h10" fill="none" stroke="#b85d28" stroke-width="1"/><text x="0" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">GND</text><text x="10" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">SIG</text><text x="20" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">VCC</text>`;}
function dht11(p){const t=p.attrs.temp??24,h=p.attrs.hum??50;return `<path d="M0 0v-6M10 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-6" y="-40" width="32" height="34" rx="2.5" fill="#2a82c9" stroke="#18558a"/>
 <path d="M-2 -35h24M-2 -30h24M-2 -25h24" stroke="#18558a" stroke-width="1.2"/><text id="dht-${p.id}" x="10" y="-17" text-anchor="middle" font-size="4.2" fill="#fff" font-family="monospace">${t}° ${h}%</text>
 <text x="0" y="-8" text-anchor="middle" font-size="3.4" fill="#e3f2ff">VCC</text><text x="10" y="-8" text-anchor="middle" font-size="3.4" fill="#e3f2ff">DAT</text><text x="20" y="-8" text-anchor="middle" font-size="3.4" fill="#e3f2ff">GND</text>`;}
function oled(p){return `<path d="M0 0v-6M10 0v-6M20 0v-6M30 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-14" y="-50" width="58" height="44" rx="3" fill="#173a6a" stroke="#0d2342"/>
 <rect x="-10" y="-46" width="50" height="28" rx="1.5" fill="#0b1117" stroke="#2f4b6e" stroke-width=".8"/><g id="oled-${p.id}"><text x="15" y="-30" text-anchor="middle" font-size="4.5" fill="#39c5ff" font-family="monospace" opacity=".45">SSD1306</text></g>
 <text x="0" y="-9" text-anchor="middle" font-size="3.4" fill="#cde2ff">GND</text><text x="10" y="-9" text-anchor="middle" font-size="3.4" fill="#cde2ff">VCC</text><text x="20" y="-9" text-anchor="middle" font-size="3.4" fill="#cde2ff">SCL</text><text x="30" y="-9" text-anchor="middle" font-size="3.4" fill="#cde2ff">SDA</text>`;}
function pir(p){const on=!!p.attrs.motion;return `<path d="M0 0v-6M10 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-8" y="-40" width="36" height="34" rx="3" fill="#235c3a" stroke="#143822"/>
 <circle id="pir-${p.id}" cx="10" cy="-25" r="10.5" fill="${on?'#ff9f2e':'#eef3f0'}" stroke="#bac4be"/><path d="M3 -25h14M10 -32v14" stroke="#8b9991" stroke-width=".6"/>
 <text x="0" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">VCC</text><text x="10" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">OUT</text><text x="20" y="-8" text-anchor="middle" font-size="3.5" fill="#d5f2e5">GND</text>`;}
function relay(p){return `<path d="M0 0v-6M10 0v-6M20 0v-6" stroke="#9a9a9a" stroke-width="1.4"/><rect x="-8" y="-42" width="36" height="36" rx="3" fill="#1d4e89" stroke="#102f54"/>
 <rect x="-4" y="-38" width="28" height="20" rx="2" fill="#2565ae" stroke="#8ab8e6" stroke-width=".6"/><circle id="relay-${p.id}" cx="21" cy="-13" r="2.2" fill="#3a2020"/>
 <path id="relay-sw-${p.id}" d="M2 -24L14 -30" stroke="#ffd23a" stroke-width="1.5" stroke-linecap="round"/><circle cx="2" cy="-24" r="1.4" fill="#fff"/><circle cx="16" cy="-31" r="1.4" fill="#8ab8e6"/><circle cx="16" cy="-23" r="1.4" fill="#3bd16f"/>
 <text x="0" y="-8" text-anchor="middle" font-size="3.4" fill="#dbe6ff">VCC</text><text x="10" y="-8" text-anchor="middle" font-size="3.4" fill="#dbe6ff">GND</text><text x="20" y="-8" text-anchor="middle" font-size="3.4" fill="#dbe6ff">IN</text>`;}
const DRAW={esp32,breadboard,led,resistor,button,pot,rgb,buzzer,ldr,dht11,oled,pir,relay};
export function partSvg(p,{selected=false}={}){const def=PARTS[p.type];const [x0,y0,x1,y1]=def.box;
 return `<g class="part part-${p.type}${selected?' selected':''}" data-part="${esc(p.id)}" transform="translate(${p.x} ${p.y}) rotate(${p.rot||0})">${DRAW[p.type](p)}${selected?`<rect class="sel-box" x="${x0-3}" y="${y0-3}" width="${x1-x0+6}" height="${y1-y0+6}" rx="3"/>`:''}</g>`;}
export function partIcon(type){const p={id:'icon',type,x:0,y:0,rot:0,attrs:{...(PARTS[type].attrs||{})}};const [x0,y0,x1,y1]=PARTS[type].box;const w=x1-x0,h=y1-y0;
 return `<svg viewBox="${x0-4} ${y0-4} ${w+8} ${h+8}" aria-hidden="true">${DRAW[type](p).replace(/id="[^"]*"/g,'')}</svg>`;}
