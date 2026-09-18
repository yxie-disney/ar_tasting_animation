# Vertical card 01: physical composition and calibration gate

This decision supersedes V2's flat, QR-side marker layout. V2 remains available only for comparison. Objective: a natural full-tube view with room for garnish, not a close-up marker demonstration.

## Current milestone

Complete artwork candidate -> deterministic print geometry -> occluded-image calibration -> real-phone validation. The new `/v3/` route is explicitly a calibration page, not final garnish. It never plays the previous rotating ingredient scene and never claims tube detection. `/v3/?preview=1` is a dimensioned 3D schematic, not a photograph or tracking proof.

## Physical contract

- A4 PDF page 1: card 180 × 270 mm at x=15 mm, y=13.5 mm. Print at actual size (100%), not fit-to-page. The 50 mm ruler is outside the trim.
- Separate generated raster illustration is embedded unchanged in the SVG. Vector QR and engineering ticks are separate layers. This is not a fully editable vector illustration.
- Tube reserve: 35 × 220 mm, centered horizontally and flush to bottom; exact corner ticks overlay the approximate generated blank strip.
- Tube: height 215 mm, diameter 29 mm, resting against a flat clipboard/backboard. The paper bottom does NOT need to align with the tube base. A top clipboard clip is expected, not forbidden.
- Card-local coordinates: origin at card center, X right, Y up, Z towards viewer. Tube axis lies at Z=14.5 mm because its back touches the board. Base/cap X/Y come from two manual screen taps after image acquisition, not a hardcoded paper baseline. Height remains 215 mm; the midpoint and in-plane axis are fitted. Reject apparent lengths outside ±10% as gross misclick/scale/placement errors; this is not a precision guarantee.
- Scope of this registration: tube axis approximately parallel to the board, both fixed relative to each other. Modest assembly tilt is fine when tube and board tilt together; a tube leaning away from the board or moving independently is NOT solved by two planar taps. It would need additional depth/pose evidence. Do not claim arbitrary 3D tube tracking.
- A4 PDF page 2 is now an instruction sheet, not a required tabletop jig. Print only page 1 if the new illustrated card is already the desired test material. The old V2 tasting card is not this runtime's target.
- QR is 29 mm including four-module quiet zone, positioned in the illustration's existing lower-left blank. It opens the dedicated vertical page. The tracking target is the complete card, not just the QR.
- Required initial test view: approximately 500 mm from the tube, front and ±25° yaw, whole tube in frame. Synthetic fixture adds a 110 × 35 mm top clip, central tube occlusion and a base 25 mm below paper. These dimensions are a test case, not measurements inferred from the user's photo.

## Runtime ownership

Image target establishes/corrects card pose and scale; content positions are card-local millimeters. Manual tube registration is only allowed with a fresh image pose. No tube guide appears before registration. Mobile SLAM stays enabled and may hold the last anchor when the image is absent and the engine reports fresh NORMAL world tracking. LIMITED/stale world tracking without a fresh image hides the calibration geometry. No untracked frozen screen overlay. Moving the card relative to the tube invalidates registration; reset/re-register. Backgrounding the page also resets it. This is a bounded calibration aid, not the intended finished consumer UX.

Desktop synthetic camera tests explicitly use localhost-only `imageOnly=1`; the 8th Wall engine does not support desktop SLAM. These tests cover image acquisition and geometry, NOT mobile world tracking or sensor permissions. Public runtime does not expose that override. iOS permission requests originate directly in the start click.

Camera frames are processed for AR by the engine; this application does not upload or store them. User-exported diagnostics contain timing, target pose, state and nominal geometry, not camera frames.

## Acceptance gate before new animation

1. Correct 50 mm ruler measurement on actual print; no mandatory bottom placement circle.
2. Whole 215 mm tube and both outer illustration areas visible at comfortable framing.
3. Both lower and upper green rings align; base-only alignment is not sufficient.
4. Slow left/right movement does not substantially displace rings from physical tube.
5. Temporarily lose/reacquire the image; observe real mobile spatial tracking, recovery and drift.

Automatic tube evidence and final narrative garnish assets remain separate unfinished work. Do not describe the green geometry guides as completed animation.

## Evidence for the clipboard revision

Seven unit tests cover state retention and registration (offset base, in-plane lean, invalid taps). Four static synthetic-camera cases exercise the actual image engine at a modeled 500 mm distance: front, ±25°, and QR covered; every case includes the tube and top clip. All acquired the image. Three cases briefly lost/reacquired immediately after initial lock. Registration uses scripted perfect endpoint clicks, so its reprojection error is a software round-trip check, NOT evidence of human tap precision or real-world alignment. No moving-camera sequence, phone SLAM, real clipboard, grayscale home print, reflections or physical tilt has been validated here. These remain real-scene acceptance items, not success claims.

## Primary technical references

- https://8thwall.org/docs/api/engine/xrcontroller/configure
- https://8thwall.org/docs/api/engine/xrcontroller/pipelinemodule
- https://8thwall.org/docs/api/engine/xrconfig/device
- https://forum.8thwall.com/t/is-surface-world-tracking-supported-for-desktop-with-webcam/8354
