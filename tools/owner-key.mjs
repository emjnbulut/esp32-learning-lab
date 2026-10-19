// Sets (or creates) the owner passphrase. Only a PBKDF2 hash is written to dist/owner.mjs.
//   node tools/owner-key.mjs                 -> generates a random passphrase and prints it once
//   node tools/owner-key.mjs "my passphrase" -> uses your own passphrase
// Note: the site is static, so this is a door lock for ordinary visitors, not real security.
import {pbkdf2Sync,randomBytes} from 'node:crypto';import fs from 'node:fs';
const ITER=200000;
let pass=process.argv[2];let generated=false;
if(!pass){const alphabet='abcdefghjkmnpqrstuvwxyz23456789';const pick=n=>Array.from(randomBytes(n),b=>alphabet[b%alphabet.length]).join('');pass=[pick(4),pick(4),pick(4),pick(4)].join('-');generated=true;}
const salt=randomBytes(16).toString('hex');const hash=pbkdf2Sync(pass.normalize('NFKC'),Buffer.from(salt,'hex'),ITER,32,'sha256').toString('hex');
fs.writeFileSync(new URL('../dist/owner.mjs',import.meta.url),`// Owner access (see tools/owner-key.mjs). Contains only a salted PBKDF2-SHA256 hash, never the passphrase.
export const OWNER={salt:'${salt}',iterations:${ITER},hash:'${hash}'};
export const OWNER_FLAG='pin-by-pin-owner';
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
export async function deriveHash(pass,rec=OWNER){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(pass).normalize('NFKC')),'PBKDF2',false,['deriveBits']);
 const salt=Uint8Array.from(rec.salt.match(/../g).map(h=>parseInt(h,16)));return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:rec.iterations},key,256));}
export async function verifyOwner(pass,rec=OWNER){try{return (await deriveHash(pass,rec))===rec.hash;}catch{return false;}}
// the flag stores the hash, so changing the passphrase signs every browser out
export function isOwner(storage=globalThis.localStorage){try{return storage.getItem(OWNER_FLAG)===OWNER.hash;}catch{return false;}}
export function signIn(storage=globalThis.localStorage){try{storage.setItem(OWNER_FLAG,OWNER.hash);}catch{}}
export function signOut(storage=globalThis.localStorage){try{storage.removeItem(OWNER_FLAG);}catch{}}
`);
console.log(generated?`New owner passphrase (write it down, it is not stored anywhere): ${pass}`:'Owner passphrase updated.');
