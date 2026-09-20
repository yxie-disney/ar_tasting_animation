import {profileFor,sampleField,createSurfaceRelief,addMiaoLighting} from '/feifei-surface.js';
const $=s=>document.querySelector(s),loader=new THREE.TextureLoader();
window.addEventListener('unhandledrejection',event=>{$('#status').textContent='加载或检查失败：'+(event.reason?.message||'请检查切片文件是否齐全');});
const manifest=await(await fetch('manifest.json')).json();
const frameId=new URL(location.href).searchParams.get('frame')||'02-miaoyinniao';
const frame=manifest.frames.find(f=>f.id===frameId);if(!frame)throw Error('Unknown frame');
const {spec:MIAO,parts:PARTS}=profileFor(frame);
const state=await(await fetch(frame.id+'/surface/state.json')).json();
document.title=frame.name+' · 连续浅浮雕三态对比';$('#title').textContent=frame.name+'：原切片 → 连续浅浮雕 → 呼吸与光照';
manifest.frames.forEach(f=>{const o=document.createElement('option');o.value=f.id;o.textContent=f.name+(f.id==='05-jiaokui'?'（角端）':'');o.selected=f.id===frame.id;$('#character').append(o);});
$('#character').onchange=()=>location.href='relief.html?frame='+$('#character').value;
const textures=await Promise.all([frame.source,...frame.layers.map(l=>l.file)].map(f=>loader.loadAsync(f)));
textures.forEach(t=>t.colorSpace=THREE.SRGBColorSpace);
const [w,h]=frame.canvas,ownerBytes=new Uint8Array(w*h*4);
const rawOwners=new Uint8Array(await(await fetch(frame.id+'/surface/ownership.u8')).arrayBuffer());
for(let i=0;i<rawOwners.length;i++){ownerBytes[i*4]=rawOwners[i];ownerBytes[i*4+3]=255;}
const fw=state.control.width,fh=state.control.height;
const field={bytes:new Uint8Array(await(await fetch(frame.id+'/surface/control.rgba8')).arrayBuffer()),width:fw,height:fh};
const ownership={bytes:ownerBytes,width:w,height:h};
const meshData=await(await fetch(frame.id+'/surface/mesh.json')).json();
function createMiaoRelief(THREE,options){return createSurfaceRelief(THREE,{...options,spec:MIAO,parts:PARTS,geometry:new THREE.BufferGeometryLoader().parse(meshData)});}
const legacyMin=Math.min(...frame.layers.map(l=>l.zMm)),legacyMax=Math.max(...frame.layers.map(l=>l.zMm));
$('#legacyDepth').textContent=`${legacyMin}～${legacyMax}mm，保留原缺口基线。`;
$('#cutLink').href=frame.contact;$('#cutLink').textContent=frame.layers.length+'个实际切片';
// Give originally transparent texels ONE owner too. The original map's alpha
// still discards them. This preserves its filtered silhouette fringe without
// clipping it against a second, nearest-sampled silhouette. No added pixels.
for(let i=0;i<w*h;i++)if(!ownerBytes[i*4]){ownerBytes[i*4]=1;ownerBytes[i*4+3]=255;}
for(const [id,ch] of [['heightMap',0],['breathMap',1]]){
 const c=$('#'+id);c.width=fw;c.height=fh;const cctx=c.getContext('2d'),im=cctx.createImageData(fw,fh);
 for(let y=0;y<fh;y++)for(let x=0;x<fw;x++){
  const to=(y*fw+x)*4,value=field.bytes[((fh-1-y)*fw+x)*4+ch]*(ch?8:1);
  im.data.set([value,value,value,255],to);
 }cctx.putImageData(im,0,0);
}
const views=[];let paused=false,phase=0,auditText='',shaderErrors=0;
for(const id of ['old','still','moving']){
 const renderer=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0x536258);renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.debug.onShaderError=()=>{shaderErrors++;$('#status').textContent='着色器编译失败；不能交付。';};
 $('#'+id).append(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,.8,.1,1000);addMiaoLighting(THREE,scene);
 let relief;
 if(id==='old') frame.layers.forEach((l,i)=>{
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(MIAO.widthMm,80),new THREE.MeshBasicMaterial({map:textures[i+1],transparent:true,alphaTest:.01,side:THREE.DoubleSide,toneMapped:false}));
  mesh.position.set(0,40,l.zMm);scene.add(mesh);
 });
 else {relief=createMiaoRelief(THREE,{source:textures[0],ownership,field,renderer});scene.add(relief.group);}
 const resize=()=>{const r=$('#'+id).getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();};new ResizeObserver(resize).observe($('#'+id));resize();
 views.push({id,renderer,scene,camera,relief});
}
function aim(camera,angle){const a=angle*Math.PI/180;camera.position.set(165*Math.sin(a),40,165*Math.cos(a));camera.lookAt(0,40,0);camera.updateMatrixWorld();}
const maxDepth=Math.max(...Array.from({length:fw*fh},(_,i)=>3*(field.bytes[4*i]+field.bytes[4*i+1])/255));
$('#parameters').textContent=`角色高 80mm；网格 96×128/层；总深度上限 3mm（控制场实际峰值 ${maxDepth.toFixed(3)}mm）；周期 3.6s；身体呼吸上限 ±0.28mm。物理锚点沿用纸面 X=34.75mm、脚底 Z=35mm；最前边界 X≥${(MIAO.characterPaperX-maxDepth).toFixed(3)}mm > 管半径14.5mm。卡原宽216×4/5=172.8mm、纸面X=55mm；本角色对比页不修改线上卡片。`;
$('#front').onclick=()=>$('#angle').value=0;$('#side').onclick=()=>$('#angle').value=46;
$('#pause').onclick=()=>{paused=!paused;$('#pause').textContent=paused?'继续呼吸':'暂停呼吸';};
$('#phase').oninput=()=>{paused=true;phase=Number($('#phase').value);$('#pause').textContent='继续呼吸';};
function draw(t){
 if(!paused){phase=Math.sin(2*Math.PI*t/1000/MIAO.periodSeconds);$('#phase').value=phase;}
 const angle=Number($('#angle').value);$('#degrees').textContent=angle+'°';
 for(const v of views){aim(v.camera,angle);if(v.relief)v.relief.uniforms.miaoPhase.value=v.id==='moving'?phase:0;v.renderer.render(v.scene,v.camera);}
 $('#status').textContent=`深度包络：0～${maxDepth.toFixed(3)}mm / 3mm；呼吸相位 ${phase.toFixed(2)}；着色器错误 ${shaderErrors}。\n${auditText||'尚未运行渲染接缝检查。'}`;
 requestAnimationFrame(draw);
}requestAnimationFrame(draw);

// Compare FIVE independently masked meshes against ONE continuous reference
// using the exact same shared field. Reference is QA-only, never a backing.
$('#audit').onclick=async()=>{
 auditText='检查中…';await new Promise(resolve=>requestAnimationFrame(resolve));
 const v=views[1],rw=256,rh=320,all=new Uint8Array(w*h*4);
 for(let i=0;i<w*h;i++){all[i*4]=1;all[i*4+3]=255;}
 const reference=createMiaoRelief(THREE,{source:textures[0],ownership:{bytes:all,width:w,height:h},field,renderer:v.renderer});
 reference.group.children.forEach((m,i)=>m.visible=i===0);v.scene.add(reference.group);
 const target=new THREE.WebGLRenderTarget(rw,rh),a=new Uint8Array(rw*rh*4),b=new Uint8Array(a.length),cases=[];
 const oldAspect=v.camera.aspect;v.camera.aspect=rw/rh;v.camera.updateProjectionMatrix();
 for(const angle of [-46,-30,0,30,46])for(const p of [-1,0,1]){
  aim(v.camera,angle);v.relief.uniforms.miaoPhase.value=p;reference.uniforms.miaoPhase.value=p;
  v.relief.group.visible=true;reference.group.visible=false;v.renderer.setRenderTarget(target);v.renderer.render(v.scene,v.camera);v.renderer.readRenderTargetPixels(target,0,0,rw,rh,a);
  v.relief.group.visible=false;reference.group.visible=true;v.renderer.render(v.scene,v.camera);v.renderer.readRenderTargetPixels(target,0,0,rw,rh,b);
  let pixels=0,max=0;for(let i=0;i<a.length;i+=4){let d=0;for(let c=0;c<4;c++)d=Math.max(d,Math.abs(a[i+c]-b[i+c]));max=Math.max(max,d);if(d>2)pixels++;}
  cases.push({angle,phase:p,differingPixels:pixels,maxChannelDifference:max});
 }
 reference.group.visible=false;v.relief.group.visible=true;aim(v.camera,0);
 v.relief.uniforms.miaoPhase.value=-1;v.renderer.render(v.scene,v.camera);v.renderer.readRenderTargetPixels(target,0,0,rw,rh,a);
 v.relief.uniforms.miaoPhase.value=1;v.renderer.render(v.scene,v.camera);v.renderer.readRenderTargetPixels(target,0,0,rw,rh,b);
 let movingPixels=0,motionMaxDifference=0;
 for(let i=0;i<a.length;i+=4){let d=0;for(let c=0;c<3;c++)d=Math.max(d,Math.abs(a[i+c]-b[i+c]));motionMaxDifference=Math.max(motionMaxDifference,d);if(d>2)movingPixels++;}
 v.renderer.setRenderTarget(null);v.scene.remove(reference.group);reference.dispose();target.dispose();v.camera.aspect=oldAspect;v.camera.updateProjectionMatrix();
 let slope=0;
 for(const p of [-1,1])for(let y=1;y<fh-1;y++)for(let x=1;x<fw-1;x++){
  const u=(x+.5)/fw,vv=(y+.5)/fh;
  slope=Math.max(slope,Math.abs(sampleField(field,u+1/fw,vv,p)-sampleField(field,u-1/fw,vv,p))/(2*MIAO.widthMm/fw));
 }
 const passed=cases.every(c=>c.differingPixels===0)&&shaderErrors===0&&maxDepth<=3&&movingPixels>0;
 auditText=`${passed?'通过':'未通过'}：5个角度 × 3个呼吸相位，五切片与连续参考面的差异最大 ${Math.max(...cases.map(c=>c.differingPixels))} 像素（阈值2/255）。\n呼吸两端实际变化 ${movingPixels} 像素；最大通道变化 ${motionMaxDifference}/255。\n横向最大斜率 ${slope.toFixed(3)}；46° 正交侧视不折叠参考上限 ${(1/Math.tan(46*Math.PI/180)).toFixed(3)}。这是桌面渲染检查，不替代手机实拍。`;
 const report={id:frame.id,name:frame.name,sourceSha256:frame.sourceSha256,controlSha256:state.control.sha256,renderTarget:[rw,rh],passed,maxDepth,slope,shaderErrors,movingPixels,motionMaxDifference,cases};
 const pre=document.createElement('pre');pre.textContent=JSON.stringify(report,null,2);$('#report')?.remove();const details=document.createElement('details');details.id='report';const summary=document.createElement('summary');summary.textContent='15组实际渲染测试明细';details.append(summary,pre);$('#status').after(details);
 const saved=await fetch('/save-relief-report/'+frame.id,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(report)});if(!saved.ok)throw Error('Report export failed');
};
$('#save').onclick=()=>{
 const out=document.createElement('canvas');out.width=1500;out.height=730;const c=out.getContext('2d');c.fillStyle='#edf0eb';c.fillRect(0,0,1500,730);c.fillStyle='#173127';c.font='22px sans-serif';
 [`1. Separated PNGs (${(legacyMax-legacyMin).toFixed(1)}mm)`,'2. Continuous relief (<=3mm)','3. Breathing + dynamic normals'].forEach((label,i)=>{c.fillText(label,500*i+14,30);c.drawImage(views[i].renderer.domElement,i*500+10,50,480,600);});
 c.font='18px sans-serif';c.fillText(`${frame.id} | view ${$('#angle').value} deg | phase ${phase.toFixed(2)} | no fog / no repaint | desktop shader render`,14,690);
 out.toBlob(async blob=>{
  const response=await fetch('/save-relief-comparison/'+frame.id,{method:'POST',body:blob});if(!response.ok)throw Error('PNG export failed');
  $('#saved')?.remove();const a=document.createElement('a');a.id='saved';a.href=frame.id+'/surface/comparison.png';a.target='_blank';a.textContent='已保存：打开三态对比 PNG';$('#save').after(a);
 });
};
