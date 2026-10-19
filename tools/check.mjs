import {spawnSync} from 'node:child_process';import fs from 'node:fs';
for(const file of ['dist/app.mjs','dist/model.mjs','dist/i18n.mjs','dist/sim/arduino.mjs','dist/sim/circuit.mjs','dist/sim/runtime.mjs','tools/serve.mjs']){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status)process.exit(r.status);}
for(const file of ['dist/index.html','dist/style.css','dist/favicon.svg','dist/i18n.mjs'])if(!fs.existsSync(file))throw new Error('Missing '+file);
const r=spawnSync(process.execPath,['--test','tests/model.test.mjs','tests/i18n.test.mjs','tests/arduino.test.mjs','tests/sim.test.mjs','tests/missions.test.mjs'],{stdio:'inherit'});process.exit(r.status);
