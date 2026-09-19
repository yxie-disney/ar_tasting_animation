export class ExperienceState {
  constructor({worldEnabled=false}={}){this.worldEnabled=worldEnabled;this.reset();}
  reset(){this.lastImage=-Infinity;this.imageTracked=false;this.imageSerial=0;this.invalidWorldImageSerial=0;this.lastWorld=-Infinity;this.worldNormal=false;this.worldAnchored=false;this.lastPositive=-Infinity;this.firstPositive=null;this.latched=false;this.progressMs=0;this.lastTick=null;this.lastSample=-Infinity;this.lastEvidence=null;}
  image(t){this.lastImage=t;this.imageTracked=true;this.imageSerial++;}
  lost(){this.imageTracked=false;this.lastEvidence=null;this.firstPositive=null;}
  world(status,t){this.worldNormal=status==='NORMAL';this.lastWorld=t;if(!this.worldNormal){this.worldAnchored=false;this.invalidWorldImageSerial=this.imageSerial;}}
  evidence(present,t){
    if(t-this.lastSample>500)this.firstPositive=null;
    this.lastSample=t;this.lastEvidence=present;
    if(present===true){this.lastPositive=t;if(this.firstPositive===null)this.firstPositive=t;if(t-this.firstPositive>=450)this.latched=true;}
    else if(present===null||t-this.lastPositive>250)this.firstPositive=null;
  }
  tick(t){
    const dt=this.lastTick===null?0:Math.min(100,t-this.lastTick);this.lastTick=t;
    const image=this.imageTracked&&t-this.lastImage<350;
    const worldFresh=this.worldEnabled&&this.worldNormal&&t-this.lastWorld<500;
    if(!worldFresh){this.worldAnchored=false;this.invalidWorldImageSerial=this.imageSerial;}
    if(image&&worldFresh&&this.imageSerial>this.invalidWorldImageSerial)this.worldAnchored=true;
    const world=worldFresh&&this.worldAnchored;
    const anchor=image||world;
    // Out of view is UNKNOWN, not evidence the tube was removed. Keep an
    // already-confirmed experience only while a real image/world pose exists.
    if(this.lastEvidence===false&&t-this.lastPositive>1700){this.latched=false;this.firstPositive=null;}
    const visible=anchor&&this.latched;
    if(visible)this.progressMs+=dt;
    if(!this.latched&&t-this.lastPositive>4000)this.progressMs=0;
    return {image,world,anchor,visible,latched:this.latched,progressMs:this.progressMs};
  }
}

export function occupancyEvidence(result){
  if(result?.present===true)return true;
  return result?.reason==='no-tube-evidence'?false:null;
}

// Classifies changed, dark, elongated occupancy in the card's existing pale strip.
// This is deliberately not SKU recognition or unrestricted 3D object detection.
export function classifyOccupancy(rows){
  const valid=rows.filter(r=>r.valid>=4);
  if(valid.length<18)return {present:false,coverage:valid.length/rows.length,reason:'out-of-frame'};
  const dark=valid.filter(r=>r.dark>=3&&r.dark/r.valid>=.28);
  const span=dark.length?Math.abs(dark.at(-1).y-dark[0].y):0;
  const present=dark.length>=8&&span>=85;
  return {present,darkRows:dark.length,span,coverage:valid.length/rows.length,reason:present?'elongated-occupancy':'no-tube-evidence'};
}

export function scaleFromTarget(d){
  const scale=d.scale*d.scaledWidth/180;
  return Number.isFinite(scale)&&scale>0?scale:null;
}
