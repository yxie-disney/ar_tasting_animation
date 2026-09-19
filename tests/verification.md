# Current verification

## Original-texture relief update — 2026-09-19

- 41 automated tests pass: five bounded relief surfaces, unchanged UVs, pinned base/root, one-second switching, fixed stage, existing-gold-only region masks, production Three r160 shader chunks and adaptive pose-filter response.
- Private actual WebGL harness `/_test/relief.html`: all five straight-on orthographic flat-versus-relief comparisons have zero changed pixels with breathing/glow disabled. Back-versus-front comparisons also have zero changed pixels. This is an isolated orthographic material check, not a claim that perspective views never change.
- Oblique views and opposite breathing phases produce visible pixel differences on all five originals; all sampled WebGL errors are zero. Glow changes 1,576 pixels on the second character's existing fittings in the test shot and zero on the other four (RGB difference threshold >3/255).
- Fixed actual-photo engine replay: one acquisition, occupancy confirmed, continuous five-frame playback. One 180-sample window measured raw position RMS 0.381mm versus filtered 0.240mm in the configured paper frame. This is a desktop replay measurement, not real-device accuracy or proof that the reported mobile depth instability is resolved.
- Synthetic ±1mm jitter test reduces variance compared with the previous fixed 0.5 interpolation; deliberate movement remains responsive and genuinely new acquisitions snap to their new pose. Tracking validity/hiding policy is unchanged.
- Original PNGs, stage, QR, five-frame timing and card transforms remain unchanged. No separate cutout layers, reconstructed hidden artwork, device-orientation overlay, particles or complete 3D model were created.
- Local build command could not run because installed package dependencies were absent; browser tests use the already pinned local vendor files. The existing GitHub deployment workflow independently installs pinned dependencies, runs tests and builds before publishing; deployment success must be checked separately.

## Accepted by user

The two-thirds-size static card and its present viewing space are accepted as the future animation stage. User reports camera-to-card distance approximately30cm. This is physical-user feedback, not calibrated camera intrinsics. Configuration is locked in `site/ar/stage.js`.

## Automated and rendering checks

All31 automated tests pass after cleanup. The relocated runtime was also replayed in the browser: clean-photo occupancy automatically displayed content, then the digital empty-card control retained image tracking while evidence became absent and content stopped. Both-face WebGL rendering and tube-depth overlap checks were rerun successfully. This confirms relocation did not intentionally change behavior, not new mobile accuracy.

- Original texture hash/aspect/UVs; two broad faces retain readable orientation and unchanged artwork.
- Exact shared stage constants, fixed far-side upright placement, raised bottom, no viewport auto-fit, no billboard.
- Known-layout tube depth proxy and thousands of camera-to-tube surface rays.
- Synthetic camera boundary tests explicitly retain cases where the larger card top is outside a fixed low-aim portrait frame; no universal full-frame claim.
- Image/world tracking lifecycle, sustained occupancy, true absence vs unknown, stale/limited world rejection, image-required recovery.
- QR compatibility redirect keeps query/hash and routes to the only runtime. Local imports use a shared release key.
- Private replay and material test pages stay outside the published site.

The existing private WebGL material/depth check has passed at the locked dimensions: complete original on both faces, no GL errors, background revealed correctly through the tube's depth-only occluder. Clean-photo engine replay exercises acquisition/occupancy; the same photograph helped prepare tracking references, so this is not independent accuracy evidence.

## Not established

Cross-device mobile performance, world-tracking continuation during reading, difficult lighting and long-term drift are not collectively accepted. Photo replay, injected desktop fallback and synthetic geometry do not replace these tests. No final 3D garnish animation has yet been approved.

## Reproduction

`npm test`, `npm run build`, `npm run serve`. Local-only material test: `/_test/card-material.html`. With the private scene path supplied through `NOTERDAY_SCENE`, use `/_test/replay` for real-engine replay. Source photographs are never copied into `site/`.
# Five-frame hard-cut update — 2026-09-19

- Ten selected PNGs compared by SHA-256 against the local originals: byte-identical. No source edits. All five cards share 1683×3720; all five characters retain alpha.
- `stage.js` unchanged. Background card remains 144×318.28877 scene units, position [55,-18,194.144385], upright. Character layer X=34.75 is between tube and card; height=80, bottom=35, original aspect preserved.
- 35 Node tests pass, including atomic frame/map/position changes, 1000ms boundaries, 5→1 wrap, left-to-right five centres and unchanged card transform.
- Private browser WebGL harness rendered all five production-texture pairs; all GL errors 0. Reviewed full images, white paper card backing and transparent character silhouettes. Synthetic camera is a render check, not a real-phone measurement.
- Local actual-photo camera replay acquires `print-near`, confirms tube occupancy and advances the shared timeline. After switching to empty-paper fixture, occupancy becomes false and content hides. Existing image-only replay cannot validate mobile SLAM.
- The historical photo points down at the paper: the locked large upright card extends beyond that replay's top edge. No stage resize was made to hide this limitation; real-phone framing remains the previously approved user setup.
- This verifies hard-cut playback and integration, not final art direction, one-second reading comfort or cross-device production performance.
