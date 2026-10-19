// Wokwi-style lab: code editor + circuit editor + simulator + serial monitor.
// Used by missions (with goal checks) and by the free workshop (with saved projects).
import {sketchDownload} from './sketch-export.mjs';
import {Simulator} from './sim/runtime.mjs';
import {PARTS,PITCH,partPins,pinPos,LED_COLORS,ESP_GPIO} from './sim/circuit.mjs';
import {partSvg,partIcon,fmtOhms} from './sim/parts-view.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clone=o=>JSON.parse(JSON.stringify(o));
// every part needs its own id (wires and selection use it); older saved projects may contain duplicates
const BASE_ID={esp32:'esp',breadboard:'bb',led:'led',resistor:'r',button:'btn',pot:'pot',rgb:'rgb',buzzer:'buzzer'};
// boards keep a plain name for the first one (esp, bb, then bb2…); small parts are numbered from 1 (led1, r1, btn1…)
export function uniqueId(parts,type){const base=BASE_ID[type]||type,single=type==='esp32'||type==='breadboard';if(single&&!parts.some(p=>p.id===base))return base;let n=single?2:1;while(parts.some(p=>p.id===base+n))n++;return base+n;}
export function repairIds(diagram){const seen=new Set();for(const p of diagram.parts){if(seen.has(p.id)){const keep=diagram.parts.filter(q=>q!==p&&seen.has(q.id));p.id=uniqueId([...keep,...diagram.parts.filter(q=>q!==p)],p.type);}seen.add(p.id);}return diagram;}
const KW=/\b(void|int|long|short|char|float|double|bool|boolean|byte|word|unsigned|signed|const|static|volatile|String|uint8_t|int8_t|uint16_t|int16_t|uint32_t|int32_t|size_t|if|else|for|while|do|return|break|continue|switch|case|default|true|false|HIGH|LOW|INPUT|OUTPUT|INPUT_PULLUP|INPUT_PULLDOWN|LED_BUILTIN)\b/;
export function highlight(code){return code.split('\n').map(line=>{let out='',rest=line;
 while(rest.length){let m;
  if((m=rest.match(/^\/\/.*/))){out+=`<span class="c-com">${esc(m[0])}</span>`;break;}
  if((m=rest.match(/^"(?:[^"\\]|\\.)*"?|^'(?:[^'\\]|\\.)*'?/))){out+=`<span class="c-str">${esc(m[0])}</span>`;rest=rest.slice(m[0].length);continue;}
  if((m=rest.match(/^#\w+/))){out+=`<span class="c-pre">${esc(m[0])}</span>`;rest=rest.slice(m[0].length);continue;}
  if((m=rest.match(/^(0[xXbB][0-9a-fA-F]+|\d+\.?\d*)/))){out+=`<span class="c-num">${m[0]}</span>`;rest=rest.slice(m[0].length);continue;}
  if((m=rest.match(/^[A-Za-z_]\w*/))){const w=m[0];out+=KW.test(w)&&KW.exec(w)[0]===w?`<span class="c-kw">${w}</span>`:/^\s*\(/.test(rest.slice(w.length))||w==='Serial'?`<span class="c-fn">${w}</span>`:esc(w);rest=rest.slice(w.length);continue;}
  out+=esc(rest[0]);rest=rest.slice(1);}
 return out;}).join('\n')+'\n';}
const WIRE_COLORS=['#2f9a3c','#2f6fd0','#f28c1c','#c9a400','#8a3fc8','#16a3a3'];
const ADDABLE=['esp32','breadboard','led','resistor','button','pot','rgb','buzzer'];
export class Lab{
 constructor(o){this.t=o.t||(s=>s);this.code=o.code||'';this.diagram=repairIds(clone(o.diagram||{parts:[],wires:[]}));this.past=[];this.future=[];this.tool='select';this.wcolor=null;this.onChange=o.onChange||(()=>{});this.onTick=o.onTick||(()=>{});this.onRun=o.onRun||(()=>{});
  this.readOnlyParts=new Set(o.lockedParts||[]);this.view=null;this.sel=null;this.sim=null;this.wiring=null;this.drag=null;this.tab='code';this.sound=true;this.baud=115200;this.lastOut='';this.raf=0;this.lastTick=0;}
 get running(){return this.sim?.status==='running';}
 mount(root){this.root=root;root.__lab=this;const t=this.t;
  root.innerHTML=`<div class="lab" data-tab="${this.tab}">
  <div class="lab-bar"><button class="lab-run" id="lab-run">${t('▶ Run')}</button><button class="lab-icon" id="lab-restart" title="${t('Restart')}" aria-label="${t('Restart')}">↺</button>
   <span class="lab-time" id="lab-time">00:00.000</span><span class="lab-status" id="lab-status" role="status"></span>
   <div class="lab-tabs" role="tablist">${['code','circuit','serial'].map(k=>`<button role="tab" data-labtab="${k}" aria-selected="${this.tab===k}">${t({code:'Code',circuit:'Circuit',serial:'Serial'}[k])}</button>`).join('')}</div>
   <span class="lab-spacer"></span><button class="lab-icon" id="lab-sound" aria-pressed="${this.sound}" title="${t('Sound')}" aria-label="${t('Sound')}">${this.sound?'🔊':'🔇'}</button></div>
  <div class="lab-body">
   <section class="lab-code"><div class="lab-head"><span>sketch.ino</span><button class="lab-link" id="lab-ino">${t('Download .ino')}</button></div>
    <div class="editor"><pre class="ed-gutter" id="ed-gutter" aria-hidden="true"></pre><div class="ed-wrap"><pre class="ed-hl" id="ed-hl" aria-hidden="true"></pre><textarea id="ed-text" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="${t('Arduino code')}"></textarea></div></div>
    <div class="lab-error" id="lab-error" role="alert" hidden></div></section>
   <section class="lab-diagram"><div class="lab-head"><div class="lab-toolsel" role="group" aria-label="${t('Tool')}"><button data-tool="select" aria-pressed="true" title="${t('Move parts, select wires (V)')}">✋ ${t('Move')}</button><button data-tool="wire" aria-pressed="false" title="${t('Draw wires (W)')}">🔌 ${t('Wire')}</button></div><span class="wire-colors" id="lab-wcolors" hidden>${['auto','#2b2b2b','#d64541','#2f9a3c','#2f6fd0','#f28c1c','#c9a400','#8a3fc8'].map(c=>`<button data-newcolor="${c}" aria-pressed="${c==='auto'}" title="${c==='auto'?t('Automatic colour'):c}" style="${c==='auto'?'':'background:'+c}">${c==='auto'?'A':''}</button>`).join('')}</span><span class="lab-spacer"></span><button class="lab-link" id="lab-undo" title="${t('Undo (Ctrl+Z)')}" disabled>↶ ${t('Undo')}</button><button class="lab-link" id="lab-redo" title="${t('Redo (Ctrl+Y)')}" disabled>↷ ${t('Redo')}</button><button class="lab-link" id="lab-add" aria-expanded="false">${t('+ Add part')}</button></div>
    <div class="lab-canvas"><svg id="lab-svg" tabindex="0" aria-label="${t('Circuit diagram. Drag parts to move them. Drag from one pin to another to connect a wire.')}"><g id="lab-world"></g></svg>
     <div class="lab-zoom"><button data-zoom="-1" aria-label="${t('Zoom out')}">−</button><button data-zoom="0" aria-label="${t('Fit')}">⤢</button><button data-zoom="1" aria-label="${t('Zoom in')}">+</button></div>
     <div class="lab-tip" id="lab-tip" hidden></div><button class="lab-cancel" id="lab-cancel" hidden>✕ ${t('Cancel wire')}</button><div class="lab-props" id="lab-props" hidden></div><div class="lab-palette" id="lab-palette" hidden></div></div>
    <div class="lab-inputs" id="lab-inputs"></div></section>
   <section class="lab-serial"><div class="lab-head"><span>Serial Monitor</span><span class="lab-spacer"></span><select id="lab-baud" aria-label="${t('Baud rate')}">${[9600,115200].map(b=>`<option ${b===this.baud?'selected':''}>${b}</option>`).join('')}</select><button class="lab-link" id="lab-clear">${t('Clear')}</button></div>
    <div class="lab-warn" id="lab-warn"></div><pre class="lab-out" id="lab-out"></pre></section>
  </div></div>`;
  this.$=s=>root.querySelector(s);this.svg=this.$('#lab-svg');this.world=this.$('#lab-world');this.ta=this.$('#ed-text');this.ta.value=this.code;this.syncEditor();
  this.bindEditor();this.bindDiagram();this.bindBar();this.renderInputs();
  requestAnimationFrame(()=>{this.fit();this.render();});
  const loop=ts=>{this.frame(ts);this.raf=requestAnimationFrame(loop);};this.raf=requestAnimationFrame(loop);}
 destroy(){cancelAnimationFrame(this.raf);this.stopAudio();this.sim?.stop();this.root=null;}
 changed(){this.onChange({code:this.code,diagram:this.diagram});this.undoState();}
 // circuit history: snap() before every change, undo()/redo() swap whole diagrams
 snap(){this.past.push(clone(this.diagram));if(this.past.length>60)this.past.shift();this.future=[];}
 undo(){if(!this.past.length)return;if(this.running)this.stop();this.future.push(clone(this.diagram));this.diagram=this.past.pop();this.wiring=null;this.sel=null;this.closeProps();this.render();this.renderInputs();this.changed();}
 redo(){if(!this.future.length)return;if(this.running)this.stop();this.past.push(clone(this.diagram));this.diagram=this.future.pop();this.wiring=null;this.sel=null;this.closeProps();this.render();this.renderInputs();this.changed();}
 setTool(tool){this.tool=tool;this.wiring=null;this.hover=null;this.wend=null;if(tool==='wire')this.select(null);const lab=this.root.querySelector('.lab');lab.dataset.tool=tool;
  this.root.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===tool)));this.$('#lab-wcolors').hidden=tool!=='wire';this.$('#lab-tip').hidden=true;
  this.status(tool==='wire'?this.t('Wire tool: click a pin or hole, then another one. Press Esc or ✋ Move to stop.'):'');this.render();}
 undoState(){const u=this.$?.('#lab-undo'),r=this.$?.('#lab-redo');if(u)u.disabled=!this.past.length;if(r)r.disabled=!this.future.length;}
 // ---------- editor ----------
 syncEditor(){const lines=this.code.split('\n').length;const err=this.errLine;this.$('#ed-gutter').innerHTML=Array.from({length:lines},(_,i)=>i+1===err?`<b>${i+1}</b>`:String(i+1)).join('\n')+'\n';this.$('#ed-hl').innerHTML=highlight(this.code);this.scrollEditor();}
 scrollEditor(){const hl=this.$('#ed-hl'),g=this.$('#ed-gutter');hl.scrollTop=this.ta.scrollTop;hl.scrollLeft=this.ta.scrollLeft;g.scrollTop=this.ta.scrollTop;}
 setCode(code){this.code=code;this.ta.value=code;this.syncEditor();}
 bindEditor(){const ta=this.ta;
  ta.addEventListener('input',()=>{this.code=ta.value;this.errLine=null;this.$('#lab-error').hidden=true;this.syncEditor();this.changed();if(this.running)this.status(this.t('Code changed: press ↺ to restart with it.'));});
  ta.addEventListener('scroll',()=>this.scrollEditor());
  ta.addEventListener('keydown',e=>{const v=ta.value,s=ta.selectionStart,en=ta.selectionEnd;const lineStart=v.lastIndexOf('\n',s-1)+1;
   const put=(text,a,b,cursor)=>{ta.setRangeText(text,a,b,'end');if(cursor!==undefined)ta.selectionStart=ta.selectionEnd=cursor;ta.dispatchEvent(new Event('input'));};
   if(e.key==='Tab'&&!e.ctrlKey&&!e.altKey){if(e.shiftKey){if(v.startsWith('  ',lineStart)){e.preventDefault();put('',lineStart,lineStart+2,Math.max(lineStart,s-2));}return;}e.preventDefault();put('  ',s,en);return;}
   if(e.key==='Enter'){e.preventDefault();const line=v.slice(lineStart,s);let ind=line.match(/^\s*/)[0];if(/\{\s*$/.test(line))ind+='  ';const closing=v[en]==='}';put('\n'+ind+(closing&&ind.length>=2?'\n'+ind.slice(2):''),s,en,s+1+ind.length);return;}
   if(e.key==='}'&&/^\s+$/.test(v.slice(lineStart,s))&&s-lineStart>=2){e.preventDefault();put('}',s-2,en);return;}
   if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();this.restart();}});}
 showError(err){this.errLine=err.line||null;const box=this.$('#lab-error');box.hidden=false;box.innerHTML=`<b>${err.line?this.t('Line {n}',{n:err.line}):this.t('Error')}</b> ${esc(err.message)}`;this.syncEditor();
  if(err.line){const lh=parseFloat(getComputedStyle(this.ta).lineHeight)||18;this.ta.scrollTop=Math.max(0,(err.line-4)*lh);}this.tab='code';this.root.querySelector('.lab').dataset.tab='code';}
 // ---------- toolbar ----------
 bindBar(){this.$('#lab-run').onclick=()=>this.running?this.stop():this.start();this.$('#lab-restart').onclick=()=>this.restart();
  this.$('#lab-sound').onclick=e=>{this.sound=!this.sound;e.currentTarget.textContent=this.sound?'🔊':'🔇';e.currentTarget.setAttribute('aria-pressed',String(this.sound));if(!this.sound)this.stopAudio();};
  this.$('#lab-clear').onclick=()=>{if(this.sim)this.sim.out='';this.lastOut='';this.$('#lab-out').textContent='';};
  this.$('#lab-baud').onchange=e=>{this.baud=Number(e.target.value);this.lastOut=null;};
  this.$('#lab-ino').onclick=()=>{const url=URL.createObjectURL(new Blob([sketchDownload(this.code)],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='sketch.ino';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  this.root.querySelectorAll('[data-labtab]').forEach(b=>b.onclick=()=>{this.tab=b.dataset.labtab;this.root.querySelector('.lab').dataset.tab=this.tab;this.root.querySelectorAll('[data-labtab]').forEach(x=>x.setAttribute('aria-selected',String(x===b)));if(this.tab==='circuit')requestAnimationFrame(()=>{this.fit();this.render();});});
  this.$('#lab-undo').onclick=()=>this.undo();this.$('#lab-redo').onclick=()=>this.redo();this.$('#lab-cancel').onclick=()=>{this.wiring=null;this.render();};
  this.root.addEventListener('keydown',e=>{if(e.target===this.ta||!(e.ctrlKey||e.metaKey))return;const k=e.key.toLowerCase();if(k==='z'&&!e.shiftKey){e.preventDefault();this.undo();}else if(k==='y'||(k==='z'&&e.shiftKey)){e.preventDefault();this.redo();}});
  this.root.querySelectorAll('[data-tool]').forEach(b=>b.onclick=()=>this.setTool(b.dataset.tool));
  this.root.querySelectorAll('[data-newcolor]').forEach(b=>b.onclick=()=>{this.wcolor=b.dataset.newcolor==='auto'?null:b.dataset.newcolor;this.root.querySelectorAll('[data-newcolor]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  this.$('#lab-add').onclick=e=>{const pal=this.$('#lab-palette');const open=pal.hidden;pal.hidden=!open;e.currentTarget.setAttribute('aria-expanded',String(open));
   if(open)pal.innerHTML=ADDABLE.filter(tp=>tp!=='esp32'||!this.diagram.parts.some(p=>p.type==='esp32')).map(tp=>`<button data-addpart="${tp}">${partIcon(tp)}<span>${this.t(PARTS[tp].label)}</span></button>`).join('');
   pal.querySelectorAll('[data-addpart]').forEach(b=>b.onclick=()=>{pal.hidden=true;this.addPart(b.dataset.addpart);});};}
 status(s){this.$('#lab-status').textContent=s||'';}
 start(){this.stop(true);this.$('#lab-error').hidden=true;this.errLine=null;this.syncEditor();this.closeProps();
  this.sim=new Simulator(clone(this.diagram),this.code);const err=this.sim.start();
  if(err){this.showError(err);this.status(this.t('Fix the error, then run again.'));this.sim=null;this.onRun(false);return false;}
  this.lastOut=null;this.lastFrame=performance.now();this.$('#lab-run').textContent=this.t('■ Stop');this.$('#lab-run').classList.add('on');this.status(this.t('Running'));this.root.querySelector('.lab').classList.add('is-running');this.renderInputs();this.onRun(true);
  if(this.sound&&!this.audio){try{this.audio=new (window.AudioContext||window.webkitAudioContext)();}catch{}}return true;}
 stop(silent){if(!this.sim)return;this.sim.stop();this.$('#lab-run').textContent=this.t('▶ Run');this.$('#lab-run').classList.remove('on');this.root?.querySelector('.lab').classList.remove('is-running');this.stopAudio();this.paint();if(!silent)this.status(this.t('Stopped'));this.renderInputs();this.onRun(false);}
 restart(){this.start();}
 // ---------- frame ----------
 frame(ts){if(!this.root)return;const s=this.sim;if(!s)return;
  if(s.status==='running'){const dt=Math.min(100,ts-(this.lastFrame||ts));this.lastFrame=ts;s.advance(dt*1000);}
  if(s.status==='error'&&!this.shownErr){this.shownErr=true;this.showError(s.error);this.stop(true);this.status(this.t('The program stopped with an error.'));}
  if(s.status!=='error')this.shownErr=false;
  this.paint();
  if(ts-this.lastTick>150){this.lastTick=ts;this.onTick(s);}}
 paint(){const s=this.sim;const run=this.running;const v=run?s.view():{leds:{},buzzers:{},pressed:{},pots:{},builtin:0,time:s?s.now/1000:0};
  const ms=v.time;this.$('#lab-time').textContent=`${String(Math.floor(ms/60000)).padStart(2,'0')}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(Math.floor(ms%1000)).padStart(3,'0')}`;
  for(const p of this.diagram.parts){
   if(p.type==='led'){const b=v.leds[p.id]||0,el=this.world.querySelector('#led-'+CSS.escape(p.id)),g=this.world.querySelector('#glow-'+CSS.escape(p.id));if(el)el.setAttribute('fill-opacity',(0.45+0.55*Math.sqrt(b)).toFixed(2));if(el)el.style.filter=b>0.05?`brightness(${(1+Math.sqrt(b)*0.6).toFixed(2)})`:'';if(g)g.setAttribute('opacity',(Math.sqrt(b)*0.55).toFixed(2));}
   if(p.type==='rgb'){const ch=['R','G','B'].map(c=>Math.sqrt(v.leds[p.id+':'+c]||0));const el=this.world.querySelector('#rgb-'+CSS.escape(p.id)),g=this.world.querySelector('#glow-'+CSS.escape(p.id));const mx=Math.max(...ch);
    const col=mx>0.03?`rgb(${ch.map(x=>Math.round(40+215*x/Math.max(mx,1e-6)*Math.min(1,mx*1.4))).join(',')})`:'#e9eef2';if(el)el.setAttribute('fill',col);if(g){g.setAttribute('fill',col);g.setAttribute('opacity',(mx*0.6).toFixed(2));}}
   if(p.type==='button'){const el=this.world.querySelector('#btn-'+CSS.escape(p.id));if(el)el.setAttribute('r',v.pressed[p.id]?'6.2':'7.5');}
   if(p.type==='pot'){const pos=v.pots[p.id]??p.attrs.pos??0.5;const el=this.world.querySelector('#pot-'+CSS.escape(p.id));if(el)el.setAttribute('transform',`rotate(${-135+270*pos} 10 -22)`);}
   if(p.type==='buzzer'){const el=this.world.querySelector('#bz-'+CSS.escape(p.id));if(el)el.setAttribute('opacity',p.id in v.buzzers?'1':'0');}
   if(p.type==='esp32'){const el=this.world.querySelector('#esp-led-'+CSS.escape(p.id));if(el)el.setAttribute('fill',v.builtin?'#4ab3ff':'#24435f');}}
  this.audioTone(run&&this.sound?Math.max(0,...Object.values(v.buzzers)):0);
  if(s){const out=this.baud===(s.codeBaud||this.baud)?s.out:s.out.replace(/[^\r\n]/g,c=>'�▒¿¡ÿ§'[c.charCodeAt(0)%6]);
   if(out!==this.lastOut){const pre=this.$('#lab-out');const atEnd=pre.scrollTop+pre.clientHeight>=pre.scrollHeight-8;pre.textContent=out.replace(/\r/g,'').slice(-12000);if(atEnd)pre.scrollTop=pre.scrollHeight;this.lastOut=out;}
   const warns=s.warnings.map(w=>this.t(w.tpl||w.msg,w.vars));if(s.codeBaud&&s.codeBaud!==this.baud)warns.unshift(this.t('Your code uses {b} baud, the monitor is set to {m}. Choose {b} above, otherwise you see garbage.',{b:s.codeBaud,m:this.baud}));
   const wk=warns.join('|');if(wk!==this.lastWarn){this.lastWarn=wk;this.$('#lab-warn').innerHTML=warns.map(w=>`<p>⚠ ${esc(w)}</p>`).join('');}}}
 audioTone(f){if(!this.audio)return;if(!f){if(this.osc){this.osc.stop();this.osc=null;}return;}
  if(!this.osc){this.osc=this.audio.createOscillator();this.gain=this.audio.createGain();this.gain.gain.value=0.04;this.osc.type='square';this.osc.connect(this.gain).connect(this.audio.destination);this.osc.start();}
  this.osc.frequency.setValueAtTime(f,this.audio.currentTime);}
 stopAudio(){if(this.osc){try{this.osc.stop();}catch{}this.osc=null;}}
 // ---------- diagram ----------
 fit(){const r=this.svg.getBoundingClientRect();if(!r.width){this.view=this.view||{x:20,y:60,z:1.5};this.applyView();return;}// hidden tab: fitted again when shown
 const ps=this.diagram.parts;if(!ps.length){this.view={x:r.width/2,y:r.height/2,z:2};return;}
  let x0=Infinity,y0=Infinity,x1=-Infinity,y1=-Infinity;for(const p of ps){const b=PARTS[p.type].box;const corners=[[b[0],b[1]],[b[2],b[3]],[b[0],b[3]],[b[2],b[1]]].map(([x,y])=>{const rot=((p.rot||0)%360+360)%360;const [rx,ry]=rot===90?[-y,x]:rot===180?[-x,-y]:rot===270?[y,-x]:[x,y];return [p.x+rx,p.y+ry];});
   for(const [x,y] of corners){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
  const z=Math.max(0.6,Math.min(4,Math.min((r.width-40)/(x1-x0),(r.height-40)/(y1-y0))));this.view={z,x:r.width/2-(x0+x1)/2*z,y:r.height/2-(y0+y1)/2*z};this.applyView();}
 applyView(){if(this.view)this.world.setAttribute('transform',`translate(${this.view.x} ${this.view.y}) scale(${this.view.z})`);}
 toWorld(e){const r=this.svg.getBoundingClientRect();return [(e.clientX-r.left-this.view.x)/this.view.z,(e.clientY-r.top-this.view.y)/this.view.z];}
 pins(){if(!this.pinCache){this.pinCache=[];for(const p of this.diagram.parts)for(const pin of partPins(p))this.pinCache.push({key:p.id+':'+pin.name,part:p,name:pin.name,x:pin.x,y:pin.y});}return this.pinCache;}
 nearestPin([x,y],max=4.5){let best=null,bd=max;for(const q of this.pins()){const d=Math.hypot(q.x-x,q.y-y);if(d<bd||(d===bd&&q.part.type!=='breadboard')){bd=d;best=q;}}
  if(best&&best.part.type==='breadboard'){const other=this.pins().find(q=>q.part.type!=='breadboard'&&Math.hypot(q.x-best.x,q.y-best.y)<1);if(other)return other;}return best;}
 pinLabel(q){if(!q)return '';if(q.part.type==='breadboard')return this.t('Breadboard {h}',{h:q.name});if(q.part.type==='esp32'){const g=ESP_GPIO[q.name];return q.name.replace(/\.[LR]$/,'')+(g!==undefined&&!/^D\d/.test(q.name)?` (GPIO ${g})`:g!==undefined?` · GPIO ${g}`:'');}
  const names={A:'anode +',C:'cathode −',L1:'',L2:'',R1:'',R2:'',COM:'common',GND:'GND',SIG:'signal',VCC:'VCC','+':'+','-':'−',R:'red',G:'green',B:'blue','1':'',2:''};return `${q.part.id} ${this.t(names[q.name]??q.name)||q.name}`.trim();}
 wireColor(a,b){const n=a+' '+b;if(/GND|:t?n\d|:bn\d|:tn\d|:-\b/.test(n))return '#2b2b2b';if(/3V3|VIN|:tp\d|:bp\d/.test(n))return '#d64541';const used=this.diagram.wires.length;return WIRE_COLORS[used%WIRE_COLORS.length];}
 wirePath(w){const a=w.a===null?w._end.cursor:this.pinPosByKey(w.a),b=w.b===null?w._end.cursor:this.pinPosByKey(w.b);if(!a||!b)return null;const pts=[a,...(w.pts||[]),b];
  if(!(w.pts||[]).length&&a[0]!==b[0]&&a[1]!==b[1])pts.splice(1,0,[b[0],a[1]]);return 'M'+pts.map(p=>p.join(' ')).join('L');}
 pinPosByKey(k){const i=k.lastIndexOf(':');const p=this.diagram.parts.find(q=>q.id===k.slice(0,i));return p?pinPos(p,k.slice(i+1)):null;}
 render(){if(!this.view){this.fit();if(!this.view)return;}this.pinCache=null;
  const parts=[...this.diagram.parts].sort((a,b)=>(a.type==='breadboard'?0:a.type==='esp32'?1:2)-(b.type==='breadboard'?0:b.type==='esp32'?1:2));
  let s=parts.map(p=>partSvg(p,{selected:this.sel?.part===p.id})).join('');
  s+=this.diagram.wires.map((w,i)=>{const d=this.wirePath(this.wend?.i===i?{...w,pts:[],[this.wend.end]:null,_end:this.wend}:w);if(!d)return '';const sel=this.sel?.wire===i;return `<g class="wire${sel?' selected':''}" data-wire="${i}"><path d="${d}" class="wire-hit"/><path d="${d}" class="wire-line" stroke="${w.color||'#2f9a3c'}"/>${[this.pinPosByKey(w.a),this.pinPosByKey(w.b)].map(p=>`<circle cx="${p[0]}" cy="${p[1]}" r="1.8" fill="${w.color||'#2f9a3c'}"/>`).join('')}${sel&&!this.wend?[this.pinPosByKey(w.a),this.pinPosByKey(w.b)].map(p=>`<circle class="wire-end" cx="${p[0]}" cy="${p[1]}" r="4"/>`).join(''):''}</g>`;}).join('');
  if(this.wiring){const a=this.pinPosByKey(this.wiring.from);const pts=[a,...this.wiring.pts,this.wiring.cursor||a];s+=`<path class="wire-preview" d="M${pts.map(p=>p.join(' ')).join('L')}"/>`;}
  if(this.hover){s+=this.stripSvg(this.hover);s+=`<circle class="pin-hover" cx="${this.hover.x}" cy="${this.hover.y}" r="4"/>`;}
  this.world.innerHTML=s;this.applyView();const cb=this.$('#lab-cancel');if(cb)cb.hidden=!this.wiring;if(this.sim)this.paint();}
 // the holes connected to a breadboard hole (its five-hole column or its rail), drawn behind the hover ring
 stripSvg(q){if(q.part.type!=='breadboard')return '';const m=q.name.match(/^([a-j]|tp|tn|bp|bn)(\d+)$/);if(!m)return '';const rows=m[1].length===2?[m[1]]:'abcde'.includes(m[1])?['a','b','c','d','e']:['f','g','h','i','j'];
  const pts=rows.length===1?this.pins().filter(x=>x.part===q.part&&x.name.startsWith(m[1])&&/^\d+$/.test(x.name.slice(2))):rows.map(r=>this.pins().find(x=>x.part===q.part&&x.name===r+m[2])).filter(Boolean);
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);return `<rect class="strip-hover" x="${Math.min(...xs)-4}" y="${Math.min(...ys)-4}" width="${Math.max(...xs)-Math.min(...xs)+8}" height="${Math.max(...ys)-Math.min(...ys)+8}" rx="4"/>`;}
 select(sel){this.sel=sel;this.render();this.showProps();}
 closeProps(){this.$('#lab-props').hidden=true;this.sel=null;}
 showProps(){const box=this.$('#lab-props'),t=this.t;if(!this.sel||this.running){box.hidden=true;return;}box.hidden=false;
  if(this.sel.wire!==undefined){const w=this.diagram.wires[this.sel.wire];box.innerHTML=`<strong>${t('Wire')}</strong><small>${esc(this.pinLabel(this.pins().find(q=>q.key===w.a)))} → ${esc(this.pinLabel(this.pins().find(q=>q.key===w.b)))}</small><div class="swatches">${['#2b2b2b','#d64541',...WIRE_COLORS].map(c=>`<button data-wcolor="${c}" style="background:${c}" aria-label="${c}"></button>`).join('')}</div><button class="lab-del" id="lab-del">${t('Delete')}</button>`;
   box.querySelectorAll('[data-wcolor]').forEach(b=>b.onclick=()=>{this.snap();w.color=b.dataset.wcolor;this.render();this.changed();});}
  else{const p=this.diagram.parts.find(q=>q.id===this.sel.part);if(!p){box.hidden=true;return;}const locked=this.readOnlyParts.has(p.id);let extra='';
   if(p.type==='led')extra=`<label>${t('Color')}<select data-attr="color">${Object.keys(LED_COLORS).map(c=>`<option value="${c}" ${p.attrs.color===c?'selected':''}>${t(c)}</option>`).join('')}</select></label>`;
   if(p.type==='resistor')extra=`<label>${t('Resistance')}<select data-attr="ohms">${[100,220,330,470,1000,4700,10000].map(o=>`<option value="${o}" ${Number(p.attrs.ohms)===o?'selected':''}>${fmtOhms(o)}</option>`).join('')}</select></label>`;
   if(p.type==='button')extra=`<label class="check"><input type="checkbox" data-attr="bounce" ${p.attrs.bounce?'checked':''}> ${t('Contact bounce (realistic)')}</label>`;
   if(p.type==='buzzer')extra=`<label>${t('Type')}<select data-attr="kind"><option value="passive" ${p.attrs.kind!=='active'?'selected':''}>${t('passive (tone)')}</option><option value="active" ${p.attrs.kind==='active'?'selected':''}>${t('active (beeps on HIGH)')}</option></select></label>`;
   if(p.type==='rgb')extra=`<label>${t('Type')}<select data-attr="common"><option value="cathode" ${p.attrs.common!=='anode'?'selected':''}>${t('common cathode (−)')}</option><option value="anode" ${p.attrs.common==='anode'?'selected':''}>${t('common anode (+)')}</option></select></label>`;
   box.innerHTML=`<strong>${t(PARTS[p.type].label)}</strong><small>${esc(p.id)}</small>${extra}${locked?'':`<div class="prop-row"><button id="lab-rot">${t('↻ Rotate')}</button><button class="lab-del" id="lab-del">${t('Delete')}</button></div>`}`;
   box.querySelectorAll('[data-attr]').forEach(el=>el.onchange=()=>{this.snap();p.attrs[el.dataset.attr]=el.type==='checkbox'?el.checked:el.dataset.attr==='ohms'?Number(el.value):el.value;this.render();this.changed();});
   const rot=box.querySelector('#lab-rot');if(rot)rot.onclick=()=>this.rotateSel();}
  const del=box.querySelector('#lab-del');if(del)del.onclick=()=>this.deleteSel();}
 rotateSel(){const p=this.diagram.parts.find(q=>q.id===this.sel?.part);if(!p||this.readOnlyParts.has(p.id))return;this.snap();p.rot=((p.rot||0)+90)%360;this.render();this.changed();}
 deleteSel(){if(!this.sel)return;if(this.sel.part&&this.readOnlyParts.has(this.sel.part))return;this.snap();if(this.sel.wire!==undefined)this.diagram.wires.splice(this.sel.wire,1);
  else{const id=this.sel.part;if(this.readOnlyParts.has(id))return;this.diagram.parts=this.diagram.parts.filter(p=>p.id!==id);this.diagram.wires=this.diagram.wires.filter(w=>!w.a.startsWith(id+':')&&!w.b.startsWith(id+':'));}
  this.sel=null;this.closeProps();this.render();this.changed();}
 addPart(type){if(this.running)this.stop();const r=this.svg.getBoundingClientRect();const id=uniqueId(this.diagram.parts,type);
  const cx=(r.width/2-this.view.x)/this.view.z,cy=(r.height/2-this.view.y)/this.view.z;let px=Math.round(cx/PITCH)*PITCH,py=Math.round(cy/PITCH)*PITCH;
  // a breadboard or board is large: put it to the right of everything so it does not cover the others
  if(type==='breadboard'||type==='esp32'){let right=-Infinity,top=Infinity;for(const q of this.diagram.parts){const b=PARTS[q.type].box;right=Math.max(right,q.x+b[2]);top=Math.min(top,q.y+b[1]);}if(right>-Infinity){const b=PARTS[type].box;px=Math.round((right-b[0]+20)/PITCH)*PITCH;py=Math.round((top-b[1])/PITCH)*PITCH;}}
  const p={id,type,x:px,y:py,rot:0,attrs:{...(PARTS[type].attrs||{})}};
  this.snap();this.diagram.parts.push(p);this.select({part:id});this.changed();this.renderInputs();if(type==='breadboard'||type==='esp32')this.fit();}
 renderInputs(){const box=this.$('#lab-inputs');if(!box)return;const t=this.t;const ins=this.diagram.parts.filter(p=>p.type==='button'||p.type==='pot');
  box.innerHTML=ins.length?`<span>${t('Controls')}</span>`+ins.map(p=>p.type==='button'?`<button class="lab-press" data-press="${esc(p.id)}" ${this.running?'':'disabled'}>${t('Press {id}',{id:esc(p.id)})}</button>`:`<label>${esc(p.id)} <input type="range" min="0" max="1000" value="${Math.round((this.sim?.inputs?.[p.id]?.pos??p.attrs.pos??0.5)*1000)}" data-potin="${esc(p.id)}" ${this.running?'':'disabled'} aria-label="${t('Turn {id}',{id:esc(p.id)})}"></label>`).join(''):'';
  box.querySelectorAll('[data-press]').forEach(b=>{const id=b.dataset.press;const down=e=>{e.preventDefault();this.sim?.press(id,true);b.classList.add('down');};const up=()=>{this.sim?.press(id,false);b.classList.remove('down');};
   b.addEventListener('pointerdown',down);for(const ev of ['pointerup','pointerleave','pointercancel'])b.addEventListener(ev,up);b.addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat)down(e);});b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')up();});});
  box.querySelectorAll('[data-potin]').forEach(el=>el.addEventListener('input',()=>this.sim?.setPot(el.dataset.potin,Number(el.value)/1000)));}
 bindDiagram(){const svg=this.svg;
  this.root.querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>{const d=Number(b.dataset.zoom);if(!d){this.fit();return;}const r=svg.getBoundingClientRect();this.zoomAt(r.width/2,r.height/2,d>0?1.25:0.8);});
  svg.addEventListener('wheel',e=>{e.preventDefault();const r=svg.getBoundingClientRect();this.zoomAt(e.clientX-r.left,e.clientY-r.top,e.deltaY<0?1.12:1/1.12);},{passive:false});
  svg.addEventListener('pointerdown',e=>this.down(e));svg.addEventListener('pointermove',e=>this.move(e));svg.addEventListener('pointerup',e=>this.up(e));svg.addEventListener('pointercancel',()=>{this.drag=null;});
  svg.addEventListener('pointerleave',()=>{if(this.hover){this.hover=null;this.$('#lab-tip').hidden=true;if(!this.drag)this.render();}});
  svg.addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey)return;if(e.key==='Escape'){if(this.wiring){this.wiring=null;this.render();}else if(this.tool==='wire')this.setTool('select');else this.select(null);}else if((e.key==='w'||e.key==='W')&&!this.running)this.setTool('wire');else if((e.key==='v'||e.key==='V')&&!this.running)this.setTool('select');else if((e.key==='Delete'||e.key==='Backspace')&&this.sel&&!this.running){e.preventDefault();this.deleteSel();}else if((e.key==='r'||e.key==='R')&&this.sel?.part&&!this.running)this.rotateSel();});}
 zoomAt(px,py,f){const z=Math.max(0.5,Math.min(8,this.view.z*f));const k=z/this.view.z;this.view={z,x:px-(px-this.view.x)*k,y:py-(py-this.view.y)*k};this.applyView();}
 down(e){if(e.button>0)return;this.svg.focus({preventScroll:true});const w=this.toWorld(e);const partEl=e.target.closest('[data-part]'),wireEl=e.target.closest('[data-wire]');
  this.$('#lab-palette').hidden=true;const cap=()=>this.svg.setPointerCapture(e.pointerId);const pan=(click)=>{this.drag={kind:'pan',sx:e.clientX,sy:e.clientY,vx:this.view.x,vy:this.view.y,click};cap();};
  if(this.running){const p=partEl&&this.diagram.parts.find(q=>q.id===partEl.dataset.part);
   if(p?.type==='button'){this.sim.press(p.id,true);this.drag={kind:'press',id:p.id};cap();return;}
   if(p?.type==='pot'){this.drag={kind:'knob',p};this.knob(e);cap();return;}
   pan(false);return;}
  if(this.tool==='wire'){const pin=this.nearestPin(w,7);
   if(this.wiring){if(pin&&pin.key!==this.wiring.from)this.finishWire(pin.key);else if(!pin){this.wiring.pts.push([Math.round(w[0]/5)*5,Math.round(w[1]/5)*5]);this.render();}return;}
   if(pin){this.drag={kind:'wire',from:pin.key,sx:e.clientX,sy:e.clientY,moved:false};cap();return;}
   pan(false);return;}
  if(this.sel?.wire!==undefined){const wr=this.diagram.wires[this.sel.wire];for(const end of ['a','b']){const q=this.pinPosByKey(wr[end]);if(q&&Math.hypot(q[0]-w[0],q[1]-w[1])<6){this.drag={kind:'wend',i:this.sel.wire,end};this.wend={i:this.sel.wire,end,cursor:q};cap();return;}}}
  if(wireEl){this.select({wire:Number(wireEl.dataset.wire)});return;}
  if(partEl){const p=this.diagram.parts.find(q=>q.id===partEl.dataset.part);if(this.readOnlyParts.has(p.id)){this.select({part:p.id});return;}this.drag={kind:'part',p,ox:p.x,oy:p.y,w0:w,moved:false};cap();return;}
  pan(true);}
 knob(e){const p=this.drag.p;const [wx,wy]=this.toWorld(e);const r=(p.rot||0)*Math.PI/180,c=Math.cos(r),s=Math.sin(r);
  // knob centre (10,-22) in part coordinates, pointer taken back into part coordinates
  const kx=p.x+10*c+22*s,ky=p.y+10*s-22*c,dx=wx-kx,dy=wy-ky,lx=dx*c+dy*s,ly=-dx*s+dy*c;
  const a=Math.atan2(lx,-ly)*180/Math.PI;this.sim.setPot(p.id,Math.max(0,Math.min(1,(a+135)/270)));const sl=this.root.querySelector(`[data-potin="${CSS.escape(p.id)}"]`);if(sl)sl.value=Math.round(this.sim.inputs[p.id].pos*1000);}
 hoverAt(w){const pin=this.running?null:this.nearestPin(w,7);const tip=this.$('#lab-tip');
  if((pin?.key)===(this.hover?.key))return false;this.hover=pin;if(pin){tip.hidden=false;tip.textContent=this.pinLabel(pin);tip.style.left=(pin.x*this.view.z+this.view.x+12)+'px';tip.style.top=(pin.y*this.view.z+this.view.y-30)+'px';}else tip.hidden=true;return true;}
 move(e){const w=this.toWorld(e);const d=this.drag;
  if(this.tool==='wire'&&!this.running&&(!d||d.kind==='wire')){const changed=this.hoverAt(w);
   if(this.wiring){this.wiring.cursor=this.hover&&this.hover.key!==this.wiring.from?[this.hover.x,this.hover.y]:w;this.render();}else if(changed)this.render();}
  if(!d)return;
  if(d.kind==='pan'){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>3)d.click=false;this.view.x=d.vx+e.clientX-d.sx;this.view.y=d.vy+e.clientY-d.sy;this.applyView();this.$('#lab-tip').hidden=true;return;}
  if(d.kind==='knob'){this.knob(e);return;}
  if(d.kind==='part'){const nx=d.ox+Math.round((w[0]-d.w0[0])/PITCH)*PITCH,ny=d.oy+Math.round((w[1]-d.w0[1])/PITCH)*PITCH;if(nx!==d.p.x||ny!==d.p.y){if(!d.moved)this.snap();d.p.x=nx;d.p.y=ny;d.moved=true;this.render();}return;}
  if(d.kind==='wend'){this.hoverAt(w);this.wend.cursor=this.hover?[this.hover.x,this.hover.y]:w;this.render();return;}
  if(d.kind==='wire'){if(Math.hypot(e.clientX-d.sx,e.clientY-d.sy)>4)d.moved=true;if(d.moved&&!this.wiring)this.wiring={from:d.from,pts:[],cursor:w};}}
 up(e){const d=this.drag;this.drag=null;if(!d)return;
  if(d.kind==='press'){this.sim?.press(d.id,false);return;}
  if(d.kind==='pan'){if(d.click&&this.sel)this.select(null);return;}
  if(d.kind==='part'){if(d.moved)this.changed();this.select({part:d.p.id});return;}
  if(d.kind==='wend'){const pin=this.nearestPin(this.toWorld(e),7);const wr=this.diagram.wires[d.i];const other=wr[d.end==='a'?'b':'a'];this.wend=null;this.hover=null;this.$('#lab-tip').hidden=true;
   if(pin&&pin.key!==other&&pin.key!==wr[d.end]){this.snap();wr[d.end]=pin.key;wr.pts=[];this.changed();}this.render();this.showProps();return;}
  if(d.kind==='wire'){const pin=this.nearestPin(this.toWorld(e),7);
   if(d.moved){this.wiring=null;if(pin&&pin.key!==d.from)this.addWire(d.from,pin.key);else this.render();return;}
   this.wiring={from:d.from,pts:[],cursor:null};this.render();}}
 finishWire(to){const wr=this.wiring;this.wiring=null;this.addWire(wr.from,to,wr.pts);}
 addWire(a,b,pts=[]){if(a===b)return;if(this.diagram.wires.some(w=>(w.a===a&&w.b===b)||(w.a===b&&w.b===a))){this.render();return;}this.snap();this.diagram.wires.push({a,b,color:this.wcolor||this.wireColor(a,b),pts});this.render();this.changed();}
 // screen position of a pin or part anchor (used by the browser tests)
 pinScreen(key){const [x,y]=this.pinPosByKey(key);const r=this.svg.getBoundingClientRect();return [r.left+this.view.x+x*this.view.z,r.top+this.view.y+y*this.view.z];}
 worldToScreen(x,y){const r=this.svg.getBoundingClientRect();return [r.left+this.view.x+x*this.view.z,r.top+this.view.y+y*this.view.z];}
 setDiagram(d){this.stop(true);this.diagram=repairIds(clone(d));this.past=[];this.future=[];this.undoState();this.sel=null;this.render();this.renderInputs();this.fit();}
}
