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
 {id:'challenge',unit:3,title:'Sıra sende: iki kez yanıp sön',minutes:5,xp:60,type:'lab',mode:'challenge',tag:'MEYDAN OKUMA',intro:'Hedef: LED bir saniyede iki tam yanıp sönme döngüsü tamamlasın. Devreni kur ve iki delay() için aynı doğru süreyi seç.',hint:'Bir döngü açık ve kapalı olmak üzere iki parçadan oluşur. İki döngü toplam dört eşit bekleme demektir.'}
];
export const units=[
 {id:1,title:'Kartla tanış',subtitle:'Bir bilgisayar, avucunun içinde.',source:'01-setup',available:true},
 {id:2,title:'Bağlantıları keşfet',subtitle:'Deliklerin altında bir düzen var.',source:'02-board-and-breadboard',available:true},
 {id:3,title:'İlk ışığını yak',subtitle:'Devreni kur. Kodunu değiştir. Sonucunu gör.',source:'03-blink-an-led',available:true},
 {id:4,title:'Butonlar ve zaman',subtitle:'digitalRead, debounce ve millis()',source:'04-buttons-and-millis'},
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
export function circuitState(circuit){
 const parent=new Map();const find=x=>{if(!parent.has(x))parent.set(x,x);if(parent.get(x)!==x)parent.set(x,find(parent.get(x)));return parent.get(x);};
 const join=(a,b)=>parent.set(find(a),find(b));
 for(const [a,b] of circuit.wires)join(net(a),net(b));
 const same=(a,b)=>find(a)===find(b);
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
export function makeSketch(mode,delay){return `const int LED_PIN = 23;\n\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\n\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);${mode==='steady'?'':`\n  delay(${delay});\n  digitalWrite(LED_PIN, LOW);\n  delay(${delay});`}\n}\n`;}
