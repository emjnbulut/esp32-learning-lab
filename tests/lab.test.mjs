import test from 'node:test';import assert from 'node:assert/strict';
import {uniqueId,repairIds} from '../dist/lab.mjs';
test('new parts always get an id that is not used yet',()=>{const parts=[{id:'esp',type:'esp32'},{id:'bb',type:'breadboard'},{id:'r1',type:'resistor'},{id:'led1',type:'led'}];
 for(const type of ['breadboard','breadboard','led','led','resistor','button','button','pot','rgb','buzzer','esp32']){const id=uniqueId(parts,type);assert.ok(!parts.some(p=>p.id===id),`${type} -> ${id}`);parts.push({id,type});}
 assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);assert.deepEqual(parts.filter(p=>p.type==='breadboard').map(p=>p.id),['bb','bb2','bb3']);});
test('saved projects with duplicate ids are repaired (second breadboard could not be moved)',()=>{const d=repairIds({parts:[{id:'esp',type:'esp32'},{id:'bb',type:'breadboard',x:0},{id:'bb',type:'breadboard',x:300},{id:'led1',type:'led'},{id:'led1',type:'led'}],wires:[]});
 assert.equal(new Set(d.parts.map(p=>p.id)).size,5);assert.equal(d.parts[1].id,'bb');assert.equal(d.parts[2].x,300);assert.notEqual(d.parts[2].id,'bb');});
