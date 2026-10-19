import test from 'node:test';import assert from 'node:assert/strict';
import {MISSIONS,checkGoals} from '../dist/missions.mjs';import {Simulator} from '../dist/sim/runtime.mjs';import {compile} from '../dist/sim/arduino.mjs';
// Run a mission's code + diagram with its scripted inputs, checking goals at the scripted moments and at the end.
function play(m,{code,diagram}){const s=new Simulator(JSON.parse(JSON.stringify(diagram)),code);const err=s.start();assert.equal(err,null,err&&`${err.line}: ${err.message}`);
 const sc=m.script||{ms:1000};const marks=[...(sc.ticks||[]),sc.ms].sort((a,b)=>a-b);let at=0;
 for(const t of marks){s.runFor(t-at,(sc.actions||[]).filter(a=>a.at>=at&&a.at<t).map(a=>({...a,at:a.at})));at=t;checkGoals(m,s);}
 return {s,res:checkGoals(m,s)};}
for(const [id,m] of Object.entries(MISSIONS)){
 test(`mission ${id}: the solution passes every goal`,()=>{const {s,res}=play(m,m.solution);assert.deepEqual(res.map((ok,i)=>ok?true:m.goals[i].text),res.map(()=>true),s.out.slice(-200)+' '+JSON.stringify(s.warnings));});
 test(`mission ${id}: the starter compiles and does not already pass`,()=>{compile(m.starter.code);if(m.expectStarterFails||m.starter.code!==m.solution.code){const {res}=play(m,m.starter);assert.ok(res.some(x=>!x),'starter passes all goals');}});
}
