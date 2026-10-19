// Owner access (see tools/owner-key.mjs). Contains only a salted PBKDF2-SHA256 hash, never the passphrase.
export const OWNER={salt:'9680043dd40f31b44255faa5e24b8d35',iterations:200000,hash:'ad1fd4f214abd5ba677062e72f0254692a9aa7d75cad9e4a171a841ab5ad5f83'};
export const OWNER_FLAG='pin-by-pin-owner';
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
export async function deriveHash(pass,rec=OWNER){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(String(pass).normalize('NFKC')),'PBKDF2',false,['deriveBits']);
 const salt=Uint8Array.from(rec.salt.match(/../g).map(h=>parseInt(h,16)));return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:rec.iterations},key,256));}
export async function verifyOwner(pass,rec=OWNER){try{return (await deriveHash(pass,rec))===rec.hash;}catch{return false;}}
// the flag stores the hash, so changing the passphrase signs every browser out
export function isOwner(storage=globalThis.localStorage){try{return storage.getItem(OWNER_FLAG)===OWNER.hash;}catch{return false;}}
export function signIn(storage=globalThis.localStorage){try{storage.setItem(OWNER_FLAG,OWNER.hash);}catch{}}
export function signOut(storage=globalThis.localStorage){try{storage.removeItem(OWNER_FLAG);}catch{}}
