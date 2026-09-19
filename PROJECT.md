# NOTERDAY AR — execution contract

## Approved baseline

User approved the current two-thirds-size virtual card as the **physical/visual stage for future animation**, not merely a static-card preference. Approximate camera-to-virtual-card viewing distance: 30cm, reported by the user. Do not reinterpret this as camera-to-paper distance, new physical calibration, a forced camera constraint, or animation depth.

Authoritative shared configuration: `site/ar/stage.js`. Human-readable contract: [STAGE.md](docs/STAGE.md). Do not change scale, orientation, physical print or tube placement to accommodate an animation.

## Product

A consumer scans the existing QR, grants browser-required permissions, and sees AR content automatically beside a horizontal 215 × Ø29mm tube on the existing printed artwork. No registration, manual positioning, endpoint tapping or play button. The URL/card selects the experience; SKU authentication is not required. An empty card must not start content.

One implementation: `site/ar/`. The already printed `/v3/` URL only redirects to it and preserves query/hash. No reprint. Original print masters are retained locally; runtime tracking crops are published.

## Responsibilities

- Flat image tracking establishes the paper frame. Compatible devices use the existing 8th Wall binary's world tracking only when fresh NORMAL tracking and an acquired image anchor coexist.
- Broad dark occupancy in the known tube corridor is secondary evidence, not general object recognition. Sustained presence triggers; unknown visibility does not revoke a confirmed scene; observable absence expires the grace period. Invalid world pose must not masquerade as tracking.
- The full original virtual card remains upright on the fixed far side, with unchanged image bytes on both faces. A known-layout depth-only tube proxy protects the real object; it is not live segmentation.
- User approved size/viewing space. Mobile world continuation and broad device compatibility remain separate verification items.
- Next content is **flavor-plant garnish**, explicitly selected by the user. Produce actual model/animation assets using the locked stage; do not reinstate the discarded ingredient-orbit or vine demo, add physical materials, or treat a concept image/video as a completed 3D asset.
- Illustration, modeling, motion authoring, runtime integration and publishing are separate deliverables. Pipeline choice and code/integration are assistant responsibilities. User approves aesthetic content; specialist modeling/rigging is required if assets cannot pass inspection, not hidden behind another generative prompt.

## Completion rules

Animation delivery requires editable source, a real animated GLB, and a preview rendered from that same GLB. Verify motion after export, stage bounds, real-tube visibility, mobile load/render cost and actual AR composition. A generated MP4 alone is not a rotatable 3D animation.

Existing static experience stays published until replacement content is accepted. Preserve official engine/Three.js licenses. Never upload private scene photographs or whole brand source folders as part of deployment.
