# Small tie-label replay — 2026-09-20

## What changed

- Initialize the camera canvas from its full viewport size before XR8 starts. Remove the conflicting Three.js DPR override; XR8 owns drawing-buffer/projection updates. CSS prevents renderer inline dimensions shrinking the visible canvas.
- Replace the runtime target list with the surviving rectangular region of the existing printed tie. No new QR, illustration, reprint, synthetic found event, or engine migration.
- Preserve all five relief assets, original aspect ratios, shared seams/normals, alpha 0.75, container `(0,0,0.015)`, and target-owned 1000ms hard cuts.

## Source identity

Master: `assets/printed-card/嘉地-品丽珠_立牌01.png`, 2126x3189.
SHA256: `465b05be25619a66d1ea851d92103b00e7825aaaff2e3a7b6273fda471fb41e3`.
Crop: `(45,2640)-(477,3150)`, excludes the hand-torn upper edge.
Runtime luminance: 542x640, SHA256 `d5b5a250d028a9aadf14488ce4a6a47f8cff8a36f7d856c24ebf843a320c1325`.
Independent matching of original crop to supplied closeup: 621 homography inliers from 645 matched features. This establishes source identity, NOT XR8 success by itself.

## Actual XR8 replay evidence

Private route: `/_test/tie-replay`, served only by `tools/serve.mjs`; photo path supplied through `NOTERDAY_TIE_PHOTO`. No private photo is copied into the repository or Pages artifact. Camera requests are replaced locally with a canvas stream; the real XR8 engine still performs detection.

Input: supplied upright-tube photograph, letterboxed into 1280x720, with a 2-pixel sinusoidal translation to keep captured frames changing. No redraw, segmentation or fabricated tracking events. Desktop XR8 reports orientation 90; the initial 720x1280 simulated stream failed even the control and is not a valid positive result.

Observed with production pipeline and no extra tracking/lighting switches:

- Portrait viewport 420x900: canvas CSS and drawing buffer both 420x900; camera fills screen.
- Landscape viewport 1280x720: CSS and drawing buffer both 1280x720, including a live resize from portrait. A resize listener requests the new canvas dimensions; XR8 updates its viewport/projection, without a competing renderer DPR setting.
- `tie-label`: found=1, updated=819, lost=0; real relief visibly overlaid in front of the tube.
- Visible order: 力士 → 妙音鸟 → 岩画 → 螭吻 → 角盔 → 力士. Sampled transition timestamps: 20755, 21756, 22756, 23756, 24756, 25758 ms. Sampling is observational, not a claim of sub-millisecond scheduling.
- Blank input: lost=1, both anchor/stage invisible, zero visible frames. No subsequent frame changes while blank for more than 20 seconds.
- Restore photo: found=2, updated=1998, lost=1, stage visible and cycling again.
- Instrumented playback timer count: one while acquired, zero after loss; first acquired frame is 力士. These diagnostic controls exist only in the private harness, not the consumer page.
- Console: no runtime errors; bundled Three.js emits its existing legacy-build deprecation warning.

Automated regression: 63 tests pass, including five-role mesh/depth/normal constraints, target source hash, viewport ownership, 1000 acquire/loss cycles with no timer accumulation, and unchanged QR-to-camera routing. Build copies the pinned XR8/Three.js libraries and all five unchanged source textures.

## Not established

This replay is not a physical camera trial. The label's actual printed width, acquisition at 30–50 cm, autofocus, glare, motion blur and embedded mobile-browser behaviour still require real-device observation. Millimetre conversion currently uses the source's nominal 180mm print width (crop width ~36.576mm), not a measured new label.

## Orientation follow-up (local checks, runtime unchanged)

Rotated the same supplied photograph in the private replay, without changing the target, artwork or production code. Each direction starts a fresh XR8 session (not tracking carried through a rotation):

| Photo roll | Real found / updated / lost at observation | Visible / timer count |
| --- | --- | --- |
| +90 degrees | 1 / 618 / 0 | true / 1 |
| -90 degrees | 1 / 1103 / 0 | true / 1 |
| 180 degrees | 1 / 933 / 0 | true / 1 |

All used target `tie-label`, started with 力士, continued the five-frame loop, and reported no runtime errors. This checks in-plane image rotation only; it is not evidence for all oblique viewing angles, mobile sensor orientations or lighting conditions. No new physical print specification follows from these tests.
