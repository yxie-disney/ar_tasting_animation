# Current verification

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
