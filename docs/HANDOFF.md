# Development handoff - 2026-11-21 (1.5)

## Site follows the published episodes; units 1-9 released - 2026-11-21

Creator asked to update the website. Units now map one to one to ESP32 From Zero episodes (unit N = episode N) and units 1-9 are public (`PUBLIC_RELEASED=[1..9]`; `tools/serve.mjs` now imports releases.mjs instead of a copied list).

- Before: 11 units on the old curriculum (5 PWM+RGB+knob, 6 light and sound, 7 DHT/OLED, 8 PIR/interrupts, 9 relay/Wi-Fi, 10 web server, 11 smart room); public [1-5].
- After: 1-4 unchanged; 5 PWM, 6 RGB, 7 analog input, 8 map() + level bar, 9 smart crossing (all public, built from `esp32-from-zero/lessons/05..09`); 10-18 follow `CURRICULUM_v7_DRAFT.md` (10 reflex game OLED+buzzer, 11 PIR, 12 phone, 13 DHT11, 14 melody, 15 LDR, 16 interrupts, 17 relay, 18 smart room) and stay closed. All 19 sensor missions were moved, none deleted.
- New missions (`dist/missions-episodes.mjs`, TR in `dist/episodes-i18n.mjs`): breathe, modes, knob, knobled, zones, knobblink, levelbar, safelock, crossing, presstime, slowwalker, beep, reflex. New quizzes: pins, debug, mapq, stateq. New/rewritten checkpoints 5-9; checkpoints 10-18 reuse the 30 old sensor questions plus 15 new ones. `dimmer` and `speed` moved to unit 8 (titles adjusted).
- "Watch episode N" links (youtu.be) on every published unit card and lesson; `units[].videos` in model.mjs. Ep5 = VaqdZeV5tRQ, Ep6 = j0tZ9P7YrU8 (from esp32-from-zero HANDOFF.md). Unit 4 also links Recap 1.
- Simulator: `Preferences prefs;` (begin/getULong/putULong/getInt/putInt/...; values survive Restart through the lab's per-lesson `nvs`); unchanged digitalWrite/analogWrite no longer re-solve the circuit (sketches that rewrite outputs every loop were slow); fixed a stale button-contact signature after bounce that this exposed. Toasts no longer block clicks (they covered the phone Controls bar).
- Tests: missions test passes `script.nvs`; sim tests cover Preferences, the bounce regression and run the real episode 5-9 sketches against the mission goals (skipped when the course repo is absent, e.g. CI); e2e covers episode links, units 7-9 controls, the phone crossing and the new public counts (58 public tasks, 88 total).
- Open items: ROADMAP 1.5 (v7 is a draft, old pins in moved sensor missions, touch/IR/softAP not simulated).

# Development handoff - 2026-10-25 (1.4)

## Units 1-5 released - 2026-10-25

Owner requested unlocking the website through Unit 5. `PUBLIC_RELEASED` in `dist/releases.mjs` (and `tools/serve.mjs`) is now `[1,2,3,4,5]`, and Unit 5's `source` in `dist/model.mjs` is set to `'05-pwm-and-rgb'`. Units 6-11 remain gated waiting for their videos.

## Sensor work completed - 2026-10-21 (1.4)

The sensor implementation in commit 7e4b172 was not connected to the lesson registry. This revision connects all 19 missions from missions-sensors.mjs, adds six bilingual checkpoints, and marks units 6-11 internally available. There are now 44 missions and 64 activities total. PUBLIC_RELEASED remains [1,2]; do not unlock future units or add video links without owner direction. GitHub Pages remains the publication target; preserve .openai/hosting.json.

- sensor-curriculum.mjs owns future lesson ordering and bilingual checkpoint rows; sensors-i18n.mjs owns Turkish mission text and sketch comments.
- Fixed split OLED text checks, premature HTTP test actions, and relay goals falsely completed by setup transients.
- GPIO interrupts now run during delay waits. interrupts/noInterrupts and detachInterrupt affect delivery; an unwired pin no longer triggers the obsolete unsupported-API error.
- Wire colors float over the canvas. Toggling the wire tool no longer resizes the canvas and asynchronously refits it under the pointer.
- The real-board guide receives the current code and lists DHT/OLED libraries and dependencies when included.
- tests/sensors.test.mjs covers wiring, power, controls, OLED buffering, interrupts, relay false positives, multimeter readings and local HTTP behavior. Browser coverage includes all future routes in EN/TR and actual sensor/HTTP interactions.
- Simulator limits: single canonical dht/display/server objects; OLED pins 21/22; Wi-Fi/HTTP remain local models. README documents these boundaries. No firmware execution, database, account sync or offline cache was added.
- Verification passed: npm run check (167 tests), npm run e2e (42 browser tests), git diff --check. Desktop and phone screenshots were visually reviewed. Browser screenshots: artifacts/sensors-desktop.png and artifacts/sensors-phone.png (ignored).

Earlier handoff entries below record previous versions.


## Serial input and hardware handoff - 2026-10-20 (1.3)

- Owner says the videos have not been recorded. Removed the per-lesson episode/source link entirely; do not add video links until the owner provides published videos. Unit gates remain [1,2].
- Main-branch Pages publication calls check.yml as a reusable workflow and deploy needs validate. Both unit and browser jobs must succeed before deployment. PRs and other branch pushes retain checks without duplicating main-branch jobs.
- EN/TR Serial input supports Enter and none/LF/CR/CRLF. The 4096-byte UTF-8 input queue rejects an overfull message atomically, preserves unsent text and resets on restart/end. Sending requires a running sketch that has called Serial.begin().
- Stream reads yield to virtual time. available/read/peek, readString/readStringUntil, parseInt/parseFloat, setTimeout and end use buffered data. Serial2 reports that it is not the USB monitor instead of silently aliasing its input.
- A Serial input: echo example opens as a separate workshop project.
- Use a real ESP32 opens a bilingual native dialog with current connected board pins, component values, shared-net/breadboard references, .ino/IDE/upload steps, simulator limits and official Espressif references. It describes the user's drawing, never repairs or certifies it.
- Validation: npm run check (119 tests), npm run e2e (36 browser tests). Phone screenshots are in ignored artifacts/.


## Progress and Turkish diagnostics - 2026-10-20 (1.2.1)

- model.releasedProgress() counts only released lessons in the header, home actions, progress bar, notebook and completion screen. Imported future-unit IDs remain in storage and exports. Public release gates remain [1,2].
- dist/error-text.mjs translates compiler/runtime diagnostics at the UI boundary, including names, operators, argument counts and array bounds. Original English compiler messages and source locations stay unchanged. Unknown errors offer escaped technical details.
- Regression coverage: future-only/all-unit notebook imports on the public site, preserved exports, Turkish compile/runtime errors, line highlighting, phone layout, technical-detail escaping and recovery after correcting code.
- Validation: npm run check (109 tests) and npm run e2e (33 browser tests) passed. No dependency or storage-format changes.


## Accessible circuit building — 2026-10-20 (1.2)

- `dist/circuit-help.mjs`: pure first-circuit placement/checks and warning target resolution. Short-circuit highlighting follows a shortest physical wire route while treating breadboard strips as implicit connections; LED warnings identify the LED and its attached nets.
- `dist/lab-help.mjs`: native component/pin selectors, duplicate/self-link feedback, keyboard form submission, previews, warning list/badge, and circuit highlights. Editing a sketch/circuit invalidates old diagnostics; restart clears old highlights.
- Unit 2's `circuit` activity has an optional five-step guide. The placement button changes only LED/resistor geometry (and a 220 ohm resistance), preserves code/wires and supports Undo. Connections are confirmed one by one through the pin form. Completion still depends on the existing real simulator goal checks.
- Small screens keep the existing Code / Circuit / Serial tabs. An expanded connector grows the lab to keep the circuit visible. The single browser-tab learning flow and public unit list `[1,2]` are unchanged.
- New tests: `tests/circuit-help.test.mjs` and six browser cases in `tests/e2e.test.mjs`, including phone wiring, guide completion/undo, short-circuit repair, LED warnings and laptop layout.
- No dependency changes or extra services. Teaching examples, release schedule and licenses are unchanged.


## Save recovery — 2026-10-20

- Failed writes are retained in `dist/draft-store.mjs` for the lifetime of the tab. Clean reads still use current browser storage; pending reads use independent snapshots of the newest draft.
- Labs show Saved / Not saved immediately. Failure exposes Retry saving and Download a copy, and the notebook full backup includes pending lesson/project edits.
- Pending writes survive hash routing, project switching and language changes. Retry flushes pending keys. A beforeunload guard warns when there are pending changes; downloaded files remain the recovery path before closing/reloading.
- A successful full backup restore clears the corresponding pending snapshots.
- Owner prefers the current single-tab unit flow after discussing phone usability; do not add automatic new browser tabs.
- New unit tests: `tests/draft-store.test.mjs`; browser regressions cover quota failure, route/project changes, retry, downloads and phone layout.

## Reliability and portable backups — 2026-10-20

- `dist/backup.mjs`: validates imported projects and full backups, merges progress/projects while preserving existing lesson drafts, and rolls storage writes back on failure. New full backups use `format: pin-by-pin-backup`, `version: 1`; old notebook and individual project formats remain supported.
- Full backup/restore actions are in My notebook / Defterim. No network transfer. Same-backup restore deduplicates project content; conflicting project IDs get new IDs.
- `bindWorkshop` now reads projects inside each handler so export, rename, switching or creating a project cannot overwrite newer edits.
- Mission goals are invalidated by edits and run lifecycle changes. `ms.runValid` prevents old simulator ticks from re-enabling completion after changes.
- New tests: `tests/backup.test.mjs` and four browser regressions in `tests/e2e.test.mjs`.
- Follow-up priorities and acceptance criteria: [IMPROVEMENTS.md](IMPROVEMENTS.md).
- Public unit list remains `[1,2]`. Owner requested publication on 2026-10-20 through the existing main-branch GitHub Pages workflow. Validation: 98 unit checks and 26 browser tests passed.



## Licensing update — 2026-10-19

Owner's policy: MIT teaching sketches; PolyForm Noncommercial License 1.0.0 (replaced the earlier custom Pin by Pin Lab license) for new original platform code; CC BY-NC-SA 4.0 for new course prose/art. Read ../LICENSING.md before changing notices. Earlier MIT grants through 23f45a3 remain valid, including commercial use. Third-party rights and learners' work remain separate. Public licensing.html is bilingual; dist/licenses/ copies must match LICENSES/. Footer links the page. sketch-export.mjs adds an MIT notice to .ino downloads for provided examples only. Unit releases and progression were not changed.


Project: Pin by Pin Lab, a free hands-on ESP32 course site parallel to ESP32 From Zero. The owner wants it to work
like Wokwi: practice first (real code, real wiring, Run), quizzes second. Distinctive design, not an AI template.

Working directory: `C:/Users/emin/esp32-learning-lab`. GitHub: `emjnbulut/esp32-learning-lab` (private).
Published with GitHub Pages from the main branch (.github/workflows/pages.yml). Preserve `.openai/hosting.json` (Sites id from the
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

- `releases.mjs` — which units are public (`PUBLIC_RELEASED`). `model.mjs` `canOpen`/`unitOpen` refuse closed units; `app.mjs` shows only released lessons. Units 3–5 exist but wait for their videos.

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
