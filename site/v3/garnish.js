// Original procedural botanical geometry; no borrowed commercial artwork/models.
// The central label corridor stays clear. Growth follows stems; nothing orbits.
export function createGarnish(THREE){
  const group=new THREE.Group(), stems=[], leaves=[], fruit=[], flowers=[];
  const green=new THREE.MeshStandardMaterial({color:0x61753b,roughness:.87,side:THREE.DoubleSide});
  const greenLight=new THREE.MeshStandardMaterial({color:0x8b9851,roughness:.88,side:THREE.DoubleSide});
  const woody=new THREE.MeshStandardMaterial({color:0x766040,roughness:.93});
  const berry=new THREE.MeshStandardMaterial({color:0x602b43,roughness:.43,metalness:.04});
  const bloom=new THREE.MeshStandardMaterial({color:0xfff2d5,roughness:.85,side:THREE.DoubleSide});
  const pollen=new THREE.MeshStandardMaterial({color:0xd0a54f,roughness:.7});
  const V=(x,y,z)=>new THREE.Vector3(x,y,z);
  const leafGeometry=new THREE.BufferGeometry(), vertices=[], normals=[], indices=[];
  const rows=22,cols=8;
  for(let i=0;i<=rows;i++){
    const t=i/rows, width=5.7*Math.pow(Math.sin(Math.PI*t),.75)*(.83+.17*Math.cos(6*Math.PI*t));
    for(let j=0;j<=cols;j++){
      const u=2*j/cols-1;
      vertices.push(u*width,t*15,1.8*(1-u*u)*Math.sin(Math.PI*t)+1.5*t*t);
      normals.push(0,0,1);
      if(i<rows&&j<cols){const a=i*(cols+1)+j,b=a+cols+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  leafGeometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  leafGeometry.setIndex(indices);leafGeometry.computeVertexNormals();
  const ribGeometry=new THREE.BufferGeometry().setFromPoints([V(0,0,.15),V(0,5,1.85),V(0,10,2.2),V(0,15,1.7)]);
  const ribMaterial=new THREE.LineBasicMaterial({color:0xb8b878,transparent:true,opacity:.62});
  function leaf(p,angle,delay,size,index){
    const pivot=new THREE.Group();pivot.position.copy(p);pivot.rotation.set(.15*Math.sin(index),.25*Math.cos(index),angle);
    pivot.add(new THREE.Mesh(leafGeometry,index%3?green:greenLight));pivot.add(new THREE.Line(ribGeometry,ribMaterial));
    group.add(pivot);leaves.push({pivot,delay,size,angle,seed:index});
  }
  for(const side of [-1,1]){
    const points=side<0?[V(-24,-119,1),V(-35,-90,5),V(-43,-51,11),V(-32,-13,16),V(-46,23,12),V(-36,61,24),V(-25,78,18)]
      :[V(25,-111,1),V(43,-83,4),V(36,-48,15),V(47,-9,12),V(35,28,20),V(45,59,26),V(30,73,18)];
    const curve=new THREE.CatmullRomCurve3(points);
    const geometry=new THREE.TubeGeometry(curve,100,.66,6,false);
    group.add(new THREE.Mesh(geometry,woody));stems.push({geometry,delay:side<0?0:.65});
    for(let i=0;i<17;i++){
      const t=.06+i*.051,p=curve.getPoint(t),out=i%2?1:-1;
      // Blades point outward from the tube; inward leaves stop before the label corridor.
      const angle=-side*(.42+(i%3)*.43)+(out<0?side*.8:0);
      leaf(p,angle,1.1+t*5.8+(side>0?.5:0),.66+(i%4)*.11,i+(side>0?20:0));
    }
    for(let k=0;k<3;k++){
      const p=curve.getPoint(.25+k*.25),cluster=new THREE.Group();cluster.position.copy(p);cluster.position.x+=side*4;
      for(let row=0;row<4;row++)for(let j=0;j<4-row;j++){
        const b=new THREE.Mesh(new THREE.SphereGeometry(2.3,12,9),berry);
        b.position.set((j-(3-row)/2)*3.9,-row*3.35,2+((j+row)%2)*1.7);cluster.add(b);
      }
      group.add(cluster);fruit.push({pivot:cluster,delay:5.7+k*.7+(side>0?.3:0)});
    }
  }
  for(const [i,p] of [V(-50,-87,7),V(53,-55,13),V(-52,24,14),V(50,61,26)].entries()){
    const f=new THREE.Group();f.position.copy(p);
    for(let j=0;j<5;j++){
      const a=j*Math.PI*2/5,petal=new THREE.Mesh(new THREE.SphereGeometry(2.3,10,6),bloom);
      petal.scale.set(1,.72,.2);petal.position.set(Math.cos(a)*2.35,Math.sin(a)*2.35,0);petal.rotation.z=a;f.add(petal);
    }
    f.add(new THREE.Mesh(new THREE.SphereGeometry(1.1,10,6),pollen));group.add(f);flowers.push({pivot:f,delay:6.4+i*.65});
  }
  const smooth=x=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
  function update(seconds){
    for(const s of stems)s.geometry.setDrawRange(0,Math.floor(smooth((seconds-s.delay)/6.5)*100)*6*6);
    for(const l of leaves){const t=smooth((seconds-l.delay)/1.45);l.pivot.scale.setScalar(Math.max(.001,t*l.size));l.pivot.rotation.z=l.angle+.024*Math.sin(seconds*.9+l.seed);l.pivot.rotation.x=.15*Math.sin(l.seed)+(1-t)*.95;}
    for(const f of [...fruit,...flowers])f.pivot.scale.setScalar(Math.max(.001,smooth((seconds-f.delay)/1.8)));
  }
  update(0);
  return {group,update};
}
