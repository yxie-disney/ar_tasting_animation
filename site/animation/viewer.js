import * as THREE from 'three';
import {createVerticalStage} from '../ar/vertical-stage.js';
import {createTargetPlayback} from '../ar/vertical-playback.js';

const host=document.querySelector('#stage'),status=document.querySelector('#status');
const pause=document.querySelector('#pause'),angle=document.querySelector('#angle');
const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;host.append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,2000);
let playing=true,playback,reliefs,stage,shaderErrors=0;
renderer.debug.onShaderError=()=>{shaderErrors++;};
function aim(){
 const a=Number(angle.value)*Math.PI/180;
 // Move the inspection camera, never rescale the artwork to a label or viewport.
 const distance=Math.max(175,55/Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/camera.aspect);
 camera.position.set(distance*Math.sin(a),0,distance*Math.cos(a));camera.lookAt(0,0,3);
 document.querySelector('#degrees').value=angle.value+'°';
}
const resize=new ResizeObserver(()=>{
 camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();
 renderer.setSize(host.clientWidth,host.clientHeight);aim();
});resize.observe(host);angle.oninput=aim;
try{
 ({stage,reliefs}=await createVerticalStage(THREE,renderer));scene.add(stage);
 // Warm all five existing textures/programs, not a second rendering implementation.
 stage.visible=true;reliefs.forEach(r=>r.group.visible=true);
 await renderer.compileAsync(scene,camera);
 reliefs.forEach(r=>r.materials.forEach(m=>renderer.initTexture(m.map)));
 playback=createTargetPlayback(reliefs.map(r=>r.group),stage);
 playback.targetFound();pause.disabled=false;
 let elapsed=0,last=null;
 pause.onclick=()=>{
  playing=!playing;pause.textContent=playing?'暂停':'从第一张播放';
  if(playing){playback.targetFound();last=null;}
  else{
   const index=playback.index;playback.targetLost();
   stage.visible=true;reliefs[index].group.visible=true;
  }
 };
 renderer.setAnimationLoop(time=>{
  if(playing){if(last!==null)elapsed+=(time-last)/1000;last=time;reliefs[playback.index].update(elapsed);}
  else last=null;
  renderer.render(scene,camera);
  status.textContent=shaderErrors?'渲染错误，请勿作为验收结果':`${playback.index+1} / 5 · ${reliefs[playback.index].group.name}${playing?'':' · 已暂停'}`;
 });
}catch(error){status.textContent='动画载入失败：'+error.message;}
document.addEventListener('visibilitychange',()=>{
 if(!playback)return;
 if(document.hidden){playback.targetLost();renderer.setAnimationLoop(null);}
 else location.reload();
});
window.addEventListener('pagehide',()=>{playback?.targetLost();renderer.setAnimationLoop(null);resize.disconnect();});
