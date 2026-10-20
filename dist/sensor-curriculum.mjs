// Internal curriculum; public availability is always controlled by releases.mjs.
const groups=[
 [6,['ldr','nightlight','melody','alarm']],
 [7,['temp','oled','station']],
 [8,['motion','visitors','irq']],
 [9,['relay','relaybtn','wifi']],
 [10,['web','webtemp','webled']],
 [11,['room','climate','dashboard']]
];
// Each question stores English and Turkish together so answers cannot drift between languages.
// Rows: question, correct answer, two alternatives, explanation.
const questions={
 6:[
  [['What does map(raw, 0, 4095, 0, 100) produce?','A percentage','A frequency','A GPIO number','It scales the ADC range into 0-100.'],['map(raw, 0, 4095, 0, 100) ne üretir?','Yüzde değeri','Frekans','GPIO numarası','ADC aralığını 0-100 aralığına dönüştürür.']],
  [['In our LDR divider, what happens in the dark?','The ADC reading falls','The reading is always 4095','The buzzer starts itself','Less light raises the LDR resistance and lowers the divider voltage.'],['Bu LDR devresinde karanlıkta ne olur?','ADC değeri düşer','Değer hep 4095 olur','Buzzer kendiliğinden çalışır','Işık azalınca LDR direnci artar ve bölücünün gerilimi düşer.']],
  [['Which call plays a 294 Hz note on GPIO 25 for 300 ms?','tone(25, 294, 300)','tone(294, 25, 300)','delay(294)','tone takes pin, frequency and optional duration, in that order.'],['GPIO 25 üzerinde 300 ms boyunca 294 Hz çalan çağrı hangisi?','tone(25, 294, 300)','tone(294, 25, 300)','delay(294)','tone sırasıyla pin, frekans ve isteğe bağlı süre alır.']],
  [['How do you stop an ongoing tone on pin 25?','noTone(25)','Serial.end()','analogRead(25)','noTone stops the waveform on that pin.'],['25 numaralı pindeki sürekli sesi nasıl durdurursun?','noTone(25)','Serial.end()','analogRead(25)','noTone o pindeki ses dalgasını durdurur.']],
  [['Does tone(pin, frequency, duration) wait for the note to end?','No, the program continues','Yes, loop is paused','Only in setup','The note runs while the sketch continues; use timing to space notes.'],['tone(pin, frequency, duration) sesin bitmesini bekler mi?','Hayır, program devam eder','Evet, loop durur','Yalnızca setup içinde','Ses çalarken program ilerler; notalar arasını zamanlama ile ayarla.']]
 ],
 7:[
  [['Which method reads humidity from the DHT?','dht.readHumidity()','analogWrite(4, 50)','display.display()','The DHT library decodes the digital sensor data.'],['DHT üzerinden nemi hangi metot okur?','dht.readHumidity()','analogWrite(4, 50)','display.display()','DHT kütüphanesi sensörün dijital verisini çözer.']],
  [['What does isnan(t) detect?','An invalid sensor reading','A temperature above 30','An empty OLED buffer','NaN means not a number; check it before using a failed reading.'],['isnan(t) neyi algılar?','Geçersiz sensör ölçümünü','30 üzerindeki sıcaklığı','Boş OLED tamponunu','NaN bir sayı olmadığını belirtir; hatalı ölçümü kullanmadan kontrol et.']],
  [['Which pins carry I2C data and clock in these projects?','SDA 21, SCL 22','SDA 22, SCL 21','GPIO 34 and GND','Wire.begin(21, 22) chooses SDA and SCL.'],['Bu projelerde I2C veri ve saat pinleri hangileri?','SDA 21, SCL 22','SDA 22, SCL 21','GPIO 34 ve GND','Wire.begin(21, 22), SDA ve SCL pinlerini seçer.']],
  [['What makes newly drawn text visible on the OLED?','display.display()','display.setCursor(0, 0)','Serial.println()','Drawing changes a buffer; display() sends it to the screen.'],['Yeni çizilen yazıyı OLED üzerinde ne görünür yapar?','display.display()','display.setCursor(0, 0)','Serial.println()','Çizim tamponu değiştirir; display() içeriği ekrana gönderir.']],
  [['Why wait about two seconds between DHT11 reads here?','The sensor updates slowly','I2C needs two seconds per bit','The OLED must cool down','Reading faster cannot create fresh measurements from a slow sensor.'],['DHT11 okumaları arasında neden yaklaşık iki saniye beklenir?','Sensör yavaş güncellenir','I2C her bit için iki saniye ister','OLED soğumalıdır','Daha sık okumak yavaş sensörden yeni ölçüm üretmez.']]
 ],
 8:[
  [['What indicates motion on the PIR output?','HIGH','LOW at all times','An analog percentage','In this model motion drives the output HIGH.'],['PIR çıkışında hareketi ne gösterir?','HIGH','Her zaman LOW','Analog yüzde','Bu modelde hareket çıkışı HIGH yapar.']],
  [['Which condition counts a new rising edge?','state == HIGH && lastState == LOW','state == HIGH','state == lastState','An edge is a change; a level can last for many loop iterations.'],['Yeni yükselen kenarı hangi koşul sayar?','state == HIGH && lastState == LOW','state == HIGH','state == lastState','Kenar bir değişimdir; seviye birçok loop turu boyunca sürebilir.']],
  [['Which interrupt mode catches LOW to HIGH?','RISING','FALLING','OUTPUT','RISING catches the start of a HIGH pulse.'],['LOW seviyesinden HIGH seviyesine geçişi hangi kesme modu yakalar?','RISING','FALLING','OUTPUT','RISING, HIGH darbesinin başlangıcını yakalar.']],
  [['What should the interrupt handler do in this exercise?','Set a flag quickly','Wait with delay(1000)','Print a full web page','Keep the handler short and do the slow work in loop.'],['Bu alıştırmada kesme fonksiyonu ne yapmalı?','Hızla bir bayrak ayarlamalı','delay(1000) ile beklemeli','Tam bir web sayfası yazdırmalı','Kesme fonksiyonunu kısa tut ve yavaş işleri loop içinde yap.']],
  [['Why is motionSeen declared volatile?','It is shared with the interrupt handler','It stores a decimal number','It is a constant','volatile tells the compiler the value may change outside the ordinary flow.'],['motionSeen neden volatile olarak tanımlanır?','Kesme fonksiyonu ile paylaşılır','Ondalıklı sayı saklar','Sabit bir değerdir','volatile, değerin normal akış dışında değişebileceğini derleyiciye bildirir.']]
 ],
 9:[
  [['Which value switches this active-low relay on?','LOW','HIGH','INPUT_PULLUP','Active-low means a LOW control signal activates the module.'],['LOW ile tetiklenen bu röleyi hangi değer açar?','LOW','HIGH','INPUT_PULLUP','LOW ile tetikleme, LOW kontrol sinyalinin modülü etkinleştirmesidir.']],
  [['Why start the relay output HIGH?','To keep this relay off at startup','To start Wi-Fi','To measure current','HIGH is the inactive level for this module.'],['Röle çıkışı başlangıçta neden HIGH yapılır?','Başlangıçta röleyi kapalı tutmak için','Wi-Fi başlatmak için','Akım ölçmek için','Bu modülde HIGH, etkin olmayan seviyedir.']],
  [['Does WiFi.begin() guarantee an immediate connection?','No, check WiFi.status()','Yes, always','Only if Serial is open','begin starts connecting; the sketch waits for WL_CONNECTED.'],['WiFi.begin() anında bağlantı garantiler mi?','Hayır, WiFi.status() kontrol edilir','Evet, her zaman','Yalnızca Serial açıksa','begin bağlanmayı başlatır; program WL_CONNECTED durumunu bekler.']],
  [['Which method reports the board IP address?','WiFi.localIP()','WiFi.RSSI()','Serial.available()','localIP returns the local network address once connected.'],['Kartın IP adresini hangi metot verir?','WiFi.localIP()','WiFi.RSSI()','Serial.available()','localIP bağlantıdan sonra yerel ağ adresini verir.']],
  [['What belongs in a shared example sketch?','Placeholder network credentials','Your real Wi-Fi password','A payment token','Use placeholders and enter private credentials only in your own local copy.'],['Paylaşılan örnek programda ne bulunmalı?','Örnek ağ bilgileri','Gerçek Wi-Fi parolan','Ödeme anahtarı','Örnek değerler kullan; özel ağ bilgilerini yalnızca kendi yerel kopyana gir.']]
 ],
 10:[
  [['What registers a handler for the root path?','server.on("/", handleRoot)','server.send(200, "text/html", "Hi")','Serial.begin(115200)','on associates a request path with your function.'],['Kök yol için fonksiyonu ne kaydeder?','server.on("/", handleRoot)','server.send(200, "text/html", "Hi")','Serial.begin(115200)','on bir istek yolunu fonksiyonunla eşleştirir.']],
  [['Which call must run repeatedly to serve requests?','server.handleClient()','WiFi.begin()','display.clearDisplay()','handleClient dispatches waiting requests to handlers.'],['İstekleri yanıtlamak için hangi çağrı tekrarlanmalı?','server.handleClient()','WiFi.begin()','display.clearDisplay()','handleClient bekleyen istekleri ilgili fonksiyonlara iletir.']],
  [['What does HTTP status 200 mean here?','OK','Not connected','Sensor error','200 marks a successful response.'],['Burada HTTP durum kodu 200 ne anlama gelir?','Başarılı','Bağlı değil','Sensör hatası','200 başarılı yanıtı belirtir.']],
  [['How is a float converted to text with one decimal?','String(t, 1)','String(1, t)','analogRead(t)','String(t, 1) formats a number for inclusion in the page.'],['Ondalıklı sayı tek basamaklı metne nasıl çevrilir?','String(t, 1)','String(1, t)','analogRead(t)','String(t, 1) sayıyı sayfaya eklemek için biçimlendirir.']],
  [['When does the temperature page take a fresh reading?','When its handler answers a new request','Only once at startup','When the HTML heading changes','Reload the simulated route to run the handler and read the sensor again.'],['Sıcaklık sayfası ne zaman yeni ölçüm alır?','Fonksiyon yeni isteği yanıtlarken','Yalnızca başlangıçta','HTML başlığı değişince','Fonksiyonu yeniden çalıştırıp sensörü okumak için simüle edilen yolu yenile.']]
 ],
 11:[
  [['When should the smart lamp be on?','In darkness with recent motion','Whenever it is bright','Whenever Wi-Fi is connected','The lamp combines a light condition with a motion timeout.'],['Akıllı lamba ne zaman yanmalı?','Karanlıkta ve yakın zamanda hareket olduysa','Ortam aydınlıkken','Wi-Fi bağlıyken','Lamba ışık koşulunu hareket zaman aşımıyla birleştirir.']],
  [['Which timing comparison keeps working across millis rollover?','now - last >= interval','now >= last + interval','last == interval','Unsigned subtraction preserves elapsed time across rollover.'],['millis taşmasında hangi zaman karşılaştırması çalışmaya devam eder?','now - last >= interval','now >= last + interval','last == interval','İşaretsiz çıkarma, taşma sırasında geçen süreyi korur.']],
  [['Fan on at 28, off at 26: what happens at 27?','It keeps its previous state','It always turns on','It always turns off','Two thresholds create hysteresis and avoid rapid switching.'],['Fan 28 derecede açılıp 26 derecede kapanıyor: 27 derecede ne olur?','Önceki durumunu korur','Her zaman açılır','Her zaman kapanır','İki eşik histerezis oluşturur ve sık açılıp kapanmayı önler.']],
  [['Which function stops the buzzer after the alarm condition clears?','noTone(pin)','tone(pin, 880)','Serial.begin(115200)','The output must be updated for both the true and false conditions.'],['Alarm koşulu kalkınca buzzer hangi fonksiyonla durur?','noTone(pin)','tone(pin, 880)','Serial.begin(115200)','Çıkış hem doğru hem yanlış koşul için güncellenmelidir.']],
  [['What must you do to refresh the room dashboard after changing a sensor?','Request the / route again','Change the source code','Disconnect GND','The dashboard reads its sensors in the request handler.'],['Sensörü değiştirdikten sonra oda panelini yenilemek için ne yapmalısın?','/ yolunu yeniden istemelisin','Kaynak kodu değiştirmelisin','GND bağlantısını çıkarmalısın','Panel sensörleri istek fonksiyonunda okur.']]
 ]
};
function question(row,i){const [q,correct,a,b,explain]=row;const choices=[a,b];choices.splice(i%3,0,correct);return {q,choices,answer:i%3,explain};}
export const sensorLessons=groups.flatMap(([unit,ids])=>[
 ...ids.map((id,i)=>({id,unit,type:'mission',minutes:i===ids.length-1?15:10,tag:i===ids.length-1?'CHALLENGE':'BUILD'})),
 {id:'check'+unit,unit,type:'checkpoint',title:`Unit ${unit} checkpoint`,minutes:6,tag:'CHECKPOINT',pass:4,
 intro:'Review what you built. Answer four of five questions to pass this unit.',hint:'After checking, read the explanation for each answer.',questions:questions[unit].map((pair,i)=>question(pair[0],i))}
]);
export const TR_SENSOR_CHECKPOINTS=Object.fromEntries(groups.map(([unit])=>['check'+unit,{
 title:`Ünite ${unit} kontrol noktası`,tag:'KONTROL NOKTASI',intro:'Yaptıklarını gözden geçir. Üniteyi geçmek için beş sorudan dördünü doğru yanıtla.',hint:'Kontrol ettikten sonra her yanıtın açıklamasını oku.',questions:questions[unit].map((pair,i)=>question(pair[1],i))
}]));
