# NOTERDAY AR garnish — current execution contract

## Outcome and fixed inputs

Consumer scans the existing printed QR, permits the camera if the browser requires it, and sees garnish automatically beside the physical wine tube. No bottle registration, endpoint taps, manual placement, confirmation/play button, or consumer diagnostic controls.

Use the user's existing print and horizontal tube layout, with a natural oblique view intended at 30–50 cm. The tube is 215 × Ø29 mm. Do not request another print, new QR, upright stand, saddle, or stop. The recovered master is nominally 180 × 270 mm (270 × 180 when used horizontally); this is not a new physical measurement. See [PHYSICAL-DESIGN.md](PHYSICAL-DESIGN.md).

Stable entry: https://yxie-disney.github.io/ar_tasting_animation/v3/

The pictured substitute SKU is acceptable. The card/URL selects this experience; tube authenticity and fine-print OCR are not required. Empty card must not play.

## Implemented spine

1. Existing QR opens the stable HTTPS page. It is not the primary spatial tracker.
2. Unmodified 8th Wall Engine 1.0.0 tracks unobscured artwork regions or the complete card. Target offsets map all references to one card coordinate system.
3. Local framebuffer samples check broad, sustained dark occupancy in the pale tube corridor. At least 450 ms confirmation is required. This inexpensive evidence fits the pictured dark wine tube; it does not claim arbitrary tube detection or continuous bottle-pose estimation.
4. Current content is the unchanged original portrait artwork on a thin 3D card standing upright on the FIXED far side of the approved printed layout (+X), facing its QR-side viewing direction (−X). It does not choose front/back from the acquisition frame. The center is 55mm beyond the tube axis; the bottom is 35mm above paper, above the 29mm tube. The rejected 216 × 477.4mm boundary trial is replaced by a fixed nominal 95 × 210mm original-aspect card. There is no automatic viewport shrinkage, reflow, crop or generated replacement. An invisible 215 × Ø29mm tube proxy writes depth before virtual content; this is a known-layout approximation, not segmentation. The earlier botanical geometry remains unloaded. Dynamic asset production is separate.
5. Image targets establish the print pose; compatible mobile devices also enable the existing engine's SLAM. A world anchor is usable only after an image pose coexists with fresh `NORMAL` tracking. When the marker leaves view, that valid world pose can retain the confirmed experience. LIMITED/stale world tracking invalidates the world anchor until the image is reacquired. No frozen camera-relative fallback is used. Desktop/incompatible devices and a one-time unavailable-world-session fallback retain image-only behavior.
6. Tube evidence is tri-state: present, observable absence, or unknown (out of frame/dark/unavailable). A confirmed experience is not terminated merely because the tube cannot be inspected. Observable absence still expires the 1.7-second grace. Empty-card initialization never starts content. Missing both image and valid world pose hides content.

Reading above the print makes continuous image-only visibility an inadequate product assumption. The engine supplies the combined image/world tracking path; no consumer calibration or SLAM coaching UI is added. The browser/engine may require sensor permission on compatible phones. A browser-required start gesture remains the only optional button. Camera occupancy is measured before virtual content renders. Mobile SLAM continuity is IMPLEMENTED BUT NOT PHYSICALLY VERIFIED; desktop/photo replay is not a substitute.

## Reuse and responsibilities

- Official image-target event/scene pattern: https://github.com/8thwall/aframe-image-targets-example
- Current engine configuration: https://8thwall.org/docs/api/engine/xrcontroller/configure
- Per-frame world tracking status: https://8thwall.org/docs/api/engine/xrcontroller/pipelinemodule
- Standard invisible depth occlusion: https://threejs.org/docs/pages/Material.html#colorWrite
- Target guidance: https://8thwall.org/docs/engine/guides/image-targets
- Product reference, not a code/art source: https://www.postpopstudios.com/immersive-technology/augmented-reality-cocktail-coasters

GitHub is code/deployment SOT. Original print masters stay local; reduced tracking crops are published. The user's scene photograph stays local and is not deployed. Dependencies are version-pinned and their licenses are preserved. Recognition reference preparation, procedural animation, application integration and deployment are separate implementation responsibilities; success of one does not imply acceptance of the others.

## Evidence and remaining gate

The actual engine acquired the supplied scene in local video replay, occupancy automatically started animation, digital empty-card replay stopped it, and re-entering the scene at a smaller frame size reacquired and restarted it. Print-reference calibration used the same photo: this is an integration check, not independent accuracy evidence. See [tests/verification.md](tests/verification.md).

Next gate is real-phone use of this same QR/print at the intended view: initial acquisition, movement, empty physical card, removal/re-entry and lighting. iOS Safari, Android Chrome and WeChat behavior are not interchangeable and have not been measured. Final animation aesthetics and mobile frame rate are also not yet accepted. No production-readiness claim follows from a successful deployment or replay.

If this gate fails, inspect the concrete failure and correct the implementation; do not add consumer calibration, silently treat card-only as tube-present, ask for a new print by default, or publish another decorative layout instead of fixing the runtime.

## Collaboration contract

Lead with the product outcome and make the engineering choice. Do not transfer architecture work to the user through lists of concerns. Preserve fixed inputs; distinguish observations, assumptions and verified results. Do not conflate illustration, animation, system design and deployment into an unsupported promise. Human input is needed for genuine physical-device evidence and aesthetic decisions, not to invent the technical path or repair routine tooling. No version-count theater, speculative extra materials, or claims of success without appropriate checks.
