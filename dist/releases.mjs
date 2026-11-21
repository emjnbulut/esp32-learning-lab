// Which units are public. Add a unit number here on the day its video is published.
// Units that have content but are not listed show as "waiting for the video" and stay closed.
export const PUBLIC_RELEASED=[1,2,3,4,5,6,7,8,9];
// Every unit with content (units 10-18 follow the draft curriculum v7 and wait for their videos).
export const ALL_UNITS=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18];
// Tests (and only tests) can open everything: node tests set RELEASE_ALL=1 and tools/serve.mjs
// serves an all-open copy of this file when started with RELEASE_ALL=1. Browsers have no `process`.
const testing=typeof process!=='undefined'&&process.env?.RELEASE_ALL==='1';
export const RELEASED_UNITS=testing?ALL_UNITS:PUBLIC_RELEASED;
