// Turkish content. English is the source language (model.mjs, app.mjs); TR maps each English UI string to Turkish.
export const TR_UNITS={
 1:{"title": "Kartla tanış","subtitle": "Bir bilgisayar, avucunun içinde."},
 2:{"title": "Bağlantıları keşfet","subtitle": "Deliklerin altında bir düzen var."},
 3:{"title": "İlk ışığını yak","subtitle": "Devreni kur. Kodunu değiştir. Sonucunu gör."},
 4:{"title": "Butonlar ve zaman","subtitle": "digitalRead, debounce ve millis()"},
 5:{"title": "Işığın ayarı sende","subtitle": "PWM, RGB ve potansiyometre"},
 6:{"title": "Işık ve ses","subtitle": "LDR, buzzer ve melodiler"},
 7:{"title": "Ortamı hisset","subtitle": "DHT11, I²C ve OLED ekran"},
 8:{"title": "Hareketi yakala","subtitle": "PIR, engel sensörü ve kesmeler"},
 9:{"title": "Dünyaya bağlan","subtitle": "Röleler ve Wi-Fi"},
 10:{"title": "Sensörün bir web sayfası olsun","subtitle": "Web sunucusu ve canlı veriler"},
 11:{"title": "Kendi akıllı odan","subtitle": "Öğrendiklerini bir projede birleştir"}
};
export const TR_LESSONS={
 board:{"title": "Küçük kart, büyük işler","tag": "TANI","intro": "ESP32, yazdığın programı çalıştırır; pinleriyle dış dünyayla konuşur.","question": "Bir LED’i programla açıp kapatmak için hangi bağlantıyı kullanırsın?","choices": ["GPIO: programla kontrol edilen pin","GND: ortak toprak","3V3: sabit besleme"],"explanation": "GPIO bir giriş veya çıkış olabilir. Çıkış olarak ayarladığında programın LED’i açıp kapatabilir. GND ortak referans, 3V3 ise beslemedir.","hint": "Programın değiştirebildiği bir çıkış arıyoruz."},
 serial:{"title": "Karttan ilk mesaj","tag": "OKU","intro": "Serial Monitor, kartın sana yazdığı mesajları gösterir. Gerçek kartta ve monitörde aynı baud değeri seçilir.","code": "void setup() {\n  Serial.begin(115200);\n  Serial.println(\"Merhaba, ESP32!\");\n}\n\nvoid loop() {\n}","question": "Bu programın Serial Monitor çıktısı hangisi?","choices": ["Merhaba, ESP32! — bir kez","Merhaba, ESP32! — durmadan","115200 — bir kez"],"explanation": "setup() kart başladığında bir kez çalışır. loop() tekrar eder ama burada içi boş. 115200 mesaj değil, seri iletişim hızıdır.","hint": "Mesaj setup() içinde mi, loop() içinde mi?"},
 setup:{"title": "Programın ritmi","tag": "TAHMİN ET","intro": "Bir programı okumak, onu yazmaya başlamanın iyi bir yolu. Bu kez mesaj loop() içinde.","code": "void setup() {\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(\"Bir adım daha\");\n  delay(1000);\n}","question": "Mesaj yaklaşık hangi aralıkla tekrar edilir?","choices": ["Bir saniyede bir","Bir milisaniyede bir","Sadece kart açıldığında"],"explanation": "delay() milisaniye cinsinden bekler. 1000 ms = 1 saniye. Sonra loop() yeniden çalışır.","hint": "1000 milisaniye kaç saniye eder?"},
 rows:{"title": "Görünmeyen bağlantılar","tag": "KEŞFET","intro": "Breadboard’un içinde metal şeritler var. Aynı numaranın a–e delikleri bir gruptur; f–j delikleri başka bir gruptur.","question": "a7 deliğine giren bir kablo, hangi deliğe doğrudan bağlıdır?","choices": ["e7","f7","a8"],"explanation": "a7, b7, c7, d7 ve e7 içeride bağlıdır. Ortadaki kanal nedeniyle f7 ayrı bir gruptadır. Komşu sütun a8 de ayrıdır.","hint": "Numara aynı kalmalı ve orta kanalı geçmemelisin."},
 resistor:{"title": "Küçük parçanın büyük görevi","tag": "ANLA","intro": "LED ile seri bağlanan direnç akımı sınırlar. Kırmızı LED için yaklaşık 2 V, GPIO için 3,3 V düşünelim.","question": "220 Ω dirençten yaklaşık ne kadar akım geçer?","choices": ["6 mA: (3,3 − 2) / 220","15 A: 3,3 − 220","0 mA: direnç akımı tamamen keser"],"explanation": "Direnç üzerinde yaklaşık 1,3 V kalır. 1,3 V / 220 Ω ≈ 0,0059 A, yani 5,9 mA. Bu basitleştirilmiş modelde LED’in ileri gerilimini 2 V kabul ediyoruz.","hint": "Ohm kanunu: akım = direnç üzerindeki gerilim / direnç."},
 polarity:{"title": "Bir devrenin iki ucu","tag": "BAĞLA","intro": "LED’in yönü önemlidir. Uzun bacak anot (+), kısa bacak katottur (−). Kapalı bir akım yolu kurmalıyız.","question": "Aşağıdaki bağlantılardan hangisi doğru bir başlangıç?","choices": ["GPIO 23 → direnç → LED + → LED − → GND","GPIO 23 → LED − → LED + → direnç → GND","GPIO 23 → direnç → LED +; LED − boş"],"explanation": "Akım yolu GPIO’dan direnç ve LED üzerinden GND’ye tamamlanır. Ters LED bu modelde yanmaz; boşta kalan bacakta da devre kapanmaz.","hint": "Hem yönü hem de GND’ye dönüş yolunu kontrol et."},
 light:{"title": "İlk ışığını yak","tag": "KUR","intro": "Şimdi sıra sende. Direnci ve LED’i breadboard’a yerleştir. GPIO 23’ten direnç üzerinden LED’in + bacağına, − bacağından GND’ye bir yol kur.","hint": "Bir örnek: direnç a4–a7, LED a7–a8. GPIO 23 → c4 ve c8 → GND kablolarını bağla. Aynı sütundaki a–e delikleri bağlıdır."},
 blink:{"title": "Işığa bir ritim ver","tag": "PROGRAMLA","intro": "Aynı devre, yeni davranış. Bekleme süresini değiştir, LED’in ritmini gözlemle. Bir tam yanıp sönme iki bekleme süresidir.","hint": "500 ms açık + 500 ms kapalı = 1 saniyelik bir döngü. Devre bağlantıları ilk görevle aynı."},
 challenge:{"title": "Sıra sende: iki kez yanıp sön","tag": "MEYDAN OKUMA","intro": "Hedef: LED bir saniyede iki tam yanıp sönme döngüsü tamamlasın. Devreni kur ve iki delay() için aynı doğru süreyi seç.","hint": "Bir döngü açık ve kapalı olmak üzere iki parçadan oluşur. İki döngü toplam dört eşit bekleme demektir."},
 pullup:{"title": "Buton ne söyler?","tag": "TANI","intro": "Butonun dört bacağı var ama içi basit bir anahtar. Soldaki iki bacak hep birbirine bağlı, sağdaki iki bacak da öyle. Bastığında sol ve sağ birleşir. Bu ünitede buton GPIO 22 ile GND arasında duruyor.","code": "void setup() {\n  pinMode(22, INPUT_PULLUP);\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(digitalRead(22));\n  delay(50);\n}","question": "Butona basılmıyorken Serial Monitor’de ne yazar?","choices": ["1 (HIGH): iç pull-up pini 3,3 V’a çeker","0 (LOW): buton GND’ye bağlı","Rastgele 0 ve 1: pin boşta"],"explanation": "INPUT_PULLUP, ESP32’nin içindeki yaklaşık 45 kΩ’luk direnci açar ve pini HIGH’a çeker. Bastığında buton pini doğrudan GND’ye bağlar. Buton zayıf direnci yener ve okuma LOW, yani 0 olur.","hint": "Pull-up, pini yukarı, yani 3,3 V’a çeker."},
 floating:{"title": "Boşta kalan pin","tag": "ANLA","intro": "Hiçbir yere bağlı olmayan bir pin “boşta” (floating) kalır. Havadaki parazitleri, hatta elinin yakınlığını bile algılar.","code": "void setup() {\n  pinMode(22, INPUT);   // pull-up yok\n  Serial.begin(115200);\n}\n\nvoid loop() {\n  Serial.println(digitalRead(22));\n  delay(50);\n}","question": "Aynı devrede, butona basılmıyorken ne görürsün?","choices": ["Rastgele zıplayan 0 ve 1’ler","Hep 1","Hep 0"],"explanation": "INPUT modunda iç direnç kapalıdır. Basılmayan buton pini hiçbir yere bağlamaz, okuma rastgele değişir. INPUT_PULLUP pini sakinleştirir. Diğer yol, pinden GND’ye 10 kΩ’luk bir pull-down direnç ve 3,3 V’a giden bir buton; o zaman basınca HIGH okunur.","hint": "Basılı değilken pine ne bağlı?"},
 button:{"title": "Buton bir LED yaksın","tag": "KUR","intro": "LED devren hazır. Butonu breadboard’un ortasındaki kanalın üzerine yerleştir. GPIO 22’yi butonun bir yanına, diğer yanını GND’ye bağla. Sonra devreyi çalıştır, butona bas ve bırak.","hint": "Buton e ve f satırlarına oturur. Örnek: butonu 10. sütuna koy (10–12). GPIO 22 → h10 ve h12 → GND kablolarını bağla. Kablo ve GND butonun aynı yanına gelirse pin hep LOW okur."},
 bounce:{"title": "Bir basış, bir sayı","tag": "ÖLÇ","intro": "Metal kontaklar birbirine değerken birkaç milisaniye zıplar. ESP32 pini çok hızlı okuduğu için tek basış birkaç basış gibi görünebilir. Her değişimden sonra kısa bir süre yeni değişimleri yok say: buna debounce denir.","hint": "Buradaki zıplamalar 20 ms’den kısa sürüyor. Videoda 50 ms kullanılıyor; biraz pay bırakmak iyidir."},
 millis:{"title": "Saate bak, bekleme","tag": "HESAPLA","intro": "millis(), kart açıldığından beri geçen milisaniyeleri verir ve kendi kendine sayar. Beklemek yerine her döngüde saate bakarız: son değişimden beri 500 ms geçti mi?","code": "unsigned long now = millis();\nif (now - lastBlink >= 500) {\n  lastBlink = now;\n  ledOn = !ledOn;\n  digitalWrite(LED_PIN, ledOn ? HIGH : LOW);\n}","question": "lastBlink 700, now 1000. Bu döngüde ne olur?","choices": ["Hiçbir şey: 1000 − 700 = 300, henüz 500 değil","LED değişir: 1000, 500’den büyük","Program 200 ms bekler"],"explanation": "Her zaman çıkarırız: now − lastBlink. 300 < 500, koşul sağlanmaz ve loop beklemeden devam eder. now 1200 olduğunda 500 ms dolar, LED değişir ve lastBlink 1200 olur. Çıkarma, millis() yaklaşık 49,7 günde bir sıfırlandığında bile doğru çalışır.","hint": "Koşuldaki farkı hesapla: now − lastBlink."},
 nowait:{"title": "Aynı anda iki iş","tag": "MEYDAN OKUMA","intro": "LED yanıp sönerken butonu da dinlemek istiyoruz. Her basış yanıp sönmeyi durdurur ya da yeniden başlatır. Önce delay() sürümünde butona birkaç kez kısaca bas. Sonra millis() sürümüne geç ve üst üste üç basışı kaçırmadan yakala.","hint": "delay() beklerken ESP32 butona hiç bakmaz; buton yalnızca beklemelerin arasında okunur. millis() sürümünde loop hiç beklemez."}
};
export const TR={
 'Licenses':'Lisanslar',
 'Pin by Pin Lab — It starts with a pin.':'Pin by Pin Lab — Bir pinle başlar.',
 'Skip to content':'İçeriğe geç',
 'Start without a kit. Build, test and learn step by step with ESP32 From Zero. A free electronics workshop.':'Kitin olmadan başla. ESP32 From Zero ile adım adım devre kur, dene ve öğren. Ücretsiz elektronik atölyesi.',
 'Pin by Pin Lab home':'Pin by Pin Lab ana sayfa',
 'column {c} ({bank})':'{c}. sütun ({bank})',
 'Drawing of a circuit from GPIO 23 through a resistor to a red LED':'GPIO 23 üzerinden direnç ve kırmızı LED’e uzanan bir devre çizimi',
 'FIRST LIGHT.':'İLK IŞIK.',
 'YOUR WORK.':'SENİN ESERİN.',
 'Couldn’t save. You can download your progress from My notebook.':'Kayıt yapılamadı. Defterim’den ilerlemeni indirebilirsin.',
 'Main menu':'Ana menü',
 'Learning path':'Öğrenme yolu',
 'Workshop':'Atölye',
 'My notebook':'Defterim',
 'Free for everyone.':'Herkes için ücretsiz.',
 'No kit yet?<br>You can still start.':'Bir kitin olmasa da<br>bir başlangıcın olsun.',
 'WORKSHOP':'ATÖLYE',
 'tasks':'görev',
 'Browser storage is unavailable. You can download your progress as a file from My notebook.':'Tarayıcı kaydı kullanılamıyor. İlerlemeni Defterim’den dosya olarak indirebilirsin.',
 'PIN BY PIN LAB · Together, step by step.':'PIN BY PIN LAB · Birlikte, adım adım.',
 'Based on the ESP32 From Zero curriculum · Version {v}':'ESP32 From Zero müfredatından · Sürüm {v}',
 'WONDER. WIRE. RUN.':'MERAK ET. BAĞLA. ÇALIŞTIR.',
 'It starts<br><em>with a pin.</em>':'Bir pinle<br><em>başlar.</em>',
 'No kit? No problem. Build your circuit in small steps and bring your code to life. Let’s light your first LED together.':'Kitin olmasa da olur. Küçük adımlarla devreni kur, koduna hayat ver. İlk ışığını birlikte yakalım.',
 'DRAWING 001 / FIRST CIRCUIT':'ÇİZİM 001 / İLK DEVRE',
 'YOUR LEARNING PATH':'ÖĞRENME YOLUN',
 '01 · ESP32 BASICS':'01 · ESP32 TEMELLERİ',
 'COMPLETED':'TAMAMLANDI',
 ', completed':', tamamlandı',
 ', complete the previous tasks first':', önce önceki görevleri tamamla',
 'NEXT STEP':'SIRADAKİ ADIM',
 'MIN':'DK',
 'COMING UP':'YOLUN DEVAMINDA',
 'CURRICULUM · IN PROGRESS':'MÜFREDAT · HAZIRLANIYOR',
 'IN PROGRESS':'HAZIRLANIYOR',
 'PICK UP WHERE YOU LEFT OFF':'KALDIĞIN YERDEN',
 'YOUR FIRST STEP IS READY':'İLK ADIMIN HAZIR',
 'Every open task is done.':'Açık görevlerin hepsi bitti.',
 'A few minutes, a new discovery. You don’t need a kit to keep going.':'Birkaç dakika, yeni bir keşif. İlerlemek için bir kite ihtiyacın yok.',
 'You have completed every open task. Try different connections in the workshop.':'Açık olan tüm görevleri tamamladın. Atölyede farklı bağlantılar deneyebilirsin.',
 'Continue':'Devam et',
 'Start learning':'Öğrenmeye başla',
 'WORKSHOP NOTES / 001':'ATÖLYE DEFTERİ / 001',
 'A wrong connection is part of learning.':'Yanlış bağlamak da öğrenmektir.',
 'Mistakes are welcome here. Change a wire and try again. Every connection teaches you something.':'Burada hata yapabilirsin. Bir kabloyu değiştir, tekrar dene. Her bağlantı sana bir şey anlatır.',
 'SMALL STEPS ADD UP':'KÜÇÜK ADIMLAR BİRİKİR',
 '{n} tasks completed':'{n} görev tamamlandı',
 'TASKS':'GÖREV',
 'Your progress is saved in this browser.<br>You can download a copy from My notebook.':'İlerlemen bu tarayıcıda saklanır.<br>Defterim’den bir kopya alabilirsin.',
 'YOUR WORKSHOP NOTEBOOK':'KİŞİSEL ATÖLYE DEFTERİN',
 'What you’ve learned.':'Öğrendiklerin burada.',
 '{n} tasks · you practised on {d} different days.':'{n} görev · {d} farklı günde çalıştın.',
 'This record lives only in this browser. Download a copy before switching devices.':'Bu kayıt yalnızca bu tarayıcıda tutulur. Cihaz değiştirmeden önce bir kopya indir.',
 'UNIT':'ÜNİTE',
 'Repeat ↗':'Tekrar et ↗',
 'Nothing here yet. Your first task is ready.':'Henüz bir kayıt yok. İlk görevin hazır.',
 'Go to the first step ↗':'İlk adıma git ↗',
 'Download notebook ↓':'Defteri indir ↓',
 'Load notebook ↑':'Defter yükle ↑',
 'Reset progress':'İlerlemeyi sıfırla',
 'Progress file':'İlerleme dosyası',
 'Back to the learning path':'Öğrenme yoluna dön',
 'Task order':'Görev sırası',
 'A small hint':'Küçük bir ipucu',
 'SOURCE OF THIS LESSON':'BU DERSİN KAYNAĞI',
 'Episode':'Bölüm',
 'SKETCH.INO / READ AND PREDICT':'SKETCH.INO / OKU VE TAHMİN ET',
 'Answer options':'Yanıt seçenekleri',
 'Trying is always allowed.':'Denemek serbest. Her zaman.',
 'Complete task →':'Görevi tamamla →',
 'Check →':'Kontrol et →',
 'In column 7, holes a to e are connected; f is in a separate group':'7 numaralı sütunda a ile e delikleri bağlıdır; f ayrı bir gruptadır',
 'Interactive ESP32 and breadboard. Choose a part and click a hole; click two holes in turn to connect a wire.':'Etkileşimli ESP32 ve breadboard. Parça seçip bir deliğe tıkla, iki deliğe sırayla tıklayarak kablo bağla.',
 'WORKBENCH':'ÇALIŞMA MASASI',
 'Wire {i}: {a} to {b}':'Kablo {i}: {a} ile {b}',
 'ESP32 3V3 fixed supply':'ESP32 3V3 sabit besleme',
 '220 ohm resistor. Drag to move.':'220 ohm direnç. Sürükleyerek taşı.',
 'Red LED. Drag to move.':'Kırmızı LED. Sürükleyerek taşı.',
 'PART SELECTED · Click a hole.':'PARÇA SEÇİLİ · Bir deliğe tıkla.',
 'WIRE START SELECTED · Choose the other end.':'KABLO BAŞLANGICI SEÇİLİ · İkinci ucu seç.',
 'PICK TWO PINS → CONNECT A WIRE':'İKİ PİN SEÇ → BİR KABLO BAĞLA',
 'FREE PLAY':'SERBEST DENEME',
 'EXPERIMENT':'DENEY',
 'GUIDED CIRCUIT MODEL':'REHBERLİ DEVRE MODELİ',
 '220 Ω resistor':'220 Ω direnç',
 'Red LED':'Kırmızı LED',
 'Button':'Buton',
 'Reverse LED':'LED yönünü çevir',
 'Rotate button':'Butonu döndür',
 'Clear bench':'Masayı temizle',
 'Drag a part, or select it and click a hole. Pick two ends for a wire. Click a wire to remove it. Keyboard: move between holes with the arrow keys, Enter to select, Escape to cancel.':'Parçayı sürükle veya seçip bir deliğe tıkla. Kablo için iki uç seç. Kaldırmak için kabloya tıkla. Klavye: ok tuşlarıyla delikler arasında gez, Enter ile seç, Escape ile iptal et.',
 'Wires':'Kablolar',
 'Remove the wire between {a} and {b}':'{a} ile {b} arasındaki kabloyu kaldır',
 'FIRST OUTPUT':'İLK ÇIKIŞ',
 'READ THE BUTTON':'BUTONU OKU',
 'TWO DELAYS, ONE CYCLE':'İKİ BEKLEME, BİR DÖNGÜ',
 'Download Arduino code ↓':'Arduino kodunu indir ↓',
 'RUN AND OBSERVE':'ÇALIŞTIR VE GÖZLEMLE',
 'Wait time for each delay()':'Her delay() için bekleme süresi',
 'cycles/s':'döngü/sn',
 'GPIO 23 is set as OUTPUT.<br>HIGH → the output to the LED is on.':'GPIO 23, OUTPUT olarak ayarlandı.<br>HIGH → LED’e giden çıkış açık.',
 '■ Stop':'■ Durdur',
 '▶ Run circuit':'▶ Devreyi çalıştır',
 'Run it once your circuit is built.':'Devreni kurduktan sonra çalıştır.',
 'This lesson model checks the wiring, the LED direction, the 220 Ω resistor and the chosen timing. It is not a full ESP32 emulator. The downloaded code works on a real board with the Arduino IDE.':'Bu ders modeli bağlantı, LED yönü, 220 Ω direnç ve seçilen zamanlamayı değerlendirir. Tam ESP32 emülatörü değildir. İndirilen kod, gerçek kartta Arduino IDE ile kullanılabilir.',
 'Move on once your circuit works.':'Çalışan devreni kontrol ederek ilerle.',
 'Complete task ↗':'Görevi tamamla ↗',
 'FREE WORKSHOP':'SERBEST ATÖLYE',
 'Change a connection.':'Bir bağlantıyı değiştir.',
 'ONE MORE STEP DONE':'BİR ADIM DAHA ATTIN',
 'Your first light is on.':'İlk ışığın yandı.',
 'You set the rhythm.':'Ritmi sen belirledin.',
 'The board heard you.':'Kart seni duydu.',
 'Every press counts once.':'Her basış bir kez.',
 'Two things at once.':'Aynı anda iki iş.',
 'Now you know this.':'Artık bunu biliyorsun.',
 'You completed {title}.':'{title} görevini tamamladın.',
 'Your wiring and your program’s behaviour meet the goal of this lesson.':'Bağlantın ve programının davranışı bu dersin hedefini karşılıyor.',
 'COMPLETED AGAIN':'TEKRAR TAMAMLANDI',
 'Next step ↗':'Sıradaki adım ↗',
 'Explore the workshop ↗':'Atölyede keşfet ↗',
 'Task completed.':'Görev tamamlandı.',
 '{part} placed.':'{part} yerleştirildi.',
 'Resistor':'Direnç',
 'Stop the circuit before changing connections.':'Bağlantı değiştirmek için önce devreyi durdur.',
 'Place the part in a breadboard hole.':'Parçayı breadboard üzerindeki bir deliğe yerleştir.',
 'First end selected. Choose the second end.':'İlk uç seçildi. İkinci ucu seç.',
 'BUTTON':'BUTON',
 'Drop the part on the breadboard holes.':'Parçayı breadboard deliklerinin üzerine bırak.',
 'Drop the part on the workbench.':'Parçayı çalışma masasının üzerine bırak.',
 'Correct.':'Doğru.',
 'Not yet. {hint} You can try another answer.':'Henüz değil. {hint} Başka bir yanıt deneyebilirsin.',
 'Stop the circuit first.':'Önce devreyi durdur.',
 'Choose a breadboard hole to move the part to.':'Parçayı taşımak için bir breadboard deliği seç.',
 'Watch the new rhythm.':'Yeni ritmi gözlemle.',
 'About 5.9 mA (while the LED is on).':'Yaklaşık 5,9 mA (LED açıkken).',
 'pin-by-pin-notebook.json':'pin-by-pin-defterim.json',
 'Notebook merged into your current progress.':'Defterin mevcut ilerlemene eklendi.',
 'This file is not a valid Pin by Pin Lab notebook.':'Bu dosya geçerli bir Pin by Pin Lab defteri değil.',
 'Your progress in this browser will be reset. Do you want to continue?':'Bu tarayıcıdaki ilerlemen sıfırlanacak. Devam etmek istiyor musun?',
 'Floating pin: the readings jump while the button is released. Set pinMode to INPUT_PULLUP.':'Pin boşta: basmadığında okumalar zıplıyor. pinMode’u INPUT_PULLUP yap.',
 'Your circuit is running. Now press and hold the button.':'Devren çalışıyor. Şimdi butona bas ve basılı tut.',
 'Pressed: the pin reads LOW (0) and the LED is on. Now let go.':'Basılı: pin LOW (0), LED yanıyor. Şimdi bırak.',
 'Your circuit is running. Now set the rhythm: the goal is two full cycles per second.':'Devren çalışıyor. Şimdi ritmi ayarla: hedef bir saniyede iki tam döngü.',
 ', turned sideways':', yan dönmüş',
 'Drag to move; while the circuit runs, hold to press.':'Sürükleyerek taşı; devre çalışırken basmak için basılı tut.',
 'INPUT (no pull-up)':'INPUT (pull-up yok)',
 'Press · hold the button':'Butona bas · basılı tut',
 'Serial Monitor output':'Serial Monitor çıktısı',
 'Your circuit works and meets the goal of this task.':'Devren çalışıyor ve görevin hedefini karşılıyor.',
 'You haven’t pressed yet.':'Henüz basmadın.',
 'This press counted exactly once. In a row: {s} / 3':'Bu basış tam bir kez sayıldı. Üst üste: {s} / 3',
 'One press counted {n} times. The bounces look like new presses.':'Tek basış {n} kez sayıldı. Zıplamalar yeni basış gibi görünüyor.',
 'Signal display, no press yet':'Sinyal ekranı, henüz basış yok',
 'Press the button: the signal on GPIO 22 shows up here.':'Butona bas: GPIO 22’deki sinyal burada görünür.',
 'Signal display: this press counted {n} times':'Sinyal ekranı: bu basış {n} kez sayıldı',
 'counted press':'sayılan basış',
 'BOUNCE MODEL · 1 READ PER MS':'ZIPLAMA MODELİ · MS BAŞINA 1 OKUMA',
 'PRESS AND COUNT':'BAS VE SAY',
 'Ignore time after a change':'Bir değişimden sonra yok sayma süresi',
 'light area: ignored time':'açık alan: yok sayılan süre',
 'Press the button once':'Butona bir kez bas',
 'Every press bounces differently. The model reads the signal once per millisecond and applies the rule from the video: accept a change only if enough time has passed since the last accepted one.':'Her basış farklı zıplar. Model sinyali milisaniyede bir okur ve videodaki koşulu uygular: değer değiştiyse ve son kabulden beri yeterli süre geçtiyse kabul et.',
 'Three presses in a row each counted exactly once.':'Üç basış üst üste tam birer kez sayıldı.',
 'Three presses in a row, each counted exactly once.':'Üst üste üç basış, her biri tam bir kez sayılsın.',
 'Caught':'Yakalanan',
 'Missed':'Kaçırılan',
 'In a row':'Üst üste',
 'TIMING MODEL':'ZAMANLAMA MODELİ',
 'Code version':'Kod sürümü',
 '{m}() version':'{m}() sürümü',
 'Red LED on GPIO 23, green LED on GPIO 25':'Kırmızı LED GPIO 23’te, yeşil LED GPIO 25’te',
 'no turn':'sıra yok',
 'Press the button':'Butona bas',
 'LAST 3 SECONDS · LINES: WHEN THE CODE READS THE BUTTON':'SON 3 SANİYE · ÇİZGİLER: KODUN BUTONU OKUDUĞU ANLAR',
 'WITH DELAY()':'DELAY() İLE',
 'WITH MILLIS()':'MILLIS() İLE',
 'WHAT’S HAPPENING?':'NE OLUYOR?',
 'loop() waits 500 ms every time round. The button is only read between the waits, twice a second. A short press usually falls in between and is missed. A second LED never gets its turn either.':'loop() her turda 500 ms bekler. Buton yalnızca beklemelerin arasında, yarım saniyede bir okunur. Kısa bir basış çoğu zaman araya düşer ve kaçar. İkinci bir LED için de sıra gelmez.',
 'loop() never waits; every time round it checks the clock. The button is read thousands of times a second and every press is caught at once. The green LED blinks at its own pace too.':'loop() hiç beklemez, her turda saate bakar. Buton saniyede binlerce kez okunur ve her basış hemen yakalanır. Yeşil LED de kendi hızında yanıp söner.',
 'Catch three presses in a row in the millis() version.':'millis() sürümünde üst üste üç basış yakala.',
 'This press happened to cover a read and was caught. Lucky.':'Bu basış bir okuma anına denk geldi ve yakalandı. Şans eseri.',
 'Missed: your press fell between two reads. The ESP32 was waiting inside delay().':'Kaçtı: basışın iki okuma anının arasında kaldı. ESP32 o sırada delay() içinde bekliyordu.',
 'Three presses caught in a row. The button was heard while the LEDs kept running without waiting.':'Üç basış üst üste yakalandı. LED’ler beklemeden çalışırken buton da dinlendi.',
 'Caught. Try the delay() version too to see the difference.':'Yakalandı. Farkı görmek için delay() sürümünü de dene.',
 'Caught: {n} / 3.':'Yakalandı: {n} / 3.',
 // circuit model messages (model.mjs)
 'Supply and GND are connected directly. Remove the short-circuit wire.':'Besleme ile GND doğrudan bağlı. Kısa devre kablosunu kaldır.',
 'First place an LED and a 220 Ω resistor.':'Önce bir LED ve 220 Ω direnç yerleştir.',
 'Both LED legs are on the same strip, so there is no voltage across the LED.':'LED’in iki bacağı aynı hatta bağlı. LED üzerinden gerilim oluşmuyor.',
 'The LED is on a path that skips the resistor. Connect the resistor in series with the LED.':'LED direnci atlayan bir yola bağlı. Direnci LED ile seri bağla.',
 'A wire joins the two ends of the resistor. Remove this bridge so it can limit the current.':'Direncin uçlarını bir kabloyla birleştirmişsin. Akım sınırlamak için bu köprüyü kaldır.',
 'Current path complete: GPIO 23 → resistor → LED → GND.':'Akım yolu tamamlandı: GPIO 23 → direnç → LED → GND.',
 'The LED is the wrong way round. Use “Reverse LED” to swap anode and cathode.':'LED ters yönde. “LED yönünü çevir” ile anot ve katodu değiştir.',
 '3V3 is a fixed supply. Use GPIO 23 so your code can control the LED in this task.':'3V3 sabit beslemedir. Bu görevde kodla kontrol etmek için GPIO 23 kullan.',
 'The current path isn’t complete yet. Trace the connections between GPIO 23, the resistor, the LED and GND.':'Akım yolu henüz tamamlanmadı. GPIO 23, direnç, LED ve GND arasındaki bağlantıları izle.',
 'First place the button across the gap in the middle of the breadboard.':'Önce butonu breadboard’un ortasındaki kanalın üzerine yerleştir.',
 'Pressing the button shorts the supply to GND. Connect GPIO 22 to the button, not to 3V3.':'Butona basınca besleme GND’ye kısa devre oluyor. GPIO 22’yi 3V3’e değil, butona bağla.',
 'GPIO 22 is connected to GND even without a press. The button may be turned sideways, or a wire skips the button.':'Butona basmadan da GPIO 22 GND’ye bağlı. Buton yan dönmüş olabilir ya da bir kablo butonu atlıyor.',
 'Pressing the button doesn’t connect GPIO 22 to GND. GPIO 22 goes to one side of the button, the other side goes to GND.':'Butona bastığında GPIO 22 GND’ye ulaşmıyor. GPIO 22 butonun bir yanına, diğer yanı GND’ye gitmeli.',
 'The wiring is correct, but the pull-up is off: the released pin is floating.':'Bağlantı doğru ama pull-up kapalı: basılmayan pin boşta kalıyor.',
 'Button ready: HIGH (1) when released, LOW (0) when pressed.':'Buton hazır: basılı değilken HIGH (1), basınca LOW (0).',
 // sketch comments (translated after "// ")
 'the button pulls this pin to GND':'buton bu pini GND’ye çeker',
 'a new press':'yeni basış',
 'the ESP32 ignores the button here':'ESP32 burada butona bakmaz',
 'green LED at its own pace':'yeşil LED kendi hızında',
 'no pull-up':'pull-up yok'
};
Object.assign(TR_LESSONS,{
 check1:{title:'Ünite 1 sınavı',tag:'ÜNİTE SINAVI',intro:'setup(), loop() ve Serial Monitor sana tanıdık mı? Bu sınavı geçersen Ünite 2 hemen açılır.',hint:'Sorularda ipucu yok. Kontrol ettikten sonra her sorunun açıklaması görünür.',questions:[
  {q:'İlk 5 saniyede bu program ne yazdırır?',choices:['0, 2, 4','1, 2, 3, 4, 5','2000, 4000'],explain:'millis() başlangıçtan beri geçen milisaniyeyi sayar. 1000’e bölünce tam saniye olur ve loop 2 saniyede bir çalışır: 0, 2, 4.'},
  {q:'loop() bir satır yazdırıyor, sonra delay(250) çağırıyor. Saniyede kaç satır?',explain:'1000 ms / 250 ms = saniyede 4 satır (yazdırmanın kendisi neredeyse hiç zaman almaz).'},
  {q:'Serial Monitor yazı yerine rastgele semboller gösteriyor. En olası sebep?',choices:['Monitördeki baud değeri Serial.begin() ile aynı değil','USB kablosu çok uzun','loop() boş'],explain:'İki taraf aynı hızı kullanmalı. Kodda 115200 varsa monitörde de 115200 seçilir.'},
  {q:'Hangisi doğru?',choices:['pinMode() bir GPIO’yu giriş ya da çıkış yapar','digitalWrite() GND’yi kapatabilir','3V3 koddan kapatılabilir'],explain:'GPIO’lar programlanabilen pinlerdir. GND ve 3V3 sabittir: toprak ve besleme.'},
  {q:'loop() içinde yalnızca iki kez delay(1000); var. loop() bir turu kaç saniye sürer?',explain:'İki bekleme toplanır: 1000 ms + 1000 ms = 2 sn.'}]},
 check2:{title:'Ünite 2 sınavı',tag:'ÜNİTE SINAVI',intro:'Breadboard’u ve Ohm kanununu biliyor musun? Bu sınavı geçersen Ünite 3 hemen açılır.',hint:'Sorularda ipucu yok. Kontrol ettikten sonra her sorunun açıklaması görünür.',questions:[
  {q:'Aynı devre (3V3’ten 3,3 V, 2 V kırmızı LED) ama 330 Ω dirençle. Yaklaşık kaç mA akar?',explain:'(3,3 − 2) / 330 = 1,3 / 330 ≈ 0,0039 A, yani yaklaşık 3,9 mA. Büyük direnç daha az akım ve daha sönük LED demek.'},
  {q:'Direnç a4–a7’de, LED’in + bacağı a7’de, − bacağı a8’de. GPIO 23’ten gelen kablo nereye gitmeli?',choices:['c4','c7','f4'],explain:'GPIO 23 direncin boştaki ucuna ulaşmalı: a–e grubundaki 4. sütun. 7. sütun direnci atlar; f4 diğer gruptadır.'},
  {q:'LED’i dirençsiz olarak doğrudan GPIO 23 ile GND arasına bağlarsan ne olur?',choices:['Çok akım akar; LED ve pin zarar görebilir','Hiçbir şey, LED kendi akımını sınırlar','LED daha verimli yanar'],explain:'LED iletime geçince akımı neredeyse hiç sınırlamaz. Güvenli akımı direnç belirler.'},
  {q:'3,3 V pinde 2 V’luk bir LED için yaklaşık 10 mA veren direnç kaç Ω?',explain:'R = (3,3 − 2) / 0,010 = 130 Ω. Uygulamada bir üst standart değer seçilir, örneğin 150 Ω.'},
  {q:'İki kablo d12 ve h12’de bitiyor. Birbirlerine bağlılar mı?',choices:['Hayır: d a–e grubunda, h f–j grubunda','Evet: sütun numarası aynı','Sadece kart çalışırken'],explain:'Ortadaki kanal her sütunu iki ayrı gruba böler.'}]},
 check3:{title:'Ünite 3 sınavı',tag:'ÜNİTE SINAVI',intro:'LED bağlayıp yakıp söndürmeyi zaten biliyor musun? Bu sınavı geçersen Ünite 4 hemen açılır.',hint:'Sorularda ipucu yok. Kontrol ettikten sonra her sorunun açıklaması görünür.',questions:[
  {q:'LED saniyede 5 tam yanıp sönme yapmalı, iki eşit bekleme ile. delay değeri kaç ms?',explain:'Bir döngü 1000 / 5 = 200 ms; iki eşit yarıya bölünür: 100 ms açık, 100 ms kapalı.'},
  {q:'Bu loop ile ne görürsün?',choices:['Saniyede bir kısa parlama','Sürekli yanan bir ışık','Saniyede iki parlama'],explain:'100 ms açık, 900 ms kapalı: her saniye bir kısa parlama.'},
  {q:'delay(250) açık ve delay(750) kapalı. LED zamanın yüzde kaçında yanar?',explain:'250 / (250 + 750) = 0,25, yani %25.'},
  {q:'pinMode(LED_PIN, OUTPUT) satırını unuttun. Muhtemelen ne olur?',choices:['LED sönük kalır ya da hiç yanmaz: pin çıkış olarak sürülmüyor','Hiçbir şey, pinler zaten çıkıştır','Kart yeniden başlar'],explain:'pinMode(…, OUTPUT) olmadan pin sürülmez; digitalWrite() LED’i düzgün besleyemez.'},
  {q:'Bağlantı: GPIO 23 → direnç → LED − bacağı, LED + bacağı → GND. LED yanmıyor. Çözüm?',choices:['LED’i ters çevir','Daha büyük direnç kullan','İkinci bir delay() ekle'],explain:'Akım uzun bacaktan (+, anot) girmeli. Ters takılan LED akımı engeller.'}]},
 check4:{title:'Ünite 4 sınavı',tag:'ÜNİTE SINAVI',intro:'INPUT_PULLUP, debounce ve millis() sana rahat mı geliyor? Bu sınavı geçersen Ünite 5 hemen açılır.',hint:'Sorularda ipucu yok. Kontrol ettikten sonra her sorunun açıklaması görünür.',questions:[
  {q:'INPUT_PULLUP ve GND’ye giden bir butonla hangi koşul “basıldı” demektir?',choices:['digitalRead(pin) == LOW','digitalRead(pin) == HIGH','pinMode(pin, OUTPUT)'],explain:'Pull-up pini HIGH tutar; basınca pin GND’ye bağlanır ve LOW okunur.'},
  {q:'lastChange = 4980 ve now = 5020. 50 ms debounce ile yeni bir değişimin kabulüne kaç ms kaldı?',explain:'5020 − 4980 = 40 ms geçti. 50 − 40 = 10 ms kaldı.'},
  {q:'Buton burada neden tepkisiz hissettiriyor?',choices:['Buton 2 saniyede yalnızca bir kez okunuyor','INPUT_PULLUP çok zayıf','digitalWrite() butonu engelliyor'],explain:'İki delay loop()’u 2 saniye dondurur; buton her turda yalnızca bir kez kontrol edilir.'},
  {q:'millis() ile yeşil LED her 150 ms’de durum değiştiriyor. 3 saniyede kaç değişim olur?',explain:'3000 / 150 = 20 değişim; loop başka ne yaparsa yapsın.'},
  {q:'Neden now >= last + interval yerine now - last >= interval yazıyoruz?',choices:['millis() sıfırlandığında da doğru çalışır','Daha hızlıdır','Daha az bellek kullanır'],explain:'İşaretsiz çıkarmada fark, sıfırlanmadan (yaklaşık 49,7 gün) sonra da doğru kalır; toplama yöntemi bozulur.'}]},
 pwm:{title:'Yarı açık, yarı kapalı',tag:'TANI',intro:'Bir GPIO ya tamamen açıktır (3,3 V) ya da kapalı (0 V). PWM onu çok hızlı açıp kapatır; açık kaldığı sürenin payına doluluk oranı (duty cycle) denir. analogWrite(pin, değer) 0 ile 255 arası değer alır.',question:'LED ne kadar parlak görünür?',choices:['Yaklaşık dörtte bir: zamanın %25’inde açık','Kapalı: 64 çok küçük','Tam açık: 0’dan büyük her değer yakar'],explanation:'64 / 255 ≈ %25. Pin her periyodun dörtte birinde açıktır. Gözün bu hızlı açılıp kapanmanın ortalamasını görür, LED daha sönük görünür. ESP32’de analogWrite() arka planda LEDC donanımını kullanır.',hint:'64, 255’in kaçta kaçı?'},
 dimmer:{title:'Parlaklığı ayarla',tag:'PROGRAMLA',intro:'LED yine GPIO 23’te. Her hedef parlaklık için analogWrite() değerini ayarla. Dalga şekline bak: yüksek kısım genişledikçe LED parlar.',hint:'değer = parlaklık % × 255 / 100. %25 için: 0,25 × 255 ≈ 64.'},
 rgb:{title:'Bir LED’de üç LED',tag:'ANLA',intro:'RGB LED’in içinde kırmızı, yeşil ve mavi üç LED var. Ortak katotlu RGB LED’de uzun bacak GND’ye gider; her renk kendi PWM pinini ve kendi 220 Ω direncini alır.',question:'Hangi rengi görürsün?',choices:['Sarı','Mor','Beyaz'],explanation:'Kırmızı ve yeşil ışık birlikte sarı görünür. Kırmızı + mavi mor, üçü birden beyaz verir. Ortak anotlu LED’de mantık terstir: 0 tam parlaklık demektir.',hint:'Boya değil ışık karıştırıyoruz: kırmızı + yeşil = ?'},
 mixer:{title:'Renkleri karıştır',tag:'KARIŞTIR',intro:'Üç sürgü, üç analogWrite() çağrısı. Her hedef rengi RGB LED’de karıştır. Yakın olması yeter: her kanal biraz sapabilir.',hint:'Turuncu bol kırmızı ve yarım yeşildir. Camgöbeği yeşil ve mavidir. Mor çoğunlukla mavi, biraz kırmızıdır.'},
 adc:{title:'Düğmeyi oku',tag:'ÖLÇ',intro:'Potansiyometre bir gerilim bölücüdür: düğmeyi çevirmek orta bacağı 0 V ile 3,3 V arasında gezdirir. analogRead() bu gerilimi ölçer. ESP32’de sonuç 12 bittir: 0 ile 4095 arası. WiFi açıkken de çalışan bir ADC1 pini olan GPIO 34’ü kullanıyoruz.',question:'Düğme tam ortada. Yaklaşık ne yazdırır?',choices:['Yaklaşık 2048','Yaklaşık 512','Yaklaşık 128'],explanation:'4095 / 2 ≈ 2048. Arduino Uno kartları 10 bit okur (0–1023); eski anlatımlarda 512 görmen bu yüzden. ESP32’nin ADC’si uçlara yakın tam doğrusal değildir, küçük sapmalar normaldir.',hint:'4095’in yarısı.'},
 knob:{title:'Işık ayar düğmesi',tag:'MEYDAN OKUMA',intro:'Düğmeyi LED’e bağla: potansiyometreyi oku ve okumayı map() ile parlaklığa çevir. Eksik iki sayıyı doldur, sonra düğmeyi bir uçtan diğer uca çevir.',hint:'map(değer, eskiAlt, eskiÜst, yeniAlt, yeniÜst). ADC en fazla 4095 okur; analogWrite() en fazla 255 alır.'},
 check5:{title:'Ünite 5 sınavı',tag:'ÜNİTE SINAVI',intro:'PWM, RGB karıştırma ve analogRead() sana tanıdık mı? Üniteyi bitirmek için bu sınavı geç.',hint:'Sorularda ipucu yok. Kontrol ettikten sonra her sorunun açıklaması görünür.',questions:[
  {q:'8 bit PWM: %50 doluluk oranı için analogWrite() değeri kaç?',explain:'255 / 2 ≈ 127,5; yani 127 ya da 128.'},
  {q:'Potansiyometre 3072 okuyor. map(raw, 0, 4095, 0, 255) ne döndürür?',explain:'3072 × 255 / 4095 ≈ 191,3; map() tam sayı kullanır, yani 191.'},
  {q:'Ortak katotlu RGB LED: kırmızı 255, yeşil 0, mavi 255. Hangi renk?',choices:['Mor (macenta)','Sarı','Camgöbeği'],explain:'Kırmızı + mavi ışık = mor/macenta.'},
  {q:'PWM ile sürülen LED neden titremek yerine sönük görünür?',choices:['Açılıp kapanma gözünden hızlı; ortalamayı görürsün','PWM gerilimi sabit bir değere düşürür','Direnç ışığı yumuşatır'],explain:'LED gerçekten tamamen açılıp kapanır, saniyede yüzlerce ya da binlerce kez. Gözün bunun ortalamasını alır.'},
  {q:'3,3 V pin, %25 doluluk oranı. Ortalama gerilim kaç V?',explain:'0,25 × 3,3 V = ortalama 0,825 V.'}]}
});
Object.assign(TR,{
 'PASSED':'SINAVLA GEÇİLDİ',
 'Program':'Program',
 'Workshop area':'Atölye alanı',
 'Breadboard':'Breadboard',
 'PWM & color':'PWM ve renk',
 'LED on':'LED yanık',
 'Blink with delay()':'delay() ile yanıp sön',
 'Button → LED':'Buton → LED',
 'Unit {u} passed.':'Ünite {u} geçildi.',
 'Every lesson of this unit is open now, and so is the next unit.':'Bu ünitenin bütün dersleri ve sıradaki ünite artık açık.',
 'Every lesson of this unit is open now.':'Bu ünitenin bütün dersleri artık açık.',
 'Passed · every lesson of this unit is open.':'Geçildi · bu ünitenin bütün dersleri açık.',
 'Already know this? Test out: {n} questions, {pass} to pass.':'Bunları biliyor musun? Sınavla geç: {n} soru, geçmek için {pass}.',
 'Retake':'Tekrar çöz',
 'Take the checkpoint':'Sınava gir',
 'UNIT CHECKPOINT':'ÜNİTE SINAVI',
 'PASS: {pass} / {n}':'GEÇME: {pass} / {n}',
 'Your answer':'Cevabın',
 'Answer: {a}':'Cevap: {a}',
 '{s} / {n} correct. Checkpoint passed!':'{s} / {n} doğru. Sınavı geçtin!',
 '{s} / {n} correct. You need {pass}. Read the explanations and try again.':'{s} / {n} doğru. {pass} gerekiyor. Açıklamaları oku ve tekrar dene.',
 'Numbers: a comma or a dot both work.':'Sayılarda virgül de nokta da olur.',
 'Check answers →':'Cevapları kontrol et →',
 'Complete checkpoint →':'Sınavı tamamla →',
 'Try again':'Tekrar dene',
 's':'sn',
 'Duty {d}% · average {v} V':'Doluluk %{d} · ortalama {v} V',
 'PWM MODEL · 8 BIT':'PWM MODELİ · 8 BİT',
 'GPIO 23 OVER TIME':'ZAMANLA GPIO 23',
 'ALL TARGETS DONE':'TÜM HEDEFLER TAMAM',
 'TARGET {i} / {n}':'HEDEF {i} / {n}',
 'Three brightness levels, set by number. Try the fade if you like.':'Üç parlaklık seviyesini sayıyla ayarladın. İstersen yavaşça yanıp sönmeyi (fade) dene.',
 'Make the LED {pct}% bright.':'LED’i %{pct} parlaklığa getir.',
 '▶ Fade 0 → 255 → 0':'▶ Fade 0 → 255 → 0',
 'All three targets hit.':'Üç hedefi de tutturdun.',
 'Hit three brightness targets.':'Üç parlaklık hedefini tuttur.',
 'Target {i} / {n}: {name}':'Hedef {i} / {n}: {name}',
 'RGB MODEL · COMMON CATHODE':'RGB MODELİ · ORTAK KATOT',
 'All three colors mixed.':'Üç rengi de karıştırdın.',
 'Mix three target colors.':'Üç hedef rengi karıştır.',
 'Fill in both numbers in map().':'map() içindeki iki sayıyı da doldur.',
 'level goes above 255. analogWrite() only takes 0–255 at 8 bits, so part of the turn does nothing. Check fromHigh.':'level 255’i aşıyor. analogWrite() 8 bitte yalnızca 0–255 alır; düğmenin bir kısmı hiçbir şey yapmaz. fromHigh değerini kontrol et.',
 'The numbers don’t match the ranges yet: the ADC reads 0–4095 and analogWrite() takes 0–255.':'Sayılar aralıklara henüz uymuyor: ADC 0–4095 okur, analogWrite() 0–255 alır.',
 'Correct ranges. Now turn the knob all the way to both ends.':'Aralıklar doğru. Şimdi düğmeyi iki uca kadar çevir.',
 'Full range: dark at one end, full brightness at the other.':'Tam aralık: bir uçta karanlık, diğer uçta tam parlak.',
 'Turn the knob (analogRead on GPIO 34)':'Düğmeyi çevir (GPIO 34’te analogRead)',
 'Your dimmer works over the whole turn.':'Işık ayar düğmen bütün dönüş boyunca çalışıyor.',
 'ADC MODEL · 12 BIT':'ADC MODELİ · 12 BİT',
 'Fill in map() and turn the knob to both ends.':'map()’i doldur ve düğmeyi iki uca çevir.',
 'RGB LED':'RGB LED',
 'Dimmer knob':'Işık ayar düğmesi',
 'Yes: {v} is about {pct}%.':'Evet: {v} yaklaşık %{pct}.',
 'Not yet: {v} is {d}%. Target: {pct}%.':'Henüz değil: {v} = %{d}. Hedef: %{pct}.',
 '{name} matched.':'{name} tamam.',
 'Not quite: {list}.':'Tam değil: {list}.',
 'less {c}':'daha az {c}',
 'more {c}':'daha fazla {c}',
 'red':'kırmızı','green':'yeşil','blue':'mavi',
 'Red':'Kırmızı','Green':'Yeşil','Blue':'Mavi',
 'Orange':'Turuncu','Cyan':'Camgöbeği','Purple':'Mor',
 'You control the brightness.':'Parlaklık senin elinde.',
 'Every color, three numbers.':'Her renk, üç sayı.',
 'Your own dimmer.':'Kendi ışık ayarın.',
 '0 = off, 255 = full':'0 = kapalı, 255 = tam',
 'common cathode: long leg to GND':'ortak katot: uzun bacak GND’ye',
 'ADC1: works with WiFi on':'ADC1: WiFi açıkken de çalışır',
 '0–4095':'0–4095',
 'video coming soon':'video yakında'
});

// Turkish mission text (title, intro, steps[], hints[], goals[] by index) — see dist/missions.mjs
export const TR_MISSIONS={
 "hello": {
  "title": "Merhaba, ESP32!",
  "intro": "Tarayıcıda 1. bölüm: sürücü yok, kablo yok. ESP32’n seninle Serial Monitor üzerinden konuşur.",
  "steps": [
   "setup() içinde seri bağlantıyı başlat: `Serial.begin(115200);`",
   "Sonraki satırda bir selam yazdır: `Serial.println(\"Hello, ESP32!\");`",
   "▶ Çalıştır’a bas ve devrenin altındaki Serial Monitor’ü izle."
  ],
  "hints": [
   "Her kod satırı noktalı virgül ; ile biter.",
   "Metin çift tırnak içine yazılır: \"Hello, ESP32!\". Büyük/küçük harf önemlidir: Serial, println."
  ],
  "goals": [
   "Serial 115200 baud ile başlatıldı",
   "Monitörde Hello, ESP32! görünüyor",
   "Selam bir kez görünüyor, tekrar tekrar değil"
  ]
 },
 "counter": {
  "title": "Saniyeleri say",
  "intro": "loop() tekrar tekrar çalışır. Tıpkı 1. bölümün sonundaki gibi, onunla sayı say.",
  "steps": [
   "loop() içinde değişkene bir ekle: `seconds = seconds + 1;`",
   "Cümleyi sayıyla birlikte yazdır: `Serial.printf(\"I have been running for %d seconds\\n\", seconds);`",
   "Bir saniye bekle: `delay(1000);` sonra ▶ Çalıştır’a bas."
  ],
  "hints": [
   "printf içindeki %d, virgülden sonra verdiğin sayıyla değiştirilir.",
   "delay(1000) olmazsa sayılar saniyede binlerce kez akıp gider."
  ],
  "goals": [
   "“I have been running for N seconds” yazdırıyor",
   "Sayı her satırda bir artıyor",
   "Saniyede bir satır"
  ]
 },
 "circuit": {
  "title": "İlk devren",
  "intro": "2. bölüm: 3,3 V pininden yanan bir LED. Onu breadboard üzerine kur, sonra Çalıştır’a bas (bu, USB kablosunu takmak demek).",
  "steps": [
   "Kartın 3V3 pininden breadboard’un kırmızı + rayına, bir GND pininden de mavi − rayına kablo sürükle.",
   "Direnci + ray ile boş bir sütun arasına koy (seç ve dik çevirmek için R’ye bas).",
   "LED’in uzun bacağını (+) direncin olduğu sütuna, kısa bacağını (−) yan sütuna tak.",
   "Kısa bacağın sütununu − rayına kabloyla bağla. ▶ Çalıştır’a bas."
  ],
  "hints": [
   "Beş delikli her sütun (a–e veya f–j) tek bir bağlantıdır; ortadaki boşluk iki yarıyı ayırır.",
   "Bir pinin ya da deliğin adını görmek için üzerine gel. LED’in + bacağı anottur.",
   "LED yanmıyor mu? LED’in yönünü ve iki bacağının farklı sütunlarda olduğunu kontrol et."
  ],
  "goals": [
   "LED yanıyor",
   "Bir direnç akımı güvenli tutuyor (20 mA altında)",
   "Kısa devre veya aşırı yük yok"
  ]
 },
 "fix": {
  "title": "Hataları bul",
  "intro": "Biri 2. bölümdeki devreyi kurmuş ama LED yanmıyor. Devrede iki klasik hata var. Bul ve düzelt.",
  "steps": [
   "▶ Çalıştır’a bas ve Serial Monitor’ün altındaki uyarıları oku.",
   "Her kabloyu kontrol et: GND gerçekten mavi − rayına gidiyor mu?",
   "LED’i kontrol et: uzun bacak (+) direnç tarafında mı? Seç ve ters çevirmek için R’ye iki kez bas ya da sürükle."
  ],
  "hints": [
   "Bir kablo GND’yi 3V3’ün hemen yanındaki + rayına bağlıyor: bu bir kısa devre.",
   "LED ters takılmış: + bacağı dirençten uzağa bakıyor."
  ],
  "goals": [
   "Kısa devre yok",
   "LED yanıyor"
  ]
 },
 "blink": {
  "title": "LED’i yakıp söndür",
  "intro": "3. bölüm: direnci 3V3’ten GPIO 23’e taşı, böylece programın LED’i açıp kapatabilsin.",
  "steps": [
   "3V3’ten gelen kırmızı kabloyu sil (tıkla, Delete’e bas).",
   "Direnci bir ucu boş bir sütunda olacak şekilde taşı ve D23’ü o sütuna kabloyla bağla. LED öbür uçta eskisi gibi kalsın.",
   "setup() içinde: `pinMode(LED_PIN, OUTPUT);` ve `Serial.begin(115200);`",
   "loop() içinde: `digitalWrite(LED_PIN, HIGH);`, \"LED on\" yazdır, `delay(500);`, sonra aynısını LOW ve \"LED off\" ile yap. ▶ Çalıştır’a bas."
  ],
  "hints": [
   "HIGH pine 3,3 V verir, LOW 0 V verir.",
   "LED hep yanık mı kalıyor? Direnç büyük ihtimalle hâlâ + rayından güç alıyor.",
   "Hep sönük mü? D23’ün gerçekten direncin sütununa ulaştığını kontrol et."
  ],
  "goals": [
   "GPIO 23 bir çıkış",
   "LED yanıp sönüyor: 500 ms yanık, 500 ms sönük",
   "Monitörde LED on / LED off görünüyor"
  ]
 },
 "fast": {
  "title": "Saniyede beş yanıp sönme",
  "intro": "Sayıları değiştirmek hiçbir şeyi bozmaz. LED’i saniyede beş kez yanıp söndür.",
  "steps": [
   "Bekleme süresini hesapla: bir yanıp sönme, bir “yanık” artı bir “sönük” süredir.",
   "İki delay() değerini de değiştir ve yeniden başlatmak için ↺ tuşuna bas."
  ],
  "hints": [
   "1000 ms / 5 = yanıp sönme başına 200 ms, iki eşit yarıya bölünmüş."
  ],
  "goals": [
   "LED saniyede 5 kez yanıp sönüyor (100 ms yanık, 100 ms sönük)"
  ]
 },
 "pair": {
  "title": "Meydan okuma: sırayla yanın",
  "intro": "GPIO 25’e yeşil bir LED ekle. İki LED sırayla yansın: kırmızı yanık, yeşil sönük; sonra tersi.",
  "steps": [
   "İkinci bir LED devresi kur: GPIO 25 → direnç → yeşil LED → GND. Üstteki − rayının kendi GND kablosu olmalı.",
   "GREEN_PIN = 25 tanımla ve onu çıkış yap.",
   "loop() içinde iki LED’i de değiştir, sonra 500 ms bekle, bunu iki kez yap."
  ],
  "hints": [
   "Güvenli olan her GPIO olur: 4, 13, 14, 16–19, 21–23, 25–27, 32, 33. Ders kontrolü pin numarasına değil, LED’lere bakar.",
   "loop() içindeki iki blok birbirinin aynadaki yansımasıdır: birincide HIGH olan ikincide LOW olur."
  ],
  "goals": [
   "İki LED yanıp sönüyor (her biri 500 ms)",
   "Hiçbir zaman aynı anda yanmıyorlar"
  ]
 },
 "press": {
  "title": "Butonu oku",
  "intro": "4. bölüm: ESP32 dinliyor. Butonu ortadaki boşluğun üzerine koy ve GPIO 22 ile GND arasına bağla.",
  "steps": [
   "Butonu ortadaki boşluğun üzerine yerleştir (bacakları e ve f satırlarında).",
   "D22’yi butonun bir tarafına, öbür tarafı − rayına kabloyla bağla.",
   "setup() içinde: `pinMode(BUTTON_PIN, INPUT_PULLUP);`",
   "loop() içinde: `digitalRead(BUTTON_PIN)` ile oku, değeri yazdır ve LOW iken LED’i yak.",
   "Çalıştır, sonra butonu basılı tut (ona tıkla ya da Kontroller çubuğunu kullan)."
  ],
  "hints": [
   "INPUT_PULLUP ile pin, bırakılmışken 1 (HIGH), basılıyken 0 (LOW) okur.",
   "Soldaki iki bacak hep bağlıdır, sağdaki ikisi de. D22 ile GND’yi farklı taraflara bağla.",
   "INPUT_PULLUP yerine INPUT dene ve sayıların zıpladığını izle: boşta bir pin."
  ],
  "goals": [
   "GPIO 22 INPUT_PULLUP kullanıyor",
   "Basılıyken: LED yanık",
   "Bırakılınca: LED yine sönük",
   "Monitörde 1 ve 0 görünüyor"
  ]
 },
 "toggle": {
  "title": "Aç, kapat: her basışta bir kez",
  "intro": "Her basış LED’i ters çevirmeli. Bu kod neredeyse çalışıyor ama kontaklar zıplıyor: çalıştır, birkaç kez bas ve sayacı izle.",
  "steps": [
   "Kodu çalıştır ve butona beş kez bas. Say ve monitördeki “presses:” ile karşılaştır.",
   "Butonun değiştiği yeri bul ve 4. bölümdeki çözümü ekle: her değişiklikten sonra 50 ms bekle.",
   "Yeniden başlat ve tekrar bas: her basış LED’i tam bir kez ters çevirmeli."
  ],
  "hints": [
   "Metal kontaklar birkaç milisaniye zıplar, bu yüzden tek bir basış birkaç basış gibi görünür.",
   "`delay(50);` satırını `if (state != lastState) { … }` içine, iç if’ten sonra ekle."
  ],
  "goals": [
   "En az 4 kez bastın",
   "Her basış LED’i tam bir kez ters çevirdi",
   "Sayaç basışlarınla uyuşuyor"
  ]
 },
 "nowait": {
  "title": "Aynı anda iki iş",
  "intro": "delay() her şeyi dondurur. Bunun yerine millis() ile yanıp söndür, böylece buton her an duyulur.",
  "steps": [
   "“2. LED” bölümünün altında saati kontrol et: `if (blinking && now - lastBlink >= 500) { … }`",
   "İçinde: zamanı kaydet, ledOn’u ters çevir ve pine yaz.",
   "Yanıp sönme kapalıyken LED’in söndüğünden emin ol.",
   "Çalıştır: LED yanıp söner, bir basış onu hemen durdurur, bir basış daha tekrar başlatır."
  ],
  "hints": [
   "Her zaman çıkar: now − lastBlink. Burada asla delay() ile bekleme.",
   "Durduktan sonra: `if (!blinking && ledOn) { ledOn = false; digitalWrite(LED_PIN, LOW); }`"
  ],
  "goals": [
   "LED her 500 ms’de yanıp sönüyor",
   "Bir basış yanıp sönmeyi durduruyor",
   "Basış 60 ms içinde fark ediliyor"
  ]
 },
 "two": {
  "title": "Meydan okuma: iki LED, iki hız",
  "intro": "Kırmızı her 500 ms’de yanıp söner ve buton onu açıp kapatır. Yeşil her zaman 150 ms’de bir yanıp söner. Hiçbir şey asla beklemez.",
  "steps": [
   "GPIO 25’e yeşil bir LED bağla (kendi direnci ve GND’siyle).",
   "Her LED’e kendi zamanlayıcısını ver: lastRed ve lastGreen.",
   "Kırmızı LED için önceki görevdeki buton kodunu koru."
  ],
  "hints": [
   "“Belirli aralıkla” yapılan her iş kendi `if (now - last… >= interval)` bloğunu alır.",
   "Önceki görevdeki çözümünle başla ve LED bloğunu yeşil için kopyala."
  ],
  "goals": [
   "Bir LED her 500 ms’de yanıp sönüyor",
   "Başka bir LED aynı anda her 150 ms’de yanıp sönüyor",
   "Bir basış yavaş LED’i durduruyor, hızlı olan devam ediyor"
  ]
 },
 "fade": {
  "title": "Nefes al, nefes ver",
  "intro": "PWM pini çok hızlı açıp kapatır; analogWrite(pin, 0–255) açık kalma süresini belirler. LED’i yavaşça parlat ve karart.",
  "steps": [
   "0’dan 255’e bir for döngüsü yaz: `for (int v = 0; v <= 255; v++) { … }`",
   "İçine: `analogWrite(LED_PIN, v);` ve kısa bir `delay(4);`",
   "0’a kadar geri sayan ikinci bir döngü ekle. Çalıştır."
  ],
  "hints": [
   "255 adım × 4 ms ≈ 1 saniye yukarı, 1 saniye aşağı.",
   "ESP32’de analogWrite() senin için LEDC PWM donanımını kullanır."
  ],
  "goals": [
   "LED birçok parlaklık seviyesi gösteriyor",
   "Karanlıktan parlağa ve geri gidiyor"
  ]
 },
 "colors": {
  "title": "Tek LED’de üç renk",
  "intro": "RGB LED, tek kılıfta üç LED’dir. Üç analogWrite() çağrısıyla ışığı karıştır.",
  "steps": [
   "color() fonksiyonunu doldur: her pin için bir tane olmak üzere üç analogWrite() çağrısı.",
   "loop() içinde kırmızı, yeşil, mavi ve mor göster, her biri bir saniye.",
   "Çalıştır ve LED’in değiştiğini izle."
  ],
  "hints": [
   "Mor, kırmızı + mavidir: color(255, 0, 255).",
   "Bu ortak katotlu bir RGB LED: uzun bacak GND’ye gider ve 255 tam parlaklık demektir."
  ],
  "goals": [
   "Kırmızı",
   "Yeşil",
   "Mavi",
   "Mor (kırmızı + mavi)"
  ]
 },
 "dimmer": {
  "title": "Bir parlaklık düğmesi",
  "intro": "Potansiyometre orta bacağında 0–3,3 V verir; analogRead() bunu 0–4095’e çevirir. LED parlaklığını ayarlamak için kullan.",
  "steps": [
   "Başlangıç kodunu çalıştır ve düğmeyi çevir (sürükle ya da Kontroller çubuğunu kullan). Sayıları izle.",
   "Dönüştür: `int level = map(raw, 0, 4095, 0, 255);`",
   "LED’e yaz: `analogWrite(LED_PIN, level);` Yeniden başlat ve düğmeyi bir uçtan öbürüne çevir."
  ],
  "hints": [
   "ESP32 ADC’si 12 bitliktir: 0’dan 4095’e. Eski Arduino anlatımları 1023 kullanır, çünkü Uno 10 bitliktir.",
   "analogWrite() 0’dan 255’e kadar değer alır."
  ],
  "goals": [
   "Düğme bir uçta: LED sönük",
   "Düğme öbür uçta: LED tam parlak",
   "Düğme ortada: LED yarı parlak"
  ]
 },
 "speed": {
  "title": "Meydan okuma: hız düğmesi",
  "intro": "Şimdi düğme yanıp sönme hızını ayarlıyor: bir uçta hızlı, öbür uçta yavaş.",
  "steps": [
   "Düğmeyi oku ve bir bekleme süresine eşle, örneğin 50 ile 1000 ms arası.",
   "O bekleme süresiyle yanıp söndür.",
   "Çalışırken düğmeyi iki uca da çevir."
  ],
  "hints": [
   "`int wait = map(analogRead(POT_PIN), 0, 4095, 50, 1000);`"
  ],
  "goals": [
   "Bir uçta hızlı yanıp sönüyor (200 ms altında)",
   "Öbür uçta yavaş yanıp sönüyor (700 ms üstünde)"
  ]
 }
};
Object.assign(TR,{
 "Write real Arduino code, wire a circuit and run it in your browser. Free ESP32 lessons based on ESP32 From Zero.": "Gerçek Arduino kodu yaz, devreyi kur ve tarayıcında çalıştır. ESP32 From Zero’ya dayanan ücretsiz ESP32 dersleri.",
 "A code editor next to an ESP32 circuit with a glowing LED": "Parlayan bir LED’li ESP32 devresinin yanında bir kod editörü",
 "WRITE. WIRE. RUN.": "YAZ. KUR. ÇALIŞTIR.",
 "Write real Arduino code, wire the circuit and press Run. Everything happens in your browser: no kit, no installation. Every unit follows an ESP32 From Zero episode.": "Gerçek Arduino kodu yaz, devreyi kur ve Çalıştır’a bas. Her şey tarayıcında olur: kit yok, kurulum yok. Her ünite bir ESP32 From Zero bölümünü izler.",
 "Start the first project": "İlk projeye başla",
 "Open the free workshop": "Ücretsiz atölyeyi aç",
 "BUILD FIRST · QUIZZES IN BETWEEN": "ÖNCE YAP · ARALARDA SORULAR",
 "CHALLENGE": "MEYDAN OKUMA",
 "BUILD": "YAP",
 "QUIZ": "SORU",
 "HOW IT WORKS": "NASIL ÇALIŞIR",
 "Build, run, check.": "Kur, çalıştır, kontrol et.",
 "Each project lists its goals. They are checked live while your circuit runs. Stuck? Open a hint, or look at the solution.": "Her projede hedefler listelenir. Devren çalışırken hedefler canlı olarak kontrol edilir. Takıldın mı? Bir ipucu aç ya da çözüme bak.",
 "GOALS · CHECKED WHILE IT RUNS": "HEDEFLER · ÇALIŞIRKEN KONTROL EDİLİR",
 "done": "tamam",
 "not yet": "henüz değil",
 "All goals reached. Well done!": "Tüm hedeflere ulaştın. Aferin!",
 "Complete project →": "Projeyi tamamla →",
 "Show a hint ({i} / {n})": "İpucu göster ({i} / {n})",
 "Load the solution": "Çözümü yükle",
 "Start over": "Baştan başla",
 "My project": "Projem",
 "Build anything.": "İstediğini yap.",
 "Your own projects: write code, add parts from “+ Add part”, drag a wire from pin to pin and press Run. Projects are saved in this browser.": "Kendi projelerin: kod yaz, “+ Parça ekle” ile parça ekle, bir pinden diğerine kablo sürükle ve Çalıştır’a bas. Projeler bu tarayıcıda kaydedilir.",
 "Project": "Proje",
 "New": "Yeni",
 "Rename": "Yeniden adlandır",
 "Open an example": "Bir örnek aç",
 "Examples…": "Örnekler…",
 "Export": "Dışa aktar",
 "Import": "İçe aktar",
 "Delete": "Sil",
 "Project file": "Proje dosyası",
 "Project name": "Proje adı",
 "Keep at least one project.": "En az bir proje kalmalı.",
 "Delete this project?": "Bu proje silinsin mi?",
 "Example opened as a new project.": "Örnek yeni bir proje olarak açıldı.",
 "This is not a Pin by Pin Lab project file.": "Bu bir Pin by Pin Lab proje dosyası değil.",
 "It works!": "Çalışıyor!",
 "Your circuit and your code reached every goal. Your work stays saved in this project.": "Devren ve kodun tüm hedeflere ulaştı. Çalışman bu projede kayıtlı kalır.",
 "Replace your code and circuit with the solution?": "Kodun ve devren çözümle değiştirilsin mi?",
 "Solution loaded. Press ▶ Run to see it work.": "Çözüm yüklendi. Çalıştığını görmek için ▶ Çalıştır’a bas.",
 "Start this project again from the beginning?": "Bu proje baştan başlasın mı?",
 "▶ Run": "▶ Çalıştır",
 "Restart": "Yeniden başlat",
 "Sound": "Ses",
 "Download .ino": ".ino indir",
 "Arduino code": "Arduino kodu",
 "Circuit": "Devre",
 "+ Add part": "+ Parça ekle",
 "Circuit diagram. Drag parts to move them. Drag from one pin to another to connect a wire.": "Devre şeması. Parçaları taşımak için sürükle. Kablo bağlamak için bir pinden diğerine sürükle.",
 "Zoom out": "Uzaklaştır",
 "Fit": "Sığdır",
 "Zoom in": "Yakınlaştır",
 "Baud rate": "Baud hızı",
 "Clear": "Temizle",
 "Code changed: press ↺ to restart with it.": "Kod değişti: yeniden başlatmak için ↺ tuşuna bas.",
 "Line {n}": "Satır {n}",
 "Error": "Hata",
 "Fix the error, then run again.": "Hatayı düzelt, sonra tekrar çalıştır.",
 "Running": "Çalışıyor",
 "Stopped": "Durdu",
 "The program stopped with an error.": "Program bir hatayla durdu.",
 "Your code uses {b} baud, the monitor is set to {m}. Choose {b} above, otherwise you see garbage.": "Kodun {b} baud kullanıyor, monitör {m} olarak ayarlı. Yukarıdan {b} seç, yoksa anlamsız karakterler görürsün.",
 "Breadboard {h}": "Breadboard {h}",
 "Wire": "Kablo",
 "Color": "Renk",
 "Resistance": "Direnç",
 "Contact bounce (realistic)": "Kontak zıplaması (gerçekçi)",
 "Type": "Tür",
 "passive (tone)": "pasif (tone)",
 "active (beeps on HIGH)": "aktif (HIGH’da bip sesi çıkarır)",
 "common cathode (−)": "ortak katot (−)",
 "common anode (+)": "ortak anot (+)",
 "↻ Rotate": "↻ Döndür",
 "Controls": "Kontroller",
 "Press {id}": "{id} butonuna bas",
 "Turn {id}": "{id} düğmesini çevir",
 "Wire started: click another pin to finish it (Esc cancels).": "Kablo başladı: bitirmek için başka bir pine tıkla (Esc iptal eder).",
 "Only the first ESP32 is simulated.": "Yalnızca ilk ESP32 simüle edilir.",
 "GPIO {pin} is not on this ESP32 DevKit board ({fn}). Check the pin number.": "GPIO {pin} bu ESP32 DevKit kartında yok ({fn}). Pin numarasını kontrol et.",
 "GPIO {pin} is used by the USB serial connection. Pick another pin.": "GPIO {pin} USB seri bağlantısı tarafından kullanılıyor. Başka bir pin seç.",
 "GPIO {pin} is input-only: it cannot drive an LED. Use a pin such as 23 or 25.": "GPIO {pin} yalnızca giriştir: LED sürmez. 23 veya 25 gibi bir pin kullan.",
 "digitalWrite({pin}) before pinMode({pin}, OUTPUT): the pin is not driven.": "digitalWrite({pin}), pinMode({pin}, OUTPUT)’tan önce çağrıldı: pin sürülmüyor.",
 "digitalRead({pin}) before pinMode({pin}, INPUT…).": "digitalRead({pin}), pinMode({pin}, INPUT…)’tan önce çağrıldı.",
 "GPIO {pin} cannot read analog values.": "GPIO {pin} analog değer okuyamaz.",
 "Serial.begin(115200) is missing in setup(): nothing is printed.": "setup() içinde Serial.begin(115200) eksik: hiçbir şey yazdırılmaz.",
 "GPIO {pin} is supplying {mA} mA: that is a short circuit or a missing resistor. A real pin can be damaged.": "GPIO {pin} {mA} mA veriyor: bu bir kısa devre ya da eksik bir direnç. Gerçek bir pin zarar görebilir.",
 "Short circuit: {src} is connected straight to GND. Remove that wire.": "Kısa devre: {src} doğrudan GND’ye bağlı. O kabloyu kaldır.",
 "{part} gets about {mA} mA. A real LED burns out without a resistor: add 220 Ω in series.": "{part} yaklaşık {mA} mA çekiyor. Gerçek bir LED dirençsiz bozulur: seri olarak 220 Ω ekle.",
 "Code": "Kod",
 "Serial": "Seri",
 "ESP32 DevKit": "ESP32 DevKit",
 "LED": "LED",
 "Push button": "Buton",
 "Potentiometer": "Potansiyometre",
 "Buzzer": "Buzzer",
 "yellow": "sarı",
 "white": "beyaz",
 "orange": "turuncu",
 "anode +": "anot +",
 "cathode −": "katot −",
 "common": "ortak",
 "signal": "sinyal",
 "1. start the serial connection at 115200 baud": "1. seri bağlantıyı 115200 baud ile başlat",
 "2. print a greeting": "2. bir selam yazdır",
 "add one to seconds, print the sentence, wait one second": "saniyeye bir ekle, cümleyi yazdır, bir saniye bekle",
 "No code today: this LED gets its power from the 3V3 pin.": "Bugün kod yok: bu LED gücünü 3V3 pininden alıyor.",
 "the GPIO our LED is wired to": "LED’imizin bağlı olduğu GPIO",
 "make LED_PIN an output": "LED_PIN’i çıkış yap",
 "on, wait 500 ms, off, wait 500 ms": "yan, 500 ms bekle, sön, 500 ms bekle",
 "our code drives this pin": "kodumuz bu pini sürüyor",
 "3.3 V -> LED on": "3,3 V -> LED yanar",
 "0 V -> LED off": "0 V -> LED söner",
 "the button pin: input with the internal pull-up": "buton pini: dahili pull-up’lı giriş",
 "read the button, print it, light the LED while it reads LOW": "butonu oku, yazdır, LOW okurken LED’i yak",
 "HIGH until pressed": "basılana kadar HIGH",
 "the button is not pressed at the start": "buton başlangıçta basılı değil",
 "the button changed": "buton değişti",
 "...and it's now pressed: a new press": "...ve şimdi basılı: yeni bir basış",
 "debounce: wait until the contacts stop bouncing": "debounce: kontaklar zıplamayı bırakana kadar bekle",
 "when the LED last changed (ms)": "LED’in en son değiştiği an (ms)",
 "when the button last changed (ms)": "butonun en son değiştiği an (ms)",
 "1. the button: a new press switches blinking on or off": "1. buton: yeni bir basış yanıp sönmeyi açar veya kapatır",
 "2. the LED: flip it every 500 ms, without waiting": "2. LED: beklemeden her 500 ms’de bir ters çevir",
 "switched on/off by the button": "buton tarafından açılıp kapatılır",
 "always blinking": "her zaman yanıp söner",
 "count from 0 to 255 and back, writing each value with analogWrite()": "0’dan 255’e ve geri say, her değeri analogWrite() ile yaz",
 "write r, g and b to the three pins": "r, g ve b değerlerini üç pine yaz",
 "then green, blue and purple": "sonra yeşil, mavi ve mor",
 "purple": "mor",
 "turn raw into a brightness 0–255 with map(), then analogWrite it": "raw değerini map() ile 0–255 arası bir parlaklığa çevir, sonra analogWrite ile yaz"
});
Object.assign(TR,{'Undo':'Geri al','Redo':'Yinele','Undo (Ctrl+Z)':'Geri al (Ctrl+Z)','Redo (Ctrl+Y)':'Yinele (Ctrl+Y)','Cancel wire':'Kabloyu iptal et','Wire started: click another pin to finish it, or press Cancel wire.':'Kablo başladı: bitirmek için başka bir pine tıkla ya da “Kabloyu iptal et”e bas.'});
Object.assign(TR,{'Tool':'Araç','Move':'Taşı','Wire':'Kablo','Move parts, select wires (V)':'Parçaları taşı, kabloları seç (V)','Draw wires (W)':'Kablo çek (W)','Automatic colour':'Otomatik renk','Wire tool: click a pin or hole, then another one. Press Esc or ✋ Move to stop.':'Kablo aracı: bir pine ya da deliğe, sonra bir başkasına tıkla. Bırakmak için Esc’e ya da ✋ Taşı’ya bas.'});
// questions replaced so that nothing is asked before it is taught
Object.assign(TR_LESSONS.check1.questions[0],{q:'Bu program ilk 3 saniyede ne yazdırır?',choices:['1, 2, 3','0, 1, 2','1, 1, 1'],explain:'n ilk yazdırmadan önce 1 olur, sonra loop her saniye yeniden çalışır: 1, 2, 3.'});
Object.assign(TR_LESSONS.check1.questions[3],{q:'Kart açılırken yalnızca bir kez çalışması gereken kodu nereye yazarsın?',choices:['setup() içine','loop() içine','loop()’tan sonra'],explain:'setup() açılışta bir kez çalışır; loop() ondan sonra tekrar tekrar çalışır.'});
Object.assign(TR_LESSONS.check2.questions[1],{q:'Direnç a4–a7’de, LED’in + bacağı a7’de, − bacağı a8’de. 3V3’ten gelen kablo nereye gitmeli?',explain:'3V3 direncin boştaki ucuna ulaşmalı: a–e grubundaki 4. sütun. 7. sütun direnci atlar; f4 diğer gruptadır.'});
Object.assign(TR_LESSONS.check2.questions[2],{q:'LED’i dirençsiz olarak doğrudan 3V3 ile GND arasına bağlarsan ne olur?',choices:['Çok akım akar; LED bozulabilir','Hiçbir şey, LED kendi akımını sınırlar','LED daha verimli yanar']});
Object.assign(TR_LESSONS.check5.questions[4],{q:'analogWrite(LED_PIN, 64): pin zamanın yaklaşık yüzde kaçında açık?',explain:'64 / 255 ≈ 0,25; yani pin zamanın yaklaşık %25’inde açık.'});
TR_LESSONS.resistor.intro=TR_LESSONS.resistor.intro.replace('GPIO için 3,3 V','3V3 pininden 3,3 V');
Object.assign(TR,{'YOUR TURN':'SIRA SENDE'});
Object.assign(TR_MISSIONS,{
 "hello2": {
  "title": "Sıra sende: biraz daha konuş",
  "intro": "Selamlamanın altına ikinci bir satır yazdır, mesela adını. Her satır yalnızca bir kez görünmeli.",
  "steps": [
   "setup() içine kendi metninle ikinci bir `Serial.println(…)` ekle.",
   "Çalıştır ve monitöre bak."
  ],
  "hints": [
   "Selamlamanın hemen altına, yine setup() içine koy. loop() içindeki kod tekrar eder."
  ],
  "goals": [
   "İki farklı satır yazdırılıyor",
   "Her satır yalnızca bir kez görünüyor"
  ]
 },
 "counter2": {
  "title": "Sıra sende: daha hızlı say",
  "intro": "Sayacı saniyede iki kez artır.",
  "steps": [
   "loop() içindeki bekleme süresini değiştir, yeni satır her yarım saniyede bir gelsin.",
   "Yeniden başlat ve zamanlamayı izle."
  ],
  "hints": [
   "Yarım saniye 500 milisaniyedir."
  ],
  "goals": [
   "Sayı her satırda bir artıyor",
   "Her 500 ms’de yeni bir satır"
  ]
 },
 "circuit2": {
  "title": "Sıra sende: ikinci bir LED",
  "intro": "Kendi direnciyle ikinci bir LED ekle; o da + rayından beslensin. İkisi de yanmalı.",
  "steps": [
   "“+ Parça ekle” ile bir LED ve bir direnç ekle.",
   "Aynı yolu başka sütunlarda yeniden kur: + ray → direnç → LED uzun bacak … kısa bacak → − ray.",
   "Çalıştır."
  ],
  "hints": [
   "Her LED’in kendi direnci olmalı.",
   "Raylar tahtanın boyunca uzanır, bu yüzden boş olan herhangi bir sütunu kullanabilirsin."
  ],
  "goals": [
   "İki LED yanıyor",
   "İkisi de 20 mA altında"
  ]
 },
 "blink2": {
  "title": "Sıra sende: deniz feneri",
  "intro": "3. bölümden: kısa bir parlama, sonra uzun bir karanlık bekleme. LED 100 ms yansın, 1900 ms sönük kalsın.",
  "steps": [
   "İki delay() değerini değiştir.",
   "Yeniden başlat ve say: her iki saniyede bir parlama."
  ],
  "hints": [
   "İlk delay HIGH’dan sonra gelir (yanık süre), ikincisi LOW’dan sonra (sönük süre)."
  ],
  "goals": [
   "100 ms yanık, 1900 ms sönük"
  ]
 },
 "press2": {
  "title": "Sıra sende: tersine çevir",
  "intro": "Şimdi LED hep yanık, sadece butona basılı tutarken sönüyor.",
  "steps": [
   "İki digitalWrite() satırında HIGH ile LOW’u değiştir.",
   "Çalıştır, sonra butona basılı tut ve bırak."
  ],
  "hints": [
   "Basılı hâlâ LOW okunur; sadece onunla ne yaptığın değişir."
  ],
  "goals": [
   "Bırakınca: LED yanık",
   "Basılı tutunca: LED sönük"
  ]
 },
 "toggle2": {
  "title": "Sıra sende: ON ya da OFF yaz",
  "intro": "Saymak yerine LED’in ne yaptığını yazdır: “LED ON” ya da “LED OFF”.",
  "steps": [
   "İki Serial satırını tek satırla değiştir: `Serial.println(ledOn ? \"LED ON\" : \"LED OFF\");`",
   "Çalıştır ve birkaç kez bas."
  ],
  "hints": [
   "`? :` ledOn true ise ilk metni, değilse ikinciyi seçer."
  ],
  "goals": [
   "LED ON ve LED OFF yazdırılıyor",
   "Son mesaj LED’in durumuyla uyuşuyor"
  ]
 },
 "nowait2": {
  "title": "Sıra sende: daha hızlı, hâlâ dinliyor",
  "intro": "LED’i her 200 ms’de bir yanıp söndür. Buton yine de onu hemen durdurmalı.",
  "steps": [
   "Yanıp sönme kontrolündeki aralığı 500’den 200’e değiştir.",
   "Çalıştır, sonra LED yanıp sönerken butona bas."
  ],
  "hints": [
   "Sadece tek bir sayı değişir: `now - lastBlink >= 200`."
  ],
  "goals": [
   "LED her 200 ms’de yanıp sönüyor",
   "Basınca hâlâ duruyor"
  ]
 },
 "fade2": {
  "title": "Sıra sende: yarıya kadar",
  "intro": "LED yalnızca yarım parlaklığa kadar yavaşça yansın, sonra geri sönsün.",
  "steps": [
   "İki döngünün üst sınırını 255’ten yaklaşık 127’ye değiştir.",
   "Yeniden başlat ve izle: hiç tam parlaklığa çıkmıyor."
  ],
  "hints": [
   "255’in yarısı yaklaşık 127’dir. İki for döngüsünde de değiştir."
  ],
  "goals": [
   "Hâlâ yumuşak geçiyor",
   "Yaklaşık yarıda duruyor (127 civarı)"
  ]
 },
 "colors2": {
  "title": "Sıra sende: sarı ve beyaz",
  "intro": "Gösteriye iki renk daha ekle: sarı (kırmızı + yeşil) ve beyaz (üçü birden).",
  "steps": [
   "Sarı için bir delay ile `color(255, 255, 0);` ekle.",
   "Üç kanalı da açık olan beyazı ekle. Çalıştır."
  ],
  "hints": [
   "Işık boyadan farklı karışır: kırmızı + yeşil = sarı."
  ],
  "goals": [
   "Sarı",
   "Beyaz"
  ]
 },
 "dimmer2": {
  "title": "Sıra sende: tersine çevir",
  "intro": "Düğmeyi ters çalıştır: önceden karanlık olan yerde parlak, parlak olan yerde karanlık olsun.",
  "steps": [
   "map() içindeki son iki sayıyı değiştir: `map(raw, 0, 4095, 255, 0)`.",
   "Yeniden başlat ve düğmeyi iki uca da çevir."
  ],
  "hints": [
   "map() yukarı sayabildiği gibi aşağı da sayabilir."
  ],
  "goals": [
   "Düğme başta: LED tam parlak",
   "Düğme sonda: LED sönük"
  ]
 }
});
Object.assign(TR,{'WAITING FOR THE VIDEO':'VİDEO BEKLENİYOR'});
