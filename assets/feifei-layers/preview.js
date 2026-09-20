const data=await (await fetch('manifest.json')).json(),$=s=>document.querySelector(s);
const select=$('#frame'),loader=new THREE.TextureLoader(),renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
renderer.setClearColor(0x52605a);renderer.setPixelRatio(Math.min(2,devicePixelRatio));$('#render').append(renderer.domElement);
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1.7,.1,1000),rig=new THREE.Group();scene.add(rig);
let active=null,meshes=[],request=0,display=0;
data.frames.forEach((f,i)=>{const o=document.createElement('option');o.value=i;o.textContent=f.name;select.append(o);});
function resize(){const r=$('#render').getBoundingClientRect();renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();}new ResizeObserver(resize).observe($('#render'));resize();
function figure(file,label){const f=document.createElement('figure'),im=document.createElement('img'),caption=document.createElement('figcaption');im.src=file;caption.textContent=label;const a=document.createElement('a');a.href=file;a.target='_blank';a.append(im);f.append(a,caption);return f;}
async function loadFrame(){
 const seq=++request;$('#error').textContent='加载此角色原像素切片…';
 const f=data.frames[Number(select.value)];const textures=await Promise.all(f.layers.map(l=>loader.loadAsync(l.file)));
 if(seq!==request){textures.forEach(t=>t.dispose());return;}
 meshes.forEach(m=>{rig.remove(m);m.geometry.dispose();m.material.map.dispose();m.material.dispose();});meshes=[];active=f;
 $('#layers').replaceChildren();$('#diagnostics').replaceChildren();
 $('#layers').append(figure(f.source,'完整原图：对照'));
 f.layers.forEach((l,i)=>{
  const texture=textures[i];texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  const g=new THREE.PlaneGeometry(80*f.canvas[0]/f.canvas[1],80),m=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.01,side:THREE.DoubleSide,toneMapped:false,depthWrite:true});
  const mesh=new THREE.Mesh(g,m);mesh.position.y=40;mesh.renderOrder=i;mesh.userData=l;rig.add(mesh);meshes.push(mesh);
  const fig=figure(l.file,l.label+' / Z '+l.zMm+'mm');const control=document.createElement('label'),check=document.createElement('input');check.type='checkbox';check.checked=true;check.addEventListener('change',()=>mesh.visible=check.checked);control.append(check,document.createTextNode('显示'));fig.append(control);$('#layers').append(fig);
 });
 $('#layers').append(figure(f.reassembled,'全部叠回：可见像素差 0'));
 $('#diagnostics').append(figure(f.id+'/cut-boundaries.png','粉色：实际切口'),figure(f.missingMap,'红色：移除前方物体后需检查的覆盖区'));
 $('#summary').textContent=f.name+'｜'+f.canvas.join(' × ')+'｜'+f.layers.length+'层｜RGBA叠合差 '+f.changedVisiblePixels+' 像素。\n'+f.missing;
 $('#ora').href=f.ora;$('#error').textContent='切片已加载；所有深度与动效仅在此检查页。';
}
select.addEventListener('change',()=>loadFrame().catch(e=>$('#error').textContent=e.message));await loadFrame();
function draw(t){
 const depth=Number($('#mode').value),angle=Number($('#angle').value)*Math.PI/180;
 const breathing=$('#breathe').checked?1+.012*Math.sin(2*Math.PI*t/2400):1;
 for(const mesh of meshes){const stationary=/^(ground|base)$/.test(mesh.userData.id);mesh.scale.y=stationary?1:breathing;mesh.position.y=stationary?40:40*breathing;mesh.position.z=mesh.userData.zMm*depth;}
 camera.position.set(165*Math.sin(angle),40,165*Math.cos(angle));camera.lookAt(0,40,0);renderer.render(scene,camera);
 $('#degrees').textContent=$('#angle').value+'°';
 if(t-display>250&&active){$('#depthList').textContent=active.layers.map(l=>l.label+': '+(l.zMm*depth).toFixed(1)+'mm').join(' ｜ ')+' ｜ WebGL '+renderer.getContext().getError();display=t;}
 requestAnimationFrame(draw);
}requestAnimationFrame(draw);
