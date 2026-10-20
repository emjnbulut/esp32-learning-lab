import test from 'node:test';
import assert from 'node:assert/strict';
import {DraftStore} from '../dist/draft-store.mjs';
const fixture=()=>{
 const values=new Map();let blocked=false;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(blocked)throw Error('quota');values.set(k,v);}};
 return {values,store:new DraftStore(()=>storage),block:v=>{blocked=v;}};
};
test('failed writes remain readable after navigation and never overwrite the last saved copy',()=>{
 const f=fixture();f.store.write('projects',{code:'old'});f.block(true);
 assert.equal(f.store.write('projects',{code:'latest'}),false);
 assert.equal(f.store.saved,false);assert.deepEqual(f.store.read('projects',{}),{code:'latest'});
 assert.equal(f.values.get('projects'),'{"code":"old"}');
 const read=f.store.read('projects',{});read.code='accidental mutation';
 assert.equal(f.store.read('projects',{}).code,'latest','reads return independent snapshots');
});
test('retry persists the latest snapshots for all pending keys and clears the warning',()=>{
 const f=fixture();f.block(true);
 f.store.write('work',{code:'first'});f.store.write('work',{code:'newest'});f.store.write('progress',{completed:['hello']});
 assert.equal(f.store.retry(),false);assert.equal(f.store.pending.size,2);
 f.block(false);assert.equal(f.store.retry(),true);assert.equal(f.store.hasPending,false);
 assert.equal(JSON.parse(f.values.get('work')).code,'newest');
 assert.deepEqual(JSON.parse(f.values.get('progress')).completed,['hello']);
});
test('partial retry keeps unsaved keys pending and successful writes do not hide another failure',()=>{
 const values=new Map();let blocked='work';
 const store=new DraftStore(()=>({getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(k===blocked)throw Error('quota');values.set(k,v);}}));
 store.write('work',{code:'draft'});store.write('projects',{code:'saved'});assert.equal(store.saved,false);
 assert.equal(store.retry(),false);assert.equal(store.pending.size,1);blocked=null;
 assert.equal(store.retry(),true);
});
test('read denial falls back safely and a successful restore clears pending copies',()=>{
 const store=new DraftStore(()=>{throw Error('denied');});assert.deepEqual(store.read('work',{}),{});assert.equal(store.saved,false);
 store.write('work',{code:'draft'});store.acknowledge(['work']);assert.equal(store.hasPending,false);
});
test('clean reads see changes made by another tab rather than a stale cache',()=>{
 const f=fixture();f.values.set('work','{"code":"from another tab"}');
 assert.equal(f.store.read('work',{}).code,'from another tab');
 f.values.set('work','{"code":"newer"}');assert.equal(f.store.read('work',{}).code,'newer');
});

test('missing, null and malformed saved values fall back without breaking project mounting',()=>{
 const f=fixture();assert.deepEqual(f.store.read('work',{}),{});
 f.values.set('work','null');assert.deepEqual(f.store.read('work',{}),{});
 f.values.set('work','{');assert.deepEqual(f.store.read('work',{}),{});assert.equal(f.store.saved,false);
});
