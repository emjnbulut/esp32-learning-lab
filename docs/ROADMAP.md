# Roadmap

## 0.1 — First three units
Learning path, 9 tasks, local progress, guided LED circuit model, downloadable Arduino code. All later units explicitly marked preparing.

## 0.2 — Learn from real beginners
Done (2026-10-19): browser regression suite, keyboard navigation and focus handling, routes/back button, touch targets, wire layering, copy fixes. Still open: observing real first-time learners and acting on it; measured learning outcomes.

Observe whether first-time learners can place parts, wire pins, recognize polarity and complete the timing challenge without guessing. Improve touch interactions, keyboard navigation, lesson explanations and error feedback. Add measured learning outcomes and a proper automated browser regression suite.

## 0.3 — Buttons and time
Done (2026-10-19): unit 4 with 6 activities. Not yet: the two-LED wiring of the source (GPIO 25 on the top half) as a bench task, and button parts in the free workshop.

Model switch state, INPUT_PULLUP, a stable-state debounce algorithm and millis-based independent activities. Align with source episode 4 after its debounce review. Expand free workshop parts.

## Runtime proof (separate from UI milestones)
Evaluate reusable firmware emulation and licensing. Compile actual ESP32 sketches, expose GPIO changes, drive those pins through the connectivity graph, then test changed pin, changed delay, unplugged wire and unsupported APIs. Never label a behavior model as full firmware execution. Compare browser resource cost and server compile cost before selecting architecture.

## Following source curriculum
PWM/potentiometer, LDR/buzzer, DHT11/OLED, interrupts, relay/WiFi, sensor web page, final room monitor. Add each only with component behavior and end-to-end learning tasks.

## Access and sustainability
Confirm public release when the owner is ready. Keep the core course free. Optional account synchronization, sponsorship and donations can follow without gating learning. Do not introduce paid AI calls into the required exercise loop.
