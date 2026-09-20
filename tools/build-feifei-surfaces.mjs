import fs from 'node:fs/promises';import path from 'node:path';import vm from 'node:vm';import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {profileFor,buildSharedField,sampleField,createSurfaceRelief} from '../site/ar/feifei-surface.js';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(repo,'assets/feifei-layers');
const context={console:{warn(){},log(){}}};vm.runInNewContext(await fs.readFile(path.join(repo,'site/vendor/three.min.js'),'utf8'),context);const THREE=context.THREE;
const manifest=JSON.parse(await fs.readFile(path.join(root,'manifest.json'),'utf8')),results=[];
const writeJson=(p,v)=>fs.writeFile(p,JSON.stringify(v,null,2)+'\n');
for(const [frameIndex,frame] of manifest.frames.entries()){
 const {spec,parts}=profileFor(frame),[w,h]=frame.canvas,folder=path.join(root,frame.id,'surface');
 const raw=new Uint8Array(await fs.readFile(path.join(folder,'ownership.u8')));if(raw.length!==w*h)throw Error('Bad ownership size');
 const fw=256,fh=340,owners=new Uint8Array(fw*fh);
 for(let y=0;y<fh;y++)for(let x=0;x<fw;x++)owners[y*fw+x]=raw[Math.min(h-1,Math.floor((y+.5)/fh*h))*w+Math.min(w-1,Math.floor((x+.5)/fw*w))];
 const field=buildSharedField(owners,fw,fh,spec,parts);await fs.writeFile(path.join(folder,'control.rgba8'),field.bytes);
 let low=Infinity,high=-Infinity,seamErrors=0,slope=0;
 for(let i=0;i<owners.length;i++){
  low=Math.min(low,3*(field.bytes[4*i]-field.bytes[4*i+1])/255);high=Math.max(high,3*(field.bytes[4*i]+field.bytes[4*i+1])/255);
  if(field.distance[i]===0&&(field.bytes[4*i]||field.bytes[4*i+1]))seamErrors++;
 }
 for(const phase of [-1,1])for(let y=1;y<fh-1;y++)for(let x=1;x<fw-1;x++){
  const u=(x+.5)/fw,v=(y+.5)/fh;slope=Math.max(slope,Math.abs(sampleField(field,u+1/fw,v,phase)-sampleField(field,u-1/fw,v,phase))/(2*spec.widthMm/fw));
 }
 if(low<0||high>3||seamErrors)throw Error(frame.id+': bound or seam failure');
 const relief=createSurfaceRelief(THREE,{source:new THREE.Texture(),ownership:{bytes:new Uint8Array(4),width:1,height:1},field,spec,parts});
 // Export actual buffer attributes/indices, not merely PlaneGeometry parameters.
 const bufferGeometry=new THREE.BufferGeometry().copy(relief.geometry);
 await writeJson(path.join(folder,'mesh.json'),bufferGeometry.toJSON());bufferGeometry.dispose();
 const state={id:frame.id,name:frame.name,userAlias:frame.id==='05-jiaokui'?'角端':frame.name,
  status:'generated; browser GPU acceptance recorded separately; not deployed',source:frame.source,sourceSha256:frame.sourceSha256,spec,
  geometry:{file:'mesh.json',format:'Three.BufferGeometry JSON',vertices:relief.geometry.attributes.position.count,triangles:relief.geometry.index.count/3},
  control:{file:'control.rgba8',width:fw,height:fh,format:'RGBA8 linear; R=static/3, G=breath/3, B=0, A=255',rowOrder:'bottom-to-top',sha256:createHash('sha256').update(field.bytes).digest('hex')},
  ownership:{file:'ownership.u8',width:w,height:h,format:'uint8 categorical; 0 transparent, 1..N component',rowOrder:'bottom-to-top'},
  components:parts.map((p,i)=>({...p,owner:i+1,sourceCut:frame.layers[i].file,geometry:'mesh.json',localPosition:[0,40,0],localScale:[1,1,1]})),
  playback:{station:frameIndex,stationPaperY:[68,25,-18,-61,-104][frameIndex],frameDurationSeconds:1,cycleFrames:5,transition:'hard-cut',rootDepthAnimated:false},
  states:[{id:'separated',legacyLayerZ:frame.layers.map(l=>l.zMm)},{id:'surface-static',phase:0},{id:'surface-live',phase:'sin(2*pi*time/3.6)'}],
  numericChecks:{minDepthMm:low,maxDepthMm:high,seamErrors,maxHorizontalSlope:slope,frontmostPaperX:spec.characterPaperX-high},
 };
 await writeJson(path.join(folder,'state.json'),state);results.push({id:frame.id,name:frame.name,userAlias:state.userAlias,state:frame.id+'/surface/state.json',components:parts.length,...state.numericChecks});relief.dispose();
}
await writeJson(path.join(root,'surfaces.json'),{algorithm:'shared-continuous-surface-1',frames:results,components:results.reduce((n,f)=>n+f.components,0),onlineChanged:false});
console.log(JSON.stringify(results,null,2));
