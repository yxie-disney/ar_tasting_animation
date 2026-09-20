// Millimetres, character-local frame: X right, Y up, +Z towards viewer.
// Each character's cut components share ONE height field and identical topology.
// No independent mesh offset, scale, rotation, hidden repaint or backing image.
export const MIAO = Object.freeze({
  heightMm: 80, widthMm: 80 * 1405 / 1866,
  envelopeMm: 3, taperMm: 6, periodSeconds: 3.6,
  segmentsX: 96, segmentsY: 128,
  cardOriginalWidthMm: 216, cardScale: 4 / 5,
  characterPaperX: 34.75, cardPaperX: 55, feetPaperZ: 35,
  tubeRadiusMm: 14.5,
});
export const PARTS = Object.freeze([
  Object.freeze({id:'base', peak:.25, breath:0}),
  Object.freeze({id:'wings-rear', peak:1.3, breath:.10}),
  Object.freeze({id:'body', peak:2.5, breath:.28}),
  Object.freeze({id:'prop-front', peak:1.7, breath:0}),
  Object.freeze({id:'grips-front', peak:1.7, breath:0}),
]);
const smooth = t => { t=Math.max(0,Math.min(1,t)); return t*t*(3-2*t); };
const budgets=Object.freeze({ground:[.25,0],base:[.25,0],body:[2.5,.28],
 'prop-rear':[1.3,0],'prop-front':[1.7,0],'grip-front':[1.7,0],'grips-front':[1.7,0],
 'wings-rear':[1.3,.10],'cape-rear':[1.3,.10],'headdress-rear':[1.3,0],'helmet-rear':[1.3,0]});
export function profileFor(frame){
 if(!Array.isArray(frame.canvas)||frame.canvas.some(v=>!Number.isFinite(v)||v<=0))throw Error('Invalid original canvas');
 const parts=frame.layers.map(layer=>{
  const budget=budgets[layer.id];if(!budget)throw Error('Unreviewed component: '+layer.id);
  return Object.freeze({id:layer.id,peak:budget[0],breath:budget[1]});
 });
 return {spec:Object.freeze({...MIAO,widthMm:MIAO.heightMm*frame.canvas[0]/frame.canvas[1]}),parts:Object.freeze(parts)};
}

// owners: bottom-to-top rows, 0 transparent, 1..5 PARTS. All cut boundaries,
// including hand/prop, wing/body and feet/base, pin to zero with zero slope.
export function buildSharedField(owners, width, height, spec=MIAO, parts=PARTS) {
  if(owners.length!==width*height) throw Error('Ownership grid size mismatch');
  const dx=spec.widthMm/(width-1), dy=spec.heightMm/(height-1);
  const distance=new Float32Array(owners.length).fill(Infinity);
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=y*width+x,o=owners[i];
    if(o>parts.length) throw Error('Unknown cut component');
    if(!o||x===0||y===0||x===width-1||y===height-1||
      owners[i-1]!==o||owners[i+1]!==o||owners[i-width]!==o||owners[i+width]!==o) distance[i]=0;
  }
  // Conservative city-block distance: wider taper limits excessive slopes.
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) {
    const i=y*width+x;
    if(x) distance[i]=Math.min(distance[i],distance[i-1]+dx);
    if(y) distance[i]=Math.min(distance[i],distance[i-width]+dy);
  }
  for(let y=height-1;y>=0;y--) for(let x=width-1;x>=0;x--) {
    const i=y*width+x;
    if(x<width-1) distance[i]=Math.min(distance[i],distance[i+1]+dx);
    if(y<height-1) distance[i]=Math.min(distance[i],distance[i+width]+dy);
  }
  const bytes=new Uint8Array(width*height*4);
  for(let i=0;i<owners.length;i++) {
    const p=parts[owners[i]-1],weight=smooth(distance[i]/spec.taperMm);
    bytes[4*i]=p?Math.round(p.peak*weight/spec.envelopeMm*255):0;
    bytes[4*i+1]=p?Math.round(p.breath*weight/spec.envelopeMm*255):0;
    bytes[4*i+3]=255;
  }
  return {bytes,width,height,distance,owners};
}

// CPU mirror of GPU linear texture sampling, used by numerical QA.
export function sampleField(field,u,v,phase=0) {
  const x=Math.max(0,Math.min(field.width-1,u*field.width-.5));
  const y=Math.max(0,Math.min(field.height-1,v*field.height-.5));
  const x0=Math.floor(x),y0=Math.floor(y),x1=Math.min(x0+1,field.width-1),y1=Math.min(y0+1,field.height-1);
  const value=(ix,iy)=>{const i=(iy*field.width+ix)*4;return MIAO.envelopeMm*(field.bytes[i]+field.bytes[i+1]*phase)/255;};
  const a=x-x0,b=y-y0;
  return (1-b)*((1-a)*value(x0,y0)+a*value(x1,y0))+b*((1-a)*value(x0,y1)+a*value(x1,y1));
}

export function createSurfaceRelief(THREE,{source,ownership,field,renderer,spec=MIAO,parts=PARTS,geometry:providedGeometry}) {
  const dataTexture=(bytes,w,h,filter)=>{
    const t=new THREE.DataTexture(bytes,w,h,THREE.RGBAFormat,THREE.UnsignedByteType);
    t.minFilter=t.magFilter=filter;t.generateMipmaps=false;t.flipY=false;t.colorSpace=THREE.NoColorSpace;t.needsUpdate=true;return t;
  };
  const heightTexture=dataTexture(field.bytes,field.width,field.height,THREE.LinearFilter);
  const ownerTexture=dataTexture(ownership.bytes,ownership.width,ownership.height,THREE.NearestFilter);
  source.colorSpace=THREE.SRGBColorSpace;
  source.anisotropy=Math.min(8,renderer?.capabilities.getMaxAnisotropy()||1);
  const uniforms={miaoField:{value:heightTexture},miaoOwners:{value:ownerTexture},
    miaoPhase:{value:0},miaoAmount:{value:1},
    miaoSize:{value:new THREE.Vector2(spec.widthMm,spec.heightMm)},
    miaoStep:{value:new THREE.Vector2(1/spec.segmentsX,1/spec.segmentsY)}};
  const declarations=`
    uniform sampler2D miaoField;
    uniform float miaoPhase;
    uniform float miaoAmount;
    uniform vec2 miaoSize;
    uniform vec2 miaoStep;
    varying vec2 vMiaoUv;
    float miaoHeight(vec2 p) {
      vec2 f=texture2D(miaoField,clamp(p,vec2(0.0),vec2(1.0))).rg;
      // Final safety bound includes all inputs, even a malformed control map.
      return clamp(3.0*miaoAmount*(f.r+f.g*clamp(miaoPhase,-1.0,1.0)),0.0,3.0);
    }
  `;
  const geometry=providedGeometry||new THREE.PlaneGeometry(spec.widthMm,spec.heightMm,spec.segmentsX,spec.segmentsY);
  // CPU bounds must include GPU deformation for correct frustum culling.
  geometry.boundingBox=new THREE.Box3(new THREE.Vector3(-spec.widthMm/2,-spec.heightMm/2,0),new THREE.Vector3(spec.widthMm/2,spec.heightMm/2,3));
  geometry.boundingSphere=new THREE.Sphere(new THREE.Vector3(0,0,1.5),Math.hypot(spec.widthMm/2,spec.heightMm/2,1.5));
  const group=new THREE.Group(),materials=[];
  parts.forEach((part,index)=>{
    const material=new THREE.MeshStandardMaterial({map:source,roughness:1,metalness:0,
      transparent:true,alphaTest:.01,depthWrite:true,depthTest:true,side:THREE.DoubleSide,toneMapped:false});
    material.name='miao-'+part.id;
    material.onBeforeCompile=shader=>{
      Object.assign(shader.uniforms,uniforms,{miaoOwner:{value:index+1}});
      shader.vertexShader=declarations+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`
        #include <beginnormal_vertex>
        // dP/dx cross dP/dy => (-dh/dx,-dh/dy,1). Recomputed each frame.
        float hx=(miaoHeight(uv+vec2(miaoStep.x,0.0))-miaoHeight(uv-vec2(miaoStep.x,0.0)))/(2.0*miaoStep.x*miaoSize.x);
        float hy=(miaoHeight(uv+vec2(0.0,miaoStep.y))-miaoHeight(uv-vec2(0.0,miaoStep.y)))/(2.0*miaoStep.y*miaoSize.y);
        objectNormal=normalize(vec3(-hx,-hy,1.0));
        // Three's defaultnormal_vertex subsequently applies normalMatrix.
      `);
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`
        #include <begin_vertex>
        transformed.z=miaoHeight(uv);
        vMiaoUv=uv;
      `);
      shader.fragmentShader='uniform sampler2D miaoOwners; uniform float miaoOwner; varying vec2 vMiaoUv;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>',`
        #include <clipping_planes_fragment>
        if(abs(floor(texture2D(miaoOwners,vMiaoUv).r*255.0+0.5)-miaoOwner)>0.1) discard;
      `);
    };
    material.customProgramCacheKey=()=> 'miao-continuous-standard-1';
    const mesh=new THREE.Mesh(geometry,material);mesh.name=part.id;mesh.position.y=spec.heightMm/2;
    group.add(mesh);materials.push(material);
  });
  return {group,uniforms,materials,geometry,
    update(seconds,animated=true){uniforms.miaoPhase.value=animated?Math.sin(2*Math.PI*seconds/spec.periodSeconds):0;},
    dispose(){geometry.dispose();materials.forEach(m=>m.dispose());heightTexture.dispose();ownerTexture.dispose();},
  };
}

export function addMiaoLighting(THREE,scene) {
  // Fixed in stage coordinates, NOT attached to the moving camera.
  const fill=new THREE.AmbientLight(0xffffff,2.4);
  const key=new THREE.DirectionalLight(0xffffff,.65);
  key.position.set(-60,100,90);key.target.position.set(0,40,0);
  scene.add(fill,key,key.target);return {fill,key};
}
