// A subset of Arduino C/C++ for the browser: tokenizer, parser, a resolve pass that reports
// compiler-style errors, and a generator-based interpreter. Time is virtual: every statement
// costs STMT_US microseconds, delay() moves the clock forward, and the machine yields to the
// host whenever host.clock reaches host.deadline.
export class CodeError extends Error{constructor(message,line=0,col=0){super(message);this.line=line;this.col=col;}}
export const STMT_US=5;

const ty=(kind,bits,signed,name,extra={})=>({kind,bits,signed,name,...extra});
export const TYPES={
 void:ty('void',0,true,'void'),bool:ty('bool',8,false,'bool'),char:ty('int',8,true,'char',{char:true}),u8:ty('int',8,false,'byte'),
 i16:ty('int',16,true,'short'),u16:ty('int',16,false,'unsigned short'),i32:ty('int',32,true,'int'),u32:ty('int',32,false,'unsigned long'),
 i64:ty('int',64,true,'long long'),u64:ty('int',64,false,'unsigned long long'),float:ty('float',64,true,'float'),double:ty('float',64,true,'double'),
 string:ty('string',0,true,'String'),cstr:ty('cstr',0,true,'const char*')
};
const TYPE_WORDS=new Set(['void','int','long','short','char','float','double','bool','boolean','byte','word','String','uint8_t','int8_t','uint16_t','int16_t','uint32_t','int32_t','uint64_t','int64_t','size_t','unsigned','signed','const','static','volatile','IRAM_ATTR']);
const PUNCT=['<<=','>>=','...','++','--','+=','-=','*=','/=','%=','&=','|=','^=','<<','>>','<=','>=','==','!=','&&','||','->','::','?',':',';',',','.','(',')','[',']','{','}','+','-','*','/','%','&','|','^','!','~','<','>','='];

// ---------- tokenizer ----------
export function tokenize(src){
 const out=[],defines=new Map();let i=0,line=1,col=1;
 const adv=n=>{for(let k=0;k<n;k++){if(src[i]==='\n'){line++;col=1;}else col++;i++;}};
 while(i<src.length){
  const ch=src[i],l=line,c=col;
  if(ch==='\n'||ch===' '||ch==='\t'||ch==='\r'){adv(1);continue;}
  if(src.startsWith('//',i)){while(i<src.length&&src[i]!=='\n')adv(1);continue;}
  if(src.startsWith('/*',i)){const e=src.indexOf('*/',i+2);if(e<0)throw new CodeError('Comment /* is never closed with */',l,c);adv(e+2-i);continue;}
  if(ch==='#'){let e=src.indexOf('\n',i);if(e<0)e=src.length;const text=src.slice(i,e);
   const def=text.match(/^#\s*define\s+([A-Za-z_]\w*)(\(?)\s*(.*)$/);
   if(def){if(def[2])throw new CodeError('Macros with parameters are not supported; use a function instead',l,c);defines.set(def[1],tokenize(def[3].replace(/\/\/.*$/,'')).filter(t=>t.type!=='eof').map(t=>({...t,line:l,col:c})));}
   else if(!/^#\s*(include|pragma|ifndef|ifdef|endif|if|else|elif|undef)\b/.test(text))throw new CodeError('Unknown preprocessor line: '+text.trim(),l,c);
   adv(e-i);continue;}
  const num=src.slice(i).match(/^(0[xX][0-9a-fA-F]+|0[bB][01]+|(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?)([uUlLfF]*)/);
  if(num&&/[\d.]/.test(ch)&&!(ch==='.'&&!/\d/.test(src[i+1]))){const s=num[1];let v,isF=false;
   if(/^0[xX]/.test(s))v=parseInt(s.slice(2),16);else if(/^0[bB]/.test(s))v=parseInt(s.slice(2),2);else{v=Number(s);isF=/[.eE]/.test(s)||/[fF]/.test(num[2]);}
   out.push({type:'num',value:v,float:isF,unsigned:/[uU]/.test(num[2]),line:l,col:c});adv(num[0].length);continue;}
  if(ch==='"'||ch==="'"){let j=i+1,s='';
   while(j<src.length&&src[j]!==ch){if(src[j]==='\n')throw new CodeError('Text is not closed with '+ch,l,c);
    if(src[j]==='\\'){const e=src[j+1];j+=2;if(e==='x'){const h=src.slice(j).match(/^[0-9a-fA-F]{1,2}/)?.[0]||'0';s+=String.fromCharCode(parseInt(h,16));j+=h.length;}else s+={n:'\n',t:'\t',r:'\r','0':'\0','\\':'\\','"':'"',"'":"'"}[e]??e;}
    else s+=src[j++];}
   if(j>=src.length)throw new CodeError('Text is not closed with '+ch,l,c);
   if(ch==="'"){if(s.length!==1)throw new CodeError("A char literal holds one character: use double quotes for text",l,c);out.push({type:'char',value:s.charCodeAt(0),line:l,col:c});}
   else{const prev=out[out.length-1];if(prev?.type==='str')prev.value+=s;else out.push({type:'str',value:s,line:l,col:c});}
   adv(j+1-i);continue;}
  const id=src.slice(i).match(/^[A-Za-z_]\w*/);
  if(id){const w=id[0];adv(w.length);if(defines.has(w)){for(const t of defines.get(w))out.push({...t,line:l,col:c});continue;}out.push({type:'id',value:w,line:l,col:c});continue;}
  const p=PUNCT.find(q=>src.startsWith(q,i));
  if(!p)throw new CodeError(`Unexpected character "${ch}"`,l,c);
  out.push({type:'p',value:p,line:l,col:c});adv(p.length);
 }
 out.push({type:'eof',value:'end of code',line,col});return out;
}

// ---------- parser ----------
const BIN_PREC={'||':1,'&&':2,'|':3,'^':4,'&':5,'==':6,'!=':6,'<':7,'>':7,'<=':7,'>=':7,'<<':8,'>>':8,'+':9,'-':9,'*':10,'/':10,'%':10};
const ASSIGN=new Set(['=','+=','-=','*=','/=','%=','&=','|=','^=','<<=','>>=']);
export function parse(src){
 const toks=tokenize(src);let p=0;
 const peek=(o=0)=>toks[p+o],next=()=>toks[p++];
 const is=(v,o=0)=>{const t=toks[p+o];return t.type!=='str'&&t.type!=='char'&&t.value===v;};
 const err=(msg,t=peek())=>new CodeError(msg,t.line,t.col);
 const expect=v=>{if(!is(v)){const prev=toks[p-1]||peek();if(v===';')throw new CodeError(`Expected ";" at the end of this line`,prev.line,prev.col+String(prev.value).length);throw err(`Expected "${v}" before "${peek().value}"`);}return next();};
 const isTypeStart=(o=0)=>{const t=peek(o);return t.type==='id'&&TYPE_WORDS.has(t.value);};
 function parseType(){const words=[];let isConst=false;
  while(peek().type==='id'&&TYPE_WORDS.has(peek().value)){const w=next().value;if(w==='const')isConst=true;else if(w!=='static'&&w!=='volatile'&&w!=='IRAM_ATTR')words.push(w);}
  if(is('*')){const t=next();if(words.includes('char')){return {...TYPES.cstr,isConst};}throw new CodeError('Pointers are not supported in this simulator',t.line,t.col);}
  const s=words.join(' ');
  const map={'':null,int:TYPES.i32,'signed int':TYPES.i32,signed:TYPES.i32,long:TYPES.i32,'long int':TYPES.i32,'signed long':TYPES.i32,'unsigned':TYPES.u32,'unsigned int':TYPES.u32,'unsigned long':TYPES.u32,'unsigned long int':TYPES.u32,
   'long long':TYPES.i64,'unsigned long long':TYPES.u64,short:TYPES.i16,'short int':TYPES.i16,'unsigned short':TYPES.u16,char:TYPES.char,'signed char':TYPES.char,'unsigned char':TYPES.u8,byte:TYPES.u8,uint8_t:TYPES.u8,int8_t:TYPES.char,
   word:TYPES.u16,uint16_t:TYPES.u16,int16_t:TYPES.i16,uint32_t:TYPES.u32,int32_t:TYPES.i32,size_t:TYPES.u32,uint64_t:TYPES.u64,int64_t:TYPES.i64,float:TYPES.float,double:TYPES.double,'long double':TYPES.double,bool:TYPES.bool,boolean:TYPES.bool,void:TYPES.void,String:TYPES.string};
  const t=map[s];if(!t)throw err(s?`Unknown type "${s}"`:'Expected a type');return {...t,isConst};}
 function primary(){const t=next();
  if(t.type==='num')return {k:'num',v:t.value,float:t.float,unsigned:t.unsigned,line:t.line,col:t.col};
  if(t.type==='str')return {k:'str',v:t.value,line:t.line,col:t.col};
  if(t.type==='char')return {k:'char',v:t.value,line:t.line,col:t.col};
  if(t.type==='id'){if(t.value==='true'||t.value==='false')return {k:'num',v:t.value==='true'?1:0,bool:true,line:t.line,col:t.col};
   if(t.value==='sizeof'){expect('(');let arg;if(isTypeStart()){arg={type:parseType()};}else arg={e:expr()};expect(')');return {k:'sizeof',...arg,line:t.line,col:t.col};}
   if(TYPE_WORDS.has(t.value)&&is('(')){p--;const type=parseType();expect('(');const args=argList();return {k:'cast',type,a:args[0],args,line:t.line,col:t.col};}
   return {k:'id',name:t.value,line:t.line,col:t.col};}
  if(t.type==='p'&&t.value==='('){if(isTypeStart()){const type=parseType();expect(')');return {k:'cast',type,a:unary(),line:t.line,col:t.col};}const e=expr();expect(')');return e;}
  if(t.type==='p'&&t.value==='{')throw new CodeError('A {…} list can only be used to fill an array when it is declared',t.line,t.col);
  throw new CodeError(t.type==='eof'?'The code ends too early: is a "}" or ")" missing?':`Unexpected "${t.value}"`,t.line,t.col);}
 function argList(){const args=[];if(!is(')')){do args.push(assign());while(is(',')&&next());}expect(')');return args;}
 function postfix(){let e=primary();
  for(;;){const t=peek();
   if(is('(')){next();if(e.k!=='id'&&e.k!=='member')throw new CodeError('Only functions can be called',t.line,t.col);e={k:'call',f:e,args:argList(),line:e.line,col:e.col};}
   else if(is('[')){next();const i=expr();expect(']');e={k:'index',a:e,i,line:t.line,col:t.col};}
   else if(is('.')||is('->')){next();const m=next();if(m.type!=='id')throw err('Expected a name after "."',m);e={k:'member',obj:e,prop:m.value,line:m.line,col:m.col};}
   else if(is('++')||is('--')){next();e={k:'post',op:t.value,a:e,line:t.line,col:t.col};}
   else if(is('::'))throw err('"::" is not supported in this simulator');
   else return e;}}
 function unary(){const t=peek();
  if(t.type==='p'&&['!','~','-','+'].includes(t.value)){next();return {k:'un',op:t.value,a:unary(),line:t.line,col:t.col};}
  if(t.type==='p'&&(t.value==='++'||t.value==='--')){next();return {k:'pre',op:t.value,a:unary(),line:t.line,col:t.col};}
  if(t.type==='p'&&(t.value==='&'||t.value==='*'))throw err('Pointers and addresses (& and *) are not supported in this simulator');
  return postfix();}
 function binary(min){let a=unary();
  for(;;){const t=peek(),pr=t.type==='p'?BIN_PREC[t.value]:undefined;if(!pr||pr<min)return a;next();
   const b=binary(pr+1);a={k:t.value==='&&'||t.value==='||'?'log':'bin',op:t.value,a,b,line:t.line,col:t.col};}}
 function ternary(){const c=binary(1);if(!is('?'))return c;const t=next();const a=assign();expect(':');const b=assign();return {k:'cond',c,a,b,line:t.line,col:t.col};}
 function assign(){const left=ternary();const t=peek();
  if(t.type==='p'&&ASSIGN.has(t.value)){next();if(!['id','index','member'].includes(left.k))throw new CodeError('Only variables can be assigned',t.line,t.col);return {k:'assign',op:t.value,target:left,value:assign(),line:t.line,col:t.col};}
  return left;}
 function expr(){let e=assign();while(is(',')){const t=next();e={k:'comma',a:e,b:assign(),line:t.line,col:t.col};}return e;}
 function initializer(){if(is('{')){const t=next();const items=[];if(!is('}')){do{if(is('}'))break;items.push(assign());}while(is(',')&&next());}expect('}');return {k:'list',items,line:t.line,col:t.col};}return assign();}
 function declRest(type,first){const items=[];let name=first;
  for(;;){const d={name:name.value,line:name.line,col:name.col,type};
   if(is('[')){next();d.size=is(']')?null:expr();expect(']');if(is('['))throw err('Arrays with more than one dimension are not supported yet');}
   if(is('=')){next();d.init=initializer();}
   else if(is('(')&&type.kind==='string'){next();const args=argList();d.init={k:'cast',type:TYPES.string,a:args[0],args,line:name.line,col:name.col};}
   items.push(d);if(!is(','))break;next();name=next();if(name.type!=='id')throw err('Expected a variable name',name);}
  expect(';');return {k:'decl',items,line:first.line,col:first.col};}
 function statement(){const t=peek();
  if(is('{'))return block();
  if(is(';')){next();return {k:'empty'};}
  if(t.type==='id'){
   switch(t.value){
    case 'if':{next();expect('(');const c=expr();expect(')');const a=statement();let b=null;if(is('else')){next();b=statement();}return {k:'if',c,a,b,line:t.line,col:t.col};}
    case 'while':{next();expect('(');const c=expr();expect(')');return {k:'while',c,body:statement(),line:t.line,col:t.col};}
    case 'do':{next();const body=statement();if(!is('while'))throw err('Expected "while" after the do { } block');next();expect('(');const c=expr();expect(')');expect(';');return {k:'dowhile',c,body,line:t.line,col:t.col};}
    case 'for':{next();expect('(');let init=null;if(is(';'))next();else if(isTypeStart()){const type=parseType();init=declRest(type,next());}else{init={k:'expr',e:expr(),line:t.line,col:t.col};expect(';');}
     const c=is(';')?null:expr();expect(';');const step=is(')')?null:expr();expect(')');return {k:'for',init,c,step,body:statement(),line:t.line,col:t.col};}
    case 'return':{next();const e=is(';')?null:expr();expect(';');return {k:'ret',e,line:t.line,col:t.col};}
    case 'break':next();expect(';');return {k:'brk',line:t.line,col:t.col};
    case 'continue':next();expect(';');return {k:'cont',line:t.line,col:t.col};
    case 'switch':{next();expect('(');const e=expr();expect(')');expect('{');const cases=[];
     while(!is('}')){if(is('case')){next();const test=ternary();expect(':');cases.push({test,body:[]});}else if(is('default')){next();expect(':');cases.push({test:null,body:[]});}
      else{if(!cases.length)throw err('Expected "case" inside switch');cases[cases.length-1].body.push(statement());}}
     next();return {k:'switch',e,cases,line:t.line,col:t.col};}
    case 'else':throw err('"else" without a matching "if" (check the braces before it)');
   }
   if(isTypeStart()){const type=parseType();const name=next();if(name.type!=='id')throw err('Expected a variable name',name);if(is('('))throw new CodeError(`"${name.value}()" starts inside another function. Is a "}" missing above it?`,name.line,name.col);return declRest(type,name);}
  }
  const e=expr();expect(';');return {k:'expr',e,line:t.line,col:t.col};}
 function block(){const t=expect('{');const body=[];while(!is('}')){if(peek().type==='eof')throw new CodeError('A "{" is never closed: add a "}"',t.line,t.col);body.push(statement());}next();return {k:'block',body,line:t.line,col:t.col};}
 const globals=[],funcs=new Map(),devices=[];
 const DEVICE_CLASSES=new Set(['DHT','Adafruit_SSD1306','WebServer']);
 while(peek().type!=='eof'){
  if(is(';')){next();continue;}
  if(peek().value==='struct'||peek().value==='class')throw err('struct and class are not supported yet');
  if(peek().type==='id'&&DEVICE_CLASSES.has(peek().value)){
   const cls=next().value,name=next();if(name.type!=='id')throw err('Expected a name',name);
   const args=[];if(is('(')){next();if(!is(')')){do{if(is('&')&&peek(1).value==='Wire'){const t=next();next();args.push({k:'wire',line:t.line,col:t.col});}else args.push(assign());}while(is(',')&&next());}expect(')');}
   expect(';');devices.push({k:'device',cls,name:name.value,args,line:name.line,col:name.col});continue;
  }
  if(!isTypeStart())throw err(`Expected a declaration or a function here, not "${peek().value}"`);
  const type=parseType();const name=next();if(name.type!=='id')throw err('Expected a name',name);
  if(is('(')){next();const params=[];
   if(!is(')')){do{if(is('void')&&is(')',1)){next();break;}const pt=parseType();if(is('&'))throw err('Reference parameters (&) are not supported yet');const pn=next();if(pn.type!=='id')throw err('Expected a parameter name',pn);const prm={name:pn.value,type:pt,line:pn.line,col:pn.col};if(is('[')){next();expect(']');prm.array=true;}params.push(prm);}while(is(',')&&next());}
   expect(')');
   if(is(';')){next();continue;}
   if(funcs.has(name.value))throw new CodeError(`The function "${name.value}" is defined twice`,name.line,name.col);
   funcs.set(name.value,{name:name.value,type,params,body:block(),line:name.line,col:name.col});}
  else globals.push(declRest(type,name));
 }
 return {globals,funcs,devices};
}

// ---------- builtins (signatures for the resolve pass; implementations call the host) ----------
const I=TYPES.i32,U=TYPES.u32,F=TYPES.float,V=TYPES.void,B=TYPES.bool,S=TYPES.string;
export const CONSTANTS={HIGH:[1,I],LOW:[0,I],INPUT:[1,I],OUTPUT:[3,I],INPUT_PULLUP:[5,I],INPUT_PULLDOWN:[9,I],LED_BUILTIN:[2,I],PI:[Math.PI,F],HALF_PI:[Math.PI/2,F],TWO_PI:[Math.PI*2,F],DEG_TO_RAD:[Math.PI/180,F],RAD_TO_DEG:[180/Math.PI,F],
 DEC:[10,I],HEX:[16,I],OCT:[8,I],BIN:[2,I],CHANGE:[3,I],RISING:[1,I],FALLING:[2,I],A0:[36,I],A3:[39,I],A4:[32,I],A5:[33,I],A6:[34,I],A7:[35,I],A10:[4,I],A13:[15,I],A14:[13,I],A15:[12,I],A16:[14,I],A17:[27,I],A18:[25,I],A19:[26,I],
 DHT11:[11,I],DHT22:[22,I],SSD1306_SWITCHCAPVCC:[2,I],WHITE:[1,I],BLACK:[0,I],SSD1306_WHITE:[1,I],SSD1306_BLACK:[0,I],WL_CONNECTED:[3,I],WL_IDLE_STATUS:[0,I],WL_DISCONNECTED:[6,I],WIFI_STA:[1,I],NAN:[NaN,F]};
const num=x=>Number(x);
const arith=(a,b)=>a.kind==='float'||b.kind==='float'?F:a.bits===64||b.bits===64?(a.signed&&b.signed?TYPES.i64:TYPES.u64):(a.bits===32&&!a.signed)||(b.bits===32&&!b.signed)?U:I;
export const BUILTINS={
 pinMode:{n:[2,2],r:V,run:(h,a)=>h.pinMode(a[0],a[1])},digitalWrite:{n:[2,2],r:V,run:(h,a)=>h.digitalWrite(a[0],a[1])},digitalRead:{n:[1,1],r:I,run:(h,a)=>h.digitalRead(a[0])},
 analogWrite:{n:[2,2],r:V,run:(h,a)=>h.analogWrite(a[0],a[1])},analogRead:{n:[1,1],r:I,run:(h,a)=>h.analogRead(a[0])},analogReadResolution:{n:[1,1],r:V,run:(h,a)=>h.analogReadResolution?.(a[0])},analogWriteResolution:{n:[1,2],r:V,run:(h,a)=>h.analogWriteResolution?.(a[0],a[1])},
 ledcAttach:{n:[3,3],r:B,run:(h,a)=>h.ledcAttach(a[0],a[1],a[2])},ledcWrite:{n:[2,2],r:B,run:(h,a)=>h.ledcWrite(a[0],a[1])},
 tone:{n:[2,3],r:V,run:(h,a)=>h.tone(a[0],a[1],a[2])},noTone:{n:[1,1],r:V,run:(h,a)=>h.noTone(a[0])},
 delay:{n:[1,1],r:V,wait:a=>Math.max(0,num(a[0]))*1000},delayMicroseconds:{n:[1,1],r:V,wait:a=>Math.max(0,num(a[0]))},
 millis:{n:[0,0],r:U,run:h=>Math.floor(h.clock/1000)>>>0},micros:{n:[0,0],r:U,run:h=>Math.floor(h.clock)>>>0},yield:{n:[0,0],r:V,run:()=>{}},
 map:{n:[5,5],r:I,run:(h,a)=>{const [x,il,ih,ol,oh]=a.map(Math.trunc);if(ih===il)return ol;return Math.trunc((x-il)*(oh-ol)/(ih-il))+ol;}},
 constrain:{n:[3,3],r:'arith',run:(h,a)=>Math.min(Math.max(a[0],a[1]),a[2])},min:{n:[2,2],r:'arith',run:(h,a)=>Math.min(a[0],a[1])},max:{n:[2,2],r:'arith',run:(h,a)=>Math.max(a[0],a[1])},abs:{n:[1,1],r:'arith',run:(h,a)=>Math.abs(a[0])},
 random:{n:[1,2],r:I,run:(h,a)=>{const lo=a.length>1?Math.trunc(a[0]):0,hi=Math.trunc(a.length>1?a[1]:a[0]);return hi<=lo?lo:lo+Math.floor(h.random()*(hi-lo));}},randomSeed:{n:[1,1],r:V,run:(h,a)=>h.randomSeed?.(a[0])},
 sqrt:{n:[1,1],r:F,run:(h,a)=>Math.sqrt(a[0])},pow:{n:[2,2],r:F,run:(h,a)=>Math.pow(a[0],a[1])},sin:{n:[1,1],r:F,run:(h,a)=>Math.sin(a[0])},cos:{n:[1,1],r:F,run:(h,a)=>Math.cos(a[0])},tan:{n:[1,1],r:F,run:(h,a)=>Math.tan(a[0])},
 round:{n:[1,1],r:F,run:(h,a)=>Math.round(a[0])},floor:{n:[1,1],r:F,run:(h,a)=>Math.floor(a[0])},ceil:{n:[1,1],r:F,run:(h,a)=>Math.ceil(a[0])},fabs:{n:[1,1],r:F,run:(h,a)=>Math.abs(a[0])},sq:{n:[1,1],r:'arith',run:(h,a)=>a[0]*a[0]},
 isnan:{n:[1,1],r:B,run:(h,a)=>Number.isNaN(Number(a[0]))?1:0},
 isDigit:{n:[1,1],r:B,run:(h,a)=>/\d/.test(String.fromCharCode(a[0]))?1:0},isAlpha:{n:[1,1],r:B,run:(h,a)=>/[A-Za-z]/.test(String.fromCharCode(a[0]))?1:0},
 bitRead:{n:[2,2],r:I,run:(h,a)=>(a[0]>>a[1])&1},bit:{n:[1,1],r:U,run:(h,a)=>(1<<a[0])>>>0},
 attachInterrupt:{n:[3,3],r:V,fnArg:1,run:(h,a)=>h.attachInterrupt(a[0],a[1],a[2])},detachInterrupt:{n:[1,1],r:V,run:(h,a)=>h.detachInterrupt(a[0])},digitalPinToInterrupt:{n:[1,1],r:I,run:(h,a)=>a[0]},
 interrupts:{n:[0,0],r:V,run:()=>{}},noInterrupts:{n:[0,0],r:V,run:()=>{}}
};
const SERIAL_METHODS={begin:{n:[1,4],r:V},print:{n:[1,2],r:I},println:{n:[0,2],r:I},printf:{n:[1,20],r:I},write:{n:[1,1],r:I},available:{n:[0,0],r:I},read:{n:[0,0],r:I},peek:{n:[0,0],r:I},flush:{n:[0,0],r:V},
 readString:{n:[0,0],r:S},readStringUntil:{n:[1,1],r:S},parseInt:{n:[0,0],r:I},parseFloat:{n:[0,0],r:F},setTimeout:{n:[1,1],r:V},end:{n:[0,0],r:V}};
const DHT_METHODS={begin:{n:[0,0],r:V},readTemperature:{n:[0,1],r:F},readHumidity:{n:[0,0],r:F}};
const WIRE_METHODS={begin:{n:[0,2],r:B}};
const DISPLAY_METHODS={begin:{n:[0,2],r:B},clearDisplay:{n:[0,0],r:V},display:{n:[0,0],r:V},setTextSize:{n:[1,2],r:V},setTextColor:{n:[1,2],r:V},setCursor:{n:[2,2],r:V},
 print:{n:[1,2],r:I},println:{n:[0,2],r:I},printf:{n:[1,20],r:I},drawPixel:{n:[3,3],r:V},drawLine:{n:[5,5],r:V},drawRect:{n:[5,5],r:V},fillRect:{n:[5,5],r:V},invertDisplay:{n:[1,1],r:V}};
const WIFI_METHODS={mode:{n:[1,1],r:B},begin:{n:[1,2],r:I},status:{n:[0,0],r:I},localIP:{n:[0,0],r:S},RSSI:{n:[0,1],r:I},scanNetworks:{n:[0,0],r:I},SSID:{n:[0,1],r:S},disconnect:{n:[0,1],r:B}};
const SERVER_METHODS={on:{n:[2,2],r:V,fnArg:1},begin:{n:[0,1],r:V},handleClient:{n:[0,0],r:V},send:{n:[3,3],r:V},uri:{n:[0,0],r:S}};
const STRING_METHODS={length:{n:[0,0],r:U},toInt:{n:[0,0],r:I},toFloat:{n:[0,0],r:F},indexOf:{n:[1,2],r:I},lastIndexOf:{n:[1,1],r:I},substring:{n:[1,2],r:S},charAt:{n:[1,1],r:TYPES.char},equals:{n:[1,1],r:B},equalsIgnoreCase:{n:[1,1],r:B},
 startsWith:{n:[1,1],r:B},endsWith:{n:[1,1],r:B},concat:{n:[1,1],r:B},trim:{n:[0,0],r:V,mut:true},toUpperCase:{n:[0,0],r:V,mut:true},toLowerCase:{n:[0,0],r:V,mut:true},replace:{n:[2,2],r:V,mut:true},isEmpty:{n:[0,0],r:B},c_str:{n:[0,0],r:TYPES.cstr}};
const OBJECTS={Serial:SERIAL_METHODS,Serial2:SERIAL_METHODS,dht:DHT_METHODS,Wire:WIRE_METHODS,display:DISPLAY_METHODS,WiFi:WIFI_METHODS,server:SERVER_METHODS};

// ---------- resolve: scopes, slots, static types, compiler-style errors ----------
const zero=t=>t.kind==='string'||t.kind==='cstr'?'':0;
export function compile(src){
 const prog=parse(src);const funcs=prog.funcs;const gslots=[];const globalScope=new Map();
 const isNum=t=>t.kind==='int'||t.kind==='float'||t.kind==='bool';
 const errAt=(n,m)=>new CodeError(m,n.line,n.col);
 let ctx;
 function declare(scope,d,where){if(scope.has(d.name))throw new CodeError(`"${d.name}" is declared twice in the same place`,d.line,d.col);
  const v={name:d.name,t:d.type,array:d.size!==undefined||d.array,where,slot:where==='g'?gslots.length:ctx.nSlots++,isConst:d.type.isConst};if(where==='g')gslots.push(v);scope.set(d.name,v);return v;}
 function lookup(scopes,name){for(let i=scopes.length-1;i>=0;i--){const v=scopes[i].get(name);if(v)return v;}return globalScope.get(name);}
 function typeOfLiteral(n){if(n.k==='str')return TYPES.cstr;if(n.k==='char')return TYPES.char;if(n.bool)return TYPES.bool;if(n.float)return TYPES.double;return n.unsigned?U:(n.v>2147483647?TYPES.i64:I);}
 function ex(n,sc){
  switch(n.k){
   case 'num':case 'str':case 'char':return n.t=typeOfLiteral(n);
   case 'id':{if(CONSTANTS[n.name]&&!lookup(sc,n.name)){n.k='num';n.v=CONSTANTS[n.name][0];return n.t=CONSTANTS[n.name][1];}
    const v=lookup(sc,n.name);if(!v){if(funcs.has(n.name)||BUILTINS[n.name])throw errAt(n,`"${n.name}" is a function: call it with ( )`);if(OBJECTS[n.name])throw errAt(n,`Use ${n.name} with a function, for example ${n.name}.println(...)`);throw errAt(n,`"${n.name}" was not declared. Check the spelling (upper/lower case matters) or declare it first.`);}
    n.v=v;n.where=v.where;n.slot=v.slot;n.array=v.array;return n.t=v.t;}
   case 'sizeof':{if(n.type){n.k='num';n.v=Math.max(1,(n.type.bits||32)/8);return n.t=U;}const t=ex(n.e,sc);n.elem=Math.max(1,(t.bits||32)/8);return n.t=U;}
   case 'cast':{for(const a of n.args||[n.a])ex(a,sc);return n.t=n.type;}
   case 'un':{const t=ex(n.a,sc);if(n.op==='!')return n.t=B;if(!isNum(t))throw errAt(n,`"${n.op}" needs a number`);return n.t=t.kind==='float'?t:(t.bits===32&&!t.signed?U:t.bits===64?t:I);}
   case 'pre':case 'post':{const t=ex(n.a,sc);lvalue(n.a);if(!isNum(t))throw errAt(n,`"${n.op}" needs a number variable`);return n.t=t;}
   case 'log':ex(n.a,sc);ex(n.b,sc);return n.t=B;
   case 'bin':{const a=ex(n.a,sc),b=ex(n.b,sc);
    if(['==','!=','<','>','<=','>='].includes(n.op)){if((a.kind==='cstr'&&b.kind==='cstr'))throw errAt(n,'Two text literals cannot be compared; use String');return n.t=B;}
    if(n.op==='+'&&(a.kind==='string'||b.kind==='string'))return n.t=S;
    if(a.kind==='cstr'||b.kind==='cstr')throw errAt(n,n.op==='+'?'Text in quotes cannot be joined with "+" here. Print the parts one after another, or start with String("…") + value.':`"${n.op}" does not work with text`);
    if(a.kind==='string'||b.kind==='string')throw errAt(n,`"${n.op}" does not work with String`);
    if(['%','&','|','^','<<','>>'].includes(n.op)&&(a.kind==='float'||b.kind==='float'))throw errAt(n,`"${n.op}" needs whole numbers, not float`);
    return n.t=['<<','>>'].includes(n.op)?(a.bits===32&&!a.signed?U:I):arith(a,b);}
   case 'cond':ex(n.c,sc);{const a=ex(n.a,sc),b=ex(n.b,sc);return n.t=a.kind==='string'||b.kind==='string'?S:a.kind==='cstr'?a:isNum(a)&&isNum(b)?arith(a,b):a;}
   case 'assign':{const t=ex(n.target,sc);lvalue(n.target);const v=ex(n.value,sc);
    if(n.target.k==='id'&&n.target.v.isConst)throw errAt(n,`"${n.target.name}" is const and cannot be changed`);
    if(n.value.k==='list')throw errAt(n,'A {…} list can only fill an array when it is declared');
    if(t.kind==='string'&&!['=','+='].includes(n.op))throw errAt(n,`"${n.op}" does not work with String`);
    if(isNum(t)&&(v.kind==='cstr'||v.kind==='string'))throw errAt(n,`Text cannot be stored in the number variable "${n.target.name||''}"`);
    return n.t=t;}
   case 'index':{const t=ex(n.a,sc);ex(n.i,sc);if(t.kind==='string'||t.kind==='cstr')return n.t=TYPES.char;if(!(n.a.k==='id'&&n.a.array))throw errAt(n,'Only arrays can be indexed with [ ]');return n.t=t;}
   case 'comma':ex(n.a,sc);return n.t=ex(n.b,sc);
   case 'list':for(const x of n.items)ex(x,sc);return n.t=V;
   case 'member':throw errAt(n,'Use a member with a call, for example Serial.println()');
   case 'call':return n.t=call(n,sc);
  }
  throw errAt(n,'Unsupported expression');}
 function lvalue(n){if(n.k==='id'){if(n.array)throw new CodeError('A whole array cannot be assigned; assign one element: name[i] = …',n.line,n.col);return;}if(n.k==='index')return;throw new CodeError('Only variables can be changed',n.line,n.col);}
 function checkArgs(n,spec,name){const c=n.args.length;if(c<spec.n[0]||c>spec.n[1])throw new CodeError(`${name}() takes ${spec.n[0]===spec.n[1]?spec.n[0]:spec.n[0]+'–'+spec.n[1]} argument${spec.n[1]===1?'':'s'}, not ${c}`,n.line,n.col);}
 function call(n,sc){
  if(n.f.k==='member'){const obj=n.f.obj;
   if(obj.k==='id'&&OBJECTS[obj.name]&&!lookup(sc,obj.name)){const spec=OBJECTS[obj.name][n.f.prop];if(!spec)throw new CodeError(`${obj.name}.${n.f.prop}() does not exist`,n.f.line,n.f.col);checkArgs(n,spec,obj.name+'.'+n.f.prop);
    n.args.forEach((a,i)=>{if(spec.fnArg===i){if(a.k!=='id'||!funcs.has(a.name))throw new CodeError('Pass the name of one of your functions here',a.line,a.col);a.k='fnref';a.fn=funcs.get(a.name);a.t=V;}else ex(a,sc);});
    n.kind='serial';n.port=obj.name;n.method=n.f.prop;return spec.r;}
   const t=ex(obj,sc);if(t.kind!=='string')throw new CodeError(`"${n.f.prop}" can only be used on a String`,n.f.line,n.f.col);
   const spec=STRING_METHODS[n.f.prop];if(!spec)throw new CodeError(`String has no function "${n.f.prop}"`,n.f.line,n.f.col);checkArgs(n,spec,n.f.prop);if(spec.mut)lvalue(obj);n.args.forEach(a=>ex(a,sc));n.kind='string';n.method=n.f.prop;return spec.r;}
  const name=n.f.name;const user=funcs.get(name);
  if(user){if(n.args.length!==user.params.length)throw new CodeError(`${name}() takes ${user.params.length} argument${user.params.length===1?'':'s'}, not ${n.args.length}`,n.line,n.col);n.args.forEach(a=>ex(a,sc));n.kind='user';n.fn=user;return user.type;}
  const b=BUILTINS[name];
  if(!b){if(lookup(sc,name))throw new CodeError(`"${name}" is a variable, not a function`,n.line,n.col);throw new CodeError(`"${name}" was not declared. Check the spelling, or write the function first.`,n.line,n.col);}
  checkArgs(n,b,name);
  n.args.forEach((a,i)=>{if(b.fnArg===i){if(a.k!=='id'||!funcs.has(a.name))throw new CodeError('Pass the name of one of your functions here',a.line,a.col);a.k='fnref';a.fn=funcs.get(a.name);a.t=V;}else ex(a,sc);});
  n.kind='builtin';n.b=b;return b.r==='arith'?n.args.slice(1).reduce((t,a)=>arith(t,a.t),n.args[0].t):b.r;}
 function st(s,sc,inLoop,fn){
  switch(s.k){
   case 'block':{const scopes=[...sc,new Map()];for(const x of s.body)st(x,scopes,inLoop,fn);return;}
   case 'decl':for(const d of s.items){if(d.type.kind==='void')throw new CodeError('A variable cannot be void',d.line,d.col);if(d.size)ex(d.size,sc);if(d.init){ex(d.init,sc);if(d.init.k==='list'&&d.size===undefined)throw new CodeError(`Add [ ] after "${d.name}" to make it an array`,d.line,d.col);}
    if(d.size===null&&!(d.init&&d.init.k==='list'))throw new CodeError(`The array "${d.name}" needs a size or a {…} list`,d.line,d.col);const v=declare(sc[sc.length-1],d,'l');d.v=v;d.slot=v.slot;}return;
   case 'expr':ex(s.e,sc);return;
   case 'if':ex(s.c,sc);st(s.a,[...sc,new Map()],inLoop,fn);if(s.b)st(s.b,[...sc,new Map()],inLoop,fn);return;
   case 'while':case 'dowhile':ex(s.c,sc);st(s.body,[...sc,new Map()],true,fn);return;
   case 'for':{const scopes=[...sc,new Map()];if(s.init)st(s.init,scopes,inLoop,fn);if(s.c)ex(s.c,scopes);if(s.step)ex(s.step,scopes);st(s.body,[...scopes,new Map()],true,fn);return;}
   case 'ret':if(s.e){ex(s.e,sc);if(fn.type.kind==='void')throw new CodeError(`${fn.name}() is void and cannot return a value`,s.line,s.col);}return;
   case 'brk':if(!inLoop)throw new CodeError('"break" can only be used inside a loop or switch',s.line,s.col);return;
   case 'cont':if(!inLoop||inLoop==='switch')throw new CodeError('"continue" can only be used inside a loop',s.line,s.col);return;
   case 'switch':ex(s.e,sc);for(const c of s.cases){if(c.test)ex(c.test,sc);const scopes=[...sc,new Map()];for(const x of c.body)st(x,scopes,inLoop||'switch',fn);}return;
   case 'empty':return;
  }}
 ctx={nSlots:0};
 for(const g of prog.globals)for(const d of g.items){if(d.size)ex(d.size,[]);if(d.init)ex(d.init,[]);const v=declare(globalScope,d,'g');d.v=v;d.slot=v.slot;if(funcs.has(d.name))throw new CodeError(`"${d.name}" is used for a variable and a function`,d.line,d.col);}
 for(const d of prog.devices||[])for(const a of d.args)if(a.k!=='wire')ex(a,[]);
 for(const fn of funcs.values()){ctx={nSlots:0};const scope=new Map();for(const prm of fn.params){const v=declare(scope,{...prm,size:prm.array?null:undefined},'l');prm.slot=v.slot;}
  st(fn.body,[scope],false,fn);fn.nSlots=ctx.nSlots;}
 if(!funcs.has('setup'))throw new CodeError('Every sketch needs a "void setup() { }" function',1,1);
 if(!funcs.has('loop'))throw new CodeError('Every sketch needs a "void loop() { }" function',1,1);
 return {globals:prog.globals,devices:prog.devices||[],funcs,nGlobals:gslots.length,globalVars:gslots.map(v=>({name:v.name,slot:v.slot,type:v.t.name,array:v.array,isConst:v.isConst}))};
}

// ---------- formatting helpers (Arduino Print semantics) ----------
export function fmtValue(v,t,arg){
 if(t.kind==='string'||t.kind==='cstr')return String(v);
 if(t.kind==='float'){const d=arg===undefined?2:arg;if(!Number.isFinite(v))return Number.isNaN(v)?'nan':v>0?'inf':'-inf';return v.toFixed(d);}
 if(t.char&&arg===undefined)return String.fromCharCode(v&255);
 if(arg===16||arg===8||arg===2){let n=Number(v);if(n<0)n=t.bits===8?n&255:t.bits===16?n&65535:n>>>0;return n.toString(arg).toUpperCase();}
 return String(v);
}
export function printf(fmt,args){let i=0;return fmt.replace(/%([-+ 0#]*)(\d*)(?:\.(\d+))?(?:hh|h|ll|l|z)?([diuxXcsfeEgp%])/g,(m,flags,width,prec,conv)=>{
 if(conv==='%')return '%';const a=args[i++];let s;
 switch(conv){case 'd':case 'i':s=String(Math.trunc(Number(a?.v??0)));break;case 'u':s=String(Math.trunc(Number(a?.v??0))>>>0);break;case 'x':s=(Math.trunc(Number(a?.v??0))>>>0).toString(16);break;case 'X':s=(Math.trunc(Number(a?.v??0))>>>0).toString(16).toUpperCase();break;
  case 'c':s=String.fromCharCode(Number(a?.v??0));break;case 's':s=String(a?.v??'');if(prec)s=s.slice(0,Number(prec));break;case 'e':case 'E':s=Number(a?.v??0).toExponential(prec===undefined?6:Number(prec));break;
  default:s=Number(a?.v??0).toFixed(prec===undefined?6:Number(prec));}
 if(flags.includes('+')&&/[dif]/.test(conv)&&Number(a?.v)>=0)s='+'+s;
 const w=Number(width||0);if(s.length<w)s=flags.includes('-')?s.padEnd(w):flags.includes('0')&&!/[sc]/.test(conv)?(s[0]==='-'?'-'+s.slice(1).padStart(w-1,'0'):s.padStart(w,'0')):s.padStart(w);return s;});}

// ---------- interpreter ----------
const BRK={sig:'brk'},CNT={sig:'cont'};
export function conv(v,t){
 switch(t.kind){
  case 'int':{if(typeof v==='string')v=parseInt(v,10)||0;let n=Math.trunc(Number(v));if(!Number.isFinite(n))n=0;
   if(t.bits===32)return t.signed?n|0:n>>>0;if(t.bits===8)return t.signed?(n<<24)>>24:n&255;if(t.bits===16)return t.signed?(n<<16)>>16:n&65535;return t.signed?n:Math.abs(n);}
  case 'bool':return (typeof v==='string'?v.length>0:Number(v)!==0)?1:0;
  case 'float':return typeof v==='string'?(parseFloat(v)||0):Number(v);
  case 'string':return typeof v==='string'?v:String(v);
  default:return v;}
}
function hasCall(n){if(!n||typeof n!=='object')return false;if(n.hc!==undefined)return n.hc;let r=n.k==='call';if(!r)for(const key of ['a','b','c','e','i','target','value','items','args','obj']){const x=n[key];if(Array.isArray(x)?x.some(hasCall):hasCall(x)){r=true;break;}}n.hc=r;return r;}
export class Machine{
 constructor(program,host){this.p=program;this.h=host;this.g=new Array(program.nGlobals).fill(0);this.depth=0;}
 err(n,m){return new CodeError(m,n.line,n.col);}
 *run(){
  for(const g of this.p.globals)yield* this.exec(g,this.g);
  for(const d of this.p.devices||[]){const args=[];for(const a of d.args)args.push(a.k==='wire'?0:yield* this.ev(a,this.g));this.h.initDevice?.(d.cls,d.name,args);}
  yield* this.callUser(this.p.funcs.get('setup'),[]);
  for(;;){if(this.h.pendingIsr?.length)yield* this.drainIsr();yield* this.callUser(this.p.funcs.get('loop'),[]);if((this.h.clock+=STMT_US)>=this.h.deadline)yield;}
 }
 *drainIsr(){if(this.inIsr)return;this.inIsr=true;try{while(this.h.pendingIsr?.length)yield* this.callFn(this.h.pendingIsr.shift());}finally{this.inIsr=false;}}
 *callUser(fn,args){if(++this.depth>200)throw this.err(fn,`Too many nested calls of ${fn.name}() (endless recursion?)`);
  const f=new Array(fn.nSlots).fill(0);fn.params.forEach((prm,i)=>{f[prm.slot]=prm.array?args[i]:conv(args[i],prm.type);});
  const r=yield* this.exec(fn.body,f);this.depth--;
  if(r&&r.sig==='ret')return fn.type.kind==='void'?undefined:conv(r.v,fn.type);
  return zero(fn.type);}
 *exec(s,f){const h=this.h;if(!this.inIsr&&h.pendingIsr?.length)yield* this.drainIsr();
  switch(s.k){
   case 'block':for(const x of s.body){const r=yield* this.exec(x,f);if(r)return r;}return;
   case 'decl':for(const d of s.items){const store=d.v.where==='g'?this.g:f;
     if(d.size!==undefined){const n=d.size?Math.trunc(yield* this.ev(d.size,f)):d.init.items.length;if(n<=0||n>10000)throw this.err(d,`The array size must be between 1 and 10000, not ${n}`);
      const arr=new Array(n).fill(zero(d.type));if(d.init){if(d.init.k!=='list'){if(d.type.char&&d.init.t.kind==='cstr'){}else throw this.err(d,'Fill an array with a {…} list');}
       else{if(d.init.items.length>n)throw this.err(d,`Too many values for "${d.name}[${n}]"`);for(let i=0;i<d.init.items.length;i++)arr[i]=conv(yield* this.ev(d.init.items[i],f),d.type);}}
      store[d.slot]=arr;}
     else store[d.slot]=d.init?this.store(yield* this.ev(d.init,f),d.init.t,d.type,d):zero(d.type);}
    if((h.clock+=STMT_US)>=h.deadline)yield;return;
   case 'expr':yield* this.ev(s.e,f);if((h.clock+=STMT_US)>=h.deadline)yield;return;
   case 'if':{const c=yield* this.ev(s.c,f);if((h.clock+=STMT_US)>=h.deadline)yield;if(this.truth(c))return yield* this.exec(s.a,f);if(s.b)return yield* this.exec(s.b,f);return;}
   case 'while':for(;;){const c=yield* this.ev(s.c,f);if((h.clock+=STMT_US)>=h.deadline)yield;if(!this.truth(c))return;const r=yield* this.exec(s.body,f);if(r===BRK)return;if(r&&r!==CNT)return r;}
   case 'dowhile':for(;;){const r=yield* this.exec(s.body,f);if(r===BRK)return;if(r&&r!==CNT)return r;const c=yield* this.ev(s.c,f);if((h.clock+=STMT_US)>=h.deadline)yield;if(!this.truth(c))return;}
   case 'for':{if(s.init)yield* this.exec(s.init,f);for(;;){if(s.c){const c=yield* this.ev(s.c,f);if(!this.truth(c))return;}if((h.clock+=STMT_US)>=h.deadline)yield;const r=yield* this.exec(s.body,f);if(r===BRK)return;if(r&&r!==CNT)return r;if(s.step)yield* this.ev(s.step,f);}}
   case 'ret':return {sig:'ret',v:s.e?yield* this.ev(s.e,f):undefined};
   case 'brk':return BRK;case 'cont':return CNT;
   case 'switch':{const v=yield* this.ev(s.e,f);
     let hit=s.cases.findIndex(c=>c.test!==null&&this.evs(c.test,f)===v);if(hit<0)hit=s.cases.findIndex(c=>c.test===null);if(hit<0)return;
     for(let i=hit;i<s.cases.length;i++)for(const x of s.cases[i].body){const r=yield* this.exec(x,f);if(r===BRK)return;if(r)return r;}return;}
   case 'empty':return;}}
 truth(v){return typeof v==='string'?v.length>0:Number(v)!==0;}
 store(v,from,to,n){if(to.kind==='string'&&typeof v!=='string')v=fmtValue(v,from);return conv(v,to);}
 get(n,f){return n.where==='g'?this.g[n.slot]:f[n.slot];}
 *ev(n,f){if(!hasCall(n))return this.evs(n,f);
  switch(n.k){
   case 'call':return yield* this.call(n,f);
   case 'assign':return this.assign(n,f,yield* this.ev(n.value,f));
   case 'bin':return this.bin(n,yield* this.ev(n.a,f),yield* this.ev(n.b,f));
   case 'log':{const a=this.truth(yield* this.ev(n.a,f));if(n.op==='&&'?!a:a)return a?1:0;return this.truth(yield* this.ev(n.b,f))?1:0;}
   case 'un':return this.un(n,yield* this.ev(n.a,f));
   case 'cond':return this.truth(yield* this.ev(n.c,f))?this.coerce(yield* this.ev(n.a,f),n.a.t,n.t):this.coerce(yield* this.ev(n.b,f),n.b.t,n.t);
   case 'cast':return this.cast(n,yield* this.ev(n.a,f),n.args?.[1]?yield* this.ev(n.args[1],f):undefined);
   case 'index':{const i=yield* this.ev(n.i,f);return this.idx(n,f,i);}
   case 'comma':yield* this.ev(n.a,f);return yield* this.ev(n.b,f);
   case 'pre':case 'post':{const i=n.a.k==='index'?yield* this.ev(n.a.i,f):undefined;return this.incdec(n,f,i);}
  }
  return this.evs(n,f);}
 evs(n,f){
  switch(n.k){
   case 'num':case 'char':return n.v;case 'str':return n.v;
   case 'id':return this.get(n,f);
   case 'bin':return this.bin(n,this.evs(n.a,f),this.evs(n.b,f));
   case 'log':{const a=this.truth(this.evs(n.a,f));if(n.op==='&&'?!a:a)return a?1:0;return this.truth(this.evs(n.b,f))?1:0;}
   case 'un':return this.un(n,this.evs(n.a,f));
   case 'cond':return this.truth(this.evs(n.c,f))?this.coerce(this.evs(n.a,f),n.a.t,n.t):this.coerce(this.evs(n.b,f),n.b.t,n.t);
   case 'assign':return this.assign(n,f,this.evs(n.value,f));
   case 'pre':case 'post':return this.incdec(n,f,n.a.k==='index'?this.evs(n.a.i,f):undefined);
   case 'index':return this.idx(n,f,this.evs(n.i,f));
   case 'cast':return this.cast(n,this.evs(n.a,f),n.args?.[1]?this.evs(n.args[1],f):undefined);
   case 'sizeof':{const v=this.evs(n.e,f);return Array.isArray(v)?v.length*n.elem:typeof v==='string'?v.length+1:n.elem;}
   case 'comma':this.evs(n.a,f);return this.evs(n.b,f);
  }
  throw this.err(n,'Unsupported expression');}
 coerce(v,from,to){if(to.kind==='string')return typeof v==='string'?v:fmtValue(v,from);return v;}
 cast(n,v,arg){if(n.type.kind==='string'){if(typeof v==='string')return v;if(arg!==undefined)return fmtValue(v,n.a.t,arg);return n.a.t.kind==='float'?fmtValue(v,n.a.t):fmtValue(v,n.a.t);}return conv(v,n.type);}
 idx(n,f,i){const a=n.a.k==='id'?this.get(n.a,f):this.evs(n.a,f);if(typeof a==='string'){return i>=0&&i<a.length?a.charCodeAt(i):0;}
  i=Math.trunc(i);if(i<0||i>=a.length)throw this.err(n,`Index ${i} is outside the array "${n.a.name}" (valid: 0 to ${a.length-1})`);return a[i];}
 set(target,f,v,i){if(target.k==='id'){if(target.where==='g')this.g[target.slot]=v;else f[target.slot]=v;return v;}
  const a=this.get(target.a,f);i=Math.trunc(i);if(typeof a==='string')throw this.err(target,'Change a String with its functions, not with [ ]');if(i<0||i>=a.length)throw this.err(target,`Index ${i} is outside the array "${target.a.name}" (valid: 0 to ${a.length-1})`);a[i]=v;return v;}
 assign(n,f,rhs){const t=n.target;const i=t.k==='index'?this.evs(t.i,f):undefined;
  let v=rhs;if(n.op!=='='){const cur=t.k==='index'?this.idx(t,f,i):this.get(t,f);v=n.op==='+='&&n.t.kind==='string'?cur+(typeof rhs==='string'?rhs:fmtValue(rhs,n.value.t)):this.binop(n.op.slice(0,-1),cur,rhs,n.t,t.t,n.value.t,n);}
  return this.set(t,f,this.store(v,n.value.t,n.t,n),i);}
 incdec(n,f,i){const t=n.a;const cur=t.k==='index'?this.idx(t,f,i):this.get(t,f);const v=conv(cur+(n.op==='++'?1:-1),n.t);this.set(t,f,v,i);return n.k==='pre'?v:cur;}
 un(n,a){switch(n.op){case '!':return this.truth(a)?0:1;case '-':return n.t.kind==='float'?-a:conv(-a,n.t);case '+':return a;case '~':return conv(~a,n.t);}}
 bin(n,a,b){if(n.t.kind==='bool')return this.cmp(n.op,a,b,n);if(n.t.kind==='string')return (typeof a==='string'?a:fmtValue(a,n.a.t))+(typeof b==='string'?b:fmtValue(b,n.b.t));return this.binop(n.op,a,b,n.t,n.a.t,n.b.t,n);}
 cmp(op,a,b){if(typeof a==='string'||typeof b==='string'){a=String(a);b=String(b);}switch(op){case '==':return a==b?1:0;case '!=':return a!=b?1:0;case '<':return a<b?1:0;case '>':return a>b?1:0;case '<=':return a<=b?1:0;case '>=':return a>=b?1:0;}}
 binop(op,a,b,t,ta,tb,n){a=Number(a);b=Number(b);const fl=t.kind==='float';
  if(t.kind==='int'&&t.bits===32&&!t.signed){a=a>>>0;b=b>>>0;}
  switch(op){
   case '+':return fl?a+b:conv(a+b,t);case '-':return fl?a-b:conv(a-b,t);
   case '*':return fl?a*b:t.bits===32?conv(t.signed?Math.imul(a,b):Number((BigInt(a>>>0)*BigInt(b>>>0))&0xffffffffn),t):conv(a*b,t);
   case '/':if(!fl&&b===0)throw this.err(n,'Division by zero: the ESP32 would crash here');return fl?a/b:conv(Math.trunc(a/b),t);
   case '%':if(b===0)throw this.err(n,'Division by zero (% 0): the ESP32 would crash here');return conv(a%b,t);
   case '&':return conv(a&b,t);case '|':return conv(a|b,t);case '^':return conv(a^b,t);
   case '<<':return conv(a<<b,t);case '>>':return conv(t.signed?a>>b:a>>>b,t);}
  throw this.err(n,'Unknown operator '+op);}
 *call(n,f){const h=this.h;
  if(n.kind==='user'){const args=[];for(const a of n.args)args.push(a.k==='id'&&a.array?this.get(a,f):yield* this.ev(a,f));return yield* this.callUser(n.fn,args);}
  const args=[];for(const a of n.args)args.push(a.k==='fnref'?a.fn:yield* this.ev(a,f));
  if(n.kind==='serial'){const result=h.serial(n.method,args,n.args.map(a=>a.t),this,n.port);const value=result&&typeof result.next==='function'?yield* result:result;return n.t.kind==='void'?undefined:conv(value,n.t);}
  if(n.kind==='string')return this.stringMethod(n,f,args);
  const b=n.b;
  if(b.wait){h.clock+=b.wait(args);if(h.clock>=h.deadline)yield;return;}
  const r=b.run(h,args,this);return r===undefined?undefined:(n.t.kind==='void'?undefined:conv(r,n.t));}
 *callFn(fn){return yield* this.callUser(fn,[]);}
 stringMethod(n,f,a){const obj=n.f.obj;const s=String(obj.k==='index'?'':this.evs(obj,f));
  const put=v=>{this.set(obj,f,v);};
  switch(n.method){
   case 'length':return s.length;case 'toInt':return parseInt(s,10)||0;case 'toFloat':return parseFloat(s)||0;case 'indexOf':return s.indexOf(typeof a[0]==='string'?a[0]:String.fromCharCode(a[0]),a[1]||0);
   case 'lastIndexOf':return s.lastIndexOf(typeof a[0]==='string'?a[0]:String.fromCharCode(a[0]));case 'substring':return s.substring(a[0],a[1]);case 'charAt':return s.charCodeAt(a[0])||0;
   case 'equals':return s===String(a[0])?1:0;case 'equalsIgnoreCase':return s.toLowerCase()===String(a[0]).toLowerCase()?1:0;case 'startsWith':return s.startsWith(a[0])?1:0;case 'endsWith':return s.endsWith(a[0])?1:0;
   case 'concat':put(s+(typeof a[0]==='string'?a[0]:fmtValue(a[0],n.args[0].t)));return 1;case 'trim':put(s.trim());return;case 'toUpperCase':put(s.toUpperCase());return;case 'toLowerCase':put(s.toLowerCase());return;
   case 'replace':put(s.split(String(typeof a[0]==='string'?a[0]:String.fromCharCode(a[0]))).join(typeof a[1]==='string'?a[1]:String.fromCharCode(a[1])));return;case 'isEmpty':return s.length?0:1;case 'c_str':return s;}}
}
