// Only healthy XR8 world tracking may carry an acquired label through a brief
// image loss. Never pretend a frozen screen-relative pose is a world anchor.
export const TRACKING_POLICY = Object.freeze({graceMs:1500, imageFreshMs:400, worldFreshMs:250});
export function createXR8Anchor(anchor, specs, playback, {
  worldEnabled=false, now=()=>performance.now(), clock=globalThis,
}={}) {
  let active=null, imageTracked=false, lastImage=-Infinity, imageSerial=0;
  let worldNormal=false, lastWorld=-Infinity, worldAnchored=false, invalidSerial=0;
  let deadline=null, expiry=null, generation=0;
  function cancelExpiry() {
    generation++;
    if (expiry!==null) clock.clearTimeout(expiry);
    expiry=null; deadline=null;
  }
  function reset() {
    cancelExpiry(); active=null; imageTracked=false; lastImage=-Infinity;
    worldAnchored=false; invalidSerial=imageSerial;
    playback.targetLost(); anchor.visible=false;
  }
  function worldFresh(t) { return worldEnabled&&worldNormal&&t-lastWorld<TRACKING_POLICY.worldFreshMs; }
  function visibility(t) {
    const image=imageTracked&&t-lastImage<TRACKING_POLICY.imageFreshMs;
    const carried=deadline!==null&&t<deadline&&worldAnchored&&worldFresh(t);
    anchor.visible=active!==null&&(image||carried);
    if (anchor.visible) playback.targetFound(); else playback.suspend();
  }
  function beginLoss(t) {
    imageTracked=false;
    if (active===null||deadline!==null) return;
    deadline=t+TRACKING_POLICY.graceMs;
    const token=++generation;
    expiry=clock.setTimeout(()=>{if(token===generation) reset();},Math.max(0,deadline-now()));
  }
  function pose(detail) {
    const spec = specs.find(s => s.name === detail.name);
    if (!spec || !(spec.widthMm > 0)) return false;
    const scale = detail.scale * detail.scaledWidth / (spec.widthMm / 1000);
    const {position: p, rotation: q} = detail;
    if (!(scale > 0) || ![scale,p?.x,p?.y,p?.z,q?.x,q?.y,q?.z,q?.w].every(Number.isFinite)) return false;
    if (q.x*q.x+q.y*q.y+q.z*q.z+q.w*q.w<1e-9) return false;
    anchor.position.set(p.x, p.y, p.z);
    anchor.quaternion.set(q.x, q.y, q.z, q.w);
    anchor.scale.setScalar(scale);
    return true;
  }
  function accept(detail) {
    if (!pose(detail)) return;
    active=detail.name; imageTracked=true; lastImage=now(); imageSerial++;
    cancelExpiry(); visibility(lastImage);
  }
  function found({detail}) { if(active===null||active===detail.name) accept(detail); }
  function updated({detail}) {
    if (active === detail.name) accept(detail);
  }
  function lost({detail}) {
    if(active!==detail.name) return;
    beginLoss(now()); visibility(now());
  }
  function tick(reality) {
    const t=now();
    if (reality) {
      const p=reality.position,q=reality.rotation;
      worldNormal=reality.trackingStatus==='NORMAL'&&
        [p?.x,p?.y,p?.z,q?.x,q?.y,q?.z,q?.w].every(Number.isFinite)&&
        q.x*q.x+q.y*q.y+q.z*q.z+q.w*q.w>1e-9;
      lastWorld=t;
    }
    // XR8 may omit imageupdated when a stationary pose is byte-identical.
    // Current detectedImages is still fresh measurement, not a stale event.
    const measured=active&&reality?.detectedImages?.find(d=>d.name===active);
    if (measured) accept(measured);
    if (!worldFresh(t)) { worldAnchored=false; invalidSerial=imageSerial; }
    if (imageTracked&&t-lastImage>=TRACKING_POLICY.imageFreshMs) beginLoss(lastImage+TRACKING_POLICY.imageFreshMs);
    if (deadline!==null&&t>=deadline) { reset(); return; }
    if (imageTracked&&worldFresh(t)&&imageSerial>invalidSerial) worldAnchored=true;
    visibility(t);
  }
  return {found, updated, lost, reset, tick, get state(){
    return {active,imageTracked,worldEnabled,worldAnchored,deadline,visible:anchor.visible};
  }};
}
