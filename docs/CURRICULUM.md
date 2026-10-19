# Curriculum mapping

Source: https://github.com/emjnbulut/esp32-from-zero/blob/70764db1e1ba76c6169427f67a60b3bd61fdedb5/CURRICULUM.md

| Unit | Source episode | Projects (missions) | Quizzes |
|---|---|---|---|
| 1 | Setup | Hello ESP32 (Serial), count the seconds | serial |
| 2 | Board and breadboard | first circuit from 3V3, find the mistakes | rows, resistor |
| 3 | Blink an LED | blink on GPIO 23, five blinks a second, challenge: two LEDs take turns | polarity |
| 4 | Buttons and millis | read a button, toggle with debounce, blink + button with millis, challenge: two LEDs two speeds | pullup, millis |
| 5 | PWM and potentiometer (planned) | fade, RGB colors, dimmer knob with map, challenge: speed knob | pwm, rgb, adc |
| 6–11 | | planned | |

Each unit ends with a checkpoint (5 questions, 4 to pass) that lets experienced learners skip ahead.

Every available unit ends with a checkpoint (5 questions, 4 to pass) that experienced learners can take to skip ahead.

Unit 5 is written before source episode 5 exists. Pins (LED 23, RGB 25/26/27, potentiometer 34) and `analogWrite()` (ESP32 core 3.x) are assumptions; align them when the episode is recorded and set `source` on unit 5 in `model.mjs`.

Principles: a short explanation, a concrete action, feedback, and independent transfer. No paywall or lives system. There are no points or XP: progress is just the list of finished tasks. Future task validation must accept equivalent correct circuits instead of checking one exact layout.
