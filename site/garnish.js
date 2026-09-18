export function createGarnish(THREE,geometry) {
  const root=new THREE.Group()
  // Units within card are millimeters; XY is the paper, +Z is above it.
  const card=new THREE.Group();card.rotation.z=geometry.cardToTargetRotationDeg*Math.PI/180;root.add(card)
  const tube=new THREE.Group();tube.position.y=geometry.ringFromModuleCenterMm.y;card.add(tube)
  const ring=new THREE.Mesh(new THREE.RingGeometry(14.7,15.5,80),new THREE.MeshBasicMaterial({color:0x68e3ba,side:THREE.DoubleSide,depthTest:false}))
  ring.position.z=.7;ring.renderOrder=10;tube.add(ring)
  const content=new THREE.Group();tube.add(content)
  // A depth-only tube keeps the back half of the garnish behind the physical bottle.
  const occluder=new THREE.Mesh(new THREE.CylinderGeometry(14.5,14.5,215,48),new THREE.MeshBasicMaterial({colorWrite:false}))
  occluder.rotation.x=Math.PI/2;occluder.position.z=107.5;occluder.renderOrder=-1;content.add(occluder)
  const linePoints=[]
  for(let i=0;i<=160;i++){const a=i/160*Math.PI*3.4;linePoints.push(new THREE.Vector3(Math.cos(a)*24,Math.sin(a)*24,12+i/160*192))}
  const vine=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(linePoints),180,.65,6,false),new THREE.MeshBasicMaterial({color:0xa8b97f}))
  content.add(vine)
  const loader=new THREE.TextureLoader()
  const sprites=[]
  const names=['pepper','berries','clove','forest','berries','pepper','forest','berries']
  names.forEach((name,i)=>{
    const texture=loader.load('./assets/'+name+'.webp');texture.colorSpace=THREE.SRGBColorSpace
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,transparent:true,alphaTest:.04,depthWrite:false}))
    const a=i*2.1+.8;const h=32+i*23
    sprite.position.set(Math.cos(a)*29,Math.sin(a)*29,h);sprite.scale.set(34,34,1);content.add(sprite)
    sprites.push({sprite,a,h})
  })
  const outline=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(64,48,.2)),new THREE.LineBasicMaterial({color:0x68e3ba}))
  outline.position.z=.3;card.add(outline)
  return {root,ring,content,outline,tick(t,playing){content.visible=playing;ring.material.opacity=playing?.9:.6;ring.material.transparent=true;sprites.forEach(({sprite,a,h},i)=>{sprite.position.z=h+Math.sin(t*.0014+i)*3;sprite.material.rotation=Math.sin(t*.0007+i)*.09})}}
}
