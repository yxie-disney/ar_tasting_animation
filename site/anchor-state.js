// Pose freshness owns visibility. Without SLAM, a lost card cannot supply a stable world pose.
export class AnchorState {
  constructor({lockMs=350,graceMs=1200,staleMs=180}={}) {
    Object.assign(this,{lockMs,graceMs,staleMs}); this.reset()
  }
  reset(){this.first=null;this.last=null;this.confirmed=false;this.losses=0;this.hadPose=false}
  found(t){if(this.first===null || this.last===null || t-this.last>this.staleMs)this.first=t;this.last=t;this.hadPose=true}
  lost(){if(this.hadPose)this.losses++;this.hadPose=false;this.first=null;this.lastLost=true}
  confirm(t){if(this.snapshot(t).locked)this.confirmed=true;return this.confirmed}
  snapshot(t){
    const age=this.last===null?Infinity:t-this.last
    const visible=this.hadPose&&age<=this.staleMs
    if(!visible && age>this.graceMs)this.confirmed=false
    const locked=visible&&this.first!==null&&t-this.first>=this.lockMs
    return {visible,locked,confirmed:this.confirmed,playing:locked&&this.confirmed,age,losses:this.losses}
  }
}
export function targetUnitsPerMm(detail,geometry){
  const n=detail.scale*detail.scaledWidth/geometry.targetWidthMm
  if(!Number.isFinite(n)||n<=0)throw Error('Invalid target scale')
  return n
}
