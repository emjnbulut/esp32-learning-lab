// Portable learner data. Validate everything before touching browser storage.
import {PARTS,LED_COLORS} from './sim/circuit.mjs';
import {sanitizeProgress} from './model.mjs';
import {MISSIONS} from './missions.mjs';
export const MAX_FILE_BYTES=10*1024*1024;
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const own=(o,k)=>Object.hasOwn(o,k);
const need=ok=>{if(!ok)throw new Error('Invalid learner data');};
const coordinate=v=>Number.isFinite(v)&&Math.abs(v)<=1e6;
const identifier=v=>typeof v==='string'&&/^[A-Za-z_][\w-]{0,79}$/.test(v);
export function validateWork(value){
 need(record(value)&&typeof value.code==='string'&&value.code.length<=100000);
 const d=value.diagram;
 need(record(d)&&Array.isArray(d.parts)&&d.parts.length<=200&&Array.isArray(d.wires)&&d.wires.length<=1000);
 const ids=new Set(),pins=new Set();
 const parts=d.parts.map(p=>{
  need(record(p)&&identifier(p.id)&&!ids.has(p.id)&&typeof p.type==='string'&&own(PARTS,p.type));
  need(coordinate(p.x)&&coordinate(p.y)&&[0,90,180,270].includes(p.rot??0));
  ids.add(p.id);for(const [pin] of PARTS[p.type].pins)pins.add(p.id+':'+pin);
  need(p.attrs===undefined||record(p.attrs));
  const a=p.attrs||{},attrs={...(PARTS[p.type].attrs||{})};
  if(own(a,'color')){need(typeof a.color==='string'&&own(LED_COLORS,a.color));attrs.color=a.color;}
  if(own(a,'ohms')){need(Number.isFinite(a.ohms)&&a.ohms>0&&a.ohms<=1e9);attrs.ohms=a.ohms;}
  if(own(a,'pos')){need(Number.isFinite(a.pos)&&a.pos>=0&&a.pos<=1);attrs.pos=a.pos;}
  if(own(a,'bounce')){need(typeof a.bounce==='boolean');attrs.bounce=a.bounce;}
  if(own(a,'kind')){need(['active','passive'].includes(a.kind));attrs.kind=a.kind;}
  if(own(a,'common')){need(['anode','cathode'].includes(a.common));attrs.common=a.common;}
  if(own(a,'light')){need(Number.isFinite(a.light)&&a.light>=0&&a.light<=1);attrs.light=a.light;}
  if(own(a,'temp')){need(Number.isFinite(a.temp)&&a.temp>=-40&&a.temp<=125);attrs.temp=a.temp;}
  if(own(a,'hum')){need(Number.isFinite(a.hum)&&a.hum>=0&&a.hum<=100);attrs.hum=a.hum;}
  if(own(a,'motion')){need(typeof a.motion==='boolean');attrs.motion=a.motion;}
  if(own(a,'activeLow')){need(typeof a.activeLow==='boolean');attrs.activeLow=a.activeLow;}
  return {id:p.id,type:p.type,x:p.x,y:p.y,rot:p.rot??0,attrs};
 });
 const wires=d.wires.map(w=>{
  need(record(w)&&pins.has(w.a)&&pins.has(w.b)&&w.a!==w.b);
  need(w.color===undefined||typeof w.color==='string'&&/^#[0-9a-f]{6}$/i.test(w.color));
  need(w.pts===undefined||Array.isArray(w.pts)&&w.pts.length<=100&&w.pts.every(p=>Array.isArray(p)&&p.length===2&&p.every(coordinate)));
  return {a:w.a,b:w.b,...(w.color?{color:w.color}:{}),...(w.pts?{pts:w.pts.map(p=>[...p])}:{})};
 });
 return {code:value.code,diagram:{parts,wires}};
}
const nameOf=v=>{need(typeof v==='string'&&v.trim().length>0&&v.length<=60);return v.trim();};
export function validateProject(value){
 need(record(value)&&value.format==='pin-by-pin-project'&&value.version===1);
 return {name:nameOf(value.name),...validateWork(value)};
}
export function validateBackup(value){
 need(record(value)&&value.format==='pin-by-pin-backup'&&value.version===1);
 need(record(value.progress)&&value.progress.version===1&&Array.isArray(value.progress.completed)&&Array.isArray(value.progress.dates));
 need(record(value.work)&&Object.keys(value.work).length<=Object.keys(MISSIONS).length);
 const work={};
 for(const [id,w] of Object.entries(value.work)){need(own(MISSIONS,id));work[id]=validateWork(w);}
 need(record(value.projects)&&Array.isArray(value.projects.list)&&value.projects.list.length<=200);
 const ids=new Set();
 const list=value.projects.list.map(p=>{
  need(record(p)&&identifier(p.id)&&!ids.has(p.id));ids.add(p.id);
  return {id:p.id,name:nameOf(p.name),...validateWork(p)};
 });
 need(list.length===0?value.projects.current===null:ids.has(value.projects.current));
 return {format:'pin-by-pin-backup',version:1,progress:sanitizeProgress(value.progress),work,projects:{current:value.projects.current,list}};
}
export function mergeBackup(current,incoming){
 const backup=validateBackup(incoming);
 const progress=sanitizeProgress({completed:[...current.progress.completed,...backup.progress.completed],dates:[...current.progress.dates,...backup.progress.dates]});
 // Existing lesson drafts win; the source backup still holds the imported drafts.
 const work={...backup.work,...current.work};
 const list=[...current.projects.list],ids=new Set(list.map(p=>p.id));
 const signature=p=>JSON.stringify([p.name,p.code,p.diagram]);
 const signatures=new Set(list.map(p=>signature({...p,...validateWork(p)})));
 let sequence=0;
 for(const project of backup.projects.list){
  const key=signature(project);if(signatures.has(key))continue;
  let id=project.id;while(ids.has(id))id='restored'+(++sequence);
  list.push({...project,id});ids.add(id);signatures.add(key);
 }
 return {progress,work,projects:{current:current.projects.current||list[0]?.id||null,list}};
}
export function persistEntries(storage,entries){
 const previous=entries.map(([key])=>[key,storage.getItem(key)]);
 try{for(const [key,value] of entries)storage.setItem(key,JSON.stringify(value));}
 catch(error){
  for(const [key] of previous){try{storage.removeItem(key);}catch{}}
  for(const [key,value] of previous){if(value!==null){try{storage.setItem(key,value);}catch{}}}
  throw error;
 }
}
