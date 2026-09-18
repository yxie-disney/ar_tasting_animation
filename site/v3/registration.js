// Registration is manual, in the plane of a tube touching the backing board.
// It is not automatic tube detection or a general 3D pose solver.
export function fitTube(base,cap,height=215,radius=14.5){
 if(![...base,...cap,height,radius].every(Number.isFinite))throw Error('登记点无效，请重试。')
 const dx=cap[0]-base[0],dy=cap[1]-base[1],length=Math.hypot(dx,dy)
 if(length<height*.9||length>height*1.1||dy<=0)throw Error('两点间距与 215 mm 管高不符。请确认点在瓶底、瓶盖顶面的中心，纸张按 100% 打印，试管贴靠背板。')
 const axis=[dx/length,dy/length,0],middle=[(base[0]+cap[0])/2,(base[1]+cap[1])/2,radius]
 return{base:middle.map((v,i)=>v-axis[i]*height/2),cap:middle.map((v,i)=>v+axis[i]*height/2),axis,height,radius,measuredLengthMm:length}
}
