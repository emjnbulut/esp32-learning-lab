# Development handoff — 2026-10-20 (1.2.1)

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
