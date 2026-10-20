import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveDiagram} from '../dist/sim/circuit.mjs';
import {Simulator} from '../dist/sim/runtime.mjs';
import {MISSIONS} from '../dist/missions.mjs';
import {FIRST_CONNECTIONS,firstCircuitChecks,placeFirstParts,warningTargets} from '../dist/circuit-help.mjs';
const base=[{id:'esp',type:'esp32',x:0,y:0},{id:'bb',type:'breadboard',x:160,y:0}];
const code='void setup(){}\nvoid loop(){}';
test('guide placement changes only its two parts and can be stored as a normal diagram',()=>{
 const input=structuredClone(MISSIONS.circuit.starter.diagram),original=structuredClone(input);
 input.parts.push({id:'extra',type:'buzzer',x:500,y:300,rot:0,attrs:{}});
 const placed=placeFirstParts(input);
 assert.deepEqual(input.parts.slice(0,4),original.parts);assert.deepEqual(placed.parts.find(p=>p.id==='extra'),input.parts.at(-1));
 assert.deepEqual(firstCircuitChecks(placed),[true,false,false,false]);assert.deepEqual(placed.wires,input.wires);
});
test('guide connections form a real safe LED circuit; placement does not solve the wiring',()=>{
 const diagram=placeFirstParts(MISSIONS.circuit.starter.diagram);
 for(const [index,[a,b]] of FIRST_CONNECTIONS.entries()){
  assert.equal(firstCircuitChecks(diagram)[index+1],false);diagram.wires.push({a,b});
  assert.equal(firstCircuitChecks(diagram)[index+1],true);
 }
 const sim=new Simulator(diagram,code);assert.equal(sim.start(),null);sim.runFor(500);
 assert.ok(sim.leds.led1>0.1);assert.ok(sim.ledI.led1>0&&sim.ledI.led1<0.02);assert.deepEqual(sim.warnings,[]);
});
test('guide detects wrong LED polarity and missing breadboard',()=>{
 const diagram=placeFirstParts(MISSIONS.circuit.starter.diagram);diagram.parts.find(p=>p.id==='led1').rot=180;
 assert.equal(firstCircuitChecks(diagram)[0],false);
 assert.equal(placeFirstParts({parts:[],wires:[]}),null);assert.deepEqual(firstCircuitChecks({parts:[],wires:[]}),[false,false,false,false]);
});
test('short-circuit highlight follows the real breadboard route and excludes unrelated branches',()=>{
 const diagram=resolveDiagram({parts:base,wires:[{a:'esp:3V3',b:'bb:tp2'},{a:'bb:tp3',b:'esp:GND.L'},{a:'esp:D22',b:'bb:j22'}]});
 const sim=new Simulator(diagram,code);sim.start();sim.runFor(10);
 const warning=sim.warnings.find(w=>w.vars.src==='3V3');assert.ok(warning);
 const target=warningTargets(diagram,warning);assert.deepEqual(target.wires,[0,1]);assert.ok(target.pins.includes('esp:3V3'));assert.ok(target.pins.includes('esp:GND.L'));assert.ok(!target.pins.includes('esp:D22'));
});
test('short-circuit highlight chooses a direct short before a longer route',()=>{
 const diagram=resolveDiagram({parts:base,wires:[{a:'esp:3V3',b:'bb:tp2'},{a:'bb:tp3',b:'esp:GND.L'},{a:'esp:3V3',b:'esp:GND.R'}]});
 assert.deepEqual(warningTargets(diagram,{vars:{src:'3V3'}}).wires,[2]);
});
test('missing-resistor warning identifies the LED and both of its connected wires',()=>{
 const diagram=resolveDiagram({parts:[...base,{id:'led1',type:'led',x:400,y:230}],wires:[{a:'esp:3V3',b:'led1:A'},{a:'led1:C',b:'esp:GND.R'},{a:'esp:D22',b:'bb:j22'}]});
 const sim=new Simulator(diagram,code);sim.start();sim.runFor(10);
 const target=warningTargets(diagram,sim.warnings.find(w=>w.vars.part==='led1'));
 assert.deepEqual(target.parts,['led1']);assert.deepEqual(target.wires,[0,1]);assert.ok(target.pins.includes('led1:A')&&target.pins.includes('led1:C'));
});
test('unsupported GPIO and serial-only warnings never highlight unrelated hardware',()=>{
 const diagram=resolveDiagram({parts:base,wires:[]});
 for(const warning of [{vars:{pin:999}},{vars:{}},{vars:{part:'missing'}}])assert.deepEqual(warningTargets(diagram,warning),{pins:[],parts:[],wires:[]});
});
