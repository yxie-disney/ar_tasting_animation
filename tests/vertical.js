import * as THREE from 'three';
import {MindARThree} from 'mindar-image-three';
import {createVerticalStage} from '/ar/vertical-stage.js';
import {createTargetPlayback} from '/ar/vertical-playback.js';
const report=document.querySelector('#report');
try {
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
 renderer.setSize(300,420);renderer.setClearColor(0x25352e);document.body.append(renderer.domElement);
 let errors=0;renderer.debug.onShaderError=()=>errors++;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,300/420,.01,100);
 camera.position.set(.35,.1,3);camera.lookAt(0,0,0);
 const {stage,reliefs}=await createVerticalStage(THREE,renderer);const mm=new THREE.Group();mm.scale.setScalar(1/50);mm.add(stage);scene.add(mm);
 const board=new THREE.Mesh(new THREE.PlaneGeometry(1,1.5),new THREE.MeshBasicMaterial({color:0x806040}));scene.add(board);
 const cylinder=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,4.3,32),new THREE.MeshBasicMaterial({color:0x202420}));cylinder.position.set(0,-1,-.30);scene.add(cylinder);
 stage.visible=true;
 const cases=[];
 for(const relief of reliefs){
  reliefs.forEach(r=>r.group.visible=r===relief);relief.update(.7);renderer.render(scene,camera);
  cases.push({id:relief.group.children.map(c=>c.name).join(','),width:relief.geometry.parameters.width,
   opacity:relief.materials[0].opacity,frontZ:relief.group.position.z,scale:relief.group.scale.toArray()});
 }
 const playback=createTargetPlayback(reliefs.map(r=>r.group),stage);
 document.querySelector('#found').onclick=playback.targetFound;
 document.querySelector('#lost').onclick=playback.targetLost;
 renderer.setAnimationLoop(t=>{
  if(stage.visible)reliefs[playback.index].update(t/1000);
  renderer.render(scene,camera);
  report.textContent=JSON.stringify({mindarImported:typeof MindARThree==='function',shaderErrors:errors,visible:stage.visible,frame:playback.index+1,cases},null,2);
 });
 window.addEventListener('pagehide',()=>{playback.targetLost();renderer.setAnimationLoop(null);});
}catch(error){report.textContent=error.stack;}
