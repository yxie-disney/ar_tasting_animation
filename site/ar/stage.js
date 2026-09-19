// User-approved physical/visual baseline. Nominal scene units are millimetres;
// they are NOT new measurements inferred from PNG DPI or the phone screenshot.
// Future animation uses this same stage instead of resizing the experience.
export const STAGE=Object.freeze({
 widthMm:144,heightMm:144*2480/1122,
 baseHeightMm:35,centerX:55,centerY:-18,
 tubeLengthMm:215,tubeRadiusMm:14.5,
 // Paper frame: +Z up, +X far side; approved viewer is on the -X side.
 right:Object.freeze([0,-1,0]),up:Object.freeze([0,0,1]),front:Object.freeze([-1,0,0])
});
