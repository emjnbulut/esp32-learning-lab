# ESP32 site improvement review — 2026-10-20

## Implemented in this revision

- Full local backup in My notebook / Defterim: progress, lesson sketches and wiring, and all workshop projects.
- Restore merges progress, keeps existing lesson drafts, preserves different workshop projects even when their IDs collide, and avoids duplicates when the same backup is restored again.
- Strict project/backup validation before storing: version, component types, unique IDs, pin endpoints, coordinates, rotation, attributes and wire colors/points. File limit: 10 MB; per sketch: 100,000 characters; per circuit: 200 parts and 1,000 wires; per backup: 200 projects.
- Storage write rollback frees space before restoring original values if a write fails.
- Workshop export, rename, new project, examples, imports and project switching read the latest saved work instead of an old captured project list.
- Mission completion resets when code/circuit changes, a run starts/fails/stops, the solution is loaded or the activity is restarted. Old simulator results cannot complete edited work.
- Matching English/Turkish UI; mobile backup actions stack vertically.
- Immediate saved/not-saved state, memory retention of failed writes across in-app navigation, retry, recovery project downloads and a close/reload guard. Full backups include pending drafts.

## Recommended next work

These priorities are based on the current repository and UI, without adding external services.

| Priority | Improvement | Why it helps | Reviewable acceptance criterion |
|---|---|---|---|
| 1 | First-circuit onboarding and keyboard wiring | Circuit placement/wiring currently relies on dragging or pin clicks. A beginner needs help finding the correct endpoints. | A new learner can add an LED/resistor and connect two labeled pins using keyboard only, and do the same on a phone. |
| 1 | Highlight the circuit behind an error | Simulator warnings exist, but a message alone makes the offending connection hard to locate. | Clicking a short-circuit or missing-resistor warning highlights the related wire/pins; the highlight clears when fixed. |
| 2 | Connect each released lesson to its exact video | The lesson source currently points to the written GitHub lesson. | Each published unit has a direct video link and a written lesson link; unpublished units keep their release gate. Confirm publication before changing release lists. |
| 2 | Serial Monitor input | The monitor currently displays output and baud selection but has no send field. | Add a bilingual input/send flow and interpreter support with tests for buffer reads and line endings. |
| 2 | Expand components with actual behavior | LDR, DHT11 and OLED are planned in the curriculum but absent from the current part palette. | Add one component together with its simulated behavior, introductory activity and headless/browser tests; avoid decorative parts without behavior. |
| 2 | Real-hardware handoff | .ino download exists, but learners need a clear bridge to their physical board. | A released activity offers a pin list, wiring reference, IDE upload steps and an explanation of the simulator's supported Arduino subset. |
| 3 | Better discoverability and link previews | The entry HTML has basic metadata; lessons are client-side hash routes. | Provide useful public lesson descriptions before JavaScript runs and correct sharing metadata for the confirmed public URL. |
| 3 | Offline learning | The site is static but currently has no offline cache. | Previously opened released activities work offline; updates do not mix simulator versions or accidentally unlock unpublished units. |
| 3 | Optional synchronization/sharing | Backups now move work manually; cross-device sync remains absent. | Keep learning account-free; add optional sync/share only with clear privacy, cost and data deletion behavior. |

## Validation and boundaries

Run `npm run check` and `npm run e2e`. The new regression cases cover stale workshop snapshots, mission completion invalidation, portable backups, malformed files, repeated restore, ID collisions and storage quota rollback.

No release dates, unit release gates, source videos or licensing rules were changed. Publication uses the existing main-branch GitHub Pages workflow, as requested by the owner on 2026-10-20.
