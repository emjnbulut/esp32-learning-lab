import {spawnSync} from 'node:child_process';import fs from 'node:fs';
for(const file of ['dist/app.mjs','dist/model.mjs','tools/serve.mjs']){const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});if(r.status)process.exit(r.status);}
for(const file of ['dist/index.html','dist/style.css','dist/favicon.svg'])if(!fs.existsSync(file))throw new Error('Missing '+file);
const r=spawnSync(process.execPath,['--test','tests/model.test.mjs'],{stdio:'inherit'});process.exit(r.status);
