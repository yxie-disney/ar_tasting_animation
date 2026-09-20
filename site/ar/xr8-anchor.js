// XR8 reports target width in scene units. Convert the anchor's metre space,
// not the artwork or the fixed +0.015m content offset.
export function createXR8Anchor(anchor, specs, playback) {
  let active = null;
  function pose(detail) {
    const spec = specs.find(s => s.name === detail.name);
    if (!spec || !(spec.widthMm > 0)) return false;
    const scale = detail.scale * detail.scaledWidth / (spec.widthMm / 1000);
    const {position: p, rotation: q} = detail;
    if (!(scale > 0) || ![scale,p?.x,p?.y,p?.z,q?.x,q?.y,q?.z,q?.w].every(Number.isFinite)) return false;
    anchor.position.set(p.x, p.y, p.z);
    anchor.quaternion.set(q.x, q.y, q.z, q.w);
    anchor.scale.setScalar(scale);
    return true;
  }
  function found({detail}) {
    if (active !== null && active !== detail.name) return;
    if (!pose(detail)) return;
    active = detail.name;
    anchor.visible = true;
    playback.targetFound();
  }
  function updated({detail}) {
    if (active === detail.name) pose(detail);
  }
  function reset() {
    active = null;
    playback.targetLost();
    anchor.visible = false;
  }
  function lost({detail}) { if (active === detail.name) reset(); }
  return {found, updated, lost, reset};
}
