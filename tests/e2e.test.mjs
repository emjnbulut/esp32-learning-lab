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

test('quiz: wrong answer explains, right answer completes once, progress survives refresh',async()=>{const page=await open();await page.click('.continue-card .primary');await page.waitForSelector('.quiz');assert.equal(new URL(page.url()).hash,'#/ders/board');
 await page.click('[data-choice="2"]');await page.click('#check-answer');await assert.doesNotReject(page.waitForSelector('#feedback.bad'));
 await page.click('[data-choice="0"]');await page.click('#check-answer');await page.waitForSelector('#feedback.good');await page.click('#check-answer');await page.waitForSelector('.success');assert.match(await page.locator('.earned').innerText(),/\+20 XP/);
 await page.reload();await page.waitForSelector('.quiz');await page.click('.close');await page.waitForSelector('.stat-star');assert.equal(await xp(page),'20');assert.equal(await page.locator('[data-lesson="serial"].lesson-node').isDisabled(),false);
 await page.goto(BASE+'#/defter');await page.click('.record [data-lesson="board"]');await page.click('[data-choice="0"]');await page.click('#check-answer');await page.click('#check-answer');assert.match(await page.locator('.earned').innerText(),/ZATEN/);await page.click('.success [data-nav="home"]');assert.equal(await xp(page),'20');await page.close();});

test('browser back returns from a lesson to the learning path',async()=>{const page=await open();await page.click('[data-lesson="board"].lesson-node');await page.waitForSelector('.quiz');await page.goBack();await page.waitForSelector('.hero');assert.equal(await page.locator('.quiz').count(),0);await page.close();});

test('lab: LED circuit lights, wrong topologies are explained',async()=>{const page=await open('#/ders/light',{completed:unit12});await page.waitForSelector('#bench');
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/LED ve 220/);
 await buildLED(page);assert.equal(await page.locator('.wire-delete').count(),2);assert.match(await page.locator('.wire-delete').first().innerText(),/GPIO 23 — c4/);
 await page.click('#reverse-led');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/ters/);await page.click('#reverse-led');
 await page.click('.wire-delete >> nth=1');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/tamamlanmadı/);
 await page.click(hole(7,3));await page.click('[data-pin="gnd"]');await page.click('[data-pin="gpio"]');await page.click('[data-pin="gnd"]');await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/GND doğrudan/);await page.click('.wire-delete >> nth=2');
 await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/Akım yolu tamamlandı/);await page.waitForFunction(()=>document.querySelector('#led-bulb').getAttribute('fill')==='#ff8348');
 await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled,null,{timeout:4000});await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/İlk ışığın yandı/);assert.deepEqual(page.errors,[]);await page.close();});

test('challenge only passes at 250 ms',async()=>{const page=await open('#/ders/challenge',{completed:[...unit12,'light','blink']});await page.waitForSelector('#bench');await buildLED(page);await setDelay(page,300);await page.click('#run-lab');
 await page.waitForFunction(()=>document.querySelector('#lab-feedback').classList.contains('bad'),null,{timeout:4000});assert.equal(await page.locator('#finish-lab').isDisabled(),true);
 await setDelay(page,250);assert.match(await page.locator('#sketch').innerText(),/delay\(250\)/);assert.match(await page.locator('#frequency').innerText(),/2\.00/);
 await page.waitForFunction(()=>!document.querySelector('#finish-lab').disabled,null,{timeout:4000});await page.click('#finish-lab');await page.waitForSelector('.success');assert.match(await page.locator('h1').innerText(),/Ritmi sen belirledin/);await page.close();});

test('keyboard: arrow keys move between holes and focus survives re-render',async()=>{const page=await open('#/atolye');await page.waitForSelector('#bench');
 assert.equal(await page.locator('[data-hole][tabindex="0"]').count(),1);
 await page.focus('[data-pin="gpio"]');await page.keyboard.press('Enter');await page.focus(hole(0,0));for(const k of ['ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown'])await page.keyboard.press(k);
 assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');await page.keyboard.press('Enter');
 assert.equal(await page.locator('.wire-delete').count(),1);assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');
 await page.focus('[data-add="led"]');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.dataset.hole),'3,2');await page.keyboard.press('Enter');assert.equal(await page.locator('[data-part="led"]').count(),1);await page.close();});

test('notebook export, reset and import restore progress',async()=>{const page=await open('#/defter',{completed:['board','serial']});await page.waitForSelector('#export-progress');
 const [download]=await Promise.all([page.waitForEvent('download'),page.click('#export-progress')]);const file=await download.path();const saved=JSON.parse(fs.readFileSync(file,'utf8'));assert.deepEqual(saved.completed,['board','serial']);
 await page.click('#reset-progress');await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent==='0');
 await page.setInputFiles('#progress-file',file);await page.waitForFunction(()=>document.querySelector('.stat-star b').textContent==='40');
 await page.setInputFiles('#progress-file',{name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"nope":1}')});await page.waitForSelector('.toast');assert.match(await page.locator('.toast').innerText(),/geçerli/);await page.close();});

test('phone width has no horizontal page scroll',async()=>{for(const hash of ['','#/atolye','#/defter']){const page=await open(hash,{width:390,height:844});await page.waitForSelector('.main');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390,hash);await page.close();}
 const page=await open('#/ders/light',{completed:unit12,width:390,height:844});await page.waitForSelector('#bench');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth),390);await buildLED(page);await page.click('#run-lab');assert.match(await page.locator('#lab-state').innerText(),/Akım yolu tamamlandı/);await page.close();});
