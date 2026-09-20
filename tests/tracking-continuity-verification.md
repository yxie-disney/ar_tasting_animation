# Tracking continuity — 2026-09-20

## Failure and bounded correction

The deployed image-only pipeline treated every imagelost as terminal, hid content and reset playback. This is an application policy failure in addition to the target's finite detectability.

The current policy enables XR8 world tracking on compatible mobile devices. A previously acquired target can survive image loss for 1500ms only with fresh, finite NORMAL world poses. Image-only or invalid-world cases hide/pause immediately but retain the frame for short reacquisition. Expiry, backgrounding and exit reset. No target/artwork/geometry change, no frozen screen-space persistence.

## Deterministic checks

73 tests pass. New checks cover healthy-world bridging, invalid/LIMITED/stale world rejection, no resurrection from world-only data, stationary image measurements, duplicate loss deadlines, expiry, 1000 reacquisition cycles, stale queued timer callbacks and one bounded capability fallback. Existing source hash, full-screen ownership, aspect ratio, shared seams, normals and 3mm geometry tests still pass.

These world-pose tests inject deterministic data into the state machine; they are NOT actual mobile SLAM trials.

Build: pinned XR8 1.0.0 / Three.js 0.160.1 and five original PNGs prepared successfully.

## Actual engine replay

Same user-authorized upright tube photo; private localhost route only. Real XR8 detection, no synthetic found/lost events. Desktop uses image-only mode and reports LIMITED, correctly disabling world continuation.

- At 1280x720 and 420x900, canvas CSS and drawing buffer match the viewport; original relief appears over the photographed tube.
- Real tie-label acquisition and five-frame hard cuts continue with one playback interval and no reported runtime errors.
- Blank moving input produces real imagelost, hides anchor and stage, and clears playback. Continued blank input for >20 seconds shows no animation.
- A 500ms interruption causes actual loss/reacquisition, not a fabricated event. Frame retention is checked separately below; terminal loss starts a fresh session.
- Non-first-frame evidence: interruption at 102208ms while 角盔 was visible; after real reacquisition the retained frame was 角盔, not 力士. Observed totals found=4, updated=2871, lost=3; one playback interval, no errors. Earlier >20s blank loss reset the session and restoration started 力士.

The mock stream adds 2px translation to force fresh frames; blank input also changes a tiny corner patch. This is harness plumbing, not an instruction to move the user's phone. Debug controls are local only and excluded from deployment.

## Not established

Actual mobile world-tracking availability, permission behavior, angle tolerance, drift and relocalization under physical hand motion remain unverified here. Enabling the correct engine capability is not proof that the phone/browser supplies it. No claim of universal stable tracking, 30–50cm detection or measured millimetre calibration is made.

Product acceptance on the existing QR: modest hand-angle changes should not restart the five-frame sequence; a brief image loss should remain visible only with healthy world tracking. Extended loss must still stop. No new printing or material layout is required for this check.
