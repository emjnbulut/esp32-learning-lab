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

## What is inside (1.0)

- **Simulator** (`dist/sim/`): an Arduino C/C++ subset interpreter with compiler-style errors and virtual time
  (`arduino.mjs`); parts, nets and a DC solver with diodes (`circuit.mjs`); the runtime that connects sketch and
  circuit — pin modes, PWM/`analogWrite`, `tone`, contact bounce, potentiometer, Serial, warnings for missing
  resistors and short circuits (`runtime.mjs`); SVG part drawings (`parts-view.mjs`).
- **Lab** (`dist/lab.mjs`, `lab.css`): code editor, drag-and-drop circuit editor (ESP32 DevKit V1, breadboard, LED,
  resistor, push button, potentiometer, RGB LED, buzzer; drag wires from pin to pin, rotate with R, delete with Del),
  Run/Stop/Restart, Serial Monitor with baud check, interactive buttons and knobs, sound.
- **Missions** (`dist/missions.mjs`): 15 projects in units 1–5 with starter code and circuit, steps, hints, a solution and
  live goal checks. Every solution is run headless in `tests/missions.test.mjs`.
- **Quizzes and unit checkpoints** stay as secondary steps; a passed checkpoint lets experienced learners skip ahead.
- **Workshop**: free projects saved in the browser, examples from the missions, JSON export/import, `.ino` download.

## Simulation scope

The interpreter supports the Arduino subset used by the course: types (int, long, unsigned long, byte, bool, char,
float, String), arrays, functions, control flow, `#define`, `Serial` (print/println/printf), digital and analog I/O,
`millis`/`delay`, `map`/`constrain`, `tone`. It is not a full C++ compiler: pointers, structs, classes, libraries and
interrupts are reported as unsupported. The circuit solver is DC with piecewise-linear diodes (LED forward voltages,
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
