# Development handoff — 2026-10-19 (1.0)

Project: Pin by Pin Lab, a free hands-on ESP32 course site parallel to ESP32 From Zero. The owner wants it to work
like Wokwi: practice first (real code, real wiring, Run), quizzes second. Distinctive design, not an AI template.

Working directory: `C:/Users/emin/esp32-learning-lab`. GitHub: `emjnbulut/esp32-learning-lab` (private).
Not published anywhere yet; where to host is the owner's decision. Preserve `.openai/hosting.json` (Sites id from the
first builder); do not create another Site.

## Architecture (buildless ES modules in `dist/`)

- `sim/arduino.mjs` — tokenizer, parser, resolve pass (compile errors with line/col), generator interpreter. The host
  (Simulator) owns `clock`/`deadline` in µs; statements cost `STMT_US`, `delay()` moves the clock and yields.
- `sim/circuit.mjs` — part geometry (10 units = 0.1"), `resolveDiagram` (`at:'bb:e10'` anchors), nets (wires,
  breadboard strips, pins resting on holes), `solve()` (nodal analysis, diodes iterated).
- `sim/runtime.mjs` — `Simulator`: host API for the interpreter, inputs (`press`, `setPot`, bounce), logs used by
  goal checks (`serialLog`, `ledLog`, `events`, `warnings` with English templates `tpl`+`vars`).
- `lab.mjs` — the Lab UI; `mount(root)`, `onChange`, `onTick(sim)`, `onRun`. `root.__lab` exposes the instance
  (`pinScreen`, `worldToScreen` are used by the browser tests).
- `missions.mjs` — mission content and checks; `checkGoals(m, sim)` keeps passed goals sticky per run (`sim.passed`,
  `sim.mem`). `script` (+`ticks`) drives the headless mission tests.
- `model.mjs` — lesson order (`type`: mission | quiz | checkpoint), progression, grading.
- `app.mjs` — views, routing (`#/lesson/<id>`, `#/workshop`, `#/notebook`), storage.
- `i18n.mjs` — Turkish: `TR` (English UI string → Turkish, also sketch comments and warning templates),
  `TR_LESSONS`, `TR_UNITS`, `TR_MISSIONS` (same shape as missions, arrays by index).

- `owner.mjs` + `tools/owner-key.mjs` — owner passphrase hash and sign-in flag; `app.mjs` `owner`/`review` decide `canOpen`.

## Rules

- English is the source text. Wrap UI strings in `t('…')`; `tests/i18n.test.mjs` fails on anything untranslated.
  Mission text changes need the matching `TR_MISSIONS` entry (same array lengths and backtick counts).
- A new mission needs: starter + solution (`D([...parts],[...wires])` with breadboard anchors), goals with checks,
  a `script` so its solution passes in `tests/missions.test.mjs`, and a lesson entry in `model.mjs`.
- Pins used by the course: LED 23, button 22, second LED 25, RGB 25/26/27, potentiometer 34 (unit 5 is written
  before episode 5 exists; align when it is recorded and set `source` on unit 5).
- Run `npm run check` and `npm run e2e` before pushing. Do not claim unrun checks.
- On Windows Git Bash use `MSYS_NO_PATHCONV=1` before passing `#/…` arguments to scripts; heredocs mangle
  backslashes, so write scripts with regexes to files instead.
