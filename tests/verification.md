# Verification — existing printed card, automatic garnish

## Current: full original artwork at a fixed large size

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
