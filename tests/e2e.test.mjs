import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {chromium} from 'playwright';
import {MISSIONS} from '../dist/missions.mjs';
const PORT=4300+Math.floor(Math.random()*500),BASE=`http://127.0.0.1:${PORT}/`;
const KEY='pin-by-pin-progress-v1';
let server,browser;
test.before(async()=>{server=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:String(PORT),RELEASE_ALL:'1'},stdio:['ignore','pipe','inherit']});await new Promise(r=>server.stdout.once('data',r));browser=await chromium.launch();});
test.after(async()=>{await browser?.close();server?.kill();});
async function open(hash='',{completed=[],width=1440,height=900,lang}={}){
 const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('dialog',d=>d.type()==='prompt'?d.accept('Renamed'):d.accept());
 await context.addInitScript(([k,v,l])=>{if(!sessionStorage.getItem('seeded')){if(v)localStorage.setItem(k,v);if(l)localStorage.setItem('pin-by-pin-lang',l);sessionStorage.setItem('seeded','1');}},[KEY,completed.length?JSON.stringify({version:1,completed,dates:['2026-10-19']}):'',lang||'']);
 await page.goto(BASE+hash);page.errors=errors;return page;}
const U1=['hello','hello2','serial','counter','counter2','check1'],U2=['circuit','circuit2','rows','fix','resistor','check2'],U3=['blink','blink2','fast','polarity','pair','check3'],U4=['press','press2','pullup','toggle','toggle2','nowait','nowait2','millis','two','check4'];
const lab=page=>page.waitForFunction(()=>document.querySelector('#lab-root')?.__lab?.view);
const goalsOk=page=>page.$$eval('.goal.ok',e=>e.length);
async function dragPins(page,a,b){await page.click('[data-tool="wire"]');const [x1,y1]=await page.evaluate(k=>document.querySelector('#lab-root').__lab.pinScreen(k),a);const [x2,y2]=await page.evaluate(k=>document.querySelector('#lab-root').__lab.pinScreen(k),b);
 await page.mouse.move(x1,y1);await page.mouse.down();await page.mouse.move((x1+x2)/2,(y1+y2)/2,{steps:4});await page.mouse.move(x2,y2,{steps:4});await page.mouse.up();}
async function movePart(page,id,toKey){// drag a part by its body so that its anchor pin lands on a breadboard hole
 await page.click('[data-tool="select"]');const box=await page.locator(`#lab-svg [data-part="${id}"]`).boundingBox();const [ax,ay]=await page.evaluate(k=>{const l=document.querySelector('#lab-root').__lab;const p=l.diagram.parts.find(q=>q.id===k);return l.worldToScreen(p.x,p.y);},id);
 const [tx,ty]=await page.evaluate(k=>document.querySelector('#lab-root').__lab.pinScreen(k),toKey);const sx=box.x+box.width/2,sy=box.y+box.height/2;
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+(tx-ax)/2,sy+(ty-ay)/2,{steps:5});await page.mouse.move(sx+tx-ax,sy+ty-ay,{steps:5});await page.mouse.up();}

test('home: the path starts with a hands-on project and loads without errors',async()=>{const page=await open();await page.waitForSelector('.lesson-node');
 assert.match(await page.locator('.lesson-node').first().innerText(),/BUILD[\s\S]*Hello, ESP32!/);assert.equal(await page.locator('[data-lesson="serial"].lesson-node').isDisabled(),true);assert.deepEqual(page.errors,[]);await page.close();});

test('mission 1: type the code, run it, goals turn green, complete it',async()=>{const page=await open('#/lesson/hello');await lab(page);assert.equal(await goalsOk(page),0);
 await page.fill('#ed-text',MISSIONS.hello.solution.code);await page.click('#lab-run');await page.waitForFunction(()=>document.querySelectorAll('.goal.ok').length===3,null,{timeout:8000});
 assert.match(await page.locator('#lab-out').innerText(),/Hello, ESP32!/);await page.click('#mission-done');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/It works/);assert.deepEqual(page.errors,[]);await page.close();});

test('a compile error points at the line and does not run',async()=>{const page=await open('#/lesson/hello');await lab(page);await page.fill('#ed-text','void setup() {\n  Serial.begin(115200)\n}\nvoid loop() {}\n');await page.click('#lab-run');
 assert.match(await page.locator('#lab-error').innerText(),/Line 2[\s\S]*Expected ";"/);assert.equal(await page.locator('.ed-gutter b').innerText(),'2');assert.match(await page.locator('#lab-run').innerText(),/Run/);await page.close();});

test('mission circuit: rotate and place parts, drag wires from pin to pin, the LED lights',async()=>{const page=await open('#/lesson/circuit',{completed:U1});await lab(page);
 await movePart(page,'r1','bb:bp8');await page.click('#lab-svg [data-part="r1"]');await page.locator('#lab-svg').focus();for(let i=0;i<3;i++)await page.keyboard.press('r');
 await movePart(page,'led1','bb:f8');
 await dragPins(page,'esp:3V3','bb:bp2');await dragPins(page,'esp:GND.R','bb:bn3');await dragPins(page,'bb:j9','bb:bn9');
 const st=await page.evaluate(()=>{const l=document.querySelector('#lab-root').__lab;return {wires:l.diagram.wires.length,r1:l.diagram.parts.find(p=>p.id==='r1'),led:l.diagram.parts.find(p=>p.id==='led1')};});
 assert.equal(st.wires,3);assert.equal(st.r1.rot,270);
 await page.click('#lab-run');await page.waitForFunction(()=>document.querySelectorAll('.goal.ok').length===3,null,{timeout:8000});assert.equal(await page.locator('#mission-done').isDisabled(),false);
 await page.reload();await lab(page);assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),3,'work is saved');assert.deepEqual(page.errors,[]);await page.close();});

test('mission blink: load the solution, run it, LED blinks and serial prints',async()=>{const page=await open('#/lesson/blink',{completed:[...U1,...U2]});await lab(page);await page.click('#show-solution');await lab(page);
 await page.click('#lab-run');await page.waitForFunction(()=>document.querySelectorAll('.goal.ok').length===3,null,{timeout:10000});assert.match(await page.locator('#lab-out').innerText(),/LED on\s+LED off/);await page.close();});

test('mission press: hold the button with the Controls bar',async()=>{const page=await open('#/lesson/press',{completed:[...U1,...U2,...U3]});await lab(page);await page.click('#show-solution');await lab(page);
 await page.click('#lab-run');await page.waitForSelector('[data-press="btn1"]:not([disabled])');const b=await page.locator('[data-press="btn1"]').boundingBox();
 await page.waitForTimeout(300);await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(500);await page.mouse.up();
 await page.waitForFunction(()=>document.querySelectorAll('.goal.ok').length===4,null,{timeout:8000});await page.close();});

test('mission dimmer: the knob slider changes the brightness',async()=>{const page=await open('#/lesson/dimmer',{completed:[...U1,...U2,...U3,...U4,'fade','fade2','pwm','colors','colors2','rgb']});await lab(page);await page.click('#show-solution');await lab(page);
 await page.click('#lab-run');await page.waitForSelector('[data-potin="pot1"]:not([disabled])');
 for(const v of [0,1000,500]){await page.$eval('[data-potin="pot1"]',(el,x)=>{el.value=String(x);el.dispatchEvent(new Event('input',{bubbles:true}));},v);await page.waitForTimeout(400);}
 await page.waitForFunction(()=>document.querySelectorAll('.goal.ok').length===3,null,{timeout:6000});await page.close();});

test('workshop: run the default project, add a part, new project, export and import',async()=>{const page=await open('#/workshop');await lab(page);await page.click('#lab-run');await page.waitForFunction(()=>/LED on/.test(document.querySelector('#lab-out').textContent));
 await page.click('#lab-run');await page.click('#lab-add');await page.click('[data-addpart="buzzer"]');assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1);await page.waitForSelector('#lab-props:not([hidden])');
 await page.reload();await lab(page);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1,'saved');
 const [dl]=await Promise.all([page.waitForEvent('download'),page.click('#ws-export')]);const file=await dl.path();const data=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(data.format,'pin-by-pin-project');
 await page.click('#ws-new');await lab(page);assert.equal(await page.locator('#ws-project option').count(),2);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),0);
 await page.setInputFiles('#ws-file',file);await page.waitForSelector('#lab-svg [data-part="buzzer1"]');await lab(page);assert.equal(await page.locator('#ws-project option').count(),3);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1);
 await page.selectOption('#ws-example','two');await lab(page);assert.equal(await page.locator('#lab-svg [data-part="led2"]').count(),1);assert.deepEqual(page.errors,[]);await page.close();});

test('quiz between projects: wrong then right answer',async()=>{const page=await open('#/lesson/serial',{completed:['hello','hello2']});await page.waitForSelector('.quiz');await page.click('[data-choice="1"]');await page.click('#check-answer');await page.waitForSelector('#feedback.bad');
 await page.click('[data-choice="0"]');await page.click('#check-answer');await page.click('#check-answer');await page.waitForSelector('.success');await page.close();});

test('experienced learners test out of unit 1 with the checkpoint',async()=>{const {lessons}=await import('../dist/model.mjs');const page=await open('#/lesson/check1');await page.waitForSelector('.checkpoint');
 for(const [i,q] of lessons.find(l=>l.id==='check1').questions.entries()){if(q.choices)await page.click(`[data-cp-choice="${i}-${q.answer}"]`);else await page.fill(`[data-cp-input="${i}"]`,String(q.answer));}
 await page.click('#cp-submit');await page.click('#cp-submit');await page.waitForSelector('.success');await page.click('.success [data-nav="home"]');await page.waitForSelector('.lesson-node');assert.equal(await page.locator('[data-lesson="circuit"].lesson-node').isDisabled(),false);await page.close();});

test('notebook export, reset and import',async()=>{const page=await open('#/notebook',{completed:['hello','serial']});await page.waitForSelector('#export-progress');const [d]=await Promise.all([page.waitForEvent('download'),page.click('#export-progress')]);const file=await d.path();
 await page.click('#reset-progress');await page.waitForFunction(()=>document.querySelector('.stat-tasks b').textContent==='0');await page.setInputFiles('#progress-file',file);await page.waitForFunction(()=>document.querySelector('.stat-tasks b').textContent!=='0');await page.close();});

test('phone width: lab tabs switch between code, circuit and serial without page scroll',async()=>{const page=await open('#/lesson/blink',{completed:[...U1,...U2],width:390,height:844});await lab(page);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);assert.equal(await page.locator('.lab-code').isVisible(),true);await page.click('[data-labtab="circuit"]');assert.equal(await page.locator('#lab-svg').isVisible(),true);
 await page.click('[data-labtab="serial"]');assert.equal(await page.locator('.lab-out').isVisible(),true);for(const h of ['','#/workshop','#/notebook']){await page.goto(BASE+h);await page.waitForSelector('.main');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390,h);}await page.close();});

test('Turkish: the whole page switches and the choice is remembered',async()=>{const page=await open('#/lesson/blink',{completed:[...U1,...U2]});await lab(page);await page.click('.lesson-header [data-lang="tr"]');await lab(page);
 assert.match(await page.locator('.mission-panel h1').innerText(),/LED/);assert.match(await page.locator('#lab-run').innerText(),/Çalıştır/);assert.match(await page.locator('.goals .code-label').innerText(),/HEDEF/);
 await page.reload();await lab(page);assert.match(await page.locator('#lab-run').innerText(),/Çalıştır/);await page.close();});

test('undo, redo and cancel for wires and parts',async()=>{const page=await open('#/workshop');await lab(page);const wires=()=>page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length);
 const n0=await wires();assert.equal(await page.locator('#lab-undo').isDisabled(),true);
 await dragPins(page,'esp:D22','bb:j20');assert.equal(await wires(),n0+1);await page.click('#lab-undo');assert.equal(await wires(),n0);await page.click('#lab-redo');assert.equal(await wires(),n0+1);
 await page.locator('#lab-svg').focus();await page.keyboard.press('Control+z');assert.equal(await wires(),n0);
 const [x,y]=await page.evaluate(()=>document.querySelector('#lab-root').__lab.pinScreen('esp:D21'));await page.mouse.click(x,y);await page.waitForSelector('#lab-cancel:not([hidden])');await page.click('#lab-cancel');assert.equal(await page.locator('#lab-cancel').isHidden(),true);assert.equal(await wires(),n0);
 await page.click('#lab-add');await page.click('[data-addpart="led"]');assert.equal(await page.locator('#lab-svg [data-part="led2"]').count(),1);await page.click('#lab-undo');assert.equal(await page.locator('#lab-svg [data-part="led2"]').count(),0);
 await page.reload();await lab(page);assert.equal(await wires(),n0,'undo result is saved');assert.deepEqual(page.errors,[]);await page.close();});

test('move tool: drag a wire end to another hole; the wire tool shows the connected strip',async()=>{const page=await open('#/workshop');await lab(page);
 await page.click('[data-tool="wire"]');const [hx,hy]=await page.evaluate(()=>document.querySelector('#lab-root').__lab.pinScreen('bb:c20'));await page.mouse.move(hx,hy);await page.waitForSelector('.strip-hover');assert.match(await page.locator('#lab-tip').innerText(),/c20/);
 await page.click('[data-tool="select"]');const i=await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.findIndex(w=>w.a==='esp:D23'||w.b==='esp:D23'));
 const end=await page.evaluate(i=>{const w=document.querySelector('#lab-root').__lab.diagram.wires[i];return w.a==='esp:D23'?'b':'a';},i);const from=await page.evaluate(([i,e])=>document.querySelector('#lab-root').__lab.diagram.wires[i][e],[i,end]);
 const [x,y]=await page.evaluate(k=>document.querySelector('#lab-root').__lab.pinScreen(k),from);const [mx,my]=await page.evaluate(k=>document.querySelector('#lab-root').__lab.pinScreen(k),'esp:D23');
 await page.mouse.click((x+mx)/2,y);await page.mouse.click(x,y);
 if(!await page.evaluate(()=>document.querySelector('#lab-root').__lab.sel?.wire!==undefined)){const [px,py]=await page.evaluate(([i])=>{const l=document.querySelector('#lab-root').__lab;l.select({wire:i});return [0,0];},[i]);}
 const [tx,ty]=await page.evaluate(()=>document.querySelector('#lab-root').__lab.pinScreen('bb:j6'));await page.mouse.move(x,y);await page.mouse.down();await page.mouse.move(tx,ty,{steps:6});await page.mouse.up();
 assert.equal(await page.evaluate(([i,e])=>document.querySelector('#lab-root').__lab.diagram.wires[i][e],[i,end]),'bb:j6');await page.click('#lab-undo');assert.equal(await page.evaluate(([i,e])=>document.querySelector('#lab-root').__lab.diagram.wires[i][e],[i,end]),from);assert.deepEqual(page.errors,[]);await page.close();});

test('lessons unlock one after another for everyone: no URL or sign-in opens them early',async()=>{for(const h of ['#/review','#/owner']){const page=await open(h);await page.waitForSelector('.lesson-node');assert.equal(await page.locator('[data-lesson="speed"].lesson-node').isDisabled(),true,h);assert.equal(await page.locator('.review-banner,#owner-form').count(),0,h);await page.close();}
 const page=await open('#/lesson/speed');await page.waitForSelector('.lesson-node');assert.equal(await page.locator('.mission-panel').count(),0,'a locked lesson is not opened');assert.deepEqual(page.errors,[]);await page.close();});

test('a your-turn task starts from the learner own work on the project before it',async()=>{const page=await open('#/lesson/blink2',{completed:[...U1,...U2,'blink']});await lab(page);
 assert.match(await page.locator('.mission-panel .eyebrow').innerText(),/YOUR TURN/);const code=await page.inputValue('#ed-text');assert.ok(code.includes('delay(500)'),'starts from the blink solution');
 await page.goto(BASE+'#/lesson/blink');await lab(page);await page.fill('#ed-text','// my own blink\n'+code);await page.waitForTimeout(100);
 await page.goto(BASE+'#/lesson/blink2');await lab(page);assert.ok((await page.inputValue('#ed-text')).startsWith('// my own blink'),'carries the learner code over');assert.deepEqual(page.errors,[]);await page.close();});

test('a second breadboard can be added, moved on its own, and old duplicate ids are repaired',async()=>{const page=await open('#/workshop');await lab(page);
 await page.click('#lab-add');await page.click('[data-addpart="breadboard"]');const ids=await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.parts.map(p=>p.id));assert.equal(new Set(ids).size,ids.length);assert.ok(ids.includes('bb2'));
 await page.click('[data-tool="select"]');const pos=id=>page.evaluate(i=>{const p=document.querySelector('#lab-root').__lab.diagram.parts.find(q=>q.id===i);return [p.x,p.y];},id);
 const a0=await pos('bb'),b0=await pos('bb2');const box=await page.locator('#lab-svg [data-part="bb2"]').first().boundingBox();const sx=box.x+box.width/2,sy=box.y+box.height/2;
 await page.mouse.move(sx,sy);await page.mouse.down();await page.mouse.move(sx+30,sy+20,{steps:5});await page.mouse.move(sx+60,sy+40,{steps:5});await page.mouse.up();
 const a1=await pos('bb'),b1=await pos('bb2');assert.deepEqual(a1,a0,'first breadboard stays');assert.notDeepEqual(b1,b0,'second breadboard moved');
 // a project saved by an older version with two breadboards named "bb"
 await page.evaluate(()=>{const ps=JSON.parse(localStorage.getItem('pin-by-pin-projects-v1'));const d=ps.list[0].diagram;d.parts.push({id:'bb',type:'breadboard',x:400,y:0,rot:0,attrs:{}});localStorage.setItem('pin-by-pin-projects-v1',JSON.stringify(ps));});
 await page.reload();await lab(page);const ids2=await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.parts.map(p=>p.id));assert.equal(new Set(ids2).size,ids2.length);assert.deepEqual(page.errors,[]);await page.close();});

test('the public site: only released units are open, the rest wait for their video',async()=>{const P2=PORT+700;const srv=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:String(P2),RELEASE_ALL:''},stdio:['ignore','pipe','inherit']});await new Promise(r=>srv.stdout.once('data',r));
 try{const context=await browser.newContext({viewport:{width:1440,height:900}});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(`http://127.0.0.1:${P2}/`);await page.waitForSelector('.lesson-node');
  assert.equal(await page.locator('.unit').count(),2);assert.equal(await page.locator('.upcoming').count(),9);assert.match(await page.locator('.upcoming').first().innerText(),/WAITING FOR THE VIDEO/);assert.equal(await page.locator('[data-lesson="blink"]').count(),0);
  assert.match(await page.locator('.stat-tasks').innerText(),/\/ 1[0-9] tasks/);
  await page.goto(`http://127.0.0.1:${P2}/#/lesson/blink`);await page.waitForSelector('.lesson-node');assert.equal(await page.locator('.mission-panel').count(),0,'closed unit cannot be opened by URL');
  await page.goto(`http://127.0.0.1:${P2}/#/workshop`);await page.waitForSelector('#ws-example');const opts=await page.locator('#ws-example option').allInnerTexts();assert.ok(opts.some(o=>/Hello/.test(o)));assert.ok(!opts.some(o=>/Blink an LED|Read a button/.test(o)),'examples of closed units are hidden: '+opts.join('|'));
  assert.deepEqual(errors,[]);await context.close();}finally{srv.kill();}});

test('workshop retains live edits when exporting, renaming and switching projects',async()=>{
 const page=await open('#/workshop');await lab(page);
 const code='void setup() { Serial.begin(115200); Serial.println("latest edit"); }\nvoid loop() {}\n';
 await page.fill('#ed-text',code);const first=await page.locator('#ws-project').inputValue();
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#ws-export')]);
 assert.equal(JSON.parse(fs.readFileSync(await download.path(),'utf8')).code,code);
 await page.click('#ws-rename');await lab(page);assert.equal(await page.locator('#ed-text').inputValue(),code);
 await page.click('#ws-new');await lab(page);await page.selectOption('#ws-project',first);await lab(page);
 assert.equal(await page.locator('#ed-text').inputValue(),code);assert.deepEqual(page.errors,[]);await page.close();
});
test('mission goals reset after edits, failed runs, solution load and starting over',async()=>{
 const page=await open('#/lesson/hello');await lab(page);
 await page.fill('#ed-text',MISSIONS.hello.solution.code);await page.click('#lab-run');
 await page.waitForFunction(()=>!document.querySelector('#mission-done').disabled);
 await page.fill('#ed-text','void setup() {}\nvoid loop() {}\n');
 assert.equal(await page.locator('#mission-done').isDisabled(),true);
 await page.waitForTimeout(400);assert.equal(await goalsOk(page),0);
 await page.fill('#ed-text',MISSIONS.hello.solution.code);await page.waitForTimeout(400);assert.equal(await goalsOk(page),0,'reverting the code still requires a new run');
 await page.click('#lab-restart');assert.equal(await page.locator('#mission-done').isDisabled(),true);
 await page.click('#show-solution');await lab(page);assert.equal(await page.locator('#mission-done').isDisabled(),true);
 await page.click('#lab-run');await page.waitForFunction(()=>!document.querySelector('#mission-done').disabled);
 await page.fill('#ed-text','void setup( {');await page.click('#lab-restart');
 assert.equal(await page.locator('#mission-done').isDisabled(),true);
 await page.click('#reset-work');await lab(page);assert.equal(await goalsOk(page),0);assert.deepEqual(page.errors,[]);await page.close();
});
test('full backup moves mission drafts, workshop edits and progress to a fresh browser',async()=>{
 const page=await open('#/lesson/hello',{completed:['hello']});await lab(page);
 const code=MISSIONS.hello.solution.code+'// my saved draft\n';await page.fill('#ed-text',code);
 await page.goto(BASE+'#/workshop');await lab(page);const projectCode=MISSIONS.blink.solution.code+'// my workshop\n';await page.fill('#ed-text',projectCode);
 await page.goto(BASE+'#/notebook');await page.waitForSelector('#export-backup');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#export-backup')]);const file=await download.path();
 const exported=JSON.parse(fs.readFileSync(file,'utf8'));assert.equal(exported.work.hello.code,code);assert.equal(exported.projects.list[0].code,projectCode);
 const other=await open('#/notebook');await other.waitForSelector('#backup-file');await other.setInputFiles('#backup-file',file);
 await other.waitForFunction(()=>document.querySelector('.stat-tasks b').textContent==='1');
 await other.goto(BASE+'#/lesson/hello');await lab(other);assert.equal(await other.locator('#ed-text').inputValue(),code);
 await other.goto(BASE+'#/workshop');await lab(other);assert.equal(await other.locator('#ed-text').inputValue(),projectCode);
 await other.goto(BASE+'#/notebook');await other.setInputFiles('#backup-file',file);
 await other.waitForSelector('.toast');await other.goto(BASE+'#/workshop');await lab(other);assert.equal(await other.locator('#ws-project option').count(),1);
 assert.deepEqual(page.errors,[]);assert.deepEqual(other.errors,[]);await other.close();await page.close();
});
test('malformed project and backup files leave the existing lab intact and can be retried',async()=>{
 const page=await open('#/workshop');await lab(page);const code=await page.locator('#ed-text').inputValue();
 const project={format:'pin-by-pin-project',version:1,name:'Broken',code,diagram:{parts:[{id:'esp',type:'unknown',x:0,y:0}],wires:[]}};
 await page.setInputFiles('#ws-file',{name:'broken.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(project))});
 await page.waitForSelector('.toast');assert.equal(await page.locator('#ws-project option').count(),1);assert.equal(await page.locator('#ed-text').inputValue(),code);
 assert.equal(await page.locator('#ws-file').inputValue(),'');await page.goto(BASE+'#/notebook');
 await page.setInputFiles('#backup-file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"format":"pin-by-pin-backup","version":1}')});
 await page.waitForSelector('.toast');assert.match(await page.locator('.toast').innerText(),/not a valid/);assert.equal(await page.locator('#backup-file').inputValue(),'');
 assert.deepEqual(page.errors,[]);await page.close();
});

async function simulateStorageFailure(page){
 await page.evaluate(()=>{
  const original=Storage.prototype.setItem;window.__storageFailure=true;
  Storage.prototype.setItem=function(key,value){
   if(window.__storageFailure&&/^pin-by-pin-(projects|work|progress)-v1$/.test(key))throw new DOMException('Test storage quota','QuotaExceededError');
   return original.call(this,key,value);
  };
 });
}
test('failed workshop saves keep code and wiring through project changes and offer recovery and retry',async()=>{
 const page=await open('#/workshop');await lab(page);
 const first=await page.locator('#ws-project').inputValue();await simulateStorageFailure(page);
 const code='void setup() { Serial.begin(115200); Serial.println("unsaved work"); }\nvoid loop() {}\n';
 await page.fill('#ed-text',code);await page.click('#lab-add');await page.click('[data-addpart="buzzer"]');
 assert.equal(await page.locator('.lab-save').getAttribute('data-saved'),'false');
 assert.equal(await page.locator('#lab-save-retry').isVisible(),true);
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#lab-save-download')]);
 const copy=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(copy.code,code);assert.ok(copy.diagram.parts.some(p=>p.type==='buzzer'));
 await page.click('#ws-new');await lab(page);await page.selectOption('#ws-project',first);await lab(page);
 assert.equal(await page.locator('#ed-text').inputValue(),code);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1);
 await page.click('#lab-save-retry');assert.equal(await page.locator('.lab-save').getAttribute('data-saved'),'false');
 assert.equal(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}),true);
 await page.evaluate(()=>window.__storageFailure=false);await page.click('#lab-save-retry');
 assert.equal(await page.locator('.lab-save').getAttribute('data-saved'),'true');
 assert.equal(await page.evaluate(()=>{const e=new Event('beforeunload',{cancelable:true});window.dispatchEvent(e);return e.defaultPrevented;}),false);
 await page.reload();await lab(page);assert.equal(await page.locator('#ed-text').inputValue(),code);
 assert.equal(await page.locator('#ws-project option').count(),2);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1);
 assert.deepEqual(page.errors,[]);await page.close();
});
test('lesson drafts that could not save survive routing and remain in a full backup',async()=>{
 const page=await open('#/lesson/hello');await lab(page);await simulateStorageFailure(page);
 const code=MISSIONS.hello.solution.code+'// recovered draft\n';await page.fill('#ed-text',code);
 assert.equal(await page.locator('.lab-save').getAttribute('data-saved'),'false');
 await page.click('[data-lang="tr"]');await lab(page);assert.match(await page.locator('#lab-save-state').innerText(),/Kaydedilemedi/);
 assert.equal(await page.locator('#ed-text').inputValue(),code);
 await page.goto(BASE+'#/notebook');await page.waitForSelector('#export-backup');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#export-backup')]);
 const data=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.equal(data.work.hello.code,code);
 await page.goto(BASE+'#/lesson/hello');await lab(page);assert.equal(await page.locator('#ed-text').inputValue(),code);
 await page.evaluate(()=>window.__storageFailure=false);await page.click('#lab-save-retry');
 await page.reload();await lab(page);assert.equal(await page.locator('#ed-text').inputValue(),code);assert.deepEqual(page.errors,[]);await page.close();
});
test('phone: save failure actions fit without horizontal scrolling',async()=>{
 const page=await open('#/workshop',{width:390,height:844,lang:'tr'});await lab(page);await simulateStorageFailure(page);
 await page.fill('#ed-text','void setup() {}\nvoid loop() {}\n');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 for(const id of ['#lab-save-retry','#lab-save-download']){const box=await page.locator(id).boundingBox();assert.ok(box.width>=100);assert.ok(box.height>=42);assert.ok(box.x>=0&&box.x+box.width<=390);}
 assert.match(await page.locator('#lab-save-state').innerText(),/Kaydedilemedi/);
 fs.mkdirSync('artifacts',{recursive:true});await page.locator('.lab-save').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/mobile-save-recovery.png'});
 assert.deepEqual(page.errors,[]);await page.close();
});

async function connectBySelection(page,a,b){
 await page.locator('#pin-connect').evaluate(el=>{el.open=true;});
 for(const [side,key] of [['from',a],['to',b]]){
  await page.selectOption('#pin-'+side+'-part',key.slice(0,key.lastIndexOf(':')));
  await page.selectOption('#pin-'+side,key);
 }
 await page.locator('#pin-connect-submit').press('Enter');
}
test('phone: connect selected pins without dragging, reject duplicates, undo, and lock while running',async()=>{
 const page=await open('#/lesson/circuit',{completed:U1,width:390,height:844});await lab(page);
 await page.click('[data-labtab="circuit"]');await page.click('#pin-connect summary');
 await connectBySelection(page,'esp:3V3','bb:bp2');
 assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),1);
 await page.locator('#pin-connect-submit').press('Enter');assert.match(await page.locator('#pin-connect-feedback').innerText(),/already connected/);
 assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),1);
 await page.selectOption('#pin-to-part','esp');await page.selectOption('#pin-to','esp:3V3');await page.click('#pin-connect-submit');
 assert.match(await page.locator('#pin-connect-feedback').innerText(),/different pins/);
 await page.click('#lab-undo');assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),0);
 await page.click('#lab-redo');assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),1);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 for(const id of ['#pin-from-part','#pin-from','#pin-to-part','#pin-to','#pin-connect-submit']){const rect=await page.locator(id).boundingBox();assert.ok(rect.height>=42);assert.ok(rect.x>=0&&rect.x+rect.width<=390);}
 fs.mkdirSync('artifacts',{recursive:true});await page.locator('#pin-connect').scrollIntoViewIfNeeded();await page.locator('.lab').screenshot({path:'artifacts/mobile-pin-connections.png'});
 await page.click('#lab-run');assert.equal(await page.locator('#pin-connect-submit').isDisabled(),true);assert.deepEqual(page.errors,[]);await page.close();
});
test('first circuit guide completes a real circuit on a phone one connection at a time',async()=>{
 const page=await open('#/lesson/circuit',{completed:U1,width:390,height:844,lang:'tr'});await lab(page);
 assert.match(await page.locator('#first-guide').innerText(),/İlk devre rehberi/);
 await page.click('#guide-action');await page.waitForFunction(()=>document.querySelector('.guide-progress').textContent.includes('2 / 5'));
 assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),0,'placing parts never inserts the solution wires');
 for(let i=0;i<3;i++){
  await page.click('#guide-action');await page.click('#pin-connect-submit');
  await page.waitForFunction(n=>document.querySelector('.guide-progress')?.textContent.includes(n+' / 5'),i+3);
 }
 await page.click('#guide-action');await page.waitForSelector('.guide-ready');assert.equal(await goalsOk(page),3);
 assert.equal(await page.locator('#mission-done').isDisabled(),false);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);
 fs.mkdirSync('artifacts',{recursive:true});await page.locator('#first-guide').scrollIntoViewIfNeeded();await page.screenshot({path:'artifacts/mobile-first-circuit-guide.png'});
 assert.deepEqual(page.errors,[]);await page.close();
});
test('guide placement can be undone without replacing the sketch or adding connections',async()=>{
 const page=await open('#/lesson/circuit',{completed:U1});await lab(page);const code=await page.locator('#ed-text').inputValue();
 await page.click('#guide-action');await page.click('#lab-undo');
 assert.match(await page.locator('.guide-progress').innerText(),/1 \/ 5/);assert.equal(await page.locator('#ed-text').inputValue(),code);
 assert.equal(await page.evaluate(()=>document.querySelector('#lab-root').__lab.diagram.wires.length),0);assert.deepEqual(page.errors,[]);await page.close();
});
async function openDiagnosticProject(page,kind){
 const parts=[{id:'esp',type:'esp32',x:0,y:0,rot:0,attrs:{}},{id:'bb',type:'breadboard',x:160,y:0,rot:0,attrs:{}}];
 const wires=kind==='short'?[{a:'esp:3V3',b:'esp:GND.R'}]:[{a:'esp:3V3',b:'led1:A'},{a:'led1:C',b:'esp:GND.R'}];
 if(kind==='led')parts.push({id:'led1',type:'led',x:250,y:230,rot:0,attrs:{color:'red'}});
 const data={format:'pin-by-pin-project',version:1,name:'Diagnostic '+kind,code:'void setup(){}\nvoid loop(){}',diagram:{parts,wires}};
 await page.setInputFiles('#ws-file',{name:'diagnostic.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(data))});
 await page.waitForFunction(name=>document.querySelector('#ws-project').selectedOptions[0].textContent===name,data.name);await lab(page);
}
test('phone: a short-circuit warning opens the circuit, highlights its wire, and clears after repair',async()=>{
 const page=await open('#/workshop',{width:390,height:844});await lab(page);await openDiagnosticProject(page,'short');
 await page.click('#lab-run');await page.waitForSelector('#lab-issues:not([hidden])');await page.click('#lab-issues');
 assert.equal(await page.locator('[data-labtab="serial"]').getAttribute('aria-selected'),'true');
 await page.locator('.lab-warning').filter({hasText:'Short circuit'}).locator('[data-warning-focus]').click();
 assert.equal(await page.locator('[data-labtab="circuit"]').getAttribute('aria-selected'),'true');
 assert.equal(await page.locator('.diagnostic-wire').count(),1);assert.ok(await page.locator('.diagnostic-pin').count()>=2);
 fs.mkdirSync('artifacts',{recursive:true});await page.locator('#diagnostic-note').scrollIntoViewIfNeeded();await page.locator('.lab').screenshot({path:'artifacts/mobile-circuit-warning.png'});
 await page.click('#lab-run');
 await page.evaluate(()=>document.querySelector('#lab-root').__lab.select({wire:0}));await page.locator('#lab-svg').focus();await page.keyboard.press('Delete');
 assert.equal(await page.locator('.diagnostic-wire').count(),0);assert.equal(await page.locator('#diagnostic-note').isVisible(),false);
 await page.click('#lab-run');await page.waitForTimeout(300);assert.equal(await page.locator('#lab-issues').isVisible(),false);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);assert.deepEqual(page.errors,[]);await page.close();
});
test('a missing-resistor warning highlights its LED and the attached wires',async()=>{
 const page=await open('#/workshop');await lab(page);await openDiagnosticProject(page,'led');await page.click('#lab-run');await page.waitForSelector('[data-warning-focus]');
 await page.locator('.lab-warning').filter({hasText:'burns out'}).locator('[data-warning-focus]').click();
 assert.equal(await page.locator('[data-part="led1"].diagnostic-part').count(),1);assert.equal(await page.locator('.diagnostic-wire').count(),2);
 await page.click('#lab-restart');assert.equal(await page.locator('.diagnostic-wire').count(),0);await page.waitForSelector('[data-warning-focus]');await page.locator('.lab-warning').filter({hasText:'burns out'}).locator('[data-warning-focus]').click();await page.click('#diagnostic-clear');assert.equal(await page.locator('.diagnostic-pin').count(),0);assert.deepEqual(page.errors,[]);await page.close();
});

test('laptop: the pin connector leaves room for the circuit and serial monitor',async()=>{
 const page=await open('#/workshop',{width:1440,height:760});await lab(page);await page.click('#pin-connect summary');
 await connectBySelection(page,'esp:D22','bb:j22');
 await page.waitForFunction(()=>{const canvas=document.querySelector('.lab-canvas').getBoundingClientRect(),board=document.querySelector('[data-part="esp"]').getBoundingClientRect();return board.top>=canvas.top&&board.bottom<=canvas.bottom;},null,{timeout:3000});
 const canvas=await page.locator('.lab-canvas').boundingBox(),serial=await page.locator('.lab-serial').boundingBox();
 assert.ok(canvas.height>=160);assert.ok(canvas.y+canvas.height<=serial.y+1,'circuit stays above Serial Monitor');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),1440);
 fs.mkdirSync('artifacts',{recursive:true});await page.locator('.lab').screenshot({path:'artifacts/desktop-pin-connections.png'});
 assert.deepEqual(page.errors,[]);await page.close();
});
