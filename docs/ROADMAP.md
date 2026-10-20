# Roadmap

## 1.2 — Accessible circuit building (2026-10-20)
Pin-based connections for phones/keyboards, actionable circuit warning highlights, and an optional five-step first-circuit guide. Placement remains undoable, each wire is confirmed, and existing simulator goals determine completion.

## 1.1 — Reliable saving and portable backups (2026-10-20)
Immediate save/recovery status, failed writes retained in tab memory with retry/download, full backup/restore, validated project imports, current workshop snapshots and invalidated mission goals after edits/restarts. Follow-up priorities with acceptance criteria: [IMPROVEMENTS.md](IMPROVEMENTS.md).

## 1.0 — Hands-on rebuild (done 2026-10-19)
Own browser simulator (Arduino C interpreter + circuit solver), Wokwi-style lab, 15 missions from episodes 1–4 (+ planned 5) with live goal checks, workshop projects. Next: unit 6 (LDR module, active/passive buzzer with `tone`) with an LDR part; Serial input in the monitor; `attachInterrupt` for unit 8; OLED/DHT parts for unit 7; a breadboard layout where the board straddles the board like in the videos.

## 0.1 — First three units
Learning path, 9 tasks, local progress, guided LED circuit model, downloadable Arduino code. All later units explicitly marked preparing.

## 0.2 — Learn from real beginners
Done (2026-10-19): browser regression suite, keyboard navigation and focus handling, routes/back button, touch targets, wire layering, copy fixes. Still open: observing real first-time learners and acting on it; measured learning outcomes.

Observe whether first-time learners can place parts, wire pins, recognize polarity and complete the timing challenge without guessing. Improve touch interactions, keyboard navigation, lesson explanations and error feedback. Add measured learning outcomes and a proper automated browser regression suite.

## 0.3 — Buttons and time
Done (2026-10-19): unit 4 with 6 activities. Not yet: the two-LED wiring of the source (GPIO 25 on the top half) as a bench task, and button parts in the free workshop.

Model switch state, INPUT_PULLUP, a stable-state debounce algorithm and millis-based independent activities. Align with source episode 4 after its debounce review. Expand free workshop parts.

## 0.5 — Checkpoints and unit 5
Done (2026-10-19): unit checkpoints for experienced learners, unit 5 (PWM, RGB, potentiometer), workshop tabs. Next: align unit 5 with source episode 5 when it exists; unit 6 (LDR, buzzers).

## Runtime proof (separate from UI milestones)
Evaluate reusable firmware emulation and licensing. Compile actual ESP32 sketches, expose GPIO changes, drive those pins through the connectivity graph, then test changed pin, changed delay, unplugged wire and unsupported APIs. Never label a behavior model as full firmware execution. Compare browser resource cost and server compile cost before selecting architecture.

## Following source curriculum
PWM/potentiometer, LDR/buzzer, DHT11/OLED, interrupts, relay/WiFi, sensor web page, final room monitor. Add each only with component behavior and end-to-end learning tasks.

## Access and sustainability
Confirm public release when the owner is ready. Keep the core course free. Optional account synchronization, sponsorship and donations can follow without gating learning. Do not introduce paid AI calls into the required exercise loop.
