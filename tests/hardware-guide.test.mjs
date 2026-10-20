import test from 'node:test';import assert from 'node:assert/strict';
import {wiringReference,hardwareGuide} from '../dist/hardware-guide.mjs';import {MISSIONS} from '../dist/missions.mjs';import {TR} from '../dist/i18n.mjs';
const clone=o=>JSON.parse(JSON.stringify(o));
test('hardware reference includes implicit breadboard contacts without treating component legs as a wire',()=>{
 const d=clone(MISSIONS.circuit.solution.diagram),before=JSON.stringify(d),nets=wiringReference(d);
 const find=key=>nets.find(n=>n.terminals.some(p=>p.key===key));
 assert.equal(find('esp:3V3'),find('r1:1'));assert.equal(find('r1:2'),find('led1:A'));assert.equal(find('esp:GND.R'),find('led1:C'));
 assert.notEqual(find('r1:1'),find('r1:2'));assert.ok(find('r1:2').holes.length>0);assert.equal(JSON.stringify(d),before);
 const html=hardwareGuide(d,s=>TR[s]||s);assert.match(html,/3V3/);assert.match(html,/220/);assert.match(html,/GPIO/);
});
test('guide follows current wiring and escapes imported component IDs',()=>{
 const d=clone(MISSIONS.blink.solution.diagram);const html=hardwareGuide(d,s=>s);assert.match(html,/GPIO 23/);
 d.wires=[];d.parts=d.parts.filter(p=>p.type==='esp32');
 assert.match(hardwareGuide(d,s=>s),/No board pins are connected yet/);
 const id='<img src=x onerror=alert(1)>',part={id,type:'resistor',x:600,y:600,rot:0,attrs:{ohms:330}};
 d.parts.push(part);d.wires=[{a:'esp:D23',b:id+':1'}];
 const safe=hardwareGuide(d,s=>s);assert.doesNotMatch(safe,/<img/);assert.match(safe,/&lt;img/);assert.match(safe,/330/);
});
