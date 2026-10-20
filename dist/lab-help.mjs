import {PARTS} from './sim/circuit.mjs';
import {warningTargets} from './circuit-help.mjs';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function connectionMarkup(t){
 return '<details class="pin-connect" id="pin-connect"><summary>'+t('Connect pins')+'</summary>'+
 '<form id="pin-connect-form"><p>'+t('Choose a component and a pin on each side. No dragging needed.')+'</p>'+
 '<div class="pin-fields">'+['from','to'].map(side=>'<div class="pin-side">'+
 '<label for="pin-'+side+'-part">'+(side==='from'?t('From component'):t('To component'))+'</label><select id="pin-'+side+'-part"></select>'+
 '<label for="pin-'+side+'">'+(side==='from'?t('From pin'):t('To pin'))+'</label><select id="pin-'+side+'"></select></div>').join('')+'</div>'+
 '<button class="lab-link" id="pin-connect-submit" type="submit">'+t('Connect selected pins')+'</button>'+
 '<p class="pin-feedback" id="pin-connect-feedback" role="status"></p></form></details>';
}
export class CircuitHelp{
 constructor(lab){this.lab=lab;this.t=lab.t;this.signature='';this.stale=false;this.targets=null;this.lastKey=null;}
 mount(){
  const l=this.lab;
  l.$('#pin-connect-form').addEventListener('submit',e=>{e.preventDefault();this.connect();});
  for(const side of ['from','to']){
   l.$('#pin-'+side+'-part').addEventListener('change',()=>{this.updatePins(side);this.preview();});
   l.$('#pin-'+side).addEventListener('change',()=>this.preview());
  }
  l.$('#pin-connect').addEventListener('toggle',()=>{if(l.root){l.fit();l.render();}});
  l.$('#lab-issues').addEventListener('click',()=>{this.showTab('serial');l.$('#lab-warn').scrollIntoView({block:'nearest'});});
  l.$('#lab-warn').addEventListener('click',e=>{
   const button=e.target.closest('[data-warning-focus]');if(!button)return;
   const warning=this.warnings?.[Number(button.dataset.warningFocus)];if(!warning||this.stale)return;
   this.targets=warningTargets(l.diagram,warning);l.$('#pin-connect').open=false;
   this.showTab('circuit');l.render();
   l.$('#diagnostic-note').hidden=false;l.$('#diagnostic-message').textContent=this.t(warning.tpl||warning.msg,warning.vars);
   l.$('#diagnostic-note').scrollIntoView({block:'nearest'});
  });
  l.$('#diagnostic-clear').addEventListener('click',()=>{this.targets=null;l.$('#diagnostic-note').hidden=true;this.paintHighlights();});
  this.updateConnector();this.updateControls();
  this.resizeObserver=new ResizeObserver(()=>{cancelAnimationFrame(this.resizeFrame);this.resizeFrame=requestAnimationFrame(()=>{if(l.root){l.fit();l.render();}});});this.resizeObserver.observe(l.$('.lab-canvas'));
 }
 destroy(){this.resizeObserver?.disconnect();cancelAnimationFrame(this.resizeFrame);}
 showTab(tab){
  const l=this.lab;if(!l.root)return;
  l.tab=tab;l.root.querySelector('.lab').dataset.tab=tab;
  l.root.querySelectorAll('[data-labtab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.labtab===tab)));
  if(tab==='circuit')requestAnimationFrame(()=>{if(l.root){l.fit();l.render();}});
 }
 updatePins(side,preferred){
  const l=this.lab,part=l.diagram.parts.find(p=>p.id===l.$('#pin-'+side+'-part').value),select=l.$('#pin-'+side),old=preferred??select.value;
  select.innerHTML=part?PARTS[part.type].pins.map(([name])=>'<option value="'+esc(part.id+':'+name)+'">'+esc(name+' — '+l.pinLabel({part,name}))+'</option>').join(''):'';
  if([...select.options].some(o=>o.value===old))select.value=old;
 }
 updateConnector(){
  const l=this.lab,key=l.diagram.parts.map(p=>p.id+':'+p.type).join('|');if(key===this.signature)return;
  this.signature=key;
  const parts=l.diagram.parts;
  for(const side of ['from','to']){
   const select=l.$('#pin-'+side+'-part'),previous=select.value;
   select.innerHTML=parts.map(p=>'<option value="'+esc(p.id)+'">'+esc(p.id+' — '+this.t(PARTS[p.type].label))+'</option>').join('');
   const initial=side==='from'?parts.find(p=>p.type==='esp32')||parts[0]:parts.find(p=>p.type==='led')||parts[1]||parts[0];
   select.value=parts.some(p=>p.id===previous)?previous:initial?.id||'';this.updatePins(side);
  }
 }
 updateControls(){
  const l=this.lab,disabled=!!l.running||l.diagram.parts.length===0;
  l.$('#pin-connect-form').querySelectorAll('select,button').forEach(el=>el.disabled=disabled);
 }
 feedback(text){this.lab.$('#pin-connect-feedback').textContent=text;}
 preview(){this.feedback('');this.paintHighlights();}
 openConnector(a,b){
  const l=this.lab;this.updateConnector();
  for(const [side,key] of [['from',a],['to',b]]){
   const id=key.slice(0,key.lastIndexOf(':'));l.$('#pin-'+side+'-part').value=id;this.updatePins(side,key);
  }
  l.$('#pin-connect').open=true;this.showTab('circuit');this.preview();
  l.$('#pin-connect-submit').focus();
 }
 connect(){
  const l=this.lab;if(l.running){this.feedback(this.t('Stop the simulation before changing connections.'));return;}
  const a=l.$('#pin-from').value,b=l.$('#pin-to').value;
  if(!a||!b||a===b){this.feedback(this.t('Choose two different pins.'));return;}
  if(l.diagram.wires.some(w=>w.a===a&&w.b===b||w.a===b&&w.b===a)){this.feedback(this.t('These pins are already connected.'));return;}
  l.wiring=null;l.addWire(a,b);this.feedback(this.t('Wire connected. Undo is available.'));
 }
 changed(){
  this.stale=true;this.targets=null;this.lastKey=null;this.warnings=[];
  const l=this.lab;l.$('#lab-warn').replaceChildren();l.$('#lab-issues').hidden=true;l.$('#diagnostic-note').hidden=true;
  this.updateConnector();this.updateControls();this.paintHighlights();
 }
 start(){this.stale=false;this.targets=null;this.lastKey=null;this.lab.$('#diagnostic-note').hidden=true;this.paintHighlights();}
 paintWarnings(sim){
  this.updateControls();
  const l=this.lab,warnings=this.stale?[]:[...sim.warnings];
  if(!this.stale&&sim.codeBaud&&sim.codeBaud!==l.baud)warnings.unshift({tpl:'Your code uses {b} baud, the monitor is set to {m}. Choose {b} above, otherwise you see garbage.',vars:{b:sim.codeBaud,m:l.baud}});
  const key=JSON.stringify(warnings.map(w=>[w.tpl||w.msg,w.vars]));if(key===this.lastKey)return;
  this.lastKey=key;this.warnings=warnings;
  const badge=l.$('#lab-issues');badge.hidden=warnings.length===0;badge.textContent=this.t('Circuit warnings ({n})',{n:warnings.length});
  l.$('#lab-warn').innerHTML=warnings.map((w,i)=>{
   const target=warningTargets(l.diagram,w),show=target.pins.length||target.parts.length;
   return '<div class="lab-warning"><p>'+esc(this.t(w.tpl||w.msg,w.vars))+'</p>'+(show?'<button class="lab-link" data-warning-focus="'+i+'">'+this.t('Show in circuit')+'</button>':'')+'</div>';
  }).join('');
 }
 paintHighlights(){
  const l=this.lab;if(!l.world)return;
  const target=this.targets||{pins:[],parts:[],wires:[]};
  l.world.querySelectorAll('[data-wire]').forEach(el=>el.classList.toggle('diagnostic-wire',target.wires.includes(Number(el.dataset.wire))));
  l.world.querySelectorAll('[data-part]').forEach(el=>el.classList.toggle('diagnostic-part',target.parts.includes(el.dataset.part)));
  l.world.querySelector('.helper-overlay')?.remove();
  const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g');group.setAttribute('class','helper-overlay');group.setAttribute('pointer-events','none');group.setAttribute('aria-hidden','true');
  const ring=(key,kind)=>{const point=l.pinPosByKey(key);if(!point)return;const circle=document.createElementNS(ns,'circle');circle.setAttribute('cx',point[0]);circle.setAttribute('cy',point[1]);circle.setAttribute('r','5');circle.setAttribute('class',kind);circle.setAttribute('data-highlight-pin',key);group.append(circle);};
  for(const pin of target.pins)ring(pin,'diagnostic-pin');
  if(l.$('#pin-connect').open&&!this.targets)for(const side of ['from','to'])ring(l.$('#pin-'+side).value,'connector-pin');
  l.world.append(group);
 }
}
