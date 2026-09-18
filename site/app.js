import {AnchorState,targetUnitsPerMm} from './anchor-state.js'
import {createGarnish} from './garnish.js'
const $=s=>document.querySelector(s)
const machine=new AnchorState()
const params=new URLSearchParams(location.search)
const preview=params.get('preview')==='1'
const records=[];let g,scene,camera,renderer,model;let startedAt=0,firstLock=null,engineStarted=false
const status=(s,h)=>{$('#status').textContent=s;$('#hint').textContent=h}
function log(event,data={}){records.push({ms:Math.round(performance.now()-startedAt),event,...data});if(records.length>300)records.shift()}
function fatal(error){$('#fatal').hidden=false;$('#fatal').textContent='未能开始：'+error.message+'\n可在 Safari / Chrome 中重新打开此链接，再允许相机。';log('error',{message:error.message});$('#start').disabled=false}
function script(src){return new Promise((resolve,reject)=>{const e=document.createElement('script');e.src=src;e.crossOrigin='anonymous';if(src.endsWith('/xr.js'))e.dataset.preloadChunks='slam';e.onload=resolve;e.onerror=()=>reject(Error('加载失败 '+src));document.head.appendChild(e)})}
async function setup(){
  g=await(await fetch('./geometry.json')).json()
  if(params.has('sku')&&params.get('sku')!=='jiadi-2021')throw Error('该酒款尚未接入，请扫描嘉地品丽珠 v2 卡片')
  await script('./vendor/three.min.js')
}
function initContent(s,c,r){scene=s;camera=c;renderer=r;model=createGarnish(THREE,g);scene.add(model.root);model.root.visible=false}
function showPose({detail:d}){
  if(d.name!==g.targetName)return
  const now=performance.now();const previously=machine.snapshot(now).visible
  machine.found(now)
  model.root.position.copy(d.position);model.root.quaternion.copy(d.rotation)
  model.root.scale.setScalar(targetUnitsPerMm(d,g));model.root.visible=true
  if(!previously)log('target-acquired',{scaledWidth:d.scaledWidth,scaledHeight:d.scaledHeight,scale:d.scale})
}
function tick(t){
  if(!model)return
  const s=machine.snapshot(t)
  // Hide stale pose immediately; grace retains playback permission, never a screen-stuck object.
  model.root.visible=preview||s.visible
  model.tick(t,preview||s.playing,preview||s.confirmed)
  if(preview)return
  $('#confirm').disabled=!s.locked||s.confirmed
  $('#confirm').textContent=s.confirmed?'香气正在生长':'试管已放好 · 播放'
  if(s.locked&&firstLock===null){firstLock=Math.round(t-startedAt);log('first-lock',{ms:firstLock})}
  if(!s.visible)status('对准圆环下方的识别区','从二维码这一侧斜拍，同时保留试管与完整黑色图案。')
  else if(!s.locked)status('已找到 · 稍稳一下','绿色框应贴住识别区，绿色圆环应叠在纸上红环。')
  else if(!s.confirmed)status('已定位 · 确认试管位置','试管放在红环内，点击下方按钮。此轮为手动确认。')
  else status('香气正在生长','慢慢左右移动手机；观察圆环是否贴合，香气是否围绕试管。')
  $('#metrics').textContent=JSON.stringify({firstLockMs:firstLock,losses:s.losses,poseAgeMs:Math.round(s.age),phase:'P1 manual tube'},null,2)
}
async function startAR(){
  if(engineStarted)return
  $('#start').disabled=true;startedAt=performance.now()
  try{
    if(!isSecureContext)throw Error('需要 HTTPS 相机链接')
    await setup()
    await script('./vendor/xr/xr.js')
    await Promise.race([new Promise(resolve=>window.XR8?.XrController?.configure?resolve():window.addEventListener('xrloaded',resolve,{once:true})),new Promise((_,reject)=>setTimeout(()=>reject(Error('识别引擎初始化超时')),30000))])
    const target=await(await fetch('./image-targets/noterday-jiadi-v2.json')).json()
    XR8.XrController.configure({disableWorldTracking:true,imageTargetData:[target]})
    XR8.addCameraPipelineModules([XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),{
      name:'noterday-garnish',onStart:()=>{const s=XR8.Threejs.xrScene();initContent(s.scene,s.camera,s.renderer);XR8.XrController.updateCameraProjectionMatrix({origin:s.camera.position,facing:s.camera.quaternion});log('camera-started')},
      onUpdate:()=>tick(performance.now()),
      onException:error=>fatal(error instanceof Error?error:new Error(String(error))),
      listeners:[{event:'reality.imagefound',process:showPose},{event:'reality.imageupdated',process:showPose},{event:'reality.imagelost',process:({detail})=>{if(detail.name===g.targetName){machine.lost();model.root.visible=false;log('target-lost')}}}]
    }])
    $('#welcome').hidden=true;$('#hud').hidden=false
    const sizeCanvas=()=>{const canvas=$('#camera');const ratio=Math.min(devicePixelRatio,2);canvas.width=Math.round(innerWidth*ratio);canvas.height=Math.round(innerHeight*ratio);canvas.style.width='100%';canvas.style.height='100%'}
    sizeCanvas();addEventListener('resize',sizeCanvas)
    await XR8.run({canvas:$('#camera'),allowedDevices:XR8.XrConfig.device().ANY,cameraConfig:{direction:XR8.XrConfig.camera().BACK}})
    engineStarted=true
  }catch(error){fatal(error)}
}
async function startPreview(){
  await setup();$('#welcome').hidden=true;$('#hud').hidden=false;$('#badge').textContent='编排预览 · 无识别'
  const s=new THREE.Scene();s.background=new THREE.Color('#e5e0d5')
  const c=new THREE.PerspectiveCamera(40,innerWidth/innerHeight,1,2000)
  // Camera is in card coordinates before applying the explicit -90 degree target transform.
  c.up.set(0,0,1);c.position.set(-420,-70,380);c.lookAt(50,0,105)
  const r=new THREE.WebGLRenderer({canvas:$('#camera'),antialias:true});r.setSize(innerWidth,innerHeight);r.setPixelRatio(Math.min(devicePixelRatio,2))
  initContent(s,c,r);model.root.visible=true
  const paper=new THREE.Mesh(new THREE.PlaneGeometry(140,310),new THREE.MeshBasicMaterial({color:0xfaf9f5,side:THREE.DoubleSide}));paper.rotation.z=-Math.PI/2;paper.position.x=100;s.add(paper)
  const tube=new THREE.Mesh(new THREE.CylinderGeometry(14.5,14.5,215,48),new THREE.MeshBasicMaterial({color:0x432728}));tube.rotation.x=Math.PI/2;tube.position.set(g.ringFromModuleCenterMm.y,0,107.5);s.add(tube)
  const label=new THREE.Mesh(new THREE.CylinderGeometry(14.7,14.7,90,48),new THREE.MeshBasicMaterial({color:0xe9debe}));label.rotation.x=Math.PI/2;label.position.set(g.ringFromModuleCenterMm.y,0,120);s.add(label)
  model.content.children[0].visible=false
  $('#confirm').hidden=true;$('#reset').hidden=true;status('动画编排预览','这里没有相机识别。实际贴合效果以手机扫描为准。')
  r.setAnimationLoop(t=>{model.tick(t,true);r.render(s,c)})
  addEventListener('resize',()=>{c.aspect=innerWidth/innerHeight;c.updateProjectionMatrix();r.setSize(innerWidth,innerHeight)})
}
$('#start').addEventListener('click',startAR)
$('#confirm').addEventListener('click',()=>{if(machine.confirm(performance.now()))log('manual-tube-confirmed')})
$('#reset').addEventListener('click',()=>{machine.confirmed=false;log('reset')})
$('#diagnostics').addEventListener('click',()=>{$('#metrics').hidden=!$('#metrics').hidden})
window.__noterday={machine,records,get geometry(){return g},get model(){return model},get camera(){return camera}}
if(preview)startPreview().catch(fatal)
document.addEventListener('visibilitychange',()=>{if(document.hidden){machine.lost();if(model)model.root.visible=false}})
