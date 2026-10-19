# Development handoff — 2026-10-19

Project: Pin by Pin Lab. User requested a separate GitHub site repository, parallel to ESP32 From Zero, free and with Duolingo-like incremental learning. User explicitly wants a distinctive design rather than an AI-template appearance.

Working directory: `C:/Users/emin/esp32-learning-lab`.
GitHub: `emjnbulut/esp32-learning-lab` (initially private).
Sites identity: tracked `.openai/hosting.json`; preserve it. Do not create another Site.

Architecture: buildless ES modules in `dist/`. `model.mjs` owns curriculum, progression and graph connectivity. `app.mjs` owns views, SVG circuit editor, lesson state, localStorage and controlled timing. `style.css` owns responsive visual language. Pure model tests run with Node's built-in runner; no dependencies.

Source curriculum pin mapping uses classic ESP32 WROOM / GPIO 23. Initial lab supports only one resistor and LED. Free workshop is ungated, lessons unlock sequentially. Data persists on task completion; unfinished circuits do not persist. Full arbitrary C++ editing/emulation is not implemented and is explicitly disclosed in UI and README.

Use `npm run check` after changes. Test browser flows: wrong/correct quiz, prerequisite locks, refresh progress, entire LED wiring task, incorrect topology, inverse LED, adjustable blink and 250ms challenge, repeat XP, export/import, mobile width. Do not claim unrun checks.
