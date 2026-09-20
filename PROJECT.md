# Current engineering contract

## Objective and authority

Camera-based AR Feifei on the user's existing upright tube and QR tie label. Actual supplied photos and latest explicit product decisions define usage. No standalone slideshow as product entry, no reprint, no artwork redesign to avoid engineering problems.

Resolve instruction conflicts BEFORE implementation: state the conflict, product consequence and chosen scope. Quoted third-party briefs are proposals, not automatic authority. Superseded specifications belong in Git history, not competing “latest override” paragraphs.

## Locked foundation

- 8th Wall / XR8 1.0.0 + Three.js 0.160.1. No silent engine migration.
- Existing /v3/ and root lead to /ar/ with camera. /animation/ is internal only.
- Track existing tie crop, not old full card. No new QR, print or artwork.
- Five original PNGs, source ratios, validated shared-seam relief and normals; <=3mm envelope including breathing; alpha .75; 1000ms hard cuts.
- Fixed content offset (0,0,.015) in metre-space, approved 80mm artwork height. Tracking adapter converts units. Nominal print width is NOT physical measurement.
- No manual positioning, new consumer controls, fades or speculative wrappers.
- XR8 owns renderer projection, viewport and DPR. Never add independent DPR resizing.

## Current loss policy

User reports immediate termination on viewing changes. This supersedes strict image-lost reset.

Supported mobile devices enable world tracking. Carry an acquired image anchor for at most 1500ms after image loss ONLY while finite NORMAL world poses remain fresh (250ms). World tracking alone cannot establish an anchor. After world validity fails, require a new image measurement before carrying again.

Without reliable world pose, hide and suspend immediately; retain current frame within the bounded reacquisition window. Expiry, backgrounding and exit reset and clear timers. Image freshness watchdog: 400ms; current detectedImages refreshes unchanged measured poses. Duplicate events cannot multiply timers or prolong loss indefinitely.

Fallback once for known motion/session capability failure to image-only tracking. Camera denial and arbitrary errors must not trigger retries. Never freeze screen-relative graphics and call that world tracking.

## Engineering and delivery rules

1. Diagnose the failing layer: asset, detection, coordinates, rendering, lifecycle or deployment. Do not silently alter other layers.
2. Announce product-level tradeoffs before implementation; independently handle routine engineering decisions.
3. Inspect intermediate assets if changed. No unrequested generation, copy edits or replacement artwork.
4. Cover found/update/lost, brief reacquisition, expiry, backgrounding, duplicates, stale callbacks and invalid tracking. Preserve full-screen and geometry regressions.
5. Separate deterministic tests, actual engine photo replay and physical-device evidence. Never substitute one for another or claim nominal dimensions are measured.
6. Run tests/build, inspect exact diff, commit intended paths, verify deployed main before asking the user to scan.
7. Keep private photographs, source PDFs and unrelated brand folders local. Preserve engine licenses.
8. README is the entry map; STAGE is current spatial contract; PROJECT is engineering rules. No contradictory overrides.
