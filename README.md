# NOTERDAY AR tasting animation

V2 phone test: https://yxie-disney.github.io/ar_tasting_animation/?sku=jiadi-2021

The printed, standardized 64 × 48 mm module below the tube placement ring owns the AR coordinate frame. The decorative card artwork is not part of the target. A fixed transform places the garnish at the tube base and along the card normal.

## Current usable slice

- Real 8th Wall planar recognition, using official Image Target CLI output.
- Same-origin, pinned 8th Wall Engine 1.0.0 and Three.js 0.160.1 assets.
- Outlined text and a decodable SKU QR in the printable v2 artwork.
- Animated 2.5D flavor illustrations derived from the existing card.
- A depth-only Ø29 mm × 215 mm tube hides garnish passing behind the bottle.
- Explicit manual confirmation of tube placement for this P1 test. No automatic tube recognition is claimed.
- Camera loss hides the stale pose immediately. A 1.2 s grace period preserves confirmation, not a frozen screen-space object.

## Phone test

Print v2 using exactly the same settings as the previously measured v1. Place the tube at the ring. Scan/open the URL and allow the rear camera. Approach from the QR side at about 45°, keeping the entire black module and tube in frame. The upper-right flower may be fully occluded.

First check that the green rectangle follows the black module and that the green circle overlaps the printed red ring. Press the clearly labeled placement-confirmation button to play. Move the phone slowly sideways and cover/uncover the module. A long loss should require confirmation again. Report first-lock time, visible drift, loss behavior, and a phone screen recording if the geometry is wrong.

The preview link is a camera-free scene preview and is labeled as such. It cannot validate tracking.

## Development

`node --test tests/*.test.mjs`

Serve `site/` using a static server for desktop checks. Phone camera access requires HTTPS. GitHub Pages deploys `site/` through the checked-in workflow. Print masters and personal local asset paths are excluded from the public deployment.

See `docs/v2-contract.md` for geometry, evidence, and remaining work. The root `handover.md` in the local clone contains earlier project context; v2-contract supersedes its older whole-card targeting decisions.

To regenerate the complete SVG/PNG, module, official target data and sprite assets: install dependencies, set `AR_CARD_SOURCE` to the original outlined SVG, and run `npm run build:card` from the repo root. `AR_PRINT_OUTPUT` defaults to `design/card-marker/v2`; font overrides are `AR_CJK_FONT` and `AR_LATIN_FONT` (Windows defaults are SimHei and Arial Bold). Source brand artwork is kept outside the public repository. The generator checks QR decoding and outlines new type. Revalidate the target whenever printed module content changes.
