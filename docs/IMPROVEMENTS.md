# ESP32 site improvement review — 2026-10-20

## Implemented in this revision

- Completed the sensor expansion begun in 7e4b172: all five new part types have behavior, 19 integrated missions, EN/TR content, six checkpoints and headless/browser coverage.
- Fixed OLED mission checks, relay startup false positives, HTTP action timing, short GPIO interrupts during delay and wire-tool canvas movement.
- The hardware guide now includes external library installation for the current sensor sketch.


- Lesson episode/source links removed at the owner's request: videos have not been recorded. No replacement video URLs or release-list changes.
- Main-branch publication now depends on both unit and browser tests through a reusable validation workflow.
- USB Serial input with a bounded UTF-8 queue, all four line endings, timed byte/string/number reads and a ready-to-run echo example.
- A bilingual real-board guide with current GPIO/net references, component values, IDE/upload steps and the simulator's supported subset.

- Released-lesson progress counts consistently across the header, notebook, home page and completion screen; importing future-unit records preserves the backup without inflating visible progress.
- Turkish compiler/runtime explanations preserve names and source lines, with expandable technical details for unfamiliar errors; English diagnostics stay unchanged.

- Full local backup in My notebook / Defterim: progress, lesson sketches and wiring, and all workshop projects.
- Restore merges progress, keeps existing lesson drafts, preserves different workshop projects even when their IDs collide, and avoids duplicates when the same backup is restored again.
- Strict project/backup validation before storing: version, component types, unique IDs, pin endpoints, coordinates, rotation, attributes and wire colors/points. File limit: 10 MB; per sketch: 100,000 characters; per circuit: 200 parts and 1,000 wires; per backup: 200 projects.
- Storage write rollback frees space before restoring original values if a write fails.
- Workshop export, rename, new project, examples, imports and project switching read the latest saved work instead of an old captured project list.
- Mission completion resets when code/circuit changes, a run starts/fails/stops, the solution is loaded or the activity is restarted. Old simulator results cannot complete edited work.
- Matching English/Turkish UI; mobile backup actions stack vertically.
- Pin selection on phones and keyboards, with connection previews, undo/redo and feedback for self-links/duplicates.
- Actionable circuit warnings highlight actual wire routes and LED pins; edited circuits clear outdated diagnostics.
- A five-step first-circuit guide places components with Undo, walks through each connection, and checks real simulated current/mission goals.
- Immediate saved/not-saved state, memory retention of failed writes across in-app navigation, retry, recovery project downloads and a close/reload guard. Full backups include pending drafts.

## Recommended next work

These priorities are based on the current repository and UI, without adding external services.

| Priority | Improvement | Why it helps | Reviewable acceptance criterion |
|---|---|---|---|
| 3 | Better discoverability and link previews | The entry HTML has basic metadata; lessons are client-side hash routes. | Provide useful public lesson descriptions before JavaScript runs and correct sharing metadata for the confirmed public URL. |
| 3 | Offline learning | The site is static but currently has no offline cache. | Previously opened released activities work offline; updates do not mix simulator versions or accidentally unlock unpublished units. |
| 3 | Optional synchronization/sharing | Backups now move work manually; cross-device sync remains absent. | Keep learning account-free; add optional sync/share only with clear privacy, cost and data deletion behavior. |

## Validation and boundaries

Run `npm run check` and `npm run e2e`. The new regression cases cover stale workshop snapshots, mission completion invalidation, portable backups, malformed files, repeated restore, ID collisions and storage quota rollback.

No release dates, unit release gates, source videos or licensing rules were changed. Publication uses the existing main-branch GitHub Pages workflow, as requested by the owner on 2026-10-20.
