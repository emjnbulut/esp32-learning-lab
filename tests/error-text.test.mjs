import test from 'node:test';import assert from 'node:assert/strict';
import {compile,CodeError} from '../dist/sim/arduino.mjs';
import {Simulator} from '../dist/sim/runtime.mjs';
import {MISSIONS} from '../dist/missions.mjs';
import {explainError} from '../dist/error-text.mjs';
import {TR} from '../dist/i18n.mjs';
const tr=s=>TR[s]||s;
function compileError(code){try{compile(code);}catch(e){assert.ok(e instanceof CodeError);return e;}assert.fail('Expected a compiler error');}
test('real compiler errors have Turkish explanations and retain the original English and source line',()=>{
 const cases=[
 ['void setup(){\n Serial.begin(115200)\n}\nvoid loop(){}',2,/Noktalı virgül/],
 ['void setup(){\n pinMode(LEDPIN, OUTPUT);\n}\nvoid loop(){}',2,/"LEDPIN" tanımlanmamış/],
 ['void setup(){\n digitalWrite(23);\n}\nvoid loop(){}',2,/digitalWrite\(\).*2.*1/],
 ['const int P=2;\nvoid setup(){ P=3; }\nvoid loop(){}',2,/"P" const/],
 ['void setup(){}',1,/void loop\(\) \{ \}/],
 ['void setup(){\n if(true){\n}\nvoid loop(){}',4,/"loop\(\)".*eksik "}"/],
 ['void setup(){\n Serial.println("Count: " + 5);\n}\nvoid loop(){}',2,/String\("…"\)/],
 ['void setup(){\n Serial.unknown();\n}\nvoid loop(){}',2,/Serial.unknown\(\).*yok/],
 ['void setup(){\n String s="a"; s.missing();\n}\nvoid loop(){}',2,/String.*"missing".*yok/],
 ['void setup(){\n int *p;\n}\nvoid loop(){}',2,/işaretçiler.*desteklenmiyor/]
 ];
 for(const [code,line,re] of cases){const e=compileError(code),original=e.message;const translated=explainError(e.message,tr);
  assert.match(translated.text,re,original);assert.equal(translated.details,null);assert.equal(e.line,line);
  assert.equal(e.message,original);assert.deepEqual(explainError(e.message),{text:original,details:null});
 }
});
test('runtime errors explain array bounds, division by zero and simulator limits in Turkish',()=>{
 const cases=[
 ['int a[3];\nvoid setup(){\n a[3]=1;\n}\nvoid loop(){}',3,/3 indeksi "a".*0 ile 2/],
 ['void setup(){ int z=0;\n Serial.println(5/z);\n}\nvoid loop(){}',2,/Sıfıra bölme/],
 ['void setup(){ int z=0;\n Serial.println(5%z);\n}\nvoid loop(){}',2,/Sıfıra göre kalan/],
 ['void setup(){\n int a[10001];\n}\nvoid loop(){}',2,/1 ile 10000.*10001/],
 ];
 for(const [code,line,re] of cases){const sim=new Simulator(MISSIONS.hello.starter.diagram,code);assert.equal(sim.start(),null,code);sim.runFor(20);
  assert.equal(sim.status,'error',code);assert.match(explainError(sim.error.message,tr).text,re,sim.error.message);
  if(line)assert.equal(sim.error.line,line);assert.equal(explainError(sim.error.message).text,sim.error.message);
 }
});
test('argument ranges and unfamiliar messages preserve technical information',()=>{
 assert.match(explainError('Serial.println() takes 0–2 arguments, not 3',tr).text,/0–2.*3/);
 const original='Simulator error: Unexpected <token> {name}',translated=explainError(original,tr);
 assert.match(translated.text,/teknik/);assert.equal(translated.details,original);
 assert.deepEqual(explainError(original),{text:original,details:null});
 assert.match(explainError('Expected "}" before "{expected}"',tr).text,/"{expected}" öncesinde "}"/);
});
