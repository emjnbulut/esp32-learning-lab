# Curriculum mapping

Source: https://github.com/emjnbulut/esp32-from-zero/blob/70764db1e1ba76c6169427f67a60b3bd61fdedb5/CURRICULUM.md

| Unit | Source episode | Web adaptation | Status |
|---|---|---|---|
| 1 | Setup | GPIO purpose, serial output, setup/loop and milliseconds. Physical IDE/driver install remains in linked source. | 3 activities |
| 2 | Board and breadboard | Column connectivity, resistor current, LED polarity and closed paths | 3 activities |
| 3 | Blink an LED | Construct LED circuit, change blink timing, independently achieve 2 Hz | 3 activities |
| 4 | Buttons and millis | Pull-up and floating pins, button wiring on GPIO 22, debounce, millis() instead of delay() | 6 activities |
| 5 | PWM and potentiometer | analogWrite duty cycle, RGB mixing (GPIO 25/26/27), analogRead 0–4095 on GPIO 34, map() dimmer | 6 activities |
| 6 | Light and sound | LDR and buzzers | Planned |
| 7 | Temperature and OLED | DHT11, I2C, SSD1306 | Planned |
| 8 | Motion and interrupts | PIR, obstacle sensor, interrupts | Planned |
| 9 | Relays and WiFi | Low-voltage relay exercises, network concepts | Planned |
| 10 | Web server | LED control and sensor page | Planned |
| 11 | Room monitor | Cumulative final project | Planned |

Every available unit ends with a checkpoint (5 questions, 4 to pass) that experienced learners can take to skip ahead.

Unit 5 is written before source episode 5 exists. Pins (LED 23, RGB 25/26/27, potentiometer 34) and `analogWrite()` (ESP32 core 3.x) are assumptions; align them when the episode is recorded and set `source` on unit 5 in `model.mjs`.

Principles: a short explanation, a concrete action, feedback, and independent transfer. No paywall or lives system. Current XP rewards completion once, not repeated clicking. Future task validation must accept equivalent correct circuits instead of checking one exact layout.
