# Rebuild: Wokwi-style simulator (started 2026-10-19)

Owner feedback on 0.5: "not good at all". The site must work like Wokwi: learners write real Arduino code,
wire a circuit, press Run and see it work. Units are hands-on projects inspired by the ESP32 From Zero
episodes; quizzes stay but are secondary. The free workshop becomes a Wokwi-like project editor.

## Plan and status

1. [x] `dist/sim/arduino.mjs` — Arduino C/C++ subset: tokenizer, parser, resolve pass with compiler-style
   errors, generator interpreter with virtual time (`tests/arduino.test.mjs`).
2. [x] `dist/sim/circuit.mjs` — parts (ESP32 DevKit V1 30-pin, breadboard, LED, resistor, button, pot,
   RGB LED, buzzer), nets (wires + breadboard strips + pins resting on holes), DC solver with diodes.
3. [x] `dist/sim/runtime.mjs` — Simulator: pin modes, PWM, tone, contact bounce, pot, Serial, warnings,
   LED/serial logs for goal checks (`tests/sim.test.mjs`, runs the real episode sketches when the
   sibling `esp32-from-zero` repo is present).
4. [x] Lab UI (`dist/lab.mjs`): code editor, SVG diagram editor (parts, wires, rotate, delete, props),
   run/stop, serial monitor, interactive parts while running; project storage.
5. [x] Missions: each unit = hands-on projects with starter code/diagram, steps, live goal checks, hints,
   solution; quizzes and checkpoints kept as secondary. Every mission solution is run headless in tests.
6. [x] Workshop = free Lab with saved projects, import/export, .ino download.
7. [x] TR translations (Sonnet low subagent), e2e tests, screenshots, docs.

Units 1–5 follow episodes 01–04 (+ planned 05). Pins: LED 23, button 22, second LED 25, RGB 25/26/27, pot 34.

Status 2026-10-19: 1.0 done — 15 missions (units 1–5), quizzes and checkpoints secondary, Wokwi-style workshop.
