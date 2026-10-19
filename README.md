# Pin by Pin Lab

Free, step-by-step ESP32 learning, following [ESP32 From Zero](https://github.com/emjnbulut/esp32-from-zero).

A Turkish learning workshop with an original visual identity: paper tones, technical drawings, a learning path and a working virtual circuit bench. No account or payment is needed for the current learning activities.

## Run

Requires Node.js 20+. The site itself has no dependencies or build step; Playwright is a dev dependency used only by the browser tests.

```sh
npm run dev     # local preview
npm run check   # syntax + model tests
npm install     # once, for browser tests
npm run e2e     # Playwright regression suite (Chromium)
```

Open http://127.0.0.1:4177. `dist/` is the complete static website and works under a hosting subdirectory.

## Version 0.3

- Unit 4 "Butonlar ve zaman" (source episode 4), 6 activities: INPUT_PULLUP and floating-pin quizzes; a button lab (push button across the channel on GPIO 22, rotate it to see the sideways mistake, INPUT vs INPUT_PULLUP, hold-to-press with mouse, touch or Space, live Serial Monitor); a debounce simulation with a signal trace; a millis() quiz; and a delay() vs millis() challenge with a timeline of read instants.
- Model: shared connectivity graph with button contacts, `inputLevel`, `buttonState`, seeded bounce signals with the source debounce rule, and the delay/millis read model. Covered by model and browser tests.

## Version 0.2

- Address-bar routes (`#/`, `#/atolye`, `#/defter`, `#/ders/<id>`): refresh keeps the current lesson, the browser back button works, locked deep links fall back to the learning path.
- Keyboard: focus survives every re-render; breadboard holes use arrow-key navigation (one tab stop) and choosing a part jumps to the hole cursor.
- Wires end in the exact hole that was chosen, are drawn under holes and ESP32 pins (a wire no longer blocks the next connection), and are listed with readable names such as `GPIO 23 — c4`. Duplicate wires inside one connected column are ignored.
- Larger invisible touch targets on breadboard holes; part legs no longer swallow hole clicks.
- Turkish copy fixes; lesson counts derived from the curriculum instead of a fixed 9.
- Browser regression suite (`tests/e2e.test.mjs`) covering the HANDOFF checklist; runs in CI.

## Version 0.1

- 11-unit roadmap mapped to the source curriculum; units 1–3 contain 9 usable activities (unit 4 added in 0.3).
- Questions, explanations, progressive unlocking, one-time XP, review, and local progress.
- Export/import progress, clear progress with confirmation, download generated Arduino sketch.
- Interactive board/breadboard: drag or click to place LED/resistor, choose endpoints to wire, remove wires, reverse LED polarity, change timing.
- Connectivity evaluation includes independent breadboard banks, series resistor, LED direction, missing paths, direct supply shorts, and fixed versus programmable supply.
- Workshop available independently of lesson progression.

## Simulation scope

This is a **guided educational behavior model**, not an ESP32 CPU emulator or general analog solver. It supports one red LED, one 220-ohm resistor, one four-leg push button (GPIO 22, internal pull-up modeled as a level, floating input as random readings), GPIO 23, 3V3, GND, and explicit wire connectivity. Contact bounce is a seeded 1 ms sample model; the delay() vs millis() activity models button reads at loop boundaries. Breadboard a–e and f–j groups are modeled separately; decorative power-rail lines are not interactive. A healthy red LED is approximated as a 2 V drop; calculated on-current is about 5.9 mA. Timing is wall-clock driven and can be throttled in background tabs. Exported Arduino code is real source code, but the site does not compile or execute arbitrary C++.

Full firmware execution is a separate milestone that must pass an actual integration proof before it is advertised. No AI API is required for lessons or feedback.

## Data and access

Progress lives in localStorage under `pin-by-pin-progress-v1`. There is no user database, analytics, or authentication. Export a progress file before changing devices or clearing browser storage. Google Fonts is optional; system font fallbacks work if it is blocked. Hosting access is independent of app behavior: initial Sites deployment and GitHub repo are private development previews.

## Source and content

Curriculum reference: `esp32-from-zero` commit `70764db1e1ba76c6169427f67a60b3bd61fdedb5`, reviewed 2026-10-19. Learning order and electronics topics follow that project; lesson copy and visual assets here were written for the interactive workshop. See `docs/CURRICULUM.md`, `docs/ROADMAP.md`, and `docs/HANDOFF.md`.
