import test from 'node:test';import assert from 'node:assert/strict';
import {lessons,units,sanitizeProgress,nextLesson,canOpen,complete,totalXP,unitOpen,grade} from '../dist/model.mjs';
import {MISSIONS} from '../dist/missions.mjs';
const all=(p,ids)=>ids.reduce((q,id)=>complete(q,id,'2026-10-19'),p);
test('every available unit is hands-on first: it starts with a project and has more projects than quizzes',()=>{for(const u of units.filter(x=>x.available)){const ls=lessons.filter(l=>l.unit===u.id);assert.equal(ls[0].type,'mission',`unit ${u.id}`);const m=ls.filter(l=>l.type==='mission').length,q=ls.filter(l=>l.type==='quiz').length;assert.ok(m>=q,`unit ${u.id}: ${m} projects, ${q} quizzes`);assert.equal(ls[ls.length-1].type,'checkpoint');}});
test('every mission lesson has mission content and unique ids',()=>{assert.equal(new Set(lessons.map(l=>l.id)).size,lessons.length);for(const l of lessons.filter(x=>x.type==='mission'))assert.ok(MISSIONS[l.id],l.id);for(const id of Object.keys(MISSIONS))assert.ok(lessons.some(l=>l.id===id),id);});
test('progress validates ids and deduplicates XP',()=>{const p=sanitizeProgress({completed:['hello','hello','nope'],dates:['2026-10-19','bad']});assert.deepEqual(p.completed,['hello']);assert.deepEqual(p.dates,['2026-10-19']);});
test('lessons open in order inside a unit; the next unit opens after the regular lessons',()=>{let p=sanitizeProgress({});assert.equal(canOpen('hello',p),true);assert.equal(canOpen('serial',p),false);assert.equal(canOpen('circuit',p),false);
 p=all(p,['hello','serial','counter']);assert.equal(unitOpen(2,p),true);assert.equal(nextLesson(p).id,'check1');assert.equal(canOpen('circuit',p),true);});
test('a passed checkpoint opens its whole unit and the next unit, without XP for skipped lessons',()=>{let p=sanitizeProgress({});assert.equal(canOpen('check1',p),true);p=complete(p,'check1','2026-10-19');
 assert.equal(canOpen('counter',p),true);assert.equal(canOpen('circuit',p),true);assert.equal(canOpen('fix',p),false);assert.equal(nextLesson(p).id,'circuit');assert.equal(totalXP(p),50);});
test('completing everything in order is possible and counts XP once',()=>{let p=sanitizeProgress({});for(const l of lessons){assert.equal(canOpen(l.id,p),true,l.id);p=complete(p,l.id,'2026-10-19');}
 assert.equal(totalXP(p),lessons.reduce((n,l)=>n+l.xp,0));assert.equal(nextLesson(p),undefined);assert.equal(totalXP(complete(p,'hello','2026-10-20')),totalXP(p));});
test('checkpoint grading accepts tolerance and decimal commas',()=>{const ans=id=>Object.fromEntries(lessons.find(l=>l.id===id).questions.map((q,i)=>[i,q.choices?q.answer:String(q.answer)]));
 for(const l of lessons.filter(x=>x.type==='checkpoint'))assert.ok(grade(l.questions,ans(l.id)).every(Boolean),l.id);const q=lessons.find(l=>l.id==='check5').questions;assert.equal(grade(q,{4:'0,83'})[4],true);assert.equal(grade(q,{4:'0,9'})[4],false);assert.equal(grade(q,{0:''})[0],false);});
