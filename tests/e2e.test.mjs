import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {chromium} from 'playwright';
import {MISSIONS} from '../dist/missions.mjs';
const PORT=4300+Math.floor(Math.random()*500),BASE=`http://127.0.0.1:${PORT}/`;
const KEY='pin-by-pin-progress-v1';
let server,browser;
test.before(async()=>{server=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:String(PORT)},stdio:['ignore','pipe','inherit']});await new Promise(r=>server.stdout.once('data',r));browser=await chromium.launch();});
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
 await page.setInputFiles('#ws-file',file);await lab(page);assert.equal(await page.locator('#ws-project option').count(),3);assert.equal(await page.locator('#lab-svg [data-part="buzzer1"]').count(),1);
 await page.selectOption('#ws-example','two');await lab(page);assert.equal(await page.locator('#lab-svg [data-part="led2"]').count(),1);assert.deepEqual(page.errors,[]);await page.close();});

test('quiz between projects: wrong then right answer',async()=>{const page=await open('#/lesson/serial',{completed:['hello','hello2']});await page.waitForSelector('.quiz');await page.click('[data-choice="1"]');await page.click('#check-answer');await page.waitForSelector('#feedback.bad');
 await page.click('[data-choice="0"]');await page.click('#check-answer');await page.click('#check-answer');await page.waitForSelector('.success');await page.close();});

test('experienced learners test out of unit 1 with the checkpoint',async()=>{const {lessons}=await import('../dist/model.mjs');const page=await open('#/lesson/check1');await page.waitForSelector('.checkpoint');
 for(const [i,q] of lessons.find(l=>l.id==='check1').questions.entries()){if(q.choices)await page.click(`[data-cp-choice="${i}-${q.answer}"]`);else await page.fill(`[data-cp-input="${i}"]`,String(q.answer));}
 await page.click('#cp-submit');await page.click('#cp-submit');await page.waitForSelector('.success');await page.click('.success [data-nav="home"]');await page.waitForSelector('.lesson-node');assert.equal(await page.locator('[data-lesson="circuit"].lesson-node').isDisabled(),false);await page.close();});

test('notebook export, reset and import',async()=>{const page=await open('#/notebook',{completed:['hello','serial']});await page.waitForSelector('#export-progress');const [d]=await Promise.all([page.waitForEvent('download'),page.click('#export-progress')]);const file=await d.path();
 await page.click('#reset-progress');await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent==='0');await page.setInputFiles('#progress-file',file);await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent!=='0');await page.close();});

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
