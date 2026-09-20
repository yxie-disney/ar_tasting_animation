import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
// Official distribution files, pinned versions AND hashes. No runtime CDN dependency.
const files = [
 ['mind-ar@1.2.5/dist/mindar-image-three.prod.js','mindar/mindar-image-three.prod.js','Kci9B3orN3fuSKB1dQBKzZR/GPA78FTOKKIdRU6ib08='],
 ['mind-ar@1.2.5/dist/mindar-image.prod.js','mindar/mindar-image.prod.js','oh7vmpjtc67liaIZs15YDFC1Acb1D4jW7tFtzvm43sI='],
 ['mind-ar@1.2.5/dist/controller-mGt1s8dJ.js','mindar/controller-mGt1s8dJ.js','mKkIBsAQd6RvxaPa3cZEGsnWHFuFs8wJ0/CyCH0ihxM='],
 ['mind-ar@1.2.5/dist/ui-fBadYuor.js','mindar/ui-fBadYuor.js','rtlTj+wo/s+wpWTaSPvwU6wlSdMxR0bmcYLTgbOiTDE='],
 ['mind-ar@1.2.5/LICENSE','mindar/LICENSE','TzqlIVrANGqCMXDJ+Wd9olw+i9uCQ2kxGKNxHhV9f/8='],
 ['three@0.160.1/build/three.module.js','three.module.js','dt6oFRvJNSrvNSi0Ji4kmyYE9iVDgoMo25eNBg1hpJU='],
 ['three@0.160.1/build/three.min.js','three.min.js','FwxnifQyF8lrMXD0tC+v4TXef3zUhJekIY+XV+4dSfo='],
 ['three@0.160.1/examples/jsm/renderers/CSS3DRenderer.js','addons/renderers/CSS3DRenderer.js','53aq1i5JiMeOaEpAgEzxxhzNCgTJFir67vX9G182/e0='],
 ['three@0.160.1/LICENSE','THREE-LICENSE','hS4OhpkWm/n2/ca9o+aC0HjcvHOLXTPnTfWUchv/Jx0='],
];
for (const [source, destination, expected] of files) {
 const file = path.join('site/vendor', destination);
 const hash = bytes => createHash('sha256').update(bytes).digest('base64');
 try { if (hash(await fs.readFile(file)) === expected) continue; } catch {}
 const response = await fetch('https://cdn.jsdelivr.net/npm/' + source);
 if (!response.ok) throw Error('Dependency download failed: ' + source);
 const bytes = Buffer.from(await response.arrayBuffer());
 if (hash(bytes) !== expected) throw Error('Dependency checksum mismatch: ' + source);
 await fs.mkdir(path.dirname(file), {recursive:true});
 await fs.writeFile(file, bytes);
}
console.log('Pinned MindAR 1.2.5 and Three 0.160.1 verified for same-origin hosting.');
