# Pin by Pin Lab

Free, hands-on ESP32 learning in the browser, following [ESP32 From Zero](https://github.com/emjnbulut/esp32-from-zero).
Learners write real Arduino code, wire a circuit on a breadboard and press Run — like Wokwi, but built around the
course: every unit is a series of projects from the episodes, with goals that are checked live while the circuit runs.
English by default, Turkish with the EN/TR switch.

## Run

Requires Node.js 20+. The site itself has no dependencies or build step; Playwright is a dev dependency used only by the browser tests.

```sh
npm run dev     # local preview on http://127.0.0.1:4177
npm run check   # syntax + unit tests (interpreter, circuit solver, missions, model, translations)
npm install     # once, for browser tests
npm run e2e     # Playwright regression suite (Chromium)
```

`dist/` is the complete static website and works under a hosting subdirectory.

## What is inside (1.4)

- **Simulator** (`dist/sim/`): an Arduino C/C++ subset interpreter with compiler-style errors and virtual time
  (`arduino.mjs`); parts, nets and a DC solver with diodes (`circuit.mjs`); the runtime that connects sketch and
  circuit — pin modes, PWM/`analogWrite`, `tone`, contact bounce, potentiometer, Serial, warnings for missing
  resistors and short circuits (`runtime.mjs`); SVG part drawings (`parts-view.mjs`).
- **Lab** (`dist/lab.mjs`, `lab.css`): code editor, drag-and-drop circuit editor (ESP32 DevKit V1, breadboard, LED,
  resistor, push button, potentiometer, RGB LED, buzzer, LDR, DHT11, OLED, PIR and relay; drag wires from pin to pin, rotate with R, delete with Del),
  Run/Stop/Restart, Serial Monitor with baud check and buffered input, interactive buttons and knobs, sound.
- **Missions** (`dist/missions.mjs`, `dist/missions-sensors.mjs`): 44 projects across 11 internally prepared units, with starter code/circuits, steps, hints, solutions and live checks. Public units are 1 through 5. Every solution and starter runs in `tests/missions.test.mjs`.
- **Sensor curriculum** (`dist/sensor-curriculum.mjs`, `dist/sensors-i18n.mjs`): 19 sensor/IoT projects and six five-question EN/TR checkpoints for units 6–11.
- **Inspection**: multimeter, live global variables, simulation speed and a local HTML preview for simulated HTTP routes.
- **Quizzes and unit checkpoints** stay as secondary steps; a passed checkpoint lets experienced learners skip ahead.
- **Workshop**: free projects saved in the browser, examples from the missions, JSON export/import, `.ino` download.

## Simulation scope

The interpreter supports the Arduino subset used by the course: types (int, long, unsigned long, byte, bool, char,
float, String), arrays, functions, control flow, `#define`, `Serial` (output plus buffered byte, text and number reads), digital and analog I/O,
`millis`/`delay`, `map`/`constrain`, `tone`. It is not a full C++ compiler: pointers, structs, general classes and
most other libraries are reported as unsupported. GPIO edge interrupts and simplified DHT, SSD1306, WiFi and WebServer APIs are modeled. The circuit solver is DC with piecewise-linear diodes (LED forward voltages,
~10 Ω GPIO output resistance, 45 kΩ pull-ups); PWM brightness is averaged by duty cycle.

## Releasing units

Only the units listed in `dist/releases.mjs` (`PUBLIC_RELEASED`) are open on the public site; the other units show as "waiting for the video" and cannot be opened, not even by URL. Add a unit number to the list on the day its video is published. Tests open everything with `RELEASE_ALL=1` (`npm run check` and `npm run e2e` do this; `tests/release.test.mjs` checks the public list).

## Build circuits without dragging

In the Circuit panel, open **Connect pins**, choose a component/pin on each side and press **Connect selected pins**. Native controls support touch and keyboard; Undo/Redo still apply. While running, **Circuit warnings** opens the warning list; **Show in circuit** highlights the affected wires/pins. The first circuit activity in unit 2 includes an optional five-step guide with undoable part placement and live simulator checks.

## Back up your lab

Open **My notebook → Download full backup** to save progress, lesson code/circuits and workshop projects together. On another browser use **Restore a backup**. Restore merges progress, keeps existing lesson drafts and adds different workshop projects without overwriting them. Repeating the same restore does not duplicate unchanged projects. Backups stay on your device; nothing is uploaded. Imports are validated before saving (maximum 10 MB). Notebook-only and single-project exports still work.

See [the improvement review](docs/IMPROVEMENTS.md) for prioritized next steps.

If browser storage fills up or becomes unavailable, the lab shows **Not saved** and keeps edits in the current tab through project/language/navigation changes. Use **Retry saving**, **Download a copy**, or a full backup before closing or reloading. Pending drafts are not durable until saved or downloaded.

## Data and access

Progress lives in localStorage under `pin-by-pin-progress-v1`, mission work under `pin-by-pin-work-v1`, workshop
projects under `pin-by-pin-projects-v1`, language under `pin-by-pin-lang`. There is no user database, analytics or
authentication. Published with GitHub Pages (see below).

See `docs/HANDOFF.md`, `docs/ROADMAP.md`, `docs/CURRICULUM.md` and `docs/REBUILD.md`.

## License

Personal learning remains free. Arduino/ESP32 teaching snippets are **MIT**, including use in
your own commercial projects. New original platform software uses the **PolyForm
Noncommercial License 1.0.0**; paid, ad-supported or other commercial reuse requires
separate written permission. New original course text/artwork is **CC BY-NC-SA 4.0**.

Earlier MIT platform rights, third-party licenses and learners' own work remain valid.
New restrictions cover new copyrightable contributions, not already-released old code.
See [LICENSING.md](LICENSING.md), [LICENSE](LICENSE), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md),
and the public [license page](dist/licensing.html).

## Serial input and a real board

In Workshop, choose **Serial input: echo** from Examples and press Run. In Serial Monitor, type a message and press Enter or Send. Choose none, LF, CR or CRLF to match the sketch. Text is UTF-8; byte reads return individual bytes. Stream reads wait in simulated time; setTimeout defaults to 1000 ms. Input requires Serial.begin(), is bounded to 4096 bytes, and is cleared on restart. This monitor is USB Serial, not Serial2.

Use **Use a real ESP32** above the code editor for current pin and component lists, connections including breadboard contacts, .ino download/upload steps and simulator limits. The bilingual guide links official Espressif documentation. Lesson episode links have been removed because the videos have not been recorded.

## Publishing

A push to main triggers Pages validation. The publication workflow calls the unit and Playwright jobs in check.yml and only runs deploy after both succeed. PRs and other branch pushes run the same checks separately.

## Sensor examples and limits

For internal QA, run the preview with RELEASE_ALL=1; this test-only setting exposes prepared units 6–11. Public builds keep the list in releases.mjs at [1,2,3,4,5]. Public Workshop retains the component palette but only lists released lesson examples.

The new models are educational shims, not bundled Arduino libraries or firmware execution. They model one DHT object named dht, one OLED named display (SDA 21, SCL 22), and one WebServer named server. Wi-Fi is a deterministic local simulation; HTTP requests remain inside the lab and do not open a network server. DHT values are controlled by sliders. PIR pulses are controlled manually. Relay contacts illustrate state and do not simulate an external switched load. Multimeter resistance is the direct equivalent resistance between the selected nets, rather than a general instrument model.

The real-board guide lists the external libraries needed by the current sketch, with links to the official Adafruit repositories. Unit tests exercise disconnected sensors, buffered OLED updates, short interrupts during delay, interrupt masking/detach, relay startup glitches, measurements and HTTP-controlled hardware.
