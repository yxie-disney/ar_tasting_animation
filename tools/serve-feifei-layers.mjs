import http from 'node:http';import fs from 'node:fs/promises';import path from 'node:path';import {fileURLToPath} from 'node:url';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),root=path.join(repo,'assets/feifei-layers');
const mime={'.png':'image/png','.json':'application/json','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.md':'text/plain; charset=utf-8','.ora':'image/openraster'};
http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file;
 const save=pathname.match(/^\/save-relief-(comparison|report)\/(01-lishi|02-miaoyinniao|03-yanhua|04-chiwen|05-jiaokui)$/);
 if(req.method==='POST'&&save){
  if(req.headers.origin!=='http://localhost:8121')throw Error('Local preview origin required');
  const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>8*1024*1024)throw Error('Export too large');chunks.push(chunk);}
  const data=Buffer.concat(chunks),kind=save[1],id=save[2];
  if(kind==='comparison'&&data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('PNG required');
  if(kind==='report'){const report=JSON.parse(data.toString('utf8'));if(report.id!==id||report.cases?.length!==15)throw Error('Wrong report');}
  await fs.writeFile(path.join(root,id,'surface',kind==='comparison'?'comparison.png':'gpu-verification.json'),data);
  res.writeHead(200,{'Content-Type':'text/plain'});res.end('saved');return;
 }
 if(req.method==='POST'&&pathname==='/save-relief-comparison'){
  if(req.headers.origin!=='http://localhost:8121')throw Error('Local preview origin required');
  const chunks=[];let length=0;for await(const chunk of req){length+=chunk.length;if(length>8*1024*1024)throw Error('Export too large');chunks.push(chunk);}
  const data=Buffer.concat(chunks);if(data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('PNG required');
  await fs.writeFile(path.join(root,'miaoyinniao-relief-comparison.png'),data);res.writeHead(200,{'Content-Type':'text/plain'});res.end('miaoyinniao-relief-comparison.png');return;
 }
 if(pathname==='/three.min.js')file=path.join(repo,'site/vendor/three.min.js');
 else if(pathname==='/miaoyinniao-relief.js')file=path.join(repo,'site/ar/miaoyinniao-relief.js');
 else if(pathname==='/feifei-surface.js')file=path.join(repo,'site/ar/feifei-surface.js');
 else{file=path.resolve(root,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(root+path.sep))throw Error('Outside assets');}
 const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
}catch{res.writeHead(404);res.end('Not found');}}).listen(8121,'127.0.0.1',()=>console.log('http://localhost:8121/'));
