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
4. Current content is the unchanged original portrait tasting-card artwork on a thin 3D card standing upright BEHIND the horizontal tube. Card up is the paper's outward normal; the reading plane is perpendicular to the paper and its front faces the initial viewer. The entire virtual card clears the tube's far edge by at least 10mm; its bottom is 12mm above the paper. Initial uniform viewport fitting does not tilt, crop or move the card in front. Orientation, position and scale then remain fixed relative to the physical card as the phone moves. The earlier botanical geometry is retained but not loaded. Dynamic asset production is a separate next task, defined in docs/ANIMATION-WORKFLOW.md.
5. Brief evidence loss gets 1.7 seconds of grace. Loss of image pose hides geometry immediately and pauses the timeline; reacquisition can resume. Sustained absence resets the timeline. No unsupported world-anchor persistence is claimed.

Image-only tracking is deliberately selected for this fixed card-in-frame experience. The application does not request motion sensors or make a consumer perform a SLAM scan. A browser-required camera-start gesture is the only optional button. Camera occupancy is measured before virtual content rendering so an opaque virtual card cannot create or erase its own tube evidence.

## Reuse and responsibilities

- Official image-target event/scene pattern: https://github.com/8thwall/aframe-image-targets-example
- Current engine configuration: https://8thwall.org/docs/api/engine/xrcontroller/configure
- Target guidance: https://8thwall.org/docs/engine/guides/image-targets
- Product reference, not a code/art source: https://www.postpopstudios.com/immersive-technology/augmented-reality-cocktail-coasters

GitHub is code/deployment SOT. Original print masters stay local; reduced tracking crops are published. The user's scene photograph stays local and is not deployed. Dependencies are version-pinned and their licenses are preserved. Recognition reference preparation, procedural animation, application integration and deployment are separate implementation responsibilities; success of one does not imply acceptance of the others.

## Evidence and remaining gate

The actual engine acquired the supplied scene in local video replay, occupancy automatically started animation, digital empty-card replay stopped it, and re-entering the scene at a smaller frame size reacquired and restarted it. Print-reference calibration used the same photo: this is an integration check, not independent accuracy evidence. See [tests/verification.md](tests/verification.md).

Next gate is real-phone use of this same QR/print at the intended view: initial acquisition, movement, empty physical card, removal/re-entry and lighting. iOS Safari, Android Chrome and WeChat behavior are not interchangeable and have not been measured. Final animation aesthetics and mobile frame rate are also not yet accepted. No production-readiness claim follows from a successful deployment or replay.

If this gate fails, inspect the concrete failure and correct the implementation; do not add consumer calibration, silently treat card-only as tube-present, ask for a new print by default, or publish another decorative layout instead of fixing the runtime.

## Collaboration contract

Lead with the product outcome and make the engineering choice. Do not transfer architecture work to the user through lists of concerns. Preserve fixed inputs; distinguish observations, assumptions and verified results. Do not conflate illustration, animation, system design and deployment into an unsupported promise. Human input is needed for genuine physical-device evidence and aesthetic decisions, not to invent the technical path or repair routine tooling. No version-count theater, speculative extra materials, or claims of success without appropriate checks.
