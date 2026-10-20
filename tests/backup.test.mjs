import test from 'node:test';
import assert from 'node:assert/strict';
import {MISSIONS} from '../dist/missions.mjs';
import {validateWork,validateProject,validateBackup,mergeBackup,persistEntries} from '../dist/backup.mjs';
const clone=v=>structuredClone(v);
const work=()=>clone(MISSIONS.blink.solution);
const project=()=>({id:'p1',name:'Blink',...work()});
const empty=()=>({progress:{version:1,completed:[],dates:[]},work:{},projects:{current:null,list:[]}});
const backup=()=>({format:'pin-by-pin-backup',version:1,...empty(),work:{blink:work()},projects:{current:'p1',list:[project()]}});
test('every authored mission starter and solution is portable',()=>{
 for(const m of Object.values(MISSIONS))for(const state of [m.starter,m.solution])assert.doesNotThrow(()=>validateWork(state),m.id);
});
test('project imports validate versions, endpoints, IDs, coordinates and attributes',()=>{
 const good={format:'pin-by-pin-project',version:1,...project()};assert.equal(validateProject(good).code,good.code);
 const mutations=[
  v=>{v.version=2;},v=>{v.diagram.parts[0].type='unknown';},v=>{v.diagram.parts[0].type=['esp32'];},
  v=>{v.diagram.parts[0].id='"><img src=x>';},v=>{v.diagram.parts[0].x=null;},
  v=>{v.diagram.parts[0].rot=45;},v=>{v.diagram.parts.push(clone(v.diagram.parts[0]));},
  v=>{v.diagram.wires[0].a='missing:D23';},v=>{v.diagram.wires[0].b='esp:missing';},
  v=>{v.diagram.wires[0].color='" onload="alert(1)';},
  v=>{v.diagram.parts.find(p=>p.type==='resistor').attrs.ohms=-1;},
  v=>{v.diagram.wires[0].pts=[[null,0]];},v=>{v.code='x'.repeat(100001);}
 ];
 for(const mutate of mutations){const bad=clone(good);mutate(bad);assert.throws(()=>validateProject(bad));}
});
test('invalid backups fail as a whole before any data is merged',()=>{
 assert.equal(validateBackup(backup()).projects.list.length,1);
 for(const mutate of [v=>{v.work.noSuchLesson=work();},v=>{v.projects.current='missing';},v=>{v.projects.list.push(project());},v=>{v.work.blink.diagram.parts[0].type='__proto__';}]){
  const bad=backup(),current=empty();mutate(bad);assert.throws(()=>mergeBackup(current,bad));assert.deepEqual(current,empty());
 }
});
test('backup merge keeps current drafts, preserves colliding projects, and is repeatable',()=>{
 const current={...empty(),progress:{version:1,completed:['hello'],dates:['2026-10-20']},work:{blink:{...work(),code:'// current'}},projects:{current:'p1',list:[{...project(),code:'// current project'}]}};
 const incoming=backup();incoming.progress={version:1,completed:['serial','hello'],dates:['2026-10-19']};
 const result=mergeBackup(current,incoming);
 assert.deepEqual(result.progress.completed,['hello','serial']);assert.equal(result.work.blink.code,'// current');
 assert.equal(result.projects.list.length,2);assert.notEqual(result.projects.list[0].id,result.projects.list[1].id);
 assert.equal(result.projects.list[1].code,incoming.projects.list[0].code);assert.equal(result.projects.current,'p1');
 assert.deepEqual(mergeBackup(result,incoming),result);assert.equal(current.projects.list.length,1);
});
test('empty backup round trips and progress filters unknown lesson IDs',()=>{
 const b={format:'pin-by-pin-backup',version:1,...empty()};b.progress.completed=['hello','not-a-lesson'];
 assert.deepEqual(validateBackup(b).progress.completed,['hello']);
 assert.deepEqual(mergeBackup(empty(),b).projects,{current:null,list:[]});
});
test('quota failure rolls earlier writes back and leaves the saved copy intact',()=>{
 const values=new Map([['work','old-work'],['progress','old-progress']]);let writes=0;
 const storage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{if(++writes===3)throw Error('quota');values.set(k,v);},removeItem:k=>values.delete(k)};
 assert.throws(()=>persistEntries(storage,[['work',{}],['projects',{}],['progress',{}]]),/quota/);
 assert.deepEqual([...values],[['work','old-work'],['progress','old-progress']]);
 persistEntries(storage,[['progress',{version:1}]]);assert.equal(values.get('progress'),'{"version":1}');
});

test('rollback frees space before restoring larger original values',()=>{
 const values=new Map([['work','x'.repeat(30)],['projects','x'.repeat(5)],['progress','x'.repeat(5)]]);
 const before=[...values];
 const storage={getItem:k=>values.get(k)??null,removeItem:k=>values.delete(k),setItem:(k,v)=>{
  const size=[...values].reduce((sum,[key,text])=>sum+(key===k?0:text.length),0)+v.length;
  if(size>45)throw Error('quota');values.set(k,v);
 }};
 assert.throws(()=>persistEntries(storage,[['work','x'.repeat(8)],['projects','x'.repeat(23)],['progress','x'.repeat(20)]]));
 assert.deepEqual([...values],before);
});
