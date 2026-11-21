# Curriculum mapping

Sources: esp32-from-zero `CURRICULUM.md` (v6, episodes 1-9 as published), `CURRICULUM_v7_DRAFT.md` (episodes 10 onward, draft of 21 Nov 2026), `PINMAP.md` and the lesson sketches in `lessons/NN-*/code`. Unit N = episode N.

| Unit | Episode (video) | Projects (missions) | Quizzes | Public |
|---|---|---|---|---|
| 1 | Setup (RyR4OEA7ESA) | Hello ESP32, count the seconds | serial | yes |
| 2 | Board and breadboard (NwtftTFs_Og) | first circuit from 3V3, find the mistakes | rows, resistor | yes |
| 3 | Blink an LED (doPDxOPFjQg) | blink on GPIO 23, five blinks a second, two LEDs take turns | polarity | yes |
| 4 | Buttons and millis (CR6nKg5I9g8, Recap 1 rjlXIKGOOks) | read a button, toggle with debounce, blink + button with millis, two LEDs two speeds | pullup, millis | yes |
| 5 | PWM (VaqdZeV5tRQ) | breathe in/out, halfway, a fade that never waits (button pauses it) | pwm | yes |
| 6 | RGB color mixing (j0tZ9P7YrU8) | three colors, yellow and white, one button four modes | rgb | yes |
| 7 | Analog input (g-fnxcOIyBI) | read the knob, knob dims the LED (/16), three zones, challenge: knob blink speed | adc, pin rules, print first | yes |
| 8 | map() and a level bar (1GYzg84mmAM) | dimmer with map(), turn it around, 3-LED level bar, speed knob, challenge: rotary safe lock | map() rounding | yes |
| 9 | Mini project 1: smart crossing (9B71hQRCbsM) | pedestrian crossing state machine, press duration, challenge: slow walker | new step = new start | yes |
| 10 | Reflex game 2.0 (v7) | OLED hello, beep on GPIO 32, reflex game with a Preferences record | checkpoint 10 | waiting |
| 11 | PIR motion alarm (v7) | motion light, visitor counter | checkpoint 11 | waiting |
| 12 | Phone control (v7) | Wi-Fi connection, first page, remote LED switch | checkpoint 12 | waiting |
| 13 | DHT11 weather station (v7) | thermometer, OLED weather station, live temperature page | checkpoint 13 | waiting |
| 14 | Fruit piano (v7) | melody with tone() | checkpoint 14 | waiting |
| 15 | LDR drawer alarm (v7) | light meter, night light, box alarm | checkpoint 15 | waiting |
| 16 | IR and interrupts (v7) | short-pulse interrupt | checkpoint 16 | waiting |
| 17 | Relay (v7) | relay cycle, relay toggle, hysteresis fan | checkpoint 17 | waiting |
| 18 | Smart room (v7) | timed lamp, room dashboard | checkpoint 18 | waiting |

Pins of units 1-10 follow PINMAP: red LED 23, yellow 18, green 17, RGB 25/26/27 (common cathode), button 22 (19 from episode 10), knob 34, OLED SDA 21 / SCL 22, passive buzzer 32.
The moved sensor missions of units 11-18 still use their older draft pins; align them before release (see ROADMAP 1.5).

Every unit ends with a checkpoint (5 questions, 4 to pass) that lets experienced learners skip ahead. There are no points or XP: progress is the list of finished tasks.
Release a unit by adding its number to `PUBLIC_RELEASED` in `dist/releases.mjs` on the day its video is published, and add its `videos` entry in `dist/model.mjs`.
