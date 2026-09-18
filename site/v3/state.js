export class TrackingState{
 constructor(){this.reset()}
 reset(){this.lastImage=-Infinity;this.hasAnchor=false;this.worldStatus='LIMITED';this.lastWorld=-Infinity;this.losses=0;this.imageActive=false;this.acquisitions=0}
 found(t){if(!this.imageActive)this.acquisitions++;this.lastImage=t;this.hasAnchor=true;this.imageActive=true}
 lost(){if(this.imageActive)this.losses++;this.imageActive=false}
 world(status,t){this.worldStatus=status;this.lastWorld=t}
 snapshot(t){const image=this.imageActive&&t-this.lastImage<300,world=this.worldStatus==='NORMAL'&&t-this.lastWorld<500;return{visible:this.hasAnchor&&(image||world),source:image?'card':this.hasAnchor&&world?'world':'none',losses:this.losses,acquisitions:this.acquisitions,imageAgeMs:Number.isFinite(this.lastImage)?Math.round(t-this.lastImage):null,worldStatus:this.worldStatus}}
}
export function scaleFromTarget(d,widthMm){const s=d.scale*d.scaledWidth/widthMm;if(!Number.isFinite(s)||s<=0)throw Error('Invalid image scale');return s}
