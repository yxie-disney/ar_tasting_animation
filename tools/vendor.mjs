import fs from 'node:fs/promises';
// Same pinned 8th Wall distribution used by the working AR prototype.
await fs.mkdir('site/vendor/xr', {recursive: true});
await fs.cp('node_modules/@8thwall/engine-binary/dist', 'site/vendor/xr', {recursive: true});
await fs.copyFile('node_modules/@8thwall/engine-binary/LICENSE', 'site/vendor/xr/LICENSE');
for (const file of ['three.min.js', 'three.module.js']) {
  await fs.copyFile('node_modules/three/build/' + file, 'site/vendor/' + file);
}
await fs.copyFile('node_modules/three/LICENSE', 'site/vendor/THREE-LICENSE');
console.log('Pinned 8th Wall 1.0.0 and Three 0.160.1 copied for same-origin hosting.');
