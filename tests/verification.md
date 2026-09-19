# Verification — existing printed card, automatic garnish

## Current: user-requested 66.7% size

- User found 44% too small. Width and height are now exactly 2/3 of the 216 × 477.4mm trial: nominally 144 × 318.3mm, 1.516× the immediately previous card. Original texture, fixed far-side plane, raised bottom, depth proxy and tracking logic are unchanged. Only release keys change outside the size configuration.
- The previous full-frame assertion no longer applies: with the same synthetic 70° portrait lens aimed at (20, −18, 80)mm, the new card top is outside view in five of six 40–50cm / 30–60° fixtures. Tests explicitly record this boundary and continue checking physical tube/near-artwork framing, no auto-fit, both artwork faces and camera-to-tube depth ordering. Do not describe enlargement as verified full-frame phone readability.
- This is a size-only user-directed adjustment; no new mobile tracking or readability claim is made.
- All 29 automated checks pass. Private browser WebGL inspection at the new dimensions shows complete, normally readable-direction front and back textures (35,069 colored pixels each; no GL error). The actual depth overlap check passes: camera-background color with the tube proxy, white card without it. This isolates rendering, not real-device tracking or text legibility.

## Previous: smaller far-side card, real-tube depth, and guarded world continuation

- User feedback rejected the large card and the obscured tube. Fixed size is now nominally 95 × 210mm (44% of the previous width/height), with original bytes/aspect/UVs unchanged. Far-side +X=55mm comes from the approved print/QR layout, not the acquisition camera azimuth. Bottom height is 35mm, above the 29mm tube.
- Added a depth-only 215 × Ø29mm cylinder at the known tube position, rendered before the virtual card. Camera video alone does not supply physical-object depth. A private WebGL overlap test deliberately lowers the test card to exercise the actual production occluder: the sampled pixel is background `[22,56,68,255]` with depth, versus white card `[255,255,255,255]` without it. Both artwork faces still render normally. The temporary lowering is test-only, not production placement.
- 29 automated tests pass: preserved image hash and UVs; fixed far-side geometry irrespective of initial camera; thousands of camera-to-tube rays; explicit portrait composition including the card, tube and near artwork at 40–50cm, 30/45/60° elevation and assumed 70° vertical FOV. This is a synthetic camera contract, not measured phone intrinsics. At 30cm the same synthetic portrait lens cannot contain the complete 215mm tube; no blanket 30–50cm full-frame claim is made. World-map recovery requires an image update after the invalidation, not a stale pre-loss pose still inside the freshness window.
- Actual-engine replay of the clean photograph displays the whole physical tube and retains positive occupancy for over 90 seconds. The photograph points low enough that the upper card is outside the view; this is NOT accepted as proof of full-card reading composition. The source photograph and print are unchanged and no AR screenshot is used as a tracker input.
- World continuation uses the existing binary's SLAM and per-frame `trackingStatus`. Only fresh NORMAL status plus a previously acquired image pose can carry the anchor beyond image loss. No image-only stale-pose hold is used. Tri-state occupancy distinguishes unknown visibility from observable absence; unknown cannot start content, but no longer revokes a confirmed scene during reading. Unit tests cover a simulated 60-second valid-world reading interval, empty rejection, true removal, world loss, stale status, and image-required re-seeding.
- Desktop cannot initialize a real SLAM session. Engine mobile-compatibility preflight therefore retains image-only behavior there. An explicit private injected unavailable-world-session test exercises the one-time automatic fallback path. This injection is NOT a test of real mobile SLAM.
- Mobile world tracking, permissions, actual portrait readability, movement and drift remain physically unverified. These limits must be carried into the handoff; do not call the user-reported disappearance fully resolved based on simulation.

## Previous: blank reverse face corrected; geometry and original asset unchanged

- The user's phone showed a large blank card. Inspection found artwork on BoxGeometry face 4 (+Z) but a solid off-white material on face 5 (−Z). A new regression test failed specifically on the missing reverse texture. The private WebGL harness reproduced a normal front and completely blank reverse with the original production factory. This is a confirmed code defect consistent with the screenshot, not a measurement of which face that phone frame rendered.
- Both broad faces now share the unchanged original texture. BoxGeometry's separate outward UVs keep text upright and left-to-right from either side; this is not a mirrored DoubleSide plane. Size, placement, fixed orientation, artwork bytes, tracking, occupancy and printed QR are unchanged.
- 20 automated tests pass. The added test verifies both material maps and every corner's reading direction from opposing cameras. Existing geometry and source-hash tests still pass.
- Browser WebGL visual inspection of `/_test/card-material.html` shows the complete original on both faces, including the same flower, title, icons, notes and awards. Each face rendered 78,656 colored pixels, versus zero on the old reverse face; both renderers reported no GL error. This private test isolates the real production material/geometry and is not a phone-tracking validation or a new deliverable card. It is outside the published `site/` directory.
- The entry module and its local imports now use the same explicit release cache key. A release-query page link can bypass the earlier cached HTML for immediate verification; the printed QR route remains unchanged. GitHub Pages may still cache unversioned HTML, and publication is not evidence that an already-open phone tab has reloaded.
- No new physical-device capture has been obtained for this fix. Desktop rendering establishes the removed blank-face defect, not complete mobile usability.

## Previous: full original artwork at a fixed large size

- User explicitly requests a large, faithful projection to inspect virtual-space boundaries, not a redesigned mobile card. The entire original texture is unchanged; nominal card size is 216 × 477.4mm, approximately six times the width and height of the rejected 0.332-scale replay result.
- Removed the viewport-fitting loop and minimum-scale policy. Card geometry and scale are independent of camera distance, aspect ratio and off-screen corners. Off-screen edges are expected, not a reason to shrink the card or rewrite its content.
- Upright paper normal, behind-tube placement, original aspect ratio, full texture UVs, fixed bottom position and no camera-following rotation are preserved. Image targets, QR, tube gate and camera-evidence render order are unchanged.
- 18 automated tests pass, including fixed dimensions across 54 synthetic view combinations, intentional out-of-frame projection without shrinkage or hiding, full-source texture/UV integrity, viewport changes and phone movement. These prove the requested geometry/asset behavior, not phone readability or persistent tracking outside the physical target.
- Actual-engine 1280 × 720 replay acquired `print-near` and retained positive tube evidence for over 60 seconds with scale exactly 1. Visual review showed the enlarged card's lower/awards region above the tube while the upper artwork extended beyond the view. This is the intentionally large complete plane, not a cropped/recomposed asset and not a claim that the whole original is readable in one frame. The previous small card is not restored to force full visibility.

## Previous upright correction: orientation retained, small viewport-fit rejected

The user's real-phone screenshot rejected the previous near-horizontal card. That was a product-geometry error: tests checked visibility and height above the paper, but did not check the correct reading plane or front/back relationship. The previous layout is not an accepted baseline.

- The horizontal physical tube, print, QR, original artwork and automatic tracking/occupancy pipeline are unchanged.
- Virtual card local up equals paper +Z; its front normal lies in the paper plane and faces the initial viewer. The whole thin card is behind the tube's far edge by at least 10mm, with its bottom 12mm above paper. Phone roll does not determine card orientation. The original horizontal typesetting remains unchanged.
- Initial viewport fitting changes uniform scale around a fixed bottom edge, never orientation or placement side. Scale is bounded between 0.3 and 1 of the 108 × 238.7mm source-proportional card; this is not a claim that tiny body text is readable at every resulting size. Once aligned, the pose and scale are fixed relative to the print.
- 17 automated tests pass. Added assertions cover upright paper normal, viewer-facing front, all eight box corners behind the entire tube footprint, fixed bottom height, seven viewing azimuths, phone roll, rotated world anchors, and unchanged pose/scale after camera motion. Projection tests exercise 54 synthetic combinations of portrait/landscape aspect, 30/40/50cm distance, 35/45/60-degree elevation and three oblique azimuths. These are geometric tests, not physical-device recognition results.
- Actual-engine local replay of the original clean scene photograph at 1280 × 720 acquired `print-near`, automatically showed the upright card, and kept it visible for over 110 seconds. The real-photo projection exposed clipping at an earlier minimum scale; corrected bounded fitting yielded scale 0.332, all four face corners inside the viewport, and paper-up [0, 0, 1] within floating-point tolerance. Visual inspection confirmed normal-reading artwork behind—not covering—the horizontal tube.
- Digital empty-card replay retained image pose, produced zero dark rows, hid the virtual card, and reset the gate. No calibration or playback button was introduced.
- The user's latest AR screenshot is failure evidence, not a tracking target or replay input. No new phone recording of this corrected layout has been captured; portrait live readability and movement remain unverified on the device.

## Previous static-card increment: shared assets/pipeline, rejected layout

- Uses the approved outlined tasting-card SVG as-is, rendered on white in sRGB to a 1853 × 4096 lossless WebP. Artwork, glyphs and text are not regenerated or rearranged.
- The previous implementation limited tilt to 25 degrees from the paper and placed the card above the tube. **Rejected by real-phone feedback; replaced by the perpendicular, behind-tube layout above.**
- The original image targets, QR, tube gate and grace state are preserved. The probe now samples camera pixels before virtual content renders, preventing the opaque card from erasing its own evidence.
- The previous 15 tests passed projection bounds, tube clearance, fixed pose, source/texture integrity and render order. They missed the required reading-plane relationship and therefore did not establish usability.
- Desktop 1280 × 720 photo replay acquired the existing print reference and automatically displayed the virtual card continuously for over 50 seconds with positive tube evidence.
- Switching to the digital empty card retained image tracking, yielded zero dark rows, hid the virtual card and reset the gate. The virtual card therefore did not keep itself latched through its own pixels.
- A separate 390 × 844 desktop viewport test, letterboxing the entire landscape photograph into a simulated portrait video, did not acquire at the two tested replay scales. It is not a real phone camera test; do not describe portrait live recognition or readability as verified. The printed target data were not modified to fit this artificial case.
- Fine print remains small when the complete long card is fitted to a landscape viewport. This is a layout-density limit, not missing source text; no automatic rewrite, crop, or typography replacement was applied.

The earlier botanical checks below remain historical evidence for the shared tracking spine, not a claim that botanical content is still the current default.

## Earlier botanical increment: implemented

- Original QR route `/v3/`; existing print unchanged.
- Pinned, unmodified 8th Wall Engine 1.0.0 and Three.js 0.160.1, same-origin hosting.
- Independent image references from unobscured artwork wings, mapped back to one card coordinate frame.
- Current print appearance rectified from the supplied scene photograph using 1,764 RANSAC inliers. Only unobscured artwork crops are runtime assets; no user surroundings or tube photo is published.
- Automatic, temporally confirmed, broad dark occupancy in the pale tube corridor. This is not SKU recognition, a learned bottle detector, or an arbitrary 3D pose estimator.
- Growing botanical stems/leaves/grape clusters with a clear label corridor; no orbiting ingredient sprites.
- Image tracking only: no motion-sensor permission or consumer SLAM scan. Missing image pose hides geometry; brief loss retains animation progress. This does not claim persistent world anchoring when the card leaves view.

## Observed in the browser

- Real engine consumed a local canvas video replay of the user's supplied scene photograph.
- At the full replay frame size, the original complete digital target did not acquire that photograph. Rectified print-wing references did acquire it and produced card-corner projections consistent with the visible print.
- Full scene: automatic positive occupancy (16–18 dark rows over 192 mm sampled span), followed by visible animated garnish; no consumer interaction after camera startup.
- Switched the feed to the empty original card: image pose remained available, dark rows became zero, playback stopped, and the animation timeline reset.
- Switched back to the photograph at 75% frame size: the complete digital target acquired it, occupancy became positive, and playback restarted automatically. This screen-size variation is not a measured physical camera distance.
- State unit tests cover empty rejection, automatic start, brief evidence loss, removal, reacquisition, and malformed target scale. Site tests prohibit calibration/debug controls in the published page and verify target resources.

## Explicit limits

The supplied scene photograph was used for print-reference calibration AND replay. This is a closed-loop integration check, not independent recognition accuracy. Digital empty-card replay is not a photograph of the user's empty physical print. No real-phone 30–50 cm success rate, motion stability, physical removal test, lighting variation, or WeChat compatibility has been measured. Those claims must not be inferred from the checks above.

The illustration-derived targets remain available as fallbacks. Bright/transparent tubes, a hand persistently covering the corridor, or placement outside it require additional evidence before support can be claimed. Reasonable similar wine tubes are acceptable; authenticity matching is not required.
