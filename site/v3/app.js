import {TrackingState,scaleFromTarget} from './state.js'
import {fitTube} from './registration.js'
const $=s=>document.querySelector(s),preview=new URLSearchParams(location.search).has('preview'),state=new TrackingState(),records=[]
// Local synthetic image tests do not claim to exercise mobile motion sensors or SLAM.
const imageOnly=['localhost','127.0.0.1'].includes(location.hostname)&&new URLSearchParams(location.search).has('imageOnly')
let g,root,camera,scene,renderer,tubeGuide,lastPose=null,started=0,firstLock=null,registration=null,registerStep='idle',basePick=null,notice=''
const log=(event,data={})=>{records.push({ms:Math.round(performance.now()-started),event,...data});if(records.length>600)records.shift()}
function script(src){return new Promise((yes,no)=>{const s=document.createElement('script');s.src=src;s.crossOrigin='anonymous';if(src.endsWith('xr.js'))s.dataset.preloadChunks='slam';s.onload=yes;s.onerror=()=>no(Error('加载失败：'+src));document.head.appendChild(s)})}
function fatal(e){$('#fatal').textContent='未能开始：'+e.message;$('#fatal').hidden=false;$('#welcome').hidden=false;$('#start').disabled=false;log('error',{message:e.message})}
function line(points,color='#61d6a1'){return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p))),new THREE.LineBasicMaterial({color,transparent:true,opacity:.9}))}
function ring(y){return line(Array.from({length:97},(_,i)=>{const a=i/96*Math.PI*2;return[Math.cos(a)*14.5,y,Math.sin(a)*14.5]}))}
function init(){root=new THREE.Group();root.visible=false;scene.add(root);tubeGuide=new THREE.Group();tubeGuide.visible=false;root.add(tubeGuide);tubeGuide.add(ring(0),ring(215));for(const x of [-14.5,14.5])tubeGuide.add(line([[x,0,0],[x,215,0]],'#b8d5c0'));for(const x of [-90,90])for(const y of [-135,135])root.add(line([[x,y-Math.sign(y)*8,.2],[x,y,.2],[x-Math.sign(x)*8,y,.2]]));}
function acceptRegistration(base,cap){registration=fitTube(base,cap,g.tube.heightMm,g.tube.diameterMm/2);tubeGuide.position.fromArray(registration.base);tubeGuide.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(...registration.axis));tubeGuide.visible=true;registerStep='idle';notice='';log('manual-tube-registration',registration);return registration}
function pickTube(e){
 if(registerStep==='idle'||!root)return
 if(state.snapshot(performance.now()).source!=='card'){notice='先让立牌两侧插画入镜，恢复识别后再点。';return}
 const box=$('#camera').getBoundingClientRect(),ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2((e.clientX-box.left)/box.width*2-1,1-(e.clientY-box.top)/box.height*2),camera)
 root.updateMatrixWorld(true);const localRay=ray.ray.clone().applyMatrix4(root.matrixWorld.clone().invert()),hit=localRay.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),-g.tube.diameterMm/2),new THREE.Vector3())
 if(!hit){notice='当前角度无法登记，请回到立牌正前方。';return}
 if(registerStep==='base'){basePick=hit.toArray();registerStep='cap';notice='';return}
 try{acceptRegistration(basePick,hit.toArray())}catch(err){notice=err.message;registerStep='base';log('registration-rejected',{message:err.message})}
}
function pose({detail:d}){if(d.name!==g.targetName||!root)return;const t=performance.now();state.found(t);if(firstLock===null){firstLock=Math.round(t-started);log('first-lock',{ms:firstLock})}root.position.copy(d.position);root.quaternion.copy(d.rotation);root.scale.setScalar(scaleFromTarget(d,g.targetWidthMm));lastPose={position:d.position,rotation:d.rotation,scale:root.scale.x};}
function update({processCpuResult}={}){if(!root)return;const t=performance.now(),r=processCpuResult?.reality;if(!imageOnly&&r?.trackingStatus)state.world(r.trackingStatus,t);const s=state.snapshot(t);root.visible=s.visible;
 $('#register').disabled=s.source!=='card';$('#register').textContent=registration?'重新登记瓶位置':'登记瓶位置';
 $('#status').textContent=notice||(registerStep==='base'?'1 / 2 · 在画面上点瓶底圆面的中心':registerStep==='cap'?'2 / 2 · 点瓶盖顶面中心；保持试管和背板不动':!s.visible?'请让立牌两侧插画入镜；保持约 50 cm，不必贴近':!registration?'立牌已定位 · 点“登记瓶位置”，再点瓶底和瓶盖':s.source==='world'?'立牌暂离画面 · 空间追踪保持中':'已登记 · 检查上下绿环，缓慢左右移动');
 $('#metrics').textContent=JSON.stringify({stage:'立牌几何校准；人工登记；无最终动画',localImageOnly:imageOnly,firstLockMs:firstLock,registration,...s},null,2)}
async function setup(){g=await(await fetch('geometry.json')).json();await script('../vendor/three.min.js')}
async function start(){
 if(started)return
 $('#start').disabled=true;started=performance.now()
 try{
  // iOS requires motion requests to originate from the user's click, before loading assets.
  if(!imageOnly){const permissions=[window.DeviceMotionEvent,window.DeviceOrientationEvent].filter(c=>typeof c?.requestPermission==='function').map(c=>c.requestPermission());if((await Promise.all(permissions)).some(s=>s!=='granted'))throw Error('需要运动传感器权限以维持空间定位，请在浏览器中允许后重试。')}
  await setup();await script('../vendor/xr/xr.js')
  await Promise.race([
   new Promise(resolve=>window.XR8?.XrController?resolve():window.addEventListener('xrloaded',resolve,{once:true})),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('引擎初始化超时')),30000))
  ])
  const target=await(await fetch('image-targets/noterday-vertical-01.json')).json()
  XR8.XrController.configure({disableWorldTracking:imageOnly,imageTargetData:[target]})
  XR8.addCameraPipelineModules([
   XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),
   {name:'noterday-vertical-calibration',
    onStart:()=>{({scene,camera,renderer}=XR8.Threejs.xrScene());init();XR8.XrController.updateCameraProjectionMatrix({origin:camera.position,facing:camera.quaternion});log('camera-started')},
    onUpdate:update,onException:e=>fatal(e instanceof Error?e:Error(String(e))),
    listeners:[{event:'reality.imagefound',process:pose},{event:'reality.imageupdated',process:pose},{event:'reality.imagelost',process:({detail:d})=>{if(detailName(d)){state.lost();log('image-lost')}}}]
   }
  ])
  const resize=()=>{const c=$('#camera'),p=Math.min(devicePixelRatio,2);c.width=Math.round(innerWidth*p);c.height=Math.round(innerHeight*p)}
  resize();addEventListener('resize',resize);$('#welcome').hidden=true;$('#hud').hidden=false
  await XR8.run({canvas:$('#camera'),allowedDevices:imageOnly?XR8.XrConfig.device().ANY:XR8.XrConfig.device().MOBILE,cameraConfig:{direction:XR8.XrConfig.camera().BACK}})
 }catch(e){started=0;fatal(e)}
}
function detailName(d){return d.name===g.targetName}
async function startPreview(){await setup();scene=new THREE.Scene();scene.background=new THREE.Color('#e8e3d9');camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,1,2000);renderer=new THREE.WebGLRenderer({canvas:$('#camera'),antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));const tex=await new THREE.TextureLoader().loadAsync('card.webp');tex.colorSpace=THREE.SRGBColorSpace;scene.add(new THREE.Mesh(new THREE.PlaneGeometry(180,270),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide})));const tube=new THREE.Mesh(new THREE.CylinderGeometry(14.5,14.5,215,64),new THREE.MeshStandardMaterial({color:'#33151a',roughness:.35}));tube.position.set(0,-52.5,14.5);scene.add(tube);const cap=new THREE.Mesh(new THREE.CylinderGeometry(14.6,14.6,28,64),new THREE.MeshStandardMaterial({color:'#19191b'}));cap.position.set(0,41,14.5);scene.add(cap);const label=new THREE.Mesh(new THREE.CylinderGeometry(14.65,14.65,95,64),new THREE.MeshStandardMaterial({color:'#eee6d6'}));label.position.set(0,-41,14.5);scene.add(label);scene.add(new THREE.HemisphereLight(0xffffff,0x70665a,2.4));const table=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.MeshStandardMaterial({color:'#c9bbaa'}));table.rotation.x=-Math.PI/2;table.position.y=-160.1;scene.add(table);const clip=new THREE.Mesh(new THREE.PlaneGeometry(110,35),new THREE.MeshBasicMaterial({color:'#777778'}));clip.position.set(0,125,1);scene.add(clip);init();root.visible=false;$('#welcome').hidden=true;$('#hud').hidden=false;$('#preview-controls').hidden=false;$('#mode').textContent='几何示意 · 非实拍';$('#status').textContent='180 × 270 mm 立牌 / 215 × Ø29 mm 试管';$('#reset').hidden=true;$('#register').hidden=true;$('#export').hidden=true;$('#details').hidden=true;function view(){const a=Number($('#yaw').value)*Math.PI/180;camera.position.set(500*Math.sin(a),500*Math.sin(10*Math.PI/180),500*Math.cos(a));camera.lookAt(0,-10,0);$('#angle').textContent=$('#yaw').value+'°';renderer.render(scene,camera)}$('#yaw').oninput=view;window.setPreviewAngle=a=>{$('#yaw').value=a;view()};view();addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);view()});}
$('#start').onclick=start;$('#details').onclick=()=>$('#metrics').hidden=!$('#metrics').hidden;
$('#register').onclick=()=>{registerStep='base';basePick=null;notice='';registration=null;tubeGuide.visible=false};$('#camera').addEventListener('pointerup',pickTube);
$('#reset').onclick=()=>{state.reset();firstLock=null;registration=null;registerStep='idle';notice='';if(tubeGuide)tubeGuide.visible=false;log('manual-reset')};
$('#export').onclick=()=>{const blob=new Blob([JSON.stringify({version:'vertical-01-clipboard',geometry:g,registration,records,lastPose,state:state.snapshot(performance.now())},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='noterday-vertical-test.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
document.addEventListener('visibilitychange',()=>{if(document.hidden){state.reset();registration=null;registerStep='idle';if(root)root.visible=false;if(tubeGuide)tubeGuide.visible=false}});
window.__vertical={state,records,get root(){return root},get camera(){return camera},get geometry(){return g},get registration(){return registration},get tubeGuide(){return tubeGuide}};if(preview)startPreview().catch(fatal)
