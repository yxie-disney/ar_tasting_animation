import fs from 'node:fs/promises'
await fs.mkdir('site/vendor/xr',{recursive:true})
await fs.cp('node_modules/@8thwall/engine-binary/dist','site/vendor/xr',{recursive:true})
await fs.copyFile('node_modules/@8thwall/engine-binary/LICENSE','site/vendor/xr/LICENSE')
await fs.copyFile('node_modules/three/build/three.min.js','site/vendor/three.min.js')
await fs.copyFile('node_modules/three/LICENSE','site/vendor/THREE-LICENSE')
console.log('Pinned runtime copied for same-origin delivery.')
