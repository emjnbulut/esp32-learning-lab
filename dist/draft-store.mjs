// Retain failed browser writes in this tab so navigation cannot discard the latest draft.
export class DraftStore{
 constructor(storage){this.storage=storage;this.pending=new Map();this.available=true;this.onChange=()=>{};}
 get hasPending(){return this.pending.size>0;}
 get saved(){return this.available&&!this.hasPending;}
 read(key,fallback){
  try{const raw=this.pending.has(key)?this.pending.get(key):this.storage().getItem(key);return raw===null?fallback:JSON.parse(raw)??fallback;}
  catch{this.available=false;this.onChange();return fallback;}
 }
 write(key,value){
  const raw=JSON.stringify(value);this.pending.set(key,raw);
  try{this.storage().setItem(key,raw);this.pending.delete(key);this.available=true;}
  catch{this.available=false;}
  this.onChange();return !this.pending.has(key);
 }
 retry(){
  let failed=false;
  for(const [key,raw] of this.pending){
   try{this.storage().setItem(key,raw);this.pending.delete(key);}
   catch{failed=true;}
  }
  if(!failed&&!this.hasPending)this.available=true;
  this.onChange();return this.saved;
 }
 acknowledge(keys){for(const key of keys)this.pending.delete(key);this.available=true;this.onChange();}
}
