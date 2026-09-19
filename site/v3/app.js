import {ExperienceState,scaleFromTarget} from './tracking.js';
import {createTastingCard} from './tasting-card.js';
import {createOccupancyProbe} from './occupancy.js';

const $=s=>document.querySelector(s),state=new ExperienceState();
let targetSpecs=[],activeTarget=null;
let scene,camera,renderer,anchor,garnish,probe,starting=false,running=false,lastProbe=0;
let cardTexture;
let current={visible:false},evidence=null,acquisitions=0,lastPose=null;
let stage='loading',scanStage='waiting',cpuKeys=[];
const debug={get stage(){return stage},get scanStage(){return scanStage},get cpuKeys(){return cpuKeys},get state(){return current},get evidence(){return evidence},get acquisitions(){return acquisitions},get pose(){return lastPose},get camera(){return camera},get anchor(){return anchor},get renderer(){return renderer},get content(){return garnish}};
// Read-only diagnostics are available to development tooling, never a consumer control.
window.__noterday=debug;

function hint(text){$('#hint').textContent=text;$('#hint').hidden=!text;}
function playCamera(){
  const video=document.querySelector('video');if(!video)return;
  video.muted=true;video.playsInline=true;
  video.play().catch(()=>{ $('#entry-message').textContent='轻触开启相机';$('#start').hidden=false;$('#start').disabled=false; });
}
function fail(error){
  console.error(error);starting=false;running=false;
  try{window.XR8?.stop();}catch{}
  $('#entry').hidden=false;$('#start').hidden=false;$('#start').disabled=false;
  $('#entry-message').textContent=/denied|permission|notallowed/i.test(String(error))?'请允许相机访问，再轻触下方继续。':'相机未能启动，请轻触下方重试。';
}
function init(){
  stage='camera-running';
  ({scene,camera,renderer}=XR8.Threejs.xrScene());
  const resize=()=>{renderer.setPixelRatio(Math.min(devicePixelRatio,1.5,1440/Math.max(innerWidth,innerHeight)));renderer.setSize(innerWidth,innerHeight);};
  resize();addEventListener('resize',resize);
  anchor=new THREE.Group();anchor.visible=false;scene.add(anchor);
  garnish=createTastingCard(THREE,cardTexture,renderer);anchor.add(garnish.group);
  scene.add(new THREE.HemisphereLight(0xfff4dd,0x34422d,2.0));
  const light=new THREE.DirectionalLight(0xffeed5,2.1);light.position.set(-1,3,4);scene.add(light);
  probe=createOccupancyProbe(THREE,renderer,camera,anchor);
  XR8.XrController.updateCameraProjectionMatrix({origin:camera.position,facing:camera.quaternion});
  $('#entry').hidden=true;running=true;hint('让酒管与卡片一起入镜');
}
function pose({detail:d}){
  const spec=targetSpecs.find(s=>s.name===d.name);if(!spec||!anchor)return;
  const scale=scaleFromTarget(d)*180/spec.widthMm;if(!Number.isFinite(scale)||scale<=0)return;
  const t=performance.now(),wasFresh=t-state.lastImage<350;
  if(wasFresh&&activeTarget!==d.name)return;
  activeTarget=d.name;
  state.image(t);if(!wasFresh)acquisitions++;
  const position=new THREE.Vector3(d.position.x,d.position.y,d.position.z);
  const quaternion=new THREE.Quaternion(d.rotation.x,d.rotation.y,d.rotation.z,d.rotation.w);
  if(spec.rotation)quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),spec.rotation));
  position.sub(new THREE.Vector3(spec.offset[0],spec.offset[1],0).multiplyScalar(scale).applyQuaternion(quaternion));
  // Smooth jitter only while continuously tracking; never ease from an obsolete pose.
  if(wasFresh){anchor.position.lerp(position,.5);anchor.quaternion.slerp(quaternion,.5);anchor.scale.lerp(new THREE.Vector3(scale,scale,scale),.5);}
  else{anchor.position.copy(position);anchor.quaternion.copy(quaternion);anchor.scale.setScalar(scale);}
  lastPose={target:d.name,position:position.toArray(),rotation:d.rotation,scale};
}
function update({processCpuResult}={}){
  cpuKeys=Object.keys(processCpuResult||{});
  if(!anchor)return;
  const t=performance.now();current=state.tick(t);
  // The card pose stays measurable while the garnish is hidden awaiting tube evidence.
  anchor.visible=true;garnish.group.visible=current.visible;
  if(current.visible){garnish.alignOnce(anchor,camera);garnish.update(current.progressMs/1000);hint('');}
  else if(!current.image)hint('让酒管与卡片一起入镜');
  else hint('');
}
function sampleCameraBeforeContent(){
  const t=performance.now();if(!probe||t-lastProbe<220||!current.image)return;
  lastProbe=t;
  try{evidence=probe.sample();state.evidence(evidence.present,t);}catch(error){console.warn('Occupancy sample unavailable',error.message);state.evidence(false,t);}
}
async function start(){
  if(starting||running)return;starting=true;$('#start').disabled=true;
  try{
    await Promise.race([new Promise(resolve=>window.XR8?.XrController?resolve():addEventListener('xrloaded',resolve,{once:true})),new Promise((_,reject)=>setTimeout(()=>reject(Error('XR engine timeout')),45000))]);
    targetSpecs=await(await fetch('targets.json')).json();
    cardTexture=await new THREE.TextureLoader().loadAsync(new URL('assets/tasting-card/jiadi-cabernet-franc.webp',import.meta.url).href);
    const targets=await Promise.all(targetSpecs.map(async spec=>{const response=await fetch(spec.file);if(!response.ok)throw Error('Target not available');const target=await response.json();target.imagePath=new URL(target.imagePath,document.baseURI).href;return target;}));
    // This experience keeps the broad, existing card in view. Image tracking does
    // not require the consumer to grant motion sensors or perform a SLAM scan.
    stage='engine-ready';XR8.XrController.configure({disableWorldTracking:true,imageTargetData:targets});
    XR8.addCameraPipelineModules([
      XR8.GlTextureRenderer.pipelineModule(),
      // Camera evidence must be sampled BEFORE the virtual card covers it.
      {name:'noterday-camera-evidence',onRender:sampleCameraBeforeContent},
      XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),
      {name:'noterday-garnish',onStart:init,onUpdate:update,onException:fail,
       onCameraStatusChange:({status})=>{stage='camera-'+status;if(status==='hasStream')setTimeout(playCamera,0);if(status==='failed')fail(Error('Camera permission denied'));},
       listeners:[{event:'reality.imageloading',process:()=>scanStage='loading'},{event:'reality.imagescanning',process:()=>scanStage='scanning'},{event:'reality.imagefound',process:pose},{event:'reality.imageupdated',process:pose},{event:'reality.imagelost',process:({detail:d})=>{if(d.name===activeTarget)state.lost();}}]}
    ]);
    const canvas=$('#camera');canvas.width=innerWidth;canvas.height=innerHeight;
    await XR8.run({canvas,allowedDevices:XR8.XrConfig.device().ANY,cameraConfig:{direction:XR8.XrConfig.camera().BACK}});
  }catch(error){fail(error);}
}
$('#start').addEventListener('click',()=>{if(starting&&!running)playCamera();else start();});
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.reset();if(garnish)garnish.group.visible=false;} });
// Try the browser camera permission directly. A start button appears only if
// browser policy requires a gesture or permission was denied.
start();
