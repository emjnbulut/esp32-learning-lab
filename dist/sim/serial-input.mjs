// Buffered USB serial input; blocking Stream reads yield to the simulation clock.
export const SERIAL_CAPACITY=4096;
const encode=s=>new TextEncoder().encode(String(s));
export class SerialInput{
 constructor(host){this.host=host;this.bytes=[];this.timeout=1000;}
 get available(){return this.bytes.length;}
 clear(){this.bytes.length=0;}
 enqueue(text){const bytes=encode(text);if(bytes.length+this.available>SERIAL_CAPACITY)return false;this.bytes.push(...bytes);return true;}
 peek(){return this.bytes[0]??-1;}
 read(){return this.available?this.bytes.shift():-1;}
 *waitByte(){
  const h=this.host,end=h.clock+this.timeout*1000;
  while(!this.available&&h.clock<end){h.clock=Math.min(end,Math.max(h.clock+1,h.deadline));yield;}
  return this.peek();
 }
 *readString(until=null){
  const bytes=[];
  for(;;){const byte=yield* this.waitByte();if(byte<0)break;this.read();if(byte===until)break;bytes.push(byte);}
  return new TextDecoder().decode(new Uint8Array(bytes));
 }
 *parseNumber(decimal=false){
  let byte;
  const digit=b=>b>=48&&b<=57;
  for(;;){byte=yield* this.waitByte();if(byte<0)return 0;if(digit(byte)||byte===45||decimal&&byte===46)break;this.read();}
  let text='',point=false;
  if(byte===45){text+='-';this.read();byte=yield* this.waitByte();}
  while(digit(byte)||decimal&&!point&&byte===46){
   text+=String.fromCharCode(byte);if(byte===46)point=true;this.read();byte=yield* this.waitByte();
  }
  return (decimal?Number.parseFloat(text):Number.parseInt(text,10))||0;
 }
}
