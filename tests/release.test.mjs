import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {PUBLIC_RELEASED} from '../dist/releases.mjs';
// The public site: only the units whose videos are out. Change this list (and this test) when a video is published.
test('public release list',()=>assert.deepEqual(PUBLIC_RELEASED,[1,2]));
test('with the public list, closed units cannot be opened, unlocked by a checkpoint, or reached by nextLesson',()=>{const env={...process.env};delete env.RELEASE_ALL;
 const code=`import('./dist/model.mjs').then(m=>{const done=m.lessons.filter(l=>l.unit<=2).map(l=>l.id);let p={completed:[],dates:[]};for(const id of done)p=m.complete(p,id,'2026-10-19');
 const out={open3:m.canOpen('blink',p),unit3:m.unitOpen(3,p),next:m.nextLesson(p)?.id??null,completed:p.completed.length,released:m.RELEASED_UNITS,hello:m.canOpen('hello',{completed:[],dates:[]}),
  cp:m.canOpen('check3',{completed:['check2'],dates:[]})};console.log(JSON.stringify(out));})`;
 const r=spawnSync(process.execPath,['-e',code],{env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);const o=JSON.parse(r.stdout);
 assert.deepEqual(o.released,[1,2]);assert.equal(o.open3,false);assert.equal(o.unit3,false);assert.equal(o.next,null);assert.equal(o.hello,true);assert.equal(o.cp,false);assert.ok(o.completed>=10);});
