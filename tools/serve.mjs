import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),site=path.resolve(root,'site');
const port=Number(process.env.PORT||8098);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.wasm':'application/wasm','.svg':'image/svg+xml'};
const fixtures={
 '/_test/scene.jpg':process.env.NOTERDAY_SCENE,
 '/_test/card.png':path.resolve(root,'assets/printed-card/嘉地-品丽珠_立牌01.png'),
 '/_test/mock-camera.js':path.resolve(root,'tests/mock-camera.js'),
 '/_test/card-material.html':path.resolve(root,'tests/card-material.html'),
 '/_test/card-material.js':path.resolve(root,'tests/card-material.js')
};
http.createServer(async(req,res)=>{
 try{
   const url=new URL(req.url,'http://localhost'),pathname=decodeURIComponent(url.pathname);
   if(pathname==='/_test/replay'){
     const html=(await fs.readFile(path.join(site,'v3/index.html'),'utf8')).replace('<head>','<head><base href="/v3/"><script src="/_test/mock-camera.js"></script>');
     res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);return;
   }
   let file=fixtures[pathname];
   if(!file){file=path.resolve(site,'.'+pathname+(pathname.endsWith('/')?'index.html':''));if(!file.startsWith(site+path.sep))throw Error('Invalid path');}
   const bytes=await fs.readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(bytes);
 }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'127.0.0.1',()=>console.log(`Local AR and private photo replay: http://localhost:${port}/_test/replay`));
