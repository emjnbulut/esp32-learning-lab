import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import fs from 'node:fs';import {chromium} from 'playwright';
const PORT=4300+Math.floor(Math.random()*500),BASE=`http://127.0.0.1:${PORT}/`;
const KEY='pin-by-pin-progress-v1';
let server,browser;
test.before(async()=>{server=spawn(process.execPath,['tools/serve.mjs'],{env:{...process.env,PORT:String(PORT)},stdio:['ignore','pipe','inherit']});await new Promise(r=>server.stdout.once('data',r));browser=await chromium.launch();});
test.after(async()=>{await browser?.close();server?.kill();});
async function open(hash='',{completed=[],width=1280,height=900}={}){
 const context=await browser.newContext({viewport:{width,height},acceptDownloads:true});const page=await context.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});page.on('dialog',d=>d.accept());
 if(completed.length)await context.addInitScript(([k,v])=>{if(!sessionStorage.getItem('seeded')){localStorage.setItem(k,v);sessionStorage.setItem('seeded','1');}},[KEY,JSON.stringify({version:1,completed,dates:['2026-10-19']})]);
 await page.goto(BASE+hash);page.errors=errors;return page;}
const xp=page=>page.locator('.stat-star b').innerText();
const hole=(c,r)=>`[data-hole="${c},${r}"]`;
async function buildLED(page){await page.click('[data-add="resistor"]');await page.click(hole(3,0));await page.click('[data-add="led"]');await page.click(hole(6,0));await page.click('[data-pin="gpio"]');await page.click(hole(3,2));await page.click(hole(7,2));await page.click('[data-pin="gnd"]');}
async function setDelay(page,ms){await page.$eval('#delay',(el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},ms);}
const unit12=['board','serial','setup','rows','resistor','polarity'];

test('home loads without errors and later lessons are locked',async()=>{const page=await open();await page.waitForSelector('.lesson-node');assert.equal(await page.locator('[data-lesson="serial"].lesson-node').isDisabled(),true);assert.equal(await page.locator('[data-lesson="board"].lesson-node').isDisabled(),false);assert.deepEqual(page.errors,[]);await page.close();});

test('deep link to a locked lesson falls back to the learning path',async()=>{const page=await open('#/ders/challenge');await page.waitForSelector('.hero');assert.equal(new URL(page.url()).hash,'#/');await page.close();});

test('quiz: wrong answer explains, right answer completes once, progress survives refresh',async()=>{const page=await open();await page.click('.continue-card .primary');await page.waitForSelector('.quiz');assert.equal(new URL(page.url()).hash,'#/lesson/board');
 await page.click('[data-choice="2"]');await page.click('#check-answer');await assert.doesNotReject(page.waitForSelector('#feedback.bad'));
 await page.click('[data-choice="0"]');await page.click('#check-answer');await page.waitForSelector('#feedback.good');await page.click('#check-answer');await page.waitForSelector('.success');assert.match(await page.locator('.earned').innerText(),/\+20 XP/);
 await page.reload();await page.waitForSelector('.quiz');await page.click('.close');await page.waitForSelector('.stat-star');assert.equal(await xp(page),'20');assert.equal(await page.locator('[data-lesson="serial"].lesson-node').isDisabled(),false);
 await page.goto(BASE+'#/notebook');await page.click('.record [data-lesson="board"]');await page.click('[data-choice="0"]');await page.click('#check-answer');await page.click('#check-answer');assert.match(await page.locator('.earned').innerText(),/ALREADY/);await page.click('.success [data-nav="home"]');assert.equal(await xp(page),'20');await page.close();});

test('browser back returns from a lesson to the learning path',async()=>{const page=await open();await page.click('[data-lesson="board"].lesson-node');await page.waitForSelector('.quiz');await page.goBack();await page.waitForSelector('.hero');assert.equal(await page.locator('.quiz').count(),0);await page.close();});

test('lab: LED circuit lights, wrong topologies are explained',async()=>{const page=await open('#/lesson/light',{completed:unit12});await page.waitForSelector('#bench');
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/an LED and a 220/);
 await buildLED(page);assert.equal(await page.locator('.wire-delete').count(),2);assert.match(await page.locator('.wire-delete').first().innerText(),/GPIO 23 — c4/);
 await page.click('#reverse-led');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/wrong way round/);await page.click('#reverse-led');
 await page.click('.wire-delete >> nth=1');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/isn’t complete/);
 await page.click(hole(7,3));await page.click('[data-pin="gnd"]');await page.click('[data-pin="gpio"]');await page.click('[data-pin="gnd"]');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/connected directly/);await page.click('.wire-delete >> nth=2');
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/Current path complete/);await page.waitForFunction(()=>document.querySelector('#led-bulb').getAttribute('fill')==='#ff8348');
 await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled,null,{timeout:4000});await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/Your first light is on/);assert.deepEqual(page.errors,[]);await page.close();});

test('challenge only passes at 250 ms',async()=>{const page=await open('#/lesson/challenge',{completed:[...unit12,'light','blink']});await page.waitForSelector('#bench');await buildLED(page);await setDelay(page,300);await page.click('#run-lab');
 await page.waitForFunction(()=>document.querySelector('#lab-feedback').classList.contains('bad'),null,{timeout:4000});assert.equal(await page.locator('#finish-lab').isDisabled(),true);
 await setDelay(page,250);assert.match(await page.locator('#sketch').innerText(),/delay\(250\)/);assert.match(await page.locator('#frequency').innerText(),/2\.00/);
 await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled,null,{timeout:4000});await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/You set the rhythm/);await page.close();});

test('keyboard: arrow keys move between holes and focus survives re-render',async()=>{const page=await open('#/workshop');await page.waitForSelector('#bench');
 assert.equal(await page.locator('[data-hole][tabindex="0"]').count(),1);
 await page.focus('[data-pin="gpio"]');await page.keyboard.press('Enter');await page.focus(hole(0,0));for(const k of ['ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown'])await page.keyboard.press(k);
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');await page.keyboard.press('Enter');
 assert.equal(await page.locator('.wire-delete').count(),1);assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');
 await page.focus('[data-add="led"]');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');await page.keyboard.press('Enter');assert.equal(await page.locator('[data-part="led"]').count(),1);await page.close();});

test('notebook export, reset and import restore progress',async()=>{const page=await open('#/notebook',{completed:['board','serial']});await page.waitForSelector('#export-progress');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#export-progress')]);const file=await download.path();const saved=JSON.parse(fs.readFileSync(file,'utf8'));assert.deepEqual(saved.completed,['board','serial']);
 await page.click('#reset-progress');await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent==='0');
 await page.setInputFiles('#progress-file',file);await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent==='40');
 await page.setInputFiles('#progress-file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"nope":1}')});await page.waitForSelector('.toast');assert.match(await page.locator('.toast').innerText(),/not a valid/);await page.close();});

test('phone width has no horizontal page scroll',async()=>{for(const hash of ['','#/workshop','#/notebook']){const page=await open(hash,{width:390,height:844});await page.waitForSelector('.main');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390,hash);await page.close();}
 const page=await open('#/lesson/light',{completed:unit12,width:390,height:844});await page.waitForSelector('#bench');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await buildLED(page);await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/Current path complete/);await page.close();});
const unit13=[...unit12,'light','blink','challenge'];

test('unit 4 button lab: place, wire, press and release',async()=>{const page=await open('#/lesson/button',{completed:[...unit13,'pullup','floating']});await page.waitForSelector('#bench');
 assert.equal(await page.locator('[data-part="led"]').count(),1);assert.equal(await page.locator('#press').isDisabled(),true);
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/First place the button/);
 await page.click('[data-add="button"]');await page.click(hole(9,1));await page.click('[data-pin="gpio22"]');await page.click(hole(9,7));await page.click(hole(11,7));await page.click('[data-pin="gnd"]');
 await page.click('#rotate-button');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/turned sideways/);await page.click('#rotate-button');
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/HIGH \(1\) when released/);
 await page.waitForFunction(()=>document.querySelector('#serial').textContent.trim().split('\n').every(l=>l==='1'));
 const box=await page.locator('#press').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();
 await page.waitForFunction(()=>document.querySelector('#led-bulb').getAttribute('fill')==='#ff8348');assert.match(await page.locator('#serial').innerText(),/0/);assert.equal(await page.locator('#finish-lab').isDisabled(),true);
 await page.mouse.up();await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled);
 await page.selectOption('#pin-mode','input');await page.waitForFunction(()=>document.querySelector('#finish-lab').disabled);assert.match(await page.locator('#sketch').innerText(),/pinMode\(BUTTON_PIN, INPUT\)/);assert.match(await page.locator('#lab-feedback').innerText(),/Floating pin/);
 await page.selectOption('#pin-mode','pullup');await page.focus('#press');await page.keyboard.down('Space');await page.waitForFunction(()=>document.querySelector('#led-bulb').getAttribute('fill')==='#ff8348');await page.keyboard.up('Space');
 await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled);await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/The board heard you/);assert.deepEqual(page.errors,[]);await page.close();});

test('unit 4 debounce: bouncing presses count many times until debounce is long enough',async()=>{const page=await open('#/lesson/bounce',{completed:[...unit13,'pullup','floating','button']});await page.waitForSelector('#scope');
 await page.click('#bounce-press');assert.match(await page.locator('#bounce-state').innerText(),/One press counted \d times/);assert.ok(await page.locator('.count-dot').count()>1);
 await page.$eval('#debounce',el=>{el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));});assert.match(await page.locator('#sketch').innerText(),/>= 50/);assert.equal(await page.locator('.count-dot').count(),1);
 for(let i=0;i<3;i++)await page.click('#bounce-press');assert.match(await page.locator('#bounce-state').innerText(),/3 \/ 3/);
 await page.click('#finish-lab');await page.waitForSelector('.success');assert.deepEqual(page.errors,[]);await page.close();});

test('unit 4 challenge: delay() misses short presses, millis() catches them',async()=>{const page=await open('#/lesson/nowait',{completed:[...unit13,'pullup','floating','button','bounce','millis']});await page.waitForSelector('#nw-press');
 const tap=async(ms)=>{const b=await page.locator('#nw-press').boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.waitForTimeout(ms);await page.mouse.up();};
 await page.waitForFunction(()=>{const t=document.querySelectorAll('#timeline .read');return t.length>0;});
 for(let i=0;i<4;i++){await tap(60);await page.waitForTimeout(170);}
 assert.match(await page.locator('#nw-stats').innerText(),/Missed [1-4]/);
 await page.click('[data-version="millis"]');assert.match(await page.locator('pre').innerText(),/millis\(\)/);
 for(let i=0;i<3;i++){await tap(60);await page.waitForTimeout(80);}
 assert.match(await page.locator('#nw-stats').innerText(),/Caught 3 · Missed 0 · In a row 3 \/ 3/);
 await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/Two things at once/);assert.deepEqual(page.errors,[]);await page.close();});

test('language switch: English by default, Turkish on request and remembered',async()=>{const page=await open();await page.waitForSelector('.hero');assert.equal(await page.evaluate(()=>document.documentElement.lang),'en');assert.match(await page.locator('.hero h1').innerText(),/It starts/);
 await page.click('[data-lang="tr"]');assert.match(await page.locator('.hero h1').innerText(),/Bir pinle/);assert.equal(await page.evaluate(()=>document.documentElement.lang),'tr');assert.match(await page.title(),/Bir pinle başlar/);
 await page.reload();await page.waitForSelector('.hero');assert.match(await page.locator('.hero h1').innerText(),/Bir pinle/);assert.match(await page.locator('.unit h3').first().innerText(),/Kartla tanış/);
 await page.goto(BASE+'#/ders/board');await page.waitForSelector('.quiz');assert.match(await page.locator('.quiz h2').innerText(),/LED’i programla/);await page.click('[data-choice="1"]');await page.click('#check-answer');assert.match(await page.locator('#feedback').innerText(),/Henüz değil/);
 await page.click('.lesson-header [data-lang="en"]');assert.match(await page.locator('.quiz h2').innerText(),/switch an LED/);assert.equal(await page.locator('[data-choice="1"].selected').count(),1);assert.deepEqual(page.errors,[]);await page.close();});

test('Turkish lab messages and sketch comments are translated',async()=>{const page=await open('#/lesson/button',{completed:[...unit13,'pullup','floating']});await page.waitForSelector('#bench');await page.click('[data-lang="tr"]');
 assert.match(await page.locator('#sketch').innerText(),/buton bu pini GND’ye çeker/);await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/Önce butonu/);await page.close();});

const setRange=(page,sel,v)=>page.$eval(sel,(el,x)=>{el.value=String(x);el.dispatchEvent(new Event('input',{bubbles:true}));},v);
async function answerCheckpoint(page,id,{wrong=[]}={}){const {lessons}=await import('../dist/model.mjs');const qs=lessons.find(l=>l.id===id).questions;for(const [i,q] of qs.entries()){const bad=wrong.includes(i);if(q.choices)await page.click(`[data-cp-choice="${i}-${bad?(q.answer+1)%q.choices.length:q.answer}"]`);else await page.fill(`[data-cp-input="${i}"]`,String(bad?q.answer+1000:q.answer).replace('.',','));}}

test('experienced learners test out of unit 1 and land in unit 2',async()=>{const page=await open();await page.waitForSelector('.unit-check');assert.match(await page.locator('.unit-check').first().innerText(),/Test out/);
 await page.click('.unit-check [data-lesson="check1"]');await page.waitForSelector('.checkpoint');assert.equal(await page.locator('#cp-submit').isDisabled(),true);
 await answerCheckpoint(page,'check1');await page.click('#cp-submit');assert.match(await page.locator('#feedback').innerText(),/5 \/ 5 correct/);await page.click('#cp-submit');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/Unit 1 passed/);
 await page.click('.success [data-nav="home"]');await page.waitForSelector('.unit');assert.equal(await page.locator('[data-lesson="rows"].lesson-node').isDisabled(),false);assert.equal(await page.locator('[data-lesson="setup"].lesson-node').isDisabled(),false);assert.match(await page.locator('.unit .unit-status').first().innerText(),/PASSED/);assert.match(await page.locator('.continue-card h2').innerText(),/Hidden connections/);assert.deepEqual(page.errors,[]);await page.close();});

test('a failed checkpoint explains, keeps right answers and allows a retry',async()=>{const page=await open('#/lesson/check3',{completed:unit12});await page.waitForSelector('.checkpoint');await answerCheckpoint(page,'check3',{wrong:[0,1]});await page.click('#cp-submit');
 assert.match(await page.locator('#feedback').innerText(),/3 \/ 5 correct\. You need 4/);assert.equal(await page.locator('.cp-q.bad').count(),2);assert.match(await page.locator('.cp-q.bad .cp-explain').first().innerText(),/Answer: 100 ms/);
 await page.click('#cp-submit');assert.equal(await page.locator('[data-cp-input="0"]').inputValue(),'');assert.equal(await page.locator('[data-cp-input="2"]').inputValue(),'25');assert.equal(await page.locator('#cp-submit').isDisabled(),true);await page.close();});

test('unit 5 dimmer: hit three PWM targets',async()=>{const page=await open('#/lesson/dimmer',{completed:['check1','check2','check3','check4','pwm']});await page.waitForSelector('#pwm-value');
 await setRange(page,'#pwm-value',100);await page.click('#pwm-check');assert.match(await page.locator('#pwm-state').innerText(),/Not yet: 100 is 39%/);
 for(const v of [64,191,26]){await setRange(page,'#pwm-value',v);assert.ok((await page.locator('#sketch').innerText()).includes(`analogWrite(LED_PIN, ${v})`));await page.click('#pwm-check');}
 await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/You control the brightness/);assert.deepEqual(page.errors,[]);await page.close();});

test('unit 5 mixer: match three colors with channel hints',async()=>{const page=await open('#/lesson/mixer',{completed:['check1','check2','check3','check4','pwm','dimmer','rgb']});await page.waitForSelector('#rgb-0');
 await page.click('#rgb-check');assert.match(await page.locator('#rgb-state').innerText(),/more red, more green/);
 for(const c of [[255,128,0],[0,255,255],[128,0,255]]){for(const i of [0,1,2])await setRange(page,`#rgb-${i}`,c[i]);await page.click('#rgb-check');}
 await page.click('#finish-lab');await page.waitForSelector('.success');await page.close();});

test('unit 5 knob: wrong map() range clips, right range passes after both ends',async()=>{const page=await open('#/lesson/knob',{completed:['check1','check2','check3','check4','pwm','dimmer','rgb','mixer','adc']});await page.waitForSelector('#kb-raw');
 await page.fill('#kb-in','1023');await page.fill('#kb-out','255');await setRange(page,'#kb-raw',3000);assert.match(await page.locator('#kb-state').innerText(),/goes above 255/);assert.match(await page.locator('#kb-sketch').innerText(),/map\(raw, 0, 1023, 0, 255\)/);
 await page.fill('#kb-in','4095');await setRange(page,'#kb-raw',0);assert.equal(await page.locator('#finish-lab').isDisabled(),true);await setRange(page,'#kb-raw',4095);assert.match(await page.locator('#kb-serial').innerText(),/level 255/);
 await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/Your own dimmer/);await page.close();});

test('free workshop: button program on the breadboard and a free color lab',async()=>{const page=await open('#/workshop');await page.waitForSelector('#ws-program');await page.selectOption('#ws-program','button');
 await page.click('[data-add="resistor"]');await page.click(hole(3,0));await page.click('[data-add="led"]');await page.click(hole(6,0));await page.click('[data-pin="gpio"]');await page.click(hole(3,2));await page.click(hole(7,2));await page.click('[data-pin="gnd"]');
 await page.click('[data-add="button"]');await page.click(hole(9,1));await page.click('[data-pin="gpio22"]');await page.click(hole(9,7));await page.click(hole(11,7));await page.click('[data-pin="gnd"]');await page.click('#run-lab');
 const box=await page.locator('#press').boundingBox();await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.waitForFunction(()=>document.querySelector('#led-bulb').getAttribute('fill')==='#ff8348');await page.mouse.up();
 await page.click('[data-ws="color"]');await page.waitForSelector('#rgb-0');await setRange(page,'#rgb-2',255);assert.match(await page.locator('#rgb-sketch').innerText(),/analogWrite\(BLUE_PIN, 255\)/);await setRange(page,'#kb-raw',4095);assert.match(await page.locator('#kb-serial').innerText(),/level 255/);assert.deepEqual(page.errors,[]);await page.close();});

test('checkpoint questions switch to Turkish',async()=>{const page=await open('#/lesson/check1');await page.waitForSelector('.checkpoint');await page.click('[data-lang="tr"]');assert.match(await page.locator('.cp-q h3').first().innerText(),/İlk 5 saniyede/);assert.match(await page.locator('#cp-submit').innerText(),/Cevapları kontrol et/);await page.close();});
