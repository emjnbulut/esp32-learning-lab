export const STORAGE_KEY='pin-by-pin-progress-v1';
export const lessons=[
 {id:'board',unit:1,title:'Küçük kart, büyük işler',minutes:3,xp:20,type:'quiz',tag:'TANI',intro:'ESP32, yazdığın programı çalıştırır; pinleriyle dış dünyayla konuşur.',question:'Bir LED’i programla açıp kapatmak için hangi bağlantıyı kullanırsın?',choices:['GPIO: programla kontrol edilen pin','GND: ortak toprak','3V3: sabit besleme'],answer:0,explanation:'GPIO bir giriş veya çıkış olabilir. Çıkış olarak ayarladığında programın LED’i açıp kapatabilir. GND ortak referans, 3V3 ise beslemedir.',hint:'Programın değiştirebildiği bir çıkış arıyoruz.'},
 {id:'serial',unit:1,title:'Karttan ilk mesaj',minutes:3,xp:20,type:'quiz',tag:'OKU',intro:'Serial Monitor, kartın sana yazdığı mesajları gösterir. Gerçek kartta ve monitörde aynı baud değeri seçilir.',code:'void setup() {\n  Serial.begin(115200);\n  Serial.println("Merhaba, ESP32!");\n}\n\nvoid loop() {\n}',question:'Bu programın Serial Monitor çıktısı hangisi?',choices:['Merhaba, ESP32! — bir kez','Merhaba, ESP32! — durmadan','115200 — bir kez'],answer:0,explanation:'setup() kart başladığında bir kez çalışır. loop() tekrar eder ama burada içi boş. 115200 mesaj değil, seri iletişim hızıdır.',hint:'Mesaj setup() içinde mi, loop() içinde mi?'},
 {id:'setup',unit:1,title:'Programın ritmi',minutes:3,xp:20,type:'quiz',tag:'TAHMİN ET',intro:'Bir programı okumak, onu yazmaya başlamanın iyi bir yolu. Bu kez mesaj loop() içinde.',code:'void setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println("Bir adım daha");\n  delay(1000);\n}',question:'Mesaj yaklaşık hangi aralıkla tekrar edilir?',choices:['Bir saniyede bir','Bir milisaniyede bir','Sadece kart açıldığında'],answer:0,explanation:'delay() milisaniye cinsinden bekler. 1000 ms = 1 saniye. Sonra loop() yeniden çalışır.',hint:'1000 milisaniye kaç saniye eder?'},
 {id:'rows',unit:2,title:'Görünmeyen bağlantılar',minutes:3,xp:20,type:'quiz',tag:'KEŞFET',intro:'Breadboard’un içinde metal şeritler var. Aynı numaranın a–e delikleri bir gruptur; f–j delikleri başka bir gruptur.',question:'a7 deliğine giren bir kablo, hangi deliğe doğrudan bağlıdır?',choices:['e7','f7','a8'],answer:0,explanation:'a7, b7, c7, d7 ve e7 içeride bağlıdır. Ortadaki kanal nedeniyle f7 ayrı bir gruptadır. Komşu sütun a8 de ayrıdır.',hint:'Numara aynı kalmalı ve orta kanalı geçmemelisin.'},
 {id:'resistor',unit:2,title:'Küçük parçanın büyük görevi',minutes:3,xp:20,type:'quiz',tag:'ANLA',intro:'LED ile seri bağlanan direnç akımı sınırlar. Kırmızı LED için yaklaşık 2 V, GPIO için 3,3 V düşünelim.',question:'220 Ω dirençten yaklaşık ne kadar akım geçer?',choices:['6 mA: (3,3 − 2) / 220','15 A: 3,3 − 220','0 mA: direnç akımı tamamen keser'],answer:0,explanation:'Direnç üzerinde yaklaşık 1,3 V kalır. 1,3 V / 220 Ω ≈ 0,0059 A, yani 5,9 mA. Bu basitleştirilmiş modelde LED’in ileri gerilimini 2 V kabul ediyoruz.',hint:'Ohm kanunu: akım = direnç üzerindeki gerilim / direnç.'},
 {id:'polarity',unit:2,title:'Bir devrenin iki ucu',minutes:3,xp:20,type:'quiz',tag:'BAĞLA',intro:'LED’in yönü önemlidir. Uzun bacak anot (+), kısa bacak katottur (−). Kapalı bir akım yolu kurmalıyız.',question:'Aşağıdaki bağlantılardan hangisi doğru bir başlangıç?',choices:['GPIO 23 → direnç → LED + → LED − → GND','GPIO 23 → LED − → LED + → direnç → GND','GPIO 23 → direnç → LED +; LED − boş'],answer:0,explanation:'Akım yolu GPIO’dan direnç ve LED üzerinden GND’ye tamamlanır. Ters LED bu modelde yanmaz; boşta kalan bacakta da devre kapanmaz.',hint:'Hem yönü hem de GND’ye dönüş yolunu kontrol et.'},
 {id:'light',unit:3,title:'İlk ışığını yak',minutes:5,xp:40,type:'lab',mode:'steady',tag:'KUR',intro:'Şimdi sıra sende. Direnci ve LED’i breadboard’a yerleştir. GPIO 23’ten direnç üzerinden LED’in + bacağına, − bacağından GND’ye bir yol kur.',hint:'Bir örnek: direnç a4–a7, LED a7–a8. GPIO 23 → c4 ve c8 → GND kablolarını bağla. Aynı sütundaki a–e delikleri bağlıdır.'},
 {id:'blink',unit:3,title:'Işığa bir ritim ver',minutes:5,xp:40,type:'lab',mode:'blink',tag:'PROGRAMLA',intro:'Aynı devre, yeni davranış. Bekleme süresini değiştir, LED’in ritmini gözlemle. Bir tam yanıp sönme iki bekleme süresidir.',hint:'500 ms açık + 500 ms kapalı = 1 saniyelik bir döngü. Devre bağlantıları ilk görevle aynı.'},
 {id:'challenge',unit:3,title:'Sıra sende: iki kez yanıp sön',minutes:5,xp:60,type:'lab',mode:'challenge',tag:'MEYDAN OKUMA',intro:'Hedef: LED bir saniyede iki tam yanıp sönme döngüsü tamamlasın. Devreni kur ve iki delay() için aynı doğru süreyi seç.',hint:'Bir döngü açık ve kapalı olmak üzere iki parçadan oluşur. İki döngü toplam dört eşit bekleme demektir.'},
 {id:'pullup',unit:4,title:'Buton ne söyler?',minutes:3,xp:20,type:'quiz',tag:'TANI',intro:'Butonun dört bacağı var ama içi basit bir anahtar. Soldaki iki bacak hep birbirine bağlı, sağdaki iki bacak da öyle. Bastığında sol ve sağ birleşir. Bu ünitede buton GPIO 22 ile GND arasında duruyor.',code:'void setup() {\n  pinMode(22, INPUT_PULLUP);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(digitalRead(22));\n  delay(50);\n}',question:'Butona basılmıyorken Serial Monitor’de ne yazar?',choices:['1 (HIGH): iç pull-up pini 3,3 V’a çeker','0 (LOW): buton GND’ye bağlı','Rastgele 0 ve 1: pin boşta'],answer:0,explanation:'INPUT_PULLUP, ESP32’nin içindeki yaklaşık 45 kΩ’luk direnci açar ve pini HIGH’a çeker. Bastığında buton pini doğrudan GND’ye bağlar. Buton zayıf direnci yener ve okuma LOW, yani 0 olur.',hint:'Pull-up, pini yukarı, yani 3,3 V’a çeker.'},
 {id:'floating',unit:4,title:'Boşta kalan pin',minutes:3,xp:20,type:'quiz',tag:'ANLA',intro:'Hiçbir yere bağlı olmayan bir pin “boşta” (floating) kalır. Havadaki parazitleri, hatta elinin yakınlığını bile algılar.',code:'void setup() {\n  pinMode(22, INPUT);   // pull-up yok\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(digitalRead(22));\n  delay(50);\n}',question:'Aynı devrede, butona basılmıyorken ne görürsün?',choices:['Rastgele zıplayan 0 ve 1’ler','Hep 1','Hep 0'],answer:0,explanation:'INPUT modunda iç direnç kapalıdır. Basılmayan buton pini hiçbir yere bağlamaz, okuma rastgele değişir. INPUT_PULLUP pini sakinleştirir. Diğer yol, pinden GND’ye 10 kΩ’luk bir pull-down direnç ve 3,3 V’a giden bir buton; o zaman basınca HIGH okunur.',hint:'Basılı değilken pine ne bağlı?'},
 {id:'button',unit:4,title:'Buton bir LED yaksın',minutes:6,xp:40,type:'lab',mode:'button',tag:'KUR',intro:'LED devren hazır. Butonu breadboard’un ortasındaki kanalın üzerine yerleştir. GPIO 22’yi butonun bir yanına, diğer yanını GND’ye bağla. Sonra devreyi çalıştır, butona bas ve bırak.',hint:'Buton e ve f satırlarına oturur. Örnek: butonu 10. sütuna koy (10–12). GPIO 22 → h10 ve h12 → GND kablolarını bağla. Kablo ve GND butonun aynı yanına gelirse pin hep LOW okur.'},
 {id:'bounce',unit:4,title:'Bir basış, bir sayı',minutes:5,xp:40,type:'bounce',tag:'ÖLÇ',intro:'Metal kontaklar birbirine değerken birkaç milisaniye zıplar. ESP32 pini çok hızlı okuduğu için tek basış birkaç basış gibi görünebilir. Her değişimden sonra kısa bir süre yeni değişimleri yok say: buna debounce denir.',hint:'Buradaki zıplamalar 20 ms’den kısa sürüyor. Videoda 50 ms kullanılıyor; biraz pay bırakmak iyidir.'},
 {id:'millis',unit:4,title:'Saate bak, bekleme',minutes:3,xp:20,type:'quiz',tag:'HESAPLA',intro:'millis(), kart açıldığından beri geçen milisaniyeleri verir ve kendi kendine sayar. Beklemek yerine her döngüde saate bakarız: son değişimden beri 500 ms geçti mi?',code:'unsigned long now = millis();\nif (now - lastBlink >= 500) {\n  lastBlink = now;\n  ledOn = !ledOn;\n  digitalWrite(LED_PIN, ledOn ? HIGH : LOW);\n}',question:'lastBlink 700, now 1000. Bu döngüde ne olur?',choices:['Hiçbir şey: 1000 − 700 = 300, henüz 500 değil','LED değişir: 1000, 500’den büyük','Program 200 ms bekler'],answer:0,explanation:'Her zaman çıkarırız: now − lastBlink. 300 < 500, koşul sağlanmaz ve loop beklemeden devam eder. now 1200 olduğunda 500 ms dolar, LED değişir ve lastBlink 1200 olur. Çıkarma, millis() yaklaşık 49,7 günde bir sıfırlandığında bile doğru çalışır.',hint:'Koşuldaki farkı hesapla: now − lastBlink.'},
 {id:'nowait',unit:4,title:'Aynı anda iki iş',minutes:6,xp:60,type:'nowait',tag:'MEYDAN OKUMA',intro:'LED yanıp sönerken butonu da dinlemek istiyoruz. Her basış yanıp sönmeyi durdurur ya da yeniden başlatır. Önce delay() sürümünde butona birkaç kez kısaca bas. Sonra millis() sürümüne geç ve üst üste üç basışı kaçırmadan yakala.',hint:'delay() beklerken ESP32 butona hiç bakmaz; buton yalnızca beklemelerin arasında okunur. millis() sürümünde loop hiç beklemez.'}
];
export const units=[
 {id:1,title:'Kartla tanış',subtitle:'Bir bilgisayar, avucunun içinde.',source:'01-setup',available:true},
 {id:2,title:'Bağlantıları keşfet',subtitle:'Deliklerin altında bir düzen var.',source:'02-board-and-breadboard',available:true},
 {id:3,title:'İlk ışığını yak',subtitle:'Devreni kur. Kodunu değiştir. Sonucunu gör.',source:'03-blink-an-led',available:true},
 {id:4,title:'Butonlar ve zaman',subtitle:'digitalRead, debounce ve millis()',source:'04-buttons-and-millis',available:true},
 {id:5,title:'Işığın ayarı sende',subtitle:'PWM, RGB ve potansiyometre'},
 {id:6,title:'Işık ve ses',subtitle:'LDR, buzzer ve melodiler'},
 {id:7,title:'Ortamı hisset',subtitle:'DHT11, I²C ve OLED ekran'},
 {id:8,title:'Hareketi yakala',subtitle:'PIR, engel sensörü ve kesmeler'},
 {id:9,title:'Dünyaya bağlan',subtitle:'Röleler ve Wi-Fi'},
 {id:10,title:'Sensörün bir web sayfası olsun',subtitle:'Web sunucusu ve canlı veriler'},
 {id:11,title:'Kendi akıllı odan',subtitle:'Öğrendiklerini bir projede birleştir'}
];
export function sanitizeProgress(value){
 const known=new Set(lessons.map(l=>l.id));
 const completed=Array.isArray(value?.completed)?[...new Set(value.completed.filter(id=>known.has(id)))]:[];
 const dates=Array.isArray(value?.dates)?[...new Set(value.dates.filter(d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)))].slice(-366):[];
 return {version:1,completed,dates};
}
export function nextLesson(progress){return lessons.find(l=>!progress.completed.includes(l.id));}
export function canOpen(id,p){const i=lessons.findIndex(l=>l.id===id);return i>=0&&lessons.slice(0,i).every(l=>p.completed.includes(l.id));}
export function totalXP(p){return lessons.filter(l=>p.completed.includes(l.id)).reduce((n,l)=>n+l.xp,0);}
export function complete(p,id,date){if(!lessons.some(l=>l.id===id)||!canOpen(id,p))return p;return sanitizeProgress({completed:[...p.completed,id],dates:[...p.dates,date]});}
export const holeId=(c,r)=>`${r<5?'t':'b'}${c}`;
export function terminals(part){return [holeId(part.col,part.row),holeId(part.col+(part.kind==='resistor'?3:1),part.row)];}
export const net=id=>id.split(':')[0];
export function buttonSides(b){const t=c=>'t'+c,d=c=>'b'+c;return b.rotated?[[t(b.col),t(b.col+2)],[d(b.col),d(b.col+2)]]:[[t(b.col),d(b.col)],[t(b.col+2),d(b.col+2)]];}
function graph(circuit,pressed=false){
 const parent=new Map();const find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
 const join=(a,b)=>parent.set(find(a),find(b));
 for(const [a,b] of circuit.wires)join(net(a),net(b));
 const button=circuit.parts.find(p=>p.kind==='button');
 if(button){const [l,r]=buttonSides(button);join(...l);join(...r);if(pressed)join(l[0],r[0]);}
 return (a,b)=>find(a)===find(b);
}
export function inputLevel(circuit,{pressed=false,pullup=true}={}){const same=graph(circuit,pressed);if(same('vcc','gnd')||same('gpio','gnd'))return 'SHORT';if(same('gpio22','gnd'))return 'LOW';if(same('gpio22','vcc'))return 'HIGH';return pullup?'HIGH':'FLOAT';}
export function buttonState(circuit,pullup=true){
 if(!circuit.parts.some(p=>p.kind==='button'))return {ok:false,code:'no-button',message:'Önce butonu breadboard’un ortasındaki kanalın üzerine yerleştir.'};
 const up=inputLevel(circuit,{pressed:false,pullup}),down=inputLevel(circuit,{pressed:true,pullup});
 if(down==='SHORT')return {ok:false,code:'short',message:'Butona basınca besleme GND’ye kısa devre oluyor. GPIO 22’yi 3V3’e değil, butona bağla.'};
 if(up==='LOW')return {ok:false,code:'always-low',message:'Butona basmadan da GPIO 22 GND’ye bağlı. Buton yan dönmüş olabilir ya da bir kablo butonu atlıyor.'};
 if(down!=='LOW')return {ok:false,code:'no-path',message:'Butona bastığında GPIO 22 GND’ye ulaşmıyor. GPIO 22 butonun bir yanına, diğer yanı GND’ye gitmeli.'};
 if(up==='FLOAT')return {ok:true,code:'floating',message:'Bağlantı doğru ama pull-up kapalı: basılmayan pin boşta kalıyor.'};
 return {ok:true,code:'button-ok',message:'Buton hazır: basılı değilken HIGH (1), basınca LOW (0).'};
}
export function circuitState(circuit){
 const same=graph(circuit);
 if(same('gpio','gnd')||same('vcc','gnd'))return {ok:false,code:'short',message:'Besleme ile GND doğrudan bağlı. Kısa devre kablosunu kaldır.'};
 const led=circuit.parts.find(p=>p.kind==='led');const resistor=circuit.parts.find(p=>p.kind==='resistor');
 if(!led||!resistor)return {ok:false,code:'parts',message:'Önce bir LED ve 220 Ω direnç yerleştir.'};
 let [anode,cathode]=terminals(led);if(led.reversed)[anode,cathode]=[cathode,anode];
 const [ra,rb]=terminals(resistor);
 if(same(anode,cathode))return {ok:false,code:'bypass-led',message:'LED’in iki bacağı aynı hatta bağlı. LED üzerinden gerilim oluşmuyor.'};
 if((same('gpio',anode)||same('vcc',anode))&&same(cathode,'gnd'))return {ok:false,code:'no-resistor',message:'LED direnci atlayan bir yola bağlı. Direnci LED ile seri bağla.'};
 if(same(ra,rb))return {ok:false,code:'bypass-resistor',message:'Direncin uçlarını bir kabloyla birleştirmişsin. Akım sınırlamak için bu köprüyü kaldır.'};
 const viaR=(s,d)=>(same(s,ra)&&same(rb,d))||(same(s,rb)&&same(ra,d));
 if((viaR('gpio',anode)&&same(cathode,'gnd'))||(same('gpio',anode)&&viaR(cathode,'gnd')))return {ok:true,code:'powered',message:'Akım yolu tamamlandı: GPIO 23 → direnç → LED → GND.',current:5.9};
 if((viaR('gpio',cathode)&&same(anode,'gnd'))||(same('gpio',cathode)&&viaR(anode,'gnd')))return {ok:false,code:'reversed',message:'LED ters yönde. LED’i seçip “Yönü çevir” ile anot ve katodu değiştir.'};
 if(viaR('vcc',anode)&&same(cathode,'gnd'))return {ok:false,code:'fixed-power',message:'3V3 sabit beslemedir. Bu görevde kodla kontrol etmek için GPIO 23 kullan.'};
 return {ok:false,code:'open',message:'Akım yolu henüz tamamlanmadı. GPIO 23, direnç, LED ve GND arasındaki bağlantıları izle.'};
}
export function makeSketch(mode,delay,pullup=true){if(mode==='button')return `const int BUTTON_PIN = 22;  // buton bu pini GND’ye çeker\nconst int LED_PIN = 23;\n\nvoid setup() {\n  pinMode(BUTTON_PIN, ${pullup?'INPUT_PULLUP':'INPUT'});\n  pinMode(LED_PIN, OUTPUT);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  int state = digitalRead(BUTTON_PIN);\n  Serial.println(state);\n  digitalWrite(LED_PIN, state == LOW ? HIGH : LOW);\n  delay(50);\n}\n`;return `const int LED_PIN = 23;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);${mode==='steady'?'':`\n  delay(${delay});\n  digitalWrite(LED_PIN, LOW);\n  delay(${delay});`}\n}\n`;}
export function bounceSignal(seed){let s=seed%2147483646+1;const rnd=()=>(s=s*16807%2147483647)/2147483647;const out=[];const push=(v,n)=>{for(let i=0;i<n;i++)out.push(v);};const chatter=to=>{for(let i=2+Math.floor(rnd()*3);i>0;i--){push(to,1+Math.floor(rnd()*2));push(1-to,1+Math.floor(rnd()*2));}push(to,1);};push(1,20);chatter(0);push(0,130);chatter(1);push(1,30);return out;}
export function debounce(signal,ms){let last=1,lastChange=-Infinity;const accepted=[];signal.forEach((v,t)=>{if(v!==last&&t-lastChange>=ms){lastChange=t;last=v;accepted.push([t,v]);}});return accepted;}
export const countPresses=(signal,ms)=>debounce(signal,ms).filter(([,v])=>v===0).length;
export function caught(press,mode,period=500){return mode==='millis'||Math.floor(press.up/period)*period>=press.down;}
export function makeTimerSketch(mode){return mode==='delay'?`void loop() {\n  int state = digitalRead(BUTTON_PIN);\n  if (state == LOW && lastState == HIGH) blinking = !blinking;\n  lastState = state;\n\n  ledOn = blinking ? !ledOn : false;\n  digitalWrite(LED_PIN, ledOn ? HIGH : LOW);\n  delay(500);   // ESP32 burada butona bakmaz\n}\n`:`void loop() {\n  unsigned long now = millis();\n\n  int state = digitalRead(BUTTON_PIN);\n  if (state != lastState && now - lastChange >= 50) {\n    lastChange = now;\n    lastState = state;\n    if (state == LOW) blinking = !blinking;\n  }\n\n  if (blinking && now - lastBlink >= 500) {\n    lastBlink = now;\n    ledOn = !ledOn;\n  }\n  if (!blinking) ledOn = false;\n  digitalWrite(LED_PIN, ledOn ? HIGH : LOW);\n\n  if (now - lastGreen >= 150) {   // yeşil LED kendi hızında\n    lastGreen = now;\n    greenOn = !greenOn;\n    digitalWrite(GREEN_PIN, greenOn ? HIGH : LOW);\n  }\n}\n`;}
export function makeDebounceSketch(ms){return `void loop() {\n  unsigned long now = millis();\n  int state = digitalRead(BUTTON_PIN);\n\n  if (state != lastState && now - lastChange >= ${ms}) {\n    lastChange = now;\n    lastState = state;\n    if (state == LOW) presses++;   // yeni basış\n  }\n}\n`;}
