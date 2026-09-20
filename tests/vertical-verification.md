# Vertical tie-label verification — 2026-09-19

## Superseding animation-first iteration

Removed label-driven fit/scale and the label release gate from the animation build. Independent `/animation/` uses the exact `vertical-stage.js`, shared-seam relief and `vertical-playback.js` used by AR. Renderer accepts no target parameter and resolves assets relative to its own module, not the host page. Role geometry remains 80mm high with its original ratio and <=3mm envelope. Pending physical-target checks below apply ONLY to later camera integration, not animation delivery.

This iteration: 57 Node tests pass. Browser at `http://localhost:8122/animation/` loaded and auto-played original assets without label/camera access; console errors none. Inspected frontal playback and paused 46-degree 力士 rendering, then restored frontal autoplay. These are animation-viewer checks, not physical tracking acceptance. No deployment this iteration.

- Core imports MindAR 1.2.5 + Three 0.160.1, official pinned distribution bytes verified by SHA-256; no runtime CDN.
- Original PNG dimensions scanned: 1252×1436, 1405×1866, 1270×1825, 1297×1566, 1222×1560. SHA-256 matches approved sources.
- 56 Node tests pass, including four new vertical playback/ratio tests. Historical horizontal tests are retained regression evidence, NOT new-stage acceptance.
- Local actual WebGL render of all five continuous surfaces: zero shader errors. Each material alpha=0.75; XY scales equal, frontZ=3mm, depth scale=1. Original shared-seam field retained.
- Test fixture label is synthetic 50×75mm, not the user's measured label. No physical target detection or 30–50cm tracking claim.
- New `.mind` has NOT been compiled: exact flat label source/crop and physical width are missing. Release gate must fail until supplied and verified. Nothing pushed/deployed this turn.

Primary API basis: https://hiukim.github.io/mind-ar-js-doc/more-examples/threejs-image/ and the 1.2.5 Three wrapper. Its anchor is centre-origin and width-normalized; application millimetres divide by target width. `missTolerance:0` removes engine miss grace; `onTargetLost` clears the application timer immediately.
