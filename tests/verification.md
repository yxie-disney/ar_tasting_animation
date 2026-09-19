# Verification — existing printed card, automatic garnish

## Current increment: static floating tasting card

- Uses the approved outlined tasting-card SVG as-is, rendered on white in sRGB to a 1853 × 4096 lossless WebP. Artwork, glyphs and text are not regenerated or rearranged.
- A thin 3D card is initially oriented for reading, tilted at most 25 degrees from the physical plane, then fixed in card-local coordinates. Corners are kept above the tube; initial projected bounds are fitted without cropping the artwork. Camera motion changes perspective, not the card's own pose.
- The original image targets, QR, tube gate and grace state are preserved. The probe now samples camera pixels before virtual content renders, preventing the opaque card from erasing its own evidence.
- 15 automated tests pass, including portrait/landscape projection bounds, tube clearance, static pose under camera movement, source/texture integrity and render order.
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
