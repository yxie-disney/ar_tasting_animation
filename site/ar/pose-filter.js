// Time-based low-pass filter in the COMMON paper frame. Small pose noise gets
// damped; deliberate camera motion gets a faster response. Never use this to
// keep showing a scene after the tracking state has declared its pose invalid.
export class PaperPoseFilter {
 constructor(THREE){this.THREE=THREE;this.reset();}
 reset(){this.t=null;this.position=null;this.quaternion=null;this.scale=null;}
 sample({position,quaternion,scale,t,fresh}){
  if(!fresh||this.t===null||t-this.t>350){
   this.position=position.clone();this.quaternion=quaternion.clone();this.scale=scale;this.t=t;
  }else{
   const dt=Math.max(1/240,Math.min(.1,(t-this.t)/1000));
   const distanceMm=this.position.distanceTo(position)/scale;
   const angle=this.quaternion.angleTo(quaternion);
   const relativeScale=Math.abs(scale/this.scale-1);
   // Errors below roughly 2mm / .7deg / .7% are predominantly small jitter.
   // This is a tunable filter, not a statement that all such motion is noise.
   const motion=Math.max(distanceMm/8,angle/.07,relativeScale/.04);
   const hz=2.5+12*Math.min(1,Math.max(0,motion-.25));
   const alpha=1-Math.exp(-2*Math.PI*hz*dt);
   this.position.lerp(position,alpha);this.quaternion.slerp(quaternion,alpha);
   this.scale+=(scale-this.scale)*alpha;this.t=t;
  }
  return {position:this.position,quaternion:this.quaternion,scale:this.scale};
 }
}
