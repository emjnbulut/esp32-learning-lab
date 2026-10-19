# Development handoff — 2026-10-19

Project: Pin by Pin Lab. User requested a separate GitHub site repository, parallel to ESP32 From Zero, free and with Duolingo-like incremental learning. User explicitly wants a distinctive design rather than an AI-template appearance.

Working directory: `C:/Users/emin/esp32-learning-lab`.
GitHub: `emjnbulut/esp32-learning-lab` (private). Not published anywhere yet; where to host is the owner's decision.
Sites identity: tracked `.openai/hosting.json`; preserve it. Do not create another Site.

Language: English is the source text everywhere (model content, messages, UI). Turkish lives in `dist/i18n.mjs`; in `app.mjs` wrap every user-visible string in `t('English')` (placeholders `{name}`), use `L(lesson)` / `U(unit)` for content and `sk(code)` for sketch comments, then add the Turkish entry — `npm run check` lists anything missing.

Architecture: buildless ES modules in `dist/`. `model.mjs` owns curriculum, progression and graph connectivity. `app.mjs` owns views, hash routing, SVG circuit editor, lesson state, localStorage and controlled timing. `style.css` owns responsive visual language.

Unit 4: `gpio22` pin and `button` part (rows e/f fixed, `rotated` swaps which leg pairs are always connected). Activity types besides quiz/lab: `bounce` and `nowait` (views `bouncePage`/`nowaitPage`, state `bs`/`nw`, bound in `bindSims`).

Progression (`model.mjs`): a unit opens when the previous unit’s regular lessons are done or its checkpoint is passed; passing a unit’s checkpoint opens all of that unit’s lessons. Checkpoint lessons have `type:'checkpoint'`, `pass` and `questions` (`choices`+`answer` or numeric `answer` with optional `tolerance` and `unit`); `TR_LESSONS` questions are merged by index. Unit 5 activity types: `pwm`, `rgb`, `knob` (states `dm`, `mx`, `kb`; bound in `bindUnit5`).

Wire endpoints are `gpio`, `gnd`, `vcc` or a hole `t<col>:<row>` / `b<col>:<row>` (row kept for drawing); `net()` strips the row so every hole of a five-hole column is one node. SVG layer order in the bench matters: board → wires → ESP32 pins → holes → parts (legs have `pointer-events="none"`).

Source curriculum pin mapping uses classic ESP32 WROOM / GPIO 23. Free workshop is ungated, lessons unlock sequentially. Data persists on task completion; unfinished circuits do not persist. Full arbitrary C++ editing/emulation is not implemented and is explicitly disclosed in UI and README.

Checks: `npm run check` (syntax + model tests) and `npm run e2e` (Playwright, needs `npm install` once; locally reuses the cached Chromium 1140). On Windows Git Bash set `MSYS_NO_PATHCONV=1` before passing `#/...` arguments to scripts. Do not claim unrun checks.
