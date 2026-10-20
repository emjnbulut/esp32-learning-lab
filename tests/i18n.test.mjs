import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {DIAGNOSTIC_KEYS} from '../dist/error-text.mjs';
import {lessons,units} from '../dist/model.mjs';import {MISSIONS} from '../dist/missions.mjs';import {TR,TR_LESSONS,TR_UNITS,TR_MISSIONS} from '../dist/i18n.mjs';
const read=f=>fs.readFileSync(new URL('../dist/'+f,import.meta.url),'utf8');
const app=read('app.mjs'),lab=read('lab.mjs'),runtime=read('sim/runtime.mjs');
const holes=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort().join();
const keysIn=src=>[...src.matchAll(/\bt\('((?:[^'\\]|\\.)*)'/g)].map(m=>m[1]);
// keys passed to t() indirectly (arrays, lookup tables) next to the literal t('...') calls
const indirect=['Learning path','Workshop','My notebook','Code','Circuit','Serial','s',...new Set(lessons.flatMap(l=>l.questions||[]).map(q=>q.unit).filter(u=>u==='s'))];
const partLabels=['ESP32 DevKit','Breadboard','LED','Resistor','Push button','Potentiometer','RGB LED','Buzzer','red','green','yellow','blue','white','orange','anode +','cathode −','common','signal'];
test('every English UI string has a Turkish translation with the same placeholders',()=>{const keys=new Set([...keysIn(app),...keysIn(lab),...keysIn(read('lab-help.mjs')),...keysIn(read('hardware-guide.mjs').replace(/\bp\(/g,'t(')),...indirect,...partLabels,...DIAGNOSTIC_KEYS]);const missing=[...keys].filter(k=>!TR[k]);assert.deepEqual(missing,[]);for(const k of keys)assert.equal(holes(TR[k]),holes(k),'placeholders: '+k);});
test('simulator warnings are templates with Turkish translations',()=>{const tpls=[...runtime.matchAll(/this\.warn\([^,]+,'([^']*)'/g)].map(m=>m[1]);assert.ok(tpls.length>=10);assert.doesNotMatch(runtime,/this\.warn\([^,]+,`/);const missing=tpls.filter(k=>!TR[k]);assert.deepEqual(missing,[]);for(const k of tpls)assert.equal(holes(TR[k]),holes(k),k);});
test('sketch comments in quizzes, checkpoints and missions are translatable',()=>{const codes=[...lessons.map(l=>l.code||''),...lessons.flatMap(l=>l.questions||[]).map(q=>q.code||''),...Object.values(MISSIONS).flatMap(m=>[m.starter.code,m.solution.code])];
 const missing=new Set();for(const code of codes)for(const [,c] of code.matchAll(/\/\/ (.*)$/gm))if(!TR[c.trim()]&&!TR[c])missing.add(c);assert.deepEqual([...missing],[]);});
test('every quiz, checkpoint and unit has Turkish content matching its shape',()=>{for(const l of lessons.filter(x=>x.type!=='mission')){const tr=TR_LESSONS[l.id];assert.ok(tr,l.id);for(const f of ['title','tag','intro','hint','question','explanation'])assert.equal(f in tr,f in l,l.id+'.'+f);if(l.choices)assert.equal(tr.choices.length,l.choices.length);if(l.questions){assert.equal(tr.questions.length,l.questions.length,l.id);l.questions.forEach((q,i)=>{const tq=tr.questions[i];assert.ok(tq.q&&tq.explain,l.id+' q'+i);assert.equal(tq.choices?.length,q.choices?.length,l.id+' q'+i+' choices');});}}
 for(const u of units)assert.ok(TR_UNITS[u.id]?.title&&TR_UNITS[u.id]?.subtitle,'unit '+u.id);});
test('every mission has Turkish text with the same number of steps, hints and goals',()=>{for(const [id,m] of Object.entries(MISSIONS)){const tr=TR_MISSIONS[id];assert.ok(tr,id);assert.ok(tr.title&&tr.intro,id);for(const f of ['steps','hints'])assert.equal(tr[f]?.length,m[f].length,id+'.'+f);assert.equal(tr.goals?.length,m.goals.length,id+'.goals');
 for(const f of ['steps','hints','goals'])tr[f].forEach((s,i)=>{const en=f==='goals'?m.goals[i].text:m[f][i];assert.equal((s.match(/`/g)||[]).length,(en.match(/`/g)||[]).length,`${id}.${f}[${i}] code marks`);});}});
test('the source language of model and mission content is English',()=>{assert.doesNotMatch(read('model.mjs'),/[ğışĞİŞ]/);assert.doesNotMatch(read('missions.mjs'),/[ğışĞİŞ]/);});
